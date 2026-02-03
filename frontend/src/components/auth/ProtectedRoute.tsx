"use client";

import { useEffect, type ReactNode } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/contexts";
import { Loader } from "@/components/ui";

type ProtectedRouteProps = {
  children: ReactNode;
  /** Where to redirect if not authenticated. Default: /login */
  redirectTo?: string;
  /** Optional: pass current path as query so login can redirect back after auth */
  appendReturnUrl?: boolean;
};

/**
 * Wraps content that requires authentication. Redirects to login if user is not
 * authenticated. Shows a loader while auth state is hydrating.
 */
export function ProtectedRoute({
  children,
  redirectTo = "/login",
  appendReturnUrl = true,
}: ProtectedRouteProps) {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (isLoading) return;
    if (!user) {
      const url =
        appendReturnUrl && pathname
          ? `${redirectTo}?returnUrl=${encodeURIComponent(pathname)}`
          : redirectTo;
      router.replace(url);
    }
  }, [user, isLoading, router, redirectTo, pathname, appendReturnUrl]);

  if (isLoading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Loader size="lg" label="Checking authentication" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return <>{children}</>;
}
