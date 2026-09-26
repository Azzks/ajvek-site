import { Resend } from "resend";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    console.error(
      "[notify-order] RESEND_API_KEY manquante."
    );

    return NextResponse.json(
      { ok: false },
      { status: 500 }
    );
  }

  const resend = new Resend(apiKey);

  const order = await request.json();

  const itemsList = order.items
    .map(
      (i: any) =>
        `- ${i.name} (${i.colorLabel}, taille ${i.size}) x${i.quantity}`
    )
    .join("\n");

  try {
    await resend.emails.send({
      from: "AJVEK <onboarding@resend.dev>",
      to: "ajvek.contact@gmail.com",
      subject: `Nouvelle commande — ${order.name}`,
      text: `Nouvelle commande reçue !

Nom: ${order.name}
Email: ${order.email}
Adresse: ${order.address}, ${order.postal_code} ${order.city}

Articles:
${itemsList}

Total: ${order.total_price.toFixed(2)} €`,
    });

    return NextResponse.json({
      ok: true,
    });
  } catch (error) {
    console.error(
      "[notify-order] Erreur Resend:",
      error
    );

    return NextResponse.json(
      { ok: false },
      { status: 500 }
    );
  }
}