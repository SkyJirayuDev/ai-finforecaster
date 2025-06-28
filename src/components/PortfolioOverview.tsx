"use client";

import { FaChartLine } from "react-icons/fa";
import { useMemo } from "react";
import { CSVRow } from "./CSVUploader";

export default function PortfolioOverview({
  validRows,
}: {
  validRows: CSVRow[];
}) {
  const { totalValue, growthRate } = useMemo(() => {
    if (!validRows || validRows.length === 0) {
      return { totalValue: 0, growthRate: 0 };
    }

    const totalValue = validRows.reduce((acc, row) => acc + row.amount, 0) / 1000;

    const janRows = validRows.filter((row) =>
      new Date(row.date).getMonth() === 0
    );
    const recentMonth = Math.max(
      ...validRows.map((r) => new Date(r.date).getTime())
    );
    const recentRows = validRows.filter(
      (r) => new Date(r.date).getTime() === recentMonth
    );

    const janTotal = janRows.reduce((acc, r) => acc + r.amount, 0);
    const recentTotal = recentRows.reduce((acc, r) => acc + r.amount, 0);

    const growthRate =
      janTotal > 0 ? ((recentTotal - janTotal) / janTotal) * 100 : 0;

    return { totalValue, growthRate };
  }, [validRows]);

  return (
    <div className="bg-white/95 backdrop-blur-lg rounded-2xl p-4 lg:p-6 shadow-xl border border-white/20">
      <h3 className="text-base lg:text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
        <FaChartLine className="text-blue-600" />
        Portfolio Overview
      </h3>
      <div className="grid grid-cols-2 gap-3 lg:gap-4">
        <div className="text-center p-2 lg:p-3 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl">
          <div className="text-lg lg:text-2xl font-bold text-blue-700">
            ${totalValue.toLocaleString(undefined, {
              maximumFractionDigits: 1,
            })}
            K
          </div>
          <div className="text-xs text-blue-600 font-medium">Total Value</div>
        </div>
        <div className="text-center p-2 lg:p-3 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl">
          <div className="text-lg lg:text-2xl font-bold text-green-700">
            {growthRate > 0 ? "+" : ""}
            {growthRate.toFixed(1)}%
          </div>
          <div className="text-xs text-green-600 font-medium">YTD Growth</div>
        </div>
      </div>
    </div>
  );
}
