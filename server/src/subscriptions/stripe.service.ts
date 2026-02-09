import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import Stripe from 'stripe';
import { PrismaService } from '../prisma/prisma.service';

type SubscriptionStatus = 'ACTIVE' | 'CANCELLED' | 'EXPIRED';

type StripeSubscription = Stripe.Subscription & {
  current_period_start: number;
  current_period_end: number;
};

@Injectable()
export class StripeService {
  private stripe: Stripe | null = null;

  constructor(private readonly prisma: PrismaService) {}

  private getStripe(): Stripe {
    if (!this.stripe) {
      const key = process.env.STRIPE_SECRET_KEY;
      if (!key) {
        throw new BadRequestException('Stripe is not configured (STRIPE_SECRET_KEY)');
      }
      this.stripe = new Stripe(key);
    }
    return this.stripe;
  }

  /**
   * Create a Stripe customer + subscription for signup using a PaymentMethod ID.
   * Uses payment_behavior=error_if_incomplete to ensure payment succeeds.
   */
  async createSubscriptionForSignup(params: {
    planId: string;
    customerEmail: string;
    customerName?: string | null;
    paymentMethodId: string;
  }): Promise<{
    customerId: string;
    subscription: StripeSubscription;
  }> {
    const { planId, customerEmail, customerName, paymentMethodId } = params;
    const plan = await (this.prisma as any).plan.findUnique({ where: { id: planId } });
    if (!plan) throw new NotFoundException('Plan not found');
    if (!plan.stripePriceId) {
      throw new BadRequestException(
        `Plan "${plan.name}" is not linked to a Stripe Price. Add stripePriceId in the database.`,
      );
    }

    const stripe = this.getStripe();
    const customer = await stripe.customers.create({
      email: customerEmail,
      name: customerName ?? undefined,
    });

    await stripe.paymentMethods.attach(paymentMethodId, {
      customer: customer.id,
    });
    await stripe.customers.update(customer.id, {
      invoice_settings: { default_payment_method: paymentMethodId },
    });

    const subscription = (await stripe.subscriptions.create({
      customer: customer.id,
      items: [{ price: plan.stripePriceId, quantity: 1 }],
      payment_behavior: 'error_if_incomplete',
      expand: ['latest_invoice.payment_intent'],
    })) as StripeSubscription;

    return { customerId: customer.id, subscription };
  }

  async cancelSubscription(subscriptionId: string): Promise<void> {
    const stripe = this.getStripe();
    await stripe.subscriptions.del(subscriptionId);
  }

  /**
   * Get or create Stripe customer for user.
   */
  async getOrCreateStripeCustomer(
    userId: string,
    email: string,
    name?: string | null,
  ): Promise<string> {
    const user = await (this.prisma as any).user.findUnique({
      where: { id: userId },
      select: { stripeCustomerId: true },
    });
    if (!user) throw new NotFoundException('User not found');
    if (user.stripeCustomerId) return user.stripeCustomerId;

    const stripe = this.getStripe();
    const customer = await stripe.customers.create({
      email,
      name: name ?? undefined,
      metadata: { userId },
    });
    await (this.prisma as any).user.update({
      where: { id: userId },
      data: { stripeCustomerId: customer.id },
    });
    return customer.id;
  }

