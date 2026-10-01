import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/context/CartContext";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });
const siteUrl = "https://siac-studio.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: { default: "SIAC STUDIO — Artes para Sublimação", template: "%s | SIAC STUDIO" },
  description: "Artes digitais para sublimação, camisas de interclasse e jogos internos. Arquivos prontos para produção, com mascotes e designs exclusivos.",
  keywords: ["artes para sublimação", "arte para sublimação", "arte interclasse", "arte para camisa interclasse", "camisa interclasse", "jogos internos", "mascote interclasse", "arquivo para sublimação", "arquivo CDR", "arte vetorizada"],
  authors: [{ name: "SIAC STUDIO" }],
  creator: "SIAC STUDIO",
  alternates: { canonical: "/" },
  openGraph: {
    type: "website", locale: "pt_BR", siteName: "SIAC STUDIO",
    title: "SIAC STUDIO — Artes para Sublimação e Interclasse",
    description: "Artes digitais para sublimação, camisas de interclasse e jogos internos.",
    images: [{ url: "/og-image.svg", width: 1200, height: 630, alt: "SIAC STUDIO — Artes para Sublimação" }],
  },
  twitter: { card: "summary_large_image", title: "SIAC STUDIO — Artes para Sublimação", description: "Artes digitais para sublimação, interclasse e jogos internos.", images: ["/og-image.svg"], creator: "@siacstudio" },
  icons: { icon: "/favicon.ico", shortcut: "/favicon.ico" },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="relative min-h-screen bg-black text-white"><CartProvider>{children}</CartProvider></body>
    </html>
  );
}
