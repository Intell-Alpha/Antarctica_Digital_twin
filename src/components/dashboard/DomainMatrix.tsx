"use client";

export interface DomainStatus {
  name: string;
  status: string;
  borderColor?: string;
  color?: string;
}

interface DomainMatrixProps {
  domains: DomainStatus[];
}

export function DomainMatrix({ domains }: DomainMatrixProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {domains.map((domain) => (
        <div
          key={domain.name}
          className={`bezel-shell p-0.5 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg cursor-default ${
            domain.borderColor || "border-theme"
          }`}
        >
          <div className="bezel-core p-5 flex flex-col justify-between h-[110px] bg-theme-panel group hover:bg-theme-base">
            <div className="flex justify-between items-start">
              <span className="font-mono text-[10px] uppercase tracking-widest text-muted max-w-[75%] group-hover:text-foreground font-bold transition-colors">
                {domain.name}
              </span>
              <div
                className="w-1.5 h-1.5 rounded-full bg-accent shadow-[0_0_8px_var(--accent-primary)] animate-pulse"
                title="LIVE_SENSOR"
              />
            </div>
            <div>
              <span className={`font-bold text-lg ${domain.color || "text-foreground"}`}>
                {domain.status}
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
