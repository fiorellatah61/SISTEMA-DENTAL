// /app/api/servicios/pagos/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

// Inicializar Prisma Client
const prisma = new PrismaClient()

// GET: Obtener el historial de pagos (servicios que han sido pagados)
export async function GET() {
  try {
    // Buscar todos los servicios que han sido pagados y tienen fecha de pago
    const serviciosPagados = await prisma.servicio.findMany({
      where: {
        estado: 'pagado',
        fechaPago: {
          not: null
        }
      },
      orderBy: {
        fechaPago: 'desc'
      }
    })

    // Transformar los datos para que coincidan con el formato esperado por el frontend
    const pagos = serviciosPagados.map(servicio => ({
      id: servicio.id,
      servicio_nombre: servicio.nombre,
      monto: servicio.costo.toNumber(), // Convertir Decimal a number
      fecha_pago: servicio.fechaPago!.toISOString().split('T')[0], // Formato YYYY-MM-DD
      metodo_pago: servicio.metodoPago || 'no_especificado',
      comprobante: servicio.referencia || null
    }))

    return NextResponse.json(pagos)
  } catch (error) {
    console.error('Error al obtener pagos:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor al obtener pagos' },
      { status: 500 }
    )
  }
}

// POST: Registrar un nuevo pago
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { servicio_id, monto, fecha_pago, metodo_pago, comprobante } = body

    // Validaciones básicas
    if (!servicio_id || !monto || !fecha_pago || !metodo_pago) {
      return NextResponse.json(
        { error: 'Los campos servicio_id, monto, fecha_pago y metodo_pago son obligatorios' },
        { status: 400 }
      )
    }

    // Verificar si el servicio existe
    const servicioExistente = await prisma.servicio.findUnique({
      where: { id: servicio_id }
    })

    if (!servicioExistente) {
      return NextResponse.json(
        { error: 'Servicio no encontrado' },
        { status: 404 }
      )
    }

    // Actualizar el servicio para marcarlo como pagado
    const servicioActualizado = await prisma.servicio.update({
      where: { id: servicio_id },
      data: {
        estado: 'pagado',
        fechaPago: new Date(fecha_pago),
        metodoPago: metodo_pago,
        referencia: comprobante || null,
        // Actualizar el costo si es diferente al registrado
        costo: parseFloat(monto)
      }
    })

    // Preparar respuesta en formato esperado
    const pagoRegistrado = {
      id: servicioActualizado.id,
      servicio_nombre: servicioActualizado.nombre,
      monto: servicioActualizado.costo.toNumber(),
      fecha_pago: servicioActualizado.fechaPago!.toISOString().split('T')[0],
      metodo_pago: servicioActualizado.metodoPago,
      comprobante: servicioActualizado.referencia
    }

    return NextResponse.json(pagoRegistrado, { status: 201 })
  } catch (error) {
    console.error('Error al registrar pago:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor al registrar pago' },
      { status: 500 }
    )
  }
}