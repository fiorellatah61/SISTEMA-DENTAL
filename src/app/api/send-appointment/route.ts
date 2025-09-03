// // esto es para sacar citas desde la pagina principal 
// // app/api/send-appointment
// import { NextResponse } from 'next/server'
// import nodemailer from 'nodemailer'

// export async function POST(request: Request) {
//   try {
//     const { name, email, phone, message } = await request.json()

//     // Configurar el transportador de email
//     const transporter = nodemailer.createTransport({
//       service: 'gmail', // Puedes usar Gmail, Outlook, etc.
//       auth: {
//         user: process.env.EMAIL_USER, // tu email
//         pass: process.env.EMAIL_PASS, // tu contraseña de aplicación
//       },
//     })

//     // Configurar el mensaje
//     const mailOptions = {
//       from: process.env.EMAIL_USER,
//       to: ['fiorellatah6.2@gmail.com', 'fiorellatah6.1@gmail.com'], // Los 2 emails específicos
//       subject: '🦷 Nueva Solicitud de Cita - Clínica Dental Sonríe',
//       html: `
//         <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
//           <h2 style="color: #2563eb; text-align: center;">📅 Nueva Solicitud de Cita</h2>
          
//           <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
//             <h3 style="color: #1f2937; margin-bottom: 15px;">Datos del Paciente:</h3>
            
//             <p style="margin: 10px 0;"><strong>👤 Nombre:</strong> ${name}</p>
//             <p style="margin: 10px 0;"><strong>📧 Email:</strong> ${email}</p>
//             <p style="margin: 10px 0;"><strong>📱 Teléfono:</strong> ${phone}</p>
            
//             <h4 style="color: #1f2937; margin-top: 20px;">💬 Mensaje:</h4>
//             <div style="background-color: white; padding: 15px; border-radius: 5px; border-left: 4px solid #2563eb;">
//               ${message || 'Sin mensaje adicional'}
//             </div>
//           </div>
          
//           <div style="text-align: center; margin-top: 30px; padding: 20px; background-color: #eff6ff; border-radius: 8px;">
//             <p style="color: #1f2937; margin: 0;">
//               ⏰ <strong>Fecha de solicitud:</strong> ${new Date().toLocaleDateString('es-ES', {
//                 year: 'numeric',
//                 month: 'long',
//                 day: 'numeric',
//                 hour: '2-digit',
//                 minute: '2-digit'
//               })}
//             </p>
//           </div>
          
//           <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
          
//           <div style="text-align: center;">
//             <p style="color: #6b7280; font-size: 14px; margin: 5px 0;">
//               📞 Contacta al paciente lo antes posible
//             </p>
//             <p style="color: #6b7280; font-size: 12px; margin: 0;">
//               Clínica Dental Sonríe - Sistema de Citas Online
//             </p>
//           </div>
//         </div>
//       `,
//     }

//     // Enviar el email
//     await transporter.sendMail(mailOptions)

//     // Crear URLs para WhatsApp (los 2 números específicos)
//     const whatsappNumbers = ['+51950900830', '+51123456789'] // Cambia por tus números reales
//     const whatsappMessage = `🦷 *NUEVA CITA SOLICITADA*\n\n👤 *Nombre:* ${name}\n📧 *Email:* ${email}\n📱 *Teléfono:* ${phone}\n\n💬 *Mensaje:*\n${message || 'Sin mensaje adicional'}\n\n⏰ *Fecha:* ${new Date().toLocaleString('es-ES')}`
    
//     const whatsappUrls = whatsappNumbers.map(number => 
//       `https://wa.me/${number.replace('+', '')}?text=${encodeURIComponent(whatsappMessage)}`
//     )

//     return NextResponse.json({ 
//       success: true, 
//       message: 'Cita enviada correctamente',
//       whatsappUrls 
//     })

//   } catch (error) {
//     console.error('Error enviando cita:', error)
//     return NextResponse.json(
//       { success: false, message: 'Error enviando la solicitud' },
//       { status: 500 }
//     )
//   }
// }

