import type { Settings } from "@/lib/settings";

interface TestCaseLike {
  testType: string;
  [key: string]: any;
}

export function filterTestCasesBySettings<T extends TestCaseLike>(
  testCases: T[],
  settings: Settings
): T[] {
  const disabledTypes = Object.entries(settings.disabledTestTypes)
    .filter(([, disabled]) => disabled)
    .map(([type]) => type);

  if (!disabledTypes.length) {
    return testCases;
  }

  return testCases.filter((testCase) => !disabledTypes.includes(testCase.testType));
}
