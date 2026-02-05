"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { AdminProtectedRoute } from "@/components/auth";
import { AdminContentProvider } from "@/contexts";
import { useAuth } from "@/contexts";
import { SITE_BRAND } from "@/lib/seo";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui";
import { fetchBranding } from "@/lib/branding";

function MenuIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
      aria-hidden
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M4 6h16M4 12h16M4 18h16"
      />
    </svg>
  );
}
function CloseIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
      aria-hidden
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M6 18L18 6M6 6l12 12"
      />
    </svg>
  );
}

const NAV_ITEMS = [
  { href: "/admin", label: "Overview", icon: IconOverview },
  { href: "/admin/content", label: "Content", icon: IconContent },
  { href: "/admin/content/upload", label: "Upload", icon: IconUpload },
  { href: "/admin/categories", label: "Categories", icon: IconCategories },
  {
    href: "/admin/subscriptions",
    label: "Subscriptions",
    icon: IconSubscriptions,
  },
  { href: "/admin/users", label: "Users", icon: IconUsers },
  { href: "/admin/settings", label: "Settings", icon: IconSettings },
] as const;

function IconOverview({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
      aria-hidden
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
      />
    </svg>
  );
}
function IconContent({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
      aria-hidden
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
      />
    </svg>
  );
}

function IconSubscriptions({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
      aria-hidden
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3 8h18M3 16h18M7 4h10M7 20h10"
      />
    </svg>
  );
}
function IconUpload({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
      aria-hidden
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
      />
    </svg>
  );
}
function IconUsers({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
      aria-hidden
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
      />
    </svg>
  );
}

function IconCategories({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
      aria-hidden
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M7 7h10M7 12h10M7 17h10"
      />
    </svg>
  );
}

function IconSettings({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
      aria-hidden
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.591 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.59c1.756.427 1.756 2.925 0 3.351a1.724 1.724 0 00-1.066 2.591c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.59 1.065c-.427 1.756-2.925 1.756-3.351 0a1.724 1.724 0 00-2.591-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.59c-1.756-.427-1.756-2.925 0-3.351a1.724 1.724 0 001.066-2.591c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.59-1.065z"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
      />
    </svg>
  );
}

/**
 * Protected admin layout with sidebar. Only renders when user is authenticated
 * and has mocked role "admin". Sidebar navigation for Overview, Content, Upload, Users.
 */
