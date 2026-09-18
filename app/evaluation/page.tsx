"use client";

import { Navbar } from "@/components/Navbar";
import { EvaluationDashboard } from "@/components/evaluation/EvaluationDashboard";
import { Activity } from "lucide-react";

export default function EvaluationPage() {
  return (
    <div className="min-h-screen bg-stone-100/60 text-stone-900 flex flex-col font-sans">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-amber-500" />
            <h1 className="text-xl font-bold tracking-tight text-stone-900">
              Evaluation & Reliability Benchmark
            </h1>
          </div>
          <p className="text-xs text-stone-500 max-w-2xl">
            Execute the quantitative evaluation suite specified in the LexLens architecture. Measures clause extraction precision, obligation conditions, contradiction detection, grounded Q&A with strict uncertainty handling, and defense against prompt injection.
          </p>
        </div>

        <EvaluationDashboard />
      </main>

      <footer className="mt-16 py-6 border-t border-stone-200 bg-stone-50 text-center text-xs text-stone-500">
        <p>
          LexLens — Created & Owned by{" "}
          <a
            href="https://github.com/arsinghin/"
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-stone-800 hover:text-stone-950 underline underline-offset-2"
          >
            Alok Ranjan Singh
          </a>
        </p>
      </footer>
    </div>
  );
}
