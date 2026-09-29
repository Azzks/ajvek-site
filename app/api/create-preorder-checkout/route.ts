import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import Stripe from "stripe";
import { randomUUID } from "crypto";
import { getProduct } from "@/lib/products";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

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

const SITE_URL = "https://ajvek.fr";

type CheckoutItem = {
  product_slug: string;
  color: string;
  size: string;
  quantity: number;
};

type DeliveryMethod = "relay" | "home";

type ServicePoint = {
  id: number | string;
  name?: string;
  street?: string;
  houseNumber?: string;
  postalCode?: string;
  city?: string;
  carrier?: string;
};
type SendcloudServicePoint = {
  id: number | string;
  name?: string;
  street?: string;
  house_number?: string;
  postal_code?: string;
  city?: string;
  carrier?: string;
};

type VerifiedServicePoint = {
  id: string;
  name: string;
  street: string;
  houseNumber: string;
  postalCode: string;
  city: string;
  carrier: string;
};

async function verifySendcloudServicePoint(
  servicePoint: ServicePoint
): Promise<VerifiedServicePoint | null> {
  const publicKey =
    process.env.SENDCLOUD_PUBLIC_KEY;

  const secretKey =
    process.env.SENDCLOUD_SECRET_KEY;

  if (!publicKey || !secretKey) {
    console.error(
      "[create-checkout] Configuration Sendcloud serveur manquante."
    );

    throw new Error(
      "Configuration Sendcloud indisponible."
    );
  }

  const requestedId =
    String(servicePoint.id ?? "").trim();

  const requestedPostalCode =
    String(
      servicePoint.postalCode ?? ""
    ).trim();

  if (
    !requestedId ||
    !/^\d{5}$/.test(requestedPostalCode)
  ) {
    return null;
  }

  const credentials = Buffer.from(
    `${publicKey}:${secretKey}`
  ).toString("base64");

  const params = new URLSearchParams({
    country: "FR",
    address: requestedPostalCode,
    radius: "5000",
  });

  let response: Response;

  try {
    response = await fetch(
      `https://servicepoints.sendcloud.sc/api/v2/service-points?${params.toString()}`,
      {
        method: "GET",
        headers: {
          Authorization: `Basic ${credentials}`,
          Accept: "application/json",
        },
        cache: "no-store",
      }
    );
  } catch (error) {
    console.error(
      "[create-checkout] API Sendcloud inaccessible :",
      error
    );

    throw new Error(
      "Impossible de vérifier le Point Relais."
    );
  }

  if (!response.ok) {
    console.error(
      "[create-checkout] Erreur API Sendcloud :",
      {
        status: response.status,
        statusText: response.statusText,
      }
    );

    throw new Error(
      "Impossible de vérifier le Point Relais."
    );
  }

  let data: unknown;

  try {
    data = await response.json();
  } catch (error) {
    console.error(
      "[create-checkout] Réponse Sendcloud invalide :",
      error
    );

    throw new Error(
      "Réponse Sendcloud invalide."
    );
  }

  if (!Array.isArray(data)) {
    console.error(
      "[create-checkout] Format Sendcloud inattendu."
    );

    throw new Error(
      "Réponse Sendcloud invalide."
    );
  }

  const points =
    data as SendcloudServicePoint[];

  const matchingPoint = points.find(
    (point) =>
      String(point.id) === requestedId
  );

  if (!matchingPoint) {
    return null;
  }

  const carrier = String(
    matchingPoint.carrier ?? ""
  )
    .trim()
    .toLocaleLowerCase("fr-FR");

  if (
    carrier !== "mondial_relay" &&
    carrier !== "mondial relay"
  ) {
    console.warn(
      "[create-checkout] Transporteur Point Relais refusé :",
      {
        servicePointId: requestedId,
        carrier,
      }
    );

    return null;
  }

  const postalCode = String(
    matchingPoint.postal_code ?? ""
  ).trim();

  const city = String(
    matchingPoint.city ?? ""
  ).trim();

  const street = String(
    matchingPoint.street ?? ""
  ).trim();

  const houseNumber = String(
    matchingPoint.house_number ?? ""
  ).trim();

  const name = String(
    matchingPoint.name ??
      "Point Relais Mondial Relay"
  ).trim();

  if (
    !postalCode ||
    !city ||
    !street
  ) {
    console.error(
      "[create-checkout] Point Relais Sendcloud incomplet :",
      {
        servicePointId: requestedId,
      }
    );

    return null;
  }

  return {
    id: String(matchingPoint.id),
    name,
    street,
    houseNumber,
    postalCode,
    city,
    carrier: "mondial_relay",
  };
}
type ValidatedItem = {
  product_slug: string;
  product_name: string;
  color: string;
  size: string;
  quantity: number;
  priceValue: number;
};

