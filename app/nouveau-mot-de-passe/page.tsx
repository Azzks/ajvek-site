"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

export default function NouveauMotDePassePage() {
  const router = useRouter();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] =
    useState("");

  const [checkingSession, setCheckingSession] =
    useState(true);

  const [canResetPassword, setCanResetPassword] =
    useState(false);

  const [submitting, setSubmitting] =
    useState(false);

  const [error, setError] =
    useState<string | null>(null);

  const [success, setSuccess] =
    useState(false);

  /* =========================================================
     VÉRIFICATION DU LIEN DE RÉINITIALISATION
  ========================================================= */

  useEffect(() => {
    let mounted = true;

    async function checkRecoverySession() {
      try {
        /*
         * Selon la configuration Supabase, le client peut
         * récupérer automatiquement la session créée par
         * le lien de récupération.
         */
        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession();

        if (!mounted) return;

        if (sessionError) {
          console.error(
            "[nouveau-mot-de-passe] Erreur session :",
            sessionError
          );
        }

        if (session) {
          setCanResetPassword(true);
        }
      } catch (err) {
        console.error(
          "[nouveau-mot-de-passe] Erreur vérification :",
          err
        );
      } finally {
        if (mounted) {
          setCheckingSession(false);
        }
      }
    }

    /*
     * Supabase déclenche PASSWORD_RECOVERY lorsque
     * l'utilisateur arrive depuis le lien envoyé
     * par email.
     */
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (!mounted) return;

        if (
          event === "PASSWORD_RECOVERY" ||
          (event === "SIGNED_IN" && session)
        ) {
          setCanResetPassword(true);
          setCheckingSession(false);
        }
      }
    );

    checkRecoverySession();

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
       * On déconnecte la session temporaire de récupération.
       * L'utilisateur se reconnectera ensuite normalement.
       */
      await supabase.auth.signOut();

      setTimeout(() => {
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

            <input
              id="password"
              required
              type="password"
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
              className="w-full rounded-xl border border-surface bg-transparent px-4 py-4 text-sm text-foreground outline-none transition placeholder:text-stone/40 focus:border-stone"
            />
          </div>

          {/* CONFIRMATION */}

          <div>
            <label
              htmlFor="confirm-password"
              className="mb-2 block text-[9px] uppercase tracking-[0.3em] text-stone"
            >
              Confirmer le mot de passe
            </label>

            <input
              id="confirm-password"
              required
              type="password"
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
              className="w-full rounded-xl border border-surface bg-transparent px-4 py-4 text-sm text-foreground outline-none transition placeholder:text-stone/40 focus:border-stone"
            />
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