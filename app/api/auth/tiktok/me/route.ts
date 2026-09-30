import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import crypto from "crypto";

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

function hashSessionToken(token: string) {
  return crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");
}

export async function GET(
  request: NextRequest
) {
  try {
    const sessionToken =
      request.cookies.get(
        "ajvek_tiktok_session"
      )?.value;

    /*
     * Aucun cookie = utilisateur
     * non connecté à TikTok.
     */
    if (!sessionToken) {
      return NextResponse.json(
        {
          authenticated: false,
          user: null,
        },
        {
          headers: {
            "Cache-Control": "no-store",
          },
        }
      );
    }

    /*
     * On transforme le token reçu en hash.
     * C'est ce hash qui est recherché
     * dans Supabase.
     */
    const sessionTokenHash =
      hashSessionToken(sessionToken);

    const {
      data: session,
      error,
    } = await supabaseAdmin
      .from("contest_tiktok_sessions")
      .select(`
        tiktok_display_name,
        tiktok_avatar_url,
        expires_at
      `)
      .eq(
        "session_token_hash",
        sessionTokenHash
      )
      .maybeSingle();

    if (error) {
      console.error(
        "[tiktok/me] Lecture session impossible :",
        error
      );

      return NextResponse.json(
        {
          authenticated: false,
          user: null,
        },
        {
          status: 500,
          headers: {
            "Cache-Control": "no-store",
          },
        }
      );
    }

    /*
     * Cookie inconnu ou session inexistante.
     */
    if (!session) {
      const response =
        NextResponse.json(
          {
            authenticated: false,
            user: null,
          },
          {
            headers: {
              "Cache-Control": "no-store",
            },
          }
        );

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
     * Vérification de l'expiration
     * côté serveur.
     */
    const expired =
      new Date(
        session.expires_at
      ).getTime() <= Date.now();

    if (expired) {
      /*
       * Suppression de la session expirée.
       */
      await supabaseAdmin
        .from(
          "contest_tiktok_sessions"
        )
        .delete()
        .eq(
          "session_token_hash",
          sessionTokenHash
        );

      const response =
        NextResponse.json(
          {
            authenticated: false,
            user: null,
          },
          {
            headers: {
              "Cache-Control": "no-store",
            },
          }
        );

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
     * On renvoie uniquement les informations
     * nécessaires à l'interface.
     *
     * Le open_id et le token de session
     * restent côté serveur.
     */
    return NextResponse.json(
      {
        authenticated: true,

        user: {
          displayName:
            session.tiktok_display_name,

          avatarUrl:
            session.tiktok_avatar_url,
        },
      },
      {
        headers: {
          "Cache-Control": "no-store",
        },
      }
    );
  } catch (error) {
    console.error(
      "[tiktok/me] Erreur générale :",
      error
    );

    return NextResponse.json(
      {
        authenticated: false,
        user: null,
      },
      {
        status: 500,
        headers: {
          "Cache-Control": "no-store",
        },
      }
    );
  }
}