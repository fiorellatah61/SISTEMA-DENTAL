// app/api/ficha/odontograma/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '../../../../generated/prisma'

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

    // Obtener el odontograma más reciente
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

// POST - Guardar/actualizar odontograma
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { pacienteId, piezas, observaciones } = body

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
          archivoJson: JSON.stringify({ observaciones })
        }
      })
    } else {
      // Actualizar odontograma existente
      odontograma = await prisma.odontograma.update({
        where: { id: odontograma.id },
        data: {
          fechaActualizacion: new Date(),
          archivoJson: JSON.stringify({ observaciones })
        }
      })
    }

    // Si hay piezas para guardar
    if (piezas && piezas.length > 0) {
      // Crear las nuevas piezas
      await prisma.piezaOdontograma.createMany({
        data: piezas.map((pieza: any) => ({
          idOdontograma: odontograma.id,
          diente: pieza.diente,
          caraDental: pieza.caraDental || null,
          procedimiento: pieza.procedimiento,
          subtipo: pieza.subtipo || null,
          condiciones: pieza.condiciones || null,
          especificaciones: pieza.especificaciones || null,
          estado: pieza.estado || 'Saludable'
        }))
      })
    }

    return NextResponse.json({ 
      message: 'Odontograma guardado correctamente',
      odontograma
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