"use client";

import { useState } from "react";
import { Clause, Evidence } from "@/lib/types";
import { Search, Filter, Bookmark, CheckCircle2, ChevronRight } from "lucide-react";

interface ClauseExplorerProps {
  clauses: Clause[];
  evidenceMap: Record<string, Evidence>;
  onSelectEvidence: (ev: Evidence, interpretation?: string, title?: string) => void;
}

export function ClauseExplorer({ clauses, evidenceMap, onSelectEvidence }: ClauseExplorerProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  const categories = ["all", ...Array.from(new Set(clauses.map((c) => c.category)))];

  const filteredClauses = clauses.filter((c) => {
    const matchesCat = selectedCategory === "all" || c.category === selectedCategory;
    const matchesSearch =
      searchQuery === "" ||
      c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.sectionNumber && c.sectionNumber.includes(searchQuery));
    return matchesCat && matchesSearch;
  });

  return (
    <div className="space-y-4">
      {/* Search & Category Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between pb-2">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Filter clauses by title, summary, or section..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs bg-white border border-stone-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-stone-400"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full text-xs">
          <Filter className="w-3.5 h-3.5 text-stone-400 shrink-0 mr-1" />
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`capitalize px-2.5 py-1 rounded-md text-xs font-medium shrink-0 transition-colors ${
                selectedCategory === cat
                  ? "bg-stone-900 text-stone-50"
                  : "bg-stone-100 text-stone-600 hover:bg-stone-200"
              }`}
            >
              {cat.replace("_", " ")}
            </button>
          ))}
        </div>
      </div>

      {/* Clause Cards Grid */}
      {filteredClauses.length === 0 ? (
        <div className="p-8 text-center bg-stone-50 rounded-xl border border-stone-200 text-stone-500 text-xs">
          No clauses match your filter criteria.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredClauses.map((clause) => {
            const firstEvId = clause.evidenceIds[0];
            const primaryEvidence = firstEvId ? evidenceMap[firstEvId] : null;

            return (
              <div
                key={clause.id}
                className="bg-white border border-stone-200 rounded-xl p-5 shadow-xs hover:border-stone-300 transition-shadow flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-semibold text-stone-500">
                        {clause.sectionNumber ? `§ ${clause.sectionNumber}` : "Clause"}
                      </span>
                      <span className="capitalize text-[11px] font-medium px-2 py-0.5 rounded-md bg-stone-100 text-stone-700 border border-stone-200/60">
                        {clause.category.replace("_", " ")}
                      </span>
                    </div>
                    <span className="text-[11px] text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded font-mono">
                      {Math.round(clause.confidence * 100)}% conf
                    </span>
                  </div>

                  <h4 className="text-sm font-semibold text-stone-900 mb-2 leading-snug">
                    {clause.title}
                  </h4>

                  <p className="text-xs text-stone-600 leading-relaxed mb-3">
                    {clause.summary}
                  </p>

                  {clause.interpretation && (
                    <div className="p-2.5 rounded bg-amber-50/50 border border-amber-200/50 text-[11px] text-amber-900 leading-relaxed mb-3">
                      <span className="font-semibold text-amber-950">Context: </span>
                      {clause.interpretation}
                    </div>
                  )}
                </div>

                {/* Evidence footer */}
                <div className="pt-3 border-t border-stone-100 flex items-center justify-between mt-2">
                  <div className="text-[11px] text-stone-400">
                    {clause.evidenceIds.length} source citation{clause.evidenceIds.length > 1 ? "s" : ""}
                  </div>

                  {primaryEvidence && (
                    <button
                      onClick={() =>
                        onSelectEvidence(
                          primaryEvidence,
                          clause.summary,
                          `Evidence: ${clause.title}`
                        )
                      }
                      className="inline-flex items-center gap-1 text-xs font-medium text-stone-800 hover:text-amber-700 transition-colors py-1 px-2 rounded hover:bg-stone-50"
                    >
                      <Bookmark className="w-3.5 h-3.5 text-amber-600" />
                      <span>View Evidence</span>
                      <ChevronRight className="w-3.5 h-3.5 text-stone-400" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
