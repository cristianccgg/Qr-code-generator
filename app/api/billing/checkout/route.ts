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

    // Validate input
    if (!planId || !['starter', 'pro'].includes(planId)) {
      return NextResponse.json({ error: 'Invalid plan' }, { status: 400 });
    }

    if (!billingCycle || !['monthly', 'yearly'].includes(billingCycle)) {
      return NextResponse.json({ error: 'Invalid billing cycle' }, { status: 400 });
    }

    // Get variant ID for this plan/cycle combination
    const variantId = getVariantId(planId, billingCycle);

    if (!variantId) {
      console.error(`No variant ID configured for ${planId}-${billingCycle}`);
      return NextResponse.json(
        { error: 'Payment configuration error. Please contact support.' },
        { status: 500 }
      );
    }

    // Create checkout session
    const checkoutUrl = await createCheckout({
      variantId,
      email: session.user.email,
      userId: session.user.id,
    });

    if (!checkoutUrl) {
      return NextResponse.json(
        { error: 'Failed to create checkout session' },
        { status: 500 }
      );
    }

    return NextResponse.json({ checkoutUrl });
  } catch (error) {
    console.error('Error creating checkout:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
