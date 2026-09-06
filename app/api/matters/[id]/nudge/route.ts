import { NextResponse } from "next/server";
import { serverClient } from "@/lib/supabase";

export const dynamic = "force-dynamic";

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
    actor_id: matter.lawyer_id,
    verb: "escalated",
    matter_id: matter.id,
    client_id: matter.client_id,
    note: "nudged by operations",
    is_seeded: false,
    offset_minutes: null,
  });
  if (error) {
    return NextResponse.json(
      { error: "Could not send the nudge." },
      { status: 500 }
    );
  }
  return NextResponse.json({ ok: true, reference: matter.reference });
}
