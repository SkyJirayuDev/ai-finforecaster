"use client";

import { FaArrowUp, FaArrowDown, FaMinus } from "react-icons/fa";

interface KeyMetricsProps {
  forecastAccuracy?: number;
  confidenceLevel?: string;
  riskLevel?: "Low" | "Moderate" | "High";
  trendLabel?: "Bullish" | "Neutral" | "Bearish";
}

export default function KeyMetrics({
  forecastAccuracy = 0,
  confidenceLevel = "Moderate",
  riskLevel = "Moderate",
  trendLabel = "Neutral",
}: KeyMetricsProps) {
  const getTrendIcon = () => {
    if (trendLabel === "Bullish")
      return (
        <FaArrowUp size={10} className="text-green-500 dark:text-green-400" />
      );
    if (trendLabel === "Bearish")
      return (
        <FaArrowDown size={10} className="text-rose-500 dark:text-rose-400" />
      );
    return <FaMinus size={10} className="text-gray-400 dark:text-gray-300" />;
  };

  // Helper functions to determine colors based on values
  const getTrendColor = () => {
    if (trendLabel === "Bullish") return "text-green-600 dark:text-green-300";
    if (trendLabel === "Bearish") return "text-rose-600 dark:text-rose-400";
    return "text-gray-600 dark:text-gray-300";
  };

  // Helper functions to determine risk and confidence colors
  const getRiskColor = () => {
    if (riskLevel === "Low") return "text-emerald-600 dark:text-emerald-400";
    if (riskLevel === "High") return "text-rose-600 dark:text-rose-400";
    return "text-blue-600 dark:text-blue-400";
  };

  // Helper function to get confidence color
  const getConfidenceColor = () => {
    const level = confidenceLevel?.toLowerCase();
    if (level.startsWith("high")) return "text-green-600 dark:text-green-400";
    if (level.startsWith("low")) return "text-red-600 dark:text-red-400";
    return "text-blue-600 dark:text-blue-400";
  };

  return (
    <div className="bg-white/95 backdrop-blur-lg rounded-2xl p-4 lg:p-6 shadow-xl border border-white/20">
      <h3 className="text-base lg:text-lg font-semibold text-gray-800 mb-4">
        Key Metrics
      </h3>
      <div className="space-y-3 lg:space-y-4">
        {/* Forecast Accuracy */}
        <div className="flex justify-between items-center">
          <span className="text-gray-600 text-xs lg:text-sm">
            Forecast Accuracy
          </span>
          <div className="flex items-center gap-2">
            <div className="w-12 lg:w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-green-500 to-emerald-500"
                style={{ width: `${forecastAccuracy}%` }}
              />
            </div>
            <span className="text-xs lg:text-sm font-semibold text-gray-800">
              {forecastAccuracy.toFixed(1)}%
            </span>
          </div>
        </div>

        {/* Risk Assessment */}
        <div className="flex justify-between items-center">
          <span className="text-gray-600 text-xs lg:text-sm">
            Risk Assessment
          </span>
          <span
            className={`text-xs lg:text-sm font-semibold ${getRiskColor()}`}
          >
            {riskLevel}
          </span>
        </div>

        {/* Confidence Level */}
        <div className="flex justify-between items-center">
          <span className="text-gray-600 text-xs lg:text-sm">
            Confidence Level
          </span>
          <span className="text-xs lg:text-sm font-semibold">
            <span className={`${getConfidenceColor()}`}>
              {confidenceLevel?.split(" ")[0]}
            </span>{" "}
            <span className="text-gray-400">
              {confidenceLevel?.match(/\(\d+%.*\)/)?.[0]}
            </span>
          </span>
        </div>

        {/* Market Trend */}
        <div className="flex justify-between items-center">
          <span className="text-gray-600 text-xs lg:text-sm">Market Trend</span>
          <span
            className={`flex items-center gap-1 text-xs lg:text-sm font-semibold ${getTrendColor()}`}
          >
            {getTrendIcon()}
            {trendLabel}
          </span>
        </div>
      </div>
    </div>
  );
}
