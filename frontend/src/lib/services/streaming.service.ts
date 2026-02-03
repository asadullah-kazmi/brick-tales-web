import type { PlaybackInfoResponseDto, PlaybackRequestDto } from "@/types/api";
import { DEFAULT_HLS_TEST_STREAM, HLS_TEST_STREAMS } from "@/lib/hls-streams";

/**
 * Streaming service. Use this instead of reading hls-streams directly.
 * Switch to real API (GET /streaming/playback/:videoId) when USE_MOCK_API is false.
 */
export const streamingService = {
  /**
   * Get playback URL and metadata. Mock: returns test HLS stream; real API: GET /streaming/playback/:videoId.
   */
  async getPlaybackInfo(
    videoId: string,
    body?: PlaybackRequestDto,
  ): Promise<PlaybackInfoResponseDto> {
    void body; // reserved for real API (e.g. quality preference)
    const url = HLS_TEST_STREAMS[videoId] ?? DEFAULT_HLS_TEST_STREAM;
    return {
      videoId,
      type: "hls",
      url,
    };
  },
};
