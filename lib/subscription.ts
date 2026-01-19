import { prisma } from './prisma';
import { PlanId, getPlan, hasFeature, Feature, canCreateDynamicQR, canTrackScan } from './plans';

// Get current period string (YYYY-MM)
export function getCurrentPeriod(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

// Get user's subscription with plan info
export async function getUserSubscription(userId: string) {
  const subscription = await prisma.subscription.findUnique({
    where: { userId },
  });

  // Default to free plan if no subscription
  const planId = (subscription?.planId as PlanId) || 'free';
  const plan = getPlan(planId);

  return {
    subscription,
    planId,
    plan,
    isActive: !subscription || subscription.status === 'ACTIVE' || subscription.status === 'TRIALING',
  };
}

// Get or create usage record for current period
export async function getOrCreateUsageRecord(userId: string) {
  const period = getCurrentPeriod();

  const usageRecord = await prisma.usageRecord.upsert({
    where: {
      userId_period: { userId, period },
    },
    create: {
      userId,
      period,
      dynamicQRsCreated: 0,
      scansTracked: 0,
    },
    update: {},
  });

  return usageRecord;
}

// Get user's current usage
export async function getUserUsage(userId: string) {
  const period = getCurrentPeriod();

  // Get total dynamic QRs ever created (not just this period)
  const totalDynamicQRs = await prisma.qRCode.count({
    where: {
      userId,
      isDynamic: true,
    },
  });

  // Get scans this period
  const usageRecord = await getOrCreateUsageRecord(userId);

  return {
    totalDynamicQRs,
    scansThisPeriod: usageRecord.scansTracked,
    period,
  };
}

// Check if user can create a dynamic QR
export async function checkCanCreateDynamicQR(userId: string): Promise<{
  allowed: boolean;
  reason?: string;
  currentCount: number;
  limit: number;
}> {
  const { planId, isActive } = await getUserSubscription(userId);

  if (!isActive) {
    return {
      allowed: false,
      reason: 'Your subscription is not active',
      currentCount: 0,
      limit: 0,
    };
  }

  const plan = getPlan(planId);

  if (!hasFeature(planId, 'dynamic_qr')) {
    return {
      allowed: false,
      reason: 'Dynamic QR codes are not available on the Free plan. Upgrade to Starter or Pro.',
      currentCount: 0,
      limit: 0,
    };
  }

  const { totalDynamicQRs } = await getUserUsage(userId);

  if (!canCreateDynamicQR(planId, totalDynamicQRs)) {
    return {
      allowed: false,
      reason: `You've reached your limit of ${plan.maxDynamicQRs} dynamic QR codes. Upgrade to Pro for unlimited.`,
      currentCount: totalDynamicQRs,
      limit: plan.maxDynamicQRs,
    };
  }

  return {
    allowed: true,
    currentCount: totalDynamicQRs,
    limit: plan.maxDynamicQRs,
  };
}

// Check if user can track a scan
export async function checkCanTrackScan(userId: string): Promise<{
  allowed: boolean;
  reason?: string;
  currentCount: number;
  limit: number;
}> {
  const { planId, isActive } = await getUserSubscription(userId);

  if (!isActive) {
    return {
      allowed: false,
      reason: 'Subscription not active',
      currentCount: 0,
      limit: 0,
    };
  }

  const plan = getPlan(planId);

  if (!hasFeature(planId, 'analytics_basic')) {
    return {
      allowed: false,
      reason: 'Analytics not available on this plan',
      currentCount: 0,
      limit: 0,
    };
  }

  const { scansThisPeriod } = await getUserUsage(userId);

  if (!canTrackScan(planId, scansThisPeriod)) {
    return {
      allowed: false,
      reason: 'Monthly scan limit reached',
      currentCount: scansThisPeriod,
      limit: plan.maxScansPerMonth,
    };
  }

  return {
    allowed: true,
    currentCount: scansThisPeriod,
    limit: plan.maxScansPerMonth,
  };
}

// Increment usage counters
export async function incrementDynamicQRCount(userId: string) {
  const period = getCurrentPeriod();

  await prisma.usageRecord.upsert({
    where: {
      userId_period: { userId, period },
    },
    create: {
      userId,
      period,
      dynamicQRsCreated: 1,
      scansTracked: 0,
    },
    update: {
      dynamicQRsCreated: { increment: 1 },
    },
  });
}

export async function incrementScanCount(userId: string) {
  const period = getCurrentPeriod();

  await prisma.usageRecord.upsert({
    where: {
      userId_period: { userId, period },
    },
    create: {
      userId,
      period,
      dynamicQRsCreated: 0,
      scansTracked: 1,
    },
    update: {
      scansTracked: { increment: 1 },
    },
  });
}

// Check if user has a specific feature
export async function userHasFeature(userId: string, feature: Feature): Promise<boolean> {
  const { planId, isActive } = await getUserSubscription(userId);

  if (!isActive) return false;

  return hasFeature(planId, feature);
}

// Get user's full subscription status with usage
export async function getSubscriptionStatus(userId: string) {
  const { subscription, planId, plan, isActive } = await getUserSubscription(userId);
  const usage = await getUserUsage(userId);

  return {
    plan: {
      id: planId,
      name: plan.name,
      description: plan.description,
    },
    subscription: subscription
      ? {
          status: subscription.status,
          billingCycle: subscription.billingCycle,
          currentPeriodEnd: subscription.currentPeriodEnd,
          cancelAtPeriodEnd: subscription.cancelAtPeriodEnd,
        }
      : null,
    isActive,
    usage: {
      dynamicQRs: {
        used: usage.totalDynamicQRs,
        limit: plan.maxDynamicQRs,
        unlimited: plan.maxDynamicQRs === -1,
        percentage:
          plan.maxDynamicQRs === -1
            ? 0
            : Math.round((usage.totalDynamicQRs / plan.maxDynamicQRs) * 100),
      },
      scans: {
        used: usage.scansThisPeriod,
        limit: plan.maxScansPerMonth,
        unlimited: plan.maxScansPerMonth === -1,
        percentage:
          plan.maxScansPerMonth === -1
            ? 0
            : Math.round((usage.scansThisPeriod / plan.maxScansPerMonth) * 100),
      },
    },
    features: {
      dynamicQR: hasFeature(planId, 'dynamic_qr'),
      logo: hasFeature(planId, 'logo'),
      svgDownload: hasFeature(planId, 'svg_download'),
      pdfExport: hasFeature(planId, 'pdf_export'),
      analyticsBasic: hasFeature(planId, 'analytics_basic'),
      analyticsAdvanced: hasFeature(planId, 'analytics_advanced'),
      campaigns: hasFeature(planId, 'campaigns'),
      bulkCreation: hasFeature(planId, 'bulk_creation'),
      highResolution: hasFeature(planId, 'high_resolution'),
    },
    maxResolution: plan.maxPngResolution,
  };
}

// Create default subscription for new users
export async function createDefaultSubscription(userId: string) {
  return prisma.subscription.create({
    data: {
      userId,
      planId: 'free',
      status: 'ACTIVE',
    },
  });
}
