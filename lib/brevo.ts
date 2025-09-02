// // lib/brevo.ts
// import { TransactionalEmailsApi, SendSmtpEmail } from '@getbrevo/brevo'

// const apiInstance = new TransactionalEmailsApi()

// if (!process.env.BREVO_API_KEY) {
//   throw new Error('BREVO_API_KEY no está configurada')
// }

// apiInstance.setApiKey(process.env.BREVO_API_KEY)

// interface DatosRecordatorio {
//   email: string
//   nombrePaciente: string
//   fechaCita: Date
//   horaCita: string
//   motivo?: string
//   clinica?: string
// }

// export async function enviarRecordatorioEmail({
//   email,
//   nombrePaciente,
//   fechaCita,
//   horaCita,
//   motivo = 'Consulta general',
//   clinica = 'SONRISOFT'
// }: DatosRecordatorio) {
//   try {
//     const sendSmtpEmail = new SendSmtpEmail()
    
//     // Formatear fecha
//     const fechaFormateada = fechaCita.toLocaleDateString('es-PE', {
//       weekday: 'long',
//       year: 'numeric',
//       month: 'long',
//       day: 'numeric'
//     })

//     sendSmtpEmail.subject = `🦷 Recordatorio de Cita - ${clinica} Clínica Dental`
//     sendSmtpEmail.to = [{ email: email, name: nombrePaciente }]
//     sendSmtpEmail.sender = { 
//       name: `${clinica} Clínica Dental`, 
//       email: process.env.EMAIL_USER || 'no-reply@clinica.com' 
//     }
    
//     sendSmtpEmail.htmlContent = `
//       <!DOCTYPE html>
//       <html>
//       <head>
//         <meta charset="utf-8">
//         <meta name="viewport" content="width=device-width, initial-scale=1.0">
//         <title>Recordatorio de Cita</title>
//       </head>
//       <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
//         <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
//           <h1 style="color: white; margin: 0; font-size: 28px;">🦷 ${clinica}</h1>
//           <p style="color: #f0f0f0; margin: 5px 0 0 0; font-size: 16px;">Clínica Dental</p>
//         </div>
        
//         <div style="background: white; padding: 30px; border: 1px solid #e0e0e0; border-top: none;">
//           <h2 style="color: #2563eb; margin-top: 0;">📅 Recordatorio de Cita</h2>
//           <p style="font-size: 18px; margin-bottom: 20px;">¡Hola <strong>${nombrePaciente}</strong>!</p>
//           <p style="font-size: 16px; margin-bottom: 25px;">Te recordamos tu cita para <strong style="color: #2563eb;">MAÑANA</strong>:</p>
          
//           <div style="background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%); padding: 25px; border-radius: 10px; border-left: 4px solid #2563eb; margin: 20px 0;">
//             <div style="display: grid; gap: 12px;">
//               <p style="margin: 0; display: flex; align-items: center; font-size: 16px;">
//                 <span style="background: #2563eb; color: white; padding: 6px 8px; border-radius: 6px; margin-right: 12px; font-weight: bold;">📅</span>
//                 <strong>Fecha:</strong>&nbsp;&nbsp;${fechaFormateada}
//               </p>
//               <p style="margin: 0; display: flex; align-items: center; font-size: 16px;">
//                 <span style="background: #2563eb; color: white; padding: 6px 8px; border-radius: 6px; margin-right: 12px; font-weight: bold;">🕐</span>
//                 <strong>Hora:</strong>&nbsp;&nbsp;${horaCita}
//               </p>
//               <p style="margin: 0; display: flex; align-items: center; font-size: 16px;">
//                 <span style="background: #2563eb; color: white; padding: 6px 8px; border-radius: 6px; margin-right: 12px; font-weight: bold;">🏥</span>
//                 <strong>Clínica:</strong>&nbsp;&nbsp;${clinica}
//               </p>
//               <p style="margin: 0; display: flex; align-items: center; font-size: 16px;">
//                 <span style="background: #2563eb; color: white; padding: 6px 8px; border-radius: 6px; margin-right: 12px; font-weight: bold;">📋</span>
//                 <strong>Motivo:</strong>&nbsp;&nbsp;${motivo}
//               </p>
//             </div>
//           </div>
          
//           <div style="background: #ecfdf5; border: 1px solid #a7f3d0; padding: 20px; border-radius: 8px; margin: 25px 0;">
//             <h3 style="color: #065f46; margin: 0 0 10px 0; display: flex; align-items: center;">
//               ✅ <span style="margin-left: 8px;">¡Te esperamos!</span>
//             </h3>
//             <p style="margin: 0; color: #047857; font-size: 15px;">
//               Si necesitas reprogramar o tienes alguna consulta, no dudes en contactarnos.
//             </p>
//           </div>
          
//           <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
//             <p style="color: #6b7280; font-size: 14px; margin: 0;">
//               Este es un recordatorio automático del sistema ${clinica}
//             </p>
//           </div>
//         </div>
        
//         <div style="background: #f9fafb; padding: 20px; text-align: center; border-radius: 0 0 10px 10px; border: 1px solid #e0e0e0; border-top: none;">
//           <p style="color: #6b7280; font-size: 14px; margin: 0;">
//             © 2024 ${clinica} - Sistema de Gestión Dental
//           </p>
//         </div>
//       </body>
//       </html>
//     `

//     // También incluir versión texto plano
//     sendSmtpEmail.textContent = `
// Recordatorio de Cita - ${clinica} Clínica Dental

// Hola ${nombrePaciente},

// Te recordamos tu cita para MAÑANA:

// 📅 Fecha: ${fechaFormateada}
// 🕐 Hora: ${horaCita}  
// 🏥 Clínica: ${clinica}
// 📋 Motivo: ${motivo}

// ¡Te esperamos!

// Este es un recordatorio automático del sistema ${clinica}.
//     `

//     const result = await apiInstance.sendTransacEmail(sendSmtpEmail)
    
//     console.log('✅ Email enviado exitosamente:', result.messageId)
//     return {
//       success: true,
//       mensaje: 'Email enviado correctamente',
//       messageId: result.messageId
//     }
    
//   } catch (error) {
//     console.error('❌ Error enviando email con Brevo:', error)
//     return {
//       success: false,
//       mensaje: `Error al enviar email: ${error instanceof Error ? error.message : 'Error desconocido'}`,
//       error
//     }
//   }
// }