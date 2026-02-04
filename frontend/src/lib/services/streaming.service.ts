import type { PlaybackInfoResponseDto, PlaybackRequestDto } from "@/types/api";
import { get, ApiError } from "@/lib/api-client";
import { getStoredAuth } from "@/lib/auth-storage";
import { DEFAULT_HLS_TEST_STREAM, HLS_TEST_STREAMS } from "@/lib/hls-streams";
import { USE_MOCK_API } from "./config";

/** Backend GET /streaming/play-url response (authenticated, requires subscription). */
interface PlayUrlResponse {
  playUrl: string;
  expiresAt: string | number | Date;
}

/**
 * Streaming service. Real API: requests signed play URL from GET /streaming/play-url (requires auth + subscription).
 * Mock: returns test HLS stream.
 */
export const streamingService = {
  /**
   * Get authorized playback URL. Real API: GET /streaming/play-url?videoId= — returns signed URL; 401/403 if not allowed.
   */
  async getPlaybackInfo(
    videoId: string,
    body?: PlaybackRequestDto
  ): Promise<PlaybackInfoResponseDto> {
    void body;
    if (USE_MOCK_API) {
      const url = HLS_TEST_STREAMS[videoId] ?? DEFAULT_HLS_TEST_STREAM;
      return { videoId, type: "hls", url };
    }

    const auth = getStoredAuth();
    if (!auth?.accessToken) {
      throw new ApiError("Sign in to watch", 401);
    }

    const res = await get<PlayUrlResponse>("streaming/play-url", {
      params: { videoId },
      headers: { Authorization: `Bearer ${auth.accessToken}` },
    });
    const expiresAt =
      typeof res.expiresAt === "string"
        ? res.expiresAt
        : res.expiresAt instanceof Date
        ? res.expiresAt.toISOString()
        : new Date(res.expiresAt).toISOString();
    return {
      videoId,
      type: "hls",
      url: res.playUrl,
      expiresAt,
    };
  },
};
