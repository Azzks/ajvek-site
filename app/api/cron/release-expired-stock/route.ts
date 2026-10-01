import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";
export const revalidate = 0;

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

export async function GET(request: Request) {
  try {
    const authorization =
      request.headers.get("authorization");

    const cronSecret =
      process.env.CRON_SECRET;

    if (!cronSecret) {
      console.error(
        "[release-expired-stock] CRON_SECRET manquant."
      );

      return NextResponse.json(
        {
          error: "Configuration serveur invalide.",
        },
        {
          status: 500,
        }
      );
    }

    if (
      authorization !==
      `Bearer ${cronSecret}`
    ) {
      return NextResponse.json(
        {
          error: "Non autorisé.",
        },
        {
          status: 401,
        }
      );
    }

    const { data, error } =
      await supabaseAdmin.rpc(
        "release_expired_stock_reservations"
      );

    if (error) {
      console.error(
        "[release-expired-stock] Erreur Supabase :",
        error
      );

      return NextResponse.json(
        {
          error:
            "Impossible de libérer les réservations expirées.",
        },
        {
          status: 500,
        }
      );
    }

    return NextResponse.json(
      {
        success: true,
        result: data,
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
      "[release-expired-stock] Erreur générale :",
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