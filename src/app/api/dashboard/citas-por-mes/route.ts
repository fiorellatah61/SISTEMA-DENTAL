
// ========================================
// 4. src/app/api/dashboard/citas-por-mes/route.ts (Versión actualizada)
// ========================================
import { NextResponse } from 'next/server'
import { PrismaClient } from "../../../../generated/prisma"

const prisma = new PrismaClient()

export async function GET() {
  try {
    // Obtener los últimos 12 meses
    const fechaActual = new Date()
    const hace12Meses = new Date()
    hace12Meses.setMonth(hace12Meses.getMonth() - 11)
    hace12Meses.setDate(1) // Primer día del mes

    // Nombres de meses en español
    const nombresMeses = [
      'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun',
      'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'
    ]

    // Generar array de los últimos 12 meses
    const mesesData = []
    for (let i = 0; i < 12; i++) {
      const fecha = new Date(hace12Meses)
      fecha.setMonth(fecha.getMonth() + i)
      
      const inicioMes = new Date(fecha.getFullYear(), fecha.getMonth(), 1)
      const finMes = new Date(fecha.getFullYear(), fecha.getMonth() + 1, 0, 23, 59, 59, 999)
      
      // Contar citas del mes
      const citasDelMes = await prisma.cita.count({
        where: {
          fechaHora: {
            gte: inicioMes,
            lte: finMes
          },
          estado: {
            in: ['CONFIRMADA', 'MODIFICADA'] // Solo citas completadas
          }
        }
      })

      // Calcular ingresos del mes (facturas relacionadas con citas)
      const ingresosDelMes = await prisma.factura.aggregate({
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

      mesesData.push({
        mes: nombresMeses[fecha.getMonth()],
        citas: citasDelMes,
        ingresos: Number(ingresosDelMes._sum.monto) || 0,
        anio: fecha.getFullYear(),
        numeroMes: fecha.getMonth() + 1
      })
    }

    return NextResponse.json(mesesData)

  } catch (error) {
    console.error('Error al obtener citas por mes:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}