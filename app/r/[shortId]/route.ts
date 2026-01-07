import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { UAParser } from 'ua-parser-js'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ shortId: string }> }
) {
  const { shortId } = await params

  try {
    // Find the QR code
    const qrCode = await prisma.qRCode.findUnique({
      where: { shortId }
    })

    if (!qrCode) {
      return NextResponse.redirect(new URL('/', request.url))
    }

    // Parse user agent for device info
    const userAgent = request.headers.get('user-agent') || ''
    const parser = new UAParser(userAgent)
    const device = parser.getDevice()
    const browser = parser.getBrowser()
    const os = parser.getOS()

    // Get IP for geolocation
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0] ||
               request.headers.get('x-real-ip') ||
               'unknown'

    // Get geolocation data (simple version - can be enhanced with external API)
    const geoData = await getGeoLocation(ip)

    // Record the scan asynchronously (don't wait for it)
    prisma.scan.create({
      data: {
        qrCodeId: qrCode.id,
        userAgent,
        deviceType: device.type || 'desktop',
        browser: browser.name || 'unknown',
        os: os.name || 'unknown',
        country: geoData?.country,
        city: geoData?.city,
        region: geoData?.region,
        latitude: geoData?.latitude,
        longitude: geoData?.longitude,
        ipAddress: ip,
        referrer: request.headers.get('referer') || null,
      }
    }).catch(err => {
      console.error('Failed to record scan:', err)
    })

    // Redirect to destination
    const destination = qrCode.isDynamic && qrCode.destinationUrl
      ? qrCode.destinationUrl
      : qrCode.content

    // Handle different QR types
    let redirectUrl = destination

    switch (qrCode.type) {
      case 'URL':
        redirectUrl = destination
        break
      case 'EMAIL':
        redirectUrl = `mailto:${destination}`
        break
      case 'PHONE':
        redirectUrl = `tel:${destination}`
        break
      case 'SMS':
        redirectUrl = `sms:${destination}`
        break
      default:
        // For TEXT, WIFI, VCARD, show a page with the content
        return NextResponse.redirect(new URL(`/view/${shortId}`, request.url))
    }

    return NextResponse.redirect(redirectUrl)

  } catch (error) {
    console.error('Redirect error:', error)
    return NextResponse.redirect(new URL('/', request.url))
  }
}

// Simple geolocation function (can be enhanced with ipapi.co or similar)
async function getGeoLocation(ip: string): Promise<{
  country?: string
  city?: string
  region?: string
  latitude?: number
  longitude?: number
} | null> {
  // Skip for localhost
  if (ip === 'unknown' || ip === '127.0.0.1' || ip.startsWith('192.168.')) {
    return null
  }

  try {
    // Using free ipapi.co service (1000 requests/day)
    const response = await fetch(`https://ipapi.co/${ip}/json/`, {
      next: { revalidate: 3600 } // Cache for 1 hour
    })

    if (!response.ok) return null

    const data = await response.json()

    return {
      country: data.country_name,
      city: data.city,
      region: data.region,
      latitude: data.latitude,
      longitude: data.longitude,
    }
  } catch (error) {
    console.error('Geolocation error:', error)
    return null
  }
}
