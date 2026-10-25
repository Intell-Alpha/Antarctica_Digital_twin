"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowsClockwise,
  WarningCircle,
  Eye,
  Camera,
  Cpu,
  TerminalWindow,
  ClipboardText,
  Check,
  Compass,
  ShieldCheck,
  Sparkle,
  ArrowSquareOut,
  MapPin,
  Flame,
  Lightning,
} from "@phosphor-icons/react";
import { polarAudio } from "@/lib/polarAudioEngine";
import { useReducedMotion } from "@/hooks/useReducedMotion";

export interface WebGLFallbackProps {
  station: "MAITRI" | "BHARATI";
  error?: string | null;
  onRetry?: () => void;
  onOpenAICommander?: () => void;
  className?: string;
}

const STATION_META = {
  MAITRI: {
    name: "Maitri Research Station",
    code: "IND-MAITRI-01",
    location: "Schirmacher Oasis, Queen Maud Land",
    coordinates: "70°45'57\" S · 11°44'09\" E",
    elevation: "117 m ASL",
    commissioned: "1989 (Continuous Operation)",
    image: "/assets/maitri_station.jpg",
    altStation: "BHARATI",
    altLink: "/twin?station=bharati",
    power: "Riello Hydronic + 3x 62.5 kVA Gensets",
    temp: "-28.4°C",
    wind: "34 knots ESE",
  },
  BHARATI: {
    name: "Bharati Research Station",
    code: "IND-BHARATI-02",
    location: "Larsemann Hills, Princess Elizabeth Land",
    coordinates: "69°24'28\" S · 76°11'14\" E",
    elevation: "35 m ASL",
    commissioned: "2012 (Elevated Monoblock)",
    image: "/assets/bharati_station.jpg",
    altStation: "MAITRI",
    altLink: "/twin?station=maitri",
    power: "CHPP Co-generation (1,000 kW Reserve)",
    temp: "-22.8°C",
    wind: "28 knots SSE",
  },
};

