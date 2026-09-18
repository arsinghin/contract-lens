import { NextRequest, NextResponse } from "next/server";
import { getDocumentById } from "@/lib/documents/document-service";
import { generateLawyerPreparation } from "@/lib/ai/generate-lawyer-prep";
import { analyzeDocument } from "@/lib/ai/analyze-document";

export async function POST(
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

    if (doc.analysisStatus !== "completed") {
      await analyzeDocument(doc);
    }

    const prep = await generateLawyerPreparation(doc);
    return NextResponse.json({ lawyerPreparation: prep });
  } catch (err: any) {
    console.error("Lawyer prep API error:", err);
    return NextResponse.json(
      {
        error: {
          code: "LAWYER_PREP_FAILED",
          message: err.message || "Failed to generate lawyer preparation output",
        },
      },
      { status: 500 }
    );
  }
}
