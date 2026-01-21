import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { startOfDay, subDays, format } from 'date-fns'
import { logger } from '@/lib/logger'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params
  const { searchParams } = new URL(request.url)
  const days = parseInt(searchParams.get('days') || '30')

  try {
    // Verify ownership
    const qrCode = await prisma.qRCode.findFirst({
      where: { id, userId: session.user.id },
    })

    if (!qrCode) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    // Get date range
    const startDate = startOfDay(subDays(new Date(), days))

    // Get all scans
    const scans = await prisma.scan.findMany({
      where: {
        qrCodeId: id,
        scannedAt: {
          gte: startDate,
        },
      },
      orderBy: {
        scannedAt: 'asc',
      },
    })

    // Calculate analytics
    const totalScans = scans.length

    // Scans by date
    const scansByDate = scans.reduce((acc: Record<string, number>, scan: { scannedAt: Date }) => {
      const date = format(scan.scannedAt, 'yyyy-MM-dd')
      acc[date] = (acc[date] || 0) + 1
      return acc
    }, {})

    // Scans by device
    const scansByDevice = scans.reduce((acc: Record<string, number>, scan: { deviceType: string | null }) => {
      const device = scan.deviceType || 'unknown'
      acc[device] = (acc[device] || 0) + 1
      return acc
    }, {})

    // Scans by browser
    const scansByBrowser = scans.reduce((acc: Record<string, number>, scan: { browser: string | null }) => {
      const browser = scan.browser || 'unknown'
      acc[browser] = (acc[browser] || 0) + 1
      return acc
    }, {})

    // Scans by OS
    const scansByOS = scans.reduce((acc: Record<string, number>, scan: { os: string | null }) => {
      const os = scan.os || 'unknown'
      acc[os] = (acc[os] || 0) + 1
      return acc
    }, {})

    // Scans by country
    const scansByCountry = scans.reduce((acc: Record<string, number>, scan: { country: string | null }) => {
      const country = scan.country || 'unknown'
      acc[country] = (acc[country] || 0) + 1
      return acc
    }, {})

    // Scans by city (top 10)
    const scansByCity = scans.reduce((acc: Record<string, number>, scan: { city: string | null }) => {
      if (scan.city) {
        acc[scan.city] = (acc[scan.city] || 0) + 1
      }
      return acc
    }, {})

    // Get recent scans (last 10)
    const recentScans = scans.slice(-10).reverse().map((scan: {
      id: string;
      scannedAt: Date;
      deviceType: string | null;
      browser: string | null;
      os: string | null;
      country: string | null;
      city: string | null;
    }) => ({
      id: scan.id,
      scannedAt: scan.scannedAt,
      deviceType: scan.deviceType,
      browser: scan.browser,
      os: scan.os,
      country: scan.country,
      city: scan.city,
    }))

    // Calculate growth (compare to previous period)
    const previousPeriodStart = startOfDay(subDays(startDate, days))
    const previousScans = await prisma.scan.count({
      where: {
        qrCodeId: id,
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
      qrCode: {
        id: qrCode.id,
        shortId: qrCode.shortId,
        description: qrCode.description,
        type: qrCode.type,
      },
      totalScans,
      growth: Math.round(growth * 10) / 10,
      scansByDate,
      scansByDevice,
      scansByBrowser,
      scansByOS,
      scansByCountry,
      scansByCity,
      recentScans,
      dateRange: {
        start: startDate,
        end: new Date(),
        days,
      },
    })
  } catch (error) {
    logger.error('Error fetching analytics:', error)
    return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 })
  }
}
