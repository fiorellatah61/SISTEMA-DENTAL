// ANTES 
// // app/api/pacientes/[id]/route.ts
// import { NextRequest, NextResponse } from 'next/server'
// import { PrismaClient } from '../../../../generated/prisma'

// const prisma = new PrismaClient()

// export async function PUT(
//   request: NextRequest,
//   { params }: { params: { id: string } }
// ) {
//   try {
//     const body = await request.json()
//     const { id } = params

//     const {
//       nombres,
//       apellidos,
//       dni,
//       fechaNacimiento,
//       edad,
//       sexo,
//       telefono,
//       lugarNacimiento,
//       direccionActual,
//       acompanante
//     } = body

//     const pacienteActualizado = await prisma.paciente.update({
//       where: { id },
//       data: {
//         nombres,
//         apellidos,
//         dni,
//         fechaNacimiento: fechaNacimiento ? new Date(fechaNacimiento) : null,
//         edad,
//         sexo,
//         telefono,
//         lugarNacimiento,
//         direccionActual,
//         acompanante
//       }
//     })
//     return NextResponse.json({ paciente: pacienteActualizado })
//   } catch (error) {
//     console.error('Error al actualizar paciente:', error)
//     return NextResponse.json(
//       { error: 'Error interno del servidor' },
//       { status: 500 }
//     )
//   } finally {
//     await prisma.$disconnect()
//   }
// }

// export async function DELETE(
//   request: NextRequest,
//   { params }: { params: { id: string } }
// ) {
//   try {
//     const { id } = params

//     // Verificar si el paciente existe
//     const pacienteExistente = await prisma.paciente.findUnique({
//       where: { id }
//     })

//     if (!pacienteExistente) {
//       return NextResponse.json(
//         { error: 'Paciente no encontrado' },
//         { status: 404 }
//       )
//     }
//     // Eliminar el paciente
//     await prisma.paciente.delete({
//       where: { id }
//     })

//     return NextResponse.json({ message: 'Paciente eliminado correctamente' })
//   } catch (error) {
//     console.error('Error al eliminar paciente:', error)
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

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const { id } = params

    const {
      nombres,
      apellidos,
      dni,
      fechaNacimiento,
      edad,
      sexo,
      telefono,
      lugarNacimiento,
      direccionActual,
      acompanante
    } = body

    const pacienteActualizado = await prisma.paciente.update({
      where: { id },
      data: {
        nombres,
        apellidos,
        dni,
        fechaNacimiento: fechaNacimiento ? new Date(fechaNacimiento) : null,
        edad,
        sexo,
        telefono,
        lugarNacimiento,
        direccionActual,
        acompanante
      }
    })
    return NextResponse.json({ paciente: pacienteActualizado })
  } catch (error) {
    console.error('Error al actualizar paciente:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    // Verificar si el paciente existe
    const pacienteExistente = await prisma.paciente.findUnique({
      where: { id }
    })

    if (!pacienteExistente) {
      return NextResponse.json(
        { error: 'Paciente no encontrado' },
        { status: 404 }
      )
    }
    // Eliminar el paciente
    await prisma.paciente.delete({
      where: { id }
    })

    return NextResponse.json({ message: 'Paciente eliminado correctamente' })
  } catch (error) {
    console.error('Error al eliminar paciente:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}