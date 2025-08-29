// //  DESPUES
// // app/api/pacientes/route.ts
// import { NextRequest, NextResponse } from 'next/server'
// import { PrismaClient } from "@prisma/client"
// // import { PrismaClient } from '@prisma/client'
// import { auth } from '@clerk/nextjs/server'

// const prisma = new PrismaClient()

// export async function POST(request: NextRequest) {
//   try {
//     const body = await request.json()
    
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
//       acompanante,
//       numeroFicha
//     } = body

//     // Validar campos requeridos
//     if (!nombres || !apellidos || !dni) {
//       return NextResponse.json(
//         { error: 'Nombres, apellidos y DNI son requeridos' },
//         { status: 400 }
//       )
//     }

//     // Verificar si ya existe un paciente con ese DNI
//     const pacienteExistente = await prisma.paciente.findUnique({
//       where: { dni }
//     })

//     if (pacienteExistente) {
//       return NextResponse.json(
//         { error: 'Ya existe un paciente con ese DNI' },
//         { status: 400 }
//       )
//     }

//     // Crear paciente y ficha odontológica en una transacción
//     const resultado = await prisma.$transaction(async (prisma) => {
//       // Crear el paciente
//       const nuevoPaciente = await prisma.paciente.create({
//         data: {
//           nombres,
//           apellidos,
//           dni,
//           fechaNacimiento: fechaNacimiento ? new Date(fechaNacimiento) : null,
//           edad,
//           sexo,
//           telefono,
//           lugarNacimiento,
//           direccionActual,
//           acompanante,
//           estado: 'ACTIVO',
//           createdAt: new Date(),
//           updatedAt: new Date()
//         }
//       })

//       // Crear la ficha odontológica automáticamente
//       const nuevaFicha = await prisma.fichaOdontologica.create({
//         data: {
//           numeroFicha: numeroFicha || `F${Date.now()}`,
//           idPaciente: nuevoPaciente.id,
//           fechaRegistro: new Date(),
//           estado: 'ACTIVA'
//         }
//       })

//       return { paciente: nuevoPaciente, ficha: nuevaFicha }
//     })

//     return NextResponse.json({ 
//       paciente: resultado.paciente,
//       ficha: resultado.ficha 
//     }, { status: 201 })
//   } catch (error) {
//     console.error('Error al crear paciente:', error)
//     return NextResponse.json(
//       { error: 'Error interno del servidor' },
//       { status: 500 }
//     )
//   } finally {
//     await prisma.$disconnect()
//   }
// }

// export async function GET(request: NextRequest) {
//   try {
//     const authData = await auth()
//     const userId = authData?.userId
//     console.log('GET /api/pacientes - userId:', userId)

//     if (!userId) {
//       console.error('Autenticación fallida: userId no encontrado')
//       return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
//     }

//     const pacientes = await prisma.paciente.findMany({
//       select: {
//         id: true,
//         nombres: true,
//         apellidos: true,
//         dni: true,
//         telefono: true,
//         email: true
//       },
//       where: {
//         estado: 'ACTIVO'
//       },
//       orderBy: {
//         apellidos: 'asc'
//       }
//     })

//     console.log('Pacientes encontrados:', pacientes.length)
//     return NextResponse.json({ pacientes })
//   } catch (error) {
//     console.error('Error al obtener pacientes:', error)
//     return NextResponse.json(
//       { error: 'Error interno del servidor al obtener pacientes' },
//       { status: 500 }
//     )
//   } finally {
//     await prisma.$disconnect()
//   }
// }


// NUEVO CON SINGLETON---  import { prisma } from '@/lib/prisma'

import { NextRequest, NextResponse } from 'next/server'
 import { prisma } from '@/lib/prisma'
// import { PrismaClient } from '@prisma/client'
import { auth } from '@clerk/nextjs/server'


export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
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
      acompanante,
      numeroFicha
    } = body

    // Validar campos requeridos
    if (!nombres || !apellidos || !dni) {
      return NextResponse.json(
        { error: 'Nombres, apellidos y DNI son requeridos' },
        { status: 400 }
      )
    }

    // Verificar si ya existe un paciente con ese DNI
    const pacienteExistente = await prisma.paciente.findUnique({
      where: { dni }
    })

    if (pacienteExistente) {
      return NextResponse.json(
        { error: 'Ya existe un paciente con ese DNI' },
        { status: 400 }
      )
    }

    // Crear paciente y ficha odontológica en una transacción
    const resultado = await prisma.$transaction(async (prisma) => {
      // Crear el paciente
      const nuevoPaciente = await prisma.paciente.create({
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
          acompanante,
          estado: 'ACTIVO',
          createdAt: new Date(),
          updatedAt: new Date()
        }
      })

      // Crear la ficha odontológica automáticamente
      const nuevaFicha = await prisma.fichaOdontologica.create({
        data: {
          numeroFicha: numeroFicha || `F${Date.now()}`,
          idPaciente: nuevoPaciente.id,
          fechaRegistro: new Date(),
          estado: 'ACTIVA'
        }
      })

      return { paciente: nuevoPaciente, ficha: nuevaFicha }
    })

    return NextResponse.json({ 
      paciente: resultado.paciente,
      ficha: resultado.ficha 
    }, { status: 201 })
  } catch (error) {
    console.error('Error al crear paciente:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  } 
}

export async function GET(request: NextRequest) {
  try {
    const authData = await auth()
    const userId = authData?.userId
    console.log('GET /api/pacientes - userId:', userId)

    if (!userId) {
      console.error('Autenticación fallida: userId no encontrado')
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const pacientes = await prisma.paciente.findMany({
      select: {
        id: true,
        nombres: true,
        apellidos: true,
        dni: true,
        telefono: true,
        email: true
      },
      where: {
        estado: 'ACTIVO'
      },
      orderBy: {
        apellidos: 'asc'
      }
    })

    console.log('Pacientes encontrados:', pacientes.length)
    return NextResponse.json({ pacientes })
  } catch (error) {
    console.error('Error al obtener pacientes:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor al obtener pacientes' },
      { status: 500 }
    )
  } 
}

