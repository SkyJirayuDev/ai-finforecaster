from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from prophet import Prophet
import pandas as pd
import numpy as np
from typing import List, Optional
import logging

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class ForecastInput(BaseModel):
    date: str
    amount: float
    description: Optional[str] = None
    category: Optional[str] = None

class ForecastOutput(BaseModel):
    ds: str
    yhat: float
    yhat_upper: Optional[float] = None
    yhat_lower: Optional[float] = None
    actual: Optional[float] = None

def mape(a: np.ndarray, p: np.ndarray) -> float:
    return np.mean(np.abs((a - p) / a)) * 100

@app.post("/forecast", response_model=List[ForecastOutput])
async def forecast(data: List[ForecastInput]):
    df = pd.DataFrame([{"ds": tx.date, "y": tx.amount} for tx in data])
    df["ds"] = pd.to_datetime(df["ds"])
    df = df.sort_values("ds")

    # ✅ Aggregate รายเดือน
    df_m = df.set_index("ds")["y"].resample("MS").sum().reset_index()
    if len(df_m) < 6:
        raise HTTPException(400, "ต้องมีข้อมูลขั้นต่ำ 6 เดือนขึ้นไป")

    # ✅ ตั้งค่า floor และ cap
    floor_val = 5000
    cap_val = df_m["y"].max() * 1.2
    df_m["floor"] = floor_val
    df_m["cap"] = cap_val

    # ✅ โมเดล Prophet แบบ logistic + custom seasonality
    m = Prophet(
        growth="logistic",
        seasonality_mode="multiplicative",
        changepoint_prior_scale=0.1,
        seasonality_prior_scale=4.0,
        interval_width=0.8,
        yearly_seasonality=True,
        weekly_seasonality=False,
        daily_seasonality=False
    )
    m.add_seasonality("monthly", period=30.5, fourier_order=5)
    m.add_seasonality("quarterly", period=91.25, fourier_order=3)

    m.fit(df_m)

    # ✅ สร้าง future frame และใส่ floor/cap
    future = m.make_future_dataframe(periods=3, freq="MS")
    future["floor"] = floor_val
    future["cap"] = cap_val

    fc = m.predict(future)

    # ✅ Map actual
    actual_map = df_m.set_index("ds")["y"].to_dict()
    fc["actual"] = fc["ds"].map(actual_map)

    # ✅ Clip ไม่ให้ติดลบ
    fc["yhat"] = np.clip(fc["yhat"], 0, cap_val)
    fc["yhat_lower"] = np.clip(fc["yhat_lower"], 0, cap_val)
    fc["yhat_upper"] = np.clip(fc["yhat_upper"], 0, cap_val)

    # ✅ Logging MAPE + CI coverage
    hist = fc[fc["actual"].notna()]
    if not hist.empty:
        err = mape(hist["actual"].values, hist["yhat"].values)
        coverage = ((hist["actual"] >= hist["yhat_lower"]) & (hist["actual"] <= hist["yhat_upper"])).mean()
        logger.info(f"Historical MAPE = {err:.2f}% | CI Coverage = {coverage*100:.1f}%")

    out: List[ForecastOutput] = []
    for _, r in fc.iterrows():
        out.append(ForecastOutput(
            ds=r["ds"].strftime("%Y-%m-%d"),
            yhat=round(float(r["yhat"]), 2),
            yhat_upper=round(float(r["yhat_upper"]), 2),
            yhat_lower=round(float(r["yhat_lower"]), 2),
            actual=round(float(r["actual"]), 2) if pd.notna(r["actual"]) else None
        ))

    return out

@app.get("/health")
async def health_check():
    return {"status": "ok", "message": "AI-FinForecaster backend v2 is live"}
