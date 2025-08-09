

// //----------------------------------------------
// // app/api/citas/recordatorios/route.ts

// import { NextRequest, NextResponse } from 'next/server'
// import { PrismaClient } from "@prisma/client"
// import { auth } from '@clerk/nextjs/server'
// import nodemailer from 'nodemailer'

// const prisma = new PrismaClient()

// // POST - Enviar recordatorios automáticos
// export async function POST(request: NextRequest) {
//   try {
//     const authData = await auth()
//     const userId = authData?.userId
//     if (!userId) {
//       return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
//     }

//     // Calcular fecha de mañana (24 horas desde ahora)
//     const ahora = new Date()
//     const manana = new Date()
//     manana.setDate(ahora.getDate() + 1)
    
//     // CORREGIDO: Usar UTC para evitar problemas de zona horaria
//     const inicioDia = new Date(manana.getFullYear(), manana.getMonth(), manana.getDate(), 0, 0, 0)
//     const finDia = new Date(manana.getFullYear(), manana.getMonth(), manana.getDate(), 23, 59, 59)

//     console.log(`Buscando citas para: ${manana.toLocaleDateString('es-PE')}`)
//     console.log(`Rango: ${inicioDia} - ${finDia}`)

//     // CORREGIDO: Buscar citas para mañana
//     const citasManana = await prisma.cita.findMany({
//       where: {
//         fechaHora: {
//           gte: inicioDia,
//           lte: finDia
//         },
//         estado: {
//           in: ['SOLICITADA', 'CONFIRMADA']
//         }
//       },
//       include: {
//         paciente: {
//           select: {
//             id: true,
//             nombres: true,
//             apellidos: true,
//             dni: true,
//             telefono: true,
//             email: true
//           }
//         }
//       }
//     })

//     console.log(`Encontradas ${citasManana.length} citas para mañana`)

//     let recordatoriosEnviados = 0
//     const resultados = []

//     for (const cita of citasManana) {
//       try {
//         // Verificar si ya se envió recordatorio para esta cita hoy
//         const recordatorioExistente = await prisma.recordatorio.findFirst({
//           where: {
//             idCita: cita.id,
//             fechaEnvio: {
//               gte: new Date(ahora.setHours(0, 0, 0, 0)),
//               lte: new Date(ahora.setHours(23, 59, 59, 999))
//             }
//           }
//         })

//         if (recordatorioExistente) {
//           resultados.push({
//             paciente: `${cita.paciente.nombres} ${cita.paciente.apellidos}`,
//             estado: 'YA_ENVIADO',
//             fecha: cita.fechaHora,
//             mensaje: 'Recordatorio ya enviado hoy'
//           })
//           continue
//         }

//         let recordatoriosEnviadosPaciente = 0

//         // Determinar teléfono y email a usar (prioridad: cita -> paciente)
//         const telefonoFinal = cita.telefonoContacto || cita.paciente.telefono
//         const emailFinal = cita.emailContacto || cita.paciente.email

//         // Enviar recordatorio por WhatsApp (si tiene teléfono)
//         if (telefonoFinal) {
//           const resultadoWhatsApp = await enviarWhatsApp(cita, telefonoFinal)
          
//           await prisma.recordatorio.create({
//             data: {
//               idCita: cita.id,
//               fechaEnvio: new Date(),
//               medio: 'WHATSAPP',
//               estado: resultadoWhatsApp.success ? 'ENVIADO' : 'FALLIDO'
//             }
//           })

//           if (resultadoWhatsApp.success) {
//             recordatoriosEnviadosPaciente++
//           }

//           resultados.push({
//             paciente: `${cita.paciente.nombres} ${cita.paciente.apellidos}`,
//             estado: resultadoWhatsApp.success ? 'ENVIADO' : 'FALLIDO',
//             medio: 'WHATSAPP',
//             telefono: telefonoFinal,
//             fecha: cita.fechaHora,
//             motivo: cita.motivo,
//             mensaje: resultadoWhatsApp.mensaje
//           })
//         }

//         // Enviar recordatorio por Email (si tiene email)
//         if (emailFinal) {
//           const resultadoEmail = await enviarEmail(cita, emailFinal)
          
//           await prisma.recordatorio.create({
//             data: {
//               idCita: cita.id,
//               fechaEnvio: new Date(),
//               medio: 'EMAIL',
//               estado: resultadoEmail.success ? 'ENVIADO' : 'FALLIDO'
//             }
//           })

//           if (resultadoEmail.success) {
//             recordatoriosEnviadosPaciente++
//           }

