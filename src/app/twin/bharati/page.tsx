"use client";

import { BharatiStationTwin } from "@/components/BharatiStationTwin";
import { WebGLErrorBoundary } from "@/components/WebGLErrorBoundary";

export default function BharatiTwinPage() {
  return (
    <div className="h-screen w-screen bg-theme-base text-foreground font-sans flex flex-col relative overflow-hidden select-none">
      {/* ── FULL-BLEED 3D VIEWPORT WITH WEBGL FALLBACK BOUNDARY ── */}
      <main className="w-full h-full flex-1 relative overflow-hidden">
        <WebGLErrorBoundary station="BHARATI">
          <BharatiStationTwin className="w-full h-full min-h-screen rounded-none border-0 shadow-none" />
        </WebGLErrorBoundary>
      </main>
    </div>
  );
}
