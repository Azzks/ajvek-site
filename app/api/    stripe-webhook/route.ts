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
      return NextResponse.json({ received: true });
    }

    const checkoutGroupId =
      session.metadata?.checkout_group_id;

    if (!checkoutGroupId) {
      console.error(
        "[stripe-webhook] checkout_group_id absent"
      );

      return NextResponse.json({ received: true });
    }

    const { data: preorders, error: preorderReadError } =
      await supabaseAdmin
        .from("preorders")
        .select("*")
        .eq("checkout_group_id", checkoutGroupId);

    if (
      preorderReadError ||
      !preorders ||
      preorders.length === 0
    ) {
      console.error(
        "[stripe-webhook] Précommandes introuvables :",
        preorderReadError
      );

      return NextResponse.json({ received: true });
    }

    const unpaidPreorders = preorders.filter(
      (preorder) => preorder.paid !== true
    );

    if (unpaidPreorders.length === 0) {
      return NextResponse.json({ received: true });
    }

    const paidAt = new Date().toISOString();

    const { error: updateError } = await supabaseAdmin
      .from("preorders")
      .update({
        paid: true,
        paid_at: paidAt,
        stripe_session_id: session.id,
      })
      .eq("checkout_group_id", checkoutGroupId);

    if (updateError) {
      console.error(
        "[stripe-webhook] Erreur mise à jour précommandes :",
        updateError
      );

      return NextResponse.json(
        { error: "Erreur Supabase." },
        { status: 500 }
      );
    }

    const summary = unpaidPreorders
      .map(
        (preorder) =>
          `- ${preorder.product_name} — ${preorder.color} — Taille ${preorder.size}`
      )
      .join("\n");

    const customerName =
      unpaidPreorders[0]?.name || "client";

    const customerEmail =
      unpaidPreorders[0]?.email;

    const customerPhone =
      unpaidPreorders[0]?.phone || "-";

    const itemCount = unpaidPreorders.length;

    const { error: ownerEmailError } =
      await resend.emails.send({
        from: "AJVEK <commandes@ajvek.fr>",
        to: "ajvek.contact@gmail.com",
        subject: `Précommande payée — ${itemCount} vêtement${
          itemCount > 1 ? "s" : ""
        }`,
        text:
          `Nouvelle précommande payée !\n\n` +
          `Client : ${customerName}\n` +
          `Email : ${customerEmail}\n` +
          `Téléphone : ${customerPhone}\n\n` +
          `Articles :\n${summary}\n\n` +
          `Nombre de vêtements : ${itemCount}\n` +
          `Session Stripe : ${session.id}\n`,
      });

    if (ownerEmailError) {
      console.error(
        "[stripe-webhook] Erreur email équipe :",
        ownerEmailError
      );
    }

    if (customerEmail) {
      const { error: customerEmailError } =
        await resend.emails.send({
          from: "AJVEK <commandes@ajvek.fr>",
          to: customerEmail,
          subject: "Précommande AJVEK confirmée",
          text:
            `Bonjour ${customerName},\n\n` +
            `Ton paiement a bien été reçu et ta précommande AJVEK est confirmée.\n\n` +
            `Articles :\n${summary}\n\n` +
            `Nombre de vêtements : ${itemCount}\n\n` +
            `La production sera lancée dès que le seuil de 10 vêtements précommandés et payés sera atteint.\n\n` +
            `Merci pour ta confiance,\n` +
            `L'équipe AJVEK`,
        });

      if (customerEmailError) {
        console.error(
          "[stripe-webhook] Erreur email client :",
          customerEmailError
        );
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error(
      "[stripe-webhook] Erreur générale :",
      error
    );

    return NextResponse.json(
      { error: "Erreur serveur." },
      { status: 500 }
    );
  }
}