//           resultados.push({
//             paciente: `${cita.paciente.nombres} ${cita.paciente.apellidos}`,
//             estado: resultadoEmail.success ? 'ENVIADO' : 'FALLIDO',
//             medio: 'EMAIL',
//             email: emailFinal,
//             fecha: cita.fechaHora,
//             motivo: cita.motivo,
//             mensaje: resultadoEmail.mensaje
//           })
//         }

//         // Si no tiene teléfono ni email
//         if (!telefonoFinal && !emailFinal) {
//           resultados.push({
//             paciente: `${cita.paciente.nombres} ${cita.paciente.apellidos}`,
//             estado: 'SIN_CONTACTO',
//             fecha: cita.fechaHora,
//             mensaje: 'Sin teléfono ni email en cita ni perfil de paciente'
//           })
//         }

//         recordatoriosEnviados += recordatoriosEnviadosPaciente

//       } catch (error) {
//         console.error(`Error al enviar recordatorio para cita ${cita.id}:`, error)
//         resultados.push({
//           paciente: `${cita.paciente.nombres} ${cita.paciente.apellidos}`,
//           estado: 'ERROR',
//           fecha: cita.fechaHora,
//           mensaje: 'Error al procesar recordatorio'
//         })
//       }
//     }

//     return NextResponse.json({
//       success: true,
//       message: `Proceso de recordatorios completado`,
//       enviados: recordatoriosEnviados,
//       totalCitas: citasManana.length,
//       detalles: resultados
//     })
//   } catch (error) {
//     console.error('Error al enviar recordatorios:', error)
//     return NextResponse.json(
//       { success: false, error: 'Error interno del servidor' },
//       { status: 500 }
//     )
//   } finally {
//     await prisma.$disconnect()
//   }
// }

// // REAL WhatsApp usando Twilio (reemplaza con tus credenciales)
// async function enviarWhatsApp(cita: any, telefono: string) {
//   try {
//     const fechaCita = new Date(cita.fechaHora)
//     const fechaFormateada = fechaCita.toLocaleDateString('es-PE', {
//       weekday: 'long',
//       year: 'numeric',
//       month: 'long',
//       day: 'numeric'
//     })
//     const horaFormateada = fechaCita.toLocaleTimeString('es-PE', {
//       hour: '2-digit',
//       minute: '2-digit'
//     })

//     const mensaje = `¡Hola ${cita.paciente.nombres}! 👋

// Te recordamos que tienes una cita programada para MAÑANA:

// 📅 Fecha: ${fechaFormateada}
// 🕐 Hora: ${horaFormateada}
// 🏥 Clínica: SONRISOFT - Clínica Dental
// 📋 Motivo: ${cita.motivo || 'Consulta general'}

// Por favor, confirma tu asistencia o comunícate si necesitas reprogramar.

// ¡Te esperamos! 😊`

//     console.log(`WhatsApp para ${telefono}:`, mensaje)

//     // OPCIÓN 1: Usando Twilio (descomenta y configura)
//     /*
//     const accountSid = process.env.TWILIO_ACCOUNT_SID
//     const authToken = process.env.TWILIO_AUTH_TOKEN
//     const client = require('twilio')(accountSid, authToken)

//     const result = await client.messages.create({
//       body: mensaje,
//       from: 'whatsapp:+14155238886', // Número de Twilio
//       to: `whatsapp:+51${telefono.replace(/\D/g, '')}`
//     })

//     return {
//       success: true,
//       mensaje: 'WhatsApp enviado correctamente',
//       messageId: result.sid
//     }
//     */

//     // OPCIÓN 2: Crear enlace de WhatsApp para envío manual
//     const telefonoLimpio = telefono.replace(/\D/g, '')
//     const whatsappUrl = `https://wa.me/51${telefonoLimpio}?text=${encodeURIComponent(mensaje)}`
    
//     console.log(`URL de WhatsApp: ${whatsappUrl}`)
    
//     // Por ahora simulamos éxito (cambia por implementación real)
//     return {
//       success: true,
//       mensaje: 'Enlace de WhatsApp generado correctamente',
//       url: whatsappUrl
//     }

//   } catch (error) {
//     console.error('Error WhatsApp:', error)
//     return {
//       success: false,
//       mensaje: 'Error al enviar WhatsApp'
//     }
//   }
// }

// // REAL Email usando Nodemailer
// async function enviarEmail(cita: any, email: string) {
//   try {
//     const fechaCita = new Date(cita.fechaHora)
//     const fechaFormateada = fechaCita.toLocaleDateString('es-PE', {
//       weekday: 'long',
//       year: 'numeric',
//       month: 'long',
//       day: 'numeric'
//     })
//     const horaFormateada = fechaCita.toLocaleTimeString('es-PE', {
//       hour: '2-digit',
//       minute: '2-digit'
//     })

