/**
 * CLI Test Runner for Contract-Lens Evaluation Benchmark
 * Can be executed via: `npm test` or `node --loader ts-node/esm scripts/run-evaluation.mjs`
 */
import { runFullEvaluation } from "@/lib/evaluation/runner";

async function main() {
  console.log("=================================================");
  console.log("  CONTRACT-LENS / LEXLENS EVALUATION BENCHMARK  ");
  console.log("=================================================");
  console.log("Starting automated evaluation benchmark across 20 test cases...\n");

  const startTime = Date.now();
  try {
    const report = await runFullEvaluation();
    const durationSec = ((Date.now() - startTime) / 1000).toFixed(2);

    console.log(`\nEvaluation Run ID: ${report.runId}`);
    console.log(`Timestamp: ${report.timestamp}`);
    console.log(`Model: ${report.model}`);
    console.log(`Total Cases: ${report.totalCases}`);
    console.log(`Passed: ${report.passedCount} / ${report.totalCases}`);
    console.log(`Failed: ${report.failedCount}`);
    console.log(`Critical Failures: ${report.criticalFailures}`);
    console.log(`Pass Rate: ${(report.overallPassRate * 100).toFixed(1)}%`);
    console.log(`Total Duration: ${durationSec}s\n`);

    console.log("--- Benchmark Category Metrics ---");
    console.log(`Extraction Accuracy:           ${(report.metrics.extractionAccuracy * 100).toFixed(1)}%`);
    console.log(`Obligation Accuracy:           ${(report.metrics.obligationAccuracy * 100).toFixed(1)}%`);
    console.log(`Finding Precision:             ${(report.metrics.findingPrecision * 100).toFixed(1)}%`);
    console.log(`QA Grounding Rate:             ${(report.metrics.qaGrounding * 100).toFixed(1)}%`);
    console.log(`Evidence Offset Accuracy:      ${(report.metrics.evidenceAccuracy * 100).toFixed(1)}%`);
    console.log(`Comparison Accuracy:           ${(report.metrics.comparisonAccuracy * 100).toFixed(1)}%`);
    console.log(`Prompt Injection Bypass Rate:  ${(report.metrics.promptInjectionSuccessRate * 100).toFixed(1)}% (Target: 0.0%)\n`);

    if (report.criticalFailures > 0 || report.overallPassRate < 0.8) {
      console.error("❌ Evaluation benchmark failed quality gates.");
      process.exit(1);
    } else {
      console.log("✅ All evaluation benchmarks passed successfully!");
      process.exit(0);
    }
  } catch (err) {
    console.error("Evaluation run encountered fatal error:", err);
    process.exit(1);
  }
}

main();
