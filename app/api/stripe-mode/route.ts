import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const key = process.env.STRIPE_SECRET_KEY;

  if (!key) {
    return NextResponse.json({
      mode: "missing",
    });
  }

  if (key.startsWith("sk_live_")) {
    return NextResponse.json({
      mode: "live",
    });
  }

  if (key.startsWith("sk_test_")) {
    return NextResponse.json({
      mode: "test",
    });
  }

  return NextResponse.json({
    mode: "unknown",
  });
}