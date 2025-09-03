//====================================================================
// app/api/facturas/route.ts - MIGRADO A BREVO
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma' 
import { createClient } from '@supabase/supabase-js'
import jsPDF from 'jspdf'
import * as Brevo from '@getbrevo/brevo'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)

export async function GET() {
  try {
    const facturas = await prisma.factura.findMany({
      include: {
        paciente: {
          select: { 
            id: true, 
            nombres: true, 
            apellidos: true, 
            dni: true,
            email: true,
            telefono: true
          }
        },
        examenOdontologico: {
          select: {
            id: true,
            diagnostico: true,
            presupuesto: true,
            planTratamiento: {
              select: {
                descripcion: true,
                costoTotal: true
              }
            }
          }
        },
        evolucionPaciente: {
          select: {
            id: true,
            tratamientoRealizado: true,
            aCuenta: true,
            saldo: true
          }
        }
      },
      orderBy: { fechaEmision: 'desc' }
    })
    return NextResponse.json(facturas)
  } catch (error) {
    console.error('Error obteniendo facturas:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { 
      idPaciente, 
      idExamenesOdontologico,
      idEvolucionPaciente,
      monto, 
      metodoPago, 
      estado, 
      servicios,
      aplicarIgv,
      montoBase,
      igvCalculado
    } = body

    if (!idPaciente || !monto) {
      return NextResponse.json({ error: 'Paciente y monto son requeridos' }, { status: 400 })
    }

    // Validar que el monto sea un número válido
    const montoNumerico = parseFloat(monto)
    if (isNaN(montoNumerico) || !isFinite(montoNumerico) || montoNumerico <= 0) {
      return NextResponse.json({ error: 'El monto debe ser un número válido mayor a 0' }, { status: 400 })
    }

    const paciente = await prisma.paciente.findUnique({ 
      where: { id: idPaciente }
    })
    
    if (!paciente) {
      return NextResponse.json({ error: 'Paciente no encontrado' }, { status: 404 })
    }

    // Procesar los IDs opcionales con validación
    const examenId = idExamenesOdontologico && idExamenesOdontologico !== 'ninguno'
      ? (await prisma.examenOdontologico.findUnique({ where: { id: idExamenesOdontologico } }))?.id || null
      : null;
    const evolucionId = idEvolucionPaciente && idEvolucionPaciente !== 'ninguno'
      ? (await prisma.evolucionPaciente.findUnique({ where: { id: idEvolucionPaciente } }))?.id || null
      : null;

    const nuevaFactura = await prisma.factura.create({
      data: {
        idPaciente,
        idExamenesOdontologico: examenId,
        idEvolucionPaciente: evolucionId,
        monto: montoNumerico,
        metodoPago: metodoPago || null,
        estado: estado || 'PENDIENTE'
      },
      include: { 
        paciente: true,
        examenOdontologico: {
          include: {
            planTratamiento: true
          }
        },
        evolucionPaciente: true
      }
    })

    // Generar PDF con diseño mejorado
    try {
      const pdfBuffer = await generarPDF(nuevaFactura, {
        servicios: servicios || '',
        aplicarIgv: aplicarIgv || false,
        montoBase: parseFloat(montoBase) || montoNumerico,
        igvCalculado: parseFloat(igvCalculado) || 0
      })

      const nombreArchivo = `factura-${nuevaFactura.id}-${Date.now()}.pdf`
      const rutaArchivo = `facturas/${nombreArchivo}`

      const { error: uploadError } = await supabase.storage
        .from('fichas-odontologicas')
        .upload(rutaArchivo, pdfBuffer, { contentType: 'application/pdf', upsert: false })

      if (!uploadError) {
        const { data: urlData } = supabase.storage.from('fichas-odontologicas').getPublicUrl(rutaArchivo)
        await prisma.factura.update({
          where: { id: nuevaFactura.id },
          data: { archivoFacturaPdf: urlData.publicUrl }
        })
      } else {
        console.error('Error subiendo PDF:', uploadError.message)
      }
    } catch (pdfError) {
      console.error('Error generando PDF:', pdfError)
    }

    const facturaFinal = await prisma.factura.findUnique({
      where: { id: nuevaFactura.id },
      include: { 
        paciente: true,
        examenOdontologico: {
          include: {
            planTratamiento: true
          }
        },
        evolucionPaciente: true
      }
    })

    return NextResponse.json(facturaFinal)
  } catch (error) {
    console.error('Error creando factura:', error)
    return NextResponse.json({ 
      error: 'Error interno del servidor',
      details: error instanceof Error ? error.message : 'Error desconocido'
    }, { status: 500 })
  }
}

