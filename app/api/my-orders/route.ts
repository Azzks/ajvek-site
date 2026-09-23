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

export async function GET(request: Request) {
  try {
    const authorization = request.headers.get("authorization");

    if (!authorization?.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "Connexion requise." },
        { status: 401 }
      );
    }

    const accessToken = authorization.replace("Bearer ", "");

    const {
      data: { user },
      error: userError,
    } = await supabaseAuth.auth.getUser(accessToken);

    if (userError || !user) {
      return NextResponse.json(
        { error: "Session invalide ou expirée." },
        { status: 401 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from("preorders")
      .select(
        `
        id,
        created_at,
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
      .eq("user_id", user.id)
      .eq("paid", true)
      .order("created_at", {
        ascending: false,
      });

    if (error) {
      console.error("[my-orders] Supabase error:", error);

      return NextResponse.json(
        { error: "Impossible de récupérer les commandes." },
        { status: 500 }
      );
    }

    const groupedOrders = new Map<
      string,
      {
        checkout_group_id: string;
        created_at: string | null;
        paid_at: string | null;
        status: string;
        delivery_method: string | null;
        shipping_amount: number;
        service_point: {
          id: string | null;
          name: string | null;
          address: string | null;
          postal_code: string | null;
          city: string | null;
        } | null;
        carrier: string | null;
        tracking_number: string | null;
        tracking_url: string | null;
        shipped_at: string | null;
        delivered_at: string | null;
        items: Array<{
          product_slug: string;
          product_name: string;
          color: string;
          size: string;
          quantity: number;
        }>;
      }
    >();

    for (const row of data ?? []) {
      const groupId =
        row.checkout_group_id || `legacy-${row.id}`;

      if (!groupedOrders.has(groupId)) {
        groupedOrders.set(groupId, {
          checkout_group_id: groupId,

          created_at: row.created_at ?? null,

          paid_at: row.paid_at ?? null,

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
                  name: row.service_point_name ?? null,
                  address:
                    row.service_point_address ?? null,
                  postal_code:
                    row.service_point_postal_code ?? null,
                  city: row.service_point_city ?? null,
                }
              : null,

          carrier: row.carrier ?? null,

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

      const order = groupedOrders.get(groupId)!;

      const existingItem = order.items.find(
        (item) =>
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
      },
      {
        headers: {
          "Cache-Control": "no-store, max-age=0",
        },
      }
    );
  } catch (error) {
    console.error("[my-orders] General error:", error);

    return NextResponse.json(
      { error: "Erreur serveur." },
      { status: 500 }
    );
  }
}