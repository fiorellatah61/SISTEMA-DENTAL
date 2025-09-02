// // app/api/facturas/route.ts
// // nuevo con singleton -----------------------
// import { NextRequest, NextResponse } from 'next/server'
// import { prisma } from '@/lib/prisma' 
// import { createClient } from '@supabase/supabase-js'
// import jsPDF from 'jspdf'
// import nodemailer from 'nodemailer'



// const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
// const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
// const supabase = createClient(supabaseUrl, supabaseKey)

// // Configuración de Nodemailer
// const transporter = nodemailer.createTransport({
//   service: 'gmail',
//   auth: {
//     user: process.env.EMAIL_USER,
//     pass: process.env.EMAIL_PASS
//   }
// })

// export async function GET() {
//   try {
//     const facturas = await prisma.factura.findMany({
//       include: {
//         paciente: {
//           select: { 
//             id: true, 
//             nombres: true, 
//             apellidos: true, 
//             dni: true,
//             email: true,
//             telefono: true
//           }
//         },
//         examenOdontologico: {
//           select: {
//             id: true,
//             diagnostico: true,
//             presupuesto: true,
//             planTratamiento: {
//               select: {
//                 descripcion: true,
//                 costoTotal: true
//               }
//             }
//           }
//         },
//         evolucionPaciente: {
//           select: {
//             id: true,
//             tratamientoRealizado: true,
//             aCuenta: true,
//             saldo: true
//           }
//         }
//       },
//       orderBy: { fechaEmision: 'desc' }
//     })
//     return NextResponse.json(facturas)
//   } catch (error) {
//     console.error('Error obteniendo facturas:', error)
//     return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
//   }
// }

// export async function POST(request: NextRequest) {
//   try {
//     const body = await request.json()
//     const { 
//       idPaciente, 
//       idExamenesOdontologico,
//       idEvolucionPaciente,
//       monto, 
//       metodoPago, 
//       estado, 
//       servicios,
//       aplicarIgv,
//       montoBase,
//       igvCalculado
//     } = body

//     if (!idPaciente || !monto) {
//       return NextResponse.json({ error: 'Paciente y monto son requeridos' }, { status: 400 })
//     }

//     // Validar que el monto sea un número válido
//     const montoNumerico = parseFloat(monto)
//     if (isNaN(montoNumerico) || !isFinite(montoNumerico) || montoNumerico <= 0) {
//       return NextResponse.json({ error: 'El monto debe ser un número válido mayor a 0' }, { status: 400 })
//     }

//     const paciente = await prisma.paciente.findUnique({ 
//       where: { id: idPaciente }
//     })
    
//     if (!paciente) {
//       return NextResponse.json({ error: 'Paciente no encontrado' }, { status: 404 })
//     }

//     // Procesar los IDs opcionales con validación
//     const examenId = idExamenesOdontologico && idExamenesOdontologico !== 'ninguno'
//       ? (await prisma.examenOdontologico.findUnique({ where: { id: idExamenesOdontologico } }))?.id || null
//       : null;
//     const evolucionId = idEvolucionPaciente && idEvolucionPaciente !== 'ninguno'
//       ? (await prisma.evolucionPaciente.findUnique({ where: { id: idEvolucionPaciente } }))?.id || null
//       : null;

//     const nuevaFactura = await prisma.factura.create({
//       data: {
//         idPaciente,
//         idExamenesOdontologico: examenId,
//         idEvolucionPaciente: evolucionId,
//         monto: montoNumerico,
//         metodoPago: metodoPago || null,
//         estado: estado || 'PENDIENTE'
//       },
//       include: { 
//         paciente: true,
//         examenOdontologico: {
//           include: {
//             planTratamiento: true
//           }
//         },
//         evolucionPaciente: true
//       }
//     })

//     // Generar PDF
//     try {
//       const pdfBuffer = await generarPDF(nuevaFactura, {
//         servicios: servicios || '',
//         aplicarIgv: aplicarIgv || false,
//         montoBase: parseFloat(montoBase) || montoNumerico,
//         igvCalculado: parseFloat(igvCalculado) || 0
//       })

