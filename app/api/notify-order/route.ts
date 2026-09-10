import { Resend } from "resend";
import { NextResponse } from "next/server";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
  const order = await request.json();

  const itemsList = order.items
    .map((i: any) => `- ${i.name} (${i.colorLabel}, taille ${i.size}) x${i.quantity}`)
    .join("\n");

  try {
    await resend.emails.send({
      from: "AJVEK <onboarding@resend.dev>",
      to: "ajvek.contact@gmail.com",
      subject: `Nouvelle commande — ${order.name}`,
      text: `Nouvelle commande reçue !\n\nNom: ${order.name}\nEmail: ${order.email}\nAdresse: ${order.address}, ${order.postal_code} ${order.city}\n\nArticles:\n${itemsList}\n\nTotal: ${order.total_price.toFixed(2)} €`,
    });
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}