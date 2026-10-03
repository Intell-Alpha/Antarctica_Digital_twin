"use client";

import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import {
  GlobeHemisphereWest,
  X,
  Compass,
  Radio,
  Broadcast,
  ArrowRight,
  ArrowsIn,
  ArrowsOut,
  Lightning,
} from "@phosphor-icons/react";
import Link from "next/link";
import { api, Station } from "@/lib/api";
import { DraggablePanel } from "./DraggablePanel";

interface PolarOrbitalGlobeViewProps {
  isOpen: boolean;
  onClose: () => void;
  currentStation?: Station;
}

export function PolarOrbitalGlobeView({
  isOpen,
  onClose,
  currentStation = "BHARATI",
}: PolarOrbitalGlobeViewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const animFrameRef = useRef<number | null>(null);

  const [selectedPin, setSelectedPin] = useState<"BHARATI" | "MAITRI" | "DAKSHIN" | "ISRO">(
    currentStation === "BHARATI" ? "BHARATI" : "MAITRI"
  );

  const [liveMetrics, setLiveMetrics] = useState({
    bharatiTemp: -13.6,
    maitriTemp: -9.8,
    bharatiWind: 27.5,
    maitriWind: 88.8,
    satLatency: 42,
  });

  useEffect(() => {
    if (!isOpen) return;

    // Fetch live environment snapshot
    Promise.all([api.getEnvironment("BHARATI"), api.getEnvironment("MAITRI")])
      .then(([bEnv, mEnv]) => {
        setLiveMetrics({
          bharatiTemp: bEnv.tempC,
          maitriTemp: mEnv.tempC,
          bharatiWind: bEnv.windSpeedKmh,
          maitriWind: mEnv.windSpeedKmh,
          satLatency: 42,
        });
      })
      .catch(() => {});
  }, [isOpen]);

  // Three.js 3D Polar Earth Initialization
  useEffect(() => {
    if (!isOpen || !containerRef.current) return;
    const container = containerRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;

    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    // Camera angled from South Pole
    camera.position.set(0, -55, 35);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2.0));
    container.innerHTML = "";
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.minDistance = 25;
    controls.maxDistance = 120;
    controls.target.set(0, 0, 0);
    controlsRef.current = controls;

    // 1. Earth Globe Mesh with Polar Ice Texture
    const earthRadius = 18;
    const earthGeom = new THREE.SphereGeometry(earthRadius, 64, 64);

    // Procedural Antarctica Texture on Canvas
    const canvas = document.createElement("canvas");
    canvas.width = 1024;
    canvas.height = 512;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      // Ocean deep polar navy
      ctx.fillStyle = "#020b18";
      ctx.fillRect(0, 0, 1024, 512);

      // Southern Ocean ice shelves
      ctx.fillStyle = "#0c2847";
      ctx.beginPath();
      ctx.arc(512, 430, 220, 0, Math.PI * 2);
      ctx.fill();

      // Antarctic Continental Ice Sheet (Bright White/Cyan)
      ctx.fillStyle = "#e0f2fe";
      ctx.beginPath();
      ctx.arc(512, 450, 150, 0, Math.PI * 2);
      ctx.fill();

      // Queen Maud Land (Maitri side)
      ctx.fillStyle = "#f8fafc";
      ctx.beginPath();
      ctx.arc(430, 440, 80, 0, Math.PI * 2);
      ctx.fill();

      // Prydz Bay / Larsemann Hills (Bharati side)
      ctx.fillStyle = "#bae6fd";
      ctx.beginPath();
      ctx.arc(610, 450, 70, 0, Math.PI * 2);
      ctx.fill();
    }
    const earthTex = new THREE.CanvasTexture(canvas);

    const earthMat = new THREE.MeshStandardMaterial({
      map: earthTex,
      roughness: 0.8,
      metalness: 0.1,
    });
    const earthMesh = new THREE.Mesh(earthGeom, earthMat);
    // Rotate so South Pole points up towards camera
    earthMesh.rotation.x = Math.PI * 0.45;
    scene.add(earthMesh);

    // 2. Latitude Grid Circles (60°S, 70°S, 80°S)
    [0.32, 0.48, 0.65].forEach((latOffset) => {
      const ringRadius = earthRadius * Math.sin(latOffset * Math.PI);
      const ringGeom = new THREE.RingGeometry(ringRadius - 0.08, ringRadius + 0.08, 64);
      const ringMat = new THREE.MeshBasicMaterial({
        color: 0x0db9d0,
        opacity: 0.25,
        transparent: true,
        side: THREE.DoubleSide,
      });
      const ring = new THREE.Mesh(ringGeom, ringMat);
      ring.position.y = -earthRadius * Math.cos(latOffset * Math.PI);
      ring.rotation.x = Math.PI / 2;
      scene.add(ring);
    });

    // 3. Helper to convert Polar Lat/Lng to 3D Cartesian coordinates
    const polarToVec3 = (lat: number, lng: number, r: number = earthRadius) => {
      const phi = (90 - lat) * (Math.PI / 180);
      const theta = (lng + 180) * (Math.PI / 180);
      return new THREE.Vector3(
        -(r * Math.sin(phi) * Math.cos(theta)),
        -r * Math.cos(phi), // South pole downward in standard orientation
        r * Math.sin(phi) * Math.sin(theta)
      );
    };

    // 4. Station Beacons
    // Bharati: 69°24'S, 76°11'E
    const bharatiPos = polarToVec3(-69.4, 76.2, earthRadius + 0.3);
    const bharatiBeacon = new THREE.Mesh(
      new THREE.SphereGeometry(0.55, 16, 16),
      new THREE.MeshBasicMaterial({ color: 0x00a8ff })
    );
    bharatiBeacon.position.copy(bharatiPos);
    scene.add(bharatiBeacon);

    // Maitri: 70°45'S, 11°44'E
    const maitriPos = polarToVec3(-70.75, 11.73, earthRadius + 0.3);
    const maitriBeacon = new THREE.Mesh(
      new THREE.SphereGeometry(0.55, 16, 16),
      new THREE.MeshBasicMaterial({ color: 0x00d4a0 })
    );
    maitriBeacon.position.copy(maitriPos);
    scene.add(maitriBeacon);

    // Dakshin Gangotri: 70°05'S, 12°00'E
    const dakshinPos = polarToVec3(-70.08, 12.0, earthRadius + 0.3);
    const dakshinBeacon = new THREE.Mesh(
      new THREE.SphereGeometry(0.35, 16, 16),
      new THREE.MeshBasicMaterial({ color: 0xffaa00 })
    );
    dakshinBeacon.position.copy(dakshinPos);
    scene.add(dakshinBeacon);

    // 5. Parabolic ISRO Telemetry Arcs (Connecting Maitri & Bharati to Satellite)
    const satPos = new THREE.Vector3(0, -32, 28);
    const satMesh = new THREE.Mesh(
      new THREE.BoxGeometry(0.8, 0.8, 1.4),
      new THREE.MeshStandardMaterial({ color: 0xffffff, metalness: 0.9 })
    );
    satMesh.position.copy(satPos);
    scene.add(satMesh);

    // Draw Quadratic Parabolic Telemetry Beam
    const createArcCurve = (start: THREE.Vector3, end: THREE.Vector3, color: number) => {
      const mid = start.clone().lerp(end, 0.5).multiplyScalar(1.25);
      const curve = new THREE.QuadraticBezierCurve3(start, mid, end);
      const points = curve.getPoints(32);
      const geom = new THREE.BufferGeometry().setFromPoints(points);
      const mat = new THREE.LineBasicMaterial({ color, transparent: true, opacity: 0.7 });
      return new THREE.Line(geom, mat);
    };

    scene.add(createArcCurve(bharatiPos, satPos, 0x00a8ff));
    scene.add(createArcCurve(maitriPos, satPos, 0x00d4a0));

    // 6. Lighting
    const sun = new THREE.DirectionalLight(0xfff7ee, 1.5);
    sun.position.set(40, -40, 60);
    scene.add(sun);

    const ambient = new THREE.AmbientLight(0x0a1e38, 1.2);
    scene.add(ambient);

    // Render loop
    const animate = () => {
      animFrameRef.current = requestAnimationFrame(animate);
      earthMesh.rotation.y += 0.0006;
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      if (!container || !rendererRef.current || !cameraRef.current) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      cameraRef.current.aspect = w / h;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(w, h);
    };
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      renderer.dispose();
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 pointer-events-none bg-black/85 backdrop-blur-2xl flex flex-col items-center justify-center p-3 sm:p-6 animate-in fade-in duration-300">
      {/* ── DOUBLE-BEZEL CONTAINER ── */}
      <DraggablePanel className="w-full max-w-6xl h-[88vh]">
        <div className="relative w-full h-full rounded-[2.5rem] bg-black/60 ring-1 ring-white/15 p-2 shadow-[0_30px_90px_rgba(0,0,0,0.95)] flex flex-col overflow-hidden">
          <div className="relative flex-1 rounded-[calc(2.5rem-0.5rem)] bg-[#040D1A]/95 border border-white/10 flex flex-col overflow-hidden">
          
          {/* Header Bar */}
          <div className="p-4 sm:p-5 border-b border-white/10 flex items-center justify-between bg-white/[0.02] z-10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#00A8FF]/20 border border-[#00A8FF]/40 flex items-center justify-center text-[#00A8FF] shadow-[0_0_20px_rgba(0,168,255,0.4)]">
                <GlobeHemisphereWest size={22} weight="duotone" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="font-sans text-sm sm:text-base font-bold text-white tracking-wide uppercase">
                    ISRO GSAT Polar Orbital Telemetry & Continental Relay
                  </h2>
                  <span className="px-2 py-0.5 rounded font-mono text-[9px] bg-[#00D4A0]/20 text-[#00D4A0] border border-[#00D4A0]/30 font-semibold uppercase">
                    Orbital Link Live
                  </span>
                </div>
                <span className="font-mono text-[10px] text-[#7ABBD4]">
                  Indian Antarctic Research Stations · Geostationary Footprint & Southern Ocean Route
                </span>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-2xl text-[#7ABBD4] hover:text-white hover:bg-white/10 transition-colors"
              title="Close Orbital View"
            >
              <X size={20} />
            </button>
          </div>

          {/* 3D WebGL Viewport */}
          <div className="relative flex-1 w-full h-full overflow-hidden">
            <div ref={containerRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

            {/* Viewport Control Hint */}
            <div className="absolute top-4 left-4 z-10 pointer-events-none hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#040D1A]/80 border border-white/10 font-mono text-[10px] text-[#7ABBD4] backdrop-blur-md">
              <Compass size={14} className="text-[#0DB9D0]" />
              <span>Drag to Rotate Antarctic Globe · Scroll to Zoom</span>
            </div>

            {/* Station Cards Sidebar / Popover */}
            <div className="absolute top-4 right-4 bottom-4 w-72 sm:w-84 z-10 pointer-events-auto flex flex-col gap-2.5 overflow-y-auto no-scrollbar">
              
              {/* BHARATI STATION CARD */}
              <div
                onClick={() => setSelectedPin("BHARATI")}
                className={`p-3.5 rounded-2xl border transition-all cursor-pointer backdrop-blur-2xl ${
                  selectedPin === "BHARATI"
                    ? "bg-[#00A8FF]/15 border-[#00A8FF] shadow-[0_0_20px_rgba(0,168,255,0.3)]"
                    : "bg-[#040D1A]/80 hover:bg-[#040D1A]/95 border-white/10"
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#00A8FF] animate-pulse shadow-[0_0_8px_#00A8FF]" />
                    <span className="font-sans text-xs font-bold text-white uppercase tracking-wider">
                      Bharati Station
                    </span>
                  </div>
                  <span className="font-mono text-[9px] text-[#00A8FF] font-semibold">69°24′S, 76°11′E</span>
                </div>
                <p className="font-sans text-[11px] text-[#A6C4D6] leading-relaxed mb-2">
                  Prydz Bay, Larsemann Hills. Commissioned 2012. 134 interlocked container modules on stilt foundation.
                </p>
                <div className="grid grid-cols-2 gap-1.5 pt-1.5 border-t border-white/10 font-mono text-[10px]">
                  <div>
                    <span className="text-[#4A7A8E] block">AWS Temp</span>
                    <span className="font-bold text-white">{liveMetrics.bharatiTemp}°C</span>
                  </div>
                  <div>
                    <span className="text-[#4A7A8E] block">Wind Speed</span>
                    <span className="font-bold text-[#00A8FF]">{liveMetrics.bharatiWind} km/h</span>
                  </div>
                </div>
                <div className="mt-2.5 pt-2 border-t border-white/10 flex items-center justify-between">
                  <span className="font-mono text-[9px] text-[#00D4A0]">● Link Nominal (42ms)</span>
                  <Link
                    href="/twin?station=bharati"
                    onClick={onClose}
                    className="flex items-center gap-1 font-mono text-[10px] font-bold text-[#00A8FF] hover:underline"
                  >
                    <span>Fly to 3D Twin</span>
                    <ArrowRight size={11} />
                  </Link>
                </div>
              </div>

              {/* MAITRI STATION CARD */}
              <div
                onClick={() => setSelectedPin("MAITRI")}
                className={`p-3.5 rounded-2xl border transition-all cursor-pointer backdrop-blur-2xl ${
                  selectedPin === "MAITRI"
                    ? "bg-[#00D4A0]/15 border-[#00D4A0] shadow-[0_0_20px_rgba(0,212,160,0.3)]"
                    : "bg-[#040D1A]/80 hover:bg-[#040D1A]/95 border-white/10"
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#00D4A0] animate-pulse shadow-[0_0_8px_#00D4A0]" />
                    <span className="font-sans text-xs font-bold text-white uppercase tracking-wider">
                      Maitri Station
                    </span>
                  </div>
                  <span className="font-mono text-[9px] text-[#00D4A0] font-semibold">70°45′S, 11°44′E</span>
                </div>
                <p className="font-sans text-[11px] text-[#A6C4D6] leading-relaxed mb-2">
                  Schirmacher Oasis, Queen Maud Land. Commissioned 1989. Sits on rocky moraine overlooking Priyadarshini Lake.
                </p>
                <div className="grid grid-cols-2 gap-1.5 pt-1.5 border-t border-white/10 font-mono text-[10px]">
                  <div>
                    <span className="text-[#4A7A8E] block">AWS Temp</span>
                    <span className="font-bold text-white">{liveMetrics.maitriTemp}°C</span>
                  </div>
                  <div>
                    <span className="text-[#4A7A8E] block">Wind Speed</span>
                    <span className="font-bold text-[#00D4A0]">{liveMetrics.maitriWind} km/h</span>
                  </div>
                </div>
                <div className="mt-2.5 pt-2 border-t border-white/10 flex items-center justify-between">
                  <span className="font-mono text-[9px] text-[#00D4A0]">● Link Nominal (58ms)</span>
                  <Link
                    href="/twin?station=maitri"
                    onClick={onClose}
                    className="flex items-center gap-1 font-mono text-[10px] font-bold text-[#00D4A0] hover:underline"
                  >
                    <span>Fly to 3D Twin</span>
                    <ArrowRight size={11} />
                  </Link>
                </div>
              </div>

              {/* DAKSHIN GANGOTRI HISTORICAL CARD */}
              <div
                onClick={() => setSelectedPin("DAKSHIN")}
                className={`p-3.5 rounded-2xl border transition-all cursor-pointer backdrop-blur-2xl ${
                  selectedPin === "DAKSHIN"
                    ? "bg-[#FFAA00]/15 border-[#FFAA00] shadow-[0_0_20px_rgba(255,170,0,0.3)]"
                    : "bg-[#040D1A]/80 hover:bg-[#040D1A]/95 border-white/10"
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#FFAA00]" />
                    <span className="font-sans text-xs font-bold text-white uppercase tracking-wider">
                      Dakshin Gangotri
                    </span>
                  </div>
                  <span className="font-mono text-[8px] bg-white/10 px-1.5 py-0.5 rounded text-[#FFAA00]">HISTORIC</span>
                </div>
                <p className="font-sans text-[11px] text-[#A6C4D6] leading-relaxed">
                  India&apos;s first base station (1983-1990). Submerged under 15m of polar ice shelf; now serves as a historic logistics depot.
                </p>
              </div>

            </div>
          </div>

          {/* Bottom Telemetry Ticker */}
          <div className="px-5 py-3 border-t border-white/10 bg-white/[0.02] flex items-center justify-between font-mono text-[10px] text-[#7ABBD4] z-10">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1.5 text-white">
                <Broadcast size={14} className="text-[#0DB9D0] animate-pulse" />
                <span>ISRO GSAT-14 & GSAT-7A Tracking: SHADNAGAR GATEWAY ACTIVE</span>
              </span>
              <span className="hidden md:inline text-white/20">|</span>
              <span className="hidden md:inline">
                Expedition Resupply: <span className="text-[#00D4A0]">MV Vasiliy Golovnin in Southern Ocean Transit</span>
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-white/40">Distance Bharati ↔ Maitri:</span>
              <span className="text-white font-bold">~3,000 km across Antarctic Ice Sheet</span>
            </div>
          </div>

        </div>
      </div>
    </DraggablePanel>
  </div>
  );
}