//       const nombreArchivo = `factura-${nuevaFactura.id}-${Date.now()}.pdf`
//       const rutaArchivo = `facturas/${nombreArchivo}`

//       const { error: uploadError } = await supabase.storage
//         .from('fichas-odontologicas')
//         .upload(rutaArchivo, pdfBuffer, { contentType: 'application/pdf', upsert: false })

//       if (!uploadError) {
//         const { data: urlData } = supabase.storage.from('fichas-odontologicas').getPublicUrl(rutaArchivo)
//         await prisma.factura.update({
//           where: { id: nuevaFactura.id },
//           data: { archivoFacturaPdf: urlData.publicUrl }
//         })
//       } else {
//         console.error('Error subiendo PDF:', uploadError.message)
//       }
//     } catch (pdfError) {
//       console.error('Error generando PDF:', pdfError)
//     }

//     const facturaFinal = await prisma.factura.findUnique({
//       where: { id: nuevaFactura.id },
//       include: { 
//         paciente: true,
//         examenOdontologico: {
//           include: {
//             planTratamiento: true
//           }
//         },
//         evolucionPaciente: true
//       }
//     })

//     return NextResponse.json(facturaFinal)
//   } catch (error) {
//     console.error('Error creando factura:', error)
//     return NextResponse.json({ 
//       error: 'Error interno del servidor',
//       details: error instanceof Error ? error.message : 'Error desconocido'
//     }, { status: 500 })
//   }
// }

// async function generarPDF(factura: any, opciones: any): Promise<Buffer> {
//   try {
//     const doc = new jsPDF('p', 'mm', 'a4')
//     const pageWidth = 210
//     let yPosition = 20

//     const primaryColor = { r: 52, g: 168, b: 83 }
//     const lightGray = { r: 245, g: 245, b: 245 }
//     const darkGray = { r: 64, g: 64, b: 64 }
//     const borderColor = { r: 200, g: 200, b: 200 }

//     // Logo
//     let logoData: string | null = null
//     try {
//       const fs = require('fs')
//       const path = require('path')
//       const logoFilePath = path.join(process.cwd(), 'public', 'Logo.png')
//       if (fs.existsSync(logoFilePath)) {
//         const logoBuffer = fs.readFileSync(logoFilePath)
//         logoData = `data:image/png;base64,${logoBuffer.toString('base64')}`
//       }
//     } catch (logoError) {
//       console.log('Logo no encontrado, continuando sin logo')
//     }

//     // HEADER
//     doc.setFillColor(primaryColor.r, primaryColor.g, primaryColor.b)
//     doc.rect(0, 0, pageWidth, 60, 'F')
//     if (logoData) {
//       try {
//         doc.addImage(logoData, 'PNG', 20, 10, 40, 20)
//       } catch (imageError) {
//         console.log('Error añadiendo imagen, continuando sin logo')
//       }
//     }
    
//     doc.setTextColor(255, 255, 255)
//     doc.setFontSize(20)
//     doc.setFont('helvetica', 'bold')
//     doc.text('CLÍNICA DENTAL SORIE', logoData ? 70 : 20, 20)
//     doc.setFontSize(10)
//     doc.text('Cuidando tu sonrisa con excelencia', logoData ? 70 : 20, 28)
//     doc.text('Tel: (01) 234-5678 | Email: info@clinicasorie.com', logoData ? 70 : 20, 35)
//     doc.text('FACTURA', 150, 20)
//     doc.text(`N°: ${factura.id.slice(0, 8).toUpperCase()}`, 150, 30)
//     doc.text(`Fecha: ${new Date(factura.fechaEmision).toLocaleDateString('es-PE')}`, 150, 37)
//     doc.text(`Estado: ${factura.estado.toUpperCase()}`, 150, 44)

//     yPosition = 80

