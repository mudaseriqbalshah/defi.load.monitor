import Stripe from "stripe";
import { prisma } from "@/lib/db";
import type { SubscriptionTier } from "@prisma/client";

function getStripeClient() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    throw new Error("STRIPE_SECRET_KEY is not set");
  }
  return new Stripe(key, {
    apiVersion: "2025-02-24.acacia",
    typescript: true,
  });
}

let _stripe: Stripe | undefined;
export const stripe = new Proxy({} as Stripe, {
  get(_target, prop) {
    if (!_stripe) _stripe = getStripeClient();
    return (_stripe as unknown as Record<string | symbol, unknown>)[prop];
  },
});

// ─── Pricing ─────────────────────────────────────────────────────

export const PLAN_CONFIG: Record<
  Exclude<SubscriptionTier, "FREE">,
  { name: string; priceMonthly: number; stripePriceId: string }
> = {
  PRO: {
    name: "Pro",
    priceMonthly: 29,
    stripePriceId: process.env.STRIPE_PRICE_PRO ?? "",
  },
  ANALYST: {
    name: "Analyst",
    priceMonthly: 59,
    stripePriceId: process.env.STRIPE_PRICE_ANALYST ?? "",
  },
  WHALE: {
    name: "Whale",
    priceMonthly: 99,
    stripePriceId: process.env.STRIPE_PRICE_WHALE ?? "",
  },
};

// ─── Customer management ─────────────────────────────────────────

export async function getOrCreateStripeCustomer(
  userId: string,
  email?: string | null,
  walletAddress?: string | null
): Promise<string> {
  const subscription = await prisma.subscription.findUnique({
    where: { userId },
  });

  if (subscription?.stripeCustomerId) {
    return subscription.stripeCustomerId;
  }

  const customer = await stripe.customers.create({
    email: email ?? undefined,
    metadata: {
      userId,
      walletAddress: walletAddress ?? "",
    },
  });

  await prisma.subscription.upsert({
    where: { userId },
    create: {
      userId,
      stripeCustomerId: customer.id,
      tier: "FREE",
      status: "ACTIVE",
    },
    update: {
      stripeCustomerId: customer.id,
    },
  });

  return customer.id;
}

// ─── Checkout ────────────────────────────────────────────────────

export async function createCheckoutSession(
  userId: string,
  tier: Exclude<SubscriptionTier, "FREE">,
  email?: string | null,
  walletAddress?: string | null
): Promise<string> {
  const plan = PLAN_CONFIG[tier];
  if (!plan.stripePriceId) {
    throw new Error(`Stripe price not configured for ${tier}`);
  }

  const customerId = await getOrCreateStripeCustomer(
    userId,
    email,
    walletAddress
  );

  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: "subscription",
    line_items: [{ price: plan.stripePriceId, quantity: 1 }],
    success_url: `${process.env.NEXTAUTH_URL}/settings/billing?success=true`,
    cancel_url: `${process.env.NEXTAUTH_URL}/settings/billing?canceled=true`,
    metadata: { userId, tier },
    subscription_data: {
      metadata: { userId, tier },
    },
  });

  return session.url!;
}

// ─── Customer portal ─────────────────────────────────────────────

export async function createPortalSession(userId: string): Promise<string> {
  const subscription = await prisma.subscription.findUnique({
    where: { userId },
  });

  if (!subscription?.stripeCustomerId) {
    throw new Error("No Stripe customer found");
  }

  const session = await stripe.billingPortal.sessions.create({
    customer: subscription.stripeCustomerId,
    return_url: `${process.env.NEXTAUTH_URL}/settings/billing`,
  });

  return session.url;
}

// ─── Webhook handlers ────────────────────────────────────────────

export async function handleSubscriptionCreated(
  subscription: Stripe.Subscription
) {
  const userId = subscription.metadata.userId;
  const tier = subscription.metadata.tier as SubscriptionTier;
  if (!userId) return;

  await prisma.subscription.update({
    where: { userId },
    data: {
      tier,
      status: "ACTIVE",
      paymentMethod: "STRIPE",
      stripeSubscriptionId: subscription.id,
      stripePriceId: subscription.items.data[0]?.price.id,
      currentPeriodStart: new Date(subscription.current_period_start * 1000),
      currentPeriodEnd: new Date(subscription.current_period_end * 1000),
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
    },
  });
}

export async function handleSubscriptionUpdated(
  subscription: Stripe.Subscription
) {
  const userId = subscription.metadata.userId;
  if (!userId) return;

  const tierFromPrice = Object.entries(PLAN_CONFIG).find(
    ([, config]) =>
      config.stripePriceId === subscription.items.data[0]?.price.id
  );

  await prisma.subscription.update({
    where: { userId },
    data: {
      tier: tierFromPrice
        ? (tierFromPrice[0] as SubscriptionTier)
        : undefined,
      status: subscription.status === "active" ? "ACTIVE" : "PAST_DUE",
      currentPeriodStart: new Date(subscription.current_period_start * 1000),
      currentPeriodEnd: new Date(subscription.current_period_end * 1000),
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
    },
  });
}

export async function handleSubscriptionDeleted(
  subscription: Stripe.Subscription
) {
  const userId = subscription.metadata.userId;
  if (!userId) return;

  await prisma.subscription.update({
    where: { userId },
    data: {
      tier: "FREE",
      status: "CANCELED",
      stripeSubscriptionId: null,
      stripePriceId: null,
      currentPeriodEnd: null,
      cancelAtPeriodEnd: false,
    },
  });
}

export async function handleInvoicePaid(invoice: Stripe.Invoice) {
  const subscriptionId =
    typeof invoice.subscription === "string"
      ? invoice.subscription
      : invoice.subscription?.id;
  if (!subscriptionId) return;

  const sub = await prisma.subscription.findFirst({
    where: { stripeSubscriptionId: subscriptionId },
  });

  if (sub) {
    await prisma.subscription.update({
      where: { id: sub.id },
      data: { status: "ACTIVE" },
    });
  }
}

export async function handleInvoicePaymentFailed(invoice: Stripe.Invoice) {
  const subscriptionId =
    typeof invoice.subscription === "string"
      ? invoice.subscription
      : invoice.subscription?.id;
  if (!subscriptionId) return;

  const sub = await prisma.subscription.findFirst({
    where: { stripeSubscriptionId: subscriptionId },
  });

  if (sub) {
    await prisma.subscription.update({
      where: { id: sub.id },
      data: { status: "PAST_DUE" },
    });
  }
}
