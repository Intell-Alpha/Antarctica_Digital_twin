"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  WifiHigh,
  Broadcast,
  HardDrives,
  ArrowLeft,
  ShieldCheck,
  Clock,
  ArrowUpRight,
  ArrowsClockwise,
  CheckCircle,
} from "@phosphor-icons/react";
import { HudPanel } from "@/components/HudPanel";
import { HeartbeatDot } from "@/components/HeartbeatDot";
import { TelemetryValue } from "@/components/TelemetryValue";
import { TopographicBg } from "@/components/TopographicBg";
import { INITIAL_VITALS, STATION_CONSTANTS } from "@/lib/telemetry";

const SATELLITE_PASSES = [
  { sat: "INSAT-3DR (ISRO Geostationary)", az: "024° NNE", el: "18.4°", snr: "18.4 dB", status: "LOCKED & TRACKING", rtt: "740 ms", bw: "512 kbps" },
  { sat: "INSAT-3DS (ISRO Meteor & Data)", az: "022° NNE", el: "17.9°", snr: "19.1 dB", status: "STANDBY CARRIER", rtt: "765 ms", bw: "256 kbps" },
  { sat: "EDUSAT / GSAT Backup Relay",    az: "028° NNE", el: "14.2°", snr: "12.8 dB", status: "LOW ELEVATION WATCH", rtt: "810 ms", bw: "128 kbps" },
];

const PACKET_QUEUES = [
  { tier: "PRIORITY 1: LIFE SAFETY & ALARMS", rate: "100%", dropped: "0 packets", lat: "Instant", desc: "Generator fault trips, trace heat anomalies, fire/smoke loops", badge: "bg-[#10B981]/15 text-[#6EE7B7] border border-[#10B981]/30" },
  { tier: "PRIORITY 2: CONTINUOUS SCADA VECTORS", rate: "100%", dropped: "0 packets", lat: "< 1 sec", desc: "1Hz PLC telemetry snapshots, engine temps, wind vector updates", badge: "bg-white/[0.08] text-[#E2E8F0] border border-white/20" },
  { tier: "PRIORITY 3: SCIENTIFIC BULK DATA", rate: "NVMe BUFFERED", dropped: "0 (Buffered)", lat: "Windowed", desc: "Riometer magnetic sweeps, seismometer waveform dumps, ozone profiles", badge: "bg-white/[0.04] text-[#94A3B8] border border-white/[0.08]" },
  { tier: "PRIORITY 4: CREW WELFARE & VOIP", rate: "THROTTLED", dropped: "Dynamic QoS", lat: "Best Effort", desc: "Mainland email bursts, compressed voice channels (inactive in storm)", badge: "bg-[#F59E0B]/15 text-[#FCD34D] border border-[#F59E0B]/30" },
];

