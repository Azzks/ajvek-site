import { createHash } from "node:crypto";
import { NextResponse } from "next/server";
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

const CONTEST_SELECT = `
  id,
  title,
  description,
  prize,
  status,
  presence_multiplier,
  winner_participant_id,
  registration_opened_at,
  registration_closed_at,
  draw_started_at,
  draw_reveal_at,
  completed_at,
  created_at
`;

type ContestRow = {
  id: string;
  title: string;
  description: string | null;
  prize: string;
  status:
    | "registration"
    | "waiting"
    | "drawing"
    | "completed";
  presence_multiplier: number | string;
  winner_participant_id: string | null;
  registration_opened_at: string | null;
  registration_closed_at: string | null;
  draw_started_at: string | null;
  draw_reveal_at: string | null;
  completed_at: string | null;
  created_at: string;
};

type PublicDrawParticipant = {
  slotKey: string;
  displayName: string;
  avatarUrl: string | null;
  wasPresent: boolean;
  drawWeight: number;
};

/* ============================================================
   CLÉ PUBLIQUE D'UN PARTICIPANT

   IMPORTANT :
   - ce n'est PAS l'ID PostgreSQL ;
   - ce n'est PAS le TikTok open_id ;
   - ce n'est PAS réversible ;
   - elle sert uniquement à identifier une case de la roue.
   ============================================================ */

function createPublicSlotKey(
  contestId: string,
  participantId: string
) {
  return createHash("sha256")
    .update(
      `ajvek-draw:${contestId}:${participantId}`
    )
    .digest("hex")
    .slice(0, 24);
}

/* ============================================================
   FINALISATION DU TIRAGE

   Cette fonction ne sélectionne jamais de gagnant.

   Elle vérifie uniquement si :
   - un gagnant a déjà été verrouillé ;
   - draw_reveal_at est atteint.

   Dans ce cas :
   drawing → completed
   ============================================================ */

async function completeDrawIfReady(
  contest: ContestRow
): Promise<ContestRow> {
  if (contest.status !== "drawing") {
    return contest;
  }

  if (!contest.winner_participant_id) {
    return contest;
  }

  if (!contest.draw_reveal_at) {
    return contest;
  }

  const revealTimestamp =
    new Date(
      contest.draw_reveal_at
    ).getTime();

  if (!Number.isFinite(revealTimestamp)) {
    console.error(
      "[contests/current] draw_reveal_at invalide :",
      contest.draw_reveal_at
    );

    return contest;
  }

  /*
   * Pas encore l'heure :
   * le gagnant reste secret.
   */
  if (Date.now() < revealTimestamp) {
    return contest;
  }

  const {
    error: completionError,
  } = await supabaseAdmin.rpc(
    "complete_contest_draw",
    {
      p_contest_id: contest.id,
    }
  );

  if (completionError) {
    /*
     * Une autre requête publique a peut-être
     * finalisé le concours au même moment.
     *
     * On relit avant de considérer cela comme
     * une véritable erreur.
     */
    const {
      data: concurrentContest,
      error: concurrentReadError,
    } = await supabaseAdmin
      .from("contests")
      .select(CONTEST_SELECT)
      .eq("id", contest.id)
      .maybeSingle();

    if (
      !concurrentReadError &&
      concurrentContest?.status ===
        "completed"
    ) {
      return concurrentContest as ContestRow;
    }

    console.error(
      "[contests/current] Finalisation tirage :",
      completionError
    );

    /*
     * Sécurité :
     * si la finalisation n'est pas confirmée,
     * on conserve l'état drawing.
     */
    return contest;
  }

  const {
    data: completedContest,
    error: completedContestError,
  } = await supabaseAdmin
    .from("contests")
    .select(CONTEST_SELECT)
    .eq("id", contest.id)
    .maybeSingle();

  if (
    completedContestError ||
    !completedContest
  ) {
    console.error(
      "[contests/current] Relecture après finalisation :",
      completedContestError
    );

    return contest;
  }

  return completedContest as ContestRow;
}

/* ============================================================
   GET — CONCOURS PUBLIC ACTUEL
   ============================================================ */

