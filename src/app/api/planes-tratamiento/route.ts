// // app/api/planes-tratamiento/route.ts
// import { NextRequest, NextResponse } from 'next/server'
// import { PrismaClient } from "@prisma/client"

// const prisma = new PrismaClient()

// // GET - Obtener todos los planes de tratamiento
// export async function GET() {
//   try {
//     const planes = await prisma.planTratamiento.findMany({
//       orderBy: {
//         createdAt: 'desc'
//       }
//     })

//     return NextResponse.json({ planes })
//   } catch (error) {
//     console.error('Error al obtener planes de tratamiento:', error)
//     return NextResponse.json(
//       { error: 'Error interno del servidor' },
//       { status: 500 }
//     )
//   } finally {
//     await prisma.$disconnect()
//   }
// }

// // POST - Crear nuevo plan de tratamiento
// export async function POST(request: NextRequest) {
//   try {
//     const body = await request.json()
//     const { descripcion, costoTotal } = body

//     // Validaciones
//     if (!descripcion || !costoTotal) {
//       return NextResponse.json(
//         { error: 'Descripción y costo total son requeridos' },
//         { status: 400 }
//       )
//     }

//     if (costoTotal <= 0) {
//       return NextResponse.json(
//         { error: 'El costo total debe ser mayor a 0' },
//         { status: 400 }
//       )
//     }

//     // Crear el plan de tratamiento
//     const nuevoPlan = await prisma.planTratamiento.create({
//       data: {
//         descripcion,
//         costoTotal: parseFloat(costoTotal)
//       }
//     })

//     return NextResponse.json({ 
//       message: 'Plan de tratamiento creado correctamente',
//       plan: nuevoPlan
//     })
//   } catch (error) {
//     console.error('Error al crear plan de tratamiento:', error)
//     return NextResponse.json(
//       { error: 'Error interno del servidor' },
//       { status: 500 }
//     )
//   } finally {
//     await prisma.$disconnect()
//   }
// }

// // PUT - Actualizar plan de tratamiento
// export async function PUT(request: NextRequest) {
//   try {
//     const { searchParams } = new URL(request.url)
//     const id = searchParams.get('id')
//     const body = await request.json()
//     const { descripcion, costoTotal } = body

//     if (!id) {
//       return NextResponse.json(
//         { error: 'ID del plan es requerido' },
//         { status: 400 }
//       )
//     }

//     // Validaciones
//     if (!descripcion || !costoTotal) {
//       return NextResponse.json(
//         { error: 'Descripción y costo total son requeridos' },
//         { status: 400 }
//       )
//     }

//     if (costoTotal <= 0) {
//       return NextResponse.json(
//         { error: 'El costo total debe ser mayor a 0' },
//         { status: 400 }
//       )
//     }

//     // Verificar que el plan existe
//     const planExistente = await prisma.planTratamiento.findUnique({
//       where: { id }
//     })

//     if (!planExistente) {
//       return NextResponse.json(
//         { error: 'Plan de tratamiento no encontrado' },
//         { status: 404 }
//       )
//     }

//     // Actualizar el plan
//     const planActualizado = await prisma.planTratamiento.update({
//       where: { id },
//       data: {
//         descripcion,
//         costoTotal: parseFloat(costoTotal)
//       }
//     })

//     return NextResponse.json({ 
//       message: 'Plan de tratamiento actualizado correctamente',
//       plan: planActualizado
//     })
//   } catch (error) {
//     console.error('Error al actualizar plan de tratamiento:', error)
//     return NextResponse.json(
//       { error: 'Error interno del servidor' },
//       { status: 500 }
//     )
//   } finally {
//     await prisma.$disconnect()
//   }
// }

// // DELETE - Eliminar plan de tratamiento
// export async function DELETE(request: NextRequest) {
//   try {
//     const { searchParams } = new URL(request.url)
//     const id = searchParams.get('id')

//     if (!id) {
//       return NextResponse.json(
//         { error: 'ID del plan es requerido' },
//         { status: 400 }
//       )
//     }

//     // Verificar que el plan existe
//     const planExistente = await prisma.planTratamiento.findUnique({
//       where: { id }
//     })

//     if (!planExistente) {
//       return NextResponse.json(
//         { error: 'Plan de tratamiento no encontrado' },
//         { status: 404 }
//       )
//     }

//     // Verificar si el plan está siendo usado en exámenes o evoluciones
//     const examenesConPlan = await prisma.examenOdontologico.findFirst({
//       where: { idPlanesTratamiento: id }
//     })

