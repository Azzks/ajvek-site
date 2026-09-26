import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import Stripe from "stripe";

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

export async function POST(request: Request) {
  try {
    /*
     * ============================================================
     * UTILISATEUR CONNECTÉ
     * ============================================================
     */

    const authorization = request.headers.get("authorization");

    if (!authorization?.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "Authentification requise." },
        { status: 401 }
      );
    }

    const accessToken = authorization.slice("Bearer ".length).trim();

    const {
      data: { user },
      error: userError,
    } = await supabaseAuth.auth.getUser(accessToken);

    if (userError || !user) {
      return NextResponse.json(
        { error: "Session utilisateur invalide." },
        { status: 401 }
      );
    }

    /*
     * ============================================================
     * SESSION STRIPE
     * ============================================================
     */

    const body = await request.json().catch(() => null);
    const sessionId =
      typeof body?.session_id === "string" ? body.session_id.trim() : "";

    if (!sessionId || !sessionId.startsWith("cs_")) {
      return NextResponse.json(
        { error: "Session Stripe invalide." },
        { status: 400 }
      );
    }

    let stripeSession: Stripe.Checkout.Session;

    try {
      stripeSession = await stripe.checkout.sessions.retrieve(sessionId);
    } catch (error) {
      console.error(
        "[verify-checkout-session] Session Stripe introuvable :",
        error
      );

      return NextResponse.json(
        { error: "Session Stripe introuvable." },
        { status: 404 }
      );
    }

    /*
     * ============================================================
     * PROPRIÉTÉ DE LA SESSION
     * ============================================================
     */

    const checkoutGroupId =
      stripeSession.metadata?.checkout_group_id ?? null;

    const stripeUserId = stripeSession.metadata?.user_id ?? null;

    if (!checkoutGroupId || !stripeUserId) {
      return NextResponse.json(
        { error: "Métadonnées de commande invalides." },
        { status: 400 }
      );
    }

    if (stripeUserId !== user.id) {
      return NextResponse.json(
        { error: "Cette commande ne t'appartient pas." },
        { status: 403 }
      );
    }

    /*
     * ============================================================
     * COMMANDE SUPABASE
     * ============================================================
     */

    const { data: orders, error: orderError } = await supabaseAdmin
      .from("preorders")
      .select(
        "checkout_group_id,user_id,paid,order_status,stripe_session_id"
      )
      .eq("checkout_group_id", checkoutGroupId)
      .eq("user_id", user.id);

    if (orderError) {
      console.error(
        "[verify-checkout-session] Erreur lecture commande :",
        orderError
      );

      return NextResponse.json(
        { error: "Impossible de vérifier la commande." },
        { status: 500 }
      );
    }

    if (!orders || orders.length === 0) {
      return NextResponse.json(
        { error: "Commande introuvable." },
        { status: 404 }
      );
    }

    /*
     * La session enregistrée lors de la création du Checkout doit
     * correspondre exactement à celle présente dans l'URL.
     */

    const sessionMatches = orders.every(
      (order) => order.stripe_session_id === sessionId
    );

    if (!sessionMatches) {
      return NextResponse.json(
        { error: "La session ne correspond pas à cette commande." },
        { status: 403 }
      );
    }

    /*
     * ============================================================
     * ÉTAT DU PAIEMENT
     * ============================================================
     *
     * Stripe confirme le paiement.
     * Supabase confirme que le webhook a finalisé la commande.
     *
     * Les deux doivent être vrais avant d'afficher au client
     * "Commande confirmée".
     */

    const stripePaid = stripeSession.payment_status === "paid";

    const orderFinalized = orders.every(
      (order) =>
        order.paid === true &&
        order.order_status === "paid"
    );

    if (stripePaid && orderFinalized) {
      return NextResponse.json({
        status: "paid",
        checkoutGroupId,
      });
    }

    /*
     * Stripe peut rediriger le navigateur quelques instants avant
     * que le webhook ait terminé la transaction Supabase.
     *
     * Dans ce cas on ne dit ni "échec" ni "commande confirmée".
     */

    if (stripePaid && !orderFinalized) {
      return NextResponse.json({
        status: "processing",
        checkoutGroupId,
      });
    }

    return NextResponse.json({
      status: "unpaid",
      checkoutGroupId,
    });
  } catch (error) {
    console.error(
      "[verify-checkout-session] Erreur générale :",
      error
    );

    return NextResponse.json(
      { error: "Erreur serveur." },
      { status: 500 }
    );
  }
}