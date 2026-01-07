import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { nanoid } from 'nanoid'

// GET all QR codes for the authenticated user
export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const campaignId = searchParams.get('campaignId')

  const qrCodes = await prisma.qRCode.findMany({
    where: {
      userId: session.user.id,
      ...(campaignId ? { campaignId } : {}),
    },
    include: {
      campaign: true,
      _count: {
        select: { scans: true },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  })

  return NextResponse.json(qrCodes)
}

// POST create a new QR code
export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const {
      type,
      content,
      description,
      color,
      backgroundColor,
      size,
      format,
      logoUrl,
      isDynamic,
      destinationUrl,
      campaignId,
    } = body

    // Generate unique short ID
    const shortId = nanoid(8)

    const qrCode = await prisma.qRCode.create({
      data: {
        shortId,
        type,
        content,
        description,
        color: color || '#000000',
        backgroundColor: backgroundColor || '#FFFFFF',
        size: size || 512,
        format: format || 'PNG',
        logoUrl,
        isDynamic: isDynamic ?? true,
        destinationUrl: isDynamic ? destinationUrl || content : null,
        userId: session.user.id,
        campaignId,
      },
    })

    return NextResponse.json(qrCode, { status: 201 })
  } catch (error) {
    console.error('Error creating QR code:', error)
    return NextResponse.json({ error: 'Failed to create QR code' }, { status: 500 })
  }
}
