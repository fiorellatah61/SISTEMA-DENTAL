// api/dashboard/pacientes/route.ts
// api/dashboard/pacientes/route.ts
// Propósito: API para listar pacientes con paginación, búsqueda y conteos relacionados (fichas, citas).
// Maneja errores con retries y devuelve estructura por defecto si falla.
// src/app/api/dashboard/pacientes/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { executeWithRetry } from '@/lib/db-utils';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
    const limit = Math.min(50, Math.max(5, parseInt(searchParams.get('limit') || '10'))); // Límites
    const search = searchParams.get('search')?.trim() || '';
    
    const skip = (page - 1) * limit;

    // Filtros optimizados
    const whereClause = search ? {
      OR: [
        { nombres: { contains: search, mode: 'insensitive' as const } },
        { apellidos: { contains: search, mode: 'insensitive' as const } },
        { dni: { contains: search } },
        { telefono: { contains: search } },
        { email: { contains: search, mode: 'insensitive' as const } }
      ]
    } : {};

    // Ejecutar consultas con timeout más corto
    const queryPromise = Promise.all([
      // Consulta principal con select específico para mejor performance
      executeWithRetry(async () => 
        prisma.paciente.findMany({
          where: whereClause,
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
          },
          orderBy: { createdAt: 'desc' },
          skip,
          take: limit
        })
      ),
      
      // Count separado y más rápido
      executeWithRetry(async () =>
        prisma.paciente.count({ where: whereClause })
      )
    ]);

    // Timeout de 8 segundos para Railway
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Query timeout')), 8000)
    );

    const [pacientes, totalCount] = await Promise.race([
      queryPromise,
      timeoutPromise
    ]) as [any[], number];

    const totalPages = Math.ceil((totalCount || 0) / limit);

    const response = {
      pacientes: pacientes || [],
      total: totalCount || 0,
      currentPage: page,
      totalPages,
      hasMore: page < totalPages
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('Error en dashboard pacientes:', error);
    
    // Respuesta por defecto
    return NextResponse.json({
      pacientes: [],
      total: 0,
      currentPage: 1,
      totalPages: 1,
      hasMore: false
    });
  }
}