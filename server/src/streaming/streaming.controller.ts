import { Controller, Get, Param, Query, Res, UnauthorizedException } from '@nestjs/common';
import { Response } from 'express';
import { Public } from '../auth/decorators/public.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { User } from '@prisma/client';
import { StreamingService } from './streaming.service';
import { PlayUrlResponseDto } from './dto/play-url-response.dto';

@Controller('streaming')
export class StreamingController {
  constructor(private readonly streamingService: StreamingService) {}

  /**
   * Authenticated: get a time-limited signed HLS play URL.
   * Requires active subscription.
   */
  @Get('play-url')
  async getPlayUrl(
    @CurrentUser() user: User,
    @Query('episodeId') episodeId: string,
    @Query('videoId') legacyVideoId?: string,
  ): Promise<PlayUrlResponseDto> {
    const resolvedId = episodeId?.trim() || legacyVideoId?.trim();
    if (!resolvedId) {
      throw new UnauthorizedException('episodeId is required');
    }
    return this.streamingService.getSignedPlayUrl(resolvedId, user.id);
  }

  /**
   * Public (no JWT): play endpoint. Validates signed token and redirects to the actual HLS stream URL.
   * Use the URL returned from GET /streaming/play-url.
   */
  @Public()
  @Get('play/:episodeId')
  async play(
    @Param('episodeId') episodeId: string,
    @Query('token') token: string,
    @Res() res: Response,
  ): Promise<void> {
    if (!token?.trim()) {
      res.status(401).json({ message: 'Token is required' });
      return;
    }
    const payload = this.streamingService.verifyPlayToken(token.trim(), episodeId);
    if (!payload) {
      res.status(403).json({ message: 'Invalid or expired play token' });
      return;
    }
    await this.streamingService.recordEpisodeView(payload.userId, episodeId);
    const streamUrl = await this.streamingService.getEpisodeStreamUrl(episodeId);
    res.redirect(302, streamUrl);
  }
}
