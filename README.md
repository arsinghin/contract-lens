# LexLens (`contract-lens`) — Legal Document Intelligence

[![Next.js](https://img.shields.io/badge/Next.js-15.5-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-38bdf8?style=flat-square&logo=tailwind-css)](https://tailwindcss.com/)
[![Google Gemini API](https://img.shields.io/badge/Gemini_API-2.5_Flash-orange?style=flat-square&logo=google)](https://ai.google.dev/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](LICENSE)

> **Open-source contract review workspace with clause breakdown, obligation milestones, and evidence-grounded Q&A.**

---

## 📑 Overview

**LexLens** bridges the gap between raw, opaque legal contracts and clear, actionable business understanding. Unlike generic document parsers or hallucination-prone chatbots, LexLens treats contracts with legal rigor:

1. **Every claim is anchored to source text** with byte/character offsets and section labels.
2. **Uncertainty is explicitly recognized** (`not_established` / missing information) rather than fabricated.
3. **Structured outputs** distinguish obligations, conditional triggers, deadlines, and asymmetric terms.
4. **Substantive redline comparison** categorizes changes by legal impact (added restrictions, notice modifications, risk shifts) rather than simple visual character diffs.
5. **Lawyer Consultation Readiness** automatically prepares tailored question lists, risk review checklists, and missing document catalogs for counsel briefing.

---

## ✨ Key Features

### 1. Clause Extraction & Structure Mapping
- Identifies and categorizes sections (`termination`, `compensation`, `confidentiality`, `non-compete`, `governing_law`, etc.).
- Generates high-level summaries and plain-English legal interpretations.
- Assigns calibrated confidence scores to every parsed element.

### 2. Obligation & Milestone Extraction
- Dissects operative contract terms into structured tuples: **Party**, **Action**, **Deadline**, and **Trigger Condition**.
- Visualizes interactive obligation workflows with status tracking and verified evidence links.

### 3. Chronological & Relative Timeline Reconstruction
- Maps absolute milestone dates (`2025-01-15`, `2025-02-01`) alongside conditional windows (*"Within 30 days after final working day"*, *"14 days prior notice during probation"*).
- Highlights critical deadlines and offboarding milestones.

### 4. Risk Finding & Asymmetry Detection
- **Contractual Inconsistencies**: Flags conflicting clauses across sections (e.g., Section 8.2 requiring 60 days voluntary resignation notice vs. Section 17.1 requiring 30 days).
- **Missing Information**: Discovers unaddressed terms (e.g., omission of severance payout calculation formula).
- **Broken Cross-References**: Detects references to missing schedules or non-existent annexes (e.g., Section 22 dispute annex not attached).
- **Broad Restrictions**: Identifies perpetual confidentiality over non-trade-secret commercial data or unreasonable non-compete covenants.

### 5. Grounded Q&A with Citation Traceability
- Ask natural language questions against uploaded agreements.
- Responses cite specific evidence cards with verified quote matching.
- Adheres to strict uncertainty boundaries: if a term or formula is absent or governed by an external handbook, the system returns `not_established` instead of guessing.

### 6. Differential Document Comparison (Redline)
- Upload or select two document versions (e.g., `Employment_Agreement_v1` vs `v2`).
- Distinguishes **material changes** (new 12-month post-employment non-compete, 60-to-90 day notice extensions) from **benign phrasing edits** (payment date wording changes).
- Dual-pane source evidence inspection linking both baseline (Doc A) and modified (Doc B) provisions.

### 7. Lawyer Consultation Brief & Export
- Formulates specific, strategic questions for legal counsel review.
- Identifies critical checklist items before signing or terminating.
- Exports a complete structured legal intelligence dossier as formatted Markdown (`/api/documents/[id]/export?format=markdown`).

### 8. Automated Evaluation Benchmark
- Integrated 20-test automated verification suite (`/evaluation`) covering extraction accuracy, obligation completeness, finding detection, grounded Q&A, uncertainty handling, differential comparison, and prompt-injection defense.

---

## 🏗️ Architecture

```
├── app/
│   ├── api/
│   │   ├── documents/                 # CRUD, file ingestion, export & comparison
│   │   │   ├── [id]/
│   │   │   │   ├── compare/route.ts   # Document version differential analysis
│   │   │   │   ├── export/route.ts    # Markdown dossier export
│   │   │   │   └── questions/route.ts # Grounded legal Q&A
│   │   │   └── route.ts               # List & upload documents
│   │   └── evaluation/
│   │       ├── benchmark/route.ts     # Benchmark test case definitions
│   │       └── run/route.ts           # Automated test harness execution
│   ├── compare/page.tsx               # Side-by-side contract comparison view
│   ├── evaluation/page.tsx            # Test harness & benchmark results dashboard
│   ├── layout.tsx                     # Root application layout & metadata
│   └── page.tsx                       # Main document intelligence workspace
├── components/
│   ├── clauses/                       # Clause explorer & confidence indicators
│   ├── comparison/                    # Material diff viewer & evidence alignment
│   ├── documents/                     # Full document modal with search & jump-to-section
│   ├── evaluation/                    # Evaluation suite execution dashboard
│   ├── evidence/                      # Evidence modal with verified quotation offsets
│   ├── findings/                      # Risk, inconsistency & asymmetry cards
│   ├── lawyer-prep/                   # Counsel briefing & checklist generator
│   ├── obligations/                   # Structured obligation & party matrices
│   ├── questions/                     # Grounded Q&A engine
│   └── timeline/                      # Milestone & conditional event visualization
└── lib/
    ├── ai/
    │   ├── analyze-document.ts        # Gemini extraction & fallback parser
    │   ├── compare-documents.ts       # Document redline diff engine
    │   ├── gemini.ts                  # SDK initialization & error recovery
    │   └── question-answering.ts      # Grounded Q&A with quotation verification
    ├── data/
    │   └── ground-truth-seed.ts       # Pre-loaded sample agreements & test data
    ├── evaluation/
    │   └── runner.ts                  # Benchmark evaluation engine (20 test cases)
    ├── prompts/                       # Structured prompt templates with JSON schemas
    └── types/                         # Strongly-typed TypeScript interfaces
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js 20+
- npm, pnpm, or bun
- A Google Gemini API key ([Get one free at Google AI Studio](https://aistudio.google.com/))

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/arsinghin/contract-lens.git
   cd contract-lens
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment Variables**:
   Copy `.env.example` to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```
   Provide your Gemini API key in `.env.local`:
   ```env
   GEMINI_API_KEY=your_gemini_api_key_here
   ```

4. **Run the Development Server**:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🧪 Running the Evaluation Benchmark

LexLens ships with a rigorous test suite evaluating extraction fidelity, hallucination prevention, adversarial injection defense, and uncertainty calibration:

- **Via Web UI**: Navigate to `/evaluation` and click **"Run Evaluation Suite"**.
- **Via API**:
  ```bash
  curl -X POST http://localhost:3000/api/evaluation/run \
    -H "Content-Type: application/json" \
    -d '{}'
  ```

---

## 🛡️ Responsible AI & Legal Disclaimer

> **Disclaimer**: LexLens provides automated structural document extraction, clause categorization, and textual difference analysis. It is an assistive intelligence tool and **does not constitute formal legal advice** or replace the counsel of a licensed attorney. Users should review extracted provisions with qualified legal professionals before taking actionable decisions.

---

## 👤 Author & Owner
This project is conceived, developed, and maintained by **[AR Singh](https://github.com/arsinghin/)**.

- **GitHub Profile**: [@arsinghin](https://github.com/arsinghin/)
- **Repository**: [https://github.com/arsinghin/contract-lens](https://github.com/arsinghin/contract-lens)

---

## 📄 License

This project is authored and owned by [AR Singh](https://github.com/arsinghin/) and licensed under the [MIT License](LICENSE) — see the [LICENSE](LICENSE) file for details.
