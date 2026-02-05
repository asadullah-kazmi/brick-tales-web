/**
 * Centralized environment variable access with defaults.
 * All NEXT_PUBLIC_* vars are inlined at build time.
 */

const isProd = process.env.NODE_ENV === "production";

/** Base URL for the app (SEO, canonical, OG). Must include scheme (https://). Set in production. */
export function getAppUrl(): string {
  const raw =
    process.env.NEXT_PUBLIC_APP_URL ??
    (typeof window !== "undefined"
      ? window.location.origin
      : "https://bricktales.tv");
  const trimmed = (raw ?? "").trim();
  if (!trimmed) return "https://bricktales.tv";
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://"))
    return trimmed;
  return `https://${trimmed}`;
}

/** Base URL for backend API (no trailing slash). Used by api-client. */
export function getApiBaseUrl(): string {
  return (
    process.env.NEXT_PUBLIC_API_BASE_URL ??
    (typeof window !== "undefined"
      ? `${window.location.origin}/api`
      : "http://localhost:5000/api")
  );
}

/** Whether to use mock APIs (auth, content, analytics). Default true. */
export function getUseMockApi(): boolean {
  return process.env.NEXT_PUBLIC_USE_MOCK_API !== "false";
}

/** True when running in production build. */
export function isProduction(): boolean {
  return isProd;
}
