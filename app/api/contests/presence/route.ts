import { createHash } from "crypto";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
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

const SESSION_COOKIE_NAME =
  "ajvek_tiktok_session";

function hashSessionToken(token: string) {
  return createHash("sha256")
    .update(token)
    .digest("hex");
}

/*
 * POST /api/contests/presence
 *
 * Heartbeat de présence.
 *
 * Cette route :
 * - identifie l'utilisateur via sa session AJVEK/TikTok ;
 * - vérifie qu'il participe réellement au concours ;
 * - met à jour contest_presence.last_seen_at ;
 * - n'attribue PAS encore le bonus ;
 * - ne modifie PAS draw_weight ;
 * - ne lance PAS le tirage.
 */

export async function POST() {
  try {
    /* ========================================================
       SESSION AJVEK / TIKTOK
       ======================================================== */

    const cookieStore = await cookies();

    const sessionToken =
      cookieStore.get(
        SESSION_COOKIE_NAME
      )?.value;

    /*
     * Pas connecté :
     * ce n'est pas une erreur publique.
     */
    if (!sessionToken) {
      return NextResponse.json(
        {
          present: false,
          reason: "not_authenticated",
        },
        {
          headers: {
            "Cache-Control":
              "no-store, max-age=0",
          },
        }
      );
    }

    const sessionTokenHash =
      hashSessionToken(sessionToken);

    const {
      data: session,
      error: sessionError,
    } = await supabaseAdmin
      .from("contest_tiktok_sessions")
      .select(`
        id,
        tiktok_open_id,
        expires_at
      `)
      .eq(
        "session_token_hash",
        sessionTokenHash
      )
      .maybeSingle();

    if (sessionError) {
      console.error(
        "[contests/presence] Session :",
        sessionError
      );

      return NextResponse.json(
        {
          error:
            "Impossible de vérifier la session.",
        },
        {
          status: 500,
        }
      );
    }

    if (!session) {
      return NextResponse.json(
        {
          present: false,
          reason: "not_authenticated",
        },
        {
          headers: {
            "Cache-Control":
              "no-store, max-age=0",
          },
        }
      );
    }

    /* ========================================================
       EXPIRATION SESSION
       ======================================================== */

    const expiresAt =
      new Date(session.expires_at).getTime();

    if (
      !Number.isFinite(expiresAt) ||
      expiresAt <= Date.now()
    ) {
      /*
       * Nettoyage de la session expirée.
       * L'échec du DELETE n'empêche pas la réponse.
       */
      const { error: deleteError } =
        await supabaseAdmin
          .from("contest_tiktok_sessions")
          .delete()
          .eq("id", session.id);

      if (deleteError) {
        console.error(
          "[contests/presence] Nettoyage session :",
          deleteError
        );
      }

      cookieStore.delete(
        SESSION_COOKIE_NAME
      );

      return NextResponse.json(
        {
          present: false,
          reason: "session_expired",
        },
        {
          headers: {
            "Cache-Control":
              "no-store, max-age=0",
          },
        }
      );
    }

    /* ========================================================
       CONCOURS ACTUEL
       ======================================================== */

    /*
     * La présence nous intéresse tant que le concours
     * est ouvert ou en attente du lancement.
     *
     * Dès que le statut devient "drawing", le snapshot
     * de présence devra déjà avoir été figé par la future
     * route de lancement.
     */
    const {
      data: contest,
      error: contestError,
    } = await supabaseAdmin
      .from("contests")
      .select(`
        id,
        status
      `)
      .in("status", [
        "registration",
        "waiting",
      ])
      .order("created_at", {
        ascending: false,
      })
      .limit(1)
      .maybeSingle();

    if (contestError) {
      console.error(
        "[contests/presence] Contest :",
        contestError
      );

      return NextResponse.json(
        {
          error:
            "Impossible de vérifier le concours.",
        },
        {
          status: 500,
        }
      );
    }

    if (!contest) {
      return NextResponse.json(
        {
          present: false,
          reason: "no_active_contest",
        },
        {
          headers: {
            "Cache-Control":
              "no-store, max-age=0",
          },
        }
      );
    }

    /* ========================================================
       PARTICIPANT
       ======================================================== */

    /*
     * On ne peut être considéré présent que si l'identité
     * TikTok est réellement inscrite à CE concours.
     */
    const {
      data: participant,
      error: participantError,
    } = await supabaseAdmin
      .from("contest_participants")
      .select("id")
      .eq(
        "contest_id",
        contest.id
      )
      .eq(
        "tiktok_open_id",
        session.tiktok_open_id
      )
      .maybeSingle();

    if (participantError) {
      console.error(
        "[contests/presence] Participant :",
        participantError
      );

      return NextResponse.json(
        {
          error:
            "Impossible de vérifier la participation.",
        },
        {
          status: 500,
        }
      );
    }

    if (!participant) {
      return NextResponse.json(
        {
          present: false,
          reason: "not_participant",
        },
        {
          headers: {
            "Cache-Control":
              "no-store, max-age=0",
          },
        }
      );
    }

    /* ========================================================
       HEARTBEAT
       ======================================================== */

    const now =
      new Date().toISOString();

    /*
     * La contrainte UNIQUE(contest_id, participant_id)
     * permet de faire un UPSERT sûr.
     *
     * On ne stocke aucune identité TikTok dans
     * contest_presence.
     */
    const {
      error: presenceError,
    } = await supabaseAdmin
      .from("contest_presence")
      .upsert(
        {
          contest_id: contest.id,
          participant_id:
            participant.id,
          last_seen_at: now,
        },
        {
          onConflict:
            "contest_id,participant_id",
        }
      );

    if (presenceError) {
      console.error(
        "[contests/presence] Heartbeat :",
        presenceError
      );

      return NextResponse.json(
        {
          error:
            "Impossible d’enregistrer la présence.",
        },
        {
          status: 500,
        }
      );
    }

    return NextResponse.json(
      {
        present: true,
        recordedAt: now,
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
      "[contests/presence] General :",
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