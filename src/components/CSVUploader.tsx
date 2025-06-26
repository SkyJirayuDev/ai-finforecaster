"use client";

import { useState } from "react";
import Papa from "papaparse";
import { FaFileAlt, FaUpload, FaChartLine } from "react-icons/fa";

const allowedCategories = ["sales", "rent", "salary", "tax", "misc"];

export interface CSVRow {
  date: string;
  amount: number;
  description?: string;
  category?: string;
  id?: number;
  [key: string]: any;
}

interface ValidationResult {
  validRows: CSVRow[];
  invalidRows: { row: any; errors: string[]; index: number }[];
}

function validateRows(rows: any[]): ValidationResult {
  const validRows: CSVRow[] = [];
  const invalidRows: { row: any; errors: string[]; index: number }[] = [];

  rows.forEach((row, index) => {
    const errors: string[] = [];

    if (
      !row.date ||
      !/^\d{4}-\d{2}-\d{2}$/.test(row.date) ||
      isNaN(Date.parse(row.date))
    ) {
      errors.push("Invalid or missing date (YYYY-MM-DD)");
    }
    if (!row.amount || isNaN(parseFloat(row.amount))) {
      errors.push("Invalid or missing amount");
    }
    if (row.description && row.description.length > 120) {
      errors.push("Description too long (max 120 chars)");
    }
    if (
      row.category &&
      !allowedCategories.includes(row.category.toLowerCase())
    ) {
      errors.push(`Invalid category: ${row.category}`);
    }
    if (row.id && (!Number.isInteger(Number(row.id)) || Number(row.id) <= 0)) {
      errors.push("ID must be a positive integer");
    }

    if (errors.length === 0) {
      validRows.push({
        date: row.date,
        amount: parseFloat(row.amount),
        description: row.description || "",
        category: row.category?.toLowerCase() || undefined,
        id: row.id ? parseInt(row.id) : undefined,
      });
    } else {
      invalidRows.push({ row, errors, index });
    }
  });

  return { validRows, invalidRows };
}

export default function CSVUploader({
  forecastResult,
  setForecastResult,
}: {
  forecastResult: any[] | null;
  setForecastResult: React.Dispatch<React.SetStateAction<any[] | null>>;
}) {
  const [validRows, setValidRows] = useState<CSVRow[]>([]);
  const [invalidRows, setInvalidRows] = useState<ValidationResult["invalidRows"]>(
    []
  );
  const [fileName, setFileName] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setFileName(file.name);

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const rows = results.data as any[];
        const { validRows, invalidRows } = validateRows(rows);
        setValidRows(validRows);
        setInvalidRows(invalidRows);
        setForecastResult(null);
        setError("");
      },
    });
  };

  const handleForecast = async () => {
    setLoading(true);
    setError("");
    setForecastResult(null);

    try {
      const response = await fetch("http://localhost:8000/forecast", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
          validRows.map(({ date, amount }) => ({ date, amount }))
        ),
      });

      if (!response.ok) {
        const err = await response.json();
        setError(err.error || "Unknown error");
        return;
      }

      const data = await response.json();
      setForecastResult(data);
    } catch (err: any) {
      setError(err.message || "Failed to fetch forecast");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white/95 backdrop-blur-lg rounded-2xl p-4 lg:p-6 shadow-xl border border-white/20">
      <h3 className="text-base lg:text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
        <FaFileAlt className="text-purple-600" /> Data Management
      </h3>

      <div className="space-y-4">
        <label className="block border-2 border-dashed border-gray-300 rounded-xl p-4 lg:p-6 cursor-pointer hover:border-blue-400 hover:bg-blue-50/50 transition group">
          <div className="text-center">
            <FaUpload className="mx-auto text-2xl lg:text-3xl text-gray-400 group-hover:text-blue-500 mb-2 lg:mb-3 transition" />
            <p className="text-xs lg:text-sm font-medium text-gray-700 group-hover:text-blue-700">
              Upload Financial Data
            </p>
            <p className="text-xs text-gray-500 mt-1">CSV format only</p>
          </div>
          <input
            type="file"
            accept=".csv"
            onChange={handleFileUpload}
            className="hidden"
          />
        </label>

        <button
          onClick={handleForecast}
          disabled={validRows.length === 0 || loading}
          className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl py-2.5 lg:py-3 px-4 text-sm lg:text-base font-semibold hover:from-blue-700 hover:to-cyan-700 transition shadow-lg flex items-center justify-center gap-2 disabled:opacity-50"
        >
          <FaChartLine />
          {loading ? "Generating..." : "Generate Forecast"}
        </button>

        {validRows.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold mb-1 text-green-700">
              ✅ Valid Rows ({validRows.length})
            </h4>
            <pre className="text-xs bg-green-50 p-3 rounded max-h-40 overflow-y-auto whitespace-pre-wrap">
              {JSON.stringify(validRows.slice(0, 5), null, 2)}
            </pre>
          </div>
        )}

        {invalidRows.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold mb-1 text-red-700">
              ❌ Invalid Rows ({invalidRows.length})
            </h4>
            <div className="text-xs bg-red-50 p-3 rounded max-h-40 overflow-y-auto whitespace-pre-wrap space-y-2">
              {invalidRows.slice(0, 5).map((r, i) => (
                <div key={i}>
                  <div className="font-medium text-red-800">Row #{r.index + 1}:</div>
                  <div className="text-red-700">{r.errors.join(", ")}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {forecastResult && (
          <div className="mt-4">
            <h4 className="text-sm font-semibold mb-1 text-blue-700">
              📈 Forecast Result (next 30 days)
            </h4>
            <pre className="text-xs bg-blue-50 p-3 rounded max-h-60 overflow-y-auto whitespace-pre-wrap">
              {JSON.stringify(forecastResult.slice(0, 5), null, 2)}
            </pre>
          </div>
        )}

        {error && (
          <p className="text-sm text-red-600 font-medium mt-2">⚠️ {error}</p>
        )}
      </div>
    </div>
  );
}
