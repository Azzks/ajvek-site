import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json(
    {
      ok: false,
      error:
        "Cette ancienne route de précommande n'est plus utilisée. Les paiements sont désormais effectués directement via Stripe.",
    },
    { status: 410 }
  );
}