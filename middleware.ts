// ESTO SIRVE PARA  LOS  RECORDATORISO, para inicializar WhatsApp automáticamente:
// middleware.ts - EN LA RAÍZ DEL PROYECTO

import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Solo aplicar a rutas de API relacionadas con recordatorios
  if (request.nextUrl.pathname.startsWith('/api/citas/recordatorios')) {
    // Agregar header para indicar que necesita WhatsApp
    const response = NextResponse.next()
    response.headers.set('X-Needs-WhatsApp', 'true')
    return response
  }

  return NextResponse.next()
}

export const config = {
  matcher: '/api/citas/recordatorios/:path*'
}