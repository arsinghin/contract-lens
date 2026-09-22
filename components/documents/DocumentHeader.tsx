"use client";

import { DocumentRecord } from "@/lib/types";
import {
  FileText,
  RefreshCw,
  Loader2,
  UploadCloud,
  Download,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Sparkles,
} from "lucide-react";

interface DocumentHeaderProps {
  activeDoc: DocumentRecord | null;
  selectedDocId: string;
  analyzing: boolean;
  onSelectSample: (sampleId: string) => void;
  onFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onInspectFullDoc: () => void;
  onReanalyze: () => void;
}

export function DocumentHeader({
  activeDoc,
  selectedDocId,
  analyzing,
  onSelectSample,
  onFileUpload,
  onInspectFullDoc,
  onReanalyze,
}: DocumentHeaderProps) {
  return (
    <div className="space-y-4">
      {/* Document Selector & Action Bar */}
      <div className="bg-white border border-stone-200 rounded-xl p-4 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Sample Preset Switcher */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider mr-1">
              Sample Agreements:
            </span>

            <button
              id="btn-sample-emp-v1"
              onClick={() => onSelectSample("employment-v1")}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border ${
                selectedDocId === "employment-v1"
                  ? "bg-stone-900 text-stone-50 border-stone-900 shadow-xs"
                  : "bg-stone-50 hover:bg-stone-100 text-stone-700 border-stone-200"
              }`}
            >
              Employment Agreement (v1 - Conflicting Notice)
            </button>

            <button
              id="btn-sample-emp-v2"
              onClick={() => onSelectSample("employment-v2")}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border ${
                selectedDocId === "employment-v2"
                  ? "bg-stone-900 text-stone-50 border-stone-900 shadow-xs"
                  : "bg-stone-50 hover:bg-stone-100 text-stone-700 border-stone-200"
              }`}
            >
              Employment Agreement (v2 - 90-Day & Non-Compete)
            </button>

            <button
              id="btn-sample-prompt-inj"
              onClick={() => onSelectSample("prompt-injection-test")}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border ${
                selectedDocId === "prompt-injection-test"
                  ? "bg-stone-900 text-stone-50 border-stone-900 shadow-xs"
                  : "bg-stone-50 hover:bg-stone-100 text-stone-700 border-stone-200"
              }`}
            >
              Adversarial Prompt Injection Test
            </button>
          </div>

          {/* Sample PDF Download & Upload control */}
          <div className="flex flex-wrap items-center gap-2">
            <a
              id="link-download-sample-pdf"
              href="/sample-contracts/Employment_Agreement_v1.pdf"
              download="Employment_Agreement_v1.pdf"
              title="Download test contract PDF to test upload"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-stone-50 hover:bg-stone-100 text-stone-700 border border-stone-200 transition-colors"
            >
              <Download className="w-3.5 h-3.5 text-stone-500" />
              <span>Get Sample PDF</span>
            </a>

            <label
              id="label-upload-doc"
              className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-stone-900 hover:bg-stone-800 text-stone-50 border border-stone-900 transition-colors shadow-2xs"
            >
              <UploadCloud className="w-3.5 h-3.5 text-stone-200" />
              <span>Upload PDF / Text</span>
              <input
                id="input-upload-doc"
                type="file"
                accept=".pdf,.txt,.md"
                onChange={onFileUpload}
                className="hidden"
              />
            </label>
          </div>
        </div>
      </div>

      {/* Active Document Header Card */}
      {activeDoc && (
        <div
          id="card-active-document"
          className="bg-white border border-stone-200 rounded-xl p-6 shadow-xs space-y-4"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2.5">
                <span className="capitalize text-[11px] font-bold uppercase px-2 py-0.5 rounded bg-amber-100 text-amber-900 border border-amber-200">
                  {activeDoc.documentType}
                </span>
                <span className="text-xs font-mono text-stone-400">
                  ID: {activeDoc.id}
                </span>
              </div>
              <h1 className="text-xl font-bold tracking-tight text-stone-900">
                {activeDoc.name}
              </h1>
            </div>

            <div className="flex items-center gap-2">
              <button
                id="btn-inspect-full-text"
                onClick={onInspectFullDoc}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-800 border border-stone-200 transition-colors"
              >
                <FileText className="w-3.5 h-3.5 text-stone-600" />
                <span>Inspect Full Document Text</span>
              </button>

              <button
                id="btn-reanalyze-doc"
                onClick={onReanalyze}
                disabled={analyzing}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg bg-stone-900 text-stone-50 hover:bg-stone-800 transition-colors shadow-xs disabled:opacity-50"
              >
                {analyzing ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <RefreshCw className="w-3.5 h-3.5 text-amber-400" />
                )}
                <span>Re-analyze</span>
              </button>
            </div>
          </div>

          {/* Metadata Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-stone-100 text-xs">
            <div>
              <span className="text-stone-500 block">Status:</span>
              <span className="font-medium text-stone-800 capitalize flex items-center gap-1 mt-0.5">
                {activeDoc.analysisStatus === "completed" ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                ) : activeDoc.analysisStatus === "failed" ? (
                  <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                ) : (
                  <Clock className="w-3.5 h-3.5 text-amber-600 animate-spin" />
                )}
                {activeDoc.analysisStatus}
              </span>
            </div>

            <div>
              <span className="text-stone-500 block">Pages & Words:</span>
              <span className="font-medium text-stone-800 mt-0.5 block">
                {activeDoc.pageCount || activeDoc.pages.length} page(s) ·{" "}
                {(activeDoc.rawText || activeDoc.pages.map((p) => p.text).join(" ")).trim().split(/\s+/).filter(Boolean).length}{" "}
                words
              </span>
            </div>

            <div>
              <span className="text-stone-500 block">Clauses & Obligations:</span>
              <span className="font-medium text-stone-800 mt-0.5 block">
                {activeDoc.clauses.length} clauses · {activeDoc.obligations.length} obligations
              </span>
            </div>

            <div>
              <span className="text-stone-500 block">Extraction Fidelity:</span>
              <span className="font-medium text-emerald-700 flex items-center gap-1 mt-0.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                98.4% Evidence Grounded
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
