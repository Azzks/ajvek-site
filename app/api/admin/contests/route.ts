import { randomInt } from "node:crypto";
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

/* ============================================================
   ADMIN
   ============================================================ */

function getAdminEmails() {
  return (process.env.ADMIN_EMAILS || "")
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
}

async function getAdminUser(request: Request) {
  const authorization =
    request.headers.get("authorization");

  if (!authorization?.startsWith("Bearer ")) {
    return null;
  }

  const token = authorization.replace(
    "Bearer ",
    ""
  );

  const {
    data: { user },
    error,
  } = await supabaseAuth.auth.getUser(token);

  if (error || !user?.email) {
    return null;
  }

  const adminEmails = getAdminEmails();

  if (
    !adminEmails.includes(
      user.email.toLowerCase()
    )
  ) {
    return null;
  }

  return user;
}

/* ============================================================
   FORMAT CONCOURS
   ============================================================ */

function formatContest(
  contest: {
    id: string;
    title: string;
    description: string | null;
    prize: string;
    status: string;
    presence_multiplier: number | string;
    winner_participant_id: string | null;
    registration_opened_at: string | null;
    registration_closed_at: string | null;
    draw_started_at: string | null;
    completed_at: string | null;
    created_at: string;
    updated_at: string;
  },
  participantCount?: number
) {
  return {
    id: contest.id,
    title: contest.title,
    description: contest.description,
    prize: contest.prize,
    status: contest.status,

    presenceMultiplier: Number(
      contest.presence_multiplier
    ),

    ...(participantCount !== undefined
      ? {
          participantCount,
        }
      : {}),

    winnerParticipantId:
      contest.winner_participant_id,

    registrationOpenedAt:
      contest.registration_opened_at,

    registrationClosedAt:
      contest.registration_closed_at,

    drawStartedAt:
      contest.draw_started_at,

    completedAt:
      contest.completed_at,

    createdAt:
      contest.created_at,

    updatedAt:
      contest.updated_at,
  };
}

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
  completed_at,
  created_at,
  updated_at
