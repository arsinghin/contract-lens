import { z } from "zod";

export const EvidenceSchema = z.object({
  id: z.string(),
  documentId: z.string(),
  pageNumber: z.number().int().positive(),
  sectionId: z.string().optional(),
  sectionLabel: z.string().optional(),
  sourceText: z.string().min(1),
  startOffset: z.number().optional(),
  endOffset: z.number().optional(),
  relevance: z.enum(["direct", "supporting", "related"]),
});

export const ClauseSchema = z.object({
  id: z.string(),
  documentId: z.string(),
  sectionNumber: z.string().optional(),
  category: z.enum([
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
  ]),
  title: z.string().min(1),
  summary: z.string().min(1),
  partyIds: z.array(z.string()).default([]),
  evidenceIds: z.array(z.string()).default([]),
  confidence: z.number().min(0).max(1),
  interpretation: z.string().optional(),
});

export const ObligationSchema = z.object({
  id: z.string(),
  documentId: z.string(),
  partyId: z.string().optional(),
  partyName: z.string().optional(),
  clauseId: z.string().optional(),
  action: z.string().min(1),
  condition: z.string().optional(),
  deadline: z.string().optional(),
  deadlineType: z.enum([
    "specific_date",
    "relative",
    "event_based",
    "not_specified",
  ]).optional(),
  consequence: z.string().optional(),
  evidenceIds: z.array(z.string()).default([]),
  confidence: z.number().min(0).max(1),
});

export const TimelineEventSchema = z.object({
  id: z.string(),
  documentId: z.string().optional(),
  label: z.string().min(1),
  date: z.string().optional(),
  relativeTime: z.string().optional(),
  trigger: z.string().optional(),
  description: z.string().min(1),
  evidenceIds: z.array(z.string()).default([]),
  confidence: z.number().min(0).max(1).optional(),
});

export const FindingSchema = z.object({
  id: z.string(),
  documentId: z.string(),
  type: z.enum([
    "inconsistency",
    "ambiguity",
    "missing_information",
    "asymmetric_obligation",
    "broad_restriction",
    "cross_reference",
    "unusual_clause",
    "other",
  ]),
  title: z.string().min(1),
  description: z.string().min(1),
  severity: z.enum(["low", "medium", "high", "critical", "unknown"]),
  confidence: z.number().min(0).max(1),
  evidenceIds: z.array(z.string()).default([]),
  relatedClauseIds: z.array(z.string()).default([]),
  uncertainty: z.string().optional(),
});

export const PartySchema = z.object({
  id: z.string(),
  name: z.string().min(1),
  role: z.string().optional(),
  type: z.enum(["person", "organization", "unknown"]),
  evidenceIds: z.array(z.string()).default([]),
});

export const QAResponseSchema = z.object({
  id: z.string(),
  documentId: z.string(),
  question: z.string().min(1),
  status: z.enum(["established", "answered", "not_established", "ambiguous"]),
  answer: z.string().min(1),
  evidenceIds: z.array(z.string()).default([]),
  relatedClauseIds: z.array(z.string()).default([]),
  uncertainty: z.string().optional(),
  createdAt: z.string(),
});

export const DifferenceSchema = z.object({
  id: z.string(),
  category: z.enum([
    "added",
    "removed",
    "modified",
    "obligation_change",
    "date_change",
    "financial_change",
    "restriction_change",
    "risk_shift",
    "wording_only",
    "other",
  ]),
  topic: z.string().min(1),
  documentAText: z.string().optional(),
  documentBText: z.string().optional(),
  explanation: z.string().min(1),
  material: z.boolean(),
  evidenceAIds: z.array(z.string()).default([]),
  evidenceBIds: z.array(z.string()).default([]),
  confidence: z.number().min(0).max(1),
});

export const ComparisonSchema = z.object({
  id: z.string(),
  documentAId: z.string(),
  documentBId: z.string(),
  differences: z.array(DifferenceSchema),
  createdAt: z.string(),
});

// AI Model Output Extraction Schemas
export const AIExtractedClause = z.object({
  sectionNumber: z.string().nullish(),
  category: z.string().default("general"),
  title: z.string().default("Clause"),
  summary: z.string().default(""),
  parties: z.array(z.string()).default([]),
  exactQuote: z.string().default(""),
  pageNumber: z.coerce.number().int().default(1),
  confidence: z.coerce.number().default(0.9),
  interpretation: z.string().nullish(),
});

export const AIExtractedObligation = z.object({
  partyName: z.string().default("Unspecified Party"),
  action: z.string().default(""),
  condition: z.string().nullish(),
  deadline: z.string().nullish(),
  deadlineType: z.string().nullish(),
  consequence: z.string().nullish(),
  exactQuote: z.string().default(""),
  pageNumber: z.coerce.number().int().default(1),
  sectionLabel: z.string().nullish(),
  confidence: z.coerce.number().default(0.9),
});

export const AIExtractedFinding = z.object({
  type: z.string().default("inconsistency"),
  title: z.string().default("Finding"),
  description: z.string().default(""),
  severity: z.string().default("medium"),
  exactQuotes: z.preprocess((val) => {
    if (typeof val === "string") return [val];
    if (Array.isArray(val)) return val.filter(Boolean);
    return [];
  }, z.array(z.string()).default([])),
  pageNumbers: z.preprocess((val) => {
    if (typeof val === "number") return [val];
    if (Array.isArray(val)) return val;
    return [1];
  }, z.array(z.coerce.number()).default([1])),
  relatedSections: z.preprocess((val) => {
    if (typeof val === "string") return [val];
    if (Array.isArray(val)) return val;
    return [];
  }, z.array(z.string()).default([])),
  uncertainty: z.string().nullish(),
  confidence: z.coerce.number().default(0.85),
});

export const AIExtractedTimeline = z.object({
  label: z.string().default("Key Date"),
  date: z.string().nullish(),
  relativeTime: z.string().nullish(),
  trigger: z.string().nullish(),
  description: z.string().default(""),
  exactQuote: z.string().default(""),
  pageNumber: z.coerce.number().int().default(1),
  confidence: z.coerce.number().default(0.9),
});

export const AIAnalysisResultSchema = z.object({
  documentType: z.string().default("other"),
  documentTypeConfidence: z.coerce.number().default(0.9),
  parties: z.array(z.object({
    name: z.string().default("Unnamed Party"),
    role: z.string().nullish(),
    type: z.string().nullish(),
    exactQuote: z.string().nullish(),
  })).default([]),
  effectiveDate: z.string().nullish(),
  startDate: z.string().nullish(),
  endDate: z.string().nullish(),
  clauses: z.array(AIExtractedClause).default([]),
  obligations: z.array(AIExtractedObligation).default([]),
  timelineEvents: z.array(AIExtractedTimeline).default([]),
  findings: z.array(AIExtractedFinding).default([]),
});