//     const evolucionesConPlan = await prisma.evolucionPaciente.findFirst({
//       where: { idPlanesTratamiento: id }
//     })

//     if (examenesConPlan || evolucionesConPlan) {
//       return NextResponse.json(
//         { error: 'No se puede eliminar el plan porque está siendo usado en exámenes o evoluciones' },
//         { status: 400 }
//       )
//     }

//     // Eliminar el plan
//     await prisma.planTratamiento.delete({
//       where: { id }
//     })

//     return NextResponse.json({ 
//       message: 'Plan de tratamiento eliminado correctamente'
//     })
//   } catch (error) {
//     console.error('Error al eliminar plan de tratamiento:', error)
//     return NextResponse.json(
//       { error: 'Error interno del servidor' },
//       { status: 500 }
//     )
//   } finally {
//     await prisma.$disconnect()
//   }
// }


//  NUEVO--------CON SINGLETON-----------  import { prisma } from '@/lib/prisma'

// app/api/planes-tratamiento/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET - Obtener todos los planes de tratamiento
export async function GET() {
  try {
    const planes = await prisma.planTratamiento.findMany({
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json({ planes })
  } catch (error) {
    console.error('Error al obtener planes de tratamiento:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  } 
}

// POST - Crear nuevo plan de tratamiento
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { descripcion, costoTotal } = body

    // Validaciones
    if (!descripcion || !costoTotal) {
      return NextResponse.json(
        { error: 'Descripción y costo total son requeridos' },
        { status: 400 }
      )
    }

    if (costoTotal <= 0) {
      return NextResponse.json(
        { error: 'El costo total debe ser mayor a 0' },
        { status: 400 }
      )
    }

    // Crear el plan de tratamiento
    const nuevoPlan = await prisma.planTratamiento.create({
      data: {
        descripcion,
        costoTotal: parseFloat(costoTotal)
      }
    })

    return NextResponse.json({ 
      message: 'Plan de tratamiento creado correctamente',
      plan: nuevoPlan
    })
  } catch (error) {
    console.error('Error al crear plan de tratamiento:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

// PUT - Actualizar plan de tratamiento
export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    const body = await request.json()
    const { descripcion, costoTotal } = body

    if (!id) {
      return NextResponse.json(
        { error: 'ID del plan es requerido' },
        { status: 400 }
      )
    }

    // Validaciones
    if (!descripcion || !costoTotal) {
      return NextResponse.json(
        { error: 'Descripción y costo total son requeridos' },
        { status: 400 }
      )
    }

    if (costoTotal <= 0) {
      return NextResponse.json(
        { error: 'El costo total debe ser mayor a 0' },
        { status: 400 }
      )
    }

    // Verificar que el plan existe
    const planExistente = await prisma.planTratamiento.findUnique({
      where: { id }
    })

    if (!planExistente) {
      return NextResponse.json(
        { error: 'Plan de tratamiento no encontrado' },
        { status: 404 }
      )
    }

    // Actualizar el plan
    const planActualizado = await prisma.planTratamiento.update({
      where: { id },
      data: {
        descripcion,
        costoTotal: parseFloat(costoTotal)
      }
    })

    return NextResponse.json({ 
      message: 'Plan de tratamiento actualizado correctamente',
      plan: planActualizado
    })
  } catch (error) {
    console.error('Error al actualizar plan de tratamiento:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  } 
}

// DELETE - Eliminar plan de tratamiento
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: 'ID del plan es requerido' },
        { status: 400 }
      )
    }

    // Verificar que el plan existe
    const planExistente = await prisma.planTratamiento.findUnique({
      where: { id }
    })

    if (!planExistente) {
      return NextResponse.json(
        { error: 'Plan de tratamiento no encontrado' },
        { status: 404 }
      )
    }

    // Verificar si el plan está siendo usado en exámenes o evoluciones
    const examenesConPlan = await prisma.examenOdontologico.findFirst({
      where: { idPlanesTratamiento: id }
    })

    const evolucionesConPlan = await prisma.evolucionPaciente.findFirst({
      where: { idPlanesTratamiento: id }
    })

    if (examenesConPlan || evolucionesConPlan) {
      return NextResponse.json(
        { error: 'No se puede eliminar el plan porque está siendo usado en exámenes o evoluciones' },
        { status: 400 }
      )
    }

    // Eliminar el plan
    await prisma.planTratamiento.delete({
      where: { id }
    })

    return NextResponse.json({ 
      message: 'Plan de tratamiento eliminado correctamente'
    })
  } catch (error) {
    console.error('Error al eliminar plan de tratamiento:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  } 
}

