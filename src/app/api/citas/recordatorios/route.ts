// // // app/api/citas/recordatorios/route.ts 

// import { NextRequest, NextResponse } from 'next/server'
// import { prisma } from '@/lib/prisma'
// import { auth } from '@clerk/nextjs/server'
// import nodemailer from 'nodemailer'
// import { toZonedTime, formatInTimeZone } from 'date-fns-tz'

// // Definir tipos para Cita y Paciente
// interface Paciente {
//   id: string
//   nombres: string
//   apellidos: string
//   dni: string
//   telefono?: string | null
//   email?: string | null
// }

// interface Cita {
//   id: string
//   idPaciente: string
//   fechaHora: Date
//   estado: 'SOLICITADA' | 'CONFIRMADA' | 'MODIFICADA' | 'CANCELADA'
//   motivo?: string | null
//   observaciones?: string | null
//   paciente: Paciente
//   createdAt: Date
//   updatedAt: Date
//   telefonoContacto?: string | null
//   emailContacto?: string | null
// }

// // POST - Enviar recordatorios automáticos
// export async function POST(request: NextRequest) {
//   const startTime = Date.now()
//   console.log('🚀 [PROD] Iniciando recordatorios:', new Date().toISOString())
  
//   let attempts = 0
//   const maxAttempts = 3
//   const timeZone = 'America/Lima' // Zona horaria para Perú

//   while (attempts < maxAttempts) {
//     try {
//       attempts++
//       console.log(`📍 Intento ${attempts}/${maxAttempts}`)

//       const authData = await auth()
//       const userId = authData?.userId
//       if (!userId) {
//         return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
//       }

//       // Verificar variables de entorno críticas
//       const requiredEnvs = ['DATABASE_URL', 'EMAIL_USER', 'EMAIL_PASS']
//       const missingEnvs = requiredEnvs.filter(env => !process.env[env])
      
//       if (missingEnvs.length > 0) {
//         console.error('❌ Variables de entorno faltantes:', missingEnvs)
//         return NextResponse.json({
//           success: false,
//           error: `Variables de entorno no configuradas: ${missingEnvs.join(', ')}`
//         }, { status: 500 })
//       }

//       console.log('📋 Verificando conexión a base de datos...')
//       await prisma.$queryRaw`SELECT 1`
//       console.log('✅ Conexión a BD exitosa')

//       // Calcular fecha de mañana en la zona horaria deseada
//       const ahora = toZonedTime(new Date(), timeZone)
//       const manana = new Date(ahora)
//       manana.setDate(ahora.getDate() + 1)
      
//       const inicioDia = toZonedTime(
//         new Date(manana.getFullYear(), manana.getMonth(), manana.getDate(), 0, 0, 0),
//         timeZone
//       )
//       const finDia = toZonedTime(
//         new Date(manana.getFullYear(), manana.getMonth(), manana.getDate(), 23, 59, 59),
//         timeZone
//       )

//       // Log para depuración
//       console.log(`🔍 Buscando citas para: ${formatInTimeZone(manana, timeZone, 'dd/MM/yyyy')}`)
//       console.log(`📅 Rango de búsqueda: ${inicioDia.toISOString()} - ${finDia.toISOString()}`)

//       // Buscar citas para mañana con timeout
//       const citasManana: Cita[] = await Promise.race([
//         prisma.cita.findMany({
//           where: {
//             fechaHora: {
//               gte: inicioDia,
//               lte: finDia
//             },
//             estado: {
//               in: ['SOLICITADA', 'CONFIRMADA']
//             }
//           },
//           include: {
//             paciente: {
//               select: {
//                 id: true,
//                 nombres: true,
//                 apellidos: true,
//                 dni: true,
//                 telefono: true,
//                 email: true
//               }
//             }
//           }
//         }) as Promise<Cita[]>,
//         new Promise<never>((_, reject) => 
//           setTimeout(() => reject(new Error('Timeout en consulta BD')), 60000)
//         )
//       ])

//       // Log para depuración: listar citas encontradas
//       console.log(`📋 Encontradas ${citasManana.length} citas para mañana`)
//       citasManana.forEach((cita, index) => {
//         console.log(`Cita ${index + 1}: ID=${cita.id}, Fecha=${cita.fechaHora.toISOString()}, Estado=${cita.estado}`)
//       })

//       if (citasManana.length === 0) {
//         // Log adicional para todas las citas (para depuración)
//         const todasCitas = await prisma.cita.findMany({
//           where: {
//             estado: {
//               in: ['SOLICITADA', 'CONFIRMADA']
//             }
//           },
//           select: {
//             id: true,
//             fechaHora: true,
//             estado: true
//           }
//         })
//         console.log('📋 Todas las citas disponibles:', JSON.stringify(todasCitas, null, 2))
        
//         return NextResponse.json({
//           success: true,
//           message: 'No hay citas programadas para mañana',
//           enviados: 0,
//           totalCitas: 0,
//           detalles: [],
//           conectado: true
//         })
//       }

//       let recordatoriosEnviados = 0
//       const resultados = []

//       for (const cita of citasManana) {
//         try {
//           console.log(`\n🔄 Procesando: ${cita.paciente.nombres} ${cita.paciente.apellidos}`)

//           // Verificar recordatorio existente
//           const hoyInicio = toZonedTime(new Date(), timeZone)
//           hoyInicio.setHours(0, 0, 0, 0)
//           const hoyFin = toZonedTime(new Date(), timeZone)
//           hoyFin.setHours(23, 59, 59, 999)

//           const recordatorioExistente = await prisma.recordatorio.findFirst({
//             where: {
//               idCita: cita.id,
//               fechaEnvio: {
//                 gte: hoyInicio,
//                 lte: hoyFin
//               }
//             }
//           })

//           if (recordatorioExistente) {
//             console.log(`⚠️ Ya enviado hoy para ${cita.paciente.nombres}`)
//             resultados.push({
//               paciente: `${cita.paciente.nombres} ${cita.paciente.apellidos}`,
//               estado: 'YA_ENVIADO',
//               fecha: cita.fechaHora,
//               mensaje: 'Recordatorio ya enviado hoy'
//             })
//             continue
//           }

//           let recordatoriosEnviadosPaciente = 0
//           const emailFinal = cita.emailContacto || cita.paciente.email

//           // 📧 ENVIAR EMAIL
//           if (emailFinal) {
//             console.log(`📧 Enviando Email a: ${emailFinal}`)
            
//             const resultadoEmail = await enviarEmailConReintentos(cita, emailFinal)
            
//             await prisma.recordatorio.create({
//               data: {
//                 idCita: cita.id,
//                 fechaEnvio: new Date(),
//                 medio: 'EMAIL',
//                 estado: resultadoEmail.success ? 'ENVIADO' : 'FALLIDO'
//               }
//             })

