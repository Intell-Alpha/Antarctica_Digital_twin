"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  GameController,
  Jeep,
  AirplaneTilt,
  Lightning,
  ArrowsClockwise,
  X,
  CaretUp,
  CaretDown,
  Compass,
  Crosshair,
  Keyboard,
  Eye,
} from "@phosphor-icons/react";
import { polarAudio } from "@/lib/polarAudioEngine";

export type RoamMode = "rover" | "drone";

export interface RoamVector {
  x: number;               // -1.0 to +1.0 (strafe left/right)
  y: number;               // -1.0 to +1.0 (reverse/forward)
  z: number;               // -1.0 to +1.0 (descend/ascend)
  mode: RoamMode;          // "rover" | "drone"
  speedMultiplier: number; // 1.0 or 2.5
  isActive: boolean;       // whether any input is being applied
}

export interface PolarVirtualJoystickProps {
  station: "BHARATI" | "MAITRI";
  onVectorChange: (vector: RoamVector) => void;
  isEnabled?: boolean;
  onToggleEnabled?: (enabled: boolean) => void;
  className?: string;
  onResetView?: () => void;
}

const JOYSTICK_RADIUS = 52; // max displacement radius in px
const DEAD_ZONE = 0.08;     // inner dead zone to avoid drift

export function PolarVirtualJoystick({
  station,
  onVectorChange,
  isEnabled: externalIsEnabled,
  onToggleEnabled,
  className = "",
  onResetView,
}: PolarVirtualJoystickProps) {
  // Controlled or uncontrolled toggle state
  const [internalIsEnabled, setInternalIsEnabled] = useState(true);
  const isEnabled = externalIsEnabled !== undefined ? externalIsEnabled : internalIsEnabled;

  const handleToggle = useCallback(
    (nextState: boolean) => {
      polarAudio.playClickFeedback();
      if (onToggleEnabled) {
        onToggleEnabled(nextState);
      } else {
        setInternalIsEnabled(nextState);
      }
    },
    [onToggleEnabled]
  );

  // Navigation mode: "rover" (ground level) or "drone" (aerial survey)
  const [mode, setMode] = useState<RoamMode>("rover");

  // Speed Turbo multiplier (Shift key or toggle button)
  const [isTurbo, setIsTurbo] = useState(false);

  // Knob visual offset in px from center
  const [knobPos, setKnobPos] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);

  // Active keyboard keys state for real-time visual feedback
  const [activeKeys, setActiveKeys] = useState<{
    w: boolean;
    a: boolean;
    s: boolean;
    d: boolean;
    space: boolean;
    c: boolean;
    shift: boolean;
  }>({
    w: false,
    a: false,
    s: false,
    d: false,
    space: false,
    c: false,
    shift: false,
  });

  // Mutable refs to track active inputs without React re-render lag
  const keysDownRef = useRef<{ [code: string]: boolean }>({});
  const joystickVectorRef = useRef({ x: 0, y: 0 });
  const verticalInputRef = useRef(0); // -1 (descend) to +1 (ascend)
  const activePointerIdRef = useRef<number | null>(null);
  const padRef = useRef<HTMLDivElement | null>(null);

  // Helper to compute and emit combined vector (keyboard + joystick + elevation)
  const emitCombinedVector = useCallback(() => {
    if (!isEnabled) {
      onVectorChange({
        x: 0,
        y: 0,
        z: 0,
        mode,
        speedMultiplier: 1.0,
        isActive: false,
      });
      return;
    }

    const keys = keysDownRef.current;

    // Keyboard inputs
    let keyX = 0;
    let keyY = 0;
    let keyZ = verticalInputRef.current;

    if (keys["KeyW"] || keys["ArrowUp"]) keyY += 1.0;
    if (keys["KeyS"] || keys["ArrowDown"]) keyY -= 1.0;
    if (keys["KeyD"] || keys["ArrowRight"]) keyX += 1.0;
    if (keys["KeyA"] || keys["ArrowLeft"]) keyX -= 1.0;

    if (keys["Space"] || keys["KeyE"] || keys["PageUp"]) keyZ += 1.0;
    if (keys["KeyC"] || keys["KeyQ"] || keys["PageDown"]) keyZ -= 1.0;

    // Combine keyboard and virtual joystick (clamp to [-1, 1])
    let combinedX = keyX + joystickVectorRef.current.x;
    let combinedY = keyY + joystickVectorRef.current.y;
    let combinedZ = Math.max(-1.0, Math.min(1.0, keyZ));

    const len = Math.hypot(combinedX, combinedY);
    if (len > 1.0) {
      combinedX /= len;
      combinedY /= len;
    }

    const shiftActive = !!(keys["ShiftLeft"] || keys["ShiftRight"] || isTurbo);
    const speedMultiplier = shiftActive ? 2.5 : 1.0;
    const isActive = Math.abs(combinedX) > 0.01 || Math.abs(combinedY) > 0.01 || Math.abs(combinedZ) > 0.01;

    onVectorChange({
      x: combinedX,
      y: combinedY,
      z: combinedZ,
      mode,
      speedMultiplier,
      isActive,
    });
  }, [isEnabled, mode, isTurbo, onVectorChange]);

  // Synchronize mode changes
  useEffect(() => {
    emitCombinedVector();
  }, [mode, isTurbo, emitCombinedVector]);

  // Keyboard Event Listeners for WASD / Arrow Keys / Shift / J
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is typing inside an input, textarea, or contentEditable
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.isContentEditable)
      ) {
        return;
      }

      // Toggle joystick with 'J' key
      if (e.code === "KeyJ") {
        e.preventDefault();
        handleToggle(!isEnabled);
        return;
      }

      // If navigation disabled, don't capture navigation keys
      if (!isEnabled) return;

      const code = e.code;
      if (
        [
          "KeyW",
          "KeyA",
          "KeyS",
          "KeyD",
          "ArrowUp",
          "ArrowDown",
          "ArrowLeft",
          "ArrowRight",
          "Space",
          "KeyE",
          "KeyC",
          "KeyQ",
          "ShiftLeft",
          "ShiftRight",
        ].includes(code)
      ) {
        // Prevent default page scroll on Space & Arrows
        if (code === "Space" || code.startsWith("Arrow")) {
          e.preventDefault();
        }

        // Prevent duplicate keydown processing if key is already marked pressed
        if (e.repeat || keysDownRef.current[code]) {
          return;
        }

        keysDownRef.current[code] = true;

        setActiveKeys({
          w: !!(keysDownRef.current["KeyW"] || keysDownRef.current["ArrowUp"]),
          a: !!(keysDownRef.current["KeyA"] || keysDownRef.current["ArrowLeft"]),
          s: !!(keysDownRef.current["KeyS"] || keysDownRef.current["ArrowDown"]),
          d: !!(keysDownRef.current["KeyD"] || keysDownRef.current["ArrowRight"]),
          space: !!(keysDownRef.current["Space"] || keysDownRef.current["KeyE"]),
          c: !!(keysDownRef.current["KeyC"] || keysDownRef.current["KeyQ"]),
          shift: !!(keysDownRef.current["ShiftLeft"] || keysDownRef.current["ShiftRight"]),
        });

        emitCombinedVector();
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const code = e.code;
      if (keysDownRef.current[code]) {
        delete keysDownRef.current[code];

        setActiveKeys({
          w: !!(keysDownRef.current["KeyW"] || keysDownRef.current["ArrowUp"]),
          a: !!(keysDownRef.current["KeyA"] || keysDownRef.current["ArrowLeft"]),
          s: !!(keysDownRef.current["KeyS"] || keysDownRef.current["ArrowDown"]),
          d: !!(keysDownRef.current["KeyD"] || keysDownRef.current["ArrowRight"]),
          space: !!(keysDownRef.current["Space"] || keysDownRef.current["KeyE"]),
          c: !!(keysDownRef.current["KeyC"] || keysDownRef.current["KeyQ"]),
          shift: !!(keysDownRef.current["ShiftLeft"] || keysDownRef.current["ShiftRight"]),
        });

        emitCombinedVector();
      }
    };

    const handleBlur = () => {
      keysDownRef.current = {};
      setActiveKeys({
        w: false,
        a: false,
        s: false,
        d: false,
        space: false,
        c: false,
        shift: false,
      });
      emitCombinedVector();
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    window.addEventListener("blur", handleBlur);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
      window.removeEventListener("blur", handleBlur);
    };
  }, [isEnabled, handleToggle, emitCombinedVector]);

  // Pointer / Touch Handlers for Virtual Joystick Pad
  const updateJoystickFromPointer = (clientX: number, clientY: number) => {
    if (!padRef.current) return;
    const rect = padRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const rawDx = clientX - centerX;
    const rawDy = clientY - centerY;

    const distance = Math.hypot(rawDx, rawDy);
    const clampedDist = Math.min(distance, JOYSTICK_RADIUS);
    const angle = Math.atan2(rawDy, rawDx);

    const knobX = clampedDist * Math.cos(angle);
    const knobY = clampedDist * Math.sin(angle);

    setKnobPos({ x: knobX, y: knobY });

    // Normalized vector calculation:
    // x: +1 = right (strafe right), -1 = left
    // y: +1 = forward (dragged UP, rawDy < 0), -1 = backward (dragged DOWN, rawDy > 0)
    const normDist = clampedDist / JOYSTICK_RADIUS;
    if (normDist < DEAD_ZONE) {
      joystickVectorRef.current = { x: 0, y: 0 };
    } else {
      const activeDist = (normDist - DEAD_ZONE) / (1 - DEAD_ZONE);
      joystickVectorRef.current = {
        x: Math.cos(angle) * activeDist,
        y: -Math.sin(angle) * activeDist, // Inverted: Up is positive forward
      };
    }

    emitCombinedVector();
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isEnabled) return;
    e.preventDefault();
    e.stopPropagation();

    activePointerIdRef.current = e.pointerId;
    e.currentTarget.setPointerCapture(e.pointerId);
    setIsDragging(true);
    polarAudio.playClickFeedback();

    updateJoystickFromPointer(e.clientX, e.clientY);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging || activePointerIdRef.current !== e.pointerId) return;
    e.preventDefault();
    e.stopPropagation();

    updateJoystickFromPointer(e.clientX, e.clientY);
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (activePointerIdRef.current === e.pointerId) {
      try {
        e.currentTarget.releasePointerCapture(e.pointerId);
      } catch {
        // pointer capture release fallback
      }
      activePointerIdRef.current = null;
      setIsDragging(false);
      setKnobPos({ x: 0, y: 0 });
      joystickVectorRef.current = { x: 0, y: 0 };
      emitCombinedVector();
    }
  };

  // On-Screen Elevation buttons for Drone Mode / Touch
  const handleElevateDown = (direction: 1 | -1) => {
    verticalInputRef.current = direction;
    polarAudio.playClickFeedback();
    emitCombinedVector();
  };

  const handleElevateUp = () => {
    verticalInputRef.current = 0;
    emitCombinedVector();
  };

  // If joystick is toggled OFF, show only the sleek SCADA launcher pill
  if (!isEnabled) {
    return (
      <div
        className={`absolute bottom-20 sm:bottom-24 left-4 sm:left-6 z-30 pointer-events-auto transition-all duration-300 ${className}`}
      >
        <button
          onClick={() => handleToggle(true)}
          className="group flex items-center gap-2.5 px-3.5 py-2 rounded-2xl bg-[#040D1A]/90 hover:bg-[#06182B]/95 border border-white/10 hover:border-[#0DB9D0]/50 backdrop-blur-2xl shadow-[0_12px_30px_rgba(0,0,0,0.85)] transition-all hover:scale-105 active:scale-95"
          title="Enable Polar Virtual Joystick & WASD Free-Roam Navigation [Shortcut: J]"
        >
          <div className="relative">
            <GameController size={18} className="text-[#0DB9D0] group-hover:scale-110 transition-transform" />
            <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-white/20 border border-[#040D1A]" />
          </div>
          <div className="flex flex-col text-left">
            <span className="font-mono text-[11px] font-bold tracking-wider text-white group-hover:text-[#0DB9D0] transition-colors">
              FREE-ROAM NAV
            </span>
            <span className="font-mono text-[9px] text-[#7ABBD4]/70">
              WASD · Joystick [J]
            </span>
          </div>
          <span className="ml-1 px-1.5 py-0.5 rounded-md font-mono text-[9px] uppercase font-bold bg-white/5 border border-white/10 text-[#7ABBD4] group-hover:text-white">
            ENABLE
          </span>
        </button>
      </div>
    );
  }

  // Current normalized coordinates display
  const dispX = (joystickVectorRef.current.x >= 0 ? "+" : "") + joystickVectorRef.current.x.toFixed(2);
  const dispY = (joystickVectorRef.current.y >= 0 ? "+" : "") + joystickVectorRef.current.y.toFixed(2);

  return (
    <div
      className={`absolute bottom-20 sm:bottom-24 left-4 sm:left-6 z-30 pointer-events-auto select-none transition-all duration-300 ${className}`}
    >
      <div className="relative rounded-3xl bg-[#040D1A]/92 border border-white/10 backdrop-blur-2xl shadow-[0_25px_60px_rgba(0,0,0,0.95)] p-3 sm:p-3.5 flex flex-col gap-2.5 w-[240px] sm:w-[256px] text-white">
        {/* Glow Accent Line at top */}
        <div className="absolute -top-[1px] left-8 right-8 h-[2px] bg-gradient-to-r from-transparent via-[#0DB9D0] to-transparent opacity-70" />

        {/* ── HEADER: STATUS, MODE TOGGLE & CLOSE ── */}
        <div className="flex items-center justify-between gap-1 border-b border-white/10 pb-2">
          <div className="flex items-center gap-1.5 min-w-0">
            <span className="w-2 h-2 rounded-full bg-[#00D4A0] animate-pulse shadow-[0_0_8px_#00D4A0] shrink-0" />
            <span className="font-mono text-[10px] uppercase font-bold tracking-wider text-[#A6C4D6] truncate">
              {station} NAV
            </span>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            {/* Turbo Toggle */}
            <button
              onClick={() => {
                setIsTurbo(!isTurbo);
                polarAudio.playClickFeedback();
              }}
              className={`px-1.5 py-0.5 rounded font-mono text-[9px] uppercase font-bold transition-all flex items-center gap-0.5 ${
                isTurbo || activeKeys.shift
                  ? "bg-[#FFAA00]/25 text-[#FFAA00] border border-[#FFAA00]/50 shadow-[0_0_8px_rgba(255,170,0,0.3)]"
                  : "bg-white/5 text-[#7ABBD4] hover:text-white border border-white/5"
              }`}
              title="Toggle Turbo Speed (Hold Shift or Click)"
            >
              <Lightning size={10} weight="fill" />
              <span>{isTurbo || activeKeys.shift ? "2.5x" : "1x"}</span>
            </button>

            {/* Minimize / Close */}
            <button
              onClick={() => handleToggle(false)}
              className="p-1 rounded-lg text-[#7ABBD4] hover:text-rose-400 hover:bg-white/10 transition-colors"
              title="Minimize Joystick [Shortcut: J]"
            >
              <X size={12} weight="bold" />
            </button>
          </div>
        </div>

        {/* ── ROVER VS DRONE MODE SELECTOR ── */}
        <div className="grid grid-cols-2 gap-1.5 p-0.5 rounded-xl bg-white/[0.04] border border-white/[0.06] font-mono text-[10px]">
          <button
            onClick={() => {
              setMode("rover");
              polarAudio.playClickFeedback();
            }}
            className={`flex items-center justify-center gap-1.5 py-1 rounded-lg font-semibold transition-all ${
              mode === "rover"
                ? "bg-[#0DB9D0]/20 text-[#0DB9D0] border border-[#0DB9D0]/40 shadow-[0_0_10px_rgba(13,185,208,0.25)]"
                : "text-[#7ABBD4] hover:text-white border border-transparent"
            }`}
            title="Ground Rover Mode: eye-level exploration (18 m/s)"
          >
            <Jeep size={13} weight={mode === "rover" ? "fill" : "regular"} />
            <span>ROVER</span>
          </button>

          <button
            onClick={() => {
              setMode("drone");
              polarAudio.playClickFeedback();
            }}
            className={`flex items-center justify-center gap-1.5 py-1 rounded-lg font-semibold transition-all ${
              mode === "drone"
                ? "bg-[#00A8FF]/20 text-[#00A8FF] border border-[#00A8FF]/40 shadow-[0_0_10px_rgba(0,168,255,0.25)]"
                : "text-[#7ABBD4] hover:text-white border border-transparent"
            }`}
            title="Aerial Drone Mode: high-speed 3D flight (42 m/s)"
          >
            <AirplaneTilt size={13} weight={mode === "drone" ? "fill" : "regular"} />
            <span>DRONE</span>
          </button>
        </div>

        {/* ── INTERACTIVE VIRTUAL JOYSTICK & ELEVATION DECK ── */}
        <div className="flex items-center justify-between gap-2 pt-1">
          {/* Circular Touch Joystick Pad */}
          <div className="relative flex flex-col items-center">
            <div
              ref={padRef}
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onPointerCancel={handlePointerUp}
              style={{
                width: `${JOYSTICK_RADIUS * 2}px`,
                height: `${JOYSTICK_RADIUS * 2}px`,
                touchAction: "none",
              }}
              className={`relative rounded-full border flex items-center justify-center cursor-grab active:cursor-grabbing transition-colors overflow-visible ${
                isDragging
                  ? "bg-[#0DB9D0]/15 border-[#0DB9D0]/80 shadow-[0_0_20px_rgba(13,185,208,0.35)]"
                  : "bg-white/[0.03] border-white/15 hover:border-white/30"
              }`}
            >
              {/* Concentric Inner Radar Ring */}
              <div
                style={{
                  width: `${JOYSTICK_RADIUS * 1.25}px`,
                  height: `${JOYSTICK_RADIUS * 1.25}px`,
                }}
                className="absolute rounded-full border border-dashed border-white/10 pointer-events-none"
              />

              {/* Deadzone Center Indicator */}
              <div
                style={{
                  width: `${JOYSTICK_RADIUS * 0.35}px`,
                  height: `${JOYSTICK_RADIUS * 0.35}px`,
                }}
                className="absolute rounded-full border border-white/10 pointer-events-none"
              />

              {/* Crosshairs */}
              <div className="absolute inset-x-2 top-1/2 h-[1px] bg-white/10 pointer-events-none" />
              <div className="absolute inset-y-2 left-1/2 w-[1px] bg-white/10 pointer-events-none" />

              {/* Directional Labels */}
              <span className="absolute top-1 font-mono text-[7px] text-[#7ABBD4]/80 pointer-events-none font-bold">
                FWD
              </span>
              <span className="absolute bottom-1 font-mono text-[7px] text-[#7ABBD4]/80 pointer-events-none font-bold">
                REV
              </span>
              <span className="absolute left-1.5 font-mono text-[7px] text-[#7ABBD4]/80 pointer-events-none font-bold">
                L
              </span>
              <span className="absolute right-1.5 font-mono text-[7px] text-[#7ABBD4]/80 pointer-events-none font-bold">
                R
              </span>

              {/* Energy Tether Line (SVG) from Center to Knob */}
              {isDragging && (
                <svg
                  className="absolute inset-0 w-full h-full pointer-events-none overflow-visible"
                  style={{ width: `${JOYSTICK_RADIUS * 2}px`, height: `${JOYSTICK_RADIUS * 2}px` }}
                >
                  <line
                    x1={JOYSTICK_RADIUS}
                    y1={JOYSTICK_RADIUS}
                    x2={JOYSTICK_RADIUS + knobPos.x}
                    y2={JOYSTICK_RADIUS + knobPos.y}
                    stroke="#0DB9D0"
                    strokeWidth="2"
                    strokeDasharray="3 2"
                    strokeOpacity="0.8"
                  />
                </svg>
              )}

              {/* Floating Thumb Stick Knob */}
              <div
                style={{
                  transform: `translate3d(${knobPos.x}px, ${knobPos.y}px, 0)`,
                  transition: isDragging ? "none" : "transform 0.22s cubic-bezier(0.18, 0.89, 0.32, 1.28)",
                }}
                className={`w-9 h-9 rounded-full border flex items-center justify-center shadow-lg pointer-events-none relative ${
                  isDragging
                    ? "bg-[#0DB9D0] border-white text-[#040D1A] shadow-[0_0_16px_#0DB9D0]"
                    : "bg-[#0B2538] border-[#7ABBD4]/40 text-[#0DB9D0] shadow-[0_4px_12px_rgba(0,0,0,0.6)]"
                }`}
              >
                <div
                  className={`w-2 h-2 rounded-full ${
                    isDragging ? "bg-[#040D1A]" : "bg-[#00D4A0] shadow-[0_0_6px_#00D4A0]"
                  }`}
                />
              </div>
            </div>

            {/* Coordinates Readout */}
            <div className="font-mono text-[8px] text-[#7ABBD4] mt-1.5 flex items-center gap-1.5">
              <span>X:{dispX}</span>
              <span className="text-white/20">|</span>
              <span>Y:{dispY}</span>
            </div>
          </div>

          {/* Right Column: Elevation Buttons & WASD Keycaps */}
          <div className="flex flex-col justify-between items-center h-[120px] pl-1">
            {/* Elevation Controls (Drone mode or anytime altitude control) */}
            <div className="flex flex-col gap-1 w-full">
              <span className="font-mono text-[8px] uppercase tracking-wider text-[#7ABBD4]/70 text-center">
                ALTITUDE
              </span>
              <div className="flex items-center gap-1">
                <button
                  onPointerDown={() => handleElevateDown(1)}
                  onPointerUp={handleElevateUp}
                  onPointerLeave={handleElevateUp}
                  className={`p-1.5 rounded-lg border font-mono text-[9px] flex items-center justify-center transition-all ${
                    activeKeys.space || verticalInputRef.current > 0
                      ? "bg-[#0DB9D0]/30 text-[#0DB9D0] border-[#0DB9D0]/60 shadow-[0_0_8px_#0DB9D0]"
                      : "bg-white/5 hover:bg-white/10 text-white border-white/10"
                  }`}
                  title="Ascend Camera Altitude [Space or E]"
                >
                  <CaretUp size={12} weight="bold" />
                </button>
                <button
                  onPointerDown={() => handleElevateDown(-1)}
                  onPointerUp={handleElevateUp}
                  onPointerLeave={handleElevateUp}
                  className={`p-1.5 rounded-lg border font-mono text-[9px] flex items-center justify-center transition-all ${
                    activeKeys.c || verticalInputRef.current < 0
                      ? "bg-[#0DB9D0]/30 text-[#0DB9D0] border-[#0DB9D0]/60 shadow-[0_0_8px_#0DB9D0]"
                      : "bg-white/5 hover:bg-white/10 text-white border-white/10"
                  }`}
                  title="Descend Camera Altitude [C or Q]"
                >
                  <CaretDown size={12} weight="bold" />
                </button>
              </div>
            </div>

            {/* Desktop WASD Keypad Visualizer */}
            <div className="flex flex-col items-center gap-0.5 pt-1">
              <div
                className={`w-5 h-5 rounded flex items-center justify-center font-mono text-[8px] font-bold border transition-colors ${
                  activeKeys.w
                    ? "bg-[#0DB9D0] text-[#040D1A] border-[#0DB9D0] shadow-[0_0_8px_#0DB9D0]"
                    : "bg-white/5 text-[#7ABBD4] border-white/10"
                }`}
              >
                W
              </div>
              <div className="flex items-center gap-0.5">
                <div
                  className={`w-5 h-5 rounded flex items-center justify-center font-mono text-[8px] font-bold border transition-colors ${
                    activeKeys.a
                      ? "bg-[#0DB9D0] text-[#040D1A] border-[#0DB9D0] shadow-[0_0_8px_#0DB9D0]"
                      : "bg-white/5 text-[#7ABBD4] border-white/10"
                  }`}
                >
                  A
                </div>
                <div
                  className={`w-5 h-5 rounded flex items-center justify-center font-mono text-[8px] font-bold border transition-colors ${
                    activeKeys.s
                      ? "bg-[#0DB9D0] text-[#040D1A] border-[#0DB9D0] shadow-[0_0_8px_#0DB9D0]"
                      : "bg-white/5 text-[#7ABBD4] border-white/10"
                  }`}
                >
                  S
                </div>
                <div
                  className={`w-5 h-5 rounded flex items-center justify-center font-mono text-[8px] font-bold border transition-colors ${
                    activeKeys.d
                      ? "bg-[#0DB9D0] text-[#040D1A] border-[#0DB9D0] shadow-[0_0_8px_#0DB9D0]"
                      : "bg-white/5 text-[#7ABBD4] border-white/10"
                  }`}
                >
                  D
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── FOOTER HINT / QUICK RESET ── */}
        <div className="flex items-center justify-between border-t border-white/10 pt-2 font-mono text-[8px] text-[#7ABBD4]/80">
          <span>WASD / Stick: Move</span>
          {onResetView && (
            <button
              onClick={() => {
                polarAudio.playClickFeedback();
                onResetView();
              }}
              className="flex items-center gap-1 text-[#0DB9D0] hover:text-white transition-colors uppercase font-bold"
              title="Reset Camera to Overview"
            >
              <ArrowsClockwise size={10} />
              <span>Reset</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
