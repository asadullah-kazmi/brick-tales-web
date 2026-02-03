import type {
  GetSubscriptionResponseDto,
  SubscribeRequestDto,
  SubscribeResponseDto,
  UpdateSubscriptionRequestDto,
  UpdateSubscriptionResponseDto,
} from "@/types/api";
import { getMockSubscription, setMockSubscription } from "@/lib/mock-auth";

/**
 * Subscription service. Use this instead of calling mock-auth subscription helpers.
 * Switch to real API (e.g. POST /subscriptions) when USE_MOCK_API is false.
 */
export const subscriptionService = {
  async getSubscription(): Promise<GetSubscriptionResponseDto> {
    const isSubscribed = getMockSubscription();
    return {
      isSubscribed,
      planId: isSubscribed ? "monthly" : "free",
    };
  },

  async subscribe(body: SubscribeRequestDto): Promise<SubscribeResponseDto> {
    void body; // reserved for real API (plan selection, etc.)
    setMockSubscription(true);
    return {
      subscription: {
        isSubscribed: true,
        planId: "monthly",
        createdAt: new Date().toISOString(),
      },
    };
  },

  async updateSubscription(
    body: UpdateSubscriptionRequestDto,
  ): Promise<UpdateSubscriptionResponseDto> {
    void body; // reserved for real API
    const isSubscribed = getMockSubscription();
    return {
      subscription: {
        isSubscribed,
        planId: isSubscribed ? "monthly" : "free",
      },
    };
  },

  /** Local helper to set subscribed state (used by AuthContext / SubscriptionPrompt). */
  setSubscribed(subscribed: boolean): void {
    setMockSubscription(subscribed);
  },

  /** Local helper to read subscribed state from storage (used by AuthContext). */
  getSubscribed(): boolean {
    return getMockSubscription();
  },
};
