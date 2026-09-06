import { GoogleGenerativeAI } from "@google/generative-ai";
import { getOverview } from "@/lib/queries";
import { buildChatContext } from "@/lib/chat-context";

export const dynamic = "force-dynamic";

const SYSTEM = `You are the operations assistant for Moritz, an AI-native law firm.
You answer questions about this firm's current state using only the context provided.

Rules:
- Answer in two or three short sentences. Never more than four.
- Always name the specific matters or lawyers your answer is based on, by reference or name.
- Use the numbers in the context. Never estimate or round differently.
- If the context does not contain the answer, say so in one sentence and stop. Do not speculate.
- You have no knowledge of law, contracts, or anything outside this firm's data.
- Plain sentences. No markdown headers, no bullet lists, no bold.
- Never use the word "I" more than once in an answer.`;

type ChatMessage = { role: string; content: string };

export async function POST(req: Request) {
  try {
    if (!process.env.GEMINI_API_KEY) {
      return new Response("Assistant is not configured.", { status: 503 });
    }

    const { messages } = await req.json();
    if (!Array.isArray(messages)) {
      return new Response("Invalid messages.", { status: 400 });
    }

    const payload = await getOverview();
    const context = buildChatContext(payload);

    const typed = messages as ChatMessage[];
    const lastUser = [...typed].reverse().find((m) => m.role === "user");
    if (!lastUser?.content?.trim()) {
      return new Response("Invalid messages.", { status: 400 });
    }

    const prior = typed.slice(0, typed.lastIndexOf(lastUser));
    const history = prior.map((m) => ({
      role: m.role === "assistant" ? ("model" as const) : ("user" as const),
      parts: [{ text: m.content }],
    }));

    const promptText = `Current firm state:\n${context}\n\nQuestion: ${lastUser.content}`;

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({
      model: "gemini-3.5-flash-lite",
      systemInstruction: SYSTEM,
      generationConfig: {
        temperature: 0.3,
        maxOutputTokens: 300,
      },
    });

    const result =
      history.length === 0
        ? await model.generateContentStream(promptText)
        : await model
            .startChat({ history })
            .sendMessageStream(promptText);

    const encoder = new TextEncoder();
    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of result.stream) {
            const text = chunk.text();
            if (text) controller.enqueue(encoder.encode(text));
          }
        } catch {
          controller.enqueue(
            encoder.encode("\n\nThe answer stopped early. Try again.")
          );
        } finally {
          controller.close();
        }
      },
    });

    return new Response(readable, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-store",
      },
    });
  } catch (e) {
    console.error("ask failed", e);
    return new Response("Couldn't reach the assistant. Try again.", {
      status: 500,
    });
  }
}
