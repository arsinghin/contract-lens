import { NextRequest, NextResponse } from "next/server";
import { getAllDocuments, createDocumentFromUpload } from "@/lib/documents/document-service";
import { SYNTHETIC_DOCUMENTS } from "@/lib/data/synthetic-documents";

export async function GET() {
  try {
    const docs = getAllDocuments();
    return NextResponse.json({ documents: docs });
  } catch (err: any) {
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: err.message || "Failed to retrieve documents" } },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const contentType = req.headers.get("content-type") || "";

    if (contentType.includes("application/json")) {
      const body = await req.json();
      // Handle loading a pre-configured sample document or raw text
      if (body.sampleId && SYNTHETIC_DOCUMENTS[body.sampleId]) {
        const sample = SYNTHETIC_DOCUMENTS[body.sampleId];
        const doc = createDocumentFromUpload(sample.name, sample.content, "application/pdf");
        doc.documentType = sample.documentType;
        return NextResponse.json({ documentId: doc.id, status: "uploaded", document: doc });
      }

      if (body.name && body.text) {
        const doc = createDocumentFromUpload(body.name, body.text, "text/plain");
        return NextResponse.json({ documentId: doc.id, status: "uploaded", document: doc });
      }

      return NextResponse.json(
        { error: { code: "INVALID_REQUEST", message: "Provide either a valid sampleId or name and text" } },
        { status: 400 }
      );
    }

    // Handle FormData file upload
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        { error: { code: "INVALID_REQUEST", message: "No file was uploaded" } },
        { status: 400 }
      );
    }

    // Check size limit: 10MB
    const MAX_SIZE = 10 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { error: { code: "DOCUMENT_TOO_LARGE", message: "File exceeds 10MB limit" } },
        { status: 413 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    // For text / pdf files: extract text
    let extractedText = "";
    if (file.type === "text/plain" || file.name.endsWith(".txt") || file.name.endsWith(".md")) {
      extractedText = buffer.toString("utf-8");
    } else {
      // PDF or binary document: convert to printable characters / text stream
      // or send as extracted string representation
      extractedText = buffer.toString("utf-8");
      // If predominantly non-printable binary, create a readable representation
      if (extractedText.includes("%PDF")) {
        // Strip non-printable bytes or retain ASCII streams
        extractedText = buffer
          .toString("latin1")
          .replace(/[^\x20-\x7E\t\n\r]/g, " ")
          .replace(/\s+/g, " ")
          .trim();
        if (extractedText.length < 50) {
          extractedText = `PDF Document: ${file.name}\nSize: ${Math.round(file.size / 1024)} KB\nUploaded: ${new Date().toISOString()}`;
        }
      }
    }

    const doc = createDocumentFromUpload(file.name, extractedText, "application/pdf");
    return NextResponse.json({ documentId: doc.id, status: "uploaded", document: doc });
  } catch (err: any) {
    console.error("Upload error:", err);
    return NextResponse.json(
      { error: { code: "UPLOAD_ERROR", message: err.message || "Failed to process document upload" } },
      { status: 500 }
    );
  }
}
