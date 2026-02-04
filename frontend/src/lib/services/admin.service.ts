import { get, patch, ApiError } from "@/lib/api-client";
import { getStoredAuth } from "@/lib/auth-storage";

/** Dashboard stats from GET /admin/stats */
export interface DashboardStatsDto {
  totalUsers: number;
  totalVideos: number;
  totalSubscribers: number;
  usersTrend?: string;
  videosTrend?: string;
  subscribersTrend?: string;
  videosByCategory: { label: string; value: number }[];
}

/** User row from GET /admin/users */
export interface AdminUserDto {
  id: string;
  email: string;
  name: string | null;
  role: string;
  createdAt: string;
}

/** Content item from GET /admin/content */
export interface AdminContentItemDto {
  id: string;
  title: string;
  duration: string;
  description?: string;
  category?: string;
  published: boolean;
  publishedAt?: string;
  createdAt: string;
}

function authHeaders(): Record<string, string> {
  const auth = getStoredAuth();
  if (!auth?.accessToken) return {};
  return { Authorization: `Bearer ${auth.accessToken}` };
}

/**
 * Admin API service. All endpoints require admin role and valid JWT.
 * Use from admin dashboard only (user must be logged in as admin).
 */
export const adminService = {
  async getStats(): Promise<DashboardStatsDto> {
    const headers = authHeaders();
    if (!headers.Authorization) throw new ApiError("Not authenticated", 401);
    return get<DashboardStatsDto>("admin/stats", { headers });
  },

  async getUsers(
    page = 1,
    limit = 20
  ): Promise<{ users: AdminUserDto[]; total: number }> {
    const headers = authHeaders();
    if (!headers.Authorization) throw new ApiError("Not authenticated", 401);
    return get<{ users: AdminUserDto[]; total: number }>("admin/users", {
      params: { page: String(page), limit: String(limit) },
      headers,
    });
  },

  async getContent(): Promise<AdminContentItemDto[]> {
    const headers = authHeaders();
    if (!headers.Authorization) throw new ApiError("Not authenticated", 401);
    return get<AdminContentItemDto[]>("admin/content", { headers });
  },

  async updateVideoPublish(
    id: string,
    published: boolean
  ): Promise<AdminContentItemDto | null> {
    const headers = authHeaders();
    if (!headers.Authorization) throw new ApiError("Not authenticated", 401);
    try {
      return await patch<AdminContentItemDto>(
        `admin/content/${id}`,
        { published },
        { headers }
      );
    } catch {
      return null;
    }
  },
};
