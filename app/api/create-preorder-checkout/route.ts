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

export async function POST(request: Request) {
  try {
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

    const body = await request.json();

    const {
      name,
      phone,
      product_slug,
      product_name,
      color,
      size,
    } = body;

    if (
      !name ||
      !product_slug ||
      !product_name ||
      !color ||
      !size
    ) {
      return NextResponse.json(
        { error: "Informations de précommande incomplètes." },
        { status: 400 }
      );
    }

    const product = getProduct(product_slug);

    if (!product) {
      return NextResponse.json(
        { error: "Produit introuvable." },
        { status: 404 }
      );
    }

    const { data: preorder, error: preorderError } =
      await supabaseAdmin
        .from("preorders")
        .insert({
          user_id: user.id,
          name: name.trim(),
          email: user.email,
          phone: phone?.trim() || null,
          product_slug,
          product_name,
          color,
          size,
          paid: false,
        })
        .select()
        .single();

    if (preorderError || !preorder) {
      console.error(
        "[create-preorder-checkout] Erreur création précommande:",
        preorderError
      );

      return NextResponse.json(
        { error: "Impossible de créer la précommande." },
        { status: 500 }
      );
    }

    const session = await stripe.checkout.sessions.create({
      mode: "payment",

      customer_email: user.email,

      payment_method_types: ["card"],

      line_items: [
        {
          price_data: {
            currency: "eur",
            product_data: {
              name: `${product.name} — ${color} — Taille ${size}`,
              description: "Précommande AJVEK",
            },
            unit_amount: Math.round(product.priceValue * 100),
          },
          quantity: 1,
        },
      ],

      metadata: {
        preorder_id: String(preorder.id),
        user_id: user.id,
        product_slug,
        color,
        size,
      },

      success_url:
        "https://ajvek.fr/paiement/succes?session_id={CHECKOUT_SESSION_ID}",

      cancel_url:
        `https://ajvek.fr/produit/${product_slug}`,
    });

    if (!session.url) {
      return NextResponse.json(
        { error: "Stripe n'a pas retourné de lien de paiement." },
        { status: 500 }
      );
    }

    const { error: updateError } = await supabaseAdmin
      .from("preorders")
      .update({
        stripe_session_id: session.id,
        checkout_url: session.url,
      })
      .eq("id", preorder.id);

    if (updateError) {
      console.error(
        "[create-preorder-checkout] Erreur sauvegarde Stripe:",
        updateError
      );
    }

    return NextResponse.json({
      url: session.url,
      preorderId: preorder.id,
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