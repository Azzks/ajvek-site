import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";
export const revalidate = 0;

function getSupabaseAdmin() {
  const supabaseUrl =
    process.env.NEXT_PUBLIC_SUPABASE_URL;

  const serviceRoleKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error(
      "Configuration Supabase manquante."
    );
  }

  return createClient(
    supabaseUrl,
    serviceRoleKey,
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    }
  );
}

export async function GET() {
  try {
    const supabaseAdmin =
      getSupabaseAdmin();

    const { data, error } =
      await supabaseAdmin
        .from("product_stock")
        .select(
          `
          product_slug,
          color,
          size,
          stock_quantity,
          sales_enabled
          `
        )
        .order("product_slug")
        .order("color")
        .order("size");

    if (error) {
      console.error(
        "[stock] Erreur Supabase :",
        error
      );

      return NextResponse.json(
        {
          error:
            "Impossible de récupérer le stock.",
        },
        {
          status: 500,
          headers: {
            "Cache-Control":
              "no-store, max-age=0",
          },
        }
      );
    }

    const stock = (data ?? []).map(
      (item) => ({
        product_slug:
          item.product_slug,

        color:
          item.color,

        size:
          item.size,

        stock_quantity: Math.max(
          Number(
            item.stock_quantity ?? 0
          ),
          0
        ),

        sales_enabled:
          item.sales_enabled === true,

        available:
          item.sales_enabled === true &&
          Number(
            item.stock_quantity ?? 0
          ) > 0,
      })
    );

    return NextResponse.json(
      {
        stock,
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
      "[stock] Erreur générale :",
      error
    );

    return NextResponse.json(
      {
        error: "Erreur serveur.",
      },
      {
        status: 500,
        headers: {
          "Cache-Control":
            "no-store, max-age=0",
        },
      }
    );
  }
}