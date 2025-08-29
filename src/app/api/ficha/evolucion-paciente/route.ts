// // app/api/ficha/evolucion-paciente/route.ts
// import { NextRequest, NextResponse } from 'next/server'
// import { PrismaClient } from "@prisma/client"

// const prisma = new PrismaClient()

// // GET - Obtener evolución del paciente
// export async function GET(request: NextRequest) {
//   try {
//     const { searchParams } = new URL(request.url)
//     const pacienteId = searchParams.get('pacienteId')

//     if (!pacienteId) {
//       return NextResponse.json(
//         { error: 'ID del paciente es requerido' },
//         { status: 400 }
//       )
//     }

//     // Buscar la ficha odontológica del paciente
//     const ficha = await prisma.fichaOdontologica.findFirst({
//       where: {
//         idPaciente: pacienteId,
//         estado: 'ACTIVA'
//       }
//     })

//     if (!ficha) {
//       return NextResponse.json(
//         { error: 'No se encontró ficha para este paciente' },
//         { status: 404 }
//       )
//     }

//     // Obtener evoluciones del paciente
//     const evoluciones = await prisma.evolucionPaciente.findMany({
//       where: {
//         idFicha: ficha.id
//       },
//       include: {
//         planTratamiento: true // Incluir datos del plan de tratamiento
//       },
//       orderBy: {
//         fecha: 'desc'
//       }
//     })

//     return NextResponse.json({ evoluciones })
//   } catch (error) {
//     console.error('Error al obtener evolución del paciente:', error)
//     return NextResponse.json(
//       { error: 'Error interno del servidor' },
//       { status: 500 }
//     )
//   } finally {
//     await prisma.$disconnect()
//   }
// }

// // POST - Crear nueva evolución
// export async function POST(request: NextRequest) {
//   try {
//     const body = await request.json()
//     const { 
//       pacienteId, 
//       fecha, 
//       tratamientoRealizado, 
//       aCuenta, 
//       saldo,
//       observaciones,
//       idPlanesTratamiento 
//     } = body

//     if (!pacienteId || !fecha || !tratamientoRealizado) {
//       return NextResponse.json(
//         { error: 'ID del paciente, fecha y tratamiento realizado son requeridos' },
//         { status: 400 }
//       )
//     }

//     // Buscar la ficha odontológica del paciente
//     const ficha = await prisma.fichaOdontologica.findFirst({
//       where: {
//         idPaciente: pacienteId,
//         estado: 'ACTIVA'
//       }
//     })

//     if (!ficha) {
//       return NextResponse.json(
//         { error: 'No se encontró ficha para este paciente' },
//         { status: 404 }
//       )
//     }

//     // Crear la evolución
//     const nuevaEvolucion = await prisma.evolucionPaciente.create({
//       data: {
//         idFicha: ficha.id,
//         fecha: new Date(fecha),
//         tratamientoRealizado,
//         aCuenta: aCuenta ? parseFloat(aCuenta) : 0.00,
//         saldo: saldo ? parseFloat(saldo) : 0.00,
//         observaciones: observaciones || null,
//         idPlanesTratamiento: idPlanesTratamiento || null
//       },
//       include: {
//         planTratamiento: true
//       }
//     })

//     return NextResponse.json({ 
//       message: 'Evolución creada correctamente',
//       evolucion: nuevaEvolucion
//     })
//   } catch (error) {
//     console.error('Error al crear evolución:', error)
//     return NextResponse.json(
//       { error: 'Error interno del servidor' },
//       { status: 500 }
//     )
//   } finally {
//     await prisma.$disconnect()
//   }
// }

// // PUT - Actualizar evolución
// export async function PUT(request: NextRequest) {
//   try {
//     const { searchParams } = new URL(request.url)
//     const id = searchParams.get('id')
//     const body = await request.json()
//     const { 
//       fecha, 
//       tratamientoRealizado, 
//       aCuenta, 
//       saldo,
//       observaciones,
//       idPlanesTratamiento 
//     } = body

//     if (!id) {
//       return NextResponse.json(
//         { error: 'ID de la evolución es requerido' },
//         { status: 400 }
//       )
//     }

//     // Verificar que la evolución existe
//     const evolucionExistente = await prisma.evolucionPaciente.findUnique({
//       where: { id }
//     })

//     if (!evolucionExistente) {
//       return NextResponse.json(
//         { error: 'Evolución no encontrada' },
//         { status: 404 }
//       )
//     }

//     // Actualizar la evolución
//     const evolucionActualizada = await prisma.evolucionPaciente.update({
//       where: { id },
//       data: {
//         fecha: fecha ? new Date(fecha) : evolucionExistente.fecha,
//         tratamientoRealizado: tratamientoRealizado || evolucionExistente.tratamientoRealizado,
//         aCuenta: aCuenta ? parseFloat(aCuenta) : evolucionExistente.aCuenta,
//         saldo: saldo ? parseFloat(saldo) : evolucionExistente.saldo,
//         observaciones: observaciones,
//         idPlanesTratamiento: idPlanesTratamiento || null
//       },
//       include: {
//         planTratamiento: true
//       }
//     })

//     return NextResponse.json({ 
//       message: 'Evolución actualizada correctamente',
//       evolucion: evolucionActualizada
//     })
//   } catch (error) {
//     console.error('Error al actualizar evolución:', error)
//     return NextResponse.json(
//       { error: 'Error interno del servidor' },
//       { status: 500 }
//     )
//   } finally {
//     await prisma.$disconnect()
//   }
// }

// // DELETE - Eliminar evolución
// export async function DELETE(request: NextRequest) {
//   try {
//     const { searchParams } = new URL(request.url)
//     const id = searchParams.get('id')

