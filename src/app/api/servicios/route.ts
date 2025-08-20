// /app/api/servicios/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

// Inicializar Prisma Client
const prisma = new PrismaClient()

// GET: Obtener todos los servicios
export async function GET() {
  try {
    // Obtener todos los servicios ordenados por fecha de creación (más recientes primero)
    const servicios = await prisma.servicio.findMany({
      orderBy: {
        createdAt: 'desc'
      }
    })

    // Convertir los valores Decimal a number para el frontend
    const serviciosConvertidos = servicios.map(servicio => ({
      ...servicio,
      costo: servicio.costo.toNumber() // Convertir Decimal a number
    }))

    return NextResponse.json(serviciosConvertidos)
  } catch (error) {
    console.error('Error al obtener servicios:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor al obtener servicios' },
      { status: 500 }
    )
  }
}

// POST: Crear un nuevo servicio
export async function POST(request: NextRequest) {
  try {
    // Obtener los datos del cuerpo de la petición
    const body = await request.json()
    const { nombre, costo, fecha_vencimiento, estado, descripcion } = body

    // Validaciones básicas
    if (!nombre || !costo || !estado) {
      return NextResponse.json(
        { error: 'Los campos nombre, costo y estado son obligatorios' },
        { status: 400 }
      )
    }

    // Convertir fecha_vencimiento a Date si está presente, sino null
    const fechaVencimiento = fecha_vencimiento ? new Date(fecha_vencimiento) : null

    // Crear el nuevo servicio en la base de datos
    const nuevoServicio = await prisma.servicio.create({
      data: {
        nombre: nombre.trim(),
        costo: parseFloat(costo),
        fechaVencimiento: fechaVencimiento,
        estado: estado,
        descripcion: descripcion?.trim() || null
      }
    })

    // Convertir Decimal a number antes de retornar
    const servicioConvertido = {
      ...nuevoServicio,
      costo: nuevoServicio.costo.toNumber()
    }

    return NextResponse.json(servicioConvertido, { status: 201 })
  } catch (error) {
    console.error('Error al crear servicio:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor al crear servicio' },
      { status: 500 }
    )
  }
}