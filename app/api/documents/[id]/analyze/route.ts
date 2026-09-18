import { NextRequest, NextResponse } from "next/server";
import { getDocumentById } from "@/lib/documents/document-service";
import { analyzeDocument } from "@/lib/ai/analyze-document";
import { checkRateLimit } from "@/lib/security/rate-limiter";

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    // Rate limit AI analysis to 20 calls per minute per client
    const clientIp = req.headers.get("x-forwarded-for")?.split(",")[0] || "global-client";
    const rateCheck = checkRateLimit(`analyze-${clientIp}`, { maxRequests: 20, intervalMs: 60 * 1000 });

    if (!rateCheck.allowed) {
      return NextResponse.json(
        {
          error: {
            code: "RATE_LIMIT_EXCEEDED",
            message: `AI analysis rate limit reached. Please retry in ${Math.ceil(rateCheck.resetInMs / 1000)} seconds.`,
          },
        },
        {
          status: 429,
          headers: {
            "Retry-After": Math.ceil(rateCheck.resetInMs / 1000).toString(),
          },
        }
      );
    }
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
