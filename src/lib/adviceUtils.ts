// src/lib/adviceUtils.ts
import { CSVRow } from "@/components/CSVUploader"
import {
  computePortfolioOverview,
  computeForecastStats,
  computePeaksAndTroughs,
  computeCategoryBreakdown
} from "./dataUtils"

export function buildAdvicePayload(
  rows: CSVRow[],
  forecast: any,
  confidenceLevel: number,
  forecastAccuracy: number
) {
  const { totalValue, growthRate } = computePortfolioOverview(rows)
  const { actualAvg, forecastAvg, trendPct } = computeForecastStats(forecast)
  const { peakMonth, peakValue, troughMonth, troughValue } = computePeaksAndTroughs(forecast)
  const categories = computeCategoryBreakdown(rows)

  const riskAssessment =
    confidenceLevel > 85 ? "Low" :
    confidenceLevel < 70 ? "High" : "Moderate"
  const marketTrend =
    trendPct > 5 ? "Bullish" :
    trendPct < -5 ? "Bearish" : "Neutral"

  return {
    totalValue,
    growthRate,
    historicalAvg: actualAvg,
    forecastAvg,
    trendPct,
    peakMonth,
    peakValue,
    troughMonth,
    troughValue,
    forecastAccuracy,
    confidenceLevel,
    riskAssessment,
    marketTrend,
    categories
  }
}
