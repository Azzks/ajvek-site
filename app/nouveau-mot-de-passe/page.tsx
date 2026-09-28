"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

export default function NouveauMotDePassePage() {
  const router = useRouter();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [checkingSession, setCheckingSession] = useState(true);
  const [canResetPassword, setCanResetPassword] = useState(false);

  const [submitting, setSubmitting] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  /* =========================================================
     VÉRIFICATION DU FLUX DE RÉCUPÉRATION
  ========================================================= */

  useEffect(() => {
    let mounted = true;

    /*
     * Un changement de mot de passe depuis cette page
     * doit uniquement être autorisé après l'ouverture
     * d'un véritable lien de récupération Supabase.
     *
     * Une session utilisateur normale ne suffit pas.
     *
     * Supabase traite automatiquement les informations
     * d'authentification présentes dans l'URL et émet
     * PASSWORD_RECOVERY lorsque le lien est valide.
     */

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (!mounted) return;

      if (event === "PASSWORD_RECOVERY" && session) {
        setCanResetPassword(true);
        setCheckingSession(false);
        return;
      }

      /*
       * INITIAL_SESSION indique que l'initialisation du client
       * Supabase est terminée.
       *
       * Si l'URL ne contient aucun élément de récupération,
       * il ne s'agit pas d'un lien de réinitialisation.
       */

      if (event === "INITIAL_SESSION") {
        const url = new URL(window.location.href);

        const hashParams = new URLSearchParams(
          url.hash.startsWith("#")
            ? url.hash.slice(1)
            : url.hash
        );

        const hasRecoveryData =
          hashParams.get("type") === "recovery" ||
          url.searchParams.has("code");

        const hasAuthError =
          url.searchParams.has("error") ||
          url.searchParams.has("error_code") ||
          hashParams.has("error") ||
          hashParams.has("error_code");

        if (hasAuthError || !hasRecoveryData) {
          setCheckingSession(false);
        }
      }
    });

    /*
     * Supabase peut renvoyer explicitement une erreur
     * dans l'URL lorsque le lien est expiré ou invalide.
     * Dans ce cas, inutile d'attendre un événement
     * PASSWORD_RECOVERY qui n'arrivera pas.
     */

    const url = new URL(window.location.href);

    const hashParams = new URLSearchParams(
      url.hash.startsWith("#")
        ? url.hash.slice(1)
        : url.hash
    );

    const hasAuthError =
      url.searchParams.has("error") ||
      url.searchParams.has("error_code") ||
      hashParams.has("error") ||
      hashParams.has("error_code");

    const hasRecoveryData =
      hashParams.get("type") === "recovery" ||
      url.searchParams.has("code");

    if (hasAuthError || !hasRecoveryData) {
      setCheckingSession(false);
    }

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  /* =========================================================
     MODIFICATION DU MOT DE PASSE
  ========================================================= */

  async function handleSubmit(
    e: React.FormEvent<HTMLFormElement>
  ) {
    e.preventDefault();

    if (submitting || success) return;

    setError(null);

    if (!canResetPassword) {
      setError(
        "Le lien de réinitialisation est invalide ou a expiré."
      );

      return;
    }

    if (password.length < 8) {
      setError(
        "Ton mot de passe doit contenir au moins 8 caractères."
      );

      return;
    }

    if (password !== confirmPassword) {
      setError(
        "Les deux mots de passe ne correspondent pas."
      );

      return;
    }

    setSubmitting(true);

    try {
      const { error: updateError } =
        await supabase.auth.updateUser({
          password,
        });

      if (updateError) {
        console.error(
          "[nouveau-mot-de-passe] Erreur Supabase :",
          updateError
        );

        setError(
          "Impossible de modifier ton mot de passe. Le lien a peut-être expiré."
        );

        return;
      }

      setSuccess(true);
      setPassword("");
      setConfirmPassword("");

      /*
       * On ferme la session temporaire créée
       * par le lien de récupération.
       *
       * L'utilisateur se reconnectera ensuite
       * normalement avec son nouveau mot de passe.
       */

      await supabase.auth.signOut();

      /*
       * Ce délai ne sert PAS à valider le lien.
       * Il laisse simplement le temps de lire
       * le message de confirmation.
       */

      window.setTimeout(() => {
        router.replace("/connexion");
        router.refresh();
      }, 2500);
    } catch (err) {
      console.error(
        "[nouveau-mot-de-passe] Erreur générale :",
        err
      );

      setError(
        "Une erreur est survenue. Réessaie dans quelques instants."
      );
    } finally {
      setSubmitting(false);
    }
  }

  /* =========================================================
     ICÔNE ŒIL
  ========================================================= */

  function EyeIcon({ open }: { open: boolean }) {
    if (open) {
      return (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-[18px] w-[18px]"
          aria-hidden="true"
        >
          <path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12Z" />
          <circle cx="12" cy="12" r="2.5" />
        </svg>
      );
    }

    return (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-[18px] w-[18px]"
        aria-hidden="true"
      >
        <path d="M3 3l18 18" />
        <path d="M10.6 6.2A10.8 10.8 0 0 1 12 6c6.5 0 10 6 10 6a18 18 0 0 1-2.1 2.8" />
        <path d="M6.6 6.6C3.6 8.4 2 12 2 12s3.5 6 10 6a10.8 10.8 0 0 0 5.4-1.4" />
        <path d="M9.9 9.9a3 3 0 0 0 4.2 4.2" />
      </svg>
    );
  }

  /* =========================================================
     CHARGEMENT
  ========================================================= */

  if (checkingSession) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background px-5 text-foreground">
        <div className="text-center">
          <p className="text-[9px] uppercase tracking-[0.45em] text-stone">
            AJVEK · Compte
          </p>

          <p className="mt-5 text-sm text-stone">
            Vérification du lien...
          </p>
        </div>
      </main>
    );
  }

  /* =========================================================
     SUCCÈS
  ========================================================= */

  if (success) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background px-5 text-foreground">
        <div className="w-full max-w-md text-center">
          <p className="text-[9px] uppercase tracking-[0.45em] text-stone">
            AJVEK · Compte
          </p>

          <h1 className="mt-5 font-display text-4xl leading-none md:text-5xl">
            Mot de passe modifié.
          </h1>

          <p className="mx-auto mt-6 max-w-sm text-sm leading-6 text-stone">
            Ton nouveau mot de passe a bien été enregistré.
            Tu vas être redirigé vers la connexion.
          </p>

          <Link
            href="/connexion"
            className="mt-8 inline-flex rounded-full bg-foreground px-7 py-4 text-[10px] uppercase tracking-[0.3em] text-background"
          >
            Se connecter
          </Link>
        </div>
      </main>
    );
  }

  /* =========================================================
     LIEN INVALIDE
  ========================================================= */

  if (!canResetPassword) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background px-5 text-foreground">
        <div className="w-full max-w-md text-center">
          <p className="text-[9px] uppercase tracking-[0.45em] text-stone">
            AJVEK · Compte
          </p>

          <h1 className="mt-5 font-display text-4xl leading-none md:text-5xl">
            Lien expiré.
          </h1>

          <p className="mx-auto mt-6 max-w-sm text-sm leading-6 text-stone">
            Ce lien de réinitialisation n&apos;est plus valide.
            Demande simplement un nouveau lien depuis la page
            de connexion.
          </p>

          <Link
            href="/connexion"
            className="group mt-8 flex w-full items-center justify-between rounded-full bg-foreground px-6 py-4 text-[10px] uppercase tracking-[0.3em] text-background"
          >
            <span>Retour à la connexion</span>

            <span className="text-base transition-transform duration-300 group-hover:translate-x-1">
              →
            </span>
          </Link>
        </div>
      </main>
    );
  }

  /* =========================================================
     FORMULAIRE
  ========================================================= */

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-5 py-16 text-foreground md:px-8">
      <div className="w-full max-w-md">
        <div className="text-center">
          <p className="text-[9px] uppercase tracking-[0.45em] text-stone">
            AJVEK · Compte
          </p>

          <h1 className="mt-5 font-display text-4xl leading-none md:text-5xl">
            Nouveau mot
            <br />
            de passe.
          </h1>

          <p className="mx-auto mt-5 max-w-sm text-sm leading-6 text-stone">
            Choisis ton nouveau mot de passe pour retrouver
            l&apos;accès à ton compte AJVEK.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="mt-10 flex flex-col gap-5"
        >
          {/* NOUVEAU MOT DE PASSE */}

          <div>
            <label
              htmlFor="password"
              className="mb-2 block text-[9px] uppercase tracking-[0.3em] text-stone"
            >
              Nouveau mot de passe
            </label>

            <div className="relative">
              <input
                id="password"
                required
                type={showPassword ? "text" : "password"}
                minLength={8}
                autoComplete="new-password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);

                  if (error) {
                    setError(null);
                  }
                }}
                placeholder="8 caractères minimum"
                disabled={submitting}
                className="w-full rounded-xl border border-surface bg-transparent px-4 py-4 pr-12 text-sm text-foreground outline-none transition placeholder:text-stone/40 focus:border-stone disabled:opacity-50"
              />

              <button
                type="button"
                onClick={() =>
                  setShowPassword((current) => !current)
                }
                disabled={submitting}
                aria-label={
                  showPassword
                    ? "Masquer le mot de passe"
                    : "Afficher le mot de passe"
                }
                aria-pressed={showPassword}
                className="absolute right-4 top-1/2 flex -translate-y-1/2 items-center justify-center text-stone transition hover:text-foreground disabled:opacity-50"
              >
                <EyeIcon open={showPassword} />
              </button>
            </div>
          </div>

          {/* CONFIRMATION */}

          <div>
            <label
              htmlFor="confirm-password"
              className="mb-2 block text-[9px] uppercase tracking-[0.3em] text-stone"
            >
              Confirmer le mot de passe
            </label>

            <div className="relative">
              <input
                id="confirm-password"
                required
                type={
                  showConfirmPassword
                    ? "text"
                    : "password"
                }
                minLength={8}
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);

                  if (error) {
                    setError(null);
                  }
                }}
                placeholder="Confirme ton mot de passe"
                disabled={submitting}
                className="w-full rounded-xl border border-surface bg-transparent px-4 py-4 pr-12 text-sm text-foreground outline-none transition placeholder:text-stone/40 focus:border-stone disabled:opacity-50"
              />

              <button
                type="button"
                onClick={() =>
                  setShowConfirmPassword(
                    (current) => !current
                  )
                }
                disabled={submitting}
                aria-label={
                  showConfirmPassword
                    ? "Masquer la confirmation du mot de passe"
                    : "Afficher la confirmation du mot de passe"
                }
                aria-pressed={showConfirmPassword}
                className="absolute right-4 top-1/2 flex -translate-y-1/2 items-center justify-center text-stone transition hover:text-foreground disabled:opacity-50"
              >
                <EyeIcon open={showConfirmPassword} />
              </button>
            </div>
          </div>

          <p className="text-[10px] leading-5 text-stone/60">
            Utilise au minimum 8 caractères et évite de
            réutiliser un mot de passe déjà utilisé sur un
            autre service.
          </p>

          {error && (
            <div
              role="alert"
              className="rounded-xl border border-surface px-4 py-3"
            >
              <p className="text-xs leading-5 text-stone">
                {error}
              </p>
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="group mt-2 flex w-full items-center justify-between rounded-full bg-foreground px-6 py-4 text-[10px] uppercase tracking-[0.3em] text-background transition duration-300 hover:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50"
          >
            <span>
              {submitting
                ? "Modification..."
                : "Enregistrer le mot de passe"}
            </span>

            {!submitting && (
              <span className="text-base transition-transform duration-300 group-hover:translate-x-1">
                →
              </span>
            )}
          </button>
        </form>

        <div className="mt-10 border-t border-surface pt-8 text-center">
          <Link
            href="/connexion"
            className="text-[9px] uppercase tracking-[0.3em] text-stone/60 transition hover:text-foreground"
          >
            ← Retour à la connexion
          </Link>
        </div>
      </div>
    </main>
  );
}