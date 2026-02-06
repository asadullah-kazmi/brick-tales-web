"use client";

import { useEffect, useMemo, useState } from "react";
import { adminService } from "@/lib/services";
import type { AdminUsersAnalyticsDto } from "@/types/api";
import { Button, Loader } from "@/components/ui";

export default function AdminUsersAnalyticsPage() {
  const [data, setData] = useState<AdminUsersAnalyticsDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const res = await adminService.getUsersAnalytics();
      setData(res);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load analytics.",
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  const maxDaily = useMemo(() => {
    if (!data?.dailyNewUsers.length) return 1;
    return Math.max(1, ...data.dailyNewUsers.map((d) => d.count));
  }, [data]);

  if (loading) {
    return (
      <div className="flex items-center justify-center rounded-xl border border-neutral-700/50 bg-neutral-900/50 py-12">
        <Loader size="lg" label="Loading user analytics…" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="rounded-xl border border-red-900/50 bg-red-950/20 py-12 text-center">
        <p className="text-red-300">{error ?? "Failed to load analytics."}</p>
        <Button
          type="button"
          variant="secondary"
          className="mt-4"
          onClick={() => void load()}
        >
          Try again
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
          User Analytics
        </h1>
        <p className="mt-1 text-sm text-neutral-400">
          Track sign-ups and active viewers over time.
        </p>
      </header>

      <section className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-neutral-700/50 bg-neutral-900/50 px-4 py-4">
          <p className="text-xs uppercase tracking-wide text-neutral-500">
            Total users
          </p>
          <p className="mt-2 text-2xl font-semibold text-white">
            {data.totalUsers}
          </p>
        </div>
        <div className="rounded-xl border border-neutral-700/50 bg-neutral-900/50 px-4 py-4">
          <p className="text-xs uppercase tracking-wide text-neutral-500">
            New (30 days)
          </p>
          <p className="mt-2 text-2xl font-semibold text-white">
            {data.newUsersLast30Days}
          </p>
        </div>
        <div className="rounded-xl border border-neutral-700/50 bg-neutral-900/50 px-4 py-4">
          <p className="text-xs uppercase tracking-wide text-neutral-500">
            Active viewers
          </p>
          <p className="mt-2 text-2xl font-semibold text-white">
            {data.activeUsersLast30Days}
          </p>
          <p className="mt-1 text-xs text-neutral-500">
            Watched in last 30 days
          </p>
        </div>
      </section>

      <section className="rounded-2xl border border-neutral-700/50 bg-neutral-900/60 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-white">Daily sign-ups</h2>
            <p className="mt-1 text-sm text-neutral-400">Last 7 days</p>
          </div>
          <span className="rounded-full border border-neutral-700/60 px-2 py-1 text-xs text-neutral-400">
            Updated just now
          </span>
        </div>
        <div className="mt-6 space-y-4">
          {data.dailyNewUsers.map((day) => (
            <div key={day.date} className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-neutral-300">{day.date}</span>
                <span className="text-neutral-500">{day.count}</span>
              </div>
              <div className="h-2 w-full rounded-full bg-neutral-800/80">
                <div
                  className="h-2 rounded-full bg-accent"
                  style={{
                    width: `${Math.max(5, (day.count / maxDaily) * 100)}%`,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
