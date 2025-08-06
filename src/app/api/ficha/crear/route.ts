// app/api/ficha/crear/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

export async function POST(request: NextRequest) {
  try {
    const { pacienteId, motivoConsulta } = await request.json()

    // Verificar que el paciente existe
    const paciente = await prisma.paciente.findUnique({
      where: { id: pacienteId }
    })

    if (!paciente) {
      return NextResponse.json({ 
        error: 'Paciente no encontrado' 
      }, { status: 404 })
    }

    // Verificar si ya existe una ficha activa para este paciente
    const fichaExistente = await prisma.fichaOdontologica.findFirst({
      where: {
        idPaciente: pacienteId,
        estado: 'ACTIVA'
      }
    })

    if (fichaExistente) {
      // Si ya existe, actualizamos el motivo de consulta si se proporciona
      if (motivoConsulta) {
        const fichaActualizada = await prisma.fichaOdontologica.update({
          where: { id: fichaExistente.id },
          data: { motivoConsulta },
          include: {
            paciente: {
              select: {
                id: true,
                nombres: true,
                apellidos: true,
                dni: true
              }
            }
          }
        })

        return NextResponse.json({
          success: true,
          message: 'Ficha actualizada correctamente',
          ficha: fichaActualizada
        })
      }

      // Si no hay motivo de consulta, devolver la ficha existente
      const fichaConPaciente = await prisma.fichaOdontologica.findUnique({
        where: { id: fichaExistente.id },
        include: {
          paciente: {
            select: {
              id: true,
              nombres: true,
              apellidos: true,
              dni: true
            }
          }
        }
      })

      return NextResponse.json({
        success: true,
        message: 'Ficha existente encontrada',
        ficha: fichaConPaciente
      })
    }

    // Generar próximo número de ficha
    const ultimaFicha = await prisma.fichaOdontologica.findFirst({
      orderBy: { numeroFicha: 'desc' }
    })

    let proximoNumero = '001'
    if (ultimaFicha?.numeroFicha) {
      const ultimoNumero = parseInt(ultimaFicha.numeroFicha)
      proximoNumero = (ultimoNumero + 1).toString().padStart(3, '0')
    }

    // Crear nueva ficha
    const nuevaFicha = await prisma.fichaOdontologica.create({
      data: {
        numeroFicha: proximoNumero,
        idPaciente: pacienteId,
        motivoConsulta: motivoConsulta || null,
        estado: 'ACTIVA',
        fechaRegistro: new Date()
      },
      include: {
        paciente: {
          select: {
            id: true,
            nombres: true,
            apellidos: true,
            dni: true
          }
        }
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Ficha creada correctamente',
      ficha: nuevaFicha
    })

  } catch (error) {
    console.error('Error al crear ficha:', error)
    return NextResponse.json({ 
      error: 'Error interno del servidor' 
    }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}