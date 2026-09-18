import { NextRequest, NextResponse } from "next/server";
import { runFullEvaluation, runEvaluationCase } from "@/lib/evaluation/runner";
import { EVALUATION_DATASET } from "@/lib/evaluation/dataset";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const category = searchParams.get("category") || undefined;
  const cases = category
    ? EVALUATION_DATASET.filter((c) => c.category === category)
    : EVALUATION_DATASET;

  return NextResponse.json({
    totalCases: cases.length,
    cases: cases.map((c) => ({
      caseId: c.caseId,
      category: c.category,
      documentId: c.documentId,
      task: c.task,
      severity: c.severity,
    })),
  });
}

export async function POST(req: NextRequest) {
  try {
    let category: string | undefined;
    let singleCaseId: string | undefined;

    try {
      const body = await req.json();
      category = body.category;
      singleCaseId = body.caseId;
    } catch {}

    if (singleCaseId) {
      const testCase = EVALUATION_DATASET.find((c) => c.caseId === singleCaseId);
      if (!testCase) {
        return NextResponse.json(
          { error: { code: "CASE_NOT_FOUND", message: `Case "${singleCaseId}" not found` } },
          { status: 404 }
        );
      }
      const singleResult = await runEvaluationCase(testCase);
      return NextResponse.json({ result: singleResult });
    }

    const report = await runFullEvaluation(category);
    return NextResponse.json({ report });
  } catch (err: any) {
    console.error("Evaluation API error:", err);
    return NextResponse.json(
      {
        error: {
          code: "EVALUATION_FAILED",
          message: err.message || "Failed to execute evaluation runner",
        },
      },
      { status: 500 }
    );
  }
}
