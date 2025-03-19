"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ToastProvider";
import { useConfirmDialog } from "@/components/ConfirmDialogProvider";

interface SavedTest {
  id: string;
  projectDescription: string;
  category: string;
  timestamp: string;
  testCaseCount: number;
}

interface SavedTestsListProps {
  onLoadTest: (testId: string) => void;
}

export default function SavedTestsList({ onLoadTest }: SavedTestsListProps) {
  const [savedTests, setSavedTests] = useState<SavedTest[]>([]);
  const [showList, setShowList] = useState(false);
  const router = useRouter();
  const { addToast } = useToast();
  const { confirm } = useConfirmDialog();

  useEffect(() => {
    loadSavedTests();
  }, []);

  const loadSavedTests = () => {
    try {
      const saved = localStorage.getItem("savedTests");
      if (saved) {
        const tests = JSON.parse(saved);
        setSavedTests(
          tests.sort(
            (a: SavedTest, b: SavedTest) =>
              new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
          )
        );
      }
    } catch (error) {
      console.error("Error loading saved tests:", error);
    }
  };

  const handleLoadTest = (testId: string) => {
    try {
      const saved = localStorage.getItem(testId);
      if (saved) {
        const testData = JSON.parse(saved);
        // Restore the session storage with the saved data
        sessionStorage.setItem("projectDescription", testData.projectDescription);
        sessionStorage.setItem("category", testData.category);
        sessionStorage.setItem("testCases", JSON.stringify(testData.testCases));
        sessionStorage.setItem("testingStrategy", testData.testingStrategy);
        sessionStorage.setItem("riskAreas", JSON.stringify(testData.riskAreas));
        sessionStorage.setItem("currentTestId", testId);
        onLoadTest(testId);
        router.push("/results");
      }
    } catch (error) {
      console.error("Error loading test:", error);
      addToast({ message: "Failed to load test.", type: "error" });
    }
  };

  const handleDeleteTest = async (testId: string) => {
    const confirmed = await confirm({
      title: "Delete saved test?",
      description:
        "This test will be permanently removed from your saved list. This action cannot be undone.",
      confirmLabel: "Delete test",
      variant: "danger",
    });

    if (!confirmed) {
      return;
    }

    try {
      localStorage.removeItem(testId);
      const updated = savedTests.filter((test) => test.id !== testId);
      setSavedTests(updated);
      localStorage.setItem("savedTests", JSON.stringify(updated));
      addToast({ message: "Saved test deleted.", type: "success" });
    } catch (error) {
      console.error("Error deleting test:", error);
      addToast({ message: "Failed to delete test.", type: "error" });
    }
  };

  if (savedTests.length === 0) {
    return null;
  }

  return (
    <div className="mt-8 pt-8 border-t border-slate-200 dark:border-slate-700">
      <button
        onClick={() => setShowList(!showList)}
        className="flex items-center gap-2 text-lg font-semibold text-slate-900 dark:text-white mb-4 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
      >
        <span className="text-xl">{showList ? "▼" : "▶"}</span>
        <i className="fas fa-book"></i>
        Saved Tests ({savedTests.length})
      </button>

      {showList && (
        <div className="space-y-3">
          {savedTests.map((test) => (
            <div
              key={test.id}
              className="bg-white dark:bg-slate-800 rounded-lg shadow p-4 border-l-4 border-blue-500 hover:shadow-lg transition-shadow"
            >
              <div className="flex justify-between items-start gap-4">
                <div className="flex-1 min-w-0">
                  <h3
                    className="font-semibold text-slate-900 dark:text-white mb-1 truncate"
                    title={test.projectDescription}
                  >
                    {test.projectDescription}
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
                    Category: <span className="font-medium">{test.category}</span>
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-500">
                    {test.testCaseCount} test cases •{" "}
                    {new Date(test.timestamp).toLocaleDateString()} at{" "}
                    {new Date(test.timestamp).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
                <div className="flex gap-2 ml-4 flex-shrink-0">
                  <button
                    onClick={() => handleLoadTest(test.id)}
                    className="px-3 py-2 bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800 text-white text-xs rounded-lg font-medium transition-colors whitespace-nowrap flex items-center gap-1"
                    title="Load this test"
                  >
                    <i className="fas fa-upload"></i>
                    Load
                  </button>
                  <button
                    onClick={() => handleDeleteTest(test.id)}
                    className="px-3 py-2 bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-800 text-white text-xs rounded-lg font-medium transition-colors whitespace-nowrap flex items-center gap-1"
                    title="Delete this test"
                  >
                    <i className="fas fa-trash"></i>
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
