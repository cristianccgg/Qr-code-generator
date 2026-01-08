import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Las rutas de redirección del QR deben ser públicas
  const isQRRedirect = request.nextUrl.pathname.startsWith('/r/')

  if (isQRRedirect) {
    // Permitir acceso sin autenticación
    return NextResponse.next()
  }

  // Para otras rutas, continuar con el flujo normal
  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}
