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

const VALID_PRODUCTS = ["roses", "sakura"] as const;
const VALID_COLORS = ["Blanc", "Noir"] as const;
const VALID_SIZES = ["XS", "S", "M", "L"] as const;

type ParticipationBody = {
  productSlug?: string;
  color?: string;
  size?: string;
};

function hashSessionToken(token: string) {
  return crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");
}

/*
 * Récupère et vérifie la session TikTok AJVEK.
 *
 * Cette fonction reste entièrement côté serveur.
 * Le tiktok_open_id n'est jamais renvoyé au navigateur.
 */
async function getTikTokSession(request: NextRequest) {
  const sessionToken =
    request.cookies.get("ajvek_tiktok_session")?.value;

  if (!sessionToken) {
    return {
      session: null,
      sessionTokenHash: null,
      expired: false,
      error: null,
    };
  }

  const sessionTokenHash =
    hashSessionToken(sessionToken);

  const {
    data: session,
    error,
  } = await supabaseAdmin
    .from("contest_tiktok_sessions")
    .select(`
      tiktok_open_id,
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
    return {
      session: null,
      sessionTokenHash,
      expired: false,
      error,
    };
  }

  if (!session) {
    return {
      session: null,
      sessionTokenHash,
      expired: false,
      error: null,
    };
  }

  if (
    new Date(session.expires_at).getTime() <=
    Date.now()
  ) {
    await supabaseAdmin
      .from("contest_tiktok_sessions")
      .delete()
      .eq(
        "session_token_hash",
        sessionTokenHash
      );

    return {
      session: null,
      sessionTokenHash,
      expired: true,
      error: null,
    };
  }

  return {
    session,
    sessionTokenHash,
    expired: false,
    error: null,
  };
}

/*
 * GET
 *
 * Permet à un utilisateur déjà connecté avec TikTok
 * de savoir s'il participe déjà au concours public actuel.
 *
 * Aucun open_id n'est exposé.
 */
export async function GET(request: NextRequest) {
  try {
    /*
     * 1. Vérification de la session TikTok.
     */
    const sessionResult =
      await getTikTokSession(request);

    if (sessionResult.error) {
      console.error(
        "[contests/participate][GET] Session :",
        sessionResult.error
      );

      return NextResponse.json(
        { error: "Erreur serveur." },
        {
          status: 500,
          headers: {
            "Cache-Control": "no-store",
          },
        }
      );
    }

    if (!sessionResult.session) {
      const response =
        NextResponse.json(
          {
            authenticated: false,
            participation: null,
          },
          {
            status: 200,
            headers: {
              "Cache-Control": "no-store",
            },
          }
        );

      /*
       * Si la session était expirée,
       * on supprime aussi le cookie navigateur.
       */
      if (sessionResult.expired) {
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
      }

      return response;
    }

    /*
     * 2. Recherche du concours public actuel.
     *
     * On utilise les mêmes statuts publics que
     * /api/contests/current :
     *
     * registration
     * waiting
     * drawing
     * completed
     *
     * Le draft reste volontairement invisible.
     */
    const {
      data: contest,
      error: contestError,
    } = await supabaseAdmin
      .from("contests")
      .select("id, status")
      .in(
        "status",
        [
          "registration",
          "waiting",
          "drawing",
          "completed",
        ]
      )
      .order("created_at", {
        ascending: false,
      })
      .limit(1)
      .maybeSingle();

    if (contestError) {
      console.error(
        "[contests/participate][GET] Contest :",
        contestError
      );

      return NextResponse.json(
        { error: "Erreur serveur." },
        {
          status: 500,
          headers: {
            "Cache-Control": "no-store",
          },
        }
      );
    }

    /*
     * Aucun concours public.
     *
     * C'est notamment le comportement normal
     * tant que le premier concours reste draft.
     */
    if (!contest) {
      return NextResponse.json(
        {
          authenticated: true,
          participation: null,
        },
        {
          status: 200,
          headers: {
            "Cache-Control": "no-store",
          },
        }
      );
    }

    /*
     * 3. Recherche de la participation correspondant
     * au compte TikTok connecté.
     */
    const {
      data: participation,
      error: participationError,
    } = await supabaseAdmin
      .from("contest_participants")
      .select(`
        id,
        product_slug,
        color,
        size,
        created_at
      `)
      .eq(
        "contest_id",
        contest.id
      )
      .eq(
        "tiktok_open_id",
        sessionResult.session.tiktok_open_id
      )
      .maybeSingle();

    if (participationError) {
      console.error(
        "[contests/participate][GET] Participation :",
        participationError
      );

      return NextResponse.json(
        { error: "Erreur serveur." },
        {
          status: 500,
          headers: {
            "Cache-Control": "no-store",
          },
        }
      );
    }

    if (!participation) {
      return NextResponse.json(
        {
          authenticated: true,
          participation: null,
        },
        {
          status: 200,
          headers: {
            "Cache-Control": "no-store",
          },
        }
      );
    }

    /*
     * On renvoie uniquement les informations
     * nécessaires à l'interface.
     *
     * Aucun tiktok_open_id.
     */
    return NextResponse.json(
      {
        authenticated: true,

        participation: {
          id:
            participation.id,

          productSlug:
            participation.product_slug,

          color:
            participation.color,

          size:
            participation.size,

          createdAt:
            participation.created_at,
        },
      },
      {
        status: 200,
        headers: {
          "Cache-Control": "no-store",
        },
      }
    );
  } catch (error) {
    console.error(
      "[contests/participate][GET] General :",
      error
    );

    return NextResponse.json(
      { error: "Erreur serveur." },
      {
        status: 500,
        headers: {
          "Cache-Control": "no-store",
        },
      }
    );
  }
}

/*
 * POST
 *
 * Création d'une nouvelle participation.
 */
export async function POST(request: NextRequest) {
  try {
    /*
     * 1. Vérification de la session TikTok AJVEK.
     */
    const sessionResult =
      await getTikTokSession(request);

    if (sessionResult.error) {
      console.error(
        "[contests/participate][POST] Session :",
        sessionResult.error
      );

      return NextResponse.json(
        { error: "Erreur serveur." },
        { status: 500 }
      );
    }

    if (!sessionResult.session) {
      const response =
        NextResponse.json(
          {
            error:
              sessionResult.expired
                ? "Session TikTok expirée."
                : "Connexion TikTok requise.",
          },
          { status: 401 }
        );

      if (sessionResult.expired) {
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
      }

      return response;
    }

    const session =
      sessionResult.session;

    /*
     * 2. Vérification du concours.
     *
     * Une participation n'est possible QUE
     * lorsque le concours est en "registration".
     */
    const {
      data: contest,
      error: contestError,
    } = await supabaseAdmin
      .from("contests")
      .select("id, status")
      .eq("status", "registration")
      .order("created_at", {
        ascending: false,
      })
      .limit(1)
      .maybeSingle();

    if (contestError) {
      console.error(
        "[contests/participate][POST] Contest :",
        contestError
      );

      return NextResponse.json(
        { error: "Erreur serveur." },
        { status: 500 }
      );
    }

    if (!contest) {
      return NextResponse.json(
        {
          error:
            "Les inscriptions ne sont pas ouvertes.",
        },
        { status: 409 }
      );
    }

    /*
     * 3. Validation stricte du choix.
     */
    let body: ParticipationBody;

    try {
      body =
        (await request.json()) as ParticipationBody;
    } catch {
      return NextResponse.json(
        {
          error:
            "Données invalides.",
        },
        { status: 400 }
      );
    }

    const productSlug =
      body.productSlug;

    const color =
      body.color;

    const size =
      body.size;

    if (
      !productSlug ||
      !VALID_PRODUCTS.includes(
        productSlug as
          (typeof VALID_PRODUCTS)[number]
      )
    ) {
      return NextResponse.json(
        {
          error:
            "Modèle invalide.",
        },
        { status: 400 }
      );
    }

    if (
      !color ||
      !VALID_COLORS.includes(
        color as
          (typeof VALID_COLORS)[number]
      )
    ) {
      return NextResponse.json(
        {
          error:
            "Couleur invalide.",
        },
        { status: 400 }
      );
    }

    if (
      !size ||
      !VALID_SIZES.includes(
        size as
          (typeof VALID_SIZES)[number]
      )
    ) {
      return NextResponse.json(
        {
          error:
            "Taille invalide.",
        },
        { status: 400 }
      );
    }

    /*
     * 4. Vérification d'une éventuelle
     * participation existante.
     */
    const {
      data: existingParticipation,
      error: existingError,
    } = await supabaseAdmin
      .from("contest_participants")
      .select(`
        id,
        product_slug,
        color,
        size
      `)
      .eq(
        "contest_id",
        contest.id
      )
      .eq(
        "tiktok_open_id",
        session.tiktok_open_id
      )
      .maybeSingle();

    if (existingError) {
      console.error(
        "[contests/participate][POST] Existing :",
        existingError
      );

      return NextResponse.json(
        { error: "Erreur serveur." },
        { status: 500 }
      );
    }

    /*
     * Un compte TikTok = une participation
     * par concours.
     */
    if (existingParticipation) {
      return NextResponse.json(
        {
          error:
            "Tu participes déjà à ce tirage.",

          participation: {
            productSlug:
              existingParticipation.product_slug,

            color:
              existingParticipation.color,

            size:
              existingParticipation.size,
          },
        },
        { status: 409 }
      );
    }

    /*
     * 5. Création de la participation.
     *
     * was_present_at_draw et draw_weight
     * restent NULL.
     *
     * Ils seront figés uniquement au moment
     * du lancement réel du tirage.
     */
    const {
      data: participation,
      error: insertError,
    } = await supabaseAdmin
      .from("contest_participants")
      .insert({
        contest_id:
          contest.id,

        tiktok_open_id:
          session.tiktok_open_id,

        tiktok_display_name:
          session.tiktok_display_name,

        tiktok_avatar_url:
          session.tiktok_avatar_url,

        product_slug:
          productSlug,

        color,

        size,
      })
      .select(`
        id,
        product_slug,
        color,
        size,
        created_at
      `)
      .single();

    if (insertError) {
      /*
       * La contrainte UNIQUE en base reste
       * la protection finale contre deux
       * requêtes simultanées du même compte.
       */
      if (insertError.code === "23505") {
        return NextResponse.json(
          {
            error:
              "Tu participes déjà à ce tirage.",
          },
          { status: 409 }
        );
      }

      console.error(
        "[contests/participate][POST] Insert :",
        insertError
      );

      return NextResponse.json(
        { error: "Erreur serveur." },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,

        participation: {
          id:
            participation.id,

          productSlug:
            participation.product_slug,

          color:
            participation.color,

          size:
            participation.size,

          createdAt:
            participation.created_at,
        },
      },
      {
        status: 201,
        headers: {
          "Cache-Control": "no-store",
        },
      }
    );
  } catch (error) {
    console.error(
      "[contests/participate][POST] General :",
      error
    );

    return NextResponse.json(
      { error: "Erreur serveur." },
      { status: 500 }
    );
  }
}