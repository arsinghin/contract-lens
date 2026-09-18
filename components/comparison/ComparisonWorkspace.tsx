"use client";

import { useState } from "react";
import { DocumentRecord, Comparison, Difference, Evidence } from "@/lib/types";
import { GitCompare, AlertTriangle, CheckCircle2, Bookmark, ArrowRight, Loader2, Sparkles } from "lucide-react";

interface ComparisonWorkspaceProps {
  documents: DocumentRecord[];
  initialDocAId?: string;
  initialDocBId?: string;
  onSelectEvidence: (ev: Evidence, interpretation?: string, title?: string) => void;
}

export function ComparisonWorkspace({
  documents,
  initialDocAId,
  initialDocBId,
  onSelectEvidence,
}: ComparisonWorkspaceProps) {
  const [docAId, setDocAId] = useState(initialDocAId || (documents[0]?.id || ""));
  const [docBId, setDocBId] = useState(initialDocBId || (documents[1]?.id || ""));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [comparison, setComparison] = useState<Comparison | null>(null);

  const handleCompare = async () => {
    if (!docAId || !docBId || docAId === docBId) {
      setError("Please select two distinct documents to compare");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/documents/${docAId}/compare`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetDocumentId: docBId }),
      });

      const json = await res.json();
      if (!res.ok || json.error) {
        throw new Error(json.error?.message || "Failed to compare documents");
      }

      setComparison(json.comparison);
    } catch (err: any) {
      setError(err.message || "Failed to perform comparison");
    } finally {
      setLoading(false);
    }
  };

  const docA = documents.find((d) => d.id === docAId);
  const docB = documents.find((d) => d.id === docBId);

  return (
    <div className="space-y-6">
      {/* Selector Card */}
      <div className="bg-white border border-stone-200 rounded-xl p-6 shadow-xs space-y-4">
        <div className="flex items-center gap-2">
          <GitCompare className="w-5 h-5 text-amber-500" />
          <h3 className="font-semibold text-sm text-stone-900">
            Compare Legal Documents
          </h3>
        </div>
        <p className="text-xs text-stone-500">
          Select two agreements or versions. LexLens aligns clauses and differentiates substantive material changes (such as increased notice periods or new restrictive covenants) from mere phrasing tweaks.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              Document A (Original / Baseline)
            </label>
            <select
              value={docAId}
              onChange={(e) => setDocAId(e.target.value)}
              className="w-full text-xs p-2.5 bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-stone-400"
            >
              {documents.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name} ({d.documentType})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              Document B (Revised / Comparator)
            </label>
            <select
              value={docBId}
              onChange={(e) => setDocBId(e.target.value)}
              className="w-full text-xs p-2.5 bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-stone-400"
            >
              {documents.map((d) => (
                <option key={d.id} value={d.id} disabled={d.id === docAId}>
                  {d.name} ({d.documentType})
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex items-center justify-between pt-2">
          <div className="text-xs text-stone-400">
            Tip: Try comparing Employment_Agreement_v1 vs v2 to observe notice & covenant changes.
          </div>

          <button
            onClick={handleCompare}
            disabled={loading || !docAId || !docBId || docAId === docBId}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-stone-900 text-stone-50 hover:bg-stone-800 disabled:opacity-50 text-xs font-medium transition-colors"
          >
            {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <GitCompare className="w-3.5 h-3.5 text-amber-400" />}
            <span>Compare Now</span>
          </button>
        </div>

        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-800">
            {error}
          </div>
        )}
      </div>

      {/* Comparison Results */}
      {comparison && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold uppercase tracking-wider text-stone-500">
              Identified Differences ({comparison.differences.length})
            </h4>
            <div className="flex items-center gap-2 text-xs">
              <span className="inline-flex items-center gap-1 text-rose-800 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded font-medium">
                {comparison.differences.filter((d) => d.material).length} Material Changes
              </span>
              <span className="inline-flex items-center gap-1 text-stone-600 bg-stone-100 border border-stone-200 px-2 py-0.5 rounded font-medium">
                {comparison.differences.filter((d) => !d.material).length} Wording Only
              </span>
            </div>
          </div>

          <div className="space-y-4">
            {comparison.differences.map((diff) => (
              <div
                key={diff.id}
                className="bg-white border border-stone-200 rounded-xl p-5 shadow-xs hover:border-stone-300 transition-all space-y-3"
              >
                {/* Header */}
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span
                        className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded border ${
                          diff.material
                            ? "bg-rose-50 text-rose-800 border-rose-200"
                            : "bg-stone-100 text-stone-700 border-stone-200"
                        }`}
                      >
                        {diff.material ? "Substantive Material Difference" : "Stylistic / Wording Difference"}
                      </span>
                      <span className="text-xs font-medium text-stone-500 capitalize">
                        {diff.category.replace("_", " ")}
                      </span>
                    </div>
                    <h4 className="text-sm font-semibold text-stone-900">
                      {diff.topic}
                    </h4>
                  </div>
                </div>

                {/* Explanation */}
                <p className="text-xs text-stone-700 leading-relaxed">
                  {diff.explanation}
                </p>

                {/* Side-by-side Evidence Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2 border-t border-stone-100">
                  {/* Document A Excerpt */}
                  <div className="p-3 rounded-lg bg-stone-50 border border-stone-200 text-xs flex flex-col justify-between">
                    <div>
                      <div className="text-[11px] font-semibold text-stone-600 mb-1">
                        Document A ({docA?.name || "Original"})
                      </div>
                      <p className="font-serif text-stone-800 italic">
                        {diff.documentAText ? `"${diff.documentAText}"` : "(Not present in Document A)"}
                      </p>
                    </div>

                    {diff.evidenceAIds && diff.evidenceAIds[0] && docA?.evidence[diff.evidenceAIds[0]] && (
                      <button
                        onClick={() =>
                          onSelectEvidence(
                            docA.evidence[diff.evidenceAIds[0]],
                            `Document A version of ${diff.topic}`,
                            `Evidence: Document A`
                          )
                        }
                        className="self-start inline-flex items-center gap-1 text-[11px] font-medium text-stone-700 hover:text-amber-800 transition-colors mt-2"
                      >
                        <Bookmark className="w-3 h-3 text-amber-600" />
                        <span>Inspect Doc A Source</span>
                      </button>
                    )}
                  </div>

                  {/* Document B Excerpt */}
                  <div className="p-3 rounded-lg bg-stone-50 border border-stone-200 text-xs flex flex-col justify-between">
                    <div>
                      <div className="text-[11px] font-semibold text-stone-600 mb-1">
                        Document B ({docB?.name || "Revised"})
                      </div>
                      <p className="font-serif text-stone-800 italic">
                        {diff.documentBText ? `"${diff.documentBText}"` : "(Not present in Document B)"}
                      </p>
                    </div>

                    {diff.evidenceBIds && diff.evidenceBIds[0] && docB?.evidence[diff.evidenceBIds[0]] && (
                      <button
                        onClick={() =>
                          onSelectEvidence(
                            docB.evidence[diff.evidenceBIds[0]],
                            `Document B version of ${diff.topic}`,
                            `Evidence: Document B`
                          )
                        }
                        className="self-start inline-flex items-center gap-1 text-[11px] font-medium text-stone-700 hover:text-amber-800 transition-colors mt-2"
                      >
                        <Bookmark className="w-3 h-3 text-amber-600" />
                        <span>Inspect Doc B Source</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
