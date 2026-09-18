import { NextRequest, NextResponse } from "next/server";
import { getDocumentById } from "@/lib/documents/document-service";

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const doc = getDocumentById(id);

    if (!doc) {
      return NextResponse.json(
        { error: { code: "DOCUMENT_NOT_FOUND", message: `Document with ID "${id}" was not found` } },
        { status: 404 }
      );
    }

    return NextResponse.json({ document: doc });
  } catch (err: any) {
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: err.message || "Failed to retrieve document" } },
      { status: 500 }
    );
  }
}
