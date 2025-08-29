// // app/api/facturas/route.ts

// import { NextRequest, NextResponse } from 'next/server'
// import { PrismaClient } from '@prisma/client'
// import { createClient } from '@supabase/supabase-js'
// import jsPDF from 'jspdf'
// import nodemailer from 'nodemailer'

// const prisma = new PrismaClient()

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

// nuevo con singleton -----------------------
// app/api/facturas/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma' 
import { createClient } from '@supabase/supabase-js'
import jsPDF from 'jspdf'
import nodemailer from 'nodemailer'



const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)

// Configuración de Nodemailer
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
})

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

    // Generar PDF
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

async function generarPDF(factura: any, opciones: any): Promise<Buffer> {
  try {
    const doc = new jsPDF('p', 'mm', 'a4')
    const pageWidth = 210
    let yPosition = 20

    const primaryColor = { r: 52, g: 168, b: 83 }
    const lightGray = { r: 245, g: 245, b: 245 }
    const darkGray = { r: 64, g: 64, b: 64 }
    const borderColor = { r: 200, g: 200, b: 200 }

    // Logo
    let logoData: string | null = null
    try {
      const fs = require('fs')
      const path = require('path')
      const logoFilePath = path.join(process.cwd(), 'public', 'Logo.png')
      if (fs.existsSync(logoFilePath)) {
        const logoBuffer = fs.readFileSync(logoFilePath)
        logoData = `data:image/png;base64,${logoBuffer.toString('base64')}`
      }
    } catch (logoError) {
      console.log('Logo no encontrado, continuando sin logo')
    }

    // HEADER
    doc.setFillColor(primaryColor.r, primaryColor.g, primaryColor.b)
    doc.rect(0, 0, pageWidth, 60, 'F')
    if (logoData) {
      try {
        doc.addImage(logoData, 'PNG', 20, 10, 40, 20)
      } catch (imageError) {
        console.log('Error añadiendo imagen, continuando sin logo')
      }
    }
    
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

    yPosition = 80

    // DATOS DEL PACIENTE
    doc.setTextColor(darkGray.r, darkGray.g, darkGray.b)
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
    doc.rect(20, yPosition - 5, 170, 35)
    doc.text(`Nombre: ${factura.paciente.nombres} ${factura.paciente.apellidos}`, 25, yPosition + 5)
    doc.text(`DNI: ${factura.paciente.dni}`, 25, yPosition + 12)
    doc.text(`Email: ${factura.paciente.email || 'No registrado'}`, 25, yPosition + 19)
    doc.text(`Teléfono: ${factura.paciente.telefono || 'No registrado'}`, 25, yPosition + 26)
    yPosition += 50

    // DIAGNÓSTICO Y PLAN DE TRATAMIENTO
    if (factura.examenOdontologico) {
      doc.setFillColor(lightGray.r, lightGray.g, lightGray.b)
      doc.rect(20, yPosition - 5, 170, 12, 'F')
      doc.setTextColor(primaryColor.r, primaryColor.g, primaryColor.b)
      doc.setFontSize(12)
      doc.setFont('helvetica', 'bold')
      doc.text('DIAGNÓSTICO Y TRATAMIENTO', 25, yPosition + 3)
      yPosition += 18
      
      doc.setTextColor(darkGray.r, darkGray.g, darkGray.b)
      doc.setFontSize(10)
      doc.setFont('helvetica', 'normal')
      
      let diagnostico = factura.examenOdontologico.diagnostico || 'No especificado'
      let planTratamiento = factura.examenOdontologico.planTratamiento?.descripcion || 'No especificado'
      
      const diagnosticoLines = doc.splitTextToSize(`Diagnóstico: ${diagnostico}`, 160)
      const planLines = doc.splitTextToSize(`Plan: ${planTratamiento}`, 160)
      
      const totalLines = diagnosticoLines.length + planLines.length + 2
      const sectionHeight = totalLines * 5 + 10
      
      doc.setDrawColor(borderColor.r, borderColor.g, borderColor.b)
      doc.rect(20, yPosition - 5, 170, sectionHeight)
      doc.text(diagnosticoLines, 25, yPosition + 5)
      doc.text(planLines, 25, yPosition + 5 + (diagnosticoLines.length * 5) + 5)
      yPosition += sectionHeight + 15
    }

    // EVOLUCIÓN DEL PACIENTE
    if (factura.evolucionPaciente) {
      doc.setFillColor(lightGray.r, lightGray.g, lightGray.b)
      doc.rect(20, yPosition - 5, 170, 12, 'F')
      doc.setTextColor(primaryColor.r, primaryColor.g, primaryColor.b)
      doc.setFontSize(12)
      doc.setFont('helvetica', 'bold')
      doc.text('TRATAMIENTO REALIZADO', 25, yPosition + 3)
      yPosition += 18
      
      doc.setTextColor(darkGray.r, darkGray.g, darkGray.b)
      doc.setFontSize(10)
      doc.setFont('helvetica', 'normal')
      
      const tratamientoText = factura.evolucionPaciente.tratamientoRealizado || 'No especificado'
      const tratamientoLines = doc.splitTextToSize(`Tratamiento: ${tratamientoText}`, 160)
      const tratamientoHeight = tratamientoLines.length * 5 + 20
      
      doc.setDrawColor(borderColor.r, borderColor.g, borderColor.b)
      doc.rect(20, yPosition - 5, 170, tratamientoHeight)
      doc.text(tratamientoLines, 25, yPosition + 5)
      
      // Validar números antes de usar toFixed
      const aCuenta = Number(factura.evolucionPaciente.aCuenta) || 0
      const saldo = Number(factura.evolucionPaciente.saldo) || 0
      
      doc.text(`A cuenta: S/ ${aCuenta.toFixed(2)}`, 25, yPosition + 5 + (tratamientoLines.length * 5) + 5)
      doc.text(`Saldo: S/ ${saldo.toFixed(2)}`, 25, yPosition + 5 + (tratamientoLines.length * 5) + 12)
      yPosition += tratamientoHeight + 15
    }

    // DETALLE DE PAGO
    doc.setFillColor(lightGray.r, lightGray.g, lightGray.b)
    doc.rect(20, yPosition - 5, 170, 12, 'F')
    doc.setTextColor(primaryColor.r, primaryColor.g, primaryColor.b)
    doc.setFontSize(12)
    doc.setFont('helvetica', 'bold')
    doc.text('DETALLE DE PAGO', 25, yPosition + 3)
    yPosition += 18

    // Calcular montos con validación
    const montoBase = Number(opciones.montoBase) || Number(factura.monto) || 0
    const aplicarIgv = opciones.aplicarIgv || false
    const igv = aplicarIgv ? montoBase * 0.18 : 0
    const total = montoBase + igv

    const tableData = aplicarIgv ? [
      ['Subtotal:', `S/ ${montoBase.toFixed(2)}`],
      ['IGV (18%):', `S/ ${igv.toFixed(2)}`],
      ['TOTAL:', `S/ ${total.toFixed(2)}`]
    ] : [
      ['TOTAL:', `S/ ${montoBase.toFixed(2)}`]
    ]

    doc.setDrawColor(borderColor.r, borderColor.g, borderColor.b)
    tableData.forEach((row, index) => {
      const isTotal = row[0] === 'TOTAL:'
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

    // FOOTER
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

    // Marca de agua si está pagado
    if (factura.estado === 'COMPLETADO') {
      doc.setTextColor(0, 150, 0, 0.1)
      doc.setFontSize(50)
      doc.setFont('helvetica', 'bold')
      doc.text('PAGADO', 105, 150, { align: 'center', angle: -45 })
    }

    return Buffer.from(doc.output('arraybuffer'))
  } catch (error) {
    console.error('Error generando PDF:', error)
    throw new Error(`Error generando PDF: ${error instanceof Error ? error.message : 'Error desconocido'}`)
  }
}