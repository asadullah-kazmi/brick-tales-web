import { IsEmail, IsString, MinLength } from 'class-validator';

export class SignupSubscriptionIntentDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(1, { message: 'Name is required' })
  name: string;

  @IsString()
  @MinLength(1, { message: 'planId is required' })
  planId: string;

  @IsString()
  @MinLength(1, { message: 'paymentMethodId is required' })
  paymentMethodId: string;
}
