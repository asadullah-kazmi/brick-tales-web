/**
 * API contract types for subscriptions.
 * Backend-ready for NestJS (e.g. SubscriptionsModule, Stripe/webhook integration).
 */

/** Subscription plan identifier. */
export type PlanId = "free" | "monthly" | "yearly";

/** Subscription status as returned by the API. */
export interface SubscriptionStatusDto {
  isSubscribed: boolean;
  planId?: PlanId;
  /** ISO date string; when the current period ends. */
  currentPeriodEnd?: string;
  /** ISO date string; when the subscription was created. */
  createdAt?: string;
}

/** Request body for POST /subscriptions (subscribe). */
export interface SubscribeRequestDto {
  planId: PlanId;
  /** Optional payment method or session id from payment provider. */
  paymentMethodId?: string;
}

/** Response for POST /subscriptions */
export interface SubscribeResponseDto {
  subscription: SubscriptionStatusDto;
  /** Optional client secret for payment confirmation. */
  clientSecret?: string;
}

/** Response for GET /subscriptions/me */
export type GetSubscriptionResponseDto = SubscriptionStatusDto;

/** Request body for PATCH /subscriptions/me (e.g. cancel, change plan). */
export interface UpdateSubscriptionRequestDto {
  planId?: PlanId;
  cancelAtPeriodEnd?: boolean;
}

/** Response for PATCH /subscriptions/me */
export interface UpdateSubscriptionResponseDto {
  subscription: SubscriptionStatusDto;
}
