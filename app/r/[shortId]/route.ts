import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(_request: Request, context: any) {
  const maybeParams = context?.params;
  const resolvedParams =
    maybeParams && typeof maybeParams.then === "function"
      ? await maybeParams
      : maybeParams;
  const { shortId } = resolvedParams || {};

  try {
    const qrCode = await prisma.qRCode.findUnique({ where: { shortId } });

    console.log(`[Redirect] Looking for shortId: ${shortId}`);

    if (!qrCode) {
      console.log(`[Redirect] QR code not found for shortId: ${shortId}`);
      return NextResponse.redirect("/");
    }

    console.log(`[Redirect] Found QR code:`, {
      id: qrCode.id,
      content: qrCode.content,
      destinationUrl: qrCode.destinationUrl,
    });

    // Record scan (don't block redirect on failure)
    prisma.scan
      .create({ data: { qrCodeId: qrCode.id, scannedAt: new Date() } })
      .then(() => console.log(`[Redirect] Scan recorded for QR: ${qrCode.id}`))
      .catch((scanError) =>
        console.error("[Redirect] Failed to record scan:", scanError)
      );

    let destination = qrCode.destinationUrl || qrCode.content;

    // Asegurar que la URL de destino tenga protocolo
    if (destination && !/^https?:\/\//i.test(destination)) {
      destination = 'https://' + destination;
    }

    console.log(`[Redirect] Redirecting to: ${destination}`);

    return NextResponse.redirect(destination);
  } catch (error) {
    console.error("[Redirect] Error in redirect route:", error);
    return NextResponse.redirect("/");
  }
}
