import { Controller, Get } from '@nestjs/common';
import { AdminService } from './admin.service';
import type { OfflineAnalyticsDto } from './admin.service';

@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  /**
   * Offline download analytics: total downloads, active offline users, downloads per plan.
   */
  @Get('analytics/offline')
  async getOfflineAnalytics(): Promise<OfflineAnalyticsDto> {
    return this.adminService.getOfflineAnalytics();
  }
}