export default function NetworkPage() {
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
                  SATCOM // ISRO LINK
                </span>
                <HeartbeatDot size="sm" status="LIVE" label="UPLINK SYNCHRONIZED" />
              </div>
              <h1 className="font-headline text-2xl sm:text-3xl font-bold tracking-tight text-[#FFFFFF] mt-1">
                Edge Computing & Satellite Communications
              </h1>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4 sm:gap-6 font-mono text-xs text-[#64748B]">
            <div className="px-3 py-1.5 rounded-md bg-[#06090E]/80 border border-white/[0.06]">
              CARRIER: <span className="text-[#F8FAFC] font-semibold">INSAT-3DR</span>
            </div>
            <div className="px-3 py-1.5 rounded-md bg-[#06090E]/80 border border-white/[0.06]">
              BANDWIDTH: <span className="text-[#F8FAFC] font-semibold">512 kbps</span>
            </div>
            <div className="px-3 py-1.5 rounded-md bg-[#06090E]/80 border border-white/[0.06]">
              LOCAL NVMe: <span className="text-[#10B981] font-semibold">12% Used</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* ═══ SECTION 1: SATELLITE TRANSCEIVER TELEMETRY ═══ */}
      <section className="mb-8 relative z-10">
        <HudPanel
          tag="// SAT-01"
          title="ISRO Polar Geostationary Ground Station Uplink"
          subtitle="3.8-meter radome-enclosed tracking dish maintaining high-elevation link through blizzard gale conditions"
          status="LIVE"
          hoverEffect={false}
          className="p-6 md:p-8"
        >
          {/* Top Vitals */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-lg bg-[#06090E]/90 border border-white/[0.06] mb-6">
            <div>
              <span className="text-[10px] font-mono text-[#64748B] uppercase block mb-1">
                Uplink Latency (RTT)
              </span>
              <TelemetryValue value={740} unit="ms" size="md" isLive={true} />
              <span className="text-[9px] font-mono text-[#64748B] block mt-0.5">
                Geostationary propagation
              </span>
            </div>

            <div>
              <span className="text-[10px] font-mono text-[#64748B] uppercase block mb-1">
                Carrier SNR
              </span>
              <TelemetryValue value={18.4} unit="dB" size="md" isLive={true} />
              <span className="text-[9px] font-mono text-[#10B981] block mt-0.5">
                Fade margin: 9.4 dB safe
              </span>
            </div>

            <div>
              <span className="text-[10px] font-mono text-[#64748B] uppercase block mb-1">
                Effective Bandwidth
              </span>
              <TelemetryValue value={512} unit="kbps" size="md" isLive={true} />
              <span className="text-[9px] font-mono text-[#64748B] block mt-0.5">
                Full duplex carrier
              </span>
            </div>

            <div>
              <span className="text-[10px] font-mono text-[#64748B] uppercase block mb-1">
                Radome De-Ice Current
              </span>
              <TelemetryValue value={14.2} unit="A" size="md" isLive={true} />
              <span className="text-[9px] font-mono text-[#10B981] block mt-0.5">
                Hydrophobic membrane clear
              </span>
            </div>
          </div>

          {/* Satellite Constellation Status Table */}
          <div className="rounded-lg border border-white/[0.06] overflow-hidden bg-[#06090E]/80">
            <div className="divide-y divide-white/[0.06] font-mono text-xs">
              <div className="p-3 flex items-center justify-between text-[#64748B] text-[10px] uppercase">
                <span>Spacecraft</span>
                <span>Az / El</span>
                <span>Signal Quality</span>
                <span>Latency</span>
                <span>Bandwidth</span>
                <span>Status</span>
              </div>
              {SATELLITE_PASSES.map((s) => (
                <div key={s.sat} className="p-3.5 flex items-center justify-between">
                  <span className="text-[#FFFFFF] font-medium">{s.sat}</span>
                  <span className="text-[#94A3B8]">{s.az} / {s.el}</span>
                  <span className="text-[#F8FAFC] font-semibold">{s.snr}</span>
                  <span className="text-[#64748B]">{s.rtt}</span>
                  <span className="text-[#F8FAFC] font-semibold">{s.bw}</span>
                  <span className="text-[#10B981] text-[10px] font-semibold px-2 py-0.5 rounded bg-[#10B981]/10 border border-[#10B981]/20">
                    {s.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </HudPanel>
      </section>

      {/* ═══ SECTION 2: 90-DAY STORE-AND-FORWARD OFFLINE BUFFER & QOS ═══ */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 relative z-10">
        {/* Offline NVMe Buffer Architecture */}
        <HudPanel
          tag="// BUFFER-01"
          title="90-Day Offline-First Edge Resiliency"
          subtitle="Autonomous local compute cluster sustaining uninterrupted digital twin operations when satcom severs"
          status="LIVE"
          hoverEffect={false}
        >
          <div className="space-y-4">
            <div className="p-4 rounded-lg bg-[#06090E]/90 border border-white/[0.06]">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-mono text-[#64748B] uppercase">NVMe Storage Array</span>
                <span className="text-xs font-mono text-[#10B981] font-bold">12.4% / 3.8 TB USED</span>
              </div>

              <div className="h-1.5 w-full bg-white/[0.05] rounded-full overflow-hidden border border-white/[0.08] p-[1px] mb-3">
                <div className="h-full bg-gradient-to-r from-[#38BDF8] to-[#10B981] rounded-full w-[12.4%]" />
              </div>

              <p className="text-xs text-[#94A3B8] font-body leading-relaxed">
                During 160 km/h katabatic storms, radome structural vibration or ionospheric scintillation may disrupt geostationary RF lock. The local edge nodes buffer all SCADA readings with cryptographic checksums, syncing automatically on link restoration with zero data loss.
              </p>
            </div>

            <div className="space-y-2 font-mono text-xs text-[#64748B]">
              <div className="flex justify-between py-1.5 border-b border-white/[0.06]">
                <span>MAXIMUM BUFFER DURATION:</span>
                <span className="text-[#F8FAFC]">90 Days Continuous Logging</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-white/[0.06]">
                <span>ENCRYPTION AT REST:</span>
                <span className="text-[#10B981] font-semibold">AES-256 GCM (Hardware Encrypted)</span>
              </div>
              <div className="flex justify-between py-1.5">
                <span>SYNC RECONCILIATION:</span>
                <span className="text-[#F8FAFC]">Lossless Time-Series Delta Sync</span>
              </div>
            </div>
          </div>
        </HudPanel>

        {/* 4-Tier QoS Traffic Prioritization */}
        <HudPanel
          tag="// QOS-01"
          title="4-Tier Dynamic QoS Packet Prioritization"
          subtitle="Strict priority queuing preventing non-essential packets from starving critical life telemetry"
          status="LIVE"
          hoverEffect={false}
        >
          <div className="space-y-3">
            {PACKET_QUEUES.map((q) => (
              <div
                key={q.tier}
                className="p-3.5 rounded-lg bg-[#06090E]/80 border border-white/[0.06] flex flex-col justify-between gap-1 font-mono text-xs"
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-[#FFFFFF]">{q.tier}</span>
                  <span className={`text-[9px] px-2 py-0.5 rounded tracking-wider ${q.badge}`}>
                    {q.rate}
                  </span>
                </div>
                <p className="text-[11px] text-[#94A3B8] font-body leading-relaxed">
                  {q.desc}
                </p>
              </div>
            ))}
          </div>
        </HudPanel>
      </section>
    </div>
  );
}
