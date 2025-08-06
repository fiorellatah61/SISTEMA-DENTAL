// scripts/seed-emails.js
const { PrismaClient } = require('../src/generated/prisma')
const prisma = new PrismaClient()

async function main() {
  try {
    // ⚠️ CAMBIA ESTOS EMAILS POR LOS REALES DE TU EQUIPO
    const emailsIniciales = [
      // Ejemplo de emails - REEMPLAZA CON LOS REALES
      'fiorellatah6.1@gmail.com',
      'doctor@tuempresa.com',
      'recepcion@tuempresa.com',
      
      // 🔥 AGREGA AQUÍ TU EMAIL PERSONAL PARA PODER ACCEDER
      // ⬅️ CAMBIAR POR TU EMAIL REAL
    ]

    console.log('🚀 Iniciando inserción de emails autorizados...')

    // Verificar si ya existen emails
    const emailsExistentes = await prisma.emailAutorizado.count()
    
    if (emailsExistentes > 0) {
      console.log(`⚠️  Ya existen ${emailsExistentes} emails en la base de datos`)
      console.log('¿Deseas continuar agregando más emails? (Los duplicados serán ignorados)')
    }

    let emailsAgregados = 0
    let emailsIgnorados = 0

    for (const email of emailsIniciales) {
      try {
        // Verificar si el email ya existe
        const emailExiste = await prisma.emailAutorizado.findUnique({
          where: { email: email.toLowerCase() }
        })

        if (emailExiste) {
          console.log(`⚠️  Email ya existe: ${email}`)
          emailsIgnorados++
          continue
        }

        // Crear nuevo email
        const emailCreado = await prisma.emailAutorizado.create({
          data: { 
            email: email.toLowerCase(),
            activo: true 
          }
        })
        
        console.log(`✅ Email autorizado: ${emailCreado.email}`)
        emailsAgregados++
        
      } catch (error) {
        console.error(`❌ Error con email ${email}:`, error.message)
      }
    }

    console.log('\n📊 Resumen final:')
    console.log(`➕ Emails agregados: ${emailsAgregados}`)
    console.log(`⚠️  Emails ignorados (ya existían): ${emailsIgnorados}`)

    // Mostrar todos los emails activos
    const todosLosEmails = await prisma.emailAutorizado.findMany({
      where: { activo: true },
      select: { email: true, createdAt: true },
      orderBy: { createdAt: 'desc' }
    })

    console.log(`\n📋 Total de emails autorizados activos: ${todosLosEmails.length}`)
    todosLosEmails.forEach((email, index) => {
      const fecha = email.createdAt.toLocaleDateString()
      console.log(`${index + 1}. ${email.email} (desde ${fecha})`)
    })

    if (todosLosEmails.length > 0) {
      console.log('\n🎉 ¡Sistema de emails configurado correctamente!')
      console.log('💡 Ahora puedes usar estos emails para acceder al sistema')
    } else {
      console.log('\n⚠️  No hay emails autorizados. Agrega al menos uno para poder acceder.')
    }
    
  } catch (error) {
    console.error('❌ Error general:', error)
  } finally {
    await prisma.$disconnect()
    console.log('\n🔌 Conexión a base de datos cerrada')
  }
}

// Ejecutar el script
main()
  .catch((e) => {
    console.error('💥 Error ejecutando script:', e)
    process.exit(1)
  })