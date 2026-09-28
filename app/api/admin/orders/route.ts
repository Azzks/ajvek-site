import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { Resend } from "resend";

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

const resend = new Resend(
  process.env.RESEND_API_KEY!
);

const FROM_EMAIL =
  "AJVEK <commandes@ajvek.fr>";

const SITE_URL =
  "https://ajvek.fr";

/* ============================================================
   STATUTS
   ============================================================ */

const ALLOWED_STATUSES = [
  "paid",
  "preparing",
  "shipped",
  "delivered",
] as const;

type OrderStatus =
  (typeof ALLOWED_STATUSES)[number];

/* ============================================================
   TYPES
   ============================================================ */

type AdminOrderItem = {
  product_slug: string;
  product_name: string;
  color: string;
  size: string;
  quantity: number;
};

type ServicePoint = {
  id: string | null;
  name: string | null;
  address: string | null;
  postal_code: string | null;
  city: string | null;
};

type ShippingAddress = {
  name: string | null;
  address_line1: string | null;
  address_line2: string | null;
  postal_code: string | null;
  city: string | null;
  country: string | null;
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

  service_point:
    | ServicePoint
    | null;

  shipping_address:
    | ShippingAddress
    | null;

  carrier: string | null;
  tracking_number: string | null;
  tracking_url: string | null;

  shipped_at: string | null;
  delivered_at: string | null;

  items: AdminOrderItem[];
};

type EmailItem = {
  product_name: string | null;
  color: string | null;
  size: string | null;
};

/* ============================================================
   ADMIN
   ============================================================ */

