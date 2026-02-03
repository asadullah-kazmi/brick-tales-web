"use client";

import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/contexts";
import { Button } from "@/components/ui";

const LOGO_HEIGHT = 36;
const LOGO_WIDTH = 140;

export function Header() {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();

  return (
    <header className="border-b border-neutral-200 dark:border-neutral-800 bg-white/80 dark:bg-neutral-950/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="flex items-center gap-2 text-neutral-900 dark:text-white"
          aria-label="BRICK TALES.TV home"
        >
          <Image
            src="/logo.png"
            alt="BRICK TALES.TV"
            width={LOGO_WIDTH}
            height={LOGO_HEIGHT}
            className="h-9 w-auto object-contain"
            priority
          />
        </Link>
        <nav className="flex items-center gap-4 text-sm text-neutral-600 dark:text-neutral-400 sm:gap-6">
          <Link
            href="/browse"
            className="hover:text-neutral-900 dark:hover:text-white transition-colors"
          >
            Browse
          </Link>
          <Link
            href="/subscription"
            className="hover:text-neutral-900 dark:hover:text-white transition-colors"
          >
            Plans
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
              {isAdmin && (
                <Link
                  href="/admin"
                  className="hover:text-neutral-900 dark:hover:text-white transition-colors font-medium"
                >
                  Admin
                </Link>
              )}
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
