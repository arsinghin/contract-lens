"use client";

import { useState, useEffect, useCallback } from "react";
import { DocumentRecord, Evidence } from "@/lib/types";

export type WorkspaceTab = "findings" | "clauses" | "obligations" | "qa" | "timeline" | "lawyer_prep";

export interface UseWorkspaceReturn {
  documents: DocumentRecord[];
  selectedDocId: string;
  setSelectedDocId: (id: string) => void;
  activeDoc: DocumentRecord | null;
  activeTab: WorkspaceTab;
  setActiveTab: (tab: WorkspaceTab) => void;
  analyzing: boolean;
  loadingDocs: boolean;
  uploadError: string | null;
  setUploadError: (err: string | null) => void;
  activeEvidence: {
    evidence: Evidence;
    interpretation?: string;
    title?: string;
  } | null;
  showFullDoc: boolean;
  setShowFullDoc: (show: boolean) => void;
  handleOpenEvidence: (ev: Evidence, interpretation?: string, title?: string) => void;
  handleCloseEvidence: () => void;
  handleSelectSample: (sampleId: string) => Promise<void>;
  handleFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => Promise<void>;
  handleReanalyze: () => Promise<void>;
}

export function useWorkspace(): UseWorkspaceReturn {
  const [documents, setDocuments] = useState<DocumentRecord[]>([]);
  const [selectedDocId, setSelectedDocId] = useState<string>("employment-v1");
  const [activeTab, setActiveTab] = useState<WorkspaceTab>("findings");
  const [analyzing, setAnalyzing] = useState(false);
  const [loadingDocs, setLoadingDocs] = useState(true);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [showFullDoc, setShowFullDoc] = useState(false);
  const [activeEvidence, setActiveEvidence] = useState<{
    evidence: Evidence;
    interpretation?: string;
    title?: string;
  } | null>(null);

  const fetchDocuments = useCallback(async () => {
    try {
      const res = await fetch("/api/documents");
      const data = await res.json();
      if (data.documents && data.documents.length > 0) {
        setDocuments(data.documents);
        setSelectedDocId((prev) =>
          prev && data.documents.some((d: DocumentRecord) => d.id === prev) ? prev : data.documents[0].id
        );
      }
    } catch (err) {
      console.error("Failed to load documents", err);
    } finally {
      setLoadingDocs(false);
    }
  }, []);

  useEffect(() => {
    let mounted = true;
    fetch("/api/documents")
      .then((res) => res.json())
      .then((data) => {
        if (!mounted) return;
        if (data.documents && data.documents.length > 0) {
          setDocuments(data.documents);
          setSelectedDocId((prev) =>
            prev && data.documents.some((d: DocumentRecord) => d.id === prev) ? prev : data.documents[0].id
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

  const activeDoc: DocumentRecord | null =
    documents.find((d) => d.id === selectedDocId) || (documents.length > 0 ? documents[0] : null);

  const handleSelectSample = async (sampleId: string) => {
    const existing = documents.find((d) => d.id === sampleId);
    if (existing) {
      setSelectedDocId(existing.id);
      return;
    }

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

  const handleCloseEvidence = () => {
    setActiveEvidence(null);
  };

  return {
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
  };
}
