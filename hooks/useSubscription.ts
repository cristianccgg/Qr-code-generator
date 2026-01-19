'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';

export interface SubscriptionUsage {
  used: number;
  limit: number;
  unlimited: boolean;
  percentage: number;
}

export interface SubscriptionFeatures {
  dynamicQR: boolean;
  logo: boolean;
  svgDownload: boolean;
  pdfExport: boolean;
  analyticsBasic: boolean;
  analyticsAdvanced: boolean;
  campaigns: boolean;
  bulkCreation: boolean;
  highResolution: boolean;
}

export interface SubscriptionStatus {
  plan: {
    id: string;
    name: string;
    description: string;
  };
  subscription: {
    status: string;
    billingCycle: string | null;
    currentPeriodEnd: string | null;
    cancelAtPeriodEnd: boolean;
  } | null;
  isActive: boolean;
  usage: {
    dynamicQRs: SubscriptionUsage;
    scans: SubscriptionUsage;
  };
  features: SubscriptionFeatures;
  maxResolution: number;
}

export function useSubscription() {
  const { data: session, status: sessionStatus } = useSession();
  const [subscription, setSubscription] = useState<SubscriptionStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSubscription = useCallback(async () => {
    if (sessionStatus !== 'authenticated') {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const response = await fetch('/api/subscription');

      if (!response.ok) {
        throw new Error('Failed to fetch subscription');
      }

      const data = await response.json();
      setSubscription(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, [sessionStatus]);

  useEffect(() => {
    fetchSubscription();
  }, [fetchSubscription]);

  // Helper functions
  const canCreateDynamicQR = useCallback(() => {
    if (!subscription) return false;
    if (!subscription.features.dynamicQR) return false;
    if (subscription.usage.dynamicQRs.unlimited) return true;
    return subscription.usage.dynamicQRs.used < subscription.usage.dynamicQRs.limit;
  }, [subscription]);

  const canUseLogo = useCallback(() => {
    return subscription?.features.logo ?? false;
  }, [subscription]);

  const canDownloadSVG = useCallback(() => {
    return subscription?.features.svgDownload ?? false;
  }, [subscription]);

  const canExportPDF = useCallback(() => {
    return subscription?.features.pdfExport ?? false;
  }, [subscription]);

  const canUseCampaigns = useCallback(() => {
    return subscription?.features.campaigns ?? false;
  }, [subscription]);

  const canUseBulkCreation = useCallback(() => {
    return subscription?.features.bulkCreation ?? false;
  }, [subscription]);

  const hasBasicAnalytics = useCallback(() => {
    return subscription?.features.analyticsBasic ?? false;
  }, [subscription]);

  const hasAdvancedAnalytics = useCallback(() => {
    return subscription?.features.analyticsAdvanced ?? false;
  }, [subscription]);

  const getRemainingDynamicQRs = useCallback(() => {
    if (!subscription) return 0;
    if (subscription.usage.dynamicQRs.unlimited) return Infinity;
    return Math.max(0, subscription.usage.dynamicQRs.limit - subscription.usage.dynamicQRs.used);
  }, [subscription]);

  const getRemainingScans = useCallback(() => {
    if (!subscription) return 0;
    if (subscription.usage.scans.unlimited) return Infinity;
    return Math.max(0, subscription.usage.scans.limit - subscription.usage.scans.used);
  }, [subscription]);

  const isPaidPlan = useCallback(() => {
    return subscription?.plan.id !== 'free';
  }, [subscription]);

  const isProPlan = useCallback(() => {
    return subscription?.plan.id === 'pro';
  }, [subscription]);

  return {
    subscription,
    loading,
    error,
    refetch: fetchSubscription,

    // Plan info
    planId: subscription?.plan.id ?? 'free',
    planName: subscription?.plan.name ?? 'Free',
    isActive: subscription?.isActive ?? false,
    isPaidPlan: isPaidPlan(),
    isProPlan: isProPlan(),

    // Usage
    usage: subscription?.usage,
    maxResolution: subscription?.maxResolution ?? 500,

    // Feature checks
    features: subscription?.features,
    canCreateDynamicQR,
    canUseLogo,
    canDownloadSVG,
    canExportPDF,
    canUseCampaigns,
    canUseBulkCreation,
    hasBasicAnalytics,
    hasAdvancedAnalytics,

    // Remaining limits
    getRemainingDynamicQRs,
    getRemainingScans,
  };
}
