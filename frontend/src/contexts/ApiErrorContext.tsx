"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import {
  ApiError,
  setGlobalApiErrorHandler,
  getApiErrorUserMessage,
} from "@/lib/api-client";

type ApiErrorContextValue = {
  error: ApiError | null;
  message: string;
  dismiss: () => void;
};

const ApiErrorContext = createContext<ApiErrorContextValue | null>(null);

/** Show global banner for 403, network (0), and 5xx. Skip 401 (auth shows session/form error) and 400 (validation). */
function shouldShowGlobally(err: ApiError): boolean {
  if (err.status === 0) return true;
  if (err.status === 403) return true;
  if (err.status >= 500) return true;
  return false;
}

export function ApiErrorProvider({ children }: { children: ReactNode }) {
  const [error, setError] = useState<ApiError | null>(null);

  useEffect(() => {
    const handler = (err: ApiError) => {
      if (shouldShowGlobally(err)) setError(err);
    };
    setGlobalApiErrorHandler(handler);
    return () => setGlobalApiErrorHandler(null);
  }, []);

  const dismiss = useCallback(() => setError(null), []);

  const message = error ? getApiErrorUserMessage(error) : "";

  const value: ApiErrorContextValue = {
    error,
    message,
    dismiss,
  };

  return (
    <ApiErrorContext.Provider value={value}>
      {children}
    </ApiErrorContext.Provider>
  );
}

export function useApiError(): ApiErrorContextValue {
  const ctx = useContext(ApiErrorContext);
  if (ctx === null) {
    throw new Error("useApiError must be used within an ApiErrorProvider");
  }
  return ctx;
}
