"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

export default function ConnexionPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) {
      setError("Email ou mot de passe incorrect.");
      setSubmitting(false);
      return;
    }

    setSubmitting(false);
    router.push("/catalogue");
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background px-6 text-center text-foreground">
      <p className="mb-4 text-xs tracking-[0.3em] text-stone uppercase">
        Compte
      </p>
      <h1 className="mb-8 text-4xl font-display">Se connecter</h1>

      <form
        onSubmit={handleSubmit}
        className="flex w-full max-w-sm flex-col gap-3 text-left"
      >
        <input
          required
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          className="rounded border border-stone/40 bg-transparent px-3 py-2 text-sm outline-none focus:border-foreground"
        />
        <input
          required
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Mot de passe"
          className="rounded border border-stone/40 bg-transparent px-3 py-2 text-sm outline-none focus:border-foreground"
        />
        {error && <p className="text-xs text-stone">{error}</p>}
        <button
          type="submit"
          disabled={submitting}
          className="mt-2 rounded-full border border-foreground px-4 py-3 text-xs uppercase tracking-widest text-foreground transition hover:bg-foreground hover:text-background"
        >
          {submitting ? "Connexion..." : "Se connecter"}
        </button>
      </form>

      <p className="mt-8 text-xs text-stone">
        Pas encore de compte ?{" "}
        <Link href="/inscription" className="underline hover:text-foreground">
          Créer un compte
        </Link>
      </p>
    </main>
  );
}
