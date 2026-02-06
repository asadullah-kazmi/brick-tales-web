import {
  Injectable,
  ForbiddenException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { createHmac, timingSafeEqual } from 'crypto';
import { PrismaService } from '../prisma/prisma.service';
import { R2Service } from '../storage/r2.service';

const DEFAULT_TOKEN_EXPIRES_SEC = 60 * 60; // 1 hour

interface PlayTokenPayload {
  episodeId: string;
  userId: string;
  exp: number;
}

@Injectable()
export class StreamingService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly r2Service: R2Service,
  ) {}

  private getSecret(): string {
    const secret = process.env.STREAMING_SIGNATURE_SECRET ?? process.env.JWT_ACCESS_SECRET;
    if (!secret) {
      throw new BadRequestException(
        'Streaming signing not configured (STREAMING_SIGNATURE_SECRET or JWT_ACCESS_SECRET)',
      );
    }
    return secret;
  }

  private base64UrlEncode(buf: Buffer): string {
    return buf.toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  }

  private base64UrlDecode(str: string): Buffer {
    const base64 = str.replace(/-/g, '+').replace(/_/g, '/');
    const pad = base64.length % 4;
    const padded = pad ? base64 + '='.repeat(4 - pad) : base64;
    return Buffer.from(padded, 'base64');
  }

  /**
   * Check if user has an active subscription.
   */
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

  /**
   * Create a signed play token for episodeId + userId, valid until exp (unix seconds).
   */
  createPlayToken(
    episodeId: string,
    userId: string,
    expiresInSeconds: number = DEFAULT_TOKEN_EXPIRES_SEC,
  ): { token: string; expiresAt: Date } {
    const exp = Math.floor(Date.now() / 1000) + expiresInSeconds;
    const payload: PlayTokenPayload = { episodeId, userId, exp };
    const payloadJson = JSON.stringify(payload);
    const payloadB64 = this.base64UrlEncode(Buffer.from(payloadJson, 'utf8'));
    const secret = this.getSecret();
    const signature = createHmac('sha256', secret).update(payloadJson).digest();
    const sigB64 = this.base64UrlEncode(signature);
    const token = `${payloadB64}.${sigB64}`;
    return { token, expiresAt: new Date(exp * 1000) };
  }

  /**
   * Verify play token and return payload if valid. Returns null if invalid or expired.
   */
  verifyPlayToken(token: string, expectedEpisodeId: string): PlayTokenPayload | null {
    try {
      const parts = token.split('.');
      if (parts.length !== 2) return null;
      const [payloadB64, sigB64] = parts;
      const payloadJson = this.base64UrlDecode(payloadB64).toString('utf8');
      const payload = JSON.parse(payloadJson) as PlayTokenPayload;
      if (payload.episodeId !== expectedEpisodeId) return null;
      if (payload.exp < Math.floor(Date.now() / 1000)) return null;
      const secret = this.getSecret();
      const expectedSig = createHmac('sha256', secret).update(payloadJson).digest();
      const actualSig = this.base64UrlDecode(sigB64);
      if (expectedSig.length !== actualSig.length || !timingSafeEqual(expectedSig, actualSig)) {
        return null;
      }
      return payload;
    } catch {
      return null;
    }
  }

  /**
   * Get episode by id; throw if not found or no videoUrl.
   */
  async getEpisodeStreamUrl(episodeId: string): Promise<string> {
    const episode = await (this.prisma as any).episode.findUnique({
      where: { id: episodeId },
      select: { videoUrl: true, content: { select: { isPublished: true } } },
    });
    if (!episode) throw new NotFoundException('Episode not found');
    if (!episode.videoUrl) {
      throw new NotFoundException('Episode is not available for streaming');
    }
    if (!episode.content.isPublished) {
      throw new ForbiddenException('Content is not yet published');
    }
    if (/^https?:\/\//i.test(episode.videoUrl)) return episode.videoUrl;
    return this.r2Service.getSignedGetUrl(episode.videoUrl);
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

  /**
   * Generate a time-limited signed play URL for an authenticated user with active subscription.
   */
  async getSignedPlayUrl(
    episodeId: string,
    userId: string,
  ): Promise<{ playUrl: string; expiresAt: Date }> {
    const hasSubscription = await this.hasActiveSubscription(userId);
    if (!hasSubscription) {
      throw new ForbiddenException(
        'Active subscription required to stream. Please subscribe to watch.',
      );
    }

    await this.getEpisodeStreamUrl(episodeId); // ensure episode exists and is streamable

    const expiresIn =
      typeof process.env.STREAMING_TOKEN_EXPIRES === 'string'
        ? this.parseExpiresToSeconds(process.env.STREAMING_TOKEN_EXPIRES)
        : Number(process.env.STREAMING_TOKEN_EXPIRES) || DEFAULT_TOKEN_EXPIRES_SEC;

    const { token, expiresAt } = this.createPlayToken(episodeId, userId, expiresIn);

    const baseUrl = process.env.APP_URL ?? 'http://localhost:5000';
    const playUrl = `${baseUrl.replace(/\/$/, '')}/streaming/play/${episodeId}?token=${encodeURIComponent(token)}`;

    return { playUrl, expiresAt };
  }

  private parseExpiresToSeconds(exp: string): number {
    const match = exp.match(/^(\d+)([smhd])?$/);
    if (!match) return DEFAULT_TOKEN_EXPIRES_SEC;
    const n = parseInt(match[1], 10);
    const unit = match[2] ?? 's';
    const multipliers: Record<string, number> = {
      s: 1,
      m: 60,
      h: 60 * 60,
      d: 24 * 60 * 60,
    };
    return n * (multipliers[unit] ?? 1);
  }
}
