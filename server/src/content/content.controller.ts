import { Controller, Get, Param, Query } from '@nestjs/common';
import { Public } from '../auth/decorators/public.decorator';
import { ContentService } from './content.service';
import type { VideoListResponseDto } from './dto/video-list-response.dto';
import type { VideoDetailResponseDto } from './dto/video-detail-response.dto';
import type { CategoriesResponseDto } from './dto/categories-response.dto';

@Controller('content')
export class ContentController {
  constructor(private readonly contentService: ContentService) {}

  @Public()
  @Get('videos')
  async getVideos(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ): Promise<VideoListResponseDto> {
    const pageNum = Math.max(1, parseInt(String(page || '1'), 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(String(limit || '24'), 10) || 24));
    return this.contentService.getVideos(pageNum, limitNum);
  }

  @Public()
  @Get('videos/:id')
  async getVideoById(@Param('id') id: string): Promise<VideoDetailResponseDto | null> {
    return this.contentService.getVideoById(id);
  }

  @Public()
  @Get('categories')
  async getCategories(): Promise<CategoriesResponseDto> {
    return this.contentService.getCategories();
  }
}
