"use client";

import { useState } from "react";
import { Obligation, Evidence } from "@/lib/types";
import { User, Clock, AlertCircle, Bookmark, CheckCircle, ChevronRight } from "lucide-react";

interface ObligationExplorerProps {
  obligations: Obligation[];
  evidenceMap: Record<string, Evidence>;
  onSelectEvidence: (ev: Evidence, interpretation?: string, title?: string) => void;
}

export function ObligationExplorer({ obligations, evidenceMap, onSelectEvidence }: ObligationExplorerProps) {
  const [partyFilter, setPartyFilter] = useState<string>("all");

  const parties = ["all", ...Array.from(new Set(obligations.map((o) => o.partyName).filter(Boolean)))];

  const filtered = obligations.filter(
    (o) => partyFilter === "all" || o.partyName === partyFilter
  );

  return (
    <div className="space-y-4">
      {/* Party Filter Pills */}
      <div className="flex items-center gap-2 pb-1 text-xs">
        <span className="text-stone-400 font-medium">Filter by party:</span>
        {parties.map((p) => (
          <button
            key={p as string}
            onClick={() => setPartyFilter(p as string)}
            className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
              partyFilter === p
                ? "bg-stone-900 text-stone-50"
                : "bg-stone-100 text-stone-600 hover:bg-stone-200"
            }`}
          >
            {p === "all" ? "All Parties" : p}
          </button>
        ))}
      </div>

      {/* Obligations List */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="p-8 text-center bg-stone-50 rounded-xl border border-stone-200 text-stone-500 text-xs">
            No obligations recorded for this filter.
          </div>
        ) : (
          filtered.map((obl) => {
            const firstEvId = obl.evidenceIds[0];
            const evidence = firstEvId ? evidenceMap[firstEvId] : null;

            return (
              <div
                key={obl.id}
                className="bg-white border border-stone-200 rounded-xl p-5 shadow-xs hover:border-stone-300 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="space-y-2 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-stone-900 bg-stone-100 px-2 py-0.5 rounded">
                      <User className="w-3.5 h-3.5 text-stone-500" />
                      {obl.partyName || "Party"}
                    </span>

                    {obl.deadline && (
                      <span className="inline-flex items-center gap-1 text-xs text-amber-900 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded font-mono font-medium">
                        <Clock className="w-3.5 h-3.5 text-amber-600" />
                        {obl.deadline}
                      </span>
                    )}

                    {obl.condition && (
                      <span className="text-[11px] bg-blue-50 text-blue-800 border border-blue-200 px-2 py-0.5 rounded font-medium">
                        Condition: {obl.condition}
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-stone-800 font-medium leading-relaxed">
                    {obl.action}
                  </p>

                  {obl.consequence && (
                    <p className="text-[11px] text-stone-500 italic">
                      Consequence if breached: {obl.consequence}
                    </p>
                  )}
                </div>

                {evidence && (
                  <div className="shrink-0 flex items-center md:flex-col md:items-end justify-between border-t md:border-t-0 pt-2 md:pt-0 border-stone-100">
                    <span className="text-[11px] text-stone-400 mb-1">
                      {evidence.sectionLabel || "Section"}
                    </span>
                    <button
                      onClick={() =>
                        onSelectEvidence(
                          evidence,
                          `Obligation for ${obl.partyName || "Party"}: ${obl.action}${
                            obl.condition ? ` (Condition: ${obl.condition})` : ""
                          }`,
                          `Evidence: Obligation`
                        )
                      }
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-medium transition-colors"
                    >
                      <Bookmark className="w-3.5 h-3.5 text-amber-600" />
                      <span>Evidence</span>
                      <ChevronRight className="w-3 h-3 text-stone-400" />
                    </button>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
