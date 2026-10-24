"use client";

import React, { useState, useEffect, useRef, forwardRef, useImperativeHandle } from "react";
import * as THREE from "three";
import gsap from "gsap";
import {
  VideoCamera,
  Play,
  Pause,
  X,
  Compass,
  Crosshair,
  Footprints,
  CaretRight,
} from "@phosphor-icons/react";
import { Station } from "@/lib/api";
import { polarAudio } from "@/lib/polarAudioEngine";
import { useReducedMotion } from "@/hooks/useReducedMotion";

interface Waypoint {
  camera: [number, number, number];
  target: [number, number, number];
  duration: number;
  label: string;
  fov: number;
}

const DRONE_WAYPOINTS: Record<Station, Waypoint[]> = {
  BHARATI: [
    {
      camera: [-95, 48, 105],
      target: [0, 6, 0],
      duration: 6.0,
      label: "Sector North: Approaching Grovnes Peninsula & Station Hull",
      fov: 62,
    },
    {
      camera: [-25, 22, 45],
      target: [-2, 8, 4],
      duration: 6.5,
      label: "Low Banking Sweep: 134 Container Assemblies on Stilts",
      fov: 54,
    },
    {
      camera: [45, 18, -35],
      target: [5, 4, -10],
      duration: 6.0,
      label: "Prydz Bay Line: Quilty Bay Seawater Intake & RO Desalination",
      fov: 58,
    },
    {
      camera: [12, 38, 28],
      target: [0, 14, 0],
      duration: 6.5,
      label: "High Zenith: Level 04 Radome Deck & Weather Mast",
      fov: 65,
    },
  ],
  MAITRI: [
    {
      camera: [-120, 65, 140],
      target: [0, 4, 0],
      duration: 6.0,
      label: "Sector West: Approaching Schirmacher Oasis & Moraine",
      fov: 65,
    },
    {
      camera: [-35, 18, 65],
      target: [0, 5, 0],
      duration: 6.5,
      label: "Low Level Pass: Main Habitation Block & Insulated Cladding",
      fov: 55,
    },
    {
      camera: [65, 28, -60],
      target: [25, 4, -20],
      duration: 6.0,
      label: "Lifeline Corridor: Priyadarshini Lake 280m Heated Gantry Line",
      fov: 58,
    },
    {
      camera: [15, 42, 50],
      target: [5, 4, 0],
      duration: 6.5,
      label: "Zenith Survey: Central Powerhouse, Boiler & STP Outfall",
      fov: 62,
    },
  ],
};

export interface CinematicDroneDirectorHandle {
  startDroneTour: () => void;
  stopDroneTour: () => void;
  toggleDroneTour: () => void;
  isActive: boolean;
}

export interface CinematicDroneDirectorProps {
  camera: THREE.PerspectiveCamera | null;
  controls: any | null;
  station: Station;
  onExitCallback?: () => void;
  className?: string;
  hideTrigger?: boolean;
}

export const CinematicDroneDirector = forwardRef<
  CinematicDroneDirectorHandle,
  CinematicDroneDirectorProps
