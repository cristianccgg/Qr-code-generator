'use client';

import Navbar from '@/components/ui/Navbar';
import { FiCheck, FiX, FiZap, FiStar, FiAward } from 'react-icons/fi';
import Link from 'next/link';

const plans = [
  {
    name: 'Free',
    price: '$0',
    period: 'forever',
    description: 'Perfect for trying out and personal projects',
    icon: FiZap,
    color: 'from-gray-500 to-gray-600',
    features: [
      { name: 'Static QR codes', value: 'Unlimited', included: true },
      { name: 'Dynamic QR codes', value: '3', included: true },
      { name: 'Scans per month', value: '500', included: true },
      { name: 'PNG download (500px)', value: true, included: true },
      { name: 'Custom colors & logo', value: true, included: true },
      { name: 'Analytics', value: false, included: false },
      { name: 'SVG download', value: false, included: false },
      { name: 'PDF export', value: false, included: false },
      { name: 'Campaigns', value: false, included: false },
      { name: 'Bulk creation', value: false, included: false },
    ],
    cta: 'Get Started Free',
    ctaLink: '/auth/signup',
    popular: false,
  },
  {
    name: 'Starter',
    price: '$4',
    period: '/month',
    yearlyPrice: '$29/year',
    yearlySavings: 'Save $19',
    description: 'For creators and small businesses',
    icon: FiStar,
    color: 'from-[#40B49D] to-[#2d8b7a]',
    features: [
      { name: 'Static QR codes', value: 'Unlimited', included: true },
      { name: 'Dynamic QR codes', value: '25', included: true },
      { name: 'Scans per month', value: '5,000', included: true },
      { name: 'PNG download (1024px)', value: true, included: true },
      { name: 'Custom colors & logo', value: true, included: true },
      { name: 'Analytics', value: true, included: true },
      { name: 'SVG download', value: true, included: true },
      { name: 'PDF export', value: true, included: true },
      { name: 'Campaigns', value: true, included: true },
      { name: 'Bulk creation', value: false, included: false },
    ],
    cta: 'Start Starter Plan',
    ctaLink: '/auth/signup?plan=starter',
    popular: true,
  },
  {
    name: 'Pro',
    price: '$9',
    period: '/month',
    yearlyPrice: '$79/year',
    yearlySavings: 'Save $29',
    description: 'For professionals and growing teams',
    icon: FiAward,
    color: 'from-[#f5576c] to-[#8538a6]',
    features: [
      { name: 'Static QR codes', value: 'Unlimited', included: true },
      { name: 'Dynamic QR codes', value: '100', included: true },
      { name: 'Scans per month', value: 'Unlimited', included: true },
      { name: 'PNG download (2048px)', value: true, included: true },
      { name: 'Custom colors & logo', value: true, included: true },
      { name: 'Analytics', value: true, included: true },
      { name: 'SVG download', value: true, included: true },
      { name: 'PDF export', value: true, included: true },
      { name: 'Campaigns', value: true, included: true },
      { name: 'Bulk creation', value: true, included: true },
    ],
    cta: 'Start Pro Plan',
    ctaLink: '/auth/signup?plan=pro',
    popular: false,
  },
];

const comparisonFeatures = [
  { name: 'Static QR codes', free: 'Unlimited', starter: 'Unlimited', pro: 'Unlimited' },
  { name: 'Dynamic QR codes', free: '3', starter: '25', pro: '100' },
  { name: 'Scans per month', free: '500', starter: '5,000', pro: 'Unlimited' },
  { name: 'Analytics', free: false, starter: true, pro: true },
  { name: 'PNG resolution', free: '500px', starter: '1024px', pro: '2048px' },
  { name: 'SVG download', free: false, starter: true, pro: true },
  { name: 'PDF export', free: false, starter: true, pro: true },
  { name: 'Bulk creation (CSV)', free: false, starter: false, pro: true },
  { name: 'Label sheets PDF', free: false, starter: false, pro: true },
  { name: 'All QR styles', free: true, starter: true, pro: true },
  { name: 'Logo in QR', free: true, starter: true, pro: true },
  { name: 'Gradients', free: true, starter: true, pro: true },
  { name: 'Campaigns', free: false, starter: true, pro: true },
  { name: 'Priority support', free: false, starter: true, pro: true },
];

