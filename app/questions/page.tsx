"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { categoryDescriptions } from "@/lib/questions";
import genericQuestions from "@/lib/genericQuestions.json";
import { useToast } from "@/components/ToastProvider";
import { useSettings } from "@/components/SettingsProvider";
import { filterTestCasesBySettings } from "@/lib/testCaseUtils";

export default function QuestionsPage() {
  const router = useRouter();
  const [category, setCategory] = useState("");
  const [questions, setQuestions] = useState<string[]>([]);
  const [answers, setAnswers] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [generatingQuestions, setGeneratingQuestions] = useState(false);
  const [projectDescription, setProjectDescription] = useState("");
  const [projectRequirements, setProjectRequirements] = useState("");
  const { settings } = useSettings();
  const { addToast } = useToast();

  useEffect(() => {
    const loadQuestions = async () => {
      const savedCategory = sessionStorage.getItem("category");
      const savedProject = sessionStorage.getItem("projectDescription");
      const savedRequirements = sessionStorage.getItem("projectRequirements") || "";

      if (!savedCategory || !savedProject) {
        router.push("/");
        return;
      }

      setCategory(savedCategory);
      setProjectDescription(savedProject);
      setProjectRequirements(savedRequirements);

      // Fetch custom questions based on project description
      setGeneratingQuestions(true);
      try {
        const apiKey = localStorage.getItem("openai_api_key");

        const response = await fetch("/api/generate-questions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            projectDescription: savedProject,
            category: savedCategory,
            apiKey: apiKey,
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          console.error("Error generating questions:", data);
          throw new Error(data.error || "Failed to generate questions");
        }

        const generatedQuestions = data.questions || [];
        setQuestions(generatedQuestions);
        setAnswers(new Array(generatedQuestions.length).fill(""));
      } catch (error) {
        console.error("Error generating questions:", error);
        // Fallback to generic questions if generation fails
        setQuestions(genericQuestions);
        setAnswers(new Array(genericQuestions.length).fill(""));
      } finally {
        setGeneratingQuestions(false);
        setLoading(false);
      }
    };

    loadQuestions();
  }, [router]);

  const handleAnswerChange = (index: number, value: string) => {
    const newAnswers = [...answers];
    newAnswers[index] = value;
    setAnswers(newAnswers);
  };

  const handleSkip = () => {
    sessionStorage.setItem("answers", JSON.stringify(answers));
    router.push("/results");
  };

  const handleNext = async () => {
    if (answers.some((a) => !a.trim())) {
      addToast({ message: "Please answer all questions or skip.", type: "info" });
      return;
    }

    setLoading(true);
    try {
      const apiKey = localStorage.getItem("openai_api_key");

      const supplementalContext: string[] = [];
      if (projectRequirements.trim()) {
        supplementalContext.push(`Requirement specification: ${projectRequirements.trim()}`);
      }
      if (settings.defaultContext.trim()) {
        supplementalContext.push(settings.defaultContext.trim());
      }

      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectDescription,
          category,
          answers: [...answers, ...supplementalContext],
          apiKey: apiKey,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        console.error("Error generating tests:", data);
        throw new Error(data.error || "Failed to generate test cases");
      }

      const filteredTestCases = filterTestCasesBySettings(data.testCases || [], settings);
      if (!filteredTestCases.length) {
        addToast({
          message: "All generated test cases were filtered out by your settings.",
          type: "error",
        });
        return;
      }

      sessionStorage.setItem("answers", JSON.stringify([...answers, ...supplementalContext]));
      sessionStorage.setItem("testCases", JSON.stringify(filteredTestCases));
      sessionStorage.setItem("testingStrategy", data.testingStrategy || "");
      sessionStorage.setItem("riskAreas", JSON.stringify(data.riskAreas || []));

      router.push("/results");
    } catch (error) {
      console.error("Error:", error);
      addToast({ message: "Error generating test cases. Please try again.", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen px-4 py-8 bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600 dark:text-slate-300">
            {generatingQuestions ? "Generating custom questions..." : "Loading..."}
          </p>
        </div>
      </div>
    );
  }

  const progress = ((questions.length > 0 ? questions.length : 1) / 10) * 100;

  return (
    <div className="min-h-screen px-4 py-8 bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-slate-900 dark:to-slate-800">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-2">
            Context Questions
          </h1>
          <p className="text-slate-600 dark:text-slate-300">
            For: {categoryDescriptions[category] || category}
          </p>

          {/* Progress Bar */}
          <div className="mt-4 bg-slate-200 dark:bg-slate-700 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-blue-600 to-indigo-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">
            {progress.toFixed(0)}% complete
          </p>
        </div>

        {/* Questions */}
        <div className="space-y-6 mb-8">
          {questions.map((question, index) => (
            <div key={index} className="bg-white dark:bg-slate-800 rounded-lg shadow p-6">
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">
                Question {index + 1} of {questions.length}
              </label>
              <p className="text-lg text-slate-900 dark:text-white mb-4 font-medium">{question}</p>
              <textarea
                value={answers[index]}
                onChange={(e) => handleAnswerChange(index, e.target.value)}
                placeholder="Type your answer here..."
                className="w-full p-4 border-2 border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-slate-700 dark:text-white resize-none"
                rows={3}
              />
            </div>
          ))}
        </div>

        {/* Buttons */}
        <div className="flex gap-4">
          <button
            onClick={handleSkip}
            disabled={loading}
            className="flex-1 px-6 py-3 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 disabled:opacity-50 text-slate-900 dark:text-white font-semibold rounded-lg transition-all"
          >
            Skip
          </button>
          <button
            onClick={handleNext}
            disabled={loading}
            className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 text-white font-semibold rounded-lg transition-all"
          >
            {loading ? "Generating..." : "Generate Tests →"}
          </button>
        </div>
      </div>
    </div>
  );
}
