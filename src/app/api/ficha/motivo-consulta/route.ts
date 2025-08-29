// // app/api/ficha/motivo-consulta/route.ts
// import { NextRequest, NextResponse } from 'next/server'
// import { PrismaClient } from "@prisma/client"

// const prisma = new PrismaClient()

// // GET - Obtener motivo de consulta de un paciente
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
//       },
//       select: {
//         id: true,
//         motivoConsulta: true
//       }
//     })

//     if (!ficha) {
//       return NextResponse.json(
//         { error: 'No se encontró ficha para este paciente' },
//         { status: 404 }
//       )
//     }

//     return NextResponse.json({ 
//       motivoConsulta: ficha.motivoConsulta || '' 
//     })
//   } catch (error) {
//     console.error('Error al obtener motivo de consulta:', error)
//     return NextResponse.json(
//       { error: 'Error interno del servidor' },
//       { status: 500 }
//     )
//   } finally {
//     await prisma.$disconnect()
//   }
// }

// // POST - Guardar/actualizar motivo de consulta
// export async function POST(request: NextRequest) {
//   try {
//     const body = await request.json()
//     const { pacienteId, motivoConsulta } = body

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
//     // Actualizar el motivo de consulta en la ficha
//     const fichaActualizada = await prisma.fichaOdontologica.update({
//       where: { id: ficha.id },
//       data: {
//         motivoConsulta: motivoConsulta || null
//       }
//     })

//     return NextResponse.json({ 
//       message: 'Motivo de consulta guardado correctamente',
//       ficha: fichaActualizada
//     })
//   } catch (error) {
//     console.error('Error al guardar motivo de consulta:', error)
//     return NextResponse.json(
//       { error: 'Error interno del servidor' },
//       { status: 500 }
//     )
//   } finally {
//     await prisma.$disconnect()
//   }
// }

// // DELETE - Eliminar motivo de consulta
// export async function DELETE(request: NextRequest) {
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

//     // Limpiar el motivo de consulta
//     await prisma.fichaOdontologica.update({
//       where: { id: ficha.id },
//       data: {
//         motivoConsulta: null
//       }
//     })

//     return NextResponse.json({ 
//       message: 'Motivo de consulta eliminado correctamente'
//     })
//   } catch (error) {
//     console.error('Error al eliminar motivo de consulta:', error)
//     return NextResponse.json(
//       { error: 'Error interno del servidor' },
//       { status: 500 }
//     )
//   } finally {
//     await prisma.$disconnect()
//   }
// }


//-------------NUEVO ---- COJ SINGLETON  -------
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// app/api/ficha/motivo-consulta/route.ts
// GET - Obtener motivo de consulta de un paciente
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
      },
      select: {
        id: true,
        motivoConsulta: true
      }
    })

    if (!ficha) {
      return NextResponse.json(
        { error: 'No se encontró ficha para este paciente' },
        { status: 404 }
      )
    }

    return NextResponse.json({ 
      motivoConsulta: ficha.motivoConsulta || '' 
    })
  } catch (error) {
    console.error('Error al obtener motivo de consulta:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  } 
}

// POST - Guardar/actualizar motivo de consulta
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { pacienteId, motivoConsulta } = body

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
    // Actualizar el motivo de consulta en la ficha
    const fichaActualizada = await prisma.fichaOdontologica.update({
      where: { id: ficha.id },
      data: {
        motivoConsulta: motivoConsulta || null
      }
    })

    return NextResponse.json({ 
      message: 'Motivo de consulta guardado correctamente',
      ficha: fichaActualizada
    })
  } catch (error) {
    console.error('Error al guardar motivo de consulta:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  } 
}

// DELETE - Eliminar motivo de consulta
export async function DELETE(request: NextRequest) {
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

    // Limpiar el motivo de consulta
    await prisma.fichaOdontologica.update({
      where: { id: ficha.id },
      data: {
        motivoConsulta: null
      }
    })

    return NextResponse.json({ 
      message: 'Motivo de consulta eliminado correctamente'
    })
  } catch (error) {
    console.error('Error al eliminar motivo de consulta:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  } 
}
