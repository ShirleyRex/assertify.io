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

  const message = typeof err?.message === "string" ? err.message : String(error);

  const isAuthError =
    status === 401 ||
    status === 403 ||
    AUTH_ERROR_PATTERNS.some((pattern) => message.toLowerCase().includes(pattern));

  return { status: isAuthError ? 401 : status, message, isAuthError };
}
