// app/api/configuracion/check-email/route.ts
import { NextRequest, NextResponse } from 'next/server'
 import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json({ authorized: false })
    }

    console.log('🔍 Verificando email:', email)

    // Usar SQL directo en lugar del modelo
    const emailAutorizado = await prisma.$queryRaw`
      SELECT id, email, activo 
      FROM emails_autorizados 
      WHERE LOWER(email) = LOWER(${email}) 
      AND activo = true
      LIMIT 1
    `

    // Verificar si se encontró el email
    const isAuthorized = Array.isArray(emailAutorizado) && emailAutorizado.length > 0

    console.log('✅ Email autorizado:', isAuthorized)

    return NextResponse.json({ 
      authorized: isAuthorized 
    })

  } catch (error) {
    console.error('Error verificando email:', error)
    return NextResponse.json({ authorized: false }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}