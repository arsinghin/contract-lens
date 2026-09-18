"use client";

import { TimelineEvent, Evidence } from "@/lib/types";
import { Calendar, Clock, Bookmark, ArrowRight } from "lucide-react";

interface TimelineViewProps {
  events: TimelineEvent[];
  evidenceMap: Record<string, Evidence>;
  onSelectEvidence: (ev: Evidence, interpretation?: string, title?: string) => void;
}

export function TimelineView({ events, evidenceMap, onSelectEvidence }: TimelineViewProps) {
  if (events.length === 0) {
    return (
      <div className="p-8 text-center bg-stone-50 rounded-xl border border-stone-200 text-stone-500 text-xs">
        No explicit dates or timing provisions were identified in the document text.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-stone-200">
        {events.map((evt, idx) => {
          const firstEvId = evt.evidenceIds[0];
          const evidence = firstEvId ? evidenceMap[firstEvId] : null;

          return (
            <div key={evt.id} className="relative group">
              {/* Timeline Dot */}
              <div className="absolute -left-6 top-1.5 w-3 h-3 rounded-full bg-stone-900 border-2 border-white shadow-xs" />

              <div className="bg-white border border-stone-200 rounded-xl p-4 shadow-xs hover:border-stone-300 transition-all space-y-2">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-xs font-semibold text-stone-900">
                    {evt.label}
                  </span>

                  {evt.date && (
                    <span className="inline-flex items-center gap-1 text-xs font-mono font-medium text-stone-700 bg-stone-100 px-2 py-0.5 rounded">
                      <Calendar className="w-3 h-3 text-stone-500" />
                      {evt.date}
                    </span>
                  )}

                  {evt.relativeTime && (
                    <span className="inline-flex items-center gap-1 text-xs font-mono font-medium text-amber-900 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded">
                      <Clock className="w-3 h-3 text-amber-600" />
                      {evt.relativeTime}
                    </span>
                  )}
                </div>

                <p className="text-xs text-stone-600 leading-relaxed">
                  {evt.description}
                </p>

                {evt.trigger && (
                  <div className="text-[11px] text-stone-500">
                    <span className="font-medium text-stone-600">Trigger: </span>
                    {evt.trigger}
                  </div>
                )}

                {evidence && (
                  <div className="pt-2 border-t border-stone-100 flex items-center justify-end">
                    <button
                      onClick={() =>
                        onSelectEvidence(
                          evidence,
                          `Timeline event: ${evt.label} (${evt.description})`,
                          `Evidence: ${evt.label}`
                        )
                      }
                      className="inline-flex items-center gap-1 text-xs font-medium text-stone-700 hover:text-amber-800 transition-colors"
                    >
                      <Bookmark className="w-3 h-3 text-amber-600" />
                      <span>View Evidence</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
