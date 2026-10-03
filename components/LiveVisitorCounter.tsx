"use client";

import { useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/components/AuthContext";

/* =========================================================
   CONFIG
========================================================= */

const CHANNEL_NAME = "ajvek-live-visitors";
const VISITOR_STORAGE_KEY = "ajvek_visitor_id";

/* =========================================================
   VISITOR ID
   Un même navigateur conserve le même identifiant.
   Cela permet de ne pas compter plusieurs onglets comme
   plusieurs visiteurs différents.
========================================================= */

function getVisitorId() {
  if (typeof window === "undefined") {
    return "";
  }

  try {
    let visitorId = localStorage.getItem(VISITOR_STORAGE_KEY);

    if (!visitorId) {
      visitorId = crypto.randomUUID();
      localStorage.setItem(VISITOR_STORAGE_KEY, visitorId);
    }

    return visitorId;
  } catch {
    return crypto.randomUUID();
  }
}

/* =========================================================
   COMPONENT
========================================================= */

export default function LiveVisitorCounter() {
  const { session, loading } = useAuth();

  const [isAdmin, setIsAdmin] = useState(false);
  const [adminChecked, setAdminChecked] = useState(false);

  const [visitorCount, setVisitorCount] = useState(0);
  const [realtimeConnected, setRealtimeConnected] = useState(false);

  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  /* =========================================================
     VÉRIFICATION ADMIN
  ========================================================= */

  useEffect(() => {
    let cancelled = false;

    async function checkAdmin() {
      setAdminChecked(false);

      /*
       * Pas de session = visiteur public.
       * Il n'est donc pas administrateur.
       */
      if (!session?.access_token) {
        if (!cancelled) {
          setIsAdmin(false);
          setAdminChecked(true);
        }

        return;
      }

      try {
        const response = await fetch("/api/admin/me", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
          cache: "no-store",
        });

        if (!response.ok) {
          if (!cancelled) {
            setIsAdmin(false);
          }

          return;
        }

        const data = await response.json();

        if (!cancelled) {
          setIsAdmin(data.isAdmin === true);
        }
      } catch (error) {
        console.error("[live-visitors-admin]", error);

        if (!cancelled) {
          setIsAdmin(false);
        }
      } finally {
        if (!cancelled) {
          setAdminChecked(true);
        }
      }
    }

    if (!loading) {
      checkAdmin();
    }

    return () => {
      cancelled = true;
    };
  }, [loading, session?.access_token]);

  /* =========================================================
     SUPABASE REALTIME PRESENCE
  ========================================================= */

  useEffect(() => {
    /*
     * On attend de savoir avec certitude si la personne
     * est administrateur avant de rejoindre Presence.
     *
     * Cela évite qu'un admin soit compté pendant quelques
     * secondes au chargement de la page.
     */
    if (loading || !adminChecked) {
      return;
    }

    const visitorId = getVisitorId();

    if (!visitorId) {
      return;
    }

    const channel = supabase.channel(CHANNEL_NAME, {
      config: {
        presence: {
          key: visitorId,
        },
      },
    });

    channelRef.current = channel;

    /* =======================================================
       CALCUL DU NOMBRE DE VISITEURS UNIQUES
    ======================================================= */

    function updateVisitorCount() {
      const state = channel.presenceState();

      /*
       * presenceState() est indexé par la clé Presence.
       *
       * Comme tous les onglets d'un même navigateur utilisent
       * le même visitorId, Object.keys(state) correspond au
       * nombre de navigateurs uniques actuellement présents.
       *
       * Les admins ne font jamais channel.track(), donc ils
       * n'apparaissent pas dans ce nombre.
       */
      const uniqueVisitors = Object.keys(state).length;

      setVisitorCount(uniqueVisitors);
    }

    channel
      .on("presence", { event: "sync" }, () => {
        updateVisitorCount();
      })
      .on("presence", { event: "join" }, () => {
        updateVisitorCount();
      })
      .on("presence", { event: "leave" }, () => {
        updateVisitorCount();
      })
      .subscribe(async (status) => {
        if (status === "SUBSCRIBED") {
          setRealtimeConnected(true);

          /*
           * IMPORTANT :
           * un administrateur rejoint le channel pour pouvoir
           * observer le compteur, mais il ne publie aucune
           * présence.
           */
          if (!isAdmin) {
            await channel.track({
              visitor_id: visitorId,
              online_at: new Date().toISOString(),
            });
          }

          updateVisitorCount();
        }

        if (
          status === "CHANNEL_ERROR" ||
          status === "TIMED_OUT" ||
          status === "CLOSED"
        ) {
          setRealtimeConnected(false);
        }
      });

    return () => {
      channelRef.current = null;
      setRealtimeConnected(false);

      supabase.removeChannel(channel);
    };
  }, [loading, adminChecked, isAdmin]);

  /* =========================================================
     AFFICHAGE
  ========================================================= */

  /*
   * Le composant fonctionne pour tous les visiteurs,
   * mais l'interface du compteur n'est visible que par
   * les administrateurs.
   */
  if (!isAdmin) {
    return null;
  }

  return (
    <div className="fixed bottom-5 right-5 z-[100]">
      <div className="flex items-center gap-3 border border-white/10 bg-black/90 px-4 py-3 shadow-2xl backdrop-blur-md">
        <span className="relative flex h-2.5 w-2.5">
          {realtimeConnected && (
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-50" />
          )}

          <span
            className={`relative inline-flex h-2.5 w-2.5 rounded-full ${
              realtimeConnected
                ? "bg-emerald-400"
                : "bg-stone-500"
            }`}
          />
        </span>

        <div>
          <p className="text-[8px] uppercase tracking-[0.3em] text-white/40">
            En direct
          </p>

          <p className="mt-1 text-xs tracking-[0.08em] text-white">
            {visitorCount}{" "}
            {visitorCount > 1
              ? "personnes sur le site"
              : "personne sur le site"}
          </p>
        </div>
      </div>
    </div>
  );
}