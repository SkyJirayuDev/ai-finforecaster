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

    const totalValue =
      validRows.reduce((acc: number, row: CSVRow) => acc + row.amount, 0) / 1000;

    const recentTimestamp = Math.max(
      ...validRows.map((r) => new Date(r.date).getTime())
    );
    const recentDate = new Date(recentTimestamp);
    const currentYear = recentDate.getFullYear();
    const currentMonthIndex = recentDate.getMonth(); 

    // Calculate YTD growth
    const currentYTD = validRows
      .filter((r) => {
        const d = new Date(r.date);
        return (
          d.getFullYear() === currentYear &&
          d.getMonth() <= currentMonthIndex
        );
      })
      .reduce((sum: number, r: CSVRow) => sum + r.amount, 0);

    // Calculate last year's YTD
    const lastYTD = validRows
      .filter((r) => {
        const d = new Date(r.date);
        return (
          d.getFullYear() === currentYear - 1 &&
          d.getMonth() <= currentMonthIndex
        );
      })
      .reduce((sum: number, r: CSVRow) => sum + r.amount, 0);

    const growthRate =
      lastYTD > 0 ? ((currentYTD - lastYTD) / lastYTD) * 100 : 0;

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
            })}K
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