//             if (resultadoEmail.success) {
//               recordatoriosEnviadosPaciente++
//             }

//             resultados.push({
//               paciente: `${cita.paciente.nombres} ${cita.paciente.apellidos}`,
//               estado: resultadoEmail.success ? 'ENVIADO' : 'FALLIDO',
//               medio: 'EMAIL',
//               email: emailFinal,
//               fecha: cita.fechaHora,
//               motivo: cita.motivo,
//               mensaje: resultadoEmail.mensaje
//             })
//           } else {
//             resultados.push({
//               paciente: `${cita.paciente.nombres} ${cita.paciente.apellidos}`,
//               estado: 'SIN_CONTACTO',
//               fecha: cita.fechaHora,
//               mensaje: 'Sin email disponible'
//             })
//           }

//           recordatoriosEnviados += recordatoriosEnviadosPaciente

//         } catch (error) {
//           console.error(`❌ Error procesando cita ${cita.id}:`, error)
//           resultados.push({
//             paciente: `${cita.paciente.nombres} ${cita.paciente.apellidos}`,
//             estado: 'ERROR',
//             fecha: cita.fechaHora,
//             mensaje: `Error: ${error instanceof Error ? error.message : 'Error desconocido'}`
//           })
//         }
//       }

//       const duration = Date.now() - startTime
//       console.log(`\n📊 RESUMEN: ${recordatoriosEnviados}/${citasManana.length} enviados en ${duration}ms`)

//       return NextResponse.json({
//         success: true,
//         message: `Proceso completado: ${recordatoriosEnviados} recordatorios enviados`,
//         enviados: recordatoriosEnviados,
//         totalCitas: citasManana.length,
//         detalles: resultados,
//         conectado: true
//       })

//     } catch (error) {
//       const duration = Date.now() - startTime
//       console.error(`❌ Intento ${attempts} falló después de ${duration}ms:`, error)
      
//       if (attempts === maxAttempts) {
//         return NextResponse.json({
//           success: false,
//           error: 'Servicio temporalmente no disponible tras múltiples intentos',
//           detalle: error instanceof Error ? error.message : 'Error desconocido'
//         }, { status: 503 })
//       }
      
//       // Esperar antes de reintentar (backoff exponencial)
//       const waitTime = 1000 * Math.pow(2, attempts - 1)
//       console.log(`⏳ Esperando ${waitTime}ms antes del siguiente intento...`)
//       await new Promise(resolve => setTimeout(resolve, waitTime))
//     }
//   }
// }

// async function enviarEmailConReintentos(cita: Cita, email: string) {
//   const maxIntentos = 3
//   const timeZone = 'America/Lima'

//   for (let intento = 1; intento <= maxIntentos; intento++) {
//     try {
//       console.log(`📧 Intento ${intento}/${maxIntentos} enviando email a ${email}`)
      
//       if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
//         throw new Error('Credenciales de email no configuradas')
//       }

//       const fechaCita = toZonedTime(new Date(cita.fechaHora), timeZone)
//       const fechaFormateada = formatInTimeZone(fechaCita, timeZone, 'eeee, d MMMM yyyy')
//       const horaFormateada = formatInTimeZone(fechaCita, timeZone, 'HH:mm')

//       const transporter = nodemailer.createTransport({
//         service: 'gmail',
//         auth: {
//           user: process.env.EMAIL_USER,
//           pass: process.env.EMAIL_PASS
//         },
//         pool: true,
//         maxConnections: 5,
//         maxMessages: 100,
//         rateDelta: 30000,
//         rateLimit: 3,
//         connectionTimeout: 90000,
//         greetingTimeout: 60000,
//         socketTimeout: 90000
//       })

//       console.log('🔍 Verificando conexión con Gmail...')
//       await Promise.race([
//         transporter.verify(),
//         new Promise((_, reject) => 
//           setTimeout(() => reject(new Error('Timeout verificando email')), 30000)
//         )
//       ])
//       console.log('✅ Conexión verificada')

//       const mailOptions = {
//         from: process.env.EMAIL_USER,
//         to: email,
//         subject: '🦷 Recordatorio de Cita - SONRISOFT Clínica Dental',
//         html: `
//           <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
//             <h2 style="color: #2563eb;">📅 Recordatorio de Cita</h2>
//             <p>¡Hola ${cita.paciente.nombres}!</p>
//             <p>Te recordamos tu cita para <strong>MAÑANA</strong>:</p>
//             <div style="background: #f8fafc; padding: 15px; border-radius: 8px;">
//               <p><strong>📅 Fecha:</strong> ${fechaFormateada}</p>
//               <p><strong>🕐 Hora:</strong> ${horaFormateada}</p>
//               <p><strong>🏥 Clínica:</strong> SONRISOFT</p>
//               <p><strong>📋 Motivo:</strong> ${cita.motivo || 'Consulta general'}</p>
//             </div>
//             <p>¡Te esperamos! 😊</p>
//           </div>
//         `
//       }

//       console.log('📤 Enviando el email...')
//       await Promise.race([
//         transporter.sendMail(mailOptions),
//         new Promise((_, reject) => 
//           setTimeout(() => reject(new Error('Timeout enviando email')), 60000)
//         )
//       ])
      
//       console.log(`✅ Email enviado exitosamente en intento ${intento}`)
//       return {
//         success: true,
//         mensaje: 'Email enviado correctamente'
//       }
      
//     } catch (error) {
//       console.error(`❌ Error en intento ${intento}:`, error)
      
//       if (intento === maxIntentos) {
//         return {
//           success: false,
//           mensaje: `Error al enviar email tras ${maxIntentos} intentos: ${error instanceof Error ? error.message : String(error)}`
//         }
//       }
      
//       await new Promise(resolve => setTimeout(resolve, 5000 * intento))
//     }
//   }
  
//   return {
//     success: false,
//     mensaje: 'Error inesperado en envío de email'
//   }
// }
//================================================================nuevo---------------------------------------------------


// import { NextRequest, NextResponse } from 'next/server'
// import { prisma } from '@/lib/prisma'
// import { auth } from '@clerk/nextjs/server'
// import Brevo from '@getbrevo/brevo'
// import { toZonedTime, formatInTimeZone } from 'date-fns-tz'

// Definir tipos para Cita y Paciente
// interface Paciente {
//   id: string
//   nombres: string
//   apellidos: string
//   dni: string
//   telefono?: string | null
//   email?: string | null
// }

// interface Cita {
//   id: string
//   idPaciente: string
//   fechaHora: Date
//   estado: 'SOLICITADA' | 'CONFIRMADA' | 'MODIFICADA' | 'CANCELADA'
//   motivo?: string | null
//   observaciones?: string | null
//   paciente: Paciente
//   createdAt: Date
//   updatedAt: Date
//   telefonoContacto?: string | null
//   emailContacto?: string | null
// }

