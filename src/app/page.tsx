"use client";

import {
  FaUser,
  FaCog,
  FaUpload,
  FaChartLine,
  FaDownload,
  FaRobot,
  FaArrowUp,
  FaBell,
  FaSearch,
  FaFileAlt,
  FaShieldAlt,
  FaBars,
  FaTimes,
} from "react-icons/fa";
import { useState, useEffect } from "react";
import CSVUploader, { CSVRow } from "@/components/CSVUploader";
import ForecastChart from "@/components/ForecastChart";
import PortfolioOverview from "@/components/PortfolioOverview";
import KeyMetrics from "@/components/KeyMetrics";
import {
  calculateForecastAccuracy,
  calculateRiskAssessment,
  calculateMarketTrend,
  getConfidenceLabel,
} from "@/lib/forecastMetrics";
import { buildAdvicePayload } from "@/lib/adviceUtils";
import AIInsights, { Advice } from "@/components/AIInsights";

export default function Home() {
  // Sidebar toggle
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // CSV and forecast data states
  const [validRows, setValidRows] = useState<CSVRow[]>([]);
  const [forecastResult, setForecastResult] = useState<any[] | null>(null);
  const [confidenceLevel, setConfidenceLevel] = useState<number>(80);

  // Advice state
  const [advice, setAdvice] = useState<Advice | null>(null);
  const [loadingAdvice, setLoadingAdvice] = useState(false);

  // Compute Portfolio totals (used elsewhere)
  const totalValue =
    validRows.reduce((sum, row) => sum + row.amount, 0) / 1000;
  const currentYear = new Date().getFullYear();
  const thisYearRows = validRows.filter(
    (r) => new Date(r.date).getFullYear() === currentYear
  );
  const lastYearRows = validRows.filter(
    (r) => new Date(r.date).getFullYear() === currentYear - 1
  );
  const thisYearTotal = thisYearRows.reduce((sum, row) => sum + row.amount, 0);
  const lastYearTotal = lastYearRows.reduce((sum, row) => sum + row.amount, 0);
  const growthRate =
    lastYearTotal > 0
      ? ((thisYearTotal - lastYearTotal) / lastYearTotal) * 100
      : 0;

  // Trigger advice fetch when forecastResult updates
  useEffect(() => {
    if (!forecastResult || validRows.length === 0) return;
    setLoadingAdvice(true);

    // Prepare payload
    const payload = buildAdvicePayload(
      validRows,
      { points: forecastResult, summary: { accuracy: calculateForecastAccuracy(forecastResult) } },
      confidenceLevel,
      calculateForecastAccuracy(forecastResult)
    );

    // Fetch AI advice
    fetch("/api/advice", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })
      .then((res) => res.json())
      .then((json: Advice) => setAdvice(json))
      .catch((err) => console.error("Failed to fetch advice", err))
      .finally(() => setLoadingAdvice(false));
  }, [forecastResult, validRows, confidenceLevel]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 flex flex-col">
      {/* Top Navigation */}
      <nav className="flex items-center justify-between p-4 lg:px-6 relative z-50">
        <div className="flex items-center gap-3 lg:gap-4">
          <button
            className="lg:hidden p-2 rounded-lg bg-white/10 backdrop-blur-sm text-white hover:bg-white/20 transition mr-2"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            {sidebarOpen ? <FaTimes size={18} /> : <FaBars size={18} />}
          </button>
          <div className="w-8 h-8 lg:w-10 lg:h-10 bg-gradient-to-br from-blue-400 to-cyan-300 rounded-lg flex items-center justify-center">
            <FaChartLine className="text-white text-sm lg:text-lg" />
          </div>
          <div>
            <h1 className="text-lg lg:text-2xl font-bold text-white">
              FinanceForecaster
            </h1>
            <p className="text-blue-200 text-xs lg:text-sm hidden sm:block">
              Professional Analytics Platform
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 lg:gap-3">
          <button className="p-2 rounded-lg bg-white/10 backdrop-blur-sm text-white hover:bg-white/20 transition hidden sm:block">
            <FaSearch size={16} className="lg:w-[18px] lg:h-[18px]" />
          </button>
          <button className="p-2 rounded-lg bg-white/10 backdrop-blur-sm text-white hover:bg-white/20 transition">
            <FaBell size={16} className="lg:w-[18px] lg:h-[18px]" />
          </button>
          <button className="p-2 rounded-lg bg-white/10 backdrop-blur-sm text-white hover:bg-white/20 transition hidden sm:block">
            <FaCog size={16} className="lg:w-[18px] lg:h-[18px]" />
          </button>
          <div className="w-7 h-7 lg:w-8 lg:h-8 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center">
            <FaUser className="text-white text-xs lg:text-sm" />
          </div>
        </div>
      </nav>

      <div className="flex-1 flex relative">
        {/* Mobile Sidebar Overlay */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-30 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          ></div>
        )}

        {/* Sidebar */}
        <aside
          className={
            `
          fixed lg:relative top-0 left-0 h-full lg:h-auto
          w-80 lg:w-80 xl:w-96 
          transform ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          } lg:translate-x-0
          transition-transform duration-300 ease-in-out
          z-40 lg:z-auto
          flex flex-col gap-4 p-4 lg:p-0 lg:pr-6 lg:pl-4
          overflow-y-auto
        `}
        >
          {/* Portfolio Overview */}
          <PortfolioOverview validRows={validRows} />

          {/* Data Management */}
          <CSVUploader
            forecastResult={forecastResult}
            setForecastResult={setForecastResult}
            setValidRowsGlobal={setValidRows}
            confidenceLevel={confidenceLevel}
            setConfidenceLevel={setConfidenceLevel}
          />

          {/* Security & Compliance */}
          <div className="bg-white/95 backdrop-blur-lg rounded-2xl p-4 lg:p-6 shadow-xl border border-white/20">
            <h3 className="text-base lg:text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <FaShieldAlt className="text-green-600" />
              Security Status
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs lg:text-sm text-gray-600">
                  Data Encryption
                </span>
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs lg:text-sm text-gray-600">
                  Compliance Check
                </span>
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs lg:text-sm text-gray-600">
                  Audit Trail
                </span>
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 flex flex-col gap-6 p-4 lg:p-6 overflow-y-auto">
          <ForecastChart
            forecastResult={forecastResult}
            confidenceLevel={confidenceLevel}
          />

          {/* Bottom Analytics Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
            {/* Key Metrics */}
            <KeyMetrics
              forecastAccuracy={
                forecastResult && forecastResult.length > 0
                  ? calculateForecastAccuracy(forecastResult)
                  : 0
              }
              confidenceLevel={getConfidenceLabel(confidenceLevel)}
              riskLevel={
                forecastResult && forecastResult.length > 0
                  ? calculateRiskAssessment(forecastResult)
                  : "Moderate"
              }
              trendLabel={
                forecastResult && forecastResult.length > 0
                  ? calculateMarketTrend(forecastResult)
                  : "Neutral"
              }
            />

            {/* AI Insights */}
            <div className="bg-white/95 backdrop-blur-lg rounded-2xl p-4 lg:p-6 shadow-xl border border-white/20">
              <h3 className="text-base lg:text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <FaRobot className="text-purple-600" />
                AI Insights
              </h3>
              {loadingAdvice ? (
                <p className="text-sm text-gray-500">Loading insights...</p>
              ) : advice ? (
                <AIInsights advice={advice} />
              ) : (
                <p className="text-sm text-gray-500">
                  Upload your CSV and generate forecast to see insights
                </p>
              )}
            </div>

            {/* Export & Reports */}
            <div className="bg-white/95 backdrop-blur-lg rounded-2xl p-4 lg:p-6 shadow-xl border border-white/20">
              <h3 className="text-base lg:text-lg font-semibold text-gray-800 mb-4">
                Reports & Export
              </h3>
              <div className="space-y-3">
                <button className="w-full flex items-center justify-between p-2 lg:p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition text-left">
                  <div>
                    <p className="text-xs lg:text-sm font-medium text-gray-800">
                      Comprehensive Report
                    </p>
                    <p className="text-xs text-gray-500">
                      Full analysis with recommendations
                    </p>
                  </div>
                  <FaDownload className="text-gray-400 text-sm" />
                </button>
                <button className="w-full flex items-center justify-between p-2 lg:p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition text-left">
                  <div>
                    <p className="text-xs lg:text-sm font-medium text-gray-800">
                      Data Export
                    </p>
                    <p className="text-xs text-gray-500">
                      CSV, Excel, PDF formats
                    </p>
                  </div>
                  <FaDownload className="text-gray-400 text-sm" />
                </button>
                <button className="w-full flex items-center justify-between p-2 lg:p-3 bg-gradient-to-r from-blue-50 to-cyan-50 hover:from-blue-100 hover:to-cyan-100 rounded-lg transition text-left border border-blue-200">
                  <div>
                    <p className="text-xs lg:text-sm font-medium text-blue-800">
                      Executive Summary
                    </p>
                    <p className="text-xs text-blue-600">
                      Key insights for stakeholders
                    </p>
                  </div>
                  <FaDownload className="text-blue-400 text-sm" />
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
