import type {
  GetSubscriptionResponseDto,
  PublicPlanDto,
  SubscribeRequestDto,
  SubscribeResponseDto,
  UpdateSubscriptionRequestDto,
  UpdateSubscriptionResponseDto,
} from "@/types/api";
import { get } from "@/lib/api-client";
import { getStoredAuth } from "@/lib/auth-storage";
import { getMockSubscription, setMockSubscription } from "@/lib/mock-auth";
import { USE_MOCK_API } from "./config";
import { SUBSCRIPTION_PLANS } from "@/lib/subscription-plans";

/**
 * Subscription service. Uses real API (GET /subscriptions/me) when USE_MOCK_API is false.
 */
export const subscriptionService = {
  async getPlans(): Promise<PublicPlanDto[]> {
    if (!USE_MOCK_API) {
      return get<PublicPlanDto[]>("subscriptions/plans");
    }
    try {
      return await get<PublicPlanDto[]>("subscriptions/plans");
    } catch {
      return SUBSCRIPTION_PLANS.map((plan) => ({
        id: plan.id,
        name: plan.name,
        price: Number(plan.price),
        duration: plan.period.toUpperCase(),
        deviceLimit:
          plan.benefits.find((item) => item.label === "Multi-device")?.value ===
          "Up to 6 devices"
            ? 6
            : plan.benefits.find((item) => item.label === "Multi-device")
                  ?.value === "Up to 4 devices"
              ? 4
              : 1,
        offlineAllowed: plan.benefits.some(
          (item) => item.label === "Downloads" && item.value === true,
        ),
        maxOfflineDownloads: plan.benefits.some(
          (item) => item.label === "Downloads" && item.value === true,
        )
          ? 10
          : 0,
        isPopular: plan.featured ?? false,
        perks:
          plan.benefits
            .filter((item) => item.label === "Perks")
            .map((item) => String(item.value)) ?? [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }));
    }
  },
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
