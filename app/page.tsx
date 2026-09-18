"use client";

import { useState, useEffect } from "react";
import { DocumentRecord, Evidence } from "@/lib/types";
import { Navbar } from "@/components/Navbar";
import { EvidenceViewerModal } from "@/components/evidence/EvidenceViewerModal";
import { FullDocumentModal } from "@/components/documents/FullDocumentModal";
import { ClauseExplorer } from "@/components/clauses/ClauseExplorer";
import { ObligationExplorer } from "@/components/obligations/ObligationExplorer";
import { FindingsView } from "@/components/findings/FindingsView";
import { TimelineView } from "@/components/timeline/TimelineView";
import { QASection } from "@/components/questions/QASection";
import { LawyerPrepView } from "@/components/lawyer-prep/LawyerPrepView";
import {
  FileText,
  UploadCloud,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  Users,
  Shield,
  Layers,
  HelpCircle,
  Clock,
  Briefcase,
  PlayCircle,
  FileCheck,
  RefreshCw,
  Loader2,
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
    setAnalyzing(true);
    try {
      // 1. Check if already in documents
      const existing = documents.find((d) => d.id === sampleId);
      if (existing && existing.analysisStatus === "completed") {
        setSelectedDocId(existing.id);
        setAnalyzing(false);
        return;
      }

      // 2. Load and analyze
      const uploadRes = await fetch("/api/documents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sampleId }),
      });
      const uploadData = await uploadRes.json();
      const docId = uploadData.documentId;

      // 3. Trigger analysis
      const analyzeRes = await fetch(`/api/documents/${docId}/analyze`, {
        method: "POST",
      });
      const analyzeData = await analyzeRes.json();

      await fetchDocuments();
      setSelectedDocId(docId);
    } catch (err) {
      console.error("Error loading sample", err);
    } finally {
      setAnalyzing(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setAnalyzing(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const uploadRes = await fetch("/api/documents", {
        method: "POST",
        body: formData,
      });
      const uploadData = await uploadRes.json();
      const docId = uploadData.documentId;

      // Analyze newly uploaded document
      await fetch(`/api/documents/${docId}/analyze`, { method: "POST" });
      await fetchDocuments();
      setSelectedDocId(docId);
    } catch (err) {
      console.error("Error uploading file", err);
    } finally {
      setAnalyzing(false);
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

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Document Selection & Demo Bar */}
        <div id="demo-scenario" className="bg-white border border-stone-200 rounded-xl p-4 shadow-xs">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider flex items-center gap-1.5 mr-1">
                <PlayCircle className="w-4 h-4 text-amber-500" />
                Preloaded Contracts:
              </span>

              <button
                onClick={() => handleSelectSample("employment-v1")}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border ${
                  selectedDocId === "employment-v1"
                    ? "bg-stone-900 text-stone-50 border-stone-900 shadow-xs"
                    : "bg-stone-50 hover:bg-stone-100 text-stone-700 border-stone-200"
                }`}
              >
                Employment Agreement (v1 - Conflicting Notice)
              </button>

              <button
                onClick={() => handleSelectSample("employment-v2")}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border ${
                  selectedDocId === "employment-v2"
                    ? "bg-stone-900 text-stone-50 border-stone-900 shadow-xs"
                    : "bg-stone-50 hover:bg-stone-100 text-stone-700 border-stone-200"
                }`}
              >
                Employment Agreement (v2 - 90-Day & Non-Compete)
              </button>

              <button
                onClick={() => handleSelectSample("prompt-injection-test")}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border ${
                  selectedDocId === "prompt-injection-test"
                    ? "bg-stone-900 text-stone-50 border-stone-900 shadow-xs"
                    : "bg-stone-50 hover:bg-stone-100 text-stone-700 border-stone-200"
                }`}
              >
                Adversarial Prompt Injection Test
              </button>
            </div>

            {/* Upload control */}
            <div className="flex items-center gap-2">
              <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-800 border border-stone-200 transition-colors">
                <UploadCloud className="w-3.5 h-3.5 text-stone-600" />
                <span>Upload PDF / Text</span>
                <input
                  type="file"
                  accept=".pdf,.txt,.md"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>
          </div>
        </div>

        {/* Active Document Header Card */}
        {activeDoc && (
          <div className="bg-white border border-stone-200 rounded-xl p-6 shadow-xs space-y-4">
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
                  onClick={() => setShowFullDoc(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-800 border border-stone-200 transition-colors"
                >
                  <FileText className="w-3.5 h-3.5 text-stone-600" />
                  <span>Inspect Full Document Text</span>
                </button>

                <button
                  onClick={handleReanalyze}
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
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-stone-400 shrink-0" />
                <div>
                  <span className="text-stone-400 block text-[10px] uppercase">
                    Effective Date
                  </span>
                  <span className="font-medium text-stone-800">
                    {activeDoc.effectiveDate || "Not established"}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-stone-400 shrink-0" />
                <div>
                  <span className="text-stone-400 block text-[10px] uppercase">
                    Parties Identified
                  </span>
                  <span className="font-medium text-stone-800 truncate">
                    {activeDoc.parties.map((p) => p.name).join(", ") || "None"}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-stone-400 shrink-0" />
                <div>
                  <span className="text-stone-400 block text-[10px] uppercase">
                    Extracted Clauses
                  </span>
                  <span className="font-medium text-stone-800 font-mono">
                    {activeDoc.clauses.length} clauses
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-stone-400 shrink-0" />
                <div>
                  <span className="text-stone-400 block text-[10px] uppercase">
                    Grounding Status
                  </span>
                  <span className="font-medium text-emerald-700 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Verified Citations
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

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
            Alok Ranjan Singh
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
