import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { FiGrid, FiBarChart2, FiTrendingUp, FiEye } from 'react-icons/fi'
import Link from 'next/link'
import { startOfDay, subDays } from 'date-fns'
import UsageLimitsCard from '@/components/dashboard/UsageLimitsCard'

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    return null
  }

  // Get statistics
  const [totalQRCodes, totalCampaigns, totalScans, recentQRCodes] = await Promise.all([
    prisma.qRCode.count({
      where: { userId: session.user.id },
    }),
    prisma.campaign.count({
      where: { userId: session.user.id },
    }),
    prisma.scan.count({
      where: {
        qrCode: { userId: session.user.id },
      },
    }),
    prisma.qRCode.findMany({
      where: { userId: session.user.id },
      include: {
        campaign: true,
        _count: {
          select: { scans: true },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 5,
    }),
  ])

  // Get scans for last 7 days
  const last7Days = startOfDay(subDays(new Date(), 7))
  const recentScans = await prisma.scan.count({
    where: {
      qrCode: { userId: session.user.id },
      scannedAt: { gte: last7Days },
    },
  })

  const previousWeekScans = await prisma.scan.count({
    where: {
      qrCode: { userId: session.user.id },
      scannedAt: {
        gte: subDays(last7Days, 7),
        lt: last7Days,
      },
    },
  })

  const scanGrowth = previousWeekScans > 0
    ? ((recentScans - previousWeekScans) / previousWeekScans) * 100
    : recentScans > 0 ? 100 : 0

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome back, {session.user.name || 'User'}!
        </h1>
        <p className="text-gray-600 mt-1">
          Here's an overview of your QR code performance
        </p>
      </div>

      {/* Plan Usage & Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Usage Card - Takes 1 column */}
        <UsageLimitsCard />

        {/* Stats Grid - Takes 2 columns */}
        <div className="lg:col-span-2 grid grid-cols-2 gap-6">
          <StatCard
            icon={FiGrid}
            label="Total QR Codes"
            value={totalQRCodes}
            color="from-[#f5576c] to-[#f093fb]"
          />
          <StatCard
            icon={FiBarChart2}
            label="Total Scans"
            value={totalScans}
            color="from-[#4facfe] to-[#00f2fe]"
          />
          <StatCard
            icon={FiTrendingUp}
            label="Last 7 Days"
            value={recentScans}
            growth={scanGrowth}
            color="from-[#43e97b] to-[#38f9d7]"
          />
          <StatCard
            icon={FiEye}
            label="Campaigns"
            value={totalCampaigns}
            color="from-[#fa709a] to-[#fee140]"
          />
        </div>
      </div>

      {/* Recent QR Codes */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Recent QR Codes</h2>
            <p className="text-sm text-gray-600 mt-1">Your latest created QR codes</p>
          </div>
          <Link
            href="/dashboard/qr-codes"
            className="px-4 py-2 bg-gradient-to-r from-[#f5576c] to-[#f093fb] text-white rounded-lg font-medium hover:opacity-90 transition-opacity"
          >
            View All
          </Link>
        </div>

        <div className="divide-y divide-gray-100">
          {recentQRCodes.length === 0 ? (
            <div className="p-12 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FiGrid className="text-2xl text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No QR codes yet</h3>
              <p className="text-gray-600 mb-4">Create your first QR code to get started</p>
              <Link
                href="/"
                className="inline-block px-6 py-3 bg-gradient-to-r from-[#f5576c] to-[#f093fb] text-white rounded-lg font-medium hover:opacity-90 transition-opacity"
              >
                Create QR Code
              </Link>
            </div>
          ) : (
            recentQRCodes.map((qr: {
              id: string;
              description: string | null;
              type: string;
              createdAt: Date;
              campaign: { name: string } | null;
              _count: { scans: number };
            }) => (
              <Link
                key={qr.id}
                href={`/dashboard/qr-codes/${qr.id}`}
                className="p-4 hover:bg-gray-50 transition-colors block"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 truncate">
                      {qr.description || 'Untitled QR Code'}
                    </p>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-xs text-gray-500">{qr.type}</span>
                      {qr.campaign && (
                        <span className="text-xs px-2 py-1 bg-purple-100 text-purple-700 rounded">
                          {qr.campaign.name}
                        </span>
                      )}
                      <span className="text-xs text-gray-500">
                        {new Date(qr.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-2xl font-bold text-gray-900">{qr._count.scans}</p>
                      <p className="text-xs text-gray-500">scans</p>
                    </div>
                  </div>
                </div>
              </Link>
            ))
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <QuickAction
          href="/"
          title="Create QR Code"
          description="Generate a new QR code with custom design"
          color="from-[#f5576c] to-[#f093fb]"
        />
        <QuickAction
          href="/dashboard/campaigns"
          title="New Campaign"
          description="Organize your QR codes into campaigns"
          color="from-[#4facfe] to-[#00f2fe]"
        />
        <QuickAction
          href="/dashboard/analytics"
          title="View Analytics"
          description="See detailed statistics and insights"
          color="from-[#43e97b] to-[#38f9d7]"
        />
      </div>
    </div>
  )
}

function StatCard({
  icon: Icon,
  label,
  value,
  growth,
  color,
}: {
  icon: any
  label: string
  value: number
  growth?: number
  color: string
}) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <div className={`w-12 h-12 bg-gradient-to-br ${color} rounded-xl flex items-center justify-center`}>
          <Icon className="text-white text-2xl" />
        </div>
        {growth !== undefined && (
          <span
            className={`text-sm font-semibold ${
              growth >= 0 ? 'text-green-600' : 'text-red-600'
            }`}
          >
            {growth >= 0 ? '+' : ''}{Math.round(growth)}%
          </span>
        )}
      </div>
      <p className="text-3xl font-bold text-gray-900">{value.toLocaleString()}</p>
      <p className="text-sm text-gray-600 mt-1">{label}</p>
    </div>
  )
}

function QuickAction({
  href,
  title,
  description,
  color,
}: {
  href: string
  title: string
  description: string
  color: string
}) {
  return (
    <Link
      href={href}
      className="group bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all"
    >
      <div className={`w-12 h-12 bg-gradient-to-br ${color} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
        <span className="text-white text-2xl">+</span>
      </div>
      <h3 className="text-lg font-bold text-gray-900 mb-2">{title}</h3>
      <p className="text-sm text-gray-600">{description}</p>
    </Link>
  )
}
