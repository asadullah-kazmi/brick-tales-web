import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  Param,
  Patch,
  Post,
  Query,
  BadRequestException,
} from '@nestjs/common';
import type { User } from '@prisma/client';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { AdminService } from './admin.service';
import type { OfflineAnalyticsDto } from './admin.service';
import type { DashboardStatsDto } from './dto/dashboard-stats.dto';
import type { AdminUserDto } from './dto/admin-user.dto';
import type { AdminContentItemDto } from './dto/admin-content.dto';
import { PresignUploadDto } from './dto/presign-upload.dto';
import { CreateAdminVideoDto } from './dto/create-admin-video.dto';
import { R2Service } from '../storage/r2.service';
import { randomUUID } from 'crypto';
import { SiteService } from '../site/site.service';
import type { SitePageDto, SitePageSummaryDto } from '../site/dto/site-page.dto';
import { UpdateSitePageDto } from '../site/dto/update-site-page.dto';
import type { AdminCategoryDto } from './dto/admin-category.dto';
import { CreateAdminCategoryDto } from './dto/create-admin-category.dto';
import { UpdateAdminVideoDto } from './dto/update-admin-video.dto';

const VIDEO_TYPES = new Set(['video/mp4', 'video/webm', 'video/mkv']);
const THUMBNAIL_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);
const MAX_VIDEO_BYTES = 20 * 1024 * 1024 * 1024;
const MAX_THUMBNAIL_BYTES = 5 * 1024 * 1024;

function getExtensionFromName(fileName: string): string {
  const safe = fileName.replace(/[^a-zA-Z0-9._-]/g, '_');
  const parts = safe.split('.');
  if (parts.length < 2) return '';
  return parts[parts.length - 1].toLowerCase();
}

function getExtensionForType(contentType: string): string {
  switch (contentType) {
    case 'video/mp4':
      return 'mp4';
    case 'video/webm':
      return 'webm';
    case 'video/mkv':
      return 'mkv';
    case 'image/jpeg':
      return 'jpg';
    case 'image/png':
      return 'png';
    case 'image/webp':
      return 'webp';
    default:
      return '';
  }
}

function ensureAdmin(user: User): void {
  if (user.role !== 'admin') {
    throw new ForbiddenException('Admin access required');
  }
}

@Controller('admin')
export class AdminController {
  constructor(
    private readonly adminService: AdminService,
    private readonly r2Service: R2Service,
    private readonly siteService: SiteService,
  ) {}

  /**
   * Dashboard stats: total users, videos, subscribers, videos by category.
   */
  @Get('stats')
  async getStats(@CurrentUser() user: User): Promise<DashboardStatsDto> {
    ensureAdmin(user);
    return this.adminService.getDashboardStats();
  }

  /**
   * List users (paginated).
   */
  @Get('users')
  async getUsers(
    @CurrentUser() user: User,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ): Promise<{ users: AdminUserDto[]; total: number }> {
    ensureAdmin(user);
    const pageNum = Math.max(1, parseInt(String(page || '1'), 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(String(limit || '20'), 10) || 20));
    return this.adminService.getUsers(pageNum, limitNum);
  }

  /**
   * List all content (videos) for admin.
   */
  @Get('content')
  async getContent(@CurrentUser() user: User): Promise<AdminContentItemDto[]> {
    ensureAdmin(user);
    return this.adminService.getContentList();
  }

  /**
   * Get a single content item for editing.
   */
  @Get('content/:id')
  async getContentById(
    @CurrentUser() user: User,
    @Param('id') id: string,
  ): Promise<AdminContentItemDto | null> {
    ensureAdmin(user);
    return this.adminService.getContentById(id);
  }

  /**
   * List all categories (admin view).
   */
  @Get('categories')
  async getCategories(@CurrentUser() user: User): Promise<AdminCategoryDto[]> {
    ensureAdmin(user);
    return this.adminService.getCategories();
  }

