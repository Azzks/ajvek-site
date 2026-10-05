import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || "")
  .split(",")
  .map((email) => email.trim().toLowerCase())
  .filter(Boolean);

type CounterKey =
  | "manual_orders"
  | "manual_pieces"
  | "manual_preparing"
  | "manual_shipped"
  | "manual_delivered";

const VALID_COUNTERS: CounterKey[] = [
  "manual_orders",
  "manual_pieces",
  "manual_preparing",
  "manual_shipped",
  "manual_delivered",
];

async function requireAdmin(request: NextRequest) {
  const authorization = request.headers.get("authorization");

  if (!authorization?.startsWith("Bearer ")) {
    return null;
  }

  const token = authorization.slice(7);

  const supabaseAuth = createClient(
    supabaseUrl,
    supabaseAnonKey,
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    }
  );

  const {
    data: { user },
    error,
  } = await supabaseAuth.auth.getUser(token);

  if (error || !user?.email) {
    return null;
  }

  if (!ADMIN_EMAILS.includes(user.email.toLowerCase())) {
    return null;
  }

  return user;
}

function serviceClient() {
  return createClient(
    supabaseUrl,
    supabaseServiceRoleKey,
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    }
  );
}

export async function GET(request: NextRequest) {
  const admin = await requireAdmin(request);

  if (!admin) {
    return NextResponse.json(
      { error: "Non autorisé." },
      { status: 401 }
    );
  }

  const supabase = serviceClient();

  const { data, error } = await supabase
    .from("admin_manual_counters")
    .select(
      `
        manual_orders,
        manual_pieces,
        manual_preparing,
        manual_shipped,
        manual_delivered
      `
    )
    .eq("id", 1)
    .single();

  if (error) {
    console.error("[admin-counters/get]", error);

    return NextResponse.json(
      { error: "Impossible de charger les compteurs." },
      { status: 500 }
    );
  }

  return NextResponse.json({
    counters: data,
  });
}

export async function PATCH(request: NextRequest) {
  const admin = await requireAdmin(request);

  if (!admin) {
    return NextResponse.json(
      { error: "Non autorisé." },
      { status: 401 }
    );
  }

  try {
    const body = await request.json();

    const counter = body.counter as CounterKey;
    const adjustment = Number(body.adjustment);

    if (!VALID_COUNTERS.includes(counter)) {
      return NextResponse.json(
        { error: "Compteur invalide." },
        { status: 400 }
      );
    }

    if (adjustment !== 1 && adjustment !== -1) {
      return NextResponse.json(
        { error: "Ajustement invalide." },
        { status: 400 }
      );
    }

    const supabase = serviceClient();

    const { data: current, error: readError } =
      await supabase
        .from("admin_manual_counters")
        .select("*")
        .eq("id", 1)
        .single();

    if (readError || !current) {
      console.error(
        "[admin-counters/read]",
        readError
      );

      return NextResponse.json(
        { error: "Impossible de lire les compteurs." },
        { status: 500 }
      );
    }

    const currentValue = Math.max(
      Number(current[counter] ?? 0),
      0
    );

    const newValue = Math.max(
      currentValue + adjustment,
      0
    );

    const { data: updated, error: updateError } =
      await supabase
        .from("admin_manual_counters")
        .update({
          [counter]: newValue,
          updated_at: new Date().toISOString(),
        })
        .eq("id", 1)
        .select(
          `
            manual_orders,
            manual_pieces,
            manual_preparing,
            manual_shipped,
            manual_delivered
          `
        )
        .single();

    if (updateError) {
      console.error(
        "[admin-counters/update]",
        updateError
      );

      return NextResponse.json(
        { error: "Impossible de modifier le compteur." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      counters: updated,
    });
  } catch (error) {
    console.error("[admin-counters]", error);

    return NextResponse.json(
      { error: "Erreur serveur." },
      { status: 500 }
    );
  }
}