//     // Configurar transportador
//     const transporter = nodemailer.createTransport({
//       service: 'gmail',
//       auth: {
//         user: process.env.EMAIL_USER,
//         pass: process.env.EMAIL_PASS
//       }
//     })

//     const mailOptions = {
//       from: process.env.EMAIL_USER,
//       to: email,
//       subject: '🦷 Recordatorio de Cita - SONRISOFT Clínica Dental',
//       html: `
//         <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
//           <h2 style="color: #2563eb; text-align: center;">📅 Recordatorio de Cita</h2>

//           <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
//             <h3 style="color: #1f2937; margin-bottom: 15px;">¡Hola ${cita.paciente.nombres}! 👋</h3>
            
//             <p style="margin: 10px 0;">Te recordamos que tienes una cita programada para <strong>MAÑANA</strong>:</p>
            
//             <div style="background-color: white; padding: 15px; border-radius: 5px; border-left: 4px solid #2563eb; margin: 15px 0;">
//               <p style="margin: 5px 0;"><strong>📅 Fecha:</strong> ${fechaFormateada}</p>
//               <p style="margin: 5px 0;"><strong>🕐 Hora:</strong> ${horaFormateada}</p>
//               <p style="margin: 5px 0;"><strong>🏥 Clínica:</strong> SONRISOFT - Clínica Dental</p>
//               <p style="margin: 5px 0;"><strong>📋 Motivo:</strong> ${cita.motivo || 'Consulta general'}</p>
//             </div>
            
//             <p style="margin: 15px 0;">Por favor, confirma tu asistencia o comunícate si necesitas reprogramar.</p>
//             <p style="margin: 10px 0; font-weight: bold; color: #2563eb;">¡Te esperamos! 😊</p>
//           </div>

//           <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">

//           <div style="text-align: center;">
//             <p style="color: #6b7280; font-size: 12px; margin: 0;">
//               SONRISOFT - Clínica Dental<br>
//               Este es un mensaje automático, por favor no responda a este correo.
//             </p>
//           </div>
//         </div>
//       `
//     }

//     await transporter.sendMail(mailOptions)
    
//     console.log(`Email enviado a: ${email}`)
    
//     return {
//       success: true,
//       mensaje: 'Email enviado correctamente'
//     }
    
//   } catch (error) {
//     console.error('Error Email:', error)
//     return {
//       success: false,
//       mensaje: 'Error al enviar email'
//     }
//   }
// }

// // GET - Obtener historial de recordatorios enviados
// export async function GET(request: NextRequest) {
//   try {
//     const authData = await auth()
//     const userId = authData?.userId
//     if (!userId) {
//       return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
//     }

//     const { searchParams } = new URL(request.url)
//     const fecha = searchParams.get('fecha')

//     let whereClause = {}
    
//     if (fecha) {
//       const fechaBuscada = new Date(fecha)
//       const inicioDia = new Date(fechaBuscada.setHours(0, 0, 0, 0))
//       const finDia = new Date(fechaBuscada.setHours(23, 59, 59, 999))
      
//       whereClause = {
//         fechaEnvio: {
//           gte: inicioDia,
//           lte: finDia
//         }
//       }
//     }

//     const recordatorios = await prisma.recordatorio.findMany({
//       where: whereClause,
//       include: {
//         cita: {
//           include: {
//             paciente: {
//               select: {
//                 nombres: true,
//                 apellidos: true,
//                 telefono: true,
//                 email: true
//               }
//             }
//           }
//         }
//       },
//       orderBy: {
//         fechaEnvio: 'desc'
//       }
//     })

//     return NextResponse.json({
//       success: true,
//       recordatorios: recordatorios.map(r => ({
//         id: r.id,
//         fechaEnvio: r.fechaEnvio,
//         medio: r.medio,
//         estado: r.estado,
//         paciente: `${r.cita.paciente.nombres} ${r.cita.paciente.apellidos}`,
//         fechaCita: r.cita.fechaHora,
//         motivo: r.cita.motivo
//       }))
//     })
    
//   } catch (error) {
//     console.error('Error al obtener recordatorios:', error)
//     return NextResponse.json(
//       { success: false, error: 'Error interno del servidor' },
//       { status: 500 }
//     )
//   } finally {
//     await prisma.$disconnect()
//   }
// }

//NUEVO

// app/api/citas/recordatorios/route.ts
// // app/api/citas/recordatorios/route.ts
// import { NextRequest, NextResponse } from 'next/server'
// import { PrismaClient } from "@prisma/client"
// import { auth } from '@clerk/nextjs/server'
// import nodemailer from 'nodemailer'
// import { getWhatsAppService } from '../../../../lib/whatsapp-service'

// const prisma = new PrismaClient()

// // POST - Enviar recordatorios automáticos
// export async function POST(request: NextRequest) {
//   try {
//     const authData = await auth()
//     const userId = authData?.userId
//     if (!userId) {
//       return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
//     }