function getAdminEmails() {
  return (
    process.env.ADMIN_EMAILS ||
    ""
  )
    .split(",")
    .map((email) =>
      email.trim().toLowerCase()
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

/* ============================================================
   NORMALISATION DES STATUTS
   ============================================================ */

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

/* ============================================================
   VALIDATION URL DE SUIVI
   ============================================================ */

function normalizeTrackingUrl(
  value:
    | string
    | null
    | undefined
) {
  if (value === undefined) {
    return {
      valid: true as const,
      value: undefined,
    };
  }

  const trimmed =
    value?.trim() || "";

  if (!trimmed) {
    return {
      valid: true as const,
      value: null,
    };
  }

  try {
    const url =
      new URL(trimmed);

    if (
      url.protocol !== "https:"
    ) {
      return {
        valid: false as const,
        value: null,
      };
    }

    return {
      valid: true as const,
      value: url.toString(),
    };
  } catch {
    return {
      valid: false as const,
      value: null,
    };
  }
}

/* ============================================================
   OUTILS EMAIL
   ============================================================ */

function escapeHtml(
  value: unknown
) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll(
      '"',
      "&quot;"
    )
    .replaceAll(
      "'",
      "&#039;"
    );
}

function shortOrderId(
  id: string
) {
  return id
    .replaceAll("-", "")
    .slice(0, 8)
    .toUpperCase();
}

function groupEmailItems(
  items: EmailItem[]
) {
  const grouped =
    new Map<
      string,
      {
        name: string;
        color: string;
        size: string;
        quantity: number;
      }
    >();

  for (const item of items) {
    const name =
      item.product_name ||
      "AJVEK";

    const color =
      item.color || "-";

    const size =
      item.size || "-";

    const key =
      `${name}::${color}::${size}`;

    const current =
      grouped.get(key);

    if (current) {
      current.quantity += 1;
    } else {
      grouped.set(key, {
        name,
        color,
        size,
        quantity: 1,
      });
    }
  }

  return Array.from(
    grouped.values()
  );
}

function buildItemsHtml(
  items: EmailItem[]
) {
  return groupEmailItems(items)
    .map(
      (item) => `
        <tr>
          <td
            style="
              padding:14px 0;
              border-bottom:1px solid #2d2a28;
            "
          >
            <div
              style="
                font-family:Georgia,'Times New Roman',serif;
                font-size:17px;
                line-height:24px;
                color:#f4f1ea;
              "
            >
              ${escapeHtml(
                item.name
              )}
            </div>

            <div
              style="
                margin-top:5px;
                font-family:Arial,Helvetica,sans-serif;
                font-size:11px;
                line-height:18px;
                color:#8a8178;
              "
            >
              ${escapeHtml(
                item.color
              )}
              · Taille
              ${escapeHtml(
                item.size
              )}
              · × ${item.quantity}
            </div>
          </td>
        </tr>
      `
    )
    .join("");
}

function buildItemsText(
  items: EmailItem[]
) {
  return groupEmailItems(items)
    .map(
      (item) =>
        `- ${item.name} — ${item.color} — Taille ${item.size} — x${item.quantity}`
    )
    .join("\n");
}

/* ============================================================
   STRUCTURE EMAIL AJVEK
   ============================================================ */

function buildAjvekEmail({
  orderNumber,
  eyebrow,
  title,
  introduction,
  content,
  items,
  buttonLabel,
  buttonUrl,
  footerText,
}: {
  orderNumber: string;
  eyebrow: string;
  title: string;
  introduction: string;
  content?: string;
  items: EmailItem[];
  buttonLabel: string;
  buttonUrl: string;
  footerText: string;
}) {
  const itemsHtml =
    buildItemsHtml(items);

  return `
<!doctype html>
<html lang="fr">
<head>
  <meta charset="utf-8" />
  <meta
    name="viewport"
    content="width=device-width, initial-scale=1"
  />
  <title>AJVEK</title>
</head>

<body
  style="
    margin:0;
    padding:0;
    background:#d5d1ca;
    color:#f4f1ea;
  "
>
  <table
    role="presentation"
    width="100%"
    cellspacing="0"
    cellpadding="0"
    border="0"
    style="
      background:#d5d1ca;
    "
  >
    <tr>
      <td
        align="center"
        style="
          padding:32px 16px;
        "
      >
        <table
          role="presentation"
          width="100%"
          cellspacing="0"
          cellpadding="0"
          border="0"
          style="
            max-width:620px;
            background:#121110;
            border:1px solid #2d2a28;
            border-radius:20px;
            overflow:hidden;
          "
        >
          <tr>
            <td
              style="
                padding:28px 32px;
                border-bottom:1px solid #2d2a28;
              "
            >
              <table
                role="presentation"
                width="100%"
                cellspacing="0"
                cellpadding="0"
                border="0"
              >
                <tr>
                  <td
                    style="
                      font-family:Georgia,'Times New Roman',serif;
                      font-size:26px;
                      letter-spacing:5px;
                      color:#f4f1ea;
                    "
                  >
                    AJVEK
                  </td>

                  <td
                    align="right"
                    style="
                      font-family:Arial,Helvetica,sans-serif;
                      font-size:9px;
                      letter-spacing:2px;
                      text-transform:uppercase;
                      color:#8a8178;
                    "
                  >
                    Wear your story
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <tr>
            <td
              style="
                padding:40px 32px 36px;
              "
            >
              <p
                style="
                  margin:0;
                  font-family:Arial,Helvetica,sans-serif;
                  font-size:9px;
                  letter-spacing:3px;
                  text-transform:uppercase;
                  color:#8a8178;
                "
              >
                ${escapeHtml(
                  eyebrow
                )}
                · Commande
                #${escapeHtml(
                  orderNumber
                )}
              </p>

              <h1
                style="
                  margin:14px 0 0;
                  font-family:Georgia,'Times New Roman',serif;
                  font-size:34px;
                  line-height:40px;
                  font-weight:400;
                  color:#f4f1ea;
                "
              >
                ${escapeHtml(
                  title
                )}
              </h1>

              <p
                style="
                  margin:20px 0 0;
                  font-family:Arial,Helvetica,sans-serif;
                  font-size:14px;
                  line-height:24px;
                  color:#b3aca4;
                "
              >
                ${escapeHtml(
                  introduction
                )}
              </p>

              ${
                content ||
                ""
              }

              <div
                style="
                  margin-top:30px;
                  border-top:1px solid #2d2a28;
                "
              >
                <p
                  style="
                    margin:24px 0 8px;
                    font-family:Arial,Helvetica,sans-serif;
                    font-size:9px;
                    letter-spacing:3px;
                    text-transform:uppercase;
                    color:#8a8178;
                  "
                >
                  Ta commande
                </p>

                <table
                  role="presentation"
                  width="100%"
                  cellspacing="0"
                  cellpadding="0"
                  border="0"
                >
                  ${itemsHtml}
                </table>
              </div>

              <table
                role="presentation"
                width="100%"
                cellspacing="0"
                cellpadding="0"
                border="0"
                style="
                  margin-top:30px;
                "
              >
                <tr>
                  <td
                    align="center"
                  >
                    <a
                      href="${escapeHtml(
                        buttonUrl
                      )}"
                      style="
                        display:inline-block;
                        background:#f4f1ea;
                        color:#121110;
                        text-decoration:none;
                        padding:15px 28px;
                        border-radius:999px;
                        font-family:Arial,Helvetica,sans-serif;
                        font-size:11px;
                        font-weight:700;
                        letter-spacing:2px;
                        text-transform:uppercase;
                      "
                    >
                      ${escapeHtml(
                        buttonLabel
                      )}
                    </a>
                  </td>
                </tr>
              </table>

              <p
                style="
                  margin:34px 0 0;
                  padding-top:24px;
                  border-top:1px solid #2d2a28;
                  font-family:Arial,Helvetica,sans-serif;
                  font-size:11px;
                  line-height:20px;
                  color:#8a8178;
                  text-align:center;
                "
              >
                ${escapeHtml(
                  footerText
                )}
              </p>
            </td>
          </tr>

          <tr>
            <td
              align="center"
              style="
                padding:22px 32px;
                border-top:1px solid #2d2a28;
                background:#181715;
                font-family:Arial,Helvetica,sans-serif;
                font-size:9px;
                letter-spacing:2px;
                text-transform:uppercase;
                color:#8a8178;
              "
            >
              AJVEK · Créé en France
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;
}

/* ============================================================
   EMAIL PRÉPARATION
   ============================================================ */

function buildPreparationEmail({
  customerName,
  orderNumber,
  items,
}: {
  customerName: string;
  orderNumber: string;
  items: EmailItem[];
}) {
  return buildAjvekEmail({
    orderNumber,

    eyebrow:
      "Préparation",

    title:
      "Ta commande se prépare.",

    introduction:
      `Bonjour ${customerName}, nous préparons actuellement ta commande AJVEK avec attention. Tu recevras un nouvel email dès qu'elle sera expédiée.`,

    items,

    buttonLabel:
      "Voir ma commande",

    buttonUrl:
      `${SITE_URL}/mes-commandes`,

    footerText:
      "La prochaine étape : l'expédition de ta commande.",
  });
}

