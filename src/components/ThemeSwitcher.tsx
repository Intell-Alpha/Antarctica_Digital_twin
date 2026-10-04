"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme, ThemeMode, THEMES } from "@/context/ThemeContext";
import {
  Palette,
  Sun,
  Moon,
  TerminalWindow,
  Sparkle,
  Check,
  CaretDown,
} from "@phosphor-icons/react";

interface ThemeSwitcherProps {
  variant?: "pill" | "compact" | "dropdown";
  showLabel?: boolean;
}

export function ThemeSwitcher({ variant = "pill", showLabel = true }: ThemeSwitcherProps) {
  const { theme, setTheme, themeMeta } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const getThemeIcon = (id: ThemeMode) => {
    switch (id) {
      case "dark":
        return <Moon size={15} className="text-[#0DB9D0]" weight="fill" />;
      case "light":
        return <Sun size={15} className="text-amber-500" weight="fill" />;
      case "scada":
        return <TerminalWindow size={15} className="text-[#33FF66]" weight="fill" />;
      case "aurora":
        return <Sparkle size={15} className="text-[#C084FC]" weight="fill" />;
    }
  };

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`group flex items-center gap-2 px-3 py-1.5 rounded-full border transition-all duration-300 font-mono text-xs ${
          isOpen
            ? "bg-accent/20 border-accent/50 text-foreground shadow-md"
            : "bg-white/[0.06] hover:bg-white/[0.12] border-white/[0.12] text-foreground"
        }`}
        title={`Current Theme: ${themeMeta.name} — Click to switch`}
        aria-label="Change Display Theme"
      >
        <div className="flex items-center gap-1.5">
          {getThemeIcon(theme)}
          {showLabel && (
            <span className="font-semibold tracking-wide text-[11px] truncate max-w-[110px]">
              {themeMeta.name}
            </span>
          )}
        </div>
        <CaretDown
          size={12}
          className={`transition-transform duration-300 text-muted ${
            isOpen ? "rotate-180 text-accent" : "group-hover:text-foreground"
          }`}
        />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.95 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            className="absolute right-0 mt-2 w-64 p-2 rounded-2xl backdrop-blur-2xl z-50 theme-dropdown space-y-1"
          >
            <div className="px-3 py-2 theme-dropdown-header mb-1 flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-mono font-bold">
                <Palette size={14} className="text-accent" />
                <span>Display Theme</span>
              </div>
              <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-white/10 theme-dropdown-muted font-bold">
                4 MODES
              </span>
            </div>

            {(Object.keys(THEMES) as ThemeMode[]).map((mode) => {
              const meta = THEMES[mode];
              const isActive = theme === mode;
              return (
                <button
                  key={mode}
                  onClick={() => {
                    setTheme(mode);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center justify-between p-2.5 rounded-xl transition-all border ${
                    isActive
                      ? "theme-dropdown-item-active font-semibold"
                      : "theme-dropdown-item border-transparent"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <div className="p-1.5 rounded-lg bg-black/20 border border-white/10">
                      {getThemeIcon(mode)}
                    </div>
                    <div className="flex flex-col items-start text-left">
                      <span className="text-xs font-sans font-bold">{meta.name}</span>
                      <span className="text-[9px] font-mono theme-dropdown-muted line-clamp-1">
                        {meta.tagline}
                      </span>
                    </div>
                  </div>

                  {isActive && <Check size={14} className="text-accent shrink-0" />}
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
