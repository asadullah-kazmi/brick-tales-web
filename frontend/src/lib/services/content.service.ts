import type {
  PaginationQueryDto,
  VideoListResponseDto,
  VideoDetailResponseDto,
  VideoDto,
  CreateVideoRequestDto,
  CreateVideoResponseDto,
  UpdateVideoRequestDto,
  UpdateVideoResponseDto,
  PublishVideoRequestDto,
  PublishVideoResponseDto,
} from "@/types/api";
import { mockVideos } from "@/lib/mock-videos";
import {
  getAdminVideos,
  createAdminVideo,
  updateAdminVideo as updateAdminVideoStorage,
} from "@/lib/mock-admin-content";
import type { Video } from "@/types";
import type { AdminVideo } from "@/types";

function videoToDto(v: Video | AdminVideo, published = true): VideoDto {
  const created = "createdAt" in v ? v.createdAt : new Date().toISOString();
  return {
    id: v.id,
    title: v.title,
    duration: v.duration,
    thumbnailUrl: "thumbnailUrl" in v ? v.thumbnailUrl ?? null : null,
    description: v.description,
    category: v.category,
    published: "published" in v ? v.published : published,
    publishedAt: "publishedAt" in v ? v.publishedAt : undefined,
    createdAt: created,
    updatedAt: created,
  };
}

function paginate<T>(
  items: T[],
  page = 1,
  limit = 20,
): { items: T[]; total: number; totalPages: number } {
  const total = items.length;
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const start = (page - 1) * limit;
  const itemsSlice = items.slice(start, start + limit);
  return { items: itemsSlice, total, totalPages };
}

/**
 * Content service. Use this instead of calling mock-videos or mock-admin-content directly.
 * Switch to real API (GET/POST/PATCH /content/videos) when USE_MOCK_API is false.
 */
export const contentService = {
  /**
   * List videos (catalog). Mock: merges mockVideos with admin content; real API: GET /content/videos.
   */
  async getVideos(params?: PaginationQueryDto): Promise<VideoListResponseDto> {
    const page = params?.page ?? 1;
    const limit = params?.limit ?? 24;
    const adminVideos = getAdminVideos();
    const catalog: VideoDto[] = [
      ...mockVideos.map((v) =>
        videoToDto(
          { ...v, id: v.id, createdAt: new Date().toISOString() },
          true,
        ),
      ),
      ...adminVideos.map((v) => videoToDto(v)),
    ];
    const { items, total, totalPages } = paginate(catalog, page, limit);
    return {
      videos: items,
      meta: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    };
  },

  /**
   * Get videos for browse (mock: catalog + published admin videos). For filtering, filter client-side or add query params when using real API.
   */
  getVideosForBrowse(): VideoDto[] {
    const adminVideos = getAdminVideos().filter((v) => v.published);
    const fromCatalog = mockVideos.map((v) =>
      videoToDto({ ...v, id: v.id, createdAt: new Date().toISOString() }, true),
    );
    const fromAdmin = adminVideos.map((v) => videoToDto(v));
    return [...fromCatalog, ...fromAdmin];
  },

  /** Unique categories from catalog (for browse filters). */
  getCategories(): string[] {
    const videos = this.getVideosForBrowse();
    const set = new Set(
      videos.map((v) => v.category).filter((c): c is string => !!c),
    );
    return ["All", ...Array.from(set).sort()];
  },

  /**
   * Get single video. Mock: lookup in mockVideos then admin; real API: GET /content/videos/:id.
   */
  async getVideoById(id: string): Promise<VideoDetailResponseDto | null> {
    const admin = getAdminVideos();
    const fromAdmin = admin.find((v) => v.id === id);
    if (fromAdmin) {
      return { video: videoToDto(fromAdmin) };
    }
    const fromCatalog = mockVideos.find((v) => v.id === id);
    if (fromCatalog) {
      return {
        video: videoToDto(
          { ...fromCatalog, createdAt: new Date().toISOString() },
          true,
        ),
      };
    }
    return null;
  },

  /**
   * Create video (metadata). Mock: createAdminVideo; real API: POST /content/videos.
   */
  async createVideo(
    body: CreateVideoRequestDto,
  ): Promise<CreateVideoResponseDto> {
    const video = createAdminVideo(body);
    return { video: videoToDto(video) };
  },

  /**
   * Update video. Mock: updateAdminVideoStorage; real API: PATCH /content/videos/:id.
   */
  async updateVideo(
    id: string,
    body: UpdateVideoRequestDto,
  ): Promise<UpdateVideoResponseDto | null> {
    const updated = updateAdminVideoStorage(id, body);
    if (!updated) return null;
    return { video: videoToDto(updated) };
  },

  /**
   * Publish/unpublish. Mock: updateAdminVideoStorage; real API: PATCH /content/videos/:id/publish.
   */
  async publishVideo(
    id: string,
    body: PublishVideoRequestDto,
  ): Promise<PublishVideoResponseDto | null> {
    const updated = updateAdminVideoStorage(id, {
      published: body.published,
    });
    if (!updated) return null;
    return { video: videoToDto(updated) };
  },

  /** Admin: get raw list (for admin content list). Mock: getAdminVideos. */
  getAdminVideoList(): AdminVideo[] {
    return getAdminVideos();
  },
};
