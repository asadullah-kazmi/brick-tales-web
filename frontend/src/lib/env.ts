/**
 * Centralized environment variable access with defaults.
 * All NEXT_PUBLIC_* vars are inlined at build time.
 */

const isProd = process.env.NODE_ENV === "production";

/** Base URL for the app (SEO, canonical, OG). Set in production. */
export function getAppUrl(): string {
  return (
    process.env.NEXT_PUBLIC_APP_URL ??
    (typeof window !== "undefined"
      ? window.location.origin
      : "https://stream.example.com")
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
