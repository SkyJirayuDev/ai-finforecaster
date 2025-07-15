// src/lib/dataUtils.ts
import { CSVRow } from "@/components/CSVUploader"

// 1) Portfolio Overview
export function computePortfolioOverview(rows: CSVRow[]) {
  const total = rows.reduce((sum, r) => sum + r.amount, 0)
  const recentTs = Math.max(...rows.map(r => new Date(r.date).getTime()))
  const recentDate = new Date(recentTs)
  const year = recentDate.getFullYear()
  const monthIdx = recentDate.getMonth()

  // YTD this year vs last year
  const yThis = rows.filter(r => {
    const d = new Date(r.date)
    return d.getFullYear() === year && d.getMonth() <= monthIdx
  })
  const yLast = rows.filter(r => {
    const d = new Date(r.date)
    return d.getFullYear() === year - 1 && d.getMonth() <= monthIdx
  })
  const sumThis = yThis.reduce((s, r) => s + r.amount, 0)
  const sumLast = yLast.reduce((s, r) => s + r.amount, 0)
  const growth = sumLast > 0 ? ((sumThis - sumLast) / sumLast) * 100 : 0

  return { totalValue: total / 1000, growthRate: growth }
}

// 2) Forecast statistics
export function computeForecastStats(forecast: any) {
  // forecast.points: [{ ds, actual?, yhat }, ...]
  const actuals = forecast.points.map((p: any) => p.actual ?? p.yhat)
  const forecasts = forecast.points.map((p: any) => p.yhat)

  const avg = (arr: number[]) =>
    arr.reduce((s, v) => s + v, 0) / arr.length

  const actualAvg = avg(actuals)
  const forecastAvg = avg(forecasts)
  const trendPct = actualAvg > 0
    ? ((forecastAvg - actualAvg) / actualAvg) * 100
    : 0

  return { actualAvg, forecastAvg, trendPct }
}

// 3) Peaks & Troughs
export function computePeaksAndTroughs(forecast: any) {
  const points = forecast.points
  let maxPoint = points[0], minPoint = points[0]
  for (const p of points) {
    if ((p.actual ?? p.yhat) > (maxPoint.actual ?? maxPoint.yhat)) maxPoint = p
    if ((p.actual ?? p.yhat) < (minPoint.actual ?? minPoint.yhat)) minPoint = p
  }
  return {
    peakMonth: new Date(maxPoint.ds).toLocaleString("default", { month: "short", year: "numeric" }),
    peakValue: maxPoint.actual ?? maxPoint.yhat,
    troughMonth: new Date(minPoint.ds).toLocaleString("default", { month: "short", year: "numeric" }),
    troughValue: minPoint.actual ?? minPoint.yhat,
  }
}

// 4) Category Breakdown
export function computeCategoryBreakdown(rows: CSVRow[]) {
  const recentTs = Math.max(...rows.map(r => new Date(r.date).getTime()))
  const recentDate = new Date(recentTs)
  const year = recentDate.getFullYear(), monthIdx = recentDate.getMonth()

  const filterYear = (yr: number) =>
    rows.filter(r => {
      const d = new Date(r.date)
      return d.getFullYear() === yr && d.getMonth() <= monthIdx
    })

  const sumByCat = (arr: CSVRow[]) =>
    arr.reduce<Record<string, number>>((acc, r) => {
      const cat = (r.category ?? "uncategorized").trim().toLowerCase()
      acc[cat] = (acc[cat] || 0) + r.amount
      return acc
    }, {})

  const curr = sumByCat(filterYear(year))
  const prev = sumByCat(filterYear(year - 1))

  return Object.entries(curr).map(([cat, c]) => {
    const p = prev[cat] ?? 0
    const pct = p > 0 ? ((c - p) / p) * 100 : 0
    return { name: cat, amount: c, pctChange: pct }
  })
}
