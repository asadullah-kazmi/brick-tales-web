import { Controller, Get, Param } from '@nestjs/common';
import type { User } from '@prisma/client';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { StreamingService } from './streaming.service';
import { PlayUrlResponseDto } from './dto/play-url-response.dto';

@Controller('episodes')
export class EpisodesController {
  constructor(private readonly streamingService: StreamingService) {}

  /**
   * Authenticated: get a time-limited signed play URL for an episode.
   */
  @Get(':id/play')
  async getEpisodePlayUrl(
    @CurrentUser() user: User,
    @Param('id') id: string,
  ): Promise<PlayUrlResponseDto> {
    return this.streamingService.getSignedPlayUrl(id.trim(), user.id);
  }
}
