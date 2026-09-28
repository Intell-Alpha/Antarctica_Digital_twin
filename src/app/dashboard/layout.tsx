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
  Cube
} from "@phosphor-icons/react";
import { cn } from "@/lib/utils";
import { api } from "@/lib/api";

const DASHBOARD_LINKS = [
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

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [backendOnline, setBackendOnline] = useState<boolean | null>(null);
  const [latency, setLatency] = useState<number>(0);

  useEffect(() => {
    let mounted = true;
    const check = async () => {
      const res = await api.checkBackendStatus();
      if (mounted) {
        setBackendOnline(res.online);
        setLatency(res.latencyMs);
      }
    };
    check();
    const interval = setInterval(check, 5000);
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

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

        {/* ── LIVE BACKEND STATUS WIDGET ── */}
        <div className="mt-auto px-4 pt-4 border-t border-[#0DB9D0]/10">
          <div className="p-2.5 rounded-xl bg-[#03060E]/90 border border-white/[0.08] flex items-center justify-between shadow-inner">
            <div className="flex items-center gap-2.5">
              <span className={`w-2 h-2 rounded-full shrink-0 ${backendOnline ? 'bg-[#00D4A0] shadow-[0_0_8px_#00D4A0] animate-pulse' : 'bg-[#D49020]'}`} />
              <div className="flex flex-col">
                <span className="font-mono text-[9px] uppercase tracking-wider text-zinc-300 font-semibold">
                  {backendOnline ? "EXPRESS :5000" : "LOCAL STORE"}
                </span>
                <span className="font-mono text-[8px] text-zinc-500">
                  {backendOnline ? "LIVE TELEMETRY" : "STANDALONE"}
                </span>
              </div>
            </div>
            <span className={`font-mono text-[9px] px-1.5 py-0.5 rounded font-bold ${backendOnline ? 'bg-[#00D4A0]/10 text-[#00D4A0] border border-[#00D4A0]/30' : 'bg-[#D49020]/10 text-[#D49020] border border-[#D49020]/30'}`}>
              {backendOnline ? `${latency}ms` : "OFFLINE"}
            </span>
          </div>
        </div>
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