// FUNCIÓN MEJORADA PARA GENERAR PDF ELEGANTE Y PROFESIONAL - CLÍNICA DENTAL
async function generarPDF(factura: any, opciones: any): Promise<Buffer> {
  try {
    const doc = new jsPDF('p', 'mm', 'a4')
    const pageWidth = 210
    const pageHeight = 297
    let yPosition = 15

    // Paleta de colores profesional para clínica dental
    const colors = {
      primary: { r: 25, g: 118, b: 210 },      // Azul médico profesional
      primaryDark: { r: 13, g: 71, b: 161 },   // Azul más oscuro
      secondary: { r: 55, g: 65, b: 81 },      // Gris azulado
      accent: { r: 16, g: 185, b: 129 },       // Verde médico suave
      light: { r: 248, g: 250, b: 252 },       // Gris muy claro azulado
      medium: { r: 203, g: 213, b: 225 },      // Gris medio azulado
      dark: { r: 30, g: 41, b: 59 },           // Gris oscuro profesional
      white: { r: 255, g: 255, b: 255 }        // Blanco
    }

    // Cargar logo
    let logoData: string | null = null
    try {
      const fs = require('fs')
      const path = require('path')
      const logoFilePath = path.join(process.cwd(), 'public', 'Logo.png')
      if (fs.existsSync(logoFilePath)) {
        const logoBuffer = fs.readFileSync(logoFilePath)
        logoData = `data:image/png;base64,${logoBuffer.toString('base64')}`
      }
    } catch {
      console.log('Logo no encontrado, continuando sin logo')
    }

    // ==================== HEADER PROFESIONAL ====================
    // Barra superior elegante con degradado simulado
    doc.setFillColor(colors.primary.r, colors.primary.g, colors.primary.b)
    doc.rect(0, 0, pageWidth, 4, 'F')
    doc.setFillColor(colors.primaryDark.r, colors.primaryDark.g, colors.primaryDark.b)
    doc.rect(0, 2, pageWidth, 2, 'F')

    // Fondo del header
    doc.setFillColor(colors.light.r, colors.light.g, colors.light.b)
    doc.rect(0, 4, pageWidth, 50, 'F')
    
    // Logo
    if (logoData) {
      try {
        doc.addImage(logoData, 'PNG', 20, yPosition, 28, 22)
      } catch {
        console.log('Error añadiendo logo')
      }
    }
    
    // Información de la empresa - Header izquierdo
    const empresaX = logoData ? 55 : 20
    doc.setTextColor(colors.primary.r, colors.primary.g, colors.primary.b)
    doc.setFontSize(16)
    doc.setFont('helvetica', 'bold')
    doc.text('CLÍNICA DENTAL SORIE', empresaX, yPosition + 8)
    
    doc.setFontSize(9)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(colors.secondary.r, colors.secondary.g, colors.secondary.b)
    doc.text('Especialistas en salud dental integral', empresaX, yPosition + 15)
    
    // Información de contacto
    doc.setFontSize(8)
    doc.text('Tel: (01) 234-5678', empresaX, yPosition + 22)
    doc.text('info@clinicasorie.com', empresaX, yPosition + 27)
    doc.text('Av. Principal 123, Lima - Perú', empresaX, yPosition + 32)

    // Información de la factura (lado derecho) - MEJORADO
    doc.setFillColor(colors.primary.r, colors.primary.g, colors.primary.b)
    doc.rect(130, 15, 65, 35, 'F')
    
    doc.setTextColor(colors.white.r, colors.white.g, colors.white.b)
    doc.setFontSize(16)
    doc.setFont('helvetica', 'bold')
    doc.text('FACTURA', 162.5, 25, { align: 'center' })
    
    // Línea decorativa blanca
    doc.setDrawColor(colors.white.r, colors.white.g, colors.white.b)
    doc.setLineWidth(0.5)
    doc.line(138, 28, 187, 28)
    
    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    doc.text(`N°: ${factura.id.slice(0, 8).toUpperCase()}`, 135, 35)
    doc.text(`Fecha: ${new Date(factura.fechaEmision).toLocaleDateString('es-PE')}`, 135, 41)
    
    // Estado con color
    const estadoColor = factura.estado === 'COMPLETADO' ? colors.accent : { r: 255, g: 107, b: 107 }
    doc.setFillColor(estadoColor.r, estadoColor.g, estadoColor.b)
    doc.circle(137, 46, 1.5, 'F')
    doc.text(`${factura.estado}`, 142, 47)

    yPosition = 70

    // ==================== CONTENIDO PRINCIPAL ====================
    
    // DATOS DEL PACIENTE
    doc.setFillColor(colors.primary.r, colors.primary.g, colors.primary.b)
    doc.rect(20, yPosition, 170, 7, 'F')
    doc.setTextColor(colors.white.r, colors.white.g, colors.white.b)
    doc.setFontSize(11)
    doc.setFont('helvetica', 'bold')
    doc.text('INFORMACIÓN DEL PACIENTE', 23, yPosition + 4.5)
    yPosition += 9
    
    doc.setFillColor(colors.white.r, colors.white.g, colors.white.b)
    doc.setDrawColor(colors.medium.r, colors.medium.g, colors.medium.b)
    doc.setLineWidth(0.5)
    doc.rect(20, yPosition, 170, 25, 'FD')
    
    doc.setTextColor(colors.dark.r, colors.dark.g, colors.dark.b)
    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    doc.text(`Paciente: `, 23, yPosition + 6)
    doc.setFont('helvetica', 'bold')
    doc.text(`${factura.paciente.nombres} ${factura.paciente.apellidos}`, 45, yPosition + 6)
    
    doc.setFont('helvetica', 'normal')
    doc.text(`DNI: `, 23, yPosition + 12)
    doc.setFont('helvetica', 'bold')
    doc.text(`${factura.paciente.dni}`, 35, yPosition + 12)
    
    doc.setFont('helvetica', 'normal')
    doc.text(`Correo: `, 23, yPosition + 18)
    doc.setFont('helvetica', 'bold')
    doc.text(`${factura.paciente.email || 'No registrado'}`, 42, yPosition + 18)
    yPosition += 30

    // DIAGNÓSTICO Y TRATAMIENTO
    if (factura.examenOdontologico) {
      doc.setFillColor(colors.accent.r, colors.accent.g, colors.accent.b)
      doc.rect(20, yPosition, 170, 7, 'F')
      doc.setTextColor(colors.white.r, colors.white.g, colors.white.b)
      doc.setFontSize(11)
      doc.setFont('helvetica', 'bold')
      doc.text('DIAGNÓSTICO Y PLAN DE TRATAMIENTO', 23, yPosition + 4.5)
      yPosition += 9
      
      const diagnostico = factura.examenOdontologico.diagnostico || 'No especificado'
      const planTratamiento = factura.examenOdontologico.planTratamiento?.descripcion || 'No especificado'
      const presupuesto = factura.examenOdontologico.presupuesto || 0
      
      const diagnosticoLines = doc.splitTextToSize(diagnostico, 155)
      const planLines = doc.splitTextToSize(planTratamiento, 155)
      
      const sectionHeight = Math.max(32, (diagnosticoLines.length + planLines.length) * 4 + 18)
      
      doc.setFillColor(colors.white.r, colors.white.g, colors.white.b)
      doc.setDrawColor(colors.medium.r, colors.medium.g, colors.medium.b)
      doc.rect(20, yPosition, 170, sectionHeight, 'FD')
      
      doc.setTextColor(colors.primary.r, colors.primary.g, colors.primary.b)
      doc.setFontSize(9)
      doc.setFont('helvetica', 'bold')
      doc.text('Diagnóstico:', 23, yPosition + 6)
      doc.setFont('helvetica', 'normal')
      doc.setTextColor(colors.dark.r, colors.dark.g, colors.dark.b)
      doc.text(diagnosticoLines, 23, yPosition + 10)
      
      const planY = yPosition + 10 + (diagnosticoLines.length * 4) + 3
      doc.setTextColor(colors.primary.r, colors.primary.g, colors.primary.b)
      doc.setFont('helvetica', 'bold')
      doc.text('Plan de tratamiento:', 23, planY)
      doc.setFont('helvetica', 'normal')
      doc.setTextColor(colors.dark.r, colors.dark.g, colors.dark.b)
      doc.text(planLines, 23, planY + 4)
      
      const presupuestoY = planY + 4 + (planLines.length * 4) + 3
      doc.setFontSize(10)
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(colors.primary.r, colors.primary.g, colors.primary.b)
      doc.text(`Presupuesto estimado: S/ ${Number(presupuesto).toFixed(2)}`, 23, presupuestoY)
      
      yPosition += sectionHeight + 6
    }

    // TRATAMIENTO REALIZADO
    if (factura.evolucionPaciente) {
      doc.setFillColor(colors.secondary.r, colors.secondary.g, colors.secondary.b)
      doc.rect(20, yPosition, 170, 7, 'F')
      doc.setTextColor(colors.white.r, colors.white.g, colors.white.b)
      doc.setFontSize(11)
      doc.setFont('helvetica', 'bold')
      doc.text('SERVICIOS REALIZADOS', 23, yPosition + 4.5)
      yPosition += 9
      
      const tratamiento = factura.evolucionPaciente.tratamientoRealizado || 'No especificado'
      const tratamientoLines = doc.splitTextToSize(tratamiento, 155)
      const sectionHeight = Math.max(25, tratamientoLines.length * 4 + 16)
      
      doc.setFillColor(colors.white.r, colors.white.g, colors.white.b)
      doc.setDrawColor(colors.medium.r, colors.medium.g, colors.medium.b)
      doc.rect(20, yPosition, 170, sectionHeight, 'FD')
      
      doc.setTextColor(colors.dark.r, colors.dark.g, colors.dark.b)
      doc.setFontSize(9)
      doc.setFont('helvetica', 'normal')
      doc.text(tratamientoLines, 23, yPosition + 6)
      
      const aCuenta = Number(factura.evolucionPaciente.aCuenta) || 0
      const saldo = Number(factura.evolucionPaciente.saldo) || 0
      
      if (aCuenta > 0 || saldo > 0) {
        const pagosY = yPosition + 6 + (tratamientoLines.length * 4) + 3
        doc.setFontSize(9)
        doc.setFont('helvetica', 'bold')
        doc.setTextColor(colors.primary.r, colors.primary.g, colors.primary.b)
        doc.text(`Pago a cuenta: S/ ${aCuenta.toFixed(2)}`, 23, pagosY)
        doc.text(`Saldo pendiente: S/ ${saldo.toFixed(2)}`, 110, pagosY)
      }
      yPosition += sectionHeight + 6
    }

    // ==================== DETALLE DE PAGO ====================
    doc.setFillColor(colors.primaryDark.r, colors.primaryDark.g, colors.primaryDark.b)
    doc.rect(20, yPosition, 170, 7, 'F')
    doc.setTextColor(colors.white.r, colors.white.g, colors.white.b)
    doc.setFontSize(11)
    doc.setFont('helvetica', 'bold')
    doc.text('RESUMEN DE FACTURACIÓN', 23, yPosition + 4.5)
    yPosition += 9

    const montoBase = Number(opciones.montoBase) || Number(factura.monto) || 0
    const aplicarIgv = opciones.aplicarIgv || false
    const igv = aplicarIgv ? montoBase * 0.18 : 0
    const total = montoBase + igv

    const tableData = aplicarIgv ? [
      ['Subtotal:', `S/ ${montoBase.toFixed(2)}`],
      ['IGV (18%):', `S/ ${igv.toFixed(2)}`],
      ['TOTAL A PAGAR:', `S/ ${total.toFixed(2)}`]
    ] : [
      ['TOTAL A PAGAR:', `S/ ${montoBase.toFixed(2)}`]
    ]

    tableData.forEach((row, index) => {
      const isTotal = row[0].includes('TOTAL')
      const rowHeight = isTotal ? 12 : 9
      
      if (isTotal) {
        doc.setFillColor(colors.primary.r, colors.primary.g, colors.primary.b)
        doc.setTextColor(colors.white.r, colors.white.g, colors.white.b)
        doc.setFontSize(12)
        doc.setFont('helvetica', 'bold')
      } else {
        doc.setFillColor(colors.light.r, colors.light.g, colors.light.b)
        doc.setTextColor(colors.dark.r, colors.dark.g, colors.dark.b)
        doc.setFontSize(10)
        doc.setFont('helvetica', 'normal')
      }
      
      doc.rect(20, yPosition, 170, rowHeight, 'F')
      doc.setDrawColor(colors.medium.r, colors.medium.g, colors.medium.b)
      doc.setLineWidth(0.3)
      doc.rect(20, yPosition, 170, rowHeight, 'D')
      doc.line(130, yPosition, 130, yPosition + rowHeight)
      
      doc.text(row[0], 25, yPosition + (rowHeight/2) + 1.5)
      doc.text(row[1], 135, yPosition + (rowHeight/2) + 1.5)
      yPosition += rowHeight
    })

    yPosition += 10
    
    // Método de pago
    doc.setFillColor(colors.light.r, colors.light.g, colors.light.b)
    doc.rect(20, yPosition, 170, 8, 'F')
    doc.setDrawColor(colors.medium.r, colors.medium.g, colors.medium.b)
    doc.rect(20, yPosition, 170, 8, 'D')
    
    doc.setTextColor(colors.secondary.r, colors.secondary.g, colors.secondary.b)
    doc.setFontSize(9)
    doc.setFont('helvetica', 'bold')
    doc.text('Método de pago: ', 25, yPosition + 5)
    doc.setFont('helvetica', 'normal')
    doc.text(factura.metodoPago || 'Efectivo', 65, yPosition + 5)
    yPosition += 15

    // ==================== FOOTER COMPACTO Y VISIBLE ====================
    // Asegurar que el footer esté visible - posición fija más arriba
    const footerY = yPosition + 8
    
    // Línea decorativa
    doc.setDrawColor(colors.primary.r, colors.primary.g, colors.primary.b)
    doc.setLineWidth(1)
    doc.line(20, footerY, 190, footerY)

    // FOOTER PRINCIPAL - MÁS COMPACTO
    doc.setFillColor(colors.primary.r, colors.primary.g, colors.primary.b)
    doc.rect(20, footerY + 3, 170, 20, 'F')
    
    // Mensaje principal
    doc.setTextColor(colors.white.r, colors.white.g, colors.white.b)
    doc.setFontSize(12)
    doc.setFont('helvetica', 'bold')
    doc.text('¡Gracias por confiar en nuestra clínica!', 105, footerY + 10, { align: 'center' })
    
    doc.setFontSize(8)
    doc.setFont('helvetica', 'normal')
    doc.text('Su sonrisa saludable es nuestro mayor logro', 105, footerY + 15, { align: 'center' })
    
    // Información de contacto compacta
    doc.setFontSize(7)
    doc.text('Horarios: Lun-Vie 8AM-8PM | Sáb 8AM-2PM | info@clinicasorie.com', 105, footerY + 19, { align: 'center' })

    // Marca de agua si está pagado
    if (factura.estado === 'COMPLETADO') {
      doc.setTextColor(200, 240, 200) // Verde muy claro
      doc.setFontSize(35)
      doc.setFont('helvetica', 'bold')
      doc.text('✓ PAGADO', 105, 140, { align: 'center', angle: -20 })
    }

    // Bordes inferiores elegantes
    doc.setFillColor(colors.primary.r, colors.primary.g, colors.primary.b)
    doc.rect(0, pageHeight - 3, pageWidth, 1.5, 'F')
    doc.setFillColor(colors.accent.r, colors.accent.g, colors.accent.b)
    doc.rect(0, pageHeight - 1.5, pageWidth, 1.5, 'F')

    return Buffer.from(doc.output('arraybuffer'))
  } catch (error) {
    console.error('Error generando PDF:', error)
    throw new Error(`Error generando PDF: ${error instanceof Error ? error.message : 'Error desconocido'}`)
  }
}