// LexLens AI Configuration - Based on 06_TECHNICAL_ARCHITECTURE.md and 15_GEMINI_INTEGRATION.md

export const GEMINI_MODEL = "gemini-3.8-flash";
export const GEMINI_FALLBACK_MODELS = ["gemini-2.5-flash"];

export const GEMINI_CONFIG = {
  temperature: 0, // Deterministic for legal extraction
};
