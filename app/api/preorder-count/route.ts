import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const { count, error } = await supabaseAdmin
      .from("preorders")
      .select("id", {
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
          count: 0,
          error: "Impossible de récupérer le compteur.",
        },
        {
          status: 500,
          headers: {
            "Cache-Control": "no-store",
          },
        }
      );
    }

    return NextResponse.json(
      {
        count: count ?? 0,
      },
      {
        headers: {
          "Cache-Control": "no-store",
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
        count: 0,
        error: "Erreur serveur.",
      },
      {
        status: 500,
        headers: {
          "Cache-Control": "no-store",
        },
      }
    );
  }
}