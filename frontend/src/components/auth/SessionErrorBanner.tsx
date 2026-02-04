"use client";

import { useAuth } from "@/contexts";
import { Button } from "@/components/ui";

/**
 * Shows a banner when the /me request on app load failed (e.g. network error).
 * Provides a retry action and stays visible until retry succeeds or user logs out.
 */
export function SessionErrorBanner() {
  const { sessionError, refreshUser, logout } = useAuth();

  if (!sessionError) return null;

  return (
    <div
      role="alert"
      className="flex flex-wrap items-center justify-center gap-3 bg-amber-100 px-4 py-3 text-sm text-amber-900 dark:bg-amber-950/80 dark:text-amber-200"
    >
      <span>{sessionError}</span>
      <div className="flex gap-2">
        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={() => void refreshUser()}
        >
          Retry
        </Button>
        <Button type="button" variant="secondary" size="sm" onClick={logout}>
          Dismiss
        </Button>
      </div>
    </div>
  );
}
