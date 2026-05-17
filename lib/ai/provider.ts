// Unified AI provider — OpenAI (preferred) or Gemini fallback

export type AIProviderName = "openai" | "gemini";

export function getAIProviderName(): AIProviderName {
  const configured = process.env.AI_PROVIDER?.toLowerCase();
  if (configured === "gemini") return "gemini";
  if (configured === "openai" && process.env.OPENAI_API_KEY) return "openai";
  if (process.env.OPENAI_API_KEY) return "openai";
  if (process.env.GEMINI_API_KEY) return "gemini";
  return "openai";
}

export function getAIModelName(): string {
  const provider = getAIProviderName();
  if (provider === "openai") {
    return process.env.OPENAI_MODEL || "gpt-4o-mini";
  }
  return process.env.GEMINI_MODEL || "gemini-1.5-flash";
}

export async function generateAIText(prompt: string): Promise<string> {
  const provider = getAIProviderName();
  if (provider === "openai") {
    const { callOpenAI } = await import("./openai");
    return callOpenAI(prompt);
  }
  const { callGemini } = await import("./gemini");
  return callGemini(prompt);
}

export function aiUnavailableMessage(): string {
  const provider = getAIProviderName();
  if (provider === "openai") {
    return "AI service unavailable: configure OPENAI_API_KEY in environment.";
  }
  return "AI service unavailable: configure GEMINI_API_KEY in environment.";
}
