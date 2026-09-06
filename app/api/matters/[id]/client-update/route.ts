import { NextResponse } from "next/server";
import { serverClient } from "@/lib/supabase";

export const dynamic = "force-dynamic";

/** Logs a client update to activity. Email delivery is out of scope. */
export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const db = serverClient();

  const { data: matter, error: readErr } = await db
    .from("matters")
    .select("id, client_id, lawyer_id, reference")
    .eq("id", id)
    .single();

  if (readErr || !matter) {
    return NextResponse.json({ error: "Matter not found." }, { status: 404 });
  }

  const { error } = await db.from("activity").insert({
    actor_id: "system",
    verb: "escalated",
    matter_id: matter.id,
    client_id: matter.client_id,
    note: "client updated",
    is_seeded: false,
    offset_minutes: null,
  });

  if (error) {
    console.error("client update log failed", error);
    return NextResponse.json(
      { error: "Could not log the update." },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true, reference: matter.reference });
}
