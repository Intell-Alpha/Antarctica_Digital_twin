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
import { ThemeSwitcher } from "@/components/ThemeSwitcher";

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
    <div className="min-h-screen bg-theme-base text-foreground font-sans flex">
      {/* ── SIDEBAR ── */}
      <aside className="w-64 border-r border-theme bg-theme-panel flex flex-col pt-4 pb-4 shrink-0 relative z-20">
        <div className="px-4 mb-6 flex items-center justify-between">
          <Link 
            href="/" 
            className="flex items-center gap-2 px-3 py-2 bg-white/[0.04] hover:bg-white/[0.08] text-muted hover:text-foreground border border-white/[0.08] rounded-lg transition-all duration-300 font-mono text-[10px] uppercase tracking-wider w-fit group"
          >
            <CaretLeft size={14} className="group-hover:-translate-x-1 transition-transform" /> 
            Back to Home
          </Link>
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
                <link.icon 
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

        {/* ── LIVE BACKEND STATUS WIDGET ── */}
        <div className="px-4 pt-4 border-t border-theme">
          <div className="p-2.5 rounded-xl bg-black/30 border border-white/[0.08] flex items-center justify-between shadow-inner">
            <div className="flex items-center gap-2.5">
              <span className={`w-2 h-2 rounded-full shrink-0 ${backendOnline ? 'bg-[#00D4A0] shadow-[0_0_8px_#00D4A0] animate-pulse' : 'bg-[#D49020]'}`} />
              <div className="flex flex-col">
                <span className="font-mono text-[9px] uppercase tracking-wider text-foreground font-semibold">
                  {backendOnline ? "EXPRESS :5000" : "LOCAL STORE"}
                </span>
                <span className="font-mono text-[8px] text-muted">
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
      <main className="flex-1 relative overflow-hidden flex flex-col h-screen bg-theme-base">
        {/* Top Header Bar inside Dashboard */}
        <header className="h-14 px-8 border-b border-theme flex items-center justify-between shrink-0 bg-theme-panel backdrop-blur-xl z-20">
          <div className="flex items-center gap-3">
            <span className="font-mono text-xs font-bold uppercase tracking-widest text-accent">
              ANTARCTICA DIGITAL TWIN
            </span>
            <span className="text-muted">/</span>
            <span className="font-mono text-xs font-semibold uppercase text-foreground">
              {DASHBOARD_LINKS.find(l => l.href === pathname)?.label || "Telemetry Cockpit"}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <ThemeSwitcher variant="pill" showLabel={true} />
          </div>
        </header>

        {/* Subtle grid background for the software environment */}
        <div 
          className="absolute inset-0 z-0 opacity-[0.03] pointer-events-none" 
          style={{ backgroundImage: 'radial-gradient(var(--accent-primary) 1px, transparent 1px)', backgroundSize: '32px 32px' }}
        />
        
        <div className="flex-1 overflow-y-auto z-10 p-6 sm:p-10 relative">
          {children}
        </div>
      </main>
    </div>
  );
}
