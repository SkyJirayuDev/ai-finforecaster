// src/lib/adviceUtils.ts
import { CSVRow } from "@/components/CSVUploader";
import {
  computePortfolioOverview,
  computeForecastStats,
  computePeaksAndTroughs,
  computeCategoryBreakdown,
} from "./dataUtils";

/**
 * สร้าง payload ข้อมูลการเงินที่สรุปจาก CSV และผล Forecast
 * เพื่อนำไปใช้สร้าง AI Insights ผ่าน API advice.ts
 */
export function buildAdvicePayload(
  rows: CSVRow[],
  forecast: any,
  confidenceLevel: number,
  forecastAccuracy: number
) {
  const { totalValue, growthRate } = computePortfolioOverview(rows);
  const { actualAvg, forecastAvg, trendPct } = computeForecastStats(forecast);
  const { peakMonth, peakValue, troughMonth, troughValue } =
    computePeaksAndTroughs(forecast);
  const categories = computeCategoryBreakdown(rows);

  const riskAssessment =
    confidenceLevel > 85 ? "Low" : confidenceLevel < 70 ? "High" : "Moderate";
  const marketTrend =
    trendPct > 5 ? "Bullish" : trendPct < -5 ? "Bearish" : "Neutral";

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
    categories, // เก็บข้อมูล categories ให้ API /advice ใช้ต่อ
  };
}

/**
 * ฟังก์ชันเสริม: ใช้เลือก Top และ Bottom Category
 * (สามารถใช้เพื่อสร้างข้อความ Insight แบบกำหนดเอง)
 */
export function extractCategoryPerformance(
  categories: { name: string; amount: number; pctChange: number }[]
): { topCategory: string; bottomCategory: string } {
  if (!categories || categories.length === 0) {
    return { topCategory: "No data", bottomCategory: "No data" };
  }

  const sorted = [...categories].sort((a, b) => b.pctChange - a.pctChange);
  const top = sorted[0];
  const bottom = sorted[sorted.length - 1];

  return {
    topCategory: top
      ? `${top.name} (+${top.pctChange.toFixed(1)}%)`
      : "No data",
    bottomCategory: bottom
      ? `${bottom.name} (${bottom.pctChange.toFixed(1)}%)`
      : "No data",
  };
}
