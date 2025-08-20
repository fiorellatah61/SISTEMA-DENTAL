// /app/api/servicios/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

// Inicializar Prisma Client
const prisma = new PrismaClient()

// PUT: Actualizar un servicio existente
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const body = await request.json()
    const { nombre, costo, fecha_vencimiento, estado, descripcion } = body

    // Validaciones básicas
    if (!nombre || !costo || !estado) {
      return NextResponse.json(
        { error: 'Los campos nombre, costo y estado son obligatorios' },
        { status: 400 }
      )
    }

    // Verificar si el servicio existe
    const servicioExistente = await prisma.servicio.findUnique({
      where: { id }
    })

    if (!servicioExistente) {
      return NextResponse.json(
        { error: 'Servicio no encontrado' },
        { status: 404 }
      )
    }

    // Convertir fecha_vencimiento a Date si está presente, sino null
    const fechaVencimiento = fecha_vencimiento ? new Date(fecha_vencimiento) : null

    // Si el estado cambió a "pagado", registrar la fecha de pago
    const fechaPago = estado === 'pagado' && servicioExistente.estado !== 'pagado' 
      ? new Date() 
      : servicioExistente.fechaPago

    // Actualizar el servicio
    const servicioActualizado = await prisma.servicio.update({
      where: { id },
      data: {
        nombre: nombre.trim(),
        costo: parseFloat(costo),
        fechaVencimiento: fechaVencimiento,
        estado: estado,
        fechaPago: fechaPago,
        descripcion: descripcion?.trim() || null
      }
    })

    // Convertir Decimal a number antes de retornar
    const servicioConvertido = {
      ...servicioActualizado,
      costo: servicioActualizado.costo.toNumber()
    }

    return NextResponse.json(servicioConvertido)
  } catch (error) {
    console.error('Error al actualizar servicio:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor al actualizar servicio' },
      { status: 500 }
    )
  }
}

// DELETE: Eliminar un servicio
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    // Verificar si el servicio existe
    const servicioExistente = await prisma.servicio.findUnique({
      where: { id }
    })

    if (!servicioExistente) {
      return NextResponse.json(
        { error: 'Servicio no encontrado' },
        { status: 404 }
      )
    }

    // Eliminar el servicio
    await prisma.servicio.delete({
      where: { id }
    })

    return NextResponse.json(
      { message: 'Servicio eliminado correctamente' },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error al eliminar servicio:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor al eliminar servicio' },
      { status: 500 }
    )
  }
}