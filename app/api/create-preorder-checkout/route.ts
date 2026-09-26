import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import Stripe from "stripe";
import { randomUUID } from "crypto";
import { getProduct } from "@/lib/products";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

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

const supabaseAuth = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  }
);

const SITE_URL = "https://ajvek.fr";

type CheckoutItem = {
  product_slug: string;
  color: string;
  size: string;
  quantity: number;
};

type DeliveryMethod = "relay" | "home";

type ServicePoint = {
  id: number | string;
  name?: string;
  street?: string;
  houseNumber?: string;
  postalCode?: string;
  city?: string;
  carrier?: string;
};

type ValidatedItem = {
  product_slug: string;
  product_name: string;
  color: string;
  size: string;
  quantity: number;
  priceValue: number;
};

type StockRow = {
  product_slug: string;
  color: string;
  size: string;
  stock_quantity: number;
  sales_enabled: boolean;
};

function normalize(value: string) {
  return value.trim().toLocaleLowerCase("fr-FR");
}

async function deleteTemporaryOrder(
  checkoutGroupId: string
) {
  const { error } = await supabaseAdmin
    .from("preorders")
    .delete()
    .eq("checkout_group_id", checkoutGroupId)
    .eq("paid", false);

  if (error) {
    console.error(
      "[create-checkout] Impossible de supprimer la commande temporaire :",
      error
    );
  }
}

async function releaseReservation(
  checkoutGroupId: string
) {
  const { data, error } = await supabaseAdmin.rpc(
    "release_stock_reservation",
    {
      p_checkout_group_id: checkoutGroupId,
    }
  );

  if (error) {
    console.error(
      "[create-checkout] Impossible de libérer la réservation :",
      {
        checkoutGroupId,
        error,
      }
    );

    return false;
  }

  if (data?.success !== true) {
    console.error(
      "[create-checkout] Résultat inattendu lors de la libération de la réservation :",
      {
        checkoutGroupId,
        data,
      }
    );

    return false;
  }

  return true;
}

async function expireStripeSession(
  sessionId: string
) {
  try {
    await stripe.checkout.sessions.expire(
      sessionId
    );
  } catch (error) {
    console.error(
      "[create-checkout] Impossible d’expirer la session Stripe :",
      {
        sessionId,
        error,
      }
    );
  }
}

