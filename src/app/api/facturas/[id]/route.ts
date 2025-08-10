
// app/api/facturas/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { createClient } from '@supabase/supabase-js'
import jsPDF from 'jspdf'

// Inicialización mejorada de Prisma
let prisma: PrismaClient | undefined

function getPrismaClient() {
  if (!prisma) {
    try {
      prisma = new PrismaClient()
      console.log('Prisma Client inicializado correctamente')
    } catch (error) {
      console.error('Error inicializando Prisma:', error)
      throw new Error('No se pudo conectar a la base de datos')
    }
  }
  return prisma
}

// Configuración de Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)

export async function PUT(request: NextRequest, { params }: { params: Awaited<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await request.json()
    const { idPaciente, monto, metodoPago, estado, servicios } = body

    const prismaClient = getPrismaClient()

    const facturaExistente = await prismaClient.factura.findUnique({
      where: { id },
      include: { paciente: true }
    })

    if (!facturaExistente) {
      return NextResponse.json({ error: 'Factura no encontrada' }, { status: 404 })
    }

    const facturaActualizada = await prismaClient.factura.update({
      where: { id },
      data: {
        idPaciente: idPaciente || facturaExistente.idPaciente,
        monto: monto ? parseFloat(monto) : facturaExistente.monto,
        metodoPago: metodoPago !== undefined ? metodoPago : facturaExistente.metodoPago,
        estado: estado || facturaExistente.estado
      },
      include: { paciente: true }
    })

    const huboCambios = 
      (monto && typeof monto === 'string' && !isNaN(parseFloat(monto)) && parseFloat(monto) !== Number(facturaExistente.monto)) ||
      (estado && estado !== facturaExistente.estado) ||
      (idPaciente && idPaciente !== facturaExistente.idPaciente) ||
      (servicios !== undefined)

    if (huboCambios) {
      try {
        const pdfBuffer = await generarPDF(facturaActualizada, servicios || '')

        if (facturaExistente.archivoFacturaPdf) {
          const rutaAnterior = extraerRutaDeUrl(facturaExistente.archivoFacturaPdf)
          if (rutaAnterior) {
            await supabase.storage.from('fichas-odontologicas').remove([rutaAnterior])
          }
        }

        const nombreArchivo = `factura-${id}-${Date.now()}.pdf`
        const rutaArchivo = `facturas/${nombreArchivo}` // Subcarpeta 'facturas/'

        const { error: uploadError } = await supabase.storage
          .from('fichas-odontologicas')
          .upload(rutaArchivo, pdfBuffer, { contentType: 'application/pdf', upsert: false })

        if (!uploadError) {
          const { data: urlData } = supabase.storage.from('fichas-odontologicas').getPublicUrl(rutaArchivo)
          await prismaClient.factura.update({
            where: { id },
            data: { archivoFacturaPdf: urlData.publicUrl }
          })
        }
      } catch (pdfError) {
        console.error('Error regenerando PDF:', pdfError)
      }
    }

    const facturaFinal = await prismaClient.factura.findUnique({
      where: { id },
      include: { paciente: { select: { id: true, nombres: true, apellidos: true, dni: true } } }
    })
    return NextResponse.json(facturaFinal)
  } catch (error) {
    console.error('Error actualizando factura:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Awaited<{ id: string }> }) {
  try {
    const { id } = await params
    const prismaClient = getPrismaClient()

    const factura = await prismaClient.factura.findUnique({ where: { id } })
    if (!factura) {
      return NextResponse.json({ error: 'Factura no encontrada' }, { status: 404 })
    }

    if (factura.archivoFacturaPdf) {
      const rutaArchivo = extraerRutaDeUrl(factura.archivoFacturaPdf)
      if (rutaArchivo) {
        const { error } = await supabase.storage.from('fichas-odontologicas').remove([rutaArchivo])
        if (error) throw new Error('Error eliminando archivo PDF: ' + error.message)
      }
    }

    await prismaClient.factura.delete({ where: { id } })
    return NextResponse.json({ message: 'Factura eliminada correctamente' })
  } catch (error) {
    console.error('Error eliminando factura:', error)
    return NextResponse.json({ error: 'Error interno del servidor: ' + (error as Error).message }, { status: 500 })
  }
}

function extraerRutaDeUrl(url: string): string | null {
  const match = url.match(/\/storage\/v1\/object\/public\/fichas-odontologicas\/(.+)$/)
  return match ? match[1] : null
}

async function generarPDF(factura: any, servicios: string): Promise<Buffer> {
  try {
    const doc = new jsPDF('p', 'mm', 'a4')
    const pageWidth = 210
    const pageHeight = 297
    let yPosition = 20

    const primaryColor = { r: 52, g: 168, b: 83 }
    const lightGray = { r: 245, g: 245, b: 245 }
    const darkGray = { r: 64, g: 64, b: 64 }
    const borderColor = { r: 200, g: 200, b: 200 }

    let logoData: string | null = null
    try {
      const fs = require('fs')
      const path = require('path')
      const logoFilePath = path.join(process.cwd(), 'public', 'Logo.png')
      if (fs.existsSync(logoFilePath)) {
        const logoBuffer = fs.readFileSync(logoFilePath)
        logoData = `data:image/png;base64,${logoBuffer.toString('base64')}`
      }
    } catch {}

    doc.setFillColor(primaryColor.r, primaryColor.g, primaryColor.b)
    doc.rect(0, 0, pageWidth, 60, 'F')
    if (logoData) doc.addImage(logoData, 'PNG', 20, 10, 40, 20)
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(20)
    doc.setFont('helvetica', 'bold')
    doc.text('CLÍNICA DENTAL SORIE', logoData ? 70 : 20, 20)
    doc.setFontSize(10)
    doc.text('Cuidando tu sonrisa con excelencia', logoData ? 70 : 20, 28)
    doc.text('Tel: (01) 234-5678 | Email: info@clinicasorie.com', logoData ? 70 : 20, 35)
    doc.text('FACTURA', 150, 20)
    doc.text(`N°: ${factura.id.slice(0, 8).toUpperCase()}`, 150, 30)
    doc.text(`Fecha: ${new Date(factura.fechaEmision).toLocaleDateString('es-PE')}`, 150, 37)
    doc.text(`Estado: ${factura.estado.toUpperCase()}`, 150, 44)

    doc.setTextColor(darkGray.r, darkGray.g, darkGray.b)
    yPosition = 80

    doc.setFillColor(lightGray.r, lightGray.g, lightGray.b)
    doc.rect(20, yPosition - 5, 170, 12, 'F')
    doc.setTextColor(primaryColor.r, primaryColor.g, primaryColor.b)
    doc.setFontSize(12)
    doc.setFont('helvetica', 'bold')
    doc.text('DATOS DEL PACIENTE', 25, yPosition + 3)
    yPosition += 18
    doc.setTextColor(darkGray.r, darkGray.g, darkGray.b)
    doc.setFontSize(11)
    doc.setFont('helvetica', 'normal')
    doc.setDrawColor(borderColor.r, borderColor.g, borderColor.b)
    doc.rect(20, yPosition - 5, 170, 25)
    doc.text(`Nombre Completo: ${factura.paciente.nombres} ${factura.paciente.apellidos}`, 25, yPosition + 5)
    doc.text(`DNI: ${factura.paciente.dni}`, 25, yPosition + 12)
    doc.text(`Fecha: ${new Date(factura.fechaEmision).toLocaleDateString('es-PE', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}`, 25, yPosition + 19)
    yPosition += 40

    doc.setFillColor(lightGray.r, lightGray.g, lightGray.b)
    doc.rect(20, yPosition - 5, 170, 12, 'F')
    doc.setTextColor(primaryColor.r, primaryColor.g, primaryColor.b)
    doc.text('SERVICIOS REALIZADOS', 25, yPosition + 3)
    yPosition += 18
    doc.setTextColor(darkGray.r, darkGray.g, darkGray.b)
    const servicioTexto = servicios || 'Consulta y tratamiento dental general'
    const servicioLines = doc.splitTextToSize(servicioTexto, 160)
    const serviciosHeight = servicioLines.length * 7 + 10
    doc.setDrawColor(borderColor.r, borderColor.g, borderColor.b)
    doc.rect(20, yPosition - 5, 170, serviciosHeight)
    doc.text(servicioLines, 25, yPosition + 5)
    yPosition += serviciosHeight + 15

    doc.setFillColor(lightGray.r, lightGray.g, lightGray.b)
    doc.rect(20, yPosition - 5, 170, 12, 'F')
    doc.setTextColor(primaryColor.r, primaryColor.g, primaryColor.b)
    doc.text('DETALLE DE PAGO', 25, yPosition + 3)
    yPosition += 18
    const tableData = [
      ['Subtotal:', `S/ ${(factura.monto * 0.82).toFixed(2)}`],
      ['IGV (18%):', `S/ ${(factura.monto * 0.18).toFixed(2)}`],
      ['TOTAL:', `S/ ${factura.monto.toFixed(2)}`]
    ]
    doc.setDrawColor(borderColor.r, borderColor.g, borderColor.b)
    tableData.forEach((row, index) => {
      const isTotal = index === 2
      doc.setFillColor(isTotal ? primaryColor.r : 255, isTotal ? primaryColor.g : 255, isTotal ? primaryColor.b : 255)
      doc.rect(20, yPosition - 2, 170, 10, 'F')
      doc.setTextColor(isTotal ? 255 : darkGray.r, isTotal ? 255 : darkGray.g, isTotal ? 255 : darkGray.b)
      doc.setFont(isTotal ? 'helvetica' : 'helvetica', isTotal ? 'bold' : 'normal')
      doc.rect(20, yPosition - 2, 170, 10)
      doc.line(130, yPosition - 2, 130, yPosition + 8)
      doc.text(row[0], 25, yPosition + 4)
      doc.text(row[1], 135, yPosition + 4)
      yPosition += 10
    })
    yPosition += 15
    doc.setTextColor(darkGray.r, darkGray.g, darkGray.b)
    doc.setFontSize(11)
    doc.setFont('helvetica', 'bold')
    doc.text('Método de Pago: ', 25, yPosition)
    doc.setFont('helvetica', 'normal')
    doc.text(factura.metodoPago || 'Efectivo', 65, yPosition)
    yPosition += 25

    doc.setDrawColor(primaryColor.r, primaryColor.g, primaryColor.b)
    doc.line(20, yPosition, 190, yPosition)
    yPosition += 10
    doc.setTextColor(primaryColor.r, primaryColor.g, primaryColor.b)
    doc.setFontSize(12)
    doc.setFont('helvetica', 'bold')
    doc.text('¡Gracias por confiar en nosotros!', 105, yPosition, { align: 'center' })
    yPosition += 8
    doc.setTextColor(darkGray.r, darkGray.g, darkGray.b)
    doc.setFontSize(10)
    doc.text('Tu sonrisa es nuestra mejor recompensa', 105, yPosition, { align: 'center' })
    yPosition += 15
    doc.setFontSize(8)
    doc.setTextColor(100, 100, 100)
    const footerInfo = [
      'Consultorios: Av. Principal 123, Lima - Perú',
      'Horarios: Lunes a Viernes 8:00 AM - 8:00 PM | Sábados 8:00 AM - 2:00 PM',
      `Documento generado el ${new Date().toLocaleString('es-PE')}`
    ]
    footerInfo.forEach((info, index) => {
      doc.text(info, 105, yPosition + (index * 4), { align: 'center' })
    })

    if (factura.estado === 'COMPLETADO') {
      doc.setTextColor(0, 150, 0, 0.1)
      doc.setFontSize(50)
      doc.setFont('helvetica', 'bold')
      doc.text('PAGADO', 105, 150, { align: 'center', angle: -45 })
    }

    return Buffer.from(doc.output('arraybuffer'))
  } catch (error) {
    console.error('Error generando PDF:', error)
    throw error
  }
}