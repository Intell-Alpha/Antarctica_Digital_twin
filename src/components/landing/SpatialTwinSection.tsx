"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowUpRight, Compass } from "@phosphor-icons/react";
import { MaitriStationTwin } from "@/components/MaitriStationTwin";
import { BharatiStationTwin } from "@/components/BharatiStationTwin";
import { SectionLabel } from "./LandingShared";

export function SpatialTwinSection() {
  const [selectedTwin, setSelectedTwin] = useState<"maitri" | "bharati">("maitri");

  return (
    <section className="relative z-10 py-24 px-4 sm:px-8 lg:px-12 max-w-7xl mx-auto border-t border-[#0D3040]/60">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
        <div>
          <SectionLabel>Spatial Digital Twin // Photogrammetric &amp; BIM Replica</SectionLabel>
          <h2 className="text-[clamp(2.2rem,4.5vw,3.8rem)] font-semibold tracking-[-0.03em] leading-[1.08] text-white">
            {selectedTwin === "maitri" ? "Maitri Station" : "Bharati Station"} Virtual Replica &amp;<br />
            Multi-Utility Lifeline Matrix
          </h2>
          <p className="text-[15px] sm:text-[16px] text-[#7ABBD4] font-light leading-relaxed max-w-2xl mt-4 opacity-85">
            {selectedTwin === "maitri"
              ? "Accurate 3D digital twin engineered from CAD elevations and satellite geometry. Inspect all 5 multi-utility pipeline lifelines (Freshwater, Fuel, Sewage, Power, Heat-Tracing), trigger X-Ray roof elevation, or lock your view inside any of the 16 station facilities at sitting eye-level."
              : "Aerodynamic modular twin built from 134 ISO container modules overlooking Prydz Bay in Larsemann Hills. Features complete CHP cogeneration, desalination RO plant, ISRO satellite downlink ground station, and 16 interior person-view locks."}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 shrink-0">
          {/* Station Switcher Pill */}
          <div className="flex items-center p-1 rounded-full bg-[#040D1A]/90 border border-white/10 backdrop-blur-2xl shadow-xl font-mono text-xs">
            <button
              onClick={() => setSelectedTwin("maitri")}
              className={`px-3.5 py-1.5 rounded-full uppercase tracking-wider text-[11px] font-semibold transition-all ${
                selectedTwin === "maitri"
                  ? "bg-[#0DB9D0]/20 text-[#0DB9D0] border border-[#0DB9D0]/40 shadow-[0_0_12px_rgba(13,185,208,0.3)]"
                  : "text-[#7ABBD4] hover:text-white"
              }`}
            >
              Maitri (70°S)
            </button>
            <button
              onClick={() => setSelectedTwin("bharati")}
              className={`px-3.5 py-1.5 rounded-full uppercase tracking-wider text-[11px] font-semibold transition-all ${
                selectedTwin === "bharati"
                  ? "bg-[#00A8FF]/20 text-[#00A8FF] border border-[#00A8FF]/40 shadow-[0_0_12px_rgba(0,168,255,0.3)]"
                  : "text-[#7ABBD4] hover:text-white"
              }`}
            >
              Bharati (69°S)
            </button>
          </div>

          <Link
            href={selectedTwin === "maitri" ? "/twin" : "/twin/bharati"}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#0DB9D0]/20 hover:bg-[#0DB9D0]/30 border border-[#0DB9D0]/50 text-[#EBF5FC] font-mono text-xs uppercase tracking-widest font-semibold transition-all shadow-[0_0_20px_rgba(13,185,208,0.25)] hover:shadow-[0_0_30px_rgba(13,185,208,0.4)]"
          >
            <Compass size={16} weight="duotone" className="text-[#0DB9D0]" />
            <span>Full-Screen Cockpit</span>
            <ArrowUpRight size={13} weight="bold" />
          </Link>
        </div>
      </div>

      {/* ── THE 3D TWIN VIEWPORT CONTAINER ── */}
      <div className="bezel-shell p-1.5 rounded-[2.5rem] bg-gradient-to-b from-[#0DB9D0]/20 via-[#04101E]/60 to-transparent shadow-[0_30px_100px_rgba(0,0,0,0.9)]">
        <div className="bezel-core rounded-[calc(2.5rem-0.375rem)] overflow-hidden bg-[#03060E] border border-white/10">
          {selectedTwin === "maitri" ? (
            <MaitriStationTwin key="maitri-home" className="w-full h-[720px] sm:h-[800px]" enableFullscreenButton={true} />
          ) : (
            <BharatiStationTwin key="bharati-home" className="w-full h-[720px] sm:h-[800px]" enableFullscreenButton={true} />
          )}
        </div>
      </div>
    </section>
  );
}
