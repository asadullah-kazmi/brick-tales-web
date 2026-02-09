"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button, Input } from "@/components/ui";
import { contentService } from "@/lib/services";
import type { ContentSummaryDto } from "@/types/api";

export default function ExplorePage() {
  const [contentItems, setContentItems] = useState<ContentSummaryDto[]>([]);
  const [categories, setCategories] = useState<string[]>([]);

  useEffect(() => {
    let active = true;
    Promise.all([
      contentService.getContentForBrowse(),
      contentService.getCategories(),
    ])
      .then(([items, cats]) => {
        if (!active) return;
        setContentItems(items);
        setCategories(cats);
      })
      .catch(() => {
        if (!active) return;
        setContentItems([]);
        setCategories([]);
      });
    return () => {
      active = false;
    };
  }, []);

  const trendingItems = contentItems.slice(0, 4);
  const quickFilters = categories
    .filter((category) => category.toLowerCase() !== "all")
    .slice(0, 5);
  const moods = categories
    .filter((category) => category.toLowerCase() !== "all")
    .slice(0, 6);
  const hasTrending = trendingItems.length > 0;
  const hasMoods = moods.length > 0;
  return (
    <div className="font-[var(--font-geist-sans)]">
      <header className="mb-6">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-neutral-500">
          Search / Explore
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
          Find your next favorite watch
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-neutral-400">
          Search across creators, collections, and playlists curated for your
          mood.
        </p>
      </header>

      <section
        className="rounded-2xl border border-neutral-700/60 bg-neutral-900/60 p-6"
        aria-label="Search"
      >
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
          <Input
            label="Search titles, creators, or genres"
            placeholder='Try "live concerts"'
          />
          <div className="rounded-xl border border-neutral-700/70 bg-neutral-950/60 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-neutral-500">
              Quick filters
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {quickFilters.length > 0 ? (
                quickFilters.map((filter) => (
                  <button
                    key={filter}
                    type="button"
                    className="rounded-full border border-neutral-600 px-3 py-1 text-xs font-semibold text-neutral-200 hover:border-accent hover:text-accent"
                  >
                    {filter}
                  </button>
                ))
              ) : (
                <span className="text-xs text-neutral-400">
                  Filters appear when content is available.
                </span>
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="mt-8" aria-label="Trending">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">Trending now</h2>
          <Link
            href="/browse"
            className="text-xs font-semibold text-neutral-400 hover:text-accent"
          >
            Open browse
          </Link>
        </div>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {hasTrending ? (
            trendingItems.map((item) => (
              <div
                key={item.id}
                className="rounded-xl border border-neutral-700/60 bg-neutral-900/60 p-4"
              >
                <div className="relative h-24 overflow-hidden rounded-lg bg-gradient-to-br from-neutral-800/80 via-neutral-900 to-neutral-800/60">
                  {item.thumbnailUrl ? (
                    <img
                      src={item.thumbnailUrl}
                      alt=""
                      className="h-full w-full object-cover"
                      loading="lazy"
                    />
                  ) : null}
                </div>
                <p className="mt-4 text-sm font-semibold text-white">
                  {item.title}
                </p>
                <p className="mt-1 text-xs text-neutral-400">
                  {item.category ?? item.type}
                </p>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="mt-4 w-full"
                >
                  View details
                </Button>
              </div>
            ))
          ) : (
            <div className="rounded-xl border border-dashed border-neutral-700/60 bg-neutral-900/40 p-6 text-sm text-neutral-400 sm:col-span-2 lg:col-span-4">
              Trending content will appear once titles are available.
            </div>
          )}
        </div>
      </section>

      <section className="mt-8" aria-label="Browse by mood">
        <h2 className="text-lg font-semibold text-white">Browse by mood</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {hasMoods ? (
            moods.map((mood) => (
              <div
                key={mood}
                className="flex items-center justify-between rounded-xl border border-neutral-700/60 bg-neutral-900/60 px-4 py-3"
              >
                <div>
                  <p className="text-sm font-semibold text-white">{mood}</p>
                  <p className="text-xs text-neutral-400">Curated playlists</p>
                </div>
                <button
                  type="button"
                  className="text-xs font-semibold text-neutral-400 hover:text-accent"
                >
                  Explore
                </button>
              </div>
            ))
          ) : (
            <div className="rounded-xl border border-dashed border-neutral-700/60 bg-neutral-900/40 p-4 text-sm text-neutral-400 sm:col-span-2 lg:col-span-3">
              Mood collections will show once categories are available.
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