export async function POST(
  request: Request
) {
  try {
    // ========================================================
    // 1. AUTHENTIFICATION
    // ========================================================

    const authorization =
      request.headers.get("authorization");

    if (
      !authorization?.startsWith("Bearer ")
    ) {
      return NextResponse.json(
        {
          error:
            "Connexion requise pour passer commande.",
        },
        {
          status: 401,
        }
      );
    }

    const accessToken =
      authorization.replace("Bearer ", "");

    const {
      data: { user },
      error: userError,
    } = await supabaseAuth.auth.getUser(
      accessToken
    );

    if (
      userError ||
      !user ||
      !user.email
    ) {
      return NextResponse.json(
        {
          error:
            "Session utilisateur invalide ou expirée.",
        },
        {
          status: 401,
        }
      );
    }

    // ========================================================
    // 2. DONNÉES
    // ========================================================

    let body: {
      name?: string;
      phone?: string;
      items?: CheckoutItem[];
      delivery_method?: DeliveryMethod;
      service_point?: ServicePoint | null;
    };

    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        {
          error:
            "Données de commande invalides.",
        },
        {
          status: 400,
        }
      );
    }

    const {
      name,
      phone,
      items,
      delivery_method,
      service_point,
    } = body;

    if (!name?.trim()) {
      return NextResponse.json(
        {
          error: "Ton nom est requis.",
        },
        {
          status: 400,
        }
      );
    }

    if (
      !Array.isArray(items) ||
      items.length === 0
    ) {
      return NextResponse.json(
        {
          error: "Ton panier est vide.",
        },
        {
          status: 400,
        }
      );
    }

    if (
      delivery_method !== "relay" &&
      delivery_method !== "home"
    ) {
      return NextResponse.json(
        {
          error:
            "Mode de livraison invalide.",
        },
        {
          status: 400,
        }
      );
    }

    if (
      delivery_method === "relay" &&
      (
        service_point?.id === undefined ||
        service_point?.id === null ||
        !service_point?.postalCode ||
        !service_point?.city
      )
    ) {
      return NextResponse.json(
        {
          error:
            "Choisis un Point Relais valide.",
        },
        {
          status: 400,
        }
      );
    }

    // ========================================================
    // 3. VALIDATION DES ARTICLES
    // ========================================================

    const mergedItems =
      new Map<string, ValidatedItem>();

    for (const item of items) {
      const quantity = Number(
        item.quantity
      );

      if (
        !item.product_slug ||
        !item.color ||
        !item.size ||
        !Number.isInteger(quantity) ||
        quantity < 1 ||
        quantity > 10
      ) {
        return NextResponse.json(
          {
            error:
              "Un article du panier est invalide.",
          },
          {
            status: 400,
          }
        );
      }

      const product = getProduct(
        item.product_slug
      );

      if (!product) {
        return NextResponse.json(
          {
            error:
              `Produit introuvable : ${item.product_slug}`,
          },
          {
            status: 404,
          }
        );
      }

      const colorway =
        product.colorways.find(
          (colorway) =>
            normalize(colorway.label) ===
            normalize(item.color)
        );

      if (!colorway) {
        return NextResponse.json(
          {
            error:
              `Couleur invalide pour ${product.name}.`,
          },
          {
            status: 400,
          }
        );
      }

      const validSize =
        product.sizes.find(
          (productSize) =>
            normalize(productSize) ===
            normalize(item.size)
        );

      if (!validSize) {
        return NextResponse.json(
          {
            error:
              `Taille invalide pour ${product.name}.`,
          },
          {
            status: 400,
          }
        );
      }

      const cleanColor =
        colorway.label;

      const cleanSize =
        validSize;

      const itemKey = [
        product.slug,
        normalize(cleanColor),
        normalize(cleanSize),
      ].join("::");

      const existingItem =
        mergedItems.get(itemKey);

      if (existingItem) {
        const newQuantity =
          existingItem.quantity +
          quantity;

        if (newQuantity > 10) {
          return NextResponse.json(
            {
              error:
                "La quantité maximale autorisée pour un même article est de 10.",
            },
            {
              status: 400,
            }
          );
        }

        existingItem.quantity =
          newQuantity;
      } else {
        mergedItems.set(
          itemKey,
          {
            product_slug:
              product.slug,
            product_name:
              product.name,
            color:
              cleanColor,
            size:
              cleanSize,
            quantity,
            priceValue:
              product.priceValue,
          }
        );
      }
    }

    const validatedItems =
      Array.from(
        mergedItems.values()
      );

    const totalQuantity =
      validatedItems.reduce(
        (total, item) =>
          total + item.quantity,
        0
      );

    if (totalQuantity > 20) {
      return NextResponse.json(
        {
          error:
            "La quantité maximale autorisée est de 20 vêtements par commande.",
        },
        {
          status: 400,
        }
      );
    }

    // ========================================================
    // 4. RÉCUPÉRATION DU STOCK
    // ========================================================

    const {
      data: stockData,
      error: stockError,
    } = await supabaseAdmin
      .from("product_stock")
      .select(`
        product_slug,
        color,
        size,
        stock_quantity,
        sales_enabled
      `);

    if (stockError) {
      console.error(
        "[create-checkout] Erreur récupération stock :",
        stockError
      );

      return NextResponse.json(
        {
          error:
            "Impossible de vérifier le stock actuellement.",
        },
        {
          status: 500,
        }
      );
    }

    const stockRows =
      (stockData ?? []) as StockRow[];

    // ========================================================
    // 5. VÉRIFICATION STOCK + OUVERTURE DES VENTES
    // ========================================================

    for (
      const item of validatedItems
    ) {
      const stockRow =
        stockRows.find(
          (row) =>
            row.product_slug ===
              item.product_slug &&
            normalize(row.color) ===
              normalize(item.color) &&
            normalize(row.size) ===
              normalize(item.size)
        );

      if (!stockRow) {
        return NextResponse.json(
          {
            error:
              `${item.product_name} — ${item.color} — Taille ${item.size} n'est pas disponible.`,
          },
          {
            status: 409,
          }
        );
      }

      if (
        stockRow.sales_enabled !==
        true
      ) {
        return NextResponse.json(
          {
            error:
              `${item.product_name} — ${item.color} — Taille ${item.size} sera bientôt disponible.`,
          },
          {
            status: 409,
          }
        );
      }

      const availableStock =
        Math.max(
          Number(
            stockRow.stock_quantity ??
              0
          ),
          0
        );

      if (availableStock <= 0) {
        return NextResponse.json(
          {
            error:
              `${item.product_name} — ${item.color} — Taille ${item.size} est épuisé.`,
          },
          {
            status: 409,
          }
        );
      }

      if (
        item.quantity >
        availableStock
      ) {
        return NextResponse.json(
          {
            error:
              `Il ne reste que ${availableStock} exemplaire${
                availableStock > 1
                  ? "s"
                  : ""
              } de ${item.product_name} — ${item.color} — Taille ${item.size}.`,
          },
          {
            status: 409,
          }
        );
      }
    }

    // ========================================================
    // 6. LIVRAISON
    // ========================================================

    let shippingAmount = 0;

    if (totalQuantity < 3) {
      shippingAmount =
        delivery_method === "relay"
          ? 490
          : 790;
    }

    // ========================================================
    // 7. IDENTIFIANT UNIQUE DE COMMANDE
    // ========================================================

    const checkoutGroupId =
      randomUUID();

    const servicePointAddress =
      delivery_method === "relay" &&
      service_point
        ? [
            service_point.houseNumber,
            service_point.street,
          ]
            .filter(Boolean)
            .join(" ")
        : null;

    // ========================================================
    // 8. CRÉATION DES LIGNES DE COMMANDE
    // ========================================================

    const orderRows =
      validatedItems.flatMap(
        (item) =>
          Array.from(
            {
              length:
                item.quantity,
            },
            () => ({
              user_id:
                user.id,

              name:
                name.trim(),

              email:
                user.email!,

              phone:
                phone?.trim() ||
                null,

              product_slug:
                item.product_slug,

              product_name:
                item.product_name,

              color:
                item.color,

              size:
                item.size,

              paid: false,

              checkout_group_id:
                checkoutGroupId,

              delivery_method,

              shipping_amount:
                shippingAmount,

              order_status:
                "awaiting_payment",

              service_point_id:
                delivery_method ===
                "relay"
                  ? String(
                      service_point?.id ??
                        ""
                    )
                  : null,

              service_point_name:
                delivery_method ===
                "relay"
                  ? service_point?.name ||
                    null
                  : null,

              service_point_address:
                delivery_method ===
                "relay"
                  ? servicePointAddress
                  : null,

              service_point_postal_code:
                delivery_method ===
                "relay"
                  ? service_point?.postalCode ||
                    null
                  : null,

              service_point_city:
                delivery_method ===
                "relay"
                  ? service_point?.city ||
                    null
                  : null,
            })
          )
      );

    const {
      data: createdOrders,
      error: orderError,
    } = await supabaseAdmin
      .from("preorders")
      .insert(orderRows)
      .select();

    if (
      orderError ||
      !createdOrders ||
      createdOrders.length === 0
    ) {
      console.error(
        "[create-checkout] Erreur création commande :",
        orderError
      );

      return NextResponse.json(
        {
          error:
            "Impossible de créer la commande.",
        },
        {
          status: 500,
        }
      );
    }

    // ========================================================
    // 9. ARTICLES STRIPE
    // ========================================================

    const lineItems:
      Stripe.Checkout.SessionCreateParams.LineItem[] =
      validatedItems.map(
        (item) => ({
          price_data: {
            currency: "eur",

            product_data: {
              name:
                `${item.product_name} — ${item.color} — Taille ${item.size}`,

              description:
                "AJVEK · Drop 001",
            },

            unit_amount:
              Math.round(
                item.priceValue *
                  100
              ),
          },

          quantity:
            item.quantity,
        })
      );

    const shippingLabel =
      delivery_method === "relay"
        ? "Mondial Relay — Point Relais"
        : "Livraison à domicile";

    // ========================================================
    // 10. SESSION STRIPE
    // ========================================================

    const sessionParams:
      Stripe.Checkout.SessionCreateParams =
      {
        mode: "payment",

        customer_email:
          user.email,

        payment_method_types: [
          "card",
        ],

        allow_promotion_codes:
          true,

        payment_intent_data: {
          metadata: {
            checkout_group_id:
              checkoutGroupId,

            user_id:
              user.id,

            order_type:
              "stock",
          },
        },

        line_items:
          lineItems,

        shipping_options: [
          {
            shipping_rate_data: {
              type:
                "fixed_amount",

              fixed_amount: {
                amount:
                  shippingAmount,

                currency:
                  "eur",
              },

              display_name:
                shippingAmount === 0
                  ? `${shippingLabel} — offerte`
                  : shippingLabel,
            },
          },
        ],

        metadata: {
          checkout_group_id:
            checkoutGroupId,

          user_id:
            user.id,

          item_count:
            String(
              totalQuantity
            ),

          delivery_method,

          order_type:
            "stock",

          service_point_id:
            delivery_method ===
            "relay"
              ? String(
                  service_point?.id ??
                    ""
                )
              : "",
        },

        success_url:
          `${SITE_URL}/paiement/succes?session_id={CHECKOUT_SESSION_ID}`,

        cancel_url:
          `${SITE_URL}/paiement/annule`,
      };

    if (
      delivery_method === "home"
    ) {
      sessionParams.shipping_address_collection =
        {
          allowed_countries: [
            "FR",
          ],
        };
    }

    // ========================================================
    // 11. CRÉATION SESSION STRIPE
    // ========================================================

    let session:
      Stripe.Checkout.Session;

    try {
      session =
        await stripe.checkout.sessions.create(
          sessionParams
        );
    } catch (error) {
      await deleteTemporaryOrder(
        checkoutGroupId
      );

      throw error;
    }

    // ========================================================
    // 12. RÉSERVATION ATOMIQUE DU STOCK
    // ========================================================
    //
    // La session Stripe existe mais son URL n'a encore jamais
    // été transmise au navigateur.
    //
    // On utilise la date d'expiration de Stripe pour la
    // réservation Supabase.
    // ========================================================

    const reservationExpiresAt =
      new Date(
        session.expires_at * 1000
      ).toISOString();

    const reservationItems =
      validatedItems.map(
        (item) => ({
          product_slug:
            item.product_slug,
          color:
            item.color,
          size:
            item.size,
          quantity:
            item.quantity,
        })
      );

    const {
      data: reservationResult,
      error: reservationError,
    } = await supabaseAdmin.rpc(
      "reserve_order_stock",
      {
        p_checkout_group_id:
          checkoutGroupId,

        p_items:
          reservationItems,

        p_expires_at:
          reservationExpiresAt,
      }
    );

    if (
      reservationError ||
      reservationResult?.success !==
        true
    ) {
      console.error(
        "[create-checkout] Réservation du stock impossible :",
        {
          checkoutGroupId,
          error:
            reservationError,
          result:
            reservationResult,
        }
      );

      await expireStripeSession(
        session.id
      );

      await deleteTemporaryOrder(
        checkoutGroupId
      );

      return NextResponse.json(
        {
          error:
            "Le stock vient de changer. Vérifie ton panier puis réessaie.",
        },
        {
          status: 409,
        }
      );
    }

    // ========================================================
    // 13. VÉRIFICATION URL STRIPE
    // ========================================================

    if (!session.url) {
      await expireStripeSession(
        session.id
      );

      const released =
        await releaseReservation(
          checkoutGroupId
        );

      if (!released) {
        return NextResponse.json(
          {
            error:
              "Erreur lors de l’annulation de la réservation. Réessaie dans quelques instants.",
          },
          {
            status: 500,
          }
        );
      }

      await deleteTemporaryOrder(
        checkoutGroupId
      );

      return NextResponse.json(
        {
          error:
            "Stripe n'a pas retourné de lien de paiement.",
        },
        {
          status: 500,
        }
      );
    }

    // ========================================================
    // 14. SAUVEGARDE SESSION STRIPE
    // ========================================================

    const {
      error: updateError,
    } = await supabaseAdmin
      .from("preorders")
      .update({
        stripe_session_id:
          session.id,

        checkout_url:
          session.url,
      })
      .eq(
        "checkout_group_id",
        checkoutGroupId
      );

    if (updateError) {
      console.error(
        "[create-checkout] Erreur sauvegarde session Stripe :",
        updateError
      );

      await expireStripeSession(
        session.id
      );

      const released =
        await releaseReservation(
          checkoutGroupId
        );

      if (!released) {
        return NextResponse.json(
          {
            error:
              "La session de paiement n’a pas pu être enregistrée et la réservation nécessite une vérification.",
          },
          {
            status: 500,
          }
        );
      }

      await deleteTemporaryOrder(
        checkoutGroupId
      );

      return NextResponse.json(
        {
          error:
            "Impossible de préparer le paiement. Réessaie dans quelques instants.",
        },
        {
          status: 500,
        }
      );
    }

    // ========================================================
    // 15. RÉPONSE
    // ========================================================

    return NextResponse.json(
      {
        url:
          session.url,

        checkoutGroupId,

        itemCount:
          totalQuantity,

        shippingAmount,

        deliveryMethod:
          delivery_method,
      },
      {
        headers: {
          "Cache-Control":
            "no-store, max-age=0",
        },
      }
    );
  } catch (error) {
    console.error(
      "[create-checkout] Erreur générale :",
      error
    );

    return NextResponse.json(
      {
        error:
          "Erreur serveur.",
      },
      {
        status: 500,
      }
    );
  }
}