// POST - Enviar recordatorios automáticos
// export async function POST(request: NextRequest) {
//   const startTime = Date.now()
//   console.log('🚀 [PROD] Iniciando recordatorios:', new Date().toISOString())
  
//   let attempts = 0
//   const maxAttempts = 3
//   const timeZone = 'America/Lima' // Zona horaria para Perú

//   while (attempts < maxAttempts) {
//     try {
//       attempts++
//       console.log(`📍 Intento ${attempts}/${maxAttempts}`)

//       const authData = await auth()
//       const userId = authData?.userId
//       if (!userId) {
//         return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
//       }

//       Verificar variables de entorno críticas
//       const requiredEnvs = ['DATABASE_URL', 'BREVO_API_KEY']
//       const missingEnvs = requiredEnvs.filter(env => !process.env[env])
      
//       if (missingEnvs.length > 0) {
//         console.error('❌ Variables de entorno faltantes:', missingEnvs)
//         return NextResponse.json({
//           success: false,
//           error: `Variables de entorno no configuradas: ${missingEnvs.join(', ')}`
//         }, { status: 500 })
//       }

//       console.log('📋 Verificando conexión a base de datos...')
//       await prisma.$queryRaw`SELECT 1`
//       console.log('✅ Conexión a BD exitosa')

//       Calcular fecha de mañana en la zona horaria deseada
//       const ahora = toZonedTime(new Date(), timeZone)
//       const manana = new Date(ahora)
//       manana.setDate(ahora.getDate() + 1)
      
//       const inicioDia = toZonedTime(
//         new Date(manana.getFullYear(), manana.getMonth(), manana.getDate(), 0, 0, 0),
//         timeZone
//       )
//       const finDia = toZonedTime(
//         new Date(manana.getFullYear(), manana.getMonth(), manana.getDate(), 23, 59, 59),
//         timeZone
//       )

//       Log para depuración
//       console.log(`🔍 Buscando citas para: ${formatInTimeZone(manana, timeZone, 'dd/MM/yyyy')}`)
//       console.log(`📅 Rango de búsqueda: ${inicioDia.toISOString()} - ${finDia.toISOString()}`)

//       Buscar citas para mañana con timeout
//       const citasManana: Cita[] = await Promise.race([
//         prisma.cita.findMany({
//           where: {
//             fechaHora: {
//               gte: inicioDia,
//               lte: finDia
//             },
//             estado: {
//               in: ['SOLICITADA', 'CONFIRMADA']
//             }
//           },
//           include: {
//             paciente: {
//               select: {
//                 id: true,
//                 nombres: true,
//                 apellidos: true,
//                 dni: true,
//                 telefono: true,
//                 email: true
//               }
//             }
//           }
//         }) as Promise<Cita[]>,
//         new Promise<never>((_, reject) => 
//           setTimeout(() => reject(new Error('Timeout en consulta BD')), 60000)
//         )
//       ])

//       Log para depuración: listar citas encontradas
//       console.log(`📋 Encontradas ${citasManana.length} citas para mañana`)
//       citasManana.forEach((cita, index) => {
//         console.log(`Cita ${index + 1}: ID=${cita.id}, Fecha=${cita.fechaHora.toISOString()}, Estado=${cita.estado}`)
//       })

//       if (citasManana.length === 0) {
//         Log adicional para todas las citas (para depuración)
//         const todasCitas = await prisma.cita.findMany({
//           where: {
//             estado: {
//               in: ['SOLICITADA', 'CONFIRMADA']
//             }
//           },
//           select: {
//             id: true,
//             fechaHora: true,
//             estado: true
//           }
//         })
//         console.log('📋 Todas las citas disponibles:', JSON.stringify(todasCitas, null, 2))
        
//         return NextResponse.json({
//           success: true,
//           message: 'No hay citas programadas para mañana',
//           enviados: 0,
//           totalCitas: 0,
//           detalles: [],
//           conectado: true
//         })
//       }

//       let recordatoriosEnviados = 0
//       const resultados = []

//       for (const cita of citasManana) {
//         try {
//           console.log(`\n🔄 Procesando: ${cita.paciente.nombres} ${cita.paciente.apellidos}`)

//           Verificar recordatorio existente
//           const hoyInicio = toZonedTime(new Date(), timeZone)
//           hoyInicio.setHours(0, 0, 0, 0)
//           const hoyFin = toZonedTime(new Date(), timeZone)
//           hoyFin.setHours(23, 59, 59, 999)

//           const recordatorioExistente = await prisma.recordatorio.findFirst({
//             where: {
//               idCita: cita.id,
//               fechaEnvio: {
//                 gte: hoyInicio,
//                 lte: hoyFin
//               }
//             }
//           })

//           if (recordatorioExistente) {
//             console.log(`⚠️ Ya enviado hoy para ${cita.paciente.nombres}`)
//             resultados.push({
//               paciente: `${cita.paciente.nombres} ${cita.paciente.apellidos}`,
//               estado: 'YA_ENVIADO',
//               fecha: cita.fechaHora,
//               mensaje: 'Recordatorio ya enviado hoy'
//             })
//             continue
//           }

//           let recordatoriosEnviadosPaciente = 0
//           const emailFinal = cita.emailContacto || cita.paciente.email

//           📧 ENVIAR EMAIL
//           if (emailFinal) {
//             console.log(`📧 Enviando Email a: ${emailFinal}`)
            
//             const resultadoEmail = await enviarEmailConReintentos(cita, emailFinal)
            
//             await prisma.recordatorio.create({
//               data: {
//                 idCita: cita.id,
//                 fechaEnvio: new Date(),
//                 medio: 'EMAIL',
//                 estado: resultadoEmail.success ? 'ENVIADO' : 'FALLIDO'
//               }
//             })

//             if (resultadoEmail.success) {
//               recordatoriosEnviadosPaciente++
//             }

//             resultados.push({
//               paciente: `${cita.paciente.nombres} ${cita.paciente.apellidos}`,
//               estado: resultadoEmail.success ? 'ENVIADO' : 'FALLIDO',
//               medio: 'EMAIL',
//               email: emailFinal,
//               fecha: cita.fechaHora,
//               motivo: cita.motivo,
//               mensaje: resultadoEmail.mensaje
//             })
//           } else {
//             resultados.push({
//               paciente: `${cita.paciente.nombres} ${cita.paciente.apellidos}`,
//               estado: 'SIN_CONTACTO',
//               fecha: cita.fechaHora,
//               mensaje: 'Sin email disponible'
//             })
//           }

//           recordatoriosEnviados += recordatoriosEnviadosPaciente

