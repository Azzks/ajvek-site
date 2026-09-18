import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import Stripe from "stripe";
import { Resend } from "resend";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
const resend = new Resend(process.env.RESEND_API_KEY);

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: Request) {
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json(
      { error: "Signature Stripe absente." },
      { status: 400 }
    );
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret) {
    console.error("[stripe-webhook] STRIPE_WEBHOOK_SECRET manquant");

    return NextResponse.json(
      { error: "Webhook non configuré." },
      { status: 500 }
    );
  }

  const rawBody = await request.text();

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      rawBody,
      signature,
      webhookSecret
    );
  } catch (error) {
    console.error("[stripe-webhook] Signature invalide :", error);

    return NextResponse.json(
      { error: "Signature invalide." },
      { status: 400 }
    );
  }

  try {
    if (event.type !== "checkout.session.completed") {
      return NextResponse.json({ received: true });
    }

    const session = event.data.object as Stripe.Checkout.Session;

    if (session.payment_status !== "paid") {
      console.log(
        "[stripe-webhook] Session terminée mais paiement non confirmé :",
        session.id,
        session.payment_status
      );

      return NextResponse.json({ received: true });
    }

    const preorderId = session.metadata?.preorder_id;

    if (!preorderId) {
      console.error(
        "[stripe-webhook] preorder_id absent dans les metadata Stripe"
      );

      return NextResponse.json({ received: true });
    }

    const { data: preorder, error: preorderReadError } =
      await supabaseAdmin
        .from("preorders")
        .select("*")
        .eq("id", preorderId)
        .single();

    if (preorderReadError || !preorder) {
      console.error(
        "[stripe-webhook] Précommande introuvable :",
        preorderReadError
      );

      return NextResponse.json({ received: true });
    }

    if (preorder.paid === true) {
      return NextResponse.json({ received: true });
    }

    const { error: updateError } = await supabaseAdmin
      .from("preorders")
      .update({
        paid: true,
        paid_at: new Date().toISOString(),
        stripe_session_id: session.id,
      })
      .eq("id", preorderId);

    if (updateError) {
      console.error(
        "[stripe-webhook] Erreur mise à jour précommande :",
        updateError
      );

      return NextResponse.json(
        { error: "Erreur Supabase." },
        { status: 500 }
      );
    }

    const { error: ownerEmailError } = await resend.emails.send({
      from: "AJVEK <commandes@ajvek.fr>",
      to: "ajvek.contact@gmail.com",
      subject: `Précommande payée — ${preorder.product_name}`,
      text:
        `Nouvelle précommande payée !\n\n` +
        `Produit : ${preorder.product_name}\n` +
        `Couleur : ${preorder.color}\n` +
        `Taille : ${preorder.size}\n` +
        `Nom : ${preorder.name}\n` +
        `Email : ${preorder.email}\n` +
        `Téléphone : ${preorder.phone || "-"}\n` +
        `Session Stripe : ${session.id}`,
    });

    if (ownerEmailError) {
      console.error(
        "[stripe-webhook] Erreur email équipe :",
        ownerEmailError
      );
    }

    const { error: customerEmailError } = await resend.emails.send({
      from: "AJVEK <commandes@ajvek.fr>",
      to: preorder.email,
      subject: "Précommande AJVEK confirmée",
      text:
        `Bonjour ${preorder.name},\n\n` +
        `Ton paiement a bien été reçu et ta précommande AJVEK est confirmée.\n\n` +
        `Produit : ${preorder.product_name}\n` +
        `Couleur : ${preorder.color}\n` +
        `Taille : ${preorder.size}\n\n` +
        `La production sera lancée dès que le seuil de 10 précommandes payées sera atteint.\n\n` +
        `Merci pour ta confiance,\n` +
        `L'équipe AJVEK`,
    });

    if (customerEmailError) {
      console.error(
        "[stripe-webhook] Erreur email client :",
        customerEmailError
      );
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("[stripe-webhook] Erreur générale :", error);

    return NextResponse.json(
      { error: "Erreur serveur." },
      { status: 500 }
    );
  }
}