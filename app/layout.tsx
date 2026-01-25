"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import Link from "next/link";
import { ToastProvider } from "@/components/ToastProvider";
import { ConfirmDialogProvider } from "@/components/ConfirmDialogProvider";
import { SettingsProvider } from "@/components/SettingsProvider";
import { ThemeProvider, useThemeMode } from "@/components/ThemeProvider";
import "./globals.css";

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <title>Assertify</title>
        <meta name="description" content="Assertify - AI-powered test case generator" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css"
        />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
      </head>
      <body>
        <ConfirmDialogProvider>
          <SettingsProvider>
            <ToastProvider>
              <ThemeProvider>
                <MobileDock />
                {children}
              </ThemeProvider>
            </ToastProvider>
          </SettingsProvider>
        </ConfirmDialogProvider>
      </body>
    </html>
  );
}

function MobileDock() {
  const { themeMode, toggleTheme, mounted } = useThemeMode();
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEsc);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEsc);
    };
  }, []);

  if (!mounted) return null;

  return (
    <div ref={menuRef} className="fixed right-4 top-4 z-50 sm:hidden">
      <div className="relative">
        <button
          onClick={() => setOpen((prev) => !prev)}
          className="flex h-12 w-12 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 shadow-lg transition-colors hover:bg-slate-100 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
          aria-label="Open controls"
          title="Controls"
        >
          <i className="fas fa-gear"></i>
        </button>
        {open && (
          <div className="absolute right-0 top-14 flex items-center gap-2 rounded-full border border-slate-200 bg-white/95 px-2 py-2 text-sm shadow-xl backdrop-blur dark:border-slate-700 dark:bg-slate-800/95">
            <Link
              href="/settings"
              className="flex h-10 w-10 items-center justify-center rounded-full text-slate-700 transition-colors hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-700"
              onClick={() => setOpen(false)}
              aria-label="Open settings"
              title="Settings"
            >
              <i className="fas fa-gear" aria-hidden="true"></i>
            </Link>
            <button
              onClick={() => {
                toggleTheme();
              }}
              className="flex h-10 w-10 items-center justify-center rounded-full text-slate-700 transition-colors hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-700"
              title={`Switch theme (current: ${themeMode})`}
              aria-label="Toggle theme mode"
            >
              {themeMode === "system" ? (
                <i className="fas fa-circle-half-stroke" aria-hidden="true"></i>
              ) : themeMode === "dark" ? (
                <i className="fas fa-moon" aria-hidden="true"></i>
              ) : (
                <i className="fas fa-sun" aria-hidden="true"></i>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
