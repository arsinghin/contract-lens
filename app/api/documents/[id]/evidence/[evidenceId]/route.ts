import { NextRequest, NextResponse } from "next/server";
import { getDocumentById } from "@/lib/documents/document-service";

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string; evidenceId: string }> }
) {
  try {
    const { id, evidenceId } = await context.params;
    const doc = getDocumentById(id);

    if (!doc) {
      return NextResponse.json(
        { error: { code: "DOCUMENT_NOT_FOUND", message: `Document "${id}" was not found` } },
        { status: 404 }
      );
    }

    const evidence = doc.evidence[evidenceId];
    if (!evidence) {
      return NextResponse.json(
        { error: { code: "EVIDENCE_NOT_FOUND", message: `Evidence "${evidenceId}" was not found in document "${id}"` } },
        { status: 404 }
      );
    }

    return NextResponse.json({ evidence });
  } catch (err: any) {
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: err.message || "Failed to retrieve evidence" } },
      { status: 500 }
    );
  }
}
