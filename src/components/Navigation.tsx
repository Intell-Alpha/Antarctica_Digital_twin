"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import {
  House,
  ArrowUpRight,
  List,
  X,
  Cube,
} from "@phosphor-icons/react";

const NAV_LINKS = [
  { href: "/", label: "Home", icon: House },
  { href: "/twin", label: "Maitri 3D", icon: Cube },
  { href: "/twin/bharati", label: "Bharati 3D", icon: Cube },
];

export function Navigation() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Scroll detection — pill becomes more opaque past hero
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  if (
    pathname?.startsWith("/dashboard") ||
    pathname?.startsWith("/twin") ||
    pathname === "/bharati"
  ) {
    return null;
  }

  return (
    <header className="fixed top-0 inset-x-0 z-50 pointer-events-none flex justify-center px-4 pt-4">

      {/* ══════════════════════════════════════════════════════════════════
          SINGLE UNIFIED GLASS PILL — Desktop
          Brand · Divider · Nav Links · Subsystems · Divider · Clock · CTA
      ══════════════════════════════════════════════════════════════════ */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.32, 0.72, 0, 1] as const }}
        className={cn(
          "pointer-events-auto hidden lg:flex items-center h-11 rounded-full border transition-all duration-500",
          scrolled
            ? "bg-[#04101E]/92 border-[#0DB9D0]/20 shadow-[0_8px_40px_rgba(0,0,0,0.7),0_0_0_1px_rgba(13,185,208,0.08)] backdrop-blur-2xl"
            : "bg-[#04101E]/75 border-[#0DB9D0]/12 shadow-[0_4px_24px_rgba(0,0,0,0.5)] backdrop-blur-xl"
        )}
      >

        {/* ── Brand ── */}
        <Link
          href="/"
          className="group flex items-center pl-5 pr-4 h-full hover:opacity-80 transition-opacity"
        >
          <div className="flex flex-col items-start justify-center">
            <div className="flex items-center gap-[2px]">
              <span className="font-sans font-black text-[14px] tracking-[0.25em] text-[#EBF5FC]">
                HIM
              </span>
              <span className="font-sans font-black text-[14px] tracking-[0.25em] bg-clip-text text-transparent bg-gradient-to-r from-[#0DB9D0] to-[#00D4A0]">
                DRISHTI
              </span>
            </div>
          </div>
        </Link>

        {/* ── Divider ── */}
        <div className="w-px h-5 bg-[#0DB9D0]/12 mx-1" />

        {/* ── Nav Links ── */}
        <nav>
          <ul className="flex items-center">
            {NAV_LINKS.map(({ href, label, icon: Icon }) => {
              const active = pathname === href;
              return (
                <li key={href}>
                  <Link
                    href={href}
                    className={cn(
                      "relative px-4 h-11 flex items-center gap-1.5 font-sans text-[11px] font-semibold uppercase tracking-widest transition-colors duration-200",
                      active
                        ? "text-[#EBF5FC]"
                        : "text-[#2A5A6A] hover:text-[#7ABBD4]"
                    )}
                  >
                    {active && (
                      <motion.div
                        layoutId="nav_unified_pill"
                        className="absolute inset-x-1 inset-y-1.5 rounded-full bg-[#0DB9D0]/12 border border-[#0DB9D0]/20"
                        transition={{ type: "spring", bounce: 0.15, duration: 0.45 }}
                      />
                    )}
                    <span className="relative z-10">{label}</span>
                  </Link>
                </li>
              );
            })}

            {/* Subsystems dropdown removed to eliminate dashboard redundancy */}
          </ul>
        </nav>



        {/* ── CTA ── */}
        <Link
          href="/dashboard"
          className="group mr-1.5 flex items-center gap-1.5 pl-3.5 pr-2.5 h-8 rounded-full bg-[#0DB9D0] hover:bg-[#0FCEE8] text-[#03060E] font-mono text-[10px] uppercase tracking-wider font-bold transition-all duration-200 shadow-[0_0_20px_rgba(13,185,208,0.35)] hover:shadow-[0_0_28px_rgba(13,185,208,0.5)] active:scale-95"
        >
          <span>Dashboard</span>
          <ArrowUpRight size={11} weight="bold" className="group-hover:translate-x-px group-hover:-translate-y-px transition-transform" />
        </Link>

      </motion.div>

      {/* ══════════════════════════════════════════════════════════════════
          MOBILE — Compact pill with hamburger
      ══════════════════════════════════════════════════════════════════ */}
      <div className="pointer-events-auto lg:hidden flex items-center justify-between w-full max-w-sm mx-auto">

        {/* Brand pill */}
        <Link
          href="/"
          className="flex items-center px-5 py-2 rounded-full bg-[#04101E]/80 border border-[#0DB9D0]/15 backdrop-blur-xl hover:bg-[#0DB9D0]/10 transition-colors"
        >
          <div className="flex flex-col items-start justify-center">
            <div className="flex items-center gap-[2px]">
              <span className="font-sans font-black text-[14px] tracking-[0.25em] text-[#EBF5FC]">
                HIM
              </span>
              <span className="font-sans font-black text-[14px] tracking-[0.25em] bg-clip-text text-transparent bg-gradient-to-r from-[#0DB9D0] to-[#00D4A0]">
                DRISHTI
              </span>
            </div>
          </div>
        </Link>

        {/* Hamburger */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2.5 rounded-full bg-[#04101E]/80 border border-[#0DB9D0]/15 text-[#3A7A8A] hover:text-[#0DB9D0] backdrop-blur-xl transition-colors"
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? <X size={18} /> : <List size={18} />}
        </button>
      </div>

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            className="pointer-events-auto lg:hidden absolute top-[calc(100%+4px)] left-4 right-4 p-4 rounded-3xl bg-[#040D1A]/96 border border-[#0DB9D0]/15 backdrop-blur-3xl shadow-[0_20px_50px_rgba(0,0,0,0.85)]"
          >
            <div className="space-y-1 mb-4">
              {NAV_LINKS.map(({ href, label, icon: Icon }) => (
                <Link
                  key={href}
                  href={href}
                  className={cn(
                    "flex items-center gap-3 p-3 rounded-xl font-mono text-xs uppercase tracking-wider transition-colors",
                    pathname === href
                      ? "bg-[#0DB9D0]/10 text-[#0DB9D0]"
                      : "text-[#2A5A6A] hover:text-[#7ABBD4] hover:bg-[#0DB9D0]/05"
                  )}
                >
                  <Icon size={15} />
                  <span>{label}</span>
                </Link>
              ))}
            </div>

          </motion.div>
        )}
      </AnimatePresence>

    </header>
  );
}
