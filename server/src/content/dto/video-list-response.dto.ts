import { VideoResponseDto } from './video-response.dto';

export class PaginationMetaDto {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export class VideoListResponseDto {
  videos: VideoResponseDto[];
  meta: PaginationMetaDto;
}
