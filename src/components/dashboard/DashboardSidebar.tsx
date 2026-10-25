"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  SquaresFour,
  MapTrifold,
  BatteryCharging,
  Package,
  Wind,
  Radio,
  Cpu,
  WarningCircle,
  CaretLeft,
  Cube,
  Icon,
  X
} from "@phosphor-icons/react";
import { cn } from "@/lib/utils";
import { useNetwork } from "@/context/NetworkContext";

export interface NavLinkItem {
  href: string;
  label: string;
  icon: Icon;
}

export const DASHBOARD_LINKS: NavLinkItem[] = [
  { href: "/dashboard", label: "Overview", icon: SquaresFour },
  { href: "/twin", label: "3D Maitri Twin", icon: Cube },
  { href: "/twin/bharati", label: "3D Bharati Twin", icon: Cube },
  { href: "/dashboard/infrastructure", label: "Infrastructure", icon: MapTrifold },
  { href: "/dashboard/energy", label: "Energy & Power", icon: BatteryCharging },
  { href: "/dashboard/logistics", label: "Logistics", icon: Package },
  { href: "/dashboard/environment", label: "Environment", icon: Wind },
  { href: "/dashboard/communications", label: "Network Edge", icon: Radio },
  { href: "/dashboard/simulations", label: "Simulations", icon: Cpu },
  { href: "/dashboard/alerts", label: "Active Alerts", icon: WarningCircle },
];

export interface DashboardSidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export function DashboardSidebar({ isOpen = false, onClose }: DashboardSidebarProps) {
  const pathname = usePathname();
  const { isOnline, latencyMs, isUsingCachedData } = useNetwork();
  const backendOnline = isOnline && !isUsingCachedData;
  const latency = latencyMs || 58;

  return (
    <aside
      className={cn(
        "w-64 border-r border-theme bg-theme-panel flex flex-col pt-4 pb-4 shrink-0 relative z-20",
        "fixed inset-y-0 left-0 transform transition-transform duration-300 ease-in-out",
        "md:relative md:transform-none",
        isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
      )}
    >
      <div className="px-4 mb-6 flex items-center justify-between">
        <Link
          href="/"
          className="flex items-center gap-2 px-3 py-2 bg-white/[0.04] hover:bg-white/[0.08] text-muted hover:text-foreground border border-white/[0.08] rounded-lg transition-all duration-300 font-mono text-[10px] uppercase tracking-wider w-fit group"
        >
          <CaretLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
          Back to Home
        </Link>
        {onClose && (
          <button
            onClick={onClose}
            className="md:hidden p-2 text-muted hover:text-foreground hover:bg-white/[0.08] rounded-lg transition-colors"
          >
            <X size={18} />
          </button>
        )}
      </div>

      <div className="px-6 mb-6 flex flex-col">
        <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-accent mb-1">
          NCPOR Mission Command
        </span>
        <span className="font-sans font-bold text-lg tracking-wide text-foreground">
          Digital Twin
        </span>
      </div>

      <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
        {DASHBOARD_LINKS.map((link) => {
          const active = pathname === link.href;
          const LinkIcon = link.icon;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group",
                active
                  ? "bg-accent/15 text-accent font-semibold border border-accent/25"
                  : "text-muted hover:text-foreground hover:bg-white/[0.04]"
              )}
            >
              <LinkIcon
                size={18}
                weight={active ? "fill" : "regular"}
                className={active ? "drop-shadow-[0_0_8px_rgba(13,185,208,0.5)]" : "group-hover:text-accent transition-colors"}
              />
              <span className="font-mono text-[11px] uppercase tracking-wider">
                {link.label}
              </span>
            </Link>
          );
        })}
      </nav>

      {/* LIVE BACKEND STATUS WIDGET */}
      <div className="px-4 pt-4 border-t border-theme">
        <div className="p-2.5 rounded-xl bg-black/30 border border-white/[0.08] flex items-center justify-between shadow-inner">
          <div className="flex items-center gap-2.5">
            <span
              className={`w-2 h-2 rounded-full shrink-0 ${
                backendOnline ? "bg-[#00D4A0] shadow-[0_0_8px_#00D4A0] animate-pulse" : "bg-[#D49020]"
              }`}
            />
            <div className="flex flex-col">
              <span className="font-mono text-[9px] uppercase tracking-wider text-foreground font-semibold">
                {backendOnline ? "EXPRESS :5000" : "LOCAL STORE"}
              </span>
              <span className="font-mono text-[8px] text-muted">
                {backendOnline ? "LIVE TELEMETRY" : "STANDALONE"}
              </span>
            </div>
          </div>
          <span
            className={`font-mono text-[9px] px-1.5 py-0.5 rounded font-bold ${
              backendOnline
                ? "bg-[#00D4A0]/10 text-[#00D4A0] border border-[#00D4A0]/30"
                : "bg-[#D49020]/10 text-[#D49020] border border-[#D49020]/30"
            }`}
          >
            {backendOnline ? `${latency}ms` : "OFFLINE"}
          </span>
        </div>
      </div>
    </aside>
  );
}
