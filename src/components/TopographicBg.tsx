"use client";

import React, { useRef } from "react";
import { cn } from "@/lib/utils";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

if (typeof window !== "undefined") {
  gsap.registerPlugin(useGSAP);
}

interface TopographicBgProps {
  className?: string;
  showRadarRings?: boolean;
}

export function TopographicBg({ className, showRadarRings = false }: TopographicBgProps) {
  const bgRef = useRef<HTMLDivElement>(null);
  const radarRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    // Gentle Radar Sweep
    if (radarRef.current && showRadarRings) {
      gsap.to(radarRef.current, {
        rotation: 360,
        duration: 16,
        repeat: -1,
        ease: "linear",
        transformOrigin: "center center",
      });
    }

    // Subtle breathing on active sensor nodes
    gsap.to(".sensor-node", {
      opacity: 0.2,
      duration: () => Math.random() * 2 + 1,
      repeat: -1,
      yoyo: true,
      ease: "sine.inOut",
      stagger: {
        each: 0.3,
        from: "random"
      }
    });
  }, { scope: bgRef });

  return (
    <div
      ref={bgRef}
      className={cn(
        "absolute inset-0 overflow-hidden pointer-events-none select-none z-0",
        className
      )}
      aria-hidden="true"
    >
      {/* 1. Deep Muted Atmosphere Glows (Made more subtle for aurora) */}
      <div className="absolute top-1/4 -right-1/4 w-[800px] h-[800px] rounded-full bg-[radial-gradient(circle,rgba(13,185,208,0.02)_0%,transparent_60%)] blur-[120px]" />
      <div className="absolute bottom-1/4 -left-1/4 w-[600px] h-[600px] rounded-full bg-[radial-gradient(circle,rgba(123,94,200,0.015)_0%,transparent_60%)] blur-[100px]" />

      {/* 2. Precision Slate Topographical SVG */}
      <svg
        className="absolute w-full h-[200%] -top-[50%] left-0 opacity-[0.08]"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 1440 1800"
        fill="none"
      >
        <g stroke="rgba(235,245,252,0.25)" strokeWidth="0.75" strokeMiterlimit="10" className="opacity-40">
          {Array.from({ length: 30 }).map((_, i) => (
            <path
              key={`bg-path-${i}`}
              d={`M-100 ${100 + i * 60} C ${200 + i * 10} ${150 + i * 40}, ${500 - i * 10} ${80 + i * 60}, ${720} ${180 + i * 50} C ${940 + i * 10} ${280 + i * 40}, ${1200 - i * 20} ${140 + i * 60}, 1540 ${220 + i * 60}`}
            />
          ))}
        </g>
        <g stroke="rgba(235,245,252,0.4)" strokeWidth="1.2" strokeMiterlimit="10">
          <path d="M-100 320 C 300 420, 450 250, 820 400 C 1190 550, 1220 340, 1540 440" />
          <path d="M-100 800 C 260 740, 540 920, 820 840 C 1100 760, 1300 960, 1540 880" />
          <path d="M-100 1320 C 240 1260, 580 1460, 860 1400 C 1140 1340, 1340 1520, 1540 1460" />
        </g>
        
        {/* Active Sensor Nodes on the Topography */}
        <g fill="#0DB9D0" className="sensor-node opacity-40">
          <circle cx="350" cy="400" r="3" />
          <circle cx="820" cy="400" r="4" />
          <circle cx="1190" cy="550" r="2.5" />
          <circle cx="540" cy="920" r="3.5" />
          <circle cx="820" cy="840" r="3" />
          <circle cx="1100" cy="760" r="4.5" />
          <circle cx="580" cy="1460" r="3" />
          <circle cx="860" cy="1400" r="3.5" />
          <circle cx="1340" cy="1520" r="4" />
        </g>
      </svg>

      {/* 3. The Radar Sweep Element (Only when explicitly enabled) */}
      {showRadarRings && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[200vw] h-[200vw] sm:w-[150vw] sm:h-[150vw] mix-blend-screen opacity-20">
          <div 
            ref={radarRef}
            className="w-full h-full rounded-full"
            style={{
              background: "conic-gradient(from 0deg, transparent 80%, rgba(13, 185, 208, 0.05) 95%, rgba(13, 185, 208, 0.15) 100%)",
            }}
          />
        </div>
      )}

      {/* 4. Polar Grid Data Overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(rgba(13,185,208,0.06)_1px,transparent_1px)] [background-size:64px_64px] opacity-30" />
      
      {/* Note: Edge masks were removed here because layout.tsx already handles the cinematic vignette. */}
    </div>
  );
}
