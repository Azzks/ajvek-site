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

/*
 * ============================================================
 * STATUTS DE COMMANDE
 * ============================================================
 *
 * Nouveau fonctionnement AJVEK :
 *
 * paid
 *   ↓
 * preparing
 *   ↓
 * shipped
 *   ↓
 * delivered
 *
 * Le seuil promotionnel des 10 commandes
 * n'a rien à voir avec ces statuts.
 * ============================================================
 */

const ALLOWED_STATUSES = [
  "paid",
  "preparing",
  "shipped",
  "delivered",
] as const;

type OrderStatus =
  (typeof ALLOWED_STATUSES)[number];

/*
 * ============================================================
 * TYPES
 * ============================================================
 */

type AdminOrderItem = {
  product_slug: string;
  product_name: string;
  color: string;
  size: string;
  quantity: number;
};

type AdminOrder = {
  checkout_group_id: string;

  created_at: string | null;
  paid_at: string | null;

  customer: {
    user_id: string | null;
    name: string;
    email: string;
    phone: string | null;
  };

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

  items: AdminOrderItem[];
};

/*
 * ============================================================
 * ADMIN
 * ============================================================
 */

function getAdminEmails() {
  return (
    process.env.ADMIN_EMAILS || ""
  )
    .split(",")
    .map((email) =>
      email
        .trim()
        .toLowerCase()
    )
    .filter(Boolean);
}

async function getAdminUser(
  request: Request
) {
  const authorization =
    request.headers.get(
      "authorization"
    );

  if (
    !authorization?.startsWith(
      "Bearer "
    )
  ) {
    return null;
  }

  const token =
    authorization.replace(
      "Bearer ",
      ""
    );

  const {
    data: { user },
    error,
  } =
    await supabaseAuth.auth.getUser(
      token
    );

  if (
    error ||
    !user?.email
  ) {
    return null;
  }

  const adminEmails =
    getAdminEmails();

  if (
    !adminEmails.includes(
      user.email.toLowerCase()
    )
  ) {
    return null;
  }

  return user;
}

/*
 * ============================================================
 * NORMALISATION DES ANCIENS STATUTS
 * ============================================================
 *
 * Permet de conserver une compatibilité
 * si d'anciennes lignes existent déjà.
 * ============================================================
 */

function normalizeStatus(
  status: string | null
): OrderStatus {
  switch (status) {
    case "preorder_received":
      return "paid";

    case "production":
    case "manufacturing":
      return "preparing";

    case "shipped":
      return "shipped";

    case "delivered":
      return "delivered";

    case "paid":
      return "paid";

    case "preparing":
      return "preparing";

    default:
      return "paid";
  }
}

/*
 * ============================================================
 * GET — RÉCUPÉRER LES COMMANDES ADMIN
 * ============================================================
 */

