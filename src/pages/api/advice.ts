import type { NextApiRequest, NextApiResponse } from "next";
import OpenAI from "openai";

/* ---------- OpenAI init ---------- */
if (!process.env.OPENAI_API_KEY) {
  throw new Error("Missing OPENAI_API_KEY in environment");
}

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

/* ---------- types ---------- */
type ForecastPoint = {
  ds: string;
  actual: number;
  yhat: number;
  yhat_lower: number;
  yhat_upper: number;
};

interface AdviceResponse {
  portfolioTip: string;
  riskAlert: string;
  seasonality?: string;
  anomalies?: string;
  scenarios?: { best: string; base: string; worst: string };
  actions?: { horizon: string; action: string }[]; // optional
}

/* ---------- handler ---------- */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<AdviceResponse | { error: string }>
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    /* ----- payload ----- */
    const p = req.body as {
      totalValue: number;
      growthRate: number;
      historicalAvg: number;
      forecastAvg: number;
      trendPct: number;
      peakMonth: string;
      peakValue: number;
      troughMonth: string;
      troughValue: number;
      forecastAccuracy: number;
      confidenceLevel: number;
      riskAssessment: string;
      marketTrend: string;
      categories: { name: string; amount: number; pctChange: number }[];
      forecastPoints?: ForecastPoint[];
    };

    /* ----- derive top / bottom category ----- */
    const sorted = [...p.categories].sort((a, b) => b.pctChange - a.pctChange);
    const top = sorted[0];
    const bottom = sorted[sorted.length - 1];

    /* ----- last‑6‑points lines (if any) ----- */
    const lines =
      p.forecastPoints?.slice(-6).map(pt =>
        `• ${pt.ds}: actual=${pt.actual.toFixed(0)}, forecast=${pt.yhat.toFixed(
          0
        )}, CI[${pt.yhat_lower.toFixed(0)}–${pt.yhat_upper.toFixed(0)}]`
      ) ?? [];

    /* ----- build prompt ----- */
    const prompt = `
You are a world‑class financial AI analyst. Based on the data below, write a JSON report.

DATA:
• Total Portfolio Value: ${p.totalValue.toLocaleString(undefined, {
      maximumFractionDigits: 1,
    })}
• YTD Growth: ${p.growthRate.toFixed(1)}%
• Forecast Accuracy: ${p.forecastAccuracy.toFixed(1)}%
• Confidence Level: ${p.confidenceLevel}% (±${(
      100 - p.confidenceLevel
    ).toFixed(1)}% swings)
• Trend vs Hist Avg: ${p.trendPct.toFixed(1)}% (hist ${p.historicalAvg}, fc ${p.forecastAvg})
• Peak: ${p.peakMonth} ${p.peakValue.toFixed(0)}, Trough: ${p.troughMonth} ${p.troughValue.toFixed(
      0
    )}

CATEGORIES:
${p.categories
  .map(
    c =>
      `• ${c.name}: ${c.pctChange >= 0 ? "+" : ""}${c.pctChange.toFixed(1)}%`
  )
  .join("\n")}

TIME SERIES (last 6):
${lines.join("\n")}

TASKS:
1) Portfolio Optimization Tip (1 sentence).
2) Risk Alert (1 sentence, include ± swings & trough).
3) Seasonality Insight (1 sentence, last quarter MoM).
4) Anomaly Detection (1 sentence).
5) Scenario Planning (best/base/worst, 1‑2 sentences each).
6) Actions: 3 numbered items with horizon (Immediate, 1‑month, Quarterly).

Respond **only**:

\`\`\`json
{
  "portfolioTip": "...",
  "riskAlert": "...",
  "seasonality": "...",
  "anomalies": "...",
  "scenarios": { "best": "...", "base": "...", "worst": "..." },
  "actions": [
    { "horizon": "Immediate", "action": "..." },
    { "horizon": "1‑month", "action": "..." },
    { "horizon": "Quarterly", "action": "..." }
  ]
}
\`\`\`
`.trim();

    /* ----- OpenAI call ----- */
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "You are a helpful financial advisor." },
        { role: "user", content: prompt },
      ],
      temperature: 0.7,
      max_tokens: 500,
    });

    const raw = completion.choices[0].message?.content ?? "";
    console.log("raw model output:", raw);

    /* ----- parse json ----- */
    let advice: AdviceResponse;
    const m = raw.match(/```json([\s\S]*?)```/);
    advice = m ? JSON.parse(m[1].trim()) : JSON.parse(raw.trim());

    if (!advice.actions) advice.actions = []; // always array for frontend

    return res.status(200).json(advice);
  } catch (err: any) {
    console.error("Advice API error:", err);
    return res.status(500).json({ error: err.message || "Failed to generate insights." });
  }
}