//     // DATOS DEL PACIENTE
//     doc.setTextColor(darkGray.r, darkGray.g, darkGray.b)
//     doc.setFillColor(lightGray.r, lightGray.g, lightGray.b)
//     doc.rect(20, yPosition - 5, 170, 12, 'F')
//     doc.setTextColor(primaryColor.r, primaryColor.g, primaryColor.b)
//     doc.setFontSize(12)
//     doc.setFont('helvetica', 'bold')
//     doc.text('DATOS DEL PACIENTE', 25, yPosition + 3)
//     yPosition += 18
    
//     doc.setTextColor(darkGray.r, darkGray.g, darkGray.b)
//     doc.setFontSize(11)
//     doc.setFont('helvetica', 'normal')
//     doc.setDrawColor(borderColor.r, borderColor.g, borderColor.b)
//     doc.rect(20, yPosition - 5, 170, 35)
//     doc.text(`Nombre: ${factura.paciente.nombres} ${factura.paciente.apellidos}`, 25, yPosition + 5)
//     doc.text(`DNI: ${factura.paciente.dni}`, 25, yPosition + 12)
//     doc.text(`Email: ${factura.paciente.email || 'No registrado'}`, 25, yPosition + 19)
//     doc.text(`Teléfono: ${factura.paciente.telefono || 'No registrado'}`, 25, yPosition + 26)
//     yPosition += 50

//     // DIAGNÓSTICO Y PLAN DE TRATAMIENTO
//     if (factura.examenOdontologico) {
//       doc.setFillColor(lightGray.r, lightGray.g, lightGray.b)
//       doc.rect(20, yPosition - 5, 170, 12, 'F')
//       doc.setTextColor(primaryColor.r, primaryColor.g, primaryColor.b)
//       doc.setFontSize(12)
//       doc.setFont('helvetica', 'bold')
//       doc.text('DIAGNÓSTICO Y TRATAMIENTO', 25, yPosition + 3)
//       yPosition += 18
      
//       doc.setTextColor(darkGray.r, darkGray.g, darkGray.b)
//       doc.setFontSize(10)
//       doc.setFont('helvetica', 'normal')
      
//       let diagnostico = factura.examenOdontologico.diagnostico || 'No especificado'
//       let planTratamiento = factura.examenOdontologico.planTratamiento?.descripcion || 'No especificado'
      
//       const diagnosticoLines = doc.splitTextToSize(`Diagnóstico: ${diagnostico}`, 160)
//       const planLines = doc.splitTextToSize(`Plan: ${planTratamiento}`, 160)
      
//       const totalLines = diagnosticoLines.length + planLines.length + 2
//       const sectionHeight = totalLines * 5 + 10
      
//       doc.setDrawColor(borderColor.r, borderColor.g, borderColor.b)
//       doc.rect(20, yPosition - 5, 170, sectionHeight)
//       doc.text(diagnosticoLines, 25, yPosition + 5)
//       doc.text(planLines, 25, yPosition + 5 + (diagnosticoLines.length * 5) + 5)
//       yPosition += sectionHeight + 15
//     }

//     // EVOLUCIÓN DEL PACIENTE
//     if (factura.evolucionPaciente) {
//       doc.setFillColor(lightGray.r, lightGray.g, lightGray.b)
//       doc.rect(20, yPosition - 5, 170, 12, 'F')
//       doc.setTextColor(primaryColor.r, primaryColor.g, primaryColor.b)
//       doc.setFontSize(12)
//       doc.setFont('helvetica', 'bold')
//       doc.text('TRATAMIENTO REALIZADO', 25, yPosition + 3)
//       yPosition += 18
      
//       doc.setTextColor(darkGray.r, darkGray.g, darkGray.b)
//       doc.setFontSize(10)
//       doc.setFont('helvetica', 'normal')
      
//       const tratamientoText = factura.evolucionPaciente.tratamientoRealizado || 'No especificado'
//       const tratamientoLines = doc.splitTextToSize(`Tratamiento: ${tratamientoText}`, 160)
//       const tratamientoHeight = tratamientoLines.length * 5 + 20
      