//     // Calcular fecha de mañana
//     const ahora = new Date()
//     const manana = new Date()
//     manana.setDate(ahora.getDate() + 1)
    
//     const inicioDia = new Date(manana.getFullYear(), manana.getMonth(), manana.getDate(), 0, 0, 0)
//     const finDia = new Date(manana.getFullYear(), manana.getMonth(), manana.getDate(), 23, 59, 59)

//     console.log(`Buscando citas para: ${manana.toLocaleDateString('es-PE')}`)

//     // Buscar citas para mañana
//     const citasManana = await prisma.cita.findMany({
//       where: {
//         fechaHora: {
//           gte: inicioDia,
//           lte: finDia
//         },
//         estado: {
//           in: ['SOLICITADA', 'CONFIRMADA']
//         }
//       },
//       include: {
//         paciente: {
//           select: {
//             id: true,
//             nombres: true,
//             apellidos: true,
//             dni: true,
//             telefono: true,
//             email: true
//           }
//         }
//       }
//     })

//     console.log(`Encontradas ${citasManana.length} citas para mañana`)

//     let recordatoriosEnviados = 0
//     const resultados = []

//     // Inicializar WhatsApp Service
//     const whatsappService = getWhatsAppService()

//     for (const cita of citasManana) {
//       try {
//         // Verificar si ya se envió recordatorio hoy
//         const recordatorioExistente = await prisma.recordatorio.findFirst({
//           where: {
//             idCita: cita.id,
//             fechaEnvio: {
//               gte: new Date(ahora.setHours(0, 0, 0, 0)),
//               lte: new Date(ahora.setHours(23, 59, 59, 999))
//             }
//           }
//         })

//         if (recordatorioExistente) {
//           resultados.push({
//             paciente: `${cita.paciente.nombres} ${cita.paciente.apellidos}`,
//             estado: 'YA_ENVIADO',
//             fecha: cita.fechaHora,
//             mensaje: 'Recordatorio ya enviado hoy'
//           })
//           continue
//         }

//         let recordatoriosEnviadosPaciente = 0
//         const telefonoFinal = cita.telefonoContacto || cita.paciente.telefono
//         const emailFinal = cita.emailContacto || cita.paciente.email

//         // 🚀 ENVIAR WHATSAPP CON BAILEYS
//         if (telefonoFinal) {
//           const resultadoWhatsApp = await enviarWhatsAppBaileys(cita, telefonoFinal, whatsappService)
          
//           await prisma.recordatorio.create({
//             data: {
//               idCita: cita.id,
//               fechaEnvio: new Date(),
//               medio: 'WHATSAPP',
//               estado: resultadoWhatsApp.success ? 'ENVIADO' : 'FALLIDO'
//             }
//           })

//           if (resultadoWhatsApp.success) {
//             recordatoriosEnviadosPaciente++
//           }

//           resultados.push({
//             paciente: `${cita.paciente.nombres} ${cita.paciente.apellidos}`,
//             estado: resultadoWhatsApp.success ? 'ENVIADO' : 'FALLIDO',
//             medio: 'WHATSAPP',
//             telefono: telefonoFinal,
//             fecha: cita.fechaHora,
//             motivo: cita.motivo,
//             mensaje: resultadoWhatsApp.mensaje,
//             messageId: resultadoWhatsApp.messageId
//           })
//         }

//         // Enviar Email
//         if (emailFinal) {
//           const resultadoEmail = await enviarEmail(cita, emailFinal)
          
//           await prisma.recordatorio.create({
//             data: {
//               idCita: cita.id,
//               fechaEnvio: new Date(),
//               medio: 'EMAIL',
//               estado: resultadoEmail.success ? 'ENVIADO' : 'FALLIDO'
//             }
//           })

//           if (resultadoEmail.success) {
//             recordatoriosEnviadosPaciente++
//           }

//           resultados.push({
//             paciente: `${cita.paciente.nombres} ${cita.paciente.apellidos}`,
//             estado: resultadoEmail.success ? 'ENVIADO' : 'FALLIDO',
//             medio: 'EMAIL',
//             email: emailFinal,
//             fecha: cita.fechaHora,
//             motivo: cita.motivo,
//             mensaje: resultadoEmail.mensaje
//           })
//         }

//         if (!telefonoFinal && !emailFinal) {
//           resultados.push({
//             paciente: `${cita.paciente.nombres} ${cita.paciente.apellidos}`,
//             estado: 'SIN_CONTACTO',
//             fecha: cita.fechaHora,
//             mensaje: 'Sin teléfono ni email disponible'
//           })
//         }

//         recordatoriosEnviados += recordatoriosEnviadosPaciente

