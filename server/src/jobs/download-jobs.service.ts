import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DownloadJobsService {
  private readonly logger = new Logger(DownloadJobsService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Expire offline downloads whose expiresAt has passed.
   * Updates status from AUTHORIZED or DOWNLOADED to EXPIRED.
   */
  @Cron(CronExpression.EVERY_HOUR)
  async expireDownloads(): Promise<void> {
    try {
      const now = new Date();
      const result = await (this.prisma as any).download.updateMany({
        where: {
          status: { in: ['AUTHORIZED', 'DOWNLOADED'] },
          expiresAt: { lt: now },
        },
        data: { status: 'EXPIRED' },
      });
      if (result.count > 0) {
        this.logger.log(`Expired ${result.count} download(s) past expiry date`);
      }
    } catch (err) {
      this.logger.error('expireDownloads job failed', err instanceof Error ? err.stack : err);
    }
  }

  /**
   * Revoke downloads for users who no longer have an active subscription.
   * Updates status from AUTHORIZED or DOWNLOADED to REVOKED.
   */
  @Cron(CronExpression.EVERY_HOUR)
  async revokeDownloadsForInactiveSubscriptions(): Promise<void> {
    try {
      const now = new Date();

      const activeSubscriptionUserIds = await (this.prisma as any).subscription
        .findMany({
          where: {
            status: 'ACTIVE',
            endDate: { gte: now },
          },
          select: { userId: true },
          distinct: ['userId'],
        })
        .then((rows: { userId: string }[]) => rows.map((r) => r.userId));

      const toRevoke = await (this.prisma as any).download.findMany({
        where: {
          status: { in: ['AUTHORIZED', 'DOWNLOADED'] },
          userId: { notIn: activeSubscriptionUserIds },
        },
        select: { id: true },
      });

      if (toRevoke.length === 0) return;

      const ids = toRevoke.map((d: { id: string }) => d.id);
      const result = await (this.prisma as any).download.updateMany({
        where: { id: { in: ids } },
        data: { status: 'REVOKED' },
      });
      this.logger.log(`Revoked ${result.count} download(s) for users with inactive subscription`);
    } catch (err) {
      this.logger.error(
        'revokeDownloadsForInactiveSubscriptions job failed',
        err instanceof Error ? err.stack : err,
      );
    }
  }
}
