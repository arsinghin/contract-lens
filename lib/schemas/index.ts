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
    "other",
  ]),
  title: z.string().min(1),
  summary: z.string().min(1),
  partyIds: z.array(z.string()).default([]),
  evidenceIds: z.array(z.string()).min(1),
  confidence: z.number().min(0).max(1),
  interpretation: z.string().optional(),
});

export const ObligationSchema = z.object({
  id: z.string(),
  documentId: z.string(),
  partyId: z.string().optional(),
  partyName: z.string().optional(),
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
  evidenceIds: z.array(z.string()).min(1),
  confidence: z.number().min(0).max(1),
});

export const TimelineEventSchema = z.object({
  id: z.string(),
  documentId: z.string(),
  label: z.string().min(1),
  date: z.string().optional(),
  relativeTime: z.string().optional(),
  trigger: z.string().optional(),
  description: z.string().min(1),
  evidenceIds: z.array(z.string()).min(1),
  confidence: z.number().min(0).max(1),
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
    "other",
  ]),
  title: z.string().min(1),
  description: z.string().min(1),
  severity: z.enum(["low", "medium", "high", "unknown"]),
  confidence: z.number().min(0).max(1),
  evidenceIds: z.array(z.string()).min(1),
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
  sectionNumber: z.string().optional(),
  category: z.string(),
  title: z.string(),
  summary: z.string(),
  parties: z.array(z.string()).default([]),
  exactQuote: z.string(),
  pageNumber: z.number().int().default(1),
  confidence: z.number().default(0.9),
  interpretation: z.string().optional(),
});

export const AIExtractedObligation = z.object({
  partyName: z.string(),
  action: z.string(),
  condition: z.string().optional(),
  deadline: z.string().optional(),
  deadlineType: z.string().optional(),
  consequence: z.string().optional(),
  exactQuote: z.string(),
  pageNumber: z.number().int().default(1),
  sectionLabel: z.string().optional(),
  confidence: z.number().default(0.9),
});

export const AIExtractedFinding = z.object({
  type: z.string(),
  title: z.string(),
  description: z.string(),
  severity: z.string(),
  exactQuotes: z.array(z.string()).min(1),
  pageNumbers: z.array(z.number()).default([1]),
  relatedSections: z.array(z.string()).default([]),
  uncertainty: z.string().optional(),
  confidence: z.number().default(0.85),
});

export const AIExtractedTimeline = z.object({
  label: z.string(),
  date: z.string().optional(),
  relativeTime: z.string().optional(),
  trigger: z.string().optional(),
  description: z.string(),
  exactQuote: z.string(),
  pageNumber: z.number().int().default(1),
  confidence: z.number().default(0.9),
});

export const AIAnalysisResultSchema = z.object({
  documentType: z.string(),
  documentTypeConfidence: z.number().default(0.9),
  parties: z.array(z.object({
    name: z.string(),
    role: z.string().optional(),
    type: z.string().optional(),
    exactQuote: z.string().optional(),
  })),
  effectiveDate: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  clauses: z.array(AIExtractedClause),
  obligations: z.array(AIExtractedObligation),
  timelineEvents: z.array(AIExtractedTimeline).default([]),
  findings: z.array(AIExtractedFinding).default([]),
});
