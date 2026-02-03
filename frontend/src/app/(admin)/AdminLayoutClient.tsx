"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { AdminProtectedRoute } from "@/components/auth";
import { AdminContentProvider } from "@/contexts";
import { SITE_BRAND } from "@/lib/seo";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/admin", label: "Overview", icon: IconOverview },
  { href: "/admin/content", label: "Content", icon: IconContent },
  { href: "/admin/content/upload", label: "Upload", icon: IconUpload },
  { href: "/admin/users", label: "Users", icon: IconUsers },
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
  const isAdminLoginPage = pathname === "/admin/login";

  // Admin login page: minimal layout, no protection
  if (isAdminLoginPage) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-off-black px-4">
        {children}
      </div>
    );
  }

  return (
    <AdminProtectedRoute loginRedirectTo="/admin/login">
      <AdminContentProvider>
        <div className="flex min-h-screen bg-off-black">
          {/* Sidebar */}
          <aside
            className="fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-neutral-700/50 bg-off-black/95"
            aria-label="Admin navigation"
          >
            <div className="flex h-14 shrink-0 items-center gap-3 border-b border-neutral-700/50 px-5">
              <Link
                href="/"
                className="flex items-center gap-3 rounded focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-off-black"
              >
                <Image
                  src="/logo.png"
                  alt=""
                  width={32}
                  height={32}
                  className="h-8 w-8 rounded object-contain"
                />
                <span className="text-sm font-semibold tracking-tight text-white">
                  {SITE_BRAND} Admin
                </span>
              </Link>
            </div>
            <nav className="flex-1 space-y-0.5 p-3">
              {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
                const isActive =
                  href === "/admin"
                    ? pathname === "/admin"
                    : pathname.startsWith(href);
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
            <div className="border-t border-neutral-700/50 p-3">
              <Link
                href="/"
                className="flex items-center rounded-lg px-3 py-2 text-xs font-medium text-neutral-400 transition-colors hover:bg-neutral-800/50 hover:text-accent"
              >
                ← Back to site
              </Link>
            </div>
          </aside>

          {/* Top bar + main content */}
          <div className="flex min-h-screen flex-1 flex-col pl-64">
            <header className="sticky top-0 z-30 shrink-0 border-b border-neutral-700/50 bg-off-black/95 px-8 py-4 backdrop-blur-sm">
              <p className="text-xs font-medium uppercase tracking-wider text-neutral-400">
                Admin
              </p>
            </header>
            <main className="flex-1">
              <div className="mx-auto max-w-6xl px-8 py-8">{children}</div>
            </main>
          </div>
        </div>
      </AdminContentProvider>
    </AdminProtectedRoute>
  );
}