export function WebGLFallback({
  station,
  error,
  onRetry,
  onOpenAICommander,
  className = "",
}: WebGLFallbackProps) {
  const shouldReduceMotion = useReducedMotion();
  const [isRetrying, setIsRetrying] = useState(false);
  const [showDiagnostics, setShowDiagnostics] = useState(false);
  const [copied, setCopied] = useState(false);

  const meta = STATION_META[station] || STATION_META.MAITRI;

  const handleRetry = () => {
    try {
      polarAudio.playClickFeedback();
    } catch {
      // Audio might not be initialized
    }
    setIsRetrying(true);
    setTimeout(() => {
      if (onRetry) {
        onRetry();
      } else if (typeof window !== "undefined") {
        window.location.reload();
      }
    }, 400);
  };

  const handleCopyDiagnostics = () => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      const payload = [
        `HIMDRISHTI POLAR DIGITAL TWIN - WEBGL DIAGNOSTIC REPORT`,
        `Station: ${station}`,
        `Timestamp: ${new Date().toISOString()}`,
        `Error Reason: ${error || "Context creation failure or hardware restriction"}`,
        `User Agent: ${typeof navigator !== "undefined" ? navigator.userAgent : "N/A"}`,
        `Screen Resolution: ${typeof window !== "undefined" ? `${window.innerWidth}x${window.innerHeight} (${window.devicePixelRatio}x)` : "N/A"}`,
        `Resolution Mode: Static 2D Photographic Telemetry Fallback`,
      ].join("\n");

      navigator.clipboard.writeText(payload);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div
      className={`relative w-full h-full min-h-[600px] overflow-hidden bg-[#03060E] flex flex-col items-center justify-center select-none ${className}`}
    >
      {/* ── HIGH-RESOLUTION STATIC STATION POSTER IMAGE ── */}
      <div className="absolute inset-0 z-0">
        <Image
          src={meta.image}
          alt={`${meta.name} Antarctic Telemetry View`}
          fill
          priority
          sizes="100vw"
          className="object-cover object-center filter brightness-[0.70] contrast-[1.12]"
        />
        {/* Dark Vignette and Polar Grid Overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#03060E] via-[#03060E]/70 to-[#03060E]/50" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_20%,#03060E_95%)]" />
        <div
          className="absolute inset-0 pointer-events-none opacity-20 bg-[linear-gradient(rgba(0,168,255,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(0,168,255,0.06)_1px,transparent_1px)] bg-[size:40px_40px]"
          aria-hidden="true"
        />
      </div>

      {/* ── TOP SURVEILLANCE FEED STATUS BAR ── */}
      <div className="absolute top-4 left-4 right-4 z-20 flex items-center justify-between pointer-events-none">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#040D1A]/90 border border-white/10 backdrop-blur-md">
          <span className="w-2 h-2 rounded-full bg-[#00D4A0] animate-pulse" />
          <span className="font-mono text-[10px] text-white/90 tracking-wider uppercase font-semibold">
            STATIC OPTICAL FEED · {meta.code}
          </span>
        </div>
        <div className="hidden sm:flex items-center gap-3 px-3 py-1.5 rounded-full bg-[#040D1A]/90 border border-white/10 backdrop-blur-md font-mono text-[10px] text-[#7ABBD4]">
          <span className="flex items-center gap-1">
            <MapPin size={12} className="text-[#00A8FF]" />
            {meta.coordinates}
          </span>
          <span>·</span>
          <span>{meta.elevation}</span>
        </div>
      </div>

      {/* ── CENTRAL AEROSPACE HUD FALLBACK CARD ── */}
      <div className="relative z-10 w-[94%] max-w-xl mx-auto my-auto p-5 sm:p-6 rounded-2xl bg-[#040D1A]/92 border border-amber-500/30 backdrop-blur-2xl shadow-[0_25px_60px_rgba(0,0,0,0.85)] flex flex-col gap-4 animate-in fade-in zoom-in-95 duration-300">
        {/* Header Ribbon */}
        <div className="flex items-start justify-between gap-3 pb-3 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center shrink-0 text-amber-400">
              <WarningCircle size={22} weight="duotone" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-[9px] uppercase tracking-widest text-amber-400 font-bold">
                  SYS // GPU FALLBACK
                </span>
                <span className="px-1.5 py-0.2 rounded font-mono text-[8px] uppercase bg-amber-400/20 text-amber-300 border border-amber-400/30">
                  2D SCADA MODE
                </span>
              </div>
              <h2 className="font-sans text-base sm:text-lg font-bold text-white tracking-tight mt-0.5">
                3D Rendering Unavailable on this Device
              </h2>
            </div>
          </div>
          <span className="font-mono text-[9px] text-[#4A7A8E] hidden sm:block">
            SAFE_RENDER_LOCK
          </span>
        </div>

        {/* Narrative Description */}
        <p className="text-xs sm:text-[13px] text-[#9CCADF] leading-relaxed">
          The 3D WebGL engine is unavailable on this device or GPU acceleration is restricted.
          To ensure uninterrupted mission monitoring, the digital twin is operating in{" "}
          <strong className="text-white font-semibold">High-Fidelity Photographic Telemetry</strong> mode.
        </p>

        {/* Station Live Telemetry Preview Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 font-mono text-xs">
          <div className="p-2 rounded-xl bg-white/[0.03] border border-white/[0.07] flex flex-col">
            <span className="text-[9px] text-[#4A7A8E] uppercase tracking-wider">Sector</span>
            <span className="text-xs font-bold text-white mt-0.5 truncate">{station}</span>
            <span className="text-[8px] text-[#00D4A0]">Operational</span>
          </div>
          <div className="p-2 rounded-xl bg-white/[0.03] border border-white/[0.07] flex flex-col">
            <span className="text-[9px] text-[#4A7A8E] uppercase tracking-wider">Amb. Temp</span>
            <span className="text-xs font-bold text-cyan-300 mt-0.5">{meta.temp}</span>
            <span className="text-[8px] text-[#4A7A8E]">Surface Sensor</span>
          </div>
          <div className="p-2 rounded-xl bg-white/[0.03] border border-white/[0.07] flex flex-col">
            <span className="text-[9px] text-[#4A7A8E] uppercase tracking-wider">Wind Speed</span>
            <span className="text-xs font-bold text-white mt-0.5">{meta.wind}</span>
            <span className="text-[8px] text-[#00D4A0]">Nominal</span>
          </div>
          <div className="p-2 rounded-xl bg-white/[0.03] border border-white/[0.07] flex flex-col">
            <span className="text-[9px] text-[#4A7A8E] uppercase tracking-wider">Power Grid</span>
            <span className="text-xs font-bold text-amber-300 mt-0.5">100% OK</span>
            <span className="text-[8px] text-amber-400/80">Continuous</span>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-white/10">
          <button
            onClick={handleRetry}
            disabled={isRetrying}
            className="flex-1 min-w-[170px] flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-mono text-xs font-bold uppercase tracking-wider transition-all bg-gradient-to-r from-[#00A8FF] to-[#0DB9D0] text-black hover:brightness-110 active:scale-95 shadow-[0_0_20px_rgba(0,168,255,0.4)] disabled:opacity-50"
          >
            <ArrowsClockwise
              size={15}
              weight="bold"
              className={isRetrying ? "animate-spin" : ""}
            />
            <span>{isRetrying ? "Reinitializing GPU..." : "Force Reload 3D Engine"}</span>
          </button>

          <Link
            href={meta.altLink}
            className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl font-mono text-xs font-semibold text-[#7ABBD4] hover:text-white bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 transition-colors whitespace-nowrap"
          >
            <Compass size={14} weight="duotone" className="text-[#00A8FF]" />
            <span>Switch to {meta.altStation}</span>
          </Link>

          {onOpenAICommander && (
            <button
              onClick={() => {
                polarAudio.playClickFeedback();
                onOpenAICommander();
              }}
              className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl font-mono text-xs font-semibold text-emerald-300 hover:text-white bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 transition-colors whitespace-nowrap"
            >
              <Sparkle size={14} weight="duotone" />
              <span>Ask Copilot</span>
            </button>
          )}

          <button
            onClick={() => setShowDiagnostics((prev) => !prev)}
            className="px-2.5 py-2.5 rounded-xl font-mono text-xs text-[#7ABBD4] hover:text-white bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 transition-colors"
            title="Toggle Technical Diagnostics"
          >
            <TerminalWindow size={15} />
          </button>
        </div>

        {/* Collapsible Technical Diagnostics Drawer */}
        {showDiagnostics && (
          <div className="p-3 rounded-xl bg-black/60 border border-white/10 font-mono text-[10px] text-[#7ABBD4] flex flex-col gap-2 animate-in fade-in duration-200">
            <div className="flex items-center justify-between text-white/80">
              <span className="font-bold flex items-center gap-1.5">
                <Cpu size={12} className="text-amber-400" />
                SYSTEM DIAGNOSTIC TRACE
              </span>
              <button
                onClick={handleCopyDiagnostics}
                className="flex items-center gap-1 px-2 py-0.5 rounded bg-white/10 hover:bg-white/20 text-white transition-colors"
              >
                {copied ? <Check size={11} className="text-emerald-400" /> : <ClipboardText size={11} />}
                <span>{copied ? "Copied" : "Copy Report"}</span>
              </button>
            </div>
            <div className="space-y-1 text-white/70 overflow-x-auto no-scrollbar max-h-28 overflow-y-auto pr-1">
              <p>
                <span className="text-[#4A7A8E]">Reason: </span>
                <span className="text-amber-300">{error || "WebGL context creation failed"}</span>
              </p>
              <p>
                <span className="text-[#4A7A8E]">Station: </span>
                <span>{meta.name} ({meta.code})</span>
              </p>
              <p>
                <span className="text-[#4A7A8E]">WebGL Standard: </span>
                <span>WebGL 2.0 / WebGL 1.0 (Unavailable or hardware blocked)</span>
              </p>
              <p>
                <span className="text-[#4A7A8E]">Platform: </span>
                <span className="truncate">{typeof navigator !== "undefined" ? navigator.userAgent : "N/A"}</span>
              </p>
            </div>
            <p className="text-[9px] text-[#4A7A8E] pt-1 border-t border-white/10">
              Tip: You can test this fallback mode anytime with <code className="text-cyan-300">?fallback=1</code> in the URL.
            </p>
          </div>
        )}

        {/* Guaranteed Telemetry Assurance Footnote */}
        <div className="flex items-center gap-2 pt-1 font-mono text-[10px] text-[#00D4A0]">
          <ShieldCheck size={14} weight="duotone" className="shrink-0" />
          <span>All telemetry docks, room sensor cards, and mission reports remain 100% active.</span>
        </div>
      </div>
    </div>
  );
}
