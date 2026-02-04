import { Body, Controller, Post } from '@nestjs/common';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { User } from '@prisma/client';
import { DownloadsService } from './downloads.service';
import { AuthorizeDownloadDto } from './dto/authorize-download.dto';
import { DownloadTokenResponseDto } from './dto/download-token-response.dto';

@Controller('downloads')
export class DownloadsController {
  constructor(private readonly downloadsService: DownloadsService) {}

  /**
   * Authorize an offline download for the given video on the given device.
   * Validates: active subscription, plan offlineAllowed, device limit, maxOfflineDownloads.
   * Returns the created (or existing) Download record with status AUTHORIZED.
   */
  @Post('authorize')
  async authorize(@CurrentUser() user: User, @Body() dto: AuthorizeDownloadDto) {
    return this.downloadsService.authorizeDownload(
      user.id,
      dto.videoId.trim(),
      dto.deviceId.trim(),
    );
  }

  /**
   * Generate a secure, time-limited download token for an offline video.
   * Token is tied to user, device, and video. Ensures authorization (creates Download if needed).
   * Returns token and expiry metadata.
   */
  @Post('token')
  async getToken(
    @CurrentUser() user: User,
    @Body() dto: AuthorizeDownloadDto,
  ): Promise<DownloadTokenResponseDto> {
    return this.downloadsService.getDownloadToken(user.id, dto.videoId.trim(), dto.deviceId.trim());
  }
}
