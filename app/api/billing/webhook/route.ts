import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import {
  verifyWebhookSignature,
  LemonSqueezyWebhookEvent,
  variantIdToPlanId,
  variantIdToBillingCycle,
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
    const userId = event.meta.custom_data?.user_id;

    console.log(`[Webhook] Received event: ${eventName} for user: ${userId}`);

    if (!userId) {
      console.error('No user_id in webhook custom data');
      return NextResponse.json({ error: 'Missing user_id' }, { status: 400 });
    }

    // Handle different event types
    switch (eventName) {
      case 'subscription_created':
      case 'subscription_updated':
        await handleSubscriptionUpdate(userId, event);
        break;

      case 'subscription_cancelled':
        await handleSubscriptionCancelled(userId, event);
        break;

      case 'subscription_resumed':
        await handleSubscriptionResumed(userId, event);
        break;

      case 'subscription_expired':
        await handleSubscriptionExpired(userId, event);
        break;

      case 'subscription_payment_failed':
        await handlePaymentFailed(userId, event);
        break;

      case 'subscription_payment_success':
        await handlePaymentSuccess(userId, event);
        break;

      case 'order_created':
        // Initial order - subscription_created will follow
        console.log(`[Webhook] Order created for user ${userId}`);
        break;

      default:
        console.log(`[Webhook] Unhandled event type: ${eventName}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}

async function handleSubscriptionUpdate(userId: string, event: LemonSqueezyWebhookEvent) {
  const { data } = event;
  const variantId = String(data.attributes.variant_id);
  const planId = variantIdToPlanId(variantId);
  const billingCycle = variantIdToBillingCycle(variantId);

  if (!planId) {
    console.error(`Unknown variant ID: ${variantId}`);
    return;
  }

  // Upsert subscription
  await prisma.subscription.upsert({
    where: { userId },
    create: {
      userId,
      planId,
      status: 'ACTIVE',
      billingCycle,
      lemonSqueezyId: data.id,
      lemonSqueezyCustomerId: String(data.attributes.customer_id),
      lemonSqueezyProductId: String(data.attributes.product_id),
      lemonSqueezyVariantId: variantId,
      currentPeriodEnd: data.attributes.renews_at ? new Date(data.attributes.renews_at) : null,
    },
    update: {
      planId,
      status: 'ACTIVE',
      billingCycle,
      lemonSqueezyId: data.id,
      lemonSqueezyCustomerId: String(data.attributes.customer_id),
      lemonSqueezyProductId: String(data.attributes.product_id),
      lemonSqueezyVariantId: variantId,
      currentPeriodEnd: data.attributes.renews_at ? new Date(data.attributes.renews_at) : null,
      cancelAtPeriodEnd: false,
      canceledAt: null,
    },
  });

  console.log(`[Webhook] Subscription updated for user ${userId}: ${planId} (${billingCycle})`);
}

async function handleSubscriptionCancelled(userId: string, event: LemonSqueezyWebhookEvent) {
  const { data } = event;

  await prisma.subscription.update({
    where: { userId },
    data: {
      cancelAtPeriodEnd: true,
      canceledAt: new Date(),
      currentPeriodEnd: data.attributes.ends_at ? new Date(data.attributes.ends_at) : null,
    },
  });

  console.log(`[Webhook] Subscription cancelled for user ${userId}, ends at ${data.attributes.ends_at}`);
}

async function handleSubscriptionResumed(userId: string, event: LemonSqueezyWebhookEvent) {
  await prisma.subscription.update({
    where: { userId },
    data: {
      status: 'ACTIVE',
      cancelAtPeriodEnd: false,
      canceledAt: null,
    },
  });

  console.log(`[Webhook] Subscription resumed for user ${userId}`);
}

async function handleSubscriptionExpired(userId: string, event: LemonSqueezyWebhookEvent) {
  await prisma.subscription.update({
    where: { userId },
    data: {
      status: 'EXPIRED',
      planId: 'free',
    },
  });

  console.log(`[Webhook] Subscription expired for user ${userId}, downgraded to free`);
}

async function handlePaymentFailed(userId: string, event: LemonSqueezyWebhookEvent) {
  await prisma.subscription.update({
    where: { userId },
    data: {
      status: 'PAST_DUE',
    },
  });

  console.log(`[Webhook] Payment failed for user ${userId}`);
}

async function handlePaymentSuccess(userId: string, event: LemonSqueezyWebhookEvent) {
  const subscription = await prisma.subscription.findUnique({
    where: { userId },
  });

  // Only update if status was PAST_DUE
  if (subscription?.status === 'PAST_DUE') {
    await prisma.subscription.update({
      where: { userId },
      data: {
        status: 'ACTIVE',
      },
    });
    console.log(`[Webhook] Payment recovered for user ${userId}`);
  }
}
