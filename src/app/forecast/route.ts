import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const base = process.env.FORECAST_API_URL!;
    const url = `${base.replace(/\/$/, "")}/forecast`; 

    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const error = await res.json();
      return NextResponse.json({ error: error.detail || "Forecasting failed" }, { status: 500 });
    }

    const forecast = await res.json();
    return NextResponse.json(forecast, { status: 200 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Internal Server Error" }, { status: 500 });
  }
}
