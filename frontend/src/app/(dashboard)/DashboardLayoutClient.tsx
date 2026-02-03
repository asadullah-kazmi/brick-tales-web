"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { ProtectedRoute } from "@/components/auth";
import { SITE_BRAND } from "@/lib/seo";
import { cn } from "@/lib/utils";

function IconOverview({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
    </svg>
  );
}
function IconLibrary({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
    </svg>
  );
}
function IconSettings({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  );
}

const NAV_ITEMS = [
  { href: "/dashboard", label: "Overview", icon: IconOverview },
  { href: "/dashboard/library", label: "Library", icon: IconLibrary },
  { href: "/dashboard/settings", label: "Settings", icon: IconSettings },
] as const;

export default function DashboardLayoutClient({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <ProtectedRoute>
      <div className="flex min-h-screen bg-off-black">
        {/* Sidebar */}
        <aside
          className="fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-neutral-700/50 bg-off-black/95"
          aria-label="Dashboard navigation"
        >
          <div className="flex h-14 shrink-0 items-center gap-3 border-b border-neutral-700/50 px-5">
            <Link
              href="/"
              className="flex items-center gap-3 rounded focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-off-black"
            >
              <Image src="/logo.png" alt="" width={32} height={32} className="h-8 w-8 rounded object-contain" />
              <span className="text-sm font-semibold tracking-tight text-white">
                {SITE_BRAND}
              </span>
            </Link>
          </div>
          <nav className="flex-1 space-y-0.5 p-3">
            {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
              const isActive =
                href === "/dashboard"
                  ? pathname === "/dashboard"
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
              My account
            </p>
          </header>
          <main className="flex-1">
            <div className="mx-auto max-w-5xl px-8 py-8">{children}</div>
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
}
