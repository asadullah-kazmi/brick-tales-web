import {
  getMockDashboardStats,
  getMockVideosByCategory,
} from "@/lib/mock-analytics";
import type { MockDashboardStats } from "@/lib/mock-analytics";

export type CategoryCountDto = { label: string; value: number };

/**
 * Analytics service (admin). Use this instead of calling mock-analytics directly.
 * Switch to real API (GET /analytics/dashboard, etc.) when USE_MOCK_API is false.
 */
export const analyticsService = {
  async getDashboardStats(): Promise<MockDashboardStats> {
    return getMockDashboardStats();
  },

  async getVideosByCategory(): Promise<CategoryCountDto[]> {
    return getMockVideosByCategory().map((d) => ({
      label: d.category,
      value: d.count,
    }));
  },
};