>(function CinematicDroneDirector(
  { camera, controls, station, onExitCallback, className = "", hideTrigger = false },
  ref
) {
  const [isActive, setIsActive] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [currentWaypointIdx, setCurrentWaypointIdx] = useState(0);
  const [flightTelemetry, setFlightTelemetry] = useState({
    altitudeM: 42,
    speedKnots: 22,
    batteryPct: 94,
    headingDeg: 135,
  });

  const timelineRef = useRef<gsap.core.Timeline | null>(null);
  const prefersReducedMotion = useReducedMotion();

  const waypoints = DRONE_WAYPOINTS[station] || DRONE_WAYPOINTS.BHARATI;

  const startDroneTour = () => {
    if (!camera || !controls) return;
    setIsActive(true);
    setIsPaused(false);
    polarAudio.playClickFeedback();

    controls.enabled = false;

    // Skip animations if user prefers reduced motion
    if (prefersReducedMotion) {
      // Instant jump to first waypoint
      const firstWp = waypoints[0];
      camera.position.set(firstWp.camera[0], firstWp.camera[1], firstWp.camera[2]);
      controls.target.set(firstWp.target[0], firstWp.target[1], firstWp.target[2]);
      camera.fov = firstWp.fov;
      camera.updateProjectionMatrix();
      setCurrentWaypointIdx(0);
      return;
    }

    // Build GSAP Timeline sequence
    if (timelineRef.current) timelineRef.current.kill();
    const tl = gsap.timeline({
      repeat: -1,
      onUpdate: () => {
        camera.updateProjectionMatrix();
      },
    });
    timelineRef.current = tl;

    waypoints.forEach((wp, idx) => {
      tl.to(
        camera.position,
        {
          x: wp.camera[0],
          y: wp.camera[1],
          z: wp.camera[2],
          duration: wp.duration,
          ease: "power1.inOut",
          onStart: () => {
            setCurrentWaypointIdx(idx);
            setFlightTelemetry((prev) => ({
              ...prev,
              altitudeM: Math.round(wp.camera[1]),
              speedKnots: 18 + Math.round(Math.random() * 8),
              headingDeg: (idx * 90 + 45) % 360,
            }));
          },
        },
        idx === 0 ? 0 : ">-0.4"
      );

      tl.to(
        controls.target,
        {
          x: wp.target[0],
          y: wp.target[1],
          z: wp.target[2],
          duration: wp.duration,
          ease: "power1.inOut",
        },
        "<"
      );

      tl.to(
        camera,
        {
          fov: wp.fov,
          duration: wp.duration * 0.8,
          ease: "sine.inOut",
        },
        "<"
      );
    });
  };

  const pauseDroneTour = () => {
    if (timelineRef.current) {
      if (isPaused) {
        timelineRef.current.resume();
        setIsPaused(false);
      } else {
        timelineRef.current.pause();
        setIsPaused(true);
      }
    }
  };

  const stopDroneTour = () => {
    if (timelineRef.current) {
      timelineRef.current.kill();
      timelineRef.current = null;
    }
    if (controls) {
      controls.enabled = true;
    }
    setIsActive(false);
    setIsPaused(false);
    if (onExitCallback) onExitCallback();
  };

  useImperativeHandle(ref, () => ({
    startDroneTour,
    stopDroneTour,
    toggleDroneTour: () => {
      if (isActive) stopDroneTour();
      else startDroneTour();
    },
    isActive,
  }));

  // Keyboard shortcut: Press "U" to toggle drone survey
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }
      if (e.repeat) return;
      if (e.key.toLowerCase() === "u" && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        if (isActive) {
          stopDroneTour();
        } else {
          startDroneTour();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isActive, camera, controls]);

  return (
    <>
      {/* ── 1. CINEMATIC LETTERBOX BARS & HUD OVERLAY WHEN DRONE IS ACTIVE ── */}
      {isActive && (
        <div className="fixed inset-0 pointer-events-none z-30 select-none overflow-hidden flex flex-col justify-between animate-in fade-in duration-500">
          {/* Top 2.39:1 Letterbox Bar */}
          <div className="w-full h-12 sm:h-16 bg-black/90 border-b border-white/10 flex items-center justify-between px-6 pointer-events-auto">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
                <span className="font-mono text-xs font-bold text-white uppercase tracking-wider">
                  REC · UAV SURVEY 01
                </span>
              </div>
              <span className="text-white/20">|</span>
              <span className="font-mono text-[10px] text-[#0DB9D0]">
                {waypoints[currentWaypointIdx]?.label}
              </span>
            </div>

            <div className="flex items-center gap-2 font-mono text-[10px] text-[#7ABBD4]">
              <span className="px-2 py-0.5 rounded bg-white/10 text-white">
                ALT: {flightTelemetry.altitudeM}m
              </span>
              <span className="px-2 py-0.5 rounded bg-white/10 text-white">
                SPD: {flightTelemetry.speedKnots} kts
              </span>
              <span className="px-2 py-0.5 rounded bg-[#00D4A0]/20 text-[#00D4A0]">
                BAT: {flightTelemetry.batteryPct}%
              </span>
              <button
                onClick={pauseDroneTour}
                className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white ml-2 transition-colors"
                title={isPaused ? "Resume" : "Pause"}
              >
                {isPaused ? <Play size={14} weight="fill" /> : <Pause size={14} weight="fill" />}
              </button>
              <button
                onClick={stopDroneTour}
                className="p-1.5 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 transition-colors"
                title="Exit Drone Flight"
              >
                <X size={14} />
              </button>
            </div>
          </div>

          {/* Center Crosshair Overlay */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-40">
            <div className="w-16 h-16 border border-white/30 rounded-full flex items-center justify-center">
              <div className="w-2 h-2 bg-[#0DB9D0] rounded-full" />
            </div>
          </div>

          {/* Bottom 2.39:1 Letterbox Bar */}
          <div className="w-full h-12 sm:h-16 bg-black/90 border-t border-white/10 flex items-center justify-between px-6 font-mono text-[10px] text-[#4A7A8E] pointer-events-auto">
            <span>ISRO / NCPOR POLAR MAPPING DRONE 4K GIMBAL</span>
            <span>PRESS U OR ESCAPE TO RETURN TO ORBIT</span>
          </div>
        </div>
      )}

      {/* ── 2. OPTIONAL TRIGGER BUTTON IN TOP ACTIONS BAR ── */}
      {!hideTrigger && (
        <button
          onClick={() => {
            if (isActive) stopDroneTour();
            else startDroneTour();
          }}
          className={`p-2 rounded-xl border backdrop-blur-xl transition-colors shadow-lg pointer-events-auto ${
            isActive
              ? "bg-rose-500/20 border-rose-500/40 text-rose-300"
              : "bg-[#070D18]/90 hover:bg-white/10 border-white/[0.12] text-[#7ABBD4] hover:text-white"
          } ${className}`}
          title="Start Autonomous 4K Drone Aerial Survey (Press U)"
        >
          <VideoCamera size={15} weight={isActive ? "fill" : "regular"} />
        </button>
      )}
    </>
  );
});
