"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSettings } from "@/components/SettingsProvider";
import { useToast } from "@/components/ToastProvider";
import {
  boilerplateOptions,
  defaultSettings,
  testTypeOptions,
  PROVIDER_META,
  PROVIDER_KEYS,
} from "@/lib/settings";

export default function SettingsPage() {
  const router = useRouter();
  const { settings, updateSettings } = useSettings();
  const { addToast } = useToast();
  const [formState, setFormState] = useState(settings);

  useEffect(() => {
    setFormState(settings);
  }, [settings]);

  const handleSave = () => {
    updateSettings(formState);
    addToast({ message: "Settings saved successfully.", type: "success" });
  };

  const handleReset = () => {
    updateSettings(defaultSettings);
    addToast({ message: "Settings reset to defaults.", type: "info" });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 px-4 py-10 dark:from-slate-900 dark:to-slate-800">
      <div className="mx-auto max-w-3xl">
        <button
          onClick={() => router.back()}
          className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-blue-600 transition-colors hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
        >
          <i className="fas fa-arrow-left"></i>
          Back
        </button>

        <div className="rounded-3xl bg-white p-8 shadow-2xl dark:bg-slate-800">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Settings</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Personalize how we generate context, test cases, and boilerplate.
            </p>
          </div>

          <div className="space-y-8">
            <section>
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">LLM Provider</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Choose which AI provider and model to use for test generation.
              </p>
              <div className="mt-4 grid gap-3 md:grid-cols-3">
                {PROVIDER_KEYS.map((key) => {
                  const meta = PROVIDER_META[key];
                  const isActive = formState.provider === key;
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() =>
                        setFormState((prev) => ({
                          ...prev,
                          provider: key,
                          model: meta.defaultModel,
                        }))
                      }
                      className={`flex items-center justify-center gap-2 rounded-2xl border p-4 text-sm font-medium transition-all ${
                        isActive
                          ? "border-blue-500 bg-blue-50 text-blue-700 shadow-md dark:border-blue-400 dark:bg-blue-900/30 dark:text-blue-300"
                          : "border-slate-200 bg-white/70 text-slate-700 shadow-sm hover:border-blue-400 dark:border-slate-700 dark:bg-slate-900/40 dark:text-slate-200"
                      }`}
                    >
                      <i className={`fas ${meta.icon}`}></i>
                      {meta.name}
                    </button>
                  );
                })}
              </div>
              <div className="mt-4">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Model
                </label>
                <select
                  value={formState.model}
                  onChange={(e) => setFormState((prev) => ({ ...prev, model: e.target.value }))}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 p-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-900/40 dark:text-white"
                >
                  {PROVIDER_META[formState.provider].models.map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
              </div>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                Default context
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                This text is automatically appended to every request to emphasize permanent testing
                requirements (e.g. compliance rules, performance SLAs).
              </p>
              <textarea
                value={formState.defaultContext}
                onChange={(e) =>
                  setFormState((prev) => ({ ...prev, defaultContext: e.target.value }))
                }
                rows={4}
                className="mt-3 w-full rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-900/40 dark:text-white"
                placeholder="Example: Always validate PII masking and SOC2 logging requirements."
              />
            </section>

            <section>
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Test types</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Disable test categories you do not want generated. This can significantly reduce
                turnaround time.
              </p>
              <div className="mt-4 grid gap-3 md:grid-cols-2">
                {testTypeOptions.map((type) => (
                  <label
                    key={type}
                    className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white/70 p-4 text-sm font-medium text-slate-700 shadow-sm transition-colors hover:border-blue-500 dark:border-slate-700 dark:bg-slate-900/40 dark:text-slate-200"
                  >
                    <input
                      type="checkbox"
                      className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                      checked={formState.disabledTestTypes[type]}
                      onChange={(e) =>
                        setFormState((prev) => ({
                          ...prev,
                          disabledTestTypes: {
                            ...prev.disabledTestTypes,
                            [type]: e.target.checked,
                          },
                        }))
                      }
                    />
                    <span className="capitalize">{type}</span>
                  </label>
                ))}
              </div>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                Boilerplate detail
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Choose how many sample tests each boilerplate template should include.
              </p>
              <div className="mt-4">
                <input
                  type="range"
                  min={1}
                  max={5}
                  value={formState.boilerplateSampleSize}
                  onChange={(e) =>
                    setFormState((prev) => ({
                      ...prev,
                      boilerplateSampleSize: Number(e.target.value),
                    }))
                  }
                  className="w-full"
                />
                <div className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                  {formState.boilerplateSampleSize} sample test
                  {formState.boilerplateSampleSize > 1 ? "s" : ""}
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                Boilerplate templates
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Hide any code templates you never use so the modal stays focused.
              </p>
              <div className="mt-4 grid gap-3 md:grid-cols-2">
                {boilerplateOptions.map((framework) => (
                  <label
                    key={framework}
                    className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white/70 p-4 text-sm font-medium text-slate-700 shadow-sm transition-colors hover:border-blue-500 dark:border-slate-700 dark:bg-slate-900/40 dark:text-slate-200"
                  >
                    <input
                      type="checkbox"
                      className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                      checked={formState.disabledBoilerplates[framework]}
                      onChange={(e) =>
                        setFormState((prev) => ({
                          ...prev,
                          disabledBoilerplates: {
                            ...prev.disabledBoilerplates,
                            [framework]: e.target.checked,
                          },
                        }))
                      }
                    />
                    <span className="capitalize">{framework}</span>
                  </label>
                ))}
              </div>
            </section>
          </div>

          <div className="mt-10 flex flex-wrap gap-3">
            <button
              onClick={handleSave}
              className="flex-1 rounded-2xl bg-blue-600 px-4 py-3 text-center text-white transition-colors hover:bg-blue-700"
            >
              Save settings
            </button>
            <button
              onClick={handleReset}
              className="flex-1 rounded-2xl border border-slate-300 px-4 py-3 text-center text-slate-600 transition-colors hover:bg-slate-100 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-700"
            >
              Reset to defaults
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
