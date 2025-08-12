// // app/api/facturas/enviar/route.ts
// import { NextRequest, NextResponse } from 'next/server'
// import { PrismaClient } from '@prisma/client'
// import nodemailer from 'nodemailer'

// const prisma = new PrismaClient()

// export async function POST(request: NextRequest) {
//   try {
//     const body = await request.json()
//     const { facturaId, metodo, destinatario, mensaje } = body

//     // Validaciones básicas
//     if (!facturaId || !metodo || !destinatario) {
//       return NextResponse.json({ 
//         error: 'Faltan datos requeridos: facturaId, metodo y destinatario' 
//       }, { status: 400 })
//     }

//     // Obtener datos completos de la factura
//     const factura = await prisma.factura.findUnique({
//       where: { id: facturaId },
//       include: {
//         paciente: {
//           select: { 
//             nombres: true, 
//             apellidos: true, 
//             dni: true,
//             email: true,
//             telefono: true
//           }
//         },
//         examenOdontologico: {
//           include: { planTratamiento: true }
//         },
//         evolucionPaciente: {
//           include: { planTratamiento: true }
//         }
//       }
//     })

//     if (!factura) {
//       return NextResponse.json({ error: 'Factura no encontrada' }, { status: 404 })
//     }

//     if (!factura.archivoFacturaPdf) {
//       return NextResponse.json({ 
//         error: 'La factura no tiene PDF generado' 
//       }, { status: 400 })
//     }

//     let resultado = null

//     switch (metodo.toLowerCase()) {
//       case 'whatsapp':
//         resultado = await enviarPorWhatsApp(factura, destinatario, mensaje)
//         break
//       case 'email':
//         resultado = await enviarPorEmail(factura, destinatario, mensaje)
//         break
//       default:
//         return NextResponse.json({ 
//           error: 'Método no válido. Use "whatsapp" o "email"' 
//         }, { status: 400 })
//     }

//     if (resultado.success) {
//       return NextResponse.json({ 
//         success: true, 
//         message: `Factura enviada exitosamente por ${metodo}`,
//         detalles: resultado.detalles
//       })
//     } else {
//       return NextResponse.json({ 
//         success: false, 
//         error: resultado.error 
//       }, { status: 500 })
//     }

//   } catch (error) {
//     console.error('Error enviando factura:', error)
//     return NextResponse.json({ 
//       error: 'Error interno del servidor' 
//     }, { status: 500 })
//   }
// }

// async function enviarPorWhatsApp(factura: any, telefono: string, mensajePersonalizado?: string) {
//   try {
//     // REUTILIZAR tu servicio WhatsApp existente
//     const { WhatsAppManager } = await import('../../../../lib/whatsapp-manager')
    
//     const whatsappManager = WhatsAppManager.getInstance()
    
//     if (!whatsappManager.isReady()) {
//       throw new Error('Servicio WhatsApp no está disponible')
//     }

//     // Limpiar número de teléfono (formato internacional)
//     let numeroLimpio = telefono.replace(/\D/g, '')
//     if (!numeroLimpio.startsWith('51')) {
//       numeroLimpio = '51' + numeroLimpio
//     }
//     numeroLimpio += '@s.whatsapp.net'

//     const mensajePredeterminado = `🦷 *CLÍNICA DENTAL SORIE* 🦷

// ¡Hola ${factura.paciente.nombres}!

// Adjuntamos la factura correspondiente a tu tratamiento dental:

// 📋 *Detalles de la Factura:*
// • Número: ${factura.id.slice(0, 8).toUpperCase()}
// • Fecha: ${new Date(factura.fechaEmision).toLocaleDateString('es-PE')}
// • Monto: S/ ${Number(factura.monto).toFixed(2)}
// • Estado: ${factura.estado}

// ${mensajePersonalizado || '¡Gracias por confiar en nosotros! 😊'}

// ---
// 📞 Contacto: (01) 234-5678
// 📧 Email: info@clinicasorie.com
// 📍 Av. Principal 123, Lima`

//     // Enviar mensaje de texto
//     await whatsappManager.sendMessage(numeroLimpio, mensajePredeterminado)

//     // Intentar enviar el PDF
//     try {
//       const response = await fetch(factura.archivoFacturaPdf)
//       if (response.ok) {
//         const pdfBuffer = await response.arrayBuffer()
//         await whatsappManager.sendDocument(
//           numeroLimpio, 
//           Buffer.from(pdfBuffer), 
//           `Factura_${factura.id.slice(0, 8)}.pdf`,
//           'application/pdf'
//         )
//       }
//     } catch (pdfError) {
//       console.warn('No se pudo enviar el PDF, solo se envió el texto:', pdfError)
//     }

