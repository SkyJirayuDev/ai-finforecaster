"use client";

import {
  Chart as ChartJS,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Legend,
  TimeScale,
} from "chart.js";
import "chartjs-adapter-date-fns";
import { Line } from "react-chartjs-2";
import { useMemo } from "react";
import { FaChartLine } from "react-icons/fa";

// register the scales and elements we need
ChartJS.register(
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Legend,
  TimeScale
);

interface ForecastPoint {
  ds: string; // ISO date
  yhat: number; // forecast
  actual?: number | null; // ✅ ใช้ชื่อ actual ให้ตรงกับ backend
}

interface ForecastChartProps {
  forecastResult?: ForecastPoint[] | null;
}

export default function ForecastChart({ forecastResult }: ForecastChartProps) {
  const chartData = useMemo(() => {
    if (!forecastResult || forecastResult.length === 0) return null;

    return {
      labels: forecastResult.map((pt) => pt.ds),
      datasets: [
        {
          label: "Actual",
          data: forecastResult.map((pt) => pt.actual ?? null), // ✅ เปลี่ยนจาก pt.y ➜ pt.actual
          borderColor: "#3B82F6",
          backgroundColor: "rgba(59,130,246,0.2)",
          fill: false,
          spanGaps: true,
        },
        {
          label: "Forecast",
          data: forecastResult.map((pt) => pt.yhat),
          borderColor: "#10B981",
          backgroundColor: "rgba(16,185,129,0.2)",
          fill: false,
        },
      ],
    };
  }, [forecastResult]);

  return (
    <div className="bg-white/95 backdrop-blur-lg rounded-2xl p-4 lg:p-8 shadow-xl border border-white/20 min-h-[300px] lg:h-96">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-4 lg:mb-6 gap-4">
        <div>
          <h2 className="text-lg lg:text-xl font-bold text-gray-800">
            Financial Forecast Analysis
          </h2>
          <p className="text-gray-600 text-xs lg:text-sm">
            Real-time predictive modeling and trend analysis
          </p>
        </div>
        <div className="flex gap-2 overflow-x-auto pb-2 lg:pb-0">
          {["1M", "3M", "1Y", "All"].map((lbl) => (
            <button
              key={lbl}
              className="px-3 py-1.5 text-xs lg:text-sm bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition whitespace-nowrap"
            >
              {lbl}
            </button>
          ))}
        </div>
      </div>

      {/* Chart */}
      <div className="flex-1 flex items-center justify-center h-48 lg:h-64">
        {chartData ? (
          <Line
            data={chartData}
            options={{
              scales: {
                x: {
                  type: "time",
                  time: { unit: "month", tooltipFormat: "yyyy-MM-dd" },
                  title: { display: true, text: "Date" },
                },
                y: {
                  title: { display: true, text: "Value" },
                },
              },
              responsive: true,
              maintainAspectRatio: false,
            }}
          />
        ) : (
          <div className="text-center px-4">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-2xl mx-auto mb-4 flex items-center justify-center">
              <FaChartLine className="text-2xl text-blue-600" />
            </div>
            <h3 className="text-base font-semibold text-gray-700 mb-2">
              Advanced Analytics Dashboard
            </h3>
            <p className="text-gray-500 text-sm max-w-md mx-auto">
              Upload your financial data to view comprehensive forecasting
              models and predictive insights.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
