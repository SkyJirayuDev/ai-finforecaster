import React, { FC } from "react";
import { TrendingUp, AlertTriangle, Award, TrendingDown, CheckCircle } from "lucide-react";

export interface Advice {
  portfolioTip: string;
  riskAlert: string;
  categoryTop: string;
  categoryBottom: string;
  nextSteps: string[];
}

const AIInsights: FC<{ advice: Advice }> = ({ advice }) => {
  return (
    <div className="space-y-4">
      {/* Portfolio Optimization */}
      <div className="bg-white/95 backdrop-blur-lg rounded-2xl p-4 flex items-start gap-4 border border-white/20 hover:shadow-md transition-shadow">
        <div className="p-3 bg-blue-100 rounded-lg">
          <TrendingUp className="w-6 h-6 text-blue-600 stroke-current" />
        </div>
        <div className="flex-1">
          <h4 className="font-semibold text-gray-800 mb-1">Portfolio Optimization</h4>
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

      {/* Top Performer Insight */}
      <div className="bg-white/95 backdrop-blur-lg rounded-2xl p-4 flex items-start gap-4 border border-white/20 hover:shadow-md transition-shadow">
        <div className="p-3 bg-green-100 rounded-lg">
          <Award className="w-6 h-6 text-green-600 stroke-current" />
        </div>
        <div className="flex-1">
          <h4 className="font-semibold text-gray-800 mb-1">Top Performer Insight</h4>
          <p className="text-gray-700 text-sm leading-relaxed">
            {advice.categoryTop}
          </p>
        </div>
      </div>

      {/* Underperformer Insight */}
      <div className="bg-white/95 backdrop-blur-lg rounded-2xl p-4 flex items-start gap-4 border border-white/20 hover:shadow-md transition-shadow">
        <div className="p-3 bg-red-100 rounded-lg">
          <TrendingDown className="w-6 h-6 text-red-600 stroke-current" />
        </div>
        <div className="flex-1">
          <h4 className="font-semibold text-gray-800 mb-1">Underperformer Insight</h4>
          <p className="text-gray-700 text-sm leading-relaxed">
            {advice.categoryBottom}
          </p>
        </div>
      </div>

      {/* Recommended Actions */}
      <div className="bg-white/95 backdrop-blur-lg rounded-2xl p-4 flex items-start gap-4 border border-white/20 hover:shadow-md transition-shadow">
        <div className="p-3 bg-purple-100 rounded-lg">
          <CheckCircle className="w-6 h-6 text-purple-600 stroke-current" />
        </div>
        <div className="flex-1">
          <h4 className="font-semibold text-gray-800 mb-2">Recommended Actions</h4>
          <ol className="list-decimal list-inside space-y-1 text-gray-700 text-sm leading-relaxed">
            {advice.nextSteps.map((step, idx) => (
              <li key={idx}>{step}</li>
            ))}
          </ol>
        </div>
      </div>
    </div>
  );
};

export default AIInsights;
