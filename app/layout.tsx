import type { Metadata } from "next";
import { Cormorant_Garamond, Manrope } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/components/AuthContext";
import { CartProvider } from "@/components/CartContext";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { Analytics } from "@vercel/analytics/next";

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
  metadataBase: new URL("https://ajvek.fr"),

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
        className={`${cormorant.variable} ${manrope.variable} flex min-h-screen flex-col bg-background text-foreground antialiased`}
      >
        <AuthProvider>
          <CartProvider>
            <SiteHeader />

            <div className="flex-1">
              {children}
            </div>

            <SiteFooter />
          </CartProvider>
        </AuthProvider>

        <Analytics />

        <div
          aria-hidden
          className="pointer-events-none fixed inset-0 z-30 opacity-[0.035] mix-blend-overlay"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
            backgroundRepeat: "repeat",
          }}
        />
      </body>
    </html>
  );
}