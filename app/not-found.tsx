import Link from "next/link";
import { FileQuestion, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-stone-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-xl border border-stone-200 p-8 text-center shadow-xs">
        <div className="w-12 h-12 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-4">
          <FileQuestion className="w-6 h-6" />
        </div>
        <h1 className="text-xl font-serif font-bold text-stone-900 mb-2">
          Page Not Found
        </h1>
        <p className="text-sm text-stone-600 mb-6">
          The requested legal analysis workspace or document route could not be found.
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-4 py-2 text-xs font-medium rounded-lg bg-stone-900 text-stone-50 hover:bg-stone-800 transition-colors shadow-xs"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Return to Workspace</span>
        </Link>
      </div>
    </div>
  );
}
