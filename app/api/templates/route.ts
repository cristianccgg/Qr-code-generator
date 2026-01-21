import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { SYSTEM_TEMPLATES } from '@/lib/system-templates';
import { QRTemplate, QRStyleConfig, TemplateCategory } from '@/types/templates';
import { logger } from '@/lib/logger';

// GET /api/templates - List templates (system + user's personal)
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  const { searchParams } = new URL(req.url);

  const category = searchParams.get('category');
  const hasFrame = searchParams.get('hasFrame');
  const myOnly = searchParams.get('myOnly') === 'true';

  try {
    // Build where clause - need to handle AND/OR properly
    const conditions: Record<string, unknown>[] = [];

    // Ownership filter
    if (myOnly && session?.user?.id) {
      // Only user's templates
      conditions.push({ userId: session.user.id, isSystem: false });
    } else {
      // System templates + user's templates (if logged in)
      const ownershipOr: Record<string, unknown>[] = [{ isSystem: true }];
      if (session?.user?.id) {
        ownershipOr.push({ userId: session.user.id });
      }
      conditions.push({ OR: ownershipOr });
    }

    // Category filter
    if (category && category !== 'all') {
      conditions.push({ category });
    }

    // Frame filter
    if (hasFrame === 'true') {
      conditions.push({ frameId: { not: null } });
    } else if (hasFrame === 'false') {
      conditions.push({ frameId: null });
    }

    // Combine all conditions with AND
    const where = conditions.length > 0 ? { AND: conditions } : {};

    // Verify prisma client has qRTemplate model (may need server restart after schema change)
    if (!prisma.qRTemplate) {
      logger.error('Prisma client does not have qRTemplate model. Please restart the dev server after running prisma generate.');
      return NextResponse.json(
        { error: 'Server needs to be restarted. Please run: npm run dev' },
        { status: 500 }
      );
    }

    // Check if system templates exist in DB
    const systemCount = await prisma.qRTemplate.count({
      where: { isSystem: true },
    });

    // If no system templates, seed them
    if (systemCount === 0) {
      await seedSystemTemplates();
    }

    const templates = await prisma.qRTemplate.findMany({
      where,
      orderBy: [
        { isSystem: 'desc' },
        { createdAt: 'desc' },
      ],
    });

    // Transform to API response format
    const response: QRTemplate[] = templates.map((t) => ({
      id: t.id,
      name: t.name,
      description: t.description || undefined,
      thumbnail: t.thumbnail || undefined,
      isSystem: t.isSystem,
      category: t.category as TemplateCategory,
      style: {
        color: t.color,
        backgroundColor: t.backgroundColor,
        dotStyle: t.dotStyle as QRStyleConfig['dotStyle'],
        cornerStyle: t.cornerStyle as QRStyleConfig['cornerStyle'],
        cornerDotStyle: t.cornerDotStyle as QRStyleConfig['cornerDotStyle'],
        cornerColor: t.cornerColor || undefined,
        gradientEnabled: t.gradientEnabled,
        gradientType: t.gradientType as QRStyleConfig['gradientType'],
        gradientColorStart: t.gradientStart || undefined,
        gradientColorEnd: t.gradientEnd || undefined,
        gradientRotation: t.gradientRotation || undefined,
      },
      frameId: t.frameId || undefined,
      frameColor: t.frameColor || undefined,
      frameText: t.frameText || undefined,
      userId: t.userId || undefined,
      createdAt: t.createdAt,
    }));

    return NextResponse.json(response);
  } catch (error) {
    logger.error('Error fetching templates:', error);
    return NextResponse.json(
      { error: 'Failed to fetch templates', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

// POST /api/templates - Create a personal template
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json(
      { error: 'Authentication required' },
      { status: 401 }
    );
  }

  try {
    const body = await req.json();
    const { name, description, category, style, frameId, frameColor, frameText } = body;

    if (!name || !style) {
      return NextResponse.json(
        { error: 'Name and style are required' },
        { status: 400 }
      );
    }

    const template = await prisma.qRTemplate.create({
      data: {
        name,
        description: description || null,
        category: category || 'general',
        isSystem: false,
        userId: session.user.id,
        // Style fields
        color: style.color || '#000000',
        backgroundColor: style.backgroundColor || '#FFFFFF',
        dotStyle: style.dotStyle || 'square',
        cornerStyle: style.cornerStyle || 'square',
        cornerDotStyle: style.cornerDotStyle || 'square',
        cornerColor: style.cornerColor || null,
        gradientEnabled: style.gradientEnabled || false,
        gradientType: style.gradientType || null,
        gradientStart: style.gradientColorStart || null,
        gradientEnd: style.gradientColorEnd || null,
        gradientRotation: style.gradientRotation || 0,
        // Frame fields
        frameId: frameId || null,
        frameColor: frameColor || null,
        frameText: frameText || null,
      },
    });

    return NextResponse.json(template, { status: 201 });
  } catch (error) {
    logger.error('Error creating template:', error);
    return NextResponse.json(
      { error: 'Failed to create template' },
      { status: 500 }
    );
  }
}

// Helper to seed system templates
async function seedSystemTemplates() {
  for (const template of SYSTEM_TEMPLATES) {
    await prisma.qRTemplate.upsert({
      where: { id: template.id },
      update: {},
      create: {
        id: template.id,
        name: template.name,
        description: template.description,
        category: template.category,
        isSystem: true,
        userId: null,
        // Style
        color: template.style.color,
        backgroundColor: template.style.backgroundColor,
        dotStyle: template.style.dotStyle,
        cornerStyle: template.style.cornerStyle,
        cornerDotStyle: template.style.cornerDotStyle,
        cornerColor: template.style.cornerColor || null,
        gradientEnabled: template.style.gradientEnabled,
        gradientType: template.style.gradientType || null,
        gradientStart: template.style.gradientColorStart || null,
        gradientEnd: template.style.gradientColorEnd || null,
        gradientRotation: template.style.gradientRotation || 0,
        // Frame
        frameId: template.frameId || null,
        frameColor: template.frameColor || null,
        frameText: template.frameText || null,
      },
    });
  }
}
