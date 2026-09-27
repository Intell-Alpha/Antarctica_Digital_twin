"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { 
  House,
  Info,
  SquaresFour, 
  MapTrifold, 
  BatteryCharging, 
  Factory, 
  Wind, 
  Graph,
  WifiHigh 
} from "@phosphor-icons/react";

const NAV_LINKS = [
  { href: "/", label: "Home", icon: House },
  { href: "/about", label: "About", icon: Info },
  { href: "/dashboard", label: "Dashboard", icon: SquaresFour },
  { href: "/infrastructure", label: "Infrastructure", icon: MapTrifold },
  { href: "/energy", label: "Energy", icon: BatteryCharging },
  { href: "/logistics", label: "Logistics", icon: Factory },
  { href: "/environment", label: "Environment", icon: Wind },
  { href: "/network", label: "Network", icon: WifiHigh },
  { href: "/simulations", label: "Simulations", icon: Graph },
];

export function Navigation() {
  const pathname = usePathname();

  return (
    <header className="fixed top-0 inset-x-0 z-[60] bg-gradient-to-b from-[#020305] via-[#020305]/80 to-transparent pointer-events-none pb-8">
      <div className="max-w-7xl mx-auto px-4 py-4 md:px-8 pointer-events-auto flex justify-center">
        {/* Navigation Wrapper with fade masks for mobile scrolling */}
        <div className="relative max-w-full">
          <nav className="flex items-center p-1.5 bg-[#0a0d14]/70 backdrop-blur-2xl border border-white/10 rounded-full shadow-[0_8px_32px_rgba(0,0,0,0.8),inset_0_1px_1px_rgba(255,255,255,0.1)] overflow-x-auto no-scrollbar mask-image-fade">
            
            {/* Subtle tactical scanline overlay over the navbar */}
            <div className="absolute inset-0 pointer-events-none rounded-full bg-[repeating-linear-gradient(90deg,transparent,transparent_2px,rgba(255,255,255,0.02)_2px,rgba(255,255,255,0.02)_4px)]" />

            <ul className="flex items-center gap-1 min-w-max px-2 relative z-10">
              {NAV_LINKS.map((link) => {
                const isActive = pathname === link.href;
                const Icon = link.icon;
                
                return (
                  <li key={link.href} className="relative">
                    <Link
                      href={link.href}
                      className={cn(
                        "group relative flex items-center gap-2 px-4 py-2 rounded-full transition-colors duration-300",
                        isActive ? "text-white" : "text-zinc-400 hover:text-zinc-200"
                      )}
                    >
                      {/* Premium Active Pill with glow and gradient */}
                      {isActive && (
                        <motion.div
                          layoutId="active_nav_pill"
                          className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 to-indigo-500/10 rounded-full border border-cyan-500/20 shadow-[inset_0_0_12px_rgba(34,211,238,0.1)]"
                          transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                        />
                      )}
                      
                      {/* Active state indicator dot */}
                      {isActive && (
                         <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.8)]" />
                      )}
                      
                      <Icon 
                        size={16} 
                        weight={isActive ? "fill" : "regular"} 
                        className={cn("relative z-10 transition-colors", isActive && "text-cyan-400")}
                      />
                      <span className="relative z-10 text-[11px] font-mono uppercase tracking-widest font-semibold">
                        {link.label}
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
        </div>
      </div>
    </header>
  );
}