type StockRow = {
  product_slug: string;
  color: string;
  size: string;
  stock_quantity: number;
  sales_enabled: boolean;
};

function normalize(value: string) {
  return value.trim().toLocaleLowerCase("fr-FR");
}

async function deleteTemporaryOrder(
  checkoutGroupId: string
) {
  const { error } = await supabaseAdmin
    .from("preorders")
    .delete()
    .eq("checkout_group_id", checkoutGroupId)
    .eq("paid", false);

  if (error) {
    console.error(
      "[create-checkout] Impossible de supprimer la commande temporaire :",
      error
    );
  }
}
async function deleteCheckoutAttempt(
  checkoutAttemptId: string
) {
  const { error } = await supabaseAdmin
    .from("checkout_attempts")
    .delete()
    .eq(
      "checkout_attempt_id",
      checkoutAttemptId
    );

  if (error) {
    console.error(
      "[create-checkout] Impossible de libérer la tentative de paiement :",
      {
        checkoutAttemptId,
        error,
      }
    );

    return false;
  }

  return true;
}
async function releaseReservation(
  checkoutGroupId: string
) {
  const { data, error } = await supabaseAdmin.rpc(
    "release_stock_reservation",
    {
      p_checkout_group_id: checkoutGroupId,
    }
  );

  if (error) {
    console.error(
      "[create-checkout] Impossible de libérer la réservation :",
      {
        checkoutGroupId,
        error,
      }
    );

    return false;
  }

  if (data?.success !== true) {
    console.error(
      "[create-checkout] Résultat inattendu lors de la libération de la réservation :",
      {
        checkoutGroupId,
        data,
      }
    );

    return false;
  }

  return true;
}

async function expireStripeSession(
  sessionId: string
) {
  try {
    await stripe.checkout.sessions.expire(
      sessionId
    );
  } catch (error) {
    console.error(
      "[create-checkout] Impossible d’expirer la session Stripe :",
      {
        sessionId,
        error,
      }
    );
  }
}

export async function POST(
  request: Request
) {
  try {
    // ========================================================
    // 1. AUTHENTIFICATION
    // ========================================================

    const authorization =
      request.headers.get("authorization");

    if (
      !authorization?.startsWith("Bearer ")
    ) {
      return NextResponse.json(
        {
          error:
            "Connexion requise pour passer commande.",
        },
        {
          status: 401,
        }
      );
    }

    const accessToken =
      authorization.replace("Bearer ", "");

    const {
      data: { user },
      error: userError,
    } = await supabaseAuth.auth.getUser(
      accessToken
    );

    if (
      userError ||
      !user ||
      !user.email
    ) {
      return NextResponse.json(
        {
          error:
            "Session utilisateur invalide ou expirée.",
        },
        {
          status: 401,
        }
      );
    }
    const adminEmails = (
      process.env.ADMIN_EMAILS || ""
    )
      .split(",")
      .map((email) =>
        email.trim().toLowerCase()
      )
      .filter(Boolean);

    const isAdmin =
      adminEmails.includes(
        user.email.toLowerCase()
      );
    // ========================================================
    // 2. DONNÉES
    // ========================================================

    let body: {
      checkout_attempt_id?: string;
      name?: string;
      phone?: string;
      items?: CheckoutItem[];
      delivery_method?: DeliveryMethod;
      service_point?: ServicePoint | null;
    };

    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        {
          error:
            "Données de commande invalides.",
        },
        {
          status: 400,
        }
      );
    }

    const {
      checkout_attempt_id,
      name,
      phone,
      items,
      delivery_method,
      service_point,
    } = body;
    if (
  !checkout_attempt_id ||
  !/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    checkout_attempt_id
  )
) {
  return NextResponse.json(
    {
      error: "Tentative de paiement invalide.",
    },
    {
      status: 400,
    }
  );
}

    if (!name?.trim()) {
      return NextResponse.json(
        {
          error: "Ton nom est requis.",
        },
        {
          status: 400,
        }
      );
    }

    if (
      !Array.isArray(items) ||
      items.length === 0
    ) {
      return NextResponse.json(
        {
          error: "Ton panier est vide.",
        },
        {
          status: 400,
        }
      );
    }

    if (
      delivery_method !== "relay" &&
      delivery_method !== "home"
    ) {
      return NextResponse.json(
        {
          error:
            "Mode de livraison invalide.",
        },
        {
          status: 400,
        }
      );
    }

    let verifiedServicePoint: VerifiedServicePoint | null = null;

