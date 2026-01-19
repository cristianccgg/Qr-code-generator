// Lemon Squeezy API helper functions

const LEMON_SQUEEZY_API_URL = 'https://api.lemonsqueezy.com/v1';

interface LemonSqueezyCheckoutOptions {
  variantId: string;
  email: string;
  userId: string;
  redirectUrl?: string;
}

interface LemonSqueezyCheckoutResponse {
  data: {
    id: string;
    attributes: {
      url: string;
    };
  };
}

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

// Create a checkout session
export async function createCheckout(options: LemonSqueezyCheckoutOptions): Promise<string | null> {
  const apiKey = process.env.LEMON_SQUEEZY_API_KEY;
  const storeId = process.env.LEMON_SQUEEZY_STORE_ID;

  if (!apiKey || !storeId) {
    console.error('Lemon Squeezy API key or store ID not configured');
    return null;
  }

  try {
    const response = await fetch(`${LEMON_SQUEEZY_API_URL}/checkouts`, {
      method: 'POST',
      headers: {
        'Accept': 'application/vnd.api+json',
        'Content-Type': 'application/vnd.api+json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        data: {
          type: 'checkouts',
          attributes: {
            checkout_data: {
              email: options.email,
              custom: {
                user_id: options.userId,
              },
            },
            checkout_options: {
              redirect_url: options.redirectUrl || `${process.env.NEXTAUTH_URL}/dashboard?upgraded=true`,
            },
            product_options: {
              redirect_url: options.redirectUrl || `${process.env.NEXTAUTH_URL}/dashboard?upgraded=true`,
            },
          },
          relationships: {
            store: {
              data: {
                type: 'stores',
                id: storeId,
              },
            },
            variant: {
              data: {
                type: 'variants',
                id: options.variantId,
              },
            },
          },
        },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Lemon Squeezy API error:', errorText);
      return null;
    }

    const data: LemonSqueezyCheckoutResponse = await response.json();
    return data.data.attributes.url;
  } catch (error) {
    console.error('Error creating Lemon Squeezy checkout:', error);
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
