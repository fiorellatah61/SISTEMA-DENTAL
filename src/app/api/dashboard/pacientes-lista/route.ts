// ========================================
// src/app/api/dashboard/pacientes-lista/route.ts
// ========================================
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { executeWithRetry } from '@/lib/db-utils'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const search = searchParams.get('search') || ''

    const skip = (page - 1) * limit

    const whereClause = search
      ? {
          OR: [
            { nombres: { contains: search, mode: 'insensitive' as const } },
            { apellidos: { contains: search, mode: 'insensitive' as const } },
            { dni: { contains: search, mode: 'insensitive' as const } },
            { email: { contains: search, mode: 'insensitive' as const } }
          ]
        }
      : {}

    const pacientes = await executeWithRetry(() =>
      prisma.paciente.findMany({
        where: whereClause,
        skip,
        take: limit,
        orderBy: {
          createdAt: 'desc'
        },
        select: {
          id: true,
          nombres: true,
          apellidos: true,
          dni: true,
          fechaNacimiento: true,
          edad: true,
          sexo: true,
          telefono: true,
          email: true,
          estado: true,
          createdAt: true,
          _count: {
            select: {
              fichasOdontologicas: true,
              citas: true
            }
          }
        }
      })
    );

    const total = await executeWithRetry(() =>
      prisma.paciente.count({
        where: whereClause
      })
    );

    const response = {
      pacientes: pacientes || [],
      total: total || 0,
      currentPage: page,
      totalPages: Math.ceil((total || 0) / limit)
    };

    return NextResponse.json(response);
    
  } catch (error) {
    console.error('Error al obtener lista de pacientes:', error)
    
    return NextResponse.json({
      pacientes: [],
      total: 0,
      currentPage: 1,
      totalPages: 0
    });
  }
}
