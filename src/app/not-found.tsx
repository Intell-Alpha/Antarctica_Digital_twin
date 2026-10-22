"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, useReducedMotion } from "framer-motion";
import {
  House,
  Gauge,
  WarningDiamond,
  Radio,
  Compass,
} from "@phosphor-icons/react";
import { HudPanel } from "@/components/HudPanel";
import { HeartbeatDot } from "@/components/HeartbeatDot";
import { TopographicBg } from "@/components/TopographicBg";
import { ThemeSwitcher } from "@/components/ThemeSwitcher";

export default function NotFound() {
  const pathname = usePathname();
  const shouldReduceMotion = useReducedMotion();

  return (
    <div className="relative min-h-[calc(100vh-5rem)] w-full flex flex-col items-center justify-center px-4 py-12 sm:py-16 select-none overflow-x-hidden">
      {/* ── ATMOSPHERIC TOPOGRAPHIC LAYER ── */}
      <TopographicBg showRadarRings={!shouldReduceMotion} className="opacity-70" />

      {/* ── AMBIENT RADIAL RADAR GLOW ── */}
      <div
        className="pointer-events-none absolute inset-0 flex items-center justify-center overflow-hidden"
        aria-hidden="true"
      >
        <div className="w-[300px] h-[300px] sm:w-[600px] sm:h-[600px] rounded-full bg-[radial-gradient(circle,var(--accent-primary)_0%,transparent_70%)] opacity-15 blur-3xl pointer-events-none" />
      </div>

      <motion.div
        initial={shouldReduceMotion ? false : { opacity: 0, y: 16, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={
          shouldReduceMotion
            ? { duration: 0 }
            : { duration: 0.5, ease: [0.32, 0.72, 0, 1] }
        }
        className="relative z-10 w-full max-w-xl mx-auto flex flex-col items-center"
      >
        {/* ── POLAR HUD ENCLOSURE ── */}
        <HudPanel
          tag="ERR // 404"
          title="COORDINATE UNRESOLVED"
          subtitle="POLAR TELEMETRY MATRIX · LOSS OF SIGNAL"
          status="CRITICAL"
          statusLabel="SIGNAL LOST"
          sourceTag="SENSOR"
          hoverEffect={false}
          draggable={false}
          cornerIndicator={<ThemeSwitcher variant="compact" showLabel={false} />}
          className="w-full shadow-[0_20px_50px_rgba(0,0,0,0.7)]"
        >
          <div className="flex flex-col py-2">
            {/* ── POLAR COORDINATE TELEMETRY HEADER ── */}
            <div className="flex items-center justify-between font-mono text-[10px] text-[var(--text-secondary)] border-b border-white/[0.06] pb-2.5 mb-2">
              <span className="flex items-center gap-1.5 tracking-wider">
                <Compass size={13} className="text-[var(--accent-primary)]" />
                <span>SECTOR: VOID_ZONE</span>
              </span>
              <span className="text-[var(--text-muted)] tracking-widest font-mono">
                LAT: 89°59&apos;S · LON: 00°00&apos;E
              </span>
            </div>

            {/* ── GIANT 404 HERO TYPOGRAPHY ── */}
            <div className="relative py-3 sm:py-5 flex flex-col items-center justify-center text-center">
              <div
                className="font-mono text-7xl sm:text-8xl md:text-9xl font-black tracking-tighter text-[var(--text-primary)] select-none leading-none drop-shadow-[0_0_35px_var(--border-color)]"
                aria-label="Error 404"
              >
                404
              </div>

              {/* Status Alert Badge */}
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-rose-500/30 bg-rose-500/10 text-rose-400 font-mono text-[10px] sm:text-[11px] tracking-widest uppercase mt-2 shadow-[0_0_12px_rgba(244,63,94,0.15)]">
                <WarningDiamond size={13} weight="bold" />
                <span>TRANSPONDER UNREACHABLE</span>
              </div>
            </div>

            {/* ── POLAR-THEMED MESSAGE ── */}
            <div className="text-center space-y-2 my-2 sm:my-3 px-2">
              <h1 className="text-lg sm:text-xl font-bold tracking-tight text-[var(--text-primary)] font-headline">
                Signal lost in the ice. This coordinate doesn&apos;t exist.
              </h1>
              <p className="text-xs sm:text-sm text-[var(--text-secondary)] font-body leading-relaxed max-w-md mx-auto">
                The digital twin sensor array scanned Antarctic stations Maitri and Bharati, but received no echo for this sector. Either blizzard conditions have buried the transponder, or this coordinate was never mapped.
              </p>
            </div>

            {/* ── DIAGNOSTIC READOUT TERMINAL BOX ── */}
            <div className="p-3 rounded-xl bg-black/40 border border-white/[0.06] font-mono text-[11px] space-y-1.5 my-4 text-[var(--text-secondary)]">
              <div className="flex items-center justify-between text-[10px] text-[var(--text-muted)] border-b border-white/[0.04] pb-1.5">
                <span className="flex items-center gap-1.5">
                  <Radio size={12} className="text-[var(--accent-primary)]" />
                  <span>DIAGNOSTIC READOUT</span>
                </span>
                <span>HIMDRISHTI // SYS_FAULT</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-[var(--text-muted)] shrink-0">UNRESOLVED_URI:</span>
                <span className="text-[var(--accent-primary)] font-semibold break-all">
                  {pathname || "UNKNOWN_COORDINATE"}
                </span>
              </div>
              <div className="flex items-center justify-between text-[10px] pt-0.5 text-[var(--text-muted)]">
                <HeartbeatDot
                  size="sm"
                  status="CRITICAL"
                  label="LOSS OF TELEMETRY"
                  pulse={!shouldReduceMotion}
                />
                <span className="tracking-widest">PACKET_LOSS: 100%</span>
              </div>
            </div>

            {/* ── ACTION CTAs ── */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 pt-2">
              {/* Primary CTA: Return to Base */}
              <Link
                href="/"
                className="group inline-flex items-center justify-center gap-2.5 px-6 py-3 rounded-full bg-[var(--accent-primary)]/15 hover:bg-[var(--accent-primary)]/25 text-[var(--text-primary)] border border-[var(--accent-primary)]/40 font-mono text-xs uppercase tracking-widest font-semibold transition-all duration-200 active:scale-[0.98] shadow-[0_0_20px_var(--border-color)]"
              >
                <House size={16} weight="bold" className="transition-transform group-hover:-translate-x-0.5" />
                <span>Return to Base</span>
              </Link>

              {/* Secondary CTA: Open Dashboard */}
              <Link
                href="/dashboard"
                className="group inline-flex items-center justify-center gap-2.5 px-6 py-3 rounded-full bg-white/[0.04] hover:bg-white/[0.08] text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-white/10 hover:border-[var(--accent-primary)]/40 font-mono text-xs uppercase tracking-widest font-medium transition-all duration-200 active:scale-[0.98]"
              >
                <Gauge size={16} weight="bold" className="transition-transform group-hover:rotate-45" />
                <span>Open Dashboard</span>
              </Link>
            </div>

            {/* ── QUICK RE-ROUTE LINKS ── */}
            <div className="mt-5 pt-3 border-t border-white/[0.04] flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-[10px] font-mono text-[var(--text-muted)]">
              <span>RE-ROUTE TELEMETRY:</span>
              <Link
                href="/twin"
                className="text-[var(--text-secondary)] hover:text-[var(--accent-primary)] transition-colors underline-offset-2 hover:underline"
              >
                Maitri 3D Twin
              </Link>
              <span>·</span>
              <Link
                href="/twin/bharati"
                className="text-[var(--text-secondary)] hover:text-[var(--accent-primary)] transition-colors underline-offset-2 hover:underline"
              >
                Bharati 3D Twin
              </Link>
            </div>
          </div>
        </HudPanel>
      </motion.div>
    </div>
  );
}
