import {
  IsBoolean,
  IsInt,
  IsNumberString,
  IsOptional,
  IsString,
  Min,
  MinLength,
} from 'class-validator';

export class CreateAdminPlanDto {
  @IsString()
  @MinLength(1)
  name: string;

  @IsNumberString()
  price: string;

  @IsString()
  @MinLength(1)
  duration: string;

  @IsInt()
  @Min(0)
  deviceLimit: number;

  @IsBoolean()
  offlineAllowed: boolean;

  @IsInt()
  @Min(0)
  maxOfflineDownloads: number;

  @IsOptional()
  @IsString()
  stripePriceId?: string;
}