export async function GET() {
  try {
    /*
     * "draft" reste totalement invisible
     * pour le public.
     */
    const {
      data: contestData,
      error,
    } = await supabaseAdmin
      .from("contests")
      .select(CONTEST_SELECT)
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

    if (error) {
      console.error(
        "[contests/current] Contest :",
        error
      );

      return NextResponse.json(
        {
          error:
            "Impossible de récupérer le tirage.",
        },
        {
          status: 500,
        }
      );
    }

    /*
     * Aucun concours public.
     */
    if (!contestData) {
      return NextResponse.json(
        {
          contest: null,
        },
        {
          headers: {
            "Cache-Control":
              "no-store, max-age=0",
          },
        }
      );
    }

    /*
     * Vérifie si l'heure officielle
     * de révélation vient d'être atteinte.
     */
    const contest =
      await completeDrawIfReady(
        contestData as ContestRow
      );

    /* ============================================================
       NOMBRE DE PARTICIPANTS
       ============================================================ */

    const {
      count: participantCount,
      error: countError,
    } = await supabaseAdmin
      .from("contest_participants")
      .select("id", {
        count: "exact",
        head: true,
      })
      .eq(
        "contest_id",
        contest.id
      );

    if (countError) {
      console.error(
        "[contests/current] Participants count :",
        countError
      );

      return NextResponse.json(
        {
          error:
            "Impossible de récupérer le tirage.",
        },
        {
          status: 500,
        }
      );
    }

    /* ============================================================
       PARTICIPANTS PUBLICS DE LA ROUE

       Ils ne sont exposés qu'une fois le tirage lancé.

       Avant "drawing" :
       aucune identité des participants n'est rendue publique.

       Pendant/après le tirage :
       on expose uniquement ce qui est nécessaire à la roue.

       JAMAIS :
       - tiktok_open_id
       - participant_id brut
       - session/token TikTok
       ============================================================ */

    let drawParticipants:
      PublicDrawParticipant[] = [];

    if (
      contest.status === "drawing" ||
      contest.status === "completed"
    ) {
      const {
        data: participantRows,
        error: participantsError,
      } = await supabaseAdmin
        .from("contest_participants")
        .select(`
          id,
          tiktok_display_name,
          tiktok_avatar_url,
          was_present_at_draw,
          draw_weight
        `)
        .eq(
          "contest_id",
          contest.id
        )
        .order("created_at", {
          ascending: true,
        });

      if (participantsError) {
        console.error(
          "[contests/current] Participants roue :",
          participantsError
        );

        return NextResponse.json(
          {
            error:
              "Impossible de récupérer les participants du tirage.",
          },
          {
            status: 500,
          }
        );
      }

      drawParticipants =
        (participantRows ?? [])
          .filter((participant) => {
            const weight =
              Number(
                participant.draw_weight
              );

            return (
              participant
                .was_present_at_draw !==
                null &&
              Number.isInteger(weight) &&
              weight > 0
            );
          })
          .map((participant) => ({
            slotKey:
              createPublicSlotKey(
                contest.id,
                participant.id
              ),

            displayName:
              participant
                .tiktok_display_name ||
              "Participant",

            avatarUrl:
              participant
                .tiktok_avatar_url,

            wasPresent:
              participant
                .was_present_at_draw ===
              true,

            drawWeight:
              Number(
                participant.draw_weight
              ),
          }));
    }

    /* ============================================================
       INFORMATIONS PUBLIQUES DU TIRAGE
       ============================================================ */

    const draw = {
      startedAt:
        contest.draw_started_at,

      revealAt:
        contest.draw_reveal_at,

      /*
       * Cela indique seulement que le serveur
       * a définitivement verrouillé un gagnant.
       *
       * L'identité reste secrète tant que
       * le concours n'est pas completed.
       */
      winnerLocked:
        contest.status === "drawing" &&
        Boolean(
          contest.winner_participant_id
        ),

      participants:
        drawParticipants,
    };

    /* ============================================================
       GAGNANT

       Le gagnant n'est chargé que lorsque
       PostgreSQL confirme status = completed.
       ============================================================ */

    let winner: {
      slotKey: string;
      displayName: string;
      avatarUrl: string | null;
      productSlug: string;
      color: string;
      size: string;
      wasPresent: boolean | null;
    } | null = null;

    if (
      contest.status === "completed" &&
      contest.winner_participant_id
    ) {
      const {
        data: winnerRow,
        error: winnerError,
      } = await supabaseAdmin
        .from("contest_participants")
        .select(`
          id,
          tiktok_display_name,
          tiktok_avatar_url,
          product_slug,
          color,
          size,
          was_present_at_draw
        `)
        .eq(
          "id",
          contest.winner_participant_id
        )
        .eq(
          "contest_id",
          contest.id
        )
        .maybeSingle();

      if (winnerError) {
        console.error(
          "[contests/current] Winner :",
          winnerError
        );

        return NextResponse.json(
          {
            error:
              "Impossible de récupérer le gagnant.",
          },
          {
            status: 500,
          }
        );
      }

      if (winnerRow) {
        winner = {
          slotKey:
            createPublicSlotKey(
              contest.id,
              winnerRow.id
            ),

          displayName:
            winnerRow
              .tiktok_display_name ||
            "Participant",

          avatarUrl:
            winnerRow
              .tiktok_avatar_url,

          productSlug:
            winnerRow.product_slug,

          color:
            winnerRow.color,

          size:
            winnerRow.size,

          wasPresent:
            winnerRow
              .was_present_at_draw,
        };
      }
    }

    /* ============================================================
       RÉPONSE PUBLIQUE
       ============================================================ */

    return NextResponse.json(
      {
        contest: {
          id:
            contest.id,

          title:
            contest.title,

          description:
            contest.description,

          prize:
            contest.prize,

          status:
            contest.status,

          presenceMultiplier:
            Number(
              contest.presence_multiplier
            ),

          participantCount:
            participantCount ?? 0,

          registrationOpenedAt:
            contest
              .registration_opened_at,

          registrationClosedAt:
            contest
              .registration_closed_at,

          drawStartedAt:
            contest.draw_started_at,

          draw,

          completedAt:
            contest.completed_at,

          /*
           * null pendant toute la phase secrète.
           */
          winner,
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
      "[contests/current] General :",
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