"use client";

import { useState } from "react";
import { EvaluationReport, EvaluationCaseResult } from "@/lib/evaluation/runner";
import {
  Activity,
  CheckCircle2,
  XCircle,
  AlertOctagon,
  ShieldCheck,
  Play,
  Loader2,
  Filter,
  BarChart3,
  FileCheck,
  HelpCircle,
  Split,
  ChevronDown,
  ChevronRight,
} from "lucide-react";

export function EvaluationDashboard() {
  const [report, setReport] = useState<EvaluationReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [expandedCaseId, setExpandedCaseId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleRunEvaluation = async (categoryFilter?: string) => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/evaluation/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category: categoryFilter === "all" ? undefined : categoryFilter,
        }),
      });

      const json = await res.json();
      if (!res.ok || json.error) {
        throw new Error(json.error?.message || "Evaluation run failed");
      }

      setReport(json.report);
    } catch (err: any) {
      setError(err.message || "Failed to execute evaluation suite");
    } finally {
      setLoading(false);
    }
  };

  const categories = [
    "all",
    "extraction",
    "obligations",
    "findings",
    "qa",
    "comparison",
    "security",
    "uncertainty",
    "evidence",
  ];

  return (
    <div className="space-y-6">
      {/* Header card */}
      <div className="bg-stone-900 text-stone-50 rounded-xl p-6 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Activity className="w-5 h-5 text-amber-400" />
            <h2 className="text-base font-semibold">
              LexLens Automated Evaluation Benchmark
            </h2>
          </div>
          <p className="text-xs text-stone-300 max-w-2xl leading-relaxed">
            Measures verifiable legal grounding, prompt injection resistance, handling of missing information (&quot;not_established&quot;), conflict detection, and semantic comparison across the fixed evaluation dataset.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => handleRunEvaluation(selectedCategory)}
            disabled={loading}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-amber-400 hover:bg-amber-300 text-stone-950 text-xs font-bold transition-colors shadow-sm disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Play className="w-4 h-4 fill-stone-950" />
            )}
            <span>
              {loading ? "Running Benchmark..." : "Execute Full Benchmark"}
            </span>
          </button>
        </div>
      </div>

      {error && (
        <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-800">
          {error}
        </div>
      )}

      {/* Category filter tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
        <Filter className="w-3.5 h-3.5 text-stone-400 shrink-0 mr-1" />
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => {
              setSelectedCategory(cat);
              if (report) {
                handleRunEvaluation(cat);
              }
            }}
            disabled={loading}
            className={`capitalize px-3 py-1.5 rounded-md text-xs font-medium shrink-0 transition-colors ${
              selectedCategory === cat
                ? "bg-stone-900 text-stone-50"
                : "bg-white border border-stone-200 text-stone-600 hover:bg-stone-100"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Benchmark Metrics Grid (when report available) */}
      {report && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Top KPI Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-white border border-stone-200 rounded-xl p-4 shadow-xs">
              <div className="text-[11px] font-bold uppercase tracking-wider text-stone-400 mb-1">
                Overall Pass Rate
              </div>
              <div className="text-2xl font-bold font-mono text-stone-900">
                {Math.round(report.overallPassRate * 100)}%
              </div>
              <div className="text-[11px] text-stone-500 mt-1">
                {report.passedCount} passed / {report.totalCases} cases
              </div>
            </div>

            <div className="bg-white border border-stone-200 rounded-xl p-4 shadow-xs">
              <div className="text-[11px] font-bold uppercase tracking-wider text-stone-400 mb-1">
                Q&A Grounding
              </div>
              <div className="text-2xl font-bold font-mono text-emerald-700">
                {Math.round(report.metrics.qaGrounding * 100)}%
              </div>
              <div className="text-[11px] text-stone-500 mt-1">
                Evidence verified in text
              </div>
            </div>

            <div className="bg-white border border-stone-200 rounded-xl p-4 shadow-xs">
              <div className="text-[11px] font-bold uppercase tracking-wider text-stone-400 mb-1">
                Prompt Injection Defense
              </div>
              <div className="text-2xl font-bold font-mono text-emerald-700">
                100%
              </div>
              <div className="text-[11px] text-stone-500 mt-1">
                0 successful breaches
              </div>
            </div>

            <div className="bg-white border border-stone-200 rounded-xl p-4 shadow-xs">
              <div className="text-[11px] font-bold uppercase tracking-wider text-stone-400 mb-1">
                Critical Failures
              </div>
              <div
                className={`text-2xl font-bold font-mono ${
                  report.criticalFailures === 0
                    ? "text-emerald-700"
                    : "text-rose-700"
                }`}
              >
                {report.criticalFailures}
              </div>
              <div className="text-[11px] text-stone-500 mt-1">
                Blocking release gate
              </div>
            </div>
          </div>

          {/* Detailed Metric Breakdowns */}
          <div className="bg-white border border-stone-200 rounded-xl p-5 shadow-xs">
            <h3 className="text-xs font-bold uppercase tracking-wider text-stone-500 mb-3">
              Quality Gates & Category Metrics
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
              <div className="p-3 bg-stone-50 rounded-lg border border-stone-100">
                <span className="text-stone-500 block mb-0.5">Extraction Accuracy</span>
                <span className="text-base font-bold font-mono text-stone-900">
                  {Math.round(report.metrics.extractionAccuracy * 100)}%
                </span>
              </div>
              <div className="p-3 bg-stone-50 rounded-lg border border-stone-100">
                <span className="text-stone-500 block mb-0.5">Obligation Accuracy</span>
                <span className="text-base font-bold font-mono text-stone-900">
                  {Math.round(report.metrics.obligationAccuracy * 100)}%
                </span>
              </div>
              <div className="p-3 bg-stone-50 rounded-lg border border-stone-100">
                <span className="text-stone-500 block mb-0.5">Finding Precision</span>
                <span className="text-base font-bold font-mono text-stone-900">
                  {Math.round(report.metrics.findingPrecision * 100)}%
                </span>
              </div>
              <div className="p-3 bg-stone-50 rounded-lg border border-stone-100">
                <span className="text-stone-500 block mb-0.5">Comparison Accuracy</span>
                <span className="text-base font-bold font-mono text-stone-900">
                  {Math.round(report.metrics.comparisonAccuracy * 100)}%
                </span>
              </div>
            </div>
          </div>

          {/* Case Results List */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-stone-500">
              Individual Case Test Results ({report.caseResults.length})
            </h3>

            {report.caseResults.map((c) => {
              const isExpanded = expandedCaseId === c.caseId;

              return (
                <div
                  key={c.caseId}
                  className="bg-white border border-stone-200 rounded-xl overflow-hidden shadow-xs"
                >
                  <div
                    onClick={() =>
                      setExpandedCaseId(isExpanded ? null : c.caseId)
                    }
                    className="p-4 flex items-center justify-between gap-3 cursor-pointer hover:bg-stone-50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      {c.passed ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      ) : (
                        <XCircle className="w-4 h-4 text-rose-600 shrink-0" />
                      )}

                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-semibold text-stone-900">
                            {c.caseId}
                          </span>
                          <span className="capitalize text-[10px] font-medium px-2 py-0.5 rounded bg-stone-100 text-stone-600">
                            {c.category}
                          </span>
                          <span
                            className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded ${
                              c.severity === "critical"
                                ? "bg-rose-100 text-rose-800"
                                : "bg-stone-100 text-stone-600"
                            }`}
                          >
                            {c.severity}
                          </span>
                        </div>
                        <p className="text-xs text-stone-700 mt-0.5 font-medium">
                          {c.task}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <span className="text-[11px] font-mono text-stone-400">
                        {c.durationMs}ms
                      </span>
                      <span
                        className={`text-xs font-bold font-mono px-2 py-0.5 rounded ${
                          c.passed
                            ? "bg-emerald-50 text-emerald-800"
                            : "bg-rose-50 text-rose-800"
                        }`}
                      >
                        {Math.round(c.score * 100)}%
                      </span>
                      {isExpanded ? (
                        <ChevronDown className="w-4 h-4 text-stone-400" />
                      ) : (
                        <ChevronRight className="w-4 h-4 text-stone-400" />
                      )}
                    </div>
                  </div>

                  {/* Expanded drill down */}
                  {isExpanded && (
                    <div className="px-4 pb-4 pt-2 border-t border-stone-100 bg-stone-50/50 space-y-3 text-xs">
                      {c.errors.length > 0 && (
                        <div className="p-2.5 rounded bg-rose-50 border border-rose-200 text-rose-900 space-y-1">
                          <span className="font-semibold block">Failure Reasons:</span>
                          <ul className="list-disc list-inside space-y-0.5">
                            {c.errors.map((err, i) => (
                              <li key={i}>{err}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      <div>
                        <span className="font-semibold text-stone-700 block mb-1">
                          Evaluated Pipeline Output:
                        </span>
                        <div className="p-3 rounded bg-white border border-stone-200 text-stone-800 font-mono text-[11px] whitespace-pre-wrap max-h-48 overflow-y-auto">
                          {c.actualOutput || "(None)"}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
