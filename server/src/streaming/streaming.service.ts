import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

function inferPlaybackType(
  hlsUrl: string | null | undefined,
  videoUrl: string | null | undefined,
): 'hls' | 'mp4' | undefined {
  const candidate = hlsUrl?.trim() || videoUrl?.trim();
  if (!candidate) return undefined;
  const normalized = candidate.toLowerCase();
  if (/\.m3u8(\?|$)/.test(normalized)) return 'hls';
  if (/\.mp4(\?|$)/.test(normalized)) return 'mp4';
  return undefined;
}

@Injectable()
export class StreamingService {
  constructor(private readonly prisma: PrismaService) {}

  /** Check if user has an active subscription. */
  async hasActiveSubscription(userId: string): Promise<boolean> {
    const now = new Date();
    const sub = await (this.prisma as any).subscription.findFirst({
      where: {
        userId,
        status: 'ACTIVE',
        endDate: { gte: now },
      },
    });
    return !!sub;
  }

  async recordEpisodeView(userId: string, episodeId: string): Promise<void> {
    await (this.prisma as any).viewHistory.create({
      data: {
        userId,
        episodeId,
        progress: 0,
        completed: false,
      },
    });
  }

  /** Return playback metadata for an authenticated user with active subscription. */
  async getPlaybackMetadata(
    episodeId: string,
    userId: string,
  ): Promise<{ streamKey: string; type?: 'hls' | 'mp4' }> {
    const hasSubscription = await this.hasActiveSubscription(userId);
    if (!hasSubscription) {
      throw new ForbiddenException(
        'Active subscription required to stream. Please subscribe to watch.',
      );
    }

    const episode = await (this.prisma as any).episode.findUnique({
      where: { id: episodeId },
      select: {
        videoUrl: true,
        hlsUrl: true,
        content: { select: { isPublished: true } },
      },
    });
    if (!episode) throw new NotFoundException('Episode not found');
    if (!episode.videoUrl && !episode.hlsUrl) {
      throw new NotFoundException('Episode is not available for streaming');
    }
    if (!episode.content.isPublished) {
      throw new ForbiddenException('Content is not yet published');
    }

    const streamKey = episode.hlsUrl?.trim() || episode.videoUrl?.trim();
    if (!streamKey) {
      throw new NotFoundException('Episode is not available for streaming');
    }
    await this.recordEpisodeView(userId, episodeId);
    const type = inferPlaybackType(episode.hlsUrl, episode.videoUrl);

    return { streamKey, type };
  }
}
