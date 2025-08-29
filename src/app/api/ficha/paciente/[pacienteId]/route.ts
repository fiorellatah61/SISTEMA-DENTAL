// // app/api/ficha/paciente/[pacienteId]/route.ts
// import { NextRequest, NextResponse } from 'next/server'
// import { PrismaClient } from '@prisma/client'

// const prisma = new PrismaClient()

// export async function GET(
//   request: NextRequest,
//   { params }: { params: { pacienteId: string } }
// ) {
//   try {
//     const { pacienteId } = params

//     // Buscar la ficha odontológica del paciente (la más reciente)
//     const ficha = await prisma.fichaOdontologica.findFirst({
//       where: {
//         idPaciente: pacienteId,
//         estado: 'ACTIVA'
//       },
//       include: {
//         paciente: {
//           select: {
//             id: true,
//             nombres: true,
//             apellidos: true,
//             dni: true
//           }
//         }
//       },
//       orderBy: {
//         fechaRegistro: 'desc'
//       }
//     })

//     if (!ficha) {
//       return NextResponse.json({ 
//         message: 'No se encontró ficha para este paciente',
//         ficha: null
//       })
//     }

//     return NextResponse.json({
//       success: true,
//       ficha: {
//         id: ficha.id,
//         numeroFicha: ficha.numeroFicha,
//         motivoConsulta: ficha.motivoConsulta,
//         archivoFichaPdf: ficha.archivoFichaPdf,
//         fechaUltimoPdf: ficha.fechaUltimoPdf,
//         fechaRegistro: ficha.fechaRegistro,
//         paciente: ficha.paciente
//       }
//     })

//   } catch (error) {
//     console.error('Error al obtener ficha:', error)
//     return NextResponse.json({ 
//       error: 'Error interno del servidor' 
//     }, { status: 500 })
//   } finally {
//     await prisma.$disconnect()
//   }
// }

// NUEVO-------------CON SINGLETON--------------   import { prisma } from '@/lib/prisma'
// app/api/ficha/paciente/[pacienteId]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
export async function GET(
  request: NextRequest,
  { params }: { params: { pacienteId: string } }
) {
  try {
    const { pacienteId } = params

    // Buscar la ficha odontológica del paciente (la más reciente)
    const ficha = await prisma.fichaOdontologica.findFirst({
      where: {
        idPaciente: pacienteId,
        estado: 'ACTIVA'
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
      },
      orderBy: {
        fechaRegistro: 'desc'
      }
    })

    if (!ficha) {
      return NextResponse.json({ 
        message: 'No se encontró ficha para este paciente',
        ficha: null
      })
    }

    return NextResponse.json({
      success: true,
      ficha: {
        id: ficha.id,
        numeroFicha: ficha.numeroFicha,
        motivoConsulta: ficha.motivoConsulta,
        archivoFichaPdf: ficha.archivoFichaPdf,
        fechaUltimoPdf: ficha.fechaUltimoPdf,
        fechaRegistro: ficha.fechaRegistro,
        paciente: ficha.paciente
      }
    })

  } catch (error) {
    console.error('Error al obtener ficha:', error)
    return NextResponse.json({ 
      error: 'Error interno del servidor' 
    }, { status: 500 })
  }
}