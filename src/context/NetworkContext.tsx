"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useRef,
} from "react";
import { api } from "@/lib/api";

export interface NetworkContextType {
  isOnline: boolean;
  isOffline: boolean;
  isBrowserOffline: boolean;
  isBackendDown: boolean;
  isUsingCachedData: boolean;
  lastOnlineAt: Date | null;
  latencyMs: number;
  retryConnection: () => Promise<boolean>;
  lastSyncTimeFormatted: string;
}

const NetworkContext = createContext<NetworkContextType | undefined>(undefined);

export function NetworkProvider({ children }: { children: React.ReactNode }) {
  // Initialize with browser online state
  const [isBrowserOffline, setIsBrowserOffline] = useState<boolean>(() => {
    if (typeof navigator !== "undefined") {
      return !navigator.onLine;
    }
    return false;
  });

  const [isBackendDown, setIsBackendDown] = useState<boolean>(false);
  const [isUsingCachedData, setIsUsingCachedData] = useState<boolean>(false);
  const [lastOnlineAt, setLastOnlineAt] = useState<Date | null>(() => new Date());
  const [latencyMs, setLatencyMs] = useState<number>(0);
  const [isChecking, setIsChecking] = useState<boolean>(false);

  const checkCountRef = useRef(0);

  // Combined online status: Both browser online AND backend reachable
  const isOnline = !isBrowserOffline && !isBackendDown;
  const isOffline = !isOnline;

  /**
   * Ping backend to verify real HTTP/API connectivity
   */
  const checkConnectivity = useCallback(async (): Promise<boolean> => {
    if (typeof navigator !== "undefined" && !navigator.onLine) {
      setIsBrowserOffline(true);
      setIsBackendDown(false);
      setIsUsingCachedData(true);
      return false;
    }

    setIsChecking(true);
    try {
      const res = await api.checkBackendStatus();
      if (res.online) {
        setIsBrowserOffline(false);
        setIsBackendDown(false);
        setLatencyMs(res.latencyMs);
        setLastOnlineAt(new Date());
        setIsUsingCachedData(false);
        return true;
      } else {
        setIsBackendDown(true);
        setIsUsingCachedData(true);
        return false;
      }
    } catch {
      setIsBackendDown(true);
      setIsUsingCachedData(true);
      return false;
    } finally {
      setIsChecking(false);
    }
  }, []);

  // Listen for browser online / offline events
  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleBrowserOnline = () => {
      console.log("[NetworkContext] Browser online event detected. Verifying uplink...");
      setIsBrowserOffline(false);
      checkConnectivity();
    };

    const handleBrowserOffline = () => {
      console.warn("[NetworkContext] Browser offline event detected. Switching to local cache.");
      setIsBrowserOffline(true);
      setIsUsingCachedData(true);
    };

    const handleApiFallback = (e: Event) => {
      setIsUsingCachedData(true);
    };

    const handleApiSuccess = (e: Event) => {
      setIsUsingCachedData(false);
      setLastOnlineAt(new Date());
      setIsBackendDown(false);
      setIsBrowserOffline(false);
    };

    window.addEventListener("online", handleBrowserOnline);
    window.addEventListener("offline", handleBrowserOffline);
    window.addEventListener("himdrishti_api_fallback", handleApiFallback);
    window.addEventListener("himdrishti_api_success", handleApiSuccess);

    // Initial check on mount
    checkConnectivity();

    // Periodic heartbeat every 15 seconds
    const interval = setInterval(() => {
      checkCountRef.current += 1;
      // Skip active polling if browser is strictly offline
      if (typeof navigator !== "undefined" && !navigator.onLine) {
        return;
      }
      checkConnectivity();
    }, 15000);

    return () => {
      window.removeEventListener("online", handleBrowserOnline);
      window.removeEventListener("offline", handleBrowserOffline);
      window.removeEventListener("himdrishti_api_fallback", handleApiFallback);
      window.removeEventListener("himdrishti_api_success", handleApiSuccess);
      clearInterval(interval);
    };
  }, [checkConnectivity]);

  const lastSyncTimeFormatted = lastOnlineAt
    ? lastOnlineAt.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })
    : "Initial Mock";

  return (
    <NetworkContext.Provider
      value={{
        isOnline,
        isOffline,
        isBrowserOffline,
        isBackendDown,
        isUsingCachedData,
        lastOnlineAt,
        latencyMs,
        retryConnection: checkConnectivity,
        lastSyncTimeFormatted,
      }}
    >
      {children}
    </NetworkContext.Provider>
  );
}

export function useNetwork() {
  const context = useContext(NetworkContext);
  if (!context) {
    throw new Error("useNetwork must be used within a NetworkProvider");
  }
  return context;
}
