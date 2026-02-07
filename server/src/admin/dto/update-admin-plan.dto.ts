import {
  IsBoolean,
  IsInt,
  IsNumberString,
  IsOptional,
  IsString,
  Min,
  MinLength,
} from 'class-validator';

export class UpdateAdminPlanDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  name?: string;

  @IsOptional()
  @IsNumberString()
  price?: string;

  @IsOptional()
  @IsString()
  @MinLength(1)
  duration?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  deviceLimit?: number;

  @IsOptional()
  @IsBoolean()
  offlineAllowed?: boolean;

  @IsOptional()
  @IsInt()
  @Min(0)
  maxOfflineDownloads?: number;

  @IsOptional()
  @IsString()
  stripePriceId?: string;
}
