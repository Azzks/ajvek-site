import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const PREORDER_GOAL = 10;

export async function GET() {
  try {
    /*
     * ============================================================
     * COMPTEUR DE PRODUCTION AJVEK
     * ============================================================
     *
     * Dans la table "preorders", chaque ligne correspond à
     * 1 vêtement physique.
     *
     * On compte donc uniquement le nombre de lignes payées.
     *
     * Exemple :
     *
     * Client A commande 1 tee-shirt = 1
     * Client B commande 3 tee-shirts = 3
     *
     * Total affiché = 4 / 10
     *
     * La production est lancée lorsque 10 vêtements
     * précommandés ET payés sont atteints.
     */

    const {
      count,
      error,
    } = await supabaseAdmin
      .from("preorders")
      .select("*", {
        count: "exact",
        head: true,
      })
      .eq("paid", true);

    if (error) {
      console.error(
        "[preorder-count] Erreur Supabase :",
        error
      );

      return NextResponse.json(
        {
          error:
            "Impossible de récupérer le nombre de vêtements précommandés.",
        },
        {
          status: 500,
        }
      );
    }

    const paidClothingCount = count ?? 0;

    return NextResponse.json(
      {
        count: paidClothingCount,

        goal: PREORDER_GOAL,

        remaining: Math.max(
          PREORDER_GOAL - paidClothingCount,
          0
        ),

        reached:
          paidClothingCount >= PREORDER_GOAL,
      },
      {
        headers: {
          "Cache-Control":
            "no-store, no-cache, must-revalidate, max-age=0",
        },
      }
    );
  } catch (error) {
    console.error(
      "[preorder-count] Erreur générale :",
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