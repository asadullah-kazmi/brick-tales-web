import type {
  GetSubscriptionResponseDto,
  SubscribeRequestDto,
  SubscribeResponseDto,
  UpdateSubscriptionRequestDto,
  UpdateSubscriptionResponseDto,
} from "@/types/api";
import { get } from "@/lib/api-client";
import { getStoredAuth } from "@/lib/auth-storage";
import { getMockSubscription, setMockSubscription } from "@/lib/mock-auth";
import { USE_MOCK_API } from "./config";

/**
 * Subscription service. Uses real API (GET /subscriptions/me) when USE_MOCK_API is false.
 */
export const subscriptionService = {
  async getSubscription(): Promise<GetSubscriptionResponseDto> {
    if (USE_MOCK_API) {
      const isSubscribed = getMockSubscription();
      return {
        isSubscribed,
        planId: isSubscribed ? "monthly" : "free",
      };
    }
    const auth = getStoredAuth();
    if (!auth?.accessToken) {
      return { isSubscribed: false };
    }
    try {
      const res = await get<GetSubscriptionResponseDto>("subscriptions/me", {
        headers: { Authorization: `Bearer ${auth.accessToken}` },
      });
      return res ?? { isSubscribed: false };
    } catch {
      return { isSubscribed: false };
    }
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
    body: UpdateSubscriptionRequestDto
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
