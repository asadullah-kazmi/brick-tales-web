import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import type { VideoResponseDto } from './dto/video-response.dto';
import type { VideoListResponseDto } from './dto/video-list-response.dto';
import type { VideoDetailResponseDto } from './dto/video-detail-response.dto';
import type { CategoriesResponseDto } from './dto/categories-response.dto';

/** Convert seconds to "M:SS" or "H:MM:SS" for API. */
function formatDurationSeconds(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  if (h > 0) {
    return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  }
  return `${m}:${String(s).padStart(2, '0')}`;
}

@Injectable()
export class ContentService {
  constructor(private readonly prisma: PrismaService) {}

  async getVideos(page = 1, limit = 24): Promise<VideoListResponseDto> {
    const skip = (page - 1) * limit;
    const [videos, total] = await Promise.all([
      this.prisma.video.findMany({
        where: { publishedAt: { not: null } },
        include: { category: true },
        orderBy: { publishedAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.video.count({ where: { publishedAt: { not: null } } }),
    ]);
    const totalPages = Math.max(1, Math.ceil(total / limit));
    return {
      videos: videos.map((v) => this.toVideoDto(v)),
      meta: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    };
  }

  async getVideoById(id: string): Promise<VideoDetailResponseDto | null> {
    const video = await this.prisma.video.findUnique({
      where: { id },
      include: { category: true },
    });
    if (!video) return null;
    if (!video.publishedAt) return null;
    return { video: this.toVideoDto(video) };
  }

  async getCategories(): Promise<CategoriesResponseDto> {
    const videos = await this.prisma.video.findMany({
      where: { publishedAt: { not: null } },
      select: { category: { select: { name: true } } },
    });
    const set = new Set(videos.map((v) => v.category.name).filter(Boolean));
    const categories = ['All', ...Array.from(set).sort()];
    return { categories };
  }

  private toVideoDto(v: {
    id: string;
    title: string;
    duration: number;
    thumbnailUrl: string | null;
    description: string | null;
    publishedAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
    category: { name: string };
  }): VideoResponseDto {
    return {
      id: v.id,
      title: v.title,
      duration: formatDurationSeconds(v.duration),
      thumbnailUrl: v.thumbnailUrl,
      description: v.description ?? undefined,
      category: v.category.name,
      published: !!v.publishedAt,
      publishedAt: v.publishedAt?.toISOString(),
      createdAt: v.createdAt.toISOString(),
      updatedAt: v.updatedAt.toISOString(),
    };
  }
}
