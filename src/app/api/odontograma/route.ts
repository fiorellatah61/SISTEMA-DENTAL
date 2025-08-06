// app/api/odontograma/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '../../../generated/prisma'

const prisma = new PrismaClient()

// GET - Obtener odontograma de un paciente
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const pacienteId = searchParams.get('pacienteId')

    if (!pacienteId) {
      return NextResponse.json(
        { error: 'ID del paciente es requerido' },
        { status: 400 }
      )
    }

    // Buscar la ficha odontológica del paciente
    const ficha = await prisma.fichaOdontologica.findFirst({
      where: {
        idPaciente: pacienteId,
        estado: 'ACTIVA'
      }
    })

    if (!ficha) {
      return NextResponse.json(
        { error: 'No se encontró ficha para este paciente' },
        { status: 404 }
      )
    }

    // Buscar el odontograma más reciente de la ficha
    const odontograma = await prisma.odontograma.findFirst({
      where: {
        idFicha: ficha.id
      },
      include: {
        piezasOdontograma: {
          orderBy: {
            fechaRegistro: 'desc'
          }
        }
      },
      orderBy: {
        fechaActualizacion: 'desc'
      }
    })

    return NextResponse.json({ 
      odontograma: odontograma || null,
      fichaId: ficha.id
    })

  } catch (error) {
    console.error('Error al obtener odontograma:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}

// POST - Guardar/actualizar odontograma completo
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { pacienteId, piezas, imagenUrl } = body

    if (!pacienteId) {
      return NextResponse.json(
        { error: 'ID del paciente es requerido' },
        { status: 400 }
      )
    }

    // Buscar la ficha odontológica del paciente
    const ficha = await prisma.fichaOdontologica.findFirst({
      where: {
        idPaciente: pacienteId,
        estado: 'ACTIVA'
      }
    })

    if (!ficha) {
      return NextResponse.json(
        { error: 'No se encontró ficha para este paciente' },
        { status: 404 }
      )
    }

    // Buscar odontograma existente o crear uno nuevo
    let odontograma = await prisma.odontograma.findFirst({
      where: {
        idFicha: ficha.id
      }
    })

    if (!odontograma) {
      // Crear nuevo odontograma
      odontograma = await prisma.odontograma.create({
        data: {
          idFicha: ficha.id,
          imagenOdontograma: imagenUrl || null,
          fechaActualizacion: new Date()
        }
      })
    } else {
      // Actualizar odontograma existente
      odontograma = await prisma.odontograma.update({
        where: { id: odontograma.id },
        data: {
          imagenOdontograma: imagenUrl || odontograma.imagenOdontograma,
          fechaActualizacion: new Date()
        }
      })
    }

    // Si hay piezas para actualizar/agregar
    if (piezas && Array.isArray(piezas)) {
      // Procesar cada pieza
      for (const pieza of piezas) {
        const { diente, caraDental, procedimiento, subtipo, condiciones, especificaciones, estado } = pieza

        // Crear nueva entrada en pieza_odontograma
        await prisma.piezaOdontograma.create({
          data: {
            idOdontograma: odontograma.id,
            diente: diente.toString(),
            caraDental: caraDental || null,
            procedimiento: procedimiento || 'Sin procedimiento',
            subtipo: subtipo || null,
            condiciones: condiciones || null,
            especificaciones: especificaciones || null,
            estado: estado || 'Saludable'
          }
        })
      }
    }

    // Obtener el odontograma completo actualizado
    const odontogramaCompleto = await prisma.odontograma.findUnique({
      where: { id: odontograma.id },
      include: {
        piezasOdontograma: {
          orderBy: {
            fechaRegistro: 'desc'
          }
        }
      }
    })

    return NextResponse.json({ 
      message: 'Odontograma guardado correctamente',
      odontograma: odontogramaCompleto
    })

  } catch (error) {
    console.error('Error al guardar odontograma:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}

// PUT - Actualizar pieza específica del odontograma
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { pacienteId, diente, procedimiento, caraDental, subtipo, condiciones, especificaciones, estado } = body

    if (!pacienteId || !diente) {
      return NextResponse.json(
        { error: 'ID del paciente y número de diente son requeridos' },
        { status: 400 }
      )
    }

    // Buscar la ficha y odontograma
    const ficha = await prisma.fichaOdontologica.findFirst({
      where: {
        idPaciente: pacienteId,
        estado: 'ACTIVA'
      }
    })

    if (!ficha) {
      return NextResponse.json(
        { error: 'No se encontró ficha para este paciente' },
        { status: 404 }
      )
    }

    let odontograma = await prisma.odontograma.findFirst({
      where: {
        idFicha: ficha.id
      }
    })

    // Si no existe odontograma, crearlo
    if (!odontograma) {
      odontograma = await prisma.odontograma.create({
        data: {
          idFicha: ficha.id,
          fechaActualizacion: new Date()
        }
      })
    }

    // Crear nueva entrada para esta pieza (historial)
    const nuevaPieza = await prisma.piezaOdontograma.create({
      data: {
        idOdontograma: odontograma.id,
        diente: diente.toString(),
        caraDental: caraDental || null,
        procedimiento: procedimiento || 'Sin procedimiento',
        subtipo: subtipo || null,
        condiciones: condiciones || null,
        especificaciones: especificaciones || null,
        estado: estado || 'Saludable'
      }
    })

    // Actualizar fecha del odontograma
    await prisma.odontograma.update({
      where: { id: odontograma.id },
      data: {
        fechaActualizacion: new Date()
      }
    })

    return NextResponse.json({ 
      message: 'Pieza dental actualizada correctamente',
      pieza: nuevaPieza
    })

  } catch (error) {
    console.error('Error al actualizar pieza dental:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}

// DELETE - Eliminar entrada específica de una pieza
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const piezaId = searchParams.get('piezaId')

    if (!piezaId) {
      return NextResponse.json(
        { error: 'ID de la pieza es requerido' },
        { status: 400 }
      )
    }

    // Verificar si existe la pieza
    const pieza = await prisma.piezaOdontograma.findUnique({
      where: { id: piezaId }
    })

    if (!pieza) {
      return NextResponse.json(
        { error: 'Pieza no encontrada' },
        { status: 404 }
      )
    }

    // Eliminar la pieza
    await prisma.piezaOdontograma.delete({
      where: { id: piezaId }
    })

    // Actualizar fecha del odontograma
    await prisma.odontograma.update({
      where: { id: pieza.idOdontograma },
      data: {
        fechaActualizacion: new Date()
      }
    })

    return NextResponse.json({ 
      message: 'Entrada de pieza eliminada correctamente'
    })

  } catch (error) {
    console.error('Error al eliminar pieza:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}