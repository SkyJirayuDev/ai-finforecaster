import os
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from prophet import Prophet
import pandas as pd
import numpy as np
from typing import List, Optional
import logging

app = FastAPI()

# CORS via env
allowed = [o.strip() for o in os.getenv("ALLOWED_ORIGINS", "").split(",") if o.strip()]
app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed or ["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Logger
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Input Schema
class ForecastInput(BaseModel):
    date: str
    amount: float
    description: Optional[str] = None
    category: Optional[str] = None

# Wrapper Schema 
class ForecastRequest(BaseModel):
    data: List[ForecastInput]
    confidenceLevel: Optional[float] = 0.8

# Output Schema
class ForecastOutput(BaseModel):
    ds: str
    yhat: float
    yhat_upper: Optional[float] = None
    yhat_lower: Optional[float] = None
    actual: Optional[float] = None

# MAPE Function
def mape(a: np.ndarray, p: np.ndarray) -> float:
    return np.mean(np.abs((a - p) / a)) * 100

# POST Endpoint
@app.post("/forecast", response_model=List[ForecastOutput])
async def forecast(req: ForecastRequest):
    df = pd.DataFrame([{"ds": tx.date, "y": tx.amount} for tx in req.data])
    df["ds"] = pd.to_datetime(df["ds"])
    df = df.sort_values("ds")

    # Monthly aggregation
    df_m = df.set_index("ds")["y"].resample("MS").sum().reset_index()
    if len(df_m) < 6:
        raise HTTPException(400, "ต้องมีข้อมูลขั้นต่ำ 6 เดือนขึ้นไป")

    # Floor / Cap
    floor_val = 5000
    cap_val = df_m["y"].max() * 1.2
    df_m["floor"] = floor_val
    df_m["cap"] = cap_val

    # Confidence Level
    confidence = req.confidenceLevel or 0.8

    # Prophet Model
    m = Prophet(
        growth="logistic",
        seasonality_mode="multiplicative",
        changepoint_prior_scale=0.1,
        seasonality_prior_scale=4.0,
        interval_width=confidence,
        yearly_seasonality=True,
        weekly_seasonality=False,
        daily_seasonality=False
    )
    m.add_seasonality("monthly", period=30.5, fourier_order=5)
    m.add_seasonality("quarterly", period=91.25, fourier_order=3)

    m.fit(df_m)

    # Create future frame
    future = m.make_future_dataframe(periods=1, freq="MS")
    future["floor"] = floor_val
    future["cap"] = cap_val

    # Forecast
    fc = m.predict(future)

    # Add actuals
    actual_map = df_m.set_index("ds")["y"].to_dict()
    fc["actual"] = fc["ds"].map(actual_map)

    # Clip forecast values
    fc["yhat"] = np.clip(fc["yhat"], 0, cap_val)
    fc["yhat_lower"] = np.clip(fc["yhat_lower"], 0, cap_val)
    fc["yhat_upper"] = np.clip(fc["yhat_upper"], 0, cap_val)

    # Logging MAPE & CI Coverage
    hist = fc[fc["actual"].notna()]
    if not hist.empty:
        err = mape(hist["actual"].values, hist["yhat"].values)
        coverage = ((hist["actual"] >= hist["yhat_lower"]) & (hist["actual"] <= hist["yhat_upper"])).mean()
        logger.info(f"Historical MAPE = {err:.2f}% | CI Coverage = {coverage * 100:.1f}%")

    # Format output
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

# Health check
@app.get("/health")
async def health_check():
    return {"status": "ok", "message": "AI-FinForecaster backend v2 is live"}
