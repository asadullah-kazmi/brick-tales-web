"use client";

import Link from "next/link";
import { ProtectedRoute } from "@/components/auth";

export default function DashboardLayoutClient({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute>
      <div className="flex min-h-screen flex-col sm:flex-row">
        <aside className="w-full border-b border-neutral-200 bg-neutral-50 px-4 py-4 dark:border-neutral-800 dark:bg-neutral-900/50 sm:w-56 sm:border-b-0 sm:border-r">
          <nav className="flex gap-4 sm:flex-col sm:gap-1">
            <Link
              href="/dashboard"
              className="text-sm font-medium text-neutral-700 hover:text-neutral-900 dark:text-neutral-300 dark:hover:text-white"
            >
              Overview
            </Link>
            <Link
              href="/dashboard/library"
              className="text-sm text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white"
            >
              Library
            </Link>
            <Link
              href="/dashboard/settings"
              className="text-sm text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white"
            >
              Settings
            </Link>
          </nav>
        </aside>
        <main className="flex-1 px-4 py-8 sm:px-6 lg:px-8">{children}</main>
      </div>
    </ProtectedRoute>
  );
}
