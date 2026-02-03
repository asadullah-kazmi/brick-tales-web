"use client";

import { type ReactNode } from "react";
import { AuthProvider } from "@/contexts";

/**
 * Client-side providers for the app. Wrap the root layout children here
 * so that AuthContext is available everywhere.
 */
export function Providers({ children }: { children: ReactNode }) {
  return <AuthProvider>{children}</AuthProvider>;
}
