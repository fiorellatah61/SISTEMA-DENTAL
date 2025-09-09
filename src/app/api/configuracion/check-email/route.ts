// // // app/api/configuracion/check-email/route.ts
// // NUEVO CON SINGLETON --------------------
// // app/api/configuracion/check-email/route.ts
// import { NextRequest, NextResponse } from 'next/server'
// import { prisma } from '@/lib/prisma'

// export async function POST(request: NextRequest) {
//   try {
//     const { email } = await request.json()

//     if (!email) {
//       return NextResponse.json({ authorized: false })
//     }

//     console.log('🔍 Verificando email:', email)

//     const emailAutorizado = await prisma.$queryRaw`
//       SELECT id, email, activo 
//       FROM emails_autorizados 
//       WHERE LOWER(email) = LOWER(${email}) 
//       AND activo = true
//       LIMIT 1
//     `

//     const isAuthorized = Array.isArray(emailAutorizado) && emailAutorizado.length > 0

//     console.log('✅ Email autorizado:', isAuthorized)

//     return NextResponse.json({ 
//       authorized: isAuthorized 
//     })

//   } catch (error) {
//     console.error('Error verificando email:', error)
//     return NextResponse.json({ authorized: false }, { status: 500 })
//   }
//   // ❌ NO pongas prisma.$disconnect() aquí
// }


// NUEVO==========================================

// app/api/configuracion/check-email/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json({ authorized: false })
    }

    console.log('🔍 Verificando email:', email)

    // ✅ REEMPLAZA el $queryRaw con esto:
    const emailAutorizado = await prisma.emailAutorizado.findFirst({
      where: {
        email: {
          equals: email,
          mode: 'insensitive' // Equivalente a LOWER()
        },
        activo: true
      }
    })

    const isAuthorized = !!emailAutorizado // Más simple que verificar array

    console.log('✅ Email autorizado:', isAuthorized)

    return NextResponse.json({ 
      authorized: isAuthorized 
    })

  } catch (error) {
    console.error('Error verificando email:', error)
    return NextResponse.json({ authorized: false }, { status: 500 })
  }
}