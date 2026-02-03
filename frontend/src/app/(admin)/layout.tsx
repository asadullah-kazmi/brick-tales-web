/**
 * (admin) — Admin / back-office route group
 *
 * Purpose: Platform management: content moderation, users, analytics, config.
 * Use for: /admin, /admin/content, /admin/users, /admin/analytics.
 * URL segments: (admin) does not appear (e.g. /admin/...).
 * Typically: Restrict to admins; separate nav/layout from main app and dashboard.
 */

import Link from "next/link";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col sm:flex-row">
      <aside className="w-full border-b border-red-200 bg-red-50/50 px-4 py-4 dark:border-red-900/50 dark:bg-red-950/20 sm:w-56 sm:border-b-0 sm:border-r">
        <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-red-700 dark:text-red-400">
          Admin
        </p>
        <nav className="flex gap-4 sm:flex-col sm:gap-1">
          <Link
            href="/admin"
            className="text-sm font-medium text-neutral-700 hover:text-neutral-900 dark:text-neutral-300 dark:hover:text-white"
          >
            Overview
          </Link>
          <Link
            href="/admin/content"
            className="text-sm text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white"
          >
            Content
          </Link>
          <Link
            href="/admin/users"
            className="text-sm text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white"
          >
            Users
          </Link>
        </nav>
      </aside>
      <main className="flex-1 px-4 py-8 sm:px-6 lg:px-8">{children}</main>
    </div>
  );
}
