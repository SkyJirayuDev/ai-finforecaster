import React, { FC } from "react";
import {
  TrendingUp,
  AlertTriangle,
  Calendar,
  AlertCircle,
  Activity,
  CheckCircle,
} from "lucide-react";

// types 
export interface Scenario {
  best: string;
  base: string;
  worst: string;
}

export interface Advice {
  portfolioTip: string;
  riskAlert: string;
  categoryInsights?: string;
  seasonality?: string;
  anomalies?: string;
  scenarios?: Scenario;
  actions?: { horizon: string; action: string }[]; // optional
  topCategory?: string;
  bottomCategory?: string;
  topCategoriesList?: { name: string; pctChange: number }[];
}

// component 
const AIInsights: FC<{ advice: Advice }> = ({ advice }) => {
  const actions = advice.actions ?? [];
  const topCategories = advice.topCategoriesList ?? [];

  return (
    <div className="space-y-4">
      {/* Portfolio Optimization */}
      <div className="bg-white/95 backdrop-blur-lg rounded-2xl p-4 flex items-start gap-4 border border-white/20 hover:shadow-md transition-shadow">
        <div className="p-3 bg-blue-100 rounded-lg">
          <TrendingUp className="w-6 h-6 text-blue-600 stroke-current" />
        </div>
        <div className="flex-1">
          <h4 className="font-semibold text-gray-800 mb-1">
            Portfolio Optimization
          </h4>
          <p className="text-gray-700 text-sm leading-relaxed">
            {advice.portfolioTip}
          </p>
        </div>
      </div>

      {/* Risk Alert */}
      <div className="bg-white/95 backdrop-blur-lg rounded-2xl p-4 flex items-start gap-4 border border-white/20 hover:shadow-md transition-shadow">
        <div className="p-3 bg-yellow-100 rounded-lg">
          <AlertTriangle className="w-6 h-6 text-amber-600 stroke-current" />
        </div>
        <div className="flex-1">
          <h4 className="font-semibold text-gray-800 mb-1">Risk Alert</h4>
          <p className="text-gray-700 text-sm leading-relaxed">
            {advice.riskAlert}
          </p>
        </div>
      </div>

      {/* Category Performance (Upgrade) */}
      {(advice.categoryInsights || topCategories.length > 0) && (
        <div className="bg-white/95 backdrop-blur-lg rounded-2xl p-4 flex items-start gap-4 border border-white/20 hover:shadow-md transition-shadow">
          <div className="p-3 bg-green-100 rounded-lg">
            <TrendingUp className="w-6 h-6 text-green-600 stroke-current" />
          </div>
          <div className="flex-1">
            <h4 className="font-semibold text-gray-800 mb-1">
              Category Insights
            </h4>
            <p className="text-gray-700 text-sm leading-relaxed">
              {advice.categoryInsights ||
                `Top Category: ${advice.topCategory} | Bottom Category: ${advice.bottomCategory}`}
            </p>
            {topCategories.length > 0 && (
              <ul className="list-disc list-inside mt-2 text-gray-700 text-sm leading-relaxed">
                {topCategories.map((cat, idx) => (
                  <li key={idx}>
                    {cat.name} ({cat.pctChange >= 0 ? "+" : ""}
                    {cat.pctChange.toFixed(1)}%)
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}

      {/* Seasonality (optional) */}
      {advice.seasonality && (
        <div className="bg-white/95 backdrop-blur-lg rounded-2xl p-4 flex items-start gap-4 border border-white/20 hover:shadow-md transition-shadow">
          <div className="p-3 bg-green-100 rounded-lg">
            <Calendar className="w-6 h-6 text-green-600 stroke-current" />
          </div>
          <div className="flex-1">
            <h4 className="font-semibold text-gray-800 mb-1">
              Seasonality Insight
            </h4>
            <p className="text-gray-700 text-sm leading-relaxed">
              {advice.seasonality}
            </p>
          </div>
        </div>
      )}

      {/* Anomaly (optional) */}
      {advice.anomalies && (
        <div className="bg-white/95 backdrop-blur-lg rounded-2xl p-4 flex items-start gap-4 border border-white/20 hover:shadow-md transition-shadow">
          <div className="p-3 bg-red-100 rounded-lg">
            <AlertCircle className="w-6 h-6 text-red-600 stroke-current" />
          </div>
          <div className="flex-1">
            <h4 className="font-semibold text-gray-800 mb-1">
              Anomaly Detection
            </h4>
            <p className="text-gray-700 text-sm leading-relaxed">
              {advice.anomalies}
            </p>
          </div>
        </div>
      )}

      {/* Scenario Planning (optional) */}
      {advice.scenarios && (
        <div className="bg-white/95 backdrop-blur-lg rounded-2xl p-4 flex items-start gap-4 border border-white/20 hover:shadow-md transition-shadow">
          <div className="p-3 bg-teal-100 rounded-lg">
            <Activity className="w-6 h-6 text-teal-600 stroke-current" />
          </div>
          <div className="flex-1">
            <h4 className="font-semibold text-gray-800 mb-2">
              Scenario Planning
            </h4>
            <ul className="list-disc list-inside text-gray-700 text-sm leading-relaxed space-y-1">
              <li>
                <strong>Best case:</strong> {advice.scenarios.best}
              </li>
              <li>
                <strong>Base case:</strong> {advice.scenarios.base}
              </li>
              <li>
                <strong>Worst case:</strong> {advice.scenarios.worst}
              </li>
            </ul>
          </div>
        </div>
      )}

      {/* Recommended Actions */}
      <div className="bg-white/95 backdrop-blur-lg rounded-2xl p-4 flex items-start gap-4 border border-white/20 hover:shadow-md transition-shadow">
        <div className="p-3 bg-purple-100 rounded-lg">
          <CheckCircle className="w-6 h-6 text-purple-600 stroke-current" />
        </div>
        <div className="flex-1">
          <h4 className="font-semibold text-gray-800 mb-2">
            Recommended Actions
          </h4>
          <ol className="list-decimal list-inside text-gray-700 text-sm leading-relaxed space-y-1">
            {actions.map((a, idx) => (
              <li key={idx}>
                <strong>{a.horizon}:</strong> {a.action}
              </li>
            ))}
          </ol>
        </div>
      </div>
    </div>
  );
};

export default AIInsights;
