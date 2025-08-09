// esto es para sacar citas desde la pagina principal 
// app/api/send-appointment
import { NextResponse } from 'next/server'
import nodemailer from 'nodemailer'

export async function POST(request: Request) {
  try {
    const { name, email, phone, message } = await request.json()

    // Configurar el transportador de email
    const transporter = nodemailer.createTransport({
      service: 'gmail', // Puedes usar Gmail, Outlook, etc.
      auth: {
        user: process.env.EMAIL_USER, // tu email
        pass: process.env.EMAIL_PASS, // tu contraseña de aplicación
      },
    })

    // Configurar el mensaje
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: ['fiorellatah6.2@gmail.com', 'fiorellatah6.1@gmail.com'], // Los 2 emails específicos
      subject: '🦷 Nueva Solicitud de Cita - Clínica Dental Sonríe',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
          <h2 style="color: #2563eb; text-align: center;">📅 Nueva Solicitud de Cita</h2>
          
          <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #1f2937; margin-bottom: 15px;">Datos del Paciente:</h3>
            
            <p style="margin: 10px 0;"><strong>👤 Nombre:</strong> ${name}</p>
            <p style="margin: 10px 0;"><strong>📧 Email:</strong> ${email}</p>
            <p style="margin: 10px 0;"><strong>📱 Teléfono:</strong> ${phone}</p>
            
            <h4 style="color: #1f2937; margin-top: 20px;">💬 Mensaje:</h4>
            <div style="background-color: white; padding: 15px; border-radius: 5px; border-left: 4px solid #2563eb;">
              ${message || 'Sin mensaje adicional'}
            </div>
          </div>
          
          <div style="text-align: center; margin-top: 30px; padding: 20px; background-color: #eff6ff; border-radius: 8px;">
            <p style="color: #1f2937; margin: 0;">
              ⏰ <strong>Fecha de solicitud:</strong> ${new Date().toLocaleDateString('es-ES', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </p>
          </div>
          
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
          
          <div style="text-align: center;">
            <p style="color: #6b7280; font-size: 14px; margin: 5px 0;">
              📞 Contacta al paciente lo antes posible
            </p>
            <p style="color: #6b7280; font-size: 12px; margin: 0;">
              Clínica Dental Sonríe - Sistema de Citas Online
            </p>
          </div>
        </div>
      `,
    }

    // Enviar el email
    await transporter.sendMail(mailOptions)

    // Crear URLs para WhatsApp (los 2 números específicos)
    const whatsappNumbers = ['+51950900830', '+51123456789'] // Cambia por tus números reales
    const whatsappMessage = `🦷 *NUEVA CITA SOLICITADA*\n\n👤 *Nombre:* ${name}\n📧 *Email:* ${email}\n📱 *Teléfono:* ${phone}\n\n💬 *Mensaje:*\n${message || 'Sin mensaje adicional'}\n\n⏰ *Fecha:* ${new Date().toLocaleString('es-ES')}`
    
    const whatsappUrls = whatsappNumbers.map(number => 
      `https://wa.me/${number.replace('+', '')}?text=${encodeURIComponent(whatsappMessage)}`
    )

    return NextResponse.json({ 
      success: true, 
      message: 'Cita enviada correctamente',
      whatsappUrls 
    })

  } catch (error) {
    console.error('Error enviando cita:', error)
    return NextResponse.json(
      { success: false, message: 'Error enviando la solicitud' },
      { status: 500 }
    )
  }
}