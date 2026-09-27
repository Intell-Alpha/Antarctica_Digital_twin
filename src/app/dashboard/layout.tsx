"use client";

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
  CaretLeft
} from "@phosphor-icons/react";
import { cn } from "@/lib/utils";

const DASHBOARD_LINKS = [
  { href: "/dashboard", label: "Overview", icon: SquaresFour },
  { href: "/dashboard/infrastructure", label: "Infrastructure", icon: MapTrifold },
  { href: "/dashboard/energy", label: "Energy & Power", icon: BatteryCharging },
  { href: "/dashboard/logistics", label: "Logistics", icon: Package },
  { href: "/dashboard/environment", label: "Environment", icon: Wind },
  { href: "/dashboard/communications", label: "Network Edge", icon: Radio },
  { href: "/dashboard/simulations", label: "Simulations", icon: Cpu },
  { href: "/dashboard/alerts", label: "Active Alerts", icon: WarningCircle },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-[#03060E] text-[#EBF5FC] font-sans flex">
      {/* ── SIDEBAR ── */}
      <aside className="w-64 border-r border-[#0DB9D0]/10 bg-[#040A15]/80 flex flex-col pt-4 pb-4 shrink-0 relative z-20">
        <div className="px-4 mb-6">
          <Link 
            href="/" 
            className="flex items-center gap-2 px-3 py-2 bg-[#0D3040]/30 hover:bg-[#0DB9D0]/20 text-[#7ABBD4] hover:text-[#0DB9D0] border border-[#0D3040]/50 hover:border-[#0DB9D0]/50 rounded-lg transition-all duration-300 font-mono text-[10px] uppercase tracking-wider w-fit group"
          >
            <CaretLeft size={14} className="group-hover:-translate-x-1 transition-transform" /> 
            Back to Home
          </Link>
        </div>

        <div className="px-6 mb-8 flex flex-col">
          <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#0DB9D0] mb-1">
            NCPOR Mission Command
          </span>
          <span className="font-sans font-bold text-lg tracking-wide text-white">
            Digital Twin
          </span>
        </div>

        <nav className="flex-1 px-4 space-y-1">
          {DASHBOARD_LINKS.map((link) => {
            const active = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group",
                  active
                    ? "bg-[#0DB9D0]/10 text-[#0DB9D0]"
                    : "text-[#4A7A8E] hover:text-[#7ABBD4] hover:bg-white/[0.02]"
                )}
              >
                <link.icon 
                  size={18} 
                  weight={active ? "fill" : "regular"} 
                  className={active ? "drop-shadow-[0_0_8px_rgba(13,185,208,0.5)]" : "group-hover:text-[#0DB9D0] transition-colors"}
                />
                <span className="font-mono text-[11px] uppercase tracking-wider font-semibold">
                  {link.label}
                </span>
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* ── MAIN CONTENT AREA ── */}
      <main className="flex-1 relative overflow-hidden flex flex-col h-screen">
        {/* Subtle grid background for the software environment */}
        <div 
          className="absolute inset-0 z-0 opacity-[0.03] pointer-events-none" 
          style={{ backgroundImage: 'radial-gradient(#0DB9D0 1px, transparent 1px)', backgroundSize: '32px 32px' }}
        />
        
        <div className="flex-1 overflow-y-auto z-10 p-8 sm:p-12 relative">
          {children}
        </div>
      </main>
    </div>
  );
}
