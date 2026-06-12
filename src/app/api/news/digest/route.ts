import { generateText } from "ai";
import { getModel, isAiConfigured } from "@/lib/ai/model";
import { getNews } from "@/lib/data/news";

export const maxDuration = 30;

export async function POST() {
  if (!isAiConfigured()) {
    return Response.json({ error: "AI digest needs an OPENAI_API_KEY." }, { status: 503 });
  }

  const news = getNews();
  const { text } = await generateText({
    model: getModel(),
    system:
      "You are a sharp EA Sports FC 26 Ultimate Team analyst. Summarise this week's FUT news into 3–4 tight, punchy bullets, then a single bold 'Do this:' line with the best move for a player this week. No preamble.",
    prompt: news.map((n) => `- [${n.tag}] ${n.title}: ${n.summary}`).join("\n"),
  });

  return Response.json({ digest: text });
}
