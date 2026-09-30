import { NextResponse } from "next/server";
import crypto from "crypto";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const SITE_URL = "https://ajvek.fr";

const TIKTOK_AUTHORIZE_URL =
  "https://www.tiktok.com/v2/auth/authorize/";

const REDIRECT_URI =
  `${SITE_URL}/api/auth/tiktok/callback`;

export async function GET() {
  try {
    const clientKey =
      process.env.TIKTOK_CLIENT_KEY;

    if (!clientKey) {
      console.error(
        "[tiktok/start] TIKTOK_CLIENT_KEY manquante."
      );

      return NextResponse.json(
        {
          error:
            "Connexion TikTok temporairement indisponible.",
        },
        {
          status: 500,
        }
      );
    }

    /*
     * Valeur aléatoire permettant de protéger
     * le retour OAuth contre les attaques CSRF.
     */
    const state = crypto
      .randomBytes(32)
      .toString("hex");

    const params = new URLSearchParams({
      client_key: clientKey,
      scope: "user.info.basic",
      response_type: "code",
      redirect_uri: REDIRECT_URI,
      state,
    });

    const response = NextResponse.redirect(
      `${TIKTOK_AUTHORIZE_URL}?${params.toString()}`
    );

    /*
     * Le state est conservé dans un cookie
     * inaccessible au JavaScript du navigateur.
     *
     * Le callback devra recevoir exactement
     * la même valeur avant d'accepter la connexion.
     */
    response.cookies.set(
      "ajvek_tiktok_oauth_state",
      state,
      {
        httpOnly: true,
        secure: true,
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 10,
      }
    );

    return response;
  } catch (error) {
    console.error(
      "[tiktok/start] General :",
      error
    );

    return NextResponse.json(
      {
        error: "Erreur serveur.",
      },
      {
        status: 500,
      }
    );
  }
}