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

    const { data, error } = await supabase
      .from("preorders")
      .select("checkout_group_id")
      .eq("paid", true)
      .not("checkout_group_id", "is", null);

    if (error) {
      console.error(
        "[promo-order-count]",
        error
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

    /*
     * Une commande peut contenir plusieurs vêtements.
     * Toutes les lignes d'une même commande partagent
     * le même checkout_group_id.
     *
     * On compte donc uniquement les groupes uniques.
     */
    const uniqueOrders = new Set(
      (data ?? [])
        .map(
          (row) =>
            row.checkout_group_id
        )
        .filter(Boolean)
    );

    const count = uniqueOrders.size;

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