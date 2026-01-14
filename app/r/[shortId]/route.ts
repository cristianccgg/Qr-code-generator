import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { UAParser } from "ua-parser-js";

// Helper to get geo data from IP (using free ip-api.com service)
async function getGeoData(ip: string): Promise<{
  country: string | null;
  city: string | null;
  region: string | null;
  latitude: number | null;
  longitude: number | null;
}> {
  // Skip for localhost/private IPs
  if (!ip || ip === '127.0.0.1' || ip === '::1' || ip.startsWith('192.168.') || ip.startsWith('10.')) {
    return { country: null, city: null, region: null, latitude: null, longitude: null };
  }

  try {
    const response = await fetch(`http://ip-api.com/json/${ip}?fields=status,country,regionName,city,lat,lon`, {
      signal: AbortSignal.timeout(2000), // 2 second timeout
    });

    if (!response.ok) {
      return { country: null, city: null, region: null, latitude: null, longitude: null };
    }

    const data = await response.json();

    if (data.status === 'success') {
      return {
        country: data.country || null,
        city: data.city || null,
        region: data.regionName || null,
        latitude: data.lat || null,
        longitude: data.lon || null,
      };
    }
  } catch (error) {
    console.error('[Redirect] Geo lookup failed:', error);
  }

  return { country: null, city: null, region: null, latitude: null, longitude: null };
}

// Helper to get client IP from request
function getClientIP(request: Request): string | null {
  // Check various headers that might contain the real IP
  const forwardedFor = request.headers.get('x-forwarded-for');
  if (forwardedFor) {
    // x-forwarded-for can contain multiple IPs, the first one is the client
    return forwardedFor.split(',')[0].trim();
  }

  const realIP = request.headers.get('x-real-ip');
  if (realIP) {
    return realIP;
  }

  const cfConnectingIP = request.headers.get('cf-connecting-ip');
  if (cfConnectingIP) {
    return cfConnectingIP;
  }

  return null;
}

export async function GET(request: Request, context: any) {
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

    // Extract scan metadata
    const userAgent = request.headers.get('user-agent') || null;
    const referrer = request.headers.get('referer') || null;
    const ipAddress = getClientIP(request);

    // Parse user agent for device info
    let deviceType: string | null = null;
    let browser: string | null = null;
    let os: string | null = null;

    if (userAgent) {
      const parser = new UAParser(userAgent);
      const result = parser.getResult();

      // Get device type
      const deviceInfo = result.device;
      if (deviceInfo.type) {
        deviceType = deviceInfo.type; // mobile, tablet, etc.
      } else {
        // If no device type, it's likely desktop
        deviceType = 'desktop';
      }

      // Get browser
      if (result.browser.name) {
        browser = result.browser.name;
      }

      // Get OS
      if (result.os.name) {
        os = result.os.name;
      }
    }

    // Record scan with all metadata (don't block redirect on failure)
    // Geo lookup runs in parallel with the redirect
    (async () => {
      try {
        // Get geo data (with timeout)
        const geoData = ipAddress ? await getGeoData(ipAddress) : {
          country: null, city: null, region: null, latitude: null, longitude: null
        };

        await prisma.scan.create({
          data: {
            qrCodeId: qrCode.id,
            scannedAt: new Date(),
            userAgent,
            deviceType,
            browser,
            os,
            ipAddress,
            referrer,
            country: geoData.country,
            city: geoData.city,
            region: geoData.region,
            latitude: geoData.latitude,
            longitude: geoData.longitude,
          },
        });
        console.log(`[Redirect] Scan recorded for QR: ${qrCode.id} - ${deviceType}/${browser}/${os} from ${geoData.city}, ${geoData.country}`);
      } catch (scanError) {
        console.error("[Redirect] Failed to record scan:", scanError);
      }
    })();

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
