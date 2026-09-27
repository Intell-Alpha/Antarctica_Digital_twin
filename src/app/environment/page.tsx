"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  Wind,
  Thermometer,
  Compass,
  Sun,
  MoonStars,
  ShieldWarning,
  ArrowLeft,
  Gauge,
  Waves,
  Eye,
  CheckCircle,
} from "@phosphor-icons/react";
import { HudPanel } from "@/components/HudPanel";
import { HeartbeatDot } from "@/components/HeartbeatDot";
import { TelemetryValue } from "@/components/TelemetryValue";
import { TopographicBg } from "@/components/TopographicBg";
import { STATION_CONSTANTS, INITIAL_VITALS } from "@/lib/telemetry";

const BLIZZARD_CLASSES = [
  {
    tier: "CLASS 1: MODERATE GALE",
    wind: "35 – 50 kts",
    visibility: "< 1,000 m",
    guideline: "Station safety lifeline cables required between A-Block and Generator house. Solo transit restricted.",
    status: "ACTIVE CURRENT STATUS",
    color: "bg-[#F59E0B]/10 text-[#FCD34D] border-[#F59E0B]/30",
  },
  {
    tier: "CLASS 2: SEVERE BLIZZARD",
    wind: "50 – 75 kts",
    visibility: "< 100 m",
    guideline: "Complete outdoor transit suspended. All research masts locked. Powerhouse crew on continuous watch.",
    status: "STANDBY // ESCALATION WATCH",
    color: "bg-white/[0.03] text-[#94A3B8] border-white/[0.08]",
  },
  {
    tier: "CLASS 3: CATASTROPHIC STORM",
    wind: "> 75 kts (140+ km/h)",
    visibility: "Zero (Whiteout)",
    guideline: "Full emergency lockdown. Automatic load-shedding to Tier 1 life support only. Satellite antennas stowed.",
    status: "DORMANT",
    color: "bg-white/[0.02] text-[#64748B] border-white/[0.06]",
  },
];

