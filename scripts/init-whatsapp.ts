// scripts/init-whatsapp.ts
// scripts/init-whatsapp.ts (VERSIÓN CORREGIDA)
// Ejecutar con: npx tsx scripts/init-whatsapp.ts
// # 2. Elimina la sesión guardada:
// rm -rf auth_info_baileys

// # 3. Vuelve a ejecutar:
// npx tsx scripts/init-whatsapp.ts

// scripts/init-whatsapp.ts (VERSIÓN MEJORADA)
// scripts/init-whatsapp.ts - VERSIÓN MEJORADA SIN ERRORES

import { getWhatsAppService } from '../src/lib/whatsapp-service'

async function initializeWhatsApp() {
  console.log('🤖 SONRISOFT - WhatsApp Bot Service')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('🚀 Iniciando conexión con WhatsApp...')
  console.log('')
  
  const whatsappService = getWhatsAppService()
  
  try {
    const initialized = await whatsappService.initialize()
    
    if (!initialized) {
      console.error('❌ No se pudo inicializar el servicio de WhatsApp')
      process.exit(1)
    }
    
    // Manejar cierre del proceso
    process.on('SIGINT', async () => {
      console.log('\n🔌 Cerrando WhatsApp Service...')
      await whatsappService.disconnect()
      console.log('👋 ¡Hasta luego!')
      process.exit(0)
    })
    
    // Manejar errores no capturados
    process.on('uncaughtException', (error) => {
      console.error('❌ Error no capturado:', error.message)
    })
    
    process.on('unhandledRejection', (reason) => {
      console.error('❌ Promesa rechazada:', reason)
    })
    
    console.log('✅ Servicio inicializado correctamente')
    console.log('⏳ Esperando conexión... (Presiona Ctrl+C para salir)')
    console.log('')
    
    // Monitoreo del estado de conexión
    let lastStatus = false
    let statusCheckCount = 0
    
    const statusInterval = setInterval(async () => {
      const isReady = whatsappService.isReady()
      statusCheckCount++
      
      if (isReady && !lastStatus) {
        // Recién conectado
        console.log('💚 ¡WhatsApp conectado exitosamente!')
        
        // Mostrar información del usuario
        setTimeout(async () => {
          const user = await whatsappService.getConnectedUser()
          if (user) {
            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
            console.log('👤 INFORMACIÓN DE LA CUENTA CONECTADA:')
            console.log(`📱 Nombre: ${user.name || 'Sin nombre'}`)
            console.log(`📞 Teléfono: ${user.phoneNumber || 'Desconocido'}`)
            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
            console.log('✅ El servicio está listo para enviar mensajes')
            console.log('ℹ️  Ahora puedes usar la funcionalidad de recordatorios')
            console.log('')
          }
        }, 2000)
      } else if (!isReady && lastStatus) {
        // Recién desconectado
        console.log('🔴 WhatsApp desconectado - intentando reconectar...')
      }
      
      // Mostrar estado cada 10 checks (5 minutos) si está conectado
      if (isReady && statusCheckCount % 10 === 0) {
        console.log(`💚 Estado: Conectado (${new Date().toLocaleTimeString('es-PE')})`)
      }
      
      // Si lleva mucho tiempo desconectado, intentar reiniciar
      if (!isReady && statusCheckCount > 20) {
        console.log('🔄 Demasiado tiempo desconectado. Reiniciando servicio...')
        statusCheckCount = 0
        await whatsappService.initialize()
      }
      
      lastStatus = isReady
    }, 30000) // Cada 30 segundos
    
    // Función para probar el envío de mensajes
    const testMessage = async () => {
      if (whatsappService.isReady()) {
        console.log('\n🧪 MODO DE PRUEBA ACTIVADO')
        console.log('Para probar el envío de mensajes, puedes ejecutar:')
        console.log('```')
        console.log('const service = getWhatsAppService();')
        console.log('await service.sendMessage({')
        console.log('  to: "51987654321", // Tu número de prueba')
        console.log('  message: "Prueba de recordatorio automático 🦷"')
        console.log('});')
        console.log('```')
        console.log('')
      }
    }
    
    // Mostrar mensaje de prueba después de 1 minuto
    setTimeout(testMessage, 60000)
    
  } catch (error) {
    console.error('❌ Error crítico inicializando WhatsApp:', error)
    console.log('')
    console.log('💡 POSIBLES SOLUCIONES:')
    console.log('1. Verifica tu conexión a internet')
    console.log('2. Elimina la carpeta de autenticación:')
    console.log('   rm -rf auth_info_baileys')
    console.log('3. Vuelve a ejecutar el script')
    console.log('4. Asegúrate de tener instaladas todas las dependencias:')
    console.log('   npm install qrcode-terminal @types/qrcode-terminal')
    console.log('')
    process.exit(1)
  }
}

// Ejecutar si es llamado directamente
if (require.main === module) {
  initializeWhatsApp().catch(error => {
    console.error('❌ Error ejecutando el script:', error)
    process.exit(1)
  })
}

export default initializeWhatsApp