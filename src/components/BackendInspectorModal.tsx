"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Cpu, X, CheckCircle, Warning, Play, ArrowsCounterClockwise, TerminalWindow } from "@phosphor-icons/react";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  backendOnline: boolean;
  latencyMs: number;
}

const ENDPOINTS = [
  { path: "/api/synthetic-data?station=BHARATI", method: "GET", description: "Historical 2015-2022 NCPOR weather & 24h synthetic telemetry" },
  { path: "/api/stations", method: "GET", description: "Station metadata & commissioning records" },
  { path: "/api/infrastructure?station=BHARATI", method: "GET", description: "Building assets & health condition scores" },
  { path: "/api/energy?station=BHARATI", method: "GET", description: "MAN CHP 1-3 generator telemetry & fuel flow" },
  { path: "/api/logistics?station=BHARATI", method: "GET", description: "Fuel farm, food rations & resupply corridor" },
  { path: "/api/environment?station=BHARATI", method: "GET", description: "BARC radiation (IERMON), weather & magnetometers" },
  { path: "/api/network?station=BHARATI", method: "GET", description: "ISRO NRSC C-band link & edge buffer queue" },
  { path: "/api/telemetry?station=BHARATI", method: "GET", description: "Live streaming logs & status ticks" },
  { path: "/api/simulation", method: "POST", description: "What-if scenario calculation engine" },
];

export function BackendInspectorModal({ isOpen, onClose, backendOnline, latencyMs }: Props) {
  const [selectedEndpoint, setSelectedEndpoint] = useState(ENDPOINTS[0]);
  const [responsePayload, setResponsePayload] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [responseTime, setResponseTime] = useState<number | null>(null);
  const [status, setStatus] = useState<string | null>(null);

  const testEndpoint = async (endpoint = selectedEndpoint) => {
    setLoading(true);
    const start = performance.now();
    try {
      const url = `http://localhost:5000${endpoint.path}`;
      const options: RequestInit = endpoint.method === "POST"
        ? {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ stationId: "BHARATI", scenarioId: "EXTREME_WEATHER" })
          }
        : { method: "GET" };

      const res = await fetch(url, options);
      const end = performance.now();
      const json = await res.json();
      setResponsePayload(json);
      setResponseTime(Math.round(end - start));
      setStatus(`${res.status} ${res.statusText}`);
    } catch (err: any) {
      setResponsePayload({ error: err.message || "Failed to connect to backend server at http://localhost:5000" });
      setStatus("CONNECTION_ERROR");
      setResponseTime(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      testEndpoint(selectedEndpoint);
    }
  }, [isOpen, selectedEndpoint]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-md flex items-center justify-center p-4 md:p-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-[#0a0d14] border border-cyan-500/30 rounded-3xl w-full max-w-5xl h-[85vh] flex flex-col overflow-hidden shadow-[0_0_50px_rgba(34,211,238,0.2)]"
        >
          {/* MODAL HEADER */}
          <div className="p-6 border-b border-white/10 flex items-center justify-between bg-[#050608]">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/40">
                <Cpu size={24} />
              </div>
              <div>
                <div className="flex items-center gap-3">
                  <h2 className="text-lg font-bold text-white tracking-wider font-mono">Live Express Backend Inspector</h2>
                  <span className={`px-3 py-0.5 rounded-full text-[10px] font-mono font-bold flex items-center gap-1.5 ${backendOnline ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' : 'bg-rose-500/20 text-rose-400 border border-rose-500/40'}`}>
                    <span className={`w-2 h-2 rounded-full ${backendOnline ? 'bg-emerald-400 animate-pulse' : 'bg-rose-500'}`} />
                    {backendOnline ? `ONLINE (http://localhost:5000) · ${latencyMs}ms` : 'OFFLINE'}
                  </span>
                </div>
                <p className="text-xs font-mono text-zinc-400 mt-0.5">Real-time REST API Tester & Payload Viewer</p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          {/* MAIN BODY */}
          <div className="flex-1 grid grid-cols-1 md:grid-cols-12 overflow-hidden">
            {/* LEFT ENDPOINT LIST */}
            <div className="md:col-span-4 border-r border-white/10 p-4 space-y-2 overflow-y-auto bg-[#07090e]">
              <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-500 px-2 block mb-3">Backend REST Endpoints</span>
              {ENDPOINTS.map((ep) => {
                const isSelected = selectedEndpoint.path === ep.path;
                return (
                  <button
                    key={ep.path}
                    onClick={() => setSelectedEndpoint(ep)}
                    className={`w-full text-left p-3 rounded-xl border font-mono text-xs transition-all ${isSelected ? 'bg-cyan-500/10 border-cyan-500/40 text-cyan-300 shadow-[0_0_12px_rgba(34,211,238,0.2)]' : 'bg-black/30 border-white/5 text-zinc-400 hover:border-white/20'}`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${ep.method === 'POST' ? 'bg-fuchsia-500/20 text-fuchsia-400' : 'bg-cyan-500/20 text-cyan-400'}`}>
                        {ep.method}
                      </span>
                      <span className="text-[10px] text-zinc-500 truncate max-w-[150px]">{ep.path}</span>
                    </div>
                    <span className="text-[11px] text-zinc-400 block leading-tight font-sans">{ep.description}</span>
                  </button>
                );
              })}
            </div>

            {/* RIGHT PAYLOAD VIEWER */}
            <div className="md:col-span-8 flex flex-col overflow-hidden bg-[#020305]">
              {/* STATUS BAR */}
              <div className="p-4 border-b border-white/10 flex items-center justify-between bg-[#050608] font-mono text-xs">
                <div className="flex items-center gap-4">
                  <span className="text-zinc-400">URL: <span className="text-cyan-400">http://localhost:5000{selectedEndpoint.path}</span></span>
                  {status && <span className="text-emerald-400 font-bold">STATUS: {status}</span>}
                  {responseTime !== null && <span className="text-amber-400">TIME: {responseTime}ms</span>}
                </div>

                <button
                  onClick={() => testEndpoint(selectedEndpoint)}
                  disabled={loading}
                  className="px-3 py-1.5 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 flex items-center gap-2 text-xs font-bold transition-all"
                >
                  <ArrowsCounterClockwise size={14} className={loading ? "animate-spin" : ""} />
                  Test Request
                </button>
              </div>

              {/* JSON PAYLOAD CONTAINER */}
              <div className="flex-1 p-6 overflow-y-auto font-mono text-xs leading-relaxed text-zinc-300">
                {loading ? (
                  <div className="h-full flex items-center justify-center gap-3 text-cyan-400">
                    <ArrowsCounterClockwise size={24} className="animate-spin" />
                    <span>Executing HTTP GET/POST against http://localhost:5000...</span>
                  </div>
                ) : responsePayload ? (
                  <pre className="bg-[#050608] p-4 rounded-2xl border border-white/10 overflow-x-auto text-cyan-300/90 shadow-inner">
                    {JSON.stringify(responsePayload, null, 2)}
                  </pre>
                ) : (
                  <span className="text-zinc-600">Select an endpoint to view backend JSON payload.</span>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
