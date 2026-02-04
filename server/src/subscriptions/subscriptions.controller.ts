import { Controller, Get, Param } from '@nestjs/common';
import { Public } from '../auth/decorators/public.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { User } from '@prisma/client';
import { SubscriptionsService } from './subscriptions.service';
import { PlanResponseDto } from './dto/plan-response.dto';

@Controller('subscriptions')
export class SubscriptionsController {
  constructor(private readonly subscriptionsService: SubscriptionsService) {}

  /**
   * Public: list all subscription plans (includes offlineAllowed, maxOfflineDownloads).
   */
  @Public()
  @Get('plans')
  async listPlans(): Promise<PlanResponseDto[]> {
    return this.subscriptionsService.findAllPlans();
  }

  /**
   * Public: get a single plan by id.
   */
  @Public()
  @Get('plans/:id')
  async getPlan(@Param('id') id: string): Promise<PlanResponseDto> {
    return this.subscriptionsService.findPlanById(id);
  }

  /**
   * Authenticated: get current user's active subscription (with plan).
   */
  @Get('me')
  async getMySubscription(@CurrentUser() user: User) {
    return this.subscriptionsService.getCurrentSubscription(user.id);
  }
}