if (delivery_method === "relay") {
  if (
    service_point?.id === undefined ||
    service_point?.id === null ||
    !service_point?.postalCode
  ) {
    return NextResponse.json(
      {
        error: "Choisis un Point Relais valide.",
      },
      {
        status: 400,
      }
    );
  }

  try {
    verifiedServicePoint =
      await verifySendcloudServicePoint(
        service_point
      );
  } catch (error) {
    console.error(
      "[create-checkout] Vérification du Point Relais impossible :",
      error
    );

    return NextResponse.json(
      {
        error:
          "Impossible de vérifier le Point Relais actuellement. Réessaie dans quelques instants.",
      },
      {
        status: 503,
      }
    );
  }

  if (!verifiedServicePoint) {
    return NextResponse.json(
      {
        error:
          "Ce Point Relais n'est pas valide. Choisis à nouveau ton Point Relais.",
      },
      {
        status: 400,
      }
    );
  }
}

    // ========================================================
    // 3. VALIDATION DES ARTICLES
    // ========================================================

    const mergedItems =
      new Map<string, ValidatedItem>();

    for (const item of items) {
      const quantity = Number(
        item.quantity
      );

      if (
        !item.product_slug ||
        !item.color ||
        !item.size ||
        !Number.isInteger(quantity) ||
        quantity < 1 ||
        quantity > 10
      ) {
        return NextResponse.json(
          {
            error:
              "Un article du panier est invalide.",
          },
          {
            status: 400,
          }
        );
      }

      const product = getProduct(
        item.product_slug
      );

      if (!product) {
        return NextResponse.json(
          {
            error:
              `Produit introuvable : ${item.product_slug}`,
          },
          {
            status: 404,
          }
        );
      }

      const colorway =
        product.colorways.find(
          (colorway) =>
            normalize(colorway.label) ===
            normalize(item.color)
        );

      if (!colorway) {
        return NextResponse.json(
          {
            error:
              `Couleur invalide pour ${product.name}.`,
          },
          {
            status: 400,
          }
        );
      }

      const validSize =
        product.sizes.find(
          (productSize) =>
            normalize(productSize) ===
            normalize(item.size)
        );

      if (!validSize) {
        return NextResponse.json(
          {
            error:
              `Taille invalide pour ${product.name}.`,
          },
          {
            status: 400,
          }
        );
      }

      const cleanColor =
        colorway.label;

      const cleanSize =
        validSize;

      const itemKey = [
        product.slug,
        normalize(cleanColor),
        normalize(cleanSize),
      ].join("::");

      const existingItem =
        mergedItems.get(itemKey);

      if (existingItem) {
        const newQuantity =
          existingItem.quantity +
          quantity;

        if (newQuantity > 10) {
          return NextResponse.json(
            {
              error:
                "La quantité maximale autorisée pour un même article est de 10.",
            },
            {
              status: 400,
            }
          );
        }

        existingItem.quantity =
          newQuantity;
      } else {
        mergedItems.set(
          itemKey,
          {
            product_slug:
              product.slug,
            product_name:
              product.name,
            color:
              cleanColor,
            size:
              cleanSize,
            quantity,
            priceValue:
              product.priceValue,
          }
        );
      }
    }

    const validatedItems =
      Array.from(
        mergedItems.values()
      );

    const totalQuantity =
      validatedItems.reduce(
        (total, item) =>
          total + item.quantity,
        0
      );

    if (totalQuantity > 20) {
      return NextResponse.json(
        {
          error:
            "La quantité maximale autorisée est de 20 vêtements par commande.",
        },
        {
          status: 400,
        }
      );
    }

    // ========================================================
    // 4. RÉCUPÉRATION DU STOCK
    // ========================================================

    const {
      data: stockData,
      error: stockError,
    } = await supabaseAdmin
      .from("product_stock")
      .select(`
        product_slug,
        color,
        size,
        stock_quantity,
        sales_enabled
      `);

    if (stockError) {
      console.error(
        "[create-checkout] Erreur récupération stock :",
        stockError
      );

      return NextResponse.json(
        {
          error:
            "Impossible de vérifier le stock actuellement.",
        },
        {
          status: 500,
        }
      );
    }

    const stockRows =
      (stockData ?? []) as StockRow[];

    // ========================================================
    // 5. VÉRIFICATION STOCK + OUVERTURE DES VENTES
    // ========================================================

    for (
      const item of validatedItems
    ) {
      const stockRow =
        stockRows.find(
          (row) =>
            row.product_slug ===
              item.product_slug &&
            normalize(row.color) ===
              normalize(item.color) &&
            normalize(row.size) ===
              normalize(item.size)
        );

      if (!stockRow) {
        return NextResponse.json(
          {
            error:
              `${item.product_name} — ${item.color} — Taille ${item.size} n'est pas disponible.`,
          },
          {
            status: 409,
          }
        );
      }

      if (
  stockRow.sales_enabled !== true &&
  !isAdmin
) {
  return NextResponse.json(
    {
      error:
        `${item.product_name} — ${item.color} — Taille ${item.size} sera bientôt disponible.`,
    },
    {
      status: 409,
    }
  );
}

      const availableStock =
        Math.max(
          Number(
            stockRow.stock_quantity ??
              0
          ),
          0
        );

      if (availableStock <= 0) {
        return NextResponse.json(
          {
            error:
              `${item.product_name} — ${item.color} — Taille ${item.size} est épuisé.`,
          },
          {
            status: 409,
          }
        );
      }

      if (
        item.quantity >
        availableStock
      ) {
        return NextResponse.json(
          {
            error:
              `Il ne reste que ${availableStock} exemplaire${
                availableStock > 1
                  ? "s"
                  : ""
              } de ${item.product_name} — ${item.color} — Taille ${item.size}.`,
          },
          {
            status: 409,
          }
        );
      }
    }

    // ========================================================
    // 6. LIVRAISON
    // ========================================================

    let shippingAmount = 0;

    if (totalQuantity < 3) {
      shippingAmount =
        delivery_method === "relay"
          ? 490
          : 790;
    }

    // ========================================================
    // 7. IDENTIFIANT UNIQUE DE COMMANDE
    // ========================================================
