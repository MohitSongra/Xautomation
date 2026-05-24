import { generateWithGemini } from "./gemini";
import { generateWithGroq } from "./groq";

export type AIProvider = "gemini" | "groq";

/**
 * Generate text with automatic fallback.
 * Tries Gemini Flash first (free), falls back to Groq (free).
 */
export async function generateText(
  prompt: string,
  systemPrompt?: string,
  preferredProvider: AIProvider = "gemini"
): Promise<{ text: string; provider: AIProvider }> {
  const providers: AIProvider[] =
    preferredProvider === "gemini" ? ["gemini", "groq"] : ["groq", "gemini"];

  for (const provider of providers) {
    try {
      let text: string;
      if (provider === "gemini") {
        text = await generateWithGemini(prompt, systemPrompt);
      } else {
        text = await generateWithGroq(prompt, systemPrompt);
      }
      return { text, provider };
    } catch (error) {
      console.warn(`AI provider ${provider} failed, trying next...`, error);
      continue;
    }
  }

  throw new Error("All AI providers failed. Check your API keys.");
}

/**
 * Parse JSON from AI response, handling markdown code blocks.
 */
export function parseAIJson<T>(text: string): T {
  // Strip markdown code blocks if present
  let cleaned = text.trim();
  if (cleaned.startsWith("```json")) {
    cleaned = cleaned.slice(7);
  } else if (cleaned.startsWith("```")) {
    cleaned = cleaned.slice(3);
  }
  if (cleaned.endsWith("```")) {
    cleaned = cleaned.slice(0, -3);
  }
  return JSON.parse(cleaned.trim());
}
