"use client";

import { useState, useEffect, type ReactNode } from "react";
import Link from "next/link";
import { ToastProvider } from "@/components/ToastProvider";
import { ConfirmDialogProvider } from "@/components/ConfirmDialogProvider";
import { SettingsProvider } from "@/components/SettingsProvider";
import "./globals.css";

export default function RootLayout({ children }: { children: ReactNode }) {
  const [isDark, setIsDark] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const savedTheme = localStorage.getItem("theme");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const shouldBeDark = savedTheme ? savedTheme === "dark" : prefersDark;

    setIsDark(shouldBeDark);
    if (shouldBeDark) {
      document.documentElement.classList.add("dark");
    }
  }, []);

  const toggleDarkMode = () => {
    const newIsDark = !isDark;
    setIsDark(newIsDark);
    localStorage.setItem("theme", newIsDark ? "dark" : "light");

    if (newIsDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  if (!mounted) {
    return (
      <html lang="en">
        <head>
          <title>Test Case Generator</title>
          <meta name="description" content="AI-powered test case generator" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <link
            rel="stylesheet"
            href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css"
          />
        </head>
        <body>
          <div className="min-h-screen flex items-center justify-center">
            <div className="text-slate-600">Loading...</div>
          </div>
        </body>
      </html>
    );
  }

  return (
    <html lang="en" className={isDark ? "dark" : ""}>
      <head>
        <title>Test Case Generator</title>
        <meta name="description" content="AI-powered test case generator" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css"
        />
      </head>
      <body>
        <ConfirmDialogProvider>
          <SettingsProvider>
            <ToastProvider>
              <div className="fixed top-4 right-4 z-50 flex flex-col gap-3">
                <Link
                  href="/settings"
                  className="flex h-12 w-12 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 shadow-lg transition-colors hover:bg-slate-100 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
                  aria-label="Open settings"
                >
                  <i className="fas fa-gear"></i>
                </Link>
                <button
                  onClick={toggleDarkMode}
                  className="flex h-12 w-12 items-center justify-center rounded-full border border-slate-200 bg-slate-200 text-slate-900 shadow-lg transition-colors hover:bg-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-yellow-400 dark:hover:bg-slate-600"
                  title={isDark ? "Switch to light mode" : "Switch to dark mode"}
                  aria-label="Toggle dark mode"
                >
                  {isDark ? (
                    <i className="fas fa-sun text-lg"></i>
                  ) : (
                    <i className="fas fa-moon text-lg"></i>
                  )}
                </button>
              </div>

              {children}
            </ToastProvider>
          </SettingsProvider>
        </ConfirmDialogProvider>
      </body>
    </html>
  );
}
