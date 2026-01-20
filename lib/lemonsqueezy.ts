// Lemon Squeezy API helper functions using official SDK
import {
  lemonSqueezySetup,
  createCheckout as lsCreateCheckout,
  getSubscription,
  cancelSubscription,
  type Checkout,
} from '@lemonsqueezy/lemonsqueezy.js';

// Initialize the Lemon Squeezy client
let initialized = false;

export function initLemonSqueezy() {
  if (initialized) return;

  const apiKey = process.env.LEMON_SQUEEZY_API_KEY;
  if (!apiKey) {
    throw new Error('LEMON_SQUEEZY_API_KEY is not set');
  }

  lemonSqueezySetup({ apiKey });
  initialized = true;
}

// Store ID from environment
export const STORE_ID = process.env.LEMON_SQUEEZY_STORE_ID || '';

// Get variant ID based on plan and billing cycle
export function getVariantId(planId: 'starter' | 'pro', billingCycle: 'monthly' | 'yearly'): string | null {
  const variantIds: Record<string, string | undefined> = {
    'starter-monthly': process.env.LEMON_SQUEEZY_STARTER_MONTHLY_VARIANT_ID,
    'starter-yearly': process.env.LEMON_SQUEEZY_STARTER_YEARLY_VARIANT_ID,
    'pro-monthly': process.env.LEMON_SQUEEZY_PRO_MONTHLY_VARIANT_ID,
    'pro-yearly': process.env.LEMON_SQUEEZY_PRO_YEARLY_VARIANT_ID,
  };

  const key = `${planId}-${billingCycle}`;
  return variantIds[key] || null;
}

interface CreateCheckoutOptions {
  variantId: string;
  email: string;
  userId: string;
  userName?: string;
  redirectUrl?: string;
}

// Create a checkout session using official SDK
export async function createCheckout(options: CreateCheckoutOptions): Promise<string | null> {
  initLemonSqueezy();

  if (!STORE_ID) {
    console.error('Lemon Squeezy store ID not configured');
    return null;
  }

  try {
    const checkout = await lsCreateCheckout(STORE_ID, options.variantId, {
      checkoutData: {
        email: options.email,
        name: options.userName || undefined,
        custom: {
          user_id: options.userId,
        },
      },
      productOptions: {
        redirectUrl: options.redirectUrl || `${process.env.NEXTAUTH_URL}/checkout/success`,
        receiptButtonText: 'Go to Dashboard',
      },
    });

    if (checkout.error) {
      console.error('Lemon Squeezy checkout error:', checkout.error);
      return null;
    }

    return checkout.data?.data.attributes.url || null;
  } catch (error) {
    console.error('Error creating Lemon Squeezy checkout:', error);
    return null;
  }
}

// Get subscription details
export async function getSubscriptionDetails(subscriptionId: string) {
  initLemonSqueezy();

  const subscription = await getSubscription(subscriptionId);
  return subscription;
}

// Cancel subscription (at period end)
export async function cancelUserSubscription(subscriptionId: string) {
  initLemonSqueezy();

  const result = await cancelSubscription(subscriptionId);
  return result;
}

// Get customer portal URL
export async function getCustomerPortalUrl(customerId: string): Promise<string | null> {
  initLemonSqueezy();

  try {
    const response = await fetch(
      `https://api.lemonsqueezy.com/v1/customers/${customerId}`,
      {
        headers: {
          'Authorization': `Bearer ${process.env.LEMON_SQUEEZY_API_KEY}`,
          'Accept': 'application/vnd.api+json',
        },
      }
    );

    if (!response.ok) {
      console.error('Failed to get customer:', await response.text());
      return null;
    }

    const data = await response.json();
    return data.data?.attributes?.urls?.customer_portal || null;
  } catch (error) {
    console.error('Error getting customer portal URL:', error);
    return null;
  }
}

// Verify webhook signature
export function verifyWebhookSignature(payload: string, signature: string): boolean {
  const crypto = require('crypto');
  const secret = process.env.LEMON_SQUEEZY_WEBHOOK_SECRET;

  if (!secret) {
    console.error('Lemon Squeezy webhook secret not configured');
    return false;
  }

  const hmac = crypto.createHmac('sha256', secret);
  const digest = hmac.update(payload).digest('hex');

  return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(digest));
}

// Types for webhook events
export interface LemonSqueezyWebhookEvent {
  meta: {
    event_name: string;
    custom_data?: {
      user_id?: string;
    };
  };
  data: {
    id: string;
    type: string;
    attributes: {
      store_id: number;
      customer_id: number;
      order_id: number;
      product_id: number;
      variant_id: number;
      status: string;
      status_formatted: string;
      renews_at: string | null;
      ends_at: string | null;
      cancelled: boolean;
      // For order events
      user_email?: string;
      first_order_item?: {
        variant_id: number;
        product_id: number;
      };
    };
  };
}

// Map variant ID to plan ID
export function variantIdToPlanId(variantId: string): 'starter' | 'pro' | null {
  const starterMonthly = process.env.LEMON_SQUEEZY_STARTER_MONTHLY_VARIANT_ID;
  const starterYearly = process.env.LEMON_SQUEEZY_STARTER_YEARLY_VARIANT_ID;
  const proMonthly = process.env.LEMON_SQUEEZY_PRO_MONTHLY_VARIANT_ID;
  const proYearly = process.env.LEMON_SQUEEZY_PRO_YEARLY_VARIANT_ID;

  if (variantId === starterMonthly || variantId === starterYearly) {
    return 'starter';
  }
  if (variantId === proMonthly || variantId === proYearly) {
    return 'pro';
  }
  return null;
}

// Map variant ID to billing cycle
export function variantIdToBillingCycle(variantId: string): 'MONTHLY' | 'YEARLY' | null {
  const starterMonthly = process.env.LEMON_SQUEEZY_STARTER_MONTHLY_VARIANT_ID;
  const proMonthly = process.env.LEMON_SQUEEZY_PRO_MONTHLY_VARIANT_ID;

  if (variantId === starterMonthly || variantId === proMonthly) {
    return 'MONTHLY';
  }
  return 'YEARLY';
}
