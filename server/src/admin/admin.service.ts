import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import type { DashboardStatsDto } from './dto/dashboard-stats.dto';
import type { AdminUserDto } from './dto/admin-user.dto';
import type { AdminContentItemDto } from './dto/admin-content.dto';
import type { CreateAdminContentDto } from './dto/create-admin-content.dto';
import type { CreateAdminSeasonDto } from './dto/create-admin-season.dto';
import type { CreateAdminEpisodeDto } from './dto/create-admin-episode.dto';
import type { CreateAdminTrailerDto } from './dto/create-admin-trailer.dto';
import type { AdminCategoryDto } from './dto/admin-category.dto';
import type { CreateAdminCategoryDto } from './dto/create-admin-category.dto';
import type { UpdateAdminContentDto } from './dto/update-admin-content.dto';
import type {
  AdminSubscriptionDto,
  AdminSubscriptionsResponseDto,
} from './dto/admin-subscription.dto';
import type { AdminPlanDto } from './dto/admin-plan.dto';
import type {
  AdminUsersAnalyticsDto,
  AdminContentAnalyticsDto,
  AdminRevenueAnalyticsDto,
  CategoryCountDto,
  TopEpisodeDto,
} from './dto/admin-analytics.dto';
import type { AdminSystemHealthDto, AdminSystemLogDto } from './dto/admin-system.dto';

const ContentType = {
  MOVIE: 'MOVIE',
  DOCUMENTARY: 'DOCUMENTARY',
  SERIES: 'SERIES',
  ANIMATION: 'ANIMATION',
  TRAILER: 'TRAILER',
  SHORT: 'SHORT',
} as const;

type ContentType = (typeof ContentType)[keyof typeof ContentType];

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

