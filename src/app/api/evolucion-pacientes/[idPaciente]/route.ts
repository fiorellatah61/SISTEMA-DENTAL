// // app/api/evolucion-pacientes/[idPaciente]/route.ts
// import { NextRequest, NextResponse } from 'next/server'
// import { PrismaClient } from '@prisma/client'

// const prisma = new PrismaClient()

// export async function GET(request: NextRequest, { params }: { params: Awaited<{ idPaciente: string }> }) {
//   try {
//     const { idPaciente } = await params

//     // Buscar fichas del paciente y sus evoluciones
//     const fichas = await prisma.fichaOdontologica.findMany({
//       where: { 
//         idPaciente: idPaciente,
//         estado: 'ACTIVA'
//       },
//       include: {
//         evolucionPacientes: {
//           include: {
//             planTratamiento: true
//           },
//           orderBy: { fecha: 'desc' }
//         }
//       }
//     })

//     // Extraer todas las evoluciones
//     const evoluciones = fichas.flatMap(ficha => 
//       ficha.evolucionPacientes.map(evolucion => ({
//         id: evolucion.id,
//         fecha: evolucion.fecha,
//         tratamientoRealizado: evolucion.tratamientoRealizado,
//         aCuenta: evolucion.aCuenta,
//         saldo: evolucion.saldo,
//         observaciones: evolucion.observaciones,
//         planTratamiento: evolucion.planTratamiento ? {
//           id: evolucion.planTratamiento.id,
//           descripcion: evolucion.planTratamiento.descripcion,
//           costoTotal: evolucion.planTratamiento.costoTotal
//         } : null,
//         fichaId: ficha.id,
//         numeroFicha: ficha.numeroFicha
//       }))
//     )

//     return NextResponse.json(evoluciones)
//   } catch (error) {
//     console.error('Error obteniendo evoluciones de pacientes:', error)
//     return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
//   }
// }


// NUEVO CON SINGLETON ---------------------------
// app/api/evolucion-pacientes/[idPaciente]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest, { params }: { params: Awaited<{ idPaciente: string }> }) {
  try {
    const { idPaciente } = await params

    // Buscar fichas del paciente y sus evoluciones
    const fichas = await prisma.fichaOdontologica.findMany({
      where: { 
        idPaciente: idPaciente,
        estado: 'ACTIVA'
      },
      include: {
        evolucionPacientes: {
          include: {
            planTratamiento: true
          },
          orderBy: { fecha: 'desc' }
        }
      }
    })

    // Extraer todas las evoluciones
    const evoluciones = fichas.flatMap(ficha => 
      ficha.evolucionPacientes.map(evolucion => ({
        id: evolucion.id,
        fecha: evolucion.fecha,
        tratamientoRealizado: evolucion.tratamientoRealizado,
        aCuenta: evolucion.aCuenta,
        saldo: evolucion.saldo,
        observaciones: evolucion.observaciones,
        planTratamiento: evolucion.planTratamiento ? {
          id: evolucion.planTratamiento.id,
          descripcion: evolucion.planTratamiento.descripcion,
          costoTotal: evolucion.planTratamiento.costoTotal
        } : null,
        fichaId: ficha.id,
        numeroFicha: ficha.numeroFicha
      }))
    )

    return NextResponse.json(evoluciones)
  } catch (error) {
    console.error('Error obteniendo evoluciones de pacientes:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
