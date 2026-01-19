'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/ui/Navbar';
import { FiCheck, FiX, FiZap, FiStar, FiAward, FiLoader } from 'react-icons/fi';
import Link from 'next/link';

const plans = [
  {
    name: 'Free',
    monthlyPrice: 0,
    yearlyPrice: 0,
    yearlySavings: null,
    description: 'Create unlimited static QR codes',
    icon: FiZap,
    color: 'from-gray-500 to-gray-600',
    features: [
      { name: 'Static QR codes', value: 'Unlimited', included: true },
      { name: 'Dynamic QR codes', value: false, included: false },
      { name: 'PNG download (500px)', value: true, included: true },
      { name: 'Custom colors & styles', value: true, included: true },
      { name: 'Logo in QR', value: false, included: false },
      { name: 'Analytics', value: false, included: false },
      { name: 'SVG download', value: false, included: false },
      { name: 'PDF export', value: false, included: false },
      { name: 'Campaigns', value: false, included: false },
      { name: 'Bulk creation', value: false, included: false },
    ],
    cta: 'Get Started Free',
    ctaLink: '/auth/signup',
    popular: false,
    badge: undefined,
    hasBilling: false,
  },
  {
    name: 'Starter',
    monthlyPrice: 5,
    yearlyPrice: 49,
    yearlySavings: 18,
    description: 'For creators and small businesses',
    icon: FiStar,
    color: 'from-[#40B49D] to-[#2d8b7a]',
    features: [
      { name: 'Static QR codes', value: 'Unlimited', included: true },
      { name: 'Dynamic QR codes', value: '15', included: true },
      { name: 'Scans per month', value: '5,000', included: true },
      { name: 'PNG download (1024px)', value: true, included: true },
      { name: 'Logo in QR', value: true, included: true },
      { name: 'Analytics (scan count)', value: true, included: true },
      { name: 'SVG download', value: true, included: true },
      { name: 'PDF export', value: false, included: false },
      { name: 'Campaigns', value: false, included: false },
      { name: 'Bulk creation', value: false, included: false },
    ],
    cta: 'Start Starter Plan',
    ctaLink: '/auth/signup?plan=starter',
    popular: true,
    badge: undefined,
    hasBilling: true,
  },
  {
    name: 'Pro',
    monthlyPrice: 12,
    yearlyPrice: 119,
    yearlySavings: 17,
    description: 'For professionals and growing teams',
    icon: FiAward,
    color: 'from-[#f5576c] to-[#8538a6]',
    features: [
      { name: 'Static QR codes', value: 'Unlimited', included: true },
      { name: 'Dynamic QR codes', value: 'Unlimited', included: true },
      { name: 'Scans per month', value: 'Unlimited', included: true },
      { name: 'PNG download (2048px)', value: true, included: true },
      { name: 'Logo in QR', value: true, included: true },
      { name: 'Advanced analytics', value: true, included: true },
      { name: 'SVG download', value: true, included: true },
      { name: 'PDF export & labels', value: true, included: true },
      { name: 'Campaigns', value: true, included: true },
      { name: 'Bulk creation', value: true, included: true },
    ],
    cta: 'Start Pro Plan',
    ctaLink: '/auth/signup?plan=pro',
    popular: false,
    badge: 'Best Value',
    hasBilling: true,
  },
];

const comparisonFeatures = [
  { name: 'Static QR codes', free: 'Unlimited', starter: 'Unlimited', pro: 'Unlimited' },
  { name: 'Dynamic QR codes', free: '-', starter: '15', pro: 'Unlimited' },
  { name: 'Scans per month', free: '-', starter: '5,000', pro: 'Unlimited' },
  { name: 'PNG resolution', free: '500px', starter: '1024px', pro: '2048px' },
  { name: 'All QR styles', free: true, starter: true, pro: true },
  { name: 'Gradients', free: true, starter: true, pro: true },
  { name: 'Logo in QR', free: false, starter: true, pro: true },
  { name: 'SVG download', free: false, starter: true, pro: true },
  { name: 'Analytics (scan count)', free: false, starter: true, pro: true },
  { name: 'Advanced analytics', free: false, starter: false, pro: true },
  { name: 'PDF export', free: false, starter: false, pro: true },
  { name: 'Label sheets PDF', free: false, starter: false, pro: true },
  { name: 'Campaigns', free: false, starter: false, pro: true },
  { name: 'Bulk creation (CSV)', free: false, starter: false, pro: true },
  { name: 'Priority support', free: false, starter: true, pro: true },
];

