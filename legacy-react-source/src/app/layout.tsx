import type { Metadata } from "next";
import { Outfit, Geist_Mono } from "next/font/google";
import { GlobalConfetti } from "@/components/GlobalConfetti";
import "./globals.css";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "MoneyMind | PingMyPocket",
  description: "A lightweight, quirky financial reminder and habit tracking app.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="bg-background">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#6d50f5" />
      </head>
      <body
        className={`${outfit.variable} ${geistMono.variable} antialiased min-h-screen text-foreground selection:bg-primary/20`}
      >  <GlobalConfetti />
        {children}
      </body>
    </html>
  );
}