let isRetryExistingAttempt = false;

let checkoutGroupId = randomUUID();

const { error: checkoutAttemptError } = await supabaseAdmin
  .from("checkout_attempts")
  .insert({
    checkout_attempt_id,
    user_id: user.id,
    checkout_group_id: checkoutGroupId,
    status: "processing",
    updated_at: new Date().toISOString(),
  });

if (checkoutAttemptError) {
  if (checkoutAttemptError.code !== "23505") {
    console.error(
      "[create-checkout] Impossible de verrouiller la tentative :",
      checkoutAttemptError
    );

    return NextResponse.json(
      {
        error:
          "Impossible de préparer le paiement. Réessaie dans quelques instants.",
      },
      {
        status: 500,
      }
    );
  }

  const {
    data: existingAttempt,
    error: existingAttemptError,
  } = await supabaseAdmin
    .from("checkout_attempts")
    .select(`
      checkout_attempt_id,
      user_id,
      checkout_group_id,
      status,
      updated_at,
      stripe_session_id,
      checkout_url
    `)
    .eq("checkout_attempt_id", checkout_attempt_id)
    .maybeSingle();

  if (existingAttemptError || !existingAttempt) {
    console.error(
      "[create-checkout] Impossible de récupérer la tentative existante :",
      existingAttemptError
    );

    return NextResponse.json(
      {
        error:
          "Impossible de vérifier la tentative de paiement.",
        retryable: true,
      },
      {
        status: 503,
        headers: {
          "Cache-Control": "no-store, max-age=0",
        },
      }
    );
  }

  if (existingAttempt.user_id !== user.id) {
    return NextResponse.json(
      {
        error: "Tentative de paiement invalide.",
      },
      {
        status: 403,
      }
    );
  }

  checkoutGroupId =
    existingAttempt.checkout_group_id;

  isRetryExistingAttempt = true;

  const {
    data: existingOrders,
    error: existingOrdersError,
  } = await supabaseAdmin
    .from("preorders")
    .select(`
      stripe_session_id,
      checkout_url
    `)
    .eq(
      "checkout_group_id",
      checkoutGroupId
    )
    .eq("user_id", user.id)
    .limit(1);

  if (existingOrdersError) {
    console.error(
      "[create-checkout] Impossible de récupérer la commande existante :",
      existingOrdersError
    );

    return NextResponse.json(
      {
        error:
          "Impossible de vérifier la commande existante.",
        retryable: true,
      },
      {
        status: 503,
        headers: {
          "Cache-Control": "no-store, max-age=0",
        },
      }
    );
  }

  const existingOrder =
    existingOrders?.[0];

  const existingStripeSessionId =
    existingAttempt.stripe_session_id ??
    existingOrder?.stripe_session_id ??
    null;

  if (existingStripeSessionId) {
    let existingSession:
      Stripe.Checkout.Session;

    try {
      existingSession =
        await stripe.checkout.sessions.retrieve(
          existingStripeSessionId
        );
    } catch (error) {
      console.error(
        "[create-checkout] Impossible de récupérer la session Stripe existante :",
        error
      );

      return NextResponse.json(
        {
          error:
            "Impossible de reprendre la session de paiement.",
          retryable: true,
        },
        {
          status: 503,
          headers: {
            "Cache-Control":
              "no-store, max-age=0",
          },
        }
      );
    }

    if (
      existingSession.metadata
        ?.checkout_attempt_id !==
        checkout_attempt_id ||
      existingSession.metadata?.user_id !==
        user.id
    ) {
      return NextResponse.json(
        {
          error:
            "Session de paiement invalide.",
        },
        {
          status: 403,
        }
      );
    }

    if (
      existingSession.status === "open" &&
      existingSession.payment_status !==
        "paid" &&
      existingSession.url
    ) {
      return NextResponse.json(
        {
          url: existingSession.url,
          checkoutGroupId,
          resumed: true,
        },
        {
          headers: {
            "Cache-Control":
              "no-store, max-age=0",
          },
        }
      );
    }

    return NextResponse.json(
      {
        error:
          "Cette session de paiement n'est plus disponible.",
      },
      {
        status: 409,
      }
    );
  }

  const staleBefore = new Date(
    Date.now() - 2 * 60 * 1000
  ).toISOString();

  const canClaimRetry =
    existingAttempt.status === "retryable" ||
    (
      existingAttempt.status === "processing" &&
      typeof existingAttempt.updated_at === "string" &&
      existingAttempt.updated_at < staleBefore
    );

  if (!canClaimRetry) {
    return NextResponse.json(
      {
        error:
          "Une tentative de paiement est déjà en cours. Réessaie dans quelques instants.",
        retryable: true,
      },
      {
        status: 409,
        headers: {
          "Cache-Control":
            "no-store, max-age=0",
        },
      }
    );
  }

  let claimQuery = supabaseAdmin
    .from("checkout_attempts")
    .update({
      status: "processing",
      updated_at:
        new Date().toISOString(),
    })
    .eq(
      "checkout_attempt_id",
      checkout_attempt_id
    )
    .eq("user_id", user.id);

  if (existingAttempt.status === "retryable") {
    claimQuery = claimQuery.eq(
      "status",
      "retryable"
    );
  } else {
    claimQuery = claimQuery
      .eq("status", "processing")
      .lt("updated_at", staleBefore);
  }

  const {
    data: claimedAttempt,
    error: claimError,
  } = await claimQuery
    .select("checkout_attempt_id")
    .maybeSingle();

  if (claimError) {
    console.error(
      "[create-checkout] Impossible de reprendre la tentative :",
      claimError
    );

    return NextResponse.json(
      {
        error:
          "Impossible de reprendre la tentative de paiement.",
        retryable: true,
      },
      {
        status: 503,
        headers: {
          "Cache-Control":
            "no-store, max-age=0",
        },
      }
    );
  }

  if (!claimedAttempt) {
    return NextResponse.json(
      {
        error:
          "Une tentative de paiement est déjà en cours. Réessaie dans quelques instants.",
        retryable: true,
      },
      {
        status: 409,
        headers: {
          "Cache-Control":
            "no-store, max-age=0",
        },
      }
    );
  }
}
    const servicePointAddress =
  delivery_method === "relay" &&
  verifiedServicePoint
    ? [
        verifiedServicePoint.houseNumber,
        verifiedServicePoint.street,
      ]
        .filter(Boolean)
        .join(" ")
    : null;

    // ========================================================
    // 8. CRÉATION DES LIGNES DE COMMANDE
    // ========================================================

    const orderRows =
      validatedItems.flatMap(
        (item) =>
          Array.from(
            {
              length:
                item.quantity,
            },
            () => ({
              user_id:
                user.id,

              name:
                name.trim(),

              email:
                user.email!,

              phone:
                phone?.trim() ||
                null,

              product_slug:
                item.product_slug,

              product_name:
                item.product_name,

              color:
                item.color,

              size:
                item.size,

              paid: false,

              checkout_group_id:
                checkoutGroupId,
checkout_attempt_id:
  checkout_attempt_id,
              delivery_method,

              shipping_amount:
                shippingAmount,

              order_status:
                "awaiting_payment",

              service_point_id:
  delivery_method === "relay"
    ? verifiedServicePoint?.id ?? null
    : null,

service_point_name:
  delivery_method === "relay"
    ? verifiedServicePoint?.name ?? null
    : null,

service_point_address:
  delivery_method === "relay"
    ? servicePointAddress
    : null,

service_point_postal_code:
  delivery_method === "relay"
    ? verifiedServicePoint?.postalCode ?? null
    : null,

service_point_city:
  delivery_method === "relay"
    ? verifiedServicePoint?.city ?? null
    : null,
            })
          )
      );

    if (!isRetryExistingAttempt) {
  const {
    data: createdOrders,
    error: orderError,
  } = await supabaseAdmin
    .from("preorders")
    .insert(orderRows)
    .select();

  if (
    orderError ||
    !createdOrders ||
    createdOrders.length === 0
  ) {
    console.error(
      "[create-checkout] Erreur création commande :",
      orderError
    );

    await deleteCheckoutAttempt(
      checkout_attempt_id
    );

    return NextResponse.json(
      {
        error:
          "Impossible de créer la commande.",
      },
      {
        status: 500,
      }
    );
  }
}

    // ========================================================
    // 9. ARTICLES STRIPE
    // ========================================================

    const lineItems:
      Stripe.Checkout.SessionCreateParams.LineItem[] =
      validatedItems.map(
        (item) => ({
          price_data: {
            currency: "eur",

            product_data: {
              name:
                `${item.product_name} — ${item.color} — Taille ${item.size}`,

              description:
                "AJVEK · Drop 001",
            },

            unit_amount:
              Math.round(
                item.priceValue *
                  100
              ),
          },

          quantity:
            item.quantity,
        })
      );

    const shippingLabel =
      delivery_method === "relay"
        ? "Mondial Relay — Point Relais"
        : "Livraison à domicile";

    // ========================================================
    // 10. SESSION STRIPE
    // ========================================================

    const sessionParams:
      Stripe.Checkout.SessionCreateParams =
      {
        mode: "payment",

        customer_email:
          user.email,

        payment_method_types: [
          "card",
        ],

        allow_promotion_codes:
          true,

        payment_intent_data: {
          metadata: {
            checkout_group_id:
              checkoutGroupId,

checkout_attempt_id:
  checkout_attempt_id,

            user_id:
              user.id,

            order_type:
              "stock",
          },
        },

        line_items:
          lineItems,

        shipping_options: [
          {
            shipping_rate_data: {
              type:
                "fixed_amount",

              fixed_amount: {
                amount:
                  shippingAmount,

                currency:
                  "eur",
              },

              display_name:
                shippingAmount === 0
                  ? `${shippingLabel} — offerte`
                  : shippingLabel,
            },
          },
        ],

        metadata: {
          checkout_group_id:
            checkoutGroupId,
           
            checkout_attempt_id:
  checkout_attempt_id,

          user_id:
            user.id,

          item_count:
            String(
              totalQuantity
            ),

          delivery_method,

          order_type:
            "stock",

          service_point_id:
  delivery_method === "relay"
    ? verifiedServicePoint?.id ?? ""
    : "",
        },

        success_url:
          `${SITE_URL}/paiement/succes?session_id={CHECKOUT_SESSION_ID}`,

        cancel_url:
          `${SITE_URL}/paiement/annule`,
      };

    if (
      delivery_method === "home"
    ) {
      sessionParams.shipping_address_collection =
        {
          allowed_countries: [
            "FR",
          ],
        };
    }

    // ========================================================
    // 11. CRÉATION SESSION STRIPE
    // ========================================================

    let session:
      Stripe.Checkout.Session;

    try {
      session =
  await stripe.checkout.sessions.create(
    sessionParams,
    {
      idempotencyKey:
        `checkout_${checkout_attempt_id}`,
    }
  );
    } catch (error) {
  console.error(
    "[create-checkout] Création/récupération de la session Stripe impossible :",
    {
      checkoutAttemptId:
        checkout_attempt_id,
      checkoutGroupId,
      error,
    }
  );

  const {
    error: retryStateError,
  } = await supabaseAdmin
    .from("checkout_attempts")
    .update({
      status: "retryable",
      updated_at:
        new Date().toISOString(),
    })
    .eq(
      "checkout_attempt_id",
      checkout_attempt_id
    )
    .eq("user_id", user.id)
    .eq(
      "checkout_group_id",
      checkoutGroupId
    )
    .eq("status", "processing");

  if (retryStateError) {
    console.error(
      "[create-checkout] Impossible de marquer la tentative comme réessayable :",
      retryStateError
    );
  }

  return NextResponse.json(
    {
      error:
        "Impossible de préparer le paiement actuellement. Réessaie dans quelques instants.",
      retryable: true,
    },
    {
      status: 503,
      headers: {
        "Cache-Control":
          "no-store, max-age=0",
      },
    }
  );
}

    // ========================================================
    // 12. RÉSERVATION ATOMIQUE DU STOCK
    // ========================================================
    //
    // La session Stripe existe mais son URL n'a encore jamais
    // été transmise au navigateur.
    //
    // On utilise la date d'expiration de Stripe pour la
    // réservation Supabase.
    // ========================================================

    const reservationExpiresAt =
      new Date(
        session.expires_at * 1000
      ).toISOString();

    const reservationItems =
      validatedItems.map(
        (item) => ({
          product_slug:
            item.product_slug,
          color:
            item.color,
          size:
            item.size,
          quantity:
            item.quantity,
        })
      );

    const {
      data: reservationResult,
      error: reservationError,
    } = await supabaseAdmin.rpc(
      "reserve_order_stock",
      {
        p_checkout_group_id:
          checkoutGroupId,

        p_items:
          reservationItems,

        p_expires_at:
          reservationExpiresAt,
          
          p_allow_closed_sales:
  isAdmin,
      }
    );

    if (
      reservationError ||
      reservationResult?.success !==
        true
    ) {
      console.error(
        "[create-checkout] Réservation du stock impossible :",
        {
          checkoutGroupId,
          error:
            reservationError,
          result:
            reservationResult,
        }
      );

      await expireStripeSession(
        session.id
      );

      await deleteTemporaryOrder(
        checkoutGroupId
      );
await deleteCheckoutAttempt(
  checkout_attempt_id
);
      return NextResponse.json(
        {
          error:
            "Le stock vient de changer. Vérifie ton panier puis réessaie.",
        },
        {
          status: 409,
        }
      );
    }

    // ========================================================
    // 13. VÉRIFICATION URL STRIPE
    // ========================================================

    if (!session.url) {
      await expireStripeSession(
        session.id
      );

      const released =
        await releaseReservation(
          checkoutGroupId
        );

      if (!released) {
        return NextResponse.json(
          {
            error:
              "Erreur lors de l’annulation de la réservation. Réessaie dans quelques instants.",
          },
          {
            status: 500,
          }
        );
      }

      await deleteTemporaryOrder(
        checkoutGroupId
      );
await deleteCheckoutAttempt(
  checkout_attempt_id
);
      return NextResponse.json(
        {
          error:
            "Stripe n'a pas retourné de lien de paiement.",
        },
        {
          status: 500,
        }
      );
    }

    // ========================================================
    // 14. SAUVEGARDE SESSION STRIPE
    // ========================================================

    const {
      error: updateError,
    } = await supabaseAdmin
      .from("preorders")
      .update({
        stripe_session_id:
          session.id,

        checkout_url:
          session.url,
      })
      .eq(
        "checkout_group_id",
        checkoutGroupId
      );

    if (updateError) {
      console.error(
        "[create-checkout] Erreur sauvegarde session Stripe :",
        updateError
      );

      await expireStripeSession(
        session.id
      );

      const released =
        await releaseReservation(
          checkoutGroupId
        );

      if (!released) {
        return NextResponse.json(
          {
            error:
              "La session de paiement n’a pas pu être enregistrée et la réservation nécessite une vérification.",
          },
          {
            status: 500,
          }
        );
      }

      await deleteTemporaryOrder(
        checkoutGroupId
      );
await deleteCheckoutAttempt(
  checkout_attempt_id
);
      return NextResponse.json(
        {
          error:
            "Impossible de préparer le paiement. Réessaie dans quelques instants.",
        },
        {
          status: 500,
        }
      );
    }
