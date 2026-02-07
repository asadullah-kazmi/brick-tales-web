export interface AdminPlanDto {
  id: string;
  name: string;
  price: string;
  duration: string;
  deviceLimit: number;
  offlineAllowed: boolean;
  maxOfflineDownloads: number;
  stripePriceId?: string;
  activeSubscribers: number;
  createdAt: string;
  updatedAt: string;
}

export interface AdminUserDto {
  id: string;
  email: string;
  name: string | null;
  role: string;
  createdAt: string;
}

export interface InviteAdminUserRequestDto {
  email: string;
  name?: string;
  role: "SUPER_ADMIN" | "CONTENT_MANAGER" | "CUSTOMER_SUPPORT";
}

export interface UpdateAdminUserRoleRequestDto {
  role: "SUPER_ADMIN" | "CONTENT_MANAGER" | "CUSTOMER_SUPPORT";
}

export interface CreateAdminPlanRequestDto {
  name: string;
  price: string;
  duration: string;
  deviceLimit: number;
  offlineAllowed: boolean;
  maxOfflineDownloads: number;
  stripePriceId?: string;
}

export interface UpdateAdminPlanRequestDto {
  name?: string;
  price?: string;
  duration?: string;
  deviceLimit?: number;
  offlineAllowed?: boolean;
  maxOfflineDownloads?: number;
  stripePriceId?: string;
}

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

export interface CategoryCountDto {
  label: string;
  value: number;
}

export interface TopEpisodeDto {
  episodeId: string;
  title: string;
  views: number;
}

export interface AdminContentAnalyticsDto {
  totalContent: number;
  publishedContent: number;
  unpublishedContent: number;
  totalViews: number;
  viewsLast30Days: number;
  topEpisodes: TopEpisodeDto[];
  contentByCategory: CategoryCountDto[];
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

export interface AdminSystemHealthDto {
  ok: boolean;
  database: boolean;
  checkedAt: string;
  counts: {
    users: number;
    content: number;
    episodes: number;
    subscriptions: number;
    downloads: number;
  };
  error?: string;
}

export interface AdminSystemLogDto {
  id: string;
  type: "user" | "content" | "subscription";
  message: string;
  createdAt: string;
}
