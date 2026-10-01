import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import crypto from "crypto";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY;

function hashToken(token: string) {
  return crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");
}

export async function GET(request: NextRequest) {
  try {
    if (!supabaseUrl || !serviceRoleKey) {
      console.error(
        "[my-participation] Supabase configuration missing."
      );

      return NextResponse.json(
        {
          authenticated: false,
          participation: null,
        },
        { status: 500 }
      );
    }

    const sessionToken =
      request.cookies.get(
        "ajvek_tiktok_session"
      )?.value;

    if (!sessionToken) {
      return NextResponse.json({
        authenticated: false,
        participation: null,
      });
    }

    const supabase = createClient(
      supabaseUrl,
      serviceRoleKey,
      {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
        },
      }
    );

    const sessionTokenHash =
      hashToken(sessionToken);

    /*
     * Retrouve la session AJVEK associée
     * au navigateur.
     */
    const {
      data: session,
      error: sessionError,
    } = await supabase
      .from("contest_tiktok_sessions")
      .select(
        `
          tiktok_open_id,
          expires_at
        `
      )
      .eq(
        "session_token_hash",
        sessionTokenHash
      )
      .maybeSingle();

    if (sessionError) {
      console.error(
        "[my-participation] Session lookup:",
        sessionError
      );

      return NextResponse.json(
        {
          authenticated: false,
          participation: null,
        },
        { status: 500 }
      );
    }

    if (!session) {
      return NextResponse.json({
        authenticated: false,
        participation: null,
      });
    }

    /*
     * Refuse une session expirée.
     */
    if (
      new Date(session.expires_at).getTime() <=
      Date.now()
    ) {
      await supabase
        .from("contest_tiktok_sessions")
        .delete()
        .eq(
          "session_token_hash",
          sessionTokenHash
        );

      const response = NextResponse.json({
        authenticated: false,
        participation: null,
      });

      response.cookies.set(
        "ajvek_tiktok_session",
        "",
        {
          httpOnly: true,
          secure: true,
          sameSite: "lax",
          path: "/",
          maxAge: 0,
        }
      );

      return response;
    }

    /*
     * Même logique que /api/contests/current :
     * on cherche le concours public actuel.
     *
     * Le draft reste volontairement invisible.
     */
    const {
      data: contest,
      error: contestError,
    } = await supabase
      .from("contests")
      .select("id")
      .in("status", [
        "registration",
        "waiting",
        "drawing",
        "completed",
      ])
      .order("created_at", {
        ascending: false,
      })
      .limit(1)
      .maybeSingle();

    if (contestError) {
      console.error(
        "[my-participation] Contest lookup:",
        contestError
      );

      return NextResponse.json(
        {
          authenticated: true,
          participation: null,
        },
        { status: 500 }
      );
    }

    if (!contest) {
      return NextResponse.json({
        authenticated: true,
        participation: null,
      });
    }

    /*
     * Recherche uniquement la participation
     * de cet utilisateur au concours actuel.
     */
    const {
      data: participation,
      error: participationError,
    } = await supabase
      .from("contest_participants")
      .select(
        `
          product_slug,
          color,
          size,
          created_at
        `
      )
      .eq("contest_id", contest.id)
      .eq(
        "tiktok_open_id",
        session.tiktok_open_id
      )
      .maybeSingle();

    if (participationError) {
      console.error(
        "[my-participation] Participation lookup:",
        participationError
      );

      return NextResponse.json(
        {
          authenticated: true,
          participation: null,
        },
        { status: 500 }
      );
    }

    if (!participation) {
      return NextResponse.json({
        authenticated: true,
        participation: null,
      });
    }

    return NextResponse.json({
      authenticated: true,

      participation: {
        productSlug:
          participation.product_slug,
        color: participation.color,
        size: participation.size,
        createdAt:
          participation.created_at,
      },
    });
  } catch (error) {
    console.error(
      "[my-participation] Unexpected error:",
      error
    );

    return NextResponse.json(
      {
        authenticated: false,
        participation: null,
      },
      { status: 500 }
    );
  }
}