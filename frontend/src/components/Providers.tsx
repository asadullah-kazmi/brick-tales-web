"use client";

import { type ReactNode, useEffect } from "react";
import { ApiErrorProvider, AuthProvider } from "@/contexts";
import { SessionErrorBanner } from "@/components/auth";
import { ApiErrorBanner } from "@/components/layout";
import { fetchBranding, type ThemeSettings } from "@/lib/branding";

type ResolvedThemeSettings = Required<ThemeSettings>;

const DEFAULT_THEME: ResolvedThemeSettings = {
  background: "#0c0c0c",
  foreground: "#fafafa",
  offBlack: "#0c0c0c",
  accent: "#ffe700",
  accentForeground: "#0c0c0c",
};

function applyTheme(theme?: ThemeSettings) {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  const next: ResolvedThemeSettings = { ...DEFAULT_THEME, ...(theme ?? {}) };
  root.style.setProperty("--background", next.background);
  root.style.setProperty("--foreground", next.foreground);
  root.style.setProperty("--off-black", next.offBlack);
  root.style.setProperty("--accent", next.accent);
  root.style.setProperty("--accent-foreground", next.accentForeground);
}

/**
 * Client-side providers for the app. ApiErrorProvider registers global API error handling;
 * AuthProvider provides auth state; SessionErrorBanner and ApiErrorBanner show errors.
 */
export function Providers({ children }: { children: ReactNode }) {
  useEffect(() => {
    let active = true;
    fetchBranding()
      .then((branding) => {
        if (!active) return;
        applyTheme(branding.theme);
      })
      .catch(() => {
        if (!active) return;
        applyTheme(DEFAULT_THEME);
      });
    return () => {
      active = false;
    };
  }, []);

  return (
    <ApiErrorProvider>
      <AuthProvider>
        <SessionErrorBanner />
        <ApiErrorBanner />
        {children}
      </AuthProvider>
    </ApiErrorProvider>
  );
}
