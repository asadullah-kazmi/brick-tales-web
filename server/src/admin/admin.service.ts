import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

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

@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaService) {}

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
