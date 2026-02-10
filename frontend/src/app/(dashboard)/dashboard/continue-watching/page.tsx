"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui";
import type { ContentSummaryDto } from "@/types/api";

function getProgressFromId(id: string): number {
  let hash = 0;
  for (let i = 0; i < id.length; i += 1) {
    hash = (hash * 33 + id.charCodeAt(i)) % 1000;
  }
  return 10 + (hash % 85);
}

export default function ContinueWatchingPage() {
  const [continueItems, setContinueItems] = useState<ContentSummaryDto[]>([]);

  useEffect(() => {
    setContinueItems([]);
  }, []);

  const hasItems = continueItems.length > 0;
  return (
    <div className="font-[var(--font-geist-sans)]">
      <header className="mb-6">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-neutral-500">
          Continue Watching
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
          Pick up right where you left off
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-neutral-400">
          Your in-progress titles stay synced across devices.
        </p>
      </header>

      <section
        className="rounded-2xl border border-neutral-700/60 bg-neutral-900/60 p-6"
        aria-label="In progress"
      >
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">In progress</h2>
          <Link
            href="/browse"
            className="text-xs font-semibold text-neutral-400 hover:text-accent"
          >
            Browse
          </Link>
        </div>
        <div className="mt-6 space-y-4">
          {hasItems ? (
            continueItems.map((item) => {
              const progress = getProgressFromId(item.id);
              return (
                <div
                  key={item.id}
                  className="rounded-xl border border-neutral-700/60 bg-neutral-950/60 p-4"
                >
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-sm font-semibold text-white">
                        {item.title}
                      </p>
                      <p className="text-xs text-neutral-400">
                        {item.category ?? item.type}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-neutral-400">
                        {progress}% watched
                      </span>
                      <Button type="button" size="sm" variant="outline">
                        Resume
                      </Button>
                    </div>
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
              Nothing to resume yet. Start watching a title to see progress.
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