//     if (!id) {
//       return NextResponse.json(
//         { error: 'ID de la evolución es requerido' },
//         { status: 400 }
//       )
//     }

//     // Verificar que la evolución existe
//     const evolucionExistente = await prisma.evolucionPaciente.findUnique({
//       where: { id }
//     })

//     if (!evolucionExistente) {
//       return NextResponse.json(
//         { error: 'Evolución no encontrada' },
//         { status: 404 }
//       )
//     }

//     // Eliminar la evolución
//     await prisma.evolucionPaciente.delete({
//       where: { id }
//     })

//     return NextResponse.json({ 
//       message: 'Evolución eliminada correctamente'
//     })
//   } catch (error) {
//     console.error('Error al eliminar evolución:', error)
//     return NextResponse.json(
//       { error: 'Error interno del servidor' },
//       { status: 500 }
//     )
//   } finally {
//     await prisma.$disconnect()
//   }
// }


// NUEVO CON SINGLETON ----import { prisma } from '@/lib/prisma'

// app/api/ficha/evolucion-paciente/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
// GET - Obtener evolución del paciente
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const pacienteId = searchParams.get('pacienteId')

    if (!pacienteId) {
      return NextResponse.json(
        { error: 'ID del paciente es requerido' },
        { status: 400 }
      )
    }

    // Buscar la ficha odontológica del paciente
    const ficha = await prisma.fichaOdontologica.findFirst({
      where: {
        idPaciente: pacienteId,
        estado: 'ACTIVA'
      }
    })

    if (!ficha) {
      return NextResponse.json(
        { error: 'No se encontró ficha para este paciente' },
        { status: 404 }
      )
    }

    // Obtener evoluciones del paciente
    const evoluciones = await prisma.evolucionPaciente.findMany({
      where: {
        idFicha: ficha.id
      },
      include: {
        planTratamiento: true // Incluir datos del plan de tratamiento
      },
      orderBy: {
        fecha: 'desc'
      }
    })

    return NextResponse.json({ evoluciones })
  } catch (error) {
    console.error('Error al obtener evolución del paciente:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  } 
}

// POST - Crear nueva evolución
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { 
      pacienteId, 
      fecha, 
      tratamientoRealizado, 
      aCuenta, 
      saldo,
      observaciones,
      idPlanesTratamiento 
    } = body

    if (!pacienteId || !fecha || !tratamientoRealizado) {
      return NextResponse.json(
        { error: 'ID del paciente, fecha y tratamiento realizado son requeridos' },
        { status: 400 }
      )
    }

    // Buscar la ficha odontológica del paciente
    const ficha = await prisma.fichaOdontologica.findFirst({
      where: {
        idPaciente: pacienteId,
        estado: 'ACTIVA'
      }
    })

    if (!ficha) {
      return NextResponse.json(
        { error: 'No se encontró ficha para este paciente' },
        { status: 404 }
      )
    }

    // Crear la evolución
    const nuevaEvolucion = await prisma.evolucionPaciente.create({
      data: {
        idFicha: ficha.id,
        fecha: new Date(fecha),
        tratamientoRealizado,
        aCuenta: aCuenta ? parseFloat(aCuenta) : 0.00,
        saldo: saldo ? parseFloat(saldo) : 0.00,
        observaciones: observaciones || null,
        idPlanesTratamiento: idPlanesTratamiento || null
      },
      include: {
        planTratamiento: true
      }
    })

    return NextResponse.json({ 
      message: 'Evolución creada correctamente',
      evolucion: nuevaEvolucion
    })
  } catch (error) {
    console.error('Error al crear evolución:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  } 
}

// PUT - Actualizar evolución
export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    const body = await request.json()
    const { 
      fecha, 
      tratamientoRealizado, 
      aCuenta, 
      saldo,
      observaciones,
      idPlanesTratamiento 
    } = body

    if (!id) {
      return NextResponse.json(
        { error: 'ID de la evolución es requerido' },
        { status: 400 }
      )
    }

    // Verificar que la evolución existe
    const evolucionExistente = await prisma.evolucionPaciente.findUnique({
      where: { id }
    })

    if (!evolucionExistente) {
      return NextResponse.json(
        { error: 'Evolución no encontrada' },
        { status: 404 }
      )
    }

    // Actualizar la evolución
    const evolucionActualizada = await prisma.evolucionPaciente.update({
      where: { id },
      data: {
        fecha: fecha ? new Date(fecha) : evolucionExistente.fecha,
        tratamientoRealizado: tratamientoRealizado || evolucionExistente.tratamientoRealizado,
        aCuenta: aCuenta ? parseFloat(aCuenta) : evolucionExistente.aCuenta,
        saldo: saldo ? parseFloat(saldo) : evolucionExistente.saldo,
        observaciones: observaciones,
        idPlanesTratamiento: idPlanesTratamiento || null
      },
      include: {
        planTratamiento: true
      }
    })

    return NextResponse.json({ 
      message: 'Evolución actualizada correctamente',
      evolucion: evolucionActualizada
    })
  } catch (error) {
    console.error('Error al actualizar evolución:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  } 
}

// DELETE - Eliminar evolución
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: 'ID de la evolución es requerido' },
        { status: 400 }
      )
    }

    // Verificar que la evolución existe
    const evolucionExistente = await prisma.evolucionPaciente.findUnique({
      where: { id }
    })

    if (!evolucionExistente) {
      return NextResponse.json(
        { error: 'Evolución no encontrada' },
        { status: 404 }
      )
    }

    // Eliminar la evolución
    await prisma.evolucionPaciente.delete({
      where: { id }
    })

    return NextResponse.json({ 
      message: 'Evolución eliminada correctamente'
    })
  } catch (error) {
    console.error('Error al eliminar evolución:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  } 
}
