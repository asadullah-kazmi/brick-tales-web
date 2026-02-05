import { IsBoolean, IsOptional, IsString, MinLength } from 'class-validator';

export class CreateAdminVideoDto {
  @IsString()
  @MinLength(1)
  title: string;

  @IsString()
  @MinLength(1)
  duration: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  category?: string;

  @IsString()
  @MinLength(1)
  videoKey: string;

  @IsString()
  @MinLength(1)
  thumbnailKey: string;

  @IsOptional()
  @IsBoolean()
  published?: boolean;
}
