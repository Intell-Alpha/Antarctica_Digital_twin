"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Lightning,
  Waves,
  House,
  BatteryCharging,
  WifiHigh,
  Crosshair,
  ArrowUpRight,
} from "@phosphor-icons/react";
import { HeartbeatDot } from "@/components/HeartbeatDot";
import { TelemetryValue } from "@/components/TelemetryValue";
import { DraggablePanel } from "./DraggablePanel";
import Link from "next/link";

interface StationNode {
  id: string;
  label: string;
  sub: string;
  tag: string;
  x: number; // percentage
  y: number; // percentage
  icon: any;
  val: string;
  unit: string;
  status: "LIVE" | "WATCH" | "NORMAL";
  desc: string;
  href: string;
}

const NODES: StationNode[] = [
  {
    id: "gen",
    label: "Main Powerhouse",
    sub: "Kirloskar HA694 Array",
    tag: "SYS-01",
    x: 48,
    y: 44,
    icon: Lightning,
    val: "44.8",
    unit: "kW",
    status: "LIVE",
    desc: "Gen-01 (Ravi) active at 74% load. 415.2V @ 50.04 Hz.",
    href: "/energy",
  },
  {
    id: "lake",
    label: "Lake Priyadarshini Line",
    sub: "2.5 km Trace-Heated",
    tag: "SYS-02",
    x: 26,
    y: 28,
    icon: Waves,
    val: "+1.4",
    unit: "°C",
    status: "WATCH",
    desc: "Intake clear. Trace-heat circuit B under watch (-12% draw).",
    href: "/infrastructure",
  },
  {
    id: "habitat",
    label: "Habitat Modules",
    sub: "A-Block Living Quarters",
    tag: "SYS-03",
    x: 68,
    y: 36,
    icon: House,
    val: "23",
    unit: "Crew",
    status: "LIVE",
    desc: "Indoor climate: +21.2°C, 38% RH, 460 ppm CO2.",
    href: "/infrastructure",
  },
  {
    id: "fuel",
    label: "Arctic Fuel Farm",
    sub: "Bulk Jet A-1 Depot",
    tag: "SYS-04",
    x: 74,
    y: 68,
    icon: BatteryCharging,
    val: "84,620",
    unit: "L",
    status: "LIVE",
    desc: "142 days remaining winter autonomy at 412 L/day.",
    href: "/logistics",
  },
  {
    id: "satcom",
    label: "ISRO Ground Gateway",
    sub: "INSAT-3DR Geostationary",
    tag: "SYS-05",
    x: 32,
    y: 72,
    icon: WifiHigh,
    val: "512",
    unit: "kbps",
    status: "LIVE",
    desc: "Carrier SNR: 18.4 dB. Zero packet drop to mainland NOC.",
    href: "/network",
  },
];