//       doc.setDrawColor(borderColor.r, borderColor.g, borderColor.b)
//       doc.rect(20, yPosition - 5, 170, tratamientoHeight)
//       doc.text(tratamientoLines, 25, yPosition + 5)
      
//       // Validar números antes de usar toFixed
//       const aCuenta = Number(factura.evolucionPaciente.aCuenta) || 0
//       const saldo = Number(factura.evolucionPaciente.saldo) || 0
      
//       doc.text(`A cuenta: S/ ${aCuenta.toFixed(2)}`, 25, yPosition + 5 + (tratamientoLines.length * 5) + 5)
//       doc.text(`Saldo: S/ ${saldo.toFixed(2)}`, 25, yPosition + 5 + (tratamientoLines.length * 5) + 12)
//       yPosition += tratamientoHeight + 15
//     }

//     // DETALLE DE PAGO
//     doc.setFillColor(lightGray.r, lightGray.g, lightGray.b)
//     doc.rect(20, yPosition - 5, 170, 12, 'F')
//     doc.setTextColor(primaryColor.r, primaryColor.g, primaryColor.b)
//     doc.setFontSize(12)
//     doc.setFont('helvetica', 'bold')
//     doc.text('DETALLE DE PAGO', 25, yPosition + 3)
//     yPosition += 18

//     // Calcular montos con validación
//     const montoBase = Number(opciones.montoBase) || Number(factura.monto) || 0
//     const aplicarIgv = opciones.aplicarIgv || false
//     const igv = aplicarIgv ? montoBase * 0.18 : 0
//     const total = montoBase + igv

//     const tableData = aplicarIgv ? [
//       ['Subtotal:', `S/ ${montoBase.toFixed(2)}`],
//       ['IGV (18%):', `S/ ${igv.toFixed(2)}`],
//       ['TOTAL:', `S/ ${total.toFixed(2)}`]
//     ] : [
//       ['TOTAL:', `S/ ${montoBase.toFixed(2)}`]
//     ]

//     doc.setDrawColor(borderColor.r, borderColor.g, borderColor.b)
//     tableData.forEach((row, index) => {
//       const isTotal = row[0] === 'TOTAL:'
//       doc.setFillColor(isTotal ? primaryColor.r : 255, isTotal ? primaryColor.g : 255, isTotal ? primaryColor.b : 255)
//       doc.rect(20, yPosition - 2, 170, 10, 'F')
//       doc.setTextColor(isTotal ? 255 : darkGray.r, isTotal ? 255 : darkGray.g, isTotal ? 255 : darkGray.b)
//       doc.setFont(isTotal ? 'helvetica' : 'helvetica', isTotal ? 'bold' : 'normal')
//       doc.rect(20, yPosition - 2, 170, 10)
//       doc.line(130, yPosition - 2, 130, yPosition + 8)
//       doc.text(row[0], 25, yPosition + 4)
//       doc.text(row[1], 135, yPosition + 4)
//       yPosition += 10
//     })

//     yPosition += 15
//     doc.setTextColor(darkGray.r, darkGray.g, darkGray.b)
//     doc.setFontSize(11)
//     doc.setFont('helvetica', 'bold')
//     doc.text('Método de Pago: ', 25, yPosition)
//     doc.setFont('helvetica', 'normal')
//     doc.text(factura.metodoPago || 'Efectivo', 65, yPosition)
//     yPosition += 25

