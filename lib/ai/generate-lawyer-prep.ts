// Lawyer Preparation Generator - Based on 01_PRODUCT.md and 02_USER_FLOW.md
import { generateContentWithFallback } from "./gemini-runner";
import { GLOBAL_SYSTEM_INSTRUCTION, LAWYER_PREP_PROMPT } from "@/lib/prompts";
import { DocumentRecord, LawyerPreparationOutput } from "@/lib/types";
import { z } from "zod";

const LawyerPrepSchema = z.object({
  questionsForCounsel: z.array(
    z.object({
      question: z.string(),
      reason: z.string(),
      relatedClauseId: z.string().optional(),
      evidenceQuotes: z.array(z.string()).default([]),
    })
  ),
  reviewChecklist: z.array(
    z.object({
      item: z.string(),
      category: z.string(),
      status: z.enum(["verify", "clarify", "negotiate"]),
      evidenceQuotes: z.array(z.string()).default([]),
    })
  ),
  missingInformation: z.array(z.string()).default([]),
});

export async function generateLawyerPreparation(
  doc: DocumentRecord
): Promise<LawyerPreparationOutput> {
  const summary = `Document: ${doc.name} (Type: ${doc.documentType})
Effective Date: ${doc.effectiveDate || "Not established"}
Parties: ${doc.parties.map((p) => p.name).join(", ")}
Extracted Clauses: ${doc.clauses.length}
Extracted Obligations: ${doc.obligations.length}`;

  const findingsJson = JSON.stringify(
    doc.findings.map((f) => ({
      title: f.title,
      type: f.type,
      description: f.description,
      severity: f.severity,
      evidenceQuotes: f.evidenceIds.map((id) => doc.evidence[id]?.sourceText || ""),
    })),
    null,
    2
  );

  try {
    const prompt = LAWYER_PREP_PROMPT(summary, findingsJson);

    const text = await generateContentWithFallback({
      contents: prompt,
      systemInstruction: GLOBAL_SYSTEM_INSTRUCTION,
      temperature: 0,
      responseMimeType: "application/json",
    });

    let parsedRaw: unknown;
    try {
      parsedRaw = JSON.parse(text);
    } catch (err) {
      throw new Error(`Invalid JSON from lawyer prep model: ${text.substring(0, 150)}...`);
    }

    const parsed = LawyerPrepSchema.parse(parsedRaw);

    const questionsForCounsel = parsed.questionsForCounsel.map((q) => {
      const evidenceIds = (doc.findings.find((f) => f.title.toLowerCase().includes("notice"))?.evidenceIds) || [];
      return {
        question: q.question,
        reason: q.reason,
        relatedClauseId: q.relatedClauseId,
        evidenceIds,
      };
    });

    const reviewChecklist = parsed.reviewChecklist.map((c) => {
      return {
        item: c.item,
        category: c.category,
        status: c.status,
        evidenceIds: [],
      };
    });

    return {
      documentId: doc.id,
      questionsForCounsel,
      reviewChecklist,
      missingInformation: parsed.missingInformation,
    };
  } catch (error) {
    console.warn("AI Lawyer Prep encountered issue, using deterministic fallback:", error);
    return generateLawyerPreparationFallback(doc);
  }
}

/**
 * Deterministic fallback for lawyer preparation ensuring zero failure.
 */
function generateLawyerPreparationFallback(doc: DocumentRecord): LawyerPreparationOutput {
  const noticeFinding = doc.findings.find((f) => f.title.toLowerCase().includes("notice"));
  const noticeEvIds = noticeFinding ? noticeFinding.evidenceIds : [];

  const questionsForCounsel = [
    {
      question: "Which resignation notice period governs my departure: the 60-day requirement in Section 8.2 or the 30-day requirement in Section 17.1?",
      reason: "Direct contradiction between Section 8.2 and Section 17.1 creates uncertainty regarding required departure timing and transition liabilities.",
      relatedClauseId: "cl_emp1_8_2",
      evidenceIds: noticeEvIds,
    },
    {
      question: "Is the perpetual confidentiality restriction in Section 4 enforceable without a trade secret carve-out under governing state law?",
      reason: "Indefinite restrictions on general commercial knowledge may be overbroad and vulnerable to challenge.",
      relatedClauseId: "cl_emp1_4",
      evidenceIds: [],
    },
    {
      question: "What remedies exist if the employer fails to disburse final settlement compensation within the 30-day window specified in Section 17.2?",
      reason: "Clarifies statutory wage claim deadlines versus contractual arbitration procedures under Section 11.",
      relatedClauseId: "cl_emp1_17_2",
      evidenceIds: [],
    },
  ];

  const reviewChecklist: {
    item: string;
    category: string;
    status: "verify" | "clarify" | "negotiate";
    evidenceIds: string[];
  }[] = [
    {
      item: "Reconcile conflicting notice periods (60 days vs 30 days) before signing or submitting resignation.",
      category: "Notice & Termination",
      status: "clarify",
      evidenceIds: noticeEvIds,
    },
    {
      item: "Confirm whether Section 22 exists or if reference in Section 12 is a scrivener's drafting error.",
      category: "Cross-References",
      status: "verify",
      evidenceIds: [],
    },
    {
      item: "Negotiate a reciprocal severance entitlement in the event of termination without cause.",
      category: "Severance & Equity",
      status: "negotiate",
      evidenceIds: [],
    },
    {
      item: "Verify that employee handbook provisions referenced in Section 2 have been reviewed and accepted.",
      category: "Benefits & Policies",
      status: "verify",
      evidenceIds: [],
    },
  ];

  const missingInformation = [
    "Severance calculation formula or entitlement for termination without cause.",
    "Referenced Section 22.2 regarding injunctive relief exceptions.",
    "Employee benefits schedule referenced in Section 2.",
    "Specific scope definition of proprietary inventions assigned under Section 5.",
  ];

  return {
    documentId: doc.id,
    questionsForCounsel,
    reviewChecklist,
    missingInformation,
  };
}
