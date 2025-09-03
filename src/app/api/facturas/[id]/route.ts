// // // app/api/facturas/[id]/route.ts (MEJORADO)
// -------------------con singleton
//===============================================================================
// app/api/facturas/[id]/route.ts - MIGRADO A BREVO
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createClient } from '@supabase/supabase-js'
import jsPDF from 'jspdf'
import * as Brevo from '@getbrevo/brevo'
import { Prisma } from '@prisma/client'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)

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

    const facturaExistente = await prisma.factura.findUnique({
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

    const facturaActualizada = await prisma.factura.update({
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
          await prisma.factura.update({
            where: { id },
            data: { archivoFacturaPdf: urlData.publicUrl }
          })
        }
      } catch (pdfError) {
        console.error('Error regenerando PDF:', pdfError)
      }
    }

    const facturaFinal = await prisma.factura.findUnique({
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

    const factura = await prisma.factura.findUnique({ where: { id } })
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

    await prisma.factura.delete({ where: { id } })
    return NextResponse.json({ message: 'Factura eliminada correctamente' })
  } catch (error) {
    console.error('Error eliminando factura:', error)
    return NextResponse.json({ error: 'Error interno del servidor: ' + (error as Error).message }, { status: 500 })
  }
}

// Ruta para enviar factura por email - MIGRADO A BREVO
export async function POST(request: NextRequest, { params }: { params: Awaited<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await request.json()
    const { emailDestino } = body

    const factura = await prisma.factura.findUnique({
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

    // ENVÍO CON BREVO
    const resultadoEmail = await enviarFacturaConBrevo(factura, emailDestino, Buffer.from(pdfBuffer))

    if (resultadoEmail.success) {
      return NextResponse.json({ 
        message: 'Factura enviada por email correctamente',
        emailEnviadoA: emailDestino || factura.paciente.email
      })
    } else {
      return NextResponse.json({ 
        error: resultadoEmail.mensaje 
      }, { status: 500 })
    }

  } catch (error) {
    console.error('Error enviando email:', error)
    return NextResponse.json({ 
      error: 'Error enviando email: ' + (error as Error).message 
    }, { status: 500 })
  }
}

// FUNCIÓN PARA ENVIAR CON BREVO
async function enviarFacturaConBrevo(factura: any, emailDestino: string, pdfBuffer: Buffer) {
  const maxIntentos = 3;
  
  for (let intento = 1; intento <= maxIntentos; intento++) {
    try {
      console.log(`Intento ${intento}/${maxIntentos} enviando factura por email`);

      if (!process.env.BREVO_API_KEY) {
        throw new Error('Clave API de Brevo no configurada');
      }

      const apiInstance = new Brevo.TransactionalEmailsApi();
      apiInstance.setApiKey(
        Brevo.TransactionalEmailsApiApiKeys.apiKey, 
        process.env.BREVO_API_KEY
      );

      const sendSmtpEmail = new Brevo.SendSmtpEmail();
      sendSmtpEmail.sender = { 
        name: 'Clínica Dental Sorie', 
        email: process.env.EMAIL_USER || 'fiorellatah6.2@gmail.com' 
      };
      sendSmtpEmail.to = [{ email: emailDestino || factura.paciente.email }];
      sendSmtpEmail.subject = `Factura N° ${factura.id.slice(0, 8).toUpperCase()} - Clínica Dental Sorie`;
      sendSmtpEmail.htmlContent = `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 650px; margin: 0 auto; background: #ffffff;">
          <!-- Header elegante -->
          <div style="background: linear-gradient(135deg, #1a1a1a 0%, #333333 100%); color: white; padding: 40px 30px; text-align: center;">
            <h1 style="margin: 0; font-size: 28px; font-weight: 300; letter-spacing: 2px;">CLÍNICA DENTAL SORIE</h1>
            <div style="width: 60px; height: 2px; background: white; margin: 15px auto;"></div>
            <p style="margin: 0; font-size: 14px; opacity: 0.9; font-weight: 300;">Cuidando tu sonrisa con excelencia</p>
          </div>
          
          <!-- Contenido principal -->
          <div style="padding: 40px 30px; background: #ffffff;">
            <h2 style="color: #1a1a1a; font-size: 24px; font-weight: 300; margin: 0 0 25px 0;">
              Estimado/a ${factura.paciente.nombres} ${factura.paciente.apellidos}
            </h2>
            
            <p style="font-size: 16px; color: #555555; line-height: 1.7; margin-bottom: 30px;">
              Le adjuntamos su factura correspondiente a los servicios dentales realizados en nuestra clínica.
            </p>
            
            <!-- Tarjeta de detalles -->
            <div style="border: 1px solid #e0e0e0; border-radius: 8px; padding: 30px; margin: 30px 0; background: #fafafa;">
              <h3 style="color: #1a1a1a; font-size: 18px; font-weight: 400; margin: 0 0 20px 0; border-bottom: 1px solid #e0e0e0; padding-bottom: 10px;">
                Detalles de la Factura
              </h3>
              <div style="display: grid; gap: 12px;">
                <div style="display: flex; justify-content: space-between; align-items: center; padding: 8px 0;">
                  <span style="color: #666666; font-weight: 400;">Número:</span>
                  <span style="color: #1a1a1a; font-weight: 500;">${factura.id.slice(0, 8).toUpperCase()}</span>
                </div>
                <div style="display: flex; justify-content: space-between; align-items: center; padding: 8px 0;">
                  <span style="color: #666666; font-weight: 400;">Fecha:</span>
                  <span style="color: #1a1a1a; font-weight: 500;">${new Date(factura.fechaEmision).toLocaleDateString('es-PE')}</span>
                </div>
                <div style="display: flex; justify-content: space-between; align-items: center; padding: 8px 0; border-top: 1px solid #e0e0e0; margin-top: 10px;">
                  <span style="color: #666666; font-weight: 400;">Monto Total:</span>
                  <span style="color: #1a1a1a; font-weight: 600; font-size: 18px;">S/ ${Number(factura.monto || 0).toFixed(2)}</span>
                </div>
                <div style="display: flex; justify-content: space-between; align-items: center; padding: 8px 0;">
                  <span style="color: #666666; font-weight: 400;">Estado:</span>
                  <span style="color: ${factura.estado === 'COMPLETADO' ? '#059669' : '#dc2626'}; font-weight: 500;">${factura.estado}</span>
                </div>
                ${factura.metodoPago ? `
                <div style="display: flex; justify-content: space-between; align-items: center; padding: 8px 0;">
                  <span style="color: #666666; font-weight: 400;">Método de Pago:</span>
                  <span style="color: #1a1a1a; font-weight: 500;">${factura.metodoPago}</span>
                </div>` : ''}
              </div>
            </div>
            
            <!-- Información de contacto -->
            <div style="background: #f8f9fa; border-radius: 8px; padding: 25px; margin: 30px 0;">
              <h4 style="color: #1a1a1a; font-size: 16px; font-weight: 500; margin: 0 0 15px 0;">
                Información de Contacto
              </h4>
              <div style="font-size: 14px; color: #555555; line-height: 1.6;">
                <div style="margin-bottom: 8px;">📞 Teléfono: (01) 234-5678</div>
                <div style="margin-bottom: 8px;">✉️ Email: info@clinicasorie.com</div>
                <div>📍 Av. Principal 123, Lima - Perú</div>
              </div>
            </div>
            
            <div style="text-align: center; margin: 40px 0 20px 0;">
              <div style="border: 1px solid #e0e0e0; border-radius: 6px; padding: 20px; background: #ffffff; display: inline-block;">
                <p style="margin: 0; color: #1a1a1a; font-weight: 500;">
                  Gracias por confiar en nosotros para el cuidado de su salud dental
                </p>
                <p style="margin: 10px 0 0 0; color: #666666; font-style: italic; font-size: 14px;">
                  "Tu sonrisa es nuestra mejor recompensa"
                </p>
              </div>
            </div>
          </div>
          
          <!-- Footer elegante -->
          <div style="background: #1a1a1a; color: #cccccc; padding: 25px 30px; text-align: center; font-size: 12px;">
            <p style="margin: 0 0 8px 0;">CLÍNICA DENTAL SORIE</p>
            <p style="margin: 0; opacity: 0.8;">Este es un mensaje automático, por favor no responda a este correo</p>
          </div>
        </div>
      `;
      
      // Convertir el buffer a base64 para el attachment
      const pdfBase64 = pdfBuffer.toString('base64');
      sendSmtpEmail.attachment = [{
        name: `factura-${factura.id.slice(0, 8)}.pdf`,
        content: pdfBase64
      }];

      console.log('Enviando factura con Brevo...');
      
      await Promise.race([
        apiInstance.sendTransacEmail(sendSmtpEmail),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Timeout enviando email')), 60000)
        )
      ]);

      console.log(`Factura enviada exitosamente en intento ${intento}`);
      return {
        success: true,
        mensaje: 'Factura enviada correctamente con Brevo'
      };

    } catch (error) {
      console.error(`Error en intento ${intento}:`, error);

      if (intento === maxIntentos) {
        return {
          success: false,
          mensaje: `Error al enviar factura tras ${maxIntentos} intentos: ${error instanceof Error ? error.message : String(error)}`
        };
      }

      await new Promise(resolve => setTimeout(resolve, 2000 * intento));
    }
  }

  return {
    success: false,
    mensaje: 'Error inesperado en envío de factura'
  };
}

function extraerRutaDeUrl(url: string): string | null {
  const match = url.match(/\/storage\/v1\/object\/public\/fichas-odontologicas\/(.+)$/)
  return match ? match[1] : null
}
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