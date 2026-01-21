import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
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

  // Pagination params
  const page = parseInt(searchParams.get('page') || '1')
  const limit = parseInt(searchParams.get('limit') || '20')
  const skip = (page - 1) * limit

  // Date filter params
  const startDate = searchParams.get('startDate')
  const endDate = searchParams.get('endDate')

  try {
    // Verify ownership
    const qrCode = await prisma.qRCode.findFirst({
      where: { id, userId: session.user.id },
    })

    if (!qrCode) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    // Build date filter
    const dateFilter: { gte?: Date; lte?: Date } = {}
    if (startDate) {
      dateFilter.gte = new Date(startDate)
    }
    if (endDate) {
      // Set to end of day
      const end = new Date(endDate)
      end.setHours(23, 59, 59, 999)
      dateFilter.lte = end
    }

    const whereClause = {
      qrCodeId: id,
      ...(Object.keys(dateFilter).length > 0 && { scannedAt: dateFilter }),
    }

    // Get total count for pagination
    const totalCount = await prisma.scan.count({
      where: whereClause,
    })

    // Get scans with pagination
    const scans = await prisma.scan.findMany({
      where: whereClause,
      orderBy: {
        scannedAt: 'desc',
      },
      skip,
      take: limit,
      select: {
        id: true,
        scannedAt: true,
        deviceType: true,
        browser: true,
        os: true,
        country: true,
        city: true,
      },
    })

    return NextResponse.json({
      scans,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
        hasMore: skip + scans.length < totalCount,
      },
    })
  } catch (error) {
    logger.error('Error fetching scans:', error)
    return NextResponse.json({ error: 'Failed to fetch scans' }, { status: 500 })
  }
}