//         } catch (error) {
//           console.error(`❌ Error procesando cita ${cita.id}:`, error)
//           resultados.push({
//             paciente: `${cita.paciente.nombres} ${cita.paciente.apellidos}`,
//             estado: 'ERROR',
//             fecha: cita.fechaHora,
//             mensaje: `Error: ${error instanceof Error ? error.message : 'Error desconocido'}`
//           })
//         }
//       }

//       const duration = Date.now() - startTime
//       console.log(`\n📊 RESUMEN: ${recordatoriosEnviados}/${citasManana.length} enviados en ${duration}ms`)

//       return NextResponse.json({
//         success: true,
//         message: `Proceso completado: ${recordatoriosEnviados} recordatorios enviados`,
//         enviados: recordatoriosEnviados,
//         totalCitas: citasManana.length,
//         detalles: resultados,
//         conectado: true
//       })

//     } catch (error) {
//       const duration = Date.now() - startTime
//       console.error(`❌ Intento ${attempts} falló después de ${duration}ms:`, error)
      
//       if (attempts === maxAttempts) {
//         return NextResponse.json({
//           success: false,
//           error: 'Servicio temporalmente no disponible tras múltiples intentos',
//           detalle: error instanceof Error ? error.message : 'Error desconocido'
//         }, { status: 503 })
//       }
      
//       Esperar antes de reintentar (backoff exponencial)
//       const waitTime = 1000 * Math.pow(2, attempts - 1)
//       console.log(`⏳ Esperando ${waitTime}ms antes del siguiente intento...`)
//       await new Promise(resolve => setTimeout(resolve, waitTime))
//     }
//   }
// }

// async function enviarEmailConReintentos(cita: Cita, email: string) {
//   const maxIntentos = 3
//   const timeZone = 'America/Lima'

//   for (let intento = 1; intento <= maxIntentos; intento++) {
//     try {
//       console.log(`📧 Intento ${intento}/${maxIntentos} enviando email a ${email}`)
      
//       if (!process.env.BREVO_API_KEY) {
//         throw new Error('Clave API de Brevo no configurada')
//       }

//       const fechaCita = toZonedTime(new Date(cita.fechaHora), timeZone)
//       const fechaFormateada = formatInTimeZone(fechaCita, timeZone, 'eeee, d MMMM yyyy')
//       const horaFormateada = formatInTimeZone(fechaCita, timeZone, 'HH:mm')

//       const apiInstance = new Brevo.TransactionalEmailsApi()
//       apiInstance.setApiKey(Brevo.TransactionalEmailsApiApiKeys.apiKey, process.env.BREVO_API_KEY)

//       const sendSmtpEmail = new Brevo.SendSmtpEmail()
//       sendSmtpEmail.sender = { name: 'SONRISOFT Clínica Dental', email: 'fiorellatah6.2@gmail.com' }
//       sendSmtpEmail.to = [{ email }]
//       sendSmtpEmail.subject = '🦷 Recordatorio de Cita - SONRISOFT Clínica Dental'
//       sendSmtpEmail.htmlContent = `
//         <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
//           <h2 style="color: #2563eb;">📅 Recordatorio de Cita</h2>
//           <p>¡Hola ${cita.paciente.nombres}!</p>
//           <p>Te recordamos tu cita para <strong>MAÑANA</strong>:</p>
//           <div style="background: #f8fafc; padding: 15px; border-radius: 8px;">
//             <p><strong>📅 Fecha:</strong> ${fechaFormateada}</p>
//             <p><strong>🕐 Hora:</strong> ${horaFormateada}</p>
//             <p><strong>🏥 Clínica:</strong> SONRISOFT</p>
//             <p><strong>📋 Motivo:</strong> ${cita.motivo || 'Consulta general'}</p>
//           </div>
//           <p>¡Te esperamos! 😊</p>
//         </div>
//       `

//       console.log('📤 Enviando el email...')
//       await Promise.race([
//         apiInstance.sendTransacEmail(sendSmtpEmail),
//         new Promise((_, reject) => 
//           setTimeout(() => reject(new Error('Timeout enviando email')), 60000)
//         )
//       ])
      
//       console.log(`✅ Email enviado exitosamente en intento ${intento}`)
//       return {
//         success: true,
//         mensaje: 'Email enviado correctamente'
//       }
      
//     } catch (error) {
//       console.error(`❌ Error en intento ${intento}:`, error)
      
//       if (intento === maxIntentos) {
//         return {
//           success: false,
//           mensaje: `Error al enviar email tras ${maxIntentos} intentos: ${error instanceof Error ? error.message : String(error)}`
//         }
//       }
      
//       await new Promise(resolve => setTimeout(resolve, 5000 * intento))
//     }
//   }
  
//   return {
//     success: false,
//     mensaje: 'Error inesperado en envío de email'
//   }
// }



//nuevo------------------------------------------
// app/api/citas/recordatorios/route.ts 
//----nuevo con brevo----------
// app/api/citas/recordatorios/route.ts
// app/api/citas/recordatorios/route.ts
// //=======================================================================================================================

// import { NextRequest, NextResponse } from 'next/server';
// import { prisma } from '@/lib/prisma';
// import { auth } from '@clerk/nextjs/server';
// import Brevo from '@getbrevo/brevo';
// import { toZonedTime, formatInTimeZone } from 'date-fns-tz';

// // Definir tipos para Cita y Paciente
// interface Paciente {
//   id: string;
//   nombres: string;
//   apellidos: string;
//   dni: string;
//   telefono?: string | null;
//   email?: string | null;
// }

// interface Cita {
//   id: string;
//   idPaciente: string;
//   fechaHora: Date;
//   estado: 'SOLICITADA' | 'CONFIRMADA' | 'MODIFICADA' | 'CANCELADA';
//   motivo?: string | null;
//   observaciones?: string | null;
//   paciente: Paciente;
//   createdAt: Date;
//   updatedAt: Date;
//   telefonoContacto?: string | null;
//   emailContacto?: string | null;
// }

// // POST - Enviar recordatorios automáticos
// export async function POST(request: NextRequest) {
//   const startTime = Date.now();
//   console.log('🚀 [PROD] Iniciando recordatorios:', new Date().toISOString());

//   let attempts = 0;
//   const maxAttempts = 3;
//   const timeZone = 'America/Lima'; // Zona horaria para Perú

//   while (attempts < maxAttempts) {
//     try {
//       attempts++;
//       console.log(`📍 Intento ${attempts}/${maxAttempts}`);

//       const authData = await auth();
//       const userId = authData?.userId;
//       if (!userId) {
//         return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
//       }

//       // Verificar variables de entorno críticas
//       const requiredEnvs = ['DATABASE_URL', 'BREVO_API_KEY'];
//       const missingEnvs = requiredEnvs.filter((env) => !process.env[env]);

