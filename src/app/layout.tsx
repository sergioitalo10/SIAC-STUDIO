import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/context/CartContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "SIAC STUDIO — Artes para Sublimação",
    template: "%s | SIAC STUDIO",
  },
  description:
    "Arte digital 100% vetorizada para sublimação. Baixe arquivos CDR, PNG e RAR de alta resolução com mascotes e personagens exclusivos.",
  keywords: [
    "artes para sublimação",
    "sublimação",
    "CDR",
    "PNG",
    "vetorizado",
    "mascote",
    "estamparia",
    "produtos personalizados",
  ],
  authors: [{ name: "SIAC STUDIO" }],
  creator: "SIAC STUDIO",
  openGraph: {
    type: "website",
    locale: "pt_BR",
    siteName: "SIAC STUDIO",
    title: "SIAC STUDIO — Artes para Sublimação",
    description:
      "Arte digital 100% vetorizada para sublimação. Baixe arquivos CDR, PNG e RAR de alta resolução com mascotes e personagens exclusivos.",
    images: [
      {
        url: "/og-image.svg",
        width: 1200,
        height: 630,
        alt: "SIAC STUDIO — Artes para Sublimação",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "SIAC STUDIO — Artes para Sublimação",
    description:
      "Arte digital 100% vetorizada para sublimação.",
    images: ["/og-image.jpg"],
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
          lang="pt-BR"
          className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
        >
      <body>
        <CartProvider>
          {children}
        </CartProvider>
      </body>
    </html>
  );
}
