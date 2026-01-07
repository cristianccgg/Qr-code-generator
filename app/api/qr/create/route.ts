import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { nanoid } from 'nanoid'

export async function POST(req: NextRequest) {
  try {
    // Verificar autenticación
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await req.json()
    const {
      type,
      content,
      description,
      color,
      backgroundColor,
      size,
      format,
      logoUrl,
      destinationUrl,
    } = body

    // Validar campos requeridos
    if (!type || !content) {
      return NextResponse.json(
        { error: 'Type and content are required' },
        { status: 400 }
      )
    }

    // Generar shortId único
    const shortId = nanoid(8)

    // Crear QR code en la base de datos
    const qrCode = await prisma.qRCode.create({
      data: {
        shortId,
        type: type.toUpperCase(),
        content,
        description,
        color: color || '#000000',
        backgroundColor: backgroundColor || '#FFFFFF',
        size: size || 512,
        format: format?.toUpperCase() === 'SVG' ? 'SVG' : 'PNG',
        logoUrl,
        isDynamic: true,
        destinationUrl: destinationUrl || content, // Para QR dinámicos
        userId: session.user.id,
      },
    })

    return NextResponse.json({
      success: true,
      qrCode: {
        id: qrCode.id,
        shortId: qrCode.shortId,
      },
    })
  } catch (error) {
    console.error('Error creating QR code:', error)
    return NextResponse.json(
      { error: 'Failed to create QR code' },
      { status: 500 }
    )
  }
}