//     // FOOTER
//     doc.setDrawColor(primaryColor.r, primaryColor.g, primaryColor.b)
//     doc.line(20, yPosition, 190, yPosition)
//     yPosition += 10
//     doc.setTextColor(primaryColor.r, primaryColor.g, primaryColor.b)
//     doc.setFontSize(12)
//     doc.setFont('helvetica', 'bold')
//     doc.text('¡Gracias por confiar en nosotros!', 105, yPosition, { align: 'center' })
//     yPosition += 8
//     doc.setTextColor(darkGray.r, darkGray.g, darkGray.b)
//     doc.setFontSize(10)
//     doc.text('Tu sonrisa es nuestra mejor recompensa', 105, yPosition, { align: 'center' })
//     yPosition += 15
//     doc.setFontSize(8)
//     doc.setTextColor(100, 100, 100)
//     const footerInfo = [
//       'Consultorios: Av. Principal 123, Lima - Perú',
//       'Horarios: Lunes a Viernes 8:00 AM - 8:00 PM | Sábados 8:00 AM - 2:00 PM',
//       `Documento generado el ${new Date().toLocaleString('es-PE')}`
//     ]
//     footerInfo.forEach((info, index) => {
//       doc.text(info, 105, yPosition + (index * 4), { align: 'center' })
//     })

//     // Marca de agua si está pagado
//     if (factura.estado === 'COMPLETADO') {
//       doc.setTextColor(0, 150, 0, 0.1)
//       doc.setFontSize(50)
//       doc.setFont('helvetica', 'bold')
//       doc.text('PAGADO', 105, 150, { align: 'center', angle: -45 })
//     }

//     return Buffer.from(doc.output('arraybuffer'))
//   } catch (error) {
//     console.error('Error generando PDF:', error)
//     throw new Error(`Error generando PDF: ${error instanceof Error ? error.message : 'Error desconocido'}`)
//   }
// }

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

// FUNCIÓN MEJORADA PARA GENERAR PDF ELEGANTE EN BLANCO Y NEGRO
// async function generarPDF(factura: any, opciones: any): Promise<Buffer> {
//   try {
//     const doc = new jsPDF('p', 'mm', 'a4')
//     const pageWidth = 210
//     const pageHeight = 297
//     let yPosition = 25

//     // Colores elegantes en escala de grises
//     const colors = {
//       primary: { r: 0, g: 0, b: 0 },        // Negro puro
//       secondary: { r: 60, g: 60, b: 60 },   // Gris oscuro
//       light: { r: 240, g: 240, b: 240 },    // Gris muy claro
//       medium: { r: 180, g: 180, b: 180 },   // Gris medio
//       white: { r: 255, g: 255, b: 255 }     // Blanco
//     }

//     // Cargar logo
//     let logoData: string | null = null
//     try {
//       const fs = require('fs')
//       const path = require('path')
//       const logoFilePath = path.join(process.cwd(), 'public', 'Logo.png')
//       if (fs.existsSync(logoFilePath)) {
//         const logoBuffer = fs.readFileSync(logoFilePath)
//         logoData = `data:image/png;base64,${logoBuffer.toString('base64')}`
//       }
//     } catch {
//       console.log('Logo no encontrado, continuando sin logo')
//     }

//     // HEADER ELEGANTE
//     // Borde superior
//     doc.setFillColor(colors.primary.r, colors.primary.g, colors.primary.b)
//     doc.rect(0, 0, pageWidth, 3, 'F')
    
//     // Logo y título
//     if (logoData) {
//       try {
//         doc.addImage(logoData, 'PNG', 20, 15, 35, 25)
//       } catch {
//         console.log('Error añadiendo logo')
//       }
//     }
    
//     // Información de la empresa
//     doc.setTextColor(colors.primary.r, colors.primary.g, colors.primary.b)
//     doc.setFontSize(24)
//     doc.setFont('helvetica', 'bold')
//     doc.text('CLÍNICA DENTAL SORIE', logoData ? 65 : 20, 25)
    
//     doc.setFontSize(10)
//     doc.setFont('helvetica', 'normal')
//     doc.setTextColor(colors.secondary.r, colors.secondary.g, colors.secondary.b)
//     doc.text('Cuidando tu sonrisa con excelencia', logoData ? 65 : 20, 32)
//     doc.text('Tel: (01) 234-5678 | info@clinicasorie.com', logoData ? 65 : 20, 38)
//     doc.text('Av. Principal 123, Lima - Perú', logoData ? 65 : 20, 44)

