import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'

export default async function RedirectPage({
  params,
}: {
  params: Promise<{ shortId: string }>
}) {
  const { shortId } = await params

  try {
    // Find QR code by shortId
    const qrCode = await prisma.qRCode.findUnique({
      where: { shortId },
    })

    console.log(`[Redirect] Looking for shortId: ${shortId}`)

    if (!qrCode) {
      console.log(`[Redirect] QR code not found for shortId: ${shortId}`)
      redirect('/')
    }

    console.log(`[Redirect] Found QR code:`, {
      id: qrCode.id,
      content: qrCode.content,
      destinationUrl: qrCode.destinationUrl,
    })

    // Record scan - AWAIT to ensure it's saved before redirect
    try {
      await prisma.scan.create({
        data: {
          qrCodeId: qrCode.id,
          scannedAt: new Date(),
        },
      })
      console.log(`[Redirect] Scan recorded for QR: ${qrCode.id}`)
    } catch (scanError) {
      console.error('[Redirect] Failed to record scan:', scanError)
      // Don't block redirect even if scan fails
    }

    // Redirect to destination URL
    const destination = qrCode.destinationUrl || qrCode.content
    console.log(`[Redirect] Redirecting to: ${destination}`)

    redirect(destination)
  } catch (error) {
    console.error('[Redirect] Error in redirect:', error)
    redirect('/')
  }
}