`;

/* ============================================================
   GET — CONCOURS ADMIN
   ============================================================ */

export async function GET(request: Request) {
  try {
    const admin = await getAdminUser(request);

    if (!admin) {
      return NextResponse.json(
        {
          error:
            "Accès administrateur refusé.",
        },
        {
          status: 403,
        }
      );
    }

    const {
      data: contests,
      error,
    } = await supabaseAdmin
      .from("contests")
      .select(CONTEST_SELECT)
      .order("created_at", {
        ascending: false,
      });

    if (error) {
      console.error(
        "[admin/contests] GET :",
        error
      );

      return NextResponse.json(
        {
          error:
            "Impossible de récupérer les tirages.",
        },
        {
          status: 500,
        }
      );
    }

    const contestIds =
      (contests ?? []).map(
        (contest) => contest.id
      );

    const participantCounts =
      new Map<string, number>();

    if (contestIds.length > 0) {
      const {
        data: participants,
        error: participantsError,
      } = await supabaseAdmin
        .from("contest_participants")
        .select("contest_id")
        .in("contest_id", contestIds);

      if (participantsError) {
        console.error(
          "[admin/contests] Participants :",
          participantsError
        );

        return NextResponse.json(
          {
            error:
              "Impossible de récupérer les participants.",
          },
          {
            status: 500,
          }
        );
      }

      for (
        const participant of participants ?? []
      ) {
        const current =
          participantCounts.get(
            participant.contest_id
          ) ?? 0;

        participantCounts.set(
          participant.contest_id,
          current + 1
        );
      }
    }

    const safeContests =
      (contests ?? []).map(
        (contest) =>
          formatContest(
            contest,
            participantCounts.get(
              contest.id
            ) ?? 0
          )
      );

    return NextResponse.json(
      {
        contests: safeContests,
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
      "[admin/contests] GET general :",
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

/* ============================================================
   PATCH — ACTION ADMIN SUR UN CONCOURS

   Actions disponibles :
   - open_registration
   - close_registration
   - prepare_draw
   - select_winner

   IMPORTANT :

   prepare_draw :
   - fige les présences ;
   - attribue les poids ;
   - ne choisit PAS le gagnant.

   select_winner :
   - fonctionne uniquement après prepare_draw ;
   - utilise crypto.randomInt() côté serveur ;
   - enregistre définitivement le gagnant via
     save_contest_winner_once().
   ============================================================ */

export async function PATCH(request: Request) {
  try {
    const admin = await getAdminUser(request);

    if (!admin) {
      return NextResponse.json(
        {
          error:
            "Accès administrateur refusé.",
        },
        {
          status: 403,
        }
      );
    }

    let body: {
      contestId?: string;
      action?: string;
    };

    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        {
          error: "Données invalides.",
        },
        {
          status: 400,
        }
      );
    }

    const contestId =
      body.contestId?.trim();

    const action =
      body.action?.trim();

    if (!contestId || !action) {
      return NextResponse.json(
        {
          error:
            "Concours ou action manquant.",
        },
        {
          status: 400,
        }
      );
    }

    const allowedActions = [
      "open_registration",
      "close_registration",
      "prepare_draw",
      "select_winner",
    ];

    if (!allowedActions.includes(action)) {
      return NextResponse.json(
        {
          error: "Action non autorisée.",
        },
        {
          status: 400,
        }
      );
    }

    /*
     * Vérification de l'état actuel
     * du concours demandé.
     */
    const {
      data: contest,
      error: contestError,
    } = await supabaseAdmin
      .from("contests")
      .select(`
        id,
        status,
        winner_participant_id
      `)
      .eq("id", contestId)
      .maybeSingle();

    if (contestError) {
      console.error(
        "[admin/contests] Vérification :",
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
          error: "Concours introuvable.",
        },
        {
          status: 404,
        }
      );
    }

    /* ============================================================
       PRÉPARER LE TIRAGE

       waiting → drawing

       Cette action :
       - fige les présences ;
       - attribue draw_weight 3 aux présents ;
       - attribue draw_weight 2 aux absents ;
       - enregistre draw_started_at ;
       - NE CHOISIT PAS de gagnant.
       ============================================================ */

    if (action === "prepare_draw") {
      if (contest.status !== "waiting") {
        return NextResponse.json(
          {
            error:
              "Le concours doit avoir ses inscriptions fermées avant de préparer le tirage.",
          },
          {
            status: 409,
          }
        );
      }

      /*
       * La fonction SQL effectue le snapshot dans
       * une seule transaction et verrouille le concours.
       */
      const {
        data: preparation,
        error: preparationError,
      } = await supabaseAdmin.rpc(
        "prepare_contest_draw",
        {
          p_contest_id: contestId,
        }
      );

      if (preparationError) {
        console.error(
          "[admin/contests] Préparation tirage :",
          preparationError
        );

        const message =
          preparationError.message ?? "";

        if (
          message.includes(
            "CONTEST_NOT_FOUND"
          )
        ) {
          return NextResponse.json(
            {
              error:
                "Concours introuvable.",
            },
            {
              status: 404,
            }
          );
        }

        if (
          message.includes(
            "CONTEST_NOT_WAITING"
          )
        ) {
          return NextResponse.json(
            {
              error:
                "Le concours a changé entre-temps. Actualise puis réessaie.",
            },
            {
              status: 409,
            }
          );
        }

        if (
          message.includes(
            "NO_PARTICIPANTS"
          )
        ) {
          return NextResponse.json(
            {
              error:
                "Impossible de préparer un tirage sans participant.",
            },
            {
              status: 409,
            }
          );
        }

        return NextResponse.json(
          {
            error:
              "Impossible de préparer le tirage.",
          },
          {
            status: 500,
          }
        );
      }

      /*
       * On relit le concours après l'opération SQL.
       */
      const {
        data: updatedContest,
        error: updatedContestError,
      } = await supabaseAdmin
        .from("contests")
        .select(CONTEST_SELECT)
        .eq("id", contestId)
        .maybeSingle();

      if (
        updatedContestError ||
        !updatedContest
      ) {
        console.error(
          "[admin/contests] Relecture tirage :",
          updatedContestError
        );

        return NextResponse.json(
          {
            error:
              "Le tirage a été préparé mais son état n’a pas pu être relu. Actualise la page.",
          },
          {
            status: 500,
          }
        );
      }

      return NextResponse.json(
        {
          success: true,

          preparation: {
            participantCount:
              Number(
                preparation
                  ?.participantCount ??
                  0
              ),

            presentCount:
              Number(
                preparation
                  ?.presentCount ??
                  0
              ),

            absentCount:
              Number(
                preparation
                  ?.absentCount ??
                  0
              ),

            drawStartedAt:
              preparation
                ?.drawStartedAt ??
              updatedContest
                .draw_started_at,
          },

          contest:
            formatContest(
              updatedContest
            ),
        },
        {
          headers: {
            "Cache-Control":
              "no-store, max-age=0",
          },
        }
      );
    }

    /* ============================================================
       SÉLECTIONNER LE GAGNANT

       drawing → completed

       Le gagnant est sélectionné uniquement côté serveur.

       Les poids ont déjà été figés :
       - absent  = 2
       - présent = 3

       Donc :
       3 / 2 = ×1,5

       crypto.randomInt() choisit une part uniforme.
       ============================================================ */

    if (action === "select_winner") {
      /*
       * Si un gagnant existe déjà, on ne réalise
       * surtout PAS un nouveau tirage.
       *
       * On relit simplement le gagnant existant.
       */
      if (
        contest.winner_participant_id
      ) {
        const {
          data: existingWinner,
          error: existingWinnerError,
        } = await supabaseAdmin
          .from("contest_participants")
          .select(`
            id,
            tiktok_display_name,
            tiktok_avatar_url,
            product_slug,
            color,
            size,
            was_present_at_draw,
            draw_weight
          `)
          .eq(
            "id",
            contest.winner_participant_id
          )
          .eq(
            "contest_id",
            contestId
          )
          .maybeSingle();

        if (
          existingWinnerError ||
          !existingWinner
        ) {
          console.error(
            "[admin/contests] Gagnant existant :",
            existingWinnerError
          );

          return NextResponse.json(
            {
              error:
                "Un gagnant est déjà enregistré mais ses informations n’ont pas pu être relues.",
            },
            {
              status: 500,
            }
          );
        }

        return NextResponse.json(
          {
            success: true,
            alreadySelected: true,

            winner: {
              participantId:
                existingWinner.id,

              displayName:
                existingWinner
                  .tiktok_display_name,

              avatarUrl:
                existingWinner
                  .tiktok_avatar_url,

              productSlug:
                existingWinner
                  .product_slug,

              color:
                existingWinner.color,

              size:
                existingWinner.size,

              wasPresent:
                existingWinner
                  .was_present_at_draw,

              drawWeight:
                Number(
                  existingWinner
                    .draw_weight
                ),
            },
          },
          {
            headers: {
              "Cache-Control":
                "no-store, max-age=0",
            },
          }
        );
      }

      if (contest.status !== "drawing") {
        return NextResponse.json(
          {
            error:
              "Le concours doit être en cours de tirage avant de sélectionner le gagnant.",
          },
          {
            status: 409,
          }
        );
      }

      /*
       * On récupère uniquement les informations
       * nécessaires à la sélection.
       *
       * Aucun open_id TikTok n'est nécessaire.
       */
      const {
        data: participants,
        error: participantsError,
      } = await supabaseAdmin
        .from("contest_participants")
        .select(`
          id,
          draw_weight,
          was_present_at_draw
        `)
        .eq(
          "contest_id",
          contestId
        )
        .order(
          "id",
          {
            ascending: true,
          }
        );

      if (participantsError) {
        console.error(
          "[admin/contests] Participants tirage :",
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

      if (
        !participants ||
        participants.length === 0
      ) {
        return NextResponse.json(
          {
            error:
              "Impossible de sélectionner un gagnant sans participant.",
          },
          {
            status: 409,
          }
        );
      }

      /*
       * Construction de la liste pondérée.
       */
      const weightedParticipants: Array<{
        id: string;
        weight: number;
      }> = [];

      let totalWeight = 0;

      for (
        const participant of participants
      ) {
        const weight =
          Number(
            participant.draw_weight
          );

        /*
         * Le snapshot doit être complet.
         *
         * On refuse de tirer si un participant
         * n'a pas de poids ou de présence figée.
         */
        if (
          !Number.isInteger(weight) ||
          weight <= 0 ||
          participant
            .was_present_at_draw ===
            null
        ) {
          return NextResponse.json(
            {
              error:
                "Le tirage n’est pas correctement préparé. Les présences et les poids doivent être figés avant la sélection.",
            },
            {
              status: 409,
            }
          );
        }

        /*
         * Protection supplémentaire :
         * pour ce concours AJVEK, seuls
         * les poids 2 et 3 sont acceptés.
         */
        if (
          weight !== 2 &&
          weight !== 3
        ) {
          return NextResponse.json(
            {
              error:
                "Un poids de tirage invalide a été détecté.",
            },
            {
              status: 409,
            }
          );
        }

        /*
         * Cohérence présence / poids.
         */
        if (
          participant
            .was_present_at_draw ===
            true &&
          weight !== 3
        ) {
          return NextResponse.json(
            {
              error:
                "Incohérence détectée entre la présence et le bonus d’un participant.",
            },
            {
              status: 409,
            }
          );
        }

        if (
          participant
            .was_present_at_draw ===
            false &&
          weight !== 2
        ) {
          return NextResponse.json(
            {
              error:
                "Incohérence détectée entre l’absence et le poids d’un participant.",
            },
            {
              status: 409,
            }
          );
        }

        weightedParticipants.push({
          id: participant.id,
          weight,
        });

        totalWeight += weight;
      }

      /*
       * crypto.randomInt() accepte un maximum
       * inférieur à 2^48.
       *
       * Ce plafond est immensément supérieur
       * aux besoins d'un concours AJVEK,
       * mais on le vérifie explicitement.
       */
      const MAX_RANDOM_INT =
        281_474_976_710_655;

      if (
        !Number.isSafeInteger(
          totalWeight
        ) ||
        totalWeight <= 0 ||
        totalWeight >
          MAX_RANDOM_INT
      ) {
        return NextResponse.json(
          {
            error:
              "Poids total du tirage invalide.",
          },
          {
            status: 500,
          }
        );
      }

      /*
       * Sélection cryptographiquement sûre.
       *
       * Exemple :
       *
       * Alice = 2
       * Bob   = 3
       * Paul  = 2
       *
       * totalWeight = 7
       *
       * randomInt(7) donne uniformément :
       * 0,1,2,3,4,5 ou 6.
       *
       * Alice possède 2 positions,
       * Bob 3,
       * Paul 2.
       */
      const target =
        randomInt(totalWeight);

      let runningWeight = 0;

      let candidateId:
        | string
        | null = null;

      for (
        const participant of
          weightedParticipants
      ) {
        runningWeight +=
          participant.weight;

        if (
          target <
          runningWeight
        ) {
          candidateId =
            participant.id;

          break;
        }
      }

      if (!candidateId) {
        console.error(
          "[admin/contests] Aucun candidat sélectionné malgré un poids total valide."
        );

        return NextResponse.json(
          {
            error:
              "Impossible de sélectionner le gagnant.",
          },
          {
            status: 500,
          }
        );
      }

      /*
       * IMPORTANT :
       *
       * Le candidat a été choisi côté serveur.
       *
       * Maintenant PostgreSQL verrouille le concours
       * et enregistre le gagnant UNE SEULE FOIS.
       *
       * Si deux requêtes arrivent simultanément :
       * - la première enregistre son candidat ;
       * - la seconde récupère le gagnant déjà enregistré.
       */
      const {
        data: savedWinnerId,
        error: saveWinnerError,
      } = await supabaseAdmin.rpc(
        "save_contest_winner_once",
        {
          p_contest_id:
            contestId,

          p_participant_id:
            candidateId,
        }
      );

      if (saveWinnerError) {
        console.error(
          "[admin/contests] Enregistrement gagnant :",
          saveWinnerError
        );

        const message =
          saveWinnerError.message ?? "";

        if (
          message.includes(
            "CONTEST_NOT_FOUND"
          )
        ) {
          return NextResponse.json(
            {
              error:
                "Concours introuvable.",
            },
            {
              status: 404,
            }
          );
        }

        if (
          message.includes(
            "CONTEST_NOT_DRAWING"
          )
        ) {
          return NextResponse.json(
            {
              error:
                "Le concours a changé entre-temps. Actualise puis réessaie.",
            },
            {
              status: 409,
            }
          );
        }

        if (
          message.includes(
            "INVALID_PARTICIPANT"
          )
        ) {
          return NextResponse.json(
            {
              error:
                "Le participant sélectionné n’appartient pas à ce concours.",
            },
            {
              status: 409,
            }
          );
        }

        if (
          message.includes(
            "DRAW_NOT_PREPARED"
          )
        ) {
          return NextResponse.json(
            {
              error:
                "Le tirage n’est pas correctement préparé.",
            },
            {
              status: 409,
            }
          );
        }

        return NextResponse.json(
          {
            error:
              "Impossible d’enregistrer définitivement le gagnant.",
          },
          {
            status: 500,
          }
        );
      }

      /*
       * La fonction SQL retourne toujours
       * l'identifiant définitif du gagnant :
       *
       * - soit le candidat que nous venons
       *   d'enregistrer ;
       * - soit le gagnant déjà enregistré
       *   par une requête concurrente.
       */
      const winnerId =
        typeof savedWinnerId ===
        "string"
          ? savedWinnerId
          : null;

      if (!winnerId) {
        console.error(
          "[admin/contests] Identifiant gagnant invalide :",
          savedWinnerId
        );

        return NextResponse.json(
          {
            error:
              "Le gagnant a été enregistré mais son identifiant n’a pas pu être relu. Actualise la page.",
          },
          {
            status: 500,
          }
        );
      }

      /*
       * Relecture des informations publiques
       * du gagnant.
       *
       * IMPORTANT :
       * tiktok_open_id n'est jamais renvoyé.
       */
      const {
        data: winner,
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
          was_present_at_draw,
          draw_weight
        `)
        .eq(
          "id",
          winnerId
        )
        .eq(
          "contest_id",
          contestId
        )
        .maybeSingle();

      if (
        winnerError ||
        !winner
      ) {
        console.error(
          "[admin/contests] Relecture gagnant :",
          winnerError
        );

        return NextResponse.json(
          {
            error:
              "Le gagnant a été enregistré mais ses informations n’ont pas pu être relues. Actualise la page.",
          },
          {
            status: 500,
          }
        );
      }

      /*
       * Relecture définitive du concours.
       */
      const {
        data: updatedContest,
        error: updatedContestError,
      } = await supabaseAdmin
        .from("contests")
        .select(CONTEST_SELECT)
        .eq(
          "id",
          contestId
        )
        .maybeSingle();

      if (
        updatedContestError ||
        !updatedContest
      ) {
        console.error(
          "[admin/contests] Relecture concours terminé :",
          updatedContestError
        );

        return NextResponse.json(
          {
            error:
              "Le gagnant a été enregistré mais le concours n’a pas pu être relu. Actualise la page.",
          },
          {
            status: 500,
          }
        );
      }

      return NextResponse.json(
        {
          success: true,

          contest:
            formatContest(
              updatedContest
            ),

          winner: {
            participantId:
              winner.id,

            displayName:
              winner
                .tiktok_display_name,

            avatarUrl:
              winner
                .tiktok_avatar_url,

            productSlug:
              winner.product_slug,

            color:
              winner.color,

            size:
              winner.size,

            wasPresent:
              winner
                .was_present_at_draw,

            drawWeight:
              Number(
                winner.draw_weight
              ),
          },
        },
        {
          headers: {
            "Cache-Control":
              "no-store, max-age=0",
          },
        }
      );
    }

    /* ============================================================
       FERMER LES INSCRIPTIONS

       registration → waiting
       ============================================================ */

    if (
      action ===
      "close_registration"
    ) {
      if (
        contest.status !==
        "registration"
      ) {
        return NextResponse.json(
          {
            error:
              "Les inscriptions de ce concours ne sont pas ouvertes.",
          },
          {
            status: 409,
          }
        );
      }

      const now =
        new Date().toISOString();

      const {
        data: updatedContest,
        error: updateError,
      } = await supabaseAdmin
        .from("contests")
        .update({
          status: "waiting",
          registration_closed_at:
            now,
          updated_at: now,
        })
        .eq(
          "id",
          contestId
        )
        .eq(
          "status",
          "registration"
        )
        .select(CONTEST_SELECT)
        .maybeSingle();

      if (updateError) {
        console.error(
          "[admin/contests] Fermeture :",
          updateError
        );

        return NextResponse.json(
          {
            error:
              "Impossible de fermer les inscriptions.",
          },
          {
            status: 500,
          }
        );
      }

      if (!updatedContest) {
        return NextResponse.json(
          {
            error:
              "Le concours a changé entre-temps. Actualise puis réessaie.",
          },
          {
            status: 409,
          }
        );
      }

      return NextResponse.json(
        {
          success: true,

          contest:
            formatContest(
              updatedContest
            ),
        },
        {
          headers: {
            "Cache-Control":
              "no-store, max-age=0",
          },
        }
      );
    }

    /* ============================================================
       OUVRIR LES INSCRIPTIONS

       draft → registration
       ============================================================ */

    if (
      action !==
      "open_registration"
    ) {
      return NextResponse.json(
        {
          error:
            "Action non autorisée.",
        },
        {
          status: 400,
        }
      );
    }

    /*
     * Seul un concours en brouillon peut
     * passer en inscriptions ouvertes.
     */
    if (
      contest.status !==
      "draft"
    ) {
      return NextResponse.json(
        {
          error:
            "Ce concours n’est plus en brouillon.",
        },
        {
          status: 409,
        }
      );
    }

    /*
     * Vérification lisible avant la contrainte SQL.
     *
     * L'index partiel
     * contests_one_active_contest_idx
     * reste la protection définitive.
     */
    const {
      data: activeContest,
      error: activeContestError,
    } = await supabaseAdmin
      .from("contests")
      .select(`
        id,
        title,
        status
      `)
      .in(
        "status",
        [
          "registration",
          "waiting",
          "drawing",
        ]
      )
      .neq(
        "id",
        contestId
      )
      .limit(1)
      .maybeSingle();

    if (activeContestError) {
      console.error(
        "[admin/contests] Concours actif :",
        activeContestError
      );

      return NextResponse.json(
        {
          error:
            "Impossible de vérifier les concours actifs.",
        },
        {
          status: 500,
        }
      );
    }

    if (activeContest) {
      return NextResponse.json(
        {
          error:
            "Un autre concours est déjà actif.",
        },
        {
          status: 409,
        }
      );
    }

    const now =
      new Date().toISOString();

    /*
     * Mise à jour conditionnelle :
     * le concours doit toujours être en draft
     * au moment exact de la modification.
     */
    const {
      data: updatedContest,
      error: updateError,
    } = await supabaseAdmin
      .from("contests")
      .update({
        status:
          "registration",

        registration_opened_at:
          now,

        updated_at:
          now,
      })
      .eq(
        "id",
        contestId
      )
      .eq(
        "status",
        "draft"
      )
      .select(CONTEST_SELECT)
      .maybeSingle();

    if (updateError) {
      console.error(
        "[admin/contests] Ouverture :",
        updateError
      );

      /*
       * Violation de la contrainte UNIQUE :
       * un autre concours actif existe.
       */
      if (
        updateError.code ===
        "23505"
      ) {
        return NextResponse.json(
          {
            error:
              "Un autre concours est déjà actif.",
          },
          {
            status: 409,
          }
        );
      }

      return NextResponse.json(
        {
          error:
            "Impossible d’ouvrir les inscriptions.",
        },
        {
          status: 500,
        }
      );
    }

    if (!updatedContest) {
      return NextResponse.json(
        {
          error:
            "Le concours a changé entre-temps. Actualise puis réessaie.",
        },
        {
          status: 409,
        }
      );
    }

    return NextResponse.json(
      {
        success: true,

        contest:
          formatContest(
            updatedContest
          ),
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
      "[admin/contests] PATCH general :",
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