//       } catch (error) {
//         console.error(`Error al enviar recordatorio para cita ${cita.id}:`, error)
//         resultados.push({
//           paciente: `${cita.paciente.nombres} ${cita.paciente.apellidos}`,
//           estado: 'ERROR',
//           fecha: cita.fechaHora,
//           mensaje: 'Error al procesar recordatorio'
//         })
//       }
//     }

//     return NextResponse.json({
//       success: true,
//       message: `Proceso de recordatorios completado`,
//       enviados: recordatoriosEnviados,
//       totalCitas: citasManana.length,
//       detalles: resultados
//     })
//   } catch (error) {
//     console.error('Error al enviar recordatorios:', error)
//     return NextResponse.json(
//       { success: false, error: 'Error interno del servidor' },
//       { status: 500 }
//     )
//   } finally {
//     await prisma.$disconnect()
//   }
// }

// // 🚀 NUEVA FUNCIÓN: WhatsApp con Baileys
// async function enviarWhatsAppBaileys(cita: any, telefono: string, whatsappService: any) {
//   try {
//     const fechaCita = new Date(cita.fechaHora)
//     const fechaFormateada = fechaCita.toLocaleDateString('es-PE', {
//       weekday: 'long',
//       year: 'numeric',
//       month: 'long',
//       day: 'numeric'
//     })
//     const horaFormateada = fechaCita.toLocaleTimeString('es-PE', {
//       hour: '2-digit',
//       minute: '2-digit'
//     })

//     const mensaje = `¡Hola ${cita.paciente.nombres}! 👋

// Te recordamos que tienes una cita programada para *MAÑANA*:

// 📅 *Fecha:* ${fechaFormateada}
// 🕐 *Hora:* ${horaFormateada}
// 🏥 *Clínica:* SONRISOFT - Clínica Dental
// 📋 *Motivo:* ${cita.motivo || 'Consulta general'}

// Por favor, confirma tu asistencia o comunícate si necesitas reprogramar.

// ¡Te esperamos! 😊`

//     // Limpiar número de teléfono
//     const telefonoLimpio = telefono.replace(/\D/g, '')
    
//     // Verificar si WhatsApp está conectado
//     if (!whatsappService.isReady()) {
//       return {
//         success: false,
//         mensaje: 'WhatsApp no está conectado. Escanea el código QR primero.'
//       }
//     }

//     // Enviar mensaje usando Baileys
//     const result = await whatsappService.sendMessage({
//       to: telefonoLimpio,
//       message: mensaje
//     })

//     if (result.success) {
//       console.log(`✅ WhatsApp enviado exitosamente a ${telefono}`)
//       return {
//         success: true,
//         mensaje: 'WhatsApp enviado correctamente',
//         messageId: result.messageId
//       }
//     } else {
//       console.error(`❌ Error enviando WhatsApp a ${telefono}:`, result.error)
//       return {
//         success: false,
//         mensaje: `Error: ${result.error}`
//       }
//     }

//   } catch (error) {
//     console.error('Error en enviarWhatsAppBaileys:', error)
//     return {
//       success: false,
//       mensaje: 'Error al enviar mensaje de WhatsApp'
//     }
//   }
// }

// // Función de Email (mantener igual)
// async function enviarEmail(cita: any, email: string) {
//   try {
//     const fechaCita = new Date(cita.fechaHora)
//     const fechaFormateada = fechaCita.toLocaleDateString('es-PE', {
//       weekday: 'long',
//       year: 'numeric',
//       month: 'long',
//       day: 'numeric'
//     })
//     const horaFormateada = fechaCita.toLocaleTimeString('es-PE', {
//       hour: '2-digit',
//       minute: '2-digit'
//     })

//     const transporter = nodemailer.createTransport({
//       service: 'gmail',
//       auth: {
//         user: process.env.EMAIL_USER,
//         pass: process.env.EMAIL_PASS
//       }
//     })

