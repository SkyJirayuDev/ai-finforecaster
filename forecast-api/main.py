from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from prophet import Prophet
import pandas as pd
from typing import List, Optional
import logging

app = FastAPI()

# ✅ Enable CORS for frontend (localhost)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ✅ Logging setup
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

class ForecastInput(BaseModel):
    date: str
    amount: float

class ForecastOutput(BaseModel):
    ds: str
    yhat: float
    actual: Optional[float] = None

@app.post("/forecast", response_model=List[ForecastOutput])
async def forecast(data: List[ForecastInput]):
    logger.debug("📥 Received data: %s", data)

    # ✅ Create DataFrame from input
    df = pd.DataFrame([{"ds": item.date, "y": item.amount} for item in data])
    df["ds"] = pd.to_datetime(df["ds"])
    df.sort_values("ds", inplace=True)

    logger.debug("🔍 Input DataFrame:\n%s", df)

    # ✅ Build and fit model (เปิด seasonality รายปี)
    model = Prophet(daily_seasonality=False, weekly_seasonality=False, yearly_seasonality=True)
    model.fit(df)

    # ✅ Predict next 12 months
    future = model.make_future_dataframe(periods=12, freq="MS")
    forecast = model.predict(future)

    logger.debug("🔍 Forecast head:\n%s", forecast[["ds", "yhat"]].head())

    # ✅ Merge actual y values
    result = pd.merge(forecast[["ds", "yhat"]], df[["ds", "y"]], on="ds", how="left")

    # ✅ Convert to output format
    output = [
        ForecastOutput(
            ds=row["ds"].strftime("%Y-%m-%d"),
            yhat=round(row["yhat"], 2),
            actual=round(row["y"], 2) if pd.notna(row["y"]) else None,
        )
        for _, row in result.iterrows()
    ]

    return output
