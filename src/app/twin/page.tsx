"use client";

import { Suspense, useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { MaitriStationTwin } from "@/components/MaitriStationTwin";
import { BharatiStationTwin } from "@/components/BharatiStationTwin";

function TwinPageContent() {
  const searchParams = useSearchParams();
  const stationParam = searchParams.get("station")?.toLowerCase();

  const [activeStation, setActiveStation] = useState<"maitri" | "bharati">("maitri");

  useEffect(() => {
    if (stationParam === "bharati") {
      setActiveStation("bharati");
    } else if (stationParam === "maitri") {
      setActiveStation("maitri");
    }
  }, [stationParam]);

  return (
    <div className="h-screen w-screen bg-[#03060E] text-[#EBF5FC] font-sans flex flex-col relative overflow-hidden select-none">
      {/* ── FULL-BLEED 3D VIEWPORT ── */}
      <main className="w-full h-full flex-1 relative overflow-hidden">
        {activeStation === "maitri" ? (
          <MaitriStationTwin key="maitri" className="w-full h-full min-h-screen rounded-none border-0 shadow-none" />
        ) : (
          <BharatiStationTwin key="bharati" className="w-full h-full min-h-screen rounded-none border-0 shadow-none" />
        )}
      </main>
    </div>
  );
}

export default function TwinPage() {
  return (
    <Suspense
      fallback={
        <div className="h-screen w-screen bg-[#03060E] flex items-center justify-center font-mono text-xs text-[#0DB9D0]">
          Initializing Antarctic Twin Telemetry...
        </div>
      }
    >
      <TwinPageContent />
    </Suspense>
  );
}
