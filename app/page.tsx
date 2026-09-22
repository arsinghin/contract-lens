"use client";

import { useState, useEffect } from "react";
import { DocumentRecord, Evidence } from "@/lib/types";
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
  const [documents, setDocuments] = useState<DocumentRecord[]>([]);
  const [selectedDocId, setSelectedDocId] = useState<string>("employment-v1");
  const [activeTab, setActiveTab] = useState<
    "findings" | "clauses" | "obligations" | "qa" | "timeline" | "lawyer_prep"
  >("findings");
  const [analyzing, setAnalyzing] = useState(false);
  const [loadingDocs, setLoadingDocs] = useState(true);

  // Evidence Modal State
  const [activeEvidence, setActiveEvidence] = useState<{
    evidence: Evidence;
    interpretation?: string;
    title?: string;
  } | null>(null);

  // Full Document Text Modal State
  const [showFullDoc, setShowFullDoc] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Load documents on mount
  const fetchDocuments = async () => {
    try {
      const res = await fetch("/api/documents");
      const data = await res.json();
      if (data.documents && data.documents.length > 0) {
        setDocuments(data.documents);
        setSelectedDocId((prev) =>
          prev && data.documents.some((d: any) => d.id === prev) ? prev : data.documents[0].id
        );
      }
    } catch (err) {
      console.error("Failed to load documents", err);
    } finally {
      setLoadingDocs(false);
    }
  };

  useEffect(() => {
    let mounted = true;
    fetch("/api/documents")
      .then((res) => res.json())
      .then((data) => {
        if (!mounted) return;
        if (data.documents && data.documents.length > 0) {
          setDocuments(data.documents);
          setSelectedDocId((prev) =>
            prev && data.documents.some((d: any) => d.id === prev) ? prev : data.documents[0].id
          );
        }
      })
      .catch((err) => console.error("Failed to load documents", err))
      .finally(() => {
        if (mounted) setLoadingDocs(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  const activeDoc = documents.find((d) => d.id === selectedDocId) || documents[0];

  const handleSelectSample = async (sampleId: string) => {
    // 1. Check if already in documents list
    const existing = documents.find((d) => d.id === sampleId);
    if (existing) {
      setSelectedDocId(existing.id);
      return;
    }

    // 2. If not loaded in client state, fetch or upload sample definition
    try {
      const uploadRes = await fetch("/api/documents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sampleId }),
      });
      const uploadData = await uploadRes.json();
      const docId = uploadData.documentId;
      await fetchDocuments();
      setSelectedDocId(docId);
    } catch (err) {
      console.error("Error loading sample", err);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setAnalyzing(true);
    setUploadError(null);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const uploadRes = await fetch("/api/documents", {
        method: "POST",
        body: formData,
      });

      const contentType = uploadRes.headers.get("content-type") || "";
      if (!contentType.includes("application/json")) {
        const textBody = await uploadRes.text();
        throw new Error(
          uploadRes.status === 413
            ? "The uploaded file exceeds the 10MB upload limit."
            : uploadRes.status === 429
            ? "Upload rate limit reached. Please wait a minute and retry."
            : `Server returned non-JSON response (${uploadRes.status}): ${textBody.substring(0, 100)}`
        );
      }

      const uploadData = await uploadRes.json();
      if (!uploadRes.ok || uploadData.error) {
        throw new Error(uploadData.error?.message || "Failed to upload document");
      }

      const docId = uploadData.documentId;

      // Analyze newly uploaded document
      const analyzeRes = await fetch(`/api/documents/${docId}/analyze`, { method: "POST" });
      const analyzeContentType = analyzeRes.headers.get("content-type") || "";
      if (analyzeContentType.includes("application/json")) {
        const analyzeData = await analyzeRes.json();
        if (analyzeData.error) {
          console.warn("Auto-analysis had a warning:", analyzeData.error);
        }
      }

      await fetchDocuments();
      setSelectedDocId(docId);
    } catch (err: any) {
      console.error("Error uploading file", err);
      setUploadError(err.message || "An unexpected error occurred while uploading the document.");
    } finally {
      setAnalyzing(false);
      // Reset input value so re-uploading the same file triggers onChange
      e.target.value = "";
    }
  };

  const handleReanalyze = async () => {
    if (!activeDoc) return;
    setAnalyzing(true);
    try {
      await fetch(`/api/documents/${activeDoc.id}/analyze`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ force: true }),
      });
      await fetchDocuments();
    } catch (err) {
      console.error("Re-analysis failed", err);
    } finally {
      setAnalyzing(false);
    }
  };

  const handleOpenEvidence = (ev: Evidence, interpretation?: string, title?: string) => {
    setActiveEvidence({ evidence: ev, interpretation, title });
  };

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
          <nav className="flex space-x-1 sm:space-x-4 overflow-x-auto text-xs font-medium">
            <button
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
        onClose={() => setActiveEvidence(null)}
        onOpenFullDocument={() => {
          setActiveEvidence(null);
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
