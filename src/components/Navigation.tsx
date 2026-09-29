"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import {
  House,
  SquaresFour,
  MapTrifold,
  BatteryCharging,
  Package,
  Wind,
  Cpu,
  WifiHigh,
  Info,
  CaretDown,
  ArrowUpRight,
  List,
  X,
  Radio,
  WarningCircle,
  Cube,
} from "@phosphor-icons/react";

const SUBSYSTEM_ITEMS = [
  {
    href: "/dashboard/infrastructure",
    label: "Infrastructure & Life Support",
    shortLabel: "Infrastructure",
    tag: "STRUCTURAL",
    status: "Normal",
    icon: MapTrifold,
  },
  {
    href: "/dashboard/energy",
    label: "Power Grid & Cryo-Fuel",
    shortLabel: "Energy Grid",
    tag: "POWER",
    status: "98.4%",
    icon: BatteryCharging,
  },
  {
    href: "/dashboard/environment",
    label: "Atmospheric & Polar Weather",
    shortLabel: "Environment",
    tag: "RADAR",
    status: "Advisory",
    icon: Wind,
  },
  {
    href: "/dashboard/logistics",
    label: "Wintering Autonomy & Supply",
    shortLabel: "Logistics",
    tag: "SUPPLY",
    status: "142 Days",
    icon: Package,
  },
  {
    href: "/dashboard/communications",
    label: "Network & Edge Compute",
    shortLabel: "Communications",
    tag: "NETWORK",
    status: "P0 Priority",
    icon: Radio,
  },
  {
    href: "/dashboard/alerts",
    label: "Active Priority Alerts",
    shortLabel: "Active Alerts",
    tag: "CRITICAL",
    status: "Priority",
    icon: WarningCircle,
  },
];

const NAV_LINKS = [
  { href: "/", label: "Home", icon: House },
  { href: "/twin", label: "Maitri 3D", icon: Cube },
  { href: "/twin/bharati", label: "Bharati 3D", icon: Cube },
  { href: "/dashboard", label: "Overview", icon: SquaresFour },
  { href: "/dashboard/simulations", label: "Twin Sim", icon: Cpu },
];

export function Navigation() {
  const pathname = usePathname();
  const [subsystemsOpen, setSubsystemsOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const dropdownRef = useRef<HTMLLIElement>(null);

  // Scroll detection — pill becomes more opaque past hero
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handle = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setSubsystemsOpen(false);
      }
    };
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, []);

  // Close on route change
  useEffect(() => {
    setSubsystemsOpen(false);
    setMobileMenuOpen(false);
  }, [pathname]);

  const isSubsystemActive = SUBSYSTEM_ITEMS.some((i) => pathname === i.href);

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
        transition={{ duration: 0.6, ease: [0.32, 0.72, 0, 1] }}
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
          <span className="font-sans font-bold text-[12px] tracking-[0.2em] text-[#EBF5FC]">
            NCPOR
          </span>
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

            {/* Subsystems dropdown */}
            <li ref={dropdownRef} className="relative">
              <button
                onClick={() => setSubsystemsOpen(!subsystemsOpen)}
                className={cn(
                  "relative px-4 h-11 flex items-center gap-1.5 font-sans text-[11px] font-semibold uppercase tracking-widest transition-colors duration-200",
                  isSubsystemActive
                    ? "text-[#EBF5FC]"
                    : "text-[#2A5A6A] hover:text-[#7ABBD4]"
                )}
              >
                {isSubsystemActive && (
                  <motion.div
                    layoutId="nav_unified_pill"
                    className="absolute inset-x-1 inset-y-1.5 rounded-full bg-[#0DB9D0]/12 border border-[#0DB9D0]/20"
                    transition={{ type: "spring", bounce: 0.15, duration: 0.45 }}
                  />
                )}
                <span className="relative z-10">Subsystems</span>
                <CaretDown
                  size={10}
                  className={cn(
                    "relative z-10 transition-transform duration-200",
                    subsystemsOpen ? "rotate-180 text-[#0DB9D0]" : ""
                  )}
                />
              </button>

              {/* Subsystems popover */}
              <AnimatePresence>
                {subsystemsOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 6, scale: 0.97 }}
                    transition={{ duration: 0.18, ease: "easeOut" }}
                    className="absolute top-[calc(100%+8px)] left-1/2 -translate-x-1/2 w-72 p-2 rounded-2xl bg-[#040D1A]/96 border border-[#0DB9D0]/15 backdrop-blur-2xl shadow-[0_20px_50px_rgba(0,0,0,0.85),0_0_0_1px_rgba(13,185,208,0.06)] z-50"
                  >
                    <div className="px-3 py-2 border-b border-[#0DB9D0]/08 text-[9px] font-mono tracking-[0.2em] text-[#2A5A6A] uppercase mb-1">
                      Operational Domains
                    </div>
                    {SUBSYSTEM_ITEMS.map((item) => {
                      const Icon = item.icon;
                      const active = pathname === item.href;
                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          className={cn(
                            "flex items-center justify-between p-2.5 rounded-xl transition-all duration-150 group",
                            active
                              ? "bg-[#0DB9D0]/10 text-[#EBF5FC]"
                              : "hover:bg-[#0DB9D0]/05 text-[#2A5A6A] hover:text-[#7ABBD4]"
                          )}
                        >
                          <div className="flex items-center gap-2.5">
                            <div
                              className={cn(
                                "w-7 h-7 rounded-lg flex items-center justify-center transition-colors",
                                active
                                  ? "bg-[#0DB9D0]/15 text-[#0DB9D0]"
                                  : "bg-[#0DB9D0]/04 text-[#2A5A6A] group-hover:text-[#0DB9D0]"
                              )}
                            >
                              <Icon size={15} />
                            </div>
                            <div className="flex flex-col text-left">
                              <span className="font-sans text-xs font-medium text-[#EBF5FC]">
                                {item.shortLabel}
                              </span>
                              <span className="font-mono text-[9px] text-[#2A5A6A]">
                                {item.tag}
                              </span>
                            </div>
                          </div>
                          <span className="font-mono text-[10px] text-[#3A7A8A]">
                            {item.status}
                          </span>
                        </Link>
                      );
                    })}
                  </motion.div>
                )}
              </AnimatePresence>
            </li>
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
          <span className="font-sans font-bold text-[12px] tracking-[0.2em] text-[#EBF5FC]">
            NCPOR
          </span>
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

            <div className="pt-3 border-t border-[#0D3040]/60">
              <div className="text-[9px] font-mono tracking-[0.2em] text-[#1E3A48] uppercase mb-2 px-1">
                Subsystems
              </div>
              <div className="grid grid-cols-2 gap-2">
                {SUBSYSTEM_ITEMS.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="p-2.5 rounded-xl bg-[#0DB9D0]/[0.04] hover:bg-[#0DB9D0]/[0.08] border border-[#0DB9D0]/10 text-left transition-colors"
                  >
                    <div className="font-sans text-xs text-[#EBF5FC] font-medium">
                      {item.shortLabel}
                    </div>
                    <div className="font-mono text-[9px] text-[#2A5A6A] mt-0.5">
                      {item.status}
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </header>
  );
}
