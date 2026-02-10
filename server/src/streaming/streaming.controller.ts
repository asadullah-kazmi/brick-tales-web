import { Controller, Get, Query, UnauthorizedException } from '@nestjs/common';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { User } from '@prisma/client';
import { StreamingService } from './streaming.service';
import { PlayUrlResponseDto } from './dto/play-url-response.dto';

@Controller('streaming')
export class StreamingController {
  constructor(private readonly streamingService: StreamingService) {}

  /** Authenticated: get playback metadata. Requires active subscription. */
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
    return this.streamingService.getPlaybackMetadata(resolvedId, user.id);
  }
}
