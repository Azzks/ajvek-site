import { NextResponse } from "next/server";

import { createClient } from "@supabase/supabase-js";

import Stripe from "stripe";

import { Resend } from "resend";



export const dynamic = "force-dynamic";

export const revalidate = 0;



const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

const resend = new Resend(process.env.RESEND_API_KEY!);



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

const SENDCLOUD_API = "https://panel.sendcloud.sc/api/v3";
const SENDCLOUD_INTEGRATION_ID = 624594;

const MONDIAL_RELAY_HOME =
  "mondial_relay:home_domestic,dualapi/c2c";

const MONDIAL_RELAY_POINT_RELAIS =
  "mondial_relay:service_point,dualapi/size=l,c2c";

const ESTIMATED_PACKED_TSHIRT_WEIGHT_KG = 0.25;

function getSendcloudAuthorization() {
  const publicKey = process.env.SENDCLOUD_PUBLIC_KEY;
  const secretKey = process.env.SENDCLOUD_SECRET_KEY;

  if (!publicKey || !secretKey) {
    throw new Error(
      "SENDCLOUD_PUBLIC_KEY ou SENDCLOUD_SECRET_KEY manquant."
    );
  }

  return `Basic ${Buffer.from(
    `${publicKey}:${secretKey}`
  ).toString("base64")}`;
}

async function sendcloudRequest(
  path: string,
  init: RequestInit = {}
) {
  const response = await fetch(`${SENDCLOUD_API}${path}`, {
    ...init,
    cache: "no-store",
    headers: {
      Authorization: getSendcloudAuthorization(),
      "Content-Type": "application/json",
      ...(init.headers || {}),
    },
  });

  const raw = await response.text();

  let data: any = null;

  if (raw) {
    try {
      data = JSON.parse(raw);
    } catch {
      data = raw;
    }
  }

  if (!response.ok) {
    const error = new Error(
      `Sendcloud ${response.status} ${response.statusText}`
    ) as Error & {
      status?: number;
      data?: any;
    };

    error.status = response.status;
    error.data = data;

    throw error;
  }

  return data;
}

function splitStreetAndHouseNumber(value: string) {
  const normalized = String(value || "").trim();

  const leadingNumber = normalized.match(
    /^(\d+[A-Za-z]?(?:\s*(?:bis|ter))?)\s+(.+)$/i
  );

  if (leadingNumber) {
    return {
      addressLine1: leadingNumber[2].trim(),
      houseNumber: leadingNumber[1].trim(),
    };
  }

  const trailingNumber = normalized.match(
    /^(.+?)\s+(\d+[A-Za-z]?(?:\s*(?:bis|ter))?)$/i
  );

  if (trailingNumber) {
    return {
      addressLine1: trailingNumber[1].trim(),
      houseNumber: trailingNumber[2].trim(),
    };
  }

  return {
    addressLine1: normalized,
    houseNumber: "",
  };
}

async function releaseSendcloudClaim(
  checkoutGroupId: string
) {
  const { error } = await supabaseAdmin
    .from("preorders")
    .update({
      sendcloud_processing_at: null,
    })
    .eq("checkout_group_id", checkoutGroupId)
    .is("sendcloud_parcel_id", null);

  if (error) {
    console.error(
      "[stripe-webhook] Impossible de libérer le verrou Sendcloud :",
      {
        checkoutGroupId,
        error,
      }
    );
  }
}

