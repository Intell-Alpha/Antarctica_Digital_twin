import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Navigation } from "@/components/Navigation";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Maitri Digital Twin",
  description: "Advanced operational dashboard for Maitri Research Station",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} antialiased dark`}>
      <body className="min-h-[100dvh] flex flex-col bg-[#050505] text-[#ededed] font-sans relative">
        <div className="bg-mesh pointer-events-none" />
        <Navigation />
        {children}
      </body>
    </html>
  );
}
