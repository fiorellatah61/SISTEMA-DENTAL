// // src/app/api/dashboard/tratamientos-comunes/route.ts

// // ========================================
// // 3. src/app/api/dashboard/tratamientos-comunes/route.ts
// // ========================================
// import { NextResponse } from 'next/server'
// import { PrismaClient } from "@prisma/client"

// const prisma = new PrismaClient()

// export async function GET() {
//   try {
//     // Obtener fecha de los últimos 6 meses para análisis relevante
//     const hace6Meses = new Date()
//     hace6Meses.setMonth(hace6Meses.getMonth() - 6)

//     // 1. Obtener tratamientos desde EvolucionPaciente (tratamientos realizados)
//     const tratamientosRealizados = await prisma.evolucionPaciente.findMany({
//       where: {
//         fecha: {
//           gte: hace6Meses
//         }
//       },
//       select: {
//         tratamientoRealizado: true,
//         aCuenta: true,
//         saldo: true
//       }
//     })

//     // 2. Obtener planes de tratamiento más utilizados
//     const planesTratamiento = await prisma.planTratamiento.findMany({
//       include: {
//         _count: {
//           select: {
//             examenesOdontologicos: true,
//             evolucionPacientes: true
//           }
//         }
//       }
//     })

//     // 3. Procesar tratamientos realizados
//     const tratamientosMap = new Map()

//     // Procesar evoluciones (tratamientos completados)
//     tratamientosRealizados.forEach(evolucion => {
//       const tratamiento = evolucion.tratamientoRealizado.trim()
//       const ingresoTotal = Number(evolucion.aCuenta) + Number(evolucion.saldo)
      
//       if (tratamientosMap.has(tratamiento)) {
//         tratamientosMap.get(tratamiento).cantidad += 1
//         tratamientosMap.get(tratamiento).ingresos += ingresoTotal
//       } else {
//         tratamientosMap.set(tratamiento, {
//           tratamiento: tratamiento,
//           cantidad: 1,
//           ingresos: ingresoTotal
//         })
//       }
//     })

//     // 4. Procesar planes de tratamiento (tratamientos planificados)
//     planesTratamiento.forEach(plan => {
//       const totalUsos = plan._count.examenesOdontologicos + plan._count.evolucionPacientes
      
//       if (totalUsos > 0) {
//         const nombreTratamiento = plan.descripcion.substring(0, 50) // Limitar longitud
//         const costoUnitario = Number(plan.costoTotal)
        
//         if (tratamientosMap.has(nombreTratamiento)) {
//           tratamientosMap.get(nombreTratamiento).cantidad += totalUsos
//           tratamientosMap.get(nombreTratamiento).ingresos += (costoUnitario * totalUsos)
//         } else {
//           tratamientosMap.set(nombreTratamiento, {
//             tratamiento: nombreTratamiento,
//             cantidad: totalUsos,
//             ingresos: costoUnitario * totalUsos
//           })
//         }
//       }
//     })

//     // 5. Convertir a array y ordenar por cantidad
//     const tratamientosArray = Array.from(tratamientosMap.values())
//       .sort((a, b) => b.cantidad - a.cantidad)
//       .slice(0, 10) // Top 10 tratamientos

//     // 6. Formatear nombres de tratamientos comunes
//     const tratamientosFormateados = tratamientosArray.map(item => {
//       let nombreFormateado = item.tratamiento

//       // Normalizar nombres comunes
//       if (nombreFormateado.toLowerCase().includes('limpieza')) {
//         nombreFormateado = 'Limpieza Dental'
//       } else if (nombreFormateado.toLowerCase().includes('obturación') || 
//                  nombreFormateado.toLowerCase().includes('empaste')) {
//         nombreFormateado = 'Obturación'
//       } else if (nombreFormateado.toLowerCase().includes('endodoncia') ||
//                  nombreFormateado.toLowerCase().includes('conducto')) {
//         nombreFormateado = 'Endodoncia'
//       } else if (nombreFormateado.toLowerCase().includes('extracción') ||
//                  nombreFormateado.toLowerCase().includes('exodoncia')) {
//         nombreFormateado = 'Extracción'
//       } else if (nombreFormateado.toLowerCase().includes('ortodoncia') ||
//                  nombreFormateado.toLowerCase().includes('brackets')) {
//         nombreFormateado = 'Ortodoncia'
//       } else if (nombreFormateado.toLowerCase().includes('implante')) {
//         nombreFormateado = 'Implante Dental'
//       } else if (nombreFormateado.toLowerCase().includes('corona') ||
//                  nombreFormateado.toLowerCase().includes('prótesis')) {
//         nombreFormateado = 'Corona/Prótesis'
//       } else if (nombreFormateado.toLowerCase().includes('blanqueamiento')) {
//         nombreFormateado = 'Blanqueamiento'
//       }

//       return {
//         tratamiento: nombreFormateado,
//         cantidad: item.cantidad,
//         ingresos: Math.round(item.ingresos * 100) / 100 // Redondear a 2 decimales
//       }
//     })

//     // 7. Agrupar tratamientos duplicados después del formateo
//     const tratamientosFinales = new Map()
    
//     tratamientosFormateados.forEach(item => {
//       if (tratamientosFinales.has(item.tratamiento)) {
//         tratamientosFinales.get(item.tratamiento).cantidad += item.cantidad
//         tratamientosFinales.get(item.tratamiento).ingresos += item.ingresos
//       } else {
//         tratamientosFinales.set(item.tratamiento, item)
//       }
//     })

//     // Convertir a array y ordenar nuevamente
//     const resultado = Array.from(tratamientosFinales.values())
//       .sort((a, b) => b.cantidad - a.cantidad)
//       .slice(0, 8) // Top 8 para mejor visualización

//     return NextResponse.json(resultado)

//   } catch (error) {
//     console.error('Error al obtener tratamientos más comunes:', error)
//     return NextResponse.json(
//       { error: 'Error interno del servidor' },
//       { status: 500 }
//     )
//   } finally {
//     await prisma.$disconnect()
//   }
// }
//-----------------------NUEVO-----------------
// ========================================
// src/app/api/dashboard/tratamientos-comunes/route.ts
// ========================================
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { executeWithRetry } from '@/lib/db-utils'

export async function GET() {
  try {
    const tratamientos = await executeWithRetry(() =>
      prisma.evolucionPaciente.groupBy({
        by: ['tratamientoRealizado'],
        _count: {
          tratamientoRealizado: true
        },
        _sum: {
          aCuenta: true
        },
        orderBy: {
          _count: {
            tratamientoRealizado: 'desc'
          }
        },
        take: 10
      })
    );

    if (!tratamientos) {
      return NextResponse.json([]);
    }

    const tratamientosFormateados = tratamientos.map((tratamientoItem: any) => ({
      tratamiento: tratamientoItem.tratamientoRealizado.length > 30 
        ? tratamientoItem.tratamientoRealizado.substring(0, 30) + '...'
        : tratamientoItem.tratamientoRealizado,
      cantidad: tratamientoItem._count.tratamientoRealizado,
      ingresos: Number(tratamientoItem._sum.aCuenta) || 0
    }));

    return NextResponse.json(tratamientosFormateados)
    
  } catch (error) {
    console.error('Error al obtener tratamientos comunes:', error)
    return NextResponse.json([])
  }
}