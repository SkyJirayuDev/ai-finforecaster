export function calculateForecastAccuracy(result: any[] | null): number {
  if (!result || result.length === 0) return 0;
  const withActual = result.filter(
    (r) => typeof r.actual === "number" && r.actual !== 0
  );
  if (withActual.length === 0) return 0;

  const mape =
    withActual.reduce((sum, r) => {
      const error = Math.abs((r.actual - r.yhat) / r.actual);
      return isFinite(error) ? sum + error : sum;
    }, 0) / withActual.length;

  return Math.max(0, Math.min(100, 100 - mape * 100));
}

export function calculateRiskAssessment(
  result: any[] | null
): "Low" | "Moderate" | "High" {
  if (!result || result.length === 0) return "Moderate";
  const future = result.filter((r) => r.actual === null || r.actual === undefined);
  if (future.length < 3) return "Moderate";         

  const vals = future.map((r) => r.yhat);
  const mean = vals.reduce((s, v) => s + v, 0) / vals.length;
  const sd = Math.sqrt(vals.reduce((s, v) => s + (v - mean) ** 2, 0) / vals.length);
  const cv = sd / mean;                             

  if (cv < 0.1) return "Low";
  if (cv > 0.35) return "High";
  return "Moderate";
}

export function calculateMarketTrend(
  result: any[] | null
): "Bullish" | "Bearish" | "Neutral" {
  if (!result || result.length < 2) return "Neutral";

  const actual = result.filter((r) => r.actual !== null && r.actual !== undefined);
  const future = result.filter((r) => r.actual === null || r.actual === undefined);
  if (actual.length === 0 || future.length === 0) return "Neutral";

  const lastActual = actual[actual.length - 1].actual as number;
  const lastForecast = future[future.length - 1].yhat;

  const change = (lastForecast - lastActual) / lastActual;

  if (change > 0.05) return "Bullish";
  if (change < -0.05) return "Bearish";
  return "Neutral";
}

export function getConfidenceLabel(level: number): string {
  if (level >= 90) return `High (${level}%)`;
  if (level >= 70) return `Moderate (${level}%)`;
  return `Low (${level}%)`;
}
