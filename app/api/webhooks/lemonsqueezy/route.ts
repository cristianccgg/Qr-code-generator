import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import {
  verifyWebhookSignature,
  variantIdToPlanId,
  variantIdToBillingCycle,
  type LemonSqueezyWebhookEvent,
} from '@/lib/lemonsqueezy';

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get('x-signature') || '';

    // Verify webhook signature
    if (!verifyWebhookSignature(rawBody, signature)) {
      console.error('Invalid webhook signature');
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    const event: LemonSqueezyWebhookEvent = JSON.parse(rawBody);
    const eventName = event.meta.event_name;

    console.log(`[Webhook] Received event: ${eventName}`);

    // Handle different event types
    switch (eventName) {
      case 'subscription_created':
        await handleSubscriptionCreated(event);
        break;

      case 'subscription_updated':
        await handleSubscriptionUpdated(event);
        break;

      case 'subscription_cancelled':
        await handleSubscriptionCancelled(event);
        break;

      case 'subscription_resumed':
        await handleSubscriptionResumed(event);
        break;

      case 'subscription_expired':
        await handleSubscriptionExpired(event);
        break;

      case 'subscription_payment_success':
        await handlePaymentSuccess(event);
        break;

      case 'subscription_payment_failed':
        await handlePaymentFailed(event);
        break;

      default:
        console.log(`[Webhook] Unhandled event type: ${eventName}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('[Webhook] Error processing webhook:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}

async function handleSubscriptionCreated(event: LemonSqueezyWebhookEvent) {
  const { data, meta } = event;
  const userId = meta.custom_data?.user_id;

  if (!userId) {
    console.error('[Webhook] No user_id in custom_data');
    return;
  }

  const variantId = String(data.attributes.variant_id);
  const planId = variantIdToPlanId(variantId);
  const billingCycle = variantIdToBillingCycle(variantId);

  if (!planId) {
    console.error(`[Webhook] Unknown variant ID: ${variantId}`);
    return;
  }

  console.log(`[Webhook] Creating subscription for user ${userId}: ${planId} (${billingCycle})`);

  // Create or update subscription in our database
  await prisma.subscription.upsert({
    where: { userId },
    create: {
      userId,
      planId,
      status: 'ACTIVE',
      billingCycle: billingCycle || undefined,
      lemonSqueezyId: data.id,
      lemonSqueezyCustomerId: String(data.attributes.customer_id),
      lemonSqueezyOrderId: String(data.attributes.order_id),
      lemonSqueezyProductId: String(data.attributes.product_id),
      lemonSqueezyVariantId: variantId,
      currentPeriodStart: new Date(),
      currentPeriodEnd: data.attributes.renews_at
        ? new Date(data.attributes.renews_at)
        : null,
    },
    update: {
      planId,
      status: 'ACTIVE',
      billingCycle: billingCycle || undefined,
      lemonSqueezyId: data.id,
      lemonSqueezyCustomerId: String(data.attributes.customer_id),
      lemonSqueezyOrderId: String(data.attributes.order_id),
      lemonSqueezyProductId: String(data.attributes.product_id),
      lemonSqueezyVariantId: variantId,
      currentPeriodStart: new Date(),
      currentPeriodEnd: data.attributes.renews_at
        ? new Date(data.attributes.renews_at)
        : null,
      cancelAtPeriodEnd: false,
      canceledAt: null,
    },
  });

  console.log(`[Webhook] Subscription created for user ${userId}`);
}

async function handleSubscriptionUpdated(event: LemonSqueezyWebhookEvent) {
  const { data } = event;
  const subscriptionId = data.id;

  // Find subscription by Lemon Squeezy ID
  const subscription = await prisma.subscription.findFirst({
    where: { lemonSqueezyId: subscriptionId },
  });

  if (!subscription) {
    console.error(`[Webhook] Subscription not found: ${subscriptionId}`);
    return;
  }

  const variantId = String(data.attributes.variant_id);
  const planId = variantIdToPlanId(variantId);
  const billingCycle = variantIdToBillingCycle(variantId);

  // Map Lemon Squeezy status to our status
  const statusMap: Record<string, string> = {
    active: 'ACTIVE',
    cancelled: 'CANCELLED',
    past_due: 'PAST_DUE',
    paused: 'PAUSED',
    expired: 'EXPIRED',
    on_trial: 'TRIALING',
  };

  const status = statusMap[data.attributes.status] || 'ACTIVE';

  await prisma.subscription.update({
    where: { id: subscription.id },
    data: {
      planId: planId || subscription.planId,
      status: status as any,
      billingCycle: billingCycle || subscription.billingCycle,
      lemonSqueezyVariantId: variantId,
      currentPeriodEnd: data.attributes.renews_at
        ? new Date(data.attributes.renews_at)
        : subscription.currentPeriodEnd,
      cancelAtPeriodEnd: data.attributes.cancelled,
    },
  });

  console.log(`[Webhook] Subscription updated: ${subscriptionId}`);
}

async function handleSubscriptionCancelled(event: LemonSqueezyWebhookEvent) {
  const { data } = event;
  const subscriptionId = data.id;

  const subscription = await prisma.subscription.findFirst({
    where: { lemonSqueezyId: subscriptionId },
  });

  if (!subscription) {
    console.error(`[Webhook] Subscription not found: ${subscriptionId}`);
    return;
  }

  await prisma.subscription.update({
    where: { id: subscription.id },
    data: {
      status: 'CANCELLED',
      cancelAtPeriodEnd: true,
      canceledAt: new Date(),
      currentPeriodEnd: data.attributes.ends_at
        ? new Date(data.attributes.ends_at)
        : subscription.currentPeriodEnd,
    },
  });

  console.log(`[Webhook] Subscription cancelled: ${subscriptionId}`);
}

async function handleSubscriptionResumed(event: LemonSqueezyWebhookEvent) {
  const { data } = event;
  const subscriptionId = data.id;

  const subscription = await prisma.subscription.findFirst({
    where: { lemonSqueezyId: subscriptionId },
  });

  if (!subscription) {
    console.error(`[Webhook] Subscription not found: ${subscriptionId}`);
    return;
  }

  await prisma.subscription.update({
    where: { id: subscription.id },
    data: {
      status: 'ACTIVE',
      cancelAtPeriodEnd: false,
      canceledAt: null,
    },
  });

  console.log(`[Webhook] Subscription resumed: ${subscriptionId}`);
}

async function handleSubscriptionExpired(event: LemonSqueezyWebhookEvent) {
  const { data } = event;
  const subscriptionId = data.id;

  const subscription = await prisma.subscription.findFirst({
    where: { lemonSqueezyId: subscriptionId },
  });

  if (!subscription) {
    console.error(`[Webhook] Subscription not found: ${subscriptionId}`);
    return;
  }

  // When subscription expires, downgrade to free plan
  await prisma.subscription.update({
    where: { id: subscription.id },
    data: {
      planId: 'free',
      status: 'EXPIRED',
      billingCycle: null,
    },
  });

  console.log(`[Webhook] Subscription expired, downgraded to free: ${subscriptionId}`);
}

async function handlePaymentSuccess(event: LemonSqueezyWebhookEvent) {
  const { data } = event;
  const subscriptionId = data.id;

  console.log(`[Webhook] Payment successful for subscription: ${subscriptionId}`);

  // Update the subscription period
  const subscription = await prisma.subscription.findFirst({
    where: { lemonSqueezyId: subscriptionId },
  });

  if (subscription) {
    await prisma.subscription.update({
      where: { id: subscription.id },
      data: {
        status: 'ACTIVE',
        currentPeriodStart: new Date(),
        currentPeriodEnd: data.attributes.renews_at
          ? new Date(data.attributes.renews_at)
          : null,
      },
    });
  }
}

async function handlePaymentFailed(event: LemonSqueezyWebhookEvent) {
  const { data } = event;
  const subscriptionId = data.id;

  console.log(`[Webhook] Payment failed for subscription: ${subscriptionId}`);

  const subscription = await prisma.subscription.findFirst({
    where: { lemonSqueezyId: subscriptionId },
  });

  if (subscription) {
    await prisma.subscription.update({
      where: { id: subscription.id },
      data: {
        status: 'PAST_DUE',
      },
    });
  }
}
