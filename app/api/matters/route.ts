import { NextResponse } from "next/server";
import { serverClient } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const body = await req.json();
  const db = serverClient();

  let clientId = body.clientId as string | null;

  if (!clientId && body.newClientName) {
    const { data: lastClient } = await db
      .from("clients")
      .select("id")
      .order("id", { ascending: false })
      .limit(1)
      .maybeSingle();
    const lastNum = lastClient
      ? Number(String(lastClient.id).replace(/^c/, "")) || 0
      : 0;
    clientId = `c${lastNum + 1}`;
    const { error: clientErr } = await db.from("clients").insert({
      id: clientId,
      company: String(body.newClientName).trim(),
      plan: "per-matter",
      onboarded_at: new Date().toISOString(),
    });
    if (clientErr) {
      console.error("create client failed", clientErr);
      return NextResponse.json(
        { error: "Could not create the client." },
        { status: 500 }
      );
    }
  }

  if (!clientId) {
    return NextResponse.json(
      { error: "A client is required." },
      { status: 400 }
    );
  }

  // Next reference in sequence.
  const { data: last } = await db
    .from("matters")
    .select("reference")
    .order("reference", { ascending: false })
    .limit(1)
    .single();
  const nextNum = last
    ? Number(String(last.reference).replace("MOR-", "")) + 1
    : 1057;
  const reference = `MOR-${nextNum}`;
  const id = `m${nextNum}`;

  const fee = Number(body.fee) || 0;
  const { data, error } = await db
    .from("matters")
    .insert({
      id,
      reference,
      client_id: clientId,
      service_line: body.serviceLine,
      type: body.type,
      stage: fee > 0 ? "quoted" : "submitted",
      lawyer_id: null,
      submitted_at: new Date().toISOString(),
      is_seeded: false,
      offset_minutes: null,
      fee,
      payout: fee > 0 ? Math.round(fee * 0.45) : 0,
      channel: body.channel,
      flagged_clauses: 0,
    })
    .select()
    .single();

  if (error) {
    console.error("create matter failed", error);
    return NextResponse.json(
      { error: "Could not create the matter." },
      { status: 500 }
    );
  }

  await db.from("activity").insert({
    actor_id: "system",
    verb: "submitted",
    matter_id: id,
    client_id: clientId,
    note: `${body.type} via ${body.channel}`,
    is_seeded: false,
    offset_minutes: null,
  });

  return NextResponse.json({ matter: data });
}
