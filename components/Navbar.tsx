"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Scale, FileText, GitCompare, ShieldCheck, PlayCircle, Activity, Github } from "lucide-react";

export function Navbar() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 w-full border-b border-stone-200 bg-stone-50/95 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-lg bg-stone-900 text-stone-50 flex items-center justify-center font-bold tracking-tight shadow-sm group-hover:bg-stone-800 transition-colors">
              <Scale className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-lg tracking-tight text-stone-900">LexLens</span>
                <span className="text-[11px] font-medium tracking-wide px-1.5 py-0.5 rounded bg-amber-100/80 text-amber-900 border border-amber-200">
                  GenAI Legal Intel
                </span>
              </div>
              <p className="text-[11px] text-stone-500 hidden sm:block">Evidence-backed document understanding</p>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            <Link
              href="/"
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                pathname === "/" ? "bg-stone-200/70 text-stone-900" : "text-stone-600 hover:text-stone-900 hover:bg-stone-100"
              }`}
            >
              Workspace
            </Link>
            <Link
              href="/compare"
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                pathname.startsWith("/compare")
                  ? "bg-stone-200/70 text-stone-900"
                  : "text-stone-600 hover:text-stone-900 hover:bg-stone-100"
              }`}
            >
              Compare
            </Link>
            <Link
              href="/evaluation"
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                pathname.startsWith("/evaluation")
                  ? "bg-stone-200/70 text-stone-900"
                  : "text-stone-600 hover:text-stone-900 hover:bg-stone-100"
              }`}
            >
              Evaluation Benchmark
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden lg:flex items-center gap-1.5 text-xs text-stone-500 bg-stone-100 px-2.5 py-1 rounded-full border border-stone-200">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Document information only · Not legal advice</span>
          </div>

          <Link
            href="/#demo-scenario"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-stone-900 text-stone-50 hover:bg-stone-800 transition-colors shadow-sm"
          >
            <PlayCircle className="w-3.5 h-3.5 text-amber-400" />
            <span>Try Demo</span>
          </Link>

          <a
            id="nav-github-link"
            href="https://github.com/arsinghin/contract-lens"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center p-2 rounded-lg border border-stone-200 text-stone-700 bg-white hover:bg-stone-100 hover:text-stone-950 transition-colors shadow-2xs"
            title="GitHub: arsinghin/contract-lens (AR Singh)"
            aria-label="GitHub Repository"
          >
            <Github className="w-4 h-4" />
          </a>
        </div>
      </div>
    </header>
  );
}
