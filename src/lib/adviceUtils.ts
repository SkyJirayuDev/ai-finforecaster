import { CSVRow } from "@/components/CSVUploader";
import {
  computePortfolioOverview,
  computeForecastStats,
  computePeaksAndTroughs,
  computeCategoryBreakdown,
} from "./dataUtils";

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

  // Calculate risk assessment and market trend
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
    categories, 
  };
}

// Extract top and bottom categories for advice
export function extractCategoryPerformance(
  categories: { name: string; amount: number; pctChange: number }[]
): { topCategory: string; bottomCategory: string } {
  if (!categories || categories.length === 0) {
    return { topCategory: "No data", bottomCategory: "No data" };
  }

  // Sort categories by percentage change
  const sorted = [...categories].sort((a, b) => b.pctChange - a.pctChange);
  const top = sorted[0];
  const bottom = sorted[sorted.length - 1];

  // Return formatted strings for top and bottom categories
  return {
    topCategory: top
      ? `${top.name} (+${top.pctChange.toFixed(1)}%)`
      : "No data",
    bottomCategory: bottom
      ? `${bottom.name} (${bottom.pctChange.toFixed(1)}%)`
      : "No data",
  };
}
