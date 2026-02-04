import { Body, Controller, ForbiddenException, Get, Param, Patch, Query } from '@nestjs/common';
import type { User } from '@prisma/client';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { AdminService } from './admin.service';
import type { OfflineAnalyticsDto } from './admin.service';
import type { DashboardStatsDto } from './dto/dashboard-stats.dto';
import type { AdminUserDto } from './dto/admin-user.dto';
import type { AdminContentItemDto } from './dto/admin-content.dto';

function ensureAdmin(user: User): void {
  if (user.role !== 'admin') {
    throw new ForbiddenException('Admin access required');
  }
}

@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

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
   * Update video publish state.
   */
  @Patch('content/:id')
  async updateContentPublish(
    @CurrentUser() user: User,
    @Param('id') id: string,
    @Body() body: { published: boolean },
  ): Promise<AdminContentItemDto | null> {
    ensureAdmin(user);
    return this.adminService.updateVideoPublish(id, body.published);
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
