"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type PropsWithChildren,
} from "react";
import { SETTINGS_STORAGE_KEY, Settings, sanitizeSettings, defaultSettings } from "@/lib/settings";

interface SettingsContextValue {
  settings: Settings;
  updateSettings: (updates: Partial<Settings>) => void;
}

const SettingsContext = createContext<SettingsContextValue | undefined>(undefined);

export function SettingsProvider({ children }: PropsWithChildren) {
  const [settings, setSettings] = useState<Settings>(defaultSettings);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(SETTINGS_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setSettings(sanitizeSettings(parsed));
      }
    } catch (error) {
      console.error("Failed to load settings: ", error);
    }
  }, []);

  const persist = useCallback((value: Settings) => {
    try {
      localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(value));
    } catch (error) {
      console.error("Failed to persist settings:", error);
    }
  }, []);

  const updateSettings = useCallback(
    (updates: Partial<Settings>) => {
      setSettings((prev) => {
        const merged = sanitizeSettings({ ...prev, ...updates });
        persist(merged);
        return merged;
      });
    },
    [persist]
  );

  const value = useMemo(() => ({ settings, updateSettings }), [settings, updateSettings]);

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

export function useSettings(): SettingsContextValue {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error("useSettings must be used within a SettingsProvider");
  }
  return context;
}
