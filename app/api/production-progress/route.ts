import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const PRODUCTION_GOAL = 10;

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET() {
  try {
    /*
     * On récupère uniquement les précommandes payées.
     *
     * Une commande peut contenir plusieurs vêtements et donc
     * plusieurs lignes dans la table "preorders".
     *
     * On compte donc les checkout_group_id uniques :
     *
     * 1 paiement / 1 commande = 1 progression vers les 10.
     */

    const { data, error } = await supabaseAdmin
      .from("preorders")
      .select("checkout_group_id")
      .eq("paid", true)
      .not("checkout_group_id", "is", null);

    if (error) {
      console.error("[production-progress]", error);

      return NextResponse.json(
        {
          error: "Impossible de récupérer la progression.",
        },
        {
          status: 500,
        }
      );
    }

    const uniqueOrders = new Set(
      (data ?? [])
        .map((row) => row.checkout_group_id)
        .filter(Boolean)
    );

    const count = uniqueOrders.size;

    return NextResponse.json(
      {
        count,
        goal: PRODUCTION_GOAL,
        remaining: Math.max(PRODUCTION_GOAL - count, 0),
        reached: count >= PRODUCTION_GOAL,
      },
      {
        headers: {
          "Cache-Control": "no-store",
        },
      }
    );
  } catch (error) {
    console.error("[production-progress]", error);

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