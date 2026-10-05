"use client";

import { TopographicBg } from "@/components/TopographicBg";
import { HeroSection } from "@/components/landing/HeroSection";
import { SpatialTwinSection } from "@/components/landing/SpatialTwinSection";
import { StakesSection } from "@/components/landing/StakesSection";
import { IntelligenceSection } from "@/components/landing/IntelligenceSection";
import { DomainsBentoSection } from "@/components/landing/DomainsBentoSection";
import { GatewayFooterSection } from "@/components/landing/GatewayFooterSection";

export default function LandingPage() {
  return (
    <div className="relative w-full min-h-screen bg-transparent text-[#EBF5FC] font-sans overflow-x-hidden selection:bg-[#0DB9D0]/20">
      <TopographicBg showRadarRings={false} />

      {/* ACT I — THE VOID (Cinematic Hero) */}
      <HeroSection />

      {/* ACT 1.5 — THE SPATIAL DIGITAL TWIN (Interactive 3D WebGL Replica) */}
      <SpatialTwinSection />

      {/* ACT II — THE STAKES (Polar Survival Physics & Provenance Layer) */}
      <StakesSection />

      {/* ACT III — THE INTELLIGENCE (Real-time Cyber-Physical Engine) */}
      <IntelligenceSection />

      {/* ACT IV — THE DOMAINS (Asymmetric Subsystem Bento) */}
      <DomainsBentoSection />

      {/* ACT V — THE GATEWAY & COLOPHON (Mission Command CTA) */}
      <GatewayFooterSection />
    </div>
  );
}
