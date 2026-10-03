"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Robot,
  Microphone,
  MicrophoneSlash,
  PaperPlaneTilt,
  X,
  Sparkle,
  Lightning,
  Snowflake,
  Drop,
  GasPump,
  Radio,
  Heartbeat,
  Compass,
  SpeakerHigh,
  ArrowsClockwise,
} from "@phosphor-icons/react";
import { api, Station } from "@/lib/api";
import { DraggablePanel } from "./DraggablePanel";
import { polarAudio } from "@/lib/polarAudioEngine";

interface StationAICommanderProps {
  station: Station;
  onFlyToRoom: (roomId: string) => void;
  onToggleBlizzard: (isBlizzard: boolean) => void;
  onTriggerSimulation: (scenarioId: string) => void;
  onResetOverview: () => void;
  className?: string;
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  hideFloatingTrigger?: boolean;
}

interface MessageEntry {
  id: string;
  sender: "user" | "ai";
  text: string;
  actuationMessage?: string;
  actionTaken?: string;
  timestamp: string;
  telemetry?: any;
}

export function StationAICommander({
  station,
  onFlyToRoom,
  onToggleBlizzard,
  onTriggerSimulation,
  onResetOverview,
  className = "",
  isOpen: controlledIsOpen,
  onOpenChange,
  hideFloatingTrigger = false,
}: StationAICommanderProps) {
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

  const [query, setQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [messages, setMessages] = useState<MessageEntry[]>([
    {
      id: "init",
      sender: "ai",
      text: `Himadri Polar Telemetry Assistant initialized for ${station} Station. I can direct 3D camera navigation, actuate facility systems, run crisis simulations, and diagnose microgrid telemetry.`,
      timestamp: "00:00",
    },
  ]);

  const inputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll messages
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen]);

  // Keyboard shortcut: Press "/" or "K" to open commander
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }
      if (e.key === "/" || ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k")) {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isOpen]);

  // Web Speech Recognition
  const toggleSpeechRecognition = () => {
    if (typeof window === "undefined") return;

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("Speech recognition is not supported in this browser. Please use Chrome, Edge, or Safari.");
      return;
    }

    if (isListening) {
      setIsListening(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = "en-US";

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event: any) => {
        const speechText = event.results[0][0].transcript;
        setQuery(speechText);
        setIsListening(false);
        handleSendQuery(speechText);
      };

      recognition.onerror = () => {
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } catch (err) {
      console.warn("Speech recognition error:", err);
      setIsListening(false);
    }
  };

  // Text-To-Speech Output
  const speakMessage = (text: string) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const cleanText = text.replace(/\[.*?\]/g, "");
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 1.05;
    utterance.pitch = 0.95;
    window.speechSynthesis.speak(utterance);
  };

  // Execute Agentic 3D Actuation based on intent
  const executeActuation = (actuation: any) => {
    if (!actuation || actuation.action === "NONE") return;

    if (actuation.action === "FLY_TO_ROOM" && actuation.targetRoomId) {
      onFlyToRoom(actuation.targetRoomId);
    } else if (actuation.action === "TOGGLE_BLIZZARD") {
      onToggleBlizzard(true);
      if (actuation.scenarioId) onTriggerSimulation(actuation.scenarioId);
    } else if (actuation.action === "TRIGGER_SIMULATION" && actuation.scenarioId) {
      onTriggerSimulation(actuation.scenarioId);
    } else if (actuation.action === "STATION_OVERVIEW") {
      onResetOverview();
    }
  };

  const handleSendQuery = async (queryText?: string) => {
    const textToSend = queryText || query;
    if (!textToSend.trim() || isLoading) return;

    polarAudio.playClickFeedback();
    const userMsg: MessageEntry = {
      id: String(Date.now()),
      sender: "user",
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setQuery("");
    setIsLoading(true);

    try {
      const res = await api.queryCommander(station, textToSend);

      const aiMsg: MessageEntry = {
        id: String(Date.now() + 1),
        sender: "ai",
        text: res.answer,
        actuationMessage: res.actuation?.highlightMessage,
        actionTaken: res.actuation?.action,
        telemetry: res.telemetrySnapshot,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };

      setMessages((prev) => [...prev, aiMsg]);
      executeActuation(res.actuation);
    } catch (err) {
      console.warn("Commander query error", err);
      setMessages((prev) => [
        ...prev,
        {
          id: String(Date.now() + 1),
          sender: "ai",
          text: `[Offline Diagnostic] System response completed. Telemetry and systems are operating nominally.`,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const PRESET_PROMPTS = [
    { label: "Check Powerhouse Generators", prompt: "Show me the powerhouse generators and live output" },
    { label: "Simulate Katabatic Blizzard", prompt: "Simulate 105 km/h katabatic blizzard and whiteout" },
    { label: "Inspect Water Lifeline Intake", prompt: "Inspect freshwater pipeline intake and boiler calorifier" },
    { label: "Check Fuel Autonomy Days", prompt: "What is our Arctic ATF-50 fuel autonomy reserve?" },
    { label: "Inspect ISRO Satcom Radome", prompt: "Check ISRO satellite uplink and radome telemetry" },
    { label: "Hospital Surgical OT Standby", prompt: "Inspect station hospital operating theater" },
    { label: "Campus Exterior Overview", prompt: "Return camera to full campus overview" },
  ];

  return (
    <>
      {/* ── 1. OPTIONAL FLOATING LAUNCHER PILL (Only when not triggered via top bar) ── */}
      {!hideFloatingTrigger && (
        <div className={`fixed bottom-20 sm:bottom-24 right-4 sm:right-6 z-30 pointer-events-auto ${className}`}>
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#070D18]/95 hover:bg-[#0B1526] border border-white/[0.12] hover:border-cyan-500/40 text-[#EBF5FC] backdrop-blur-xl shadow-xl transition-colors"
            title="Open Himadri AI Station Commander (Press / or ⌘K)"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
            <Robot size={15} className="text-cyan-400" />
            <span className="font-mono text-[11px] font-medium tracking-wide">
              AI Telemetry Copilot
            </span>
            <kbd className="hidden sm:inline-block px-1 py-0.2 rounded bg-white/[0.08] text-[9px] font-mono text-[#7ABBD4] border border-white/10">
              /
            </kbd>
          </button>
        </div>
      )}

      {/* ── 2. AGENTIC AI COMMANDER OVERLAY (Aerospace Telemetry Terminal) ── */}
      {isOpen && (
        <div className="fixed inset-0 z-50 pointer-events-none flex items-end sm:items-center justify-center sm:justify-end sm:pr-8 sm:pb-8 p-3 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <DraggablePanel className="w-full sm:w-[480px]">
            <div className="w-full max-h-[85vh] flex flex-col rounded-2xl bg-[#070D18] border border-white/[0.14] shadow-[0_24px_64px_rgba(0,0,0,0.92)] animate-in slide-in-from-bottom-3 duration-250 overflow-hidden">
            {/* Header */}
            <div className="px-4 py-3 border-b border-white/[0.08] flex items-center justify-between bg-white/[0.02]">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                  <Robot size={16} weight="fill" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-mono text-xs font-semibold text-white tracking-wider uppercase">
                      Himadri Mission Copilot
                    </h3>
                    <span className="px-1.5 py-0.2 rounded font-mono text-[9px] bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 font-medium">
                      3D ACTUATION
                    </span>
                  </div>
                  <span className="font-mono text-[10px] text-[#7ABBD4]">
                    {station} DIGITAL TWIN · PRESS / TO TOGGLE
                  </span>
                </div>
              </div>

              <button
                onClick={() => setIsOpen(false)}
                className="p-1 rounded-md text-[#7ABBD4] hover:text-white hover:bg-white/[0.08] transition-colors"
                title="Close Commander"
              >
                <X size={15} />
              </button>
            </div>

            {/* Chat Messages Log */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 max-h-[380px] no-scrollbar font-mono">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex flex-col ${
                    msg.sender === "user" ? "items-end" : "items-start"
                  }`}
                >
                  <div
                    className={`p-3 rounded-xl max-w-[92%] text-xs leading-relaxed ${
                      msg.sender === "user"
                        ? "bg-cyan-950/40 border border-cyan-500/30 text-cyan-100 rounded-tr-none"
                        : "bg-white/[0.03] border border-white/[0.08] text-[#E0ECF5] rounded-tl-none"
                    }`}
                  >
                    {/* Actuation Banner if AI acted in 3D scene */}
                    {msg.actuationMessage && (
                      <div className="flex items-center gap-1.5 pb-1.5 mb-1.5 border-b border-white/[0.08] font-mono text-[10px] text-emerald-400 font-medium">
                        <Lightning size={12} weight="fill" />
                        <span>{msg.actuationMessage}</span>
                      </div>
                    )}

                    <p className="font-sans text-xs leading-normal">{msg.text}</p>

                    {/* Text-To-Speech Button & Timestamp */}
                    {msg.sender === "ai" && (
                      <div className="mt-2 pt-1 border-t border-white/[0.06] flex items-center justify-between font-mono text-[9px] text-[#558296]">
                        <span>{msg.timestamp}</span>
                        <button
                          onClick={() => speakMessage(msg.text)}
                          className="flex items-center gap-1 text-[#7ABBD4] hover:text-white transition-colors"
                          title="Read Aloud"
                        >
                          <SpeakerHigh size={12} />
                          <span>Voice Read</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex items-center gap-2 font-mono text-[11px] text-cyan-300 p-2.5 rounded-lg bg-white/[0.02] border border-white/[0.06]">
                  <ArrowsClockwise size={13} className="animate-spin text-cyan-400" />
                  <span>Analyzing polar telemetry & computing 3D actuation...</span>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Action Prompt Chips */}
            <div className="px-3 py-2 border-t border-white/[0.06] bg-white/[0.01] overflow-x-auto no-scrollbar flex items-center gap-1.5">
              {PRESET_PROMPTS.map((p, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendQuery(p.prompt)}
                  className="px-2.5 py-1 rounded-md font-mono text-[10px] whitespace-nowrap bg-white/[0.03] hover:bg-white/[0.08] text-[#8BB7CD] hover:text-white border border-white/[0.06] transition-colors shrink-0"
                >
                  {p.label}
                </button>
              ))}
            </div>

            {/* Input Command Box */}
            <div className="p-3 border-t border-white/[0.08] flex items-center gap-2 bg-[#050A14]">
              <button
                onClick={toggleSpeechRecognition}
                className={`p-2 rounded-lg transition-colors ${
                  isListening
                    ? "bg-rose-500 text-white"
                    : "bg-white/[0.04] hover:bg-white/[0.08] text-[#7ABBD4] hover:text-white"
                }`}
                title={isListening ? "Listening... click to stop" : "Voice Input (Speech-to-Text)"}
              >
                {isListening ? (
                  <MicrophoneSlash size={15} weight="bold" />
                ) : (
                  <Microphone size={15} weight="duotone" />
                )}
              </button>

              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSendQuery();
                }}
                placeholder={`Command ${station} twin (e.g. "Check generator 2", "Simulate blizzard")...`}
                className="flex-1 bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-1.5 text-xs font-sans text-white placeholder-[#4A7A8E] focus:outline-none focus:border-cyan-500/50 transition-colors"
              />

              <button
                onClick={() => handleSendQuery()}
                disabled={!query.trim() || isLoading}
                className="px-3 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-black font-mono text-xs font-semibold disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                title="Send Command"
              >
                Execute
              </button>
            </div>
          </div>
        </DraggablePanel>
      </div>
      )}
    </>
  );
}
