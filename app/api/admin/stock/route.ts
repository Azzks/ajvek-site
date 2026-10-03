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

/* ============================================================
   ADMIN
   ============================================================ */

function getAdminEmails() {
  return (process.env.ADMIN_EMAILS || "")
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
}

async function getAdminUser(request: Request) {
  const authorization =
    request.headers.get("authorization");

  if (!authorization?.startsWith("Bearer ")) {
    return null;
  }

  const token = authorization.replace(
    "Bearer ",
    ""
  );

  const {
    data: { user },
    error,
  } = await supabaseAuth.auth.getUser(token);

  if (error || !user?.email) {
    return null;
  }

  const adminEmails = getAdminEmails();

  if (
    !adminEmails.includes(
      user.email.toLowerCase()
    )
  ) {
    return null;
  }

  return user;
}

/* ============================================================
   GET — STOCK
   ============================================================ */

export async function GET(request: Request) {
  try {
    const admin = await getAdminUser(request);

    if (!admin) {
      return NextResponse.json(
        {
          error:
            "Accès administrateur refusé.",
        },
        {
          status: 403,
        }
      );
    }

    const { data, error } =
      await supabaseAdmin
        .from("product_stock")
        .select(`
          product_slug,
          color,
          size,
          stock_quantity,
          sales_enabled
        `)
        .order("product_slug", {
          ascending: true,
        })
        .order("color", {
          ascending: true,
        })
        .order("size", {
          ascending: true,
        });

    if (error) {
      console.error(
        "[admin/stock] GET :",
        error
      );

      return NextResponse.json(
        {
          error:
            "Impossible de récupérer le stock.",
        },
        {
          status: 500,
        }
      );
    }

    return NextResponse.json(
      {
        stock: data ?? [],
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
      "[admin/stock] GET general :",
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

/* ============================================================
   PATCH — STOCK + OUVERTURE / FERMETURE DES VENTES
   ============================================================ */

export async function PATCH(request: Request) {
  try {
    const admin = await getAdminUser(request);

    if (!admin) {
      return NextResponse.json(
        {
          error:
            "Accès administrateur refusé.",
        },
        {
          status: 403,
        }
      );
    }

    let body: {
      product_slug?: string;
      color?: string;
      size?: string;
      adjustment?: number;

      action?: string;
      sales_enabled?: boolean;
    };

    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        {
          error: "Données invalides.",
        },
        {
          status: 400,
        }
      );
    }

    /* ==========================================================
       OUVERTURE / FERMETURE GLOBALE DES VENTES
       ========================================================== */

    if (body.action === "set_sales_enabled") {
      if (
        typeof body.sales_enabled !== "boolean"
      ) {
        return NextResponse.json(
          {
            error:
              "État des ventes invalide.",
          },
          {
            status: 400,
          }
        );
      }

      const nextSalesEnabled =
        body.sales_enabled;

      /*
       * On limite volontairement l'action
       * aux produits du Drop 001.
       *
       * Aucun stock_quantity n'est modifié.
       */
      const {
        data: updatedRows,
        error: updateSalesError,
      } = await supabaseAdmin
        .from("product_stock")
        .update({
          sales_enabled:
            nextSalesEnabled,
        })
        .in("product_slug", [
          "roses",
          "sakura",
        ])
        .select(`
          product_slug,
          color,
          size,
          stock_quantity,
          sales_enabled
        `);

      if (updateSalesError) {
        console.error(
          "[admin/stock] SALES :",
          updateSalesError
        );

        return NextResponse.json(
          {
            error:
              "Impossible de modifier l'état des ventes.",
          },
          {
            status: 500,
          }
        );
      }

      if (
        !updatedRows ||
        updatedRows.length === 0
      ) {
        return NextResponse.json(
          {
            error:
              "Aucune variante du Drop 001 n'a été trouvée.",
          },
          {
            status: 404,
          }
        );
      }

      return NextResponse.json(
        {
          success: true,
          sales_enabled:
            nextSalesEnabled,
          updated_count:
            updatedRows.length,
          stock: updatedRows,
        },
        {
          headers: {
            "Cache-Control":
              "no-store, max-age=0",
          },
        }
      );
    }

    /* ==========================================================
       AJUSTEMENT MANUEL DU STOCK
       ========================================================== */

    const productSlug =
      body.product_slug?.trim();

    const color = body.color?.trim();
    const size = body.size?.trim();
    const adjustment = body.adjustment;

    if (
      !productSlug ||
      !color ||
      !size ||
      (adjustment !== 1 &&
        adjustment !== -1)
    ) {
      return NextResponse.json(
        {
          error:
            "Ajustement de stock invalide.",
        },
        {
          status: 400,
        }
      );
    }

    /*
     * On lit d'abord la ligne pour vérifier
     * qu'elle existe et connaître son stock.
     */
    const {
      data: stockRow,
      error: stockError,
    } = await supabaseAdmin
      .from("product_stock")
      .select(`
        product_slug,
        color,
        size,
        stock_quantity,
        sales_enabled
      `)
      .eq("product_slug", productSlug)
      .eq("color", color)
      .eq("size", size)
      .maybeSingle();

    if (stockError) {
      console.error(
        "[admin/stock] Vérification :",
        stockError
      );

      return NextResponse.json(
        {
          error:
            "Impossible de vérifier le stock.",
        },
        {
          status: 500,
        }
      );
    }

    if (!stockRow) {
      return NextResponse.json(
        {
          error:
            "Variante introuvable.",
        },
        {
          status: 404,
        }
      );
    }

    const currentStock = Math.max(
      Number(
        stockRow.stock_quantity ?? 0
      ),
      0
    );

    const nextStock =
      currentStock + adjustment;

    if (nextStock < 0) {
      return NextResponse.json(
        {
          error:
            "Le stock est déjà à 0.",
        },
        {
          status: 409,
        }
      );
    }

    /*
     * Mise à jour conditionnelle :
     * on exige que le stock soit toujours égal
     * à celui qu'on vient de lire.
     *
     * Cela évite d'écraser une modification
     * intervenue entre-temps.
     */
    const {
      data: updatedRow,
      error: updateError,
    } = await supabaseAdmin
      .from("product_stock")
      .update({
        stock_quantity: nextStock,
      })
      .eq(
        "product_slug",
        productSlug
      )
      .eq("color", color)
      .eq("size", size)
      .eq(
        "stock_quantity",
        currentStock
      )
      .select(`
        product_slug,
        color,
        size,
        stock_quantity,
        sales_enabled
      `)
      .maybeSingle();

    if (updateError) {
      console.error(
        "[admin/stock] PATCH :",
        updateError
      );

      return NextResponse.json(
        {
          error:
            "Impossible de modifier le stock.",
        },
        {
          status: 500,
        }
      );
    }

    if (!updatedRow) {
      return NextResponse.json(
        {
          error:
            "Le stock a changé entre-temps. Actualise puis réessaie.",
        },
        {
          status: 409,
        }
      );
    }

    return NextResponse.json(
      {
        success: true,
        stock: updatedRow,
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
      "[admin/stock] PATCH general :",
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