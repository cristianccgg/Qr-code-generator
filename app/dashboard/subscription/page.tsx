'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { FiCheck, FiX, FiExternalLink, FiCreditCard, FiArrowUp, FiCalendar, FiLoader } from 'react-icons/fi'
import { PLANS, FEATURE_LABELS, type PlanId, type Feature } from '@/lib/plans'

interface SubscriptionData {
  plan: {
    id: string
    name: string
    description: string
  }
  isActive: boolean
  billingCycle?: 'MONTHLY' | 'YEARLY'
  currentPeriodEnd?: string
  cancelAtPeriodEnd?: boolean
  usage: {
    dynamicQRs: { used: number; limit: number; unlimited: boolean }
    scans: { used: number; limit: number; unlimited: boolean }
  }
}

export default function SubscriptionPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [subscription, setSubscription] = useState<SubscriptionData | null>(null)
  const [loading, setLoading] = useState(true)
  const [portalLoading, setPortalLoading] = useState(false)
  const [checkoutLoading, setCheckoutLoading] = useState<string | null>(null)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin')
    }
  }, [status, router])

  useEffect(() => {
    async function fetchSubscription() {
      try {
        const res = await fetch('/api/subscription')
        if (res.ok) {
          const data = await res.json()
          setSubscription(data)
        }
      } catch (error) {
        console.error('Failed to fetch subscription:', error)
      } finally {
        setLoading(false)
      }
    }

    if (session?.user) {
      fetchSubscription()
    }
  }, [session])

  const handleManageBilling = async () => {
    setPortalLoading(true)
    try {
      const res = await fetch('/api/subscription/portal', { method: 'POST' })
      const data = await res.json()
      if (data.portalUrl) {
        window.open(data.portalUrl, '_blank')
      } else {
        alert('Could not open billing portal. Please try again.')
      }
    } catch (error) {
      console.error('Failed to get portal URL:', error)
      alert('Could not open billing portal. Please try again.')
    } finally {
      setPortalLoading(false)
    }
  }

  const handleUpgrade = async (planId: string) => {
    if (!subscription) return

    setCheckoutLoading(planId)
    try {
      const billingCycle = subscription.billingCycle?.toLowerCase() || 'monthly'
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planId, billingCycle }),
      })
      const data = await res.json()
      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl
      } else {
        alert('Could not start checkout. Please try again.')
      }
    } catch (error) {
      console.error('Failed to create checkout:', error)
      alert('Could not start checkout. Please try again.')
    } finally {
      setCheckoutLoading(null)
    }
  }

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <FiLoader className="animate-spin text-4xl text-gray-400" />
      </div>
    )
  }

  if (!subscription) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500">Failed to load subscription data</p>
      </div>
    )
  }

  const currentPlan = PLANS[subscription.plan.id as PlanId] || PLANS.free
  const isFreePlan = subscription.plan.id === 'free'
  const isStarterPlan = subscription.plan.id === 'starter'
  const isProPlan = subscription.plan.id === 'pro'

  const allFeatures: Feature[] = [
    'dynamic_qr',
    'logo',
    'svg_download',
    'pdf_export',
    'analytics_basic',
    'analytics_advanced',
    'campaigns',
    'bulk_creation',
    'high_resolution',
  ]

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Subscription</h1>
        <p className="text-gray-600 mb-8">Manage your plan and billing</p>

        {/* Current Plan Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h2 className="text-xl font-semibold text-gray-900">
                  {currentPlan.name} Plan
                </h2>
                {subscription.isActive && !isFreePlan && (
                  <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                    Active
                  </span>
                )}
                {subscription.cancelAtPeriodEnd && (
                  <span className="px-2 py-1 bg-orange-100 text-orange-700 text-xs font-medium rounded-full">
                    Cancels at period end
                  </span>
                )}
              </div>
              <p className="text-gray-600">{currentPlan.description}</p>

              {!isFreePlan && subscription.currentPeriodEnd && (
                <div className="flex items-center gap-2 mt-3 text-sm text-gray-500">
                  <FiCalendar />
                  <span>
                    {subscription.cancelAtPeriodEnd ? 'Access until' : 'Renews'}{' '}
                    {new Date(subscription.currentPeriodEnd).toLocaleDateString('en-US', {
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </span>
                  {subscription.billingCycle && (
                    <span className="text-gray-400">
                      ({subscription.billingCycle === 'YEARLY' ? 'Yearly' : 'Monthly'} billing)
                    </span>
                  )}
                </div>
              )}
            </div>

            <div className="text-right">
              <div className="text-3xl font-bold text-gray-900">
                ${currentPlan.monthlyPriceCents / 100}
                <span className="text-base font-normal text-gray-500">/mo</span>
              </div>
              {currentPlan.yearlyPriceCents > 0 && (
                <p className="text-sm text-gray-500">
                  or ${currentPlan.yearlyPriceCents / 100}/year
                </p>
              )}
            </div>
          </div>

          {/* Manage Billing Button */}
          {!isFreePlan && (
            <div className="mt-6 pt-6 border-t border-gray-100">
              <button
                onClick={handleManageBilling}
                disabled={portalLoading}
                className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors disabled:opacity-50"
              >
                {portalLoading ? (
                  <FiLoader className="animate-spin" />
                ) : (
                  <FiCreditCard />
                )}
                Manage Billing
                <FiExternalLink size={14} />
              </button>
              <p className="text-xs text-gray-500 mt-2">
                Update payment method, view invoices, or cancel subscription
              </p>
            </div>
          )}
        </div>

        {/* Usage Stats */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <h3 className="font-semibold text-gray-900 mb-4">Current Usage</h3>
          <div className="grid grid-cols-2 gap-6">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">Dynamic QR Codes</span>
                <span className="font-medium">
                  {subscription.usage.dynamicQRs.used}
                  {subscription.usage.dynamicQRs.unlimited
                    ? ' / Unlimited'
                    : ` / ${subscription.usage.dynamicQRs.limit}`}
                </span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
                  style={{
                    width: subscription.usage.dynamicQRs.unlimited
                      ? '10%'
                      : `${Math.min((subscription.usage.dynamicQRs.used / subscription.usage.dynamicQRs.limit) * 100, 100)}%`,
                  }}
                />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">Monthly Scans</span>
                <span className="font-medium">
                  {subscription.usage.scans.used}
                  {subscription.usage.scans.unlimited
                    ? ' / Unlimited'
                    : ` / ${subscription.usage.scans.limit}`}
                </span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-500 to-cyan-500"
                  style={{
                    width: subscription.usage.scans.unlimited
                      ? '10%'
                      : `${Math.min((subscription.usage.scans.used / subscription.usage.scans.limit) * 100, 100)}%`,
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Upgrade Options */}
        {!isProPlan && (
          <div className="mb-8">
            <h3 className="font-semibold text-gray-900 mb-4">
              {isFreePlan ? 'Choose a Plan' : 'Upgrade Your Plan'}
            </h3>
            <div className="grid md:grid-cols-2 gap-4">
              {/* Starter Plan Card */}
              {!isStarterPlan && (
                <div className={`bg-white rounded-xl border-2 p-6 ${isFreePlan ? 'border-blue-200' : 'border-gray-200'}`}>
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h4 className="font-semibold text-gray-900">Starter</h4>
                      <p className="text-sm text-gray-500">For creators</p>
                    </div>
                    <div className="text-right">
                      <span className="text-2xl font-bold">$5</span>
                      <span className="text-gray-500">/mo</span>
                    </div>
                  </div>
                  <ul className="space-y-2 mb-4 text-sm">
                    <li className="flex items-center gap-2 text-gray-600">
                      <FiCheck className="text-green-500" /> 15 Dynamic QRs
                    </li>
                    <li className="flex items-center gap-2 text-gray-600">
                      <FiCheck className="text-green-500" /> 5,000 scans/month
                    </li>
                    <li className="flex items-center gap-2 text-gray-600">
                      <FiCheck className="text-green-500" /> Logo & SVG export
                    </li>
                    <li className="flex items-center gap-2 text-gray-600">
                      <FiCheck className="text-green-500" /> Basic analytics
                    </li>
                  </ul>
                  <button
                    onClick={() => handleUpgrade('starter')}
                    disabled={checkoutLoading === 'starter'}
                    className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {checkoutLoading === 'starter' ? (
                      <FiLoader className="animate-spin" />
                    ) : (
                      <>
                        <FiArrowUp /> Get Starter
                      </>
                    )}
                  </button>
                </div>
              )}

              {/* Pro Plan Card */}
              <div className="bg-white rounded-xl border-2 border-purple-200 p-6 relative">
                <div className="absolute -top-3 left-4 px-3 py-1 bg-purple-600 text-white text-xs font-medium rounded-full">
                  Most Popular
                </div>
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h4 className="font-semibold text-gray-900">Pro</h4>
                    <p className="text-sm text-gray-500">For professionals</p>
                  </div>
                  <div className="text-right">
                    <span className="text-2xl font-bold">$12</span>
                    <span className="text-gray-500">/mo</span>
                  </div>
                </div>
                <ul className="space-y-2 mb-4 text-sm">
                  <li className="flex items-center gap-2 text-gray-600">
                    <FiCheck className="text-green-500" /> Unlimited Dynamic QRs
                  </li>
                  <li className="flex items-center gap-2 text-gray-600">
                    <FiCheck className="text-green-500" /> Unlimited scans
                  </li>
                  <li className="flex items-center gap-2 text-gray-600">
                    <FiCheck className="text-green-500" /> PDF export & campaigns
                  </li>
                  <li className="flex items-center gap-2 text-gray-600">
                    <FiCheck className="text-green-500" /> Bulk creation
                  </li>
                  <li className="flex items-center gap-2 text-gray-600">
                    <FiCheck className="text-green-500" /> Advanced analytics
                  </li>
                </ul>
                <button
                  onClick={() => handleUpgrade('pro')}
                  disabled={checkoutLoading === 'pro'}
                  className="w-full py-2 px-4 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {checkoutLoading === 'pro' ? (
                    <FiLoader className="animate-spin" />
                  ) : (
                    <>
                      <FiArrowUp /> {isStarterPlan ? 'Upgrade to Pro' : 'Get Pro'}
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Feature Comparison */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Your Features</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {allFeatures.map((feature) => {
              const hasFeature = currentPlan.features.includes(feature)
              return (
                <div
                  key={feature}
                  className={`flex items-center gap-3 p-3 rounded-lg ${
                    hasFeature ? 'bg-green-50' : 'bg-gray-50'
                  }`}
                >
                  {hasFeature ? (
                    <FiCheck className="text-green-600 flex-shrink-0" />
                  ) : (
                    <FiX className="text-gray-400 flex-shrink-0" />
                  )}
                  <span className={hasFeature ? 'text-gray-900' : 'text-gray-500'}>
                    {FEATURE_LABELS[feature]}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
