"use client";

import { useEffect, useState } from "react";
import { adminService } from "@/lib/services";
import type { AdminPlanDto } from "@/types/api";
import { Button, Loader } from "@/components/ui";

export default function AdminPlansPage() {
  const [plans, setPlans] = useState<AdminPlanDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const data = await adminService.getPlans();
      setPlans(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load plans.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center rounded-xl border border-neutral-700/50 bg-neutral-900/50 py-12">
        <Loader size="lg" label="Loading plans…" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-red-900/50 bg-red-950/20 py-12 text-center">
        <p className="text-red-300">{error}</p>
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
          Plans
        </h1>
        <p className="mt-1 text-sm text-neutral-400">
          Manage subscription tiers and availability across devices.
        </p>
      </header>

      {plans.length === 0 ? (
        <div className="rounded-xl border border-neutral-700/50 bg-neutral-900/50 py-12 text-center">
          <p className="text-neutral-400">No plans configured yet.</p>
        </div>
      ) : (
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className="rounded-2xl border border-neutral-700/50 bg-neutral-900/60 p-6"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-white">
                    {plan.name}
                  </h2>
                  <p className="mt-1 text-xs uppercase tracking-[0.2em] text-neutral-500">
                    {plan.duration}
                  </p>
                </div>
                <span className="rounded-full border border-neutral-700/60 px-2 py-1 text-xs text-neutral-300">
                  {plan.activeSubscribers} active
                </span>
              </div>
              <p className="mt-4 text-3xl font-semibold text-white">
                ${plan.price}
              </p>
              <p className="mt-1 text-sm text-neutral-400">
                per {plan.duration.toLowerCase()}
              </p>
              <div className="mt-4 space-y-2 text-sm text-neutral-300">
                <p>Device limit: {plan.deviceLimit}</p>
                <p>
                  Offline access:{" "}
                  {plan.offlineAllowed ? "Enabled" : "Not included"}
                </p>
                <p>Max offline downloads: {plan.maxOfflineDownloads}</p>
              </div>
              <div className="mt-5 flex flex-wrap gap-2">
                <Button type="button" size="sm">
                  Edit plan
                </Button>
                <Button type="button" size="sm" variant="outline">
                  View subscribers
                </Button>
              </div>
            </div>
          ))}
        </section>
      )}
    </div>
  );
}
