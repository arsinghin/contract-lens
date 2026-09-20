"use client";

import { useState, useEffect } from "react";
import { DocumentRecord, Evidence } from "@/lib/types";
import { Navbar } from "@/components/Navbar";
import { ComparisonWorkspace } from "@/components/comparison/ComparisonWorkspace";
import { EvidenceViewerModal } from "@/components/evidence/EvidenceViewerModal";
import { GitCompare, Loader2 } from "lucide-react";

export default function ComparePage() {
  const [documents, setDocuments] = useState<DocumentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeEvidence, setActiveEvidence] = useState<{
    evidence: Evidence;
    interpretation?: string;
    title?: string;
  } | null>(null);

  useEffect(() => {
    fetch("/api/documents")
      .then((res) => res.json())
      .then((data) => {
        if (data.documents) {
          setDocuments(data.documents);
        }
      })
      .catch((err) => console.error("Failed to load documents", err))
      .finally(() => setLoading(false));
  }, []);

  const handleOpenEvidence = (ev: Evidence, interpretation?: string, title?: string) => {
    setActiveEvidence({ evidence: ev, interpretation, title });
  };

  return (
    <div className="min-h-screen bg-stone-100/60 text-stone-900 flex flex-col font-sans">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <GitCompare className="w-5 h-5 text-amber-500" />
            <h1 className="text-xl font-bold tracking-tight text-stone-900">
              Document Comparison Workspace
            </h1>
          </div>
          <p className="text-xs text-stone-500 max-w-2xl">
            Compare two contract versions or related agreements. Material substantive differences (deadlines, notice periods, restrictive covenants) are prioritized over non-substantive stylistic phrasing changes.
          </p>
        </div>

        {loading ? (
          <div className="p-12 text-center bg-white rounded-xl border border-stone-200">
            <Loader2 className="w-6 h-6 text-amber-500 animate-spin mx-auto" />
            <p className="text-xs text-stone-500 mt-2">Loading document repository...</p>
          </div>
        ) : (
          <ComparisonWorkspace
            documents={documents}
            initialDocAId="employment-v1"
            initialDocBId="employment-v2"
            onSelectEvidence={handleOpenEvidence}
          />
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

      <EvidenceViewerModal
        evidence={activeEvidence?.evidence || null}
        interpretation={activeEvidence?.interpretation}
        title={activeEvidence?.title}
        onClose={() => setActiveEvidence(null)}
      />
    </div>
  );
}
