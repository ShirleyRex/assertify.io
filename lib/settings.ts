import { TestType, TEST_TYPE_VALUES } from "./testTypes";

export { TestType } from "./testTypes";

export const boilerplateOptions = [
  "vitest",
  "jest",
  "pytest",
  "unittest",
  "junit",
  "phpunit",
  "rspec",
  "mocha",
] as const;

export type BoilerplateKey = (typeof boilerplateOptions)[number];

export interface Settings {
  defaultContext: string;
  disabledTestTypes: Record<TestType, boolean>;
  boilerplateSampleSize: number;
  disabledBoilerplates: Record<BoilerplateKey, boolean>;
}

export const SETTINGS_STORAGE_KEY = "tcg_settings";

export const testTypeOptions: TestType[] = [...TEST_TYPE_VALUES];

export const defaultSettings: Settings = {
  defaultContext: "",
  disabledTestTypes: {
    [TestType.Unit]: false,
    [TestType.Integration]: false,
    [TestType.Feature]: false,
    [TestType.Performance]: false,
    [TestType.Manual]: false,
  },
  boilerplateSampleSize: 5,
  disabledBoilerplates: boilerplateOptions.reduce(
    (acc, key) => {
      acc[key] = false;
      return acc;
    },
    {} as Record<BoilerplateKey, boolean>
  ),
};

export function sanitizeSettings(partial?: Partial<Settings>): Settings {
  const merged: Settings = {
    defaultContext: partial?.defaultContext ?? defaultSettings.defaultContext,
    boilerplateSampleSize:
      typeof partial?.boilerplateSampleSize === "number"
        ? partial.boilerplateSampleSize
        : defaultSettings.boilerplateSampleSize,
    disabledTestTypes: {
      ...defaultSettings.disabledTestTypes,
      ...(partial?.disabledTestTypes ?? {}),
    },
    disabledBoilerplates: {
      ...defaultSettings.disabledBoilerplates,
      ...(partial?.disabledBoilerplates ?? {}),
    },
  };

  merged.boilerplateSampleSize = Math.min(5, Math.max(1, Math.round(merged.boilerplateSampleSize)));

  return merged;
}
