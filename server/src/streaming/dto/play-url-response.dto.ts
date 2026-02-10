export class PlayUrlResponseDto {
  playUrl: string;
  expiresAt: Date;
  type?: 'hls' | 'mp4' | 'dash';
}
