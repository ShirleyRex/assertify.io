"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import SavedTestsList from "@/components/SavedTestsList";
import { useToast } from "@/components/ToastProvider";
import { useConfirmDialog } from "@/components/ConfirmDialogProvider";
import { buildAutoContext } from "@/lib/autoContext";
import { useSettings } from "@/components/SettingsProvider";
import { filterTestCasesBySettings } from "@/lib/testCaseUtils";
import { useThemeMode } from "@/components/ThemeProvider";

export default function Home() {
  const [input, setInput] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [showApiKeyInput, setShowApiKeyInput] = useState(false);
  const [loading, setLoading] = useState(false);
  const [apiKeySaved, setApiKeySaved] = useState(false);
  const [needsManualContext, setNeedsManualContext] = useState(false);
  const [requirements, setRequirements] = useState("");
  const [showRequirementsInput, setShowRequirementsInput] = useState(false);
  const [showDesktopMenu, setShowDesktopMenu] = useState(false);
  const controlsRef = useRef<HTMLDivElement | null>(null);
  const router = useRouter();
  const { addToast } = useToast();
  const { confirm } = useConfirmDialog();
  const { settings } = useSettings();
  const { themeMode, themeLabel, toggleTheme, mounted } = useThemeMode();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (controlsRef.current && !controlsRef.current.contains(event.target as Node)) {
        setShowDesktopMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const savedKey = localStorage.getItem("openai_api_key");
    if (savedKey) {
      setApiKey(savedKey);
      setApiKeySaved(true);
    }
  }, []);

  const handleSaveApiKey = () => {
    if (!apiKey.trim()) {
      addToast({ message: "Please enter your OpenAI API key.", type: "error" });
      return;
    }

    if (!apiKey.startsWith("sk-")) {
      addToast({
        message: 'Invalid API key. It should start with "sk-".',
        type: "error",
      });
      return;
    }

    localStorage.setItem("openai_api_key", apiKey);
    setApiKeySaved(true);
    setShowApiKeyInput(false);
    addToast({
      message: "API key saved! You can now generate test cases.",
      type: "success",
    });
  };

  const handleRemoveApiKey = async () => {
    const confirmed = await confirm({
      title: "Remove API key?",
      description:
        "This will remove your saved OpenAI API key from this browser. You can add it again later.",
      confirmLabel: "Remove key",
      variant: "danger",
    });

    if (!confirmed) {
      return;
    }

    localStorage.removeItem("openai_api_key");
    setApiKey("");
    setApiKeySaved(false);
    addToast({ message: "API key removed.", type: "info" });
  };

  const handleNext = async () => {
    if (!apiKeySaved || !input.trim()) {
      if (!apiKeySaved) {
        setShowApiKeyInput(true);
      }
      return;
    }

    setLoading(true);
    const trimmedRequirements = requirements.trim();
    const trimmedDefaultContext = settings.defaultContext.trim();
    const classificationPayload = [
      input,
      trimmedRequirements ? `Requirement specification:\n${trimmedRequirements}` : null,
    ]
      .filter(Boolean)
      .join("\n\n");

    const generationPayload = [
      input,
      trimmedRequirements ? `Requirement specification:\n${trimmedRequirements}` : null,
      trimmedDefaultContext ? `Global considerations: ${trimmedDefaultContext}` : null,
    ]
      .filter(Boolean)
      .join("\n\n");
    try {
      const response = await fetch("/api/classify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectDescription: classificationPayload,
          apiKey: localStorage.getItem("openai_api_key"),
        }),
      });

      const data = await response.json();

      if (response.status === 401 || data.error?.includes("Unauthorized")) {
        addToast({
          message: "Invalid API key. Please check and try again.",
          type: "error",
        });
        setShowApiKeyInput(true);
        return;
      }

      if (!response.ok) {
        addToast({
          message: `Error: ${data.error || "Failed to classify project"}`,
          type: "error",
        });
        return;
      }

      const normalizedCategory = data.category || "other";
      sessionStorage.setItem("projectDescription", input);
      if (trimmedRequirements) {
        sessionStorage.setItem("projectRequirements", trimmedRequirements);
      } else {
        sessionStorage.removeItem("projectRequirements");
      }
      sessionStorage.setItem("category", normalizedCategory);
      sessionStorage.removeItem("currentTestId");

      if (needsManualContext) {
        sessionStorage.removeItem("answers");
        sessionStorage.setItem("manualContextMode", "true");
        router.push("/questions");
        return;
      }

      const autoContext = buildAutoContext(
        input,
        normalizedCategory,
        trimmedRequirements,
        trimmedDefaultContext
      );
      sessionStorage.setItem("manualContextMode", "false");

      const generationResponse = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectDescription: generationPayload,
          category: normalizedCategory,
          answers: autoContext,
          apiKey: localStorage.getItem("openai_api_key"),
        }),
      });

      const generationData = await generationResponse.json();

      if (!generationResponse.ok) {
        addToast({
          message: generationData.error || "Failed to generate test cases.",
          type: "error",
        });
        return;
      }

      const filteredTestCases = filterTestCasesBySettings(generationData.testCases || [], settings);
      if (!filteredTestCases.length) {
        addToast({
          message: "All generated test cases were filtered out by your settings.",
          type: "error",
        });
        return;
      }

      sessionStorage.setItem("answers", JSON.stringify(autoContext));
      sessionStorage.setItem("testCases", JSON.stringify(filteredTestCases));
      sessionStorage.setItem("testingStrategy", generationData.testingStrategy || "");
      sessionStorage.setItem("riskAreas", JSON.stringify(generationData.riskAreas || []));

      router.push("/results");
    } catch (error) {
      console.error("Error:", error);
      addToast({ message: "Something went wrong while preparing your tests.", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-[100dvh] bg-gradient-to-br from-blue-50 to-indigo-100 px-0 dark:from-slate-900 dark:to-slate-800">
      <div className="mx-auto flex min-h-[100dvh] w-full max-w-3xl items-stretch px-0 pb-[env(safe-area-inset-bottom)] pt-[env(safe-area-inset-top)] sm:px-6 sm:pb-12 sm:pt-12">
        <div className="relative flex w-full flex-1 flex-col rounded-none bg-white px-5 py-7 shadow-none dark:bg-slate-800 sm:rounded-2xl sm:px-8 sm:py-10 sm:shadow-2xl md:px-12">
          {/* Header */}
          <div className="text-center mb-6">
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent mb-3">
              Assertify
            </h1>
            <p className="text-lg text-slate-600 dark:text-slate-300">
              AI-powered test case generation with boilerplate code
            </p>
          </div>
          {mounted && (
            <div
              ref={controlsRef}
              className="absolute right-4 top-4 hidden sm:flex flex-col items-end gap-2"
            >
              <button
                onClick={() => setShowDesktopMenu((prev) => !prev)}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white/90 text-slate-700 shadow-sm backdrop-blur transition-colors hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800/90 dark:text-slate-200 dark:hover:bg-slate-700"
                aria-label="Open controls"
                title="Settings"
              >
                <i className="fas fa-gear text-base" aria-hidden="true"></i>
              </button>
              {showDesktopMenu && (
                <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-white/95 px-2 py-2 text-sm shadow-xl backdrop-blur dark:border-slate-700 dark:bg-slate-800/95">
                  <Link
                    href="/settings"
                    className="flex h-10 w-10 items-center justify-center rounded-full text-slate-700 transition-colors hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-700"
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
                    title={`Switch theme (current: ${themeLabel})`}
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
          )}

          {/* API Key Section */}
          <div className="mb-8 p-4 bg-blue-50 dark:bg-blue-900 rounded-lg border-l-4 border-blue-600">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-slate-900 dark:text-white mb-1 flex items-center gap-2">
                  <i className="fas fa-key text-blue-600 dark:text-blue-400"></i>
                  OpenAI API Key
                </h3>
                {apiKeySaved ? (
                  <p className="text-sm text-green-700 dark:text-green-300 flex items-center gap-1">
                    <i className="fas fa-check-circle"></i>
                    API key configured
                  </p>
                ) : (
                  <p className="text-sm text-blue-700 dark:text-blue-300 flex items-center gap-1">
                    <i className="fas fa-exclamation-circle"></i>
                    Please add your OpenAI API key to continue
                  </p>
                )}
              </div>
              <button
                onClick={() => setShowApiKeyInput(!showApiKeyInput)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800 text-white text-sm rounded-lg font-medium transition-colors"
              >
                {showApiKeyInput ? "Close" : apiKeySaved ? "Change" : "Add"}
              </button>
            </div>

            {showApiKeyInput && (
              <div className="mt-4 space-y-3">
                <p className="text-xs text-slate-600 dark:text-slate-300">
                  Get your free API key at{" "}
                  <a
                    href="https://platform.openai.com/account/api-keys"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
                  >
                    platform.openai.com/account/api-keys
                  </a>
                </p>
                <input
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="sk-proj-..."
                  className="w-full p-3 border-2 border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-slate-700 dark:text-white text-sm"
                />
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Your API key is stored locally in your browser only. Never shared with us.
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={handleSaveApiKey}
                    className="flex-1 px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors text-sm flex items-center justify-center gap-2"
                  >
                    <i className="fas fa-save"></i>
                    Save Key
                  </button>
                  {apiKeySaved && (
                    <button
                      onClick={handleRemoveApiKey}
                      className="flex-1 px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors text-sm flex items-center justify-center gap-2"
                    >
                      <i className="fas fa-trash"></i>
                      Remove Key
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Input Section */}
          <div className="space-y-4">
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
              Describe what you built
            </label>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Example: I built a feature flag service to safely launch experiments, including REST APIs for toggles and a dashboard"
              className="w-full p-4 border-2 border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-slate-700 dark:text-white resize-none"
              rows={4}
              disabled={!apiKeySaved}
            />
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Share the overall project or feature goals. Add optional requirements below for extra
              precision.
            </p>

            <div className="rounded-xl border border-slate-200 bg-white/70 p-4 shadow-sm dark:border-slate-700 dark:bg-slate-800/60">
              <button
                type="button"
                onClick={() => setShowRequirementsInput((prev) => !prev)}
                className="flex w-full items-center justify-between"
              >
                <div className="text-left">
                  <p className="font-semibold text-slate-900 dark:text-white">
                    Requirement specification (optional)
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Capture acceptance criteria, SLAs, integrations, or compliance needs you want
                    the tests to respect.
                  </p>
                </div>
                <span className="text-slate-500 dark:text-slate-300">
                  <i
                    className={`fas fa-chevron-${showRequirementsInput ? "up" : "down"} transition-transform`}
                  ></i>
                </span>
              </button>

              {showRequirementsInput && (
                <textarea
                  value={requirements}
                  onChange={(e) => setRequirements(e.target.value)}
                  placeholder="Acceptance criteria, regulatory constraints, performance targets, unsupported scenarios, etc."
                  className="mt-4 w-full rounded-lg border-2 border-slate-300 p-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-600 dark:bg-slate-700 dark:text-white"
                  rows={4}
                />
              )}
            </div>

            <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/60 p-4 dark:border-slate-700 dark:bg-slate-900/30">
              <label className="flex cursor-pointer items-start gap-3">
                <input
                  type="checkbox"
                  className="mt-1 h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  checked={needsManualContext}
                  onChange={(e) => setNeedsManualContext(e.target.checked)}
                />
                <div>
                  <span className="font-semibold text-slate-900 dark:text-white">
                    Add extra context manually
                  </span>
                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    When disabled, we craft smart context automatically and jump straight to your
                    test cases. Enable this if you prefer to answer detailed questions yourself.
                  </p>
                </div>
              </label>
            </div>
          </div>

          {/* Button */}
          <button
            onClick={handleNext}
            disabled={loading || !apiKeySaved || !input.trim()}
            className="w-full mt-8 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-all duration-200 transform hover:scale-105 flex items-center justify-center gap-2"
          >
            <i className="fas fa-arrow-right"></i>
            {loading ? "Classifying..." : "Next"}
          </button>

          {/* Features */}
          <div className="grid grid-cols-1 gap-4 mt-12 pt-8 border-t border-slate-200 dark:border-slate-700 sm:grid-cols-3">
            <div className="text-center rounded-xl bg-slate-50/60 p-4 dark:bg-slate-900/30 sm:bg-transparent sm:p-0">
              <div className="text-3xl mb-2 text-blue-600 dark:text-blue-400">
                <i className="fas fa-flask"></i>
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-400">5 Test Types</p>
            </div>
            <div className="text-center rounded-xl bg-slate-50/60 p-4 dark:bg-slate-900/30 sm:bg-transparent sm:p-0">
              <div className="text-3xl mb-2 text-green-600 dark:text-green-400">
                <i className="fas fa-code"></i>
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-400">8 Frameworks</p>
            </div>
            <div className="text-center rounded-xl bg-slate-50/60 p-4 dark:bg-slate-900/30 sm:bg-transparent sm:p-0">
              <div className="text-3xl mb-2 text-yellow-600 dark:text-yellow-400">
                <i className="fas fa-bolt"></i>
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-400">Instant Results</p>
            </div>
          </div>

          {/* Saved Tests */}
          <SavedTestsList onLoadTest={() => {}} />
        </div>
      </div>
    </div>
  );
}
