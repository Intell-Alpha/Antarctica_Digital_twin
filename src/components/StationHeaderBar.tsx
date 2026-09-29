"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  Compass,
  Cube,
  VideoCamera,
  GlobeHemisphereWest,
  FileText,
  Robot,
  Sliders,
  CaretLeft,
  CaretRight,
  X,
  ArrowsIn,
  ArrowsOut,
  ArrowsClockwise,
  SpeakerHigh,
  SpeakerSlash,
  Snowflake,
  Sun,
  Moon,
  Clock,
  Broadcast,
  ThermometerCold,
  Wind,
  Lightning,
  Sparkle,
  Fire,
} from "@phosphor-icons/react";
import { api, Station } from "@/lib/api";
import { polarAudio } from "@/lib/polarAudioEngine";
import { PolarAtmosphereSystem, PolarSeason } from "./PolarAtmosphereSystem";
import { StationOperationalPostureBar, StationOperationalPosture } from "./StationOperationalPostureBar";

interface StationHeaderBarProps {
  station: Station;
  activeRoom: { id: string; name: string; category: string } | null;
  onPrevRoom?: () => void;
  onNextRoom?: () => void;
  onExitRoom?: () => void;
  roofLifted?: boolean;
  onToggleRoofLift?: () => void;
  isRotating?: boolean;
  onToggleRotate?: () => void;
  atmosphereSystem: PolarAtmosphereSystem | null;
  onOpenOrbitalView: () => void;
  onOpenDossier: () => void;
  onOpenAICommander: () => void;
  onOpenSimulation: () => void;
  onResetOverview: () => void;
  enableFullscreenButton?: boolean;
  onStartDroneTour?: () => void;
  isDroneActive?: boolean;
  isBoilerHeatingActive?: boolean;
  onToggleBoilerHeating?: () => void;
  currentPosture?: StationOperationalPosture;
  onSelectPosture?: (posture: StationOperationalPosture) => void;
}

