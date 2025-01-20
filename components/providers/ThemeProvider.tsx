"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { Theme, ThemeProviderState } from "@/lib/theme/types";
import {
  getSystemTheme,
  getStoredTheme,
  saveTheme,
  syncWindowTheme,
  listenForSystemThemeChanges,
} from "@/lib/theme/utils";

const ThemeContext = createContext<ThemeProviderState | undefined>(undefined);

interface ThemeProviderProps {
  children: React.ReactNode;
  defaultTheme?: Theme;
}

export function ThemeProvider({
  children,
  defaultTheme = "system",
}: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>(defaultTheme);
  const [resolvedTheme, setResolvedTheme] = useState<"light" | "dark">(
    getSystemTheme()
  );
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Load saved theme preference
    getStoredTheme().then((savedTheme) => {
      if (savedTheme) {
        setTheme(savedTheme);
      }
      setMounted(true);
    });
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const newResolvedTheme = theme === "system" ? getSystemTheme() : theme;
    setResolvedTheme(newResolvedTheme);

    // Update document theme class
    document.documentElement.classList.remove("light", "dark");
    document.documentElement.classList.add(newResolvedTheme);

    // Sync with Tauri window
    syncWindowTheme(newResolvedTheme);
  }, [theme, mounted]);

  useEffect(() => {
    if (!mounted) return;

    // Listen for system theme changes
    if (theme === "system") {
      return listenForSystemThemeChanges((isDark) => {
        const newTheme = isDark ? "dark" : "light";
        setResolvedTheme(newTheme);
        document.documentElement.classList.remove("light", "dark");
        document.documentElement.classList.add(newTheme);
        syncWindowTheme(newTheme);
      });
    }
  }, [theme, mounted]);

  const value = {
    theme,
    resolvedTheme,
    setTheme: async (newTheme: Theme) => {
      setTheme(newTheme);
      await saveTheme(newTheme);
    },
  };

  // Prevent flash of incorrect theme
  if (!mounted) {
    return null;
  }

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};
