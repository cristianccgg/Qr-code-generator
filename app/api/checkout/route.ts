import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { createCheckout, getVariantId } from '@/lib/lemonsqueezy';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id || !session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { planId, billingCycle } = body;

    // Validate plan
    if (!planId || !['starter', 'pro'].includes(planId)) {
      return NextResponse.json(
        { error: 'Invalid plan. Must be "starter" or "pro"' },
        { status: 400 }
      );
    }

    // Validate billing cycle
    if (!billingCycle || !['monthly', 'yearly'].includes(billingCycle)) {
      return NextResponse.json(
        { error: 'Invalid billing cycle. Must be "monthly" or "yearly"' },
        { status: 400 }
      );
    }

    // Get variant ID for this plan/cycle combination
    const variantId = getVariantId(planId, billingCycle);

    if (!variantId) {
      return NextResponse.json(
        { error: 'Product variant not configured. Please contact support.' },
        { status: 500 }
      );
    }

    // Create checkout URL
    const checkoutUrl = await createCheckout({
      variantId,
      email: session.user.email,
      userId: session.user.id,
      userName: session.user.name || undefined,
    });

    if (!checkoutUrl) {
      return NextResponse.json(
        { error: 'Failed to create checkout session' },
        { status: 500 }
      );
    }

    return NextResponse.json({ checkoutUrl });
  } catch (error) {
    console.error('Checkout error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
