
// // app/api/facturas/[id]/route.ts
// import { NextRequest, NextResponse } from 'next/server'
// import { PrismaClient } from '@prisma/client'
// import { createClient } from '@supabase/supabase-js'
// import jsPDF from 'jspdf'

// // Inicialización mejorada de Prisma
// let prisma: PrismaClient | undefined

// function getPrismaClient() {
//   if (!prisma) {
//     try {
//       prisma = new PrismaClient()
//       console.log('Prisma Client inicializado correctamente')
//     } catch (error) {
//       console.error('Error inicializando Prisma:', error)
//       throw new Error('No se pudo conectar a la base de datos')
//     }
//   }
//   return prisma
// }

// // Configuración de Supabase
// const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
// const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
// const supabase = createClient(supabaseUrl, supabaseKey)

// export async function PUT(request: NextRequest, { params }: { params: Awaited<{ id: string }> }) {
//   try {
//     const { id } = await params
//     const body = await request.json()
//     const { idPaciente, monto, metodoPago, estado, servicios } = body

//     const prismaClient = getPrismaClient()

//     const facturaExistente = await prismaClient.factura.findUnique({
//       where: { id },
//       include: { paciente: true }
//     })

//     if (!facturaExistente) {
//       return NextResponse.json({ error: 'Factura no encontrada' }, { status: 404 })
//     }

//     const facturaActualizada = await prismaClient.factura.update({
//       where: { id },
//       data: {
//         idPaciente: idPaciente || facturaExistente.idPaciente,
//         monto: monto ? parseFloat(monto) : facturaExistente.monto,
//         metodoPago: metodoPago !== undefined ? metodoPago : facturaExistente.metodoPago,
//         estado: estado || facturaExistente.estado
//       },
//       include: { paciente: true }
//     })

//     const huboCambios = 
//       (monto && typeof monto === 'string' && !isNaN(parseFloat(monto)) && parseFloat(monto) !== Number(facturaExistente.monto)) ||
//       (estado && estado !== facturaExistente.estado) ||
//       (idPaciente && idPaciente !== facturaExistente.idPaciente) ||
//       (servicios !== undefined)

//     if (huboCambios) {
//       try {
//         const pdfBuffer = await generarPDF(facturaActualizada, servicios || '')

//         if (facturaExistente.archivoFacturaPdf) {
//           const rutaAnterior = extraerRutaDeUrl(facturaExistente.archivoFacturaPdf)
//           if (rutaAnterior) {
//             await supabase.storage.from('fichas-odontologicas').remove([rutaAnterior])
//           }
//         }

//         const nombreArchivo = `factura-${id}-${Date.now()}.pdf`
//         const rutaArchivo = `facturas/${nombreArchivo}` // Subcarpeta 'facturas/'

//         const { error: uploadError } = await supabase.storage
//           .from('fichas-odontologicas')
//           .upload(rutaArchivo, pdfBuffer, { contentType: 'application/pdf', upsert: false })

//         if (!uploadError) {
//           const { data: urlData } = supabase.storage.from('fichas-odontologicas').getPublicUrl(rutaArchivo)
//           await prismaClient.factura.update({
//             where: { id },
//             data: { archivoFacturaPdf: urlData.publicUrl }
//           })
//         }
//       } catch (pdfError) {
//         console.error('Error regenerando PDF:', pdfError)
//       }
//     }

//     const facturaFinal = await prismaClient.factura.findUnique({
//       where: { id },
//       include: { paciente: { select: { id: true, nombres: true, apellidos: true, dni: true } } }
//     })
//     return NextResponse.json(facturaFinal)
//   } catch (error) {
//     console.error('Error actualizando factura:', error)
//     return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
//   }
// }

// export async function DELETE(request: NextRequest, { params }: { params: Awaited<{ id: string }> }) {
//   try {
//     const { id } = await params
//     const prismaClient = getPrismaClient()

//     const factura = await prismaClient.factura.findUnique({ where: { id } })
//     if (!factura) {
//       return NextResponse.json({ error: 'Factura no encontrada' }, { status: 404 })
//     }

//     if (factura.archivoFacturaPdf) {
//       const rutaArchivo = extraerRutaDeUrl(factura.archivoFacturaPdf)
//       if (rutaArchivo) {
//         const { error } = await supabase.storage.from('fichas-odontologicas').remove([rutaArchivo])
//         if (error) throw new Error('Error eliminando archivo PDF: ' + error.message)
//       }
//     }

//     await prismaClient.factura.delete({ where: { id } })
//     return NextResponse.json({ message: 'Factura eliminada correctamente' })
//   } catch (error) {
//     console.error('Error eliminando factura:', error)
//     return NextResponse.json({ error: 'Error interno del servidor: ' + (error as Error).message }, { status: 500 })
//   }
// }

// function extraerRutaDeUrl(url: string): string | null {
//   const match = url.match(/\/storage\/v1\/object\/public\/fichas-odontologicas\/(.+)$/)
//   return match ? match[1] : null
// }

