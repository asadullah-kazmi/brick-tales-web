/**
 * API contract types for content (videos, catalog, admin).
 * Backend-ready for NestJS (e.g. ContentModule, VideosModule, admin guards).
 */

/** Pagination query params (GET list endpoints). */
export interface PaginationQueryDto {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

/** Pagination meta in list responses. */
export interface PaginationMetaDto {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

/** Video as returned by the API (public catalog). */
export interface VideoDto {
  id: string;
  title: string;
  duration: string;
  thumbnailUrl: string | null;
  description?: string;
  category?: string;
  published: boolean;
  /** ISO date string. */
  publishedAt?: string;
  /** ISO date string. */
  createdAt: string;
  /** ISO date string. */
  updatedAt?: string;
}

/** Response for GET /content/videos (catalog list). */
export interface VideoListResponseDto {
  videos: VideoDto[];
  meta: PaginationMetaDto;
}

/** Response for GET /content/videos/:id */
export interface VideoDetailResponseDto {
  video: VideoDto;
}

/** Request body for POST /content/videos (upload metadata / create). */
export interface CreateVideoRequestDto {
  title: string;
  duration: string;
  description?: string;
  category?: string;
}

/** Request body for POST /admin/uploads/presign */
export interface PresignUploadRequestDto {
  kind: "video" | "thumbnail";
  fileName: string;
  contentType: string;
  sizeBytes: number;
  uploadId?: string;
}

/** Response for POST /admin/uploads/presign */
export interface PresignUploadResponseDto {
  uploadId: string;
  key: string;
  url: string;
  expiresAt: string;
}

/** Request body for POST /admin/content */
export interface CreateAdminVideoRequestDto {
  title: string;
  duration: string;
  description?: string;
  category?: string;
  videoKey: string;
  thumbnailKey: string;
  published?: boolean;
}

/** Response for POST /content/videos */
export interface CreateVideoResponseDto {
  video: VideoDto;
}

/** Request body for PATCH /content/videos/:id */
export interface UpdateVideoRequestDto {
  title?: string;
  duration?: string;
  description?: string;
  category?: string;
  published?: boolean;
}

/** Response for PATCH /content/videos/:id */
export interface UpdateVideoResponseDto {
  video: VideoDto;
}

/** Request body for PATCH /content/videos/:id/publish (or dedicated publish endpoint). */
export interface PublishVideoRequestDto {
  published: boolean;
}

/** Response for PATCH /content/videos/:id/publish */
export interface PublishVideoResponseDto {
  video: VideoDto;
}

/** Response for DELETE /content/videos/:id */
export interface DeleteVideoResponseDto {
  success: boolean;
}
