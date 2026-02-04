"use client";

import dynamic from "next/dynamic";
import { useEffect, useMemo, useState } from "react";
import { contentService } from "@/lib/services";
import type { Video } from "@/types";
import { VideoCardSkeleton } from "@/components/content";
import { Input } from "@/components/ui";
import { Button } from "@/components/ui";
import { cn } from "@/lib/utils";

const ABOVE_THE_FOLD_COUNT = 8;
const SKELETON_COUNT = 12;

const VideoCard = dynamic(
  () => import("@/components/content").then((mod) => mod.VideoCard),
  {
    loading: () => <VideoCardSkeleton />,
  }
);

const ALL_VALUE = "All";

function dtoToVideo(dto: {
  id: string;
  title: string;
  duration: string;
  thumbnailUrl: string | null;
  description?: string;
  category?: string;
  publishedAt?: string;
  createdAt: string;
}): Video {
  return {
    id: dto.id,
    title: dto.title,
    duration: dto.duration,
    thumbnailUrl: dto.thumbnailUrl ?? null,
    description: dto.description,
    category: dto.category,
    publishedAt: dto.publishedAt ?? dto.createdAt,
  };
}

export default function BrowsePage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(ALL_VALUE);
  const [allVideos, setAllVideos] = useState<Video[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    Promise.all([
      contentService.getVideosForBrowse(),
      contentService.getCategories(),
    ])
      .then(([videos, cats]) => {
        if (!cancelled) {
          setAllVideos(videos.map(dtoToVideo));
          setCategories((cats ?? []).filter((c) => c !== ALL_VALUE));
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(
            err instanceof Error ? err.message : "Failed to load videos."
          );
          setAllVideos([]);
          setCategories([]);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const filteredVideos = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return allVideos.filter((video) => {
      const matchesCategory =
        selectedCategory === ALL_VALUE || video.category === selectedCategory;
      const matchesSearch =
        !query ||
        video.title.toLowerCase().includes(query) ||
        (video.description?.toLowerCase().includes(query) ?? false);
      return matchesCategory && matchesSearch;
    });
  }, [searchQuery, selectedCategory, allVideos]);

  return (
    <main className="flex flex-1 flex-col px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-neutral-900 dark:text-white sm:text-3xl">
          Browse
        </h1>
        <p className="mt-1 text-neutral-600 dark:text-neutral-400">
          Discover videos and start watching.
        </p>
      </div>

      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:gap-6">
        <div className="min-w-0 flex-1">
          <Input
            label="Search"
            type="search"
            placeholder="Search by title or description…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            aria-label="Search videos"
            disabled={loading}
          />
        </div>
        <div className="flex flex-col gap-2 sm:shrink-0">
          <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
            Category
          </span>
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <button
                key={category}
                type="button"
                onClick={() => setSelectedCategory(category)}
                disabled={loading}
                className={cn(
                  "rounded-full px-4 py-2 text-sm font-medium transition-colors",
                  selectedCategory === category
                    ? "bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900"
                    : "bg-neutral-100 text-neutral-700 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700"
                )}
                aria-pressed={selectedCategory === category}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: SKELETON_COUNT }, (_, i) => (
            <VideoCardSkeleton key={i} />
          ))}
        </div>
      ) : error ? (
        <div
          className="rounded-xl border border-red-200 bg-red-50 py-12 text-center dark:border-red-900/50 dark:bg-red-950/30"
          role="alert"
        >
          <p className="text-red-700 dark:text-red-300">{error}</p>
          <Button
            type="button"
            variant="secondary"
            className="mt-4"
            onClick={() => window.location.reload()}
          >
            Try again
          </Button>
        </div>
      ) : filteredVideos.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3 xl:grid-cols-4">
          {filteredVideos.map((video, index) => (
            <VideoCard
              key={video.id}
              video={video}
              priority={index < ABOVE_THE_FOLD_COUNT}
            />
          ))}
        </div>
      ) : (
        <div className="rounded-xl border border-neutral-200 bg-neutral-50 py-12 text-center dark:border-neutral-800 dark:bg-neutral-900/50">
          <p className="text-neutral-600 dark:text-neutral-400">
            {allVideos.length === 0
              ? "No videos available yet. Check back later."
              : "No videos match your search or category. Try a different filter."}
          </p>
        </div>
      )}
    </main>
  );
}