//     // Información de la factura (lado derecho)
//     doc.setFillColor(colors.light.r, colors.light.g, colors.light.b)
//     doc.rect(130, 15, 65, 35, 'F')
//     doc.setDrawColor(colors.medium.r, colors.medium.g, colors.medium.b)
//     doc.rect(130, 15, 65, 35)
    
//     doc.setTextColor(colors.primary.r, colors.primary.g, colors.primary.b)
//     doc.setFontSize(16)
//     doc.setFont('helvetica', 'bold')
//     doc.text('FACTURA', 162.5, 25, { align: 'center' })
    
//     doc.setFontSize(10)
//     doc.setFont('helvetica', 'normal')
//     doc.text(`N°: ${factura.id.slice(0, 8).toUpperCase()}`, 135, 32)
//     doc.text(`Fecha: ${new Date(factura.fechaEmision).toLocaleDateString('es-PE')}`, 135, 38)
//     doc.text(`Estado: ${factura.estado.toUpperCase()}`, 135, 44)

//     yPosition = 70

//     // DATOS DEL PACIENTE
//     doc.setFillColor(colors.primary.r, colors.primary.g, colors.primary.b)
//     doc.rect(20, yPosition, 170, 8, 'F')
//     doc.setTextColor(colors.white.r, colors.white.g, colors.white.b)
//     doc.setFontSize(12)
//     doc.setFont('helvetica', 'bold')
//     doc.text('DATOS DEL PACIENTE', 25, yPosition + 5)
//     yPosition += 12
    
//     doc.setDrawColor(colors.medium.r, colors.medium.g, colors.medium.b)
//     doc.rect(20, yPosition, 170, 32)
//     doc.setFillColor(colors.white.r, colors.white.g, colors.white.b)
//     doc.rect(20, yPosition, 170, 32, 'F')
    
//     doc.setTextColor(colors.primary.r, colors.primary.g, colors.primary.b)
//     doc.setFontSize(11)
//     doc.setFont('helvetica', 'normal')
//     doc.text(`Nombre: ${factura.paciente.nombres} ${factura.paciente.apellidos}`, 25, yPosition + 8)
//     doc.text(`DNI: ${factura.paciente.dni}`, 25, yPosition + 16)
//     doc.text(`Email: ${factura.paciente.email || 'No registrado'}`, 25, yPosition + 24)
//     yPosition += 42

//     // DIAGNÓSTICO Y PLAN DE TRATAMIENTO
//     if (factura.examenOdontologico) {
//       doc.setFillColor(colors.primary.r, colors.primary.g, colors.primary.b)
//       doc.rect(20, yPosition, 170, 8, 'F')
//       doc.setTextColor(colors.white.r, colors.white.g, colors.white.b)
//       doc.setFontSize(12)
//       doc.setFont('helvetica', 'bold')
//       doc.text('DIAGNÓSTICO Y TRATAMIENTO', 25, yPosition + 5)
//       yPosition += 12
      
//       const diagnostico = factura.examenOdontologico.diagnostico || 'No especificado'
//       const planTratamiento = factura.examenOdontologico.planTratamiento?.descripcion || 'No especificado'
//       const presupuesto = factura.examenOdontologico.presupuesto || 0
      
//       const diagnosticoLines = doc.splitTextToSize(`${diagnostico}`, 160)
//       const planLines = doc.splitTextToSize(`${planTratamiento}`, 160)
      
//       const sectionHeight = (diagnosticoLines.length + planLines.length + 3) * 6 + 15
      
//       doc.setDrawColor(colors.medium.r, colors.medium.g, colors.medium.b)
//       doc.rect(20, yPosition, 170, sectionHeight)
//       doc.setFillColor(colors.white.r, colors.white.g, colors.white.b)
//       doc.rect(20, yPosition, 170, sectionHeight, 'F')
      
//       doc.setTextColor(colors.secondary.r, colors.secondary.g, colors.secondary.b)
//       doc.setFontSize(10)
//       doc.setFont('helvetica', 'bold')
//       doc.text('Diagnóstico:', 25, yPosition + 8)
//       doc.setFont('helvetica', 'normal')
//       doc.text(diagnosticoLines, 25, yPosition + 14)
      
