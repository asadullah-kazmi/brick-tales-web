import { del, get, patch, post, ApiError } from "@/lib/api-client";
import { getStoredAuth } from "@/lib/auth-storage";
import { authService } from "@/lib/services/auth.service";
import type {
  PresignUploadRequestDto,
  PresignUploadResponseDto,
  CreateAdminVideoRequestDto,
  UpdateAdminVideoRequestDto,
  AdminCategoryDto,
  CreateAdminCategoryRequestDto,
  SitePageDto,
  SitePageSummaryDto,
  UpdateSitePageRequestDto,
} from "@/types/api";

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

async function withAuthRetry<T>(
  request: (headers: Record<string, string>) => Promise<T>,
): Promise<T> {
  const headers = authHeaders();
  if (!headers.Authorization) throw new ApiError("Not authenticated", 401);
  try {
    return await request(headers);
  } catch (err) {
    if (err instanceof ApiError && err.status === 401) {
      await authService.getSession();
      const refreshed = authHeaders();
      if (!refreshed.Authorization)
        throw new ApiError("Not authenticated", 401);
      return request(refreshed);
    }
    throw err;
  }
}

/**
 * Admin API service. All endpoints require admin role and valid JWT.
 * Use from admin dashboard only (user must be logged in as admin).
 */
export const adminService = {
  async getStats(): Promise<DashboardStatsDto> {
    return withAuthRetry((headers) =>
      get<DashboardStatsDto>("admin/stats", { headers }),
    );
  },

  async getUsers(
    page = 1,
    limit = 20,
  ): Promise<{ users: AdminUserDto[]; total: number }> {
    return withAuthRetry((headers) =>
      get<{ users: AdminUserDto[]; total: number }>("admin/users", {
        params: { page: String(page), limit: String(limit) },
        headers,
      }),
    );
  },

  async getContent(): Promise<AdminContentItemDto[]> {
    return withAuthRetry((headers) =>
      get<AdminContentItemDto[]>("admin/content", { headers }),
    );
  },

  async getContentItem(id: string): Promise<AdminContentItemDto | null> {
    try {
      return await withAuthRetry((headers) =>
        get<AdminContentItemDto>(`admin/content/${id}`, { headers }),
      );
    } catch {
      return null;
    }
  },

  async updateVideoPublish(
    id: string,
    published: boolean,
  ): Promise<AdminContentItemDto | null> {
    try {
      return await withAuthRetry((headers) =>
        patch<AdminContentItemDto>(
          `admin/content/${id}`,
          { published },
          { headers },
        ),
      );
    } catch {
      return null;
    }
  },

  async updateVideo(
    id: string,
    body: UpdateAdminVideoRequestDto,
  ): Promise<AdminContentItemDto | null> {
    try {
      return await withAuthRetry((headers) =>
        patch<AdminContentItemDto>(`admin/content/${id}`, body, { headers }),
      );
    } catch {
      return null;
    }
  },

  async presignUpload(
    body: PresignUploadRequestDto,
  ): Promise<PresignUploadResponseDto> {
    return withAuthRetry((headers) =>
      post<PresignUploadResponseDto>("admin/uploads/presign", body, {
        headers,
      }),
    );
  },

  async createVideo(
    body: CreateAdminVideoRequestDto,
  ): Promise<AdminContentItemDto> {
    return withAuthRetry((headers) =>
      post<AdminContentItemDto>("admin/content", body, { headers }),
    );
  },

  async getCategories(): Promise<AdminCategoryDto[]> {
    return withAuthRetry((headers) =>
      get<AdminCategoryDto[]>("admin/categories", { headers }),
    );
  },

  async createCategory(
    body: CreateAdminCategoryRequestDto,
  ): Promise<AdminCategoryDto> {
    return withAuthRetry((headers) =>
      post<AdminCategoryDto>("admin/categories", body, { headers }),
    );
  },

  async deleteCategory(id: string): Promise<void> {
    return withAuthRetry((headers) =>
      del<void>(`admin/categories/${id}`, { headers }),
    );
  },

  async getSitePages(): Promise<SitePageSummaryDto[]> {
    return withAuthRetry((headers) =>
      get<SitePageSummaryDto[]>("admin/pages", { headers }),
    );
  },

  async getSitePage(slug: string): Promise<SitePageDto> {
    return withAuthRetry((headers) =>
      get<SitePageDto>(`admin/pages/${slug}`, { headers }),
    );
  },

  async updateSitePage(
    slug: string,
    body: UpdateSitePageRequestDto,
  ): Promise<SitePageDto> {
    return withAuthRetry((headers) =>
      patch<SitePageDto>(`admin/pages/${slug}`, body, { headers }),
    );
  },
};
