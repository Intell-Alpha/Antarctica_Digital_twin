"use client";

import { usePathname } from "next/navigation";
import { List } from "@phosphor-icons/react";
import { ThemeSwitcher } from "@/components/ThemeSwitcher";
import { DASHBOARD_LINKS } from "./DashboardSidebar";
import { useNetwork } from "@/context/NetworkContext";

export interface DashboardHeaderProps {
  onMenuClick?: () => void;
}

export function DashboardHeader({ onMenuClick }: DashboardHeaderProps) {
  const pathname = usePathname();
  const currentLink = DASHBOARD_LINKS.find((l) => l.href === pathname);
  const { isOnline, latencyMs, isUsingCachedData } = useNetwork();

  return (
    <header className="h-14 px-8 border-b border-theme flex items-center justify-between shrink-0 bg-theme-panel backdrop-blur-xl z-20">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="md:hidden p-2 text-muted hover:text-foreground hover:bg-white/[0.08] rounded-lg transition-colors"
        >
          <List size={20} />
        </button>
        <span className="font-mono text-xs font-bold uppercase tracking-widest text-accent">
          ANTARCTICA DIGITAL TWIN
        </span>
        <span className="text-muted">/</span>
        <span className="font-mono text-xs font-semibold uppercase text-foreground">
          {currentLink?.label || "Telemetry Cockpit"}
        </span>
      </div>

      <div className="flex items-center gap-3">
        {/* Uplink Telemetry Status Indicator */}
        <div className="hidden sm:flex items-center gap-2 px-2.5 py-1 rounded-full bg-black/30 border border-white/[0.08] font-mono text-[9px] uppercase tracking-wider">
          <span
            className={`w-1.5 h-1.5 rounded-full ${
              isOnline && !isUsingCachedData
                ? "bg-[#00D4A0] shadow-[0_0_6px_#00D4A0] animate-pulse"
                : "bg-[#D49020] shadow-[0_0_6px_#D49020]"
            }`}
          />
          <span className={isOnline && !isUsingCachedData ? "text-[#00D4A0]" : "text-[#D49020]"}>
            {isOnline && !isUsingCachedData ? `LIVE (${latencyMs || 58}ms)` : "AUTONOMOUS CACHE"}
          </span>
        </div>

        <ThemeSwitcher variant="pill" showLabel={true} />
      </div>
    </header>
  );
}