/* ============================================================
   EMAIL EXPÉDITION
   ============================================================ */

function buildShippingEmail({
  customerName,
  orderNumber,
  carrier,
  trackingNumber,
  trackingUrl,
  items,
}: {
  customerName: string;
  orderNumber: string;
  carrier: string | null;
  trackingNumber: string;
  trackingUrl: string | null;
  items: EmailItem[];
}) {
  const content = `
    <div
      style="
        margin-top:30px;
        padding:22px;
        border:1px solid #2d2a28;
        background:#181715;
        border-radius:14px;
      "
    >
      <p
        style="
          margin:0;
          font-family:Arial,Helvetica,sans-serif;
          font-size:9px;
          letter-spacing:3px;
          text-transform:uppercase;
          color:#8a8178;
        "
      >
        Suivi
      </p>

      <p
        style="
          margin:14px 0 0;
          font-family:Arial,Helvetica,sans-serif;
          font-size:12px;
          line-height:22px;
          color:#b3aca4;
        "
      >
        <strong
          style="
            color:#f4f1ea;
          "
        >
          Transporteur
        </strong>

        <br />

        ${escapeHtml(
          carrier ||
            "Transporteur"
        )}

        <br /><br />

        <strong
          style="
            color:#f4f1ea;
          "
        >
          Numéro de suivi
        </strong>

        <br />

        ${escapeHtml(
          trackingNumber
        )}
      </p>
    </div>
  `;

  return buildAjvekEmail({
    orderNumber,

    eyebrow:
      "Expédition",

    title:
      "Ta commande est partie.",

    introduction:
      `Bonjour ${customerName}, ta commande AJVEK a été expédiée. Tu peux désormais suivre son acheminement.`,

    content,

    items,

    buttonLabel:
      trackingUrl
        ? "Suivre mon colis"
        : "Voir ma commande",

    buttonUrl:
      trackingUrl ||
      `${SITE_URL}/mes-commandes`,

    footerText:
      "Tu peux aussi retrouver le suivi depuis ton espace AJVEK.",
  });
}

/* ============================================================
   EMAIL LIVRAISON
   ============================================================ */

