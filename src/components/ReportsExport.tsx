"use client";
import React from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import html2canvas from "html2canvas";

// ให้ jsPDF ใช้ lastAutoTable ได้ (จาก jspdf-autotable)
type AutoTableDoc = jsPDF & { lastAutoTable?: { finalY: number } };

type Dict = Record<string, any>;
interface ReportsExportProps {
  portfolioOverview: Dict;
  forecastData: any[];      // points array
  keyMetrics: Dict;
  aiInsights: string;
}

// ---------- helpers ----------
const pick = (obj: any, keys: string[]) =>
  keys.find((k) => obj && Object.prototype.hasOwnProperty.call(obj, k));

const clean = (v: any) => {
  if (v === null || v === undefined) return "";
  const s = String(v);
  return s === "null" || s === "undefined" || s === "NaN" ? "" : s;
};

type Row = { date: string; forecast: string; actual: string; lower?: string; upper?: string };

function normalizeForecastRows(rows: any[]): Row[] {
  return (rows || []).map((r) => {
    const dk = pick(r, ["date", "ds", "Date", "timestamp"]);
    const fk = pick(r, ["forecast", "yhat", "pred", "prediction", "y_pred"]);
    const ak = pick(r, ["actual", "y", "amount", "value"]);
    const lk = pick(r, ["yhat_lower", "lower", "lo"]);
    const uk = pick(r, ["yhat_upper", "upper", "hi"]);

    return {
      date: clean(dk ? r[dk] : ""),
      forecast: clean(fk != null ? r[fk] : ""),
      actual: clean(ak != null ? r[ak] : ""),
      lower: clean(lk != null ? r[lk] : ""),
      upper: clean(uk != null ? r[uk] : ""),
    };
  });
}

