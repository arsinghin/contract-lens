"use client";

import { Evidence } from "@/lib/types";
import { X, CheckCircle2, AlertTriangle, FileText, Bookmark, ArrowUpRight } from "lucide-react";
import { useEffect } from "react";

interface EvidenceViewerModalProps {
  evidence: Evidence | null;
  interpretation?: string;
  title?: string;
  onClose: () => void;
  onOpenFullDocument?: () => void;
}

export function EvidenceViewerModal({
  evidence,
  interpretation,
  title,
  onClose,
  onOpenFullDocument,
}: EvidenceViewerModalProps) {
  useEffect(() => {
    if (!evidence) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [evidence, onClose]);

  if (!evidence) return null;

  const isVerified = evidence.startOffset !== undefined && evidence.startOffset !== null;

  return (
    <div
      id="modal-evidence-viewer-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        id="modal-evidence-viewer-card"
        className="w-full max-w-2xl bg-white rounded-xl shadow-2xl border border-stone-200 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-stone-200 bg-stone-50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-md bg-stone-900 text-amber-400 flex items-center justify-center">
              <Bookmark className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-stone-900">
                {title || "Supporting Document Evidence"}
              </h3>
              <p className="text-xs text-stone-500">
                {evidence.sectionLabel || "Identified Section"} · Page {evidence.pageNumber}
              </p>
            </div>
          </div>
          <button
            id="btn-close-evidence-modal-x"
            type="button"
            aria-label="Close evidence viewer"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onClose();
            }}
            className="p-1.5 rounded-md text-stone-400 hover:text-stone-700 hover:bg-stone-200/60 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          {/* Verification Status */}
          <div
            className={`flex items-center gap-2 text-xs px-3 py-2 rounded-lg border ${
              isVerified
                ? "bg-emerald-50 text-emerald-900 border-emerald-200"
                : "bg-amber-50 text-amber-900 border-amber-200"
            }`}
          >
            {isVerified ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
            )}
            <span>
              {isVerified
                ? `Directly verified in document text at character offset ${evidence.startOffset}`
                : "Contextually aligned from document provisions"}
            </span>
          </div>

          {/* Document Source Text */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold tracking-wider uppercase text-stone-500">
                DOCUMENT TEXT (SOURCE EXCERPT)
              </span>
              <span className="text-xs text-stone-400 font-mono">
                Page {evidence.pageNumber}
              </span>
            </div>
            <div className="p-4 rounded-lg bg-stone-50 border border-stone-200 text-stone-800 font-serif text-sm leading-relaxed whitespace-pre-wrap selection:bg-amber-100">
              <span className="bg-amber-100/90 text-stone-900 px-1 py-0.5 rounded font-medium">
                &ldquo;{evidence.sourceText}&rdquo;
              </span>
            </div>
          </div>

          {/* AI Interpretation (Clearly separated) */}
          {interpretation && (
            <div className="pt-2 border-t border-stone-100">
              <div className="mb-2">
                <span className="text-xs font-bold tracking-wider uppercase text-amber-800">
                  AI INTERPRETATION & CONTEXT
                </span>
              </div>
              <div className="p-3.5 rounded-lg bg-amber-50/50 border border-amber-200/70 text-stone-700 text-xs leading-relaxed">
                {interpretation}
              </div>
            </div>
          )}

          {/* Evidence Details Metadata */}
          <div className="grid grid-cols-2 gap-3 text-xs text-stone-500 pt-2 border-t border-stone-100">
            <div>
              <span className="text-stone-400">Evidence ID:</span>{" "}
              <code className="font-mono text-stone-700">{evidence.id}</code>
            </div>
            <div>
              <span className="text-stone-400">Relevance:</span>{" "}
              <span className="capitalize text-stone-700 font-medium">{evidence.relevance}</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-stone-200 bg-stone-50 flex items-center justify-between">
          <p className="text-[11px] text-stone-500">
            Traceable to source document content
          </p>
          <button
            id="btn-close-evidence-modal-footer"
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onClose();
            }}
            className="px-4 py-1.5 text-xs font-medium rounded-md bg-stone-900 text-stone-50 hover:bg-stone-800 transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