//       const planY = yPosition + 14 + (diagnosticoLines.length * 6) + 5
//       doc.setFont('helvetica', 'bold')
//       doc.text('Plan de tratamiento:', 25, planY)
//       doc.setFont('helvetica', 'normal')
//       doc.text(planLines, 25, planY + 6)
      
//       const presupuestoY = planY + 6 + (planLines.length * 6) + 5
//       doc.setFont('helvetica', 'bold')
//       doc.text(`Presupuesto: S/ ${Number(presupuesto).toFixed(2)}`, 25, presupuestoY)
      
//       yPosition += sectionHeight + 15
//     }

//     // EVOLUCIÓN DEL PACIENTE
//     if (factura.evolucionPaciente) {
//       doc.setFillColor(colors.primary.r, colors.primary.g, colors.primary.b)
//       doc.rect(20, yPosition, 170, 8, 'F')
//       doc.setTextColor(colors.white.r, colors.white.g, colors.white.b)
//       doc.setFontSize(12)
//       doc.setFont('helvetica', 'bold')
//       doc.text('TRATAMIENTO REALIZADO', 25, yPosition + 5)
//       yPosition += 12
      
//       const tratamiento = factura.evolucionPaciente.tratamientoRealizado || 'No especificado'
//       const tratamientoLines = doc.splitTextToSize(tratamiento, 160)
//       const sectionHeight = tratamientoLines.length * 6 + 25
      
//       doc.setDrawColor(colors.medium.r, colors.medium.g, colors.medium.b)
//       doc.rect(20, yPosition, 170, sectionHeight)
//       doc.setFillColor(colors.white.r, colors.white.g, colors.white.b)
//       doc.rect(20, yPosition, 170, sectionHeight, 'F')
      
//       doc.setTextColor(colors.secondary.r, colors.secondary.g, colors.secondary.b)
//       doc.setFontSize(10)
//       doc.setFont('helvetica', 'normal')
//       doc.text(tratamientoLines, 25, yPosition + 8)
      
//       const aCuenta = Number(factura.evolucionPaciente.aCuenta) || 0
//       const saldo = Number(factura.evolucionPaciente.saldo) || 0
      
//       doc.setFont('helvetica', 'bold')
//       doc.text(`A cuenta: S/ ${aCuenta.toFixed(2)}`, 25, yPosition + 8 + (tratamientoLines.length * 6) + 5)
//       doc.text(`Saldo: S/ ${saldo.toFixed(2)}`, 25, yPosition + 8 + (tratamientoLines.length * 6) + 12)
//       yPosition += sectionHeight + 15
//     }

//     // DETALLE DE PAGO ELEGANTE
//     doc.setFillColor(colors.primary.r, colors.primary.g, colors.primary.b)
//     doc.rect(20, yPosition, 170, 8, 'F')
//     doc.setTextColor(colors.white.r, colors.white.g, colors.white.b)
//     doc.setFontSize(12)
//     doc.setFont('helvetica', 'bold')
//     doc.text('DETALLE DE PAGO', 25, yPosition + 5)
//     yPosition += 12

//     const montoBase = Number(opciones.montoBase) || Number(factura.monto) || 0
//     const aplicarIgv = opciones.aplicarIgv || false
//     const igv = aplicarIgv ? montoBase * 0.18 : 0
//     const total = montoBase + igv

//     const tableData = aplicarIgv ? [
//       ['Subtotal:', `S/ ${montoBase.toFixed(2)}`],
//       ['IGV (18%):', `S/ ${igv.toFixed(2)}`],
//       ['TOTAL:', `S/ ${total.toFixed(2)}`]
//     ] : [
//       ['TOTAL:', `S/ ${montoBase.toFixed(2)}`]
//     ]

//     tableData.forEach((row, index) => {
//       const isTotal = row[0] === 'TOTAL:'
      
