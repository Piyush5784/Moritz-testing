import { GoogleGenerativeAI } from "@google/generative-ai";
import { serverClient, type MatterStatus } from "@/lib/supabase";

export const dynamic = "force-dynamic";

const SYSTEM = `You write short client updates for Moritz, a law firm that promises same-day turnaround.

You are writing to a business client, not a lawyer. Rules:
- Three sentences maximum. Often two is right.
- State the fact first, then the revised expectation, then nothing else.
- No apology beyond a single plain acknowledgement. Never grovel.
- No legal advice, no detail about the document's contents.
- Never invent a delivery time. Use only the time given in the facts.
- Plain sentences. No greeting, no sign-off, no subject line. The administrator adds those.
- Never use the word "unfortunately" or an exclamation mark.`;

type Situation = "slipped" | "delivered";

function revisedDeliveryTime(): string {
  const d = new Date(Date.now() + 30 * 60_000);
  const mins = d.getMinutes();
  const rounded = Math.ceil(mins / 5) * 5;
  if (rounded >= 60) {
    d.setHours(d.getHours() + 1);
    d.setMinutes(0, 0, 0);
  } else {
    d.setMinutes(rounded, 0, 0);
  }
  return d.toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

function formatTurnaround(submittedAt: string, deliveredAt: string): string {
  const mins = Math.max(
    0,
    Math.round(
      (new Date(deliveredAt).getTime() - new Date(submittedAt).getTime()) /
        60_000
    )
  );
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  if (h === 0) return `${m}m`;
  return `${h}h ${m}m`;
}

function firstName(name: string | null): string {
  if (!name) return "the reviewing lawyer";
  return name.trim().split(/\s+/)[0];
}

function buildFacts(matter: MatterStatus, situation: Situation): string {
  if (situation === "slipped") {
    const past = Math.abs(Math.min(0, matter.minutes_remaining));
    return [
      `Reference: ${matter.reference}`,
      `Client: ${matter.client_name}`,
      `Matter type: ${matter.type}`,
      `Minutes past due: ${past}`,
      `Reviewing lawyer: ${firstName(matter.lawyer_name)}`,
      `Revised delivery time: ${revisedDeliveryTime()}`,
    ].join("\n");
  }

  const turnaround =
    matter.delivered_at != null
      ? formatTurnaround(matter.submitted_at, matter.delivered_at)
      : "unknown";

  return [
    `Reference: ${matter.reference}`,
    `Client: ${matter.client_name}`,
    `Matter type: ${matter.type}`,
    `Actual turnaround: ${turnaround}`,
  ].join("\n");
}

export async function POST(req: Request) {
  try {
    if (!process.env.GEMINI_API_KEY) {
      return new Response("Drafting is not configured.", { status: 503 });
    }

    const body = await req.json();
    const matterId = body?.matterId as string | undefined;
    const situation = body?.situation as Situation | undefined;
    if (!matterId || (situation !== "slipped" && situation !== "delivered")) {
      return new Response("Invalid request.", { status: 400 });
    }

    const db = serverClient();
    const { data, error } = await db
      .from("matter_status")
      .select("*")
      .eq("id", matterId)
      .single();

    if (error || !data) {
      return new Response("Matter not found.", { status: 404 });
    }

    const matter = data as MatterStatus;
    const facts = buildFacts(matter, situation);
    const promptText = `Write the client update from these facts:\n${facts}`;

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({
      model: "gemini-3.5-flash-lite",
      systemInstruction: SYSTEM,
      generationConfig: {
        temperature: 0.3,
        maxOutputTokens: 200,
      },
    });

    const result = await model.generateContentStream(promptText);

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
            encoder.encode("\n\nThe draft stopped early. Try again.")
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
    console.error("draft-update failed", e);
    return new Response(
      "Couldn't draft the update. Write it yourself or try again.",
      { status: 500 }
    );
  }
}
