"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

type TikTokUser = {
  displayName: string;
  avatarUrl: string | null;
};

type TikTokMeResponse = {
  authenticated: boolean;
  user: TikTokUser | null;
};

type DrawParticipant = {
  slotKey: string;
  displayName: string;
  avatarUrl: string | null;
  wasPresent: boolean;
  drawWeight: number;
};

type Winner = {
  slotKey: string;
  displayName: string;
  avatarUrl: string | null;
  productSlug: string;
  color: string;
  size: string;
  wasPresent: boolean | null;
};

type Contest = {
  id: string;
  title: string;
  description: string | null;
  prize: string;

  status:
    | "registration"
    | "waiting"
    | "drawing"
    | "completed";

  presenceMultiplier: number;
  participantCount: number;

  registrationOpenedAt: string | null;
  registrationClosedAt: string | null;
  drawStartedAt: string | null;

  draw: {
    startedAt: string | null;
    revealAt: string | null;
    winnerLocked: boolean;
    participants: DrawParticipant[];
  };

  completedAt: string | null;

  winner: Winner | null;
};

type CurrentContestResponse = {
  contest: Contest | null;
};

type Participation = {
  id?: string;
  productSlug: "roses" | "sakura";
  color: "Blanc" | "Noir";
  size: "XS" | "S" | "M" | "L";
  createdAt?: string;
};

type ParticipationResponse = {
  authenticated: boolean;
  participation: Participation | null;
  error?: string;
};

type WheelSlot = DrawParticipant & {
  wheelKey: string;
};

/* ============================================================
   OUTILS ROUE
   ============================================================ */

function normalizeDegrees(value: number) {
  return ((value % 360) + 360) % 360;
}

function getWinnerCopy(
  winner: Winner | null
) {
  if (!winner) {
    return "";
  }

  return `${
    winner.productSlug === "sakura"
      ? "Cerisier"
      : "Roses"
  } · ${winner.color} · ${winner.size}`;
}

/* ============================================================
   PAGE
   ============================================================ */