//       if (isTotal) {
//         doc.setFillColor(colors.primary.r, colors.primary.g, colors.primary.b)
//         doc.setTextColor(colors.white.r, colors.white.g, colors.white.b)
//       } else {
//         doc.setFillColor(colors.light.r, colors.light.g, colors.light.b)
//         doc.setTextColor(colors.primary.r, colors.primary.g, colors.primary.b)
//       }
      
//       doc.rect(20, yPosition, 170, 12, 'F')
//       doc.setDrawColor(colors.medium.r, colors.medium.g, colors.medium.b)
//       doc.rect(20, yPosition, 170, 12)
//       doc.line(130, yPosition, 130, yPosition + 12)
      
//       doc.setFontSize(isTotal ? 14 : 11)
//       doc.setFont('helvetica', isTotal ? 'bold' : 'normal')
//       doc.text(row[0], 25, yPosition + 7)
//       doc.text(row[1], 135, yPosition + 7)
//       yPosition += 12
//     })

//     yPosition += 10
    
//     // Método de pago
//     doc.setTextColor(colors.secondary.r, colors.secondary.g, colors.secondary.b)
//     doc.setFontSize(11)
//     doc.setFont('helvetica', 'bold')
//     doc.text('Método de Pago: ', 25, yPosition)
//     doc.setFont('helvetica', 'normal')
//     doc.text(factura.metodoPago || 'Efectivo', 70, yPosition)
//     yPosition += 20

//     // Línea decorativa
//     doc.setDrawColor(colors.primary.r, colors.primary.g, colors.primary.b)
//     doc.setLineWidth(0.5)
//     doc.line(20, yPosition, 190, yPosition)
//     yPosition += 15

//     // FOOTER ELEGANTE
//     doc.setTextColor(colors.primary.r, colors.primary.g, colors.primary.b)
//     doc.setFontSize(14)
//     doc.setFont('helvetica', 'bold')
//     doc.text('Gracias por confiar en nosotros', 105, yPosition, { align: 'center' })
//     yPosition += 8
    
//     doc.setTextColor(colors.secondary.r, colors.secondary.g, colors.secondary.b)
//     doc.setFontSize(10)
//     doc.setFont('helvetica', 'italic')
//     doc.text('"Tu sonrisa es nuestra mejor recompensa"', 105, yPosition, { align: 'center' })
//     yPosition += 20

//     // Información adicional del pie
//     doc.setTextColor(colors.secondary.r, colors.secondary.g, colors.secondary.b)
//     doc.setFontSize(8)
//     doc.setFont('helvetica', 'normal')
//     const footerInfo = [
//       'Horarios de atención: Lunes a Viernes 8:00 AM - 8:00 PM | Sábados 8:00 AM - 2:00 PM',
//       `Documento generado el ${new Date().toLocaleString('es-PE')}`,
//       'Para consultas o reclamos, comuníquese a través de nuestros canales oficiales'
//     ]
    
//     footerInfo.forEach((info, index) => {
//       doc.text(info, 105, yPosition + (index * 4), { align: 'center' })
//     })

//     // Marca de agua elegante si está pagado
//     if (factura.estado === 'COMPLETADO') {
//       doc.setTextColor(colors.medium.r, colors.medium.g, colors.medium.b, 0.3)
//       doc.setFontSize(45)
//       doc.setFont('helvetica', 'bold')
//       doc.text('PAGADO', 105, 150, { align: 'center', angle: -25 })
//     }

//     // Borde inferior elegante
//     doc.setFillColor(colors.primary.r, colors.primary.g, colors.primary.b)
//     doc.rect(0, pageHeight - 3, pageWidth, 3, 'F')

//     return Buffer.from(doc.output('arraybuffer'))
//   } catch (error) {
//     console.error('Error generando PDF:', error)
//     throw new Error(`Error generando PDF: ${error instanceof Error ? error.message : 'Error desconocido'}`)
//   }
// }

// FUNCIÓN MEJORADA PARA GENERAR PDF ELEGANTE Y PROFESIONAL
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