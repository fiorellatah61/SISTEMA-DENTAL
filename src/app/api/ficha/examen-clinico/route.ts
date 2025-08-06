// app/api/ficha/examen-clinico/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

// GET - Obtener examen clínico de un paciente (ambas tablas)
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
        // Incluir el examen clínico estomatológico
        examenClinicoEstomatologico: true,
        // Incluir los exámenes odontológicos (para obtener el examen clínico general)
        examenesOdontologicos: {
          orderBy: {
            fecha: 'desc' // Obtener el más reciente
          },
          take: 1 // Solo el último
        }
      }
    })

    if (!ficha) {
      return NextResponse.json(
        { error: 'No se encontró ficha para este paciente' },
        { status: 404 }
      )
    }

    // Preparar la respuesta con ambos tipos de datos
    const response = {
      examenEstomatologico: ficha.examenClinicoEstomatologico || null,
      examenOdontologico: ficha.examenesOdontologicos.length > 0 
        ? ficha.examenesOdontologicos[0] 
        : null
    }

    return NextResponse.json(response)

  } catch (error) {
    console.error('Error al obtener examen clínico:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}

// POST - Guardar/actualizar examen clínico (ambas tablas)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { 
      pacienteId,
      // Datos para ExamenOdontologico
      examenClinicoGeneral,
      // Datos para ExamenClinicoEstomatologico
      ATM,
      ganglios,
      piel,
      simetriaFacial,
      glandulasSalivales,
      encia,
      vestibulo,
      carrillo,
      paladar,
      orofaringe,
      lengua,
      pisoBoca,
      oclusion,
      observaciones
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

    // Usar transacción para asegurar consistencia de datos
    const resultado = await prisma.$transaction(async (tx) => {
      let examenOdontologicoGuardado = null
      let examenEstomatologicoGuardado = null

      // 1. MANEJAR EXAMEN CLÍNICO GENERAL (tabla ExamenOdontologico)
      if (examenClinicoGeneral && examenClinicoGeneral.trim() !== '') {
        // Verificar si ya existe un examen odontológico para esta ficha
        const examenExistente = await tx.examenOdontologico.findFirst({
          where: {
            idFicha: ficha.id
          },
          orderBy: {
            fecha: 'desc'
          }
        })

        if (examenExistente) {
          // Actualizar el examen existente
          examenOdontologicoGuardado = await tx.examenOdontologico.update({
            where: {
              id: examenExistente.id
            },
            data: {
              examenClinicoGeneral: examenClinicoGeneral
            }
          })
        } else {
          // Crear un nuevo examen odontológico
          examenOdontologicoGuardado = await tx.examenOdontologico.create({
            data: {
              idFicha: ficha.id,
              fecha: new Date(),
              examenClinicoGeneral: examenClinicoGeneral
            }
          })
        }
      }

      // 2. MANEJAR EXAMEN CLÍNICO ESTOMATOLÓGICO (tabla ExamenClinicoEstomatologico)
      const datosEstomatologicos = {
        ATM: ATM || null,
        ganglios: ganglios || null,
        piel: piel || null,
        simetriaFacial: simetriaFacial || null,
        glandulasSalivales: glandulasSalivales || null,
        encia: encia || null,
        vestibulo: vestibulo || null,
        carrillo: carrillo || null,
        paladar: paladar || null,
        orofaringe: orofaringe || null,
        lengua: lengua || null,
        pisoBoca: pisoBoca || null,
        oclusion: oclusion || null,
        observaciones: observaciones || null
      }

      // Verificar si ya existe un examen estomatológico para esta ficha
      const estomatologicoExistente = await tx.examenClinicoEstomatologico.findUnique({
        where: {
          idFicha: ficha.id
        }
      })

      if (estomatologicoExistente) {
        // Actualizar el examen estomatológico existente
        examenEstomatologicoGuardado = await tx.examenClinicoEstomatologico.update({
          where: {
            idFicha: ficha.id
          },
          data: datosEstomatologicos
        })
      } else {
        // Crear un nuevo examen estomatológico
        examenEstomatologicoGuardado = await tx.examenClinicoEstomatologico.create({
          data: {
            idFicha: ficha.id,
            ...datosEstomatologicos
          }
        })
      }

      return {
        examenOdontologico: examenOdontologicoGuardado,
        examenEstomatologico: examenEstomatologicoGuardado
      }
    })

    return NextResponse.json({ 
      message: 'Examen clínico guardado correctamente',
      data: resultado
    })

  } catch (error) {
    console.error('Error al guardar examen clínico:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}

// DELETE - Eliminar examen clínico (ambas tablas)
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

    // Usar transacción para eliminar ambos registros
    await prisma.$transaction(async (tx) => {
      // 1. Eliminar examen clínico estomatológico si existe
      const examenEstomatologico = await tx.examenClinicoEstomatologico.findUnique({
        where: {
          idFicha: ficha.id
        }
      })

      if (examenEstomatologico) {
        await tx.examenClinicoEstomatologico.delete({
          where: {
            idFicha: ficha.id
          }
        })
      }

      // 2. Limpiar el campo examenClinicoGeneral de los exámenes odontológicos
      await tx.examenOdontologico.updateMany({
        where: {
          idFicha: ficha.id
        },
        data: {
          examenClinicoGeneral: null
        }
      })
    })

    return NextResponse.json({ 
      message: 'Examen clínico eliminado correctamente'
    })

  } catch (error) {
    console.error('Error al eliminar examen clínico:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}