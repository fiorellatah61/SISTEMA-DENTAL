// // // app/api/pacientes/[id]/route.ts

// import { NextRequest, NextResponse } from 'next/server'
// import { PrismaClient } from "@prisma/client"

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
//       //AUMEMTADO EMAIL
//       email,
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
//          //AUMEMTADO EMAIL
//         email,
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


// nuevo--------------------------------------------
// app/api/pacientes/[id]/route.ts
// app/api/pacientes/[id]/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Función para obtener el próximo número de ficha
async function obtenerProximoNumeroFicha() {
  try {
    // Buscar la última ficha creada ordenando por numeroFicha de forma descendente
    const ultimaFicha = await prisma.fichaOdontologica.findFirst({
      orderBy: {
        numeroFicha: 'desc'
      }
    })

    if (!ultimaFicha) {
      return '001' // Primera ficha
    }

    // Convertir el número de ficha a entero, incrementar y volver a formatear
    const ultimoNumero = parseInt(ultimaFicha.numeroFicha)
    const proximoNumero = ultimoNumero + 1
    
    // Formatear con ceros a la izquierda (3 dígitos)
    return proximoNumero.toString().padStart(3, '0')
  } catch (error) {
    console.error('Error al obtener próximo número de ficha:', error)
    return '001' // Valor por defecto en caso de error
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
  // ✅ Forma correcta en Next.js 15
const { id } = await params

    const {
      nombres,
      apellidos,
      dni,
      fechaNacimiento,
      edad,
      sexo,
      telefono,
      email,
      lugarNacimiento,
      direccionActual,
      acompanante
    } = body

    // Usar transacción para actualizar paciente y crear ficha si no existe
    const resultado = await prisma.$transaction(async (prisma) => {
      // Actualizar el paciente
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
          email,
          lugarNacimiento,
          direccionActual,
          acompanante
        }
      })

      // Verificar si el paciente ya tiene una ficha odontológica
      const fichaExistente = await prisma.fichaOdontologica.findFirst({
        where: {
          idPaciente: id
        }
      })

      let ficha = fichaExistente
      let fichaCreadaNueva = false

      // Si no tiene ficha, crear una nueva
      if (!fichaExistente) {
        console.log(`Creando ficha odontológica para paciente: ${nombres} ${apellidos}`)
        
        const proximoNumeroFicha = await obtenerProximoNumeroFicha()
        
        ficha = await prisma.fichaOdontologica.create({
          data: {
            numeroFicha: proximoNumeroFicha,
            idPaciente: id,
            fechaRegistro: new Date(),
            estado: 'ACTIVA'
          }
        })

        fichaCreadaNueva = true
        console.log(`Ficha creada con número: ${proximoNumeroFicha}`)
      }

      return { paciente: pacienteActualizado, ficha, fichaCreadaNueva }
    })

    return NextResponse.json({ 
      paciente: resultado.paciente,
      ficha: resultado.ficha,
      message: resultado.fichaCreadaNueva ? 
        'Paciente actualizado y ficha odontológica creada' : 
        'Paciente actualizado correctamente'
    })
  } catch (error) {
    console.error('Error al actualizar paciente:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
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
  }
}