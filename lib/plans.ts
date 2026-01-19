// Plan configuration - easy to modify without changing code
// All limits and features are defined here

export type PlanId = 'free' | 'starter' | 'pro';

export type Feature =
  | 'dynamic_qr'
  | 'logo'
  | 'svg_download'
  | 'pdf_export'
  | 'analytics_basic'
  | 'analytics_advanced'
  | 'campaigns'
  | 'bulk_creation'
  | 'high_resolution';

export interface PlanConfig {
  id: PlanId;
  name: string;
  description: string;

  // Pricing (in cents for accuracy)
  monthlyPriceCents: number;
  yearlyPriceCents: number;

  // Limits (-1 = unlimited)
  maxDynamicQRs: number;
  maxScansPerMonth: number;
  maxPngResolution: number;

  // Features enabled
  features: Feature[];
}

export const PLANS: Record<PlanId, PlanConfig> = {
  free: {
    id: 'free',
    name: 'Free',
    description: 'Create unlimited static QR codes',
    monthlyPriceCents: 0,
    yearlyPriceCents: 0,
    maxDynamicQRs: 0,
    maxScansPerMonth: 0, // No tracking for free
    maxPngResolution: 500,
    features: [],
  },
  starter: {
    id: 'starter',
    name: 'Starter',
    description: 'For creators and small businesses',
    monthlyPriceCents: 500, // $5
    yearlyPriceCents: 4900, // $49
    maxDynamicQRs: 15,
    maxScansPerMonth: 5000,
    maxPngResolution: 1024,
    features: [
      'dynamic_qr',
      'logo',
      'svg_download',
      'analytics_basic',
    ],
  },
  pro: {
    id: 'pro',
    name: 'Pro',
    description: 'For professionals and growing teams',
    monthlyPriceCents: 1200, // $12
    yearlyPriceCents: 11900, // $119
    maxDynamicQRs: -1, // Unlimited
    maxScansPerMonth: -1, // Unlimited
    maxPngResolution: 2048,
    features: [
      'dynamic_qr',
      'logo',
      'svg_download',
      'pdf_export',
      'analytics_basic',
      'analytics_advanced',
      'campaigns',
      'bulk_creation',
      'high_resolution',
    ],
  },
};

// Helper functions
export function getPlan(planId: PlanId): PlanConfig {
  return PLANS[planId] || PLANS.free;
}

export function hasFeature(planId: PlanId, feature: Feature): boolean {
  const plan = getPlan(planId);
  return plan.features.includes(feature);
}

export function canCreateDynamicQR(planId: PlanId, currentCount: number): boolean {
  const plan = getPlan(planId);
  if (plan.maxDynamicQRs === -1) return true; // Unlimited
  return currentCount < plan.maxDynamicQRs;
}

export function canTrackScan(planId: PlanId, currentMonthScans: number): boolean {
  const plan = getPlan(planId);
  if (plan.maxScansPerMonth === -1) return true; // Unlimited
  if (plan.maxScansPerMonth === 0) return false; // No tracking
  return currentMonthScans < plan.maxScansPerMonth;
}

export function getMaxResolution(planId: PlanId): number {
  return getPlan(planId).maxPngResolution;
}

// Get remaining limits for display
export function getRemainingLimits(
  planId: PlanId,
  dynamicQRCount: number,
  monthlyScans: number
): {
  dynamicQRs: { used: number; limit: number; unlimited: boolean };
  scans: { used: number; limit: number; unlimited: boolean };
} {
  const plan = getPlan(planId);

  return {
    dynamicQRs: {
      used: dynamicQRCount,
      limit: plan.maxDynamicQRs,
      unlimited: plan.maxDynamicQRs === -1,
    },
    scans: {
      used: monthlyScans,
      limit: plan.maxScansPerMonth,
      unlimited: plan.maxScansPerMonth === -1,
    },
  };
}

// Feature display names for UI
export const FEATURE_LABELS: Record<Feature, string> = {
  dynamic_qr: 'Dynamic QR codes',
  logo: 'Logo in QR',
  svg_download: 'SVG download',
  pdf_export: 'PDF export',
  analytics_basic: 'Analytics (scan count)',
  analytics_advanced: 'Advanced analytics',
  campaigns: 'Campaigns',
  bulk_creation: 'Bulk creation',
  high_resolution: 'High resolution (2048px)',
};
