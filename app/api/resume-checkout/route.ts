import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import Stripe from "stripe";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const stripe = new Stripe(
  process.env.STRIPE_SECRET_KEY!
);

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

export async function GET(request: Request) {
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
            "Connexion requise.",
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
      !user
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
    // 2. RECHERCHER LES CHECKOUTS NON PAYÉS DE L'UTILISATEUR
    // ========================================================

    const {
      data: orders,
      error: ordersError,
    } = await supabaseAdmin
      .from("preorders")
      .select(`
        checkout_group_id,
        stripe_session_id,
        checkout_url,
        paid,
        order_status,
        created_at
      `)
      .eq("user_id", user.id)
      .eq("paid", false)
      .not("stripe_session_id", "is", null)
      .not("checkout_url", "is", null)
      .order("created_at", {
        ascending: false,
      })
      .limit(20);

    if (ordersError) {
      console.error(
        "[resume-checkout] Erreur lecture commandes :",
        ordersError
      );

      return NextResponse.json(
        {
          error:
            "Impossible de vérifier le paiement.",
        },
        {
          status: 500,
        }
      );
    }

    // Plusieurs lignes peuvent appartenir à la même commande.
    const uniqueSessions = new Map<
      string,
      {
        checkoutGroupId: string;
        stripeSessionId: string;
        checkoutUrl: string;
      }
    >();

    for (const order of orders ?? []) {
      const checkoutGroupId =
        String(
          order.checkout_group_id ?? ""
        ).trim();

      const stripeSessionId =
        String(
          order.stripe_session_id ?? ""
        ).trim();

      const checkoutUrl =
        String(
          order.checkout_url ?? ""
        ).trim();

      if (
        !checkoutGroupId ||
        !stripeSessionId ||
        !checkoutUrl
      ) {
        continue;
      }

      if (
        !uniqueSessions.has(
          checkoutGroupId
        )
      ) {
        uniqueSessions.set(
          checkoutGroupId,
          {
            checkoutGroupId,
            stripeSessionId,
            checkoutUrl,
          }
        );
      }
    }

    // ========================================================
    // 3. VERIFICATION AUPRES DE STRIPE
    // ========================================================

    for (
      const candidate of uniqueSessions.values()
    ) {
      let session: Stripe.Checkout.Session;

      try {
        session =
          await stripe.checkout.sessions.retrieve(
            candidate.stripeSessionId
          );
      } catch (error) {
        console.error(
          "[resume-checkout] Session Stripe impossible à lire :",
          {
            checkoutGroupId:
              candidate.checkoutGroupId,
            stripeSessionId:
              candidate.stripeSessionId,
            error,
          }
        );

        continue;
      }

      // La session doit appartenir à la même commande.
      if (
        session.metadata
          ?.checkout_group_id !==
        candidate.checkoutGroupId
      ) {
        console.error(
          "[resume-checkout] Métadonnées Stripe incohérentes :",
          {
            checkoutGroupId:
              candidate.checkoutGroupId,
            stripeSessionId:
              candidate.stripeSessionId,
          }
        );

        continue;
      }

      // Elle doit également appartenir à l'utilisateur connecté.
      if (
        session.metadata?.user_id !==
        user.id
      ) {
        console.error(
          "[resume-checkout] Utilisateur Stripe incohérent :",
          {
            checkoutGroupId:
              candidate.checkoutGroupId,
            stripeSessionId:
              candidate.stripeSessionId,
          }
        );

        continue;
      }

      // Une session n'est reprenable que si Stripe la considère
      // toujours ouverte et qu'aucun paiement n'a été effectué.
      if (
        session.status !== "open" ||
        session.payment_status === "paid"
      ) {
        continue;
      }

      if (!session.url) {
        continue;
      }

      return NextResponse.json(
        {
          resumable: true,
          url: session.url,
          checkoutGroupId:
            candidate.checkoutGroupId,
        },
        {
          headers: {
            "Cache-Control":
              "no-store, max-age=0",
          },
        }
      );
    }

    // ========================================================
    // 4. AUCUN PAIEMENT À REPRENDRE
    // ========================================================

    return NextResponse.json(
      {
        resumable: false,
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
      "[resume-checkout] Erreur générale :",
      error
    );

    return NextResponse.json(
      {
        error:
          "Impossible de vérifier le paiement.",
      },
      {
        status: 500,
      }
    );
  }
}