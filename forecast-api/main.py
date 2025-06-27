from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from prophet import Prophet
import pandas as pd
import numpy as np
from typing import List, Optional
import logging

app = FastAPI()

# เปิด CORS สำหรับ React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# --- Schema ---
class ForecastInput(BaseModel):
    date: str       # YYYY-MM-DD
    amount: float
    description: Optional[str] = None
    category: Optional[str]    = None

class ForecastOutput(BaseModel):
    ds: str
    yhat: float
    yhat_upper: Optional[float] = None
    yhat_lower: Optional[float] = None
    actual: Optional[float]      = None

# --- MAPE ---
def mape(a: np.ndarray, p: np.ndarray) -> float:
    return np.mean(np.abs((a - p) / a)) * 100

@app.post("/forecast", response_model=List[ForecastOutput])
async def forecast(data: List[ForecastInput]):
    # 1) อ่าน payload ลง DataFrame
    df = pd.DataFrame([{"ds": tx.date, "y": tx.amount} for tx in data])
    df["ds"] = pd.to_datetime(df["ds"])
    df = df.sort_values("ds")

    # 2) สรุปยอดรายเดือน
    df_m = df.set_index("ds")["y"].resample("MS").sum().reset_index()
    if len(df_m) < 6:
        raise HTTPException(400, "ต้องมีข้อมูลขั้นต่ำ 6 เดือนขึ้นไป")

    # 3) ตั้งค่าขอบบนสำหรับ logistic growth (cap) = 1.2 * max_historical
    max_hist = df_m["y"].max()
    df_m["cap"] = max_hist * 1.2

    # 4) สร้างสมการ logistic growth
    #    Prophet ต้องการ col ชื่อ 'cap' อยู่ใน df เมื่อใช้ growth='logistic'
    #    floor เราไม่กำหนด (null => 0)
    # 5) แบ่ง train/test
    split = int(len(df_m) * 0.8)
    train = df_m.iloc[:split].copy()
    test  = df_m.iloc[split:].copy()

    # 6) สร้างโมเดล Prophet
    m = Prophet(
        growth="logistic",            # logistic growth (จำกัด cap)
        yearly_seasonality=True,
        weekly_seasonality=False,
        daily_seasonality=False,
        seasonality_mode="additive",
        changepoint_prior_scale=0.05, # ปรับ sensitivity ของ trend
        interval_width=0.80,          # CI
    )

    # 7) เพิ่ม monthly seasonality แบบเบาๆ
    m.add_seasonality(name="monthly", period=30.5, fourier_order=3)

    # 8) fit โมเดล
    m.fit(train.rename(columns={"y":"y", "cap":"cap"}))

    # 9) สร้าง future frame
    #    forecast horizon = test + 3 เดือนข้างหน้า
    periods = len(test) + 3
    future = m.make_future_dataframe(periods=periods, freq="MS")
    future["cap"] = max_hist * 1.2

    # 10) predict
    fc = m.predict(future)

    # 11) merge actual จาก df_m
    actual_map = df_m.set_index("ds")["y"].to_dict()
    fc["actual"] = fc["ds"].map(actual_map)

    # 12) ตัด yhat ให้อยู่ในช่วง [0, cap]
    fc["yhat"]       = np.clip(fc["yhat"], 0, max_hist * 1.2)
    fc["yhat_upper"] = np.clip(fc["yhat_upper"], 0, max_hist * 1.2)
    fc["yhat_lower"] = np.clip(fc["yhat_lower"], 0, max_hist * 1.2)

    # 13) คำนวณ MAPE บนช่วง historical
    hist = fc[fc["actual"].notna()]
    if not hist.empty:
        err = mape(hist["actual"].values, hist["yhat"].values)
        logger.info(f"Historical MAPE = {err:.2f}%")

    # 14) สร้างผลลัพธ์
    out: List[ForecastOutput] = []
    for _, r in fc.iterrows():
        out.append(ForecastOutput(
            ds         = r["ds"].strftime("%Y-%m-%d"),
            yhat       = round(float(r["yhat"]), 2),
            yhat_upper = round(float(r["yhat_upper"]), 2),
            yhat_lower = round(float(r["yhat_lower"]), 2),
            actual     = round(float(r["actual"]), 2) if pd.notna(r["actual"]) else None
        ))

    return out

@app.get("/health")
async def health_check():
    return {"status": "ok", "message": "AI-FinForecaster backend is live"}
