import { Resend } from "resend";
import { NextResponse } from "next/server";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
  const preorder = await request.json();

  try {
    await resend.emails.send({
      from: "AJVEK <onboarding@resend.dev>",
      to: "ajvek.contact@gmail.com",
      subject: `Nouvelle précommande — ${preorder.product_name}`,
      text: `Nouvelle précommande !\n\nProduit: ${preorder.product_name}\nCouleur: ${preorder.color}\nTaille: ${preorder.size}\n\nNom: ${preorder.name}\nEmail: ${preorder.email}\nTéléphone: ${preorder.phone || "non renseigné"}`,
    });
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}