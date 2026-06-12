import { openai } from "@ai-sdk/openai";

/** True when an OpenAI API key is present (the AI chat needs one). */
export function isAiConfigured(): boolean {
  return Boolean(process.env.OPENAI_API_KEY);
}

/** The OpenAI model powering the assistant. Override with FUT_AI_MODEL. */
export function getModel() {
  return openai(process.env.FUT_AI_MODEL || "gpt-4o");
}
