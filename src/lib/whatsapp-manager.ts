// // lib/whatsapp-manager.ts - GESTOR GLOBAL PARA NEXT.JS

// import { getWhatsAppService } from './whatsapp-service'

// class WhatsAppManager {
//   private static instance: WhatsAppManager | null = null
//   private initialized = false
//   private initPromise: Promise<boolean> | null = null

//   private constructor() {}

//   static getInstance(): WhatsAppManager {
//     if (!WhatsAppManager.instance) {
//       WhatsAppManager.instance = new WhatsAppManager()
//     }
//     return WhatsAppManager.instance
//   }

//   async initialize(): Promise<boolean> {
//     // Si ya está inicializado, retornar true
//     if (this.initialized) {
//       return true
//     }

//     // Si ya está inicializando, esperar el resultado
//     if (this.initPromise) {
//       return await this.initPromise
//     }

//     // Inicializar por primera vez
//     this.initPromise = this.doInitialize()
//     const result = await this.initPromise
//     this.initPromise = null
//     return result
//   }

//   private async doInitialize(): Promise<boolean> {
//     try {
//       console.log('🚀 [WhatsApp Manager] Iniciando WhatsApp Service en Next.js...')
      
//       const whatsappService = getWhatsAppService()
//       const success = await whatsappService.initialize()
      
//       if (success) {
//         this.initialized = true
//         console.log('✅ [WhatsApp Manager] WhatsApp inicializado exitosamente')
        
//         // Verificar conexión después de 5 segundos
//         setTimeout(async () => {
//           if (whatsappService.isReady()) {
//             const user = await whatsappService.getConnectedUser()
//             console.log('📱 [WhatsApp Manager] Usuario conectado:', user?.name || 'Desconocido')
//           }
//         }, 5000)
        
//         return true
//       } else {
//         console.error('❌ [WhatsApp Manager] Error inicializando WhatsApp')
//         return false
//       }
//     } catch (error) {
//       console.error('❌ [WhatsApp Manager] Error:', error)
//       return false
//     }
//   }

//   isReady(): boolean {
//     if (!this.initialized) return false
//     const whatsappService = getWhatsAppService()
//     return whatsappService.isReady()
//   }

//   getService() {
//     return getWhatsAppService()
//   }

//   async ensureConnection(): Promise<boolean> {
//     if (this.isReady()) {
//       return true
//     }

//     console.log('🔄 [WhatsApp Manager] Reintentando conexión...')
//     return await this.initialize()
//   }
// }

// // Exportar la instancia global
// export const whatsappManager = WhatsAppManager.getInstance()

// // Función de utilidad para las APIs
// export async function getConnectedWhatsAppService() {
//   await whatsappManager.initialize()
  
//   if (!whatsappManager.isReady()) {
//     throw new Error('WhatsApp no está conectado. Por favor, escanea el código QR.')
//   }
  
//   return whatsappManager.getService()
// }

//nuevo-------------------------------
// lib/whatsapp-manager.ts - VERSIÓN CORREGIDA
import { getWhatsAppService } from './whatsapp-service'

class WhatsAppManager {
  private static instance: WhatsAppManager | null = null
  private initialized = false
  private initPromise: Promise<boolean> | null = null
  
  private constructor() {}
  
  static getInstance(): WhatsAppManager {
    if (!WhatsAppManager.instance) {
      WhatsAppManager.instance = new WhatsAppManager()
    }
    return WhatsAppManager.instance
  }

  async initialize(): Promise<boolean> {
    // Si ya está inicializado Y conectado, retornar true
    if (this.initialized && this.isReady()) {
      console.log('♻️ [WhatsApp Manager] Ya inicializado y conectado')
      return true
    }
    
    // Si ya está inicializando, esperar el resultado
    if (this.initPromise) {
      console.log('⏳ [WhatsApp Manager] Esperando inicialización en curso...')
      return await this.initPromise
    }
    
    // Inicializar por primera vez
    this.initPromise = this.doInitialize()
    const result = await this.initPromise
    this.initPromise = null
    return result
  }

  private async doInitialize(): Promise<boolean> {
    try {
      console.log('🚀 [WhatsApp Manager] Iniciando WhatsApp Service en Next.js...')
      
      const whatsappService = getWhatsAppService()
      const success = await whatsappService.initialize()
      
      if (success) {
        console.log('✅ [WhatsApp Manager] Servicio inicializado')
        
        // ⏳ ESPERAR CONEXIÓN REAL (muy importante)
        let attempts = 0
        const maxAttempts = 30 // 30 segundos max
        
        while (attempts < maxAttempts) {
          if (whatsappService.isReady()) {
            this.initialized = true
            const user = await whatsappService.getConnectedUser()
            console.log('📱 [WhatsApp Manager] Usuario conectado:', user?.name || 'Desconocido')
            return true
          }
          
          console.log(`🔄 [WhatsApp Manager] Esperando conexión... (${attempts + 1}/${maxAttempts})`)
          await new Promise(resolve => setTimeout(resolve, 1000))
          attempts++
        }
        
        console.log('⏰ [WhatsApp Manager] Timeout esperando conexión')
        return false
        
      } else {
        console.error('❌ [WhatsApp Manager] Error inicializando WhatsApp')
        return false
      }
    } catch (error) {
      console.error('❌ [WhatsApp Manager] Error crítico:', error)
      return false
    }
  }

  isReady(): boolean {
    if (!this.initialized) return false
    const whatsappService = getWhatsAppService()
    return whatsappService.isReady()
  }

  getService() {
    return getWhatsAppService()
  }

  async ensureConnection(): Promise<boolean> {
    if (this.isReady()) {
      console.log('✅ [WhatsApp Manager] Ya está conectado')
      return true
    }
    
    console.log('🔄 [WhatsApp Manager] Reintentando conexión...')
    this.initialized = false // Reset flag
    return await this.initialize()
  }

  // Método para verificar y reconectar si es necesario
  async healthCheck(): Promise<boolean> {
    const isReady = this.isReady()
    
    if (!isReady) {
      console.log('⚠️ [WhatsApp Manager] Health check falló, reconectando...')
      return await this.ensureConnection()
    }
    
    return true
  }
}

// Exportar la instancia global
export const whatsappManager = WhatsAppManager.getInstance()

// Función de utilidad para las APIs
export async function getConnectedWhatsAppService() {
  console.log('🔍 [API] Verificando WhatsApp...')
  
  const healthOk = await whatsappManager.healthCheck()
  
  if (!healthOk) {
    throw new Error('WhatsApp no pudo conectarse. Verifica que hayas escaneado el código QR.')
  }
  
  return whatsappManager.getService()
}