export default function PricingPage() {
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
          <div className="text-center mb-16 animate-fadeIn">
            <h1 className="text-white text-4xl md:text-5xl font-black mb-4 drop-shadow-2xl">
              Simple, Transparent Pricing
            </h1>
            <p className="text-white/90 text-lg md:text-xl font-medium max-w-2xl mx-auto">
              Start free, upgrade when you need more. No hidden fees, no surprises.
            </p>
          </div>

          {/* Pricing Cards */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto mb-20">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className={`relative bg-white/10 backdrop-blur-lg rounded-3xl border ${
                  plan.popular ? 'border-white/50 scale-105' : 'border-white/20'
                } shadow-2xl overflow-hidden transition-all hover:scale-105 hover:border-white/40`}
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
                    <span className="text-white text-4xl font-black">{plan.price}</span>
                    <span className="text-white/70 text-lg ml-1">{plan.period}</span>
                  </div>

                  {/* Yearly option */}
                  {plan.yearlyPrice && (
                    <div className="mb-4">
                      <span className="text-white/60 text-sm">{plan.yearlyPrice}</span>
                      <span className="ml-2 text-[#40B49D] text-sm font-semibold">{plan.yearlySavings}</span>
                    </div>
                  )}

                  {/* Description */}
                  <p className="text-white/70 text-sm mb-6">{plan.description}</p>

                  {/* CTA Button */}
                  <Link
                    href={plan.ctaLink}
                    className={`block w-full py-3 px-4 rounded-xl text-center font-bold transition-all ${
                      plan.popular
                        ? 'bg-gradient-to-r from-[#40B49D] to-[#2d8b7a] text-white hover:shadow-lg hover:shadow-[#40B49D]/30'
                        : plan.badge
                        ? 'bg-gradient-to-r from-[#f2cb57] to-[#e6a919] text-gray-900 hover:shadow-lg hover:shadow-[#f2cb57]/30'
                        : 'bg-white/20 text-white hover:bg-white/30'
                    }`}
                  >
                    {plan.cta}
                  </Link>

                  {/* Features list */}
                  <ul className="mt-6 space-y-3">
                    {plan.features.map((feature) => (
                      <li key={feature.name} className="flex items-center gap-3">
                        {feature.included ? (
                          <FiCheck className="w-5 h-5 text-[#40B49D] flex-shrink-0" />
                        ) : (
                          <FiX className="w-5 h-5 text-white/30 flex-shrink-0" />
                        )}
                        <span className={`text-sm ${feature.included ? 'text-white' : 'text-white/40'}`}>
                          {feature.name}
                          {typeof feature.value === 'string' && feature.included && (
                            <span className="text-white/60 ml-1">({feature.value})</span>
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
          <div className="max-w-6xl mx-auto mb-20">
            <h2 className="text-white text-3xl font-bold text-center mb-8">
              Compare All Features
            </h2>
            <div className="bg-white/10 backdrop-blur-lg rounded-3xl border border-white/20 shadow-2xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/20">
                      <th className="text-left text-white font-bold p-4">Feature</th>
                      <th className="text-center text-white font-bold p-4">Free</th>
                      <th className="text-center text-white font-bold p-4 bg-white/10">Starter</th>
                      <th className="text-center text-white font-bold p-4">Pro</th>
                    </tr>
                  </thead>
                  <tbody>
                    {comparisonFeatures.map((feature, index) => (
                      <tr
                        key={feature.name}
                        className={index % 2 === 0 ? 'bg-white/5' : ''}
                      >
                        <td className="text-white/90 p-4 font-medium">{feature.name}</td>
                        <td className="text-center p-4">
                          {typeof feature.free === 'boolean' ? (
                            feature.free ? (
                              <FiCheck className="w-5 h-5 text-[#40B49D] mx-auto" />
                            ) : (
                              <FiX className="w-5 h-5 text-white/30 mx-auto" />
                            )
                          ) : (
                            <span className="text-white/80">{feature.free}</span>
                          )}
                        </td>
                        <td className="text-center p-4 bg-white/10">
                          {typeof feature.starter === 'boolean' ? (
                            feature.starter ? (
                              <FiCheck className="w-5 h-5 text-[#40B49D] mx-auto" />
                            ) : (
                              <FiX className="w-5 h-5 text-white/30 mx-auto" />
                            )
                          ) : (
                            <span className="text-white font-semibold">{feature.starter}</span>
                          )}
                        </td>
                        <td className="text-center p-4">
                          {typeof feature.pro === 'boolean' ? (
                            feature.pro ? (
                              <FiCheck className="w-5 h-5 text-[#40B49D] mx-auto" />
                            ) : (
                              <FiX className="w-5 h-5 text-white/30 mx-auto" />
                            )
                          ) : (
                            <span className="text-white/80">{feature.pro}</span>
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
                  q: 'Why is analytics only available on paid plans?',
                  a: "Analytics requires server resources to track and store scan data. Paid plans help us maintain this infrastructure while keeping the basic QR generator free for everyone.",
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
          <p>Made with ❤️ for everyone who needs a simple QR code</p>
        </footer>
      </div>
    </div>
  );
}
