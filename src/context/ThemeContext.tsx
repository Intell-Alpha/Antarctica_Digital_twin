"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

export type ThemeMode = "dark" | "light" | "scada" | "aurora";

export interface ThemeMeta {
  id: ThemeMode;
  name: string;
  tagline: string;
  badge: string;
  accentHex: string;
  bgHex: string;
  isDark: boolean;
}

export const THEMES: Record<ThemeMode, ThemeMeta> = {
  dark: {
    id: "dark",
    name: "Polar Night",
    tagline: "Deep Antarctic Midnight & Glacial Blue Glass",
    badge: "DEFAULT",
    accentHex: "#0DB9D0",
    bgHex: "#03060E",
    isDark: true,
  },
  light: {
    id: "light",
    name: "Polar Daylight",
    tagline: "High-Albedo Polar Snow & High Contrast UI",
    badge: "LIGHT",
    accentHex: "#0284C7",
    bgHex: "#F4F8FC",
    isDark: false,
  },
  scada: {
    id: "scada",
    name: "Tactical SCADA",
    tagline: "Pitch Black Telemetry Matrix & Phosphor Green",
    badge: "SCADA",
    accentHex: "#33FF66",
    bgHex: "#000000",
    isDark: true,
  },
  aurora: {
    id: "aurora",
    name: "Aurora Night",
    tagline: "Cosmic Obsidian Purple & Emerald Southern Lights",
    badge: "AURORA",
    accentHex: "#00FF99",
    bgHex: "#0C0515",
    isDark: true,
  },
};

interface ThemeContextType {
  theme: ThemeMode;
  setTheme: (mode: ThemeMode) => void;
  cycleTheme: () => void;
  themeMeta: ThemeMeta;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<ThemeMode>("dark");

  useEffect(() => {
    try {
      const saved = localStorage.getItem("himdrishti_theme") as ThemeMode;
      if (saved && THEMES[saved]) {
        setThemeState(saved);
        applyTheme(saved);
      } else {
        applyTheme("dark");
      }
    } catch (e) {
      applyTheme("dark");
    }
  }, []);

  const applyTheme = (mode: ThemeMode) => {
    if (typeof document === "undefined") return;
    const root = document.documentElement;
    root.setAttribute("data-theme", mode);

    // Remove existing theme classes
    root.classList.remove("theme-dark", "theme-light", "theme-scada", "theme-aurora");
    root.classList.add(`theme-${mode}`);

    if (THEMES[mode].isDark) {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  };

  const setTheme = (mode: ThemeMode) => {
    if (!THEMES[mode]) return;
    setThemeState(mode);
    applyTheme(mode);
    try {
      localStorage.setItem("himdrishti_theme", mode);
    } catch (e) {}
  };

  const cycleTheme = () => {
    const modes: ThemeMode[] = ["dark", "light", "scada", "aurora"];
    const currentIndex = modes.indexOf(theme);
    const nextIndex = (currentIndex + 1) % modes.length;
    setTheme(modes[nextIndex]);
  };

  return (
    <ThemeContext.Provider
      value={{
        theme,
        setTheme,
        cycleTheme,
        themeMeta: THEMES[theme],
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
