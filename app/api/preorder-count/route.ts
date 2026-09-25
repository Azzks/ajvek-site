import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

/*
 * ============================================================
 * ANCIEN COMPTEUR DE PRÉCOMMANDES
 * ============================================================
 *
 * Cette route appartenait à l'ancien fonctionnement AJVEK :
 *
 * 10 vêtements payés
 *        ↓
 * lancement de la production
 *
 * Ce fonctionnement n'est plus utilisé.
 *
 * Les commandes suivent maintenant :
 *
 * paid
 *   ↓
 * preparing
 *   ↓
 * shipped
 *   ↓
 * delivered
 *
 * L'opération "10 commandes" est indépendante et utilise :
 *
 * /api/promo-order-count
 *
 * qui compte les COMMANDES PAYÉES distinctes
 * grâce au checkout_group_id.
 * ============================================================
 */

export async function GET() {
  return NextResponse.json(
    {
      ok: false,

      error:
        "Cette ancienne route de compteur de précommandes n'est plus utilisée.",

      replacement:
        "/api/promo-order-count",
    },
    {
      status: 410,

      headers: {
        "Cache-Control":
          "no-store, no-cache, must-revalidate, max-age=0",
      },
    }
  );
}