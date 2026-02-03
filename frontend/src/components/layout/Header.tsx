"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/contexts";
import { getLoginOrigin } from "@/lib/mock-auth";
import { Button } from "@/components/ui";

const LOGO_HEIGHT = 36;
const LOGO_WIDTH = 140;

export function Header() {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const [loginOrigin, setLoginOriginState] = useState<
    "admin" | "customer" | null
  >(null);

  useEffect(() => {
    setLoginOriginState(user ? getLoginOrigin() : null);
  }, [user]);

  const showAdminLink = isAdmin && loginOrigin === "admin";

  return (
    <header className="border-b border-neutral-700/50 bg-off-black/95 backdrop-blur-sm sticky top-0 z-50">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="flex items-center gap-2 text-white"
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
        <nav className="flex items-center gap-4 text-sm text-neutral-600 dark:text-neutral-300 sm:gap-6">
          <Link
            href="/browse"
            className="hover:text-neutral-900 dark:hover:text-accent transition-colors"
          >
            Browse
          </Link>
          <Link
            href="/subscription"
            className="hover:text-neutral-900 dark:hover:text-accent transition-colors"
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
                className="hover:text-neutral-900 dark:hover:text-accent transition-colors"
              >
                Dashboard
              </Link>
              {showAdminLink && (
                <Link
                  href="/admin"
                  className="hover:text-neutral-900 dark:hover:text-accent transition-colors font-medium"
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
                className="hover:text-accent transition-colors"
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
