"use client";

import { useEffect, useState } from "react";
import { HLSVideoPlayer } from "@/components/player";
import { SubscriptionPrompt } from "@/components/content";
import { useAuth } from "@/contexts";
import { contentService, streamingService } from "@/lib/services";
import type { VideoDto } from "@/types/api";
import { formatDuration, formatDate, isLongForm } from "@/lib/video-utils";
import { Loader } from "@/components/ui";

type WatchPageClientProps = {
  params: { id: string };
};

function dtoToDisplayVideo(dto: VideoDto): {
  id: string;
  title: string;
  duration: string;
  thumbnailUrl: string | null;
  description?: string;
  category?: string;
  publishedAt?: string;
} {
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

export default function WatchPageClient({ params }: WatchPageClientProps) {
  const { id } = params;
  const { isSubscribed, isLoading: authLoading } = useAuth();
  const [video, setVideo] = useState<VideoDto | null>(null);
  const [streamUrl, setStreamUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const [detailRes, playbackRes] = await Promise.all([
          contentService.getVideoById(id),
          streamingService.getPlaybackInfo(id),
        ]);
        if (cancelled) return;
        setVideo(detailRes?.video ?? null);
        setStreamUrl(playbackRes.url);
      } catch {
        if (!cancelled) {
          setVideo(null);
          setStreamUrl(null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id]);

  const displayVideo = video ? dtoToDisplayVideo(video) : null;
  const title = displayVideo?.title ?? `Video ${id}`;
  const longForm = displayVideo ? isLongForm(displayVideo) : false;

  if (authLoading || loading) {
    return (
      <main className="flex min-h-0 flex-1 items-center justify-center px-4 py-12">
        <Loader size="lg" label="Loading…" />
      </main>
    );
  }

  if (!streamUrl) {
    return (
      <main className="flex min-h-0 flex-1 items-center justify-center px-4 py-12">
        <p className="text-neutral-600 dark:text-neutral-400">
          Video or playback info not found.
        </p>
      </main>
    );
  }

  return (
    <main className="min-h-0 flex-1 px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        {/* Subscription guard: show prompt instead of video when not subscribed */}
        <section className="mb-6" aria-label="Video player">
          {isSubscribed ? (
            <div className="overflow-hidden rounded-xl bg-black shadow-lg ring-1 ring-neutral-200 dark:ring-neutral-800">
              <HLSVideoPlayer
                src={streamUrl}
                title={title}
                className="vjs-theme-stream"
              />
            </div>
          ) : (
            <div className="overflow-hidden rounded-xl shadow-lg ring-1 ring-neutral-200 dark:ring-neutral-800">
              <SubscriptionPrompt
                contentTitle={title}
                className="rounded-xl border-0"
              />
            </div>
          )}
        </section>

        {/* Title */}
        <header className="mb-4">
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-white sm:text-3xl">
            {title}
          </h1>
        </header>

        {/* Metadata row: duration, category, date, long-form badge */}
        <div className="mb-6 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-neutral-600 dark:text-neutral-400">
          {displayVideo?.duration && (
            <span title={`Duration: ${displayVideo.duration}`}>
              {formatDuration(displayVideo.duration)}
            </span>
          )}
          {displayVideo?.category && (
            <span className="rounded-full bg-neutral-100 px-2.5 py-0.5 font-medium text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300">
              {displayVideo.category}
            </span>
          )}
          {displayVideo?.publishedAt && (
            <span>{formatDate(displayVideo.publishedAt)}</span>
          )}
          {longForm && (
            <span
              className="rounded-full bg-amber-100 px-2.5 py-0.5 font-medium text-amber-800 dark:bg-amber-900/40 dark:text-amber-200"
              aria-label="Long-form content"
            >
              Long-form
            </span>
          )}
        </div>

        {/* Description — supports long-form content (1–3+ hours) */}
        <section
          className="border-t border-neutral-200 pt-6 dark:border-neutral-800"
          aria-labelledby="description-heading"
        >
          <h2 id="description-heading" className="sr-only">
            Description
          </h2>
          <div className="max-w-none">
            {displayVideo?.description ? (
              <p className="whitespace-pre-wrap text-neutral-600 leading-relaxed dark:text-neutral-400">
                {displayVideo.description}
              </p>
            ) : (
              <p className="text-neutral-500 dark:text-neutral-400">
                No description available.
              </p>
            )}
          </div>
        </section>

        <p className="mt-6 text-xs text-neutral-500 dark:text-neutral-500">
          HLS adaptive streaming · Use the control bar for play/pause, volume,
          quality, and fullscreen.
        </p>
      </div>
    </main>
  );
}