export async function GET(
  request: Request
) {
  try {
    const admin =
      await getAdminUser(
        request
      );

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

    const {
      data,
      error,
    } = await supabaseAdmin
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
      console.error(
        "[admin/orders] GET :",
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
     * ========================================================
     * REGROUPEMENT PAR COMMANDE
     * ========================================================
     */

    const groupedOrders =
      new Map<
        string,
        AdminOrder
      >();

    for (
      const row of data ?? []
    ) {
      const groupId =
        row.checkout_group_id ||
        `legacy-${row.id}`;

      if (
        !groupedOrders.has(
          groupId
        )
      ) {
        groupedOrders.set(
          groupId,
          {
            checkout_group_id:
              groupId,

            created_at:
              row.created_at ??
              null,

            paid_at:
              row.paid_at ??
              null,

            customer: {
              user_id:
                row.user_id ??
                null,

              name:
                row.name ||
                "",

              email:
                row.email ||
                "",

              phone:
                row.phone ??
                null,
            },

            status:
              normalizeStatus(
                row.order_status
              ),

            delivery_method:
              row.delivery_method ??
              null,

            shipping_amount:
              Number(
                row.shipping_amount ??
                  0
              ),

            service_point:
              row.delivery_method ===
              "relay"
                ? {
                    id:
                      row.service_point_id ??
                      null,

                    name:
                      row.service_point_name ??
                      null,

                    address:
                      row.service_point_address ??
                      null,

                    postal_code:
                      row.service_point_postal_code ??
                      null,

                    city:
                      row.service_point_city ??
                      null,
                  }
                : null,

            carrier:
              row.carrier ??
              null,

            tracking_number:
              row.tracking_number ??
              null,

            tracking_url:
              row.tracking_url ??
              null,

            shipped_at:
              row.shipped_at ??
              null,

            delivered_at:
              row.delivered_at ??
              null,

            items: [],
          }
        );
      }

      const order =
        groupedOrders.get(
          groupId
        )!;

      /*
       * ======================================================
       * ARTICLES IDENTIQUES
       * ======================================================
       */

      const existingItem =
        order.items.find(
          (item) =>
            item.product_slug ===
              row.product_slug &&
            item.color ===
              row.color &&
            item.size ===
              row.size
        );

      if (existingItem) {
        existingItem.quantity +=
          1;
      } else {
        order.items.push({
          product_slug:
            row.product_slug,

          product_name:
            row.product_name ||
            "AJVEK",

          color:
            row.color ||
            "-",

          size:
            row.size ||
            "-",

          quantity: 1,
        });
      }

      /*
       * ======================================================
       * SYNCHRONISATION DES INFORMATIONS
       * ======================================================
       */

      if (row.paid_at) {
        order.paid_at =
          row.paid_at;
      }

      if (row.order_status) {
        order.status =
          normalizeStatus(
            row.order_status
          );
      }

      if (row.carrier) {
        order.carrier =
          row.carrier;
      }

      if (
        row.tracking_number
      ) {
        order.tracking_number =
          row.tracking_number;
      }

      if (
        row.tracking_url
      ) {
        order.tracking_url =
          row.tracking_url;
      }

      if (row.shipped_at) {
        order.shipped_at =
          row.shipped_at;
      }

      if (
        row.delivered_at
      ) {
        order.delivered_at =
          row.delivered_at;
      }
    }

    /*
     * ========================================================
     * TRI
     * ========================================================
     */

    const orders =
      Array.from(
        groupedOrders.values()
      ).sort((a, b) => {
        const aDate =
          new Date(
            a.paid_at ||
              a.created_at ||
              0
          ).getTime();

        const bDate =
          new Date(
            b.paid_at ||
              b.created_at ||
              0
          ).getTime();

        return bDate - aDate;
      });

    /*
     * ========================================================
     * STATISTIQUES
     * ========================================================
     */

    const clothingCount =
      orders.reduce(
        (total, order) =>
          total +
          order.items.reduce(
            (
              itemTotal,
              item
            ) =>
              itemTotal +
              item.quantity,
            0
          ),
        0
      );

    const preparingCount =
      orders.filter(
        (order) =>
          order.status ===
          "preparing"
      ).length;

    const shippedCount =
      orders.filter(
        (order) =>
          order.status ===
          "shipped"
      ).length;

    const deliveredCount =
      orders.filter(
        (order) =>
          order.status ===
          "delivered"
      ).length;

    /*
     * ========================================================
     * RÉPONSE
     * ========================================================
     */

    return NextResponse.json(
      {
        orders,

        stats: {
          order_count:
            orders.length,

          clothing_count:
            clothingCount,

          preparing_count:
            preparingCount,

          shipped_count:
            shippedCount,

          delivered_count:
            deliveredCount,
        },
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
      "[admin/orders] GET general :",
      error
    );

    return NextResponse.json(
      {
        error:
          "Erreur serveur.",
      },
      {
        status: 500,
      }
    );
  }
}

/*
 * ============================================================
 * PATCH — MODIFIER UNE COMMANDE
 * ============================================================
 */

export async function PATCH(
  request: Request
) {
  try {
    const admin =
      await getAdminUser(
        request
      );

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
      checkout_group_id?: string;
      status?: OrderStatus;
      carrier?:
        | string
        | null;
      tracking_number?:
        | string
        | null;
      tracking_url?:
        | string
        | null;
    };

    try {
      body =
        await request.json();
    } catch {
      return NextResponse.json(
        {
          error:
            "Données invalides.",
        },
        {
          status: 400,
        }
      );
    }

    const {
      checkout_group_id,
      status,
      carrier,
      tracking_number,
      tracking_url,
    } = body;

    if (
      !checkout_group_id
    ) {
      return NextResponse.json(
        {
          error:
            "Commande introuvable.",
        },
        {
          status: 400,
        }
      );
    }

    if (
      !status ||
      !ALLOWED_STATUSES.includes(
        status
      )
    ) {
      return NextResponse.json(
        {
          error:
            "Statut invalide.",
        },
        {
          status: 400,
        }
      );
    }

    /*
     * ========================================================
     * VÉRIFIER QUE LA COMMANDE EXISTE
     * ========================================================
     */

    const {
      data: existingOrders,
      error:
        existingOrderError,
    } = await supabaseAdmin
      .from("preorders")
      .select(
        `
        id,
        order_status,
        shipped_at,
        delivered_at
        `
      )
      .eq(
        "checkout_group_id",
        checkout_group_id
      )
      .eq("paid", true);

    if (
      existingOrderError
    ) {
      console.error(
        "[admin/orders] Vérification commande :",
        existingOrderError
      );

      return NextResponse.json(
        {
          error:
            "Impossible de vérifier la commande.",
        },
        {
          status: 500,
        }
      );
    }

    if (
      !existingOrders ||
      existingOrders.length ===
        0
    ) {
      return NextResponse.json(
        {
          error:
            "Commande introuvable.",
        },
        {
          status: 404,
        }
      );
    }

    /*
     * ========================================================
     * MISE À JOUR
     * ========================================================
     */

    const updates: {
      order_status: OrderStatus;
      carrier?:
        | string
        | null;
      tracking_number?:
        | string
        | null;
      tracking_url?:
        | string
        | null;
      shipped_at?:
        | string
        | null;
      delivered_at?:
        | string
        | null;
    } = {
      order_status:
        status,
    };

    if (
      carrier !== undefined
    ) {
      updates.carrier =
        carrier?.trim() ||
        null;
    }

    if (
      tracking_number !==
      undefined
    ) {
      updates.tracking_number =
        tracking_number?.trim() ||
        null;
    }

    if (
      tracking_url !==
      undefined
    ) {
      updates.tracking_url =
        tracking_url?.trim() ||
        null;
    }

    /*
     * ========================================================
     * DATES DE SUIVI
     * ========================================================
     */

    const existing =
      existingOrders[0];

    if (
      status === "shipped"
    ) {
      /*
       * On ne remplace pas la date
       * d'expédition si elle existe déjà.
       */

      updates.shipped_at =
        existing.shipped_at ||
        new Date().toISOString();

      updates.delivered_at =
        null;
    }

    if (
      status === "delivered"
    ) {
      /*
       * Si on passe directement à livré,
       * on conserve/crée également une
       * date d'expédition.
       */

      updates.shipped_at =
        existing.shipped_at ||
        new Date().toISOString();

      updates.delivered_at =
        existing.delivered_at ||
        new Date().toISOString();
    }

    if (
      status === "paid" ||
      status === "preparing"
    ) {
      /*
       * Si l'admin revient volontairement
       * à un statut antérieur, les dates
       * d'expédition/livraison sont nettoyées.
       */

      updates.shipped_at =
        null;

      updates.delivered_at =
        null;
    }

    const {
      data: updatedRows,
      error,
    } = await supabaseAdmin
      .from("preorders")
      .update(updates)
      .eq(
        "checkout_group_id",
        checkout_group_id
      )
      .eq("paid", true)
      .select("id");

    if (error) {
      console.error(
        "[admin/orders] PATCH :",
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

    if (
      !updatedRows ||
      updatedRows.length ===
        0
    ) {
      return NextResponse.json(
        {
          error:
            "Aucune commande n'a été modifiée.",
        },
        {
          status: 404,
        }
      );
    }

    return NextResponse.json({
      success: true,

      checkout_group_id,

      status,

      updated_count:
        updatedRows.length,
    });
  } catch (error) {
    console.error(
      "[admin/orders] PATCH general :",
      error
    );

    return NextResponse.json(
      {
        error:
          "Erreur serveur.",
      },
      {
        status: 500,
      }
    );
  }
}