import { categoryDescriptions } from "./questions";

const categoryHints: Record<string, string[]> = {
  "backend-api": [
    "Validate all HTTP methods, payload schemas, and authentication flows including success, validation, and authorization failures.",
    "Cover rate limiting, concurrency, idempotency of repeated requests, and graceful handling of upstream/downstream outages.",
    "Ensure error responses follow the contract (status codes + structured error bodies).",
    "Verify integration with the data layer including transaction rollback, pagination, and filtering logic.",
  ],
  "frontend-component": [
    "Exercise UI states: initial, loading, success, empty, and error across desktop and mobile breakpoints.",
    "Validate accessibility (ARIA labels, keyboard navigation, focus rings) and visual contrast in light/dark themes.",
    "Ensure form validation, inline feedback, and disabling/enabling of controls behaves correctly.",
    "Confirm external API interactions are debounced, retried, and surfaced to the user appropriately.",
  ],
  database: [
    "Test CRUD operations with transactional integrity, constraints, and cascading behavior.",
    "Validate indexing, query performance, and plan for long-running analytical workloads.",
    "Exercise migration/rollback scripts and ensure backward compatibility for existing data.",
    "Check backup/restore procedures, failover replicas, and data retention policies.",
  ],
  "library-function": [
    "Cover deterministic outputs, rounding/precision rules, and locale/timezone awareness where applicable.",
    "Test invalid inputs, optional arguments, and default parameter handling.",
    "Verify side effects, asynchronous flows, and integration with caller-supplied callbacks/promises.",
    "Evaluate performance for large payloads and repeated invocations to catch regressions.",
  ],
  integration: [
    "Exercise full end-to-end workflows spanning multiple services or queues.",
    "Simulate upstream/downstream failures, retries, timeouts, and circuit breaker scenarios.",
    "Validate data contracts, serialization formats, and schema evolution between systems.",
    "Confirm monitoring/alerting signals fire when integrations degrade or drift.",
  ],
  "data-pipeline": [
    "Cover ingestion of both happy-path and malformed records, ensuring data quality checks block bad data.",
    "Test scheduling, batching vs. streaming paths, and idempotent reprocessing of historical runs.",
    "Validate transformations, aggregations, and schema evolution as data moves through stages.",
    "Ensure failure recovery, checkpointing, and alerting operate without data loss.",
  ],
  other: [
    "Exercise core business flows plus negative, edge, and boundary cases.",
    "Validate observability: structured logging, metrics, and tracing for key milestones.",
    "Ensure resiliency to dependency outages, slow responses, and retry storms.",
    "Cover cross-cutting concerns like security, performance, and accessibility relevant to the stack.",
  ],
};

export function buildAutoContext(
  projectDescription: string,
  category: string,
  requirements?: string,
  defaultContext?: string
): string[] {
  const cleanDescription = projectDescription.trim() || "No additional description provided.";
  const requirementContext = requirements?.trim()
    ? `Key requirements: ${requirements.trim()}`
    : null;
  const globalContext = defaultContext?.trim()
    ? `Global considerations: ${defaultContext.trim()}`
    : null;
  const readableCategory = categoryDescriptions[category] || categoryDescriptions.other;

  const normalizedCategory = categoryHints[category] ? category : "other";

  const baseContext = [
    `Project summary: ${cleanDescription}`,
    `System type: ${readableCategory}.`,
    "Target outcome: deliver reliable, user-friendly functionality aligned with the described goals.",
    "Assume modern authentication/authorization, data validation, and logging best practices are required.",
    "Consider performance budgets, scalability, and graceful degradation under load spikes.",
    "Plan for operational readiness: monitoring, alerting, and fallback behavior for partial outages.",
  ];

  const insertIndex = 1;
  const contextEntries = [requirementContext, globalContext].filter(Boolean) as string[];
  if (contextEntries.length) {
    baseContext.splice(insertIndex, 0, ...contextEntries);
  }

  const combined = [...baseContext, ...categoryHints[normalizedCategory]];

  // Ensure we always return a consistent number of context items for the generator
  return combined.slice(0, 10);
}
