"use client";

import { useState } from "react";
import { QAResponse, Evidence } from "@/lib/types";
import { Send, MessageSquare, CheckCircle, HelpCircle, XCircle, Bookmark, Sparkles, Loader2 } from "lucide-react";

interface QASectionProps {
  documentId: string;
  evidenceMap: Record<string, Evidence>;
  onSelectEvidence: (ev: Evidence, interpretation?: string, title?: string) => void;
  initialQuestions?: string[];
}

export function QASection({ documentId, evidenceMap, onSelectEvidence, initialQuestions }: QASectionProps) {
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<QAResponse[]>([]);

  const defaultSuggestions = initialQuestions || [
    "What is the employee's notice period for voluntary resignation?",
    "How much notice is required if resigning during the probation period?",
    "How much severance amount does the employee receive?",
    "Does the agreement provide a 90-day notice period?",
    "What are the employee's confidentiality obligations?",
  ];

  const handleAsk = async (qText: string) => {
    if (!qText.trim() || loading) return;
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/documents/${documentId}/questions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: qText.trim() }),
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        throw new Error(data.error?.message || "Failed to get answer");
      }

      setHistory((prev) => [data.qaResponse, ...prev]);
      setQuestion("");
    } catch (err: any) {
      setError(err.message || "An error occurred while answering your question.");
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: QAResponse["status"]) => {
    switch (status) {
      case "established":
      case "answered":
        return {
          label: "ESTABLISHED IN DOCUMENT",
          className: "bg-emerald-50 text-emerald-800 border-emerald-200",
          icon: <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />,
        };
      case "ambiguous":
        return {
          label: "AMBIGUOUS / CONFLICTING",
          className: "bg-amber-50 text-amber-900 border-amber-200",
          icon: <HelpCircle className="w-3.5 h-3.5 text-amber-600" />,
        };
      case "not_established":
      default:
        return {
          label: "NOT ESTABLISHED BY DOCUMENT",
          className: "bg-stone-100 text-stone-800 border-stone-300",
          icon: <XCircle className="w-3.5 h-3.5 text-stone-600" />,
        };
    }
  };

  return (
    <div className="space-y-6">
      {/* Question Form */}
      <div className="bg-white border border-stone-200 rounded-xl p-5 shadow-xs space-y-4">
        <div>
          <h3 className="text-sm font-semibold text-stone-900">
            Ask a Grounded Question
          </h3>
          <p className="text-xs text-stone-500 mt-0.5">
            Every answer is strictly constrained to the text of this document. If information is absent, the system will explicitly report that it is not established.
          </p>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleAsk(question);
          }}
          className="flex gap-2"
        >
          <input
            type="text"
            placeholder="e.g. What notice period applies if I resign? Or what severance is paid?"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            disabled={loading}
            className="flex-1 px-4 py-2.5 text-xs bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-stone-400 focus:bg-white transition-colors"
          />
          <button
            type="submit"
            disabled={loading || !question.trim()}
            className="px-4 py-2.5 rounded-lg bg-stone-900 text-stone-50 text-xs font-medium hover:bg-stone-800 disabled:opacity-50 transition-colors flex items-center gap-1.5 shrink-0"
          >
            {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5 text-amber-400" />}
            <span>Ask</span>
          </button>
        </form>

        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-800">
            {error}
          </div>
        )}

        {/* Suggested Queries */}
        <div className="pt-2 border-t border-stone-100">
          <div className="flex items-center gap-1 text-[11px] font-medium text-stone-400 mb-2">
            <Sparkles className="w-3 h-3 text-amber-500" />
            <span>Suggested verification queries:</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {defaultSuggestions.map((sug, i) => (
              <button
                key={i}
                onClick={() => handleAsk(sug)}
                disabled={loading}
                className="text-left text-[11px] px-2.5 py-1 rounded-md bg-stone-100 hover:bg-stone-200 text-stone-700 transition-colors font-medium"
              >
                &ldquo;{sug}&rdquo;
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Answers History */}
      {history.length > 0 && (
        <div className="space-y-4">
          <h4 className="text-xs font-bold uppercase tracking-wider text-stone-500">
            Grounded Q&A Responses ({history.length})
          </h4>

          {history.map((item) => {
            const badge = getStatusBadge(item.status);

            return (
              <div
                key={item.id}
                className="bg-white border border-stone-200 rounded-xl p-5 shadow-xs space-y-3"
              >
                {/* Status and question */}
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span
                      className={`inline-flex items-center gap-1 text-[10px] font-bold uppercase px-2.5 py-1 rounded-md border tracking-wide ${badge.className}`}
                    >
                      {badge.icon}
                      <span>{badge.label}</span>
                    </span>
                  </div>
                  <span className="text-[10px] text-stone-400 font-mono">
                    {new Date(item.createdAt).toLocaleTimeString()}
                  </span>
                </div>

                <div className="font-semibold text-xs text-stone-900">
                  Q: &ldquo;{item.question}&rdquo;
                </div>

                <div className="text-xs text-stone-800 leading-relaxed bg-stone-50/70 p-3.5 rounded-lg border border-stone-200/60 whitespace-pre-wrap">
                  {item.answer}
                </div>

                {item.uncertainty && (
                  <div className="text-[11px] text-amber-900 bg-amber-50/70 border border-amber-200/60 p-2.5 rounded-md italic">
                    <span className="font-medium text-amber-950 not-italic">Uncertainty Note: </span>
                    {item.uncertainty}
                  </div>
                )}

                {/* Evidence Citations */}
                {item.evidenceIds && item.evidenceIds.length > 0 && (
                  <div className="pt-2 border-t border-stone-100">
                    <span className="text-[11px] font-bold uppercase text-stone-400 tracking-wider block mb-2">
                      Cited Document Evidence ({item.evidenceIds.length})
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {item.evidenceIds.map((evId) => {
                        const ev = evidenceMap[evId];
                        if (!ev) return null;

                        return (
                          <button
                            key={evId}
                            onClick={() =>
                              onSelectEvidence(
                                ev,
                                item.answer,
                                `Answer Evidence: ${item.question}`
                              )
                            }
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-stone-100 hover:bg-amber-100 text-stone-800 hover:text-amber-900 text-xs transition-colors border border-stone-200 font-medium"
                          >
                            <Bookmark className="w-3.5 h-3.5 text-amber-600" />
                            <span>
                              {ev.sectionLabel || "Section"} (p. {ev.pageNumber})
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
