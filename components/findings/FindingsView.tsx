"use client";

import { Finding, Evidence } from "@/lib/types";
import { AlertTriangle, HelpCircle, Split, FileX, Bookmark, ExternalLink } from "lucide-react";

interface FindingsViewProps {
  findings: Finding[];
  evidenceMap: Record<string, Evidence>;
  onSelectEvidence: (ev: Evidence, interpretation?: string, title?: string) => void;
}

export function FindingsView({ findings, evidenceMap, onSelectEvidence }: FindingsViewProps) {
  if (findings.length === 0) {
    return (
      <div className="p-8 text-center bg-stone-50 rounded-xl border border-stone-200 text-stone-500 text-xs">
        No potential inconsistencies, ambiguities, or missing information were identified in this document.
        <p className="text-[11px] text-stone-400 mt-1">
          (Note: Absence of identified findings does not guarantee that no legal risk exists.)
        </p>
      </div>
    );
  }

  const getSeverityBadge = (sev: Finding["severity"]) => {
    switch (sev) {
      case "high":
        return "bg-rose-50 text-rose-800 border-rose-200";
      case "medium":
        return "bg-amber-50 text-amber-800 border-amber-200";
      default:
        return "bg-stone-100 text-stone-700 border-stone-200";
    }
  };

  const getTypeIcon = (type: Finding["type"]) => {
    switch (type) {
      case "inconsistency":
        return <Split className="w-4 h-4 text-rose-600" />;
      case "ambiguity":
        return <HelpCircle className="w-4 h-4 text-amber-600" />;
      case "missing_information":
        return <FileX className="w-4 h-4 text-blue-600" />;
      default:
        return <AlertTriangle className="w-4 h-4 text-stone-600" />;
    }
  };

  return (
    <div className="space-y-4">
      <div className="bg-amber-50/70 border border-amber-200/80 rounded-lg p-3 text-xs text-amber-950 flex items-start gap-2.5">
        <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
        <div>
          <span className="font-semibold">Review Findings:</span> These items indicate apparent contradictions, missing schedules, or ambiguities detected in the text. Inspect the supporting clauses to evaluate before signing or discussing with counsel.
        </div>
      </div>

      <div className="space-y-4">
        {findings.map((f) => (
          <div
            key={f.id}
            className="bg-white border border-stone-200 rounded-xl p-5 shadow-xs hover:border-stone-300 transition-all space-y-3"
          >
            {/* Header */}
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-stone-100">
                  {getTypeIcon(f.type)}
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-stone-900 leading-snug">
                    {f.title}
                  </h4>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="capitalize text-[11px] font-medium text-stone-500">
                      {f.type.replace("_", " ")}
                    </span>
                    <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded border ${getSeverityBadge(f.severity)}`}>
                      {f.severity} Priority
                    </span>
                  </div>
                </div>
              </div>

              <span className="text-[11px] font-mono text-stone-400">
                {Math.round(f.confidence * 100)}% detection conf
              </span>
            </div>

            {/* Description */}
            <p className="text-xs text-stone-700 leading-relaxed">
              {f.description}
            </p>

            {/* Uncertainty statement if any */}
            {f.uncertainty && (
              <div className="p-2.5 rounded-md bg-stone-50 border border-stone-200/60 text-[11px] text-stone-600 italic">
                <span className="font-medium text-stone-700 not-italic">Note: </span>
                {f.uncertainty}
              </div>
            )}

            {/* Supporting Evidence Excerpts */}
            <div className="pt-3 border-t border-stone-100 space-y-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-stone-500 block">
                Supporting Evidence Excerpts ({f.evidenceIds.length})
              </span>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                {f.evidenceIds.map((evId, idx) => {
                  const ev = evidenceMap[evId];
                  if (!ev) return null;

                  return (
                    <div
                      key={evId}
                      className="p-3 rounded-lg bg-stone-50 border border-stone-200 text-xs flex flex-col justify-between hover:bg-stone-100/80 transition-colors"
                    >
                      <div className="mb-2">
                        <div className="flex items-center justify-between text-[10px] text-stone-400 font-mono mb-1">
                          <span>{ev.sectionLabel || `Citation ${idx + 1}`}</span>
                          <span>Page {ev.pageNumber}</span>
                        </div>
                        <p className="font-serif text-stone-800 italic line-clamp-3">
                          &ldquo;{ev.sourceText}&rdquo;
                        </p>
                      </div>

                      <button
                        onClick={() =>
                          onSelectEvidence(
                            ev,
                            `Supporting finding: ${f.title} (${f.description})`,
                            `Evidence: ${ev.sectionLabel || f.title}`
                          )
                        }
                        className="self-start inline-flex items-center gap-1 text-[11px] font-medium text-stone-700 hover:text-amber-800 transition-colors mt-1"
                      >
                        <Bookmark className="w-3.5 h-3.5 text-amber-600" />
                        <span>Inspect Source</span>
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
