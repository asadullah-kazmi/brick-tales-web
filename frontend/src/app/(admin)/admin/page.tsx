"use client";

import { useEffect, useState } from "react";
import { analyticsService } from "@/lib/services";
import type { MockDashboardStats } from "@/lib/mock-analytics";
import { StatCard, SimpleBarChart } from "@/components/admin";
import { Loader } from "@/components/ui";

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
      <h1 className="text-2xl font-semibold text-neutral-900 dark:text-white">
        Dashboard
      </h1>
      <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
        Mock analytics. Replace with real data when backend is available.
      </p>

      {/* Stats cards */}
      <section
        className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
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

      {/* Simple chart: videos by category */}
      <section
        className="mt-8 rounded-xl border border-neutral-200 bg-white p-6 shadow-sm dark:border-neutral-800 dark:bg-neutral-900"
        aria-label="Videos by category"
      >
        <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">
          Videos by category
        </h2>
        <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
          Mock distribution
        </p>
        <div className="mt-4 max-w-md">
          <SimpleBarChart data={videosByCategory} />
        </div>
      </section>
    </>
  );
}
