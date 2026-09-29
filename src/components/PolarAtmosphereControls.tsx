"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  SpeakerHigh,
  SpeakerSlash,
  Snowflake,
  Sparkle,
  Sun,
  Moon,
  Clock,
  Wind,
  Sliders,
  CaretDown,
} from "@phosphor-icons/react";
import { polarAudio } from "@/lib/polarAudioEngine";
import { PolarAtmosphereSystem, PolarSeason } from "./PolarAtmosphereSystem";

interface PolarAtmosphereControlsProps {
  atmosphereSystem: PolarAtmosphereSystem | null;
  onBlizzardChange?: (isBlizzard: boolean) => void;
  className?: string;
}

export function PolarAtmosphereControls({
  atmosphereSystem,
  onBlizzardChange,
  className = "",
}: PolarAtmosphereControlsProps) {
  // Audio State
  const [isMuted, setIsMuted] = useState(true);
  const [volume, setVolume] = useState(0.55);
  const [showVolumeSlider, setShowVolumeSlider] = useState(false);

  // Atmosphere State
  const [isBlizzard, setIsBlizzard] = useState(false);
  const [solarHour, setSolarHour] = useState(14.0); // 2:00 PM
  const [season, setSeason] = useState<PolarSeason>("SUMMER");
  const [isAuroraForced, setIsAuroraForced] = useState(false);
  const [showTimePanel, setShowTimePanel] = useState(false);

  useEffect(() => {
    setIsMuted(polarAudio.getMuted());
    setVolume(polarAudio.getVolume());
  }, []);

  const handleToggleAudio = () => {
    const nextMuted = polarAudio.toggleMute();
    setIsMuted(nextMuted);
    polarAudio.playClickFeedback();
  };

  const handleVolumeChange = (newVol: number) => {
    setVolume(newVol);
    polarAudio.setVolume(newVol);
  };

  const handleToggleBlizzard = () => {
    const next = !isBlizzard;
    setIsBlizzard(next);
    if (atmosphereSystem) {
      atmosphereSystem.setBlizzard(next);
      if (next) {
        atmosphereSystem.setWindSpeed(105);
      } else {
        atmosphereSystem.setWindSpeed(28);
      }
    }
    polarAudio.setBlizzard(next);
    polarAudio.playClickFeedback();
    if (onBlizzardChange) onBlizzardChange(next);
  };

  const handleSolarHourChange = (newHour: number) => {
    setSolarHour(newHour);
    if (atmosphereSystem) {
      atmosphereSystem.setSolarHour(newHour);
    }
  };

  const handleToggleSeason = () => {
    const nextSeason = season === "SUMMER" ? "WINTER" : "SUMMER";
    setSeason(nextSeason);
    if (atmosphereSystem) {
      atmosphereSystem.setSeason(nextSeason);
    }
    polarAudio.playClickFeedback();
  };

  const handleToggleAurora = () => {
    const next = !isAuroraForced;
    setIsAuroraForced(next);
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

  // Format hour into 24h digital format
  const hourInt = Math.floor(solarHour);
  const minuteInt = Math.floor((solarHour - hourInt) * 60);
  const timeFormatted = `${String(hourInt).padStart(2, "0")}:${String(minuteInt).padStart(2, "0")}`;

  return (
    <>
      {/* ── 1. PROCEDURAL SCREEN FROST VIGNETTE (TRIGGERED ON BLIZZARD) ── */}
      {isBlizzard && (
        <div className="fixed inset-0 pointer-events-none z-20 animate-in fade-in duration-700 select-none overflow-hidden">
          {/* Radial Ice Frost Edge Vignette */}
          <div
            className="absolute inset-0"
            style={{
              background:
                "radial-gradient(ellipse at center, transparent 40%, rgba(200, 235, 255, 0.12) 75%, rgba(180, 220, 250, 0.45) 100%)",
              mixBlendMode: "screen",
            }}
          />
          {/* Top and Bottom Ice Rime Texture */}
          <div className="absolute top-0 left-0 right-0 h-16 bg-gradient-to-b from-white/20 via-white/5 to-transparent backdrop-blur-[1px]" />
          <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-white/25 via-white/5 to-transparent backdrop-blur-[1px]" />

          {/* Extreme Katabatic Squall Notification Watermark */}
          <div className="absolute top-24 left-1/2 -translate-x-1/2 flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-400/40 backdrop-blur-md font-mono text-[10px] text-cyan-200 shadow-[0_0_20px_rgba(6,182,212,0.4)] animate-pulse">
            <Wind size={13} className="text-cyan-400 animate-spin" />
            <span>KATABATIC SQUALL ALERT · 105 KM/H WHITEOUT ACTIVE</span>
          </div>
        </div>
      )}

      {/* ── 2. DOUBLE-BEZEL FLOATING ATMOSPHERE CONTROLS BAR ── */}
      <div
        className={`pointer-events-auto flex items-center gap-1.5 p-1 rounded-2xl bg-[#040D1A]/90 border border-white/10 backdrop-blur-2xl shadow-2xl select-none ${className}`}
      >
        {/* Audio Mute / Unmute & Volume Hover Popup */}
        <div
          className="relative"
          onMouseEnter={() => setShowVolumeSlider(true)}
          onMouseLeave={() => setShowVolumeSlider(false)}
        >
          <button
            onClick={handleToggleAudio}
            className={`p-2 rounded-xl transition-all flex items-center gap-1 ${
              !isMuted
                ? "bg-[#0DB9D0]/20 text-[#0DB9D0] border border-[#0DB9D0]/40 shadow-[0_0_12px_rgba(13,185,208,0.3)]"
                : "text-[#7ABBD4] hover:text-white hover:bg-white/10"
            }`}
            title={isMuted ? "Unmute Polar Soundscape (Wind, Generators, Satcom)" : "Mute Soundscape"}
          >
            {isMuted ? (
              <SpeakerSlash size={16} weight="duotone" />
            ) : (
              <SpeakerHigh size={16} weight="duotone" className="animate-pulse" />
            )}
          </button>

          {/* Volume Slider Popover on Hover */}
          {showVolumeSlider && !isMuted && (
            <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 p-2.5 rounded-xl bg-[#040D1A]/95 border border-white/15 backdrop-blur-2xl shadow-2xl flex flex-col items-center gap-2 z-50 w-28 animate-in fade-in duration-150">
              <span className="font-mono text-[9px] uppercase tracking-wider text-[#7ABBD4]">
                Vol: {Math.round(volume * 100)}%
              </span>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={volume}
                onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                className="w-full accent-[#0DB9D0] cursor-pointer h-1.5 bg-white/20 rounded-lg"
              />
            </div>
          )}
        </div>

        {/* Blizzard / Katabatic Squall Toggle */}
        <button
          onClick={handleToggleBlizzard}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl font-mono text-[11px] font-semibold transition-all border ${
            isBlizzard
              ? "bg-cyan-500/25 text-cyan-200 border-cyan-400/60 shadow-[0_0_16px_rgba(6,182,212,0.4)]"
              : "text-[#7ABBD4] hover:text-white border-transparent hover:bg-white/10"
          }`}
          title="Toggle 105 km/h Katabatic Blizzard & Whiteout Simulation"
        >
          <Snowflake
            size={15}
            weight={isBlizzard ? "fill" : "duotone"}
            className={isBlizzard ? "animate-spin text-cyan-300" : ""}
          />
          <span className="hidden sm:inline uppercase tracking-wider">
            {isBlizzard ? "Blizzard ON" : "Blizzard"}
          </span>
        </button>

        {/* Aurora Australis Toggle */}
        <button
          onClick={handleToggleAurora}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl font-mono text-[11px] font-semibold transition-all border ${
            isAuroraForced
              ? "bg-[#8a2be2]/30 text-[#e9d5ff] border-[#c084fc]/50 shadow-[0_0_16px_rgba(168,85,247,0.4)]"
              : "text-[#7ABBD4] hover:text-white border-transparent hover:bg-white/10"
          }`}
          title="Toggle Aurora Australis (Southern Lights) Sky Curtains"
        >
          <Sparkle
            size={15}
            weight="fill"
            className={isAuroraForced ? "text-[#c084fc] animate-pulse" : "text-[#7ABBD4]"}
          />
          <span className="hidden sm:inline uppercase tracking-wider">Aurora</span>
        </button>

        {/* 24-Hour Polar Solar Arc Dropdown / Slider Trigger */}
        <div className="relative">
          <button
            onClick={() => setShowTimePanel(!showTimePanel)}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl font-mono text-[11px] font-semibold transition-all border ${
              showTimePanel
                ? "bg-white/15 text-white border-white/20"
                : "text-[#7ABBD4] hover:text-white border-transparent hover:bg-white/10"
            }`}
            title="Adjust 24-Hour Polar Solar Arc (Midnight Sun & Polar Night)"
          >
            <Clock size={15} weight="duotone" className="text-[#FFAA00]" />
            <span className="text-white font-mono">{timeFormatted}</span>
            <CaretDown size={12} />
          </button>

          {/* Expandable 24-Hour Solar Time Popover */}
          {showTimePanel && (
            <div className="absolute top-full mt-2 right-0 p-3.5 rounded-2xl bg-[#040D1A]/96 border border-white/15 backdrop-blur-3xl shadow-[0_20px_50px_rgba(0,0,0,0.9)] flex flex-col gap-3 z-50 w-72 animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="flex items-center justify-between pb-1.5 border-b border-white/10">
                <span className="font-mono text-[10px] uppercase tracking-wider text-[#FFAA00] font-bold">
                  24h Antarctic Solar Arc
                </span>
                <span className="font-mono text-xs font-bold text-white bg-white/10 px-2 py-0.5 rounded-md">
                  {timeFormatted}
                </span>
              </div>

              {/* Slider for Time of Day */}
              <div className="space-y-1">
                <div className="flex justify-between font-mono text-[9px] text-[#7ABBD4]">
                  <span>00:00 (Midnight)</span>
                  <span>12:00 (Noon)</span>
                  <span>24:00</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="24"
                  step="0.25"
                  value={solarHour}
                  onChange={(e) => handleSolarHourChange(parseFloat(e.target.value))}
                  className="w-full accent-[#FFAA00] cursor-pointer h-2 bg-white/15 rounded-lg"
                />
              </div>

              {/* Polar Phenomenon Status Badge */}
              <div className="p-2 rounded-xl bg-white/[0.03] border border-white/10 font-mono text-[10px] text-[#A6C4D6]">
                <div className="flex items-center justify-between">
                  <span className="text-[#7ABBD4]">Phenomenon:</span>
                  <span className="font-semibold text-white">
                    {season === "SUMMER"
                      ? solarHour < 4 || solarHour > 20
                        ? "Midnight Sun (Golden Horizon)"
                        : "Full Polar Daylight"
                      : solarHour >= 11 && solarHour <= 14
                      ? "Polar Twilight"
                      : "Complete Polar Night"}
                  </span>
                </div>
              </div>

              {/* Season Toggle: Summer (Midnight Sun) vs Winter (Polar Night) */}
              <div className="flex items-center justify-between pt-1 border-t border-white/10">
                <span className="font-mono text-[10px] text-[#7ABBD4]">Season:</span>
                <button
                  onClick={handleToggleSeason}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-mono text-[10px] font-semibold uppercase bg-white/10 hover:bg-white/20 text-white transition-colors"
                >
                  {season === "SUMMER" ? (
                    <>
                      <Sun size={12} weight="fill" className="text-[#FFAA00]" />
                      <span>Summer (Dec-Feb)</span>
                    </>
                  ) : (
                    <>
                      <Moon size={12} weight="fill" className="text-[#c084fc]" />
                      <span>Winter (Jun-Aug)</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
