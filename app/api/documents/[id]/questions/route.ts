import { NextRequest, NextResponse } from "next/server";
import { getDocumentById } from "@/lib/documents/document-service";
import { answerQuestion } from "@/lib/ai/answer-question";

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

    const body = await req.json();
    const question = body.question;

    if (!question || typeof question !== "string" || question.trim().length === 0) {
      return NextResponse.json(
        { error: { code: "INVALID_REQUEST", message: "A non-empty question string is required" } },
        { status: 400 }
      );
    }

    if (question.length > 2000) {
      return NextResponse.json(
        { error: { code: "INVALID_REQUEST", message: "Question exceeds maximum length of 2000 characters" } },
        { status: 400 }
      );
    }

    const qaResponse = await answerQuestion(doc, question.trim());

    return NextResponse.json({
      qaResponse,
      status: qaResponse.status,
      answer: qaResponse.answer,
      evidenceIds: qaResponse.evidenceIds,
      uncertainty: qaResponse.uncertainty,
    });
  } catch (err: any) {
    console.error("QA API error:", err);
    return NextResponse.json(
      {
        error: {
          code: "QUESTION_FAILED",
          message: err.message || "Failed to generate grounded answer",
        },
      },
      { status: 500 }
    );
  }
}
