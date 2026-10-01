"use client";

import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type ContestStatus =
  | "draft"
  | "registration"
  | "waiting"
  | "drawing"
  | "completed";

type AdminContest = {
  id: string;
  title: string;
  description: string | null;
  prize: string;
  status: ContestStatus;
  presenceMultiplier: number;
  participantCount: number;
  winnerParticipantId: string | null;
  registrationOpenedAt: string | null;
  registrationClosedAt: string | null;
  drawStartedAt: string | null;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

type AdminContestsResponse = {
  contests?: AdminContest[];
  error?: string;
};

type DrawPreparation = {
  participantCount: number;
  presentCount: number;
  absentCount: number;
  drawStartedAt: string | null;
};

type WinnerInfo = {
  id?: string;
  displayName?: string;
  avatarUrl?: string | null;
  productSlug?: string;
  color?: string;
  size?: string;
  wasPresent?: boolean;
};

type ContestActionResponse = {
  success?: boolean;
  contest?: AdminContest;
  preparation?: DrawPreparation;
  winner?: WinnerInfo;
  error?: string;
};

function getStatusLabel(status: ContestStatus) {
  switch (status) {
    case "draft":
      return "Brouillon";

    case "registration":
      return "Inscriptions ouvertes";

    case "waiting":
      return "Inscriptions terminées";

    case "drawing":
      return "Tirage en cours";

    case "completed":
      return "Terminé";

    default:
      return status;
  }
}

function formatDate(value: string | null) {
  if (!value) {
    return "—";
  }

  return new Intl.DateTimeFormat("fr-FR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export default function AdminTiragePage() {
  const [contests, setContests] =
    useState<AdminContest[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState<string | null>(null);

  const [actionLoadingId, setActionLoadingId] =
    useState<string | null>(null);

  const [actionMessage, setActionMessage] =
    useState<string | null>(null);

  /* ==========================================================
     SESSION ADMIN
     ========================================================== */

  async function getAdminToken() {
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();

    if (sessionError) {
      throw sessionError;
    }

    const token = session?.access_token;

    if (!token) {
      throw new Error(
        "Tu dois être connecté à l’administration."
      );
    }

    return token;
  }

  /* ==========================================================
     ACTION ADMIN GÉNÉRIQUE
     ========================================================== */

  async function sendContestAction(
    contestId: string,
    action:
      | "open_registration"
      | "close_registration"
      | "prepare_draw"
      | "select_winner"
  ) {
    const token = await getAdminToken();

    const response = await fetch(
      "/api/admin/contests",
      {
        method: "PATCH",
        cache: "no-store",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contestId,
          action,
        }),
      }
    );

    const data =
      (await response.json()) as ContestActionResponse;

    if (!response.ok) {
      throw new Error(
        data.error ??
          "Impossible d’effectuer cette action."
      );
    }

    return data;
  }

  /* ==========================================================
     CHARGEMENT DES CONCOURS
     ========================================================== */

  const loadContests = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError) {
        throw sessionError;
      }

      const token = session?.access_token;

      if (!token) {
        setError(
          "Tu dois être connecté à l’administration."
        );

        setContests([]);
        return;
      }

      const response = await fetch(
        "/api/admin/contests",
        {
          method: "GET",
          cache: "no-store",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data =
        (await response.json()) as AdminContestsResponse;

      if (!response.ok) {
        throw new Error(
          data.error ??
            "Impossible de charger les concours."
        );
      }

      setContests(data.contests ?? []);
    } catch (err) {
      console.error(
        "[admin/tirage] Chargement :",
        err
      );

      setContests([]);

      setError(
        err instanceof Error
          ? err.message
          : "Une erreur est survenue."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadContests();
  }, [loadContests]);

  /* ==========================================================
     OUVERTURE DES INSCRIPTIONS
     ========================================================== */

  async function openRegistration(
    contest: AdminContest
  ) {
    if (contest.status !== "draft") {
      return;
    }

    const confirmed = window.confirm(
      `Ouvrir les inscriptions pour « ${contest.title} » ?\n\n` +
        "Le concours deviendra immédiatement visible et les utilisateurs pourront valider leur participation.\n\n" +
        "Cette action enregistre également la date d’ouverture."
    );

    if (!confirmed) {
      return;
    }

    setActionLoadingId(contest.id);
    setActionMessage(null);
    setError(null);

    try {
      await sendContestAction(
        contest.id,
        "open_registration"
      );

      await loadContests();

      setActionMessage(
        `Les inscriptions pour « ${contest.title} » sont ouvertes.`
      );
    } catch (err) {
      console.error(
        "[admin/tirage] Ouverture :",
        err
      );

      setActionMessage(
        err instanceof Error
          ? err.message
          : "Une erreur est survenue."
      );
    } finally {
      setActionLoadingId(null);
    }
  }

  /* ==========================================================
     FERMETURE DES INSCRIPTIONS
     ========================================================== */

  async function closeRegistration(
    contest: AdminContest
  ) {
    if (contest.status !== "registration") {
      return;
    }

    const confirmed = window.confirm(
      `Fermer les inscriptions pour « ${contest.title} » ?\n\n` +
        "Les nouvelles participations seront immédiatement bloquées.\n\n" +
        "Les participants déjà inscrits resteront enregistrés pour le tirage."
    );

    if (!confirmed) {
      return;
    }

    setActionLoadingId(contest.id);
    setActionMessage(null);
    setError(null);

    try {
      await sendContestAction(
        contest.id,
        "close_registration"
      );

      await loadContests();

      setActionMessage(
        `Les inscriptions pour « ${contest.title} » sont fermées.`
      );
    } catch (err) {
      console.error(
        "[admin/tirage] Fermeture :",
        err
      );

      setActionMessage(
        err instanceof Error
          ? err.message
          : "Une erreur est survenue."
      );
    } finally {
      setActionLoadingId(null);
    }
  }

  /* ==========================================================
     SÉLECTION SÉCURISÉE DU GAGNANT

     Cette fonction ne prépare PAS le tirage.

     Elle doit être appelée uniquement après que les
     présences et les poids ont été figés.

     Elle sert également de procédure de récupération
     si prepare_draw a réussi mais que select_winner
     a échoué ensuite.
     ========================================================== */

  async function selectWinner(
    contest: AdminContest,
    recovery = false
  ) {
    if (contest.status !== "drawing") {
      return;
    }

    setActionLoadingId(contest.id);
    setActionMessage(null);
    setError(null);

    try {
      const data = await sendContestAction(
        contest.id,
        "select_winner"
      );

      await loadContests();

      const winnerName =
        data.winner?.displayName?.trim();

      setActionMessage(
        recovery
          ? winnerName
            ? `Sélection reprise avec succès. Le gagnant « ${winnerName} » est verrouillé côté serveur. La roue publique effectue maintenant sa séquence de révélation.`
            : "Sélection reprise avec succès. Le gagnant est verrouillé côté serveur et la roue publique effectue maintenant sa séquence de révélation."
          : winnerName
            ? `Le gagnant « ${winnerName} » est verrouillé côté serveur. La roue publique effectue maintenant sa séquence de révélation.`
            : "Le gagnant est verrouillé côté serveur. La roue publique effectue maintenant sa séquence de révélation."
      );
    } catch (err) {
      console.error(
        "[admin/tirage] Sélection gagnant :",
        err
      );

      setActionMessage(
        err instanceof Error
          ? err.message
          : "Impossible de sélectionner le gagnant."
      );

      /*
       * Important :
       * on recharge l'état réel du concours.
       *
       * Si le serveur a enregistré le gagnant mais que
       * la réponse réseau a été perdue, l'interface
       * récupérera winnerParticipantId au prochain rendu.
       */
      await loadContests();
    } finally {
      setActionLoadingId(null);
    }
  }

  /* ==========================================================
     LANCEMENT COMPLET DU TIRAGE

     UN SEUL CLIC APRÈS CONFIRMATION :

     1. prepare_draw
        → fige présence
        → attribue poids 2 / 3
        → passe waiting → drawing

     2. select_winner
        → crypto.randomInt côté serveur
        → verrouille le gagnant une seule fois
        → définit draw_reveal_at à +12 secondes

     Si l'étape 2 échoue :
     on ne relance JAMAIS prepare_draw.
     L'état drawing permettra uniquement de reprendre
     select_winner.
     ========================================================== */

  async function launchDraw(
    contest: AdminContest
  ) {
    if (contest.status !== "waiting") {
      return;
    }

    if (contest.participantCount < 1) {
      setActionMessage(
        "Impossible de lancer un tirage sans participant."
      );

      return;
    }

    const confirmed = window.confirm(
      `LANCER LE TIRAGE « ${contest.title} » ?\n\n` +
        `Participants enregistrés : ${contest.participantCount}\n\n` +
        "ATTENTION : cette action est réelle.\n\n" +
        "La présence de chaque participant sera figée immédiatement. " +
        "Les personnes présentes sur la page au moment précis du lancement auront le bonus ×1,5.\n\n" +
        "Après le snapshot, le serveur sélectionnera immédiatement et définitivement le gagnant.\n\n" +
        "La roue publique lancera ensuite sa séquence de révélation synchronisée.\n\n" +
        "Continuer ?"
    );

    if (!confirmed) {
      return;
    }

    const finalConfirmation = window.confirm(
      "DERNIÈRE CONFIRMATION\n\n" +
        "En confirmant :\n\n" +
        "• les présences seront figées immédiatement ;\n" +
        "• les poids du tirage seront définitivement attribués ;\n" +
        "• le gagnant sera réellement sélectionné côté serveur ;\n" +
        "• il ne pourra pas être retiré ou relancé depuis cette interface ;\n" +
        "• la roue publique commencera sa révélation.\n\n" +
        "CONFIRMER LE TIRAGE RÉEL ?"
    );

    if (!finalConfirmation) {
      return;
    }

    setActionLoadingId(contest.id);
    setActionMessage(null);
    setError(null);

    let preparationCompleted = false;

    try {
      /* ÉTAPE 1 — SNAPSHOT */
      const preparation =
        await sendContestAction(
          contest.id,
          "prepare_draw"
        );

      preparationCompleted = true;

      /*
       * ÉTAPE 2 — GAGNANT
       *
       * On l'appelle immédiatement après le snapshot.
       * Aucun Math.random() n'existe dans cette page.
       */
      const winnerResult =
        await sendContestAction(
          contest.id,
          "select_winner"
        );

      await loadContests();

      const preparationInfo =
        preparation.preparation;

      const winnerName =
        winnerResult.winner?.displayName?.trim();

      const presenceText =
        preparationInfo
          ? `${preparationInfo.participantCount} participant(s) : ${preparationInfo.presentCount} présent(s), ${preparationInfo.absentCount} absent(s). `
          : "";

      setActionMessage(
        `${presenceText}` +
          (winnerName
            ? `Le gagnant « ${winnerName} » est verrouillé côté serveur. `
            : "Le gagnant est verrouillé côté serveur. ") +
          "La roue publique effectue maintenant sa séquence de révélation synchronisée."
      );
    } catch (err) {
      console.error(
        "[admin/tirage] Lancement :",
        err
      );

      /*
       * Cas critique :
       *
       * prepare_draw a fonctionné, mais select_winner
       * ou sa réponse réseau a échoué.
       *
       * On NE REFAIT PAS le snapshot.
       */
      if (preparationCompleted) {
        setActionMessage(
          "Les présences ont bien été figées, mais la sélection du gagnant n’a pas pu être confirmée. Ne relance surtout pas le snapshot. Actualise l’état : si aucun gagnant n’est verrouillé, utilise « Reprendre la sélection »."
        );

        await loadContests();
      } else {
        setActionMessage(
          err instanceof Error
            ? err.message
            : "Impossible de lancer le tirage."
        );

        await loadContests();
      }
    } finally {
      setActionLoadingId(null);
    }
  }

  return (
    <main className="min-h-screen bg-[#d6d2cb] text-[#151412]">
      <section className="mx-auto max-w-7xl px-5 py-10 sm:px-6 md:px-8 md:py-16">
        {/* EN-TÊTE */}
        <div className="flex flex-col gap-6 border-b border-black/10 pb-8 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-[9px] uppercase tracking-[0.34em] text-black/40">
              AJVEK · Administration
            </p>

            <h1 className="mt-4 font-display text-5xl leading-none sm:text-6xl">
              Le Tirage
            </h1>

            <p className="mt-4 max-w-xl text-sm leading-6 text-black/55">
              Gestion des concours et suivi des
              participations AJVEK.
            </p>
          </div>

          <button
            type="button"
            onClick={() => void loadContests()}
            disabled={loading || actionLoadingId !== null}
            className="w-fit rounded-full border border-black/15 px-6 py-3 text-[9px] uppercase tracking-[0.22em] transition hover:bg-black hover:text-white disabled:cursor-wait disabled:opacity-40"
          >
            {loading
              ? "Actualisation..."
              : "Actualiser"}
          </button>
        </div>

        {/* ERREUR */}
        {error && (
          <div className="mt-8 rounded-[20px] border border-black/10 bg-[#ebe8e1] p-6">
            <p className="text-[9px] uppercase tracking-[0.25em] text-black/40">
              Erreur
            </p>

            <p className="mt-3 text-sm leading-6 text-black/65">
              {error}
            </p>
          </div>
        )}

        {/* MESSAGE ACTION */}
        {actionMessage && (
          <div className="mt-8 rounded-[20px] border border-black/10 bg-[#ebe8e1] p-6">
            <p className="text-[9px] uppercase tracking-[0.25em] text-black/40">
              Tirage
            </p>

            <p className="mt-3 text-sm leading-6 text-black/65">
              {actionMessage}
            </p>
          </div>
        )}

        {/* CHARGEMENT */}
        {loading && (
          <div className="mt-8 rounded-[24px] border border-black/10 bg-[#ebe8e1] p-8">
            <p className="text-xs uppercase tracking-[0.22em] text-black/40">
              Chargement des concours...
            </p>
          </div>
        )}

        {/* AUCUN CONCOURS */}
        {!loading &&
          !error &&
          contests.length === 0 && (
            <div className="mt-8 rounded-[24px] border border-black/10 bg-[#ebe8e1] p-8">
              <p className="text-[9px] uppercase tracking-[0.3em] text-black/40">
                Concours
              </p>

              <h2 className="mt-4 font-display text-3xl">
                Aucun concours.
              </h2>
            </div>
          )}

        {/* CONCOURS */}
        {!loading &&
          !error &&
          contests.length > 0 && (
            <div className="mt-8 space-y-6">
              {contests.map((contest) => (
                <article
                  key={contest.id}
                  className="overflow-hidden rounded-[26px] border border-black/10 bg-[#ebe8e1]"
                >
                  <div className="grid lg:grid-cols-[1.25fr_0.75fr]">
                    {/* INFORMATIONS */}
                    <div className="p-7 sm:p-9">
                      <div className="flex flex-wrap items-center gap-3">
                        <span className="rounded-full bg-[#151412] px-4 py-2 text-[8px] uppercase tracking-[0.22em] text-white">
                          {getStatusLabel(
                            contest.status
                          )}
                        </span>

                        <span className="text-[9px] uppercase tracking-[0.22em] text-black/35">
                          {contest.participantCount}{" "}
                          participant
                          {contest.participantCount > 1
                            ? "s"
                            : ""}
                        </span>

                        {contest.winnerParticipantId && (
                          <span className="rounded-full border border-black/15 px-4 py-2 text-[8px] uppercase tracking-[0.2em] text-black/50">
                            Gagnant verrouillé
                          </span>
                        )}
                      </div>

                      <h2 className="mt-7 font-display text-4xl leading-none sm:text-5xl">
                        {contest.title}
                      </h2>

                      {contest.description && (
                        <p className="mt-5 max-w-2xl text-sm leading-6 text-black/55">
                          {contest.description}
                        </p>
                      )}

                      <div className="mt-8 border-t border-black/10">
                        <div className="flex flex-col gap-2 border-b border-black/10 py-4 sm:flex-row sm:items-center sm:justify-between">
                          <span className="text-[9px] uppercase tracking-[0.22em] text-black/35">
                            Lot
                          </span>

                          <span className="text-sm">
                            {contest.prize}
                          </span>
                        </div>

                        <div className="flex flex-col gap-2 border-b border-black/10 py-4 sm:flex-row sm:items-center sm:justify-between">
                          <span className="text-[9px] uppercase tracking-[0.22em] text-black/35">
                            Bonus présence
                          </span>

                          <span className="text-sm">
                            ×
                            {
                              contest.presenceMultiplier
                            }
                          </span>
                        </div>

                        <div className="flex flex-col gap-2 border-b border-black/10 py-4 sm:flex-row sm:items-center sm:justify-between">
                          <span className="text-[9px] uppercase tracking-[0.22em] text-black/35">
                            Créé le
                          </span>

                          <span className="text-sm">
                            {formatDate(
                              contest.createdAt
                            )}
                          </span>
                        </div>
                      </div>

                      {/* ACTION BROUILLON */}
                      {contest.status === "draft" && (
                        <div className="mt-8">
                          <p className="text-[9px] uppercase tracking-[0.28em] text-black/35">
                            Administration
                          </p>

                          <button
                            type="button"
                            onClick={() =>
                              void openRegistration(
                                contest
                              )
                            }
                            disabled={
                              actionLoadingId !==
                              null
                            }
                            className="mt-4 rounded-full bg-[#151412] px-7 py-4 text-[9px] uppercase tracking-[0.22em] text-white transition-opacity hover:opacity-80 disabled:cursor-wait disabled:opacity-35"
                          >
                            {actionLoadingId ===
                            contest.id
                              ? "Ouverture..."
                              : "Ouvrir les inscriptions"}
                          </button>

                          <p className="mt-4 max-w-xl text-xs leading-5 text-black/45">
                            Une confirmation sera
                            demandée avant toute
                            ouverture. Une fois
                            ouvertes, les utilisateurs
                            pourront réellement
                            s’inscrire au concours.
                          </p>
                        </div>
                      )}

                      {/* INSCRIPTIONS OUVERTES */}
                      {contest.status ===
                        "registration" && (
                        <div className="mt-8">
                          <div className="rounded-[18px] border border-black/10 px-5 py-4">
                            <p className="text-[9px] uppercase tracking-[0.22em] text-black/45">
                              Inscriptions actuellement
                              ouvertes
                            </p>

                            <p className="mt-2 text-xs leading-5 text-black/45">
                              Les utilisateurs peuvent
                              actuellement rejoindre ce
                              concours.
                            </p>
                          </div>

                          <button
                            type="button"
                            onClick={() =>
                              void closeRegistration(
                                contest
                              )
                            }
                            disabled={
                              actionLoadingId !==
                              null
                            }
                            className="mt-4 rounded-full border border-black/20 px-7 py-4 text-[9px] uppercase tracking-[0.22em] transition hover:bg-black hover:text-white disabled:cursor-wait disabled:opacity-35"
                          >
                            {actionLoadingId ===
                            contest.id
                              ? "Fermeture..."
                              : "Fermer les inscriptions"}
                          </button>

                          <p className="mt-4 max-w-xl text-xs leading-5 text-black/45">
                            Une confirmation sera
                            demandée. Les
                            participations déjà
                            enregistrées seront
                            conservées.
                          </p>
                        </div>
                      )}

                      {/* PRÊT POUR LE TIRAGE */}
                      {contest.status === "waiting" && (
                        <div className="mt-8">
                          <div className="rounded-[18px] border border-black/10 bg-black/[0.03] px-5 py-4">
                            <p className="text-[9px] uppercase tracking-[0.22em] text-black/45">
                              Inscriptions terminées
                            </p>

                            <p className="mt-2 text-xs leading-5 text-black/45">
                              Les participations sont
                              verrouillées. Le concours
                              est prêt pour le lancement
                              réel du tirage.
                            </p>
                          </div>

                          <button
                            type="button"
                            onClick={() =>
                              void launchDraw(contest)
                            }
                            disabled={
                              actionLoadingId !==
                                null ||
                              contest.participantCount <
                                1
                            }
                            className="mt-4 rounded-full bg-[#151412] px-7 py-4 text-[9px] uppercase tracking-[0.22em] text-white transition-opacity hover:opacity-80 disabled:cursor-not-allowed disabled:opacity-35"
                          >
                            {actionLoadingId ===
                            contest.id
                              ? "Lancement..."
                              : "Lancer le tirage"}
                          </button>

                          <p className="mt-4 max-w-xl text-xs leading-5 text-black/45">
                            Un seul lancement : les
                            présences seront figées,
                            les poids 2/3 attribués,
                            puis le gagnant sera
                            sélectionné et verrouillé
                            côté serveur. Deux
                            confirmations seront
                            demandées.
                          </p>
                        </div>
                      )}

                      {/* TIRAGE EN COURS */}
                      {contest.status === "drawing" && (
                        <div className="mt-8">
                          <div className="rounded-[18px] border border-black/10 bg-black/[0.03] px-5 py-4">
                            <p className="text-[9px] uppercase tracking-[0.22em] text-black/45">
                              {contest.winnerParticipantId
                                ? "Gagnant verrouillé"
                                : "Tirage préparé"}
                            </p>

                            <p className="mt-2 text-xs leading-5 text-black/45">
                              {contest.winnerParticipantId
                                ? "Le gagnant a été sélectionné côté serveur. La roue publique effectue la séquence de révélation synchronisée. Aucun nouveau tirage ne peut être effectué."
                                : "Les présences et les poids sont figés, mais aucun gagnant n’est encore verrouillé. Utilise la reprise ci-dessous pour terminer la sélection sans refaire le snapshot."}
                            </p>
                          </div>

                          {!contest.winnerParticipantId && (
                            <>
                              <button
                                type="button"
                                onClick={() => {
                                  const confirmed =
                                    window.confirm(
                                      "REPRENDRE LA SÉLECTION ?\n\n" +
                                        "Les présences sont déjà figées.\n\n" +
                                        "Cette action ne refera PAS le snapshot. Elle sélectionnera uniquement le gagnant à partir des poids déjà enregistrés.\n\n" +
                                        "Continuer ?"
                                    );

                                  if (confirmed) {
                                    void selectWinner(
                                      contest,
                                      true
                                    );
                                  }
                                }}
                                disabled={
                                  actionLoadingId !==
                                  null
                                }
                                className="mt-4 rounded-full border border-black/20 px-7 py-4 text-[9px] uppercase tracking-[0.22em] transition hover:bg-black hover:text-white disabled:cursor-wait disabled:opacity-35"
                              >
                                {actionLoadingId ===
                                contest.id
                                  ? "Sélection..."
                                  : "Reprendre la sélection"}
                              </button>

                              <p className="mt-4 max-w-xl text-xs leading-5 text-black/45">
                                Ce bouton est uniquement
                                une sécurité de reprise.
                                Il ne modifie pas les
                                présences déjà figées et
                                ne relance pas
                                prepare_draw.
                              </p>
                            </>
                          )}
                        </div>
                      )}

                      {/* TERMINÉ */}
                      {contest.status ===
                        "completed" && (
                        <div className="mt-8 rounded-[18px] border border-black/10 bg-black/[0.03] px-5 py-4">
                          <p className="text-[9px] uppercase tracking-[0.22em] text-black/45">
                            Concours terminé
                          </p>

                          <p className="mt-2 text-xs leading-5 text-black/45">
                            Le résultat de ce concours
                            est définitif.
                          </p>
                        </div>
                      )}
                    </div>

                    {/* ÉTAT */}
                    <div className="border-t border-black/10 bg-[#11110f] p-7 text-[#f4f1ea] sm:p-9 lg:border-l lg:border-t-0">
                      <p className="text-[9px] uppercase tracking-[0.3em] text-white/35">
                        État du concours
                      </p>

                      <div className="mt-7 space-y-5">
                        <div>
                          <p className="text-[8px] uppercase tracking-[0.22em] text-white/30">
                            Ouverture inscriptions
                          </p>

                          <p className="mt-2 text-xs text-white/70">
                            {formatDate(
                              contest.registrationOpenedAt
                            )}
                          </p>
                        </div>

                        <div>
                          <p className="text-[8px] uppercase tracking-[0.22em] text-white/30">
                            Fermeture inscriptions
                          </p>

                          <p className="mt-2 text-xs text-white/70">
                            {formatDate(
                              contest.registrationClosedAt
                            )}
                          </p>
                        </div>

                        <div>
                          <p className="text-[8px] uppercase tracking-[0.22em] text-white/30">
                            Lancement tirage
                          </p>

                          <p className="mt-2 text-xs text-white/70">
                            {formatDate(
                              contest.drawStartedAt
                            )}
                          </p>
                        </div>

                        <div>
                          <p className="text-[8px] uppercase tracking-[0.22em] text-white/30">
                            Gagnant
                          </p>

                          <p className="mt-2 text-xs text-white/70">
                            {contest.winnerParticipantId
                              ? "Verrouillé"
                              : "—"}
                          </p>
                        </div>

                        <div>
                          <p className="text-[8px] uppercase tracking-[0.22em] text-white/30">
                            Terminé
                          </p>

                          <p className="mt-2 text-xs text-white/70">
                            {formatDate(
                              contest.completedAt
                            )}
                          </p>
                        </div>
                      </div>

                      <div className="mt-9 border-t border-white/10 pt-6">
                        <p className="text-[8px] uppercase tracking-[0.22em] text-white/30">
                          Identifiant
                        </p>

                        <p className="mt-2 break-all text-[10px] leading-5 text-white/45">
                          {contest.id}
                        </p>
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}

        {/* INFORMATION SÉCURITÉ */}
        <div className="mt-8 rounded-[20px] border border-black/10 px-6 py-5">
          <p className="text-[9px] uppercase tracking-[0.25em] text-black/35">
            Gestion sécurisée
          </p>

          <p className="mt-2 text-xs leading-5 text-black/50">
            Les changements d’état sont vérifiés
            côté serveur. Au lancement, les présences
            et les bonus sont figés avant la sélection
            sécurisée du gagnant. Une fois verrouillé,
            le gagnant ne peut pas être retiré par un
            second lancement.
          </p>
        </div>
      </section>
    </main>
  );
}