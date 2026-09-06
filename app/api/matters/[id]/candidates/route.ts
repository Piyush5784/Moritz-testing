import { NextResponse } from "next/server";
import { getAssignCandidates } from "@/lib/queries";

export const dynamic = "force-dynamic";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    return NextResponse.json(await getAssignCandidates(id));
  } catch (e) {
    console.error("candidates failed", e);
    return NextResponse.json(
      { error: "Could not load available lawyers." },
      { status: 500 }
    );
  }
}