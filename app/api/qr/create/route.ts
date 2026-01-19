import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { nanoid } from "nanoid";
import {
  checkCanCreateDynamicQR,
  incrementDynamicQRCount,
  userHasFeature,
} from "@/lib/subscription";

export async function POST(req: NextRequest) {
  try {
    // Verificar autenticación
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const {
      type,
      content, // La URL original del usuario (ej: https://cristiangart.com)
      description,
      color,
      backgroundColor,
      size,
      format,
      logoUrl,
      destinationUrl, // Mismo que content, la URL real
      origin, // El origin del cliente (para construir la URL completa)
      campaignId, // Campaña opcional
      // Estilos avanzados
      dotStyle,
      cornerStyle,
      cornerDotStyle,
      cornerColor,
      gradientEnabled,
      gradientType,
      gradientStart,
      gradientEnd,
      gradientRotation,
      // Frame
      frameId,
      frameColor,
      frameText,
    } = body;

    // Validar campos requeridos
    if (!type || !content) {
      return NextResponse.json(
        { error: "Type and content are required" },
        { status: 400 }
      );
    }

    // Verificar si el usuario puede crear QRs dinámicos
    const canCreate = await checkCanCreateDynamicQR(session.user.id);
    if (!canCreate.allowed) {
      return NextResponse.json(
        {
          error: canCreate.reason,
          code: "LIMIT_REACHED",
          currentCount: canCreate.currentCount,
          limit: canCreate.limit,
        },
        { status: 403 }
      );
    }

    // Verificar si puede usar logo (feature de pago)
    if (logoUrl) {
      const canUseLogo = await userHasFeature(session.user.id, "logo");
      if (!canUseLogo) {
        return NextResponse.json(
          {
            error: "Logo feature is not available on the Free plan. Upgrade to Starter or Pro.",
            code: "FEATURE_NOT_AVAILABLE",
          },
          { status: 403 }
        );
      }
    }

    // Generar shortId único
    const shortId = nanoid(8);

    // Normalizar el origin para asegurar que tenga el protocolo
    let normalizedOrigin = origin || "";
    if (normalizedOrigin && !/^https?:\/\//i.test(normalizedOrigin)) {
      normalizedOrigin = "https://" + normalizedOrigin;
    }

    // Si no hay origin, usar el host del request
    if (!normalizedOrigin) {
      const host = req.headers.get("host") || "localhost:3000";
      normalizedOrigin = host.includes("localhost")
        ? `http://${host}`
        : `https://${host}`;
    }

    // Construir el shortURL completo con protocolo explícito
    let shortUrl = `${normalizedOrigin}/r/${shortId}`;
    // Quitar espacios o saltos de línea accidentales para asegurar que sea un único texto plano
    shortUrl = shortUrl.trim().replace(/\s+/g, "");

    console.log("[QR Create] Generated shortUrl:", shortUrl);

    // Validar que la campaña pertenece al usuario (si se especificó)
    if (campaignId) {
      const campaign = await prisma.campaign.findFirst({
        where: { id: campaignId, userId: session.user.id },
      });
      if (!campaign) {
        return NextResponse.json(
          { error: "Campaign not found" },
          { status: 404 }
        );
      }
    }

    // Crear QR code en la base de datos
    const qrCode = await prisma.qRCode.create({
      data: {
        shortId,
        type: type.toUpperCase(),
        content: shortUrl, // El QR físico contiene el shortURL
        description,
        color: color || "#000000",
        backgroundColor: backgroundColor || "#FFFFFF",
        size: size || 512,
        format: format?.toUpperCase() === "SVG" ? "SVG" : "PNG",
        logoUrl,
        isDynamic: true,
        destinationUrl: destinationUrl || content, // La URL real a donde redirigir
        userId: session.user.id,
        campaignId: campaignId || null,
        // Estilos avanzados
        dotStyle: dotStyle || "square",
        cornerStyle: cornerStyle || "square",
        cornerDotStyle: cornerDotStyle || "square",
        cornerColor: cornerColor || null,
        gradientEnabled: gradientEnabled || false,
        gradientType: gradientType || "linear",
        gradientStart: gradientStart || null,
        gradientEnd: gradientEnd || null,
        gradientRotation: gradientRotation || 0,
        // Frame
        frameId: frameId || null,
        frameColor: frameColor || null,
        frameText: frameText || null,
      },
    });

    // Incrementar contador de QRs dinámicos creados
    await incrementDynamicQRCount(session.user.id);

    return NextResponse.json({
      success: true,
      qrCode: {
        id: qrCode.id,
        shortId: qrCode.shortId,
        shortUrl, // Devolver la URL completa para el cliente
      },
    });
  } catch (error) {
    console.error("Error creating QR code:", error);
    return NextResponse.json(
      { error: "Failed to create QR code" },
      { status: 500 }
    );
  }
}
