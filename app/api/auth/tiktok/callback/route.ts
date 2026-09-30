import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import crypto from "crypto";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const SITE_URL = "https://ajvek.fr";

const REDIRECT_URI =
  `${SITE_URL}/api/auth/tiktok/callback`;

const TIKTOK_TOKEN_URL =
  "https://open.tiktokapis.com/v2/oauth/token/";

const TIKTOK_USER_URL =
  "https://open.tiktokapis.com/v2/user/info/?fields=open_id,display_name,avatar_url";

/*
 * Notre session AJVEK durera 7 jours.
 */
const SESSION_DURATION_SECONDS =
  60 * 60 * 24 * 7;

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

type TikTokTokenResponse = {
  access_token?: string;
  expires_in?: number;
  open_id?: string;
  refresh_expires_in?: number;
  refresh_token?: string;
  scope?: string;
  token_type?: string;

  error?: string;
  error_description?: string;
  log_id?: string;
};

type TikTokUserResponse = {
  data?: {
    user?: {
      open_id?: string;
      display_name?: string;
      avatar_url?: string;
    };
  };

  error?: {
    code?: string;
    message?: string;
    log_id?: string;
  };
};

function redirectToTirage(
  request: NextRequest,
  status: string
) {
  const url = new URL("/tirage", request.url);

  url.searchParams.set(
    "tiktok",
    status
  );

  return NextResponse.redirect(url);
}

function hashSessionToken(
  token: string
) {
  return crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");
}

function clearOAuthState(
  response: NextResponse
) {
  response.cookies.set(
    "ajvek_tiktok_oauth_state",
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

export async function GET(
  request: NextRequest
) {
  const storedState =
    request.cookies.get(
      "ajvek_tiktok_oauth_state"
    )?.value;

  try {
    const clientKey =
      process.env.TIKTOK_CLIENT_KEY;

    const clientSecret =
      process.env.TIKTOK_CLIENT_SECRET;

    if (!clientKey || !clientSecret) {
      console.error(
        "[tiktok/callback] Variables TikTok manquantes."
      );

      return clearOAuthState(
        redirectToTirage(
          request,
          "config_error"
        )
      );
    }

    const searchParams =
      request.nextUrl.searchParams;

    const code =
      searchParams.get("code");

    const returnedState =
      searchParams.get("state");

    const oauthError =
      searchParams.get("error");

    /*
     * Connexion annulée ou refusée.
     */
    if (oauthError) {
      console.error(
        "[tiktok/callback] OAuth refusé :",
        oauthError
      );

      return clearOAuthState(
        redirectToTirage(
          request,
          "cancelled"
        )
      );
    }

    /*
     * Protection CSRF.
     */
    if (
      !storedState ||
      !returnedState ||
      storedState !== returnedState
    ) {
      console.error(
        "[tiktok/callback] State OAuth invalide."
      );

      return clearOAuthState(
        redirectToTirage(
          request,
          "invalid_state"
        )
      );
    }

    if (!code) {
      console.error(
        "[tiktok/callback] Code OAuth absent."
      );

      return clearOAuthState(
        redirectToTirage(
          request,
          "missing_code"
        )
      );
    }

    /*
     * Échange du code OAuth contre
     * un token TikTok.
     */
    const tokenBody =
      new URLSearchParams({
        client_key: clientKey,
        client_secret: clientSecret,
        code,
        grant_type:
          "authorization_code",
        redirect_uri: REDIRECT_URI,
      });

    const tokenResponse =
      await fetch(
        TIKTOK_TOKEN_URL,
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/x-www-form-urlencoded",
          },

          body: tokenBody.toString(),

          cache: "no-store",
        }
      );

    const tokenData =
      (await tokenResponse.json()) as
        TikTokTokenResponse;

    if (
      !tokenResponse.ok ||
      tokenData.error ||
      !tokenData.access_token ||
      !tokenData.open_id
    ) {
      console.error(
        "[tiktok/callback] Échec token TikTok :",
        tokenData.error ??
          tokenResponse.status
      );

      return clearOAuthState(
        redirectToTirage(
          request,
          "token_error"
        )
      );
    }

    /*
     * Lecture du profil TikTok.
     */
    const userResponse =
      await fetch(
        TIKTOK_USER_URL,
        {
          headers: {
            Authorization:
              `Bearer ${tokenData.access_token}`,
          },

          cache: "no-store",
        }
      );

    const userData =
      (await userResponse.json()) as
        TikTokUserResponse;

    const user =
      userData.data?.user;

    if (
      !userResponse.ok ||
      userData.error?.code !== "ok" ||
      !user?.open_id ||
      !user.display_name
    ) {
      console.error(
        "[tiktok/callback] Profil TikTok invalide :",
        userData.error?.code ??
          userResponse.status
      );

      return clearOAuthState(
        redirectToTirage(
          request,
          "profile_error"
        )
      );
    }

    /*
     * Vérification supplémentaire :
     * les deux open_id doivent correspondre.
     */
    if (
      user.open_id !==
      tokenData.open_id
    ) {
      console.error(
        "[tiktok/callback] open_id incohérent."
      );

      return clearOAuthState(
        redirectToTirage(
          request,
          "identity_error"
        )
      );
    }

    /*
     * Création d'un token AJVEK aléatoire.
     *
     * Le navigateur recevra le token.
     * La base ne conservera QUE son hash SHA-256.
     */
    const sessionToken =
      crypto
        .randomBytes(32)
        .toString("hex");

    const sessionTokenHash =
      hashSessionToken(
        sessionToken
      );

    const expiresAt =
      new Date(
        Date.now() +
          SESSION_DURATION_SECONDS *
            1000
      ).toISOString();

    /*
     * Création de la session serveur.
     *
     * Aucun access_token TikTok
     * n'est enregistré.
     */
    const {
      error: sessionError,
    } = await supabaseAdmin
      .from(
        "contest_tiktok_sessions"
      )
      .insert({
        session_token_hash:
          sessionTokenHash,

        tiktok_open_id:
          user.open_id,

        tiktok_display_name:
          user.display_name,

        tiktok_avatar_url:
          user.avatar_url ?? null,

        expires_at:
          expiresAt,
      });

    if (sessionError) {
      console.error(
        "[tiktok/callback] Création session impossible :",
        sessionError
      );

      return clearOAuthState(
        redirectToTirage(
          request,
          "session_error"
        )
      );
    }

    /*
     * Authentification terminée.
     */
    const response =
      redirectToTirage(
        request,
        "authenticated"
      );

    /*
     * Cookie de session AJVEK.
     *
     * HttpOnly :
     * JavaScript côté navigateur
     * ne peut pas le lire.
     *
     * Secure :
     * uniquement transmis en HTTPS.
     */
    response.cookies.set(
      "ajvek_tiktok_session",
      sessionToken,
      {
        httpOnly: true,
        secure: true,
        sameSite: "lax",
        path: "/",
        maxAge:
          SESSION_DURATION_SECONDS,
      }
    );

    /*
     * Le state OAuth est supprimé
     * après utilisation.
     */
    return clearOAuthState(
      response
    );
  } catch (error) {
    console.error(
      "[tiktok/callback] Erreur générale :",
      error
    );

    return clearOAuthState(
      redirectToTirage(
        request,
        "error"
      )
    );
  }
}