//       if (missingEnvs.length > 0) {
//         console.error('❌ Variables de entorno faltantes:', missingEnvs);
//         return NextResponse.json({
//           success: false,
//           error: `Variables de entorno no configuradas: ${missingEnvs.join(', ')}`,
//         }, { status: 500 });
//       }

//       console.log('📋 Verificando conexión a base de datos...');
//       await prisma.$queryRaw`SELECT 1`;
//       console.log('✅ Conexión a BD exitosa');

//       // Calcular fecha de mañana en la zona horaria deseada
//       const ahora = toZonedTime(new Date(), timeZone);
//       const manana = new Date(ahora);
//       manana.setDate(ahora.getDate() + 1);

//       const inicioDia = toZonedTime(
//         new Date(manana.getFullYear(), manana.getMonth(), manana.getDate(), 0, 0, 0),
//         timeZone
//       );
//       const finDia = toZonedTime(
//         new Date(manana.getFullYear(), manana.getMonth(), manana.getDate(), 23, 59, 59),
//         timeZone
//       );

//       // Log para depuración
//       console.log(`🔍 Buscando citas para: ${formatInTimeZone(manana, timeZone, 'dd/MM/yyyy')}`);
//       console.log(`📅 Rango de búsqueda: ${inicioDia.toISOString()} - ${finDia.toISOString()}`);

//       // Buscar citas para mañana con timeout
//       const citasManana: Cita[] = await Promise.race([
//         prisma.cita.findMany({
//           where: {
//             fechaHora: {
//               gte: inicioDia,
//               lte: finDia,
//             },
//             estado: {
//               in: ['SOLICITADA', 'CONFIRMADA'],
//             },
//           },
//           include: {
//             paciente: {
//               select: {
//                 id: true,
//                 nombres: true,
//                 apellidos: true,
//                 dni: true,
//                 telefono: true,
//                 email: true,
//               },
//             },
//           },
//         }) as Promise<Cita[]>,
//         new Promise<never>((_, reject) =>
//           setTimeout(() => reject(new Error('Timeout en consulta BD')), 60000)
//         ),
//       ]);

//       // Log para depuración: listar citas encontradas
//       console.log(`📋 Encontradas ${citasManana.length} citas para mañana`);
//       citasManana.forEach((cita, index) => {
//         console.log(`Cita ${index + 1}: ID=${cita.id}, Fecha=${cita.fechaHora.toISOString()}, Estado=${cita.estado}`);
//       });

//       if (citasManana.length === 0) {
//         // Log adicional para todas las citas (para depuración)
//         const todasCitas = await prisma.cita.findMany({
//           where: {
//             estado: {
//               in: ['SOLICITADA', 'CONFIRMADA'],
//             },
//           },
//           select: {
//             id: true,
//             fechaHora: true,
//             estado: true,
//           },
//         });
//         console.log('📋 Todas las citas disponibles:', JSON.stringify(todasCitas, null, 2));

//         return NextResponse.json({
//           success: true,
//           message: 'No hay citas programadas para mañana',
//           enviados: 0,
//           totalCitas: 0,
//           detalles: [],
//           conectado: true,
//         });
//       }

//       let recordatoriosEnviados = 0;
//       const resultados = [];

//       for (const cita of citasManana) {
//         try {
//           console.log(`\n🔄 Procesando: ${cita.paciente.nombres} ${cita.paciente.apellidos}`);

//           // Verificar recordatorio existente
//           const hoyInicio = toZonedTime(new Date(), timeZone);
//           hoyInicio.setHours(0, 0, 0, 0);
//           const hoyFin = toZonedTime(new Date(), timeZone);
//           hoyFin.setHours(23, 59, 59, 999);

//           const recordatorioExistente = await prisma.recordatorio.findFirst({
//             where: {
//               idCita: cita.id,
//               fechaEnvio: {
//                 gte: hoyInicio,
//                 lte: hoyFin,
//               },
//             },
//           });

//           if (recordatorioExistente) {
//             console.log(`⚠️ Ya enviado hoy para ${cita.paciente.nombres}`);
//             resultados.push({
//               paciente: `${cita.paciente.nombres} ${cita.paciente.apellidos}`,
//               estado: 'YA_ENVIADO',
//               fecha: cita.fechaHora,
//               mensaje: 'Recordatorio ya enviado hoy',
//             });
//             continue;
//           }

//           let recordatoriosEnviadosPaciente = 0;
//           const emailFinal = cita.emailContacto || cita.paciente.email;

//           // 📧 ENVIAR EMAIL
//           if (emailFinal) {
//             console.log(`📧 Enviando Email a: ${emailFinal}`);

//             const resultadoEmail = await enviarEmailConReintentos(cita, emailFinal);

//             await prisma.recordatorio.create({
//               data: {
//                 idCita: cita.id,
//                 fechaEnvio: new Date(),
//                 medio: 'EMAIL',
//                 estado: resultadoEmail.success ? 'ENVIADO' : 'FALLIDO',
//               },
//             });

//             if (resultadoEmail.success) {
//               recordatoriosEnviadosPaciente++;
//             }

//             resultados.push({
//               paciente: `${cita.paciente.nombres} ${cita.paciente.apellidos}`,
//               estado: resultadoEmail.success ? 'ENVIADO' : 'FALLIDO',
//               medio: 'EMAIL',
//               email: emailFinal,
//               fecha: cita.fechaHora,
//               motivo: cita.motivo,
//               mensaje: resultadoEmail.mensaje,
//             });
//           } else {
//             resultados.push({
//               paciente: `${cita.paciente.nombres} ${cita.paciente.apellidos}`,
//               estado: 'SIN_CONTACTO',
//               fecha: cita.fechaHora,
//               mensaje: 'Sin email disponible',
//             });
//           }

//           recordatoriosEnviados += recordatoriosEnviadosPaciente;

//         } catch (error) {
//           console.error(`❌ Error procesando cita ${cita.id}:`, error);
//           resultados.push({
//             paciente: `${cita.paciente.nombres} ${cita.paciente.apellidos}`,
//             estado: 'ERROR',
//             fecha: cita.fechaHora,
//             mensaje: `Error: ${error instanceof Error ? error.message : 'Error desconocido'}`,
//           });
//         }
//       }

//       const duration = Date.now() - startTime;
//       console.log(`\n📊 RESUMEN: ${recordatoriosEnviados}/${citasManana.length} enviados en ${duration}ms`);

//       return NextResponse.json({
//         success: true,
//         message: `Proceso completado: ${recordatoriosEnviados} recordatorios enviados`,
//         enviados: recordatoriosEnviados,
//         totalCitas: citasManana.length,
//         detalles: resultados,
//         conectado: true,
//       });

//     } catch (error) {
//       const duration = Date.now() - startTime;
//       console.error(`❌ Intento ${attempts} falló después de ${duration}ms:`, error);

