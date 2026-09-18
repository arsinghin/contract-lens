// Document Service - In-memory store and lifecycle management
// Based on 03_DATA_SCHEMA.md and 06_TECHNICAL_ARCHITECTURE.md

import { DocumentRecord, Page, Section, Evidence } from "@/lib/types";
import { SYNTHETIC_DOCUMENTS } from "@/lib/data/synthetic-documents";
import { getSeededDocumentRecord } from "@/lib/data/ground-truth-seed";

// In-memory document store
const documentsStore: Map<string, DocumentRecord> = new Map();

/**
 * Splits raw document text into simulated pages and sections.
 */
export function parseRawTextIntoPages(documentId: string, rawText: string): Page[] {
  // Split by double newline or page indicators
  const paragraphs = rawText.split(/\n\s*\n/);
  const pages: Page[] = [];
  
  // Approximately 4 paragraphs per page
  const paragraphsPerPage = 4;
  let pageNumber = 1;
  let currentSections: Section[] = [];
  let currentPageText = "";

  paragraphs.forEach((p, idx) => {
    const trimmed = p.trim();
    if (!trimmed) return;

    // Detect section numbering like "1. POSITION" or "8.2 Notice"
    const headingMatch = trimmed.match(/^([0-9]+(\.[0-9]+)*)\.?\s+([A-Z\s,]+)/);
    const sectionNumber = headingMatch ? headingMatch[1] : undefined;
    const heading = headingMatch ? headingMatch[0].split("\n")[0] : undefined;

    const section: Section = {
      id: `sec_${documentId}_p${pageNumber}_${currentSections.length + 1}`,
      pageId: `page_${documentId}_${pageNumber}`,
      sectionNumber,
      heading,
      text: trimmed,
    };
    currentSections.push(section);
    currentPageText += (currentPageText ? "\n\n" : "") + trimmed;

    if (currentSections.length >= paragraphsPerPage || idx === paragraphs.length - 1) {
      pages.push({
        id: `page_${documentId}_${pageNumber}`,
        documentId,
        pageNumber,
        text: currentPageText,
        sections: [...currentSections],
      });
      pageNumber++;
      currentSections = [];
      currentPageText = "";
    }
  });

  if (pages.length === 0) {
    pages.push({
      id: `page_${documentId}_1`,
      documentId,
      pageNumber: 1,
      text: rawText,
      sections: [
        {
          id: `sec_${documentId}_p1_1`,
          pageId: `page_${documentId}_1`,
          text: rawText,
        },
      ],
    });
  }

  return pages;
}

/**
 * Seeds synthetic documents into store if not already present.
 */
export function ensureSyntheticDocumentsSeeded(): void {
  for (const key of Object.keys(SYNTHETIC_DOCUMENTS)) {
    if (!documentsStore.has(key)) {
      const seeded = getSeededDocumentRecord(key);
      if (seeded) {
        documentsStore.set(key, seeded);
      } else {
        const syn = SYNTHETIC_DOCUMENTS[key];
        const pages = parseRawTextIntoPages(syn.id, syn.content);
        const doc: DocumentRecord = {
          id: syn.id,
          name: syn.name,
          mimeType: "text/plain",
          pageCount: pages.length,
          rawText: syn.content,
          documentType: syn.documentType,
          parties: [],
          pages,
          clauses: [],
          obligations: [],
          timelineEvents: [],
          findings: [],
          questions: [],
          evidence: {},
          analysisStatus: "completed",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        documentsStore.set(syn.id, doc);
      }
    }
  }
}

// Seed upon module load
ensureSyntheticDocumentsSeeded();

export function getAllDocuments(): DocumentRecord[] {
  ensureSyntheticDocumentsSeeded();
  return Array.from(documentsStore.values()).sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export function getDocumentById(id: string): DocumentRecord | undefined {
  ensureSyntheticDocumentsSeeded();
  return documentsStore.get(id);
}

export function saveDocument(doc: DocumentRecord): DocumentRecord {
  doc.updatedAt = new Date().toISOString();
  documentsStore.set(doc.id, doc);
  return doc;
}

export function createDocumentFromUpload(
  name: string,
  rawText: string,
  mimeType: "application/pdf" | "text/plain" = "application/pdf"
): DocumentRecord {
  const id = `doc_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const pages = parseRawTextIntoPages(id, rawText);

  const doc: DocumentRecord = {
    id,
    name,
    mimeType,
    pageCount: pages.length,
    rawText,
    documentType: "unknown",
    parties: [],
    pages,
    clauses: [],
    obligations: [],
    timelineEvents: [],
    findings: [],
    questions: [],
    evidence: {},
    analysisStatus: "uploaded",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  documentsStore.set(id, doc);
  return doc;
}
