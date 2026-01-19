import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { userHasFeature } from '@/lib/subscription'

// GET all campaigns for the authenticated user
export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Verificar si el usuario tiene acceso a campañas
  const hasCampaigns = await userHasFeature(session.user.id, 'campaigns')
  if (!hasCampaigns) {
    return NextResponse.json(
      {
        error: 'Campaigns are only available on the Pro plan. Upgrade to access this feature.',
        code: 'FEATURE_NOT_AVAILABLE'
      },
      { status: 403 }
    )
  }

  const campaigns = await prisma.campaign.findMany({
    where: {
      userId: session.user.id,
    },
    include: {
      _count: {
        select: { qrCodes: true },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  })

  return NextResponse.json(campaigns)
}

// POST create a new campaign
export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Verificar si el usuario tiene acceso a campañas
  const hasCampaigns = await userHasFeature(session.user.id, 'campaigns')
  if (!hasCampaigns) {
    return NextResponse.json(
      {
        error: 'Campaigns are only available on the Pro plan. Upgrade to access this feature.',
        code: 'FEATURE_NOT_AVAILABLE'
      },
      { status: 403 }
    )
  }

  try {
    const body = await request.json()
    const { name, description } = body

    if (!name) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 })
    }

    const campaign = await prisma.campaign.create({
      data: {
        name,
        description,
        userId: session.user.id,
      },
    })

    return NextResponse.json(campaign, { status: 201 })
  } catch (error) {
    console.error('Error creating campaign:', error)
    return NextResponse.json({ error: 'Failed to create campaign' }, { status: 500 })
  }
}
