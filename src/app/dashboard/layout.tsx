"use client";

import { useState } from "react";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { MockDataBadge } from "@/components/MockDataBadge";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-theme-base text-foreground font-sans flex">
      {/* MOBILE BACKDROP */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-10 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* SIDEBAR NAVIGATION */}
      <DashboardSidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 relative overflow-hidden flex flex-col h-screen bg-theme-base md:ml-0">
        {/* TOP HEADER */}
        <DashboardHeader onMenuClick={() => setIsSidebarOpen(true)} />

        {/* MOCK DATA BADGE - Example placement, can be connected to API state later */}
        <div className="absolute top-20 right-6 z-50">
          <MockDataBadge />
        </div>

        {/* BACKGROUND PATTERN */}
        <div
          className="absolute inset-0 z-0 opacity-[0.03] pointer-events-none"
          style={{
            backgroundImage: "radial-gradient(var(--accent-primary) 1px, transparent 1px)",
            backgroundSize: "32px 32px",
          }}
        />

        <div className="flex-1 overflow-y-auto z-10 p-6 sm:p-10 relative">
          {children}
        </div>
      </main>
    </div>
  );
}
