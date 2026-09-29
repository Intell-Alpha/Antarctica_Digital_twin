"use client";

import React, { useState } from "react";
import {
  Flask,
  Lightning,
  Waves,
  Wind,
  WarningCircle,
  CheckCircle,
  ArrowRight,
  ArrowsClockwise,
  X,
  CaretRight,
  ShieldCheck,
  GasPump,
  Radio,
  ThermometerCold,
} from "@phosphor-icons/react";
import { api, Station } from "@/lib/api";

export interface SimulationResultPayload {
  scenarioId: string;
  scenarioName: string;
  baseline: {
    powerDemandKw: number;
    fuelConsumptionDayL: number;
    fuelAutonomyDays: number;
    survivabilityScore?: number;
    stationHealth?: string;
  };
  simulated: {
    powerDemandKw: number;
    fuelConsumptionDayL: number;
    fuelAutonomyDays: number;
    survivabilityScore: number;
    stationHealth: string;
    criticalAlerts?: string[];
    alerts?: string[];
    recommendedActions?: string[];
  };
}

interface TwinWhatIfSimulatorProps {
  station: Station;
  onSimulationChange?: (simResult: SimulationResultPayload | null) => void;
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  hideTrigger?: boolean;
}

export function TwinWhatIfSimulator({
  station,
  onSimulationChange,
  isOpen: controlledIsOpen,
  onOpenChange,
  hideTrigger = false,
}: TwinWhatIfSimulatorProps) {
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const isOpen = controlledIsOpen !== undefined ? controlledIsOpen : internalIsOpen;

  const setIsOpen = (val: boolean | ((prev: boolean) => boolean)) => {
    const nextVal = typeof val === "function" ? val(isOpen) : val;
    if (controlledIsOpen === undefined) {
      setInternalIsOpen(nextVal);
    }
    if (onOpenChange) {
      onOpenChange(nextVal);
    }
  };

  const [activeSimulation, setActiveSimulation] = useState<SimulationResultPayload | null>(null);
  const [isComputing, setIsComputing] = useState(false);
  const [selectedScenarioId, setSelectedScenarioId] = useState<string>("EXTREME_WEATHER");

  const SCENARIOS = [
    {
      id: "EXTREME_WEATHER",
      label: "Katabatic Blizzard (-40°C)",
      badge: "SCENARIO A · WEATHER",
      desc: "+39.6% heating demand spike, thermal stress on intake loops",
      icon: Wind,
      color: "#00A8FF",
    },
    {
      id: "GENERATOR_FAILURE",
      label: "Primary GenSet 01 Trip",
      badge: "SCENARIO B · POWER",
      desc: "Instantaneous loss of 82.5 kW, UPS battery failover & load shedding",
      icon: Lightning,
      color: "#FF0055",
    },
    {
      id: "INCREASED_ENERGY_DEMAND",
      label: "Peak Science (+40% Load)",
      badge: "SCENARIO C · ENERGY",
      desc: "Deep ice core drilling & radar campaigns at 88% generation capacity",
      icon: Flask,
      color: "#FFAA00",
    },
    {
      id: "SUPPLY_DELAY",
      label: "Sea-Ice Blockade (60d Delay)",
      badge: "SCENARIO D · LOGISTICS",
      desc: "Austral summer vessel blocked by pack ice; fuel autonomy drops",
      icon: GasPump,
      color: "#D49020",
    },
    {
      id: "COMMUNICATION_OUTAGE",
      label: "Satellite Link Blackout",
      badge: "SCENARIO E · NETWORK",
      desc: "INSAT-3DR loss; activates local NVMe Store-and-Forward buffering",
      icon: Radio,
      color: "#00D4A0",
    },
  ];

  const handleRunScenario = async (scenarioId: string) => {
    setSelectedScenarioId(scenarioId);
    setIsComputing(true);

    try {
      const res = await api.runSimulation(station, scenarioId);
      if (res?.success && res.simulation) {
        const payload: SimulationResultPayload = res.simulation;
        setActiveSimulation(payload);
        if (onSimulationChange) onSimulationChange(payload);
      }
    } catch (err) {
      console.error("Simulation run error", err);
    } finally {
      setIsComputing(false);
    }
  };

  const handleReset = () => {
    setActiveSimulation(null);
    if (onSimulationChange) onSimulationChange(null);
  };

  return (
    <>
      {/* ── OPTIONAL FLOATING TRIGGER BUTTON (When not invoked via top bar) ── */}
      {!hideTrigger && (
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg font-mono text-[11px] font-medium tracking-wide backdrop-blur-xl transition-colors shadow-lg ${
            activeSimulation
              ? "bg-amber-950/80 text-amber-200 border border-amber-500/50"
              : "bg-[#070D18]/90 hover:bg-white/10 border border-white/[0.12] text-amber-300 hover:text-white"
          }`}
          title="Open What-If Counterfactual Crisis Studio"
        >
          <Flask size={14} className={activeSimulation ? "text-amber-400" : "text-amber-300"} />
          <span>{activeSimulation ? "SIM ACTIVE: " + activeSimulation.scenarioId : "WHAT-IF SIM"}</span>
        </button>
      )}

      {/* ── WHAT-IF SIMULATION POPOVER DRAWER ── */}
      {isOpen && (
        <div className="absolute top-20 right-4 sm:right-6 z-40 w-[380px] max-w-[calc(100vw-32px)] rounded-2xl bg-[#070D18]/98 border border-white/[0.14] backdrop-blur-2xl shadow-[0_24px_64px_rgba(0,0,0,0.92)] animate-in fade-in slide-in-from-top-3 duration-250 font-sans select-none overflow-hidden">
          {/* Header */}
          <div className="px-4 py-3 border-b border-white/[0.08] flex items-center justify-between bg-white/[0.02]">
            <div className="flex items-center gap-2">
              <Flask size={16} className="text-amber-400" />
              <div>
                <span className="font-mono text-[9px] uppercase tracking-wider text-amber-400 font-semibold block">
                  What-If Counterfactual Engine
                </span>
                <h4 className="font-mono text-xs font-semibold text-white tracking-wide">
                  Crisis Simulation & Risk Studio
                </h4>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              {activeSimulation && (
                <button
                  onClick={handleReset}
                  className="px-2 py-0.5 rounded-lg bg-white/10 hover:bg-white/20 text-[#7ABBD4] hover:text-white font-mono text-[9px] font-semibold transition-colors"
                  title="Reset to nominal live baseline"
                >
                  Reset
                </button>
              )}
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-xl text-[#7ABBD4] hover:text-white hover:bg-white/10 transition-colors"
              >
                <X size={14} />
              </button>
            </div>
          </div>

          {/* Scenario Selector List */}
          <div className="p-2.5 flex flex-col gap-1 max-h-[220px] overflow-y-auto custom-scrollbar">
            {SCENARIOS.map((sc) => {
              const isSelected = activeSimulation?.scenarioId === sc.id;
              const IconComp = sc.icon;
              return (
                <button
                  key={sc.id}
                  disabled={isComputing}
                  onClick={() => handleRunScenario(sc.id)}
                  className={`flex items-start gap-2.5 p-2 rounded-xl text-left transition-colors ${
                    isSelected
                      ? "bg-amber-500/15 border border-amber-500/40 text-white"
                      : "bg-white/[0.02] hover:bg-white/[0.06] border border-white/[0.06] text-[#A6C4D6]"
                  }`}
                >
                  <div
                    className="w-7 h-7 rounded-lg flex items-center justify-center border shrink-0 mt-0.5"
                    style={{
                      backgroundColor: `${sc.color}15`,
                      borderColor: `${sc.color}40`,
                      color: sc.color,
                    }}
                  >
                    <IconComp size={15} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <span className="font-mono text-xs font-semibold text-white truncate">
                        {sc.label}
                      </span>
                      {isSelected && (
                        <span className="font-mono text-[9px] px-1.5 py-0.2 rounded bg-amber-400 text-black font-semibold uppercase shrink-0">
                          ACTIVE
                        </span>
                      )}
                    </div>
                    <span className="font-sans text-[11px] text-[#7ABBD4] line-clamp-1">
                      {sc.desc}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Computing Indicator */}
          {isComputing && (
            <div className="p-3 bg-black/40 border-t border-white/5 flex items-center justify-center gap-2 font-mono text-[10px] text-[#FFAA00]">
              <ArrowsClockwise size={14} className="animate-spin" />
              <span>Calculating Monte Carlo cross-domain impacts...</span>
            </div>
          )}

          {/* Projected Impact Comparison Card */}
          {activeSimulation && !isComputing && (
            <div className="p-3 bg-black/40 border-t border-white/10 flex flex-col gap-2 animate-in fade-in duration-200">
              <div className="flex items-center justify-between text-[10px] font-mono">
                <span className="text-[#00D4A0] uppercase font-bold tracking-wider">
                  Baseline vs. Projected Impact
                </span>
                <span
                  className={`px-1.5 py-0.2 rounded font-bold ${
                    activeSimulation.simulated.survivabilityScore > 80
                      ? "bg-emerald-500/20 text-emerald-400"
                      : activeSimulation.simulated.survivabilityScore > 60
                      ? "bg-amber-500/20 text-amber-300"
                      : "bg-rose-500/20 text-rose-400"
                  }`}
                >
                  Health: {activeSimulation.simulated.stationHealth}
                </span>
              </div>

              {/* KPI Deltas */}
              <div className="grid grid-cols-3 gap-1.5 text-center font-mono">
                <div className="p-2 rounded-xl bg-white/[0.03] border border-white/5">
                  <span className="text-[8px] text-[#7ABBD4] block">POWER DEMAND</span>
                  <span className="text-xs font-bold text-white block mt-0.5">
                    {activeSimulation.simulated.powerDemandKw} kW
                  </span>
                  <span className="text-[8px] text-amber-400">
                    +{activeSimulation.simulated.powerDemandKw - activeSimulation.baseline.powerDemandKw} kW
                  </span>
                </div>

                <div className="p-2 rounded-xl bg-white/[0.03] border border-white/5">
                  <span className="text-[8px] text-[#7ABBD4] block">DAILY BURN</span>
                  <span className="text-xs font-bold text-white block mt-0.5">
                    {activeSimulation.simulated.fuelConsumptionDayL} L
                  </span>
                  <span className="text-[8px] text-amber-400">
                    +{activeSimulation.simulated.fuelConsumptionDayL - activeSimulation.baseline.fuelConsumptionDayL} L
                  </span>
                </div>

                <div className="p-2 rounded-xl bg-white/[0.03] border border-white/5">
                  <span className="text-[8px] text-[#7ABBD4] block">AUTONOMY</span>
                  <span className="text-xs font-bold text-rose-400 block mt-0.5">
                    {activeSimulation.simulated.fuelAutonomyDays}d
                  </span>
                  <span className="text-[8px] text-rose-400">
                    {activeSimulation.simulated.fuelAutonomyDays - activeSimulation.baseline.fuelAutonomyDays}d
                  </span>
                </div>
              </div>

              {/* Critical Alerts from Backend */}
              {(activeSimulation.simulated.criticalAlerts || activeSimulation.simulated.alerts) && (
                <div className="mt-1 flex flex-col gap-1">
                  <span className="text-[9px] font-mono text-rose-400 font-bold uppercase tracking-wider">
                    Automated Risk Alerts:
                  </span>
                  {(activeSimulation.simulated.criticalAlerts || activeSimulation.simulated.alerts || []).map(
                    (alert, idx) => (
                      <div
                        key={idx}
                        className="px-2 py-1 rounded-lg bg-rose-500/10 border border-rose-500/20 text-[9px] font-mono text-rose-200 flex items-start gap-1.5"
                      >
                        <WarningCircle size={12} weight="fill" className="text-rose-400 shrink-0 mt-0.5" />
                        <span>{alert}</span>
                      </div>
                    )
                  )}
                </div>
              )}

              {/* Engineering Recommendations */}
              {activeSimulation.simulated.recommendedActions && (
                <div className="mt-1 flex flex-col gap-1">
                  <span className="text-[9px] font-mono text-[#00D4A0] font-bold uppercase tracking-wider">
                    Recommended Mitigation Actions:
                  </span>
                  {activeSimulation.simulated.recommendedActions.map((action, idx) => (
                    <div
                      key={idx}
                      className="px-2 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-[9px] font-mono text-emerald-200 flex items-start gap-1.5"
                    >
                      <CheckCircle size={12} weight="fill" className="text-emerald-400 shrink-0 mt-0.5" />
                      <span>{action}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </>
  );
}
