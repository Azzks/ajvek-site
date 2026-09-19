import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const publicKey = process.env.SENDCLOUD_PUBLIC_KEY;

  if (!publicKey) {
    return NextResponse.json(
      { error: "Clé publique Sendcloud manquante." },
      { status: 500 }
    );
  }

  return NextResponse.json({
    publicKey,
    country: "FR",
    language: "fr-fr",
    carriers: ["mondial_relay"],
  });
}