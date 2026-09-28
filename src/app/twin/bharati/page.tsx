"use client";

import { BharatiStationTwin } from "@/components/BharatiStationTwin";

export default function BharatiTwinPage() {
  return (
    <div className="h-screen w-screen bg-[#03060E] text-[#EBF5FC] font-sans flex flex-col relative overflow-hidden select-none">
      {/* ── FULL-BLEED 3D VIEWPORT ── */}
      <main className="w-full h-full flex-1 relative overflow-hidden">
        <BharatiStationTwin className="w-full h-full min-h-screen rounded-none border-0 shadow-none" />
      </main>
    </div>
  );
}
