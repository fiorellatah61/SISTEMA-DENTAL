// // app/api/examenes-odontologicos/[idPaciente]/route.ts
// import { NextRequest, NextResponse } from 'next/server'
// import { PrismaClient } from '@prisma/client'

// const prisma = new PrismaClient()

// export async function GET(request: NextRequest, { params }: { params: Awaited<{ idPaciente: string }> }) {
//   try {
//     const { idPaciente } = await params

//     // Buscar fichas del paciente y sus exámenes
//     const fichas = await prisma.fichaOdontologica.findMany({
//       where: { 
//         idPaciente: idPaciente,
//         estado: 'ACTIVA'
//       },
//       include: {
//         examenesOdontologicos: {
//           include: {
//             planTratamiento: true
//           },
//           orderBy: { fecha: 'desc' }
//         }
//       }
//     })

//     // Extraer todos los exámenes odontológicos
//     const examenes = fichas.flatMap(ficha => 
//       ficha.examenesOdontologicos.map(examen => ({
//         id: examen.id,
//         fecha: examen.fecha,
//         examenClinicoGeneral: examen.examenClinicoGeneral,
//         diagnostico: examen.diagnostico,
//         presupuesto: examen.presupuesto,
//         planTratamiento: examen.planTratamiento ? {
//           id: examen.planTratamiento.id,
//           descripcion: examen.planTratamiento.descripcion,
//           costoTotal: examen.planTratamiento.costoTotal
//         } : null,
//         fichaId: ficha.id,
//         numeroFicha: ficha.numeroFicha
//       }))
//     )

//     return NextResponse.json(examenes)
//   } catch (error) {
//     console.error('Error obteniendo exámenes odontológicos:', error)
//     return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
//   }
// }


//  NUEVO-----------------CONSINGLETON 

// app/api/examenes-odontologicos/[idPaciente]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
export async function GET(request: NextRequest, { params }: { params: Awaited<{ idPaciente: string }> }) {
  try {
    const { idPaciente } = await params

    // Buscar fichas del paciente y sus exámenes
    const fichas = await prisma.fichaOdontologica.findMany({
      where: { 
        idPaciente: idPaciente,
        estado: 'ACTIVA'
      },
      include: {
        examenesOdontologicos: {
          include: {
            planTratamiento: true
          },
          orderBy: { fecha: 'desc' }
        }
      }
    })

    // Extraer todos los exámenes odontológicos
    const examenes = fichas.flatMap(ficha => 
      ficha.examenesOdontologicos.map(examen => ({
        id: examen.id,
        fecha: examen.fecha,
        examenClinicoGeneral: examen.examenClinicoGeneral,
        diagnostico: examen.diagnostico,
        presupuesto: examen.presupuesto,
        planTratamiento: examen.planTratamiento ? {
          id: examen.planTratamiento.id,
          descripcion: examen.planTratamiento.descripcion,
          costoTotal: examen.planTratamiento.costoTotal
        } : null,
        fichaId: ficha.id,
        numeroFicha: ficha.numeroFicha
      }))
    )

    return NextResponse.json(examenes)
  } catch (error) {
    console.error('Error obteniendo exámenes odontológicos:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
