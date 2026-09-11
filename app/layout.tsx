import type { Metadata } from "next";
import { Cormorant_Garamond, Manrope } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/components/CartContext";
import SiteHeader from "@/components/SiteHeader";

const cormorant = Cormorant_Garamond({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const manrope = Manrope({
  variable: "--font-body",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://ajvek-site.vercel.app"),
  title: {
    default: "AJVEK — Streetwear",
    template: "%s · AJVEK",
  },
  description:
    "AJVEK, marque de streetwear. Découvre les collections Roses et Sakura, tee-shirts en édition limitée.",
  openGraph: {
    title: "AJVEK — Streetwear",
    description:
      "Marque de streetwear. Découvre les collections Roses et Sakura, tee-shirts en édition limitée.",
    siteName: "AJVEK",
    locale: "fr_FR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "AJVEK — Streetwear",
    description:
      "Marque de streetwear. Découvre les collections Roses et Sakura, tee-shirts en édition limitée.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body
        className={`${cormorant.variable} ${manrope.variable} antialiased flex min-h-screen flex-col bg-background text-foreground`}
      >
        <CartProvider>
          <SiteHeader />

          {children}

          <footer className="px-6 py-6 text-center text-xs text-stone border-t border-surface">
            <div className="mb-3 flex flex-wrap items-center justify-center gap-4">
              <a
                href="/cgv"
                className="hover:text-foreground transition-colors"
              >
                CGV
              </a>
              <a
                href="/confidentialite"
                className="hover:text-foreground transition-colors"
              >
                Politique de confidentialité
              </a>
            </div>
            <p>© {new Date().getFullYear()} AJVEK. Tous droits réservés.</p>
          </footer>
        </CartProvider>
      </body>
    </html>
  );
}
