"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button, Loader } from "@/components/ui";
import type { ContentSummaryDto } from "@/types/api";

export default function MyListPage() {
  const [savedItems, setSavedItems] = useState<ContentSummaryDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    setSavedItems([]);
    setIsLoading(false);
  }, []);

  const hasSaved = savedItems.length > 0;
  if (isLoading) {
    return (
      <main className="flex min-h-[50vh] items-center justify-center px-4 py-12">
        <Loader size="lg" label="Loading your list…" />
      </main>
    );
  }
  return (
    <div className="font-[var(--font-geist-sans)]">
      <header className="mb-6">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-neutral-500">
          My List
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
          Saved for the perfect moment
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-neutral-400">
          Titles you plan to watch next, synced across every device.
        </p>
      </header>

      <section
        className="rounded-2xl border border-neutral-700/60 bg-neutral-900/60 p-6"
        aria-label="Saved titles"
      >
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">Saved titles</h2>
          <Link
            href="/dashboard/explore"
            className="text-xs font-semibold text-neutral-400 hover:text-accent"
          >
            Add more
          </Link>
        </div>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {hasSaved ? (
            savedItems.map((item) => (
              <div
                key={item.id}
                className="rounded-xl border border-neutral-700/60 bg-neutral-950/60 p-4"
              >
                <div className="relative h-24 overflow-hidden rounded-lg bg-gradient-to-br from-neutral-800/70 via-neutral-900 to-neutral-800/50">
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
                <div className="mt-4 flex items-center gap-2">
                  <Button type="button" size="sm">
                    Play
                  </Button>
                  <Button type="button" variant="outline" size="sm">
                    Remove
                  </Button>
                </div>
              </div>
            ))
          ) : (
            <div className="rounded-xl border border-dashed border-neutral-700/60 bg-neutral-950/40 p-6 text-sm text-neutral-400 sm:col-span-2">
              Your list is empty right now.
            </div>
          )}
        </div>
        <div className="mt-6 rounded-xl border border-dashed border-neutral-700/70 bg-neutral-950/40 p-6 text-center">
          <p className="text-sm font-medium text-neutral-300">
            Keep saving favorites
          </p>
          <p className="mt-1 text-xs text-neutral-500">
            Discover new titles in Search / Explore.
          </p>
          <Link href="/dashboard/explore" className="mt-4 inline-flex">
            <Button type="button" variant="outline" size="sm">
              Explore now
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
