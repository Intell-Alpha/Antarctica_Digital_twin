"use client";

import { cn } from "@/lib/utils";
import { SystemHealthState } from "@/lib/telemetry";

export type HeartbeatStatus = SystemHealthState | "LIVE" | "OFFLINE";

interface HeartbeatDotProps {
  className?: string;
  size?: "sm" | "md" | "lg";
  status?: HeartbeatStatus;
  label?: string;
  pulse?: boolean;
}

export function HeartbeatDot({
  className,
  size = "md",
  status = "LIVE",
  label,
  pulse = true,
}: HeartbeatDotProps) {
  const sizeClasses = {
    sm: "w-2 h-2",
    md: "w-2.5 h-2.5",
    lg: "w-3 h-3",
  }[size];

  const getColorConfig = (s: HeartbeatStatus) => {
    switch (s) {
      case "LIVE":
      case "NORMAL":
        return {
          dot: "bg-emerald-400",
          shadow: "shadow-[0_0_8px_rgba(52,211,153,0.4)]",
          ring: "border-emerald-400/30",
          text: "text-slate-300",
        };
      case "WATCH":
      case "MAINTENANCE_DUE":
      case "DEGRADED":
        return {
          dot: "bg-amber-400",
          shadow: "shadow-[0_0_8px_rgba(251,191,36,0.4)]",
          ring: "border-amber-400/30",
          text: "text-amber-400",
        };
      case "CRITICAL":
        return {
          dot: "bg-rose-400",
          shadow: "shadow-[0_0_8px_rgba(251,113,133,0.5)]",
          ring: "border-rose-400/30",
          text: "text-rose-400",
        };
      case "OFFLINE":
      default:
        return {
          dot: "bg-slate-500",
          shadow: "shadow-none",
          ring: "border-slate-500/20",
          text: "text-slate-500",
        };
    }
  };

  const colorConfig = getColorConfig(status);

  return (
    <div className={cn("inline-flex items-center gap-2 font-mono text-[11px] tracking-widest uppercase", className)}>
      <span className="relative flex items-center justify-center">
        {pulse && status !== "OFFLINE" && (
          <span
            className={cn(
              "absolute inset-0 rounded-full animate-heartbeat pointer-events-none",
              colorConfig.dot
            )}
          />
        )}
        <span
          className={cn(
            "relative rounded-full transition-transform duration-300",
            sizeClasses,
            colorConfig.dot,
            colorConfig.shadow
          )}
        />
      </span>
      {label && (
        <span className={cn("font-medium", colorConfig.text)}>
          {label}
        </span>
      )}
    </div>
  );
}
