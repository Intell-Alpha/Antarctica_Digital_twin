"use client";

import { Suspense, useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { MaitriStationTwin } from "@/components/MaitriStationTwin";
import { BharatiStationTwin } from "@/components/BharatiStationTwin";
import { WebGLErrorBoundary } from "@/components/WebGLErrorBoundary";

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
    <div className="h-screen w-screen bg-theme-base text-foreground font-sans flex flex-col relative overflow-hidden select-none">
      {/* ── FULL-BLEED 3D VIEWPORT WITH WEBGL FALLBACK BOUNDARY ── */}
      <main className="w-full h-full flex-1 relative overflow-hidden">
        {activeStation === "maitri" ? (
          <WebGLErrorBoundary key="maitri" station="MAITRI">
            <MaitriStationTwin className="w-full h-full min-h-screen rounded-none border-0 shadow-none" />
          </WebGLErrorBoundary>
        ) : (
          <WebGLErrorBoundary key="bharati" station="BHARATI">
            <BharatiStationTwin className="w-full h-full min-h-screen rounded-none border-0 shadow-none" />
          </WebGLErrorBoundary>
        )}
      </main>
    </div>
  );
}

export default function TwinPage() {
  return (
    <Suspense
      fallback={
        <div className="h-screen w-screen bg-theme-base flex items-center justify-center font-mono text-xs text-accent">
          Initializing Antarctic Twin Telemetry...
        </div>
      }
    >
      <TwinPageContent />
    </Suspense>
  );
}
