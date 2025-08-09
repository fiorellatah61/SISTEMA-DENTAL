// lib/whatsapp-service.ts - CÓDIGO DEFINITIVO SIN ERRORES ROJOS
// lib/whatsapp-service.ts - CÓDIGO CORREGIDO CON QR FUNCIONAL

import makeWASocket, { 
  DisconnectReason, 
  useMultiFileAuthState,
  type WASocket
} from '@whiskeysockets/baileys'
import { Boom } from '@hapi/boom'
import pino from 'pino'
import fs from 'fs'
import path from 'path'
import qrcode from 'qrcode-terminal' // 👈 NECESITAS INSTALAR: npm install qrcode-terminal @types/qrcode-terminal

interface WhatsAppMessage {
  to: string // Número con código de país, ej: '51987654321'
  message: string
}

class WhatsAppService {
  private sock: WASocket | null = null
  private isConnected: boolean = false
  private authDir: string = './auth_info_baileys'
  private qrGenerated: boolean = false
  
  constructor() {
    // Crear directorio de autenticación si no existe
    if (!fs.existsSync(this.authDir)) {
      fs.mkdirSync(this.authDir, { recursive: true })
    }
  }

  async initialize(): Promise<boolean> {
    try {
      console.log('🚀 Iniciando WhatsApp Service...')
      
      // Usar autenticación multi-archivo
      const { state, saveCreds } = await useMultiFileAuthState(this.authDir)
      
      // Crear logger silencioso
      const logger = pino({ level: 'silent' })
      
      // ✅ CREAR SOCKET SIN printQRInTerminal (deprecado)
      this.sock = makeWASocket({
        logger: logger as any,
        // ❌ REMOVIDO: printQRInTerminal: true (deprecado)
        auth: state,
        generateHighQualityLinkPreview: true,
        markOnlineOnConnect: false,
        syncFullHistory: false,
        shouldSyncHistoryMessage: () => false
      })

      // Manejar credenciales
      this.sock.ev.on('creds.update', saveCreds)

      // ✅ MANEJAR QR Y CONEXIÓN CORRECTAMENTE
      this.sock.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect, qr } = update
        
        // ✅ MOSTRAR QR EN TERMINAL MANUALMENTE
        if (qr && !this.qrGenerated) {
          console.log('\n📱 ¡CÓDIGO QR GENERADO!')
          console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
          console.log('📷 Escanea el siguiente código QR con tu teléfono:')
          console.log('')
          
          // Generar QR en terminal
          qrcode.generate(qr, { small: true })
          
          console.log('')
          console.log('📋 INSTRUCCIONES:')
          console.log('1. 📱 Abre WhatsApp en tu teléfono')
          console.log('2. ⚙️  Ve a: Configuración → Dispositivos Vinculados')
          console.log('3. ➕ Toca "Vincular un dispositivo"')
          console.log('4. 📷 Escanea el código QR de arriba ⬆️')
          console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
          
          this.qrGenerated = true
        }

        if (connection === 'close') {
          this.qrGenerated = false // Reset QR flag
          const shouldReconnect = (lastDisconnect?.error as Boom)?.output?.statusCode !== DisconnectReason.loggedOut
          console.log('❌ Conexión cerrada debido a', lastDisconnect?.error)
          
          if (shouldReconnect) {
            console.log('🔄 Reconectando en 5 segundos...')
            setTimeout(() => {
              this.initialize()
            }, 5000)
          } else {
            console.log('🚪 Sesión cerrada por el usuario. Elimina la carpeta auth_info_baileys para reconectar.')
          }
          this.isConnected = false
        } else if (connection === 'open') {
          console.log('\n✅ ¡WhatsApp conectado exitosamente!')
          this.isConnected = true
          this.qrGenerated = false // Reset QR flag
          
          // Mostrar información del usuario conectado
          setTimeout(async () => {
            const user = await this.getConnectedUser()
            if (user) {
              console.log(`👤 Usuario: ${user.name || 'Sin nombre'}`)
              console.log(`📞 Teléfono: ${user.phoneNumber || 'Desconocido'}`)
            }
          }, 2000)
        } else if (connection === 'connecting') {
          console.log('🔄 Conectando a WhatsApp...')
        }
      })

      // Manejar mensajes entrantes
      this.sock.ev.on('messages.upsert', (m) => {
        if (process.env.NODE_ENV === 'development') {
          console.log('💬 Mensaje recibido:', m.messages.length, 'mensajes')
        }
      })

      return true
    } catch (error) {
      console.error('❌ Error inicializando WhatsApp:', error)
      return false
    }
  }

  async sendMessage(data: WhatsAppMessage): Promise<{ success: boolean; messageId?: string; error?: string }> {
    try {
      if (!this.sock || !this.isConnected) {
        return { success: false, error: 'WhatsApp no está conectado. Ejecuta el script de inicialización primero.' }
      }

      // Formatear número (asegurar formato correcto)
      let phoneNumber = data.to.replace(/[^\d]/g, '') // Solo números
      if (!phoneNumber.startsWith('51')) {
        phoneNumber = '51' + phoneNumber // Agregar código de país si no existe
      }
      const jid = `${phoneNumber}@s.whatsapp.net`
      
      // Verificar si el número existe en WhatsApp
      const [exists] = await this.sock.onWhatsApp(jid)
      if (!exists) {
        return { success: false, error: `El número ${data.to} no tiene WhatsApp` }
      }
      
      // Enviar mensaje
      const sentMessage = await this.sock.sendMessage(jid, { text: data.message })
      
      console.log('✅ Mensaje enviado exitosamente a:', data.to)
      
      return { 
        success: true, 
        messageId: sentMessage?.key?.id || undefined
      }
    } catch (error) {
      console.error('❌ Error enviando mensaje:', error)
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Error desconocido' 
      }
    }
  }

  async sendBulkMessages(messages: WhatsAppMessage[]): Promise<Array<{ to: string; success: boolean; messageId?: string; error?: string }>> {
    const results = []
    
    console.log(`📤 Enviando ${messages.length} mensajes en lote...`)
    
    for (let i = 0; i < messages.length; i++) {
      const message = messages[i]
      console.log(`📱 Enviando mensaje ${i + 1}/${messages.length} a: ${message.to}`)
      
      const result = await this.sendMessage(message)
      results.push({
        to: message.to,
        ...result
      })
      
      // Delay entre mensajes para evitar spam (2-3 segundos)
      if (i < messages.length - 1) {
        console.log('⏳ Esperando 3 segundos antes del siguiente mensaje...')
        await new Promise(resolve => setTimeout(resolve, 3000))
      }
    }
    
    console.log(`✅ Lote completado: ${results.filter(r => r.success).length}/${messages.length} mensajes enviados`)
    
    return results
  }

  isReady(): boolean {
    return this.isConnected && this.sock !== null
  }

  async disconnect(): Promise<void> {
    if (this.sock) {
      try {
        console.log('🔌 Cerrando sesión de WhatsApp...')
        await this.sock.logout()
      } catch (error) {
        console.log('⚠️ Error al hacer logout, cerrando forzadamente...')
      }
      this.sock = null
      this.isConnected = false
      console.log('✅ WhatsApp desconectado')
    }
  }

  // Obtener info del usuario conectado
  async getConnectedUser() {
    if (!this.sock || !this.isConnected) {
      return null
    }
    
    try {
      const user = this.sock.user
      return {
        id: user?.id,
        name: user?.name,
        phoneNumber: user?.id?.split('@')[0]
      }
    } catch (error) {
      console.error('Error obteniendo usuario:', error)
      return null
    }
  }

  // Verificar si un número tiene WhatsApp
  async checkWhatsAppNumber(phoneNumber: string): Promise<boolean> {
    if (!this.sock || !this.isConnected) {
      return false
    }

    try {
      let formattedNumber = phoneNumber.replace(/[^\d]/g, '')
      if (!formattedNumber.startsWith('51')) {
        formattedNumber = '51' + formattedNumber
      }
      const jid = `${formattedNumber}@s.whatsapp.net`
      
      const [exists] = await this.sock.onWhatsApp(jid)
      return !!exists
    } catch (error) {
      console.error('Error verificando número:', error)
      return false
    }
  }
}

// Singleton instance
let whatsappService: WhatsAppService | null = null

export function getWhatsAppService(): WhatsAppService {
  if (!whatsappService) {
    whatsappService = new WhatsAppService()
  }
  return whatsappService
}

export default WhatsAppService