"use client";

import Link from "next/link";
import { useAuth } from "@/contexts";
import { Button } from "@/components/ui";

export function Header() {
  const { user, isAuthenticated, logout } = useAuth();

  return (
    <header className="border-b border-neutral-200 dark:border-neutral-800 bg-white/80 dark:bg-neutral-950/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="text-lg font-semibold text-neutral-900 dark:text-white"
        >
          Stream
        </Link>
        <nav className="flex items-center gap-4 text-sm text-neutral-600 dark:text-neutral-400 sm:gap-6">
          <Link
            href="/browse"
            className="hover:text-neutral-900 dark:hover:text-white transition-colors"
          >
            Browse
          </Link>
          {isAuthenticated && user ? (
            <>
              <span
                className="text-neutral-500 dark:text-neutral-400"
                title={user.email}
              >
                {user.name}
              </span>
              <Link
                href="/dashboard"
                className="hover:text-neutral-900 dark:hover:text-white transition-colors"
              >
                Dashboard
              </Link>
              <Button
                variant="ghost"
                size="sm"
                type="button"
                onClick={() => logout()}
              >
                Sign out
              </Button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="hover:text-neutral-900 dark:hover:text-white transition-colors"
              >
                Sign in
              </Link>
              <Link href="/signup">
                <Button variant="outline" size="sm" type="button">
                  Sign up
                </Button>
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