export function StationHeaderBar({
  station,
  activeRoom,
  onPrevRoom,
  onNextRoom,
  onExitRoom,
  roofLifted,
  onToggleRoofLift,
  isRotating,
  onToggleRotate,
  atmosphereSystem,
  onOpenOrbitalView,
  onOpenDossier,
  onOpenAICommander,
  onOpenSimulation,
  onResetOverview,
  enableFullscreenButton = true,
  onStartDroneTour,
  isDroneActive,
  isBoilerHeatingActive = false,
  onToggleBoilerHeating,
  currentPosture = "NOMINAL",
  onSelectPosture,
}: StationHeaderBarProps) {
  // Live Vitals State
  const [vitals, setVitals] = useState({
    tempC: station === "BHARATI" ? -13.6 : -9.8,
    windKmh: station === "BHARATI" ? 27.5 : 88.8,
    powerKw: station === "BHARATI" ? 147.0 : 142.0,
    satLatencyMs: 42,
    isLive: true,
  });

  // Soundscape State
  const [isMuted, setIsMuted] = useState(true);
  const [volume, setVolume] = useState(0.55);

  // Atmosphere Popover State
  const [isEnvMenuOpen, setIsEnvMenuOpen] = useState(false);
  const [isBlizzard, setIsBlizzard] = useState(false);
  const [solarHour, setSolarHour] = useState(14.0);
  const [season, setSeason] = useState<PolarSeason>("SUMMER");
  const [isAurora, setIsAurora] = useState(false);

  // Fullscreen state
  const [isFullscreen, setIsFullscreen] = useState(false);

  // UTC clock ticker
  const [utcTime, setUtcTime] = useState("");

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setUtcTime(
        `${String(now.getUTCHours()).padStart(2, "0")}:${String(now.getUTCMinutes()).padStart(2, "0")}:${String(
          now.getUTCSeconds()
        ).padStart(2, "0")} UTC`
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Poll vitals
  useEffect(() => {
    setIsMuted(polarAudio.getMuted());
    setVolume(polarAudio.getVolume());

    const fetchVitals = async () => {
      try {
        const [env, energy, net] = await Promise.all([
          api.getEnvironment(station),
          api.getEnergy(station),
          api.getNetwork(station),
        ]);
        setVitals({
          tempC: env.tempC,
          windKmh: env.windSpeedKmh,
          powerKw: energy.currentOutputKw,
          satLatencyMs: net.latencyMs,
          isLive: env.isLiveNcpor ?? true,
        });
      } catch (e) {
        // Fallback gracefully
      }
    };
    fetchVitals();
    const vitalsInterval = setInterval(fetchVitals, 15000);
    return () => clearInterval(vitalsInterval);
  }, [station]);

  const handleToggleAudio = () => {
    const nextMuted = polarAudio.toggleMute();
    setIsMuted(nextMuted);
    polarAudio.playClickFeedback();
  };

  const handleToggleBlizzard = () => {
    const next = !isBlizzard;
    setIsBlizzard(next);
    if (atmosphereSystem) {
      atmosphereSystem.setBlizzard(next);
      atmosphereSystem.setWindSpeed(next ? 105 : 28);
    }
    polarAudio.setBlizzard(next);
    polarAudio.playClickFeedback();
  };

  const handleToggleAurora = () => {
    const next = !isAurora;
    setIsAurora(next);
    if (atmosphereSystem) {
      if (next) {
        atmosphereSystem.setSolarHour(0.0);
        setSolarHour(0.0);
        atmosphereSystem.setAuroraIntensity(0.95);
      } else {
        atmosphereSystem.setSolarHour(14.0);
        setSolarHour(14.0);
        atmosphereSystem.setAuroraIntensity(0.1);
      }
    }
    polarAudio.playClickFeedback();
  };

  const handleSolarHourChange = (hour: number) => {
    setSolarHour(hour);
    if (atmosphereSystem) {
      atmosphereSystem.setSolarHour(hour);
    }
  };

  const handleToggleSeason = () => {
    const next = season === "SUMMER" ? "WINTER" : "SUMMER";
    setSeason(next);
    if (atmosphereSystem) {
      atmosphereSystem.setSeason(next);
    }
    polarAudio.playClickFeedback();
  };

  const toggleFullscreen = () => {
    if (typeof document === "undefined") return;
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  const hourInt = Math.floor(solarHour);
  const minuteInt = Math.floor((solarHour - hourInt) * 60);
  const solarTimeFormatted = `${String(hourInt).padStart(2, "0")}:${String(minuteInt).padStart(2, "0")}`;

  return (
    <>
      {/* ── 1. UNIFIED POLAR COMMAND HEADER STRIP ── */}
      <header className="absolute top-0 left-0 right-0 z-30 pointer-events-auto h-13 px-3 sm:px-5 flex items-center justify-between bg-[#040812]/92 border-b border-white/[0.08] backdrop-blur-2xl select-none">
        
        {/* LEFT WING: Station Identity & Switcher */}
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-[#7ABBD4] hover:text-white border border-white/[0.06] transition-colors"
            title="Return to Home Portal"
          >
            <span className="font-mono text-[10px] font-bold text-[#0DB9D0]">ANTARCTICA</span>
          </Link>

          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#0DB9D0]" />
            <span className="font-mono text-xs font-bold tracking-widest text-white uppercase">
              {station}
            </span>
            <span className="text-white/20 font-mono text-[10px]">·</span>
            <span className="hidden lg:inline font-mono text-[10px] text-[#7ABBD4]">
              {station === "BHARATI" ? "69°24′S 76°11′E" : "70°45′S 11°44′E"}
            </span>
          </div>

          {/* Clean Segmented Station Switcher */}
          <nav className="flex items-center bg-white/[0.04] p-0.5 rounded-lg border border-white/[0.06] font-mono text-[10px]">
            <Link
              href="/twin?station=bharati"
              className={`px-2.5 py-0.5 rounded-md transition-colors ${
                station === "BHARATI"
                  ? "bg-white/15 text-white font-semibold shadow-sm"
                  : "text-[#7ABBD4] hover:text-white"
              }`}
            >
              Bharati
            </Link>
            <Link
              href="/twin?station=maitri"
              className={`px-2.5 py-0.5 rounded-md transition-colors ${
                station === "MAITRI"
                  ? "bg-white/15 text-white font-semibold shadow-sm"
                  : "text-[#7ABBD4] hover:text-white"
              }`}
            >
              Maitri
            </Link>
          </nav>

          {/* Active Room Sub-Pill (if inspecting an interior facility) */}
          {activeRoom && (
            <div className="hidden md:flex items-center gap-1.5 pl-2 border-l border-white/10 font-mono text-[11px]">
              <span className="text-[#0DB9D0] truncate max-w-[160px] font-semibold">{activeRoom.name}</span>
              <div className="flex items-center gap-0.5">
                {onPrevRoom && (
                  <button
                    onClick={onPrevRoom}
                    className="p-1 rounded text-[#7ABBD4] hover:text-white hover:bg-white/10"
                    title="Previous Room"
                  >
                    <CaretLeft size={11} weight="bold" />
                  </button>
                )}
                {onNextRoom && (
                  <button
                    onClick={onNextRoom}
                    className="p-1 rounded text-[#7ABBD4] hover:text-white hover:bg-white/10"
                    title="Next Room"
                  >
                    <CaretRight size={11} weight="bold" />
                  </button>
                )}
                {onExitRoom && (
                  <button
                    onClick={onExitRoom}
                    className="p-1 rounded text-[#7ABBD4] hover:text-rose-400 hover:bg-white/10 ml-1"
                    title="Exit to Overview"
                  >
                    <X size={11} weight="bold" />
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* CENTER STRIP: Restrained Industrial Telemetry Readout */}
        <div className="hidden xl:flex items-center gap-4 font-mono text-[11px] text-[#A6C4D6]">
          <span className="text-white/40">{utcTime}</span>
          <span className="text-white/10">|</span>

          {/* Temp */}
          <div className="flex items-center gap-1.5">
            <ThermometerCold size={13} className="text-[#00A8FF]" />
            <span className="text-white font-semibold">{vitals.tempC}°C</span>
          </div>

          {/* Wind */}
          <div className="flex items-center gap-1.5">
            <Wind size={13} className="text-[#00D4A0]" />
            <span className="text-white font-semibold">{vitals.windKmh} km/h</span>
          </div>

          {/* Microgrid Load */}
          <div className="flex items-center gap-1.5">
            <Lightning size={13} className="text-[#FFAA00]" />
            <span className="text-white font-semibold">{vitals.powerKw} kW</span>
          </div>

          {/* Satcom */}
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#00D4A0]" />
            <span className="text-[#7ABBD4]">GSAT {vitals.satLatencyMs}ms</span>
          </div>
        </div>

        {/* RIGHT WING: Precision Tool Group */}
        <div className="flex items-center gap-1.5">

          {/* Station Operational Posture Directive Bar (Remote Management) */}
          {onSelectPosture && (
            <StationOperationalPostureBar
              station={station}
              currentPosture={currentPosture}
              onSelectPosture={onSelectPosture}
            />
          )}
          
          {/* 1. Environment & Atmosphere Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsEnvMenuOpen(!isEnvMenuOpen)}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border font-mono text-xs transition-colors ${
                isEnvMenuOpen || isBlizzard || isAurora
                  ? "bg-white/15 text-white border-white/20"
                  : "bg-white/[0.03] hover:bg-white/[0.08] text-[#A6C4D6] hover:text-white border-white/[0.08]"
              }`}
              title="Atmosphere, Solar Arc, Audio & Weather Settings"
            >
              <Clock size={14} className="text-[#FFAA00]" />
              <span className="hidden sm:inline text-[11px]">{solarTimeFormatted}</span>
            </button>

            {/* Atmosphere Popover */}
            {isEnvMenuOpen && (
              <div className="absolute right-0 top-full mt-2 w-72 p-3.5 rounded-2xl bg-[#060D1A]/98 border border-white/15 backdrop-blur-3xl shadow-2xl flex flex-col gap-3 z-50 animate-in fade-in zoom-in-95 duration-150">
                <div className="flex items-center justify-between pb-2 border-b border-white/10 font-mono text-xs font-semibold text-white">
                  <span>Polar Atmosphere & Time</span>
                  <button onClick={() => setIsEnvMenuOpen(false)} className="text-[#7ABBD4] hover:text-white">
                    <X size={14} />
                  </button>
                </div>

                {/* 24h Solar Time Slider */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between font-mono text-[10px] text-[#7ABBD4]">
                    <span>Solar Arc</span>
                    <span className="text-white font-bold">{solarTimeFormatted}</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="24"
                    step="0.25"
                    value={solarHour}
                    onChange={(e) => handleSolarHourChange(parseFloat(e.target.value))}
                    className="w-full accent-[#FFAA00] h-1.5 bg-white/15 rounded-lg cursor-pointer"
                  />
                  <div className="flex justify-between font-mono text-[8px] text-[#4A7A8E]">
                    <span>00:00 (Midnight)</span>
                    <span>12:00</span>
                    <span>24:00</span>
                  </div>
                </div>

                {/* Quick Weather Toggles */}
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <button
                    onClick={handleToggleBlizzard}
                    className={`flex items-center justify-center gap-1.5 p-2 rounded-xl border font-mono text-[10px] uppercase font-semibold transition-all ${
                      isBlizzard
                        ? "bg-cyan-500/20 text-cyan-200 border-cyan-400/50"
                        : "bg-white/[0.03] text-[#7ABBD4] border-white/10 hover:text-white"
                    }`}
                  >
                    <Snowflake size={13} weight={isBlizzard ? "fill" : "regular"} />
                    <span>{isBlizzard ? "Blizzard ON" : "Blizzard"}</span>
                  </button>

                  <button
                    onClick={handleToggleAurora}
                    className={`flex items-center justify-center gap-1.5 p-2 rounded-xl border font-mono text-[10px] uppercase font-semibold transition-all ${
                      isAurora
                        ? "bg-purple-500/20 text-purple-200 border-purple-400/50"
                        : "bg-white/[0.03] text-[#7ABBD4] border-white/10 hover:text-white"
                    }`}
                  >
                    <Sparkle size={13} weight={isAurora ? "fill" : "regular"} />
                    <span>Aurora</span>
                  </button>
                </div>

                {/* Audio & Season */}
                <div className="flex items-center justify-between pt-2 border-t border-white/10">
                  <button
                    onClick={handleToggleAudio}
                    className="flex items-center gap-1.5 text-xs text-[#7ABBD4] hover:text-white"
                  >
                    {isMuted ? <SpeakerSlash size={14} /> : <SpeakerHigh size={14} className="text-[#0DB9D0]" />}
                    <span className="font-mono text-[10px]">{isMuted ? "Sound: Muted" : "Sound: On"}</span>
                  </button>

                  <button
                    onClick={handleToggleSeason}
                    className="flex items-center gap-1 px-2 py-0.5 rounded bg-white/10 text-white font-mono text-[9px] uppercase font-semibold"
                  >
                    {season === "SUMMER" ? "Summer (Midnight Sun)" : "Winter (Polar Night)"}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* 2. ISRO Orbital Satellite Map */}
          <button
            onClick={onOpenOrbitalView}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white/[0.03] hover:bg-white/[0.08] text-[#A6C4D6] hover:text-white border border-white/[0.08] font-mono text-[11px] transition-colors"
            title="Open ISRO GSAT Continental Orbit & Antarctic Map"
          >
            <GlobeHemisphereWest size={14} className="text-[#00A8FF]" />
            <span className="hidden md:inline">Orbital Map</span>
          </button>

          {/* 3. ATCM Mission Readiness Dossier */}
          <button
            onClick={onOpenDossier}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white/[0.03] hover:bg-white/[0.08] text-[#A6C4D6] hover:text-white border border-white/[0.08] font-mono text-[11px] transition-colors"
            title="Open Official NCPOR & ATCM Environmental Compliance Dossier"
          >
            <FileText size={14} className="text-[#00D4A0]" />
            <span className="hidden md:inline">Dossier</span>
          </button>

          {/* 3b. Hydronic Boiler Room Heating (Top-Down Flow) */}
          {onToggleBoilerHeating && (
            <button
              onClick={onToggleBoilerHeating}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border font-mono text-[11px] transition-all ${
                isBoilerHeatingActive
                  ? "bg-amber-500/25 text-amber-300 border-amber-400/60 shadow-[0_0_16px_rgba(255,107,0,0.35)]"
                  : "bg-white/[0.03] hover:bg-white/[0.08] text-[#A6C4D6] hover:text-white border-white/[0.08]"
              }`}
              title={isBoilerHeatingActive ? "Exit Top-Down Boiler Heating View" : "View Boiler Hydronic Room Heating (Top-Down Orange Flow)"}
            >
              <Fire size={14} className={isBoilerHeatingActive ? "text-[#FF7700] animate-pulse" : "text-[#FFAA00]"} weight={isBoilerHeatingActive ? "fill" : "regular"} />
              <span className="hidden md:inline">Heating Flow</span>
              {isBoilerHeatingActive && (
                <span className="w-1.5 h-1.5 rounded-full bg-[#FF7700] animate-ping" />
              )}
            </button>
          )}

          {/* 4. Roof Lift (For interior exploration) */}
          {onToggleRoofLift && (
            <button
              onClick={onToggleRoofLift}
              className={`p-1.5 rounded-lg border transition-colors ${
                roofLifted
                  ? "bg-rose-500/20 text-rose-300 border-rose-500/40"
                  : "bg-white/[0.03] hover:bg-white/[0.08] text-[#A6C4D6] hover:text-white border-white/[0.08]"
              }`}
              title={roofLifted ? "Restore Roof Skin" : "Remove Roof (X-Ray Interior)"}
            >
              <Cube size={14} weight={roofLifted ? "fill" : "regular"} />
            </button>
          )}

          {/* 4b. Autonomous 4K Drone Survey */}
          {onStartDroneTour && (
            <button
              onClick={onStartDroneTour}
              className={`p-1.5 rounded-lg border transition-colors ${
                isDroneActive
                  ? "bg-rose-500/20 text-rose-300 border-rose-500/40"
                  : "bg-white/[0.03] hover:bg-white/[0.08] text-[#A6C4D6] hover:text-white border-white/[0.08]"
              }`}
              title="Launch Autonomous 4K Drone Survey (Press D)"
            >
              <VideoCamera size={14} weight={isDroneActive ? "fill" : "regular"} />
            </button>
          )}

          {/* 5. What-If Simulator Trigger */}
          <button
            onClick={onOpenSimulation}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white/[0.03] hover:bg-white/[0.08] text-[#A6C4D6] hover:text-white border border-white/[0.08] font-mono text-[11px] transition-colors"
            title="Run Station Crisis Simulator (Generator failure, Blizzard, Blackout)"
          >
            <Lightning size={14} className="text-[#FFAA00]" />
            <span className="hidden md:inline">Simulate</span>
          </button>

          {/* 6. AI Commander Launcher */}
          <button
            onClick={onOpenAICommander}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[#0DB9D0]/15 hover:bg-[#0DB9D0]/25 text-[#0DB9D0] border border-[#0DB9D0]/30 font-mono text-[11px] font-semibold transition-colors"
            title="Open Himadri AI Copilot (Press / or ⌘K)"
          >
            <Robot size={14} weight="fill" />
            <span className="hidden sm:inline">AI Copilot</span>
            <kbd className="hidden lg:inline text-[9px] bg-white/10 px-1 py-0.2 rounded text-white/60 font-mono">
              /
            </kbd>
          </button>

          {/* 7. Overview Reset Button */}
          <button
            onClick={onResetOverview}
            className="p-1.5 rounded-lg bg-white/[0.03] hover:bg-white/[0.08] text-[#A6C4D6] hover:text-white border border-white/[0.08] transition-colors"
            title="Reset Camera to Campus Overview"
          >
            <Compass size={14} />
          </button>

          {/* 8. Fullscreen Toggle */}
          {enableFullscreenButton && (
            <button
              onClick={toggleFullscreen}
              className="p-1.5 rounded-lg bg-white/[0.03] hover:bg-white/[0.08] text-[#A6C4D6] hover:text-white border border-white/[0.08] transition-colors"
              title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
            >
              {isFullscreen ? <ArrowsIn size={14} /> : <ArrowsOut size={14} />}
            </button>
          )}
        </div>
      </header>

      {/* ── 2. FROST VIGNETTE OVERLAY (ONLY DURING BLIZZARD) ── */}
      {isBlizzard && (
        <div className="fixed inset-0 pointer-events-none z-20 select-none overflow-hidden animate-in fade-in duration-700">
          <div
            className="absolute inset-0"
            style={{
              background:
                "radial-gradient(ellipse at center, transparent 45%, rgba(180, 220, 250, 0.15) 75%, rgba(180, 220, 250, 0.4) 100%)",
              mixBlendMode: "screen",
            }}
          />
          <div className="absolute top-16 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-400/40 font-mono text-[10px] text-cyan-200 shadow-lg">
            KATABATIC SQUALL ALERT · 105 KM/H WHITEOUT
          </div>
        </div>
      )}
    </>
  );
}
