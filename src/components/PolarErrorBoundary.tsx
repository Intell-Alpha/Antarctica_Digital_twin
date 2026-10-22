"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import {
  House,
  Gauge,
  ArrowClockwise,
  WarningDiamond,
  TerminalWindow,
  ClipboardText,
  Check,
  Compass,
} from "@phosphor-icons/react";
import { HudPanel } from "@/components/HudPanel";
import { HeartbeatDot } from "@/components/HeartbeatDot";
import { TopographicBg } from "@/components/TopographicBg";
import { ThemeSwitcher } from "@/components/ThemeSwitcher";

export interface PolarErrorBoundaryProps {
  error: Error & { digest?: string };
  reset: () => void;
  isDashboard?: boolean;
  isRoot?: boolean;
}

export function PolarErrorBoundary({
  error,
  reset,
  isDashboard = false,
  isRoot = false,
}: PolarErrorBoundaryProps) {
  const shouldReduceMotion = useReducedMotion();
  const [copied, setCopied] = useState(false);
  const isDev = process.env.NODE_ENV === "development";

  useEffect(() => {
    // Log exception for development & monitoring
    console.error("[Himdrishti Polar Telemetry Exception]:", error);
  }, [error]);

  const handleCopyDiagnostics = () => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      const payload = [
        `HIMDRISHTI POLAR EXCEPTION DIAGNOSTIC`,
        `Name: ${error.name || "Error"}`,
        `Message: ${error.message || "Unknown error"}`,
        `Digest: ${error.digest || "none"}`,
        `Sector: ${isDashboard ? "Dashboard Pipeline" : "Root System"}`,
        `Timestamp: ${new Date().toISOString()}`,
        ``,
        `Stack Trace:`,
        error.stack || "No stack trace provided",
      ].join("\n");

      navigator.clipboard.writeText(payload);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div
      className={`relative w-full flex flex-col items-center justify-center px-4 py-12 sm:py-16 select-none overflow-x-hidden ${
        isRoot ? "min-h-[calc(100vh-5rem)]" : "min-h-[70vh]"
      }`}
    >
      {/* ── ATMOSPHERIC TOPOGRAPHIC BACKGROUND ── */}
      <TopographicBg showRadarRings={!shouldReduceMotion} className="opacity-60" />

      {/* ── AMBIENT FAULT RADIAL GLOW ── */}
      <div
        className="pointer-events-none absolute inset-0 flex items-center justify-center overflow-hidden"
        aria-hidden="true"
      >
        <div className="w-[300px] h-[300px] sm:w-[600px] sm:h-[600px] rounded-full bg-[radial-gradient(circle,rgba(244,63,94,0.12)_0%,transparent_70%)] blur-3xl pointer-events-none" />
      </div>

      <motion.div
        initial={shouldReduceMotion ? false : { opacity: 0, y: 16, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={
          shouldReduceMotion
            ? { duration: 0 }
            : { duration: 0.5, ease: [0.32, 0.72, 0, 1] }
        }
        className="relative z-10 w-full max-w-2xl mx-auto flex flex-col items-center"
      >
        {/* ── POLAR HUD ERROR ENCLOSURE ── */}
        <HudPanel
          tag="SYS // ANOMALY"
          title="SYSTEMS ANOMALY DETECTED"
          subtitle={
            isDashboard
              ? "DASHBOARD TELEMETRY PIPELINE · SUB-SECTOR EXCEPTION"
              : "POLAR COMPUTATION ENGINE · LOSS OF DATA SYNCHRONIZATION"
          }
          status="CRITICAL"
          statusLabel="SYS_FAULT"
          sourceTag="SENSOR"
          hoverEffect={false}
          draggable={false}
          cornerIndicator={<ThemeSwitcher variant="compact" showLabel={false} />}
          className="w-full shadow-[0_20px_50px_rgba(0,0,0,0.7)]"
        >
          <div className="flex flex-col py-2">
            {/* ── POLAR FAULT HEADER STATUS ── */}
            <div className="flex items-center justify-between font-mono text-[10px] text-[var(--text-secondary)] border-b border-white/[0.06] pb-2.5 mb-3">
              <span className="flex items-center gap-1.5 tracking-wider">
                <Compass size={13} className="text-rose-400" />
                <span>SECTOR: {isDashboard ? "DASHBOARD_CORE" : "ANTARCTIC_ROOT"}</span>
              </span>
              <HeartbeatDot
                size="sm"
                status="CRITICAL"
                label="PIPELINE FAULT"
                pulse={!shouldReduceMotion}
              />
            </div>

            {/* ── ANOMALY VISUAL BADGE ── */}
            <div className="relative py-2 sm:py-3 flex flex-col items-center justify-center text-center">
              <div className="w-14 h-14 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400 shadow-[0_0_20px_rgba(244,63,94,0.2)] mb-3">
                <WarningDiamond size={32} weight="bold" />
              </div>

              {/* Status Pill */}
              <div className="inline-flex items-center gap-2 px-3 py-0.5 rounded-full border border-rose-500/30 bg-rose-500/10 text-rose-400 font-mono text-[10px] sm:text-[11px] tracking-widest uppercase shadow-[0_0_12px_rgba(244,63,94,0.15)]">
                <span>EXCEPTION CAUGHT // STATUS 500</span>
              </div>
            </div>

            {/* ── POLAR-THEMED ERROR MESSAGE ── */}
            <div className="text-center space-y-2 my-2 sm:my-3 px-2">
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[var(--text-primary)] font-headline">
                Systems anomaly detected in this sector.
              </h1>
              <p className="text-xs sm:text-sm text-[var(--text-secondary)] font-body leading-relaxed max-w-lg mx-auto">
                An unexpected operational fault interrupted live data processing.
                Life support parameters and physical digital twin telemetry for
                Maitri and Bharati may require subsystem re-initialization.
              </p>
            </div>

            {/* ── CORE DIAGNOSTIC READOUT (SAFE FOR ALL ENVIRONMENTS) ── */}
            <div className="p-3 rounded-xl bg-black/40 border border-white/[0.06] font-mono text-[11px] space-y-1.5 my-3 text-[var(--text-secondary)]">
              <div className="flex items-center justify-between text-[10px] text-[var(--text-muted)] border-b border-white/[0.04] pb-1.5">
                <span>TELEMETRY FAULT LOG</span>
                <span>HIMDRISHTI // RECOVERY_READY</span>
              </div>
              <div className="flex items-center justify-between text-[10px] pt-0.5">
                <span className="text-[var(--text-muted)]">DIGEST REFERENCE:</span>
                <span className="text-[var(--accent-primary)] font-semibold tracking-wider">
                  {error.digest || "SEC_ANOMALY_CORE"}
                </span>
              </div>
              <div className="flex items-center justify-between text-[10px]">
                <span className="text-[var(--text-muted)]">SYSTEM ACTION:</span>
                <span className="text-rose-400 font-medium tracking-wide">
                  ISOLATED TO PREVENT SYSTEM-WIDE CASCADE
                </span>
              </div>
            </div>

            {/* ── DEV-ONLY COLLAPSED STACK TRACE & DETAILS ── */}
            {isDev && (
              <details className="group my-2 text-left rounded-xl bg-black/60 border border-white/[0.08] overflow-hidden text-xs font-mono">
                <summary className="p-3 cursor-pointer select-none flex items-center justify-between text-[var(--accent-primary)] hover:bg-white/[0.03] transition-colors">
                  <span className="flex items-center gap-2 font-semibold tracking-wider">
                    <TerminalWindow size={15} />
                    <span>DEV DIAGNOSTICS & STACK TRACE (DEV ONLY)</span>
                  </span>
                  <span className="text-[10px] text-[var(--text-muted)] group-open:rotate-180 transition-transform">
                    ▼
                  </span>
                </summary>
                <div className="p-3 bg-black/90 border-t border-white/[0.06] space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-rose-400 font-semibold truncate">
                      {error.name || "Error"}: {error.message || "Unknown error occurred"}
                    </span>
                    <button
                      type="button"
                      onClick={handleCopyDiagnostics}
                      className="shrink-0 px-2.5 py-1 rounded bg-white/10 hover:bg-white/20 text-slate-200 text-[10px] flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      {copied ? (
                        <>
                          <Check size={12} className="text-emerald-400" />
                          <span>COPIED</span>
                        </>
                      ) : (
                        <>
                          <ClipboardText size={12} />
                          <span>COPY DIAGNOSTICS</span>
                        </>
                      )}
                    </button>
                  </div>
                  {error.stack && (
                    <pre className="text-[11px] text-slate-300 font-mono overflow-x-auto p-2.5 rounded bg-black/90 border border-white/5 max-h-56 select-text whitespace-pre leading-relaxed">
                      {error.stack}
                    </pre>
                  )}
                </div>
              </details>
            )}

            {/* ── ACTION CTAs ── */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 pt-3">
              {/* Primary CTA: Retry / reset() */}
              <button
                type="button"
                onClick={() => reset()}
                className="group inline-flex items-center justify-center gap-2.5 px-6 py-3 rounded-full bg-[var(--accent-primary)]/20 hover:bg-[var(--accent-primary)]/30 text-[var(--text-primary)] border border-[var(--accent-primary)]/50 font-mono text-xs uppercase tracking-widest font-semibold transition-all duration-200 active:scale-[0.98] shadow-[0_0_20px_var(--border-color)] cursor-pointer"
              >
                <ArrowClockwise
                  size={16}
                  weight="bold"
                  className={
                    shouldReduceMotion
                      ? ""
                      : "transition-transform duration-300 group-hover:rotate-180"
                  }
                />
                <span>Retry Telemetry</span>
              </button>

              {/* Secondary CTA: Return to Base */}
              <Link
                href="/"
                className="group inline-flex items-center justify-center gap-2.5 px-6 py-3 rounded-full bg-white/[0.04] hover:bg-white/[0.08] text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-white/10 hover:border-[var(--accent-primary)]/40 font-mono text-xs uppercase tracking-widest font-medium transition-all duration-200 active:scale-[0.98]"
              >
                <House
                  size={16}
                  weight="bold"
                  className="transition-transform group-hover:-translate-x-0.5"
                />
                <span>Return to Base</span>
              </Link>

              {/* Optional Dashboard CTA when in Dashboard */}
              {isDashboard && (
                <Link
                  href="/dashboard"
                  className="group inline-flex items-center justify-center gap-2.5 px-6 py-3 rounded-full bg-white/[0.04] hover:bg-white/[0.08] text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-white/10 hover:border-[var(--accent-primary)]/40 font-mono text-xs uppercase tracking-widest font-medium transition-all duration-200 active:scale-[0.98]"
                >
                  <Gauge size={16} weight="bold" />
                  <span>Dashboard Overview</span>
                </Link>
              )}
            </div>

            {/* ── QUICK RE-ROUTE LINKS ── */}
            <div className="mt-5 pt-3 border-t border-white/[0.04] flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-[10px] font-mono text-[var(--text-muted)]">
              <span>ALTERNATIVE RE-ROUTE:</span>
              <Link
                href="/dashboard"
                className="text-[var(--text-secondary)] hover:text-[var(--accent-primary)] transition-colors underline-offset-2 hover:underline"
              >
                Operational Dashboard
              </Link>
              <span>·</span>
              <Link
                href="/twin"
                className="text-[var(--text-secondary)] hover:text-[var(--accent-primary)] transition-colors underline-offset-2 hover:underline"
              >
                Maitri 3D
              </Link>
              <span>·</span>
              <Link
                href="/twin/bharati"
                className="text-[var(--text-secondary)] hover:text-[var(--accent-primary)] transition-colors underline-offset-2 hover:underline"
              >
                Bharati 3D
              </Link>
            </div>
          </div>
        </HudPanel>
      </motion.div>
    </div>
  );
}
