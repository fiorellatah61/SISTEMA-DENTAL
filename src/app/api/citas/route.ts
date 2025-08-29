// // app/api/citas/Route.ts
// import { NextRequest, NextResponse } from 'next/server'
// // import { PrismaClient } from '@prisma/client'
// import { PrismaClient } from "@prisma/client"
// import { auth } from '@clerk/nextjs/server'

// const prisma = new PrismaClient()

// export async function POST(request: NextRequest) {
//   try {
//     const authData = await auth()
//     const userId = authData?.userId
//     console.log('POST /api/citas - userId:', userId)

//     if (!userId) {
//       console.error('Autenticación fallida: userId no encontrado')
//       return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
//     }

//     // Buscar el usuario en la base de datos
//     const usuario = await prisma.user.findUnique({
//       where: { clerkUserId: userId }
//     })

//     if (!usuario) {
//       console.error('Usuario no encontrado en la base de datos')
//       return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 })
//     }

//     const body = await request.json()
//     console.log('Datos recibidos:', body)

//     const {
//       idPaciente,
//       nuevoPaciente,
//       fechaHora,
//       motivo,
//       observaciones,
//         // AGREGADO: Nuevos campos
//       telefonoContacto,
//       emailContacto
//     } = body

//     if (!idPaciente && !nuevoPaciente) {
//       return NextResponse.json(
//         { error: 'Se requiere idPaciente o datos de nuevo paciente' },
//         { status: 400 }
//       )
//     }

//     if (nuevoPaciente && (!nuevoPaciente.nombres || !nuevoPaciente.apellidos || !nuevoPaciente.dni)) {
//       return NextResponse.json(
//         { error: 'Nombres, apellidos y DNI son requeridos para un nuevo paciente' },
//         { status: 400 }
//       )
//     }

//     if (!fechaHora) {
//       return NextResponse.json(
//         { error: 'Fecha y hora son requeridos' },
//         { status: 400 }
//       )
//     }

//     const resultado = await prisma.$transaction(async (prisma) => {
//       let pacienteId = idPaciente

//       // Crear paciente nuevo si se proporcionó
//       if (nuevoPaciente) {
//         const pacienteExistente = await prisma.paciente.findUnique({
//           where: { dni: nuevoPaciente.dni }
//         })

//         if (pacienteExistente) {
//           throw new Error('Ya existe un paciente con ese DNI')
//         }

//         const nuevoPacienteCreado = await prisma.paciente.create({
//           data: {
//             nombres: nuevoPaciente.nombres,
//             apellidos: nuevoPaciente.apellidos,
//             dni: nuevoPaciente.dni,
//             estado: 'ACTIVO',
//             createdAt: new Date(),
//             updatedAt: new Date()
//           }
//         })
//         pacienteId = nuevoPacienteCreado.id
//       }

//       const paciente = await prisma.paciente.findUnique({
//         where: { id: pacienteId }
//       })

//       if (!paciente) {
//         throw new Error('Paciente no encontrado')
//       }

//       // Crear la cita
//       const nuevaCita = await prisma.cita.create({
//         data: {
//           idPaciente: pacienteId,
//           idUsuario: usuario.id,
//           fechaHora: new Date(fechaHora),
//           estado: 'SOLICITADA',
//           motivo: motivo || null,
//           observaciones: observaciones || null,
//           createdAt: new Date(),
//           updatedAt: new Date(),
//           //CAMPOS AGREGADOS
//            telefonoContacto: telefonoContacto || null,
//           emailContacto: emailContacto || null,
//         }
//       })

//       return { cita: nuevaCita, paciente }
//     })

//     return NextResponse.json({
//       cita: resultado.cita,
//       paciente: resultado.paciente
//     }, { status: 201 })
//   } catch (error: any) {
//     console.error('Error al crear cita:', error)
//     return NextResponse.json(
//       { error: error.message || 'Error interno del servidor' },
//       { status: error.message.includes('Paciente no encontrado') || error.message.includes('Ya existe un paciente') ? 400 : 500 }
//     )
//   } finally {
//     await prisma.$disconnect()
//   }
// }

// export async function GET(request: NextRequest) {
//   try {
//     const authData = await auth()
//     const userId = authData?.userId
//     console.log('GET /api/citas - userId:', userId)

//     if (!userId) {
//       console.error('Autenticación fallida: userId no encontrado')
//       return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
//     }

//     const citas = await prisma.cita.findMany({
//       include: {
//         paciente: {
//           select: {
//             id: true,
//             nombres: true,
//             apellidos: true,
//             dni: true,
//             telefono: true,
//             email: true
//           }
//         }
//       },
//       orderBy: {
//         fechaHora: 'asc'
//       }
//     })

