// app/api/procedimientos/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '../../../generated/prisma'

const prisma = new PrismaClient()

// GET - Obtener todos los procedimientos y condiciones
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const tipo = searchParams.get('tipo') // 'procedimiento' o 'condicion' o null (todos)

    let whereCondition = {}
    
    // Filtrar por tipo si se especifica
    if (tipo === 'procedimiento') {
      whereCondition = { esCondicion: false }
    } else if (tipo === 'condicion') {
      whereCondition = { esCondicion: true }
    }

    // Obtener procedimientos/condiciones de la base de datos
    const procedimientos = await prisma.procedimientoDental.findMany({
      where: whereCondition,
      orderBy: {
        nombre: 'asc'
      }
    })

    return NextResponse.json({ 
      procedimientos,
      total: procedimientos.length 
    })

  } catch (error) {
    console.error('Error al obtener procedimientos:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}

// POST - Crear nuevo procedimiento o condición
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { codigo, nombre, descripcion, color, simbolo, esCondicion } = body

    // Validaciones básicas
    if (!codigo || !nombre) {
      return NextResponse.json(
        { error: 'Código y nombre son requeridos' },
        { status: 400 }
      )
    }

    // Verificar si el código ya existe
    const procedimientoExistente = await prisma.procedimientoDental.findFirst({
      where: { codigo }
    })

    if (procedimientoExistente) {
      return NextResponse.json(
        { error: 'Ya existe un procedimiento con este código' },
        { status: 400 }
      )
    }

    // Crear nuevo procedimiento/condición
    const nuevoProcedimiento = await prisma.procedimientoDental.create({
      data: {
        codigo,
        nombre,
        descripcion: descripcion || null,
        color: color || 'blue',
        simbolo: simbolo || null,
        esCondicion: esCondicion || false
      }
    })

    return NextResponse.json({ 
      message: `${esCondicion ? 'Condición' : 'Procedimiento'} creado correctamente`,
      procedimiento: nuevoProcedimiento
    })

  } catch (error) {
    console.error('Error al crear procedimiento:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}

// PUT - Actualizar procedimiento existente
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, codigo, nombre, descripcion, color, simbolo, esCondicion } = body

    if (!id) {
      return NextResponse.json(
        { error: 'ID del procedimiento es requerido' },
        { status: 400 }
      )
    }

    // Verificar si existe
    const procedimientoExistente = await prisma.procedimientoDental.findUnique({
      where: { id }
    })

    if (!procedimientoExistente) {
      return NextResponse.json(
        { error: 'Procedimiento no encontrado' },
        { status: 404 }
      )
    }

    // Actualizar procedimiento
    const procedimientoActualizado = await prisma.procedimientoDental.update({
      where: { id },
      data: {
        codigo: codigo || procedimientoExistente.codigo,
        nombre: nombre || procedimientoExistente.nombre,
        descripcion: descripcion !== undefined ? descripcion : procedimientoExistente.descripcion,
        color: color || procedimientoExistente.color,
        simbolo: simbolo !== undefined ? simbolo : procedimientoExistente.simbolo,
        esCondicion: esCondicion !== undefined ? esCondicion : procedimientoExistente.esCondicion
      }
    })

    return NextResponse.json({ 
      message: 'Procedimiento actualizado correctamente',
      procedimiento: procedimientoActualizado
    })

  } catch (error) {
    console.error('Error al actualizar procedimiento:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}

// DELETE - Eliminar procedimiento
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: 'ID del procedimiento es requerido' },
        { status: 400 }
      )
    }

    // Verificar si existe
    const procedimientoExistente = await prisma.procedimientoDental.findUnique({
      where: { id }
    })

    if (!procedimientoExistente) {
      return NextResponse.json(
        { error: 'Procedimiento no encontrado' },
        { status: 404 }
      )
    }

    // Eliminar procedimiento
    await prisma.procedimientoDental.delete({
      where: { id }
    })

    return NextResponse.json({ 
      message: 'Procedimiento eliminado correctamente'
    })

  } catch (error) {
    console.error('Error al eliminar procedimiento:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}