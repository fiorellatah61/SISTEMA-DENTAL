// // ESTO SIRVE PARA  LOS  RECORDATORISO, para inicializar WhatsApp automáticamente:
// // middleware.ts - EN LA RAÍZ DEL PROYECTO

// import { NextResponse } from 'next/server'
// import type { NextRequest } from 'next/server'

// export function middleware(request: NextRequest) {
//   // Solo aplicar a rutas de API relacionadas con recordatorios
//   if (request.nextUrl.pathname.startsWith('/api/citas/recordatorios')) {
//     // Agregar header para indicar que necesita WhatsApp
//     const response = NextResponse.next()
//     response.headers.set('X-Needs-WhatsApp', 'true')
//     return response
//   }

//   return NextResponse.next()
// }

// export const config = {
//   matcher: '/api/citas/recordatorios/:path*'
// }


// ========== middleware.ts - Para Railway ==========
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Headers optimizados para Railway
  const response = NextResponse.next();
  
  // Cache headers para APIs del dashboard
  if (request.nextUrl.pathname.startsWith('/api/dashboard/')) {
    response.headers.set('Cache-Control', 'public, s-maxage=120, stale-while-revalidate=300');
    response.headers.set('CDN-Cache-Control', 'public, s-maxage=60');
    response.headers.set('Vercel-CDN-Cache-Control', 'public, s-maxage=60');
  }
  
  return response;
}

export const config = {
  matcher: '/api/dashboard/:path*',
};