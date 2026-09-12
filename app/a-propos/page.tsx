import ScrollReveal from "@/components/ScrollReveal";

export default function AProposPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 px-6 py-24 text-center">
      <ScrollReveal>
        <h1 className="font-display text-4xl sm:text-5xl">AJVEK</h1>
      </ScrollReveal>

      <div className="mt-4 flex max-w-xl flex-col gap-5 text-stone">
        <ScrollReveal delay={100}>
          <p>
            AJVEK, c&apos;est l&apos;histoire de deux amis dans la vingtaine, Alexis et
            Julien, originaires de Bordeaux et de Nice, qui ont décidé de
            donner vie à une marque de streetwear qui leur ressemble.
          </p>
        </ScrollReveal>

        <ScrollReveal delay={150}>
          <p>
            Ici, tout part des fleurs. La rose, qui ne s&apos;offre jamais sans
            ses épines — la beauté qui se mérite, qui pique avant de séduire.
            Le cerisier, dont les fleurs n&apos;éclosent que pour mieux tomber —
            la grâce qui ne dure qu&apos;un instant, et qu&apos;on choisit de porter
            quand même.
          </p>
        </ScrollReveal>

        <ScrollReveal delay={150}>
          <p>
            Ces images ne sont pas choisies par hasard. Elles racontent ce
            qu&apos;on veut que la marque soit : quelque chose qui a du
            caractère, qui prend le temps de pousser, et qui reste beau même
            quand ça pique.
          </p>
        </ScrollReveal>

        <ScrollReveal delay={150}>
          <p>
            On construit AJVEK à distance, chacun de son côté, avec la même
            exigence. Pas une marque de plus : un jardin qu&apos;on cultive à
            deux, pièce par pièce jusqu&apos;à ce qu&apos;il devienne ce qu&apos;on imagine
            depuis le début.
          </p>
        </ScrollReveal>
      </div>
    </main>
  );
}