export default function PricingPage() {
  const [isYearly, setIsYearly] = useState(true);
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const { data: session, status } = useSession();
  const router = useRouter();

  const handleSubscribe = async (planId: string) => {
    // For free plan, just redirect to signup
    if (planId === 'free') {
      router.push('/auth/signup');
      return;
    }

    // If not logged in, redirect to signup with plan info
    if (status !== 'authenticated') {
      router.push(`/auth/signup?plan=${planId}&billing=${isYearly ? 'yearly' : 'monthly'}`);
      return;
    }

    // Create checkout session
    setLoadingPlan(planId);
    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          planId,
          billingCycle: isYearly ? 'yearly' : 'monthly',
        }),
      });

      const data = await response.json();

      if (data.checkoutUrl) {
        // Redirect to Lemon Squeezy checkout
        window.location.href = data.checkoutUrl;
      } else {
        console.error('Checkout error:', data.error);
        alert(data.error || 'Failed to create checkout. Please try again.');
      }
    } catch (error) {
      console.error('Checkout error:', error);
      alert('Something went wrong. Please try again.');
    } finally {
      setLoadingPlan(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f5576c] via-[#8538a6] to-[#7386bf] relative overflow-hidden">
      {/* Animated background blobs */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-[#40B49D]/30 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-[#f2cb57]/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-white/5 rounded-full blur-3xl"></div>

      {/* Content */}
      <div className="relative z-10">
        <Navbar />

        <main className="container mx-auto px-4 py-12">
          {/* Hero Section */}
          <div className="text-center mb-10 animate-fadeIn">
            <h1 className="text-white text-4xl md:text-5xl font-black mb-4 drop-shadow-2xl">
              Simple, Transparent Pricing
            </h1>
            <p className="text-white/90 text-lg md:text-xl font-medium max-w-2xl mx-auto">
              Start free, upgrade when you need more. No hidden fees, no surprises.
            </p>
          </div>

          {/* Billing Toggle */}
          <div className="flex flex-col items-center gap-2 mb-12">
            <div className="flex items-center gap-3">
              <span className={`text-sm font-medium transition-colors ${!isYearly ? 'text-white' : 'text-white/50'}`}>
                Monthly
              </span>
              <button
                onClick={() => setIsYearly(!isYearly)}
                className={`relative w-14 h-7 rounded-full transition-colors ${
                  isYearly ? 'bg-[#40B49D]' : 'bg-white/30'
                }`}
              >
                <span
                  className={`absolute top-0.5 left-0.5 w-6 h-6 bg-white rounded-full shadow-md transition-transform duration-200 ${
                    isYearly ? 'translate-x-7' : 'translate-x-0'
                  }`}
                />
              </button>
              <span className={`text-sm font-medium transition-colors ${isYearly ? 'text-white' : 'text-white/50'}`}>
                Yearly
              </span>
            </div>
            <span className={`text-sm font-bold text-[#40B49D] h-5 transition-opacity duration-300 ${isYearly ? 'opacity-100' : 'opacity-0'}`}>
              Save up to 17%
            </span>
            <span className="text-white/50 text-xs mt-1">
              Prices in USD. Taxes may apply at checkout.
            </span>
          </div>

          {/* Pricing Cards */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto mb-20">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className={`relative bg-gray-900/90 backdrop-blur-lg rounded-3xl border ${
                  plan.popular ? 'border-[#40B49D] scale-105 ring-2 ring-[#40B49D]/30' : 'border-gray-700'
                } shadow-2xl overflow-hidden transition-all hover:scale-105 hover:border-gray-500`}
              >
                {/* Popular badge */}
                {plan.popular && (
                  <div className="absolute top-0 left-0 right-0 bg-gradient-to-r from-[#40B49D] to-[#2d8b7a] text-white text-center py-2 text-sm font-bold">
                    Most Popular
                  </div>
                )}

                {/* Best Value badge */}
                {plan.badge && (
                  <div className="absolute top-0 left-0 right-0 bg-gradient-to-r from-[#f2cb57] to-[#e6a919] text-gray-900 text-center py-2 text-sm font-bold">
                    {plan.badge}
                  </div>
                )}

                <div className={`p-6 ${plan.popular || plan.badge ? 'pt-12' : ''}`}>
                  {/* Plan icon and name */}
                  <div className="flex items-center gap-3 mb-4">
                    <div className={`p-2 rounded-xl bg-gradient-to-r ${plan.color}`}>
                      <plan.icon className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="text-white text-xl font-bold">{plan.name}</h3>
                  </div>

                  {/* Price */}
                  <div className="mb-2">
                    {plan.hasBilling ? (
                      <>
                        <span className="text-white text-4xl font-black">
                          ${isYearly ? Math.round(plan.yearlyPrice / 12) : plan.monthlyPrice}
                        </span>
                        <span className="text-white/70 text-lg ml-1">/month</span>
                      </>
                    ) : (
                      <>
                        <span className="text-white text-4xl font-black">$0</span>
                        <span className="text-white/70 text-lg ml-1">forever</span>
                      </>
                    )}
                  </div>

                  {/* Yearly billing info */}
                  {plan.hasBilling && (
                    <div className="mb-4 h-6">
                      {isYearly ? (
                        <>
                          <span className="text-white/60 text-sm">${plan.yearlyPrice} billed yearly</span>
                          <span className="ml-2 text-[#40B49D] text-sm font-semibold">
                            Save {plan.yearlySavings}%
                          </span>
                        </>
                      ) : (
                        <span className="text-white/60 text-sm">${plan.monthlyPrice * 12}/year if monthly</span>
                      )}
                    </div>
                  )}

                  {/* Spacer for Free plan */}
                  {!plan.hasBilling && <div className="mb-4 h-6" />}

                  {/* Description */}
                  <p className="text-white/70 text-sm mb-6">{plan.description}</p>

                  {/* CTA Button */}
                  <button
                    onClick={() => handleSubscribe(plan.name.toLowerCase())}
                    disabled={loadingPlan === plan.name.toLowerCase()}
                    className={`block w-full py-3 px-4 rounded-xl text-center font-bold transition-all disabled:opacity-70 disabled:cursor-not-allowed ${
                      plan.popular
                        ? 'bg-gradient-to-r from-[#40B49D] to-[#2d8b7a] text-white hover:shadow-lg hover:shadow-[#40B49D]/30'
                        : plan.badge
                        ? 'bg-gradient-to-r from-[#f2cb57] to-[#e6a919] text-gray-900 hover:shadow-lg hover:shadow-[#f2cb57]/30'
                        : 'bg-white/20 text-white hover:bg-white/30'
                    }`}
                  >
                    {loadingPlan === plan.name.toLowerCase() ? (
                      <span className="flex items-center justify-center gap-2">
                        <FiLoader className="animate-spin" />
                        Processing...
                      </span>
                    ) : (
                      plan.cta
                    )}
                  </button>

                  {/* Features list */}
                  <ul className="mt-6 space-y-3">
                    {plan.features.map((feature) => (
                      <li key={feature.name} className="flex items-center gap-3">
                        {feature.included ? (
                          <FiCheck className="w-5 h-5 text-[#40B49D] flex-shrink-0" />
                        ) : (
                          <FiX className="w-5 h-5 text-gray-600 flex-shrink-0" />
                        )}
                        <span className={`text-sm ${feature.included ? 'text-gray-100' : 'text-gray-500'}`}>
                          {feature.name}
                          {typeof feature.value === 'string' && feature.included && (
                            <span className="text-gray-400 ml-1">({feature.value})</span>
                          )}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>

          {/* Comparison Table */}
          <div className="max-w-4xl mx-auto mb-20">
            <h2 className="text-white text-3xl font-bold text-center mb-8">
              Compare All Features
            </h2>
            <div className="bg-gray-900/95 backdrop-blur-lg rounded-3xl border border-gray-700 shadow-2xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-700 bg-gray-800/50">
                      <th className="text-left text-gray-100 font-bold p-4">Feature</th>
                      <th className="text-center text-gray-100 font-bold p-4 w-24">Free</th>
                      <th className="text-center text-gray-100 font-bold p-4 w-24 bg-[#40B49D]/10 border-x border-[#40B49D]/30">Starter</th>
                      <th className="text-center text-gray-100 font-bold p-4 w-24">Pro</th>
                    </tr>
                  </thead>
                  <tbody>
                    {comparisonFeatures.map((feature, index) => (
                      <tr
                        key={feature.name}
                        className={`border-b border-gray-800 ${index % 2 === 0 ? 'bg-gray-800/30' : ''}`}
                      >
                        <td className="text-gray-200 p-4 font-medium">{feature.name}</td>
                        <td className="text-center p-4">
                          {typeof feature.free === 'boolean' ? (
                            feature.free ? (
                              <FiCheck className="w-5 h-5 text-[#40B49D] mx-auto" />
                            ) : (
                              <FiX className="w-5 h-5 text-gray-600 mx-auto" />
                            )
                          ) : (
                            <span className="text-gray-300 text-sm">{feature.free}</span>
                          )}
                        </td>
                        <td className="text-center p-4 bg-[#40B49D]/5 border-x border-[#40B49D]/20">
                          {typeof feature.starter === 'boolean' ? (
                            feature.starter ? (
                              <FiCheck className="w-5 h-5 text-[#40B49D] mx-auto" />
                            ) : (
                              <FiX className="w-5 h-5 text-gray-600 mx-auto" />
                            )
                          ) : (
                            <span className="text-white font-semibold text-sm">{feature.starter}</span>
                          )}
                        </td>
                        <td className="text-center p-4">
                          {typeof feature.pro === 'boolean' ? (
                            feature.pro ? (
                              <FiCheck className="w-5 h-5 text-[#40B49D] mx-auto" />
                            ) : (
                              <FiX className="w-5 h-5 text-gray-600 mx-auto" />
                            )
                          ) : (
                            <span className="text-gray-300 text-sm">{feature.pro}</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* FAQ Section */}
          <div className="max-w-3xl mx-auto">
            <h2 className="text-white text-3xl font-bold text-center mb-8">
              Frequently Asked Questions
            </h2>
            <div className="space-y-4">
              {[
                {
                  q: "What's the difference between static and dynamic QR codes?",
                  a: "Static QR codes have the content encoded directly and can't be changed after creation. Dynamic QR codes redirect through our system, so you can change the destination URL anytime without reprinting the QR code.",
                },
                {
                  q: 'What happens if I reach my scan limit?',
                  a: 'Your QR codes will continue to work, but scans beyond your limit won\'t be tracked. You can upgrade anytime to increase your limits.',
                },
                {
                  q: 'Can I upgrade or downgrade my plan?',
                  a: "Yes! You can change your plan at any time. When upgrading, you'll get immediate access to new features. When downgrading, the change takes effect at your next billing cycle.",
                },
                {
                  q: 'What analytics are included in each plan?',
                  a: 'Starter includes total scan counts for each QR code. Pro adds detailed breakdowns by location (country, city), device type (mobile, tablet, desktop), browser, and operating system.',
                },
                {
                  q: 'Do you offer refunds?',
                  a: 'Yes, we offer a 14-day money-back guarantee on all paid plans. If you\'re not satisfied, contact us for a full refund.',
                },
              ].map((faq, index) => (
                <div
                  key={index}
                  className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 p-6"
                >
                  <h3 className="text-white font-bold mb-2">{faq.q}</h3>
                  <p className="text-white/70">{faq.a}</p>
                </div>
              ))}
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="text-center py-8 text-white/60 text-sm">
          <p>Made with care for everyone who needs a simple QR code</p>
        </footer>
      </div>
    </div>
  );
}
