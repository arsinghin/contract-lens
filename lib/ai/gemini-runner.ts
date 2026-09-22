// Robust Gemini runner with automatic model fallback, strict timeout, and error resilience
import { getGeminiClient } from "./gemini";
import { GEMINI_MODEL, GEMINI_FALLBACK_MODELS } from "./config";
import { GLOBAL_SYSTEM_INSTRUCTION } from "@/lib/prompts";
import { aiCache } from "@/lib/cache/ai-cache";

interface GenerateOptions {
  contents: string;
  systemInstruction?: string;
  responseMimeType?: string;
  temperature?: number;
  timeoutMs?: number;
  skipCache?: boolean;
}

function timeoutPromise<T>(ms: number, promise: Promise<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error(`Operation timed out after ${ms}ms`));
    }, ms);

    promise
      .then((res) => {
        clearTimeout(timer);
        resolve(res);
      })
      .catch((err) => {
        clearTimeout(timer);
        reject(err);
      });
  });
}

export async function generateContentWithFallback(options: GenerateOptions): Promise<string> {
  // Check cache for identical prompts (huge efficiency gain)
  const cacheKey = (options.systemInstruction || "") + "::" + options.contents;
  const hashedKey = `gemini_${cacheKey.length}_` + cacheKey.slice(0, 100);
  if (!options.skipCache) {
    const cached = aiCache.get<string>(hashedKey);
    if (cached) {
      return cached;
    }
  }

  const gemini = getGeminiClient();
  const modelsToTry = [GEMINI_MODEL, ...GEMINI_FALLBACK_MODELS];
  const timeoutMs = options.timeoutMs || 25000;
  let lastError: any = null;

  for (const model of modelsToTry) {
    // Try up to 2 attempts per model in case of temporary 503 spike
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        const call = gemini.models.generateContent({
          model,
          contents: options.contents,
          config: {
            systemInstruction: options.systemInstruction || GLOBAL_SYSTEM_INSTRUCTION,
            temperature: options.temperature ?? 0,
            responseMimeType: options.responseMimeType || "application/json",
          },
        });

        const response = await timeoutPromise(timeoutMs, call);

        if (response && response.text) {
          aiCache.set(hashedKey, response.text);
          return response.text;
        }
      } catch (err: any) {

        console.warn(`Model ${model} (attempt ${attempt + 1}) call failed or timed out:`, err.message || err);
        lastError = err;

        // If 503 (temporary high demand spike), wait briefly before retrying same model.
        // For 429 (rate/quota limit), immediately advance to next model to avoid compounding delays.
        const isDemandSpike =
          err?.status === "UNAVAILABLE" ||
          err?.code === 503 ||
          err?.message?.includes("503") ||
          err?.message?.includes("high demand");

        if (isDemandSpike && attempt === 0) {
          await new Promise((r) => setTimeout(r, 800));
          continue;
        }
        break;
      }
    }
  }

  throw lastError || new Error("All Gemini models failed to generate response within timeout.");
}
