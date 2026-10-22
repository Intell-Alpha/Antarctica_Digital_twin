"use client";

import React from "react";
import { Skeleton, SkeletonBadge } from "@/components/dashboard/TelemetrySkeleton";
import { TopographicBg } from "@/components/TopographicBg";
import { HeartbeatDot } from "@/components/HeartbeatDot";

export default function GlobalLoading() {
  return (
    <div className="min-h-[calc(100vh-5rem)] w-full flex flex-col items-center justify-center px-4 py-16 relative overflow-hidden select-none">
      {/* ── ATMOSPHERIC TOPOGRAPHIC LAYER ── */}
      <TopographicBg showRadarRings={true} className="opacity-50" />

      {/* ── AMBIENT RADIAL RADAR GLOW ── */}
      <div
        className="pointer-events-none absolute inset-0 flex items-center justify-center overflow-hidden"
        aria-hidden="true"
      >
        <div className="w-[300px] h-[300px] sm:w-[500px] sm:h-[500px] rounded-full bg-[radial-gradient(circle,rgba(13,185,208,0.12)_0%,transparent_70%)] blur-3xl pointer-events-none" />
      </div>

      {/* ── HUD LOADING CHASSIS ── */}
      <div className="relative z-10 w-full max-w-lg mx-auto">
        <div className="bezel-shell p-0.5 shadow-[0_20px_50px_rgba(0,0,0,0.8)]">
          <div className="bezel-core p-6 space-y-5 bg-[#050F1C]/90 backdrop-blur-xl">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
              <div className="flex items-center gap-2.5">
                <span className="font-mono text-[10px] uppercase tracking-wider text-[var(--accent-primary)] bg-[var(--accent-primary)]/10 px-2 py-0.5 rounded border border-[var(--accent-primary)]/20 font-semibold">
                  POLAR STREAM
                </span>
                <span className="font-mono text-xs text-white/90 font-medium tracking-tight">
                  ACQUIRING TELEMETRY...
                </span>
              </div>
              <HeartbeatDot size="sm" status="LIVE" label="CONNECTING" />
            </div>

            {/* Coordinates and Station Target */}
            <div className="p-3 rounded-lg bg-black/40 border border-white/[0.05] space-y-1.5 font-mono text-[11px] text-[var(--text-secondary)]">
              <div className="flex justify-between text-[10px] text-[var(--text-muted)]">
                <span>SECTOR TARGET:</span>
                <span className="text-[var(--accent-primary)] font-semibold">
                  MAITRI · BHARATI
                </span>
              </div>
              <div className="flex justify-between text-[10px]">
                <span className="text-[var(--text-muted)]">DATA PIPELINE:</span>
                <span className="text-white/80">NCPOR REAL-TIME TELEMETRY</span>
              </div>
            </div>

            {/* Shimmering Vitals Bar Placeholders */}
            <div className="space-y-3 pt-1">
              <div className="flex items-center justify-between text-[10px] font-mono text-[var(--text-muted)]">
                <span className="tracking-widest uppercase">SYNCHRONIZATION PROGRESS</span>
                <span className="text-[var(--accent-primary)] font-semibold animate-pulse">
                  DOWNLINKING
                </span>
              </div>
              <div className="w-full h-1.5 bg-black/60 rounded-full overflow-hidden border border-white/5">
                <div className="h-full w-2/3 bg-gradient-to-r from-transparent via-[var(--accent-primary)] to-transparent animate-[shimmer_1.5s_infinite] motion-reduce:animate-none motion-reduce:bg-[var(--accent-primary)]/40" />
              </div>
            </div>

            {/* Metric Skeletons Row */}
            <div className="grid grid-cols-3 gap-3 pt-2">
              <div className="p-2.5 rounded-lg bg-white/[0.02] border border-white/[0.04] space-y-1">
                <Skeleton className="h-2.5 w-12" />
                <Skeleton className="h-5 w-16" />
              </div>
              <div className="p-2.5 rounded-lg bg-white/[0.02] border border-white/[0.04] space-y-1">
                <Skeleton className="h-2.5 w-14" />
                <Skeleton className="h-5 w-14" />
              </div>
              <div className="p-2.5 rounded-lg bg-white/[0.02] border border-white/[0.04] space-y-1">
                <Skeleton className="h-2.5 w-10" />
                <Skeleton className="h-5 w-12" />
              </div>
            </div>

            {/* Footer metadata */}
            <div className="pt-2 border-t border-white/[0.04] flex items-center justify-between text-[10px] font-mono text-[var(--text-muted)]">
              <span>HIMDRISHTI // 44TH ISEA</span>
              <span className="tracking-widest text-[var(--accent-primary)]/70">
                BUFFERING SENSORS
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
