"use client";

import { useWorkspace } from "@/lib/hooks/useWorkspace";
import { Navbar } from "@/components/Navbar";
import { EvidenceViewerModal } from "@/components/evidence/EvidenceViewerModal";
import { FullDocumentModal } from "@/components/documents/FullDocumentModal";
import { DocumentHeader } from "@/components/documents/DocumentHeader";
import { ClauseExplorer } from "@/components/clauses/ClauseExplorer";
import { ObligationExplorer } from "@/components/obligations/ObligationExplorer";
import { FindingsView } from "@/components/findings/FindingsView";
import { TimelineView } from "@/components/timeline/TimelineView";
import { QASection } from "@/components/questions/QASection";
import { LawyerPrepView } from "@/components/lawyer-prep/LawyerPrepView";
import {
  Sparkles,
  AlertTriangle,
  Users,
  Layers,
  HelpCircle,
  Briefcase,
  PlayCircle,
  FileCheck,
  Clock,
  Loader2,
  FileText,
  UploadCloud,
  ArrowRight,
} from "lucide-react";

export default function WorkspacePage() {
  const {
    documents,
    selectedDocId,
    setSelectedDocId,
    activeDoc,
    activeTab,
    setActiveTab,
    analyzing,
    loadingDocs,
    uploadError,
    setUploadError,
    activeEvidence,
    showFullDoc,
    setShowFullDoc,
    handleOpenEvidence,
    handleCloseEvidence,
    handleSelectSample,
    handleFileUpload,
    handleReanalyze,
  } = useWorkspace();

  return (
    <div className="min-h-screen bg-stone-100/60 text-stone-900 flex flex-col font-sans">
      <Navbar />

      {/* Screen Reader Live Region for status announcements */}
      <div className="sr-only" role="status" aria-live="polite" aria-atomic="true">
        {analyzing
          ? "Analyzing contract clauses and risk obligations..."
          : activeDoc
          ? `Loaded document ${activeDoc.name}. ${activeDoc.clauses.length} clauses and ${activeDoc.findings.length} findings available.`
          : "Ready. Select or upload a legal agreement to analyze."}
      </div>

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {uploadError && (
          <div className="bg-rose-50 border border-rose-200 text-rose-800 rounded-xl p-4 flex items-start justify-between gap-3 text-xs shadow-2xs">
            <div className="flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 text-rose-600 mt-0.5 shrink-0" />
              <div>
                <p className="font-semibold text-rose-900">Upload Failed</p>
                <p className="text-rose-700 mt-0.5">{uploadError}</p>
              </div>
            </div>
            <button
              onClick={() => setUploadError(null)}
              className="text-rose-500 hover:text-rose-700 font-bold px-1.5 py-0.5 rounded text-sm transition-colors"
              aria-label="Dismiss error"
            >
              ×
            </button>
          </div>
        )}

        {/* Document Selection & Header */}
        <DocumentHeader
          activeDoc={activeDoc}
          selectedDocId={selectedDocId}
          analyzing={analyzing}
          onSelectSample={handleSelectSample}
          onFileUpload={handleFileUpload}
          onInspectFullDoc={() => setShowFullDoc(true)}
          onReanalyze={handleReanalyze}
        />

        {/* Tab Navigation */}
        <div className="border-b border-stone-200">
          <nav className="flex space-x-1 sm:space-x-4 overflow-x-auto text-xs font-medium" role="tablist" aria-label="Document Analysis Views">
            <button
              role="tab"
              aria-selected={activeTab === "findings"}
              aria-controls="panel-findings"
              id="tab-findings"
              onClick={() => setActiveTab("findings")}
              className={`pb-3 px-3 flex items-center gap-1.5 border-b-2 transition-colors whitespace-nowrap ${
                activeTab === "findings"
                  ? "border-amber-500 text-stone-950 font-semibold"
                  : "border-transparent text-stone-500 hover:text-stone-800 hover:border-stone-300"
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
              <span>Inconsistencies & Findings</span>
              {activeDoc?.findings.length ? (
                <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-amber-100 text-amber-900 font-mono">
                  {activeDoc.findings.length}
                </span>
              ) : null}
            </button>

            <button
              role="tab"
              aria-selected={activeTab === "clauses"}
              aria-controls="panel-clauses"
              id="tab-clauses"
              onClick={() => setActiveTab("clauses")}
              className={`pb-3 px-3 flex items-center gap-1.5 border-b-2 transition-colors whitespace-nowrap ${
                activeTab === "clauses"
                  ? "border-amber-500 text-stone-950 font-semibold"
                  : "border-transparent text-stone-500 hover:text-stone-800 hover:border-stone-300"
              }`}
            >
              <Layers className="w-3.5 h-3.5 text-stone-600" />
              <span>Clauses & Provisions</span>
              <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-stone-100 text-stone-700 font-mono">
                {activeDoc?.clauses.length || 0}
              </span>
            </button>

            <button
              role="tab"
              aria-selected={activeTab === "obligations"}
              aria-controls="panel-obligations"
              id="tab-obligations"
              onClick={() => setActiveTab("obligations")}
              className={`pb-3 px-3 flex items-center gap-1.5 border-b-2 transition-colors whitespace-nowrap ${
                activeTab === "obligations"
                  ? "border-amber-500 text-stone-950 font-semibold"
                  : "border-transparent text-stone-500 hover:text-stone-800 hover:border-stone-300"
              }`}
            >
              <Briefcase className="w-3.5 h-3.5 text-stone-600" />
              <span>Obligations & Deadlines</span>
              <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-stone-100 text-stone-700 font-mono">
                {activeDoc?.obligations.length || 0}
              </span>
            </button>

            <button
              role="tab"
              aria-selected={activeTab === "qa"}
              aria-controls="panel-qa"
              id="tab-qa"
              onClick={() => setActiveTab("qa")}
              className={`pb-3 px-3 flex items-center gap-1.5 border-b-2 transition-colors whitespace-nowrap ${
                activeTab === "qa"
                  ? "border-amber-500 text-stone-950 font-semibold"
                  : "border-transparent text-stone-500 hover:text-stone-800 hover:border-stone-300"
              }`}
            >
              <HelpCircle className="w-3.5 h-3.5 text-stone-600" />
              <span>Grounded Q&A</span>
            </button>

            <button
              role="tab"
              aria-selected={activeTab === "timeline"}
              aria-controls="panel-timeline"
              id="tab-timeline"
              onClick={() => setActiveTab("timeline")}
              className={`pb-3 px-3 flex items-center gap-1.5 border-b-2 transition-colors whitespace-nowrap ${
                activeTab === "timeline"
                  ? "border-amber-500 text-stone-950 font-semibold"
                  : "border-transparent text-stone-500 hover:text-stone-800 hover:border-stone-300"
              }`}
            >
              <Clock className="w-3.5 h-3.5 text-stone-600" />
              <span>Contract Timeline</span>
            </button>

            <button
              role="tab"
              aria-selected={activeTab === "lawyer_prep"}
              aria-controls="panel-lawyer-prep"
              id="tab-lawyer-prep"
              onClick={() => setActiveTab("lawyer_prep")}
              className={`pb-3 px-3 flex items-center gap-1.5 border-b-2 transition-colors whitespace-nowrap ${
                activeTab === "lawyer_prep"
                  ? "border-amber-500 text-stone-950 font-semibold"
                  : "border-transparent text-stone-500 hover:text-stone-800 hover:border-stone-300"
              }`}
            >
              <FileCheck className="w-3.5 h-3.5 text-stone-600" />
              <span>Lawyer Preparation</span>
            </button>
          </nav>
        </div>

        {/* Tab Content Display */}
        <div role="region" aria-live="polite" aria-atomic="false">
        {analyzing ? (
          <div className="bg-white border border-stone-200 rounded-xl p-12 text-center space-y-3">
            <Loader2 className="w-8 h-8 text-amber-500 animate-spin mx-auto" />
            <h3 className="text-sm font-semibold text-stone-900">
              Running LexLens Evidence Pipeline...
            </h3>
            <p className="text-xs text-stone-500 max-w-md mx-auto">
              Parsing document structure, extracting clauses, mapping obligations, detecting contradictions, and validating text offsets.
            </p>
          </div>
        ) : activeDoc ? (
          activeDoc.analysisStatus !== "completed" ? (
            <div className="bg-white border border-stone-200 rounded-xl p-8 sm:p-12 text-center space-y-5 shadow-xs">
              <div className="w-12 h-12 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center mx-auto text-amber-600">
                <FileText className="w-6 h-6" />
              </div>
              <div className="space-y-1.5 max-w-lg mx-auto">
                <h3 className="text-base font-bold text-stone-900">
                  {activeDoc.name}
                </h3>
                <p className="text-xs text-stone-600 leading-relaxed">
                  This document is loaded and ready. Trigger the LexLens pipeline to extract clauses, identify obligations, compute timeline events, and run grounded legal inconsistency checks.
                </p>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                <button
                  id="btn-analyze-loaded-doc"
                  onClick={handleReanalyze}
                  disabled={analyzing}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-xs font-semibold bg-amber-600 hover:bg-amber-700 text-stone-50 shadow-xs transition-colors disabled:opacity-50"
                >
                  <Sparkles className="w-4 h-4 text-amber-200" />
                  <span>Analyze This Document</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>

                <button
                  id="btn-inspect-loaded-doc"
                  onClick={() => setShowFullDoc(true)}
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-lg text-xs font-medium bg-stone-100 hover:bg-stone-200 text-stone-800 border border-stone-200 transition-colors"
                >
                  <FileText className="w-3.5 h-3.5 text-stone-600" />
                  <span>View Raw Text</span>
                </button>
              </div>

              <div className="pt-4 border-t border-stone-100 flex items-center justify-center gap-4 text-[11px] text-stone-400">
                <span>{activeDoc.pageCount || activeDoc.pages.length} page(s)</span>
                <span>•</span>
                <span>{(activeDoc.rawText || "").trim().split(/\s+/).filter(Boolean).length} words</span>
                <span>•</span>
                <span>Status: Loaded (Unanalyzed)</span>
              </div>
            </div>
          ) : (
            <div>
              {activeTab === "findings" && (
                <FindingsView
                  findings={activeDoc.findings}
                  evidenceMap={activeDoc.evidence}
                  onSelectEvidence={handleOpenEvidence}
                />
              )}

              {activeTab === "clauses" && (
                <ClauseExplorer
                  clauses={activeDoc.clauses}
                  evidenceMap={activeDoc.evidence}
                  onSelectEvidence={handleOpenEvidence}
                />
              )}

              {activeTab === "obligations" && (
                <ObligationExplorer
                  obligations={activeDoc.obligations}
                  evidenceMap={activeDoc.evidence}
                  onSelectEvidence={handleOpenEvidence}
                />
              )}

              {activeTab === "qa" && (
                <QASection
                  documentId={activeDoc.id}
                  evidenceMap={activeDoc.evidence}
                  onSelectEvidence={handleOpenEvidence}
                />
              )}

              {activeTab === "timeline" && (
                <TimelineView
                  events={activeDoc.timelineEvents || []}
                  evidenceMap={activeDoc.evidence}
                  onSelectEvidence={handleOpenEvidence}
                />
              )}

              {activeTab === "lawyer_prep" && (
                <LawyerPrepView
                  document={activeDoc}
                  evidenceMap={activeDoc.evidence}
                  onSelectEvidence={handleOpenEvidence}
                />
              )}
            </div>
          )
        ) : (
          <div className="bg-white border border-stone-200 rounded-xl p-12 text-center text-xs text-stone-500">
            No document selected. Choose a sample from the bar above.
          </div>
        )}
        </div>
      </main>

      <footer className="mt-16 py-6 border-t border-stone-200 bg-stone-50 text-center text-xs text-stone-500">
        <p>
          LexLens — Created & Owned by{" "}
          <a
            href="https://github.com/arsinghin/"
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-stone-800 hover:text-stone-950 underline underline-offset-2"
          >
            AR Singh
          </a>
        </p>
      </footer>

      {/* Global Modals */}
      <EvidenceViewerModal
        evidence={activeEvidence?.evidence || null}
        interpretation={activeEvidence?.interpretation}
        title={activeEvidence?.title}
        onClose={handleCloseEvidence}
        onOpenFullDocument={() => {
          handleCloseEvidence();
          setShowFullDoc(true);
        }}
      />

      {showFullDoc && (
        <FullDocumentModal
          isOpen={showFullDoc}
          document={activeDoc || null}
          onClose={() => setShowFullDoc(false)}
        />
      )}
    </div>
  );
}
