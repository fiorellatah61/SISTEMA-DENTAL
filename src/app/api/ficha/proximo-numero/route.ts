// // app/api/ficha/proximo-numero/route.ts
// import { NextRequest, NextResponse } from 'next/server'
// import { PrismaClient } from "@prisma/client"
// const prisma = new PrismaClient()
// export async function GET(request: NextRequest) {
//   try {
//     // Buscar la última ficha creada para obtener el número más alto
//     const ultimaFicha = await prisma.fichaOdontologica.findFirst({
//       orderBy: {
//         numeroFicha: 'desc'
//       },
//       select: {
//         numeroFicha: true
//       }
//     })
//     let proximoNumero = '001' // Número inicial si no hay fichas

//     if (ultimaFicha && ultimaFicha.numeroFicha) {
//       // Extraer el número y aumentar en 1
//       const ultimoNumero = parseInt(ultimaFicha.numeroFicha)
//       const siguienteNumero = ultimoNumero + 1
//       proximoNumero = siguienteNumero.toString().padStart(3, '0')
//     }

//     return NextResponse.json({ proximoNumero })
//   } catch (error) {
//     console.error('Error al obtener próximo número de ficha:', error)
//     return NextResponse.json(
//       { error: 'Error interno del servidor' },
//       { status: 500 }
//     )
//   } finally {
//     await prisma.$disconnect()
//   }
// }

//NUEVO-------------------USANDO SINGLETON
// app/api/ficha/proximo-numero/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma' // ✅ Usar singleton

export async function GET(request: NextRequest) {
  try {
    // Buscar la última ficha creada para obtener el número más alto
    const ultimaFicha = await prisma.fichaOdontologica.findFirst({
      orderBy: {
        numeroFicha: 'desc'
      },
      select: {
        numeroFicha: true
      }
    })

    let proximoNumero = '001' // Número inicial si no hay fichas

    if (ultimaFicha && ultimaFicha.numeroFicha) {
      // Extraer el número y aumentar en 1
      const ultimoNumero = parseInt(ultimaFicha.numeroFicha)
      const siguienteNumero = ultimoNumero + 1
      proximoNumero = siguienteNumero.toString().padStart(3, '0')
    }

    return NextResponse.json({ proximoNumero })
  } catch (error) {
    console.error('Error al obtener próximo número de ficha:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
  // ✅ Eliminado el prisma.$disconnect() ya que usamos singleton
}