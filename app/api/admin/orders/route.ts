import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
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

const PRODUCTION_TARGET = 10;

const ALLOWED_STATUSES = [
  "preorder_received",
  "production",
  "manufacturing",
  "shipped",
  "delivered",
] as const;

type OrderStatus = (typeof ALLOWED_STATUSES)[number];

function getAdminEmails() {
  return (process.env.ADMIN_EMAILS || "")
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
}

async function getAdminUser(request: Request) {
  const authorization = request.headers.get("authorization");

  if (!authorization?.startsWith("Bearer ")) {
    return null;
  }

  const token = authorization.replace("Bearer ", "");

  const {
    data: { user },
    error,
  } = await supabaseAuth.auth.getUser(token);

  if (error || !user?.email) {
    return null;
  }

  const adminEmails = getAdminEmails();

  if (!adminEmails.includes(user.email.toLowerCase())) {
    return null;
  }

  return user;
}

/*
 * ============================================================
 * GET — RÉCUPÉRER LES COMMANDES ADMIN
 * ============================================================
 */

export async function GET(request: Request) {
  try {
    const admin = await getAdminUser(request);

    if (!admin) {
      return NextResponse.json(
        { error: "Accès administrateur refusé." },
        { status: 403 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from("preorders")
      .select(
        `
        id,
        created_at,
        user_id,
        name,
        email,
        phone,
        product_slug,
        product_name,
        color,
        size,
        paid,
        paid_at,
        checkout_group_id,
        delivery_method,
        shipping_amount,
        service_point_id,
        service_point_name,
        service_point_address,
        service_point_postal_code,
        service_point_city,
        order_status,
        carrier,
        tracking_number,
        tracking_url,
        shipped_at,
        delivered_at
        `
      )
      .eq("paid", true)
      .order("created_at", {
        ascending: false,
      });

    if (error) {
      console.error("[admin/orders] GET:", error);

      return NextResponse.json(
        {
          error: "Impossible de récupérer les commandes.",
        },
        {
          status: 500,
        }
      );
    }

    /*
     * Chaque vêtement physique payé correspond à une ligne
     * dans la table preorders.
     */
    const paidClothingCount = (data ?? []).length;

    /*
     * Si au moins une commande est déjà passée au-delà du statut
     * preorder_received, on considère que la production a été lancée.
     */
    const productionStarted = (data ?? []).some(
      (row) =>
        row.order_status === "production" ||
        row.order_status === "manufacturing" ||
        row.order_status === "shipped" ||
        row.order_status === "delivered"
    );

    const groupedOrders = new Map<string, any>();

    for (const row of data ?? []) {
      const groupId =
        row.checkout_group_id || `legacy-${row.id}`;

      if (!groupedOrders.has(groupId)) {
        groupedOrders.set(groupId, {
          checkout_group_id: groupId,

          created_at: row.created_at ?? null,

          paid_at: row.paid_at ?? null,

          customer: {
            user_id: row.user_id ?? null,
            name: row.name || "",
            email: row.email || "",
            phone: row.phone ?? null,
          },

          status:
            row.order_status || "preorder_received",

          delivery_method:
            row.delivery_method ?? null,

          shipping_amount: Number(
            row.shipping_amount ?? 0
          ),

          service_point:
            row.delivery_method === "relay"
              ? {
                  id: row.service_point_id ?? null,

                  name:
                    row.service_point_name ?? null,

                  address:
                    row.service_point_address ?? null,

                  postal_code:
                    row.service_point_postal_code ?? null,

                  city:
                    row.service_point_city ?? null,
                }
              : null,

          carrier:
            row.carrier ?? null,

          tracking_number:
            row.tracking_number ?? null,

          tracking_url:
            row.tracking_url ?? null,

          shipped_at:
            row.shipped_at ?? null,

          delivered_at:
            row.delivered_at ?? null,

          items: [],
        });
      }

      const order = groupedOrders.get(groupId);

      const existingItem = order.items.find(
        (item: any) =>
          item.product_slug === row.product_slug &&
          item.color === row.color &&
          item.size === row.size
      );

      if (existingItem) {
        existingItem.quantity += 1;
      } else {
        order.items.push({
          product_slug: row.product_slug,
          product_name: row.product_name,
          color: row.color,
          size: row.size,
          quantity: 1,
        });
      }
    }

    return NextResponse.json(
      {
        orders: Array.from(groupedOrders.values()),

        production: {
          paid_count: paidClothingCount,
          target: PRODUCTION_TARGET,
          ready:
            paidClothingCount >= PRODUCTION_TARGET,
          started: productionStarted,
        },
      },
      {
        headers: {
          "Cache-Control": "no-store, max-age=0",
        },
      }
    );
  } catch (error) {
    console.error(
      "[admin/orders] GET general:",
      error
    );

    return NextResponse.json(
      { error: "Erreur serveur." },
      { status: 500 }
    );
  }
}

/*
 * ============================================================
 * PATCH — MODIFIER UNE COMMANDE
 * ============================================================
 */

export async function PATCH(request: Request) {
  try {
    const admin = await getAdminUser(request);

    if (!admin) {
      return NextResponse.json(
        { error: "Accès administrateur refusé." },
        { status: 403 }
      );
    }

    const body = await request.json();

    const {
      checkout_group_id,
      status,
      carrier,
      tracking_number,
      tracking_url,
    }: {
      checkout_group_id?: string;
      status?: OrderStatus;
      carrier?: string | null;
      tracking_number?: string | null;
      tracking_url?: string | null;
    } = body;

    if (!checkout_group_id) {
      return NextResponse.json(
        { error: "Commande introuvable." },
        { status: 400 }
      );
    }

    if (
      !status ||
      !ALLOWED_STATUSES.includes(status)
    ) {
      return NextResponse.json(
        { error: "Statut invalide." },
        { status: 400 }
      );
    }

    const updates: {
      order_status: OrderStatus;
      carrier?: string | null;
      tracking_number?: string | null;
      tracking_url?: string | null;
      shipped_at?: string | null;
      delivered_at?: string | null;
    } = {
      order_status: status,
    };

    if (carrier !== undefined) {
      updates.carrier =
        carrier?.trim() || null;
    }

    if (tracking_number !== undefined) {
      updates.tracking_number =
        tracking_number?.trim() || null;
    }

    if (tracking_url !== undefined) {
      updates.tracking_url =
        tracking_url?.trim() || null;
    }

    if (status === "shipped") {
      updates.shipped_at =
        new Date().toISOString();

      updates.delivered_at = null;
    }

    if (status === "delivered") {
      updates.delivered_at =
        new Date().toISOString();
    }

    const { error } = await supabaseAdmin
      .from("preorders")
      .update(updates)
      .eq(
        "checkout_group_id",
        checkout_group_id
      )
      .eq("paid", true);

    if (error) {
      console.error(
        "[admin/orders] PATCH:",
        error
      );

      return NextResponse.json(
        {
          error:
            "Impossible de modifier la commande.",
        },
        {
          status: 500,
        }
      );
    }

    return NextResponse.json({
      success: true,
      checkout_group_id,
      status,
    });
  } catch (error) {
    console.error(
      "[admin/orders] PATCH general:",
      error
    );

    return NextResponse.json(
      { error: "Erreur serveur." },
      { status: 500 }
    );
  }
}

/*
 * ============================================================
 * PUT — LANCER LA PRODUCTION
 * ============================================================
 */

export async function PUT(request: Request) {
  try {
    const admin = await getAdminUser(request);

    if (!admin) {
      return NextResponse.json(
        { error: "Accès administrateur refusé." },
        { status: 403 }
      );
    }

    /*
     * ==========================================================
     * 1. COMPTER LES VÊTEMENTS PAYÉS
     * ==========================================================
     */

    const {
      count,
      error: countError,
    } = await supabaseAdmin
      .from("preorders")
      .select("id", {
        count: "exact",
        head: true,
      })
      .eq("paid", true);

    if (countError) {
      console.error(
        "[admin/orders] Compteur production:",
        countError
      );

      return NextResponse.json(
        {
          error:
            "Impossible de vérifier le nombre de précommandes.",
        },
        {
          status: 500,
        }
      );
    }

    const paidCount = count ?? 0;

    /*
     * ==========================================================
     * 2. VÉRIFIER LE SEUIL
     * ==========================================================
     */

    if (paidCount < PRODUCTION_TARGET) {
      return NextResponse.json(
        {
          error: `La production ne peut pas encore être lancée. ${paidCount}/${PRODUCTION_TARGET} vêtements payés.`,
        },
        {
          status: 400,
        }
      );
    }

    /*
     * ==========================================================
     * 3. PASSER LES COMMANDES EN PRODUCTION
     * ==========================================================
     *
     * Seulement les commandes payées encore en
     * "preorder_received".
     *
     * Une commande déjà en fabrication, expédiée ou livrée
     * n'est jamais rétrogradée.
     */

    const {
      data: updatedOrders,
      error: updateError,
    } = await supabaseAdmin
      .from("preorders")
      .update({
        order_status: "production",
      })
      .eq("paid", true)
      .eq(
        "order_status",
        "preorder_received"
      )
      .select("id");

    if (updateError) {
      console.error(
        "[admin/orders] Lancement production:",
        updateError
      );

      return NextResponse.json(
        {
          error:
            "Impossible de lancer la production.",
        },
        {
          status: 500,
        }
      );
    }

    return NextResponse.json({
      success: true,
      paid_count: paidCount,
      target: PRODUCTION_TARGET,
      updated_count:
        updatedOrders?.length ?? 0,
    });
  } catch (error) {
    console.error(
      "[admin/orders] PUT general:",
      error
    );

    return NextResponse.json(
      { error: "Erreur serveur." },
      { status: 500 }
    );
  }
}