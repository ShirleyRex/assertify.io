"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

type ThemeMode = "light" | "dark" | "system";

interface ThemeContextValue {
  themeMode: ThemeMode;
  isDark: boolean;
  themeLabel: string;
  mounted: boolean;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [isDark, setIsDark] = useState(false);
  const [themeMode, setThemeMode] = useState<ThemeMode>("system");
  const [mounted, setMounted] = useState(false);

  const applyTheme = useCallback((mode: ThemeMode, prefersDark: boolean) => {
    const shouldUseDark = mode === "dark" || (mode === "system" && prefersDark);
    setIsDark(shouldUseDark);
    document.documentElement.classList.toggle("dark", shouldUseDark);
  }, []);

  useEffect(() => {
    setMounted(true);
    const savedTheme = (localStorage.getItem("themeMode") ||
      localStorage.getItem("theme")) as ThemeMode | null;
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const resolvedMode: ThemeMode =
      savedTheme === "light" || savedTheme === "dark" || savedTheme === "system"
        ? savedTheme
        : "system";

    setThemeMode(resolvedMode);
    applyTheme(resolvedMode, prefersDark);
  }, [applyTheme]);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = (event: MediaQueryListEvent) => {
      if (themeMode === "system") {
        applyTheme("system", event.matches);
      }
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, [applyTheme, themeMode]);

  const toggleTheme = useCallback(() => {
    const nextMode: ThemeMode =
      themeMode === "light" ? "dark" : themeMode === "dark" ? "system" : "light";
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    setThemeMode(nextMode);
    localStorage.setItem("themeMode", nextMode);
    localStorage.setItem("theme", nextMode);
    applyTheme(nextMode, prefersDark);
  }, [applyTheme, themeMode]);

  const themeLabel = useMemo(
    () => (themeMode === "system" ? "System" : themeMode === "dark" ? "Dark" : "Light"),
    [themeMode]
  );

  const value = useMemo(
    () => ({ themeMode, isDark, themeLabel, mounted, toggleTheme }),
    [isDark, mounted, themeLabel, themeMode, toggleTheme]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useThemeMode() {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error("useThemeMode must be used within a ThemeProvider");
  }
  return ctx;
}
