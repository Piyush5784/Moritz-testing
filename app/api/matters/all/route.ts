import { NextResponse } from "next/server";
import { getMattersDirectory } from "@/lib/queries";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    const data = await getMattersDirectory();
    return NextResponse.json(data, {
      headers: { "Cache-Control": "no-store" },
    });
  } catch (e) {
    console.error("matters directory failed", e);
    return NextResponse.json(
      { error: "Could not load matters." },
      { status: 500 }
    );
  }
}
