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
  Filler,
} from "chart.js";
import "chartjs-adapter-date-fns";
import { Line } from "react-chartjs-2";
import { useMemo } from "react";
import { FaChartLine, FaInfoCircle } from "react-icons/fa";

// register the scales and elements we need
ChartJS.register(
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Legend,
  TimeScale,
  Filler
);

interface ForecastPoint {
  ds: string;
  yhat: number;
  yhat_upper?: number;
  yhat_lower?: number;
  actual?: number | null;
}

interface ForecastChartProps {
  forecastResult?: ForecastPoint[] | null;
  confidenceLevel?: number;
}

export default function ForecastChart({
  forecastResult,
  confidenceLevel,
}: ForecastChartProps) {
  const { chartData, stats } = useMemo(() => {
    if (!forecastResult || forecastResult.length === 0)
      return { chartData: null, stats: null };

    const actualData = forecastResult.filter((pt) => pt.actual !== null);
    const forecastData = forecastResult.filter((pt) => pt.actual === null);
    const allData = [...actualData, ...forecastData];

    const actualValues = actualData.map((pt) => pt.actual!);
    const forecastValues = forecastData.map((pt) => pt.yhat);

    const stats = {
      actualAvg:
        actualValues.length > 0
          ? actualValues.reduce((a, b) => a + b, 0) / actualValues.length
          : 0,
      forecastAvg:
        forecastValues.length > 0
          ? forecastValues.reduce((a, b) => a + b, 0) / forecastValues.length
          : 0,
      actualCount: actualValues.length,
      forecastCount: forecastValues.length,
      trend:
        forecastValues.length > 0 && actualValues.length > 0
          ? ((forecastValues[forecastValues.length - 1] -
              actualValues[actualValues.length - 1]) /
              actualValues[actualValues.length - 1]) *
            100
          : 0,
    };

    const chartData = {
      labels: allData.map((pt) => pt.ds),
      datasets: [
        {
          label: "Actual Data",
          data: allData.map((pt) => pt.actual ?? null),
          borderColor: "#3B82F6",
          backgroundColor: "rgba(59,130,246,0.1)",
          pointBackgroundColor: "#3B82F6",
          pointBorderColor: "#ffffff",
          pointBorderWidth: 2,
          pointRadius: 4,
          fill: false,
          tension: 0.2,
        },
        {
          label: "Forecast",
          data: allData.map((pt) => (pt.actual === null ? pt.yhat : null)),
          borderColor: "#10B981",
          backgroundColor: "rgba(16,185,129,0.1)",
          pointBackgroundColor: "#10B981",
          pointBorderColor: "#ffffff",
          pointBorderWidth: 2,
          pointRadius: 4,
          borderDash: [5, 5],
          fill: false,
          tension: 0.2,
        },
        {
          label: "Confidence Interval",
          data: allData.map((pt) => pt.yhat_upper ?? null),
          borderColor: "rgba(16,185,129,0.3)",
          backgroundColor: "rgba(16,185,129,0.1)",
          pointRadius: 0,
          fill: "+1",
          tension: 0.2,
        },
        {
          label: "",
          data: allData.map((pt) => pt.yhat_lower ?? null),
          borderColor: "rgba(16,185,129,0.3)",
          backgroundColor: "rgba(16,185,129,0.05)",
          pointRadius: 0,
          fill: false,
          tension: 0.2,
        },
      ].filter((dataset) => dataset.label !== ""), // ซ่อน dataset ที่ไม่มี label
    };

    return { chartData, stats };
  }, [forecastResult]);

  return (
    <div className="bg-white/95 backdrop-blur-lg rounded-2xl p-4 lg:p-8 shadow-xl border border-white/20">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-6 gap-4">
        <div>
          <h2 className="text-lg lg:text-xl font-bold text-gray-800 flex items-center gap-2">
            <FaChartLine className="text-blue-600" />
            Financial Forecast Analysis
          </h2>
          <p className="text-gray-600 text-xs lg:text-sm">
            Prophet-based predictive modeling with confidence intervals
          </p>
        </div>

        {stats && (
          <div className="flex gap-2 lg:gap-4 text-xs">
            <div className="bg-blue-50 px-3 py-2 rounded-lg">
              <div className="text-blue-800 font-semibold">Historical Avg</div>
              <div className="text-blue-600">
                {stats.actualAvg.toLocaleString("en-US", {
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 0,
                })}
              </div>
            </div>
            <div className="bg-green-50 px-3 py-2 rounded-lg">
              <div className="text-green-800 font-semibold">Forecast Avg</div>
              <div className="text-green-600">
                {stats.forecastAvg.toLocaleString("en-US", {
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 0,
                })}
              </div>
            </div>
            <div
              className={`px-3 py-2 rounded-lg ${
                stats.trend >= 0 ? "bg-green-50" : "bg-red-50"
              }`}
            >
              <div
                className={`font-semibold ${
                  stats.trend >= 0 ? "text-green-800" : "text-red-800"
                }`}
              >
                Trend
              </div>
              <div
                className={`${
                  stats.trend >= 0 ? "text-green-600" : "text-red-600"
                }`}
              >
                {stats.trend >= 0 ? "+" : ""}
                {stats.trend.toFixed(1)}%
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Chart */}
      <div id="forecastChart" className="relative w-full h-[500px]">
        {chartData ? (
          <Line
            data={chartData}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: {
                  display: true,
                  position: "top",
                  labels: {
                    filter: (item) => item.text !== "", // ซ่อน empty labels
                    usePointStyle: true,
                    pointStyle: "circle",
                  },
                },
                tooltip: {
                  mode: "index",
                  intersect: false,
                  callbacks: {
                    label: function (context) {
                      if (
                        context.datasetIndex === 2 ||
                        context.datasetIndex === 3
                      )
                        return ""; // ใช้ "" แทน null

                      const label = context.dataset.label || "";
                      const value = context.parsed.y;
                      if (value === null || value === undefined) return ""; // ป้องกัน null/undefined

                      return `${label}: ${value.toLocaleString("en-US", {
                        minimumFractionDigits: 0,
                        maximumFractionDigits: 0,
                      })}`;
                    },
                  },
                },
              },
              scales: {
                x: {
                  type: "time",
                  time: {
                    unit: "month",
                    tooltipFormat: "MMM yyyy",
                    displayFormats: {
                      month: "MMM yy",
                    },
                  },
                  title: {
                    display: true,
                    text: "Date",
                    font: { weight: "bold" },
                  },
                  grid: {
                    color: "rgba(0,0,0,0.1)",
                  },
                },
                y: {
                  title: {
                    display: true,
                    text: "Amount",
                    font: { weight: "bold" },
                  },
                  grid: {
                    color: "rgba(0,0,0,0.1)",
                  },
                  ticks: {
                    callback: function (value) {
                      return typeof value === "number"
                        ? value.toLocaleString("en-US", {
                            minimumFractionDigits: 0,
                            maximumFractionDigits: 0,
                          })
                        : value;
                    },
                  },
                },
              },
              interaction: {
                mode: "index",
                intersect: false,
              },
            }}
            style={{ width: "100%", height: "100%" }}
          />
        ) : (
          <div className="h-full flex items-center justify-center text-center px-4">
            <div>
              <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-2xl mx-auto mb-4 flex items-center justify-center">
                <FaChartLine className="text-2xl text-blue-600" />
              </div>
              <h3 className="text-base font-semibold text-gray-700 mb-2">
                Ready for Analysis
              </h3>
              <p className="text-gray-500 text-sm max-w-md mx-auto flex items-center gap-2">
                <FaInfoCircle className="text-blue-500" />
                Upload your CSV financial data to generate AI-powered forecasts
                with confidence intervals
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Footer Info */}
      {stats && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex flex-wrap gap-4 text-xs text-gray-600">
            <span>
              📊 Data Points: {stats.actualCount} historical,{" "}
              {stats.forecastCount} forecast
            </span>
            <span>🤖 Model: Facebook Prophet with seasonality detection</span>
            <span>
              📈 Confidence Level:{" "}
              {confidenceLevel ? confidenceLevel.toFixed(0) : "80"}%
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