export default function EnvironmentPage() {
  const easeEng = [0.32, 0.72, 0, 1] as const;

  return (
    <div className="relative min-h-screen w-full flex flex-col bg-[#06090E] text-[#F8FAFC] px-4 sm:px-6 lg:px-10 py-6 max-w-7xl mx-auto">
      <TopographicBg showRadarRings={false} />

      {/* ═══ BREADCRUMB & HEADER ═══ */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: easeEng }}
        className="bezel-shell p-1 mb-8 relative z-10"
      >
        <div className="bezel-core p-4 sm:p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link
              href="/dashboard"
              className="w-9 h-9 rounded-md bg-white/[0.03] hover:bg-white/[0.08] border border-white/[0.08] flex items-center justify-center transition-all text-[#94A3B8] hover:text-[#FFFFFF]"
              aria-label="Return to Twin Cockpit"
            >
              <ArrowLeft size={16} />
            </Link>
            <div>
              <div className="flex items-center gap-3">
                <span className="font-mono text-[10px] text-[#94A3B8] uppercase tracking-widest font-semibold px-2 py-0.5 rounded bg-white/[0.04] border border-white/[0.08]">
                  DOMAIN // 04
                </span>
                <HeartbeatDot size="sm" status="WATCH" label="KATABATIC GALE ACTIVE" />
              </div>
              <h1 className="font-headline text-2xl sm:text-3xl font-bold tracking-tight text-[#FFFFFF] mt-1">
                Environmental Stress & Meteorology
              </h1>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4 sm:gap-6 font-mono text-xs text-[#64748B]">
            <div className="px-3 py-1.5 rounded-md bg-[#06090E]/80 border border-white/[0.06]">
              TERRAIN: <span className="text-[#F8FAFC] font-semibold">Schirmacher Oasis</span>
            </div>
            <div className="px-3 py-1.5 rounded-md bg-[#06090E]/80 border border-white/[0.06]">
              ALTITUDE: <span className="text-[#F8FAFC] font-semibold">117 m ASL</span>
            </div>
            <div className="px-3 py-1.5 rounded-md bg-[#06090E]/80 border border-white/[0.06]">
              WIND CHILL: <span className="text-[#F59E0B] font-semibold">-46.8°C</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* ═══ SECTION 1: SCHIRMACHER METEOROLOGY INSTRUMENTATION ═══ */}
      <section className="mb-8 relative z-10">
        <HudPanel
          tag="// MET-STATION-01"
          title="Schirmacher Oasis AWS (Automated Weather Station)"
          subtitle="Microclimate sensors recording continental Antarctic wind shear, pressure trends, and radiative balance"
          status="LIVE"
          hoverEffect={false}
          className="p-6 md:p-8"
        >
          {/* Main Weather Gauges */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 p-4 rounded-lg bg-[#06090E]/90 border border-white/[0.06] mb-6">
            <div className="flex flex-col">
              <span className="text-[10px] font-mono text-[#64748B] uppercase">Ambient Temp</span>
              <TelemetryValue value={-28.4} unit="°C" size="md" isLive={true} />
              <span className="text-[9px] font-mono text-[#64748B] mt-0.5">2m mast level</span>
            </div>

            <div className="flex flex-col">
              <span className="text-[10px] font-mono text-[#64748B] uppercase">Katabatic Wind</span>
              <TelemetryValue value={48.6} unit="kts" size="md" status="WATCH" isLive={true} />
              <span className="text-[9px] font-mono text-[#F59E0B] mt-0.5">Gusts to 62 kts</span>
            </div>

            <div className="flex flex-col">
              <span className="text-[10px] font-mono text-[#64748B] uppercase">Wind Chill</span>
              <TelemetryValue value={-46.8} unit="°C" size="md" status="WATCH" isLive={true} />
              <span className="text-[9px] font-mono text-[#64748B] mt-0.5">Convective decay</span>
            </div>

            <div className="flex flex-col">
              <span className="text-[10px] font-mono text-[#64748B] uppercase">Barometer</span>
              <TelemetryValue value={986.2} unit="hPa" size="md" isLive={true} />
              <span className="text-[9px] font-mono text-[#F59E0B] mt-0.5">Falling -2.4 hPa/3h</span>
            </div>

            <div className="flex flex-col">
              <span className="text-[10px] font-mono text-[#64748B] uppercase">Relative Humidity</span>
              <TelemetryValue value={46} unit="%" size="md" isLive={true} />
              <span className="text-[9px] font-mono text-[#64748B] mt-0.5">Polar dry air</span>
            </div>

            <div className="flex flex-col">
              <span className="text-[10px] font-mono text-[#64748B] uppercase">Solar Irradiance</span>
              <TelemetryValue value={0.0} unit="W/m²" size="md" isLive={false} />
              <span className="text-[9px] font-mono text-[#64748B] mt-0.5">Polar Night (-14°)</span>
            </div>
          </div>

          {/* Meteorological Analysis & Wind Vector */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
            <div className="p-4 rounded-lg bg-[#06090E]/80 border border-white/[0.06] space-y-2">
              <span className="text-[#FFFFFF] font-semibold block mb-2 tracking-wide">
                KATABATIC DRAINAGE VECTOR (POLAR PLATEAU TO OCEAN)
              </span>
              <div className="flex justify-between py-1.5 border-b border-white/[0.06] text-[#64748B]">
                <span>PREVAILING AZIMUTH:</span>
                <span className="text-[#F8FAFC]">178° (South-South-East)</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-white/[0.06] text-[#64748B]">
                <span>PLATEAU INVERSION GRADIENT:</span>
                <span className="text-[#F8FAFC]">+8.4°C / 100m Inversion</span>
              </div>
              <div className="flex justify-between py-1.5 text-[#64748B]">
                <span>ESTIMATED BLIZZARD DURATION:</span>
                <span className="text-[#F59E0B] font-semibold">18 – 24 Hours</span>
              </div>
            </div>

            <div className="p-4 rounded-lg bg-[#06090E]/80 border border-white/[0.06] space-y-2">
              <span className="text-[#FFFFFF] font-semibold block mb-2 tracking-wide">
                STRATOSPHERIC OZONE & RADIATION SENSORS
              </span>
              <div className="flex justify-between py-1.5 border-b border-white/[0.06] text-[#64748B]">
                <span>TOTAL COLUMN OZONE:</span>
                <span className="text-[#F8FAFC]">142 Dobson Units (DU)</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-white/[0.06] text-[#64748B]">
                <span>POLAR VORTEX GEOMETRY:</span>
                <span className="text-[#F8FAFC]">Centered over Queen Maud Land</span>
              </div>
              <div className="flex justify-between py-1.5 text-[#64748B]">
                <span>GEOMAGNETIC RIOMETER NOISE:</span>
                <span className="text-[#10B981] font-semibold">Nominal 30 MHz Absorption</span>
              </div>
            </div>
          </div>
        </HudPanel>
      </section>

      {/* ═══ SECTION 2: KATABATIC BLIZZARD WARNING PROTOCOLS ═══ */}
      <section className="mb-8 relative z-10">
        <HudPanel
          tag="// PROTOCOL-BLIZZARD"
          title="Antarctic Gale & Blizzard Warning Classification"
          subtitle="Station standard operating procedure for exterior transit and equipment tie-downs"
          status="WATCH"
          hoverEffect={false}
        >
          <div className="space-y-3">
            {BLIZZARD_CLASSES.map((b) => (
              <div
                key={b.tier}
                className={`p-4 rounded-lg border flex flex-col md:flex-row md:items-center justify-between gap-4 font-mono text-xs ${b.color}`}
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-[#FFFFFF]">{b.tier}</span>
                    <span className="text-white/20">|</span>
                    <span className="text-[#F8FAFC] font-semibold">{b.wind}</span>
                    <span className="text-white/20">|</span>
                    <span className="text-[#94A3B8]">Vis: {b.visibility}</span>
                  </div>
                  <p className="text-[11px] text-[#94A3B8] font-body leading-relaxed">
                    {b.guideline}
                  </p>
                </div>

                <span className="text-[9px] font-bold px-2 py-1 rounded bg-[#06090E] border border-white/[0.08] tracking-wider shrink-0 uppercase">
                  {b.status}
                </span>
              </div>
            ))}
          </div>
        </HudPanel>
      </section>

      {/* ═══ SECTION 3: LAKE PRIYADARSHINI LIMNOLOGY & POLAR NIGHT TRACKER ═══ */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 relative z-10">
        {/* Lake Limnology */}
        <HudPanel
          tag="// LIMNO-01"
          title="Lake Priyadarshini Limnological Profile"
          subtitle="Continuous acoustic and thermal sensors through perennial freshwater ice cover"
          status="LIVE"
          hoverEffect={false}
        >
          <div className="space-y-4">
            <div className="p-4 rounded-lg bg-[#06090E]/90 border border-white/[0.06] flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono text-[#64748B] uppercase block">
                  Surface Ice Sheet Thickness
                </span>
                <TelemetryValue value={2.1} unit="meters" size="lg" isLive={true} />
              </div>
              <div className="text-right">
                <span className="text-[10px] font-mono text-[#64748B] uppercase block">
                  Intake Depth
                </span>
                <span className="font-mono text-sm font-semibold text-[#F8FAFC]">4.5 m (Liquid Pool)</span>
              </div>
            </div>

            <div className="space-y-2 font-mono text-xs text-[#64748B]">
              <div className="flex justify-between py-1.5 border-b border-white/[0.06]">
                <span>DISSOLVED OXYGEN:</span>
                <span className="text-[#10B981] font-semibold">13.8 mg/L (SUPERSATURATED)</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-white/[0.06]">
                <span>ELECTRICAL CONDUCTIVITY:</span>
                <span className="text-[#F8FAFC]">24 µS/cm (ULTRA-PURE FRESH)</span>
              </div>
              <div className="flex justify-between py-1.5">
                <span>SEDIMENT TRANSMISSION:</span>
                <span className="text-[#F8FAFC]">98.2% Optical Clarity</span>
              </div>
            </div>
          </div>
        </HudPanel>

        {/* Polar Night Ephemeris */}
        <HudPanel
          tag="// EPHEMERIS-01"
          title="Polar Night & Solar Ephemeris Tracker"
          subtitle="Schirmacher Oasis astronomical coordinates: 70°45′57″S"
          status="LIVE"
          hoverEffect={false}
        >
          <div className="space-y-4">
            <div className="p-4 rounded-lg bg-[#06090E]/90 border border-white/[0.06] flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono text-[#64748B] uppercase block">
                  Days Until First Sunrise
                </span>
                <TelemetryValue value={48} unit="Days" size="lg" isLive={false} />
              </div>
              <div className="text-right">
                <span className="text-[10px] font-mono text-[#64748B] uppercase block">
                  Solar Depression
                </span>
                <span className="font-mono text-sm font-semibold text-[#94A3B8]">-14.2° Below Horizon</span>
              </div>
            </div>

            <div className="space-y-2 font-mono text-xs text-[#64748B]">
              <div className="flex justify-between py-1.5 border-b border-white/[0.06]">
                <span>CURRENT LIGHT REGIME:</span>
                <span className="text-[#F8FAFC] font-semibold">CIVIL TWILIGHT (11:00-13:30 UTC)</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-white/[0.06]">
                <span>AURORA AUSTRALIS PROBABILITY:</span>
                <span className="text-[#10B981] font-semibold">HIGH (Kp Index: 4.8)</span>
              </div>
              <div className="flex justify-between py-1.5">
                <span>SUMMER SOLSTICE (24H SUN):</span>
                <span className="text-[#F8FAFC]">21 December 2026</span>
              </div>
            </div>
          </div>
        </HudPanel>
      </section>
    </div>
  );
}