// async function generarPDF(factura: any, servicios: string): Promise<Buffer> {
//   try {
//     const doc = new jsPDF('p', 'mm', 'a4')
//     const pageWidth = 210
//     const pageHeight = 297
//     let yPosition = 20

//     const primaryColor = { r: 52, g: 168, b: 83 }
//     const lightGray = { r: 245, g: 245, b: 245 }
//     const darkGray = { r: 64, g: 64, b: 64 }
//     const borderColor = { r: 200, g: 200, b: 200 }

//     let logoData: string | null = null
//     try {
//       const fs = require('fs')
//       const path = require('path')
//       const logoFilePath = path.join(process.cwd(), 'public', 'Logo.png')
//       if (fs.existsSync(logoFilePath)) {
//         const logoBuffer = fs.readFileSync(logoFilePath)
//         logoData = `data:image/png;base64,${logoBuffer.toString('base64')}`
//       }
//     } catch {}

//     doc.setFillColor(primaryColor.r, primaryColor.g, primaryColor.b)
//     doc.rect(0, 0, pageWidth, 60, 'F')
//     if (logoData) doc.addImage(logoData, 'PNG', 20, 10, 40, 20)
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

//     doc.setTextColor(darkGray.r, darkGray.g, darkGray.b)
//     yPosition = 80

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
//     doc.rect(20, yPosition - 5, 170, 25)
//     doc.text(`Nombre Completo: ${factura.paciente.nombres} ${factura.paciente.apellidos}`, 25, yPosition + 5)
//     doc.text(`DNI: ${factura.paciente.dni}`, 25, yPosition + 12)
//     doc.text(`Fecha: ${new Date(factura.fechaEmision).toLocaleDateString('es-PE', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}`, 25, yPosition + 19)
//     yPosition += 40

//     doc.setFillColor(lightGray.r, lightGray.g, lightGray.b)
//     doc.rect(20, yPosition - 5, 170, 12, 'F')
//     doc.setTextColor(primaryColor.r, primaryColor.g, primaryColor.b)
//     doc.text('SERVICIOS REALIZADOS', 25, yPosition + 3)
//     yPosition += 18
//     doc.setTextColor(darkGray.r, darkGray.g, darkGray.b)
//     const servicioTexto = servicios || 'Consulta y tratamiento dental general'
//     const servicioLines = doc.splitTextToSize(servicioTexto, 160)
//     const serviciosHeight = servicioLines.length * 7 + 10
//     doc.setDrawColor(borderColor.r, borderColor.g, borderColor.b)
//     doc.rect(20, yPosition - 5, 170, serviciosHeight)
//     doc.text(servicioLines, 25, yPosition + 5)
//     yPosition += serviciosHeight + 15

//     doc.setFillColor(lightGray.r, lightGray.g, lightGray.b)
//     doc.rect(20, yPosition - 5, 170, 12, 'F')
//     doc.setTextColor(primaryColor.r, primaryColor.g, primaryColor.b)
//     doc.text('DETALLE DE PAGO', 25, yPosition + 3)
//     yPosition += 18
//     const tableData = [
//       ['Subtotal:', `S/ ${(factura.monto * 0.82).toFixed(2)}`],
//       ['IGV (18%):', `S/ ${(factura.monto * 0.18).toFixed(2)}`],
//       ['TOTAL:', `S/ ${factura.monto.toFixed(2)}`]
//     ]
//     doc.setDrawColor(borderColor.r, borderColor.g, borderColor.b)
//     tableData.forEach((row, index) => {
//       const isTotal = index === 2
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

//     if (factura.estado === 'COMPLETADO') {
//       doc.setTextColor(0, 150, 0, 0.1)
//       doc.setFontSize(50)
//       doc.setFont('helvetica', 'bold')
//       doc.text('PAGADO', 105, 150, { align: 'center', angle: -45 })
//     }

//     return Buffer.from(doc.output('arraybuffer'))
//   } catch (error) {
//     console.error('Error generando PDF:', error)
//     throw error
//   }
// }


//nuevo-------------------------------------

// app/api/facturas/[id]/route.ts (MEJORADO)

// app/api/facturas/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { createClient } from '@supabase/supabase-js'
import jsPDF from 'jspdf'
import nodemailer from 'nodemailer'

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

