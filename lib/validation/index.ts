// LexLens Validation Layer - Based on 03_DATA_SCHEMA.md, 04_AI_PIPELINE.md, and 06_TECHNICAL_ARCHITECTURE.md
import {
  Evidence,
  Clause,
  Obligation,
  Finding,
  TimelineEvent,
  Party,
  Page,
  Section,
  DocumentRecord,
  QAStatus,
  QAResponse,
  Difference,
  Comparison
} from "@/lib/types";
import { AIAnalysisResultSchema } from "@/lib/schemas";

/**
 * Normalizes text for evidence matching (collapsing extra whitespace, trim)
 */
export function normalizeText(text: string): string {
  return text.replace(/\s+/g, " ").trim();
}

/**
 * Verifies if an excerpt actually exists in the full document text.
 */
export function verifyEvidenceInDocument(sourceText: string, documentRawText: string): {
  verified: boolean;
  offset?: number;
} {
  if (!sourceText || !documentRawText) {
    return { verified: false };
  }

  const normQuote = normalizeText(sourceText);
  const normDoc = normalizeText(documentRawText);

  const idx = normDoc.toLowerCase().indexOf(normQuote.toLowerCase());
  if (idx !== -1) {
    return { verified: true, offset: idx };
  }

  // Fallback: check if at least 70% consecutive words match for OCR / whitespace variations
  const words = normQuote.split(" ");
  if (words.length > 5) {
    const subQuote = words.slice(0, Math.min(words.length, 8)).join(" ");
    const subIdx = normDoc.toLowerCase().indexOf(subQuote.toLowerCase());
    if (subIdx !== -1) {
      return { verified: true, offset: subIdx };
    }
  }

  return { verified: false };
}

/**
 * Validates and transforms AI analysis output into strongly-typed document entities.
 */
export function validateAndTransformAnalysis(
  documentId: string,
  rawAIResult: unknown,
  documentRawText: string
): {
  documentType: DocumentRecord["documentType"];
  parties: Party[];
  effectiveDate?: string;
  startDate?: string;
  endDate?: string;
  clauses: Clause[];
  obligations: Obligation[];
  timelineEvents: TimelineEvent[];
  findings: Finding[];
  evidenceMap: Record<string, Evidence>;
} {
  // 1. Validate JSON schema
  const parsed = AIAnalysisResultSchema.parse(rawAIResult);

  const evidenceMap: Record<string, Evidence> = {};
  let evidenceCounter = 1;

  function createEvidence(
    quote: string,
    pageNumber: number = 1,
    sectionLabel?: string,
    relevance: "direct" | "supporting" | "related" = "direct"
  ): string {
    const id = `ev_${documentId}_${evidenceCounter++}`;
    const verification = verifyEvidenceInDocument(quote, documentRawText);

    const ev: Evidence = {
      id,
      documentId,
      pageNumber: Math.max(1, pageNumber),
      sectionLabel,
      sourceText: quote,
      startOffset: verification.offset,
      relevance,
    };
    evidenceMap[id] = ev;
    return id;
  }

  // 2. Transform Parties
  const parties: Party[] = parsed.parties.map((p, idx) => {
    const evidenceIds: string[] = [];
    if (p.exactQuote) {
      evidenceIds.push(createEvidence(p.exactQuote, 1, "Preamble / Parties"));
    }
    return {
      id: `party_${documentId}_${idx + 1}`,
      name: p.name,
      role: p.role ?? undefined,
      type: (p.type === "person" || p.type === "organization") ? p.type : "unknown",
      evidenceIds,
    };
  });

  // 3. Transform Clauses
  const clauses: Clause[] = parsed.clauses.map((c, idx) => {
    const evId = createEvidence(c.exactQuote, c.pageNumber, c.sectionNumber || `Section ${idx + 1}`);
    return {
      id: `clause_${documentId}_${idx + 1}`,
      documentId,
      sectionNumber: c.sectionNumber ?? undefined,
      category: (c.category.toLowerCase().replace(/[\s-]+/g, "_") as any) || "other",
      title: c.title,
      summary: c.summary,
      partyIds: [],
      evidenceIds: [evId],
      confidence: typeof c.confidence === "number" ? Math.min(1, Math.max(0, c.confidence)) : 0.9,
      interpretation: c.interpretation ?? undefined,
    };
  });

  // 4. Transform Obligations
  const obligations: Obligation[] = parsed.obligations.map((o, idx) => {
    const evId = createEvidence(o.exactQuote, o.pageNumber, o.sectionLabel || `Obligation ${idx + 1}`);
    return {
      id: `obl_${documentId}_${idx + 1}`,
      documentId,
      partyName: o.partyName,
      action: o.action,
      condition: o.condition ?? undefined,
      deadline: o.deadline ?? undefined,
      deadlineType: (o.deadlineType as any) || "event_based",
      consequence: o.consequence ?? undefined,
      evidenceIds: [evId],
      confidence: typeof o.confidence === "number" ? Math.min(1, Math.max(0, o.confidence)) : 0.9,
    };
  });

  // 5. Transform Timeline Events
  const timelineEvents: TimelineEvent[] = parsed.timelineEvents.map((t, idx) => {
    const evId = createEvidence(t.exactQuote, t.pageNumber, "Timeline");
    return {
      id: `time_${documentId}_${idx + 1}`,
      documentId,
      label: t.label,
      date: t.date ?? undefined,
      relativeTime: t.relativeTime ?? undefined,
      trigger: t.trigger ?? undefined,
      description: t.description,
      evidenceIds: [evId],
      confidence: typeof t.confidence === "number" ? Math.min(1, Math.max(0, t.confidence)) : 0.9,
    };
  });

  // 6. Transform Findings
  const findings: Finding[] = parsed.findings.map((f, idx) => {
    const evIds = f.exactQuotes.map((q, qIdx) => {
      const page = f.pageNumbers[qIdx] || f.pageNumbers[0] || 1;
      const sec = f.relatedSections[qIdx] || f.relatedSections[0] || `Section finding ${idx + 1}`;
      return createEvidence(q, page, sec);
    });

    return {
      id: `find_${documentId}_${idx + 1}`,
      documentId,
      type: (f.type.toLowerCase().replace(/[\s-]+/g, "_") as any) || "inconsistency",
      title: f.title,
      description: f.description,
      severity: (f.severity.toLowerCase() as any) || "medium",
      confidence: typeof f.confidence === "number" ? Math.min(1, Math.max(0, f.confidence)) : 0.85,
      evidenceIds: evIds,
      relatedClauseIds: [],
      uncertainty: f.uncertainty ?? undefined,
    };
  });

  const validDocType: DocumentRecord["documentType"] =
    ["employment", "rental", "nda", "service", "freelance", "vendor", "terms", "policy", "other"].includes(
      parsed.documentType.toLowerCase()
    )
      ? (parsed.documentType.toLowerCase() as any)
      : "employment";

  return {
    documentType: validDocType,
    parties,
    effectiveDate: parsed.effectiveDate ?? undefined,
    startDate: parsed.startDate ?? undefined,
    endDate: parsed.endDate ?? undefined,
    clauses,
    obligations,
    timelineEvents,
    findings,
    evidenceMap,
  };
}
