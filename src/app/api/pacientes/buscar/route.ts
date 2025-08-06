
// // Maneja GET (buscar)
// ANTES 
// // app/api/pacientes/buscar/route.ts
// import { NextRequest, NextResponse } from 'next/server'
// import { PrismaClient } from '../../../../generated/prisma'

// const prisma = new PrismaClient()

// export async function GET(request: NextRequest) {
//   try {
//     const { searchParams } = new URL(request.url)
//     const dni = searchParams.get('dni')

//     if (!dni) {
//       return NextResponse.json(
//         { error: 'DNI es requerido' },
//         { status: 400 }
//       )
//     }

//     const paciente = await prisma.paciente.findUnique({
//       where: {
//         dni: dni
//       }
//     })

//     if (!paciente) {
//       return NextResponse.json(
//         { error: 'Paciente no encontrado' },
//         { status: 404 }
//       )
//     }

//     return NextResponse.json({ paciente })
//   } catch (error) {
//     console.error('Error al buscar paciente:', error)
//     return NextResponse.json(
//       { error: 'Error interno del servidor' },
//       { status: 500 }
//     )
//   } finally {
//     await prisma.$disconnect()
//   }
// }



 import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const dni = searchParams.get('dni')

    if (!dni) {
      return NextResponse.json(
        { error: 'DNI es requerido' },
        { status: 400 }
      )
    }

    const paciente = await prisma.paciente.findUnique({
      where: {
        dni: dni
      }
    })

    if (!paciente) {
      return NextResponse.json(
        { error: 'Paciente no encontrado' },
        { status: 404 }
      )
    }

    return NextResponse.json({ paciente })
  } catch (error) {
    console.error('Error al buscar paciente:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}