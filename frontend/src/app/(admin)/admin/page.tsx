"use client";

import dynamic from "next/dynamic";
import { Suspense, useEffect, useState } from "react";
import { analyticsService } from "@/lib/services";
import type { MockDashboardStats } from "@/lib/mock-analytics";
import { Loader } from "@/components/ui";

const StatCard = dynamic(
  () => import("@/components/admin").then((mod) => mod.StatCard),
  {
    loading: () => (
      <div className="h-24 animate-pulse rounded-xl bg-neutral-800" />
    ),
  },
);

const SimpleBarChart = dynamic(
  () => import("@/components/admin").then((mod) => mod.SimpleBarChart),
  {
    loading: () => (
      <div className="h-48 max-w-md animate-pulse rounded bg-neutral-800" />
    ),
  },
);

export default function AdminPage() {
  const [stats, setStats] = useState<MockDashboardStats | null>(null);
  const [videosByCategory, setVideosByCategory] = useState<
    { label: string; value: number }[]
  >([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [dashboardStats, categoryData] = await Promise.all([
          analyticsService.getDashboardStats(),
          analyticsService.getVideosByCategory(),
        ]);
        setStats(dashboardStats);
        setVideosByCategory(categoryData);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading || !stats) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader size="lg" label="Loading dashboard…" />
      </div>
    );
  }

  return (
    <>
      <header className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
          Dashboard
        </h1>
        <p className="mt-1 text-sm text-neutral-400">
          Mock analytics. Replace with real data when backend is available.
        </p>
      </header>

      {/* Stats cards */}
      <Suspense
        fallback={
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-32 animate-pulse rounded-xl bg-neutral-200 dark:bg-neutral-800"
              />
            ))}
          </div>
        }
      >
        <section
          className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3"
          aria-label="Overview statistics"
        >
          <StatCard
            label="Total users"
            value={stats.totalUsers.toLocaleString()}
            trend={stats.usersTrend}
            icon="👥"
          />
          <StatCard
            label="Total videos"
            value={stats.totalVideos.toLocaleString()}
            trend={stats.videosTrend}
            icon="🎬"
          />
          <StatCard
            label="Total subscribers"
            value={stats.totalSubscribers.toLocaleString()}
            trend={stats.subscribersTrend}
            icon="⭐"
          />
        </section>
      </Suspense>

      {/* Videos by category */}
      <Suspense
        fallback={
          <div className="mt-10 h-72 animate-pulse rounded-xl bg-neutral-800" />
        }
      >
        <section
          className="mt-10 rounded-xl border border-neutral-700/50 bg-neutral-900/50 p-6 shadow-sm sm:p-8"
          aria-label="Videos by category"
        >
          <div className="mb-6 flex items-baseline justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold text-white">
                Videos by category
              </h2>
              <p className="mt-1 text-sm text-neutral-400">
                Mock distribution
              </p>
            </div>
          </div>
          <div className="max-w-md">
            <SimpleBarChart data={videosByCategory} />
          </div>
        </section>
      </Suspense>
    </>
  );
}
