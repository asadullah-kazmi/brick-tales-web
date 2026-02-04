"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { HLSVideoPlayerLazy } from "@/components/player";
import { SubscriptionPrompt } from "@/components/content";
import { useAuth } from "@/contexts";
import { contentService, streamingService } from "@/lib/services";
import { USE_MOCK_API } from "@/lib/services/config";
import type { VideoDto } from "@/types/api";
import { formatDuration, formatDate, isLongForm } from "@/lib/video-utils";
import {
  Loader,
  Modal,
  ModalContent,
  ModalFooter,
  Button,
} from "@/components/ui";

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
  const router = useRouter();
  const pathname = usePathname();
  const { isSubscribed, isLoading: authLoading } = useAuth();
  const [video, setVideo] = useState<VideoDto | null>(null);
  const [streamUrl, setStreamUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Redirect inactive subscribers to pricing (real API only; mock allows playback via prompt).
  useEffect(() => {
    if (USE_MOCK_API || authLoading || loading) return;
    if (video && streamUrl && !isSubscribed) {
      const returnUrl = pathname ?? `/watch/${id}`;
      router.replace(
        `/subscription?returnUrl=${encodeURIComponent(returnUrl)}`
      );
    }
  }, [
    authLoading,
    loading,
    video,
    streamUrl,
    isSubscribed,
    router,
    pathname,
    id,
  ]);

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
  const [offlineModalOpen, setOfflineModalOpen] = useState(false);

  if (authLoading || loading) {
    return (
      <main className="flex min-h-0 flex-1 items-center justify-center px-4 py-12">
        <Loader size="lg" label="Loading video…" />
      </main>
    );
  }

  if (!video) {
    return (
      <main className="flex min-h-0 flex-1 flex-col items-center justify-center gap-4 px-4 py-12">
        <h2 className="text-xl font-semibold text-neutral-900 dark:text-white">
          Video not found
        </h2>
        <p className="text-center text-neutral-600 dark:text-neutral-400">
          The video you’re looking for doesn’t exist or is no longer available.
        </p>
        <a
          href="/browse"
          className="inline-flex h-10 items-center justify-center rounded-lg bg-neutral-900 px-4 text-sm font-medium text-white hover:bg-neutral-800 dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-neutral-200"
        >
          Browse videos
        </a>
      </main>
    );
  }

  if (!streamUrl) {
    return (
      <main className="flex min-h-0 flex-1 items-center justify-center px-4 py-12">
        <p className="text-neutral-600 dark:text-neutral-400">
          Playback is not available for this video.
        </p>
      </main>
    );
  }

  // Real API: inactive users are redirected above. Mock: show prompt.
  const showPlayer = isSubscribed;

  return (
    <main className="min-h-0 flex-1 px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <section className="mb-6" aria-label="Video player">
          {showPlayer ? (
            <div className="overflow-hidden rounded-xl bg-black shadow-lg ring-1 ring-neutral-200 dark:ring-neutral-800">
              <HLSVideoPlayerLazy
                src={streamUrl}
                title={title}
                className="vjs-theme-stream"
              />
            </div>
          ) : (
            <div className="overflow-hidden rounded-xl shadow-lg ring-1 ring-neutral-200 dark:ring-neutral-800">
              <SubscriptionPrompt
                contentTitle={title}
                returnUrl={pathname ?? `/watch/${id}`}
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
          <button
            type="button"
            onClick={() => setOfflineModalOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-full bg-neutral-100 px-2.5 py-0.5 font-medium text-neutral-700 transition-colors hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900 focus-visible:ring-offset-2 dark:focus-visible:ring-neutral-100 dark:focus-visible:ring-offset-neutral-900"
            aria-label="Download for offline viewing — opens info"
          >
            <span aria-hidden>⬇</span>
            Download for Offline
          </button>
        </div>

        <Modal
          isOpen={offlineModalOpen}
          onClose={() => setOfflineModalOpen(false)}
          title="Download for Offline"
        >
          <ModalContent>
            <p className="text-neutral-600 dark:text-neutral-300">
              Offline downloads let you save videos to your device and watch
              them without an internet connection.
            </p>
            <p className="mt-3 text-neutral-600 dark:text-neutral-300">
              <strong className="text-neutral-900 dark:text-white">
                Offline downloads are available on our iOS and Android apps.
              </strong>{" "}
              Install the BRICK TALES.TV app from the App Store or Google Play,
              sign in with your subscription account, and use the download
              button on supported videos.
            </p>
            <p className="mt-3 text-sm text-neutral-500 dark:text-neutral-400">
              This feature is not available in the web player. Download the
              mobile app to watch offline.
            </p>
          </ModalContent>
          <ModalFooter>
            <Button
              type="button"
              variant="primary"
              onClick={() => setOfflineModalOpen(false)}
            >
              Got it
            </Button>
          </ModalFooter>
        </Modal>

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
