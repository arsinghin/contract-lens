import { NextRequest, NextResponse } from "next/server";
import { getDocumentById } from "@/lib/documents/document-service";
import { generateLawyerPreparation } from "@/lib/ai/generate-lawyer-prep";

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const doc = getDocumentById(id);

    if (!doc) {
      return NextResponse.json(
        { error: { code: "DOCUMENT_NOT_FOUND", message: `Document "${id}" was not found` } },
        { status: 404 }
      );
    }

    const { searchParams } = new URL(req.url);
    const format = searchParams.get("format") || "markdown";

    if (format === "json") {
      return NextResponse.json({ document: doc });
    }

    const lawyerPrep = await generateLawyerPreparation(doc);

    const md = `# LEXLENS LEGAL DOCUMENT SUMMARY REPORT
**Document Name:** ${doc.name}  
**Document Type:** ${doc.documentType.toUpperCase()}  
**Generated Date:** ${new Date().toLocaleDateString()}  
**Disclaimer:** LexLens provides document intelligence and structural extraction. It does not constitute formal legal advice.

---

## 1. PARTIES & KEY METADATA
- **Document ID:** ${doc.id}
- **Analysis Status:** ${doc.analysisStatus}
- **Parties:**
${doc.parties.map((p) => `  - **${p.name}** (${p.role}) [${p.type}]`).join("\n") || "  - None explicitly designated"}

---

## 2. KEY CLAUSES EXTRACTED
${doc.clauses.map((c) => `### ${c.sectionNumber ? `Section ${c.sectionNumber}: ` : ""}${c.title}
- **Category:** ${c.category}
- **Summary:** ${c.summary}
- **Confidence:** ${Math.round(c.confidence * 100)}%
`).join("\n") || "No clauses extracted."}

---

## 3. IDENTIFIED OBLIGATIONS & DEADLINES
${doc.obligations.map((o) => `- **${o.partyName || "Party"}:** ${o.action}
  - **Deadline / Timing:** ${o.deadline || "Unspecified"}
  - **Condition:** ${o.condition || "Unconditional"}
`).join("\n") || "No obligations extracted."}

---

## 4. MATERIAL FINDINGS & AMBIGUITIES
${doc.findings.map((f) => `### [${f.severity.toUpperCase()}] ${f.title} (${f.type})
${f.description}
`).join("\n") || "No findings detected."}

---

## 5. PREPARATION FOR LEGAL COUNSEL
### Questions to Discuss with Attorney:
${lawyerPrep.questionsForCounsel.map((q, i) => `${i + 1}. **${q.question}**  
   *Context:* ${q.reason}
`).join("\n")}

### Checklist for Consultation:
${lawyerPrep.reviewChecklist.map((c) => `- [ ] [${c.status.toUpperCase()}] ${c.item} (*${c.category}*)`).join("\n")}

### Missing Documentation & Schedules:
${lawyerPrep.missingInformation.map((m) => `- ${m}`).join("\n")}
`;

    return new Response(md, {
      headers: {
        "Content-Type": "text/markdown; charset=utf-8",
        "Content-Disposition": `attachment; filename="${doc.id}-lexlens-summary.md"`,
      },
    });
  } catch (err: any) {
    console.error("Export error:", err);
    return NextResponse.json(
      { error: { code: "EXPORT_FAILED", message: err.message || "Failed to export document" } },
      { status: 500 }
    );
  }
}