async function createSendcloudShipmentForPaidOrder({
  checkoutGroupId,
  orders,
  session,
}: {
  checkoutGroupId: string;
  orders: any[];
  session: Stripe.Checkout.Session;
}) {
  const first = orders[0];

  if (!first || orders.length === 0) {
    throw new Error("Commande vide pour Sendcloud.");
  }

  const { data: claimResult, error: claimError } =
    await supabaseAdmin.rpc("claim_sendcloud_shipment", {
      p_checkout_group_id: checkoutGroupId,
    });

  if (claimError) {
    throw new Error(
      `Impossible de prendre le verrou Sendcloud : ${claimError.message}`
    );
  }

  if (claimResult?.success !== true) {
    throw new Error(
      `Verrou Sendcloud refusé : ${
        claimResult?.reason || "raison inconnue"
      }`
    );
  }

  if (claimResult?.claimed !== true) {
    console.log(
      "[stripe-webhook] Sendcloud déjà traité ou déjà en cours :",
      {
        checkoutGroupId,
        reason: claimResult?.reason || "unknown",
        parcelId: claimResult?.parcel_id || null,
      }
    );

    return;
  }

  let labelRequestStarted = false;

  try {
    const isRelay = first?.delivery_method === "relay";

    if (isRelay && !first?.service_point_id) {
      throw new Error(
        "service_point_id absent pour une livraison Point Relais."
      );
    }

    if (
      !isRelay &&
      (
        !first?.shipping_address_line1 ||
        !first?.shipping_postal_code ||
        !first?.shipping_city ||
        !first?.shipping_country
      )
    ) {
      throw new Error(
        "Adresse domicile incomplète pour Sendcloud."
      );
    }

    if (!first?.email || !first?.phone) {
      throw new Error(
        "Email ou téléphone client absent pour Sendcloud."
      );
    }

    const orderNumber =
      `AJVEK-${shortOrderId(checkoutGroupId)}`;

    const groupedItems = groupItems(orders);
    const itemCount = orders.length;

    const subtotalCents = Number(
      session.amount_subtotal ?? 0
    );

    const fallbackUnitPriceCents = 3990;

    const unitPriceCents =
      itemCount > 0 && subtotalCents > 0
        ? Math.round(subtotalCents / itemCount)
        : fallbackUnitPriceCents;

    const orderItems = groupedItems.map((item) => ({
      name:
        `${item.name} — ${item.color} — Taille ${item.size}`,

      quantity: item.quantity,

      total_price: {
        value: Number(
          (
            (unitPriceCents * item.quantity) /
            100
          ).toFixed(2)
        ),
        currency: "EUR",
      },
    }));

    const totalPaidCents = Number(
      session.amount_total ?? subtotalCents
    );

    const weightKg = Number(
      Math.max(
        ESTIMATED_PACKED_TSHIRT_WEIGHT_KG,
        itemCount *
          ESTIMATED_PACKED_TSHIRT_WEIGHT_KG
      ).toFixed(2)
    );

    const sendcloudOrder: any = {
      order_id: checkoutGroupId,

      order_number: orderNumber,

      order_details: {
        integration: {
          id: SENDCLOUD_INTEGRATION_ID,
        },

        status: {
          code: "fulfilled",
          message: "Fulfilled",
        },

        order_created_at:
          new Date().toISOString(),

        order_items: orderItems,
      },

      payment_details: {
        total_price: {
          value: Number(
            (totalPaidCents / 100).toFixed(2)
          ),
          currency: "EUR",
        },

        status: {
          code: "paid",
          message: "Paid",
        },
      },

      shipping_details: {
        is_local_pickup: false,

        delivery_indicator: isRelay
          ? "Mondial Relay Point Relais"
          : "Mondial Relay Home Domestic",

        measurement: {
          weight: {
            value: weightKg,
            unit: "kg",
          },
        },
      },
    };

    if (isRelay) {
      sendcloudOrder.service_point_details = {
        id: String(first.service_point_id),
      };

      const relayStreet =
        splitStreetAndHouseNumber(
          first?.service_point_address || ""
        );

      sendcloudOrder.shipping_address = {
        name: first?.name || "Client AJVEK",
        email: first.email,
        phone_number: first.phone,

        address_line_1:
          relayStreet.addressLine1 ||
          first?.service_point_name ||
          "Point Relais Mondial Relay",

        postal_code: String(
          first?.service_point_postal_code || ""
        ),

        city: String(
          first?.service_point_city || ""
        ),

        country_code: "FR",
      };

      if (relayStreet.houseNumber) {
        sendcloudOrder.shipping_address.house_number =
          relayStreet.houseNumber;
      }
    } else {
      const homeStreet =
        splitStreetAndHouseNumber(
          first.shipping_address_line1
        );

      sendcloudOrder.shipping_address = {
        name:
          first?.shipping_name ||
          first?.name ||
          "Client AJVEK",

        email: first.email,
        phone_number: first.phone,

        address_line_1:
          homeStreet.addressLine1,

        postal_code: String(
          first.shipping_postal_code
        ),

        city: String(first.shipping_city),

        country_code: String(
          first.shipping_country
        ).toUpperCase(),
      };

      if (homeStreet.houseNumber) {
        sendcloudOrder.shipping_address.house_number =
          homeStreet.houseNumber;
      }

      if (first?.shipping_address_line2) {
        sendcloudOrder.shipping_address.address_line_2 =
          String(first.shipping_address_line2);
      }
    }

    const createOrderData =
      await sendcloudRequest("/orders", {
        method: "POST",
        body: JSON.stringify([sendcloudOrder]),
      });

    const sendcloudOrderId =
      createOrderData?.data?.[0]?.id;

    if (!sendcloudOrderId) {
      throw new Error(
        "Sendcloud n'a pas retourné d'identifiant de commande."
      );
    }

    const { error: saveOrderIdError } =
      await supabaseAdmin
        .from("preorders")
        .update({
          sendcloud_order_id:
            String(sendcloudOrderId),
        })
        .eq(
          "checkout_group_id",
          checkoutGroupId
        );

    if (saveOrderIdError) {
      throw new Error(
        `Impossible d'enregistrer sendcloud_order_id : ${saveOrderIdError.message}`
      );
    }

    let orderAvailable = false;

    for (
      let attempt = 0;
      attempt < 10;
      attempt += 1
    ) {
      try {
        await sendcloudRequest(
          `/orders/${sendcloudOrderId}`,
          {
            method: "GET",
          }
        );

        orderAvailable = true;
        break;
      } catch (error) {
        if (attempt === 9) {
          throw error;
        }

        await new Promise((resolve) =>
          setTimeout(resolve, 1000)
        );
      }
    }

    if (!orderAvailable) {
      throw new Error(
        "Commande Sendcloud non disponible après création."
      );
    }

    const shippingOptionCode = isRelay
      ? MONDIAL_RELAY_POINT_RELAIS
      : MONDIAL_RELAY_HOME;

    labelRequestStarted = true;

    const labelData =
      await sendcloudRequest(
        "/orders/create-label-sync",
        {
          method: "POST",

          body: JSON.stringify({
            integration_id:
              SENDCLOUD_INTEGRATION_ID,

            label_details: {
              mime_type: "application/pdf",
              dpi: 72,
            },

            ship_with: {
              type: "shipping_option_code",

              properties: {
                shipping_option_code:
                  shippingOptionCode,
              },
            },

            order: {
              order_id: checkoutGroupId,
              order_number: orderNumber,
              apply_shipping_rules: false,
            },
          }),
        }
      );

    const parcelId = labelData?.parcel_id;

    const shipmentId =
      labelData?.shipment_id;

    const trackingNumber =
      labelData?.tracking_number || null;

    const trackingUrl =
      labelData?.tracking_url || null;

    const labelDocument =
      Array.isArray(labelData?.documents)
        ? labelData.documents.find(
            (document: any) =>
              document?.type === "label"
          )
        : null;

    const labelUrl =
      labelDocument?.link || null;

    if (!parcelId) {
      throw new Error(
        "Étiquette créée sans parcel_id Sendcloud exploitable."
      );
    }

    const sendcloudCreatedAt =
      new Date().toISOString();

    const { error: saveShipmentError } =
      await supabaseAdmin
        .from("preorders")
        .update({
          sendcloud_order_id:
            String(sendcloudOrderId),

          sendcloud_parcel_id:
            Number(parcelId),

          sendcloud_label_url:
            labelUrl,

          sendcloud_created_at:
            sendcloudCreatedAt,

          sendcloud_processing_at: null,

          carrier: "mondial_relay",

          tracking_number:
            trackingNumber,

          tracking_url:
            trackingUrl,
        })
        .eq(
          "checkout_group_id",
          checkoutGroupId
        );

    if (saveShipmentError) {
      const { error: restoreLockError } =
        await supabaseAdmin
          .from("preorders")
          .update({
            sendcloud_processing_at:
              sendcloudCreatedAt,
          })
          .eq(
            "checkout_group_id",
            checkoutGroupId
          )
          .is(
            "sendcloud_parcel_id",
            null
          );

      if (restoreLockError) {
        console.error(
          "[stripe-webhook] Étiquette créée mais verrou Sendcloud impossible à restaurer :",
          {
            checkoutGroupId,
            parcelId,
            error: restoreLockError,
          }
        );
      }

      throw new Error(
        `Étiquette Sendcloud créée mais sauvegarde Supabase impossible. Parcel ${parcelId}, shipment ${shipmentId || "-"} : ${saveShipmentError.message}`
      );
    }

    console.log(
      "[stripe-webhook] Expédition Sendcloud créée :",
      {
        checkoutGroupId,
        sendcloudOrderId,
        parcelId,
        shipmentId: shipmentId || null,
        trackingNumber,
        shippingOptionCode,
        weightKg,
      }
    );
  } catch (error) {
    if (!labelRequestStarted) {
      await releaseSendcloudClaim(
        checkoutGroupId
      );
    }

    throw error;
  }
}

