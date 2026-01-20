'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { FiCheck, FiArrowRight, FiZap, FiActivity, FiGrid, FiDownload, FiLoader } from 'react-icons/fi'
import confetti from 'canvas-confetti'

export default function CheckoutSuccessPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [planName, setPlanName] = useState<string>('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin')
    }
  }, [status, router])

  useEffect(() => {
    // Trigger confetti on mount
    const duration = 3 * 1000
    const animationEnd = Date.now() + duration
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 }

    function randomInRange(min: number, max: number) {
      return Math.random() * (max - min) + min
    }

    const interval: NodeJS.Timeout = setInterval(function() {
      const timeLeft = animationEnd - Date.now()

      if (timeLeft <= 0) {
        return clearInterval(interval)
      }

      const particleCount = 50 * (timeLeft / duration)

      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 }
      })
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 }
      })
    }, 250)

    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    async function fetchSubscription() {
      try {
        const res = await fetch('/api/subscription')
        if (res.ok) {
          const data = await res.json()
          setPlanName(data.plan?.name || 'your new plan')
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

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#f5576c] via-[#8538a6] to-[#7386bf] flex items-center justify-center">
        <FiLoader className="animate-spin text-white text-4xl" />
      </div>
    )
  }

  const features = [
    {
      icon: FiZap,
      title: 'Create Dynamic QRs',
      description: 'Start creating QR codes that you can edit anytime',
      link: '/dashboard',
    },
    {
      icon: FiActivity,
      title: 'View Analytics',
      description: 'Track every scan with detailed insights',
      link: '/dashboard/analytics',
    },
    {
      icon: FiGrid,
      title: 'Bulk Creation',
      description: 'Upload a CSV to create multiple QRs at once',
      link: '/dashboard/bulk-create',
    },
    {
      icon: FiDownload,
      title: 'Export Options',
      description: 'Download in PNG, SVG, or PDF formats',
      link: '/dashboard',
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f5576c] via-[#8538a6] to-[#7386bf] relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-[#40B49D]/30 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-[#f2cb57]/20 rounded-full blur-3xl animate-pulse"></div>

      <div className="relative z-10 min-h-screen flex items-center justify-center px-4 py-12">
        <div className="max-w-2xl w-full">
          {/* Success Card */}
          <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-[#40B49D] to-[#2d8b7a] p-8 text-center">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-white rounded-full mb-4">
                <FiCheck className="text-[#40B49D] text-4xl" />
              </div>
              <h1 className="text-white text-3xl font-bold mb-2">Payment Successful!</h1>
              <p className="text-white/90 text-lg">
                Welcome to {planName || 'your new plan'}
              </p>
            </div>

            {/* Content */}
            <div className="p-8">
              <p className="text-gray-600 text-center mb-8">
                Thank you for your purchase! Your account has been upgraded and all features are now available.
                A receipt has been sent to your email.
              </p>

              {/* What you can do now */}
              <h2 className="text-gray-900 font-semibold mb-4">What you can do now:</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                {features.map((feature) => (
                  <Link
                    key={feature.title}
                    href={feature.link}
                    className="group p-4 rounded-xl border border-gray-200 hover:border-purple-300 hover:bg-purple-50 transition-all"
                  >
                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded-lg bg-purple-100 text-purple-600 group-hover:bg-purple-200 transition-colors">
                        <feature.icon size={20} />
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900 group-hover:text-purple-700 transition-colors">
                          {feature.title}
                        </h3>
                        <p className="text-sm text-gray-500">{feature.description}</p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>

              {/* CTA */}
              <Link
                href="/dashboard"
                className="flex items-center justify-center gap-2 w-full py-4 px-6 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-purple-500/30 transition-all"
              >
                Go to Dashboard
                <FiArrowRight />
              </Link>

              {/* Help text */}
              <p className="text-center text-sm text-gray-500 mt-6">
                Need help? Check out our{' '}
                <Link href="/pricing#faq" className="text-purple-600 hover:underline">
                  FAQ
                </Link>{' '}
                or contact us anytime.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