//     const mailOptions = {
//       from: process.env.EMAIL_USER,
//       to: email,
//       subject: '🦷 Recordatorio de Cita - SONRISOFT Clínica Dental',
//       html: `
//         <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
//           <h2 style="color: #2563eb; text-align: center;">📅 Recordatorio de Cita</h2>
//           <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
//             <h3 style="color: #1f2937; margin-bottom: 15px;">¡Hola ${cita.paciente.nombres}! 👋</h3>
//             <p style="margin: 10px 0;">Te recordamos que tienes una cita programada para <strong>MAÑANA</strong>:</p>
//             <div style="background-color: white; padding: 15px; border-radius: 5px; border-left: 4px solid #2563eb; margin: 15px 0;">
//               <p style="margin: 5px 0;"><strong>📅 Fecha:</strong> ${fechaFormateada}</p>
//               <p style="margin: 5px 0;"><strong>🕐 Hora:</strong> ${horaFormateada}</p>
//               <p style="margin: 5px 0;"><strong>🏥 Clínica:</strong> SONRISOFT - Clínica Dental</p>
//               <p style="margin: 5px 0;"><strong>📋 Motivo:</strong> ${cita.motivo || 'Consulta general'}</p>
//             </div>
//             <p style="margin: 15px 0;">Por favor, confirma tu asistencia o comunícate si necesitas reprogramar.</p>
//             <p style="margin: 10px 0; font-weight: bold; color: #2563eb;">¡Te esperamos! 😊</p>
//           </div>
//           <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
//           <div style="text-align: center;">
//             <p style="color: #6b7280; font-size: 12px; margin: 0;">
//               SONRISOFT - Clínica Dental<br>
//               Este es un mensaje automático, por favor no responda a este correo.
//             </p>
//           </div>
//         </div>
//       `
//     }

//     await transporter.sendMail(mailOptions)
//     console.log(`✅ Email enviado a: ${email}`)
    
//     return {
//       success: true,
//       mensaje: 'Email enviado correctamente'
//     }
    
//   } catch (error) {
//     console.error('Error Email:', error)
//     return {
//       success: false,
//       mensaje: 'Error al enviar email'
//     }
//   }
// }

// // GET - Estado de WhatsApp
// export async function GET() {
//   try {
//     const whatsappService = getWhatsAppService()
//     const user = await whatsappService.getConnectedUser()
    
//     return NextResponse.json({
//       success: true,
//       connected: whatsappService.isReady(),
//       user: user
//     })
//   } catch (error) {
//     return NextResponse.json({
//       success: false,
//       connected: false,
//       error: 'Error al obtener estado de WhatsApp'
//     })
//   }
// }

//-- nuevo -------------------------------------------------------------------
// app/api/citas/recordatorios/route.ts - VERSIÓN CORREGIDA

import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from "@prisma/client"
import { auth } from '@clerk/nextjs/server'
import nodemailer from 'nodemailer'
import { whatsappManager, getConnectedWhatsAppService } from '../../../../lib/whatsapp-manager'

const prisma = new PrismaClient()

