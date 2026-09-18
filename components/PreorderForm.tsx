import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import Stripe from "stripe";
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

export async function POST(request: Request) {
  try {
    /*
     * 1. Vérification du compte Supabase connecté
     */
    const authorization = request.headers.get("authorization");

    if (!authorization?.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "Connexion requise." },
        { status: 401 }
      );
    }

    const accessToken = authorization.replace("Bearer ", "");

    const {
      data: { user },
      error: userError,
    } = await supabaseAuth.auth.getUser(accessToken);

    if (userError || !user || !user.email) {
      return NextResponse.json(
        { error: "Session utilisateur invalide ou expirée." },
        { status: 401 }
      );
    }

    /*
     * 2. Lecture du panier
     */
    const body = await request.json();

    const {
      name,
      phone,
      items,
    }: {
      name: string;
      phone?: string;
      items: CheckoutItem[];
    } = body;

    if (!name?.trim()) {
      return NextResponse.json(
        { error: "Ton nom est requis." },
        { status: 400 }
      );
    }

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: "Ta précommande est vide." },
        { status: 400 }
      );
    }

    /*
     * 3. Validation des produits et calcul serveur
     *
     * Le prix envoyé par le navigateur n'est jamais utilisé.
     * Le vrai prix vient uniquement de lib/products.
     */
    const validatedItems: Array<{
      product_slug: string;
      product_name: string;
      color: string;
      size: string;
      quantity: number;
      priceValue: number;
    }> = [];

    let totalQuantity = 0;

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
          { error: "Un article de la précommande est invalide." },
          { status: 400 }
        );
      }

      const product = getProduct(item.product_slug);

      if (!product) {
        return NextResponse.json(
          { error: `Produit introuvable : ${item.product_slug}` },
          { status: 404 }
        );
      }

      validatedItems.push({
        product_slug: product.slug,
        product_name: product.name,
        color: item.color,
        size: item.size,
        quantity,
        priceValue: product.priceValue,
      });

      totalQuantity += quantity;
    }

    if (totalQuantity > 20) {
      return NextResponse.json(
        {
          error:
            "La quantité maximale autorisée pour une précommande est de 20 vêtements.",
        },
        { status: 400 }
      );
    }

    /*
     * 4. Création des lignes Supabase
     *
     * Une ligne = un vêtement.
     *
     * Donc :
     * - une commande de 1 vêtement = 1 précommande
     * - une commande de 3 vêtements = 3 précommandes
     *
     * Le compteur /10 reste donc correct.
     */
    const preorderRows = validatedItems.flatMap((item) =>
      Array.from({ length: item.quantity }, () => ({
        user_id: user.id,
        name: name.trim(),
        email: user.email!,
        phone: phone?.trim() || null,
        product_slug: item.product_slug,
        product_name: item.product_name,
        color: item.color,
        size: item.size,
        paid: false,
      }))
    );

    const { data: createdPreorders, error: preorderError } =
      await supabaseAdmin
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
        { error: "Impossible de créer la précommande." },
        { status: 500 }
      );
    }

    /*
     * 5. Frais de livraison
     *
     * France uniquement :
     * 1 vêtement  = 7,90 €
     * 2 vêtements = 9,90 €
     * 3+ vêtements = offerts
     */
    let shippingAmount = 0;
    let shippingName = "Livraison offerte";

    if (totalQuantity === 1) {
      shippingAmount = 790;
      shippingName = "Livraison France";
    } else if (totalQuantity === 2) {
      shippingAmount = 990;
      shippingName = "Livraison France";
    }

    /*
     * 6. Création des articles Stripe
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

    const preorderIds = createdPreorders.map((p) => String(p.id));

    /*
     * 7. Création du Checkout Stripe
     */
    const session = await stripe.checkout.sessions.create({
      mode: "payment",

      customer_email: user.email,

      payment_method_types: ["card"],

      line_items: lineItems,

      /*
       * Adresse obligatoire et France uniquement.
       */
      shipping_address_collection: {
        allowed_countries: ["FR"],
      },

      /*
       * Stripe ajoute automatiquement les frais de livraison
       * au montant final.
       */
      shipping_options: [
        {
          shipping_rate_data: {
            type: "fixed_amount",
            fixed_amount: {
              amount: shippingAmount,
              currency: "eur",
            },
            display_name: shippingName,
          },
        },
      ],

      metadata: {
        preorder_ids: preorderIds.join(","),
        user_id: user.id,
        item_count: String(totalQuantity),
      },

      success_url:
        "https://ajvek.fr/paiement/succes?session_id={CHECKOUT_SESSION_ID}",

      cancel_url:
        "https://ajvek.fr/precommande",
    });

    if (!session.url) {
      return NextResponse.json(
        {
          error:
            "Stripe n'a pas retourné de lien de paiement.",
        },
        { status: 500 }
      );
    }

    /*
     * 8. On rattache toutes les précommandes
     * à la même session Stripe.
     */
    const { error: updateError } = await supabaseAdmin
      .from("preorders")
      .update({
        stripe_session_id: session.id,
        checkout_url: session.url,
      })
      .in("id", preorderIds);

    if (updateError) {
      console.error(
        "[create-preorder-checkout] Erreur sauvegarde session Stripe:",
        updateError
      );
    }

    return NextResponse.json({
      url: session.url,
      itemCount: totalQuantity,
    });
  } catch (error) {
    console.error(
      "[create-preorder-checkout] Erreur générale:",
      error
    );

    return NextResponse.json(
      { error: "Erreur serveur." },
      { status: 500 }
    );
  }
}