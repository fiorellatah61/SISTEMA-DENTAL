//  SIRVE para inicializar WhatsApp junto con Next.js:
// scripts/start-with-whatsapp.ts - INICIAR NEXT.JS CON WHATSAPP

import { whatsappManager } from '../src/lib/whatsapp-manager'

async function startWithWhatsApp() {
  console.log('🤖 SONRISOFT - Iniciando Next.js con WhatsApp')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  
  try {
    console.log('📱 Inicializando WhatsApp Service...')
    
    const initialized = await whatsappManager.initialize()
    
    if (initialized) {
      console.log('✅ WhatsApp inicializado correctamente')
      
      // Verificar conexión cada 30 segundos
      setInterval(async () => {
        if (whatsappManager.isReady()) {
          const service = whatsappManager.getService()
          const user = await service.getConnectedUser()
          console.log(`💚 WhatsApp conectado | Usuario: ${user?.name || 'Desconocido'}`)
        } else {
          console.log('🔴 WhatsApp desconectado - reintentando...')
          await whatsappManager.ensureConnection()
        }
      }, 30000)
      
    } else {
      console.log('❌ No se pudo inicializar WhatsApp')
      console.log('⚠️ Los recordatorios no funcionarán hasta que conectes WhatsApp')
    }
    
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('🚀 WhatsApp listo para Next.js')
    console.log('🌐 Ahora inicia tu servidor Next.js: npm run dev')
    
  } catch (error) {
    console.error('❌ Error inicializando WhatsApp:', error)
    console.log('💡 Puedes seguir usando Next.js, pero sin WhatsApp')
  }
}

// Ejecutar si es llamado directamente
if (require.main === module) {
  startWithWhatsApp()
}

export default startWithWhatsApp