function buildDeliveryEmail({
  customerName,
  orderNumber,
  items,
}: {
  customerName: string;
  orderNumber: string;
  items: EmailItem[];
}) {
  return buildAjvekEmail({
    orderNumber,

    eyebrow:
      "Livraison",

    title:
      "Ta commande est arrivée.",

    introduction:
      `Bonjour ${customerName}, ta commande AJVEK est indiquée comme livrée. Ton Drop 001 est maintenant entre tes mains.`,

    items,

    buttonLabel:
      "Voir ma commande",

    buttonUrl:
      `${SITE_URL}/mes-commandes`,

    footerText:
      "Merci d'avoir choisi AJVEK. Wear your story.",
  });
}

/* ============================================================
   GET — COMMANDES ADMIN
   ============================================================ */

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
    } =
      await supabaseAdmin
        .from("preorders")
        .select(`
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

          shipping_name,
          shipping_address_line1,
          shipping_address_line2,
          shipping_postal_code,
          shipping_city,
          shipping_country,

          order_status,

          carrier,
          tracking_number,
          tracking_url,

          shipped_at,
          delivered_at
        `)
        .eq(
          "paid",
          true
        )
        .order(
          "created_at",
          {
            ascending: false,
          }
        );

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

    const groupedOrders =
      new Map<
        string,
        AdminOrder
      >();

    for (
      const row of
      data ?? []
    ) {
      const groupId =
        row.checkout_group_id ||
        `legacy-${row.id}`;

      if (
        !groupedOrders.has(
          groupId
        )
      ) {
        const isRelay =
          row.delivery_method ===
          "relay";

        const isHome =
          row.delivery_method ===
          "home";

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
              isRelay
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

            shipping_address:
              isHome
                ? {
                    name:
                      row.shipping_name ??
                      null,

                    address_line1:
                      row.shipping_address_line1 ??
                      null,

                    address_line2:
                      row.shipping_address_line2 ??
                      null,

                    postal_code:
                      row.shipping_postal_code ??
                      null,

                    city:
                      row.shipping_city ??
                      null,

                    country:
                      row.shipping_country ??
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

      if (row.paid_at) {
        order.paid_at =
          row.paid_at;
      }

      if (
        row.order_status
      ) {
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

      if (
        row.shipped_at
      ) {
        order.shipped_at =
          row.shipped_at;
      }

      if (
        row.delivered_at
      ) {
        order.delivered_at =
          row.delivered_at;
      }

      if (
        row.delivery_method ===
        "home"
      ) {
        order.shipping_address =
          {
            name:
              row.shipping_name ??
              order
                .shipping_address
                ?.name ??
              null,

            address_line1:
              row.shipping_address_line1 ??
              order
                .shipping_address
                ?.address_line1 ??
              null,

            address_line2:
              row.shipping_address_line2 ??
              order
                .shipping_address
                ?.address_line2 ??
              null,

            postal_code:
              row.shipping_postal_code ??
              order
                .shipping_address
                ?.postal_code ??
              null,

            city:
              row.shipping_city ??
              order
                .shipping_address
                ?.city ??
              null,

            country:
              row.shipping_country ??
              order
                .shipping_address
                ?.country ??
              null,
          };
      }
    }

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

/* ============================================================
   PATCH — MODIFIER UNE COMMANDE
   ============================================================ */

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

    const normalizedTrackingUrl =
      normalizeTrackingUrl(
        tracking_url
      );

    if (
      !normalizedTrackingUrl.valid
    ) {
      return NextResponse.json(
        {
          error:
            "Le lien de suivi doit être une URL HTTPS valide.",
        },
        {
          status: 400,
        }
      );
    }

    /* ========================================================
       CHARGEMENT DE LA COMMANDE
       ======================================================== */

    const {
      data: existingOrders,
      error:
        existingOrderError,
    } =
      await supabaseAdmin
        .from("preorders")
        .select(`
          id,
          order_status,

          shipped_at,
          delivered_at,

          name,
          email,

          product_name,
          color,
          size,

          carrier,
          tracking_number,
          tracking_url,

          preparation_email_sent_at,
          shipping_email_sent_at,
          delivery_email_sent_at
        `)
        .eq(
          "checkout_group_id",
          checkout_group_id
        )
        .eq(
          "paid",
          true
        );

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

    const existing =
      existingOrders[0];

    /* ========================================================
       MISE À JOUR
       ======================================================== */

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
      normalizedTrackingUrl.value !==
      undefined
    ) {
      updates.tracking_url =
        normalizedTrackingUrl.value;
    }

    if (
      status === "shipped"
    ) {
      updates.shipped_at =
        existing.shipped_at ||
        new Date().toISOString();

      updates.delivered_at =
        null;
    }

    if (
      status === "delivered"
    ) {
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
      updates.shipped_at =
        null;

      updates.delivered_at =
        null;
    }

    const {
      data: updatedRows,
      error,
    } =
      await supabaseAdmin
        .from("preorders")
        .update(updates)
        .eq(
          "checkout_group_id",
          checkout_group_id
        )
        .eq(
          "paid",
          true
        )
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

    /* ========================================================
       DONNÉES COMMUNES AUX EMAILS
       ======================================================== */

    const customerEmail =
      existing.email?.trim() ||
      null;

    const customerName =
      existing.name?.trim() ||
      "client";

    const orderNumber =
      shortOrderId(
        checkout_group_id
      );

    const emailItems:
      EmailItem[] =
      existingOrders.map(
        (row) => ({
          product_name:
            row.product_name,
          color:
            row.color,
          size:
            row.size,
        })
      );

    const itemsText =
      buildItemsText(
        emailItems
      );

    /* ========================================================
       EMAIL PRÉPARATION
       ======================================================== */

    if (
      status === "preparing"
    ) {
      const alreadySent =
        existingOrders.some(
          (row) =>
            Boolean(
              row.preparation_email_sent_at
            )
        );

      if (
        customerEmail &&
        !alreadySent
      ) {
        const html =
          buildPreparationEmail({
            customerName,
            orderNumber,
            items:
              emailItems,
          });

        const {
          data: emailData,
          error: emailError,
        } =
          await resend.emails.send(
            {
              from:
                FROM_EMAIL,

              to:
                customerEmail,

              subject:
                `Ta commande AJVEK #${orderNumber} est en préparation`,

              html,

              text:
                `Bonjour ${customerName},\n\n` +
                `Ta commande AJVEK #${orderNumber} est maintenant en préparation.\n\n` +
                `Articles :\n${itemsText}\n\n` +
                `Nous préparons ta commande avec attention. Tu recevras un nouvel email dès qu'elle sera expédiée.\n\n` +
                `L'équipe AJVEK\n` +
                `Wear your story.`,
            },
            {
              idempotencyKey:
                `preparation-customer-${checkout_group_id}`,
            }
          );

        if (
          emailError ||
          !emailData?.id
        ) {
          console.error(
            "[admin/orders] Email préparation :",
            emailError
          );

          return NextResponse.json(
            {
              error:
                "La commande a été mise à jour, mais l'email de préparation n'a pas pu être envoyé. Réessaie d'enregistrer la commande.",
            },
            {
              status: 500,
            }
          );
        }

        const {
          error:
            trackingError,
        } =
          await supabaseAdmin
            .from(
              "preorders"
            )
            .update({
              preparation_email_sent_at:
                new Date().toISOString(),
            })
            .eq(
              "checkout_group_id",
              checkout_group_id
            )
            .eq(
              "paid",
              true
            );

        if (
          trackingError
        ) {
          console.error(
            "[admin/orders] Marquage email préparation :",
            trackingError
          );

          return NextResponse.json(
            {
              error:
                "L'email de préparation a été envoyé, mais son état n'a pas pu être enregistré. Réessaie l'enregistrement.",
            },
            {
              status: 500,
            }
          );
        }
      }
    }

    /* ========================================================
       EMAIL EXPÉDITION
       ======================================================== */

    if (
      status === "shipped"
    ) {
      const finalCarrier =
        carrier !== undefined
          ? carrier?.trim() ||
            null
          : existing.carrier
              ?.trim() ||
            null;

      const finalTrackingNumber =
        tracking_number !==
        undefined
          ? tracking_number
              ?.trim() ||
            null
          : existing
              .tracking_number
              ?.trim() ||
            null;

      const finalTrackingUrl =
        normalizedTrackingUrl.value !==
        undefined
          ? normalizedTrackingUrl.value
          : existing
              .tracking_url ||
            null;

      const alreadySent =
        existingOrders.some(
          (row) =>
            Boolean(
              row.shipping_email_sent_at
            )
        );

      if (
        customerEmail &&
        finalTrackingNumber &&
        !alreadySent
      ) {
        const html =
          buildShippingEmail({
            customerName,
            orderNumber,
            carrier:
              finalCarrier,
            trackingNumber:
              finalTrackingNumber,
            trackingUrl:
              finalTrackingUrl,
            items:
              emailItems,
          });

        const {
          data: emailData,
          error: emailError,
        } =
          await resend.emails.send(
            {
              from:
                FROM_EMAIL,

              to:
                customerEmail,

              subject:
                `Ta commande AJVEK #${orderNumber} est expédiée`,

              html,

              text:
                `Bonjour ${customerName},\n\n` +
                `Ta commande AJVEK #${orderNumber} a été expédiée.\n\n` +
                `Transporteur : ${
                  finalCarrier ||
                  "Transporteur"
                }\n` +
                `Numéro de suivi : ${finalTrackingNumber}\n` +
                `${
                  finalTrackingUrl
                    ? `Suivre le colis : ${finalTrackingUrl}`
                    : `Voir la commande : ${SITE_URL}/mes-commandes`
                }\n\n` +
                `Articles :\n${itemsText}\n\n` +
                `Merci pour ta confiance,\n` +
                `L'équipe AJVEK`,
            },
            {
              idempotencyKey:
                `shipping-customer-${checkout_group_id}`,
            }
          );

        if (
          emailError ||
          !emailData?.id
        ) {
          console.error(
            "[admin/orders] Email expédition :",
            emailError
          );

          return NextResponse.json(
            {
              error:
                "La commande a été mise à jour, mais l'email d'expédition n'a pas pu être envoyé. Réessaie d'enregistrer la commande.",
            },
            {
              status: 500,
            }
          );
        }

        const {
          error:
            trackingError,
        } =
          await supabaseAdmin
            .from(
              "preorders"
            )
            .update({
              shipping_email_sent_at:
                new Date().toISOString(),
            })
            .eq(
              "checkout_group_id",
              checkout_group_id
            )
            .eq(
              "paid",
              true
            );

        if (
          trackingError
        ) {
          console.error(
            "[admin/orders] Marquage email expédition :",
            trackingError
          );

          return NextResponse.json(
            {
              error:
                "L'email d'expédition a été envoyé, mais son état n'a pas pu être enregistré. Réessaie l'enregistrement.",
            },
            {
              status: 500,
            }
          );
        }
      }
    }

    /* ========================================================
       EMAIL LIVRAISON
       ======================================================== */

    if (
      status === "delivered"
    ) {
      const alreadySent =
        existingOrders.some(
          (row) =>
            Boolean(
              row.delivery_email_sent_at
            )
        );

      if (
        customerEmail &&
        !alreadySent
      ) {
        const html =
          buildDeliveryEmail({
            customerName,
            orderNumber,
            items:
              emailItems,
          });

        const {
          data: emailData,
          error: emailError,
        } =
          await resend.emails.send(
            {
              from:
                FROM_EMAIL,

              to:
                customerEmail,

              subject:
                `Ta commande AJVEK #${orderNumber} est arrivée`,

              html,

              text:
                `Bonjour ${customerName},\n\n` +
                `Ta commande AJVEK #${orderNumber} est indiquée comme livrée.\n\n` +
                `Articles :\n${itemsText}\n\n` +
                `Ton Drop 001 est maintenant entre tes mains.\n\n` +
                `Merci d'avoir choisi AJVEK.\n` +
                `Wear your story.`,
            },
            {
              idempotencyKey:
                `delivery-customer-${checkout_group_id}`,
            }
          );

        if (
          emailError ||
          !emailData?.id
        ) {
          console.error(
            "[admin/orders] Email livraison :",
            emailError
          );

          return NextResponse.json(
            {
              error:
                "La commande a été mise à jour, mais l'email de livraison n'a pas pu être envoyé. Réessaie d'enregistrer la commande.",
            },
            {
              status: 500,
            }
          );
        }

        const {
          error:
            trackingError,
        } =
          await supabaseAdmin
            .from(
              "preorders"
            )
            .update({
              delivery_email_sent_at:
                new Date().toISOString(),
            })
            .eq(
              "checkout_group_id",
              checkout_group_id
            )
            .eq(
              "paid",
              true
            );

        if (
          trackingError
        ) {
          console.error(
            "[admin/orders] Marquage email livraison :",
            trackingError
          );

          return NextResponse.json(
            {
              error:
                "L'email de livraison a été envoyé, mais son état n'a pas pu être enregistré. Réessaie l'enregistrement.",
            },
            {
              status: 500,
            }
          );
        }
      }
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