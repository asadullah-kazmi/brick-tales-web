import type {
  PlaybackInfoResponseDto,
  PlaybackRequestDto,
  PlaybackType,
} from "@/types/api";
import { get, ApiError } from "@/lib/api-client";
import { getStoredAuth } from "@/lib/auth-storage";
import { DEFAULT_HLS_TEST_STREAM, HLS_TEST_STREAMS } from "@/lib/hls-streams";
import { USE_MOCK_API } from "./config";
import { getR2WorkerBaseUrl } from "@/lib/env";

/** Backend GET /episodes/:id/play response (authenticated, requires subscription). */
interface PlaybackMetadataResponse {
  streamKey: string;
  type?: PlaybackType;
}

function inferPlaybackType(url: string): PlaybackType | undefined {
  const normalized = url.toLowerCase();
  if (/\.m3u8(\?|$)/.test(normalized)) return "hls";
  if (/\.mp4(\?|$)/.test(normalized)) return "mp4";
  return undefined;
}

function buildWorkerStreamUrl(streamKey: string): string {
  const trimmed = streamKey.trim();
  if (!trimmed) return trimmed;
  const workerBaseUrl = getR2WorkerBaseUrl();
  if (/^https?:\/\//i.test(trimmed)) {
    if (!workerBaseUrl) return trimmed;
    try {
      const absolute = new URL(trimmed);
      if (absolute.hostname.endsWith(".r2.dev")) {
        const rebased = new URL(workerBaseUrl);
        rebased.pathname = absolute.pathname;
        rebased.search = absolute.search;
        return rebased.toString();
      }
    } catch {
      return trimmed;
    }
    return trimmed;
  }
  if (!workerBaseUrl) {
    throw new ApiError("R2 worker base URL is not configured", 500);
  }
  return `${workerBaseUrl}/${trimmed.replace(/^\/+/, "")}`;
}

/**
 * Streaming service. Real API: requests playback metadata from GET /episodes/:id/play.
 * The client builds the Worker URL for HLS/MP4 playback.
 * Mock: returns test HLS stream.
 */
export const streamingService = {
  /**
   * Get authorized playback metadata. Real API: GET /episodes/:id/play — returns stream key; 401/403 if not allowed.
   */
  async getPlaybackInfo(
    episodeId: string,
    body?: PlaybackRequestDto,
  ): Promise<PlaybackInfoResponseDto> {
    void body;
    if (USE_MOCK_API) {
      const url = HLS_TEST_STREAMS[episodeId] ?? DEFAULT_HLS_TEST_STREAM;
      return { episodeId, type: "hls", url };
    }

    const auth = getStoredAuth();
    if (!auth?.accessToken) {
      throw new ApiError("Sign in to watch", 401);
    }

    const res = await get<PlaybackMetadataResponse>(
      `episodes/${episodeId}/play`,
      {
        headers: { Authorization: `Bearer ${auth.accessToken}` },
      },
    );
    if (!res?.streamKey || typeof res.streamKey !== "string") {
      throw new ApiError("Playback stream key is missing", 500, res ?? null);
    }
    const url = buildWorkerStreamUrl(res.streamKey);
    return {
      episodeId,
      type:
        res.type ??
        inferPlaybackType(res.streamKey) ??
        inferPlaybackType(url) ??
        "hls",
      url,
      streamKey: res.streamKey,
    };
  },
};
