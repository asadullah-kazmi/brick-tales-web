"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/contexts";
import { Button } from "@/components/ui";
import { contentService, subscriptionService } from "@/lib/services";
import { USE_MOCK_API } from "@/lib/services/config";
import type { ContentSummaryDto, PublicPlanDto } from "@/types/api";

function getProgressFromId(id: string): number {
  let hash = 0;
  for (let i = 0; i < id.length; i += 1) {
    hash = (hash * 31 + id.charCodeAt(i)) % 1000;
  }
  return 20 + (hash % 70);
}

export default function DashboardPage() {
  const { user, isSubscribed } = useAuth();
  const displayName = user?.name ?? user?.email?.split("@")[0] ?? "there";
  const [contentItems, setContentItems] = useState<ContentSummaryDto[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [plans, setPlans] = useState<PublicPlanDto[]>([]);
  const [planId, setPlanId] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    const loadContent = USE_MOCK_API
      ? Promise.all([
          contentService.getContentForBrowse(),
          contentService.getCategories(),
        ])
      : Promise.resolve([[], []] as [ContentSummaryDto[], string[]]);

    Promise.all([
      loadContent,
      subscriptionService.getPlans(),
      subscriptionService.getSubscription(),
    ])
      .then(([[items, cats], planList, subscription]) => {
        if (!active) return;
        setContentItems(items);
        setCategories(cats);
        setPlans(planList);
        setPlanId(subscription.planId ?? null);
      })
      .catch(() => {
        if (!active) return;
        setContentItems([]);
        setCategories([]);
        setPlans([]);
        setPlanId(null);
      });
    return () => {
      active = false;
    };
  }, []);

  const activePlan = useMemo(
    () => plans.find((plan) => plan.id === planId) ?? null,
    [plans, planId],
  );
  const categoryCount = categories.filter(
    (category) => category.toLowerCase() !== "all",
  ).length;
  const continueItems: ContentSummaryDto[] = [];
  const exploreTags = categories
    .filter((category) => category.toLowerCase() !== "all")
    .slice(0, 4);
  const savedItems: ContentSummaryDto[] = [];

  return (
    <div className="font-[var(--font-geist-sans)]">
      <header className="relative overflow-hidden rounded-2xl border border-neutral-700/60 bg-neutral-900/60 p-6 sm:p-8">
        <div
          className="absolute -left-24 top-8 h-48 w-48 rounded-full bg-white/5 blur-3xl"
          aria-hidden
        />
        <div
          className="absolute -bottom-20 right-8 h-40 w-40 rounded-full bg-accent/25 blur-3xl"
          aria-hidden
        />
        <div className="relative">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-neutral-500">
            Home
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            Welcome back, {displayName}
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-neutral-400">
            Your watchlist, recommendations, and playback controls live here.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/dashboard/explore">
              <Button type="button" size="lg">
                Start exploring
              </Button>
            </Link>
            <Link href="/dashboard/continue-watching">
              <Button type="button" variant="outline" size="lg">
                Resume playback
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <section
        className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
        aria-label="Account snapshot"
      >
        <div className="rounded-xl border border-neutral-700/50 bg-neutral-900/50 p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-neutral-500">
            Library
          </p>
          <p className="mt-3 text-3xl font-semibold text-white">
            {contentItems.length}
          </p>
          <p className="mt-1 text-xs text-neutral-400">Titles available</p>
        </div>
        <div className="rounded-xl border border-neutral-700/50 bg-neutral-900/50 p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-neutral-500">
            Categories
          </p>
          <p className="mt-3 text-3xl font-semibold text-white">
            {categoryCount}
          </p>
          <p className="mt-1 text-xs text-neutral-400">Curated collections</p>
        </div>
        <div className="rounded-xl border border-neutral-700/50 bg-neutral-900/50 p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-neutral-500">
            Subscription
          </p>
          <p className="mt-3 text-2xl font-semibold text-white">
            {isSubscribed ? (activePlan?.name ?? "Active") : "Inactive"}
          </p>
          <p className="mt-1 text-xs text-neutral-400">
            {isSubscribed ? "Full access" : "Upgrade to unlock everything"}
          </p>
        </div>
      </section>

      <section
        className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]"
        aria-label="Home highlights"
      >
        <div className="rounded-2xl border border-neutral-700/50 bg-neutral-900/60 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-white">
                Continue watching
              </h2>
              <p className="mt-1 text-sm text-neutral-400">
                Jump back into your current sessions.
              </p>
            </div>
            <Link
              href="/dashboard/continue-watching"
              className="text-xs font-semibold text-neutral-400 hover:text-accent"
            >
              View all
            </Link>
          </div>
          <div className="mt-6 space-y-4">
            {continueItems.length > 0 ? (
              continueItems.map((item) => {
                const progress = getProgressFromId(item.id);
                return (
                  <div
                    key={item.id}
                    className="rounded-xl border border-neutral-700/60 bg-neutral-950/60 p-4"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-semibold text-white">
                          {item.title}
                        </p>
                        <p className="text-xs text-neutral-400">
                          {item.category ?? "In progress"}
                        </p>
                      </div>
                      <Button type="button" size="sm" variant="outline">
                        Resume
                      </Button>
                    </div>
                    <div className="mt-3 h-1.5 rounded-full bg-neutral-800">
                      <div
                        className="h-1.5 rounded-full bg-accent"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="rounded-xl border border-dashed border-neutral-700/60 bg-neutral-950/40 p-4 text-sm text-neutral-400">
                Nothing in progress yet. Start a new title to pick up here.
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-2xl border border-neutral-700/50 bg-neutral-900/60 p-6">
            <h2 className="text-lg font-semibold text-white">
              Explore something new
            </h2>
            <p className="mt-1 text-sm text-neutral-400">
              Search creators, genres, and curated collections.
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              {exploreTags.length > 0 ? (
                exploreTags.map((label) => (
                  <span
                    key={label}
                    className="rounded-full border border-neutral-700/70 bg-neutral-950/60 px-3 py-1 text-xs text-neutral-300"
                  >
                    {label}
                  </span>
                ))
              ) : (
                <span className="text-xs text-neutral-400">
                  No categories yet.
                </span>
              )}
            </div>
            <Link href="/dashboard/explore" className="mt-5 inline-flex">
              <Button type="button" size="sm">
                Open explore
              </Button>
            </Link>
          </div>

          <div className="rounded-2xl border border-neutral-700/50 bg-neutral-900/60 p-6">
            <h2 className="text-lg font-semibold text-white">
              My list preview
            </h2>
            <p className="mt-1 text-sm text-neutral-400">
              Titles you saved for later.
            </p>
            <div className="mt-5 space-y-3">
              {savedItems.length > 0 ? (
                savedItems.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between rounded-xl border border-neutral-700/60 bg-neutral-950/60 px-4 py-3"
                  >
                    <p className="text-sm font-medium text-white">
                      {item.title}
                    </p>
                    <button
                      type="button"
                      className="text-xs font-semibold text-neutral-400 hover:text-accent"
                    >
                      Play
                    </button>
                  </div>
                ))
              ) : (
                <p className="text-sm text-neutral-400">Your list is empty.</p>
              )}
            </div>
            <Link href="/dashboard/my-list" className="mt-5 inline-flex">
              <Button type="button" variant="outline" size="sm">
                View full list
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
