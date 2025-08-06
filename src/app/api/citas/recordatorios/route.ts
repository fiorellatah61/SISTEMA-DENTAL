import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from "@prisma/client"
import { auth } from '@clerk/nextjs/server'

const prisma = new PrismaClient()

// POST - Enviar recordatorios automáticos
export async function POST(request: NextRequest) {
  try {
    const authData = await auth()
    const userId = authData?.userId
    if (!userId) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    // Calcular fecha de mañana (24 horas desde ahora)
    const manana = new Date()
    manana.setDate(manana.getDate() + 1)
    
    const inicioDia = new Date(manana.getFullYear(), manana.getMonth(), manana.getDate(), 0, 0, 0)
    const finDia = new Date(manana.getFullYear(), manana.getMonth(), manana.getDate(), 23, 59, 59)

    // Buscar citas para mañana que estén confirmadas o solicitadas
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

    let recordatoriosEnviados = 0
    const resultados = []

    for (const cita of citasManana) {
      try {
        // Verificar si ya se envió recordatorio para esta cita hoy
        const recordatorioExistente = await prisma.recordatorio.findFirst({
          where: {
            idCita: cita.id,
            fechaEnvio: {
              gte: new Date(new Date().setHours(0, 0, 0, 0)),
              lte: new Date(new Date().setHours(23, 59, 59, 999))
            }
          }
        })

        if (recordatorioExistente) {
          resultados.push({
            paciente: `${cita.paciente.nombres} ${cita.paciente.apellidos}`,
            estado: 'YA_ENVIADO',
            mensaje: 'Recordatorio ya enviado hoy'
          })
          continue
        }

        // Enviar recordatorio por WhatsApp (si tiene teléfono)
        if (cita.paciente.telefono) {
          const resultadoWhatsApp = await enviarWhatsApp(cita)
          
          await prisma.recordatorio.create({
            data: {
              idCita: cita.id,
              fechaEnvio: new Date(),
              medio: 'WHATSAPP',
              estado: resultadoWhatsApp.success ? 'ENVIADO' : 'FALLIDO'
            }
          })

          if (resultadoWhatsApp.success) {
            recordatoriosEnviados++
          }

          resultados.push({
            paciente: `${cita.paciente.nombres} ${cita.paciente.apellidos}`,
            estado: resultadoWhatsApp.success ? 'ENVIADO' : 'FALLIDO',
            medio: 'WHATSAPP',
            mensaje: resultadoWhatsApp.mensaje
          })
        }

        // Enviar recordatorio por Email (si tiene email)
        if (cita.paciente.email) {
          const resultadoEmail = await enviarEmail(cita)
          
          await prisma.recordatorio.create({
            data: {
              idCita: cita.id,
              fechaEnvio: new Date(),
              medio: 'EMAIL',
              estado: resultadoEmail.success ? 'ENVIADO' : 'FALLIDO'
            }
          })

          if (resultadoEmail.success) {
            recordatoriosEnviados++
          }

          resultados.push({
            paciente: `${cita.paciente.nombres} ${cita.paciente.apellidos}`,
            estado: resultadoEmail.success ? 'ENVIADO' : 'FALLIDO',
            medio: 'EMAIL',
            mensaje: resultadoEmail.mensaje
          })
        }

        // Si no tiene teléfono ni email
        if (!cita.paciente.telefono && !cita.paciente.email) {
          resultados.push({
            paciente: `${cita.paciente.nombres} ${cita.paciente.apellidos}`,
            estado: 'SIN_CONTACTO',
            mensaje: 'Paciente sin teléfono ni email registrado'
          })
        }

      } catch (error) {
        console.error(`Error al enviar recordatorio para cita ${cita.id}:`, error)
        resultados.push({
          paciente: `${cita.paciente.nombres} ${cita.paciente.apellidos}`,
          estado: 'ERROR',
          mensaje: 'Error al procesar recordatorio'
        })
      }
    }

    return NextResponse.json({
      message: `Proceso de recordatorios completado`,
      enviados: recordatoriosEnviados,
      totalCitas: citasManana.length,
      detalles: resultados
    })
  } catch (error) {
    console.error('Error al enviar recordatorios:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}

// Función para enviar WhatsApp (simulada - aquí integrarías con WhatsApp API)
async function enviarWhatsApp(cita: any) {
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

    const mensaje = `¡Hola ${cita.paciente.nombres}! 👋

Te recordamos que tienes una cita programada para MAÑANA:

📅 Fecha: ${fechaFormateada}
🕐 Hora: ${horaFormateada}
🏥 Clínica: SONRISOFT - Clínica Dental

${cita.motivo ? `📋 Motivo: ${cita.motivo}` : ''}

Por favor, confirma tu asistencia o comunícate si necesitas reprogramar.

¡Te esperamos! 😊`

    // AQUÍ INTEGRARÍAS CON LA API DE WHATSAPP (Twilio, WhatsApp Business API, etc.)
    // Por ahora simulamos el envío
    console.log(`WhatsApp enviado a ${cita.paciente.telefono}:`, mensaje)
    
    // Simular éxito/fallo aleatorio para pruebas
    const exito = Math.random() > 0.1 // 90% de éxito
    
    return {
      success: exito,
      mensaje: exito ? 'WhatsApp enviado correctamente' : 'Error al enviar WhatsApp'
    }
  } catch (error) {
    return {
      success: false,
      mensaje: 'Error al preparar mensaje de WhatsApp'
    }
  }
}

// Función para enviar Email (simulada - aquí integrarías con servicio de email)
async function enviarEmail(cita: any) {
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

    const asunto = 'Recordatorio de Cita - SONRISOFT Clínica Dental'
    const contenido = `
      <h2>Recordatorio de Cita Médica</h2>
      <p>Estimado/a ${cita.paciente.nombres} ${cita.paciente.apellidos},</p>
      
      <p>Le recordamos que tiene una cita programada para <strong>mañana</strong>:</p>
      
      <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <p><strong>📅 Fecha:</strong> ${fechaFormateada}</p>
        <p><strong>🕐 Hora:</strong> ${horaFormateada}</p>
        <p><strong>🏥 Clínica:</strong> SONRISOFT - Clínica Dental</p>
        ${cita.motivo ? `<p><strong>📋 Motivo:</strong> ${cita.motivo}</p>` : ''}
      </div>
      
      <p>Por favor, confirme su asistencia o comuníquese con nosotros si necesita reprogramar su cita.</p>
      
      <p>¡Le esperamos!</p>
      
      <hr>
      <p><small>SONRISOFT - Clínica Dental<br>
      Este es un mensaje automático, por favor no responda a este correo.</small></p>
    `

    // AQUÍ INTEGRARÍAS CON SERVICIO DE EMAIL (SendGrid, Resend, Nodemailer, etc.)
    // Por ahora simulamos el envío
    console.log(`Email enviado a ${cita.paciente.email}:`)
    console.log(`Asunto: ${asunto}`)
    console.log(`Contenido: ${contenido}`)
    
    // Simular éxito/fallo aleatorio para pruebas
    const exito = Math.random() > 0.05 // 95% de éxito
    
    return {
      success: exito,
      mensaje: exito ? 'Email enviado correctamente' : 'Error al enviar email'
    }
  } catch (error) {
    return {
      success: false,
      mensaje: 'Error al preparar email'
    }
  }
}