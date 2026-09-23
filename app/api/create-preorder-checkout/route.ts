import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import Stripe from "stripe";
import { randomUUID } from "crypto";
import { getProduct } from "@/lib/products";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
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

export async function POST(request: Request) {
  try {
    /*
     * ============================================================
     * 1. AUTHENTIFICATION
     * ============================================================
     */

    const authorization = request.headers.get("authorization");

    if (!authorization?.startsWith("Bearer ")) {
      return NextResponse.json(
        {
          error: "Connexion requise.",
        },
        {
          status: 401,
        }
      );
    }

    const accessToken = authorization.replace("Bearer ", "");

    const {
      data: { user },
      error: userError,
    } = await supabaseAuth.auth.getUser(accessToken);

    if (userError || !user || !user.email) {
      return NextResponse.json(
        {
          error: "Session utilisateur invalide ou expirée.",
        },
        {
          status: 401,
        }
      );
    }

    /*
     * ============================================================
     * 2. LECTURE DE LA REQUÊTE
     * ============================================================
     */

    const body = await request.json();

    const {
      name,
      phone,
      items,
      delivery_method,
      service_point,
    }: {
      name: string;
      phone?: string;
      items: CheckoutItem[];
      delivery_method: DeliveryMethod;
      service_point?: ServicePoint | null;
    } = body;

    /*
     * ============================================================
     * 3. VALIDATION DES INFORMATIONS CLIENT
     * ============================================================
     */

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

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        {
          error: "Ta précommande est vide.",
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
          error: "Mode de livraison invalide.",
        },
        {
          status: 400,
        }
      );
    }

    if (
      delivery_method === "relay" &&
      (!service_point?.id ||
        !service_point?.postalCode ||
        !service_point?.city)
    ) {
      return NextResponse.json(
        {
          error: "Choisis un Point Relais valide.",
        },
        {
          status: 400,
        }
      );
    }

    /*
     * ============================================================
     * 4. VALIDATION DES ARTICLES
     * ============================================================
     *
     * IMPORTANT :
     *
     * Le navigateur peut accidentellement envoyer plusieurs lignes
     * correspondant exactement au même article :
     *
     * Sakura / Noir / M ×1
     * Sakura / Noir / M ×1
     * Sakura / Noir / M ×1
     *
     * On fusionne donc ces lignes côté serveur.
     *
     * Cela évite :
     * - les doublons Supabase
     * - les doublons Stripe
     * - les quantités artificiellement gonflées
     */

    const mergedItems = new Map<string, ValidatedItem>();

    for (const item of items) {
      const quantity = Number(item.quantity);

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
            error: "Un article de la précommande est invalide.",
          },
          {
            status: 400,
          }
        );
      }

      const product = getProduct(item.product_slug);

      if (!product) {
        return NextResponse.json(
          {
            error: `Produit introuvable : ${item.product_slug}`,
          },
          {
            status: 404,
          }
        );
      }

      /*
       * On nettoie légèrement les valeurs pour éviter que :
       *
       * "Noir"
       * " Noir "
       *
       * soient considérés comme deux articles différents.
       */

      const cleanColor = item.color.trim();
      const cleanSize = item.size.trim();

      const itemKey = [
        product.slug,
        cleanColor.toLowerCase(),
        cleanSize.toLowerCase(),
      ].join("::");

      const existingItem = mergedItems.get(itemKey);

      if (existingItem) {
        const newQuantity =
          existingItem.quantity + quantity;

        /*
         * La limite de 10 par variante ne doit pas pouvoir être
         * contournée en envoyant plusieurs lignes identiques.
         */

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

        existingItem.quantity = newQuantity;
      } else {
        mergedItems.set(itemKey, {
          product_slug: product.slug,
          product_name: product.name,
          color: cleanColor,
          size: cleanSize,
          quantity,
          priceValue: product.priceValue,
        });
      }
    }

    const validatedItems = Array.from(mergedItems.values());

    /*
     * ============================================================
     * 5. QUANTITÉ TOTALE
     * ============================================================
     */

    const totalQuantity = validatedItems.reduce(
      (total, item) => total + item.quantity,
      0
    );

    if (totalQuantity < 1) {
      return NextResponse.json(
        {
          error: "Ta précommande est vide.",
        },
        {
          status: 400,
        }
      );
    }

    if (totalQuantity > 20) {
      return NextResponse.json(
        {
          error:
            "La quantité maximale autorisée est de 20 vêtements.",
        },
        {
          status: 400,
        }
      );
    }

    /*
     * ============================================================
     * 6. FRAIS DE LIVRAISON
     * ============================================================
     *
     * 1 ou 2 vêtements :
     * - Point Relais = 4,90 €
     * - Domicile = 7,90 €
     *
     * 3 vêtements ou plus :
     * - livraison offerte
     */

    let shippingAmount = 0;

    if (totalQuantity < 3) {
      shippingAmount =
        delivery_method === "relay" ? 490 : 790;
    }

    /*
     * ============================================================
     * 7. IDENTIFIANT UNIQUE DE LA COMMANDE
     * ============================================================
     */

    const checkoutGroupId = randomUUID();

    /*
     * ============================================================
     * 8. POINT RELAIS
     * ============================================================
     */

    const servicePointAddress =
      delivery_method === "relay" && service_point
        ? [
            service_point.houseNumber,
            service_point.street,
          ]
            .filter(Boolean)
            .join(" ")
        : null;

    /*
     * ============================================================
     * 9. CRÉATION DES LIGNES SUPABASE
     * ============================================================
     *
     * On conserve volontairement :
     *
     * 1 vêtement physique = 1 ligne Supabase
     *
     * Exemple :
     *
     * Sakura M ×2
     *
     * donne :
     *
     * ligne 1 = Sakura M
     * ligne 2 = Sakura M
     *
     * C'est nécessaire pour que le compteur de production
     * compte bien les vêtements et non les commandes.
     */

    const preorderRows = validatedItems.flatMap((item) =>
      Array.from(
        {
          length: item.quantity,
        },
        () => ({
          user_id: user.id,

          name: name.trim(),

          email: user.email!,

          phone: phone?.trim() || null,

          product_slug: item.product_slug,

          product_name: item.product_name,

          color: item.color,

          size: item.size,

          paid: false,

          checkout_group_id: checkoutGroupId,

          delivery_method,

          shipping_amount: shippingAmount,

          service_point_id:
            delivery_method === "relay"
              ? String(service_point?.id ?? "")
              : null,

          service_point_name:
            delivery_method === "relay"
              ? service_point?.name || null
              : null,

          service_point_address:
            delivery_method === "relay"
              ? servicePointAddress
              : null,

          service_point_postal_code:
            delivery_method === "relay"
              ? service_point?.postalCode || null
              : null,

          service_point_city:
            delivery_method === "relay"
              ? service_point?.city || null
              : null,
        })
      )
    );

    const {
      data: createdPreorders,
      error: preorderError,
    } = await supabaseAdmin
      .from("preorders")
      .insert(preorderRows)
      .select();

    if (
      preorderError ||
      !createdPreorders ||
      createdPreorders.length === 0
    ) {
      console.error(
        "[create-preorder-checkout] Erreur création précommandes:",
        preorderError
      );

      return NextResponse.json(
        {
          error: "Impossible de créer la précommande.",
        },
        {
          status: 500,
        }
      );
    }

    /*
     * ============================================================
     * 10. ARTICLES STRIPE
     * ============================================================
     */

    const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] =
      validatedItems.map((item) => ({
        price_data: {
          currency: "eur",

          product_data: {
            name: `${item.product_name} — ${item.color} — Taille ${item.size}`,

            description: "Précommande AJVEK",
          },

          unit_amount: Math.round(item.priceValue * 100),
        },

        quantity: item.quantity,
      }));

    /*
     * ============================================================
     * 11. LIVRAISON STRIPE
     * ============================================================
     */

    const shippingLabel =
      delivery_method === "relay"
        ? "Mondial Relay — Point Relais"
        : "Livraison à domicile";

    /*
     * ============================================================
     * 12. SESSION STRIPE
     * ============================================================
     */

    const sessionParams: Stripe.Checkout.SessionCreateParams = {
      mode: "payment",

      customer_email: user.email,

      payment_method_types: ["card"],

      /*
       * Codes promotionnels Stripe.
       */

      allow_promotion_codes: true,

      line_items: lineItems,

      shipping_options: [
        {
          shipping_rate_data: {
            type: "fixed_amount",

            fixed_amount: {
              amount: shippingAmount,
              currency: "eur",
            },

            display_name:
              shippingAmount === 0
                ? `${shippingLabel} — offerte`
                : shippingLabel,
          },
        },
      ],

      metadata: {
        checkout_group_id: checkoutGroupId,

        user_id: user.id,

        item_count: String(totalQuantity),

        delivery_method,

        service_point_id:
          delivery_method === "relay"
            ? String(service_point?.id ?? "")
            : "",
      },

      success_url:
        "https://ajvek.fr/paiement/succes?session_id={CHECKOUT_SESSION_ID}",

      cancel_url:
        "https://ajvek.fr/paiement/annule",
    };

    /*
     * Pour une livraison à domicile,
     * Stripe demande l'adresse du client.
     *
     * Pour Mondial Relay, le point relais
     * est déjà sélectionné avant Stripe.
     */

    if (delivery_method === "home") {
      sessionParams.shipping_address_collection = {
        allowed_countries: ["FR"],
      };
    }

    /*
     * ============================================================
     * 13. CRÉATION DE LA SESSION STRIPE
     * ============================================================
     */

    const session = await stripe.checkout.sessions.create(
      sessionParams
    );

    if (!session.url) {
      /*
       * Si Stripe ne réussit pas à créer le checkout,
       * on supprime les lignes temporaires que l'on vient de créer.
       */

      await supabaseAdmin
        .from("preorders")
        .delete()
        .eq("checkout_group_id", checkoutGroupId)
        .eq("paid", false);

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

    /*
     * ============================================================
     * 14. SAUVEGARDE DE LA SESSION STRIPE
     * ============================================================
     */

    const { error: updateError } = await supabaseAdmin
      .from("preorders")
      .update({
        stripe_session_id: session.id,
        checkout_url: session.url,
      })
      .eq("checkout_group_id", checkoutGroupId);

    if (updateError) {
      console.error(
        "[create-preorder-checkout] Erreur sauvegarde Stripe:",
        updateError
      );
    }

    /*
     * ============================================================
     * 15. RÉPONSE AU SITE
     * ============================================================
     */

    return NextResponse.json({
      url: session.url,

      itemCount: totalQuantity,

      shippingAmount,

      deliveryMethod: delivery_method,
    });
  } catch (error) {
    console.error(
      "[create-preorder-checkout] Erreur générale:",
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