const {
  error: attemptReadyError,
} = await supabaseAdmin
  .from("checkout_attempts")
  .update({
    status: "ready",
    stripe_session_id:
      session.id,
    checkout_url:
      session.url,
    updated_at:
      new Date().toISOString(),
  })
  .eq(
    "checkout_attempt_id",
    checkout_attempt_id
  )
  .eq("user_id", user.id)
  .eq(
    "checkout_group_id",
    checkoutGroupId
  )
  .eq("status", "processing");

if (attemptReadyError) {
  console.error(
    "[create-checkout] Impossible d'enregistrer l'état final de la tentative :",
    attemptReadyError
  );

  await expireStripeSession(
    session.id
  );

  const released =
    await releaseReservation(
      checkoutGroupId
    );

  if (!released) {
    return NextResponse.json(
      {
        error:
          "La tentative de paiement nécessite une vérification. Réessaie dans quelques instants.",
        retryable: true,
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

  await deleteTemporaryOrder(
    checkoutGroupId
  );

  await deleteCheckoutAttempt(
    checkout_attempt_id
  );

  return NextResponse.json(
    {
      error:
        "Impossible de finaliser la session de paiement. Réessaie dans quelques instants.",
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
    // ========================================================
    // 15. RÉPONSE
    // ========================================================

    return NextResponse.json(
      {
        url:
          session.url,

        checkoutGroupId,

        itemCount:
          totalQuantity,

        shippingAmount,

        deliveryMethod:
          delivery_method,
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
      "[create-checkout] Erreur générale :",
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