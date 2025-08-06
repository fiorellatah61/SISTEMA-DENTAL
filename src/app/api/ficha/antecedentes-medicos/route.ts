// app/api/ficha/antecedentes-medicos/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

// GET - Obtener antecedentes médicos de un paciente
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
      },
      include: {
        antecedentesMedicos: true // Incluir los antecedentes médicos relacionados
      }
    })

    if (!ficha) {
      return NextResponse.json(
        { error: 'No se encontró ficha para este paciente' },
        { status: 404 }
      )
    }

    // Retornar los antecedentes médicos si existen
    return NextResponse.json({ 
      antecedentes: ficha.antecedentesMedicos || null 
    })

  } catch (error) {
    console.error('Error al obtener antecedentes médicos:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}

// POST - Guardar/actualizar antecedentes médicos
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { 
      pacienteId,
      alergias,
      tuberculosis,
      hipertension,
      diabetes,
      hepatitis,
      hemorragias,
      enfermedadesCorazon,
      medicamentosActuales,
      otros
    } = body

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

    // Verificar si ya existen antecedentes médicos para esta ficha
    const antecedentesExistentes = await prisma.antecedentesMedicos.findUnique({
      where: {
        idFicha: ficha.id
      }
    })

    let antecedentesGuardados

    if (antecedentesExistentes) {
      // Si ya existen, actualizar los datos
      antecedentesGuardados = await prisma.antecedentesMedicos.update({
        where: {
          idFicha: ficha.id
        },
        data: {
          alergias: alergias || null,
          tuberculosis: tuberculosis || false,
          hipertension: hipertension || false,
          diabetes: diabetes || false,
          hepatitis: hepatitis || false,
          hemorragias: hemorragias || false,
          enfermedadesCorazon: enfermedadesCorazon || false,
          medicamentosActuales: medicamentosActuales || null,
          otros: otros || null
        }
      })
    } else {
      // Si no existen, crear nuevos antecedentes médicos
      antecedentesGuardados = await prisma.antecedentesMedicos.create({
        data: {
          idFicha: ficha.id,
          alergias: alergias || null,
          tuberculosis: tuberculosis || false,
          hipertension: hipertension || false,
          diabetes: diabetes || false,
          hepatitis: hepatitis || false,
          hemorragias: hemorragias || false,
          enfermedadesCorazon: enfermedadesCorazon || false,
          medicamentosActuales: medicamentosActuales || null,
          otros: otros || null
        }
      })
    }

    return NextResponse.json({ 
      message: 'Antecedentes médicos guardados correctamente',
      antecedentes: antecedentesGuardados
    })

  } catch (error) {
    console.error('Error al guardar antecedentes médicos:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}

// DELETE - Eliminar antecedentes médicos
export async function DELETE(request: NextRequest) {
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

    // Eliminar los antecedentes médicos si existen
    const antecedentesExistentes = await prisma.antecedentesMedicos.findUnique({
      where: {
        idFicha: ficha.id
      }
    })

    if (antecedentesExistentes) {
      await prisma.antecedentesMedicos.delete({
        where: {
          idFicha: ficha.id
        }
      })
    }

    return NextResponse.json({ 
      message: 'Antecedentes médicos eliminados correctamente'
    })

  } catch (error) {
    console.error('Error al eliminar antecedentes médicos:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}