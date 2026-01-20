'use client'

import { useEffect, useState } from 'react'
import { FiZap, FiActivity, FiArrowUp, FiSettings } from 'react-icons/fi'
import Link from 'next/link'

interface SubscriptionStatus {
  plan: {
    id: string
    name: string
    description: string
  }
  isActive: boolean
  usage: {
    dynamicQRs: {
      used: number
      limit: number
      unlimited: boolean
      percentage: number
    }
    scans: {
      used: number
      limit: number
      unlimited: boolean
      percentage: number
    }
  }
  features: {
    dynamicQR: boolean
    logo: boolean
    svgDownload: boolean
    pdfExport: boolean
    analyticsBasic: boolean
    analyticsAdvanced: boolean
    campaigns: boolean
    bulkCreation: boolean
    highResolution: boolean
  }
  maxResolution: number
}

export default function UsageLimitsCard() {
  const [status, setStatus] = useState<SubscriptionStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchStatus() {
      try {
        const res = await fetch('/api/subscription')
        if (!res.ok) throw new Error('Failed to fetch')
        const data = await res.json()
        setStatus(data)
      } catch (err) {
        setError('Failed to load subscription status')
      } finally {
        setLoading(false)
      }
    }
    fetchStatus()
  }, [])

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
        <div className="space-y-3">
          <div className="h-4 bg-gray-200 rounded w-full"></div>
          <div className="h-4 bg-gray-200 rounded w-full"></div>
        </div>
      </div>
    )
  }

  if (error || !status) {
    return null
  }

  const planColors: Record<string, string> = {
    free: 'from-gray-400 to-gray-500',
    starter: 'from-blue-500 to-cyan-500',
    pro: 'from-purple-500 to-pink-500',
  }

  const planBadgeColors: Record<string, string> = {
    free: 'bg-gray-100 text-gray-700',
    starter: 'bg-blue-100 text-blue-700',
    pro: 'bg-purple-100 text-purple-700',
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className={`bg-gradient-to-r ${planColors[status.plan.id] || planColors.free} p-6`}>
        <div className="flex items-center justify-between">
          <div>
            <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${planBadgeColors[status.plan.id] || planBadgeColors.free} bg-white/90`}>
              {status.plan.name} Plan
            </span>
            <p className="text-white/90 text-sm mt-2">{status.plan.description}</p>
          </div>
          <div className="flex items-center gap-2">
            {status.plan.id === 'free' ? (
              <Link
                href="/pricing"
                className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg text-sm font-medium text-gray-900 hover:bg-gray-50 transition-colors"
              >
                <FiArrowUp className="text-purple-600" />
                Upgrade
              </Link>
            ) : (
              <Link
                href="/dashboard/subscription"
                className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg text-sm font-medium text-white transition-colors"
              >
                <FiSettings />
                Manage
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Usage Stats */}
      <div className="p-6 space-y-6">
        {/* Dynamic QRs */}
        <UsageBar
          icon={FiZap}
          label="Dynamic QR Codes"
          used={status.usage.dynamicQRs.used}
          limit={status.usage.dynamicQRs.limit}
          unlimited={status.usage.dynamicQRs.unlimited}
          percentage={status.usage.dynamicQRs.percentage}
          color="bg-gradient-to-r from-[#f5576c] to-[#f093fb]"
        />

        {/* Scans */}
        <UsageBar
          icon={FiActivity}
          label="Monthly Scans"
          used={status.usage.scans.used}
          limit={status.usage.scans.limit}
          unlimited={status.usage.scans.unlimited}
          percentage={status.usage.scans.percentage}
          color="bg-gradient-to-r from-[#4facfe] to-[#00f2fe]"
          sublabel="Resets monthly"
        />

        {/* Features Summary */}
        {status.plan.id !== 'pro' && (
          <div className="pt-4 border-t border-gray-100">
            <p className="text-sm text-gray-600 mb-3">Upgrade to unlock:</p>
            <div className="flex flex-wrap gap-2">
              {!status.features.dynamicQR && (
                <FeatureBadge label="Dynamic QRs" />
              )}
              {!status.features.analyticsBasic && (
                <FeatureBadge label="Analytics" />
              )}
              {!status.features.campaigns && (
                <FeatureBadge label="Campaigns" />
              )}
              {!status.features.bulkCreation && (
                <FeatureBadge label="Bulk Creation" />
              )}
              {!status.features.pdfExport && (
                <FeatureBadge label="PDF Export" />
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function UsageBar({
  icon: Icon,
  label,
  used,
  limit,
  unlimited,
  percentage,
  color,
  sublabel,
}: {
  icon: any
  label: string
  used: number
  limit: number
  unlimited: boolean
  percentage: number
  color: string
  sublabel?: string
}) {
  const isNearLimit = percentage >= 80 && !unlimited
  const isAtLimit = percentage >= 100 && !unlimited

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Icon className="text-gray-500" />
          <span className="text-sm font-medium text-gray-700">{label}</span>
        </div>
        <span className={`text-sm font-semibold ${isAtLimit ? 'text-red-600' : isNearLimit ? 'text-orange-600' : 'text-gray-900'}`}>
          {used.toLocaleString()} / {unlimited ? '∞' : limit.toLocaleString()}
        </span>
      </div>
      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
        <div
          className={`h-full ${isAtLimit ? 'bg-red-500' : isNearLimit ? 'bg-orange-500' : color} transition-all duration-500`}
          style={{ width: unlimited ? '10%' : `${Math.min(percentage, 100)}%` }}
        />
      </div>
      {sublabel && (
        <p className="text-xs text-gray-500 mt-1">{sublabel}</p>
      )}
      {isAtLimit && (
        <p className="text-xs text-red-600 mt-1 font-medium">
          Limit reached. <Link href="/pricing" className="underline">Upgrade</Link> for more.
        </p>
      )}
    </div>
  )
}

function FeatureBadge({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center gap-1 px-2 py-1 bg-purple-50 text-purple-700 text-xs font-medium rounded">
      <FiZap className="text-purple-500" size={12} />
      {label}
    </span>
  )
}
