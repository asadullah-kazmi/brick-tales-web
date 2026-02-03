"use client";

import { useMemo } from "react";
import { HLSVideoPlayer } from "@/components/player";
import { DEFAULT_HLS_TEST_STREAM, HLS_TEST_STREAMS } from "@/lib/hls-streams";
import { mockVideos } from "@/lib/mock-videos";

type WatchPageProps = {
  params: { id: string };
};

export default function WatchPage({ params }: WatchPageProps) {
  const { id } = params;

  const { streamUrl, title } = useMemo(() => {
    const streamKey = HLS_TEST_STREAMS[id] ? id : "big-buck-bunny";
    const streamUrl = HLS_TEST_STREAMS[streamKey] ?? DEFAULT_HLS_TEST_STREAM;
    const video = mockVideos.find((v) => v.id === id);
    return {
      streamUrl,
      title: video?.title ?? `Video ${id}`,
    };
  }, [id]);

  return (
    <main className="flex flex-1 flex-col px-4 py-6 sm:px-6 lg:px-8">
      <h1 className="mb-4 text-xl font-semibold text-neutral-900 dark:text-white sm:text-2xl">
        {title}
      </h1>
      <div className="w-full max-w-5xl">
        <HLSVideoPlayer
          src={streamUrl}
          title={title}
          className="vjs-theme-stream"
        />
      </div>
      <p className="mt-4 text-sm text-neutral-500 dark:text-neutral-400">
        HLS adaptive streaming · Use the control bar for play/pause, volume,
        quality, and fullscreen.
      </p>
    </main>
  );
}
