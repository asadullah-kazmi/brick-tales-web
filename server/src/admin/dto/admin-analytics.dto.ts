export interface DailyCountDto {
  date: string;
  count: number;
}

export interface AdminUsersAnalyticsDto {
  totalUsers: number;
  newUsersLast30Days: number;
  activeUsersLast30Days: number;
  dailyNewUsers: DailyCountDto[];
}

export interface TopVideoDto {
  videoId: string;
  title: string;
  views: number;
}

export interface CategoryCountDto {
  label: string;
  value: number;
}

export interface AdminContentAnalyticsDto {
  totalVideos: number;
  publishedVideos: number;
  unpublishedVideos: number;
  totalViews: number;
  viewsLast30Days: number;
  topVideos: TopVideoDto[];
  videosByCategory: CategoryCountDto[];
}

export interface RevenueByPlanDto {
  planId: string;
  planName: string;
  activeCount: number;
  revenue: string;
}

export interface AdminRevenueAnalyticsDto {
  activeRevenue: string;
  activeSubscriptions: number;
  cancelledSubscriptions: number;
  expiredSubscriptions: number;
  revenueByPlan: RevenueByPlanDto[];
}
