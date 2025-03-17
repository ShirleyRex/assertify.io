"use client";

import { useEffect, useMemo, useState } from "react";
import { useToast } from "@/components/ToastProvider";
import { useSettings } from "@/components/SettingsProvider";
import type { BoilerplateKey } from "@/lib/settings";
import type { TestType } from "@/lib/testTypes";

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

interface Framework {
  title: string;
  description: string;
  filename: string;
  extension: string;
  language: string;
  generateCode: (testCases: TestCase[], sampleSize: number) => string;
}

const frameworks: Record<BoilerplateKey, Framework> = {
  vitest: {
    title: "Vitest",
    description:
      "Fast unit test framework built on Vite. Perfect for modern JavaScript and TypeScript projects.",
    filename: "test.test.ts",
    extension: ".ts",
    language: "typescript",
    generateCode: (testCases, sampleSize) => generateVitestCode(testCases, sampleSize),
  },
  jest: {
    title: "Jest",
    description:
      "Widely used JavaScript testing framework with great documentation and extensive ecosystem.",
    filename: "test.test.js",
    extension: ".js",
    language: "javascript",
    generateCode: (testCases, sampleSize) => generateJestCode(testCases, sampleSize),
  },
  pytest: {
    title: "Pytest",
    description:
      "Popular Python testing framework. Simple syntax and powerful features for test discovery.",
    filename: "test_main.py",
    extension: ".py",
    language: "python",
    generateCode: (testCases, sampleSize) => generatePytestCode(testCases, sampleSize),
  },
  unittest: {
    title: "Unittest",
    description:
      "Python's built-in testing framework. No installation required, part of standard library.",
    filename: "test_main.py",
    extension: ".py",
    language: "python",
    generateCode: (testCases, sampleSize) => generateUnittestCode(testCases, sampleSize),
  },
  junit: {
    title: "JUnit",
    description: "Java testing framework. Industry standard for Java development.",
    filename: "MainTest.java",
    extension: ".java",
    language: "java",
    generateCode: (testCases, sampleSize) => generateJUnitCode(testCases, sampleSize),
  },
  phpunit: {
    title: "PHPUnit",
    description: "PHP testing framework. Comprehensive assertion library and mocking support.",
    filename: "MainTest.php",
    extension: ".php",
    language: "php",
    generateCode: (testCases, sampleSize) => generatePHPUnitCode(testCases, sampleSize),
  },
  rspec: {
    title: "RSpec",
    description: "Ruby testing framework. Behavior-driven development focused.",
    filename: "main_spec.rb",
    extension: ".rb",
    language: "ruby",
    generateCode: (testCases, sampleSize) => generateRSpecCode(testCases, sampleSize),
  },
  mocha: {
    title: "Mocha",
    description: "Flexible JavaScript test framework. Great for both unit and integration testing.",
    filename: "test.test.js",
    extension: ".js",
    language: "javascript",
    generateCode: (testCases, sampleSize) => generateMochaCode(testCases, sampleSize),
  },
};

function generateVitestCode(testCases: TestCase[], sampleSize: number): string {
  const testCaseCode = testCases
    .slice(0, sampleSize)
    .map(
      (tc) => `  it('${tc.testName}', () => {
    // ${tc.description}
    // ${tc.givenContext}
    expect(true).toBe(true)
  })`
    )
    .join("\n\n");

  return `import { describe, it, expect, beforeEach, afterEach } from 'vitest'

describe('Generated Tests', () => {
  beforeEach(() => {
    // Setup: Initialize test data
  })

  afterEach(() => {
    // Teardown: Clean up test data
  })

${testCaseCode}
})`;
}

function generateJestCode(testCases: TestCase[], sampleSize: number): string {
  const testCaseCode = testCases
    .slice(0, sampleSize)
    .map(
      (tc) => `  test('${tc.testName}', () => {
    // ${tc.description}
    expect(true).toBe(true)
  })`
    )
    .join("\n\n");

  return `describe('Generated Tests', () => {
  beforeEach(() => {
    // Setup: Initialize test data
  })

  afterEach(() => {
    // Teardown: Clean up test data
  })

${testCaseCode}
})`;
}

