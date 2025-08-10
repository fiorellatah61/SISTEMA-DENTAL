// AUMENTADO  ESTE GET PARA LAS FACTURAS 
// GET - Obtener todos los pacientes activos
import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()
export async function GET() {
  try {
    const pacientes = await prisma.paciente.findMany({
      where: {
        estado: 'ACTIVO'
      },
      select: {
        id: true,
        nombres: true,
        apellidos: true,
        dni: true
      },
      orderBy: [
        { nombres: 'asc' },
        { apellidos: 'asc' }
      ]
    })

    return NextResponse.json(pacientes)
  } catch (error) {
    console.error('Error obteniendo pacientes:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}