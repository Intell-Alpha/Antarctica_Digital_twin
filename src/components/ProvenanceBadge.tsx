import { cn } from "@/lib/utils";

type ProvenanceType = 
  | "OFFICIAL" 
  | "DOCUMENTARY" 
  | "PROJECT_ASSUMPTION" 
  | "INFERENCE" 
  | "LIVE_SENSOR" 
  | "SIMULATED";

interface ProvenanceBadgeProps {
  type: ProvenanceType;
  className?: string;
}

const provenanceConfig: Record<ProvenanceType, { label: string; color: string; dotClass: string }> = {
  OFFICIAL: {
    label: "OFFICIAL",
    color: "text-[#00D4A0] bg-[#00D4A0]/10 border-[#00D4A0]/30",
    dotClass: "bg-[#00D4A0] shadow-[0_0_8px_#00D4A0]",
  },
  DOCUMENTARY: {
    label: "DOCUMENTARY",
    color: "text-[#EBF5FC] bg-white/5 border-white/10",
    dotClass: "bg-white shadow-[0_0_8px_rgba(255,255,255,0.5)]",
  },
  PROJECT_ASSUMPTION: {
    label: "ASSUMPTION",
    color: "text-[#D93030] bg-[#D93030]/10 border-[#D93030]/30",
    dotClass: "bg-[#D93030] shadow-[0_0_8px_#D93030]",
  },
  INFERENCE: {
    label: "INFERENCE",
    color: "text-[#D49020] bg-[#D49020]/10 border-[#D49020]/30",
    dotClass: "bg-[#D49020] shadow-[0_0_8px_#D49020]",
  },
  LIVE_SENSOR: {
    label: "LIVE SENSOR",
    color: "text-[#0DB9D0] bg-[#0DB9D0]/10 border-[#0DB9D0]/30",
    dotClass: "bg-[#0DB9D0] shadow-[0_0_8px_#0DB9D0] animate-pulse",
  },
  SIMULATED: {
    label: "SIMULATED",
    color: "text-[#7B5EC8] bg-[#7B5EC8]/10 border-[#7B5EC8]/30",
    dotClass: "bg-[#7B5EC8] shadow-[0_0_8px_#7B5EC8]",
  },
};

export function ProvenanceBadge({ type, className }: ProvenanceBadgeProps) {
  const config = provenanceConfig[type];

  return (
    <div
      className={cn(
        "inline-flex items-center gap-1.5 px-2 py-0.5 rounded border font-mono text-[9px] uppercase tracking-widest transition-colors",
        config.color,
        className
      )}
      title={`Data Source: ${type}`}
    >
      <span className={cn("w-1.5 h-1.5 rounded-full", config.dotClass)} />
      {config.label}
    </div>
  );
}
