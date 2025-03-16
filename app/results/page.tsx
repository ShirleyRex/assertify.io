"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import BoilerplateModal from "@/components/BoilerplateModal";
import { useToast } from "@/components/ToastProvider";
import { useSettings } from "@/components/SettingsProvider";
import { filterTestCasesBySettings } from "@/lib/testCaseUtils";
import { boilerplateOptions, testTypeOptions } from "@/lib/settings";
import { TestType } from "@/lib/testTypes";

interface TestCase {
  testType: TestType;
  category: string;
  testName: string;
  description: string;
  givenContext: string;
  testSteps: string[];
  expectedOutcome: string;
  notes?: string;
  setupRequired?: string;
  teardownRequired?: string;
  priority: "high" | "medium" | "low";
}

interface Analysis {
  summary: string;
  riskAreas: string[];
  testingStrategy: string;
}

const testTypeStatMeta: Record<TestType, { label: string; textClass: string }> = {
  [TestType.Unit]: {
    label: "Unit Tests",
    textClass: "text-blue-600 dark:text-blue-400",
  },
  [TestType.Integration]: {
    label: "Integration",
    textClass: "text-purple-600 dark:text-purple-400",
  },
  [TestType.Feature]: {
    label: "Feature Tests",
    textClass: "text-green-600 dark:text-green-400",
  },
  [TestType.Performance]: {
    label: "Performance",
    textClass: "text-orange-600 dark:text-orange-400",
  },
  [TestType.Manual]: {
    label: "Manual Tests",
    textClass: "text-pink-600 dark:text-pink-400",
  },
};

const formatTestTypeLabel = (type: TestType) => type.charAt(0).toUpperCase() + type.slice(1);