function downloadCSV(filename: string, content: string) {
  const blob = new Blob([content], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
// --------------------------------

const ReportsExport: React.FC<ReportsExportProps> = ({
  portfolioOverview,
  forecastData,
  keyMetrics,
  aiInsights,
}) => {
  const normRows = normalizeForecastRows(forecastData || []);
  const hasCI = normRows.some((r) => r.lower || r.upper);
  const canExportPDF = (forecastData?.length ?? 0) > 0;
  const dateStamp = new Date().toISOString().slice(0, 10);

  const handleExportCSV = () => {
    const lines: string[] = [];

    // Portfolio Overview
    lines.push("Portfolio Overview");
    Object.entries(portfolioOverview || {}).forEach(([k, v]) =>
      lines.push(`${k},${String(v)}`)
    );
    lines.push("");

    // Forecast Data
    lines.push("Financial Forecast Analysis");
    if (hasCI) lines.push("Date,Forecast,Lower,Upper,Actual");
    else lines.push("Date,Forecast,Actual");

    normRows.forEach((r) => {
      if (hasCI) lines.push(`${r.date},${r.forecast},${r.lower ?? ""},${r.upper ?? ""},${r.actual}`);
      else lines.push(`${r.date},${r.forecast},${r.actual}`);
    });
    lines.push("");

    // Key Metrics
    lines.push("Key Metrics");
    Object.entries(keyMetrics || {}).forEach(([k, v]) =>
      lines.push(`${k},${String(v)}`)
    );
    lines.push("");

    // AI Insights
    lines.push("AI Insights");
    lines.push(aiInsights || "No insights");

    downloadCSV(`report_${dateStamp}.csv`, lines.join("\n"));
  };

  const handleExportPDF = async () => {
    const doc = new jsPDF({ unit: "pt", format: "a4" }) as AutoTableDoc;

    // Header
    doc.setFontSize(18);
    doc.text("Business Report", 40, 50);
    doc.setFontSize(11);
    doc.text(`Generated on: ${dateStamp}`, 40, 70);

    // Portfolio Overview
    autoTable(doc, {
      startY: 90,
      head: [["Portfolio Overview", "Value"]],
      body: Object.entries(portfolioOverview || {}).map(([k, v]) => [k, String(v)]),
      styles: { fontSize: 10 },
      headStyles: { fillColor: [33, 150, 243] },
    });

    // Chart snapshot (ถ้ามี)
    const chartEl = document.getElementById("forecastChart");
    let yAfterImage: number | null = null;

    if (chartEl) {
      const canvas = await html2canvas(chartEl as HTMLElement, { scale: 2, useCORS: true });
      const img = canvas.toDataURL("image/png");

      const pageWidth = doc.internal.pageSize.getWidth();
      const margin = 40;
      const maxWidth = pageWidth - margin * 2;
      const imgProps = (doc as any).getImageProperties(img);
      const pdfWidth = Math.min(maxWidth, 520);
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

      doc.addPage();
      doc.setFontSize(14);
      doc.text("Financial Forecast Analysis", margin, 50);
      doc.addImage(img, "PNG", margin, 70, pdfWidth, pdfHeight);

      // นับ historical vs forecast อย่างถูกต้อง
      const historicalCount = normRows.filter((r) => r.actual !== "").length;
      const forecastCount = normRows.length - historicalCount;

      doc.setFontSize(10);
      yAfterImage = 70 + pdfHeight;
      doc.text(
        `Data points: ${historicalCount} historical, ${forecastCount} forecast`,
        margin,
        yAfterImage + 10
      );
    }

    // Forecast table — column แบบ dynamic (มี CI เมื่อมีข้อมูล)
    autoTable(doc, {
      startY: (yAfterImage ? yAfterImage + 20 : (doc.lastAutoTable?.finalY ?? 140) + 20),
      head: [hasCI ? ["Date", "Forecast", "Lower", "Upper", "Actual"] : ["Date", "Forecast", "Actual"]],
      body: normRows.map((r) =>
        hasCI ? [r.date, r.forecast, r.lower ?? "", r.upper ?? "", r.actual] : [r.date, r.forecast, r.actual]
      ),
      styles: { fontSize: 10 },
    });

    // Key Metrics
    doc.addPage();
    doc.setFontSize(14);
    doc.text("Key Metrics", 40, 50);
    autoTable(doc, {
      startY: 60,
      head: [["Metric", "Value"]],
      body: Object.entries(keyMetrics || {}).map(([k, v]) => [k, String(v)]),
      styles: { fontSize: 10 },
    });

    // AI Insights
    doc.addPage();
    doc.setFontSize(14);
    doc.text("AI Insights", 40, 50);
    doc.setFontSize(11);
    const insight = aiInsights || "No insights";
    const wrapped = doc.splitTextToSize(insight, 520);
    doc.text(wrapped, 40, 70);

    doc.save(`report_${dateStamp}.pdf`);
  };

  // ปุ่ม 2 อันในการ์ด Reports & Export
  return (
    <div className="space-y-3">
      {/* PDF Export */}
      <button
        onClick={canExportPDF ? handleExportPDF : undefined}
        disabled={!canExportPDF}
        className={`w-full flex items-center justify-between p-2 lg:p-3 rounded-lg transition text-left border
          ${canExportPDF
            ? "bg-gradient-to-r from-blue-50 to-cyan-50 hover:from-blue-100 hover:to-cyan-100 border-blue-200"
            : "bg-gray-50 border-gray-200 opacity-60 cursor-not-allowed"}`}
      >
        <div>
          <p className={`text-xs lg:text-sm font-medium ${canExportPDF ? "text-blue-800" : "text-gray-700"}`}>
            PDF Export
          </p>
          <p className={`${canExportPDF ? "text-blue-600" : "text-gray-500"} text-xs`}>
            Full report with chart and insights
          </p>
        </div>
        <span className={`${canExportPDF ? "text-blue-400" : "text-gray-400"} text-sm`}>⇩</span>
      </button>

      {/* CSV Export */}
      <button
        onClick={handleExportCSV}
        className="w-full flex items-center justify-between p-2 lg:p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition text-left border border-gray-200"
      >
        <div>
          <p className="text-xs lg:text-sm font-medium text-gray-800">CSV Export</p>
          <p className="text-xs text-gray-500">Raw data including metrics</p>
        </div>
        <span className="text-gray-400 text-sm">⇩</span>
      </button>
    </div>
  );
};

export default ReportsExport;
