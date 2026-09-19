import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const stripeKey = process.env.STRIPE_SECRET_KEY ?? "";

  return NextResponse.json({
    vercelEnv: process.env.VERCEL_ENV ?? "unknown",
    stripePrefix: stripeKey.slice(0, 8),
    hasStripeKey: Boolean(stripeKey),
  });
}