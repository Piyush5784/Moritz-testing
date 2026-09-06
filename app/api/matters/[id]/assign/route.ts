import { NextResponse } from "next/server";
import { serverClient } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { lawyerId } = await req.json();

  if (!lawyerId) {
    return NextResponse.json({ error: "lawyerId is required" }, { status: 400 });
  }

  const db = serverClient();
  const { data, error } = await db
    .from("matters")
    .update({ lawyer_id: lawyerId, stage: "drafting" })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("assign failed", error);
    return NextResponse.json({ error: "Could not assign this matter." }, { status: 500 });
  }
  return NextResponse.json({ matter: data });
}