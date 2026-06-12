import {
  convertToModelMessages,
  stepCountIs,
  streamText,
  type InferUITools,
  type UIDataTypes,
  type UIMessage,
} from "ai";
import { futTools } from "@/lib/ai/tools";
import { SYSTEM_PROMPT } from "@/lib/ai/prompts";
import { getModel, isAiConfigured } from "@/lib/ai/model";

export const maxDuration = 60;

export type ChatTools = InferUITools<typeof futTools>;
export type ChatMessage = UIMessage<never, UIDataTypes, ChatTools>;

export async function POST(req: Request) {
  if (!isAiConfigured()) {
    return Response.json(
      { error: "The AI coach needs an OPENAI_API_KEY. The squad builder, solver and search still work without it." },
      { status: 503 },
    );
  }

  const { messages }: { messages: ChatMessage[] } = await req.json();

  const result = streamText({
    model: getModel(),
    system: SYSTEM_PROMPT,
    messages: await convertToModelMessages(messages),
    stopWhen: stepCountIs(6),
    tools: futTools,
  });

  return result.toUIMessageStreamResponse();
}
