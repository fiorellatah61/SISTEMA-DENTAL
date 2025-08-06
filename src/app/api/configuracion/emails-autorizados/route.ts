// app/api/configuracion/emails-autorizados/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

// Obtener todos los emails autorizados
export async function GET() {
  try {
    console.log('📥 GET /api/configuracion/emails-autorizados iniciado')
    
    // Usar SQL directo
    const emails = await prisma.$queryRaw`
      SELECT id, email, "createdAt" 
      FROM emails_autorizados 
      WHERE activo = true 
      ORDER BY "createdAt" DESC
    `

    console.log('✅ Emails obtenidos:', Array.isArray(emails) ? emails.length : 0)
    return NextResponse.json(emails)
    
  } catch (error) {
    console.error('❌ Error al obtener emails autorizados:', error)
    return NextResponse.json(
      { error: 'Error al obtener emails autorizados' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}

// Agregar nuevo email autorizado
export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json(
        { error: 'Email es requerido' },
        { status: 400 }
      )
    }

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Formato de email inválido' },
        { status: 400 }
      )
    }

    const emailLower = email.toLowerCase()
    console.log('➕ Intentando agregar email:', emailLower)

    // Verificar si ya existe usando SQL directo
    const existeEmail = await prisma.$queryRaw`
      SELECT id, email, activo 
      FROM emails_autorizados 
      WHERE LOWER(email) = LOWER(${emailLower})
      LIMIT 1
    `

    const emailExistente = Array.isArray(existeEmail) && existeEmail.length > 0 ? existeEmail[0] : null

    if (emailExistente) {
      // Si existe pero está inactivo, reactivarlo
      if (!emailExistente.activo) {
        const emailReactivado = await prisma.$executeRaw`
          UPDATE emails_autorizados 
          SET activo = true, "updatedAt" = NOW()
          WHERE id = ${emailExistente.id}
        `

        // Obtener el email reactivado
        const emailActualizado = await prisma.$queryRaw`
          SELECT id, email, "createdAt"
          FROM emails_autorizados 
          WHERE id = ${emailExistente.id}
        `

        const resultado = Array.isArray(emailActualizado) && emailActualizado.length > 0 ? emailActualizado[0] : null
        
        console.log('✅ Email reactivado:', resultado)
        return NextResponse.json(resultado, { status: 200 })
      } else {
        return NextResponse.json(
          { error: 'Este email ya está autorizado' },
          { status: 409 }
        )
      }
    }

    // Generar un nuevo ID (usando cuid-like format)
    const nuevoId = `clk${Date.now()}${Math.random().toString(36).substr(2, 9)}`

    // Crear nuevo email autorizado usando SQL directo
    await prisma.$executeRaw`
      INSERT INTO emails_autorizados (id, email, activo, "createdAt", "updatedAt")
      VALUES (${nuevoId}, ${emailLower}, true, NOW(), NOW())
    `

    // Obtener el email recién creado
    const nuevoEmail = await prisma.$queryRaw`
      SELECT id, email, "createdAt"
      FROM emails_autorizados 
      WHERE id = ${nuevoId}
    `

    const resultado = Array.isArray(nuevoEmail) && nuevoEmail.length > 0 ? nuevoEmail[0] : null

    console.log('✅ Nuevo email creado:', resultado)
    return NextResponse.json(resultado, { status: 201 })

  } catch (error) {
    console.error('❌ Error al agregar email autorizado:', error)
    return NextResponse.json(
      { error: 'Error al agregar email autorizado' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}

// Eliminar email autorizado
export async function DELETE(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json(
        { error: 'Email es requerido' },
        { status: 400 }
      )
    }

    console.log('🗑️ Intentando eliminar email:', email)

    // Verificar que no sea el último email autorizado
    const totalEmails = await prisma.$queryRaw`
      SELECT COUNT(*) as count 
      FROM emails_autorizados 
      WHERE activo = true
    `

    const count = Array.isArray(totalEmails) && totalEmails.length > 0 ? Number(totalEmails[0].count) : 0

    if (count <= 1) {
      return NextResponse.json(
        { error: 'Debe haber al menos un email autorizado' },
        { status: 400 }
      )
    }

    // Marcar como inactivo en lugar de eliminar usando SQL directo
    const resultado = await prisma.$executeRaw`
      UPDATE emails_autorizados 
      SET activo = false, "updatedAt" = NOW()
      WHERE LOWER(email) = LOWER(${email.toLowerCase()})
    `

    console.log('✅ Email marcado como inactivo')

    return NextResponse.json({ 
      message: 'Email eliminado exitosamente',
      email: email 
    })

  } catch (error) {
    console.error('❌ Error al eliminar email autorizado:', error)
    return NextResponse.json(
      { error: 'Error al eliminar email autorizado' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}