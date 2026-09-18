"use client";

import { DocumentRecord, Evidence } from "@/lib/types";
import { X, FileText, Search } from "lucide-react";
import { useState, useEffect, useRef } from "react";

interface FullDocumentModalProps {
  isOpen?: boolean;
  document: DocumentRecord | null;
  onClose: () => void;
  activeEvidence?: Evidence | null;
}

export function FullDocumentModal({
  isOpen = true,
  document: docRecord,
  onClose,
  activeEvidence,
}: FullDocumentModalProps) {
  const [search, setSearch] = useState("");
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      } else if (e.key === "Tab" && modalRef.current) {
        // Focus trapping
        const focusable = modalRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (focusable.length > 0) {
          const first = focusable[0];
          const last = focusable[focusable.length - 1];
          const currentEl = window.document.activeElement;
          if (e.shiftKey && currentEl === first) {
            e.preventDefault();
            last.focus();
          } else if (!e.shiftKey && currentEl === last) {
            e.preventDefault();
            first.focus();
          }
        }
      }
    };

    // Auto-focus search field on modal open
    const timer = setTimeout(() => {
      if (modalRef.current) {
        const input = modalRef.current.querySelector<HTMLInputElement>("input");
        if (input) input.focus();
        else {
          const first = modalRef.current.querySelector<HTMLElement>(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
          );
          first?.focus();
        }
      }
    }, 50);

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen || !docRecord) return null;

  const rawText = docRecord.rawText || docRecord.pages.map((p) => p.text).join("\n\n");

  return (
    <div
      id="modal-full-document-backdrop"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-full-doc-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        ref={modalRef}
        id="modal-full-document-card"
        className="w-full max-w-4xl bg-white rounded-xl shadow-2xl border border-stone-200 overflow-hidden flex flex-col max-h-[88vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-stone-200 bg-stone-50 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-stone-900 text-stone-50 flex items-center justify-center">
              <FileText className="w-4 h-4 text-amber-400" />
            </div>
            <div>
              <h3 id="modal-full-doc-title" className="text-sm font-semibold text-stone-900 leading-snug">
                {docRecord.name}
              </h3>
              <p className="text-xs text-stone-500">
                Full text inspection · {docRecord.pages.length} page(s) · {docRecord.clauses.length} clauses detected
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-stone-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                id="input-full-doc-search"
                type="text"
                placeholder="Search document text..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-8 pr-3 py-1.5 text-xs bg-white border border-stone-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-stone-400 w-48"
              />
            </div>

            <button
              id="btn-close-full-doc-modal-x"
              type="button"
              aria-label="Close document modal"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onClose();
              }}
              className="p-1.5 rounded-md text-stone-500 hover:text-stone-900 hover:bg-stone-200/80 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Document Body */}
        <div className="p-6 overflow-y-auto font-serif text-stone-800 text-xs sm:text-sm leading-relaxed whitespace-pre-wrap selection:bg-amber-100 bg-white flex-1">
          {rawText}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-stone-200 bg-stone-50 flex items-center justify-between text-xs text-stone-500">
          <span>Source Document Record: {docRecord.id}</span>
          <button
            id="btn-close-full-doc-modal-footer"
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
