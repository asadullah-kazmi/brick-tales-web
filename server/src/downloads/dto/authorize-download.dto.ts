import { IsString, MinLength } from 'class-validator';

export class AuthorizeDownloadDto {
  @IsString()
  @MinLength(1, { message: 'videoId is required' })
  videoId: string;

  @IsString()
  @MinLength(1, { message: 'deviceId is required' })
  deviceId: string;
}
