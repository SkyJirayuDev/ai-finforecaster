// /src/pages/api/advice.ts
import type { NextApiRequest, NextApiResponse } from "next";
import OpenAI from "openai";

// ติดตั้ง: npm install openai
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

interface AdviceResponse {
  portfolioTip: string;
  riskAlert: string;
  categoryTop: string;
  categoryBottom: string;
  nextSteps: string[];
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<AdviceResponse | { error: string }>
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
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
    };

    // หาหมวดบนสุดและล่างสุด
    const sorted = [...p.categories].sort((a, b) => b.pctChange - a.pctChange);
    const top = sorted[0];
    const bottom = sorted[sorted.length - 1];

    const prompt = `
You are a top-notch financial AI assistant.
Provide highly actionable insights based on the data below.

1) Portfolio Overview
• Total Value: ${p.totalValue.toLocaleString(undefined, { maximumFractionDigits: 1 })}
• YTD Growth: ${p.growthRate.toFixed(1)}%

2) Key Metrics
• Forecast Accuracy: ${p.forecastAccuracy.toFixed(1)}%
• Risk Assessment: ${p.riskAssessment}
• Confidence Level: ${p.confidenceLevel}%
• Market Trend: ${p.marketTrend}

3) Forecast Summary
• Historical Avg: ${p.historicalAvg.toFixed(0)}
• Forecast Avg:   ${p.forecastAvg.toFixed(0)}
• Trend: ${p.trendPct.toFixed(1)}%
• Peak: ${p.peakMonth} at ${p.peakValue.toFixed(0)}
• Trough: ${p.troughMonth} at ${p.troughValue.toFixed(0)}

4) Category Performance
• Top: ${top.name} (+${top.pctChange.toFixed(1)}%)
• Bottom: ${bottom.name} (${bottom.pctChange.toFixed(1)}%)

Generate:
1) A one-sentence **Portfolio Optimization Tip** that mentions the top category and a suggested realloc percentage (e.g. “Allocate 5–10%…”).
2) A one-sentence **Risk Alert** citing the market trend and confidence level (e.g. “With neutral trend and 90% confidence, expect ±X% swings…”).
3) A one-sentence **Top Performer Insight** with month-over-month or YTD figures (e.g. “${top.name}…”).
4) A one-sentence **Underperformer Insight** with a specific action for the bottom category.
5) A **list of three bullet “Next Steps”**, each actionable and numbered, referencing actual figures.

Respond **strictly** as JSON in this format:
\`\`\`json
{
  "portfolioTip": "...",
  "riskAlert": "...",
  "categoryTop": "...",
  "categoryBottom": "...",
  "nextSteps": ["...","...","..."]
}
\`\`\`
`.trim();

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "You are a helpful financial advisor." },
        { role: "user", content: prompt },
      ],
      temperature: 0.7,
      max_tokens: 350,
    });

    const text = completion.choices[0].message?.content ?? "";
    const match = text.match(/```json([\s\S]*?)```/);
    const advice: AdviceResponse = match
      ? JSON.parse(match[1].trim())
      : JSON.parse(text.trim());

    res.status(200).json(advice);
  } catch (e: any) {
    console.error(e);
    res.status(500).json({ error: "Failed to generate insights." });
  }
}