/* ============================================================

   OUTILS

   ============================================================ */



function escapeHtml(value: unknown) {

  return String(value ?? "")

    .replaceAll("&", "&amp;")

    .replaceAll("<", "&lt;")

    .replaceAll(">", "&gt;")

    .replaceAll('"', "&quot;")

    .replaceAll("'", "&#039;");

}



function formatEurosFromCents(amount: number) {

  return `${(amount / 100).toFixed(2).replace(".", ",")} €`;

}



function shortOrderId(id: string) {

  return id.replaceAll("-", "").slice(0, 8).toUpperCase();

}



/* ============================================================

   ARTICLES

   ============================================================ */



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

    const key = [row.product_slug, row.color, row.size].join("::");

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

          <td style="padding:16px 0;border-bottom:1px solid #2d2a28;">

            <p style="

              margin:0;

              font-family:Georgia,'Times New Roman',serif;

              font-size:18px;

              line-height:24px;

              color:#f4f1ea;

            ">

              ${escapeHtml(item.name)}

            </p>



            <p style="

              margin:7px 0 0;

              font-family:Arial,Helvetica,sans-serif;

              font-size:11px;

              line-height:18px;

              color:#8a8178;

            ">

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



/* ============================================================

   TEMPLATE EMAIL AJVEK

   ============================================================ */



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

                  background:#f4f1ea;

                  color:#121110;

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

    background:#d5d1ca;

    color:#f4f1ea;

  "

>

  <table

    role="presentation"

    width="100%"

    cellspacing="0"

    cellpadding="0"

    border="0"

    style="background:#d5d1ca;"

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

            background:#121110;

            border:1px solid #2d2a28;

            border-radius:20px;

            overflow:hidden;

          "

        >

          <tr>

            <td

              style="

                padding:28px 32px;

                border-bottom:1px solid #2d2a28;

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

                      color:#f4f1ea;

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

                      color:#8a8178;

                    "

                  >

                    Wear your story

                  </td>

                </tr>

              </table>

            </td>

          </tr>



          <tr>

            <td style="padding:40px 32px 36px;">

              <p

                style="

                  margin:0;

                  font-family:Arial,Helvetica,sans-serif;

                  font-size:9px;

                  line-height:16px;

                  letter-spacing:3px;

                  text-transform:uppercase;

                  color:#8a8178;

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

                  color:#f4f1ea;

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

                  color:#b3aca4;

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

                  border-top:1px solid #2d2a28;

                  font-family:Arial,Helvetica,sans-serif;

                  font-size:11px;

                  line-height:20px;

                  color:#8a8178;

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

                border-top:1px solid #2d2a28;

                background:#181715;

                font-family:Arial,Helvetica,sans-serif;

                font-size:9px;

                line-height:17px;

                letter-spacing:2px;

                text-transform:uppercase;

                color:#8a8178;

              "

            >

              AJVEK · Créé en France

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



/* ============================================================

   CHECKOUT GROUP DEPUIS PAYMENT INTENT

   ============================================================ */



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



    return (

      sessions.data[0]?.metadata?.checkout_group_id ||

      null

    );

  } catch (error) {

    console.error(

      "[stripe-webhook] Impossible de retrouver la session Checkout :",

      error

    );



    return null;

  }

}



