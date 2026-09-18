import { NextRequest, NextResponse } from "next/server";
import { getDocumentById } from "@/lib/documents/document-service";
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
        { error: { code: "DOCUMENT_NOT_FOUND", message: `Document "${id}" not found` } },
        { status: 404 }
      );
    }

    // Check if already completed and not requesting re-analysis
    let forceReanalyze = false;
    try {
      const body = await req.json();
      if (body.force) forceReanalyze = true;
    } catch {}

    if (doc.analysisStatus === "completed" && !forceReanalyze) {
      return NextResponse.json({
        documentId: doc.id,
        status: "completed",
        document: doc,
        cached: true,
      });
    }

    const analyzedDoc = await analyzeDocument(doc);

    return NextResponse.json({
      documentId: analyzedDoc.id,
      status: analyzedDoc.analysisStatus,
      document: analyzedDoc,
    });
  } catch (err: any) {
    console.error("Analysis API route error:", err);
    return NextResponse.json(
      {
        error: {
          code: "ANALYSIS_FAILED",
          message: err.message || "Failed to analyze document with Gemini",
        },
      },
      { status: 500 }
    );
  }
}
