export enum TestType {
  Unit = "unit",
  Integration = "integration",
  Feature = "feature",
  Performance = "performance",
  Manual = "manual",
}

export const TEST_TYPE_VALUES = [
  TestType.Unit,
  TestType.Integration,
  TestType.Feature,
  TestType.Performance,
  TestType.Manual,
] as const;
