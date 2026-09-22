// LexLens Core Data Types - Based on 03_DATA_SCHEMA.md and 13_API_SPEC.md

export type DocumentType =
  | "employment"
  | "rental"
  | "nda"
  | "service"
  | "freelance"
  | "vendor"
  | "terms"
  | "policy"
  | "other"
  | "unknown";

export type AnalysisStatus =
  | "uploaded"
  | "processing"
  | "completed"
  | "partial"
  | "failed";

export type RelevanceType = "direct" | "supporting" | "related";

export interface Evidence {
  id: string;
  documentId: string;
  pageNumber: number;
  sectionId?: string;
  sectionLabel?: string;
  sourceText: string;
  startOffset?: number;
  endOffset?: number;
  relevance: RelevanceType;
}

export type ClauseCategory =
  | "parties"
  | "term"
  | "payment"
  | "compensation"
  | "termination"
  | "renewal"
  | "confidentiality"
  | "intellectual_property"
  | "non_compete"
  | "non_solicitation"
  | "liability"
  | "indemnification"
  | "dispute_resolution"
  | "governing_law"
  | "notice"
  | "penalty"
  | "general"
  | "other";

export interface Clause {
  id: string;
  documentId: string;
  sectionNumber?: string;
  category: ClauseCategory;
  title: string;
  summary: string;
  partyIds?: string[];
  evidenceIds: string[];
  confidence: number;
  interpretation?: string;
}

export type DeadlineType =
  | "specific_date"
  | "relative"
  | "event_based"
  | "not_specified";

export interface Obligation {
  id: string;
  documentId: string;
  clauseId?: string;
  partyId?: string;
  partyName?: string;
  action: string;
  condition?: string;
  deadline?: string;
  deadlineType?: DeadlineType;
  consequence?: string;
  evidenceIds: string[];
  confidence: number;
}

export interface TimelineEvent {
  id: string;
  documentId?: string;
  label: string;
  date?: string;
  relativeTime?: string;
  trigger?: string;
  description: string;
  evidenceIds: string[];
  confidence?: number;
}

export type FindingType =
  | "inconsistency"
  | "ambiguity"
  | "missing_information"
  | "asymmetric_obligation"
  | "broad_restriction"
  | "cross_reference"
  | "unusual_clause"
  | "other";

export type FindingSeverity = "low" | "medium" | "high" | "critical" | "unknown";

export interface Finding {
  id: string;
  documentId: string;
  type: FindingType;
  title: string;
  description: string;
  severity: FindingSeverity;
  confidence: number;
  evidenceIds: string[];
  relatedClauseIds: string[];
  uncertainty?: string;
}

export interface Party {
  id: string;
  name: string;
  role?: string;
  type: "person" | "organization" | "unknown";
  evidenceIds: string[];
}

export interface Section {
  id: string;
  pageId: string;
  sectionNumber?: string;
  heading?: string;
  text: string;
}

export interface Page {
  id: string;
  documentId: string;
  pageNumber: number;
  text: string;
  sections: Section[];
}

export interface Question {
  id: string;
  documentId: string;
  text: string;
  type: "document_question" | "lawyer_preparation";
  relatedClauseIds: string[];
  relatedFindingIds: string[];
  evidenceIds: string[];
}

export type QAStatus = "established" | "answered" | "not_established" | "ambiguous";

export interface QAResponse {
  id: string;
  documentId: string;
  question: string;
  status: QAStatus;
  answer: string;
  evidenceIds: string[];
  relatedClauseIds: string[];
  uncertainty?: string;
  createdAt: string;
}

export type DifferenceCategory =
  | "added"
  | "removed"
  | "modified"
  | "obligation_change"
  | "restriction_change"
  | "risk_shift"
  | "wording_only"
  | "date_change"
  | "financial_change"
  | "other";

export interface Difference {
  id: string;
  category: DifferenceCategory;
  topic: string;
  documentAText?: string;
  documentBText?: string;
  explanation: string;
  material: boolean;
  evidenceAIds: string[];
  evidenceBIds: string[];
  evidenceDocA?: string[];
  evidenceDocB?: string[];
  confidence: number;
}

export interface Comparison {
  id?: string;
  documentAId: string;
  documentBId: string;
  differences: Difference[];
  createdAt?: string;
}

export interface UnresolvedItem {
  id: string;
  type: "not_found" | "ambiguous" | "conflicting" | "unreadable";
  description: string;
  evidenceIds: string[];
}

export interface DocumentRecord {
  id: string;
  name: string;
  mimeType: "application/pdf" | "text/plain";
  pageCount: number;
  rawText?: string;
  documentType: DocumentType;
  documentTypeConfidence?: number;
  parties: Party[];
  effectiveDate?: string;
  startDate?: string;
  endDate?: string;
  pages: Page[];
  clauses: Clause[];
  obligations: Obligation[];
  timelineEvents: TimelineEvent[];
  findings: Finding[];
  questions: Question[];
  qaHistory?: Record<string, QAResponse>;
  evidence: Record<string, Evidence>;
  analysisStatus: AnalysisStatus;
  comparisons?: Record<string, Comparison>;
  lawyerPrep?: LawyerPreparationOutput;
  createdAt: string;
  updatedAt: string;
}

export interface LawyerPreparationOutput {
  documentId: string;
  questionsForCounsel: {
    question: string;
    reason: string;
    relatedClauseId?: string;
    evidenceIds: string[];
  }[];
  reviewChecklist: {
    item: string;
    category: string;
    status: "verify" | "clarify" | "negotiate";
    evidenceIds: string[];
  }[];
  missingInformation: string[];
}
