"use client";

import { useEffect, useState } from "react";

type TikTokUser = {
  displayName: string;
  avatarUrl: string | null;
};

type TikTokMeResponse = {
  authenticated: boolean;
  user: TikTokUser | null;
};

export default function TiragePage() {

  const [loadingTikTok, setLoadingTikTok] =
    useState(true);

  const [tiktokUser, setTikTokUser] =
    useState<TikTokUser | null>(null);

  const [tiktokError, setTikTokError] =
    useState<string | null>(null);

  /*
   * Vérifie si une session TikTok AJVEK
   * existe déjà dans le navigateur.
   */
  useEffect(() => {
    let cancelled = false;

    async function loadTikTokSession() {
      try {
        const response = await fetch(
          "/api/auth/tiktok/me",
          {
            method: "GET",
            cache: "no-store",
            credentials: "include",
          }
        );

        if (!response.ok) {
          throw new Error(
            "Impossible de vérifier la session TikTok."
          );
        }

        const data =
          (await response.json()) as TikTokMeResponse;

        if (cancelled) {
          return;
        }

        if (
          data.authenticated &&
          data.user
        ) {
          setTikTokUser(data.user);
        } else {
          setTikTokUser(null);
        }
      } catch (error) {
        console.error(
          "[tirage] Session TikTok :",
          error
        );

        if (!cancelled) {
          setTikTokUser(null);
        }
      } finally {
        if (!cancelled) {
          setLoadingTikTok(false);
        }
      }
    }

    loadTikTokSession();

    return () => {
      cancelled = true;
    };
  }, []);

  /*
 * Message éventuel renvoyé par
 * le callback OAuth TikTok.
 */
useEffect(() => {
  const params =
    new URLSearchParams(
      window.location.search
    );

  const status =
    params.get("tiktok");

  if (!status) {
    return;
  }

  if (status === "authenticated") {
    setTikTokError(null);
    return;
  }

  if (status === "cancelled") {
    setTikTokError(
      "Connexion TikTok annulée."
    );
    return;
  }

  setTikTokError(
    "La connexion TikTok n’a pas pu être finalisée. Réessaie."
  );
}, []);

  function connectWithTikTok() {
    window.location.href =
      "/api/auth/tiktok/start";
  }

  return (
    <main className="min-h-screen bg-[#d6d2cb] text-[#151412]">
      {/* HERO */}
      <section className="mx-auto max-w-7xl px-6 pb-14 pt-16 md:px-8 md:pb-20 md:pt-24">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-[10px] uppercase tracking-[0.38em] text-black/45">
            AJVEK · Concours
          </p>

          <h1 className="mt-5 font-display text-5xl leading-none tracking-tight sm:text-6xl md:text-8xl">
            Le Tirage
          </h1>

          <p className="mx-auto mt-6 max-w-xl text-sm leading-6 text-black/60 md:text-base">
            Les concours AJVEK prennent vie ici.
            Inscris-toi, assiste au tirage en direct
            et découvre le gagnant.
          </p>
        </div>
      </section>

      {/* CONCOURS */}
      <section className="mx-auto max-w-7xl px-4 pb-20 sm:px-6 md:px-8 md:pb-28">
        <div className="overflow-hidden rounded-[28px] border border-black/10 bg-[#11110f] text-[#f4f1ea] shadow-2xl shadow-black/10">
          <div className="grid lg:grid-cols-[0.85fr_1.15fr]">
            {/* INFOS */}
            <div className="flex flex-col justify-between border-b border-white/10 p-7 sm:p-10 lg:min-h-[650px] lg:border-b-0 lg:border-r lg:p-12">
              <div>
                <div className="flex items-center gap-3">
                  <span className="h-2 w-2 rounded-full bg-[#f4f1ea]" />

                  <p className="text-[9px] uppercase tracking-[0.32em] text-white/45">
                    Prochain tirage
                  </p>
                </div>

                <h2 className="mt-8 font-display text-4xl leading-[0.95] sm:text-5xl">
                  100 abonnés
                  <br />
                  TikTok
                </h2>

                <p className="mt-6 max-w-sm text-sm leading-6 text-white/55">
                  Pour célébrer les 100 premiers
                  abonnés AJVEK, un participant
                  remportera le t-shirt de son choix.
                </p>

                <div className="mt-10 border-t border-white/10">
                  <div className="flex items-center justify-between border-b border-white/10 py-5">
                    <span className="text-[9px] uppercase tracking-[0.25em] text-white/35">
                      Lot
                    </span>

                    <span className="text-xs uppercase tracking-[0.16em]">
                      1 t-shirt AJVEK
                    </span>
                  </div>

                  <div className="flex items-center justify-between border-b border-white/10 py-5">
                    <span className="text-[9px] uppercase tracking-[0.25em] text-white/35">
                      Participants
                    </span>

                    <span className="text-xs uppercase tracking-[0.16em]">
                      Bientôt
                    </span>
                  </div>

                  <div className="flex items-center justify-between border-b border-white/10 py-5">
                    <span className="text-[9px] uppercase tracking-[0.25em] text-white/35">
                      Statut
                    </span>

                    <span className="text-xs uppercase tracking-[0.16em]">
                      Préparation
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-12">
                <p className="text-[9px] uppercase tracking-[0.3em] text-white/35">
                  Présent pendant le direct
                </p>

                <p className="mt-3 font-display text-3xl">
                  Chances ×1,5
                </p>

                <p className="mt-3 max-w-sm text-xs leading-5 text-white/45">
                  Le fonctionnement précis du bonus
                  sera affiché avant chaque tirage.
                </p>
              </div>
            </div>

            {/* ROUE */}
            <div className="relative flex min-h-[520px] items-center justify-center overflow-hidden p-6 sm:p-10 lg:min-h-[650px]">
              <div className="absolute left-8 top-8 text-[10px] tracking-[0.3em] text-white/25">
                AJVEK / 001
              </div>

              <div className="absolute bottom-8 right-8 text-[10px] uppercase tracking-[0.3em] text-white/25">
                Tirage en direct
              </div>

              <div className="absolute left-1/2 top-[54px] z-20 -translate-x-1/2">
                <div className="h-0 w-0 border-l-[10px] border-r-[10px] border-t-[18px] border-l-transparent border-r-transparent border-t-[#f4f1ea]" />
              </div>

              <div className="relative flex aspect-square w-full max-w-[480px] items-center justify-center rounded-full border border-white/25">
                <div className="absolute inset-[7%] rounded-full border border-white/10" />
                <div className="absolute inset-[16%] rounded-full border border-white/[0.06]" />

                <div className="absolute inset-0">
                  {Array.from({
                    length: 12,
                  }).map((_, index) => (
                    <span
                      key={index}
                      className="absolute left-1/2 top-1/2 h-1/2 w-px origin-top bg-white/10"
                      style={{
                        transform: `rotate(${
                          index * 30
                        }deg)`,
                      }}
                    />
                  ))}
                </div>

                <div className="relative z-10 flex h-32 w-32 items-center justify-center rounded-full border border-white/15 bg-[#11110f] shadow-2xl sm:h-40 sm:w-40">
                  <span className="font-display text-2xl tracking-[0.18em] sm:text-3xl">
                    AJVEK
                  </span>
                </div>

                <span className="absolute left-1/2 top-[9%] -translate-x-1/2 text-[9px] uppercase tracking-[0.18em] text-white/30">
                  Participant
                </span>

                <span className="absolute bottom-[13%] left-[20%] text-[9px] uppercase tracking-[0.18em] text-white/30">
                  Participant
                </span>

                <span className="absolute right-[10%] top-[43%] text-[9px] uppercase tracking-[0.18em] text-white/30">
                  Participant
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* INSCRIPTION */}
        <div className="mx-auto mt-6 max-w-7xl rounded-[24px] border border-black/10 bg-[#ebe8e1] p-7 sm:p-9">
          <div className="flex flex-col gap-7 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-[9px] uppercase tracking-[0.32em] text-black/40">
                Participer
              </p>

              <h3 className="mt-3 font-display text-3xl">
                {tiktokUser
                  ? "Identité confirmée."
                  : "Rejoins le tirage."}
              </h3>

              {tiktokUser ? (
                <div className="mt-4 flex items-center gap-4">
                  {tiktokUser.avatarUrl ? (
                    <img
                      src={tiktokUser.avatarUrl}
                      alt=""
                      className="h-11 w-11 rounded-full object-cover"
                    />
                  ) : (
                    <div className="flex h-11 w-11 items-center justify-center rounded-full bg-black/10 font-display text-lg">
                      {tiktokUser.displayName
                        .charAt(0)
                        .toUpperCase()}
                    </div>
                  )}

                  <div>
                    <p className="text-sm font-medium">
                      {tiktokUser.displayName}
                    </p>

                    <p className="mt-1 text-[9px] uppercase tracking-[0.22em] text-black/40">
                      Connecté avec TikTok
                    </p>
                  </div>
                </div>
              ) : (
                <p className="mt-3 max-w-xl text-sm leading-6 text-black/55">
                  La connexion TikTok permettra de
                  confirmer ton identité et de choisir
                  ton modèle, ta couleur et ta taille.
                </p>
              )}

              {tiktokError && (
                <p className="mt-4 text-xs text-black/60">
                  {tiktokError}
                </p>
              )}
            </div>

            {!tiktokUser && (
              <button
                type="button"
                onClick={connectWithTikTok}
                disabled={loadingTikTok}
                className="shrink-0 rounded-full bg-[#151412] px-7 py-4 text-[10px] uppercase tracking-[0.24em] text-white transition-opacity hover:opacity-80 disabled:cursor-wait disabled:opacity-45"
              >
                {loadingTikTok
                  ? "Vérification..."
                  : "Continuer avec TikTok"}
              </button>
            )}

            {tiktokUser && (
              <div className="shrink-0 rounded-full border border-black/15 px-7 py-4 text-[10px] uppercase tracking-[0.24em] text-black/55">
                TikTok connecté
              </div>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}