export function PolarRadarScope() {
  const [activeNode, setActiveNode] = useState<StationNode>(NODES[0]);

  return (
    <DraggablePanel className="w-full max-w-[560px] mx-auto">
      <div className="relative w-full aspect-square max-w-[560px] mx-auto select-none flex items-center justify-center">
      {/* Outer Tactical Glow Rings */}
      <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-[#4FD1FF]/[0.08] via-transparent to-[#39FF88]/[0.04] blur-2xl pointer-events-none" />

      {/* Main Radar Frame Shell */}
      <div className="relative w-full h-full rounded-full border border-white/10 bg-[#0F1620]/60 backdrop-blur-2xl shadow-[0_0_50px_rgba(0,0,0,0.8),inset_0_1px_1px_rgba(255,255,255,0.1)] p-4 flex items-center justify-center overflow-hidden group">
        
        {/* Radar Concentric Rings */}
        <div className="absolute inset-4 rounded-full border border-white/[0.06]" />
        <div className="absolute inset-16 rounded-full border border-[#4FD1FF]/10 border-dashed" />
        <div className="absolute inset-32 rounded-full border border-white/[0.06]" />
        <div className="absolute inset-48 rounded-full border border-[#4FD1FF]/15" />
        <div className="absolute w-4 h-4 rounded-full bg-[#4FD1FF]/20 border border-[#4FD1FF]/40 flex items-center justify-center">
          <span className="w-1.5 h-1.5 rounded-full bg-[#4FD1FF]" />
        </div>

        {/* Polar Crosshairs (Azimuth & Elevation lines) */}
        <div className="absolute inset-x-0 top-1/2 h-px bg-gradient-to-r from-transparent via-[#4FD1FF]/20 to-transparent" />
        <div className="absolute inset-y-0 left-1/2 w-px bg-gradient-to-b from-transparent via-[#4FD1FF]/20 to-transparent" />
        
        {/* Diagonal Cardinal Ticks */}
        <div className="absolute inset-x-0 top-1/2 h-px bg-white/[0.04] rotate-45" />
        <div className="absolute inset-x-0 top-1/2 h-px bg-white/[0.04] -rotate-45" />

        {/* Continuous 360° Rotating Radar Sweep */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
          className="absolute inset-0 pointer-events-none"
        >
          {/* Radial line */}
          <div className="absolute top-0 left-1/2 w-px h-1/2 bg-gradient-to-b from-[#4FD1FF] to-transparent origin-bottom" />
          {/* Glowing radar sweep wedge */}
          <div className="absolute top-0 right-1/2 w-1/2 h-1/2 origin-bottom-right bg-[conic-gradient(from_0deg_at_100%_100%,rgba(79,209,255,0.18)_0deg,transparent_60deg)]" />
        </motion.div>

        {/* Topographic Background Faint Curves inside Radar */}
        <svg
          className="absolute inset-0 w-full h-full opacity-10 pointer-events-none"
          viewBox="0 0 400 400"
          fill="none"
        >
          <ellipse cx="200" cy="180" rx="140" ry="70" stroke="#4FD1FF" strokeWidth="0.8" />
          <ellipse cx="200" cy="180" rx="100" ry="50" stroke="#4FD1FF" strokeWidth="0.8" strokeDasharray="3 3" />
          <ellipse cx="200" cy="180" rx="60" ry="30" stroke="#4FD1FF" strokeWidth="0.8" />
        </svg>

        {/* Cardinal Direction Ticks */}
        <span className="absolute top-2 left-1/2 -translate-x-1/2 font-mono text-[9px] text-[#7C8B99] tracking-widest">
          000° N (OCEAN)
        </span>
        <span className="absolute bottom-2 left-1/2 -translate-x-1/2 font-mono text-[9px] text-[#7C8B99] tracking-widest">
          180° S (PLATEAU)
        </span>
        <span className="absolute left-2 top-1/2 -translate-y-1/2 font-mono text-[9px] text-[#7C8B99] tracking-widest">
          270° W
        </span>
        <span className="absolute right-2 top-1/2 -translate-y-1/2 font-mono text-[9px] text-[#7C8B99] tracking-widest">
          090° E
        </span>

        {/* Interactive Station Nodes */}
        {NODES.map((node) => {
          const isSelected = activeNode.id === node.id;
          const Icon = node.icon;

          return (
            <div
              key={node.id}
              style={{ left: `${node.x}%`, top: `${node.y}%` }}
              className="absolute -translate-x-1/2 -translate-y-1/2 z-20"
            >
              <button
                onClick={() => setActiveNode(node)}
                className={`relative group/btn flex items-center justify-center transition-transform ${
                  isSelected ? "scale-125" : "hover:scale-110"
                }`}
                aria-label={node.label}
              >
                {/* Ping wave */}
                {isSelected && (
                  <span className="absolute -inset-2 rounded-full border border-[#4FD1FF]/60 animate-ping pointer-events-none" />
                )}

                {/* Node Pill Icon */}
                <div
                  className={`w-8 h-8 rounded-full border flex items-center justify-center transition-all ${
                    isSelected
                      ? "bg-[#4FD1FF] text-[#0A0E14] border-white shadow-[0_0_16px_rgba(79,209,255,0.8)]"
                      : "bg-[#0A0E14]/90 text-[#4FD1FF] border-white/20 hover:border-[#4FD1FF]/60"
                  }`}
                >
                  <Icon size={14} weight="bold" />
                </div>

                {/* Micro Label under node */}
                <span
                  className={`absolute top-9 left-1/2 -translate-x-1/2 font-mono text-[9px] uppercase tracking-wider whitespace-nowrap px-1.5 py-0.5 rounded backdrop-blur-md transition-all ${
                    isSelected
                      ? "bg-[#0F1620] text-[#4FD1FF] border border-[#4FD1FF]/40 shadow-lg"
                      : "bg-[#0A0E14]/80 text-[#7C8B99] border border-white/5 opacity-80 group-hover/btn:opacity-100"
                  }`}
                >
                  {node.label.split(" ")[0]}
                </span>
              </button>
            </div>
          );
        })}

        {/* Active Node Detail Card Overlay (Float at Bottom Center of Radar) */}
        <div className="absolute bottom-5 inset-x-8 z-30 pointer-events-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeNode.id}
              initial={{ opacity: 0, y: 8, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.98 }}
              transition={{ duration: 0.25 }}
              className="p-3.5 rounded-xl bg-[#0A0E14]/95 border border-[#4FD1FF]/30 backdrop-blur-2xl shadow-[0_8px_32px_rgba(0,0,0,0.8)]"
            >
              <div className="flex items-center justify-between mb-1.5 border-b border-white/[0.06] pb-2">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[9px] text-[#4FD1FF] px-1.5 py-0.2 rounded bg-[#4FD1FF]/10 border border-[#4FD1FF]/20">
                    {activeNode.tag}
                  </span>
                  <span className="font-headline text-xs font-semibold text-[#F2F5F7]">
                    {activeNode.label}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <HeartbeatDot size="sm" status={activeNode.status} />
                  <Link
                    href={activeNode.href}
                    className="text-[#7C8B99] hover:text-[#4FD1FF] transition-colors p-1"
                    title="Inspect Subsystem"
                  >
                    <ArrowUpRight size={13} weight="bold" />
                  </Link>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <p className="text-[11px] text-[#7C8B99] font-body truncate pr-3 max-w-[280px]">
                  {activeNode.desc}
                </p>
                <div className="text-right shrink-0">
                  <TelemetryValue
                    value={activeNode.val}
                    unit={activeNode.unit}
                    size="sm"
                    isLive={true}
                  />
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  </DraggablePanel>
  );
}
