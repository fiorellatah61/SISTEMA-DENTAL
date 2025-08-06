// app/api/ficha/examenes-odontologicos/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '../../../../generated/prisma'

const prisma = new PrismaClient()

// GET - Obtener exámenes odontológicos de un paciente
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

    // Obtener exámenes odontológicos de la ficha
    const examenes = await prisma.examenOdontologico.findMany({
      where: {
        idFicha: ficha.id
      },
      include: {
        planTratamiento: true // Incluir datos del plan de tratamiento
      },
      orderBy: {
        fecha: 'desc'
      }
    })

    return NextResponse.json({ examenes })
  } catch (error) {
    console.error('Error al obtener exámenes odontológicos:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}

// POST - Crear nuevo examen odontológico
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { 
      pacienteId, 
      fecha, 
      examenClinicoGeneral, 
      diagnostico, 
      presupuesto,
      idPlanesTratamiento 
    } = body

    if (!pacienteId || !fecha) {
      return NextResponse.json(
        { error: 'ID del paciente y fecha son requeridos' },
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

    // Crear el examen odontológico
    const nuevoExamen = await prisma.examenOdontologico.create({
      data: {
        idFicha: ficha.id,
        fecha: new Date(fecha),
        examenClinicoGeneral: examenClinicoGeneral || null,
        diagnostico: diagnostico || null,
        presupuesto: presupuesto ? parseFloat(presupuesto) : null,
        idPlanesTratamiento: idPlanesTratamiento || null
      },
      include: {
        planTratamiento: true
      }
    })

    return NextResponse.json({ 
      message: 'Examen odontológico creado correctamente',
      examen: nuevoExamen
    })
  } catch (error) {
    console.error('Error al crear examen odontológico:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}

// PUT - Actualizar examen odontológico
export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    const body = await request.json()
    const { 
      fecha, 
      examenClinicoGeneral, 
      diagnostico, 
      presupuesto,
      idPlanesTratamiento 
    } = body

    if (!id) {
      return NextResponse.json(
        { error: 'ID del examen es requerido' },
        { status: 400 }
      )
    }

    // Verificar que el examen existe
    const examenExistente = await prisma.examenOdontologico.findUnique({
      where: { id }
    })

    if (!examenExistente) {
      return NextResponse.json(
        { error: 'Examen odontológico no encontrado' },
        { status: 404 }
      )
    }

    // Actualizar el examen
    const examenActualizado = await prisma.examenOdontologico.update({
      where: { id },
      data: {
        fecha: fecha ? new Date(fecha) : examenExistente.fecha,
        examenClinicoGeneral: examenClinicoGeneral,
        diagnostico: diagnostico,
        presupuesto: presupuesto ? parseFloat(presupuesto) : null,
        idPlanesTratamiento: idPlanesTratamiento || null
      },
      include: {
        planTratamiento: true
      }
    })

    return NextResponse.json({ 
      message: 'Examen odontológico actualizado correctamente',
      examen: examenActualizado
    })
  } catch (error) {
    console.error('Error al actualizar examen odontológico:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}

// DELETE - Eliminar examen odontológico
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: 'ID del examen es requerido' },
        { status: 400 }
      )
    }

    // Verificar que el examen existe
    const examenExistente = await prisma.examenOdontologico.findUnique({
      where: { id }
    })

    if (!examenExistente) {
      return NextResponse.json(
        { error: 'Examen odontológico no encontrado' },
        { status: 404 }
      )
    }

    // Eliminar el examen
    await prisma.examenOdontologico.delete({
      where: { id }
    })

    return NextResponse.json({ 
      message: 'Examen odontológico eliminado correctamente'
    })
  } catch (error) {
    console.error('Error al eliminar examen odontológico:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}