//       if (attempts === maxAttempts) {
//         return NextResponse.json({
//           success: false,
//           error: 'Servicio temporalmente no disponible tras múltiples intentos',
//           detalle: error instanceof Error ? error.message : 'Error desconocido',
//         }, { status: 503 });
//       }

//       // Esperar antes de reintentar (backoff exponencial)
//       const waitTime = 1000 * Math.pow(2, attempts - 1);
//       console.log(`⏳ Esperando ${waitTime}ms antes del siguiente intento...`);
//       await new Promise((resolve) => setTimeout(resolve, waitTime));
//     }
//   }
// }

// // async function enviarEmailConReintentos(cita: Cita, email: string) {
// //   const maxIntentos = 3;
// //   const timeZone = 'America/Lima';

// //   for (let intento = 1; intento <= maxIntentos; intento++) {
// //     try {
// //       console.log(`📧 Intento ${intento}/${maxIntentos} enviando email a ${email}`);

// //       if (!process.env.BREVO_API_KEY) {
// //         throw new Error('Clave API de Brevo no configurada');
// //       }

// //       const fechaCita = toZonedTime(new Date(cita.fechaHora), timeZone);
// //       const fechaFormateada = formatInTimeZone(fechaCita, timeZone, 'eeee, d MMMM yyyy');
// //       const horaFormateada = formatInTimeZone(fechaCita, timeZone, 'HH:mm');

// //       // Configuración de la API con autenticación correcta
// //       const apiConfig = new Brevo.Configuration();
// //       apiConfig.apiKey = 'xkeysib-' + process.env.BREVO_API_KEY; // Formato esperado por Brevo

// //       const transactionalApi = new Brevo.TransactionalEmailsApi(apiConfig);

// //       const sendSmtpEmail = new Brevo.SendSmtpEmail();
// //       sendSmtpEmail.sender = { name: 'SONRISOFT Clínica Dental', email: 'fiorellatah6.2@gmail.com' };
// //       sendSmtpEmail.to = [{ email }];
// //       sendSmtpEmail.subject = '🦷 Recordatorio de Cita - SONRISOFT Clínica Dental';
// //       sendSmtpEmail.htmlContent = `
// //         <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
// //           <h2 style="color: #2563eb;">📅 Recordatorio de Cita</h2>
// //           <p>¡Hola ${cita.paciente.nombres}!</p>
// //           <p>Te recordamos tu cita para <strong>MAÑANA</strong>:</p>
// //           <div style="background: #f8fafc; padding: 15px; border-radius: 8px;">
// //             <p><strong>📅 Fecha:</strong> ${fechaFormateada}</p>
// //             <p><strong>🕐 Hora:</strong> ${horaFormateada}</p>
// //             <p><strong>🏥 Clínica:</strong> SONRISOFT</p>
// //             <p><strong>📋 Motivo:</strong> ${cita.motivo || 'Consulta general'}</p>
// //           </div>
// //           <p>¡Te esperamos! 😊</p>
// //         </div>
// //       `;

// //       console.log('📤 Enviando el email...');
// //       await Promise.race([
// //         transactionalApi.sendTransacEmail(sendSmtpEmail),
// //         new Promise((_, reject) =>
// //           setTimeout(() => reject(new Error('Timeout enviando email')), 60000)
// //         ),
// //       ]);

// //       console.log(`✅ Email enviado exitosamente en intento ${intento}`);
// //       return {
// //         success: true,
// //         mensaje: 'Email enviado correctamente',
// //       };

// //     } catch (error) {
// //       console.error(`❌ Error en intento ${intento}:`, error);

// //       if (intento === maxIntentos) {
// //         return {
// //           success: false,
// //           mensaje: `Error al enviar email tras ${maxIntentos} intentos: ${error instanceof Error ? error.message : String(error)}`,
// //         };
// //       }

// //       await new Promise((resolve) => setTimeout(resolve, 5000 * intento));
// //     }
// //   }

// //   return {
// //     success: false,
// //     mensaje: 'Error inesperado en envío de email',
// //   };
// // }
// async function enviarEmailConReintentos(cita: Cita, email: string) {
//   const maxIntentos = 3;
//   const timeZone = 'America/Lima';

//   for (let intento = 1; intento <= maxIntentos; intento++) {
//     try {
//       console.log(`📧 Intento ${intento}/${maxIntentos} enviando email a ${email}`);

//       if (!process.env.BREVO_API_KEY) {
//         throw new Error('Clave API de Brevo no configurada');
//       }

//       const fechaCita = toZonedTime(new Date(cita.fechaHora), timeZone);
//       const fechaFormateada = formatInTimeZone(fechaCita, timeZone, 'eeee, d MMMM yyyy');
//       const horaFormateada = formatInTimeZone(fechaCita, timeZone, 'HH:mm');

//       // Inicialización corregida del SDK
//       const apiInstance = new Brevo.ApiClient(); // Usa ApiClient como base
//       apiInstance.authentications['apiKey'].apiKey = process.env.BREVO_API_KEY;

//       const transactionalApi = new Brevo.TransactionalEmailsApi(apiInstance); // Instancia específica

//       const sendSmtpEmail = new Brevo.SendSmtpEmail();
//       sendSmtpEmail.sender = { name: 'Fiorella - Pruebas', email: 'fiorellatah6.2@gmail.com' }; // Usa tu correo verificado
//       sendSmtpEmail.to = [{ email }];
//       sendSmtpEmail.subject = '🦷 Recordatorio de Cita - SONRISOFT Clínica Dental';
//       sendSmtpEmail.htmlContent = `
//         <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
//           <h2 style="color: #2563eb;">📅 Recordatorio de Cita</h2>
//           <p>¡Hola ${cita.paciente.nombres}!</p>
//           <p>Te recordamos tu cita para <strong>MAÑANA</strong>:</p>
//           <div style="background: #f8fafc; padding: 15px; border-radius: 8px;">
//             <p><strong>📅 Fecha:</strong> ${fechaFormateada}</p>
//             <p><strong>🕐 Hora:</strong> ${horaFormateada}</p>
//             <p><strong>🏥 Clínica:</strong> SONRISOFT</p>
//             <p><strong>📋 Motivo:</strong> ${cita.motivo || 'Consulta general'}</p>
//           </div>
//           <p>¡Te esperamos! 😊</p>
//         </div>
//       `;

//       console.log('📤 Enviando el email...');
//       await Promise.race([
//         transactionalApi.sendTransacEmail(sendSmtpEmail),
//         new Promise((_, reject) => 
//           setTimeout(() => reject(new Error('Timeout enviando email')), 60000)
//         )
//       ]);

//       console.log(`✅ Email enviado exitosamente en intento ${intento}`);
//       return {
//         success: true,
//         mensaje: 'Email enviado correctamente'
//       };

