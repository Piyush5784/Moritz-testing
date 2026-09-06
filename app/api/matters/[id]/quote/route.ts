import { NextResponse } from "next/server";
import { serverClient } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { fee } = await req.json();
  const amount = Number(fee);

  if (!amount || amount <= 0) {
    return NextResponse.json({ error: "A positive fee is required" }, { status: 400 });
  }

  const db = serverClient();
  const { data, error } = await db
    .from("matters")
    .update({ fee: amount, payout: Math.round(amount * 0.45), stage: "quoted" })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("quote failed", error);
    return NextResponse.json({ error: "Could not send the quote." }, { status: 500 });
  }
  return NextResponse.json({ matter: data });
}