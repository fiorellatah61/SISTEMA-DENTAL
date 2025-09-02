// // app/api/citas/[id]/route.ts 
//----nuevo con singleton prisma----------

import { NextRequest, NextResponse } from 'next/server'

import { prisma } from '@/lib/prisma'
import { auth } from '@clerk/nextjs/server'

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const authData = await auth()
    const userId = authData?.userId
    if (!userId) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const { id: citaId } = await context.params
    const body = await request.json()
    const { fechaHora, estado, motivo, observaciones } = body

    // Verificar que la cita existe
    const citaExistente = await prisma.cita.findUnique({
      where: { id: citaId },
      include: {
        paciente: {
          select: {
            id: true,
            nombres: true,
            apellidos: true,
            dni: true,
            telefono: true,
            email: true
          }
        }
      }
    })

    if (!citaExistente) {
      return NextResponse.json(
        { error: 'Cita no encontrada' },
        { status: 404 }
      )
    }

    // Obtener usuario del sistema
    const usuario = await prisma.user.findUnique({
      where: { clerkUserId: userId }
    })

    if (!usuario) {
      return NextResponse.json(
        { error: 'Usuario no encontrado' },
        { status: 404 }
      )
    }

    // Preparar datos para actualizar
    let datosActualizacion: any = {}
    let cambios: string[] = []

    if (fechaHora && fechaHora !== citaExistente.fechaHora.toISOString()) {
      const nuevaFecha = new Date(fechaHora)
      const conflicto = await prisma.cita.findFirst({
        where: {
          id: { not: citaId },
          fechaHora: nuevaFecha,
          estado: { in: ['SOLICITADA', 'CONFIRMADA'] }
        }
      })

      if (conflicto) {
        return NextResponse.json(
          { error: 'Ya existe una cita programada para esta fecha y hora' },
          { status: 409 }
        )
      }

      datosActualizacion.fechaHora = nuevaFecha
      datosActualizacion.estado = 'MODIFICADA'
      cambios.push(`Fecha/hora cambiada de ${citaExistente.fechaHora.toLocaleString()} a ${nuevaFecha.toLocaleString()}`)
    }

    if (estado && estado !== citaExistente.estado) {
      datosActualizacion.estado = estado
      cambios.push(`Estado cambiado de ${citaExistente.estado} a ${estado}`)
    }

    if (motivo !== undefined && motivo !== citaExistente.motivo) {
      datosActualizacion.motivo = motivo || null
      cambios.push('Motivo actualizado')
    }

    if (observaciones !== undefined && observaciones !== citaExistente.observaciones) {
      datosActualizacion.observaciones = observaciones || null
      cambios.push('Observaciones actualizadas')
    }

    if (Object.keys(datosActualizacion).length === 0) {
      return NextResponse.json({ 
        message: 'No hay cambios para actualizar',
        cita: citaExistente 
      })
    }

    // Actualizar la cita
    const citaActualizada = await prisma.cita.update({
      where: { id: citaId },
      data: {
        ...datosActualizacion,
        updatedAt: new Date()
      },
      include: {
        paciente: {
          select: {
            id: true,
            nombres: true,
            apellidos: true,
            dni: true,
            telefono: true,
            email: true
          }
        }
      }
    })

    // Crear entrada en el historial
    await prisma.historialCita.create({
      data: {
        idCita: citaId,
        accion: 'MODIFICACION',
        tipoUsuarioResponsable: 'ODONTOLOGO',
        detalleCambio: cambios.join('; '),
        idUsuario: usuario.id
      }
    })

    return NextResponse.json({ 
      message: 'Cita actualizada correctamente',
      cita: citaActualizada 
    })
  } catch (error) {
    console.error('Error al actualizar cita:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  } 
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const authData = await auth()
    const userId = authData?.userId
    if (!userId) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const { id: citaId } = await context.params

    // Verificar que la cita existe
    const citaExistente = await prisma.cita.findUnique({
      where: { id: citaId }
    })

    if (!citaExistente) {
      return NextResponse.json(
        { error: 'Cita no encontrada' },
        { status: 404 }
      )
    }

    // Obtener usuario del sistema
    const usuario = await prisma.user.findUnique({
      where: { clerkUserId: userId }
    })

    if (!usuario) {
      return NextResponse.json(
        { error: 'Usuario no encontrado' },
        { status: 404 }
      )
    }

    // Crear entrada en el historial antes de eliminar
    await prisma.historialCita.create({
      data: {
        idCita: citaId,
        accion: 'CANCELACION',
        tipoUsuarioResponsable: 'ODONTOLOGO',
        detalleCambio: 'Cita eliminada',
        idUsuario: usuario.id
      }
    })

    // Eliminar la cita
    await prisma.cita.delete({
      where: { id: citaId }
    })

    return NextResponse.json({ 
      message: 'Cita eliminada correctamente' 
    })
  } catch (error) {
    console.error('Error al eliminar cita:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  } 
}
