import { NextResponse } from "next/server";
import { getOverview } from "@/lib/queries";

// Always fresh. The four hour clock is the product.
export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    const data = await getOverview();
    return NextResponse.json(data, {
      headers: { "Cache-Control": "no-store" },
    });
  } catch (e) {
    console.error("overview failed", e);
    return NextResponse.json(
      { error: "Could not load the firm overview." },
      { status: 500 }
    );
  }
}