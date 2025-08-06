
// ========================================
// 2. src/app/api/dashboard/stats/route.ts
// ========================================
import { NextResponse } from 'next/server'
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

export async function GET() {
  try {
    // Obtener fecha actual para filtros
    const hoy = new Date()
    const inicioHoy = new Date(hoy)
    inicioHoy.setHours(0, 0, 0, 0)
    const finHoy = new Date(hoy)
    finHoy.setHours(23, 59, 59, 999)
    
    // Obtener primer y último día del mes actual
    const inicioMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1)
    const finMes = new Date(hoy.getFullYear(), hoy.getMonth() + 1, 0, 23, 59, 59, 999)

    // 1. Total de pacientes registrados
    const totalPacientes = await prisma.paciente.count({
      where: {
        estado: 'ACTIVO'
      }
    })

    // 2. Pacientes nuevos hoy (basado en fecha de registro de ficha)
    const pacientesNuevosHoy = await prisma.fichaOdontologica.count({
      where: {
        fechaRegistro: {
          gte: inicioHoy,
          lte: finHoy
        }
      }
    })

    // 3. Citas programadas para hoy
    const citasHoy = await prisma.cita.count({
      where: {
        fechaHora: {
          gte: inicioHoy,
          lte: finHoy
        },
        estado: {
          in: ['CONFIRMADA', 'SOLICITADA']
        }
      }
    })

    // 4. Citas pendientes (todas las futuras no confirmadas)
    const citasPendientes = await prisma.cita.count({
      where: {
        fechaHora: {
          gte: new Date()
        },
        estado: 'SOLICITADA'
      }
    })

    // 5. Ingresos mensuales (suma de facturas completadas este mes)
    const ingresosMensualesResult = await prisma.factura.aggregate({
      _sum: {
        monto: true
      },
      where: {
        fechaEmision: {
          gte: inicioMes,
          lte: finMes
        },
        estado: 'COMPLETADO'
      }
    })

    // 6. Fichas activas
    const fichasActivas = await prisma.fichaOdontologica.count({
      where: {
        estado: 'ACTIVA'
      }
    })

    // 7. Distribución de citas por estado (últimos 30 días)
    const hace30Dias = new Date()
    hace30Dias.setDate(hace30Dias.getDate() - 30)

    const citasPorEstado = await prisma.cita.groupBy({
      by: ['estado'],
      _count: {
        estado: true
      },
      where: {
        fechaHora: {
          gte: hace30Dias
        }
      }
    })

    // Formatear datos de citas por estado
    const citasEstadoFormateado = {
      confirmadas: citasPorEstado.find(c => c.estado === 'CONFIRMADA')?._count.estado || 0,
      pendientes: citasPorEstado.find(c => c.estado === 'SOLICITADA')?._count.estado || 0,
      canceladas: citasPorEstado.find(c => c.estado === 'CANCELADA')?._count.estado || 0
    }

    // Respuesta final
    const stats = {
      totalPacientes,
      pacientesNuevosHoy,
      citasHoy,
      citasPendientes,
      ingresosMensuales: Number(ingresosMensualesResult._sum.monto) || 0,
      fichasActivas,
      citasPorEstado: citasEstadoFormateado
    }

    return NextResponse.json(stats)

  } catch (error) {
    console.error('Error al obtener estadísticas del dashboard:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}
