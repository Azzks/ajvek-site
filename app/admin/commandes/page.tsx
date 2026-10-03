"use client";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import { supabase } from "@/lib/supabase";

/* ============================================================
   TYPES
   ============================================================ */

type OrderItem = {
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

  service_point: ServicePoint | null;
  shipping_address: ShippingAddress | null;

  carrier: string | null;
  tracking_number: string | null;
  tracking_url: string | null;

  shipped_at: string | null;
  delivered_at: string | null;

  items: OrderItem[];
};

type OrderDraft = {
  status: string;
  carrier: string;
  tracking_number: string;
  tracking_url: string;
};
type StockRow = {
  product_slug: string;
  color: string;
  size: string;
  stock_quantity: number;
  sales_enabled: boolean;
};
/* ============================================================
   STOCK INITIAL — DROP 001
   ============================================================ */

const INITIAL_STOCK: Record<string, number> = {
  "roses-Blanc-XS": 2,
  "roses-Blanc-S": 3,
  "roses-Blanc-M": 4,
  "roses-Blanc-L": 3,

  "roses-Noir-XS": 2,
  "roses-Noir-S": 3,
  "roses-Noir-M": 4,
  "roses-Noir-L": 3,

  "sakura-Blanc-XS": 2,
  "sakura-Blanc-S": 5,
  "sakura-Blanc-M": 5,
  "sakura-Blanc-L": 3,

  "sakura-Noir-XS": 2,
  "sakura-Noir-S": 4,
  "sakura-Noir-M": 5,
  "sakura-Noir-L": 4,
};

const INITIAL_TOTAL_STOCK = 54;

const INITIAL_PRODUCT_STOCK: Record<string, number> = {
  roses: 24,
  sakura: 30,
};

function getInitialStock(row: StockRow) {
  const key = `${row.product_slug}-${row.color}-${row.size}`;

  return INITIAL_STOCK[key] ?? 0;
}
/* ============================================================
   STATUTS
   ============================================================ */

const STATUS_OPTIONS = [
  {
    value: "paid",
    label: "Commande confirmée",
  },
  {
    value: "preparing",
    label: "En préparation",
  },
  {
    value: "shipped",
    label: "Expédiée",
  },
  {
    value: "delivered",
    label: "Livrée",
  },
];

/* ============================================================
   COMPATIBILITÉ ANCIENS STATUTS
   ============================================================ */

function normalizeStatus(
  status: string | null | undefined
) {
  switch (status) {
    case "preorder_received":
    case "awaiting_payment":
    case "paid":
      return "paid";

    case "production":
    case "manufacturing":
    case "preparing":
      return "preparing";

    case "shipped":
      return "shipped";

    case "delivered":
      return "delivered";

    default:
      return "paid";
  }
}

/* ============================================================
   FORMATAGE
   ============================================================ */

function formatDate(
  date: string | null
) {
  if (!date) {
    return "—";
  }

  return new Intl.DateTimeFormat(
    "fr-FR",
    {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }
  ).format(new Date(date));
}

function formatPrice(
  amount: number
) {
  return new Intl.NumberFormat(
    "fr-FR",
    {
      style: "currency",
      currency: "EUR",
    }
  ).format(amount / 100);
}

function shortOrderId(
  id: string
) {
  if (id.startsWith("legacy-")) {
    return id
      .replace("legacy-", "")
      .slice(0, 8)
      .toUpperCase();
  }

  return id
    .replaceAll("-", "")
    .slice(0, 8)
    .toUpperCase();
}

function countryLabel(
  country: string | null
) {
  if (!country) {
    return null;
  }

  if (
    country.toUpperCase() === "FR"
  ) {
    return "France";
  }

  return country.toUpperCase();
}

/* ============================================================
   PAGE
   ============================================================ */

