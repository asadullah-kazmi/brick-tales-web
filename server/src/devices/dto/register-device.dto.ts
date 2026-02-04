import { IsEnum, IsString, MinLength } from 'class-validator';
import { Platform } from '@prisma/client';

export class RegisterDeviceDto {
  @IsEnum(Platform, {
    message: 'platform must be ANDROID or IOS',
  })
  platform: Platform;

  @IsString()
  @MinLength(1, { message: 'deviceIdentifier is required' })
  deviceIdentifier: string;
}
