"use client";

import { useEffect, useRef } from "react";
import videojs from "video.js";
import "video.js/dist/video-js.css";
import { cn } from "@/lib/utils";

/** Player instance type from Video.js (avoids using internal types). */
type VideoJsPlayer = ReturnType<typeof videojs>;

export type HLSVideoPlayerProps = {
  /** HLS manifest URL (.m3u8). */
  src: string;
  /** Optional poster image URL. */
  poster?: string;
  /** Optional video title for accessibility. */
  title?: string;
  /** Optional class name for the wrapper. */
  className?: string;
  /** Optional callback when player is ready. */
  onReady?: (player: VideoJsPlayer) => void;
};

const VIDEO_JS_OPTIONS = {
  controls: true,
  responsive: true,
  fluid: true,
  playbackRates: [0.5, 1, 1.25, 1.5, 2],
  html5: {
    vhs: { overrideNative: true },
    nativeAudioTracks: false,
    nativeVideoTracks: false,
  },
} as const;

/**
 * HLS video player using Video.js. Supports adaptive streaming (HLS) and
 * fullscreen via the built-in control bar.
 */
export function HLSVideoPlayer({
  src,
  poster,
  title,
  className,
  onReady,
}: HLSVideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const playerRef = useRef<VideoJsPlayer | null>(null);

  useEffect(() => {
    const videoEl = videoRef.current;
    if (!videoEl || !src) return;

    const player = videojs(
      videoEl,
      VIDEO_JS_OPTIONS,
      function (this: VideoJsPlayer) {
        if (onReady) onReady(this);
      },
    );

    player.src({ src, type: "application/x-mpegURL" });
    if (poster) player.poster(poster);

    playerRef.current = player;

    return () => {
      if (playerRef.current && !playerRef.current.isDisposed()) {
        playerRef.current.dispose();
        playerRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only re-init when source/poster change
  }, [src, poster]);

  return (
    <div
      className={cn("overflow-hidden rounded-lg bg-black", className)}
      data-vjs-player
      title={title}
    >
      <video
        ref={videoRef}
        className="video-js vjs-big-play-centered vjs-fluid"
        playsInline
        aria-label={title}
      />
    </div>
  );
}
