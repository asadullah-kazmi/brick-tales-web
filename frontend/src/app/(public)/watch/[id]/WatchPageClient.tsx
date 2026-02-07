"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { HLSVideoPlayerLazy } from "@/components/player";
import { SubscriptionPrompt } from "@/components/content";
import { useAuth } from "@/contexts";
import { contentService, streamingService } from "@/lib/services";
import { USE_MOCK_API } from "@/lib/services/config";
import { ApiError } from "@/lib/api-client";
import type { ContentDetailDto } from "@/types/api";
import { formatDuration, isLongForm } from "@/lib/video-utils";
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

type DisplayContent = {
  id: string;
  title: string;
  description?: string;
  thumbnailUrl: string | null;
  category?: string;
  releaseYear?: number;
  duration?: string;
};

type PlayableEpisode = {
  id: string;
  title: string;
  duration?: string;
};

function toDisplayContent(dto: ContentDetailDto): DisplayContent {
  return {
    id: dto.id,
    title: dto.title,
    description: dto.description,
    thumbnailUrl: dto.thumbnailUrl ?? null,
    category: dto.category,
    releaseYear: dto.releaseYear,
    duration: dto.duration,
  };
}

function pickPrimaryEpisode(content: ContentDetailDto): PlayableEpisode | null {
  const firstEpisode = content.episodes?.[0];
  if (firstEpisode) {
    return {
      id: firstEpisode.id,
      title: firstEpisode.title,
      duration: firstEpisode.duration,
    };
  }
  if (content.trailer) {
    return {
      id: content.trailer.id,
      title: content.trailer.title,
      duration: content.trailer.duration,
    };
  }
  return null;
}

