import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import type { DashboardStatsDto } from './dto/dashboard-stats.dto';
import type { AdminUserDto } from './dto/admin-user.dto';
import type { AdminContentItemDto } from './dto/admin-content.dto';
import type { CreateAdminVideoDto } from './dto/create-admin-video.dto';

export interface DownloadsPerPlanDto {
  planId: string;
  planName: string;
  downloadCount: number;
  activeSubscriptionCount: number;
}

export interface OfflineAnalyticsDto {
  totalOfflineDownloads: number;
  activeOfflineDownloads: number;
  activeOfflineUsers: number;
  downloadsPerPlan: DownloadsPerPlanDto[];
}

function formatDurationSeconds(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  return `${m}:${String(s).padStart(2, '0')}`;
}

function parseDurationToSeconds(duration: string): number {
  const parts = duration
    .trim()
    .split(':')
    .map((p) => Number(p));
  if (parts.some((n) => Number.isNaN(n) || n < 0)) return -1;
  if (parts.length === 3) {
    const [h, m, s] = parts;
    return h * 3600 + m * 60 + s;
  }
  if (parts.length === 2) {
    const [m, s] = parts;
    return m * 60 + s;
  }
  return -1;
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaService) {}

  async getDashboardStats(): Promise<DashboardStatsDto> {
    const now = new Date();
    const [totalUsers, totalVideos, totalSubscribers, videos] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.video.count(),
      this.prisma.subscription.count({
        where: { status: 'ACTIVE', endDate: { gte: now } },
      }),
      this.prisma.video.findMany({
        select: { category: { select: { name: true } } },
      }),
    ]);
    const categoryCounts = new Map<string, number>();
    for (const v of videos) {
      const name = v.category.name;
      categoryCounts.set(name, (categoryCounts.get(name) ?? 0) + 1);
    }
    const videosByCategory = Array.from(categoryCounts.entries())
      .map(([label, value]) => ({ label, value }))
      .sort((a, b) => b.value - a.value);
    return {
      totalUsers,
      totalVideos,
      totalSubscribers,
      videosByCategory,
    };
  }

  async getUsers(page = 1, limit = 20): Promise<{ users: AdminUserDto[]; total: number }> {
    const skip = (page - 1) * limit;
    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: { id: true, email: true, name: true, role: true, createdAt: true },
      }),
      this.prisma.user.count(),
    ]);
    return {
      users: users.map((u) => ({
        id: u.id,
        email: u.email,
        name: u.name,
        role: u.role,
        createdAt: u.createdAt.toISOString(),
      })),
      total,
    };
  }

  async getContentList(): Promise<AdminContentItemDto[]> {
    const videos = await this.prisma.video.findMany({
      include: { category: true },
      orderBy: { createdAt: 'desc' },
    });
    return videos.map((v) => ({
      id: v.id,
      title: v.title,
      duration: formatDurationSeconds(v.duration),
      description: v.description ?? undefined,
      category: v.category.name,
      published: !!v.publishedAt,
      publishedAt: v.publishedAt?.toISOString(),
      createdAt: v.createdAt.toISOString(),
    }));
  }

  async updateVideoPublish(id: string, published: boolean): Promise<AdminContentItemDto | null> {
    const video = await this.prisma.video.findUnique({
      where: { id },
      include: { category: true },
    });
    if (!video) return null;
    const updated = await this.prisma.video.update({
      where: { id },
      data: { publishedAt: published ? new Date() : null },
      include: { category: true },
    });
    return {
      id: updated.id,
      title: updated.title,
      duration: formatDurationSeconds(updated.duration),
      description: updated.description ?? undefined,
      category: updated.category.name,
      published: !!updated.publishedAt,
      publishedAt: updated.publishedAt?.toISOString(),
      createdAt: updated.createdAt.toISOString(),
    };
  }

  async createVideo(dto: CreateAdminVideoDto): Promise<AdminContentItemDto> {
    const seconds = parseDurationToSeconds(dto.duration);
    if (seconds <= 0) {
      throw new BadRequestException('Invalid duration format');
    }

    const categoryName = dto.category?.trim() || 'Uncategorized';
    const slug = slugify(categoryName) || 'uncategorized';

    const category = await this.prisma.category.findUnique({ where: { slug } });
    const categoryId = category
      ? category.id
      : (
          await this.prisma.category.create({
            data: { name: categoryName, slug },
          })
        ).id;

    const video = await this.prisma.video.create({
      data: {
        title: dto.title.trim(),
        description: dto.description?.trim() || null,
        duration: seconds,
        categoryId,
        streamUrl: dto.videoKey,
        thumbnailUrl: dto.thumbnailKey,
        publishedAt: dto.published ? new Date() : null,
      },
      include: { category: true },
    });

    return {
      id: video.id,
      title: video.title,
      duration: formatDurationSeconds(video.duration),
      description: video.description ?? undefined,
      category: video.category.name,
      published: !!video.publishedAt,
      publishedAt: video.publishedAt?.toISOString(),
      createdAt: video.createdAt.toISOString(),
    };
  }

  /**
   * Analytics for offline downloads: total downloads, active offline users, downloads per plan.
   */
  async getOfflineAnalytics(): Promise<OfflineAnalyticsDto> {
    const now = new Date();
    const db = this.prisma as any;

    const [totalOfflineDownloads, activeOfflineDownloads, activeOfflineUserIds, plansWithSubs] =
      await Promise.all([
        db.download.count(),
        db.download.count({
          where: {
            status: { in: ['AUTHORIZED', 'DOWNLOADED'] },
            expiresAt: { gt: now },
          },
        }),
        db.download
          .findMany({
            where: {
              status: { in: ['AUTHORIZED', 'DOWNLOADED'] },
              expiresAt: { gt: now },
            },
            select: { userId: true },
            distinct: ['userId'],
          })
          .then((rows: { userId: string }[]) => rows.map((r) => r.userId)),
        db.plan.findMany({
          select: { id: true, name: true },
          orderBy: { name: 'asc' },
        }),
      ]);

    const activeOfflineUsers = activeOfflineUserIds.length;

    const downloadsPerPlan: DownloadsPerPlanDto[] = await Promise.all(
      plansWithSubs.map(async (plan: { id: string; name: string }) => {
        const userIdsWithThisPlan = await db.subscription
          .findMany({
            where: {
              planId: plan.id,
              status: 'ACTIVE',
              endDate: { gte: now },
            },
            select: { userId: true },
            distinct: ['userId'],
          })
          .then((rows: { userId: string }[]) => rows.map((r) => r.userId));

        const activeSubscriptionCount = userIdsWithThisPlan.length;

        const downloadCount =
          userIdsWithThisPlan.length === 0
            ? 0
            : await db.download.count({
                where: {
                  userId: { in: userIdsWithThisPlan },
                  status: { in: ['AUTHORIZED', 'DOWNLOADED'] },
                  expiresAt: { gt: now },
                },
              });

        return {
          planId: plan.id,
          planName: plan.name,
          downloadCount,
          activeSubscriptionCount,
        };
      }),
    );

    return {
      totalOfflineDownloads,
      activeOfflineDownloads,
      activeOfflineUsers,
      downloadsPerPlan,
    };
  }
}