//     return NextResponse.json({ citas })
//   } catch (error) {
//     console.error('Error al obtener citas:', error)
//     return NextResponse.json(
//       { error: 'Error interno del servidor al obtener citas' },
//       { status: 500 }
//     )
//   } finally {
//     await prisma.$disconnect()
//   }
// }


//    NUEVO ------------CON SINGLETON 

// app/api/citas/Route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@clerk/nextjs/server'


export async function POST(request: NextRequest) {
  try {
    const authData = await auth()
    const userId = authData?.userId
    console.log('POST /api/citas - userId:', userId)

    if (!userId) {
      console.error('Autenticación fallida: userId no encontrado')
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    // Buscar el usuario en la base de datos
    const usuario = await prisma.user.findUnique({
      where: { clerkUserId: userId }
    })

    if (!usuario) {
      console.error('Usuario no encontrado en la base de datos')
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 })
    }

    const body = await request.json()
    console.log('Datos recibidos:', body)

    const {
      idPaciente,
      nuevoPaciente,
      fechaHora,
      motivo,
      observaciones,
        // AGREGADO: Nuevos campos
      telefonoContacto,
      emailContacto
    } = body

    if (!idPaciente && !nuevoPaciente) {
      return NextResponse.json(
        { error: 'Se requiere idPaciente o datos de nuevo paciente' },
        { status: 400 }
      )
    }

    if (nuevoPaciente && (!nuevoPaciente.nombres || !nuevoPaciente.apellidos || !nuevoPaciente.dni)) {
      return NextResponse.json(
        { error: 'Nombres, apellidos y DNI son requeridos para un nuevo paciente' },
        { status: 400 }
      )
    }

    if (!fechaHora) {
      return NextResponse.json(
        { error: 'Fecha y hora son requeridos' },
        { status: 400 }
      )
    }

    const resultado = await prisma.$transaction(async (prisma) => {
      let pacienteId = idPaciente

      // Crear paciente nuevo si se proporcionó
      if (nuevoPaciente) {
        const pacienteExistente = await prisma.paciente.findUnique({
          where: { dni: nuevoPaciente.dni }
        })

        if (pacienteExistente) {
          throw new Error('Ya existe un paciente con ese DNI')
        }

        const nuevoPacienteCreado = await prisma.paciente.create({
          data: {
            nombres: nuevoPaciente.nombres,
            apellidos: nuevoPaciente.apellidos,
            dni: nuevoPaciente.dni,
            estado: 'ACTIVO',
            createdAt: new Date(),
            updatedAt: new Date()
          }
        })
        pacienteId = nuevoPacienteCreado.id
      }

      const paciente = await prisma.paciente.findUnique({
        where: { id: pacienteId }
      })

      if (!paciente) {
        throw new Error('Paciente no encontrado')
      }

      // Crear la cita
      const nuevaCita = await prisma.cita.create({
        data: {
          idPaciente: pacienteId,
          idUsuario: usuario.id,
          fechaHora: new Date(fechaHora),
          estado: 'SOLICITADA',
          motivo: motivo || null,
          observaciones: observaciones || null,
          createdAt: new Date(),
          updatedAt: new Date(),
          //CAMPOS AGREGADOS
           telefonoContacto: telefonoContacto || null,
          emailContacto: emailContacto || null,
        }
      })

      return { cita: nuevaCita, paciente }
    })

    return NextResponse.json({
      cita: resultado.cita,
      paciente: resultado.paciente
    }, { status: 201 })
  } catch (error: any) {
    console.error('Error al crear cita:', error)
    return NextResponse.json(
      { error: error.message || 'Error interno del servidor' },
      { status: error.message.includes('Paciente no encontrado') || error.message.includes('Ya existe un paciente') ? 400 : 500 }
    )
  } 
}

export async function GET(request: NextRequest) {
  try {
    const authData = await auth()
    const userId = authData?.userId
    console.log('GET /api/citas - userId:', userId)

    if (!userId) {
      console.error('Autenticación fallida: userId no encontrado')
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const citas = await prisma.cita.findMany({
      include: {
        paciente: {
          select: {
            id: true,
            nombres: true,
            apellidos: true,
            dni: true,
            telefono: true,
            email: true
          }
        }
      },
      orderBy: {
        fechaHora: 'asc'
      }
    })

    return NextResponse.json({ citas })
  } catch (error) {
    console.error('Error al obtener citas:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor al obtener citas' },
      { status: 500 }
    )
  } 
}