function generatePytestCode(testCases: TestCase[], sampleSize: number): string {
  const testCaseCode = testCases
    .slice(0, sampleSize)
    .map(
      (tc) => `def test_${tc.testName.toLowerCase().replace(/\\s+/g, "_")}():
    # ${tc.description}
    assert True`
    )
    .join("\n\n");

  return `import pytest

class TestGenerated:
    @pytest.fixture
    def setup(self):
        # Setup test data
        yield
        # Cleanup

${testCaseCode}`;
}

function generateUnittestCode(testCases: TestCase[], sampleSize: number): string {
  const testMethods = testCases
    .slice(0, sampleSize)
    .map(
      (tc) => `    def test_${tc.testName.toLowerCase().replace(/\\s+/g, "_")}(self):
        """${tc.description}"""
        self.assertTrue(True)`
    )
    .join("\n\n");

  return `import unittest

class TestGenerated(unittest.TestCase):
    def setUp(self):
        # Setup test data
        pass

    def tearDown(self):
        # Cleanup
        pass

${testMethods}

if __name__ == '__main__':
    unittest.main()`;
}

function generateJUnitCode(testCases: TestCase[], sampleSize: number): string {
  const testMethods = testCases
    .slice(0, sampleSize)
    .map(
      (tc) => `    @Test
    public void ${
      tc.testName.charAt(0).toLowerCase() + tc.testName.slice(1).replace(/\\s+/g, "")
    }() {
        // ${tc.description}
        assertTrue(true);
    }`
    )
    .join("\n\n");

  return `import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

public class GeneratedTests {
    @BeforeEach
    void setUp() {
        // Setup test data
    }

    @AfterEach
    void tearDown() {
        // Cleanup
    }

${testMethods}
}`;
}

function generatePHPUnitCode(testCases: TestCase[], sampleSize: number): string {
  const testMethods = testCases
    .slice(0, sampleSize)
    .map(
      (tc) => `    public function test${tc.testName.replace(/\\s+/g, "")}()
    {
        // ${tc.description}
        $this->assertTrue(true);
    }`
    )
    .join("\n\n");

  return `<?php

namespace Tests;

use PHPUnit\\Framework\\TestCase;

class GeneratedTests extends TestCase
{
    protected function setUp(): void
    {
        // Setup test data
        parent::setUp();
    }

    protected function tearDown(): void
    {
        // Cleanup
        parent::tearDown();
    }

${testMethods}
}`;
}

function generateRSpecCode(testCases: TestCase[], sampleSize: number): string {
  const testCaseCode = testCases
    .slice(0, sampleSize)
    .map(
      (tc) => `  it '${tc.testName}' do
    # ${tc.description}
    expect(true).to eq(true)
  end`
    )
    .join("\n\n");

  return `describe 'Generated Tests' do
  before(:each) do
    # Setup test data
  end

  after(:each) do
    # Cleanup
  end

${testCaseCode}
end`;
}

function generateMochaCode(testCases: TestCase[], sampleSize: number): string {
  const testCaseCode = testCases
    .slice(0, sampleSize)
    .map(
      (tc) => `  it('${tc.testName}', () => {
    // ${tc.description}
    expect(true).to.equal(true)
  })`
    )
    .join("\n\n");

  return `const { expect } = require('chai')

describe('Generated Tests', () => {
  beforeEach(() => {
    // Setup test data
  })

  afterEach(() => {
    // Cleanup test data
  })

${testCaseCode}
})`;
}

interface BoilerplateModalProps {
  testCases: TestCase[];
  onClose: () => void;
  disabledFrameworks?: Partial<Record<BoilerplateKey, boolean>>;
}

