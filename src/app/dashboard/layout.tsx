"use client";

import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-theme-base text-foreground font-sans flex">
      {/* SIDEBAR NAVIGATION */}
      <DashboardSidebar />

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 relative overflow-hidden flex flex-col h-screen bg-theme-base">
        {/* TOP HEADER */}
        <DashboardHeader />

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
