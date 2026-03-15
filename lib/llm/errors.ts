export interface NormalizedLLMError {
  status: number;
  message: string;
  isAuthError: boolean;
}

const AUTH_ERROR_PATTERNS = [
  "401",
  "unauthorized",
  "invalid api key",
  "invalid x-goog-api-key",
  "api key not valid",
  "authentication",
  "permission denied",
  "api_key_invalid",
];

export function normalizeProviderError(error: unknown): NormalizedLLMError {
  const err = error as Record<string, unknown>;

  const status =
    typeof err?.status === "number"
      ? err.status
      : typeof err?.statusCode === "number"
        ? err.statusCode
        : 500;

  let message = typeof err?.message === "string" ? err.message : String(error);

  // Sometimes SDKs return a JSON payload embedded in the error string.
  try {
    const jsonStart = message.indexOf("{");
    const jsonEnd = message.lastIndexOf("}");
    if (jsonStart !== -1 && jsonEnd > jsonStart) {
      const parsed = JSON.parse(message.substring(jsonStart, jsonEnd + 1));
      if (parsed.error && typeof parsed.error.message === "string") {
        message = parsed.error.message;
      } else if (typeof parsed.message === "string") {
        message = parsed.message;
      }
    }
  } catch {
    // Ignore parsing errors, stick to the original message
  }

  const isAuthError =
    status === 401 ||
    status === 403 ||
    AUTH_ERROR_PATTERNS.some((pattern) => message.toLowerCase().includes(pattern));

  return { status: isAuthError ? 401 : status, message, isAuthError };
}