//     } catch (error) {
//       console.error(`❌ Error en intento ${intento}:`, error);

//       if (intento === maxIntentos) {
//         return {
//           success: false,
//           mensaje: `Error al enviar email tras ${maxIntentos} intentos: ${error instanceof Error ? error.message : String(error)}`
//         };
//       }

//       await new Promise(resolve => setTimeout(resolve, 5000 * intento));
//     }
//   }

//   return {
//     success: false,
//     mensaje: 'Error inesperado en envío de email'
//   };
// }


//==========================================================================
// app/api/citas/recordatorios/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@clerk/nextjs/server';
import * as Brevo from '@getbrevo/brevo';
import { toZonedTime, formatInTimeZone } from 'date-fns-tz';

// Definir tipos para Cita y Paciente
interface Paciente {
  id: string;
  nombres: string;
  apellidos: string;
  dni: string;
  telefono?: string | null;
  email?: string | null;
}

interface Cita {
  id: string;
  idPaciente: string;
  fechaHora: Date;
  estado: 'SOLICITADA' | 'CONFIRMADA' | 'MODIFICADA' | 'CANCELADA';
  motivo?: string | null;
  observaciones?: string | null;
  paciente: Paciente;
  createdAt: Date;
  updatedAt: Date;
  telefonoContacto?: string | null;
  emailContacto?: string | null;
}

// POST - Enviar recordatorios automáticos
export async function POST(request: NextRequest) {
  const startTime = Date.now();
  console.log('🚀 [PROD] Iniciando recordatorios:', new Date().toISOString());

  let attempts = 0;
  const maxAttempts = 3;
  const timeZone = 'America/Lima';

  while (attempts < maxAttempts) {
    try {
      attempts++;
      console.log(`📍 Intento ${attempts}/${maxAttempts}`);

      const authData = await auth();
      const userId = authData?.userId;
      if (!userId) {
        return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
      }

      // Verificar variables de entorno críticas
      const requiredEnvs = ['DATABASE_URL', 'BREVO_API_KEY'];
      const missingEnvs = requiredEnvs.filter((env) => !process.env[env]);

      if (missingEnvs.length > 0) {
        console.error('❌ Variables de entorno faltantes:', missingEnvs);
        return NextResponse.json({
          success: false,
          error: `Variables de entorno no configuradas: ${missingEnvs.join(', ')}`,
        }, { status: 500 });
      }

      console.log('📋 Verificando conexión a base de datos...');
      await prisma.$queryRaw`SELECT 1`;
      console.log('✅ Conexión a BD exitosa');

      // Calcular fecha de mañana en la zona horaria deseada
      const ahora = toZonedTime(new Date(), timeZone);
      const manana = new Date(ahora);
      manana.setDate(ahora.getDate() + 1);

      const inicioDia = toZonedTime(
        new Date(manana.getFullYear(), manana.getMonth(), manana.getDate(), 0, 0, 0),
        timeZone
      );
      const finDia = toZonedTime(
        new Date(manana.getFullYear(), manana.getMonth(), manana.getDate(), 23, 59, 59),
        timeZone
      );

      console.log(`🔍 Buscando citas para: ${formatInTimeZone(manana, timeZone, 'dd/MM/yyyy')}`);
      console.log(`📅 Rango de búsqueda: ${inicioDia.toISOString()} - ${finDia.toISOString()}`);

      // Buscar citas para mañana
      const citasManana: Cita[] = await Promise.race([
        prisma.cita.findMany({
          where: {
            fechaHora: {
              gte: inicioDia,
              lte: finDia,
            },
            estado: {
              in: ['SOLICITADA', 'CONFIRMADA'],
            },
          },
          include: {
            paciente: {
              select: {
                id: true,
                nombres: true,
                apellidos: true,
                dni: true,
                telefono: true,
                email: true,
              },
            },
          },
        }) as Promise<Cita[]>,
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('Timeout en consulta BD')), 60000)
        ),
      ]);

      console.log(`📋 Encontradas ${citasManana.length} citas para mañana`);
      
      if (citasManana.length === 0) {
        return NextResponse.json({
          success: true,
          message: 'No hay citas programadas para mañana',
          enviados: 0,
          totalCitas: 0,
          detalles: [],
          conectado: true,
        });
      }

      let recordatoriosEnviados = 0;
      const resultados = [];

      for (const cita of citasManana) {
        try {
          console.log(`\n🔄 Procesando: ${cita.paciente.nombres} ${cita.paciente.apellidos}`);

          // Verificar recordatorio existente
          const hoyInicio = toZonedTime(new Date(), timeZone);
          hoyInicio.setHours(0, 0, 0, 0);
          const hoyFin = toZonedTime(new Date(), timeZone);
          hoyFin.setHours(23, 59, 59, 999);

          const recordatorioExistente = await prisma.recordatorio.findFirst({
            where: {
              idCita: cita.id,
              fechaEnvio: {
                gte: hoyInicio,
                lte: hoyFin,
              },
            },
          });

          if (recordatorioExistente) {
            console.log(`⚠️ Ya enviado hoy para ${cita.paciente.nombres}`);
            resultados.push({
              paciente: `${cita.paciente.nombres} ${cita.paciente.apellidos}`,
              estado: 'YA_ENVIADO',
              fecha: cita.fechaHora,
              mensaje: 'Recordatorio ya enviado hoy',
            });
            continue;
          }

          let recordatoriosEnviadosPaciente = 0;
          const emailFinal = cita.emailContacto || cita.paciente.email;

          if (emailFinal) {
            console.log(`📧 Enviando Email a: ${emailFinal}`);

            const resultadoEmail = await enviarEmailConReintentos(cita, emailFinal);

            await prisma.recordatorio.create({
              data: {
                idCita: cita.id,
                fechaEnvio: new Date(),
                medio: 'EMAIL',
                estado: resultadoEmail.success ? 'ENVIADO' : 'FALLIDO',
              },
            });

            if (resultadoEmail.success) {
              recordatoriosEnviadosPaciente++;
            }

            resultados.push({
              paciente: `${cita.paciente.nombres} ${cita.paciente.apellidos}`,
              estado: resultadoEmail.success ? 'ENVIADO' : 'FALLIDO',
              medio: 'EMAIL',
              email: emailFinal,
              fecha: cita.fechaHora,
              motivo: cita.motivo,
              mensaje: resultadoEmail.mensaje,
            });
          } else {
            resultados.push({
              paciente: `${cita.paciente.nombres} ${cita.paciente.apellidos}`,
              estado: 'SIN_CONTACTO',
              fecha: cita.fechaHora,
              mensaje: 'Sin email disponible',
            });
          }

          recordatoriosEnviados += recordatoriosEnviadosPaciente;

        } catch (error) {
          console.error(`❌ Error procesando cita ${cita.id}:`, error);
          resultados.push({
            paciente: `${cita.paciente.nombres} ${cita.paciente.apellidos}`,
            estado: 'ERROR',
            fecha: cita.fechaHora,
            mensaje: `Error: ${error instanceof Error ? error.message : 'Error desconocido'}`,
          });
        }
      }

      const duration = Date.now() - startTime;
      console.log(`\n📊 RESUMEN: ${recordatoriosEnviados}/${citasManana.length} enviados en ${duration}ms`);

      return NextResponse.json({
        success: true,
        message: `Proceso completado: ${recordatoriosEnviados} recordatorios enviados`,
        enviados: recordatoriosEnviados,
        totalCitas: citasManana.length,
        detalles: resultados,
        conectado: true,
      });

    } catch (error) {
      const duration = Date.now() - startTime;
      console.error(`❌ Intento ${attempts} falló después de ${duration}ms:`, error);

      if (attempts === maxAttempts) {
        return NextResponse.json({
          success: false,
          error: 'Servicio temporalmente no disponible tras múltiples intentos',
          detalle: error instanceof Error ? error.message : 'Error desconocido',
        }, { status: 503 });
      }

      const waitTime = 1000 * Math.pow(2, attempts - 1);
      console.log(`⏳ Esperando ${waitTime}ms antes del siguiente intento...`);
      await new Promise((resolve) => setTimeout(resolve, waitTime));
    }
  }
}