function toAdminContentItemDto(content: any): AdminContentItemDto {
  const duration =
    typeof content.duration === 'number' ? formatDurationSeconds(content.duration) : undefined;
  return {
    id: content.id,
    title: content.title,
    description: content.description ?? undefined,
    type: content.type,
    thumbnailUrl: content.thumbnailUrl,
    posterUrl: content.posterUrl ?? undefined,
    releaseYear: content.releaseYear,
    ageRating: content.ageRating,
    duration,
    trailerId: content.trailerId ?? undefined,
    category: content.category?.name ?? undefined,
    isPublished: content.isPublished,
    createdAt: content.createdAt.toISOString(),
    updatedAt: content.updatedAt?.toISOString(),
    seasons: content.seasons
      ? content.seasons.map((season: any) => ({
          id: season.id,
          seasonNumber: season.seasonNumber,
          title: season.title,
          episodeCount: season._count?.episodes ?? 0,
        }))
      : undefined,
    episodes: content.episodes
      ? content.episodes.map((episode: any) => ({
          id: episode.id,
          seasonId: episode.seasonId ?? undefined,
          episodeNumber: episode.episodeNumber,
          title: episode.title,
          duration: formatDurationSeconds(episode.duration),
        }))
      : undefined,
  };
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

function toAdminCategoryDto(category: {
  id: string;
  name: string;
  slug: string;
  createdAt: Date;
  updatedAt: Date;
}): AdminCategoryDto {
  return {
    id: category.id,
    name: category.name,
    slug: category.slug,
    createdAt: category.createdAt.toISOString(),
    updatedAt: category.updatedAt.toISOString(),
  };
}

function formatMoney(value: unknown): string {
  const num = typeof value === 'number' ? value : Number(value);
  if (!Number.isFinite(num)) return '0.00';
  return num.toFixed(2);
}

@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaService) {}

  async getDashboardStats(): Promise<DashboardStatsDto> {
    const now = new Date();
    const [totalUsers, totalContent, totalSubscribers, contentRows] = await Promise.all([
      this.prisma.user.count(),
      (this.prisma as any).content.count(),
      this.prisma.subscription.count({
        where: { status: 'ACTIVE', endDate: { gte: now } },
      }),
      (this.prisma as any).content.findMany({
        select: { category: { select: { name: true } } },
      }),
    ]);
    const categoryCounts = new Map<string, number>();
    for (const row of contentRows) {
      const name = row.category?.name ?? 'Uncategorized';
      categoryCounts.set(name, (categoryCounts.get(name) ?? 0) + 1);
    }
    const contentByCategory = Array.from(categoryCounts.entries())
      .map(([label, value]) => ({ label, value }))
      .sort((a, b) => b.value - a.value);
    return {
      totalUsers,
      totalContent,
      totalSubscribers,
      contentByCategory,
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
    const contentItems = await (this.prisma as any).content.findMany({
      include: {
        category: true,
        seasons: { include: { _count: { select: { episodes: true } } } },
        episodes: true,
      },
      orderBy: { createdAt: 'desc' },
    });
    return contentItems.map((content: any) => toAdminContentItemDto(content));
  }

  async getSubscriptions(page = 1, limit = 20): Promise<AdminSubscriptionsResponseDto> {
    const skip = (page - 1) * limit;
    const now = new Date();

    const [subscriptions, total, activeCount, cancelledCount, expiredCount, activeRevenueRows] =
      await Promise.all([
        this.prisma.subscription.findMany({
          skip,
          take: limit,
          orderBy: { createdAt: 'desc' },
          include: {
            user: { select: { id: true, email: true, name: true } },
            plan: { select: { id: true, name: true, price: true } },
          },
        }),
        this.prisma.subscription.count(),
        this.prisma.subscription.count({
          where: { status: 'ACTIVE', endDate: { gte: now } },
        }),
        this.prisma.subscription.count({ where: { status: 'CANCELLED' } }),
        this.prisma.subscription.count({ where: { status: 'EXPIRED' } }),
        this.prisma.subscription.findMany({
          where: { status: 'ACTIVE', endDate: { gte: now } },
          select: { plan: { select: { price: true } } },
        }),
      ]);

    const activeRevenue = activeRevenueRows.reduce((sum, row) => {
      const value = Number(row.plan.price);
      return Number.isFinite(value) ? sum + value : sum;
    }, 0);

    const items: AdminSubscriptionDto[] = subscriptions.map((sub) => ({
      id: sub.id,
      userId: sub.userId,
      userEmail: sub.user.email,
      userName: sub.user.name ?? undefined,
      planId: sub.plan.id,
      planName: sub.plan.name,
      planPrice: formatMoney(sub.plan.price),
      status: sub.status,
      startDate: sub.startDate.toISOString(),
      endDate: sub.endDate.toISOString(),
      createdAt: sub.createdAt.toISOString(),
      stripeSubscriptionId: sub.stripeSubscriptionId ?? undefined,
    }));

    return {
      total,
      subscriptions: items,
      summary: {
        totalCount: total,
        activeCount,
        cancelledCount,
        expiredCount,
        activeRevenue: formatMoney(activeRevenue),
      },
    };
  }

  async getContentById(id: string): Promise<AdminContentItemDto | null> {
    const content = await (this.prisma as any).content.findUnique({
      where: { id },
      include: {
        category: true,
        seasons: { include: { _count: { select: { episodes: true } } } },
        episodes: true,
      },
    });
    if (!content) return null;
    return toAdminContentItemDto(content);
  }

  async getCategories(): Promise<AdminCategoryDto[]> {
    const categories = await this.prisma.category.findMany({
      orderBy: { name: 'asc' },
    });
    return categories.map(toAdminCategoryDto);
  }

  private async resolveCategoryId(
    categoryId?: string,
    categoryName?: string,
  ): Promise<string | null> {
    const trimmedId = categoryId?.trim();
    if (trimmedId) return trimmedId;
    const name = categoryName?.trim();
    if (!name) return null;
    const slug = slugify(name) || 'uncategorized';
    const existing = await this.prisma.category.findUnique({ where: { slug } });
    if (existing) return existing.id;
    const created = await this.prisma.category.create({
      data: { name, slug },
    });
    return created.id;
  }

  async createCategory(dto: CreateAdminCategoryDto): Promise<AdminCategoryDto> {
    const name = dto.name.trim();
    const slug = slugify(name);
    if (!slug) {
      throw new BadRequestException('Category name is required');
    }

    const existing = await this.prisma.category.findUnique({ where: { slug } });
    if (existing) return toAdminCategoryDto(existing);

    const created = await this.prisma.category.create({
      data: { name, slug },
    });
    return toAdminCategoryDto(created);
  }

  async deleteCategory(id: string): Promise<void> {
    const usedCount = await (this.prisma as any).content.count({ where: { categoryId: id } });
    if (usedCount > 0) {
      throw new BadRequestException('Category has content and cannot be deleted');
    }
    await this.prisma.category.delete({ where: { id } });
  }
  async publishContent(id: string, isPublished: boolean): Promise<AdminContentItemDto | null> {
    const content = await (this.prisma as any).content.findUnique({
      where: { id },
      include: { category: true },
    });
    if (!content) return null;
    const updated = await (this.prisma as any).content.update({
      where: { id },
      data: { isPublished },
      include: { category: true },
    });
    return toAdminContentItemDto(updated);
  }

  async updateContent(id: string, dto: UpdateAdminContentDto): Promise<AdminContentItemDto | null> {
    const content = await (this.prisma as any).content.findUnique({
      where: { id },
      include: { category: true },
    });
    if (!content) return null;

    const data: {
      title?: string;
      description?: string | null;
      type?: ContentType;
      thumbnailUrl?: string;
      posterUrl?: string | null;
      releaseYear?: number;
      ageRating?: string;
      duration?: number | null;
      categoryId?: string | null;
    } = {};

    if (typeof dto.title === 'string') {
      const title = dto.title.trim();
      if (!title) throw new BadRequestException('Title is required');
      data.title = title;
    }

    if (typeof dto.description === 'string') {
      const desc = dto.description.trim();
      data.description = desc ? desc : null;
    }

    if (typeof dto.type === 'string') {
      data.type = dto.type as ContentType;
    }

    if (typeof dto.thumbnailKey === 'string') {
      data.thumbnailUrl = dto.thumbnailKey.trim();
    }

    if (typeof dto.posterKey === 'string') {
      const poster = dto.posterKey.trim();
      data.posterUrl = poster ? poster : null;
    }

    if (typeof dto.releaseYear === 'number') {
      data.releaseYear = dto.releaseYear;
    }

    if (typeof dto.ageRating === 'string') {
      const rating = dto.ageRating.trim();
      if (!rating) throw new BadRequestException('Age rating is required');
      data.ageRating = rating;
    }

    if (typeof dto.duration === 'string') {
      const seconds = parseDurationToSeconds(dto.duration);
      if (seconds <= 0) {
        throw new BadRequestException('Invalid duration format');
      }
      data.duration = seconds;
    }

    if (typeof dto.categoryId === 'string' || typeof dto.category === 'string') {
      data.categoryId = await this.resolveCategoryId(dto.categoryId, dto.category);
    }

    const updated = await (this.prisma as any).content.update({
      where: { id },
      data,
      include: { category: true },
    });

    return toAdminContentItemDto(updated);
  }

  async createContent(dto: CreateAdminContentDto): Promise<AdminContentItemDto> {
    const title = dto.title.trim();
    if (!title) throw new BadRequestException('Title is required');

    const thumbnailUrl = dto.thumbnailKey.trim();
    if (!thumbnailUrl) throw new BadRequestException('Thumbnail is required');

    const isSingle =
      dto.type === ContentType.MOVIE ||
      dto.type === ContentType.DOCUMENTARY ||
      dto.type === ContentType.SHORT;

    const wantsEpisode = typeof dto.videoKey === 'string' && dto.videoKey.trim().length > 0;
    const shouldCreateEpisode = isSingle || wantsEpisode;

    if (dto.type === ContentType.SERIES && wantsEpisode) {
      throw new BadRequestException('Episodes must be created separately for series content');
    }

    const seconds = dto.duration ? parseDurationToSeconds(dto.duration) : null;
    if (dto.duration && (!seconds || seconds <= 0)) {
      throw new BadRequestException('Invalid duration format');
    }
    if (shouldCreateEpisode && (!seconds || seconds <= 0)) {
      throw new BadRequestException('Duration is required for single-video content');
    }

    if (isSingle && !wantsEpisode) {
      throw new BadRequestException('Video key is required for single-video content');
    }

    const resolvedCategoryId = await this.resolveCategoryId(dto.categoryId, dto.category);

    const created = await this.prisma.$transaction(async (tx: any) => {
      const content = await tx.content.create({
        data: {
          title,
          description: dto.description?.trim() || null,
          type: dto.type,
          thumbnailUrl,
          posterUrl: dto.posterKey?.trim() || null,
          releaseYear: dto.releaseYear,
          ageRating: dto.ageRating.trim(),
          duration: seconds ?? null,
          categoryId: resolvedCategoryId,
          isPublished: dto.isPublished ?? false,
        },
      });

      if (shouldCreateEpisode) {
        await tx.episode.create({
          data: {
            contentId: content.id,
            seasonId: null,
            episodeNumber: 1,
            title,
            description: dto.description?.trim() || null,
            duration: seconds ?? 0,
            videoUrl: dto.videoKey!.trim(),
          },
        });
      }

      return content;
    });

    const full = await (this.prisma as any).content.findUnique({
      where: { id: created.id },
      include: { category: true, seasons: true, episodes: true },
    });
    if (!full) throw new BadRequestException('Failed to load created content');
    return toAdminContentItemDto(full);
  }

  async createTrailer(
    parentContentId: string,
    dto: CreateAdminTrailerDto,
  ): Promise<AdminContentItemDto | null> {
    const parent = await (this.prisma as any).content.findUnique({
      where: { id: parentContentId },
      select: { id: true, categoryId: true },
    });
    if (!parent) return null;

    const seconds = parseDurationToSeconds(dto.duration);
    if (seconds <= 0) {
      throw new BadRequestException('Invalid duration format');
    }

    const created = await this.prisma.$transaction(async (tx: any) => {
      const trailer = await tx.content.create({
        data: {
          title: dto.title.trim(),
          description: dto.description?.trim() || null,
          type: ContentType.TRAILER,
          thumbnailUrl: dto.thumbnailKey.trim(),
          posterUrl: dto.posterKey?.trim() || null,
          releaseYear: dto.releaseYear,
          ageRating: dto.ageRating.trim(),
          duration: seconds,
          categoryId: parent.categoryId ?? null,
          isPublished: dto.isPublished ?? false,
        },
      });

      await tx.episode.create({
        data: {
          contentId: trailer.id,
          seasonId: null,
          episodeNumber: 1,
          title: trailer.title,
          description: trailer.description,
          duration: seconds,
          videoUrl: dto.videoKey.trim(),
        },
      });

      await tx.content.update({
        where: { id: parentContentId },
        data: { trailerId: trailer.id },
      });

      return trailer;
    });

    const full = await (this.prisma as any).content.findUnique({
      where: { id: created.id },
      include: { category: true, seasons: true, episodes: true },
    });
    return full ? toAdminContentItemDto(full) : null;
  }

  async createSeason(dto: CreateAdminSeasonDto) {
    const content = await (this.prisma as any).content.findUnique({
      where: { id: dto.contentId },
      select: { id: true, type: true },
    });
    if (!content) {
      throw new BadRequestException('Content not found');
    }
    if (![ContentType.SERIES, ContentType.ANIMATION].includes(content.type)) {
      throw new BadRequestException('Seasons are only supported for series and episodic animation');
    }

    const existing = await (this.prisma as any).season.findFirst({
      where: { contentId: dto.contentId, seasonNumber: dto.seasonNumber },
      select: { id: true },
    });
    if (existing) {
      throw new BadRequestException('Season number already exists for this content');
    }
    return (this.prisma as any).season.create({
      data: {
        contentId: dto.contentId,
        seasonNumber: dto.seasonNumber,
        title: dto.title.trim(),
        description: dto.description?.trim() || null,
      },
    });
  }

  async createEpisode(dto: CreateAdminEpisodeDto) {
    const content = await (this.prisma as any).content.findUnique({
      where: { id: dto.contentId },
      select: { id: true, type: true },
    });
    if (!content) {
      throw new BadRequestException('Content not found');
    }

    const seasonId = dto.seasonId?.trim() || null;
    if (content.type === ContentType.SERIES && !seasonId) {
      throw new BadRequestException('Season is required for series episodes');
    }

    if (seasonId) {
      const season = await (this.prisma as any).season.findUnique({
        where: { id: seasonId },
        select: { id: true, contentId: true },
      });
      if (!season || season.contentId !== content.id) {
        throw new BadRequestException('Season does not belong to the content item');
      }
    }

    const singleTypes = [ContentType.MOVIE, ContentType.DOCUMENTARY, ContentType.SHORT];
    if (singleTypes.includes(content.type) && seasonId) {
      throw new BadRequestException('Single-video content cannot be assigned to a season');
    }

    if (
      (singleTypes.includes(content.type) || content.type === ContentType.ANIMATION) &&
      !seasonId
    ) {
      if (dto.episodeNumber !== 1) {
        throw new BadRequestException('Single-video content must use episode number 1');
      }
      const existing = await (this.prisma as any).episode.findFirst({
        where: { contentId: dto.contentId },
        select: { id: true },
      });
      if (existing) {
        throw new BadRequestException('Single-video content already has an episode');
      }
    }

    const seconds = parseDurationToSeconds(dto.duration);
    if (seconds <= 0) {
      throw new BadRequestException('Invalid duration format');
    }

    const existing = await (this.prisma as any).episode.findFirst({
      where: {
        contentId: dto.contentId,
        seasonId,
        episodeNumber: dto.episodeNumber,
      },
      select: { id: true },
    });
    if (existing) {
      throw new BadRequestException('Episode number already exists in this season');
    }

    return (this.prisma as any).episode.create({
      data: {
        contentId: dto.contentId,
        seasonId,
        episodeNumber: dto.episodeNumber,
        title: dto.title.trim(),
        description: dto.description?.trim() || null,
        duration: seconds,
        videoUrl: dto.videoKey.trim(),
      },
    });
  }

  async getPlans(): Promise<AdminPlanDto[]> {
    const now = new Date();
    const [plans, activeCounts] = await Promise.all([
      this.prisma.plan.findMany({ orderBy: { createdAt: 'desc' } }),
      this.prisma.subscription.groupBy({
        by: ['planId'],
        where: { status: 'ACTIVE', endDate: { gte: now } },
        _count: { _all: true },
      }),
    ]);

    const activeCountMap = new Map<string, number>();
    for (const row of activeCounts) {
      activeCountMap.set(row.planId, row._count._all);
    }

    return plans.map((plan) => ({
      id: plan.id,
      name: plan.name,
      price: formatMoney(plan.price),
      duration: plan.duration,
      deviceLimit: plan.deviceLimit,
      offlineAllowed: plan.offlineAllowed,
      maxOfflineDownloads: plan.maxOfflineDownloads,
      stripePriceId: plan.stripePriceId ?? undefined,
      activeSubscribers: activeCountMap.get(plan.id) ?? 0,
      createdAt: plan.createdAt.toISOString(),
      updatedAt: plan.updatedAt.toISOString(),
    }));
  }

  async getUsersAnalytics(): Promise<AdminUsersAnalyticsDto> {
    const now = new Date();
    const last30Days = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const last7Days = new Date(now.getTime() - 6 * 24 * 60 * 60 * 1000);

    const [totalUsers, newUsersLast30, recentUsers, activeUsers] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.user.count({ where: { createdAt: { gte: last30Days } } }),
      this.prisma.user.findMany({
        where: { createdAt: { gte: last7Days } },
        select: { createdAt: true },
      }),
      this.prisma.viewHistory
        .findMany({
          where: { watchedAt: { gte: last30Days } },
          select: { userId: true },
          distinct: ['userId'],
        })
        .then((rows) => rows.length),
    ]);

    const dayBuckets = new Map<string, number>();
    for (let i = 6; i >= 0; i -= 1) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const key = date.toISOString().slice(0, 10);
      dayBuckets.set(key, 0);
    }

    for (const user of recentUsers) {
      const key = user.createdAt.toISOString().slice(0, 10);
      dayBuckets.set(key, (dayBuckets.get(key) ?? 0) + 1);
    }

    const dailyNewUsers = Array.from(dayBuckets.entries()).map(([date, count]) => ({
      date,
      count,
    }));

    return {
      totalUsers,
      newUsersLast30Days: newUsersLast30,
      activeUsersLast30Days: activeUsers,
      dailyNewUsers,
    };
  }

  async getContentAnalytics(): Promise<AdminContentAnalyticsDto> {
    const now = new Date();
    const last30Days = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const [totalContent, publishedContent, totalViews, viewsLast30Days, categoryRows, topViews] =
      await Promise.all([
        (this.prisma as any).content.count(),
        (this.prisma as any).content.count({ where: { isPublished: true } }),
        this.prisma.viewHistory.count(),
        this.prisma.viewHistory.count({ where: { watchedAt: { gte: last30Days } } }),
        (this.prisma as any).content.findMany({
          select: { category: { select: { name: true } } },
        }),
        (this.prisma as any).viewHistory.groupBy({
          by: ['episodeId'],
          _count: { episodeId: true },
          orderBy: { _count: { episodeId: 'desc' } },
          take: 5,
        }),
      ]);

    const categoryCounts = new Map<string, number>();
    for (const row of categoryRows) {
      const name = row.category?.name ?? 'Uncategorized';
      categoryCounts.set(name, (categoryCounts.get(name) ?? 0) + 1);
    }
    const contentByCategory: CategoryCountDto[] = Array.from(categoryCounts.entries())
      .map(([label, value]) => ({ label, value }))
      .sort((a, b) => b.value - a.value);

    const topEpisodeIds = topViews.map((row: { episodeId: string }) => row.episodeId);
    const episodeTitles = await (this.prisma as any).episode.findMany({
      where: { id: { in: topEpisodeIds } },
      select: { id: true, title: true },
    });
    const titleMap = new Map(
      episodeTitles.map((episode: { id: string; title: string }) => [episode.id, episode.title]),
    );

    const topEpisodes: TopEpisodeDto[] = topViews.map(
      (row: { episodeId: string; _count?: { episodeId?: number } }) => ({
        episodeId: row.episodeId,
        title: titleMap.get(row.episodeId) ?? 'Untitled',
        views: row._count?.episodeId ?? 0,
      }),
    );

    return {
      totalContent,
      publishedContent,
      unpublishedContent: Math.max(0, totalContent - publishedContent),
      totalViews,
      viewsLast30Days,
      topEpisodes,
      contentByCategory,
    };
  }

  async getRevenueAnalytics(): Promise<AdminRevenueAnalyticsDto> {
    const now = new Date();
    const [activeSubs, cancelledCount, expiredCount] = await Promise.all([
      this.prisma.subscription.findMany({
        where: { status: 'ACTIVE', endDate: { gte: now } },
        include: { plan: true },
      }),
      this.prisma.subscription.count({ where: { status: 'CANCELLED' } }),
      this.prisma.subscription.count({ where: { status: 'EXPIRED' } }),
    ]);

    const revenueByPlanMap = new Map<
      string,
      { planId: string; planName: string; activeCount: number; revenue: number }
    >();

    let activeRevenue = 0;
    for (const sub of activeSubs) {
      const price = Number(sub.plan.price);
      const numericPrice = Number.isFinite(price) ? price : 0;
      activeRevenue += numericPrice;
      const current = revenueByPlanMap.get(sub.planId) ?? {
        planId: sub.planId,
        planName: sub.plan.name,
        activeCount: 0,
        revenue: 0,
      };
      current.activeCount += 1;
      current.revenue += numericPrice;
      revenueByPlanMap.set(sub.planId, current);
    }

    return {
      activeRevenue: formatMoney(activeRevenue),
      activeSubscriptions: activeSubs.length,
      cancelledSubscriptions: cancelledCount,
      expiredSubscriptions: expiredCount,
      revenueByPlan: Array.from(revenueByPlanMap.values()).map((row) => ({
        planId: row.planId,
        planName: row.planName,
        activeCount: row.activeCount,
        revenue: formatMoney(row.revenue),
      })),
    };
  }

  async getSystemHealth(): Promise<AdminSystemHealthDto> {
    const checkedAt = new Date().toISOString();
    try {
      const [users, content, episodes, subscriptions, downloads] = await Promise.all([
        this.prisma.user.count(),
        (this.prisma as any).content.count(),
        (this.prisma as any).episode.count(),
        this.prisma.subscription.count(),
        this.prisma.download.count(),
      ]);
      return {
        ok: true,
        database: true,
        checkedAt,
        counts: { users, content, episodes, subscriptions, downloads },
      };
    } catch (error) {
      return {
        ok: false,
        database: false,
        checkedAt,
        counts: { users: 0, content: 0, episodes: 0, subscriptions: 0, downloads: 0 },
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  async getSystemLogs(): Promise<AdminSystemLogDto[]> {
    const [users, contentItems, subscriptions] = await Promise.all([
      this.prisma.user.findMany({
        orderBy: { createdAt: 'desc' },
        take: 6,
        select: { id: true, email: true, createdAt: true },
      }),
      (this.prisma as any).content.findMany({
        orderBy: { createdAt: 'desc' },
        take: 6,
        select: { id: true, title: true, createdAt: true },
      }),
      this.prisma.subscription.findMany({
        orderBy: { createdAt: 'desc' },
        take: 6,
        include: {
          user: { select: { email: true } },
          plan: { select: { name: true } },
        },
      }),
    ]);

    const logs: AdminSystemLogDto[] = [
      ...users.map((user: { id: string; email: string; createdAt: Date }) => ({
        id: `user-${user.id}`,
        type: 'user' as const,
        message: `User ${user.email} signed up.`,
        createdAt: user.createdAt.toISOString(),
      })),
      ...contentItems.map((content: { id: string; title: string; createdAt: Date }) => ({
        id: `content-${content.id}`,
        type: 'content' as const,
        message: `Content "${content.title}" created.`,
        createdAt: content.createdAt.toISOString(),
      })),
      ...subscriptions.map(
        (sub: {
          id: string;
          status: string;
          user: { email: string };
          plan: { name: string };
          createdAt: Date;
        }) => ({
          id: `subscription-${sub.id}`,
          type: 'subscription' as const,
          message: `Subscription ${sub.status} for ${sub.user.email} (${sub.plan.name}).`,
          createdAt: sub.createdAt.toISOString(),
        }),
      ),
    ];

    return logs.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1)).slice(0, 20);
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
