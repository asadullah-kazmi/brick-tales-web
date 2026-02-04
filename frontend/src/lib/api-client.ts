/**
 * Centralized API client using fetch.
 * Base URL from NEXT_PUBLIC_API_BASE_URL. Handles JSON requests, responses, and errors globally.
 */
import { getApiBaseUrl } from "@/lib/env";

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly body?: unknown
  ) {
    super(message);
    this.name = "ApiError";
  }
}

/** User-friendly message from API errors (handles NestJS validation message arrays). */
export function getApiErrorMessage(err: unknown): string {
  if (
    err instanceof ApiError &&
    err.body &&
    typeof err.body === "object" &&
    "message" in err.body
  ) {
    const msg = (err.body as { message: unknown }).message;
    if (Array.isArray(msg)) return msg.join(" ");
    if (typeof msg === "string") return msg;
  }
  if (err instanceof Error) return err.message;
  return "Something went wrong. Please try again.";
}

type RequestConfig = RequestInit & {
  params?: Record<string, string>;
};

function buildUrl(path: string, params?: Record<string, string>): string {
  const base = getApiBaseUrl().replace(/\/$/, "");
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  let url = `${base}${normalizedPath}`;
  if (params && Object.keys(params).length > 0) {
    const search = new URLSearchParams(params).toString();
    url += `?${search}`;
  }
  return url;
}

async function request<T>(
  path: string,
  config: RequestConfig = {}
): Promise<T> {
  const { params, headers: customHeaders, body, ...rest } = config;
  const url = buildUrl(path, params);
  const headers: HeadersInit = {
    Accept: "application/json",
    "Content-Type": "application/json",
    ...customHeaders,
  };
  const init: RequestInit = {
    ...rest,
    headers,
    body:
      body !== undefined && body !== null
        ? typeof body === "string"
          ? body
          : JSON.stringify(body)
        : undefined,
  };

  const response = await fetch(url, init);
  let parsed: unknown;
  const contentType = response.headers.get("Content-Type") ?? "";
  if (contentType.includes("application/json")) {
    try {
      parsed = await response.json();
    } catch {
      parsed = null;
    }
  } else {
    const text = await response.text();
    parsed = text || null;
  }

  if (!response.ok) {
    const message =
      parsed &&
      typeof parsed === "object" &&
      "message" in parsed &&
      typeof (parsed as { message: unknown }).message === "string"
        ? (parsed as { message: string }).message
        : response.statusText ||
          `Request failed with status ${response.status}`;
    throw new ApiError(message, response.status, parsed);
  }

  return parsed as T;
}

/** GET request. */
export function get<T>(
  path: string,
  config?: Omit<RequestConfig, "method" | "body">
): Promise<T> {
  return request<T>(path, { ...config, method: "GET" });
}

/** POST request. */
export function post<T>(
  path: string,
  body?: unknown,
  config?: Omit<RequestConfig, "method" | "body">
): Promise<T> {
  return request<T>(path, { ...config, method: "POST", body });
}

/** PUT request. */
export function put<T>(
  path: string,
  body?: unknown,
  config?: Omit<RequestConfig, "method" | "body">
): Promise<T> {
  return request<T>(path, { ...config, method: "PUT", body });
}

/** DELETE request. */
export function del<T>(
  path: string,
  config?: Omit<RequestConfig, "method" | "body">
): Promise<T> {
  return request<T>(path, { ...config, method: "DELETE" });
}