// app/api/send-appointment/route.ts - MIGRADO A BREVO
import { NextResponse } from 'next/server'
import * as Brevo from '@getbrevo/brevo'
export async function POST(request: Request) {
  try {
    const { name, email, phone, message } = await request.json()
// Validar datos requeridos
// Validar datos requeridos
if (!name || !email || !message) {
  return NextResponse.json(
    { success: false, message: 'Nombre, email y mensaje son obligatorios' },
    { status: 400 }
  )
}
    // Validar formato de email básico
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { success: false, message: 'Email inválido' },
        { status: 400 }
      )
    }
    // Configurar Brevo
    if (!process.env.BREVO_API_KEY) {
      throw new Error('Clave API de Brevo no configurada')
    }
    const apiInstance = new Brevo.TransactionalEmailsApi()
    apiInstance.setApiKey(
      Brevo.TransactionalEmailsApiApiKeys.apiKey, 
      process.env.BREVO_API_KEY
    )
    // Configurar el email
    const sendSmtpEmail = new Brevo.SendSmtpEmail()
    sendSmtpEmail.sender = { 
      name: 'Clínica Dental Sorie - Citas Online', 
      email: process.env.EMAIL_USER || 'fiorellatah6.2@gmail.com' 
    }
    // Los 2 emails específicos como destinatarios
    sendSmtpEmail.to = [
      { email: 'fiorellatah6.2@gmail.com' },
      { email: 'fiorellatah6.1@gmail.com' }
    ]
    
    sendSmtpEmail.subject = '🦷 Nueva Solicitud de Cita - Clínica Dental Sorie'
    sendSmtpEmail.htmlContent = `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 650px; margin: 0 auto; background: #ffffff;">
        <!-- Header elegante -->
        <div style="background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%); color: white; padding: 30px; text-align: center;">
          <h1 style="margin: 0; font-size: 24px; font-weight: 600;">🦷 CLÍNICA DENTAL SORIE</h1>
          <div style="width: 80px; height: 2px; background: rgba(255,255,255,0.8); margin: 15px auto;"></div>
          <h2 style="margin: 10px 0 0 0; font-size: 18px; font-weight: 400; opacity: 0.95;">📅 Nueva Solicitud de Cita</h2>
        </div>
        
        <!-- Contenido principal -->
        <div style="padding: 35px 30px; background: #ffffff;">
          <div style="background: #f8fafc; border-radius: 12px; padding: 25px; margin-bottom: 25px; border-left: 4px solid #2563eb;">
            <h3 style="color: #1f2937; margin: 0 0 20px 0; font-size: 18px; font-weight: 600;">
              👤 Datos del Paciente
            </h3> 
            <div style="display: grid; gap: 15px;">
              <div style="display: flex; align-items: center; padding: 12px 0; border-bottom: 1px solid #e5e7eb;">
                <span style="color: #6b7280; font-weight: 500; min-width: 100px;">Nombre:</span>
                <span style="color: #1f2937; font-weight: 600; font-size: 16px;">${name}</span>
              </div>
              <div style="display: flex; align-items: center; padding: 12px 0; border-bottom: 1px solid #e5e7eb;">
                <span style="color: #6b7280; font-weight: 500; min-width: 100px;">📧 Email:</span>
                <span style="color: #2563eb; font-weight: 500;">${email}</span>
              </div>
              
              <div style="display: flex; align-items: center; padding: 12px 0;">
                <span style="color: #6b7280; font-weight: 500; min-width: 100px;">📱 Teléfono:</span>
                <span style="color: #1f2937; font-weight: 500;">${phone || 'No proporcionado'}</span>
              </div>
            </div>
          </div>
          
          <!-- Mensaje del paciente -->
          <div style="background: white; border: 2px solid #e5e7eb; border-radius: 12px; padding: 25px; margin-bottom: 25px;">
            <h4 style="color: #1f2937; margin: 0 0 15px 0; font-size: 16px; font-weight: 600; display: flex; align-items: center;">
              💬 Mensaje del Paciente
            </h4>
            <div style="background: #f9fafb; padding: 20px; border-radius: 8px; border-left: 4px solid #10b981;">
              <p style="margin: 0; color: #374151; line-height: 1.6; font-size: 15px;">
                ${message || '📝 <em>El paciente no dejó mensaje adicional</em>'}
              </p>
            </div>
          </div>
          
          <!-- Información de contacto rápido -->
          <div style="background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%); border-radius: 12px; padding: 25px; text-align: center; margin-bottom: 25px;">
            <h4 style="color: #1e40af; margin: 0 0 15px 0; font-size: 16px; font-weight: 600;">
              🚀 Acción Requerida
            </h4>
            <p style="color: #1f2937; margin: 0 0 15px 0; font-size: 14px;">
              📞 <strong>Contacta al paciente lo antes posible</strong>
            </p>
            <div style="display: inline-flex; gap: 10px; flex-wrap: wrap; justify-content: center;">
              <a href="mailto:${email}" style="background: #2563eb; color: white; padding: 8px 16px; border-radius: 6px; text-decoration: none; font-size: 13px; font-weight: 500;">
                ✉️ Responder Email
              </a>
              ${phone ? `
              <a href="tel:${phone}" style="background: #10b981; color: white; padding: 8px 16px; border-radius: 6px; text-decoration: none; font-size: 13px; font-weight: 500;">
                📞 Llamar
              </a>` : ''}
            </div>
          </div>
          
          <!-- Fecha y hora -->
          <div style="text-align: center; padding: 20px; background: #f8fafc; border-radius: 8px; border: 1px solid #e5e7eb;">
            <p style="color: #6b7280; margin: 0; font-size: 14px;">
              ⏰ <strong>Fecha de solicitud:</strong> ${new Date().toLocaleDateString('es-ES', {
                year: 'numeric',
                month: 'long', 
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                timeZone: 'America/Lima'
              })}
            </p>
          </div>
        </div>
        
        <!-- Footer -->
        <div style="background: #1f2937; color: #d1d5db; padding: 25px; text-align: center;">
          <p style="margin: 0 0 8px 0; font-weight: 600;">CLÍNICA DENTAL SORIE</p>
          <p style="margin: 0; font-size: 12px; opacity: 0.8;">Sistema de Citas Online - Notificación Automática</p>
        </div>
      </div>
    `

    // Enviar email con reintentos
    const maxIntentos = 3
    let emailEnviado = false
    
    for (let intento = 1; intento <= maxIntentos && !emailEnviado; intento++) {
      try {
        console.log(`Intento ${intento}/${maxIntentos} enviando solicitud de cita`)
        
        await Promise.race([
          apiInstance.sendTransacEmail(sendSmtpEmail),
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Timeout enviando email')), 30000)
          )
        ])
        
        emailEnviado = true
        console.log(`Solicitud de cita enviada exitosamente en intento ${intento}`)
        
      } catch (error) {
        console.error(`Error en intento ${intento}:`, error)
        
        if (intento === maxIntentos) {
          throw new Error(`Error enviando email tras ${maxIntentos} intentos: ${error instanceof Error ? error.message : String(error)}`)
        }
        // Esperar antes del siguiente intento
        await new Promise(resolve => setTimeout(resolve, 2000 * intento))
      }
    }

    // Crear URLs para WhatsApp (los 2 números específicos)
    const whatsappNumbers = ['+51950900830', '+51123456789'] // Cambia por tus números reales
    const whatsappMessage = ` *NUEVA CITA SOLICITADA*\n\n *Nombre:* ${name}\n *Email:* ${email}\n *Teléfono:* ${phone || 'No proporcionado'}\n\n *Mensaje:*\n${message || 'Sin mensaje adicional'}\n\n *Fecha:* ${new Date().toLocaleString('es-ES', { timeZone: 'America/Lima' })}`
    const whatsappUrls = whatsappNumbers.map(number => 
      `https://wa.me/${number.replace('+', '')}?text=${encodeURIComponent(whatsappMessage)}`
    )
    return NextResponse.json({ 
      success: true, 
      message: 'Cita enviada correctamente',
      whatsappUrls,
      patientInfo: {
        name,
        email,
        phone: phone || null
      }
    })
  } catch (error) {
    console.error('Error enviando solicitud de cita:', error)
    return NextResponse.json(
      { 
        success: false, 
        message: 'Error enviando la solicitud: ' + (error instanceof Error ? error.message : 'Error desconocido')
      },
      { status: 500 }
    )
  }
}