//     return {
//       success: true,
//       detalles: {
//         destino: telefono,
//         mensaje: 'Mensaje y PDF enviados exitosamente'
//       }
//     }

//   } catch (error) {
//     console.error('Error enviando por WhatsApp:', error)
//     return {
//       success: false,
//       error: `Error WhatsApp: ${error.message}`
//     }
//   }
// }

// async function enviarPorEmail(factura: any, email: string, mensajePersonalizado?: string) {
//   try {
//     // Configurar transporter de nodemailer
//     const transporter = nodemailer.createTransport({
//       service: 'gmail', // o tu servicio preferido
//       auth: {
//         user: process.env.EMAIL_USER, // Configurar en .env
//         pass: process.env.EMAIL_PASS  // Configurar en .env
//       }
//     })

//     const mensajePredeterminado = `
//     <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
//       <div style="background-color: #34a853; padding: 20px; text-align: center;">
//         <h1 style="color: white; margin: 0;">🦷 CLÍNICA DENTAL SORIE</h1>
//         <p style="color: white; margin: 5px 0;">Cuidando tu sonrisa con excelencia</p>
//       </div>
      
//       <div style="padding: 20px; background-color: #f9f9f9;">
//         <h2 style="color: #34a853;">¡Hola ${factura.paciente.nombres}!</h2>
        
//         <p>Adjuntamos la factura correspondiente a tu tratamiento dental.</p>
        
//         <div style="background-color: white; padding: 15px; border-radius: 5px; margin: 15px 0;">
//           <h3 style="color: #007bbf; margin-top: 0;">📋 Detalles de la Factura</h3>
//           <ul style="list-style: none; padding: 0;">
//             <li><strong>Número:</strong> ${factura.id.slice(0, 8).toUpperCase()}</li>
//             <li><strong>Fecha:</strong> ${new Date(factura.fechaEmision).toLocaleDateString('es-PE')}</li>
//             <li><strong>Monto:</strong> S/ ${Number(factura.monto).toFixed(2)}</li>
//             <li><strong>Estado:</strong> ${factura.estado}</li>
//             <li><strong>Método de Pago:</strong> ${factura.metodoPago || 'Por definir'}</li>
//           </ul>
//         </div>
        
//         ${mensajePersonalizado ? `<div style="background-color: #e8f5e8; padding: 15px; border-radius: 5px; margin: 15px 0;">
//           <p><em>${mensajePersonalizado}</em></p>
//         </div>` : ''}
        
//         <p style="color: #34a853; font-weight: bold;">¡Gracias por confiar en nosotros! 😊</p>
//       </div>
      
//       <div style="background-color: #333; color: white; padding: 15px; text-align: center; font-size: 12px;">
//         <p>📞 Contacto: (01) 234-5678 | 📧 Email: info@clinicasorie.com</p>
//         <p>📍 Av. Principal 123, Lima - Perú</p>
//         <p style="margin: 5px 0;">Horarios: Lunes a Viernes 8:00 AM - 8:00 PM | Sábados 8:00 AM - 2:00 PM</p>
//       </div>
//     </div>
//     `

//     // Descargar PDF para adjuntar
//     let adjuntos = []
//     try {
//       const response = await fetch(factura.archivoFacturaPdf)
//       if (response.ok) {
//         const pdfBuffer = await response.arrayBuffer()
//         adjuntos.push({
//           filename: `Factura_${factura.id.slice(0, 8)}.pdf`,
//           content: Buffer.from(pdfBuffer),
//           contentType: 'application/pdf'
//         })
//       }
//     } catch (pdfError) {
//       console.warn('No se pudo adjuntar el PDF:', pdfError)
//     }

//     const mailOptions = {
//       from: `"Clínica Dental Sorie" <${process.env.EMAIL_USER}>`,
//       to: email,
//       subject: `Factura N° ${factura.id.slice(0, 8).toUpperCase()} - Clínica Dental Sorie`,
//       html: mensajePredeterminado,
//       attachments: adjuntos
//     }

//     const info = await transporter.sendMail(mailOptions)

//     return {
//       success: true,
//       detalles: {
//         destino: email,
//         messageId: info.messageId,
//         mensaje: 'Email enviado exitosamente'
//       }
//     }

//   } catch (error) {
//     console.error('Error enviando email:', error)
//     return {
//       success: false,
//       error: `Error Email: ${error.message}`
//     }
//   }
// }