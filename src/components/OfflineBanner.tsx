"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  WifiSlash,
  ArrowsClockwise,
  Warning,
  X,
  CheckCircle,
  Database,
  CloudSlash,
} from "@phosphor-icons/react";
import { useNetwork } from "@/context/NetworkContext";
import { polarAudio } from "@/lib/polarAudioEngine";

export function OfflineBanner() {
  const {
    isOffline,
    isBrowserOffline,
    isBackendDown,
    isUsingCachedData,
    lastSyncTimeFormatted,
    retryConnection,
  } = useNetwork();

  const [isRetrying, setIsRetrying] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const [reconnectSuccess, setReconnectSuccess] = useState(false);

  const shouldShow = (isOffline || isUsingCachedData) && !isDismissed;

  const handleRetry = async () => {
    polarAudio.playClickFeedback();
    setIsRetrying(true);
    const success = await retryConnection();
    setIsRetrying(false);

    if (success) {
      setReconnectSuccess(true);
      setTimeout(() => {
        setReconnectSuccess(false);
        setIsDismissed(false);
      }, 3000);
    }
  };

  return (
    <AnimatePresence>
      {reconnectSuccess && (
        <motion.div
          key="reconnect-success"
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="w-full bg-[#00D4A0]/15 border-b border-[#00D4A0]/40 backdrop-blur-xl px-6 py-2.5 z-40 relative flex items-center justify-between text-xs font-mono shadow-[0_4px_20px_rgba(0,212,160,0.15)]"
        >
          <div className="flex items-center gap-2.5 text-[#00D4A0]">
            <CheckCircle size={16} weight="fill" className="animate-pulse" />
            <span className="font-bold uppercase tracking-wider">
              UPLINK RESTORED · LIVE TELEMETRY SYNCHRONIZED
            </span>
          </div>
          <span className="text-[#00D4A0]/70 text-[10px]">
            Connected to Express Engine @ Port 5000
          </span>
        </motion.div>
      )}

      {shouldShow && !reconnectSuccess && (
        <motion.div
          key="offline-banner"
          initial={{ height: 0, opacity: 0, y: -20 }}
          animate={{ height: "auto", opacity: 1, y: 0 }}
          exit={{ height: 0, opacity: 0, y: -20 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="w-full bg-gradient-to-r from-[#D49020]/20 via-[#071526]/95 to-[#D49020]/20 border-b border-[#D49020]/40 backdrop-blur-2xl px-4 sm:px-8 py-3 z-40 relative shadow-[0_8px_32px_rgba(212,144,32,0.18)]"
        >
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-3 sm:gap-4 font-mono">
            {/* Left: Indicator & Headline */}
            <div className="flex items-center gap-3">
              <div className="relative flex items-center justify-center w-8 h-8 rounded-lg bg-[#D49020]/20 border border-[#D49020]/40 shrink-0">
                {isBrowserOffline ? (
                  <WifiSlash size={16} weight="bold" className="text-[#D49020] animate-pulse" />
                ) : (
                  <CloudSlash size={16} weight="bold" className="text-[#D49020] animate-pulse" />
                )}
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-[#D49020] animate-ping opacity-75" />
              </div>

              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#EBF5FC]">
                    {isBrowserOffline
                      ? "OFFLINE MODE · WI-FI DISCONNECTED"
                      : "AUTONOMOUS MODE · BACKEND UPLINK OFFLINE"}
                  </span>
                  <span className="px-1.5 py-0.2 rounded text-[9px] bg-[#D49020]/25 text-[#D49020] font-semibold border border-[#D49020]/30">
                    ZERO DOWNTIME
                  </span>
                </div>
                <p className="text-[10px] text-[#A6C4D6] font-sans leading-tight mt-0.5">
                  Serving synchronized local cache & autonomous Antarctic digital twin simulation. No telemetry loss.
                </p>
              </div>
            </div>

            {/* Right: Cache timestamp & Actions */}
            <div className="flex items-center gap-3 self-end md:self-auto shrink-0 text-[10px]">
              <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded bg-black/40 border border-white/[0.08] text-[#7ABBD4]">
                <Database size={12} className="text-[#0DB9D0]" />
                <span>Last Sync: {lastSyncTimeFormatted}</span>
              </div>

              {/* Retry Button */}
              <button
                onClick={handleRetry}
                disabled={isRetrying}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#D49020]/20 hover:bg-[#D49020]/30 text-[#EBF5FC] hover:text-white border border-[#D49020]/40 text-[10px] uppercase tracking-wider font-semibold transition-all active:scale-95 disabled:opacity-50 shadow-[0_0_12px_rgba(212,144,32,0.15)]"
                title="Retry API uplink connection"
              >
                <ArrowsClockwise
                  size={12}
                  weight="bold"
                  className={`text-[#D49020] ${isRetrying ? "animate-spin" : ""}`}
                />
                <span>{isRetrying ? "Reconnecting..." : "Retry Uplink"}</span>
              </button>

              {/* Dismiss Button */}
              <button
                onClick={() => {
                  polarAudio.playClickFeedback();
                  setIsDismissed(true);
                }}
                className="p-1.5 rounded-lg hover:bg-white/[0.08] text-white/50 hover:text-white transition-colors"
                title="Minimize banner"
              >
                <X size={14} />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