export default function AdminLayoutClient({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { logout } = useAuth();
  const isAdminLoginPage = pathname === "/admin/login";
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [logoUrl, setLogoUrl] = useState<string | null>(null);

  useEffect(() => {
    setDrawerOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!drawerOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [drawerOpen]);

  useEffect(() => {
    let active = true;
    fetchBranding()
      .then((branding) => {
        if (!active) return;
        setLogoUrl(branding.logoUrl ?? null);
      })
      .catch(() => {
        if (!active) return;
        setLogoUrl(null);
      });
    return () => {
      active = false;
    };
  }, []);

  // Admin login page: minimal layout, no protection (no sidebar/drawer)
  if (isAdminLoginPage) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-off-black px-4">
        {children}
      </div>
    );
  }

  const sidebarContent = (
    <>
      <div className="flex h-14 shrink-0 items-center justify-between gap-3 border-b border-neutral-700/50 px-5 lg:justify-start">
        <Link
          href="/"
          className="flex items-center gap-3 rounded focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-off-black"
        >
          {logoUrl ? (
            <img
              src={logoUrl}
              alt=""
              className="h-8 w-8 rounded object-contain"
            />
          ) : (
            <Image
              src="/logo.png"
              alt=""
              width={32}
              height={32}
              className="h-8 w-8 rounded object-contain"
            />
          )}
          <span className="text-sm font-semibold tracking-tight text-white">
            {SITE_BRAND} Admin
          </span>
        </Link>
        <button
          type="button"
          onClick={() => setDrawerOpen(false)}
          className="rounded p-2 text-neutral-400 hover:bg-neutral-800 hover:text-white lg:hidden"
          aria-label="Close menu"
        >
          <CloseIcon className="h-6 w-6" />
        </button>
      </div>
      <nav className="flex-1 space-y-0.5 overflow-y-auto p-3">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          let isActive = false;
          if (href === "/admin") {
            isActive = pathname === "/admin";
          } else if (href === "/admin/content") {
            isActive =
              pathname === "/admin/content" ||
              (pathname.startsWith("/admin/content/") &&
                !pathname.startsWith("/admin/content/upload"));
          } else if (href === "/admin/content/upload") {
            isActive = pathname.startsWith("/admin/content/upload");
          } else {
            isActive = pathname.startsWith(href);
          }
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                "border-l-2",
                isActive
                  ? "border-accent bg-accent/10 text-white"
                  : "border-transparent text-neutral-300 hover:bg-neutral-800/50 hover:text-accent",
              )}
              aria-current={isActive ? "page" : undefined}
            >
              <Icon className="h-5 w-5 flex-shrink-0 opacity-80" />
              {label}
            </Link>
          );
        })}
      </nav>
      <div className="border-t border-neutral-700/50 p-3 space-y-2">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="w-full justify-start text-neutral-300"
          onClick={() => {
            logout();
            router.replace("/admin/login");
          }}
        >
          Sign out
        </Button>
        <Link
          href="/"
          className="flex items-center rounded-lg px-3 py-2 text-xs font-medium text-neutral-400 transition-colors hover:bg-neutral-800/50 hover:text-accent"
        >
          ← Back to site
        </Link>
      </div>
    </>
  );

  return (
    <AdminProtectedRoute loginRedirectTo="/admin/login">
      <AdminContentProvider>
        <div className="flex min-h-screen bg-off-black">
          {/* Desktop sidebar */}
          <aside
            className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col border-r border-neutral-700/50 bg-off-black/95 lg:flex"
            aria-label="Admin navigation"
          >
            {sidebarContent}
          </aside>

          {/* Mobile drawer */}
          <div
            className={cn(
              "fixed inset-0 z-50 lg:hidden",
              drawerOpen ? "pointer-events-auto" : "pointer-events-none",
            )}
            aria-hidden={!drawerOpen}
          >
            <div
              className={cn(
                "absolute inset-0 bg-black/60 transition-opacity duration-200",
                drawerOpen ? "opacity-100" : "opacity-0",
              )}
              onClick={() => setDrawerOpen(false)}
              aria-hidden
            />
            <aside
              className={cn(
                "absolute inset-y-0 left-0 flex w-72 max-w-[85vw] flex-col border-r border-neutral-700/50 bg-off-black shadow-xl transition-transform duration-200 ease-out",
                drawerOpen ? "translate-x-0" : "-translate-x-full",
              )}
              aria-label="Admin navigation"
            >
              {sidebarContent}
            </aside>
          </div>

          {/* Top bar + main content */}
          <div className="flex min-h-screen min-w-0 flex-1 flex-col pl-0 lg:pl-64">
            <header className="sticky top-0 z-30 flex shrink-0 items-center gap-3 border-b border-neutral-700/50 bg-off-black/95 px-4 py-4 backdrop-blur-sm sm:px-6 lg:px-8">
              <button
                type="button"
                onClick={() => setDrawerOpen(true)}
                className="rounded p-2 text-neutral-400 hover:bg-neutral-800 hover:text-white lg:hidden"
                aria-label="Open menu"
              >
                <MenuIcon className="h-6 w-6" />
              </button>
              <p className="text-xs font-medium uppercase tracking-wider text-neutral-400">
                Admin
              </p>
            </header>
            <main className="flex-1">
              <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
                {children}
              </div>
            </main>
          </div>
        </div>
      </AdminContentProvider>
    </AdminProtectedRoute>
  );
}
