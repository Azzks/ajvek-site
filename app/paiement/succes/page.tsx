"use client";

import Link from "next/link";
import { Suspense, useCallback, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

import ClearPreorderCart from "@/components/ClearPreorderCart";
import { useAuth } from "@/components/AuthContext";

type VerificationStatus =
  | "loading"
  | "processing"
  | "paid"
  | "unpaid"
  | "error";

function PaiementSuccesContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");

  const { session, loading: authLoading } = useAuth();

  const [status, setStatus] =
    useState<VerificationStatus>("loading");

  const [message, setMessage] = useState("");

  const verifyPayment = useCallback(async () => {
    if (!sessionId) {
      setStatus("error");
      setMessage(
        "Impossible de retrouver la session de paiement."
      );
      return;
    }

    if (!session?.access_token) {
      setStatus("error");
      setMessage(
        "Ta session utilisateur n'est plus disponible. Connecte-toi pour retrouver ta commande."
      );
      return;
    }

    try {
      const response = await fetch(
        "/api/verify-checkout-session",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({
            session_id: sessionId,
          }),
          cache: "no-store",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setStatus("error");
        setMessage(
          data?.error ||
            "Impossible de vérifier la commande."
        );
        return;
      }

      if (data.status === "paid") {
        setStatus("paid");
        setMessage("");
        return;
      }

      if (data.status === "processing") {
        setStatus("processing");
        setMessage("");
        return;
      }

      if (data.status === "unpaid") {
        setStatus("unpaid");
        setMessage("");
        return;
      }

      setStatus("error");
      setMessage(
        "Impossible de déterminer l'état de la commande."
      );
    } catch (error) {
      console.error(
        "[PaiementSuccesPage] Erreur de vérification :",
        error
      );

      setStatus("error");
      setMessage(
        "Impossible de vérifier la commande pour le moment."
      );
    }
  }, [sessionId, session?.access_token]);

  useEffect(() => {
    if (authLoading) {
      return;
    }

    void verifyPayment();
  }, [authLoading, verifyPayment]);

  useEffect(() => {
    if (status !== "processing") {
      return;
    }

    const timeout = window.setTimeout(() => {
      void verifyPayment();
    }, 1500);

    return () => {
      window.clearTimeout(timeout);
    };
  }, [status, verifyPayment]);

  if (authLoading || status === "loading") {
    return <VerificationLoading />;
  }

  if (status === "processing") {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-background px-6 text-center text-foreground">
        <p className="text-xs uppercase tracking-[0.3em] text-stone">
          Paiement reçu
        </p>

        <h1 className="mt-4 font-display text-3xl sm:text-5xl">
          Confirmation en cours
        </h1>

        <p className="mt-6 max-w-md text-stone">
          Ton paiement est en cours de confirmation.
        </p>

        <p className="mt-3 max-w-md text-sm text-stone">
          Cette page se met à jour automatiquement dès que ta
          commande est finalisée.
        </p>
      </main>
    );
  }

  if (status === "unpaid") {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-background px-6 text-center text-foreground">
        <p className="text-xs uppercase tracking-[0.3em] text-stone">
          Paiement non confirmé
        </p>

        <h1 className="mt-4 font-display text-3xl sm:text-5xl">
          Commande non confirmée
        </h1>

        <p className="mt-6 max-w-md text-sm text-stone">
          Le paiement n&apos;est pas confirmé. Aucun message de
          confirmation de commande n&apos;est affiché tant que le
          paiement n&apos;est pas validé.
        </p>

        <Link
          href="/panier"
          className="mt-8 rounded-full border border-foreground px-6 py-3 text-xs uppercase tracking-widest text-foreground transition hover:bg-foreground hover:text-background"
        >
          Retour au panier
        </Link>
      </main>
    );
  }

  if (status === "error") {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-background px-6 text-center text-foreground">
        <p className="text-xs uppercase tracking-[0.3em] text-stone">
          Vérification impossible
        </p>

        <h1 className="mt-4 font-display text-3xl sm:text-5xl">
          Nous ne pouvons pas confirmer la commande
        </h1>

        <p className="mt-6 max-w-md text-sm text-stone">
          {message}
        </p>

        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link
            href="/mes-commandes"
            className="rounded-full bg-foreground px-6 py-3 text-xs uppercase tracking-widest text-background transition hover:opacity-85"
          >
            Mes commandes
          </Link>

          <Link
            href="/"
            className="rounded-full border border-stone/40 px-6 py-3 text-xs uppercase tracking-widest text-stone transition hover:border-foreground hover:text-foreground"
          >
            Retour à l&apos;accueil
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background px-6 text-center text-foreground">
      <ClearPreorderCart enabled={true} />

      <p className="mb-4 text-xs uppercase tracking-[0.3em] text-stone">
        Paiement confirmé
      </p>

      <h1 className="font-display text-3xl sm:text-5xl">
        Commande confirmée
      </h1>

      <p className="mt-6 max-w-md text-stone">
        Ton paiement a bien été reçu. Ta commande AJVEK est
        maintenant confirmée.
      </p>

      <p className="mt-3 max-w-md text-sm text-stone">
        Ta pièce est réservée. Tu peux suivre l&apos;avancement de
        ta commande directement depuis ton espace AJVEK.
      </p>

      <p className="mt-3 max-w-md text-sm text-stone">
        Tu vas également recevoir un email de confirmation avec le
        récapitulatif de ta commande.
      </p>

      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link
          href="/mes-commandes"
          className="rounded-full bg-foreground px-6 py-3 text-xs uppercase tracking-widest text-background transition hover:opacity-85"
        >
          Suivre ma commande
        </Link>

        <Link
          href="/catalogue"
          className="rounded-full border border-foreground px-6 py-3 text-xs uppercase tracking-widest text-foreground transition hover:bg-foreground hover:text-background"
        >
          Voir la collection
        </Link>

        <Link
          href="/"
          className="rounded-full border border-stone/40 px-6 py-3 text-xs uppercase tracking-widest text-stone transition hover:border-foreground hover:text-foreground"
        >
          Retour à l&apos;accueil
        </Link>
      </div>
    </main>
  );
}

function VerificationLoading() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background px-6 text-center text-foreground">
      <p className="text-xs uppercase tracking-[0.3em] text-stone">
        Vérification du paiement
      </p>

      <h1 className="mt-4 font-display text-3xl sm:text-5xl">
        Un instant
      </h1>

      <p className="mt-6 max-w-md text-sm text-stone">
        Nous vérifions ta commande.
      </p>
    </main>
  );
}

export default function PaiementSuccesPage() {
  return (
    <Suspense fallback={<VerificationLoading />}>
      <PaiementSuccesContent />
    </Suspense>
  );
}