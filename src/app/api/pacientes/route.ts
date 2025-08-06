// ANTES 
//  // app/api/pacientes/route.ts
// import { NextRequest, NextResponse } from 'next/server'
// import { PrismaClient } from '../../../generated/prisma'

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
//           estado: 'ACTIVO'
//         }
//       })

//       // Crear la ficha odontológica automáticamente
//       const nuevaFicha = await prisma.fichaOdontologica.create({
//         data: {
//           numeroFicha: numeroFicha || '001',
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



import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '../../../generated/prisma'

const prisma = new PrismaClient()

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
          estado: 'ACTIVO'
        }
      })

      // Crear la ficha odontológica automáticamente
      const nuevaFicha = await prisma.fichaOdontologica.create({
        data: {
          numeroFicha: numeroFicha || '001',
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
  } finally {
    await prisma.$disconnect()
  }
}