export default function TiragePage() {
  const [loadingTikTok, setLoadingTikTok] =
    useState(true);

  const [tiktokUser, setTikTokUser] =
    useState<TikTokUser | null>(null);

  const [tiktokError, setTikTokError] =
    useState<string | null>(null);

  const [selectedProduct, setSelectedProduct] =
    useState<"roses" | "sakura">("roses");

  const [selectedColor, setSelectedColor] =
    useState<"Blanc" | "Noir">("Blanc");

  const [selectedSize, setSelectedSize] =
    useState<"XS" | "S" | "M" | "L">("M");

  const [
    participationLoading,
    setParticipationLoading,
  ] = useState(false);

  const [
    participationMessage,
    setParticipationMessage,
  ] = useState<string | null>(null);

  const [participation, setParticipation] =
    useState<Participation | null>(null);

  const [
    loadingParticipation,
    setLoadingParticipation,
  ] = useState(false);

  const [contest, setContest] =
    useState<Contest | null>(null);

  const [loadingContest, setLoadingContest] =
    useState(true);

  const [wheelRotation, setWheelRotation] =
    useState(0);

  const [settlingWinner, setSettlingWinner] =
    useState(false);

  const [
    winnerAnimationFinished,
    setWinnerAnimationFinished,
  ] = useState(false);

  const [
    revealCountdown,
    setRevealCountdown,
  ] = useState<number | null>(null);

  const wheelRotationRef = useRef(0);

  const previousContestIdRef =
    useRef<string | null>(null);

  const previousWinnerKeyRef =
    useRef<string | null>(null);

  /* ============================================================
     SLOTS PONDÉRÉS

     Un participant absent possède 2 cases.
     Un participant présent possède 3 cases.

     3 / 2 = ×1,5.

     La représentation visuelle suit donc exactement
     les poids utilisés par le serveur.
     ============================================================ */

  const wheelSlots = useMemo<WheelSlot[]>(
    () => {
      if (!contest?.draw?.participants) {
        return [];
      }

      const slots: WheelSlot[] = [];

      for (
        const participant of
          contest.draw.participants
      ) {
        const weight =
          Number.isInteger(
            participant.drawWeight
          ) &&
          participant.drawWeight > 0
            ? participant.drawWeight
            : 1;

        for (
          let index = 0;
          index < weight;
          index += 1
        ) {
          slots.push({
            ...participant,

            wheelKey:
              `${participant.slotKey}-${index}`,
          });
        }
      }

      return slots;
    },
    [contest?.draw?.participants]
  );

  /* ============================================================
     SESSION TIKTOK
     ============================================================ */

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

    void loadTikTokSession();

    return () => {
      cancelled = true;
    };
  }, []);

  /* ============================================================
     CONCOURS PUBLIC + POLLING

     Hors tirage :
     actualisation toutes les 5 secondes.

     Pendant le tirage :
     actualisation toutes les 500 ms pour que la
     révélation soit quasi simultanée chez tous.
     ============================================================ */

  useEffect(() => {
    let cancelled = false;
    let timeoutId: number | null = null;

    async function loadContest() {
      try {
        const response = await fetch(
          "/api/contests/current",
          {
            method: "GET",
            cache: "no-store",
          }
        );

        if (!response.ok) {
          throw new Error(
            "Impossible de charger le concours."
          );
        }

        const data =
          (await response.json()) as CurrentContestResponse;

        if (cancelled) {
          return;
        }

        setContest(data.contest);
        setLoadingContest(false);

        const fastPolling =
          data.contest?.status ===
            "drawing" ||
          Boolean(
            data.contest?.draw
              ?.winnerLocked
          );

        timeoutId =
          window.setTimeout(
            () => {
              void loadContest();
            },
            fastPolling ? 500 : 5_000
          );
      } catch (error) {
        console.error(
          "[tirage] Concours :",
          error
        );

        if (cancelled) {
          return;
        }

        setLoadingContest(false);

        timeoutId =
          window.setTimeout(
            () => {
              void loadContest();
            },
            3_000
          );
      }
    }

    void loadContest();

    return () => {
      cancelled = true;

      if (timeoutId !== null) {
        window.clearTimeout(
          timeoutId
        );
      }
    };
  }, []);

  /* ============================================================
     RÉINITIALISATION DE LA ROUE
     ============================================================ */

  useEffect(() => {
    const contestId =
      contest?.id ?? null;

    if (
      previousContestIdRef.current !==
      contestId
    ) {
      previousContestIdRef.current =
        contestId;

      previousWinnerKeyRef.current =
        null;

      wheelRotationRef.current = 0;

      setWheelRotation(0);
      setSettlingWinner(false);
      setWinnerAnimationFinished(
        Boolean(
          contest?.status ===
            "completed" &&
            contest.winner
        )
      );
    }
  }, [
    contest?.id,
    contest?.status,
    contest?.winner,
  ]);

  /* ============================================================
     ANIMATION SYNCHRONISÉE AVANT RÉVÉLATION

     draw_reveal_at est la référence serveur.

     Le début visuel correspond à :
     revealAt - 12 secondes.

     Tous les visiteurs calculent donc la position
     de la roue depuis la même horloge absolue.
     ============================================================ */

  useEffect(() => {
    if (
      contest?.status !== "drawing" ||
      !contest.draw?.winnerLocked ||
      !contest.draw.revealAt ||
      wheelSlots.length === 0
    ) {
      setRevealCountdown(null);
      return;
    }

    const revealAt =
      new Date(
        contest.draw.revealAt
      ).getTime();

    if (
      !Number.isFinite(revealAt)
    ) {
      return;
    }

    const visualStart =
      revealAt - 12_000;

    let frameId = 0;

    function animate() {
      const now = Date.now();

      const remaining =
        Math.max(
          0,
          revealAt - now
        );

      setRevealCountdown(
        remaining
      );

      /*
       * 2 tours par seconde.
       *
       * La position dépend du temps absolu,
       * et non du moment où le visiteur
       * a ouvert la page.
       */
      const elapsed =
        Math.max(
          0,
          now - visualStart
        );

      const rotation =
        (elapsed / 1000) * 720;

      wheelRotationRef.current =
        rotation;

      setWheelRotation(rotation);

      if (remaining > 0) {
        frameId =
          window.requestAnimationFrame(
            animate
          );
      }
    }

    frameId =
      window.requestAnimationFrame(
        animate
      );

    return () => {
      window.cancelAnimationFrame(
        frameId
      );
    };
  }, [
    contest?.status,
    contest?.draw?.winnerLocked,
    contest?.draw?.revealAt,
    wheelSlots.length,
  ]);
    /* ============================================================
     ARRÊT SUR LE GAGNANT

     Une fois le gagnant officiellement révélé par
     le serveur, on trouve sa case grâce au slotKey.

     Le participant peut posséder plusieurs cases
     à cause de son poids. Une de ses cases est
     choisie de façon déterministe pour l'affichage.

     Cela ne modifie évidemment PAS le gagnant :
     il a déjà été choisi et verrouillé côté serveur.
     ============================================================ */

  useEffect(() => {
    const winner =
      contest?.winner;

    if (
      contest?.status !==
        "completed" ||
      !winner ||
      wheelSlots.length === 0
    ) {
      return;
    }

    if (
      previousWinnerKeyRef.current ===
      winner.slotKey
    ) {
      return;
    }

    previousWinnerKeyRef.current =
      winner.slotKey;

    const matchingIndexes =
      wheelSlots
        .map((slot, index) => ({
          slot,
          index,
        }))
        .filter(
          ({ slot }) =>
            slot.slotKey ===
            winner.slotKey
        )
        .map(
          ({ index }) => index
        );

    if (
      matchingIndexes.length === 0
    ) {
      setWinnerAnimationFinished(
        true
      );

      return;
    }

    const selector =
      winner.slotKey
        .split("")
        .reduce(
          (total, character) =>
            total +
            character.charCodeAt(0),
          0
        );

    const winnerIndex =
      matchingIndexes[
        selector %
          matchingIndexes.length
      ];

    const slotAngle =
      360 /
      wheelSlots.length;

    const targetModulo =
      normalizeDegrees(
        -(
          winnerIndex *
            slotAngle +
          slotAngle / 2
        )
      );

    const currentRotation =
      wheelRotationRef.current;

    const currentModulo =
      normalizeDegrees(
        currentRotation
      );

    const correction =
      normalizeDegrees(
        targetModulo -
          currentModulo
      );

    const targetRotation =
      currentRotation +
      720 +
      correction;

    setSettlingWinner(true);
    setWinnerAnimationFinished(
      false
    );

    wheelRotationRef.current =
      targetRotation;

    setWheelRotation(
      targetRotation
    );

    const timeoutId =
      window.setTimeout(
        () => {
          setSettlingWinner(false);

          setWinnerAnimationFinished(
            true
          );
        },
        1_650
      );

    return () => {
      window.clearTimeout(
        timeoutId
      );
    };
  }, [
    contest?.status,
    contest?.winner,
    wheelSlots,
  ]);

  /* ============================================================
     PARTICIPATION EXISTANTE
     ============================================================ */

  useEffect(() => {
    if (!tiktokUser) {
      setParticipation(null);
      setLoadingParticipation(
        false
      );

      return;
    }

    let cancelled = false;

    async function loadParticipation() {
      setLoadingParticipation(true);

      try {
        const response = await fetch(
          "/api/contests/participate",
          {
            method: "GET",
            cache: "no-store",
            credentials: "include",
          }
        );

        const data =
          (await response.json()) as ParticipationResponse;

        if (cancelled) {
          return;
        }

        if (!response.ok) {
          throw new Error(
            data.error ??
              "Impossible de vérifier la participation."
          );
        }

        setParticipation(
          data.participation
        );

        if (data.participation) {
          setSelectedProduct(
            data.participation
              .productSlug
          );

          setSelectedColor(
            data.participation.color
          );

          setSelectedSize(
            data.participation.size
          );

          setParticipationMessage(
            null
          );
        }
      } catch (error) {
        console.error(
          "[tirage] État participation :",
          error
        );

        if (!cancelled) {
          setParticipation(null);
        }
      } finally {
        if (!cancelled) {
          setLoadingParticipation(
            false
          );
        }
      }
    }

    void loadParticipation();

    return () => {
      cancelled = true;
    };
  }, [tiktokUser]);

  /* ============================================================
     HEARTBEAT DE PRÉSENCE

     Actif uniquement tant que la présence peut
     encore compter pour le tirage :
     registration / waiting.
     ============================================================ */

  useEffect(() => {
    if (
      !tiktokUser ||
      !participation ||
      (contest?.status !== "registration" &&
        contest?.status !== "waiting")
    ) {
      return;
    }

    let cancelled = false;

    async function sendPresenceHeartbeat() {
      if (
        cancelled ||
        document.visibilityState !==
          "visible"
      ) {
        return;
      }

      try {
        const response = await fetch(
          "/api/contests/presence",
          {
            method: "POST",
            cache: "no-store",
            credentials: "include",
          }
        );

        if (!response.ok) {
          const data =
            await response
              .json()
              .catch(() => null);

          console.error(
            "[tirage] Présence :",
            data?.error ??
              "Impossible d’enregistrer la présence."
          );
        }
      } catch (error) {
        console.error(
          "[tirage] Présence :",
          error
        );
      }
    }

    function handleVisibilityChange() {
      if (
        document.visibilityState ===
        "visible"
      ) {
        void sendPresenceHeartbeat();
      }
    }

    void sendPresenceHeartbeat();

    const intervalId =
      window.setInterval(
        () => {
          void sendPresenceHeartbeat();
        },
        10_000
      );

    document.addEventListener(
      "visibilitychange",
      handleVisibilityChange
    );

    return () => {
      cancelled = true;

      window.clearInterval(
        intervalId
      );

      document.removeEventListener(
        "visibilitychange",
        handleVisibilityChange
      );
    };
  }, [
    tiktokUser,
    participation,
    contest?.status,
  ]);

  /* ============================================================
     RETOUR OAUTH TIKTOK
     ============================================================ */

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

    if (
      status === "authenticated"
    ) {
      setTikTokError(null);
      return;
    }

    if (
      status === "cancelled"
    ) {
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

  /* ============================================================
     NOUVELLE PARTICIPATION
     ============================================================ */

  async function submitParticipation() {
    if (!tiktokUser) {
      setParticipationMessage(
        "Connecte-toi avec TikTok pour participer."
      );

      return;
    }

    if (participation) {
      return;
    }

    if (
      !contest ||
      contest.status !==
        "registration"
    ) {
      setParticipationMessage(
        "Les inscriptions ne sont pas encore ouvertes."
      );

      return;
    }

    setParticipationLoading(true);
    setParticipationMessage(null);

    try {
      const response = await fetch(
        "/api/contests/participate",
        {
          method: "POST",
          credentials: "include",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            productSlug:
              selectedProduct,

            color:
              selectedColor,

            size:
              selectedSize,
          }),
        }
      );

      const data =
        await response.json();

      if (!response.ok) {
        if (data.participation) {
          const existing =
            data.participation as Participation;

          setParticipation(
            existing
          );

          setSelectedProduct(
            existing.productSlug
          );

          setSelectedColor(
            existing.color
          );

          setSelectedSize(
            existing.size
          );

          setParticipationMessage(
            null
          );

          return;
        }

        setParticipationMessage(
          data.error ??
            "Impossible de valider la participation."
        );

        return;
      }

      if (data.participation) {
        const confirmed =
          data.participation as Participation;

        setParticipation(
          confirmed
        );

        setSelectedProduct(
          confirmed.productSlug
        );

        setSelectedColor(
          confirmed.color
        );

        setSelectedSize(
          confirmed.size
        );
      }

      setParticipationMessage(null);

      setContest(
        (current) => {
          if (!current) {
            return current;
          }

          return {
            ...current,

            participantCount:
              current.participantCount +
              1,
          };
        }
      );
    } catch (error) {
      console.error(
        "[tirage] Participation :",
        error
      );

      setParticipationMessage(
        "Une erreur est survenue. Réessaie."
      );
    } finally {
      setParticipationLoading(
        false
      );
    }
  }

  /* ============================================================
     TEXTES D'ÉTAT
     ============================================================ */

  function getStatusLabel() {
    if (loadingContest) {
      return "Chargement";
    }

    if (!contest) {
      return "Préparation";
    }

    switch (contest.status) {
      case "registration":
        return "Inscriptions ouvertes";

      case "waiting":
        return "Inscriptions terminées";

      case "drawing":
        if (
          contest.draw
            ?.winnerLocked
        ) {
          return "Tirage en direct";
        }

        return "Tirage en préparation";

      case "completed":
        return "Tirage terminé";

      default:
        return "Préparation";
    }
  }

  function getWheelStatus() {
    if (!contest) {
      return "Bientôt";
    }

    if (
      contest.status ===
      "registration"
    ) {
      return "Inscriptions ouvertes";
    }

    if (
      contest.status === "waiting"
    ) {
      return "En attente du direct";
    }

    if (
      contest.status ===
        "drawing" &&
      !contest.draw?.winnerLocked
    ) {
      return "Préparation du tirage";
    }

    if (
      contest.status ===
        "drawing" &&
      contest.draw?.winnerLocked
    ) {
      return "La roue tourne";
    }

    if (
      contest.status ===
        "completed" &&
      contest.winner
    ) {
      return winnerAnimationFinished
        ? "Gagnant révélé"
        : "Résultat en cours";
    }

    return "Tirage terminé";
  }

  const registrationOpen =
    contest?.status ===
    "registration";

  const wheelIsRunning =
    contest?.status ===
      "drawing" &&
    contest.draw?.winnerLocked;

  const displayWinner =
    contest?.status ===
      "completed" &&
    contest.winner &&
    winnerAnimationFinished;

  const countdownSeconds =
    revealCountdown !== null
      ? Math.max(
          0,
          revealCountdown / 1000
        )
      : null;

  const slotAngle =
    wheelSlots.length > 0
      ? 360 / wheelSlots.length
      : 0;

  /* ============================================================
     RENDU
     ============================================================ */

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
            Les concours AJVEK prennent
            vie ici. Inscris-toi, assiste
            au tirage en direct et
            découvre le gagnant.
          </p>
        </div>
      </section>

      {/* CONCOURS */}
      <section className="mx-auto max-w-7xl px-4 pb-20 sm:px-6 md:px-8 md:pb-28">
        <div className="overflow-hidden rounded-[28px] border border-black/10 bg-[#11110f] text-[#f4f1ea] shadow-2xl shadow-black/10">
          <div className="grid lg:grid-cols-[0.85fr_1.15fr]">
            {/* INFORMATIONS */}
            <div className="flex flex-col justify-between border-b border-white/10 p-7 sm:p-10 lg:min-h-[650px] lg:border-b-0 lg:border-r lg:p-12">
              <div>
                <div className="flex items-center gap-3">
                  <span
                    className={`h-2 w-2 rounded-full ${
                      wheelIsRunning
                        ? "animate-pulse bg-white"
                        : "bg-[#f4f1ea]"
                    }`}
                  />

                  <p className="text-[9px] uppercase tracking-[0.32em] text-white/45">
                    {contest?.status === "completed"
                      ? "Tirage terminé"
                      : wheelIsRunning
                        ? "Tirage en direct"
                        : contest?.status === "registration"
                          ? "Concours en cours"
                          : "Prochain tirage"}
                  </p>
                </div>

                <h2 className="mt-8 font-display text-4xl leading-[0.95] sm:text-5xl">
                  {contest?.title ? (
                    contest.title
                  ) : (
                    <>
                      100 abonnés
                      <br />
                      TikTok
                    </>
                  )}
                </h2>

                <p className="mt-6 max-w-sm text-sm leading-6 text-white/55">
                  {contest?.description ??
                    "Pour célébrer les 100 premiers abonnés AJVEK, un participant remportera le t-shirt de son choix."}
                </p>

                <div className="mt-10 border-t border-white/10">
                  <div className="flex items-center justify-between border-b border-white/10 py-5">
                    <span className="text-[9px] uppercase tracking-[0.25em] text-white/35">
                      Lot
                    </span>

                    <span className="text-right text-xs uppercase tracking-[0.16em]">
                      {contest?.prize ??
                        "1 t-shirt AJVEK"}
                    </span>
                  </div>

                  <div className="flex items-center justify-between border-b border-white/10 py-5">
                    <span className="text-[9px] uppercase tracking-[0.25em] text-white/35">
                      Participants
                    </span>

                    <span className="text-xs uppercase tracking-[0.16em]">
                      {loadingContest
                        ? "..."
                        : contest
                          ? contest.participantCount
                          : "Bientôt"}
                    </span>
                  </div>

                  <div className="flex items-center justify-between border-b border-white/10 py-5">
                    <span className="text-[9px] uppercase tracking-[0.25em] text-white/35">
                      Statut
                    </span>

                    <span className="text-right text-xs uppercase tracking-[0.16em]">
                      {getStatusLabel()}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-12">
                <p className="text-[9px] uppercase tracking-[0.3em] text-white/35">
                  Présent pendant le direct
                </p>

                <p className="mt-3 font-display text-3xl">
                  Chances ×
                  {contest?.presenceMultiplier ??
                    1.5}
                </p>

                <p className="mt-3 max-w-sm text-xs leading-5 text-white/45">
                  Être présent sur cette page
                  au moment du lancement du
                  tirage augmente tes chances.
                  Les participants absents
                  restent éligibles au tirage.
                </p>
              </div>
            </div>
                        {/* ROUE */}
            <div className="relative flex min-h-[520px] items-center justify-center overflow-hidden p-5 sm:p-10 lg:min-h-[650px]">
              <div className="absolute left-8 top-8 text-[10px] tracking-[0.3em] text-white/25">
                AJVEK / 001
              </div>

              <div className="absolute bottom-8 right-8 text-[10px] uppercase tracking-[0.3em] text-white/25">
                {getWheelStatus()}
              </div>

              {/* POINTEUR */}
              <div className="absolute left-1/2 top-[42px] z-30 -translate-x-1/2 sm:top-[54px]">
                <div className="h-0 w-0 border-l-[11px] border-r-[11px] border-t-[20px] border-l-transparent border-r-transparent border-t-[#f4f1ea]" />
              </div>

              <div className="relative w-full max-w-[500px]">
                {/* COMPTE À REBOURS */}
                {wheelIsRunning &&
                  countdownSeconds !==
                    null && (
                    <div className="absolute -top-12 left-1/2 z-30 -translate-x-1/2 whitespace-nowrap">
                      <p className="text-center text-[9px] uppercase tracking-[0.3em] text-white/35">
                        Résultat dans
                      </p>

                      <p className="mt-1 text-center font-display text-2xl">
                        {countdownSeconds.toFixed(
                          1
                        )}
                        s
                      </p>
                    </div>
                  )}

                <div className="relative aspect-square w-full">
                  {/* ROUE ROTATIVE */}
                  <div
                    className="absolute inset-0 rounded-full border border-white/25"
                    style={{
                      transform: `rotate(${wheelRotation}deg)`,

                      transition:
                        settlingWinner
                          ? "transform 1.6s cubic-bezier(0.12, 0.72, 0.08, 1)"
                          : "none",
                    }}
                  >
                    <div className="absolute inset-[7%] rounded-full border border-white/10" />

                    <div className="absolute inset-[16%] rounded-full border border-white/[0.06]" />

                    {/* SLOTS RÉELS */}
                    {wheelSlots.length > 0 ? (
                      <>
                        {wheelSlots.map(
                          (
                            slot,
                            index
                          ) => {
                            const angle =
                              index *
                                slotAngle +
                              slotAngle /
                                2;

                            return (
                              <div
                                key={
                                  slot.wheelKey
                                }
                                className="absolute left-1/2 top-1/2 h-1/2 w-0 origin-top"
                                style={{
                                  transform: `rotate(${angle}deg)`,
                                }}
                              >
                                <div className="absolute left-0 top-[7%] -translate-x-1/2">
                                  <div
                                    className="flex min-w-[72px] flex-col items-center rounded-2xl border border-white/15 bg-[#11110f]/80 px-2 py-2 shadow-lg shadow-black/20 backdrop-blur-[2px] sm:min-w-[88px] sm:px-3"
                                    style={{
                                      transform: `rotate(${-angle - wheelRotation}deg)`,
                                    }}
                                  >
                                    {slot.avatarUrl ? (
                                      <img
                                        src={slot.avatarUrl}
                                        alt=""
                                        className="h-9 w-9 rounded-full border border-white/30 object-cover sm:h-11 sm:w-11"
                                      />
                                    ) : (
                                      <div className="flex h-9 w-9 items-center justify-center rounded-full border border-white/25 bg-white/10 text-[10px] font-medium sm:h-11 sm:w-11 sm:text-xs">
                                        {slot.displayName
                                          .charAt(0)
                                          .toUpperCase()}
                                      </div>
                                    )}

                                    <span className="mt-1.5 max-w-[64px] truncate text-[8px] font-medium uppercase tracking-[0.06em] text-white/90 sm:max-w-[80px] sm:text-[9px]">
                                      {slot.displayName}
                                    </span>

                                    {slot.wasPresent && (
                                      <span className="mt-1 rounded-full border border-white/15 bg-white/10 px-2 py-0.5 text-[6px] font-medium uppercase tracking-[0.14em] text-white/80 sm:text-[7px]">
                                        Bonus ×1,5
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                            );
                          }
                        )}

                        {/* SÉPARATEURS */}
                        {wheelSlots.map(
                          (
                            slot,
                            index
                          ) => (
                            <span
                              key={`separator-${slot.wheelKey}`}
                              className="absolute left-1/2 top-1/2 h-1/2 w-px origin-top bg-white/20"
                              style={{
                                transform: `rotate(${
                                  index *
                                  slotAngle
                                }deg)`,
                              }}
                            />
                          )
                        )}
                      </>
                    ) : (
                      <>
                        {Array.from({
                          length: 12,
                        }).map(
                          (
                            _,
                            index
                          ) => (
                            <span
                              key={index}
                              className="absolute left-1/2 top-1/2 h-1/2 w-px origin-top bg-white/20"
                              style={{
                                transform: `rotate(${
                                  index * 30
                                }deg)`,
                              }}
                            />
                          )
                        )}
                      </>
                    )}
                  </div>

                  {/* CENTRE FIXE */}
                  <div className="absolute left-1/2 top-1/2 z-20 flex h-28 w-28 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-white/25 bg-[#11110f] shadow-2xl shadow-black/40 sm:h-40 sm:w-40">
                    {displayWinner ? (
                      <div className="px-3 text-center">
                        {contest.winner
                          ?.avatarUrl ? (
                          <img
                            src={
                              contest
                                .winner
                                .avatarUrl
                            }
                            alt=""
                            className="mx-auto h-10 w-10 rounded-full border border-white/20 object-cover sm:h-12 sm:w-12"
                          />
                        ) : null}

                        <p className="mt-2 max-w-[110px] truncate text-[9px] uppercase tracking-[0.12em] text-white/70">
                          {
                            contest
                              .winner
                              ?.displayName
                          }
                        </p>
                      </div>
                    ) : (
                      <span className="font-display text-xl tracking-[0.18em] sm:text-3xl">
                        AJVEK
                      </span>
                    )}
                  </div>

                  {/* ÉTAT VIDE */}
                  {wheelSlots.length ===
                    0 && (
                    <div className="pointer-events-none absolute inset-0">
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
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* INSCRIPTION */}
        <div className="mx-auto mt-6 max-w-7xl rounded-[24px] border border-black/10 bg-[#ebe8e1] p-7 sm:p-9">
          <div className="grid gap-8 lg:grid-cols-[0.85fr_1.15fr] lg:gap-12">
            {/* IDENTITÉ */}
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
                      src={
                        tiktokUser.avatarUrl
                      }
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
                      {
                        tiktokUser.displayName
                      }
                    </p>

                    <p className="mt-1 text-[9px] uppercase tracking-[0.22em] text-black/40">
                      Connecté avec TikTok
                    </p>
                  </div>
                </div>
              ) : (
                <p className="mt-3 max-w-xl text-sm leading-6 text-black/55">
                  La connexion TikTok
                  permettra de confirmer ton
                  identité et de choisir ton
                  modèle, ta couleur et ta
                  taille.
                </p>
              )}

              {tiktokError && (
                <p className="mt-4 text-xs text-black/60">
                  {tiktokError}
                </p>
              )}

              {!tiktokUser && (
                <button
                  type="button"
                  onClick={
                    connectWithTikTok
                  }
                  disabled={
                    loadingTikTok
                  }
                  className="mt-7 rounded-full bg-[#151412] px-7 py-4 text-[10px] uppercase tracking-[0.24em] text-white transition-opacity hover:opacity-80 disabled:cursor-wait disabled:opacity-45"
                >
                  {loadingTikTok
                    ? "Vérification..."
                    : "Continuer avec TikTok"}
                </button>
              )}

              {tiktokUser && (
                <div className="mt-7 inline-flex rounded-full border border-black/15 px-6 py-3 text-[9px] uppercase tracking-[0.22em] text-black/55">
                  TikTok connecté
                </div>
              )}
            </div>

            {/* CHOIX */}
            {tiktokUser && (
              <div className="border-t border-black/10 pt-8 lg:border-l lg:border-t-0 lg:pl-12 lg:pt-0">
                <p className="text-[9px] uppercase tracking-[0.3em] text-black/40">
                  Ton choix
                </p>

                {loadingParticipation ? (
                  <div className="mt-5 rounded-[20px] border border-black/10 bg-black/[0.03] p-6">
                    <p className="text-xs uppercase tracking-[0.18em] text-black/45">
                      Vérification de ta
                      participation...
                    </p>
                  </div>
                ) : participation ? (
                  <div className="mt-5 rounded-[20px] border border-black/10 bg-black/[0.04] p-6 sm:p-7">
                    <div className="flex items-center gap-3">
                      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#151412] text-xs text-white">
                        ✓
                      </span>

                      <p className="text-xs uppercase tracking-[0.2em] text-black/70">
                        Participation confirmée
                      </p>
                    </div>

                    <div className="mt-6 grid gap-4 sm:grid-cols-3">
                      <div>
                        <p className="text-[9px] uppercase tracking-[0.22em] text-black/35">
                          Modèle
                        </p>

                        <p className="mt-2 text-sm">
                          {participation.productSlug ===
                          "sakura"
                            ? "Cerisier"
                            : "Roses"}
                        </p>
                      </div>

                      <div>
                        <p className="text-[9px] uppercase tracking-[0.22em] text-black/35">
                          Couleur
                        </p>

                        <p className="mt-2 text-sm">
                          {participation.color}
                        </p>
                      </div>

                      <div>
                        <p className="text-[9px] uppercase tracking-[0.22em] text-black/35">
                          Taille
                        </p>

                        <p className="mt-2 text-sm">
                          {participation.size}
                        </p>
                      </div>
                    </div>

                    <p className="mt-6 text-xs leading-5 text-black/45">
                      Ton inscription est
                      enregistrée pour ce
                      tirage. Tu n’as rien
                      d’autre à valider.
                    </p>
                  </div>
                ) : (
                  <>
                                      {/* MODÈLE */}
                    <div className="mt-5">
                      <p className="text-xs uppercase tracking-[0.18em] text-black/55">
                        Modèle
                      </p>

                      <div className="mt-3 flex flex-wrap gap-2">
                        {[
                          {
                            value: "roses",
                            label: "Roses",
                          },
                          {
                            value: "sakura",
                            label: "Cerisier",
                          },
                        ].map(
                          (product) => (
                            <button
                              key={
                                product.value
                              }
                              type="button"
                              onClick={() =>
                                setSelectedProduct(
                                  product.value as
                                    | "roses"
                                    | "sakura"
                                )
                              }
                              className={`rounded-full border px-5 py-3 text-[10px] uppercase tracking-[0.18em] transition ${
                                selectedProduct ===
                                product.value
                                  ? "border-black bg-black text-white"
                                  : "border-black/15 text-black/60 hover:border-black/40"
                              }`}
                            >
                              {
                                product.label
                              }
                            </button>
                          )
                        )}
                      </div>
                    </div>

                    {/* COULEUR */}
                    <div className="mt-6">
                      <p className="text-xs uppercase tracking-[0.18em] text-black/55">
                        Couleur
                      </p>

                      <div className="mt-3 flex flex-wrap gap-2">
                        {(
                          [
                            "Blanc",
                            "Noir",
                          ] as const
                        ).map(
                          (color) => (
                            <button
                              key={color}
                              type="button"
                              onClick={() =>
                                setSelectedColor(
                                  color
                                )
                              }
                              className={`rounded-full border px-5 py-3 text-[10px] uppercase tracking-[0.18em] transition ${
                                selectedColor ===
                                color
                                  ? "border-black bg-black text-white"
                                  : "border-black/15 text-black/60 hover:border-black/40"
                              }`}
                            >
                              {color}
                            </button>
                          )
                        )}
                      </div>
                    </div>

                    {/* TAILLE */}
                    <div className="mt-6">
                      <p className="text-xs uppercase tracking-[0.18em] text-black/55">
                        Taille
                      </p>

                      <div className="mt-3 flex flex-wrap gap-2">
                        {(
                          [
                            "XS",
                            "S",
                            "M",
                            "L",
                          ] as const
                        ).map(
                          (size) => (
                            <button
                              key={size}
                              type="button"
                              onClick={() =>
                                setSelectedSize(
                                  size
                                )
                              }
                              className={`flex h-11 min-w-11 items-center justify-center rounded-full border px-4 text-[10px] uppercase tracking-[0.15em] transition ${
                                selectedSize ===
                                size
                                  ? "border-black bg-black text-white"
                                  : "border-black/15 text-black/60 hover:border-black/40"
                              }`}
                            >
                              {size}
                            </button>
                          )
                        )}
                      </div>
                    </div>

                    {/* VALIDATION */}
                    <button
                      type="button"
                      onClick={
                        submitParticipation
                      }
                      disabled={
                        participationLoading ||
                        !registrationOpen
                      }
                      className="mt-7 w-full rounded-full bg-[#151412] px-7 py-4 text-[10px] uppercase tracking-[0.24em] text-white transition-opacity hover:opacity-80 disabled:cursor-not-allowed disabled:opacity-35"
                    >
                      {participationLoading
                        ? "Validation..."
                        : registrationOpen
                          ? "Valider ma participation"
                          : "Inscriptions bientôt ouvertes"}
                    </button>

                    {!registrationOpen &&
                      !loadingContest && (
                        <p className="mt-4 text-xs leading-5 text-black/45">
                          {contest?.status ===
                          "waiting"
                            ? "Les inscriptions sont terminées pour ce tirage."
                            : contest?.status ===
                                "drawing"
                              ? "Le tirage est en cours. Les inscriptions sont fermées."
                              : contest?.status ===
                                  "completed"
                                ? "Ce tirage est terminé."
                                : "Le concours est en préparation. Tu pourras valider ton choix dès l’ouverture des inscriptions."}
                        </p>
                      )}

                    {participationMessage && (
                      <p className="mt-4 text-xs leading-5 text-black/55">
                        {
                          participationMessage
                        }
                      </p>
                    )}
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        {/* GAGNANT */}
        {displayWinner &&
          contest.winner && (
            <div className="mt-6 overflow-hidden rounded-[24px] bg-[#11110f] px-7 py-10 text-center text-[#f4f1ea] sm:px-10 sm:py-14">
              <p className="text-[9px] uppercase tracking-[0.35em] text-white/40">
                Gagnant
              </p>

              {contest.winner
                .avatarUrl && (
                <img
                  src={
                    contest.winner
                      .avatarUrl
                  }
                  alt=""
                  className="mx-auto mt-6 h-16 w-16 rounded-full border border-white/15 object-cover sm:h-20 sm:w-20"
                />
              )}

              <p className="mt-5 font-display text-4xl sm:text-5xl">
                {
                  contest.winner
                    .displayName
                }
              </p>

              <p className="mt-4 text-xs uppercase tracking-[0.2em] text-white/50">
                {getWinnerCopy(
                  contest.winner
                )}
              </p>

              {contest.winner
                .wasPresent && (
                <p className="mt-5 text-[9px] uppercase tracking-[0.28em] text-white/35">
                  Présent lors du
                  lancement · Bonus ×1,5
                </p>
              )}
            </div>
          )}
      </section>
    </main>
  );
}