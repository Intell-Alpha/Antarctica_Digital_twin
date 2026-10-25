import type { Metadata } from "next";
import { Plus_Jakarta_Sans, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Navigation } from "@/components/Navigation";
import { ThemeProvider } from "@/context/ThemeContext";
import { NetworkProvider } from "@/context/NetworkContext";

const plusJakarta = Plus_Jakarta_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Himdrishti",
  description:
    "Live operational telemetry, predictive twin, and life support monitoring for India's Antarctic research stations: Maitri and Bharati.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${plusJakarta.variable} ${jetbrainsMono.variable} antialiased dark`}
    >
      <body className="min-h-screen flex flex-col font-sans relative selection:bg-[#0DB9D0]/20 selection:text-[#EBF5FC]">
        <ThemeProvider>
          <NetworkProvider>
            {/*
             * ── ATMOSPHERIC BACKGROUND LAYERS ─────────────────────────────
             * All fixed, pointer-events: none, z-index 0.
             * Rendered once globally so every page has the Antarctic sky.
             */}
            {/* 3. Film-grain noise — kills flat-black banding */}
            <div className="polar-noise" aria-hidden="true" />
            {/* 4. Edge vignette — dark corners for cinematic depth */}
            <div className="polar-vignette" aria-hidden="true" />

            <Navigation />
            <main className="relative flex-1 flex flex-col">
              {children}
            </main>
          </NetworkProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
