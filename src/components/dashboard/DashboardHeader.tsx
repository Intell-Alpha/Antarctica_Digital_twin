"use client";

import { usePathname } from "next/navigation";
import { ThemeSwitcher } from "@/components/ThemeSwitcher";
import { DASHBOARD_LINKS } from "./DashboardSidebar";

export function DashboardHeader() {
  const pathname = usePathname();
  const currentLink = DASHBOARD_LINKS.find((l) => l.href === pathname);

  return (
    <header className="h-14 px-8 border-b border-theme flex items-center justify-between shrink-0 bg-theme-panel backdrop-blur-xl z-20">
      <div className="flex items-center gap-3">
        <span className="font-mono text-xs font-bold uppercase tracking-widest text-accent">
          ANTARCTICA DIGITAL TWIN
        </span>
        <span className="text-muted">/</span>
        <span className="font-mono text-xs font-semibold uppercase text-foreground">
          {currentLink?.label || "Telemetry Cockpit"}
        </span>
      </div>

      <div className="flex items-center gap-3">
        <ThemeSwitcher variant="pill" showLabel={true} />
      </div>
    </header>
  );
}
