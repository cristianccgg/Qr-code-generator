'use client';

import { useState } from 'react';
import { FiX, FiCheck, FiZap, FiStar, FiAward } from 'react-icons/fi';
import { PlanId } from '@/lib/plans';

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  feature: string; // The feature they tried to use
  requiredPlan: 'starter' | 'pro'; // Minimum plan needed
}

const plans = {
  starter: {
    name: 'Starter',
    monthlyPrice: 5,
    yearlyPrice: 49,
    icon: FiStar,
    color: 'from-[#40B49D] to-[#2d8b7a]',
    features: [
      '15 Dynamic QR codes',
      '5,000 scans/month',
      'Logo in QR codes',
      'SVG downloads',
      'Scan count analytics',
    ],
  },
  pro: {
    name: 'Pro',
    monthlyPrice: 12,
    yearlyPrice: 119,
    icon: FiAward,
    color: 'from-[#f5576c] to-[#8538a6]',
    features: [
      'Unlimited Dynamic QR codes',
      'Unlimited scans',
      'Advanced analytics',
      'PDF export & labels',
      'Campaigns & bulk creation',
    ],
  },
};

export function UpgradeModal({ isOpen, onClose, feature, requiredPlan }: UpgradeModalProps) {
  const [isYearly, setIsYearly] = useState(true);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const plan = plans[requiredPlan];
  const price = isYearly ? Math.round(plan.yearlyPrice / 12) : plan.monthlyPrice;

  const handleUpgrade = async (planId: PlanId) => {
    setLoading(true);
    try {
      const response = await fetch('/api/billing/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          planId,
          billingCycle: isYearly ? 'yearly' : 'monthly',
        }),
      });

      const data = await response.json();

      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      } else {
        console.error('No checkout URL returned');
      }
    } catch (error) {
      console.error('Error creating checkout:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-gray-900 rounded-2xl border border-gray-700 shadow-2xl max-w-lg w-full overflow-hidden">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors z-10"
        >
          <FiX className="w-6 h-6" />
        </button>

        {/* Header */}
        <div className={`bg-gradient-to-r ${plan.color} p-6 pb-8`}>
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-white/20 rounded-xl">
              <FiZap className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-white text-xl font-bold">Upgrade Required</h2>
          </div>
          <p className="text-white/90">
            <span className="font-semibold">{feature}</span> is available on{' '}
            <span className="font-semibold">{plan.name}</span> and above.
          </p>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Billing toggle */}
          <div className="flex justify-center items-center gap-3 mb-6">
            <span className={`text-sm ${!isYearly ? 'text-white' : 'text-gray-500'}`}>
              Monthly
            </span>
            <button
              onClick={() => setIsYearly(!isYearly)}
              className={`relative w-12 h-6 rounded-full transition-colors ${
                isYearly ? 'bg-[#40B49D]' : 'bg-gray-600'
              }`}
            >
              <span
                className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                  isYearly ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
            <span className={`text-sm ${isYearly ? 'text-white' : 'text-gray-500'}`}>
              Yearly
            </span>
            {isYearly && (
              <span className="text-xs text-[#40B49D] font-semibold">Save 17%</span>
            )}
          </div>

          {/* Plan card */}
          <div className="bg-gray-800 rounded-xl p-5 border border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg bg-gradient-to-r ${plan.color}`}>
                  <plan.icon className="w-5 h-5 text-white" />
                </div>
                <span className="text-white font-bold text-lg">{plan.name}</span>
              </div>
              <div className="text-right">
                <span className="text-white text-2xl font-black">${price}</span>
                <span className="text-gray-400 text-sm">/mo</span>
              </div>
            </div>

            <ul className="space-y-2 mb-5">
              {plan.features.map((f) => (
                <li key={f} className="flex items-center gap-2 text-gray-300 text-sm">
                  <FiCheck className="w-4 h-4 text-[#40B49D] flex-shrink-0" />
                  {f}
                </li>
              ))}
            </ul>

            <button
              onClick={() => handleUpgrade(requiredPlan)}
              disabled={loading}
              className={`w-full py-3 rounded-xl font-bold text-white bg-gradient-to-r ${plan.color} hover:opacity-90 transition-opacity disabled:opacity-50`}
            >
              {loading ? 'Loading...' : `Upgrade to ${plan.name}`}
            </button>
          </div>

          {/* Show Pro option if they need Starter */}
          {requiredPlan === 'starter' && (
            <button
              onClick={() => handleUpgrade('pro')}
              disabled={loading}
              className="w-full mt-3 py-2 text-sm text-gray-400 hover:text-white transition-colors"
            >
              Or upgrade to Pro for unlimited everything
            </button>
          )}

          {/* Footer */}
          <p className="text-center text-gray-500 text-xs mt-4">
            Cancel anytime. Prices in USD, taxes may apply.
          </p>
        </div>
      </div>
    </div>
  );
}

// Hook to easily use the modal
import { createContext, useContext, ReactNode } from 'react';

interface UpgradeModalContextType {
  showUpgradeModal: (feature: string, requiredPlan: 'starter' | 'pro') => void;
}

const UpgradeModalContext = createContext<UpgradeModalContextType | null>(null);

export function UpgradeModalProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [feature, setFeature] = useState('');
  const [requiredPlan, setRequiredPlan] = useState<'starter' | 'pro'>('starter');

  const showUpgradeModal = (feat: string, plan: 'starter' | 'pro') => {
    setFeature(feat);
    setRequiredPlan(plan);
    setIsOpen(true);
  };

  return (
    <UpgradeModalContext.Provider value={{ showUpgradeModal }}>
      {children}
      <UpgradeModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        feature={feature}
        requiredPlan={requiredPlan}
      />
    </UpgradeModalContext.Provider>
  );
}

export function useUpgradeModal() {
  const context = useContext(UpgradeModalContext);
  if (!context) {
    throw new Error('useUpgradeModal must be used within UpgradeModalProvider');
  }
  return context;
}
