import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
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

  /**
   * Sync download status: return all downloads for the user (optionally filtered by device).
   * Use this to sync local state with backend (status, expiresAt, video, device).
   */
  @Get('sync')
  async sync(@CurrentUser() user: User, @Query('deviceId') deviceId?: string) {
    return this.downloadsService.listDownloadsForSync(user.id, deviceId);
  }

  /**
   * Fetch active offline downloads: AUTHORIZED or DOWNLOADED with expiresAt in the future.
   * Optionally filter by deviceId.
   */
  @Get('active')
  async active(@CurrentUser() user: User, @Query('deviceId') deviceId?: string) {
    return this.downloadsService.listActiveDownloads(user.id, deviceId);
  }

  /**
   * Notify backend when download completes. Updates status from AUTHORIZED to DOWNLOADED.
   * Call after the client has finished saving the file locally.
   */
  @Post(':id/complete')
  async complete(@CurrentUser() user: User, @Param('id') id: string) {
    return this.downloadsService.markDownloadComplete(user.id, id);
  }
}