  /**
   * Create Checkout Session for subscription. Plan must have stripePriceId set.
   */
  async createCheckoutSession(
    userId: string,
    planId: string,
    successUrl: string,
    cancelUrl: string,
    userEmail: string,
    userName?: string | null,
  ): Promise<{ url: string }> {
    const plan = await (this.prisma as any).plan.findUnique({ where: { id: planId } });
    if (!plan) throw new NotFoundException('Plan not found');
    if (!plan.stripePriceId) {
      throw new BadRequestException(
        `Plan "${plan.name}" is not linked to a Stripe Price. Add stripePriceId in the database.`,
      );
    }

    const customerId = await this.getOrCreateStripeCustomer(userId, userEmail, userName);
    const stripe = this.getStripe();

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      line_items: [{ price: plan.stripePriceId, quantity: 1 }],
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: { userId, planId },
      subscription_data: {
        metadata: { userId, planId },
      },
    });

    const url = session.url;
    if (!url) throw new BadRequestException('Failed to create checkout session');
    return { url };
  }

  /**
   * Create Customer Portal session for managing subscription.
   */
  async createPortalSession(userId: string, returnUrl: string): Promise<{ url: string }> {
    const user = await (this.prisma as any).user.findUnique({
      where: { id: userId },
      select: { stripeCustomerId: true },
    });
    if (!user?.stripeCustomerId) {
      throw new BadRequestException('No Stripe customer linked. Subscribe first.');
    }

    const stripe = this.getStripe();
    const session = await stripe.billingPortal.sessions.create({
      customer: user.stripeCustomerId,
      return_url: returnUrl,
    });
    return { url: session.url };
  }

  /**
   * Revoke offline access for a user: set all their downloads to REVOKED.
   */
  async revokeOfflineAccess(userId: string): Promise<number> {
    const result = await (this.prisma as any).download.updateMany({
      where: { userId },
      data: { status: 'REVOKED' },
    });
    return result.count;
  }

  /**
   * Sync our Subscription from Stripe subscription object. Create or update record.
   * Returns our Subscription record and whether offline was revoked (subscription ended).
   */
  async syncSubscriptionFromStripe(stripeSubscription: Stripe.Subscription): Promise<{
    subscriptionId: string;
    userId: string;
    revokedOffline: boolean;
  }> {
    const stripeSubId = stripeSubscription.id;
    const userId = stripeSubscription.metadata?.userId as string | undefined;
    const planId = stripeSubscription.metadata?.planId as string | undefined;

    if (!userId || !planId) {
      throw new BadRequestException('Stripe subscription missing metadata userId/planId');
    }

    const plan = await (this.prisma as any).plan.findUnique({ where: { id: planId } });
    if (!plan) throw new BadRequestException('Plan not found');

    const sub = stripeSubscription as StripeSubscription;
    const startDate = new Date(sub.current_period_start * 1000);
    const endDate = new Date(sub.current_period_end * 1000);
    const isActive =
      stripeSubscription.status === 'active' || stripeSubscription.status === 'trialing';

    const status: SubscriptionStatus = isActive
      ? 'ACTIVE'
      : stripeSubscription.status === 'canceled' || stripeSubscription.cancel_at_period_end
        ? 'CANCELLED'
        : 'EXPIRED';

    const existing = await (this.prisma as any).subscription.findUnique({
      where: { stripeSubscriptionId: stripeSubId },
    });

    let revokedOffline = false;
    if (existing) {
      const wasActive = existing.status === 'ACTIVE';
      await (this.prisma as any).subscription.update({
        where: { id: existing.id },
        data: { status, startDate, endDate },
      });
      if (wasActive && !isActive) {
        await this.revokeOfflineAccess(userId);
        revokedOffline = true;
      }
      return { subscriptionId: existing.id, userId, revokedOffline };
    }

    if (!isActive) {
      await this.revokeOfflineAccess(userId);
      revokedOffline = true;
    }

    const created = await (this.prisma as any).subscription.create({
      data: {
        userId,
        planId,
        stripeSubscriptionId: stripeSubId,
        status,
        startDate,
        endDate,
      },
    });
    return { subscriptionId: created.id, userId, revokedOffline };
  }

  /**
   * Handle Stripe webhook event. Verify signature with STRIPE_WEBHOOK_SECRET.
   */
  async handleWebhookEvent(rawBody: Buffer, signature: string): Promise<void> {
    const secret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!secret) {
      throw new BadRequestException('STRIPE_WEBHOOK_SECRET is not set');
    }

    const stripe = this.getStripe();
    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(rawBody, signature, secret);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Invalid signature';
      throw new BadRequestException(`Webhook signature verification failed: ${message}`);
    }

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        if (session.mode !== 'subscription' || !session.subscription) break;
        const subscription = await stripe.subscriptions.retrieve(session.subscription as string, {
          expand: [],
        });
        await this.syncSubscriptionFromStripe(subscription);
        break;
      }
      case 'customer.subscription.updated': {
        const sub = event.data.object as StripeSubscription;
        await this.syncSubscriptionFromStripe(sub);
        break;
      }
      case 'customer.subscription.deleted': {
        const subscription = event.data.object as StripeSubscription;
        const stripeSubId = subscription.id;
        const existing = await (this.prisma as any).subscription.findUnique({
          where: { stripeSubscriptionId: stripeSubId },
          select: { id: true, userId: true },
        });
        if (existing) {
          await (this.prisma as any).subscription.update({
            where: { id: existing.id },
            data: { status: 'EXPIRED', endDate: new Date() },
          });
          await this.revokeOfflineAccess(existing.userId);
        }
        break;
      }
      default:
        // Ignore other events
        break;
    }
  }
}