export default function ResultsPage() {
  const router = useRouter();
  const [testCases, setTestCases] = useState<TestCase[]>([]);
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [selectedTestType, setSelectedTestType] = useState<TestType | "all">("all");
  const [selectedPriority, setSelectedPriority] = useState<string>("all");
  const [showBoilerplateModal, setShowBoilerplateModal] = useState<boolean>(false);
  const { addToast } = useToast();
  const { settings } = useSettings();
  const hasBoilerplateOptions = useMemo(
    () => boilerplateOptions.some((key) => !settings.disabledBoilerplates[key]),
    [settings.disabledBoilerplates]
  );

  useEffect(() => {
    const cases = sessionStorage.getItem("testCases");
    const testingStrategy = sessionStorage.getItem("testingStrategy");
    const riskAreas = sessionStorage.getItem("riskAreas");
    const projectDescription = sessionStorage.getItem("projectDescription");
    const category = sessionStorage.getItem("category");
    const savedTestId = sessionStorage.getItem("currentTestId");

    if (!cases) {
      router.push("/");
      return;
    }

    try {
      const parsedCases = JSON.parse(cases);
      const filteredCases = filterTestCasesBySettings(parsedCases, settings);
      setTestCases(filteredCases);

      if (testingStrategy || riskAreas) {
        setAnalysis({
          summary: testingStrategy || "",
          riskAreas: riskAreas ? JSON.parse(riskAreas) : [],
          testingStrategy: testingStrategy || "",
        });
      }

      // Only auto-save if this test hasn't been saved yet
      if (projectDescription && category && !savedTestId) {
        saveTestCase(
          projectDescription,
          category,
          filteredCases,
          testingStrategy || "",
          riskAreas || null
        );
      }
    } catch (error) {
      console.error("Failed to parse test cases:", error);
      router.push("/");
    }
  }, [router, settings]);

  const saveTestCase = (
    projectDescription: string,
    category: string,
    testCases: TestCase[],
    testingStrategy: string,
    riskAreasStr: string | null
  ) => {
    try {
      const testId = `test_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const riskAreasArray = riskAreasStr ? JSON.parse(riskAreasStr) : [];

      const testData = {
        projectDescription,
        category,
        testCases,
        testingStrategy,
        riskAreas: riskAreasArray,
        timestamp: new Date().toISOString(),
      };

      localStorage.setItem(testId, JSON.stringify(testData));

      // Store the current test ID in session storage so we don't save it again
      sessionStorage.setItem("currentTestId", testId);

      const savedTestsStr = localStorage.getItem("savedTests") || "[]";
      const savedTests = JSON.parse(savedTestsStr);

      const newTestEntry = {
        id: testId,
        projectDescription,
        category,
        timestamp: new Date().toISOString(),
        testCaseCount: testCases.length,
      };

      savedTests.unshift(newTestEntry);
      localStorage.setItem("savedTests", JSON.stringify(savedTests));
    } catch (error) {
      console.error("Error saving test case:", error);
    }
  };

  const filteredTestCases = useMemo(() => {
    return testCases.filter((tc) => {
      const typeMatch = selectedTestType === "all" || tc.testType === selectedTestType;
      const priorityMatch = selectedPriority === "all" || tc.priority === selectedPriority;
      return typeMatch && priorityMatch;
    });
  }, [testCases, selectedPriority, selectedTestType]);

  const testTypeCount = testTypeOptions.reduce(
    (acc, type) => {
      acc[type] = testCases.filter((tc) => tc.testType === type).length;
      return acc;
    },
    {} as Record<TestType, number>
  );

  const exportToCSV = () => {
    const headers = [
      "Test Type",
      "Priority",
      "Test Name",
      "Description",
      "Given Context",
      "Test Steps",
      "Expected Outcome",
      "Notes",
      "Setup Required",
      "Teardown Required",
    ];

    const rows = testCases.map((tc) => [
      tc.testType,
      tc.priority,
      tc.testName,
      tc.description,
      tc.givenContext,
      tc.testSteps.join(" | "),
      tc.expectedOutcome,
      tc.notes || "",
      tc.setupRequired || "",
      tc.teardownRequired || "",
    ]);

    const csv = [
      headers.join(","),
      ...rows.map((row) =>
        row
          .map((cell) => {
            const cellStr = String(cell);
            if (cellStr.includes(",") || cellStr.includes('"')) {
              return `"${cellStr.replace(/"/g, '""')}"`;
            }
            return cellStr;
          })
          .join(",")
      ),
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "test-cases.csv";
    a.click();
  };

  const exportToJSON = () => {
    const data = {
      analysis,
      testCases,
      exportedAt: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "test-cases.json";
    a.click();
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-100 border-red-300 dark:border-red-700";
      case "medium":
        return "bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-100 border-yellow-300 dark:border-yellow-700";
      case "low":
        return "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-100 border-green-300 dark:border-green-700";
      default:
        return "bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-100 border-slate-300 dark:border-slate-600";
    }
  };

  const getTestTypeColor = (testType: TestType) => {
    switch (testType) {
      case TestType.Unit:
        return "bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-100";
      case TestType.Integration:
        return "bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-100";
      case TestType.Feature:
        return "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-100";
      case TestType.Performance:
        return "bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-100";
      case TestType.Manual:
        return "bg-pink-100 dark:bg-pink-900 text-pink-800 dark:text-pink-100";
      default:
        return "bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-100";
    }
  };

  if (!testCases.length) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 dark:from-slate-900 to-slate-100 dark:to-slate-800 flex items-center justify-center p-4">
        <div className="text-center text-slate-600 dark:text-slate-300">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 dark:from-slate-900 to-slate-100 dark:to-slate-800 p-4 dark:text-white">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.push("/")}
            className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 text-sm font-medium mb-4 flex items-center gap-2"
          >
            <i className="fas fa-arrow-left"></i>
            Start New
          </button>
          <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-4">
            Test Cases Generated
          </h1>

          {/* Analysis Summary */}
          {analysis && (
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6 mb-6">
              <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-3">
                Testing Strategy
              </h2>
              <p className="text-slate-700 dark:text-slate-300 mb-4">{analysis.summary}</p>
              <div>
                <h3 className="font-semibold text-slate-900 dark:text-white mb-2">Risk Areas:</h3>
                <div className="flex flex-wrap gap-2">
                  {analysis.riskAreas.map((risk, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-full text-sm"
                    >
                      {risk}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Statistics */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
            {testTypeOptions.map((type) => (
              <div
                key={type}
                className="bg-white dark:bg-slate-800 rounded-lg shadow p-4 text-center"
              >
                <div className={`text-2xl font-bold ${testTypeStatMeta[type].textClass}`}>
                  {testTypeCount[type]}
                </div>
                <div className="text-xs text-slate-600 dark:text-slate-400">
                  {testTypeStatMeta[type].label}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Filters and Export */}
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
            <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Test Type
                </label>
                <select
                  value={selectedTestType}
                  onChange={(e) => setSelectedTestType(e.target.value as TestType | "all")}
                  className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-slate-700 dark:text-white"
                >
                  <option value="all">All Types</option>
                  {testTypeOptions.map((type) => (
                    <option key={type} value={type}>
                      {formatTestTypeLabel(type)}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Priority
                </label>
                <select
                  value={selectedPriority}
                  onChange={(e) => setSelectedPriority(e.target.value)}
                  className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-slate-700 dark:text-white"
                >
                  <option value="all">All Priorities</option>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
              </div>
            </div>

            <div className="flex gap-2 w-full md:w-auto flex-wrap">
              <button
                onClick={exportToJSON}
                className="flex-1 md:flex-none px-4 py-2 bg-slate-600 dark:bg-slate-700 text-white rounded-lg hover:bg-slate-700 dark:hover:bg-slate-600 font-medium transition-colors text-sm flex items-center justify-center gap-2"
              >
                <i className="fas fa-file-code"></i>
                Export JSON
              </button>
              <button
                onClick={exportToCSV}
                className="flex-1 md:flex-none px-4 py-2 bg-blue-600 dark:bg-blue-700 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 font-medium transition-colors text-sm flex items-center justify-center gap-2"
              >
                <i className="fas fa-file-csv"></i>
                Export CSV
              </button>
              <button
                onClick={() => setShowBoilerplateModal(true)}
                disabled={!hasBoilerplateOptions}
                title={
                  hasBoilerplateOptions
                    ? undefined
                    : "Enable at least one boilerplate template in settings"
                }
                className="flex-1 md:flex-none px-4 py-2 bg-green-600 dark:bg-green-700 text-white rounded-lg hover:bg-green-700 dark:hover:bg-green-600 font-medium transition-colors text-sm flex items-center justify-center gap-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <i className="fas fa-code"></i>
                Generate Code
              </button>
              <button
                onClick={() => {
                  const testCasesStr = sessionStorage.getItem("testCases") || "[]";
                  const projectDescription =
                    sessionStorage.getItem("projectDescription") || "Untitled Project";
                  const category = sessionStorage.getItem("category") || "other";
                  const testingStrategy = sessionStorage.getItem("testingStrategy") || "";
                  const riskAreasStr = sessionStorage.getItem("riskAreas") || "[]";
                  const currentTestId = sessionStorage.getItem("currentTestId");

                  try {
                    const testCases = JSON.parse(testCasesStr);
                    const riskAreas = JSON.parse(riskAreasStr);

                    // If already saved, just notify
                    if (currentTestId) {
                      addToast({
                        message: "This test was already saved automatically!",
                        type: "info",
                      });
                      return;
                    }

                    const testId = `test_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
                    const testData = {
                      projectDescription,
                      category,
                      testCases,
                      testingStrategy,
                      riskAreas,
                      timestamp: new Date().toISOString(),
                    };

                    localStorage.setItem(testId, JSON.stringify(testData));
                    sessionStorage.setItem("currentTestId", testId);

                    const savedTestsStr = localStorage.getItem("savedTests") || "[]";
                    const savedTests = JSON.parse(savedTestsStr);

                    const newTestEntry = {
                      id: testId,
                      projectDescription,
                      category,
                      timestamp: new Date().toISOString(),
                      testCaseCount: testCases.length,
                    };

                    savedTests.unshift(newTestEntry);
                    localStorage.setItem("savedTests", JSON.stringify(savedTests));
                    addToast({
                      message: "Test saved to local storage!",
                      type: "success",
                    });
                  } catch (error) {
                    console.error("Error saving:", error);
                    addToast({
                      message: "Failed to save test. Please try again.",
                      type: "error",
                    });
                  }
                }}
                className="flex-1 md:flex-none px-4 py-2 bg-purple-600 dark:bg-purple-700 text-white rounded-lg hover:bg-purple-700 dark:hover:bg-purple-600 font-medium transition-colors text-sm flex items-center justify-center gap-2"
              >
                <i className="fas fa-save"></i>
                Save Test
              </button>
            </div>
          </div>

          <p className="text-sm text-slate-600 dark:text-slate-400 mt-4">
            Showing {filteredTestCases.length} of {testCases.length} test cases
          </p>
        </div>

        {/* Test Cases Table */}
        <div className="space-y-4">
          {filteredTestCases.map((testCase, idx) => (
            <div key={idx} className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-6">
              <div className="flex flex-wrap gap-3 mb-4">
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium ${getTestTypeColor(
                    testCase.testType
                  )}`}
                >
                  {testCase.testType.toUpperCase()}
                </span>
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium border ${getPriorityColor(
                    testCase.priority
                  )}`}
                >
                  {testCase.priority.toUpperCase()}
                </span>
              </div>

              <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
                {testCase.testName}
              </h3>

              <p className="text-slate-700 dark:text-slate-300 mb-4">{testCase.description}</p>

              <div className="bg-slate-50 dark:bg-slate-700 rounded-lg p-4 mb-4">
                <h4 className="font-semibold text-slate-900 dark:text-white text-sm mb-2">
                  Context
                </h4>
                <p className="text-slate-700 dark:text-slate-300 text-sm mb-4">
                  {testCase.givenContext}
                </p>

                <h4 className="font-semibold text-slate-900 dark:text-white text-sm mb-2">
                  Test Steps
                </h4>
                <ol className="list-decimal list-inside space-y-1 text-slate-700 dark:text-slate-300 text-sm mb-4">
                  {testCase.testSteps.map((step, stepIdx) => (
                    <li key={stepIdx}>{step}</li>
                  ))}
                </ol>

                <h4 className="font-semibold text-slate-900 dark:text-white text-sm mb-2">
                  Expected Outcome
                </h4>
                <p className="text-slate-700 dark:text-slate-300 text-sm mb-4">
                  {testCase.expectedOutcome}
                </p>

                {testCase.setupRequired && (
                  <>
                    <h4 className="font-semibold text-slate-900 dark:text-white text-sm mb-2">
                      Setup Required
                    </h4>
                    <p className="text-slate-700 dark:text-slate-300 text-sm mb-4">
                      {testCase.setupRequired}
                    </p>
                  </>
                )}

                {testCase.teardownRequired && (
                  <>
                    <h4 className="font-semibold text-slate-900 dark:text-white text-sm mb-2">
                      Teardown Required
                    </h4>
                    <p className="text-slate-700 dark:text-slate-300 text-sm mb-4">
                      {testCase.teardownRequired}
                    </p>
                  </>
                )}

                {testCase.notes && (
                  <>
                    <h4 className="font-semibold text-slate-900 dark:text-white text-sm mb-2">
                      Notes
                    </h4>
                    <p className="text-slate-700 dark:text-slate-300 text-sm">{testCase.notes}</p>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Boilerplate Modal */}
      {showBoilerplateModal && (
        <BoilerplateModal
          testCases={testCases}
          onClose={() => setShowBoilerplateModal(false)}
          disabledFrameworks={settings.disabledBoilerplates}
        />
      )}
    </div>
  );
}
