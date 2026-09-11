export const metadata = {
  title: "Lookbook — AJVEK",
};

export default function LookbookPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background px-6 text-center text-foreground">
      <style>{`
        @keyframes camFlash {
          0%, 70%, 100% { opacity: 0; transform: scale(0.6); }
          78% { opacity: 1; transform: scale(1.15); }
          86% { opacity: 0; transform: scale(0.9); }
        }
        @keyframes camBob {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-2px); }
        }
      `}</style>

      <p className="mb-4 text-xs uppercase tracking-[0.3em] text-stone">
        AJVEK
      </p>
      <h1 className="text-3xl font-display uppercase tracking-[0.2em] sm:text-4xl">
        Lookbook
      </h1>
      <p className="mt-6 max-w-md text-sm leading-relaxed text-stone">
        Chaque pièce mérite d&apos;être vue portée, dans la lumière qu&apos;elle
        mérite. Le lookbook AJVEK est en préparation.
      </p>

      <svg
        viewBox="0 0 200 90"
        className="mt-10 h-24 w-52 text-foreground"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <g style={{ animation: "camBob 2.4s ease-in-out infinite" }}>
          <circle cx="26" cy="24" r="7" />
          <path d="M14,55 L38,55 L35,32 L17,32 Z" />
          <path d="M23,34 L45,22" />
          <rect x="42" y="14" width="20" height="14" rx="2" />
          <circle cx="52" cy="21" r="5" />
        </g>

        <g stroke="none" fill="currentColor">
          <circle
            cx="52"
            cy="21"
            r="9"
            style={{ animation: "camFlash 2.4s ease-in-out infinite" }}
            opacity="0"
          />
        </g>

        <path d="M130,18 L142,10 L154,10 L166,18 L180,26 L172,36 L166,32 L166,68 L134,68 L134,32 L128,36 L120,26 Z" />
      </svg>

      <p className="mt-2 text-[10px] uppercase tracking-[0.3em] text-stone">
        En préparation
      </p>

      <a
        href="/catalogue"
        className="mt-10 inline-block rounded-full border border-foreground px-6 py-2 text-xs uppercase tracking-widest text-foreground transition hover:bg-foreground hover:text-background"
      >
        Voir la collection
      </a>
    </main>
  );
}
