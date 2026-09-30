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

export async function GET() {
  try {
    /*
     * Concours public actuellement affichable.
     *
     * "draft" est volontairement exclu :
     * un concours en préparation ne doit pas être
     * exposé publiquement par l'API.
     */
    const { data: contest, error } =
      await supabaseAdmin
        .from("contests")
        .select(`
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
          completed_at
        `)
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
     * Aucun concours public pour le moment.
     */
    if (!contest) {
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
     * Nombre de participants.
     *
     * On ne renvoie ici aucune identité TikTok.
     */
    const {
      count: participantCount,
      error: countError,
    } = await supabaseAdmin
      .from("contest_participants")
      .select("id", {
        count: "exact",
        head: true,
      })
      .eq("contest_id", contest.id);

    if (countError) {
      console.error(
        "[contests/current] Participants :",
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

    /*
     * Le gagnant n'est rendu public qu'une fois
     * le concours terminé.
     */
    let winner = null;

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
          product_slug,
          color,
          size
        `)
        .eq(
          "id",
          contest.winner_participant_id
        )
        .eq("contest_id", contest.id)
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
          displayName:
            winnerRow.tiktok_display_name,
          productSlug:
            winnerRow.product_slug,
          color: winnerRow.color,
          size: winnerRow.size,
        };
      }
    }

    return NextResponse.json(
      {
        contest: {
          id: contest.id,
          title: contest.title,
          description: contest.description,
          prize: contest.prize,
          status: contest.status,

          presenceMultiplier: Number(
            contest.presence_multiplier
          ),

          participantCount:
            participantCount ?? 0,

          registrationOpenedAt:
            contest.registration_opened_at,

          registrationClosedAt:
            contest.registration_closed_at,

          drawStartedAt:
            contest.draw_started_at,

          completedAt:
            contest.completed_at,

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