"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/contexts";
import { getLoginOrigin } from "@/lib/mock-auth";
import { Button } from "@/components/ui";

const LOGO_HEIGHT = 36;
const LOGO_WIDTH = 140;

function NavContent({
  dashboardHref,
  isAuthenticated,
  user,
  logout,
  onLinkClick,
}: {
  dashboardHref: string;
  isAuthenticated: boolean;
  user: { name: string; email: string } | null;
  logout: () => void;
  onLinkClick?: () => void;
}) {
  const linkClass =
    "hover:text-accent transition-colors text-neutral-300";
  return (
    <>
      <Link href="/browse" className={linkClass} onClick={onLinkClick}>
        Browse
      </Link>
      <Link href="/subscription" className={linkClass} onClick={onLinkClick}>
        Plans
      </Link>
      {isAuthenticated && user ? (
        <>
          <span className="text-neutral-400" title={user.email}>
            {user.name}
          </span>
          <Link href={dashboardHref} className={linkClass} onClick={onLinkClick}>
            Dashboard
          </Link>
          <Button
            variant="ghost"
            size="sm"
            type="button"
            onClick={() => {
              onLinkClick?.();
              logout();
            }}
          >
            Sign out
          </Button>
        </>
      ) : (
        <>
          <Link href="/login" className={linkClass} onClick={onLinkClick}>
            Sign in
          </Link>
          <Link href="/signup" onClick={onLinkClick}>
            <Button variant="outline" size="sm" type="button">
              Sign up
            </Button>
          </Link>
        </>
      )}
    </>
  );
}

export function Header() {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const [loginOrigin, setLoginOriginState] = useState<
    "admin" | "customer" | null
  >(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    setLoginOriginState(user ? getLoginOrigin() : null);
  }, [user]);

  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileMenuOpen]);

  /** When admin signed in via /admin/login, Dashboard goes to admin panel; otherwise customer dashboard. */
  const dashboardHref =
    isAdmin && loginOrigin === "admin" ? "/admin" : "/dashboard";

  return (
    <header className="border-b border-neutral-700/50 bg-off-black/95 backdrop-blur-sm sticky top-0 z-50">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="flex shrink-0 items-center gap-2 text-white"
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
        {/* Desktop nav: hidden on small screens to avoid overflow */}
        <nav
          aria-label="Main"
          className="hidden items-center gap-4 text-sm sm:gap-6 md:flex"
        >
          <NavContent
            dashboardHref={dashboardHref}
            isAuthenticated={isAuthenticated}
            user={user}
            logout={logout}
          />
        </nav>
        {/* Mobile menu button */}
        <button
          type="button"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-neutral-300 hover:bg-neutral-800 hover:text-white md:hidden"
          aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
          aria-expanded={mobileMenuOpen}
          onClick={() => setMobileMenuOpen((o) => !o)}
        >
          {mobileMenuOpen ? (
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>
      </div>
      {/* Mobile nav drawer */}
      <div
        className={`fixed inset-0 top-14 z-40 bg-off-black/98 backdrop-blur-sm md:hidden ${mobileMenuOpen ? "visible" : "invisible"}`}
        aria-hidden={!mobileMenuOpen}
      >
        <nav
          className={`flex flex-col gap-1 px-4 py-4 text-base transition-opacity duration-200 ${mobileMenuOpen ? "opacity-100" : "opacity-0"}`}
          aria-label="Main mobile"
        >
          <NavContent
            dashboardHref={dashboardHref}
            isAuthenticated={isAuthenticated}
            user={user}
            logout={logout}
            onLinkClick={() => setMobileMenuOpen(false)}
          />
        </nav>
      </div>
    </header>
  );
}