export async function PUT(request: NextRequest, { params }: { params: Awaited<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await request.json()
    const { 
      idPaciente, 
      monto, 
      metodoPago, 
      estado, 
      servicios,
      aplicarIgv,
      montoBase,
      igvCalculado
    } = body

    const prismaClient = getPrismaClient()

    const facturaExistente = await prismaClient.factura.findUnique({
      where: { id },
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

    const huboCambios = 
      (monto && typeof monto === 'string' && !isNaN(parseFloat(monto)) && parseFloat(monto) !== Number(facturaExistente.monto)) ||
      (estado && estado !== facturaExistente.estado) ||
      (idPaciente && idPaciente !== facturaExistente.idPaciente) ||
      (servicios !== undefined)

    if (huboCambios) {
      try {
        const pdfBuffer = await generarPDF(facturaActualizada, {
          servicios: servicios || '',
          aplicarIgv,
          montoBase,
          igvCalculado
        })

        if (facturaExistente.archivoFacturaPdf) {
          const rutaAnterior = extraerRutaDeUrl(facturaExistente.archivoFacturaPdf)
          if (rutaAnterior) {
            await supabase.storage.from('fichas-odontologicas').remove([rutaAnterior])
          }
        }

        const nombreArchivo = `factura-${id}-${Date.now()}.pdf`
        const rutaArchivo = `facturas/${nombreArchivo}`

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

// Ruta para enviar factura por email
export async function POST(request: NextRequest, { params }: { params: Awaited<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await request.json()
    const { emailDestino } = body

    const prismaClient = getPrismaClient()
    
    const factura = await prismaClient.factura.findUnique({
      where: { id },
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

    if (!factura) {
      return NextResponse.json({ error: 'Factura no encontrada' }, { status: 404 })
    }

    if (!factura.archivoFacturaPdf) {
      return NextResponse.json({ error: 'No hay archivo PDF disponible' }, { status: 400 })
    }

    // Descargar el PDF de Supabase
    const response = await fetch(factura.archivoFacturaPdf)
    const pdfBuffer = await response.arrayBuffer()

    // Configurar y enviar el email
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: emailDestino || factura.paciente.email,
      subject: `Factura N° ${factura.id.slice(0, 8).toUpperCase()} - Clínica Dental Sorie`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background-color: #34a853; color: white; padding: 20px; text-align: center;">
            <h1>Clínica Dental Sorie</h1>
            <p>Cuidando tu sonrisa con excelencia</p>
          </div>
          
          <div style="padding: 20px; background-color: #f9f9f9;">
            <h2>Estimado/a ${factura.paciente.nombres} ${factura.paciente.apellidos}</h2>
            
            <p>Adjunto encontrará su factura correspondiente a los servicios dentales realizados en nuestra clínica.</p>
            
            <div style="background-color: white; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <h3>Detalles de la Factura:</h3>
              <ul>
                <li><strong>Número:</strong> ${factura.id.slice(0, 8).toUpperCase()}</li>
                <li><strong>Fecha:</strong> ${new Date(factura.fechaEmision).toLocaleDateString('es-PE')}</li>
                <li><strong>Monto:</strong> S/ ${Number(factura.monto || 0).toFixed(2)}</li>
                <li><strong>Estado:</strong> ${factura.estado}</li>
                ${factura.metodoPago ? `<li><strong>Método de Pago:</strong> ${factura.metodoPago}</li>` : ''}
              </ul>
            </div>
            
            <p>Si tiene alguna consulta sobre esta factura, no dude en contactarnos:</p>
            <ul>
              <li>Teléfono: (01) 234-5678</li>
              <li>Email: info@clinicasorie.com</li>
            </ul>
            
            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; text-align: center; color: #666;">
              <p>Gracias por confiar en nosotros para el cuidado de su salud dental.</p>
              <p><em>Tu sonrisa es nuestra mejor recompensa</em></p>
            </div>
          </div>
        </div>
      `,
      attachments: [
        {
          filename: `factura-${factura.id.slice(0, 8)}.pdf`,
          content: Buffer.from(pdfBuffer)
        }
      ]
    }

    await transporter.sendMail(mailOptions)

    return NextResponse.json({ 
      message: 'Factura enviada por email correctamente',
      emailEnviadoA: emailDestino || factura.paciente.email
    })

  } catch (error) {
    console.error('Error enviando email:', error)
    return NextResponse.json({ 
      error: 'Error enviando email: ' + (error as Error).message 
    }, { status: 500 })
  }
}

function extraerRutaDeUrl(url: string): string | null {
  const match = url.match(/\/storage\/v1\/object\/public\/fichas-odontologicas\/(.+)$/)
  return match ? match[1] : null
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
    } catch {}

    // HEADER
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
      let presupuesto = factura.examenOdontologico.presupuesto || 0
      
      const diagnosticoLines = doc.splitTextToSize(`Diagnóstico: ${diagnostico}`, 160)
      const planLines = doc.splitTextToSize(`Plan: ${planTratamiento}`, 160)
      
      const totalLines = diagnosticoLines.length + planLines.length + 3
      const sectionHeight = totalLines * 5 + 10
      
      doc.setDrawColor(borderColor.r, borderColor.g, borderColor.b)
      doc.rect(20, yPosition - 5, 170, sectionHeight)
      doc.text(diagnosticoLines, 25, yPosition + 5)
      doc.text(planLines, 25, yPosition + 5 + (diagnosticoLines.length * 5) + 5)
      doc.text(`Presupuesto: S/ ${Number(presupuesto).toFixed(2)}`, 25, yPosition + 5 + (diagnosticoLines.length + planLines.length) * 5 + 10)
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

    // Calcular montos
    const montoBase = opciones.montoBase ? parseFloat(opciones.montoBase) : Number(factura.monto) || 0
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
      const isTotal = index === tableData.length - 1
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
    throw error
  }
}