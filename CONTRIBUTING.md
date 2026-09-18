# Contributing to LexLens

Thank you for your interest in contributing to **LexLens**! We welcome bug fixes, documentation improvements, new contract benchmark cases, and UI/UX refinements.

---

## 🛠️ Development Setup

1. **Fork and clone the repository**:
   ```bash
   git clone https://github.com/arsinghin/contract-lens.git
   cd contract-lens
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Set up local environment variables**:
   ```bash
   cp .env.example .env.local
   ```
   Add your `GEMINI_API_KEY` to `.env.local`.

4. **Run the local development server**:
   ```bash
   npm run dev
   ```

---

## 📋 Code Quality & Verification

Before opening a pull request, ensure all linters, type checks, and production builds pass:

```bash
# 1. Run ESLint checks
npm run lint

# 2. Test production build
npm run build
```

Verify that benchmark test cases continue to pass at 100%:
```bash
curl -s -X POST http://localhost:3000/api/evaluation/run -H "Content-Type: application/json" -d '{}'
```

---

## 📐 Guidelines & Principles

- **No Mock Hallucinations**: Every clause, obligation, and finding must link to a valid source text offset (`Evidence` entity).
- **Strict Uncertainty Calibration**: If a document is silent on a matter, the answer must explicitly reflect `not_established` rather than speculating.
- **Accessible & High-Contrast UI**: Adhere to clean typography, WCAG AA contrast standards, and responsive desktop/mobile layouts.
- **Commit Messages**: Write clear, conventional commit messages (e.g., `feat(clauses): add confidence badge filtering`, `fix(modal): prevent event bubbling on backdrop click`).

---

## 📜 Code of Conduct

Please treat all contributors with respect, professionalism, and constructive feedback.