/* ============================================================

   ADRESSE DE LIVRAISON DOMICILE

   ============================================================ */



async function saveHomeShippingAddress(

  sessionId: string,

  checkoutGroupId: string,

  firstOrder: any

) {

  if (firstOrder?.delivery_method !== "home") {

    return;

  }



  const checkoutSession =

    await stripe.checkout.sessions.retrieve(sessionId);



  const shippingDetails =

    checkoutSession.collected_information?.shipping_details;



  const address = shippingDetails?.address;



  if (

    !shippingDetails ||

    !address?.line1 ||

    !address?.postal_code ||

    !address?.city ||

    !address?.country

  ) {

    throw new Error(

      "Adresse de livraison Stripe absente ou incomplète."

    );

  }



  const { error: shippingAddressError } =

    await supabaseAdmin

      .from("preorders")

      .update({

        shipping_name:

          shippingDetails.name ||

          firstOrder?.name ||

          null,



        shipping_address_line1: address.line1,

        shipping_address_line2:

          address.line2 || null,

        shipping_postal_code:

          address.postal_code,

        shipping_city: address.city,

        shipping_country: address.country,

      })

      .eq(

        "checkout_group_id",

        checkoutGroupId

      );



  if (shippingAddressError) {

    console.error(

      "[stripe-webhook] Impossible d'enregistrer l'adresse de livraison :",

      {

        checkoutGroupId,

        stripeSessionId: sessionId,

        error: shippingAddressError,

      }

    );



    throw new Error(

      "Impossible d'enregistrer l'adresse de livraison."

    );

  }

}



/* ============================================================

   MARQUAGE EMAIL ENVOYÉ

   ============================================================ */



type EmailSentColumn =

  | "customer_confirmation_email_sent_at"

  | "owner_confirmation_email_sent_at"

  | "customer_payment_failure_email_sent_at"

  | "owner_payment_failure_email_sent_at";



async function markEmailSent(

  checkoutGroupId: string,

  column: EmailSentColumn

) {

  const sentAt = new Date().toISOString();



  const { error } = await supabaseAdmin

    .from("preorders")

    .update({

      [column]: sentAt,

    })

    .eq(

      "checkout_group_id",

      checkoutGroupId

    );



  if (error) {

    console.error(

      `[stripe-webhook] Impossible d'enregistrer ${column} :`,

      {

        checkoutGroupId,

        error,

      }

    );



    throw new Error(

      `Impossible d'enregistrer ${column}.`

    );

  }

}



