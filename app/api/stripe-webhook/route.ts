import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import Stripe from "stripe";
import { Resend } from "resend";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

const resend = new Resend(process.env.RESEND_API_KEY);

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  }
);

const SITE_URL = "https://ajvek.fr";
const OWNER_EMAIL = "ajvek.contact@gmail.com";
const FROM_EMAIL = "AJVEK <commandes@ajvek.fr>";

/*
 * ============================================================
 * OUTILS
 * ============================================================
 */

function escapeHtml(value: unknown) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function formatEurosFromCents(amount: number) {
  return `${(amount / 100)
    .toFixed(2)
    .replace(".", ",")} €`;
}

function shortOrderId(id: string) {
  return id
    .replaceAll("-", "")
    .slice(0, 8)
    .toUpperCase();
}

/*
 * ============================================================
 * TEMPLATE EMAIL
 * ============================================================
 */

function buildEmailLayout({
  eyebrow,
  title,
  intro,
  content,
  buttonLabel,
  buttonUrl,
  footerText,
}: {
  eyebrow: string;
  title: string;
  intro: string;
  content: string;
  buttonLabel?: string;
  buttonUrl?: string;
  footerText?: string;
}) {
  const button =
    buttonLabel && buttonUrl
      ? `
        <table
          role="presentation"
          width="100%"
          cellspacing="0"
          cellpadding="0"
          border="0"
          style="margin-top:32px;"
        >
          <tr>
            <td align="center">
              <a
                href="${escapeHtml(buttonUrl)}"
                style="
                  display:inline-block;
                  background:#f3f0ea;
                  color:#0c0c0b;
                  text-decoration:none;
                  padding:15px 28px;
                  border-radius:999px;
                  font-family:Arial,Helvetica,sans-serif;
                  font-size:11px;
                  font-weight:700;
                  letter-spacing:2px;
                  text-transform:uppercase;
                "
              >
                ${escapeHtml(buttonLabel)}
              </a>
            </td>
          </tr>
        </table>
      `
      : "";

  return `
<!doctype html>
<html lang="fr">
<head>
  <meta charset="utf-8" />
  <meta
    name="viewport"
    content="width=device-width, initial-scale=1"
  />
  <title>AJVEK</title>
</head>

<body
  style="
    margin:0;
    padding:0;
    background:#0c0c0b;
    color:#f3f0ea;
  "
>
  <table
    role="presentation"
    width="100%"
    cellspacing="0"
    cellpadding="0"
    border="0"
    style="background:#0c0c0b;"
  >
    <tr>
      <td
        align="center"
        style="padding:32px 16px;"
      >
        <table
          role="presentation"
          width="100%"
          cellspacing="0"
          cellpadding="0"
          border="0"
          style="
            max-width:620px;
            background:#111110;
            border:1px solid #2a2926;
          "
        >
          <tr>
            <td
              style="
                padding:28px 32px;
                border-bottom:1px solid #2a2926;
              "
            >
              <table
                role="presentation"
                width="100%"
                cellspacing="0"
                cellpadding="0"
                border="0"
              >
                <tr>
                  <td
                    style="
                      font-family:Georgia,'Times New Roman',serif;
                      font-size:26px;
                      letter-spacing:5px;
                      color:#f3f0ea;
                    "
                  >
                    AJVEK
                  </td>

                  <td
                    align="right"
                    style="
                      font-family:Arial,Helvetica,sans-serif;
                      font-size:9px;
                      letter-spacing:2px;
                      text-transform:uppercase;
                      color:#8f8b83;
                    "
                  >
                    Créé en France
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <tr>
            <td
              style="
                padding:40px 32px 36px;
              "
            >
              <p
                style="
                  margin:0;
                  font-family:Arial,Helvetica,sans-serif;
                  font-size:9px;
                  line-height:16px;
                  letter-spacing:3px;
                  text-transform:uppercase;
                  color:#8f8b83;
                "
              >
                ${escapeHtml(eyebrow)}
              </p>

              <h1
                style="
                  margin:14px 0 0;
                  font-family:Georgia,'Times New Roman',serif;
                  font-size:34px;
                  line-height:40px;
                  font-weight:400;
                  color:#f3f0ea;
                "
              >
                ${escapeHtml(title)}
              </h1>

              <p
                style="
                  margin:20px 0 0;
                  font-family:Arial,Helvetica,sans-serif;
                  font-size:14px;
                  line-height:24px;
                  color:#aaa69e;
                "
              >
                ${intro}
              </p>

              ${content}
              ${button}

              <p
                style="
                  margin:34px 0 0;
                  padding-top:24px;
                  border-top:1px solid #2a2926;
                  font-family:Arial,Helvetica,sans-serif;
                  font-size:11px;
                  line-height:20px;
                  color:#77736d;
                  text-align:center;
                "
              >
                ${
                  footerText ||
                  "Merci de faire partie de l’aventure AJVEK."
                }
              </p>
            </td>
          </tr>

          <tr>
            <td
              align="center"
              style="
                padding:22px 32px;
                border-top:1px solid #2a2926;
                font-family:Arial,Helvetica,sans-serif;
                font-size:9px;
                line-height:17px;
                letter-spacing:2px;
                text-transform:uppercase;
                color:#66625d;
              "
            >
              AJVEK · Bordeaux · France
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;
}

/*
 * ============================================================
 * REGROUPEMENT DES ARTICLES
 * ============================================================
 */

type GroupedItem = {
  product_slug: string;
  name: string;
  color: string;
  size: string;
  quantity: number;
};

function groupItems(rows: any[]): GroupedItem[] {
  const grouped = new Map<string, GroupedItem>();

  for (const row of rows) {
    const key = [
      row.product_slug,
      row.color,
      row.size,
    ].join("::");

    const existing = grouped.get(key);

    if (existing) {
      existing.quantity += 1;
    } else {
      grouped.set(key, {
        product_slug: row.product_slug,
        name: row.product_name || "AJVEK",
        color: row.color || "-",
        size: row.size || "-",
        quantity: 1,
      });
    }
  }

  return Array.from(grouped.values());
}

function buildItemsHtml(rows: any[]) {
  return groupItems(rows)
    .map(
      (item) => `
        <tr>
          <td
            style="
              padding:16px 0;
              border-bottom:1px solid #2a2926;
            "
          >
            <p
              style="
                margin:0;
                font-family:Georgia,'Times New Roman',serif;
                font-size:18px;
                line-height:24px;
                color:#f3f0ea;
              "
            >
              ${escapeHtml(item.name)}
            </p>

            <p
              style="
                margin:7px 0 0;
                font-family:Arial,Helvetica,sans-serif;
                font-size:11px;
                line-height:18px;
                color:#8f8b83;
              "
            >
              ${escapeHtml(item.color)}
              · Taille ${escapeHtml(item.size)}
              · × ${item.quantity}
            </p>
          </td>
        </tr>
      `
    )
    .join("");
}

function buildTextSummary(rows: any[]) {
  return groupItems(rows)
    .map(
      (item) =>
        `- ${item.name} — ${item.color} — Taille ${item.size} — x${item.quantity}`
    )
    .join("\n");
}

/*
 * ============================================================
 * RETROUVER LE CHECKOUT GROUP
 * ============================================================
 */

async function findCheckoutGroupFromPaymentIntent(
  paymentIntent: Stripe.PaymentIntent
) {
  const metadataGroupId =
    paymentIntent.metadata?.checkout_group_id;

  if (metadataGroupId) {
    return metadataGroupId;
  }

  try {
    const sessions =
      await stripe.checkout.sessions.list({
        payment_intent: paymentIntent.id,
        limit: 1,
      });

    return (
      sessions.data[0]?.metadata
        ?.checkout_group_id || null
    );
  } catch (error) {
    console.error(
      "[stripe-webhook] Impossible de retrouver la session Checkout :",
      error
    );

    return null;
  }
}

/*
 * ============================================================
 * WEBHOOK
 * ============================================================
 */

export async function POST(request: Request) {
  const signature =
    request.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json(
      {
        error: "Signature Stripe absente.",
      },
      {
        status: 400,
      }
    );
  }

  const webhookSecret =
    process.env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret) {
    console.error(
      "[stripe-webhook] STRIPE_WEBHOOK_SECRET manquant"
    );

    return NextResponse.json(
      {
        error: "Webhook non configuré.",
      },
      {
        status: 500,
      }
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
      {
        error: "Signature invalide.",
      },
      {
        status: 400,
      }
    );
  }

  try {
    /*
     * ========================================================
     * PAIEMENT RÉUSSI
     * ========================================================
     */

    if (
      event.type ===
      "checkout.session.completed"
    ) {
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

      /*
       * ======================================================
       * RÉCUPÉRATION DE LA COMMANDE
       * ======================================================
       *
       * On récupère les informations AVANT la finalisation
       * pour construire ensuite les emails.
       * ======================================================
       */

      const {
        data: orders,
        error: orderReadError,
      } = await supabaseAdmin
        .from("preorders")
        .select("*")
        .eq(
          "checkout_group_id",
          checkoutGroupId
        );

      if (
        orderReadError ||
        !orders ||
        orders.length === 0
      ) {
        console.error(
          "[stripe-webhook] Commande introuvable :",
          orderReadError
        );

        return NextResponse.json(
          {
            error: "Commande introuvable.",
          },
          {
            status: 500,
          }
        );
      }

      /*
       * ======================================================
       * FINALISATION ATOMIQUE
       * ======================================================
       *
       * PostgreSQL effectue maintenant EN UNE TRANSACTION :
       *
       * - verrouillage de la commande
       * - vérification de l'idempotence
       * - vérification du stock
       * - verrouillage du stock
       * - décrémentation du stock
       * - passage de la commande à paid
       *
       * Aucun decrement_product_stock ici.
       * Aucun restore_product_stock ici.
       * ======================================================
       */

      const paidAt =
        new Date().toISOString();

      const {
        data: finalizeResult,
        error: finalizeError,
      } = await supabaseAdmin.rpc(
        "finalize_paid_order",
        {
          p_checkout_group_id:
            checkoutGroupId,

          p_stripe_session_id:
            session.id,

          p_paid_at:
            paidAt,
        }
      );

      if (finalizeError) {
        console.error(
          "[stripe-webhook] Impossible de finaliser la commande :",
          {
            checkoutGroupId,
            error: finalizeError,
          }
        );

        return NextResponse.json(
          {
            error:
              "Impossible de finaliser la commande.",
          },
          {
            status: 500,
          }
        );
      }

      /*
       * Stripe peut envoyer plusieurs fois
       * checkout.session.completed.
       *
       * La fonction SQL nous indique que la
       * commande avait déjà été finalisée.
       *
       * On s'arrête également ici pour éviter
       * de renvoyer les emails.
       */

      if (
        finalizeResult?.already_processed ===
        true
      ) {
        console.log(
          "[stripe-webhook] Commande déjà traitée :",
          checkoutGroupId
        );

        return NextResponse.json({
          received: true,
        });
      }

      if (
        finalizeResult?.success !== true
      ) {
        console.error(
          "[stripe-webhook] Résultat inattendu de finalize_paid_order :",
          finalizeResult
        );

        return NextResponse.json(
          {
            error:
              "Résultat de finalisation invalide.",
          },
          {
            status: 500,
          }
        );
      }

      /*
       * ======================================================
       * INFORMATIONS COMMANDE
       * ======================================================
       */

      const first = orders[0];

      const customerName =
        first?.name || "client";

      const customerEmail =
        first?.email || null;

      const customerPhone =
        first?.phone || "-";

      const itemCount =
        orders.length;

      const orderNumber =
        shortOrderId(checkoutGroupId);

      const summary =
        buildTextSummary(orders);

      const itemsHtml =
        buildItemsHtml(orders);

      const isRelay =
        first?.delivery_method ===
        "relay";

      const deliveryMethod =
        isRelay
          ? "Point Relais Mondial Relay"
          : "Livraison à domicile";

      const shippingAmountNumber =
        Number(
          first?.shipping_amount ?? 0
        );

      const shippingAmount =
        shippingAmountNumber === 0
          ? "Offerte"
          : formatEurosFromCents(
              shippingAmountNumber
            );

      const trackingPageUrl =
        `${SITE_URL}/mes-commandes`;

      /*
       * ======================================================
       * INFORMATIONS LIVRAISON
       * ======================================================
       */

      let deliveryHtml = `
        <tr>
          <td
            style="
              padding:12px 0;
              font-family:Arial,Helvetica,sans-serif;
              font-size:12px;
              line-height:20px;
              color:#aaa69e;
            "
          >
            <strong style="color:#f3f0ea;">
              Mode
            </strong>

            <br />

            ${escapeHtml(deliveryMethod)}
          </td>
        </tr>
      `;

      if (isRelay) {
        deliveryHtml += `
          <tr>
            <td
              style="
                padding:12px 0;
                font-family:Arial,Helvetica,sans-serif;
                font-size:12px;
                line-height:20px;
                color:#aaa69e;
              "
            >
              <strong style="color:#f3f0ea;">
                Point Relais
              </strong>

              <br />

              ${escapeHtml(
                first?.service_point_name ||
                  "Point Relais"
              )}

              ${
                first?.service_point_address
                  ? `<br />${escapeHtml(
                      first.service_point_address
                    )}`
                  : ""
              }

              <br />

              ${escapeHtml(
                first?.service_point_postal_code ||
                  ""
              )}

              ${escapeHtml(
                first?.service_point_city || ""
              )}
            </td>
          </tr>
        `;
      }

      deliveryHtml += `
        <tr>
          <td
            style="
              padding:12px 0;
              font-family:Arial,Helvetica,sans-serif;
              font-size:12px;
              line-height:20px;
              color:#aaa69e;
            "
          >
            <strong style="color:#f3f0ea;">
              Livraison
            </strong>

            <br />

            ${escapeHtml(shippingAmount)}
          </td>
        </tr>
      `;

      /*
       * ======================================================
       * EMAIL CLIENT
       * ======================================================
       */

      if (customerEmail) {
        const customerHtml =
          buildEmailLayout({
            eyebrow:
              `Commande #${orderNumber}`,

            title:
              "Commande confirmée",

            intro:
              `Bonjour ${escapeHtml(
                customerName
              )}, ton paiement a bien été reçu. ` +
              `Ta commande AJVEK est maintenant confirmée.`,

            content: `
              <div
                style="
                  margin-top:32px;
                  border-top:1px solid #2a2926;
                "
              >
                <p
                  style="
                    margin:24px 0 8px;
                    font-family:Arial,Helvetica,sans-serif;
                    font-size:9px;
                    letter-spacing:3px;
                    text-transform:uppercase;
                    color:#8f8b83;
                  "
                >
                  Ta commande
                </p>

                <table
                  role="presentation"
                  width="100%"
                  cellspacing="0"
                  cellpadding="0"
                  border="0"
                >
                  ${itemsHtml}
                </table>
              </div>

              <div
                style="
                  margin-top:30px;
                  padding:22px;
                  border:1px solid #2a2926;
                  background:#0c0c0b;
                "
              >
                <p
                  style="
                    margin:0 0 10px;
                    font-family:Arial,Helvetica,sans-serif;
                    font-size:9px;
                    letter-spacing:3px;
                    text-transform:uppercase;
                    color:#8f8b83;
                  "
                >
                  Drop 001
                </p>

                <p
                  style="
                    margin:0;
                    font-family:Georgia,'Times New Roman',serif;
                    font-size:21px;
                    line-height:29px;
                    color:#f3f0ea;
                  "
                >
                  Ta pièce est réservée.
                  Nous préparerons ta commande
                  pour son expédition.
                </p>
              </div>

              <div
                style="
                  margin-top:30px;
                  border-top:1px solid #2a2926;
                "
              >
                <p
                  style="
                    margin:24px 0 8px;
                    font-family:Arial,Helvetica,sans-serif;
                    font-size:9px;
                    letter-spacing:3px;
                    text-transform:uppercase;
                    color:#8f8b83;
                  "
                >
                  Livraison
                </p>

                <table
                  role="presentation"
                  width="100%"
                  cellspacing="0"
                  cellpadding="0"
                  border="0"
                >
                  ${deliveryHtml}
                </table>
              </div>
            `,

            buttonLabel:
              "Suivre ma commande",

            buttonUrl:
              trackingPageUrl,

            footerText:
              "Tu peux retrouver l’avancement de ta commande à tout moment depuis ton espace AJVEK.",
          });

        const {
          error: customerEmailError,
        } = await resend.emails.send({
          from: FROM_EMAIL,

          to: customerEmail,

          subject:
            `Commande AJVEK #${orderNumber} confirmée`,

          html: customerHtml,

          text:
            `Bonjour ${customerName},\n\n` +
            `Ton paiement a bien été reçu et ta commande AJVEK est confirmée.\n\n` +
            `Commande #${orderNumber}\n\n` +
            `Articles :\n${summary}\n\n` +
            `Nombre de vêtements : ${itemCount}\n` +
            `Mode de livraison : ${deliveryMethod}\n` +
            `Frais de livraison : ${shippingAmount}\n\n` +
            `Ta pièce est maintenant réservée et ta commande sera préparée pour son expédition.\n\n` +
            `Suivre ma commande : ${trackingPageUrl}\n\n` +
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

      /*
       * ======================================================
       * EMAIL ÉQUIPE AJVEK
       * ======================================================
       */

      let ownerDeliveryDetails =
        deliveryMethod;

      if (isRelay) {
        ownerDeliveryDetails +=
          `\nPoint Relais : ${
            first?.service_point_name ||
            "-"
          }\n` +
          `Adresse : ${
            first?.service_point_address ||
            "-"
          }\n` +
          `Code postal : ${
            first?.service_point_postal_code ||
            "-"
          }\n` +
          `Ville : ${
            first?.service_point_city ||
            "-"
          }\n` +
          `ID Point Relais : ${
            first?.service_point_id ||
            "-"
          }`;
      }

      const ownerHtml =
        buildEmailLayout({
          eyebrow:
            `Nouvelle commande #${orderNumber}`,

          title:
            "Nouvelle commande payée",

          intro:
            `Une nouvelle commande AJVEK vient d’être payée par ` +
            `<strong style="color:#f3f0ea;">${escapeHtml(
              customerName
            )}</strong>.`,

          content: `
            <div
              style="
                margin-top:30px;
                padding:20px;
                border:1px solid #2a2926;
                background:#0c0c0b;
              "
            >
              <p
                style="
                  margin:0;
                  font-family:Arial,Helvetica,sans-serif;
                  font-size:12px;
                  line-height:22px;
                  color:#aaa69e;
                "
              >
                <strong style="color:#f3f0ea;">
                  Client
                </strong>

                <br />

                ${escapeHtml(customerName)}

                <br />

                ${escapeHtml(
                  customerEmail || "-"
                )}

                <br />

                ${escapeHtml(customerPhone)}
              </p>
            </div>

            <div
              style="
                margin-top:28px;
                border-top:1px solid #2a2926;
              "
            >
              <p
                style="
                  margin:24px 0 8px;
                  font-family:Arial,Helvetica,sans-serif;
                  font-size:9px;
                  letter-spacing:3px;
                  text-transform:uppercase;
                  color:#8f8b83;
                "
              >
                Articles
              </p>

              <table
                role="presentation"
                width="100%"
                cellspacing="0"
                cellpadding="0"
                border="0"
              >
                ${itemsHtml}
              </table>
            </div>

            <div
              style="
                margin-top:28px;
                padding-top:24px;
                border-top:1px solid #2a2926;
              "
            >
              <p
                style="
                  margin:0;
                  font-family:Arial,Helvetica,sans-serif;
                  font-size:12px;
                  line-height:22px;
                  color:#aaa69e;
                "
              >
                <strong style="color:#f3f0ea;">
                  Livraison
                </strong>

                <br />

                ${escapeHtml(deliveryMethod)}

                <br />

                Frais :
                ${escapeHtml(shippingAmount)}
              </p>
            </div>
          `,

          buttonLabel:
            "Voir les commandes",

          buttonUrl:
            `${SITE_URL}/admin/commandes`,

          footerText:
            `Session Stripe : ${session.id}`,
        });

      const {
        error: ownerEmailError,
      } = await resend.emails.send({
        from: FROM_EMAIL,

        to: OWNER_EMAIL,

        subject:
          `AJVEK — commande #${orderNumber} payée`,

        html: ownerHtml,

        text:
          `Nouvelle commande payée !\n\n` +
          `Commande : #${orderNumber}\n` +
          `Client : ${customerName}\n` +
          `Email : ${customerEmail || "-"}\n` +
          `Téléphone : ${customerPhone}\n\n` +
          `Articles :\n${summary}\n\n` +
          `Nombre de vêtements : ${itemCount}\n\n` +
          `Livraison :\n${ownerDeliveryDetails}\n` +
          `Frais de livraison : ${shippingAmount}\n\n` +
          `Session Stripe : ${session.id}\n`,
      });

      if (ownerEmailError) {
        console.error(
          "[stripe-webhook] Erreur email équipe :",
          ownerEmailError
        );
      }

      return NextResponse.json({
        received: true,
      });
    }

    /*
     * ========================================================
     * PAIEMENT ÉCHOUÉ
     * ========================================================
     */

    if (
      event.type ===
      "payment_intent.payment_failed"
    ) {
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
        data: orders,
        error: orderError,
      } = await supabaseAdmin
        .from("preorders")
        .select("*")
        .eq(
          "checkout_group_id",
          checkoutGroupId
        );

      if (
        orderError ||
        !orders ||
        orders.length === 0
      ) {
        console.error(
          "[stripe-webhook] Commande échouée introuvable :",
          orderError
        );

        return NextResponse.json({
          received: true,
        });
      }

      /*
       * Si elle a finalement été payée,
       * on ignore l'ancien événement d'échec.
       */

      if (
        orders.some(
          (order) =>
            order.paid === true
        )
      ) {
        return NextResponse.json({
          received: true,
        });
      }

      /*
       * Anti-spam email paiement échoué.
       */

      if (
        orders.some(
          (order) =>
            order
              .payment_failure_notified_at
        )
      ) {
        return NextResponse.json({
          received: true,
        });
      }

      const first = orders[0];

      const customerName =
        first?.name || "client";

      const customerEmail =
        first?.email || null;

      const orderNumber =
        shortOrderId(checkoutGroupId);

      const summary =
        buildTextSummary(orders);

      const itemsHtml =
        buildItemsHtml(orders);

      const declineCode =
        paymentIntent
          .last_payment_error
          ?.decline_code ||
        paymentIntent
          .last_payment_error
          ?.code ||
        "non précisé";

      const failureMessage =
        paymentIntent
          .last_payment_error
          ?.message ||
        "Le paiement n'a pas pu être validé.";

      /*
       * ======================================================
       * ENREGISTREMENT DE L'ÉCHEC
       * ======================================================
       */

      const notifiedAt =
        new Date().toISOString();

      const {
        error: notificationUpdateError,
      } = await supabaseAdmin
        .from("preorders")
        .update({
          payment_failure_notified_at:
            notifiedAt,

          order_status:
            "payment_failed",
        })
        .eq(
          "checkout_group_id",
          checkoutGroupId
        )
        .eq("paid", false);

      if (notificationUpdateError) {
        console.error(
          "[stripe-webhook] Erreur anti-spam paiement échoué :",
          notificationUpdateError
        );

        return NextResponse.json(
          {
            error: "Erreur Supabase.",
          },
          {
            status: 500,
          }
        );
      }

      /*
       * ======================================================
       * EMAIL CLIENT — ÉCHEC
       * ======================================================
       */

      if (customerEmail) {
        const failureHtml =
          buildEmailLayout({
            eyebrow:
              `Commande #${orderNumber}`,

            title:
              "Le paiement n’a pas abouti",

            intro:
              `Bonjour ${escapeHtml(
                customerName
              )}, nous avons bien reçu ta tentative de commande, ` +
              `mais le paiement n’a pas pu être confirmé.`,

            content: `
              <div
                style="
                  margin-top:30px;
                  padding:22px;
                  border:1px solid #2a2926;
                  background:#0c0c0b;
                "
              >
                <p
                  style="
                    margin:0;
                    font-family:Arial,Helvetica,sans-serif;
                    font-size:12px;
                    line-height:22px;
                    color:#aaa69e;
                  "
                >
                  Ta commande n’est pas confirmée
                  et aucun article n’a été retiré
                  du stock.
                </p>
              </div>

              <div
                style="
                  margin-top:28px;
                  border-top:1px solid #2a2926;
                "
              >
                <p
                  style="
                    margin:24px 0 8px;
                    font-family:Arial,Helvetica,sans-serif;
                    font-size:9px;
                    letter-spacing:3px;
                    text-transform:uppercase;
                    color:#8f8b83;
                  "
                >
                  Articles
                </p>

                <table
                  role="presentation"
                  width="100%"
                  cellspacing="0"
                  cellpadding="0"
                  border="0"
                >
                  ${itemsHtml}
                </table>
              </div>

              <p
                style="
                  margin:28px 0 0;
                  font-family:Arial,Helvetica,sans-serif;
                  font-size:12px;
                  line-height:22px;
                  color:#aaa69e;
                "
              >
                Tu peux recommencer ta commande
                depuis notre collection et utiliser
                une autre carte si nécessaire.
              </p>
            `,

            buttonLabel:
              "Retour à la collection",

            buttonUrl:
              `${SITE_URL}/catalogue`,

            footerText:
              "Si le problème persiste, vérifie auprès de ta banque que le paiement est autorisé.",
          });

        const {
          error:
            customerFailureEmailError,
        } = await resend.emails.send({
          from: FROM_EMAIL,

          to: customerEmail,

          subject:
            "Ton paiement AJVEK n'a pas abouti",

          html: failureHtml,

          text:
            `Bonjour ${customerName},\n\n` +
            `Nous avons bien reçu ta tentative de commande AJVEK, mais ton paiement n'a pas pu être validé.\n\n` +
            `Ta commande n'est donc pas confirmée.\n\n` +
            `Articles :\n${summary}\n\n` +
            `Aucun article n'a été retiré du stock.\n\n` +
            `Tu peux recommencer ta commande avec une autre carte si nécessaire.\n\n` +
            `À bientôt,\n` +
            `L'équipe AJVEK`,
        });

        if (
          customerFailureEmailError
        ) {
          console.error(
            "[stripe-webhook] Erreur email client paiement échoué :",
            customerFailureEmailError
          );
        }
      }

      /*
       * ======================================================
       * EMAIL ÉQUIPE — ÉCHEC
       * ======================================================
       */

      const ownerFailureHtml =
        buildEmailLayout({
          eyebrow:
            `Paiement échoué #${orderNumber}`,

          title:
            "Paiement non validé",

          intro:
            `Une tentative de paiement AJVEK de ` +
            `<strong style="color:#f3f0ea;">${escapeHtml(
              customerName
            )}</strong> a échoué.`,

          content: `
            <div
              style="
                margin-top:30px;
                padding:22px;
                border:1px solid #2a2926;
                background:#0c0c0b;
              "
            >
              <p
                style="
                  margin:0;
                  font-family:Arial,Helvetica,sans-serif;
                  font-size:12px;
                  line-height:22px;
                  color:#aaa69e;
                "
              >
                <strong style="color:#f3f0ea;">
                  Client
                </strong>

                <br />

                ${escapeHtml(customerName)}

                <br />

                ${escapeHtml(
                  customerEmail || "-"
                )}

                <br /><br />

                <strong style="color:#f3f0ea;">
                  Code Stripe
                </strong>

                <br />

                ${escapeHtml(declineCode)}

                <br /><br />

                <strong style="color:#f3f0ea;">
                  Message
                </strong>

                <br />

                ${escapeHtml(
                  failureMessage
                )}
              </p>
            </div>
          `,

          buttonLabel:
            "Voir l'administration",

          buttonUrl:
            `${SITE_URL}/admin/commandes`,

          footerText:
            `PaymentIntent : ${paymentIntent.id}`,
        });

      const {
        error:
          ownerFailureEmailError,
      } = await resend.emails.send({
        from: FROM_EMAIL,

        to: OWNER_EMAIL,

        subject:
          `AJVEK — paiement échoué #${orderNumber}`,

        html: ownerFailureHtml,

        text:
          `Un paiement AJVEK a échoué.\n\n` +
          `Commande : #${orderNumber}\n` +
          `Client : ${customerName}\n` +
          `Email : ${customerEmail || "-"}\n\n` +
          `Articles :\n${summary}\n\n` +
          `PaymentIntent Stripe : ${paymentIntent.id}\n` +
          `Code de refus : ${declineCode}\n` +
          `Message Stripe : ${failureMessage}\n\n` +
          `Aucun article n'a été retiré du stock.\n`,
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
     * ========================================================
     * AUTRES ÉVÉNEMENTS STRIPE
     * ========================================================
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
      {
        error: "Erreur serveur.",
      },
      {
        status: 500,
      }
    );
  }
}