export default function BoilerplateModal({
  testCases,
  onClose,
  disabledFrameworks,
}: BoilerplateModalProps) {
  const [selectedFramework, setSelectedFramework] = useState<string>("vitest");
  const { addToast } = useToast();
  const { settings } = useSettings();

  const availableFrameworks = useMemo(() => {
    return Object.entries(frameworks).filter(
      ([key]) => !disabledFrameworks?.[key as BoilerplateKey]
    );
  }, [disabledFrameworks]);

  useEffect(() => {
    if (!availableFrameworks.length) {
      setSelectedFramework("");
      return;
    }

    const currentStillAvailable = availableFrameworks.some(([key]) => key === selectedFramework);
    if (!currentStillAvailable) {
      setSelectedFramework(availableFrameworks[0][0]);
    }
  }, [availableFrameworks, selectedFramework]);

  const framework = frameworks[selectedFramework as BoilerplateKey];
  const desiredSampleSize = Math.min(
    Math.max(settings.boilerplateSampleSize, 1),
    Math.max(testCases.length, 1)
  );
  const generatedCode = framework
    ? framework.generateCode(testCases, desiredSampleSize)
    : "No template selected.";

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedCode).then(() => {
      addToast({ message: "Code copied to clipboard!", type: "success" });
    });
  };

  const downloadFile = () => {
    const blob = new Blob([generatedCode], { type: "text/plain" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = framework.filename;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (!availableFrameworks.length) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
        <div className="w-full max-w-md rounded-2xl bg-white p-6 text-center shadow-2xl dark:bg-slate-800">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
            No templates enabled
          </h2>
          <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">
            All boilerplate templates are disabled. Enable at least one in settings to generate
            code.
          </p>
          <button
            onClick={onClose}
            className="mt-6 w-full rounded-2xl bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-slate-200 dark:border-slate-700">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <i className="fas fa-laptop-code"></i>
            Generate Test Code Boilerplate
          </h2>
          <button
            onClick={onClose}
            className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 text-2xl"
          >
            ✕
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Description */}
          <p className="text-slate-600 dark:text-slate-300">
            Select your testing framework and we will generate ready-to-use test boilerplate code.
          </p>

          {/* Framework Selection */}
          <div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
              Select Testing Framework:
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {availableFrameworks.map(([key, fw]) => (
                <button
                  key={key}
                  onClick={() => setSelectedFramework(key)}
                  className={`p-4 rounded-lg border-2 transition-all text-center ${
                    selectedFramework === key
                      ? "border-green-600 bg-green-50 dark:bg-green-900 text-slate-900 dark:text-white"
                      : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:border-slate-300"
                  }`}
                >
                  <div className="font-semibold">{fw.title}</div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">{fw.language}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Framework Info */}
          <div className="bg-blue-50 dark:bg-blue-900 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
            <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
              {framework.title}
            </h4>
            <p className="text-blue-800 dark:text-blue-200 text-sm">{framework.description}</p>
          </div>

          {/* Code Preview */}
          <div>
            <div className="flex justify-between items-center mb-3">
              <h4 className="font-semibold text-slate-900 dark:text-white">
                Generated Boilerplate Code
              </h4>
              <span className="text-xs text-slate-500 dark:text-slate-400">
                {framework.filename}
              </span>
            </div>
            <pre className="bg-slate-900 dark:bg-slate-950 text-slate-100 p-4 rounded-lg overflow-x-auto max-h-96 overflow-y-auto text-sm">
              <code>{generatedCode}</code>
            </pre>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              onClick={copyToClipboard}
              className="px-4 py-3 bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
            >
              <i className="fas fa-copy"></i>
              Copy Code
            </button>
            <button
              onClick={downloadFile}
              className="px-4 py-3 bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-800 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
            >
              <i className="fas fa-download"></i>
              Download File
            </button>
          </div>

          {/* Close Button */}
          <button
            onClick={onClose}
            className="w-full px-4 py-3 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-900 dark:text-white rounded-lg font-medium transition-colors"
          >
            ✓ Done
          </button>
        </div>
      </div>
    </div>
  );
}
