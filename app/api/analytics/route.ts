import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { startOfDay, subDays, format, eachDayOfInterval } from 'date-fns'

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const days = parseInt(searchParams.get('days') || '30')

  try {
    const startDate = startOfDay(subDays(new Date(), days))
    const endDate = new Date()

    // Get all scans for this user's QR codes
    const scans = await prisma.scan.findMany({
      where: {
        qrCode: { userId: session.user.id },
        scannedAt: { gte: startDate },
      },
      select: {
        scannedAt: true,
        deviceType: true,
        browser: true,
        os: true,
        country: true,
        qrCodeId: true,
      },
      orderBy: { scannedAt: 'asc' },
    })

    // Total scans
    const totalScans = scans.length

    // Total QR codes
    const totalQRCodes = await prisma.qRCode.count({
      where: { userId: session.user.id },
    })

    // Scans by date - fill in missing days with 0
    const allDays = eachDayOfInterval({ start: startDate, end: endDate })
    const scanCountByDate: Record<string, number> = {}

    // Initialize all days with 0
    allDays.forEach(day => {
      scanCountByDate[format(day, 'yyyy-MM-dd')] = 0
    })

    // Count actual scans
    scans.forEach(scan => {
      const date = format(scan.scannedAt, 'yyyy-MM-dd')
      scanCountByDate[date] = (scanCountByDate[date] || 0) + 1
    })

    const scansByDate = Object.entries(scanCountByDate).map(([date, count]) => ({
      date: format(new Date(date), 'dd MMM'),
      scans: count,
    }))

    // Scans by device
    const deviceCounts: Record<string, number> = {}
    scans.forEach(scan => {
      const device = scan.deviceType || 'unknown'
      deviceCounts[device] = (deviceCounts[device] || 0) + 1
    })
    const scansByDevice = Object.entries(deviceCounts)
      .map(([name, value]) => ({ name: formatLabel(name), value }))
      .sort((a, b) => b.value - a.value)

    // Scans by browser
    const browserCounts: Record<string, number> = {}
    scans.forEach(scan => {
      const browser = scan.browser || 'unknown'
      browserCounts[browser] = (browserCounts[browser] || 0) + 1
    })
    const scansByBrowser = Object.entries(browserCounts)
      .map(([name, value]) => ({ name: formatLabel(name), value }))
      .sort((a, b) => b.value - a.value)

    // Scans by OS
    const osCounts: Record<string, number> = {}
    scans.forEach(scan => {
      const os = scan.os || 'unknown'
      osCounts[os] = (osCounts[os] || 0) + 1
    })
    const scansByOS = Object.entries(osCounts)
      .map(([name, value]) => ({ name: formatLabel(name), value }))
      .sort((a, b) => b.value - a.value)

    // Scans by country
    const countryCounts: Record<string, number> = {}
    scans.forEach(scan => {
      const country = scan.country || 'unknown'
      countryCounts[country] = (countryCounts[country] || 0) + 1
    })
    const scansByCountry = Object.entries(countryCounts)
      .map(([name, value]) => ({ name: formatLabel(name), value }))
      .sort((a, b) => b.value - a.value)

    // Top QR codes
    const qrCodeCounts: Record<string, number> = {}
    scans.forEach(scan => {
      qrCodeCounts[scan.qrCodeId] = (qrCodeCounts[scan.qrCodeId] || 0) + 1
    })

    const topQRCodeIds = Object.entries(qrCodeCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([id]) => id)

    const topQRCodesData = await prisma.qRCode.findMany({
      where: { id: { in: topQRCodeIds } },
      select: { id: true, description: true },
    })

    const topQRCodes = topQRCodeIds.map(id => {
      const qr = topQRCodesData.find(q => q.id === id)
      return {
        id,
        description: qr?.description || null,
        scans: qrCodeCounts[id],
      }
    })

    // Calculate growth (compare with previous period)
    const previousPeriodStart = startOfDay(subDays(startDate, days))
    const previousScans = await prisma.scan.count({
      where: {
        qrCode: { userId: session.user.id },
        scannedAt: {
          gte: previousPeriodStart,
          lt: startDate,
        },
      },
    })

    const growth = previousScans > 0
      ? ((totalScans - previousScans) / previousScans) * 100
      : totalScans > 0 ? 100 : 0

    return NextResponse.json({
      totalScans,
      totalQRCodes,
      scansByDate,
      scansByDevice,
      scansByBrowser,
      scansByOS,
      scansByCountry,
      topQRCodes,
      growth: Math.round(growth * 10) / 10,
      dateRange: {
        start: startDate,
        end: endDate,
        days,
      },
    })
  } catch (error) {
    console.error('Error fetching analytics:', error)
    return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 })
  }
}

function formatLabel(label: string): string {
  if (label === 'unknown') return 'Desconocido'
  if (label === 'desktop') return 'Desktop'
  if (label === 'mobile') return 'Móvil'
  if (label === 'tablet') return 'Tablet'
  return label
}