// POST - Enviar recordatorios automáticos
export async function POST(request: NextRequest) {
  try {
    const authData = await auth()
    const userId = authData?.userId
    if (!userId) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    console.log('🚀 [API] Iniciando proceso de recordatorios...')

    // ✅ INICIALIZAR WHATSAPP AUTOMÁTICAMENTE
    console.log('📱 [API] Verificando conexión WhatsApp...')
    await whatsappManager.initialize()

    // Verificar estado después de inicializar
    if (!whatsappManager.isReady()) {
      console.log('❌ [API] WhatsApp no está listo, intentando reconectar...')
      const reconnected = await whatsappManager.ensureConnection()
      
      if (!reconnected) {
        return NextResponse.json({
          success: false,
          error: 'WhatsApp no está conectado. Por favor:',
          instrucciones: [
            '1. Detén el servidor Next.js (Ctrl+C)',
            '2. Ejecuta: npx tsx scripts/init-whatsapp.ts',
            '3. Escanea el código QR',
            '4. Vuelve a iniciar el servidor Next.js'
          ],
          conectado: false
        }, { status: 400 })
      }
    }

    const whatsappService = whatsappManager.getService()
    const user = await whatsappService.getConnectedUser()
    console.log('✅ [API] WhatsApp conectado:', user?.name || 'Usuario desconocido')

    // Calcular fecha de mañana
    const ahora = new Date()
    const manana = new Date()
    manana.setDate(ahora.getDate() + 1)
    
    const inicioDia = new Date(manana.getFullYear(), manana.getMonth(), manana.getDate(), 0, 0, 0)
    const finDia = new Date(manana.getFullYear(), manana.getMonth(), manana.getDate(), 23, 59, 59)

    console.log(`🔍 Buscando citas para: ${manana.toLocaleDateString('es-PE')}`)

    // Buscar citas para mañana
    const citasManana = await prisma.cita.findMany({
      where: {
        fechaHora: {
          gte: inicioDia,
          lte: finDia
        },
        estado: {
          in: ['SOLICITADA', 'CONFIRMADA']
        }
      },
      include: {
        paciente: {
          select: {
            id: true,
            nombres: true,
            apellidos: true,
            dni: true,
            telefono: true,
            email: true
          }
        }
      }
    })

    console.log(`📋 Encontradas ${citasManana.length} citas para mañana`)

    if (citasManana.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No hay citas programadas para mañana',
        enviados: 0,
        totalCitas: 0,
        detalles: [],
        conectado: true
      })
    }

    let recordatoriosEnviados = 0
    const resultados = []

    for (const cita of citasManana) {
      try {
        console.log(`\n🔄 Procesando: ${cita.paciente.nombres} ${cita.paciente.apellidos}`)

        // Verificar recordatorio existente
        const hoyInicio = new Date()
        hoyInicio.setHours(0, 0, 0, 0)
        const hoyFin = new Date()
        hoyFin.setHours(23, 59, 59, 999)

        const recordatorioExistente = await prisma.recordatorio.findFirst({
          where: {
            idCita: cita.id,
            fechaEnvio: {
              gte: hoyInicio,
              lte: hoyFin
            }
          }
        })

        if (recordatorioExistente) {
          console.log(`⚠️ Ya enviado hoy para ${cita.paciente.nombres}`)
          resultados.push({
            paciente: `${cita.paciente.nombres} ${cita.paciente.apellidos}`,
            estado: 'YA_ENVIADO',
            fecha: cita.fechaHora,
            mensaje: 'Recordatorio ya enviado hoy'
          })
          continue
        }

        let recordatoriosEnviadosPaciente = 0
        const telefonoFinal = cita.telefonoContacto || cita.paciente.telefono
        const emailFinal = cita.emailContacto || cita.paciente.email

        // 🚀 ENVIAR WHATSAPP
        if (telefonoFinal) {
          console.log(`📱 Enviando WhatsApp a: ${telefonoFinal}`)
          
          const resultadoWhatsApp = await enviarWhatsAppBaileys(cita, telefonoFinal, whatsappService)
          
          // Guardar en BD
          await prisma.recordatorio.create({
            data: {
              idCita: cita.id,
              fechaEnvio: new Date(),
              medio: 'WHATSAPP',
              estado: resultadoWhatsApp.success ? 'ENVIADO' : 'FALLIDO'
            }
          })

          if (resultadoWhatsApp.success) {
            recordatoriosEnviadosPaciente++
            console.log(`✅ WhatsApp enviado`)
          } else {
            console.log(`❌ Error WhatsApp: ${resultadoWhatsApp.mensaje}`)
          }

          resultados.push({
            paciente: `${cita.paciente.nombres} ${cita.paciente.apellidos}`,
            estado: resultadoWhatsApp.success ? 'ENVIADO' : 'FALLIDO',
            medio: 'WHATSAPP',
            telefono: telefonoFinal,
            fecha: cita.fechaHora,
            motivo: cita.motivo,
            mensaje: resultadoWhatsApp.mensaje,
            messageId: resultadoWhatsApp.messageId
          })

          // Delay entre mensajes
          console.log('⏳ Esperando 3 segundos...')
          await new Promise(resolve => setTimeout(resolve, 3000))
        }

        // 📧 ENVIAR EMAIL
        if (emailFinal) {
          console.log(`📧 Enviando Email a: ${emailFinal}`)
          
          const resultadoEmail = await enviarEmail(cita, emailFinal)
          
          await prisma.recordatorio.create({
            data: {
              idCita: cita.id,
              fechaEnvio: new Date(),
              medio: 'EMAIL',
              estado: resultadoEmail.success ? 'ENVIADO' : 'FALLIDO'
            }
          })

          if (resultadoEmail.success) {
            recordatoriosEnviadosPaciente++
          }

          resultados.push({
            paciente: `${cita.paciente.nombres} ${cita.paciente.apellidos}`,
            estado: resultadoEmail.success ? 'ENVIADO' : 'FALLIDO',
            medio: 'EMAIL',
            email: emailFinal,
            fecha: cita.fechaHora,
            motivo: cita.motivo,
            mensaje: resultadoEmail.mensaje
          })
        }

        if (!telefonoFinal && !emailFinal) {
          resultados.push({
            paciente: `${cita.paciente.nombres} ${cita.paciente.apellidos}`,
            estado: 'SIN_CONTACTO',
            fecha: cita.fechaHora,
            mensaje: 'Sin teléfono ni email disponible'
          })
        }

        recordatoriosEnviados += recordatoriosEnviadosPaciente

      } catch (error) {
        console.error(`❌ Error procesando cita ${cita.id}:`, error)
        resultados.push({
          paciente: `${cita.paciente.nombres} ${cita.paciente.apellidos}`,
          estado: 'ERROR',
          fecha: cita.fechaHora,
          mensaje: `Error: ${error instanceof Error ? error.message : 'Error desconocido'}`
        })
      }
    }

    console.log(`\n📊 RESUMEN: ${recordatoriosEnviados}/${citasManana.length} enviados`)

    return NextResponse.json({
      success: true,
      message: `Proceso completado: ${recordatoriosEnviados} recordatorios enviados`,
      enviados: recordatoriosEnviados,
      totalCitas: citasManana.length,
      detalles: resultados,
      conectado: true,
      usuario: user
    })

  } catch (error) {
    console.error('❌ Error crítico:', error)
    return NextResponse.json({
      success: false,
      error: 'Error interno del servidor',
      detalle: error instanceof Error ? error.message : 'Error desconocido'
    }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}

// 🚀 FUNCIÓN WHATSAPP (sin cambios)
async function enviarWhatsAppBaileys(cita: any, telefono: string, whatsappService: any) {
  try {
    const fechaCita = new Date(cita.fechaHora)
    const fechaFormateada = fechaCita.toLocaleDateString('es-PE', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
    const horaFormateada = fechaCita.toLocaleTimeString('es-PE', {
      hour: '2-digit',
      minute: '2-digit'
    })

    const mensaje = `🦷 *RECORDATORIO DENTAL - SONRISOFT*

¡Hola ${cita.paciente.nombres}! 👋

Te recordamos que tienes una cita programada para *MAÑANA*:

📅 *Fecha:* ${fechaFormateada}
🕐 *Hora:* ${horaFormateada}
🏥 *Clínica:* SONRISOFT - Clínica Dental
📋 *Motivo:* ${cita.motivo || 'Consulta general'}

*Recomendaciones importantes:*
✅ Llega 10 minutos antes
✅ Trae tu documento de identidad
✅ Si necesitas reprogramar, llámanos

📞 *Contacto:* (01) 234-5678
📍 *Dirección:* Av. Principal 123, Lima

¡Te esperamos! 😊

_Mensaje automático del sistema SONRISOFT_`

    let telefonoLimpio = telefono.toString().replace(/\D/g, '')
    
    if (!telefonoLimpio.startsWith('51')) {
      if (telefonoLimpio.startsWith('9')) {
        telefonoLimpio = '51' + telefonoLimpio
      } else {
        telefonoLimpio = '51' + telefonoLimpio
      }
    }

    if (!whatsappService.isReady()) {
      return {
        success: false,
        mensaje: 'WhatsApp no está conectado'
      }
    }

    // Verificar número
    const tieneWhatsApp = await whatsappService.checkWhatsAppNumber(telefonoLimpio)
    if (!tieneWhatsApp) {
      return {
        success: false,
        mensaje: `El número ${telefono} no tiene WhatsApp registrado`
      }
    }

    // Enviar mensaje
    const result = await whatsappService.sendMessage({
      to: telefonoLimpio,
      message: mensaje
    })

    return {
      success: result.success,
      mensaje: result.success ? 'WhatsApp enviado correctamente' : `Error: ${result.error}`,
      messageId: result.messageId
    }

  } catch (error) {
    return {
      success: false,
      mensaje: `Error interno: ${error instanceof Error ? error.message : 'Error desconocido'}`
    }
  }
}

// 📧 FUNCIÓN EMAIL (sin cambios)
async function enviarEmail(cita: any, email: string) {
  try {
    const fechaCita = new Date(cita.fechaHora)
    const fechaFormateada = fechaCita.toLocaleDateString('es-PE', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
    const horaFormateada = fechaCita.toLocaleTimeString('es-PE', {
      hour: '2-digit',
      minute: '2-digit'
    })

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    })

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: '🦷 Recordatorio de Cita - SONRISOFT Clínica Dental',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb;">📅 Recordatorio de Cita</h2>
          <p>¡Hola ${cita.paciente.nombres}!</p>
          <p>Te recordamos tu cita para <strong>MAÑANA</strong>:</p>
          <div style="background: #f8fafc; padding: 15px; border-radius: 8px;">
            <p><strong>📅 Fecha:</strong> ${fechaFormateada}</p>
            <p><strong>🕐 Hora:</strong> ${horaFormateada}</p>
            <p><strong>🏥 Clínica:</strong> SONRISOFT</p>
            <p><strong>📋 Motivo:</strong> ${cita.motivo || 'Consulta general'}</p>
          </div>
          <p>¡Te esperamos! 😊</p>
        </div>
      `
    }

    await transporter.sendMail(mailOptions)
    
    return {
      success: true,
      mensaje: 'Email enviado correctamente'
    }
    
  } catch (error) {
    return {
      success: false,
      mensaje: 'Error al enviar email'
    }
  }
}

// GET - Estado de WhatsApp
export async function GET() {
  try {
    await whatsappManager.initialize()
    const isReady = whatsappManager.isReady()
    const service = whatsappManager.getService()
    const user = isReady ? await service.getConnectedUser() : null
    
    return NextResponse.json({
      success: true,
      connected: isReady,
      user: user,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    return NextResponse.json({
      success: false,
      connected: false,
      error: 'Error al obtener estado de WhatsApp'
    })
  }
}