export default function WatchPageClient({ params }: WatchPageClientProps) {
  const { id } = params;
  const router = useRouter();
  const pathname = usePathname();
  const { isSubscribed, isLoading: authLoading } = useAuth();
  const [content, setContent] = useState<ContentDetailDto | null>(null);
  const [primaryEpisode, setPrimaryEpisode] = useState<PlayableEpisode | null>(
    null,
  );
  const [streamUrl, setStreamUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  /** Set when playback permission is denied (401/403) or unavailable. */
  const [playbackError, setPlaybackError] = useState<
    "unauthorized" | "forbidden" | "unavailable" | null
  >(null);

  // Redirect inactive subscribers to pricing (real API only; mock allows playback via prompt).
  useEffect(() => {
    if (USE_MOCK_API || authLoading || loading) return;
    if (content && streamUrl && !isSubscribed) {
      const returnUrl = pathname ?? `/watch/${id}`;
      router.replace(
        `/subscription?returnUrl=${encodeURIComponent(returnUrl)}`,
      );
    }
  }, [
    authLoading,
    loading,
    content,
    streamUrl,
    isSubscribed,
    router,
    pathname,
    id,
  ]);

  useEffect(() => {
    let cancelled = false;
    setPlaybackError(null);
    (async () => {
      setLoading(true);
      try {
        const detailRes = await contentService.getContentById(id);
        if (cancelled) return;
        const contentDetail = detailRes?.content ?? null;
        setContent(contentDetail);
        if (!contentDetail) return;
        const episode = pickPrimaryEpisode(contentDetail);
        setPrimaryEpisode(episode);
        if (!episode) return;
        const playbackRes = await streamingService.getPlaybackInfo(episode.id);
        if (cancelled) return;
        setStreamUrl(playbackRes.url);
      } catch (err) {
        if (!cancelled) {
          setStreamUrl(null);
          if (err instanceof ApiError) {
            if (err.status === 401) setPlaybackError("unauthorized");
            else if (err.status === 403) setPlaybackError("forbidden");
            else setPlaybackError("unavailable");
          } else {
            setPlaybackError("unavailable");
          }
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id]);

  const displayContent = content ? toDisplayContent(content) : null;
  const title = displayContent?.title ?? `Content ${id}`;
  const longForm = displayContent ? isLongForm(displayContent) : false;
  const [offlineModalOpen, setOfflineModalOpen] = useState(false);

  if (authLoading || loading) {
    return (
      <main className="flex min-h-0 flex-1 items-center justify-center px-4 py-12">
        <Loader size="lg" label="Loading video…" />
      </main>
    );
  }

  if (!content) {
    return (
      <main className="flex min-h-0 flex-1 flex-col items-center justify-center gap-4 px-4 py-12">
        <h2 className="text-xl font-semibold text-neutral-900 dark:text-white">
          Content not found
        </h2>
        <p className="text-center text-neutral-600 dark:text-neutral-400">
          The content you’re looking for doesn’t exist or is no longer
          available.
        </p>
        <a
          href="/browse"
          className="inline-flex h-10 items-center justify-center rounded-lg bg-neutral-900 px-4 text-sm font-medium text-white hover:bg-neutral-800 dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-neutral-200"
        >
          Browse content
        </a>
      </main>
    );
  }

  if (content && playbackError) {
    const returnUrl = pathname ?? `/watch/${id}`;
    return (
      <main className="flex min-h-0 flex-1 flex-col items-center justify-center gap-4 px-4 py-12">
        <h2 className="text-xl font-semibold text-neutral-900 dark:text-white">
          {playbackError === "unauthorized"
            ? "Sign in to watch"
            : playbackError === "forbidden"
              ? "Active subscription required"
              : "Playback not available"}
        </h2>
        <p className="text-center text-neutral-600 dark:text-neutral-400">
          {playbackError === "unauthorized"
            ? "You need to sign in to stream this video."
            : playbackError === "forbidden"
              ? "An active subscription is required to watch. Subscribe to get access."
              : "This video cannot be played right now. Try again later."}
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3">
          {playbackError === "unauthorized" && (
            <Link
              href={`/login?returnUrl=${encodeURIComponent(returnUrl)}`}
              className="inline-flex h-10 items-center justify-center rounded-lg bg-neutral-900 px-4 text-sm font-medium text-white hover:bg-neutral-800 dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-neutral-200"
            >
              Sign in
            </Link>
          )}
          {(playbackError === "forbidden" ||
            playbackError === "unauthorized") && (
            <Link
              href={`/subscription?returnUrl=${encodeURIComponent(returnUrl)}`}
              className="inline-flex h-10 items-center justify-center rounded-lg border-2 border-accent px-4 text-sm font-medium text-accent hover:bg-accent/10"
            >
              View plans
            </Link>
          )}
          <Link href="/browse">
            <Button type="button" variant="secondary">
              Browse content
            </Button>
          </Link>
        </div>
      </main>
    );
  }

  if (!streamUrl) {
    return (
      <main className="flex min-h-0 flex-1 items-center justify-center px-4 py-12">
        <p className="text-neutral-600 dark:text-neutral-400">
          Playback is not available for this content.
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
          {(primaryEpisode?.duration ?? displayContent?.duration) && (
            <span
              title={`Duration: ${
                primaryEpisode?.duration ?? displayContent?.duration
              }`}
            >
              {formatDuration(
                primaryEpisode?.duration ?? displayContent?.duration ?? "0:00",
              )}
            </span>
          )}
          {displayContent?.category && (
            <span className="rounded-full bg-neutral-100 px-2.5 py-0.5 font-medium text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300">
              {displayContent.category}
            </span>
          )}
          {displayContent?.releaseYear && (
            <span>{displayContent.releaseYear}</span>
          )}
          {longForm && (
            <span
              className="rounded-full bg-neutral-100 px-2.5 py-0.5 font-medium text-neutral-800 dark:bg-neutral-800/70 dark:text-neutral-200"
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
            {displayContent?.description ? (
              <p className="whitespace-pre-wrap text-neutral-600 leading-relaxed dark:text-neutral-400">
                {displayContent.description}
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
