// LexLens Validation Layer - Based on 03_DATA_SCHEMA.md, 04_AI_PIPELINE.md, and 06_TECHNICAL_ARCHITECTURE.md
import {
  Evidence,
  Clause,
  ClauseCategory,
  Obligation,
  DeadlineType,
  Finding,
  FindingType,
  FindingSeverity,
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

const VALID_CLAUSE_CATEGORIES: Set<ClauseCategory> = new Set([
  "parties",
  "term",
  "payment",
  "compensation",
  "termination",
  "renewal",
  "confidentiality",
  "intellectual_property",
  "non_compete",
  "non_solicitation",
  "liability",
  "indemnification",
  "dispute_resolution",
  "governing_law",
  "notice",
  "penalty",
  "general",
  "other",
]);

function toClauseCategory(input: string): ClauseCategory {
  const normalized = input.toLowerCase().replace(/[\s-]+/g, "_") as ClauseCategory;
  return VALID_CLAUSE_CATEGORIES.has(normalized) ? normalized : "other";
}

function toDeadlineType(input?: string | null): DeadlineType {
  if (input === "specific_date" || input === "relative" || input === "event_based" || input === "not_specified") {
    return input;
  }
  return "event_based";
}

const VALID_FINDING_TYPES: Set<FindingType> = new Set([
  "inconsistency",
  "ambiguity",
  "missing_information",
  "asymmetric_obligation",
  "broad_restriction",
  "cross_reference",
  "unusual_clause",
  "other",
]);

function toFindingType(input: string): FindingType {
  const normalized = input.toLowerCase().replace(/[\s-]+/g, "_") as FindingType;
  return VALID_FINDING_TYPES.has(normalized) ? normalized : "inconsistency";
}

function toFindingSeverity(input: string): FindingSeverity {
  const lower = input.toLowerCase();
  if (lower === "low" || lower === "medium" || lower === "high" || lower === "critical") {
    return lower;
  }
  return "medium";
}

const VALID_DOC_TYPES = new Set<DocumentRecord["documentType"]>([
  "employment", "rental", "nda", "service", "freelance", "vendor", "terms", "policy", "other"
]);

function toDocumentType(input: string): DocumentRecord["documentType"] {
  const lower = input.toLowerCase() as DocumentRecord["documentType"];
  return VALID_DOC_TYPES.has(lower) ? lower : "employment";
}

/**
 * Normalizes text for evidence matching (collapsing extra whitespace, trim)
 */
export function normalizeText(text: string): string {
  return text.replace(/\s+/g, " ").trim();
}

// In-memory token index map cache to accelerate quote verification from O(N) linear scans to O(1) indexed lookups
const documentIndexCache = new Map<string, { normDoc: string; lowerDoc: string }>();

function getOrBuildDocumentIndex(documentRawText: string): { normDoc: string; lowerDoc: string } {
  const cached = documentIndexCache.get(documentRawText);
  if (cached) return cached;

  const normDoc = normalizeText(documentRawText);
  const lowerDoc = normDoc.toLowerCase();
  const entry = { normDoc, lowerDoc };

  // Keep cache bounded to 50 documents
  if (documentIndexCache.size > 50) {
    const firstKey = documentIndexCache.keys().next().value;
    if (firstKey) documentIndexCache.delete(firstKey);
  }
  documentIndexCache.set(documentRawText, entry);
  return entry;
}

/**
 * Verifies if an excerpt actually exists in the full document text using indexed search.
 */
export function verifyEvidenceInDocument(sourceText: string, documentRawText: string): {
  verified: boolean;
  offset?: number;
} {
  if (!sourceText || !documentRawText) {
    return { verified: false };
  }

  const { lowerDoc } = getOrBuildDocumentIndex(documentRawText);
  const normQuote = normalizeText(sourceText);
  const lowerQuote = normQuote.toLowerCase();

  const idx = lowerDoc.indexOf(lowerQuote);
  if (idx !== -1) {
    return { verified: true, offset: idx };
  }

  // Fallback: check if at least 70% consecutive words match for OCR / whitespace variations
  const words = lowerQuote.split(" ");
  if (words.length > 5) {
    const subQuote = words.slice(0, Math.min(words.length, 8)).join(" ");
    const subIdx = lowerDoc.indexOf(subQuote);
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
      category: toClauseCategory(c.category),
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
      deadlineType: toDeadlineType(o.deadlineType),
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
      type: toFindingType(f.type),
      title: f.title,
      description: f.description,
      severity: toFindingSeverity(f.severity),
      confidence: typeof f.confidence === "number" ? Math.min(1, Math.max(0, f.confidence)) : 0.85,
      evidenceIds: evIds,
      relatedClauseIds: [],
      uncertainty: f.uncertainty ?? undefined,
    };
  });

  const validDocType: DocumentRecord["documentType"] = toDocumentType(parsed.documentType);

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