// FUNCIÓN CORREGIDA PARA ENVIAR EMAIL CON BREVO
async function enviarEmailConReintentos(cita: Cita, email: string) {
  const maxIntentos = 3;
  const timeZone = 'America/Lima';

  for (let intento = 1; intento <= maxIntentos; intento++) {
    try {
      console.log(`📧 Intento ${intento}/${maxIntentos} enviando email a ${email}`);

      if (!process.env.BREVO_API_KEY) {
        throw new Error('Clave API de Brevo no configurada');
      }

      const fechaCita = toZonedTime(new Date(cita.fechaHora), timeZone);
      const fechaFormateada = formatInTimeZone(fechaCita, timeZone, 'eeee, d MMMM yyyy');
      const horaFormateada = formatInTimeZone(fechaCita, timeZone, 'HH:mm');

      // CONFIGURACIÓN CORRECTA DE BREVO CON IMPORTACIÓN NAMESPACE
      const apiInstance = new Brevo.TransactionalEmailsApi();
      
      // Configurar la autenticación correctamente
      apiInstance.setApiKey(
        Brevo.TransactionalEmailsApiApiKeys.apiKey, 
        process.env.BREVO_API_KEY
      );

      const sendSmtpEmail = new Brevo.SendSmtpEmail();
      sendSmtpEmail.sender = { 
        name: 'SONRISOFT Clínica Dental', 
        email: process.env.EMAIL_USER || 'fiorellatah6.2@gmail.com' 
      };
      sendSmtpEmail.to = [{ email }];
      sendSmtpEmail.subject = '🦷 Recordatorio de Cita - SONRISOFT Clínica Dental';
      sendSmtpEmail.htmlContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #2563eb; margin: 0;">SONRISOFT</h1>
            <p style="color: #64748b; margin: 5px 0;">Clínica Dental</p>
          </div>
          
          <div style="background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%); color: white; padding: 20px; border-radius: 12px; text-align: center; margin-bottom: 25px;">
            <h2 style="margin: 0; font-size: 24px;">📅 Recordatorio de Cita</h2>
          </div>
          
          <p style="font-size: 18px; color: #1f2937;">¡Hola ${cita.paciente.nombres}!</p>
          
          <p style="font-size: 16px; color: #374151; line-height: 1.6;">
            Te recordamos que tienes una cita programada para <strong style="color: #dc2626;">MAÑANA</strong>:
          </p>
          
          <div style="background: #f8fafc; border: 2px solid #e2e8f0; padding: 25px; border-radius: 12px; margin: 25px 0;">
            <div style="display: grid; gap: 15px;">
              <div style="display: flex; align-items: center;">
                <span style="font-size: 20px; margin-right: 12px;">📅</span>
                <div>
                  <strong style="color: #1f2937;">Fecha:</strong>
                  <span style="color: #374151; margin-left: 8px;">${fechaFormateada}</span>
                </div>
              </div>
              
              <div style="display: flex; align-items: center;">
                <span style="font-size: 20px; margin-right: 12px;">🕐</span>
                <div>
                  <strong style="color: #1f2937;">Hora:</strong>
                  <span style="color: #374151; margin-left: 8px;">${horaFormateada}</span>
                </div>
              </div>
              
              <div style="display: flex; align-items: center;">
                <span style="font-size: 20px; margin-right: 12px;">🏥</span>
                <div>
                  <strong style="color: #1f2937;">Clínica:</strong>
                  <span style="color: #374151; margin-left: 8px;">SONRISOFT</span>
                </div>
              </div>
              
              <div style="display: flex; align-items: center;">
                <span style="font-size: 20px; margin-right: 12px;">📋</span>
                <div>
                  <strong style="color: #1f2937;">Motivo:</strong>
                  <span style="color: #374151; margin-left: 8px;">${cita.motivo || 'Consulta general'}</span>
                </div>
              </div>
            </div>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <div style="background: #dcfce7; border: 2px solid #16a34a; color: #15803d; padding: 15px; border-radius: 8px; display: inline-block;">
              <strong>💡 Recuerda llegar 15 minutos antes de tu cita</strong>
            </div>
          </div>
          
          <p style="text-align: center; font-size: 18px; color: #2563eb;">
            <strong>¡Te esperamos! 😊🦷</strong>
          </p>
          
          <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 30px 0;">
          
          <div style="text-align: center; color: #64748b; font-size: 14px;">
            <p style="margin: 5px 0;">SONRISOFT - Clínica Dental</p>
            <p style="margin: 5px 0;">Este es un recordatorio automático, no respondas a este correo</p>
          </div>
        </div>
      `;

      console.log('📤 Enviando el email con Brevo...');
      
      await Promise.race([
        apiInstance.sendTransacEmail(sendSmtpEmail),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Timeout enviando email')), 60000)
        )
      ]);

      console.log(`✅ Email enviado exitosamente en intento ${intento}`);
      return {
        success: true,
        mensaje: 'Email enviado correctamente con Brevo'
      };

    } catch (error) {
      console.error(`❌ Error en intento ${intento}:`, error);

      if (intento === maxIntentos) {
        return {
          success: false,
          mensaje: `Error al enviar email tras ${maxIntentos} intentos: ${error instanceof Error ? error.message : String(error)}`
        };
      }

      await new Promise(resolve => setTimeout(resolve, 2000 * intento));
    }
  }

  return {
    success: false,
    mensaje: 'Error inesperado en envío de email'
  };
}