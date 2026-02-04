export class DashboardStatsDto {
  totalUsers: number;
  totalVideos: number;
  totalSubscribers: number;
  usersTrend?: string;
  videosTrend?: string;
  subscribersTrend?: string;
  videosByCategory: { label: string; value: number }[];
}