  /**
   * Create a new category.
   */
  @Post('categories')
  async createCategory(
    @CurrentUser() user: User,
    @Body() body: CreateAdminCategoryDto,
  ): Promise<AdminCategoryDto> {
    ensureAdmin(user);
    return this.adminService.createCategory(body);
  }

  /**
   * Delete an empty category.
   */
  @Delete('categories/:id')
  async deleteCategory(
    @CurrentUser() user: User,
    @Param('id') id: string,
  ): Promise<{ success: boolean }> {
    ensureAdmin(user);
    await this.adminService.deleteCategory(id);
    return { success: true };
  }

  /**
   * Update video metadata or publish state.
   */
  @Patch('content/:id')
  async updateContent(
    @CurrentUser() user: User,
    @Param('id') id: string,
    @Body() body: UpdateAdminVideoDto,
  ): Promise<AdminContentItemDto | null> {
    ensureAdmin(user);
    return this.adminService.updateVideo(id, body);
  }

  /**
   * Create a presigned upload URL for video or thumbnail.
   */
  @Post('uploads/presign')
  async presignUpload(
    @CurrentUser() user: User,
    @Body() body: PresignUploadDto,
  ): Promise<{
    uploadId: string;
    key: string;
    url: string;
    expiresAt: string;
    publicUrl?: string;
  }> {
    ensureAdmin(user);

    const { kind, fileName, contentType, sizeBytes, uploadId } = body;
    const isVideo = kind === 'video';
    const allowedTypes = isVideo ? VIDEO_TYPES : THUMBNAIL_TYPES;
    const maxBytes = isVideo ? MAX_VIDEO_BYTES : MAX_THUMBNAIL_BYTES;

    if (!allowedTypes.has(contentType)) {
      throw new BadRequestException('File type is not allowed');
    }
    if (sizeBytes > maxBytes) {
      throw new BadRequestException('File is too large');
    }

    const extFromName = getExtensionFromName(fileName);
    const extFromType = getExtensionForType(contentType);
    const ext = extFromName || extFromType;
    if (!ext) {
      throw new BadRequestException('File extension is missing or invalid');
    }

    const resolvedUploadId = uploadId?.trim() || randomUUID();
    const key = `uploads/${resolvedUploadId}/${kind}.${ext}`;
    const url = await this.r2Service.getSignedPutUrl(key, contentType);
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString();
    const publicUrl = this.r2Service.getPublicUrl(key) ?? undefined;

    return { uploadId: resolvedUploadId, key, url, expiresAt, publicUrl };
  }

  /**
   * Create a video record after uploads are completed.
   */
  @Post('content')
  async createContent(
    @CurrentUser() user: User,
    @Body() body: CreateAdminVideoDto,
  ): Promise<AdminContentItemDto> {
    ensureAdmin(user);
    return this.adminService.createVideo(body);
  }

  /**
   * List editable site pages (privacy, terms, etc.).
   */
  @Get('pages')
  async getPages(@CurrentUser() user: User): Promise<SitePageSummaryDto[]> {
    ensureAdmin(user);
    return this.siteService.listPages();
  }

  /**
   * Get a single site page by slug.
   */
  @Get('pages/:slug')
  async getPage(@CurrentUser() user: User, @Param('slug') slug: string): Promise<SitePageDto> {
    ensureAdmin(user);
    return this.siteService.getPage(slug);
  }

  /**
   * Update a site page.
   */
  @Patch('pages/:slug')
  async updatePage(
    @CurrentUser() user: User,
    @Param('slug') slug: string,
    @Body() body: UpdateSitePageDto,
  ): Promise<SitePageDto> {
    ensureAdmin(user);
    return this.siteService.upsertPage(slug, body.title, body.content);
  }

  /**
   * Offline download analytics: total downloads, active offline users, downloads per plan.
   */
  @Get('analytics/offline')
  async getOfflineAnalytics(@CurrentUser() user: User): Promise<OfflineAnalyticsDto> {
    ensureAdmin(user);
    return this.adminService.getOfflineAnalytics();
  }
}
