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

    if (!qrCode) {
      // QR code not found - redirect to home
      redirect('/')
    }

    // Record scan (fire and forget - don't wait for it)
    prisma.scan.create({
      data: {
        qrCodeId: qrCode.id,
      },
    }).catch((err) => {
      console.error('Failed to record scan:', err)
    })

    // Redirect to destination URL
    const destination = qrCode.destinationUrl || qrCode.content
    redirect(destination)
  } catch (error) {
    console.error('Error in redirect:', error)
    redirect('/')
  }
}
