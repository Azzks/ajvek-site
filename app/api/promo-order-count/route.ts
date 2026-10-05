import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const PROMO_GOAL = 10;

export async function GET() {
  try {
    const supabaseUrl =
      process.env.NEXT_PUBLIC_SUPABASE_URL;

    const serviceRoleKey =
      process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceRoleKey) {
      return NextResponse.json(
        {
          error: "Configuration Supabase manquante.",
        },
        {
          status: 500,
        }
      );
    }

    const supabase = createClient(
      supabaseUrl,
      serviceRoleKey,
      {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
        },
      }
    );

    /*
     * ============================================================
     * 1. COMMANDES RÉELLES PAYÉES
     * ============================================================
     *
     * Une commande peut contenir plusieurs vêtements.
     * Toutes les lignes d'une même commande partagent
     * le même checkout_group_id.
     *
     * On compte donc uniquement les commandes uniques.
     */

    const {
      data: paidOrders,
      error: paidOrdersError,
    } = await supabase
      .from("preorders")
      .select("checkout_group_id")
      .eq("paid", true)
      .not("checkout_group_id", "is", null);

    if (paidOrdersError) {
      console.error(
        "[promo-order-count/orders]",
        paidOrdersError
      );

      return NextResponse.json(
        {
          error:
            "Impossible de récupérer les commandes.",
        },
        {
          status: 500,
        }
      );
    }

    const uniqueOrders = new Set(
      (paidOrders ?? [])
        .map(
          (row) =>
            row.checkout_group_id
        )
        .filter(Boolean)
    );

    const realOrderCount =
      uniqueOrders.size;

    /*
     * ============================================================
     * 2. AJUSTEMENT MANUEL ADMIN
     * ============================================================
     *
     * Même valeur que celle utilisée dans l'admin.
     *
     * Exemple :
     * 0 commandes Stripe + manual_orders 1
     * = 1 commande affichée
     * = Private Draw 1 / 10.
     */

    const {
      data: manualCounters,
      error: manualCountersError,
    } = await supabase
      .from("admin_manual_counters")
      .select("manual_orders")
      .eq("id", 1)
      .maybeSingle();

    if (manualCountersError) {
      console.error(
        "[promo-order-count/manual]",
        manualCountersError
      );

      return NextResponse.json(
        {
          error:
            "Impossible de récupérer les ajustements manuels.",
        },
        {
          status: 500,
        }
      );
    }

    const manualOrderCount =
      Math.max(
        Number(
          manualCounters?.manual_orders ??
            0
        ),
        0
      );

    /*
     * ============================================================
     * 3. TOTAL PRIVATE DRAW
     * ============================================================
     */

    const count =
      realOrderCount +
      manualOrderCount;

    return NextResponse.json(
      {
        count,
        goal: PROMO_GOAL,
        reached:
          count >= PROMO_GOAL,
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
      "[promo-order-count]",
      error
    );

    return NextResponse.json(
      {
        error:
          "Erreur lors du calcul des commandes.",
      },
      {
        status: 500,
      }
    );
  }
}