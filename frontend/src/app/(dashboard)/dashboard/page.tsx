"use client";

import Link from "next/link";
import { useAuth } from "@/contexts";
import { Button } from "@/components/ui";

export default function DashboardPage() {
  const { user, isSubscribed } = useAuth();
  const displayName = user?.name ?? user?.email?.split("@")[0] ?? "there";

  return (
    <>
      <header className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
          Welcome back, {displayName}
        </h1>
        <p className="mt-1 text-sm text-neutral-400">
          Here’s an overview of your account and quick actions.
        </p>
      </header>

      {/* Quick stats */}
      <section
        className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
        aria-label="Account overview"
      >
        <div className="rounded-xl border border-neutral-700/50 bg-neutral-900/50 p-5 transition-shadow hover:shadow-md border-l-4 border-l-accent">
          <p className="text-sm font-medium text-neutral-400">Videos in library</p>
          <p className="mt-2 text-2xl font-bold tabular-nums text-white">0</p>
          <p className="mt-1 text-xs text-neutral-500">Saved and watched</p>
        </div>
        <div className="rounded-xl border border-neutral-700/50 bg-neutral-900/50 p-5 transition-shadow hover:shadow-md border-l-4 border-l-accent">
          <p className="text-sm font-medium text-neutral-400">Watch time</p>
          <p className="mt-2 text-2xl font-bold tabular-nums text-white">0h</p>
          <p className="mt-1 text-xs text-neutral-500">This month</p>
        </div>
        <div className="rounded-xl border border-neutral-700/50 bg-neutral-900/50 p-5 transition-shadow hover:shadow-md border-l-4 border-l-accent">
          <p className="text-sm font-medium text-neutral-400">Subscription</p>
          <p className="mt-2 text-2xl font-bold text-white">
            {isSubscribed ? "Active" : "Inactive"}
          </p>
          <p className="mt-1 text-xs text-neutral-500">
            {isSubscribed ? "Full access to content" : "Upgrade for full access"}
          </p>
        </div>
      </section>

      {/* Quick actions */}
      <section className="mt-8" aria-label="Quick actions">
        <h2 className="text-lg font-semibold text-white">Quick actions</h2>
        <p className="mt-1 text-sm text-neutral-400">
          Jump to browse content or manage your plan.
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <Link href="/browse">
            <Button type="button" size="lg">
              Browse content
            </Button>
          </Link>
          <Link href="/subscription">
            <Button type="button" variant="outline" size="lg">
              View plans
            </Button>
          </Link>
        </div>
      </section>

      {/* Continue watching / Recent activity placeholder */}
      <section className="mt-10 rounded-xl border border-neutral-700/50 bg-neutral-900/50 p-6 sm:p-8" aria-label="Continue watching">
        <h2 className="text-lg font-semibold text-white">Continue watching</h2>
        <p className="mt-1 text-sm text-neutral-400">
          Pick up where you left off. Watched content will appear here.
        </p>
        <div className="mt-6 flex flex-col items-center justify-center rounded-lg border border-dashed border-neutral-600 py-12 text-center">
          <span className="text-4xl text-neutral-600" aria-hidden>
            ▶
          </span>
          <p className="mt-3 text-sm font-medium text-neutral-400">
            No recent activity
          </p>
          <p className="mt-1 text-xs text-neutral-500">
            Start watching from Browse to see your progress here.
          </p>
          <Link href="/browse" className="mt-4">
            <Button type="button" variant="outline" size="sm">
              Go to Browse
            </Button>
          </Link>
        </div>
      </section>
    </>
  );
}
