import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { nanoid } from 'nanoid';
import { userHasFeature } from '@/lib/subscription';
import { BulkCreateRequest, BulkCreateResponse, BulkQRCreated, BulkQRFailed, BULK_LIMITS } from '@/types/bulk';
import { QRType, QRFormat } from '@prisma/client';
import { logger } from '@/lib/logger';

export async function POST(req: NextRequest) {
  try {
    // Verificar autenticación
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verificar si el usuario tiene acceso a bulk creation
    const hasBulkCreation = await userHasFeature(session.user.id, 'bulk_creation');
    if (!hasBulkCreation) {
      return NextResponse.json(
        {
          error: 'Bulk creation is only available on the Pro plan. Upgrade to access this feature.',
          code: 'FEATURE_NOT_AVAILABLE'
        },
        { status: 403 }
      );
    }

    const body: BulkCreateRequest = await req.json();
    const { items, skipInvalid = false } = body;

    // Validar que hay items
    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: 'No items provided' },
        { status: 400 }
      );
    }

    // Validar límite
    if (items.length > BULK_LIMITS.maxItems) {
      return NextResponse.json(
        { error: `Maximum ${BULK_LIMITS.maxItems} items allowed` },
        { status: 400 }
      );
    }

    // Normalizar el origin
    const host = req.headers.get('host') || 'localhost:3000';
    const normalizedOrigin = host.includes('localhost')
      ? `http://${host}`
      : `https://${host}`;

    // Validar campaignIds únicos si existen
    const campaignIds = [...new Set(items.filter(i => i.campaignId).map(i => i.campaignId!))];
    if (campaignIds.length > 0) {
      const validCampaigns = await prisma.campaign.findMany({
        where: {
          id: { in: campaignIds },
          userId: session.user.id,
        },
        select: { id: true },
      });
      const validCampaignIds = new Set(validCampaigns.map(c => c.id));

      // Verificar que todas las campañas existen
      const invalidCampaigns = campaignIds.filter(id => !validCampaignIds.has(id));
      if (invalidCampaigns.length > 0 && !skipInvalid) {
        return NextResponse.json(
          { error: `Invalid campaign IDs: ${invalidCampaigns.join(', ')}` },
          { status: 400 }
        );
      }
    }

    const created: BulkQRCreated[] = [];
    const failed: BulkQRFailed[] = [];

    // Procesar en batches
    for (let i = 0; i < items.length; i += BULK_LIMITS.batchSize) {
      const batch = items.slice(i, i + BULK_LIMITS.batchSize);

      // Intentar crear cada item del batch
      const batchPromises = batch.map(async (item, batchIndex) => {
        const index = i + batchIndex;

        try {
          // Validar campos requeridos
          if (!item.type || !item.content) {
            throw new Error('Type and content are required');
          }

          // Generar shortId
          const shortId = nanoid(8);
          const shortUrl = `${normalizedOrigin}/r/${shortId}`.trim();

          // Crear en DB
          const qrCode = await prisma.qRCode.create({
            data: {
              shortId,
              type: item.type.toUpperCase() as QRType,
              content: shortUrl,
              description: item.description || null,
              color: item.color || '#000000',
              backgroundColor: item.backgroundColor || '#FFFFFF',
              size: item.size || 512,
              format: (item.format?.toUpperCase() === 'SVG' ? 'SVG' : 'PNG') as QRFormat,
              logoUrl: null,
              isDynamic: true,
              destinationUrl: item.content,
              userId: session.user.id,
              campaignId: item.campaignId || null,
              // Estilos
              dotStyle: item.dotStyle || 'square',
              cornerStyle: item.cornerStyle || 'square',
              cornerDotStyle: item.cornerDotStyle || 'square',
              cornerColor: item.cornerColor || null,
              gradientEnabled: item.gradientEnabled || false,
              gradientType: item.gradientType || 'linear',
              gradientStart: item.gradientStart || null,
              gradientEnd: item.gradientEnd || null,
              gradientRotation: item.gradientRotation || 0,
            },
          });

          return {
            success: true as const,
            data: {
              id: qrCode.id,
              shortId: qrCode.shortId,
              shortUrl,
              description: qrCode.description || undefined,
              index,
            },
          };
        } catch (error) {
          return {
            success: false as const,
            data: {
              index,
              error: error instanceof Error ? error.message : 'Unknown error',
            },
          };
        }
      });

      const batchResults = await Promise.all(batchPromises);

      for (const result of batchResults) {
        if (result.success) {
          created.push(result.data as BulkQRCreated);
        } else {
          failed.push(result.data as BulkQRFailed);
        }
      }
    }

    const response: BulkCreateResponse = {
      success: failed.length === 0,
      created,
      failed,
      totalCreated: created.length,
      totalFailed: failed.length,
    };

    return NextResponse.json(response, {
      status: failed.length === 0 ? 201 : 207, // 207 = Multi-Status
    });
  } catch (error) {
    logger.error('Error in bulk create:', error);
    return NextResponse.json(
      { error: 'Failed to create QR codes' },
      { status: 500 }
    );
  }
}