export default function AdminCommandesPage() {
  const [orders, setOrders] =
    useState<AdminOrder[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState<string | null>(null);

  const [search, setSearch] =
    useState("");

  const [savingId, setSavingId] =
    useState<string | null>(null);

  const [drafts, setDrafts] =
    useState<
      Record<string, OrderDraft>
    >({});
const [stock, setStock] =
  useState<StockRow[]>([]);

const [stockLoading, setStockLoading] =
  useState(true);

const [stockError, setStockError] =
  useState<string | null>(null);

const [stockSavingKey, setStockSavingKey] =
  useState<string | null>(null);
  /* ==========================================================
     TOKEN ADMIN
     ========================================================== */

  async function getAccessToken() {
    const {
      data: { session },
    } =
      await supabase.auth.getSession();

    return (
      session?.access_token ??
      null
    );
  }
/* ==========================================================
   STOCK
   ========================================================== */

async function loadStock() {
  setStockLoading(true);
  setStockError(null);

  try {
    const token =
      await getAccessToken();

    if (!token) {
      setStockError(
        "Tu dois être connecté avec ton compte admin."
      );

      return;
    }

    const response =
      await fetch(
        "/api/admin/stock",
        {
          cache: "no-store",

          headers: {
            Authorization:
              `Bearer ${token}`,
          },
        }
      );

    const data =
      await response.json();

    if (!response.ok) {
      setStockError(
        data.error ||
          "Impossible de charger le stock."
      );

      return;
    }

    setStock(
      Array.isArray(data.stock)
        ? data.stock
        : []
    );
  } catch (error) {
    console.error(
      "[admin-stock]",
      error
    );

    setStockError(
      "Impossible de charger le stock."
    );
  } finally {
    setStockLoading(false);
  }
}

async function adjustStock(
  row: StockRow,
  adjustment: 1 | -1
) {
  const productName =
    row.product_slug === "sakura"
      ? "Cerisier"
      : "Roses";

  const action =
    adjustment === -1
      ? "retirer 1"
      : "ajouter 1";

  const confirmed =
    window.confirm(
      `Confirmer : ${action} au stock de ${productName} · ${row.color} · ${row.size} ?`
    );

  if (!confirmed) {
    return;
  }

  const key =
    `${row.product_slug}-${row.color}-${row.size}`;

  setStockSavingKey(key);
  setStockError(null);

  try {
    const token =
      await getAccessToken();

    if (!token) {
      setStockError(
        "Ta session a expiré."
      );

      return;
    }

    const response =
      await fetch(
        "/api/admin/stock",
        {
          method: "PATCH",

          headers: {
            "Content-Type":
              "application/json",

            Authorization:
              `Bearer ${token}`,
          },

          body: JSON.stringify({
            product_slug:
              row.product_slug,

            color:
              row.color,

            size:
              row.size,

            adjustment,
          }),
        }
      );

    const data =
      await response.json();

    if (!response.ok) {
      setStockError(
        data.error ||
          "Impossible de modifier le stock."
      );

      await loadStock();

      return;
    }

    const updated =
      data.stock as StockRow;

    setStock((current) =>
      current.map((item) =>
        item.product_slug ===
          updated.product_slug &&
        item.color ===
          updated.color &&
        item.size ===
          updated.size
          ? updated
          : item
      )
    );
  } catch (error) {
    console.error(
      "[admin-stock/adjust]",
      error
    );

    setStockError(
      "Impossible de modifier le stock."
    );

    await loadStock();
  } finally {
    setStockSavingKey(null);
  }
}
  /* ==========================================================
     CHARGER LES COMMANDES
     ========================================================== */

  async function loadOrders() {
    setLoading(true);
    setError(null);

    try {
      const token =
        await getAccessToken();

      if (!token) {
        setError(
          "Tu dois être connecté avec ton compte admin."
        );

        return;
      }

      const response =
        await fetch(
          "/api/admin/orders",
          {
            cache: "no-store",

            headers: {
              Authorization:
                `Bearer ${token}`,
            },
          }
        );

      const data =
        await response.json();

      if (!response.ok) {
        setError(
          data.error ||
            "Impossible de charger les commandes."
        );

        return;
      }

      const fetchedOrders: AdminOrder[] =
        Array.isArray(
          data.orders
        )
          ? data.orders
          : [];

      setOrders(
        fetchedOrders
      );

      const nextDrafts: Record<
        string,
        OrderDraft
      > = {};

      for (
        const order of fetchedOrders
      ) {
        nextDrafts[
          order.checkout_group_id
        ] = {
          status:
            normalizeStatus(
              order.status
            ),

          carrier:
            order.carrier ||
            "",

          tracking_number:
            order.tracking_number ||
            "",

          tracking_url:
            order.tracking_url ||
            "",
        };
      }

      setDrafts(
        nextDrafts
      );
    } catch (error) {
      console.error(
        "[admin-commandes]",
        error
      );

      setError(
        "Impossible de charger les commandes."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
  loadOrders();
  loadStock();
}, []);
  /* ==========================================================
     MODIFIER UN BROUILLON
     ========================================================== */

  function updateDraft(
    orderId: string,
    values: Partial<OrderDraft>
  ) {
    setDrafts(
      (current) => ({
        ...current,

        [orderId]: {
          ...current[
            orderId
          ],

          ...values,
        },
      })
    );
  }

  /* ==========================================================
     ENREGISTRER UNE COMMANDE
     ========================================================== */

  async function saveOrder(
    order: AdminOrder
  ) {
    const draft =
      drafts[
        order.checkout_group_id
      ];

    if (!draft) {
      return;
    }

    setSavingId(
      order.checkout_group_id
    );

    setError(null);

    try {
      const token =
        await getAccessToken();

      if (!token) {
        setError(
          "Ta session a expiré."
        );

        return;
      }

      const response =
        await fetch(
          "/api/admin/orders",
          {
            method: "PATCH",

            headers: {
              "Content-Type":
                "application/json",

              Authorization:
                `Bearer ${token}`,
            },

            body:
              JSON.stringify({
                checkout_group_id:
                  order.checkout_group_id,

                status:
                  draft.status,

                carrier:
                  draft.carrier,

                tracking_number:
                  draft.tracking_number,

                tracking_url:
                  draft.tracking_url,
              }),
          }
        );

      const data =
        await response.json();

      if (!response.ok) {
        setError(
          data.error ||
            "Impossible de modifier la commande."
        );

        return;
      }

      await loadOrders();
    } catch (error) {
      console.error(
        "[admin-commandes/save]",
        error
      );

      setError(
        "Impossible de modifier la commande."
      );
    } finally {
      setSavingId(
        null
      );
    }
  }

  /* ==========================================================
     RECHERCHE
     ========================================================== */

  const filteredOrders =
    useMemo(() => {
      const query =
        search
          .trim()
          .toLowerCase();

      if (!query) {
        return orders;
      }

      return orders.filter(
        (order) => {
          const itemText =
            order.items
              .map(
                (item) =>
                  `${item.product_name} ${item.color} ${item.size}`
              )
              .join(" ");

          const deliveryText = [
            order.service_point
              ?.name || "",
            order.service_point
              ?.address || "",
            order.service_point
              ?.postal_code || "",
            order.service_point
              ?.city || "",
            order.shipping_address
              ?.name || "",
            order.shipping_address
              ?.address_line1 || "",
            order.shipping_address
              ?.address_line2 || "",
            order.shipping_address
              ?.postal_code || "",
            order.shipping_address
              ?.city || "",
            order.shipping_address
              ?.country || "",
          ].join(" ");

          return [
            order.customer.name,
            order.customer.email,
            order.customer.phone ||
              "",
            order.checkout_group_id,
            itemText,
            deliveryText,
          ]
            .join(" ")
            .toLowerCase()
            .includes(
              query
            );
        }
      );
    }, [
      orders,
      search,
    ]);

  /* ==========================================================
     COMPTEURS
     ========================================================== */
const currentStockTotal = stock.reduce(
  (total, row) =>
    total + Math.max(Number(row.stock_quantity ?? 0), 0),
  0
);

const soldPieces = orders.reduce(
  (total, order) =>
    total +
    order.items.reduce(
      (orderTotal, item) =>
        orderTotal + item.quantity,
      0
    ),
  0
);

const rosesCurrentStock = stock
  .filter((row) => row.product_slug === "roses")
  .reduce(
    (total, row) =>
      total + Math.max(Number(row.stock_quantity ?? 0), 0),
    0
  );

const sakuraCurrentStock = stock
  .filter((row) => row.product_slug === "sakura")
  .reduce(
    (total, row) =>
      total + Math.max(Number(row.stock_quantity ?? 0), 0),
    0
  );

const rosesSold = orders.reduce(
  (total, order) =>
    total +
    order.items
      .filter((item) => item.product_slug === "roses")
      .reduce(
        (itemTotal, item) =>
          itemTotal + item.quantity,
        0
      ),
  0
);

const sakuraSold = orders.reduce(
  (total, order) =>
    total +
    order.items
      .filter((item) => item.product_slug === "sakura")
      .reduce(
        (itemTotal, item) =>
          itemTotal + item.quantity,
        0
      ),
  0
);
  const totalPieces =
    orders.reduce(
      (
        total,
        order
      ) =>
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
        normalizeStatus(
          order.status
        ) ===
        "preparing"
    ).length;

  const shippedCount =
    orders.filter(
      (order) =>
        normalizeStatus(
          order.status
        ) ===
        "shipped"
    ).length;

  const deliveredCount =
    orders.filter(
      (order) =>
        normalizeStatus(
          order.status
        ) ===
        "delivered"
    ).length;

  /* ==========================================================
     RENDER
     ========================================================== */

  return (
    <main className="min-h-screen bg-background text-foreground">
      {/* =====================================================
          HERO
      ====================================================== */}

      <section className="border-b border-surface px-6 py-16 md:px-8 md:py-20">
        <div className="mx-auto max-w-7xl">
          <p className="text-[10px] uppercase tracking-[0.4em] text-stone">
            AJVEK · Administration
          </p>

          <div className="mt-5 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h1 className="font-display text-4xl md:text-6xl">
                Commandes
              </h1>

              <p className="mt-5 max-w-xl text-sm leading-7 text-stone">
                Gestion des commandes
                payées, de leur préparation
                jusqu&apos;à leur
                livraison.
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
  loadOrders();
  loadStock();
}}
              disabled={
                loading
              }
              className="w-fit rounded-full border border-surface px-5 py-3 text-[9px] uppercase tracking-[0.25em] transition hover:border-foreground disabled:opacity-50"
            >
              {loading
                ? "Actualisation..."
                : "Actualiser"}
            </button>
          </div>
        </div>
      </section>

      {/* =====================================================
          CONTENU
      ====================================================== */}

      <section className="px-6 py-10 md:px-8 md:py-14">
        <div className="mx-auto max-w-7xl">
          {/* =================================================
    STOCK
================================================= */}

<div className="mb-12 border border-surface">
  <div className="border-b border-surface px-5 py-6 md:px-7">
    <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
      <div>
        <p className="text-[9px] uppercase tracking-[0.3em] text-stone">
          Stock réel
        </p>

        <h2 className="mt-2 font-display text-2xl md:text-3xl">
          Drop 001
        </h2>

        <p className="mt-3 max-w-xl text-xs leading-5 text-stone">
          Ajustement manuel du stock pour les ventes réalisées en dehors du site.
        </p>
      </div>

      <button
        type="button"
        onClick={loadStock}
        disabled={stockLoading}
        className="w-fit rounded-full border border-surface px-5 py-3 text-[9px] uppercase tracking-[0.25em] transition hover:border-foreground disabled:opacity-50"
      >
        {stockLoading
          ? "Actualisation..."
          : "Actualiser le stock"}
      </button>
    </div>
  </div>

  {stockError && (
    <div className="border-b border-surface px-5 py-5 md:px-7">
      <p className="text-[9px] uppercase tracking-[0.3em] text-stone">
        Erreur stock
      </p>

      <p className="mt-2 text-sm">
        {stockError}
      </p>
    </div>
  )}

  {stockLoading && stock.length === 0 && (
    <div className="px-5 py-8 md:px-7">
      <p className="text-sm text-stone">
        Chargement du stock...
      </p>
    </div>
  )}

  {!stockLoading && stock.length === 0 && !stockError && (
    <div className="px-5 py-8 md:px-7">
      <p className="text-sm text-stone">
        Aucun stock trouvé.
      </p>
    </div>
  )}

  {stock.length > 0 && (
   <>
  <div className="grid grid-cols-2 gap-px border-b border-surface bg-surface md:grid-cols-4">
    <div className="bg-background p-5 md:p-7">
      <p className="text-[8px] uppercase tracking-[0.3em] text-stone">
        Stock disponible
      </p>

      <p className="mt-3 font-display text-3xl">
        {currentStockTotal} / {INITIAL_TOTAL_STOCK}
      </p>
    </div>

    <div className="bg-background p-5 md:p-7">
      <p className="text-[8px] uppercase tracking-[0.3em] text-stone">
        Vendus
      </p>

      <p className="mt-3 font-display text-3xl">
        {soldPieces}
      </p>
    </div>

    <div className="bg-background p-5 md:p-7">
      <p className="text-[8px] uppercase tracking-[0.3em] text-stone">
        Roses
      </p>

      <p className="mt-3 font-display text-3xl">
        {rosesCurrentStock} / {INITIAL_PRODUCT_STOCK.roses}
      </p>

      <p className="mt-2 text-[8px] uppercase tracking-[0.2em] text-stone">
        {rosesSold} vendu{rosesSold > 1 ? "s" : ""}
      </p>
    </div>

    <div className="bg-background p-5 md:p-7">
      <p className="text-[8px] uppercase tracking-[0.3em] text-stone">
        Cerisier
      </p>

      <p className="mt-3 font-display text-3xl">
        {sakuraCurrentStock} / {INITIAL_PRODUCT_STOCK.sakura}
      </p>

      <p className="mt-2 text-[8px] uppercase tracking-[0.2em] text-stone">
        {sakuraSold} vendu{sakuraSold > 1 ? "s" : ""}
      </p>
    </div>
  </div>

  <div className="grid lg:grid-cols-2">
      {["roses", "sakura"].map(
        (productSlug, productIndex) => {
          const productRows =
            stock.filter(
              (row) =>
                row.product_slug ===
                productSlug
            );

          const productName =
            productSlug === "sakura"
              ? "Cerisier"
              : "Roses";

          return (
            <div
              key={productSlug}
              className={
                productIndex === 0
                  ? "border-b border-surface lg:border-b-0 lg:border-r"
                  : ""
              }
            >
              <div className="border-b border-surface px-5 py-5 md:px-7">
                <p className="font-display text-xl">
                  {productName}
                </p>

                <p className="mt-1 text-[9px] uppercase tracking-[0.25em] text-stone">
                  {productRows.reduce(
                    (total, row) =>
                      total +
                      row.stock_quantity,
                    0
                  )}{" "}
                  pièces disponibles
                </p>
              </div>

              <div>
                {productRows.map(
                  (row) => {
                    const key =
                      `${row.product_slug}-${row.color}-${row.size}`;

                    const saving =
                      stockSavingKey ===
                      key;

                    return (
                      <div
                        key={key}
                        className="flex items-center justify-between gap-4 border-b border-surface px-5 py-4 last:border-b-0 md:px-7"
                      >
                        <div>
                          <p className="text-sm">
                            {row.color}
                            {" · "}
                            Taille {row.size}
                          </p>

                          <p className="mt-1 text-[9px] uppercase tracking-[0.2em] text-stone">
                            {row.sales_enabled
                              ? "Vente activée"
                              : "Vente fermée"}
                          </p>
                        </div>

                        <div className="flex items-center gap-3">
                          <button
                            type="button"
                            onClick={() =>
                              adjustStock(
                                row,
                                -1
                              )
                            }
                            disabled={
                              saving ||
                              row.stock_quantity <=
                                0
                            }
                            className="flex h-10 w-10 items-center justify-center border border-surface text-lg transition hover:border-foreground disabled:cursor-not-allowed disabled:opacity-30"
                            aria-label={`Retirer une unité de ${productName} ${row.color} ${row.size}`}
                          >
                            −
                          </button>

                          <div className="min-w-16 text-center">
  <p className="font-display text-2xl">
    {row.stock_quantity} / {getInitialStock(row)}
  </p>

  <p className="text-[7px] uppercase tracking-[0.2em] text-stone">
    disponible
  </p>
</div>

                          <button
                            type="button"
                            onClick={() =>
                              adjustStock(
                                row,
                                1
                              )
                            }
                            disabled={saving}
                            className="flex h-10 w-10 items-center justify-center border border-surface text-lg transition hover:border-foreground disabled:cursor-not-allowed disabled:opacity-30"
                            aria-label={`Ajouter une unité de ${productName} ${row.color} ${row.size}`}
                          >
                            +
                          </button>
                        </div>
                      </div>
                    );
                  }
                )}
              </div>
            </div>
          );
        }
      )}
        </div>
  </>
)}
</div>
          {/* =================================================
              RÉSUMÉ
          ================================================= */}

          <div className="mb-10 grid grid-cols-2 gap-px bg-surface lg:grid-cols-5">
            <div className="bg-background p-5">
              <p className="text-[8px] uppercase tracking-[0.3em] text-stone">
                Commandes
              </p>

              <p className="mt-3 font-display text-3xl">
                {orders.length}
              </p>
            </div>

            <div className="bg-background p-5">
              <p className="text-[8px] uppercase tracking-[0.3em] text-stone">
                Pièces
              </p>

              <p className="mt-3 font-display text-3xl">
                {totalPieces}
              </p>
            </div>

            <div className="bg-background p-5">
              <p className="text-[8px] uppercase tracking-[0.3em] text-stone">
                Préparation
              </p>

              <p className="mt-3 font-display text-3xl">
                {preparingCount}
              </p>
            </div>

            <div className="bg-background p-5">
              <p className="text-[8px] uppercase tracking-[0.3em] text-stone">
                Expédiées
              </p>

              <p className="mt-3 font-display text-3xl">
                {shippedCount}
              </p>
            </div>

            <div className="bg-background p-5">
              <p className="text-[8px] uppercase tracking-[0.3em] text-stone">
                Livrées
              </p>

              <p className="mt-3 font-display text-3xl">
                {deliveredCount}
              </p>
            </div>
          </div>

          {/* =================================================
              RECHERCHE
          ================================================= */}

          <div className="mb-8 flex flex-col gap-4 border-b border-surface pb-8 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-[9px] uppercase tracking-[0.3em] text-stone">
                Commandes payées
              </p>

              <p className="mt-2 font-display text-2xl">
                {orders.length}
              </p>
            </div>

            <input
              value={
                search
              }
              onChange={(
                event
              ) =>
                setSearch(
                  event
                    .target
                    .value
                )
              }
              placeholder="Nom, email, produit, adresse..."
              className="w-full border border-surface bg-transparent px-4 py-3 text-sm outline-none placeholder:text-stone/50 md:max-w-sm"
            />
          </div>

          {/* =================================================
              CHARGEMENT
          ================================================= */}

          {loading && (
            <p className="text-sm text-stone">
              Chargement des
              commandes...
            </p>
          )}

          {/* =================================================
              ERREUR
          ================================================= */}

          {error && (
            <div className="mb-8 border border-surface p-5">
              <p className="text-[9px] uppercase tracking-[0.3em] text-stone">
                Erreur
              </p>

              <p className="mt-3 text-sm">
                {error}
              </p>
            </div>
          )}

          {/* =================================================
              VIDE
          ================================================= */}

          {!loading &&
            !error &&
            filteredOrders.length ===
              0 && (
              <div className="border border-surface px-6 py-16 text-center">
                <p className="text-[10px] uppercase tracking-[0.35em] text-stone">
                  Administration AJVEK
                </p>

                <h2 className="mt-5 font-display text-3xl">
                  {search
                    ? "Aucun résultat."
                    : "Aucune commande payée."}
                </h2>
              </div>
            )}

          {/* =================================================
              COMMANDES
          ================================================= */}

          {!loading && (
            <div className="space-y-8">
              {filteredOrders.map(
                (order) => {
                  const draft =
                    drafts[
                      order
                        .checkout_group_id
                    ];

                  if (!draft) {
                    return null;
                  }

                  const pieceCount =
                    order.items.reduce(
                      (
                        total,
                        item
                      ) =>
                        total +
                        item.quantity,
                      0
                    );

                  const homeAddress =
                    order.shipping_address;

                  const hasHomeAddress =
                    order.delivery_method ===
                      "home" &&
                    Boolean(
                      homeAddress &&
                        (
                          homeAddress.name ||
                          homeAddress.address_line1 ||
                          homeAddress.address_line2 ||
                          homeAddress.postal_code ||
                          homeAddress.city ||
                          homeAddress.country
                        )
                    );

                  return (
                    <article
                      key={
                        order.checkout_group_id
                      }
                      className="border border-surface"
                    >
                      {/* =====================================
                          HEADER
                      ====================================== */}

                      <div className="border-b border-surface px-5 py-6 md:px-7">
                        <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
                          <div>
                            <p className="text-[9px] uppercase tracking-[0.3em] text-stone">
                              Commande
                            </p>

                            <h2 className="mt-2 font-display text-2xl">
                              #
                              {shortOrderId(
                                order.checkout_group_id
                              )}
                            </h2>

                            <p className="mt-4 text-sm">
                              {
                                order
                                  .customer
                                  .name
                              }
                            </p>

                            <p className="mt-1 text-xs text-stone">
                              {
                                order
                                  .customer
                                  .email
                              }
                            </p>

                            {order
                              .customer
                              .phone && (
                              <p className="mt-1 text-xs text-stone">
                                {
                                  order
                                    .customer
                                    .phone
                                }
                              </p>
                            )}
                          </div>

                          <div className="md:text-right">
                            <p className="text-[9px] uppercase tracking-[0.3em] text-stone">
                              Paiement
                            </p>

                            <p className="mt-2 text-xs">
                              {formatDate(
                                order.paid_at
                              )}
                            </p>

                            <p className="mt-3 text-[10px] text-stone">
                              {
                                pieceCount
                              }{" "}
                              pièce
                              {pieceCount >
                              1
                                ? "s"
                                : ""}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="grid lg:grid-cols-[1fr_0.9fr]">
                        {/* ===================================
                            ARTICLES + LIVRAISON
                        ==================================== */}

                        <div className="border-b border-surface p-5 md:p-7 lg:border-b-0 lg:border-r">
                          <p className="text-[9px] uppercase tracking-[0.3em] text-stone">
                            Articles
                          </p>

                          <div className="mt-5 divide-y divide-surface border-y border-surface">
                            {order.items.map(
                              (
                                item,
                                index
                              ) => (
                                <div
                                  key={`${item.product_slug}-${item.color}-${item.size}-${index}`}
                                  className="flex items-start justify-between gap-4 py-4"
                                >
                                  <div>
                                    <p className="font-display text-lg">
                                      {
                                        item.product_name
                                      }
                                    </p>

                                    <p className="mt-1 text-xs text-stone">
                                      {
                                        item.color
                                      }{" "}
                                      · Taille{" "}
                                      {
                                        item.size
                                      }
                                    </p>
                                  </div>

                                  <p className="text-xs text-stone">
                                    ×{" "}
                                    {
                                      item.quantity
                                    }
                                  </p>
                                </div>
                              )
                            )}
                          </div>

                          {/* ===============================
                              LIVRAISON
                          ================================ */}

                          <div className="mt-7">
                            <p className="text-[9px] uppercase tracking-[0.3em] text-stone">
                              Livraison
                            </p>

                            <p className="mt-3 text-sm">
                              {order.delivery_method ===
                              "relay"
                                ? "Point Relais Mondial Relay"
                                : order.delivery_method ===
                                    "home"
                                  ? "Livraison à domicile"
                                  : "Mode de livraison non renseigné"}
                            </p>

                            <p className="mt-2 text-xs text-stone">
                              {order.shipping_amount ===
                              0
                                ? "Livraison offerte"
                                : formatPrice(
                                    order.shipping_amount
                                  )}
                            </p>

                            {/* POINT RELAIS */}

                            {order.delivery_method ===
                              "relay" &&
                              order.service_point && (
                                <div className="mt-4 border-l border-surface pl-4 text-xs leading-5 text-stone">
                                  <p className="text-foreground">
                                    {order
                                      .service_point
                                      .name ||
                                      "Point Relais"}
                                  </p>

                                  {order
                                    .service_point
                                    .address && (
                                    <p className="mt-1">
                                      {
                                        order
                                          .service_point
                                          .address
                                      }
                                    </p>
                                  )}

                                  {(order
                                    .service_point
                                    .postal_code ||
                                    order
                                      .service_point
                                      .city) && (
                                    <p>
                                      {
                                        order
                                          .service_point
                                          .postal_code
                                      }{" "}
                                      {
                                        order
                                          .service_point
                                          .city
                                      }
                                    </p>
                                  )}
                                </div>
                              )}

                            {/* DOMICILE */}

                            {hasHomeAddress &&
                              homeAddress && (
                                <div className="mt-4 border-l border-surface pl-4 text-xs leading-5 text-stone">
                                  <p className="mb-2 text-[8px] uppercase tracking-[0.25em] text-stone">
                                    Adresse de livraison
                                  </p>

                                  {homeAddress.name && (
                                    <p className="text-foreground">
                                      {
                                        homeAddress.name
                                      }
                                    </p>
                                  )}

                                  {homeAddress.address_line1 && (
                                    <p className="mt-1">
                                      {
                                        homeAddress.address_line1
                                      }
                                    </p>
                                  )}

                                  {homeAddress.address_line2 && (
                                    <p>
                                      {
                                        homeAddress.address_line2
                                      }
                                    </p>
                                  )}

                                  {(homeAddress.postal_code ||
                                    homeAddress.city) && (
                                    <p>
                                      {
                                        homeAddress.postal_code
                                      }{" "}
                                      {
                                        homeAddress.city
                                      }
                                    </p>
                                  )}

                                  {homeAddress.country && (
                                    <p>
                                      {countryLabel(
                                        homeAddress.country
                                      )}
                                    </p>
                                  )}
                                </div>
                              )}

                            {order.delivery_method ===
                              "home" &&
                              !hasHomeAddress && (
                                <div className="mt-4 border border-surface p-4">
                                  <p className="text-xs leading-5 text-stone">
                                    Adresse de
                                    livraison non
                                    enregistrée pour
                                    cette commande.
                                  </p>
                                </div>
                              )}
                          </div>

                          {/* ===============================
                              DATES LOGISTIQUES
                          ================================ */}

                          {(order.shipped_at ||
                            order.delivered_at) && (
                            <div className="mt-7 border-t border-surface pt-6">
                              {order.shipped_at && (
                                <p className="text-xs text-stone">
                                  Expédiée :{" "}
                                  <span className="text-foreground">
                                    {formatDate(
                                      order.shipped_at
                                    )}
                                  </span>
                                </p>
                              )}

                              {order.delivered_at && (
                                <p className="mt-2 text-xs text-stone">
                                  Livrée :{" "}
                                  <span className="text-foreground">
                                    {formatDate(
                                      order.delivered_at
                                    )}
                                  </span>
                                </p>
                              )}
                            </div>
                          )}
                        </div>

                        {/* ===================================
                            GESTION
                        ==================================== */}

                        <div className="p-5 md:p-7">
                          <p className="text-[9px] uppercase tracking-[0.3em] text-stone">
                            Gestion
                          </p>

                          <div className="mt-5 space-y-5">
                            {/* STATUT */}

                            <div>
                              <label className="text-[10px] uppercase tracking-[0.2em] text-stone">
                                Statut
                              </label>

                              <select
                                value={
                                  draft.status
                                }
                                onChange={(
                                  event
                                ) =>
                                  updateDraft(
                                    order.checkout_group_id,
                                    {
                                      status:
                                        event
                                          .target
                                          .value,
                                    }
                                  )
                                }
                                className="mt-2 w-full border border-surface bg-background px-4 py-3 text-sm outline-none"
                              >
                                {STATUS_OPTIONS.map(
                                  (
                                    status
                                  ) => (
                                    <option
                                      key={
                                        status.value
                                      }
                                      value={
                                        status.value
                                      }
                                    >
                                      {
                                        status.label
                                      }
                                    </option>
                                  )
                                )}
                              </select>
                            </div>

                            {/* TRANSPORTEUR */}

                            <div>
                              <label className="text-[10px] uppercase tracking-[0.2em] text-stone">
                                Transporteur
                              </label>

                              <input
                                value={
                                  draft.carrier
                                }
                                onChange={(
                                  event
                                ) =>
                                  updateDraft(
                                    order.checkout_group_id,
                                    {
                                      carrier:
                                        event
                                          .target
                                          .value,
                                    }
                                  )
                                }
                                placeholder="Mondial Relay"
                                className="mt-2 w-full border border-surface bg-transparent px-4 py-3 text-sm outline-none"
                              />
                            </div>

                            {/* NUMÉRO DE SUIVI */}

                            <div>
                              <label className="text-[10px] uppercase tracking-[0.2em] text-stone">
                                Numéro de suivi
                              </label>

                              <input
                                value={
                                  draft.tracking_number
                                }
                                onChange={(
                                  event
                                ) =>
                                  updateDraft(
                                    order.checkout_group_id,
                                    {
                                      tracking_number:
                                        event
                                          .target
                                          .value,
                                    }
                                  )
                                }
                                placeholder="123456789"
                                className="mt-2 w-full border border-surface bg-transparent px-4 py-3 text-sm outline-none"
                              />
                            </div>

                            {/* LIEN DE SUIVI */}

                            <div>
                              <label className="text-[10px] uppercase tracking-[0.2em] text-stone">
                                Lien de suivi
                              </label>

                              <input
                                value={
                                  draft.tracking_url
                                }
                                onChange={(
                                  event
                                ) =>
                                  updateDraft(
                                    order.checkout_group_id,
                                    {
                                      tracking_url:
                                        event
                                          .target
                                          .value,
                                    }
                                  )
                                }
                                placeholder="https://..."
                                className="mt-2 w-full border border-surface bg-transparent px-4 py-3 text-sm outline-none"
                              />
                            </div>

                            {/* ENREGISTRER */}

                            <button
                              type="button"
                              onClick={() =>
                                saveOrder(
                                  order
                                )
                              }
                              disabled={
                                savingId ===
                                order.checkout_group_id
                              }
                              className="w-full bg-foreground px-5 py-4 text-[10px] uppercase tracking-[0.25em] text-background transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              {savingId ===
                              order.checkout_group_id
                                ? "Enregistrement..."
                                : "Enregistrer les modifications"}
                            </button>

                            {draft.status ===
                              "shipped" &&
                              !draft.tracking_number && (
                                <p className="text-[10px] leading-5 text-stone">
                                  Pense à renseigner
                                  le numéro de suivi
                                  avant de passer la
                                  commande en
                                  « Expédiée ».
                                </p>
                              )}
                          </div>
                        </div>
                      </div>
                    </article>
                  );
                }
              )}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}