/* ============================================================

   WEBHOOK

   ============================================================ */



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

    /* ========================================================

       PAIEMENT RÉUSSI

       ======================================================== */



    if (

      event.type ===

      "checkout.session.completed"

    ) {

      const session =

        event.data.object as Stripe.Checkout.Session;



      if (

        session.payment_status !== "paid"

      ) {

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

        data: initialOrders,

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

        !initialOrders ||

        initialOrders.length === 0

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



      try {

        await saveHomeShippingAddress(

          session.id,

          checkoutGroupId,

          initialOrders[0]

        );

      } catch (error) {

        console.error(

          "[stripe-webhook] Adresse de livraison non enregistrée :",

          {

            checkoutGroupId,

            stripeSessionId: session.id,

            error,

          }

        );



        return NextResponse.json(

          {

            error:

              "Impossible d'enregistrer l'adresse de livraison.",

          },

          {

            status: 500,

          }

        );

      }



      /* Finalisation atomique */



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



      const alreadyProcessed =

        finalizeResult?.already_processed ===

        true;



      if (alreadyProcessed) {

        console.log(

          "[stripe-webhook] Commande déjà traitée, vérification des emails :",

          checkoutGroupId

        );

      }



      if (

        !alreadyProcessed &&

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

       * Nouvelle lecture après finalisation :

       * - récupère l'adresse enregistrée ;

       * - récupère l'état réel de la commande ;

       * - récupère les marqueurs d'emails.

       */



      const {

        data: orders,

        error: refreshedOrderError,

      } = await supabaseAdmin

        .from("preorders")

        .select("*")

        .eq(

          "checkout_group_id",

          checkoutGroupId

        );



      if (

        refreshedOrderError ||

        !orders ||

        orders.length === 0

      ) {

        console.error(

          "[stripe-webhook] Impossible de relire la commande finalisée :",

          refreshedOrderError

        );



        return NextResponse.json(

          {

            error:

              "Impossible de relire la commande.",

          },

          {

            status: 500,

          }

        );

      }



      const first = orders[0];



      const orderIsPaid =

        orders.every(

          (order) =>

            order.paid === true &&

            order.order_status === "paid"

        );



      if (!orderIsPaid) {

        console.error(

          "[stripe-webhook] Commande non finalisée après paiement Stripe :",

          checkoutGroupId

        );



        return NextResponse.json(

          {

            error:

              "Commande non finalisée.",

          },

          {

            status: 500,

          }

        );

      }

/*
 * SENDCLOUD
 *
 * Le paiement et le stock sont déjà finalisés.
 * Une erreur Sendcloud ne doit donc pas annuler
 * la commande AJVEK.
 */
try {
  await createSendcloudShipmentForPaidOrder({
    checkoutGroupId,
    orders,
    session,
  });
} catch (error) {
  console.error(
    "[stripe-webhook] Automatisation Sendcloud non terminée. Commande payée conservée, intervention manuelle possible :",
    {
      checkoutGroupId,
      error,
    }
  );
}

      const customerName =

        first?.name || "client";



      const customerEmail =

        first?.email || null;



      const customerPhone =

        first?.phone || "-";



      const itemCount =

        orders.length;



      const orderNumber =

        shortOrderId(

          checkoutGroupId

        );



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



      /* Informations livraison */



      let deliveryHtml = `

        <tr>

          <td style="

            padding:12px 0;

            font-family:Arial,Helvetica,sans-serif;

            font-size:12px;

            line-height:20px;

            color:#b3aca4;

          ">

            <strong style="color:#f4f1ea;">

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

            <td style="

              padding:12px 0;

              font-family:Arial,Helvetica,sans-serif;

              font-size:12px;

              line-height:20px;

              color:#b3aca4;

            ">

              <strong style="color:#f4f1ea;">

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

                first?.service_point_city ||

                  ""

              )}

            </td>

          </tr>

        `;

      } else {

        const shippingName =

          first?.shipping_name ||

          customerName;



        const line1 =

          first?.shipping_address_line1 ||

          "";



        const line2 =

          first?.shipping_address_line2 ||

          "";



        const postalCode =

          first?.shipping_postal_code ||

          "";



        const city =

          first?.shipping_city ||

          "";



        const country =

          first?.shipping_country ||

          "";



        deliveryHtml += `

          <tr>

            <td style="

              padding:12px 0;

              font-family:Arial,Helvetica,sans-serif;

              font-size:12px;

              line-height:20px;

              color:#b3aca4;

            ">

              <strong style="color:#f4f1ea;">

                Adresse

              </strong>

              <br />



              ${escapeHtml(shippingName)}



              ${

                line1

                  ? `<br />${escapeHtml(line1)}`

                  : ""

              }



              ${

                line2

                  ? `<br />${escapeHtml(line2)}`

                  : ""

              }



              ${

                postalCode || city

                  ? `<br />${escapeHtml(

                      `${postalCode} ${city}`.trim()

                    )}`

                  : ""

              }



              ${

                country

                  ? `<br />${escapeHtml(country)}`

                  : ""

              }

            </td>

          </tr>

        `;

      }



      deliveryHtml += `

        <tr>

          <td style="

            padding:12px 0;

            font-family:Arial,Helvetica,sans-serif;

            font-size:12px;

            line-height:20px;

            color:#b3aca4;

          ">

            <strong style="color:#f4f1ea;">

              Livraison

            </strong>

            <br />

            ${escapeHtml(shippingAmount)}

          </td>

        </tr>

      `;



      /* ======================================================

         EMAIL CLIENT — COMMANDE CONFIRMÉE

         ====================================================== */



      const customerEmailAlreadySent =

        orders.some(

          (order) =>

            Boolean(

              order.customer_confirmation_email_sent_at

            )

        );



      if (

        customerEmail &&

        !customerEmailAlreadySent

      ) {

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

              <div style="

                margin-top:32px;

                border-top:1px solid #2d2a28;

              ">

                <p style="

                  margin:24px 0 8px;

                  font-family:Arial,Helvetica,sans-serif;

                  font-size:9px;

                  letter-spacing:3px;

                  text-transform:uppercase;

                  color:#8a8178;

                ">

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



              <div style="

                margin-top:30px;

                padding:22px;

                border:1px solid #2d2a28;

                background:#181715;

                border-radius:14px;

              ">

                <p style="

                  margin:0 0 10px;

                  font-family:Arial,Helvetica,sans-serif;

                  font-size:9px;

                  letter-spacing:3px;

                  text-transform:uppercase;

                  color:#8a8178;

                ">

                  Drop 001

                </p>



                <p style="

                  margin:0;

                  font-family:Georgia,'Times New Roman',serif;

                  font-size:21px;

                  line-height:29px;

                  color:#f4f1ea;

                ">

                  Ta pièce est réservée.

                  Nous allons maintenant préparer

                  ta commande pour son expédition.

                </p>

              </div>



              <div style="

                margin-top:30px;

                border-top:1px solid #2d2a28;

              ">

                <p style="

                  margin:24px 0 8px;

                  font-family:Arial,Helvetica,sans-serif;

                  font-size:9px;

                  letter-spacing:3px;

                  text-transform:uppercase;

                  color:#8a8178;

                ">

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

          data: customerEmailData,

          error: customerEmailError,

        } = await resend.emails.send(

          {

            from: FROM_EMAIL,

            to: customerEmail,



            subject:

              `Commande AJVEK #${orderNumber} confirmée`,



            html:

              customerHtml,



            text:

              `Bonjour ${customerName},\n\n` +

              `Ton paiement a bien été reçu et ta commande AJVEK #${orderNumber} est confirmée.\n\n` +

              `Articles :\n${summary}\n\n` +

              `Livraison : ${deliveryMethod}\n` +

              `Frais de livraison : ${shippingAmount}\n\n` +

              `Tu peux suivre ta commande ici : ${trackingPageUrl}\n\n` +

              `Merci de faire partie de l'aventure AJVEK.\n`,

          },

          {

            idempotencyKey:

              `order-confirmation-customer-${checkoutGroupId}`,

          }

        );



        if (customerEmailError) {

          console.error(

            "[stripe-webhook] Erreur email confirmation client :",

            customerEmailError

          );



          return NextResponse.json(

            {

              error:

                "Email de confirmation client non envoyé.",

            },

            {

              status: 500,

            }

          );

        }



        if (!customerEmailData?.id) {

          console.error(

            "[stripe-webhook] Resend n'a pas retourné d'identifiant pour l'email client."

          );



          return NextResponse.json(

            {

              error:

                "Email de confirmation client non vérifiable.",

            },

            {

              status: 500,

            }

          );

        }



        try {

          await markEmailSent(

            checkoutGroupId,

            "customer_confirmation_email_sent_at"

          );

        } catch (error) {

          console.error(

            "[stripe-webhook] Email client envoyé mais marquage Supabase impossible :",

            error

          );



          return NextResponse.json(

            {

              error:

                "Email client envoyé mais non enregistré.",

            },

            {

              status: 500,

            }

          );

        }

      }



      /* ======================================================

         EMAIL ÉQUIPE — NOUVELLE COMMANDE

         ====================================================== */



      const ownerEmailAlreadySent =

        orders.some(

          (order) =>

            Boolean(

              order.owner_confirmation_email_sent_at

            )

        );



      if (!ownerEmailAlreadySent) {

        const ownerHtml =

          buildEmailLayout({

            eyebrow:

              `Commande #${orderNumber}`,



            title:

              "Nouvelle commande",



            intro:

              `Une nouvelle commande AJVEK vient d’être payée par ` +

              `<strong style="color:#f4f1ea;">${escapeHtml(

                customerName

              )}</strong>.`,



            content: `

              <div style="

                margin-top:30px;

                padding:22px;

                border:1px solid #2d2a28;

                background:#181715;

                border-radius:14px;

              ">

                <p style="

                  margin:0;

                  font-family:Arial,Helvetica,sans-serif;

                  font-size:12px;

                  line-height:22px;

                  color:#b3aca4;

                ">

                  <strong style="color:#f4f1ea;">

                    Client

                  </strong>

                  <br />

                  ${escapeHtml(customerName)}

                  <br />

                  ${escapeHtml(customerEmail || "-")}

                  <br />

                  ${escapeHtml(customerPhone)}

                </p>

              </div>



              <div style="

                margin-top:30px;

                border-top:1px solid #2d2a28;

              ">

                <p style="

                  margin:24px 0 8px;

                  font-family:Arial,Helvetica,sans-serif;

                  font-size:9px;

                  letter-spacing:3px;

                  text-transform:uppercase;

                  color:#8a8178;

                ">

                  Articles · ${itemCount}

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



              <div style="

                margin-top:30px;

                border-top:1px solid #2d2a28;

              ">

                <p style="

                  margin:24px 0 8px;

                  font-family:Arial,Helvetica,sans-serif;

                  font-size:9px;

                  letter-spacing:3px;

                  text-transform:uppercase;

                  color:#8a8178;

                ">

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

              "Voir les commandes",



            buttonUrl:

              `${SITE_URL}/admin/commandes`,



            footerText:

              `Session Stripe : ${session.id}`,

          });



        const {

          data: ownerEmailData,

          error: ownerEmailError,

        } = await resend.emails.send(

          {

            from: FROM_EMAIL,

            to: OWNER_EMAIL,



            subject:

              `Nouvelle commande AJVEK #${orderNumber}`,



            html:

              ownerHtml,



            text:

              `Nouvelle commande AJVEK payée.\n\n` +

              `Commande : #${orderNumber}\n` +

              `Client : ${customerName}\n` +

              `Email : ${customerEmail || "-"}\n` +

              `Téléphone : ${customerPhone}\n\n` +

              `Articles :\n${summary}\n\n` +

              `Livraison : ${deliveryMethod}\n` +

              `Frais de livraison : ${shippingAmount}\n\n` +

              `Session Stripe : ${session.id}\n`,

          },

          {

            idempotencyKey:

              `order-confirmation-owner-${checkoutGroupId}`,

          }

        );



        if (ownerEmailError) {

          console.error(

            "[stripe-webhook] Erreur email équipe :",

            ownerEmailError

          );



          return NextResponse.json(

            {

              error:

                "Notification équipe non envoyée.",

            },

            {

              status: 500,

            }

          );

        }



        if (!ownerEmailData?.id) {

          console.error(

            "[stripe-webhook] Resend n'a pas retourné d'identifiant pour l'email équipe."

          );



          return NextResponse.json(

            {

              error:

                "Notification équipe non vérifiable.",

            },

            {

              status: 500,

            }

          );

        }



        try {

          await markEmailSent(

            checkoutGroupId,

            "owner_confirmation_email_sent_at"

          );

        } catch (error) {

          console.error(

            "[stripe-webhook] Email équipe envoyé mais marquage Supabase impossible :",

            error

          );



          return NextResponse.json(

            {

              error:

                "Notification équipe envoyée mais non enregistrée.",

            },

            {

              status: 500,

            }

          );

        }

      }



      return NextResponse.json({

        received: true,

      });

    }



    /* ========================================================

       SESSION CHECKOUT EXPIRÉE

       ======================================================== */



    if (

      event.type ===

      "checkout.session.expired"

    ) {

      const session =

        event.data.object as Stripe.Checkout.Session;



      const checkoutGroupId =

        session.metadata?.checkout_group_id;



      if (!checkoutGroupId) {

        console.error(

          "[stripe-webhook] Session expirée sans checkout_group_id :",

          session.id

        );



        return NextResponse.json({

          received: true,

        });

      }



      const {

        data: releaseResult,

        error: releaseError,

      } = await supabaseAdmin.rpc(

        "release_stock_reservation",

        {

          p_checkout_group_id:

            checkoutGroupId,

        }

      );



      if (releaseError) {

        console.error(

          "[stripe-webhook] Impossible de libérer la réservation expirée :",

          {

            checkoutGroupId,

            stripeSessionId:

              session.id,

            error: releaseError,

          }

        );



        return NextResponse.json(

          {

            error:

              "Impossible de libérer la réservation expirée.",

          },

          {

            status: 500,

          }

        );

      }



      if (

        releaseResult?.success !== true

      ) {

        console.error(

          "[stripe-webhook] Résultat inattendu de release_stock_reservation :",

          {

            checkoutGroupId,

            stripeSessionId:

              session.id,

            result:

              releaseResult,

          }

        );



        return NextResponse.json(

          {

            error:

              "Résultat de libération de réservation invalide.",

          },

          {

            status: 500,

          }

        );

      }



      const {

        error: expiredOrderError,

      } = await supabaseAdmin

        .from("preorders")

        .update({

          order_status: "expired",

        })

        .eq(

          "checkout_group_id",

          checkoutGroupId

        )

        .eq("paid", false);



      if (expiredOrderError) {

        console.error(

          "[stripe-webhook] Stock libéré mais statut expiré non enregistré :",

          {

            checkoutGroupId,

            stripeSessionId:

              session.id,

            error:

              expiredOrderError,

          }

        );



        return NextResponse.json(

          {

            error:

              "Stock libéré mais statut de commande non enregistré.",

          },

          {

            status: 500,

          }

        );

      }



      console.log(

        "[stripe-webhook] Réservation expirée libérée :",

        {

          checkoutGroupId,

          stripeSessionId:

            session.id,

          releasedCount:

            releaseResult?.released_count ??

            0,

        }

      );



      return NextResponse.json({

        received: true,

      });

    }



    /* ========================================================

       PAIEMENT ÉCHOUÉ

       ======================================================== */



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



        return NextResponse.json(

          {

            error:

              "Commande échouée introuvable.",

          },

          {

            status: 500,

          }

        );

      }



      /*

       * Un ancien événement d'échec ne doit jamais

       * écraser une commande qui a finalement été payée.

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



      const first =

        orders[0];



      const customerName =

        first?.name || "client";



      const customerEmail =

        first?.email || null;



      const orderNumber =

        shortOrderId(

          checkoutGroupId

        );



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

       * Le statut peut être enregistré immédiatement.

       *

       * En revanche, payment_failure_notified_at

       * ne sera renseigné qu'une fois les notifications

       * nécessaires réellement envoyées.

       */



      const {

        error: failureStatusError,

      } = await supabaseAdmin

        .from("preorders")

        .update({

          order_status:

            "payment_failed",

        })

        .eq(

          "checkout_group_id",

          checkoutGroupId

        )

        .eq("paid", false);



      if (failureStatusError) {

        console.error(

          "[stripe-webhook] Impossible d'enregistrer le paiement échoué :",

          failureStatusError

        );



        return NextResponse.json(

          {

            error:

              "Erreur Supabase.",

          },

          {

            status: 500,

          }

        );

      }



      /* ======================================================

         EMAIL CLIENT — PAIEMENT ÉCHOUÉ

         ====================================================== */



      const legacyFailureAlreadyNotified =

        orders.some(

          (order) =>

            Boolean(

              order.payment_failure_notified_at

            )

        );



      const customerFailureEmailAlreadySent =

        legacyFailureAlreadyNotified ||

        orders.some(

          (order) =>

            Boolean(

              order.customer_payment_failure_email_sent_at

            )

        );



      if (

        customerEmail &&

        !customerFailureEmailAlreadySent

      ) {

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

              <div style="

                margin-top:30px;

                padding:22px;

                border:1px solid #2d2a28;

                background:#181715;

                border-radius:14px;

              ">

                <p style="

                  margin:0;

                  font-family:Arial,Helvetica,sans-serif;

                  font-size:12px;

                  line-height:22px;

                  color:#b3aca4;

                ">

                  Ta commande n’est pas confirmée.

                  Les articles restent réservés temporairement

                  pendant la session de paiement.

                </p>

              </div>



              <div style="

                margin-top:28px;

                border-top:1px solid #2d2a28;

              ">

                <p style="

                  margin:24px 0 8px;

                  font-family:Arial,Helvetica,sans-serif;

                  font-size:9px;

                  letter-spacing:3px;

                  text-transform:uppercase;

                  color:#8a8178;

                ">

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



              <p style="
  margin:28px 0 0;
  font-family:Arial,Helvetica,sans-serif;
  font-size:12px;
  line-height:22px;
  color:#b3aca4;
">
  Tes articles restent réservés temporairement.
  Retourne sur AJVEK pour reprendre ta session
  de paiement et réessayer avec ta carte ou
  utiliser une autre carte si nécessaire.
</p>

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

          data:

            customerFailureEmailData,

          error:

            customerFailureEmailError,

        } = await resend.emails.send(

          {

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

              `Les articles restent réservés temporairement pendant la session de paiement.\n\n` +

              `Tu peux recommencer ta commande avec une autre carte si nécessaire.\n\n` +

              `À bientôt,\n` +

              `L'équipe AJVEK`,

          },

          {

            idempotencyKey:

              `payment-failed-customer-${checkoutGroupId}`,

          }

        );



        if (

          customerFailureEmailError

        ) {

          console.error(

            "[stripe-webhook] Erreur email client paiement échoué :",

            customerFailureEmailError

          );



          return NextResponse.json(

            {

              error:

                "Email client paiement échoué non envoyé.",

            },

            {

              status: 500,

            }

          );

        }



        if (

          !customerFailureEmailData?.id

        ) {

          console.error(

            "[stripe-webhook] Resend n'a pas retourné d'identifiant pour l'email client paiement échoué."

          );



          return NextResponse.json(

            {

              error:

                "Email client paiement échoué non vérifiable.",

            },

            {

              status: 500,

            }

          );

        }



        try {

          await markEmailSent(

            checkoutGroupId,

            "customer_payment_failure_email_sent_at"

          );

        } catch (error) {

          console.error(

            "[stripe-webhook] Email client paiement échoué envoyé mais marquage Supabase impossible :",

            error

          );



          return NextResponse.json(

            {

              error:

                "Email client paiement échoué envoyé mais non enregistré.",

            },

            {

              status: 500,

            }

          );

        }

      }
            /* ======================================================

         EMAIL ÉQUIPE — PAIEMENT ÉCHOUÉ

         ====================================================== */



      const ownerFailureEmailAlreadySent =

        legacyFailureAlreadyNotified ||

        orders.some(

          (order) =>

            Boolean(

              order.owner_payment_failure_email_sent_at

            )

        );



      if (!ownerFailureEmailAlreadySent) {

        const ownerFailureHtml =

          buildEmailLayout({

            eyebrow:

              `Paiement échoué #${orderNumber}`,



            title:

              "Paiement non validé",



            intro:

              `Une tentative de paiement AJVEK de ` +

              `<strong style="color:#f4f1ea;">${escapeHtml(

                customerName

              )}</strong> a échoué.`,



            content: `

              <div style="

                margin-top:30px;

                padding:22px;

                border:1px solid #2d2a28;

                background:#181715;

                border-radius:14px;

              ">

                <p style="

                  margin:0;

                  font-family:Arial,Helvetica,sans-serif;

                  font-size:12px;

                  line-height:22px;

                  color:#b3aca4;

                ">

                  <strong style="color:#f4f1ea;">

                    Client

                  </strong>



                  <br />

                  ${escapeHtml(

                    customerName

                  )}



                  <br />

                  ${escapeHtml(

                    customerEmail || "-"

                  )}



                  <br /><br />



                  <strong style="color:#f4f1ea;">

                    Code Stripe

                  </strong>



                  <br />

                  ${escapeHtml(

                    declineCode

                  )}



                  <br /><br />



                  <strong style="color:#f4f1ea;">

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

          data:

            ownerFailureEmailData,

          error:

            ownerFailureEmailError,

        } = await resend.emails.send(

          {

            from: FROM_EMAIL,

            to: OWNER_EMAIL,



            subject:

              `AJVEK — paiement échoué #${orderNumber}`,



            html:

              ownerFailureHtml,



            text:

              `Un paiement AJVEK a échoué.\n\n` +

              `Commande : #${orderNumber}\n` +

              `Client : ${customerName}\n` +

              `Email : ${customerEmail || "-"}\n\n` +

              `Articles :\n${summary}\n\n` +

              `PaymentIntent Stripe : ${paymentIntent.id}\n` +

              `Code de refus : ${declineCode}\n` +

              `Message Stripe : ${failureMessage}\n\n` +

              `Les articles restent réservés temporairement pendant la session de paiement.\n`,

          },

          {

            idempotencyKey:

              `payment-failed-owner-${checkoutGroupId}`,

          }

        );



        if (

          ownerFailureEmailError

        ) {

          console.error(

            "[stripe-webhook] Erreur email équipe paiement échoué :",

            ownerFailureEmailError

          );



          return NextResponse.json(

            {

              error:

                "Email équipe paiement échoué non envoyé.",

            },

            {

              status: 500,

            }

          );

        }



        if (

          !ownerFailureEmailData?.id

        ) {

          console.error(

            "[stripe-webhook] Resend n'a pas retourné d'identifiant pour l'email équipe paiement échoué."

          );



          return NextResponse.json(

            {

              error:

                "Email équipe paiement échoué non vérifiable.",

            },

            {

              status: 500,

            }

          );

        }



        try {

          await markEmailSent(

            checkoutGroupId,

            "owner_payment_failure_email_sent_at"

          );

        } catch (error) {

          console.error(

            "[stripe-webhook] Email équipe paiement échoué envoyé mais marquage Supabase impossible :",

            error

          );



          return NextResponse.json(

            {

              error:

                "Email équipe paiement échoué envoyé mais non enregistré.",

            },

            {

              status: 500,

            }

          );

        }

      }



      /*

       * Marqueur historique global.

       *

       * Il n'est renseigné qu'après les notifications.

       * Les quatre colonnes spécifiques restent

       * la source de vérité pour chaque email.

       */



      const failureNotifiedAt =

        new Date().toISOString();



      const {

        error:

          failureNotifiedUpdateError,

      } = await supabaseAdmin

        .from("preorders")

        .update({

          payment_failure_notified_at:

            failureNotifiedAt,

        })

        .eq(

          "checkout_group_id",

          checkoutGroupId

        )

        .eq("paid", false);



      if (

        failureNotifiedUpdateError

      ) {

        console.error(

          "[stripe-webhook] Notifications envoyées mais payment_failure_notified_at non enregistré :",

          failureNotifiedUpdateError

        );



        /*

         * Les marqueurs individuels sont déjà présents.

         * Un retry ne renverra donc pas les emails.

         */

        return NextResponse.json(

          {

            error:

              "Notifications envoyées mais état global non enregistré.",

          },

          {

            status: 500,

          }

        );

      }



      return NextResponse.json({

        received: true,

      });

    }



    /* Autres événements Stripe */



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