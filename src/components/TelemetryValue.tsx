"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { SystemHealthState } from "@/lib/telemetry";

export type TelemetryStatus = SystemHealthState | "OFFLINE";

interface TelemetryValueProps {
  value: number | string;
  unit?: string;
  precision?: number;
  isLive?: boolean;
  status?: TelemetryStatus;
  size?: "sm" | "md" | "lg" | "xl" | "hero";
  className?: string;
  sourceTag?: "SIMULATED" | "SENSOR" | "INFERRED";
}

export function TelemetryValue({
  value,
  unit,
  precision = 1,
  isLive = true,
  status = "NORMAL",
  size = "md",
  className,
  sourceTag,
}: TelemetryValueProps) {
  const numericValue = typeof value === "number" ? value : parseFloat(value);
  const isNumber = !isNaN(numericValue) && typeof value === "number";

  const [displayValue, setDisplayValue] = useState<number | string>(
    isNumber ? 0 : value
  );

  useEffect(() => {
    if (!isNumber) {
      setDisplayValue(value);
      return;
    }

    const duration = 900; // ms
    const startTime = performance.now();
    const startVal = typeof displayValue === "number" ? displayValue : 0;
    const targetVal = numericValue;

    let animId: number;

    const tick = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // easeOutCubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = startVal + (targetVal - startVal) * eased;

      setDisplayValue(current);

      if (progress < 1) {
        animId = requestAnimationFrame(tick);
      } else {
        setDisplayValue(targetVal);
      }
    };

    animId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animId);
  }, [value, isNumber]);

  const sizeStyles = {
    sm: "text-base font-semibold",
    md: "text-2xl font-semibold",
    lg: "text-3xl font-semibold tracking-tight",
    xl: "text-4xl font-bold tracking-tight",
    hero: "text-5xl md:text-6xl font-bold tracking-tight",
  }[size];

  // Deep Muted Arctic Slate Palette: Pure white for live/nominal values, calm alerts
  let textColor = "text-white";
  if (status === "WATCH" || status === "MAINTENANCE_DUE" || status === "DEGRADED") {
    textColor = "text-amber-400";
  } else if (status === "CRITICAL") {
    textColor = "text-rose-400";
  } else if (status === "OFFLINE") {
    textColor = "text-slate-500";
  } else {
    textColor = "text-white";
  }

  const formattedDisplay =
    isNumber && typeof displayValue === "number"
      ? displayValue.toLocaleString(undefined, {
          minimumFractionDigits: precision,
          maximumFractionDigits: precision,
        })
      : displayValue;

  return (
    <div className={cn("inline-flex items-baseline gap-1.5 font-telemetry select-none", className)}>
      <span className={cn(sizeStyles, textColor, "transition-colors duration-200")}>
        {formattedDisplay}
      </span>
      {unit && (
        <span className="text-xs font-mono text-slate-400 tracking-wider uppercase font-medium">
          {unit}
        </span>
      )}
      {sourceTag && (
        <span className="ml-1 text-[9px] font-mono px-1.5 py-0.5 rounded bg-white/[0.04] border border-white/[0.08] text-slate-400 tracking-widest uppercase">
          {sourceTag}
        </span>
      )}
    </div>
  );
}
