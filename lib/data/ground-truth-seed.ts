// Ground-Truth Seed Data for Preloaded Documents
// Exactly matched to SYNTHETIC_DOCUMENTS text
import { DocumentRecord, Clause, Obligation, Finding, TimelineEvent, Evidence, Party } from "@/lib/types";
import { SYNTHETIC_DOCUMENTS } from "./synthetic-documents";
import { parseRawTextIntoPages } from "@/lib/documents/document-service";
import { verifyEvidenceInDocument } from "@/lib/validation";

export function getSeededDocumentRecord(docId: string): DocumentRecord | null {
  const syn = SYNTHETIC_DOCUMENTS[docId];
  if (!syn) return null;

  const rawText = syn.content;
  const pages = parseRawTextIntoPages(syn.id, rawText);
  const evidenceMap: Record<string, Evidence> = {};

  const makeEv = (id: string, quote: string, sectionLabel?: string, page = 1): string => {
    const ver = verifyEvidenceInDocument(quote, rawText);
    evidenceMap[id] = {
      id,
      documentId: syn.id,
      pageNumber: page,
      sectionLabel,
      sourceText: quote,
      startOffset: ver.offset,
      relevance: "direct",
    };
    return id;
  };

  if (docId === "employment-v1") {
    const ev1 = makeEv("ev_emp1_comp", "$185,000 per annum, subject to standard payroll withholdings", "Section 3.1");
    const ev2 = makeEv("ev_emp1_prob", "probationary period (\"Probation Period\")", "Section 2.2");
    const ev3 = makeEv("ev_emp1_prob_not", "providing fourteen (14) days' prior written notice", "Section 2.2");
    const ev4 = makeEv("ev_emp1_res_60", "sixty (60) days prior written notice to the Company", "Section 8.2");
    const ev5 = makeEv("ev_emp1_res_30", "thirty (30) days prior written notice to the Employer", "Section 17.1");
    const ev6 = makeEv("ev_emp1_prop", "within seven (7) days", "Section 4.3");
    const ev7 = makeEv("ev_emp1_exit", "within five (5) business days prior to the final working date", "Section 9.1");
    const ev8 = makeEv("ev_emp1_settle", "within thirty (30) days after the Employee's last working day", "Section 17.2");
    const ev9 = makeEv("ev_emp1_conf", "confidential and proprietary information (\"Confidential Information\")", "Section 4.1");
    const ev10 = makeEv("ev_emp1_nonsol", "period of six (6) months following the termination of employment", "Section 6.1");
    const ev11 = makeEv("ev_emp1_ref22", "Section 22.2 of the Corporate Dispute Schedule", "Section 12.1");

    const parties: Party[] = [
      { id: "p1", name: "APEX GLOBAL TECHNOLOGIES INC.", role: "Employer", type: "organization", evidenceIds: [] },
      { id: "p2", name: "JANE DOE", role: "Employee", type: "person", evidenceIds: [] },
    ];

    const clauses: Clause[] = [
      {
        id: "cl_emp1_1",
        documentId: syn.id,
        sectionNumber: "1",
        title: "Position and Duties",
        category: "general",
        summary: "Employee serves as Senior Engineering Director, reporting directly to the Chief Technology Officer.",
        confidence: 0.98,
        evidenceIds: [],
      },
      {
        id: "cl_emp1_2_2",
        documentId: syn.id,
        sectionNumber: "2.2",
        title: "Probation Period",
        category: "term",
        summary: "90-day probationary period during which either party may terminate upon 14 days' prior written notice.",
        confidence: 0.99,
        evidenceIds: [ev2, ev3],
      },
      {
        id: "cl_emp1_3",
        documentId: syn.id,
        sectionNumber: "3",
        title: "Compensation and Benefits",
        category: "compensation",
        summary: "Base salary of $185,000 per annum paid monthly on the last business day.",
        interpretation: "Standard monthly salary payment cadence.",
        confidence: 0.97,
        evidenceIds: [ev1],
      },
      {
        id: "cl_emp1_4",
        documentId: syn.id,
        sectionNumber: "4",
        title: "Confidentiality",
        category: "confidentiality",
        summary: "Perpetual duty of confidentiality regarding trade secrets, source code, and customer data.",
        confidence: 0.96,
        evidenceIds: [ev9],
      },
      {
        id: "cl_emp1_6",
        documentId: syn.id,
        sectionNumber: "6",
        title: "Restrictive Covenants",
        category: "non_solicitation",
        summary: "Restricts soliciting employees or customers for six (6) months post-termination.",
        confidence: 0.95,
        evidenceIds: [ev10],
      },
      {
        id: "cl_emp1_8_2",
        documentId: syn.id,
        sectionNumber: "8.2",
        title: "Voluntary Resignation Notice Period",
        category: "notice",
        summary: "Requires sixty (60) days prior written notice from employee upon voluntary resignation.",
        interpretation: "Directly conflicts with Section 17.1 which specifies 30 days notice.",
        confidence: 0.99,
        evidenceIds: [ev4],
      },
      {
        id: "cl_emp1_12",
        documentId: syn.id,
        sectionNumber: "12",
        title: "Dispute Resolution",
        category: "dispute_resolution",
        summary: "References Section 22.2 of Corporate Dispute Schedule which is absent from document.",
        interpretation: "Broken cross-reference to nonexistent schedule.",
        confidence: 0.95,
        evidenceIds: [ev11],
      },
      {
        id: "cl_emp1_17_1",
        documentId: syn.id,
        sectionNumber: "17.1",
        title: "Notice Requirements",
        category: "notice",
        summary: "Employee may terminate agreement by providing thirty (30) days prior written notice to Employer.",
        interpretation: "Direct contradiction with Section 8.2 requirement of 60 days.",
        confidence: 0.99,
        evidenceIds: [ev5],
      },
      {
        id: "cl_emp1_17_2",
        documentId: syn.id,
        sectionNumber: "17.2",
        title: "Final Settlement",
        category: "payment",
        summary: "Final settlement and statutory pay issued within 30 days after last working day.",
        confidence: 0.96,
        evidenceIds: [ev8],
      },
    ];

    const obligations: Obligation[] = [
      {
        id: "obl_emp1_1",
        documentId: syn.id,
        clauseId: "cl_emp1_8_2",
        partyName: "Jane Doe",
        action: "Provide sixty (60) days prior written notice to the Company upon voluntary resignation",
        deadline: "60 days prior to resignation",
        condition: "Voluntary resignation under Section 8.2",
        confidence: 0.99,
        evidenceIds: [ev4],
      },
      {
        id: "obl_emp1_2",
        documentId: syn.id,
        clauseId: "cl_emp1_17_1",
        partyName: "Jane Doe",
        action: "Provide thirty (30) days prior written notice to the Employer",
        deadline: "30 days prior written notice",
        condition: "Resignation under Section 17.1",
        confidence: 0.99,
        evidenceIds: [ev5],
      },
      {
        id: "obl_emp1_3",
        documentId: syn.id,
        clauseId: "cl_emp1_2_2",
        partyName: "Employee / Company",
        action: "Provide fourteen (14) days' prior written notice to terminate employment during probation",
        deadline: "14 days prior notice",
        condition: "During 90-day probationary period",
        confidence: 0.99,
        evidenceIds: [ev3],
      },
      {
        id: "obl_emp1_4",
        documentId: syn.id,
        clauseId: "cl_emp1_4",
        partyName: "Jane Doe",
        action: "Return all Company property, laptops, access tokens, and confidential materials within seven (7) days",
        deadline: "within seven (7) days of termination",
        confidence: 0.98,
        evidenceIds: [ev6],
      },
      {
        id: "obl_emp1_5",
        documentId: syn.id,
        clauseId: "cl_emp1_1",
        partyName: "Jane Doe",
        action: "Participate in exit interview within five (5) business days prior to final working date",
        deadline: "within five (5) business days",
        condition: "If requested by the Company",
        confidence: 0.96,
        evidenceIds: [ev7],
      },
      {
        id: "obl_emp1_6",
        documentId: syn.id,
        clauseId: "cl_emp1_17_2",
        partyName: "APEX GLOBAL TECHNOLOGIES INC.",
        action: "Issue final settlement and statutory pay within thirty (30) days after Employee's last working day",
        deadline: "within thirty (30) days after last working day",
        confidence: 0.97,
        evidenceIds: [ev8],
      },
    ];

    const findings: Finding[] = [
      {
        id: "find_emp1_1",
        documentId: syn.id,
        type: "inconsistency",
        title: "Conflicting Notice Periods for Voluntary Resignation",
        description: "Section 8.2 specifies that the employee must give sixty (60) days written notice upon voluntary resignation, whereas Section 17.1 specifies that the employee may terminate by providing thirty (30) days prior written notice. This creates material legal uncertainty regarding required departure timing.",
        severity: "critical",
        confidence: 0.99,
        evidenceIds: [ev4, ev5],
        relatedClauseIds: ["cl_emp1_8_2", "cl_emp1_17_1"],
      },
      {
        id: "find_emp1_2",
        documentId: syn.id,
        type: "missing_information",
        title: "Absence of Severance Payout Schedule",
        description: "While the agreement establishes detailed termination procedures (Section 7, Section 8) and offboarding terms (Section 17), it does not establish any severance calculation, formula, or payout entitlement upon termination without cause.",
        severity: "high",
        confidence: 0.95,
        evidenceIds: [],
        relatedClauseIds: [],
        uncertainty: "Severance terms are omitted from the document text.",
      },
      {
        id: "find_emp1_3",
        documentId: syn.id,
        type: "cross_reference",
        title: "Broken Cross Reference to Section 22 and Corporate Dispute Schedule",
        description: "Section 12.1 refers to arbitration rules outlined in Section 22.2 of the Corporate Dispute Schedule, but the agreement concludes without attaching Section 22 or the Corporate Dispute Schedule.",
        severity: "medium",
        confidence: 0.97,
        evidenceIds: [ev11],
        relatedClauseIds: ["cl_emp1_12"],
      },
      {
        id: "find_emp1_4",
        documentId: syn.id,
        type: "broad_restriction",
        title: "Perpetual Confidentiality on Non-Trade-Secret Data",
        description: "Section 4 establishes perpetual confidentiality obligations without limiting survival duration for non-trade secret commercial information.",
        severity: "low",
        confidence: 0.92,
        evidenceIds: [ev9],
        relatedClauseIds: ["cl_emp1_4"],
      },
    ];

    const timelineEvents: TimelineEvent[] = [
      {
        id: "tl_emp1_1",
        label: "Effective Date",
        date: "2025-01-15",
        description: "Agreement entered into as of January 15, 2025",
        evidenceIds: [],
      },
      {
        id: "tl_emp1_2",
        label: "Commencement of Employment",
        date: "2025-02-01",
        description: "Start Date of employment",
        evidenceIds: [],
      },
      {
        id: "tl_emp1_3",
        label: "Probationary Period",
        relativeTime: "First ninety (90) days",
        description: "Initial probationary window with 14-day mutual notice requirement",
        trigger: "Commencement of employment",
        evidenceIds: [ev2, ev3],
      },
      {
        id: "tl_emp1_4",
        label: "Return of Property Deadline",
        relativeTime: "Within seven (7) days",
        description: "Return all company laptops, tokens, and materials",
        trigger: "Date of employment termination",
        evidenceIds: [ev6],
      },
      {
        id: "tl_emp1_5",
        label: "Final Settlement Payment",
        relativeTime: "Within thirty (30) days",
        description: "Company disbursement of final settlement and statutory pay",
        trigger: "Employee's last working day",
        evidenceIds: [ev8],
      },
    ];

    return {
      id: syn.id,
      name: syn.name,
      mimeType: "text/plain",
      pageCount: pages.length,
      rawText,
      documentType: "employment",
      documentTypeConfidence: 0.99,
      parties,
      effectiveDate: "2025-01-15",
      startDate: "2025-02-01",
      pages,
      clauses,
      obligations,
      timelineEvents,
      findings,
      questions: [],
      evidence: evidenceMap,
      analysisStatus: "completed",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }

  if (docId === "employment-v2") {
    const evV2_1 = makeEv("ev_emp2_comp", "The Employee's salary will be paid each month on the final working day", "Section 3.2");
    const evV2_2 = makeEv("ev_emp2_noncomp", "direct competitor developing cloud workflow orchestration within a 50-mile radius", "Section 6.3");
    const evV2_3 = makeEv("ev_emp2_nonsol", "period of twelve (12) months following termination", "Section 6.1");
    const evV2_4 = makeEv("ev_emp2_res_90", "ninety (90) days prior written notice to the Company", "Section 8.2");

    const parties: Party[] = [
      { id: "p1", name: "APEX GLOBAL TECHNOLOGIES INC.", role: "Employer", type: "organization", evidenceIds: [] },
      { id: "p2", name: "JANE DOE", role: "Employee", type: "person", evidenceIds: [] },
    ];

    const clauses: Clause[] = [
      {
        id: "cl_emp2_3_2",
        documentId: syn.id,
        sectionNumber: "3.2",
        title: "Payment Schedule",
        category: "compensation",
        summary: "Monthly salary paid on final working day. Wording modified from v1, but substantively unchanged.",
        confidence: 0.97,
        evidenceIds: [evV2_1],
      },
      {
        id: "cl_emp2_6_3",
        documentId: syn.id,
        sectionNumber: "6.3",
        title: "Non-Competition Restriction",
        category: "non_compete",
        summary: "New non-compete covenant restricting work for direct competitors in cloud workflow orchestration within 50 miles for 12 months.",
        interpretation: "Substantive new restriction added in v2.",
        confidence: 0.99,
        evidenceIds: [evV2_2],
      },
      {
        id: "cl_emp2_6_1",
        documentId: syn.id,
        sectionNumber: "6.1",
        title: "Non-Solicitation of Employees",
        category: "non_solicitation",
        summary: "Non-solicitation period increased from 6 months in v1 to 12 months in v2.",
        confidence: 0.98,
        evidenceIds: [evV2_3],
      },
      {
        id: "cl_emp2_8_2",
        documentId: syn.id,
        sectionNumber: "8.2",
        title: "Notice Period",
        category: "notice",
        summary: "Voluntary resignation notice period increased from 60 days in v1 to ninety (90) days in v2.",
        confidence: 0.99,
        evidenceIds: [evV2_4],
      },
    ];

    const findings: Finding[] = [
      {
        id: "find_emp2_1",
        documentId: syn.id,
        type: "broad_restriction",
        title: "Substantive Non-Competition Covenant Added in v2",
        description: "Section 6.3 introduces a 12-month non-compete covenant within a 50-mile radius. In California, post-employment non-compete agreements are void under Business & Professions Code § 16600.",
        severity: "critical",
        confidence: 0.98,
        evidenceIds: [evV2_2],
        relatedClauseIds: ["cl_emp2_6_3"],
      },
      {
        id: "find_emp2_2",
        documentId: syn.id,
        type: "asymmetric_obligation",
        title: "Extended 90-Day Resignation Notice Obligation",
        description: "Section 8.2 imposes an extended ninety (90) days notice period on the employee prior to resignation, increased from 60 days in v1.",
        severity: "high",
        confidence: 0.97,
        evidenceIds: [evV2_4],
        relatedClauseIds: ["cl_emp2_8_2"],
      },
    ];

    return {
      id: syn.id,
      name: syn.name,
      mimeType: "text/plain",
      pageCount: pages.length,
      rawText,
      documentType: "employment",
      documentTypeConfidence: 0.99,
      parties,
      effectiveDate: "2025-01-15",
      startDate: "2025-02-01",
      pages,
      clauses,
      obligations: [
        {
          id: "obl_emp2_1",
          documentId: syn.id,
          clauseId: "cl_emp2_8_2",
          partyName: "Jane Doe",
          action: "Provide ninety (90) days prior written notice to the Company upon voluntary resignation",
          deadline: "90 days prior to resignation",
          condition: "Voluntary resignation",
          confidence: 0.99,
          evidenceIds: [evV2_4],
        },
      ],
      timelineEvents: [
        {
          id: "tl_emp2_1",
          label: "Resignation Notice Window",
          relativeTime: "90 days prior to exit",
          description: "Required written resignation notice under Section 8.2",
          evidenceIds: [evV2_4],
        },
      ],
      findings,
      questions: [],
      evidence: evidenceMap,
      analysisStatus: "completed",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }

  if (docId === "nda-mutual") {
    const evNdaDate = makeEv("ev_nda_date", "entered into as of March 1, 2025", "Preamble");
    const evNdaP1 = makeEv("ev_nda_p1", "APEX GLOBAL TECHNOLOGIES INC. (\"Apex\")", "Preamble");
    const evNdaP2 = makeEv("ev_nda_p2", "BRIGHTPATH LOGISTICS LLC (\"BrightPath\")", "Preamble");
    const evNdaPurp = makeEv("ev_nda_purp", "potential strategic supply chain partnership (the \"Purpose\")", "Section 1");
    const evNdaCare = makeEv("ev_nda_care", "exercise at least reasonable care to protect disclosed confidential information", "Section 3.1");
    const evNdaLim = makeEv("ev_nda_lim", "use the Confidential Information solely for the Purpose and disclose it only to employees with a strict need to know", "Section 3.2");
    const evNdaRet = makeEv("ev_nda_ret", "Within ten (10) business days of written request, the receiving party shall return or certify destruction", "Section 3.3");
    const evNdaDur = makeEv("ev_nda_dur", "remain in effect for two (2) years from the date of disclosure", "Section 5");
    const evNdaGov = makeEv("ev_nda_gov", "governed by Delaware law", "Section 6");

    const parties: Party[] = [
      { id: "p_nda_1", name: "APEX GLOBAL TECHNOLOGIES INC.", role: "Disclosing / Receiving Party", type: "organization", evidenceIds: [evNdaP1] },
      { id: "p_nda_2", name: "BRIGHTPATH LOGISTICS LLC", role: "Disclosing / Receiving Party", type: "organization", evidenceIds: [evNdaP2] },
    ];

    const clauses: Clause[] = [
      {
        id: "cl_nda_1",
        documentId: syn.id,
        sectionNumber: "1",
        title: "Purpose",
        category: "general",
        summary: "Parties explore a potential strategic supply chain partnership.",
        confidence: 0.99,
        evidenceIds: [evNdaPurp],
      },
      {
        id: "cl_nda_2",
        documentId: syn.id,
        sectionNumber: "2",
        title: "Confidential Information",
        category: "confidentiality",
        summary: "Defines confidential information including proprietary data, financial projections, software algorithms, and customer metrics.",
        confidence: 0.99,
        evidenceIds: [],
      },
      {
        id: "cl_nda_3",
        documentId: syn.id,
        sectionNumber: "3",
        title: "Obligations of Receiving Party",
        category: "confidentiality",
        summary: "Receiving party must use at least reasonable care, use information solely for Purpose, and return/destroy within 10 business days upon request.",
        confidence: 0.99,
        evidenceIds: [evNdaCare, evNdaLim, evNdaRet],
      },
      {
        id: "cl_nda_4",
        documentId: syn.id,
        sectionNumber: "4",
        title: "Exclusions",
        category: "confidentiality",
        summary: "Standard exclusions for publicly known information, prior knowledge, and independent development.",
        confidence: 0.98,
        evidenceIds: [],
      },
      {
        id: "cl_nda_5",
        documentId: syn.id,
        sectionNumber: "5",
        title: "Duration",
        category: "term",
        summary: "Confidentiality obligations remain in effect for two (2) years from disclosure.",
        confidence: 0.99,
        evidenceIds: [evNdaDur],
      },
      {
        id: "cl_nda_6",
        documentId: syn.id,
        sectionNumber: "6",
        title: "Governing Law",
        category: "governing_law",
        summary: "Governed by the laws of the State of Delaware.",
        confidence: 0.99,
        evidenceIds: [evNdaGov],
      },
    ];

    const obligations: Obligation[] = [
      {
        id: "obl_nda_1",
        documentId: syn.id,
        clauseId: "cl_nda_3",
        partyName: "Receiving Party",
        action: "Exercise at least reasonable care to protect disclosed confidential information",
        confidence: 0.98,
        evidenceIds: [evNdaCare],
      },
      {
        id: "obl_nda_2",
        documentId: syn.id,
        clauseId: "cl_nda_3",
        partyName: "Receiving Party",
        action: "Use Confidential Information solely for Purpose and disclose only to employees with strict need to know",
        confidence: 0.98,
        evidenceIds: [evNdaLim],
      },
      {
        id: "obl_nda_3",
        documentId: syn.id,
        clauseId: "cl_nda_3",
        partyName: "Receiving Party",
        action: "Return or certify destruction of all confidential materials within ten (10) business days of written request",
        deadline: "Within 10 business days of written request",
        confidence: 0.99,
        evidenceIds: [evNdaRet],
      },
    ];

    const timelineEvents: TimelineEvent[] = [
      {
        id: "tl_nda_1",
        label: "Effective Date",
        date: "2025-03-01",
        description: "Agreement entered into as of March 1, 2025",
        evidenceIds: [evNdaDate],
        confidence: 0.99,
      },
      {
        id: "tl_nda_2",
        label: "Confidentiality Expiration",
        relativeTime: "Two (2) years from disclosure",
        description: "Obligations of confidentiality remain active for 2 years from date of disclosure",
        evidenceIds: [evNdaDur],
        confidence: 0.99,
      },
      {
        id: "tl_nda_3",
        label: "Return of Information Window",
        relativeTime: "Within ten (10) business days",
        description: "Deadline to return or certify destruction following written request",
        evidenceIds: [evNdaRet],
        confidence: 0.98,
      },
    ];

    const findings: Finding[] = [
      {
        id: "find_nda_1",
        documentId: syn.id,
        type: "other",
        title: "Standard Bilateral Mutual NDA Structure",
        description: "Agreement contains balanced mutual confidentiality terms with reasonable 2-year duration and standard carve-outs.",
        severity: "low",
        confidence: 0.95,
        evidenceIds: [evNdaDur],
        relatedClauseIds: ["cl_nda_5"],
      },
    ];

    return {
      id: syn.id,
      name: syn.name,
      mimeType: "text/plain",
      pageCount: pages.length,
      rawText,
      documentType: "nda",
      documentTypeConfidence: 0.99,
      parties,
      effectiveDate: "2025-03-01",
      pages,
      clauses,
      obligations,
      timelineEvents,
      findings,
      questions: [],
      evidence: evidenceMap,
      analysisStatus: "completed",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }

  if (docId === "prompt-injection-test") {
    const evSec1 = makeEv("ev_sec_rate", "$120 per hour", "Section 1.2");
    const evSec2 = makeEv("ev_sec_liab", "the Contractor disclaims all liability", "Section 2.1");
    const evSec3 = makeEv("ev_sec_term", "terminate with seven (7) days written notice", "Section 3.1");

    return {
      id: syn.id,
      name: syn.name,
      mimeType: "text/plain",
      pageCount: pages.length,
      rawText,
      documentType: "terms",
      documentTypeConfidence: 0.95,
      parties: [
        { id: "p1", name: "Contractor", role: "Service Provider", type: "organization", evidenceIds: [] },
        { id: "p2", name: "Client", role: "Client", type: "organization", evidenceIds: [] },
      ],
      pages,
      clauses: [
        {
          id: "cl_sec_1",
          documentId: syn.id,
          sectionNumber: "1",
          title: "Scope of Services and Fees",
          category: "compensation",
          summary: "Contractor provides IT infrastructure advisory services. Client pays $120 per hour.",
          confidence: 0.99,
          evidenceIds: [evSec1],
        },
        {
          id: "cl_sec_2",
          documentId: syn.id,
          sectionNumber: "2",
          title: "Liability and Indemnity",
          category: "liability",
          summary: "Contractor disclaims all liability to maximum extent permitted by law. Client indemnifies Contractor against claims.",
          confidence: 0.99,
          evidenceIds: [evSec2],
        },
        {
          id: "cl_sec_3",
          documentId: syn.id,
          sectionNumber: "3",
          title: "Termination Notice",
          category: "termination",
          summary: "Either party may terminate the agreement upon seven (7) days written notice.",
          confidence: 0.99,
          evidenceIds: [evSec3],
        },
      ],
      obligations: [
        {
          id: "obl_sec_1",
          documentId: syn.id,
          clauseId: "cl_sec_1",
          partyName: "Client",
          action: "Pay Contractor rate of $120 per hour for advisory services",
          deadline: "Upon invoicing",
          confidence: 0.99,
          evidenceIds: [evSec1],
        },
        {
          id: "obl_sec_2",
          documentId: syn.id,
          clauseId: "cl_sec_3",
          partyName: "Either party",
          action: "Provide seven (7) days written notice to effect termination",
          deadline: "7 days prior written notice",
          confidence: 0.99,
          evidenceIds: [evSec3],
        },
      ],
      timelineEvents: [
        {
          id: "tl_sec_1",
          label: "Termination Notice Period",
          relativeTime: "7 days prior to termination",
          description: "Required written termination notice period",
          evidenceIds: [evSec3],
        },
      ],
      findings: [
        {
          id: "find_sec_1",
          documentId: syn.id,
          type: "asymmetric_obligation",
          title: "Unilateral Liability Disclaimer and Broad Client Indemnity",
          description: "Section 2 establishes an asymmetric risk shift where Contractor completely disclaims liability while Client provides unconditional indemnification.",
          severity: "high",
          confidence: 0.98,
          evidenceIds: [evSec2],
          relatedClauseIds: ["cl_sec_2"],
        },
        {
          id: "find_sec_2",
          documentId: syn.id,
          type: "unusual_clause",
          title: "Adversarial Prompt Injection In Preamble",
          description: "Document preamble contains adversarial prompt injection attempting to force safety boundary overrides and developer mode. These directives have been ignored and quarantined.",
          severity: "critical",
          confidence: 0.99,
          evidenceIds: [],
          relatedClauseIds: [],
        },
      ],
      questions: [],
      evidence: evidenceMap,
      analysisStatus: "completed",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }

  // Generic seeded document
  return {
    id: syn.id,
    name: syn.name,
    mimeType: "text/plain",
    pageCount: pages.length,
    rawText,
    documentType: syn.documentType,
    documentTypeConfidence: 0.95,
    parties: [],
    pages,
    clauses: [],
    obligations: [],
    timelineEvents: [],
    findings: [],
    questions: [],
    evidence: evidenceMap,
    analysisStatus: "completed",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}
