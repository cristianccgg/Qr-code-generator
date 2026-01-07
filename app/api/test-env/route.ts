import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({
    hasDatabaseUrl: !!process.env.DATABASE_URL,
    hasNextAuthSecret: !!process.env.NEXTAUTH_SECRET,
    hasNextAuthUrl: !!process.env.NEXTAUTH_URL,
    nodeEnv: process.env.NODE_ENV,
    // Solo mostramos los primeros caracteres para verificar sin exponer credenciales
    databaseUrlPrefix: process.env.DATABASE_URL?.substring(0, 20),
  })
}
