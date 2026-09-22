import { NextRequest, NextResponse } from "next/server";
import { getDocumentById } from "@/lib/documents/document-service";
import { compareDocuments } from "@/lib/ai/compare-documents";
import { analyzeDocument } from "@/lib/ai/analyze-document";

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const docA = getDocumentById(id);

    if (!docA) {
      return NextResponse.json(
        { error: { code: "DOCUMENT_NOT_FOUND", message: `Document A with ID "${id}" was not found` } },
        { status: 404 }
      );
    }

    const body = await req.json();
    const targetDocId = body.targetDocumentId || body.documentIdB;

    if (!targetDocId) {
      return NextResponse.json(
        { error: { code: "INVALID_REQUEST", message: "targetDocumentId is required to compare" } },
        { status: 400 }
      );
    }

    const docB = getDocumentById(targetDocId);
    if (!docB) {
      return NextResponse.json(
        { error: { code: "DOCUMENT_NOT_FOUND", message: `Document B with ID "${targetDocId}" was not found` } },
        { status: 404 }
      );
    }

    // Ensure both are analyzed
    if (docA.analysisStatus !== "completed") {
      await analyzeDocument(docA);
    }
    if (docB.analysisStatus !== "completed") {
      await analyzeDocument(docB);
    }

    const cacheKey = `cmp_${docA.id}_${docB.id}`;
    let comparison = docA.comparisons?.[docB.id];
    if (!comparison) {
      comparison = await compareDocuments(docA, docB);
      if (!docA.comparisons) docA.comparisons = {};
      docA.comparisons[docB.id] = comparison;
    }

    return NextResponse.json({
      comparison,
      documentA: docA.id,
      documentB: docB.id,
      differences: comparison.differences,
    });
  } catch (err: any) {
    console.error("Comparison API error:", err);
    return NextResponse.json(
      {
        error: {
          code: "COMPARISON_FAILED",
          message: err.message || "Failed to compare documents",
        },
      },
      { status: 500 }
    );
  }
}
