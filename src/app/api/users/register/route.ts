import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '../../../../generated/prisma'
import { auth, currentUser } from '@clerk/nextjs/server'

const prisma = new PrismaClient()

export async function POST(request: NextRequest) {
  try {
    const authData = await auth()
    const userId = authData?.userId
    if (!userId) {
      console.error('Autenticación fallida: userId no encontrado')
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    // Verificar si el usuario ya existe
    const existingUser = await prisma.user.findUnique({
      where: { clerkUserId: userId }
    })

    if (existingUser) {
      return NextResponse.json({ message: 'Usuario ya existe', user: existingUser })
    }

    // Obtener información del usuario desde Clerk
    const user = await currentUser()
    const email = user?.emailAddresses?.[0]?.emailAddress || 'default@example.com'

    // Crear nuevo usuario
    const newUser = await prisma.user.create({
      data: {
        id: `user_${userId}`,
        clerkUserId: userId,
        email
      }
    })

    return NextResponse.json({ message: 'Usuario registrado', user: newUser }, { status: 201 })
  } catch (error: any) {
    console.error('Error al registrar usuario:', error)
    return NextResponse.json(
      { error: error.message || 'Error interno del servidor' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}