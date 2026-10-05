"use client";

import { WarningCircle } from "@phosphor-icons/react";

export interface AlertItem {
  type: string;
  title: string;
  desc: string;
}

interface AlertsPanelProps {
  activeAlerts: number;
  predictiveRisks: number;
  alertsList: AlertItem[];
}

export function AlertsPanel({ activeAlerts, predictiveRisks, alertsList }: AlertsPanelProps) {
  return (
    <div className="flex-1 min-h-[200px] border border-rose-500/40 bg-rose-500/10 dark:bg-rose-500/5 rounded-2xl p-6 flex flex-col shadow-sm relative overflow-hidden">
      {/* Subtle scanning laser line effect at top */}
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-rose-500 to-transparent opacity-60" />

      <div className="flex items-center justify-between mb-6 relative z-10">
        <div className="flex items-center gap-3">
          <WarningCircle size={20} className="text-rose-600 dark:text-rose-400 animate-pulse" weight="fill" />
          <h2 className="font-mono text-sm uppercase tracking-widest text-rose-700 dark:text-rose-300 font-extrabold">
            Active Priority Alerts ({activeAlerts}) · Predictive Risks ({predictiveRisks})
          </h2>
        </div>
      </div>

      <div className="space-y-3 relative z-10">
        {alertsList.map((alert, i) => (
          <div
            key={i}
            className="flex items-start gap-4 p-4 rounded-xl bg-theme-panel border border-rose-500/30 hover:border-rose-500/50 transition-all duration-300 shadow-sm"
          >
            <span className="mt-0.5 font-mono text-[10px] font-bold uppercase tracking-widest text-rose-700 dark:text-rose-300 bg-rose-500/15 px-2 py-0.5 rounded border border-rose-500/30">
              {alert.type}
            </span>
            <div>
              <h3 className="text-foreground text-sm font-bold mb-1">{alert.title}</h3>
              <p className="text-muted text-sm font-medium">{alert.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
