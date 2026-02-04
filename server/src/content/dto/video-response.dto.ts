/**
 * Video as returned by public content API (catalog).
 * Matches frontend VideoDto: duration as display string (e.g. "12:34").
 */
export class VideoResponseDto {
  id: string;
  title: string;
  duration: string;
  thumbnailUrl: string | null;
  description?: string;
  category?: string;
  published: boolean;
  publishedAt?: string;
  createdAt: string;
  updatedAt?: string;
}
