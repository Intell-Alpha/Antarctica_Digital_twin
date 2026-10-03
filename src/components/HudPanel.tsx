"use client";

import React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { HeartbeatDot, HeartbeatStatus } from "./HeartbeatDot";
import { DraggablePanel } from "./DraggablePanel";

interface HudPanelProps {
  children?: React.ReactNode;
  tag?: string;
  title?: string;
  subtitle?: string;
  status?: HeartbeatStatus;
  statusLabel?: string;
  href?: string;
  className?: string;
  sourceTag?: "SIMULATED" | "SENSOR" | "INFERRED";
  cornerIndicator?: React.ReactNode;
  hoverEffect?: boolean;
  draggable?: boolean;
}

export function HudPanel({
  children,
  tag,
  title,
  subtitle,
  status,
  statusLabel,
  href,
  className,
  sourceTag = "SIMULATED",
  cornerIndicator,
  hoverEffect = true,
  draggable = true,
}: HudPanelProps) {
  const panelContent = (
    <div
      className={cn(
        "bezel-shell relative overflow-hidden group flex flex-col justify-between h-full",
        hoverEffect && "cursor-pointer",
        className
      )}
    >
      <div className="bezel-core flex flex-col justify-between flex-1 relative overflow-hidden">
        {/* Top subtle hairline highlight on hover */}
        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

        {/* Header bar */}
        {(tag || title || status || cornerIndicator) && (
          <div className="flex items-center justify-between mb-4 border-b border-white/[0.04] pb-3">
            <div className="flex items-center gap-2.5">
              {tag && (
                <span className="font-mono text-[10px] uppercase tracking-wider text-slate-400 bg-white/[0.03] px-2 py-0.5 rounded border border-white/[0.06]">
                  {tag}
                </span>
              )}
              {title && (
                <h3 className="font-headline text-sm font-semibold tracking-tight text-white">
                  {title}
                </h3>
              )}
            </div>

            <div className="flex items-center gap-3">
              {cornerIndicator}
              {status && (
                <HeartbeatDot
                  size="sm"
                  status={status}
                  label={statusLabel}
                  pulse={status === "LIVE"}
                />
              )}
            </div>
          </div>
        )}

        {subtitle && (
          <p className="text-xs text-slate-400 mb-4 font-body -mt-2 leading-relaxed">
            {subtitle}
          </p>
        )}

        {/* Main Content */}
        <div className="relative z-10 flex-1">{children}</div>

        {/* Bottom Technical Metadata */}
        {sourceTag && (
          <div className="mt-4 pt-3 border-t border-white/[0.04] flex items-center justify-between text-[10px] font-mono text-slate-500">
            <span className="tracking-widest uppercase">
              SRC: <span className="text-slate-300 font-medium">{sourceTag}</span>
            </span>
            <span className="tracking-widest text-slate-600">
              MAITRI_TWIN // {new Date().getFullYear()}
            </span>
          </div>
        )}
      </div>
    </div>
  );

  if (href) {
    const linkContent = (
      <Link href={href} className="block h-full transition-transform duration-200 hover:-translate-y-0.5">
        {panelContent}
      </Link>
    );

    if (draggable) {
      return <DraggablePanel className="h-full">{linkContent}</DraggablePanel>;
    }
    return linkContent;
  }

  if (draggable) {
    return <DraggablePanel className="h-full">{panelContent}</DraggablePanel>;
  }

  return panelContent;
}

