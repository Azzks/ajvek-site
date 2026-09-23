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

async function findCheckoutGroupFromPaymentIntent(
  paymentIntent: Stripe.PaymentIntent
) {
  const metadataGroupId =
    paymentIntent.metadata?.checkout_group_id;

  if (metadataGroupId) {
    return metadataGroupId;
  }

  try {
    const sessions = await stripe.checkout.sessions.list({
      payment_intent: paymentIntent.id,
      limit: 1,
    });

    const session = sessions.data[0];

    return session?.metadata?.checkout_group_id || null;
  } catch (error) {
    console.error(
      "[stripe-webhook] Impossible de retrouver la session Checkout :",
      error
    );

    return null;
  }
}

export async function POST(request: Request) {
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json(
      { error: "Signature Stripe absente." },
      { status: 400 }
    );
  }

  const webhookSecret =
    process.env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret) {
    console.error(
      "[stripe-webhook] STRIPE_WEBHOOK_SECRET manquant"
    );

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
    console.error(
      "[stripe-webhook] Signature invalide :",
      error
    );

    return NextResponse.json(
      { error: "Signature invalide." },
      { status: 400 }
    );
  }

  try {
    /*
     * ============================================================
     * PAIEMENT RÉUSSI
     * ============================================================
     */

    if (event.type === "checkout.session.completed") {
      const session =
        event.data.object as Stripe.Checkout.Session;

      if (session.payment_status !== "paid") {
        return NextResponse.json({
          received: true,
        });
      }

      const checkoutGroupId =
        session.metadata?.checkout_group_id;

      if (!checkoutGroupId) {
        console.error(
          "[stripe-webhook] checkout_group_id absent"
        );

        return NextResponse.json({
          received: true,
        });
      }

      const {
        data: preorders,
        error: preorderReadError,
      } = await supabaseAdmin
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

        return NextResponse.json({
          received: true,
        });
      }

      const unpaidPreorders = preorders.filter(
        (preorder) => preorder.paid !== true
      );

      /*
       * Évite de traiter deux fois le même paiement.
       */
      if (unpaidPreorders.length === 0) {
        return NextResponse.json({
          received: true,
        });
      }

      const paidAt = new Date().toISOString();

      const { error: updateError } = await supabaseAdmin
        .from("preorders")
        .update({
          paid: true,
          paid_at: paidAt,
          stripe_session_id: session.id,
          payment_failure_notified_at: null,
          order_status: "preorder_received",
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

      const first = unpaidPreorders[0];

      const summary = unpaidPreorders
        .map(
          (preorder) =>
            `- ${preorder.product_name} — ${preorder.color} — Taille ${preorder.size}`
        )
        .join("\n");

      const customerName =
        first?.name || "client";

      const customerEmail =
        first?.email;

      const customerPhone =
        first?.phone || "-";

      const itemCount =
        unpaidPreorders.length;

      const deliveryMethod =
        first?.delivery_method === "relay"
          ? "Point Relais Mondial Relay"
          : "Livraison à domicile";

      const shippingAmount =
        typeof first?.shipping_amount === "number"
          ? `${(first.shipping_amount / 100)
              .toFixed(2)
              .replace(".", ",")} €`
          : "-";

      let deliveryDetails = deliveryMethod;

      if (first?.delivery_method === "relay") {
        deliveryDetails +=
          `\nPoint Relais : ${
            first.service_point_name || "-"
          }\n` +
          `Adresse : ${
            first.service_point_address || "-"
          }\n` +
          `Code postal : ${
            first.service_point_postal_code || "-"
          }\n` +
          `Ville : ${
            first.service_point_city || "-"
          }\n` +
          `ID Point Relais : ${
            first.service_point_id || "-"
          }`;
      }

      /*
       * EMAIL AJVEK
       */

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
            `Nombre de vêtements : ${itemCount}\n\n` +
            `Livraison :\n${deliveryDetails}\n` +
            `Frais de livraison : ${shippingAmount}\n\n` +
            `Session Stripe : ${session.id}\n`,
        });

      if (ownerEmailError) {
        console.error(
          "[stripe-webhook] Erreur email équipe :",
          ownerEmailError
        );
      }

      /*
       * EMAIL CLIENT
       */

      if (customerEmail) {
        const { error: customerEmailError } =
          await resend.emails.send({
            from: "AJVEK <commandes@ajvek.fr>",
            to: customerEmail,

            subject:
              "Précommande AJVEK confirmée",

            text:
              `Bonjour ${customerName},\n\n` +
              `Ton paiement a bien été reçu et ta précommande AJVEK est confirmée.\n\n` +
              `Articles :\n${summary}\n\n` +
              `Nombre de vêtements : ${itemCount}\n` +
              `Mode de livraison : ${deliveryMethod}\n` +
              `Frais de livraison : ${shippingAmount}\n\n` +
              `Tu peux suivre l'avancement de ta commande depuis ton espace AJVEK, rubrique « Mes commandes ».\n\n` +
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

      return NextResponse.json({
        received: true,
      });
    }

    /*
     * ============================================================
     * PAIEMENT ÉCHOUÉ
     * ============================================================
     */

    if (event.type === "payment_intent.payment_failed") {
      const paymentIntent =
        event.data.object as Stripe.PaymentIntent;

      const checkoutGroupId =
        await findCheckoutGroupFromPaymentIntent(
          paymentIntent
        );

      if (!checkoutGroupId) {
        console.error(
          "[stripe-webhook] Paiement échoué sans checkout_group_id :",
          paymentIntent.id
        );

        return NextResponse.json({
          received: true,
        });
      }

      const {
        data: preorders,
        error: preorderError,
      } = await supabaseAdmin
        .from("preorders")
        .select("*")
        .eq("checkout_group_id", checkoutGroupId);

      if (
        preorderError ||
        !preorders ||
        preorders.length === 0
      ) {
        console.error(
          "[stripe-webhook] Précommande échouée introuvable :",
          preorderError
        );

        return NextResponse.json({
          received: true,
        });
      }

      /*
       * Si le paiement a finalement réussi,
       * aucun email d'échec ne doit partir.
       */
      if (
        preorders.some(
          (preorder) => preorder.paid === true
        )
      ) {
        return NextResponse.json({
          received: true,
        });
      }

      /*
       * Un seul email d'échec par Checkout.
       */
      if (
        preorders.some(
          (preorder) =>
            preorder.payment_failure_notified_at
        )
      ) {
        return NextResponse.json({
          received: true,
        });
      }

      const first = preorders[0];

      const customerName =
        first?.name || "client";

      const customerEmail =
        first?.email;

      const itemCount =
        preorders.length;

      const summary = preorders
        .map(
          (preorder) =>
            `- ${preorder.product_name} — ${preorder.color} — Taille ${preorder.size}`
        )
        .join("\n");

      const declineCode =
        paymentIntent.last_payment_error?.decline_code ||
        paymentIntent.last_payment_error?.code ||
        "non précisé";

      const failureMessage =
        paymentIntent.last_payment_error?.message ||
        "Le paiement n'a pas pu être validé.";

      /*
       * On marque l'échec comme déjà notifié.
       */
      const notifiedAt =
        new Date().toISOString();

      const {
        error: notificationUpdateError,
      } = await supabaseAdmin
        .from("preorders")
        .update({
          payment_failure_notified_at: notifiedAt,
        })
        .eq("checkout_group_id", checkoutGroupId)
        .eq("paid", false);

      if (notificationUpdateError) {
        console.error(
          "[stripe-webhook] Erreur anti-spam paiement échoué :",
          notificationUpdateError
        );

        return NextResponse.json(
          { error: "Erreur Supabase." },
          { status: 500 }
        );
      }

      /*
       * EMAIL CLIENT
       */

      if (customerEmail) {
        const {
          error: customerFailureEmailError,
        } = await resend.emails.send({
          from: "AJVEK <commandes@ajvek.fr>",
          to: customerEmail,

          subject:
            "Ton paiement AJVEK n'a pas abouti",

          text:
            `Bonjour ${customerName},\n\n` +
            `Nous avons bien reçu ta tentative de commande AJVEK, mais ton paiement n'a pas pu être validé.\n\n` +
            `Ta commande n'est donc pas encore confirmée.\n\n` +
            `Articles :\n${summary}\n\n` +
            `Tu peux réessayer le paiement avec une autre carte ou un autre moyen de paiement.\n\n` +
            `Si le problème persiste, vérifie auprès de ta banque que le paiement est autorisé.\n\n` +
            `Aucune commande ne sera mise en production tant que le paiement n'aura pas été confirmé.\n\n` +
            `À bientôt,\n` +
            `L'équipe AJVEK`,
        });

        if (customerFailureEmailError) {
          console.error(
            "[stripe-webhook] Erreur email client paiement échoué :",
            customerFailureEmailError
          );
        }
      }

      /*
       * EMAIL AJVEK
       */

      const {
        error: ownerFailureEmailError,
      } = await resend.emails.send({
        from: "AJVEK <commandes@ajvek.fr>",
        to: "ajvek.contact@gmail.com",

        subject: `Paiement échoué — ${customerName}`,

        text:
          `Un paiement AJVEK a échoué.\n\n` +
          `Client : ${customerName}\n` +
          `Email : ${customerEmail || "-"}\n\n` +
          `Articles :\n${summary}\n\n` +
          `Nombre de vêtements : ${itemCount}\n\n` +
          `PaymentIntent Stripe : ${paymentIntent.id}\n` +
          `Code de refus : ${declineCode}\n` +
          `Message Stripe : ${failureMessage}\n\n` +
          `La commande reste non payée dans Supabase.\n`,
      });

      if (ownerFailureEmailError) {
        console.error(
          "[stripe-webhook] Erreur email équipe paiement échoué :",
          ownerFailureEmailError
        );
      }

      return NextResponse.json({
        received: true,
      });
    }

    /*
     * Tous les autres événements Stripe sont ignorés.
     */

    return NextResponse.json({
      received: true,
    });
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