'use client'
import {
  SignInButton,
  SignUpButton,
  SignedIn,
  SignedOut,
  UserButton,
} from '@clerk/nextjs'
import Link from 'next/link'
import Logo from './components/logo'
import { useState } from 'react'

// Componente del formulario integrado
function AppointmentForm() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: ''
  })
  const [isLoading, setIsLoading] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [showError, setShowError] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setShowError(false)

    try {
      const response = await fetch('/api/send-appointment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const result = await response.json()

      if (result.success) {
        setShowSuccess(true)
        setFormData({ name: '', email: '', phone: '', message: '' })
        
        // Opcional: Abrir WhatsApp automáticamente
        if (result.whatsappUrls && result.whatsappUrls.length > 0) {
          // Abre el primer número de WhatsApp
          window.open(result.whatsappUrls[0], '_blank')
        }
        
        // Ocultar mensaje de éxito después de 5 segundos
        setTimeout(() => setShowSuccess(false), 5000)
      } else {
        setShowError(true)
      }
    } catch (error) {
      console.error('Error:', error)
      setShowError(true)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="bg-gradient-to-br from-slate-800 to-slate-900 p-8 rounded-2xl shadow-2xl border border-teal-500/20">
      <h3 className="text-3xl font-bold text-white mb-8 text-center">
        <span className="bg-gradient-to-r from-teal-400 to-cyan-300 bg-clip-text text-transparent">
          Agenda tu Cita
        </span>
      </h3>
      
      {/* Mensaje de éxito */}
      {showSuccess && (
        <div className="mb-6 p-4 bg-gradient-to-r from-emerald-500/20 to-teal-500/20 border border-emerald-400/50 rounded-xl backdrop-blur-sm">
          <div className="flex items-center">
            <div className="text-emerald-400 text-2xl mr-3">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <p className="text-emerald-300 font-semibold">¡Solicitud enviada correctamente!</p>
              <p className="text-emerald-200 text-sm">Te contactaremos pronto para confirmar tu cita.</p>
            </div>
          </div>
        </div>
      )}

      {/* Mensaje de error */}
      {showError && (
        <div className="mb-6 p-4 bg-gradient-to-r from-red-500/20 to-rose-500/20 border border-red-400/50 rounded-xl backdrop-blur-sm">
          <div className="flex items-center">
            <div className="text-red-400 text-2xl mr-3">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <p className="text-red-300 font-semibold">Error al enviar la solicitud</p>
              <p className="text-red-200 text-sm">Por favor, intenta nuevamente o llámanos directamente.</p>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder="Nombre completo"
          required
          className="w-full px-6 py-4 bg-slate-700/50 border border-slate-600/50 rounded-xl focus:ring-2 focus:ring-teal-400 focus:border-teal-400 text-white placeholder-slate-300 backdrop-blur-sm transition-all duration-300"
        />
        
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="Email"
          required
          className="w-full px-6 py-4 bg-slate-700/50 border border-slate-600/50 rounded-xl focus:ring-2 focus:ring-teal-400 focus:border-teal-400 text-white placeholder-slate-300 backdrop-blur-sm transition-all duration-300"
        />
        
        <input
          type="tel"
          name="phone"
          value={formData.phone}
          onChange={handleChange}
          placeholder="Teléfono"
          required
          className="w-full px-6 py-4 bg-slate-700/50 border border-slate-600/50 rounded-xl focus:ring-2 focus:ring-teal-400 focus:border-teal-400 text-white placeholder-slate-300 backdrop-blur-sm transition-all duration-300"
        />
        
        <textarea
          name="message"
          value={formData.message}
          onChange={handleChange}
          placeholder="Mensaje o consulta (opcional)"
          rows={4}
          className="w-full px-6 py-4 bg-slate-700/50 border border-slate-600/50 rounded-xl focus:ring-2 focus:ring-teal-400 focus:border-teal-400 text-white placeholder-slate-300 backdrop-blur-sm transition-all duration-300 resize-none"
        />
        
        <button
          type="submit"
          disabled={isLoading}
          className="w-full px-6 py-4 bg-gradient-to-r from-teal-500 to-cyan-400 text-white rounded-xl font-bold hover:from-teal-600 hover:to-cyan-500 disabled:from-teal-400/50 disabled:to-cyan-300/50 disabled:cursor-not-allowed transition-all duration-300 shadow-lg hover:shadow-teal-500/25 transform hover:scale-[1.02]"
        >
          {isLoading ? (
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mr-3"></div>
              Enviando...
            </div>
          ) : (
            <div className="flex items-center justify-center">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
              Enviar Consulta
            </div>
          )}
        </button>
      </form>
    </div>
  )
}

export default function HomePage() {
  // Función para scroll suave hacia el formulario
  const scrollToContact = () => {
    document.getElementById('contacto')?.scrollIntoView({ 
      behavior: 'smooth' 
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header con navegación y autenticación */}
      <header className="bg-gradient-to-r from-slate-900/95 to-slate-800/95 backdrop-blur-md shadow-2xl border-b border-slate-700/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <Logo 
              width={150} 
              height={50} 
              showText={false}
              linkTo="/dashboard"
              className="hover:opacity-80 transition-opacity duration-300"
            />
            
            {/* Navegación */}
            <nav className="hidden md:flex space-x-8">
              <a href="#inicio" className="text-slate-300 hover:text-teal-400 transition-colors duration-300 font-medium relative group">
                Inicio
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-teal-400 to-cyan-300 transition-all duration-300 group-hover:w-full"></span>
              </a>
              <a href="#servicios" className="text-slate-300 hover:text-teal-400 transition-colors duration-300 font-medium relative group">
                Servicios
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-teal-400 to-cyan-300 transition-all duration-300 group-hover:w-full"></span>
              </a>
              <a href="#equipo" className="text-slate-300 hover:text-teal-400 transition-colors duration-300 font-medium relative group">
                Equipo
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-teal-400 to-cyan-300 transition-all duration-300 group-hover:w-full"></span>
              </a>
              <a href="#contacto" className="text-slate-300 hover:text-teal-400 transition-colors duration-300 font-medium relative group">
                Contacto
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-teal-400 to-cyan-300 transition-all duration-300 group-hover:w-full"></span>
              </a>
            </nav>

            {/* Botones de autenticación */}
            <div className="flex items-center space-x-4">
              <SignedOut>
                <SignInButton mode="modal">
                  <button className="px-6 py-3 text-teal-400 border border-teal-400/50 rounded-xl hover:bg-teal-400/10 transition-all duration-300 font-medium backdrop-blur-sm">
                    Iniciar Sesión
                  </button>
                </SignInButton>
                <SignUpButton mode="modal">
                  <button className="px-6 py-3 bg-gradient-to-r from-teal-500 to-cyan-400 text-white rounded-xl hover:from-teal-600 hover:to-cyan-500 transition-all duration-300 font-bold shadow-lg hover:shadow-teal-500/25">
                    Registrarse
                  </button>
                </SignUpButton>
              </SignedOut>
              
              <SignedIn>
                <div className="flex items-center space-x-3">
                  <Link href="/dashboard" className="px-6 py-3 bg-gradient-to-r from-teal-500 to-cyan-400 text-white rounded-xl hover:from-teal-600 hover:to-cyan-500 transition-all duration-300 font-bold shadow-lg hover:shadow-teal-500/25">
                    Dashboard
                  </Link>
                  <UserButton />
                </div>
              </SignedIn>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section id="inicio" className="relative min-h-screen bg-cover bg-center bg-fixed" style={{ backgroundImage: "url('/FONDOCLINICA.jfif')" }}>
        {/* Overlay for text legibility with header gradient, reduced opacity */}
        <div className="absolute inset-0 bg-gradient-to-r from-slate-900/80 to-slate-800/80 z-0"></div>
        
        {/* Efectos de fondo animados */}
        <div className="absolute inset-0 opacity-20 z-10">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-teal-500/30 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-400/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-20 py-24">
          <div className="text-center">
            <h1 className="text-6xl md:text-6xl font-black text-white mb-8 leading-tight">
              Tu sonrisa es nuestra 
              <span className="bg-gradient-to-r from-teal-400 via-cyan-300 to-teal-400 bg-clip-text text-transparent animate-pulse">
                {" "}pasión
              </span>
            </h1>
            <p className="text-xl text-slate-300 mb-10 max-w-3xl mx-auto leading-relaxed">
              En Clínica Dental Sonríe nuestra misión es implantar y desarrollar un nuevo concepto de odontología.
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <button 
                onClick={scrollToContact}
                className="px-10 py-4 bg-gradient-to-r from-teal-500 to-cyan-400 text-white rounded-xl text-lg font-bold hover:from-teal-600 hover:to-cyan-500 transition-all duration-300 shadow-2xl hover:shadow-teal-500/40 transform hover:scale-105 hover:-translate-y-1"
              >
                <div className="flex items-center justify-center">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  Agendar Cita
                </div>
              </button>
              <Link href="/mision-vision">
                <button className="px-10 py-4 border-2 border-teal-400/50 text-teal-400 rounded-xl text-lg font-bold hover:bg-teal-400/10 hover:border-teal-400 transition-all duration-300 backdrop-blur-sm transform hover:scale-105">
                  <div className="flex items-center justify-center">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Conoce Más
                  </div>
                </button>
              </Link>
            </div>
          </div>
        </div>
      </section>
      
      {/* Servicios */}
      <section id="servicios" className="py-24 bg-gradient-to-b from-slate-800/50 to-slate-900/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-5xl font-black text-white mb-6">
              <span className="bg-gradient-to-r from-teal-400 to-cyan-300 bg-clip-text text-transparent">
                Nuestros Servicios
              </span>
            </h2>
            <p className="text-xl text-slate-300">Cuidado dental integral para toda la familia</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 p-8 rounded-2xl shadow-2xl hover:shadow-teal-500/20 transition-all duration-500 border border-slate-700/50 backdrop-blur-sm group hover:scale-105 hover:border-teal-500/30">
              <div className="text-5xl mb-6 group-hover:scale-110 transition-transform duration-300">
                      <img width="64" height="64" src="https://img.icons8.com/pastel-glyph/64/2DD4BF/dental-health.png" alt="dental-health"/>
            </div>
              <h3 className="text-2xl font-bold text-white mb-4 group-hover:text-teal-400 transition-colors duration-300">Odontología General</h3>
              <p className="text-slate-300 leading-relaxed">Limpiezas, empastes, extracciones y tratamientos preventivos para mantener tu salud bucal.</p>
            </div>

          <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 p-8 rounded-2xl shadow-2xl hover:shadow-teal-500/20 transition-all duration-500 border border-slate-700/50 backdrop-blur-sm group hover:scale-105 hover:border-teal-500/30">
            <div className="text-5xl mb-6 group-hover:scale-110 transition-transform duration-300">
             
                  <img width="64" height="64" src="https://img.icons8.com/external-victoruler-outline-victoruler/64/2DD4BF/external-root-canal-dental-victoruler-outline-victoruler.png" alt="external-root-canal-dental-victoruler-outline-victoruler"/>
            </div>
            <h3 className="text-2xl font-bold text-white mb-4 group-hover:text-teal-400 transition-colors duration-300">Endodoncia</h3>
            <p className="text-slate-300 leading-relaxed">Tratamiento especializado de conductos radiculares para salvar dientes dañados y eliminar el dolor dental de manera definitiva.</p>
          </div>
            
            <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 p-8 rounded-2xl shadow-2xl hover:shadow-teal-500/20 transition-all duration-500 border border-slate-700/50 backdrop-blur-sm group hover:scale-105 hover:border-teal-500/30">
              <div className="text-5xl mb-6 group-hover:scale-110 transition-transform duration-300">
                    <img width="64" height="64" src="https://img.icons8.com/pastel-glyph/64/2DD4BF/tooth-checked.png" alt="tooth-checked"/>
              </div>
              <h3 className="text-2xl font-bold text-white mb-4 group-hover:text-teal-400 transition-colors duration-300">Estética Dental</h3>
              <p className="text-slate-300 leading-relaxed">Blanqueamientos, carillas y diseño de sonrisa para que luzcas tu mejor versión.</p>
            </div>
            
          <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 p-8 rounded-2xl shadow-2xl hover:shadow-teal-500/20 transition-all duration-500 border border-slate-700/50 backdrop-blur-sm group hover:scale-105 hover:border-teal-500/30">
            <div className="text-5xl mb-6 group-hover:scale-110 transition-transform duration-300">
                    <img width="50" height="50" src="https://img.icons8.com/ios-filled/50/2DD4BF/dental-braces.png" alt="dental-braces"/>
            </div>
            <h3 className="text-2xl font-bold text-white mb-4 group-hover:text-teal-400 transition-colors duration-300">Ortodoncia</h3>
            <p className="text-slate-300 leading-relaxed">Brackets tradicionales e invisibles para corregir la posición de tus dientes.</p>
          </div>

            
            <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 p-8 rounded-2xl shadow-2xl hover:shadow-teal-500/20 transition-all duration-500 border border-slate-700/50 backdrop-blur-sm group hover:scale-105 hover:border-teal-500/30">
              <div className="text-5xl mb-6 group-hover:scale-110 transition-transform duration-300">
                        <img width="50" height="50" src="https://img.icons8.com/external-victoruler-solid-victoruler/64/2DD4BF/external-dental-implant-dental-victoruler-solid-victoruler-1.png" alt="external-dental-implant-dental-victoruler-solid-victoruler-1"/>
              </div>
              <h3 className="text-2xl font-bold text-white mb-4 group-hover:text-teal-400 transition-colors duration-300">Implantes</h3>
              <p className="text-slate-300 leading-relaxed">Reemplazo de dientes perdidos con implantes de titanio de alta calidad.</p>
            </div>
            
            <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 p-8 rounded-2xl shadow-2xl hover:shadow-teal-500/20 transition-all duration-500 border border-slate-700/50 backdrop-blur-sm group hover:scale-105 hover:border-teal-500/30">
              <div className="text-5xl mb-6 group-hover:scale-110 transition-transform duration-300">
                        <img width="50" height="50" src="https://img.icons8.com/wired/64/2DD4BF/happy.png" alt="happy"/>
              </div>
              <h3 className="text-2xl font-bold text-white mb-4 group-hover:text-teal-400 transition-colors duration-300">Odontopediatría</h3>
              <p className="text-slate-300 leading-relaxed">Cuidado dental especializado para niños en un ambiente amigable y seguro.</p>
            </div>
            
            <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 p-8 rounded-2xl shadow-2xl hover:shadow-teal-500/20 transition-all duration-500 border border-slate-700/50 backdrop-blur-sm group hover:scale-105 hover:border-teal-500/30">
              <div className="text-5xl mb-6 group-hover:scale-110 transition-transform duration-300">
                         <img width="50" height="50" src="https://img.icons8.com/external-goofy-solid-kerismaker/96/2DD4BF/external-Medical-dental-care-dental-care-kerismaker.png" alt="external-Medical-dental-care-dental-care-kerismaker"/>
              </div>
              <h3 className="text-2xl font-bold text-white mb-4 group-hover:text-red-400 transition-colors duration-300">Urgencias</h3>
              <p className="text-slate-300 leading-relaxed">Atención de emergencias dentales las 24 horas para tu tranquilidad.</p>
            </div>


          </div>
        </div>
      </section>

      {/* Equipo */}
{/* Equipo */}
<section id="equipo" className="py-24 bg-gradient-to-b from-slate-900 to-slate-800">
  <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
    {/* Header */}
    <div className="text-center mb-16">
      <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
        <span className="bg-gradient-to-r from-teal-400 to-cyan-300 bg-clip-text text-transparent">
          Nuestro Equipo
        </span>
      </h2>
      <p className="text-lg text-slate-400 max-w-2xl mx-auto">
        Profesionales especializados con años de experiencia dedicados a tu salud dental
      </p>
    </div>
    
    {/* Team Grid */}
    <div className="grid md:grid-cols-3 gap-8">
      {/* Dr. Emil */}
      <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50 hover:border-teal-500/50 transition-all duration-300 group">
        {/* Avatar */}
        <div className="w-24 h-24 bg-gradient-to-br from-teal-500/20 to-cyan-400/20 rounded-full mx-auto mb-6 flex items-center justify-center border-2 border-teal-400/30 group-hover:border-teal-400/50 transition-colors duration-300">
          <svg className="w-12 h-12 text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        </div>

        {/* Content */}
        <div className="text-center">
          <h3 className="text-xl font-bold text-white mb-1">Dr. Emil Jhordan</h3>
          <h4 className="text-lg font-semibold text-white/90 mb-2">Espinoza Condor</h4>
          <p className="text-teal-400 font-medium mb-4">Cirujano Dentista</p>
          
          {/* Specialties */}
          <div className="space-y-2 mb-4">
            <p className="text-sm text-slate-300">• Odontología General</p>
            <p className="text-sm text-slate-300">• Estética Dental</p>
          </div>
          
          <p className="text-sm text-slate-400 leading-relaxed mb-4">
            Más de 20 años de experiencia en odontología general y tratamientos estéticos avanzados
          </p>
          
          <div className="inline-flex items-center px-3 py-1 bg-teal-500/10 rounded-full border border-teal-500/20">
            <span className="text-teal-400 text-xs font-medium">20+ años experiencia</span>
          </div>
        </div>
      </div>
      
      {/* Dra. Judith */}
      <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50 hover:border-teal-500/50 transition-all duration-300 group">
        {/* Avatar */}
        <div className="w-24 h-24 bg-gradient-to-br from-teal-500/20 to-cyan-400/20 rounded-full mx-auto mb-6 flex items-center justify-center border-2 border-teal-400/30 group-hover:border-teal-400/50 transition-colors duration-300">
          <svg className="w-12 h-12 text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        </div>

        {/* Content */}
        <div className="text-center">
          <h3 className="text-xl font-bold text-white mb-1">Dra. Judith Eliana</h3>
          <h4 className="text-lg font-semibold text-white/90 mb-2">Espinoza Condor</h4>
          <p className="text-teal-400 font-medium mb-4">Cirujano Dentista</p>
          
          {/* Specialties */}
          <div className="space-y-2 mb-4">
            <p className="text-sm text-slate-300">• Ortodoncia Invisible</p>
            <p className="text-sm text-slate-300">• Tratamientos Estéticos</p>
          </div>
          
          <p className="text-sm text-slate-400 leading-relaxed mb-4">
            Especialista en ortodoncia moderna y diseño de sonrisa con técnicas avanzadas
          </p>
          
          <div className="inline-flex items-center px-3 py-1 bg-cyan-500/10 rounded-full border border-cyan-500/20">
            <span className="text-cyan-400 text-xs font-medium">Especialista certificada</span>
          </div>
        </div>
      </div>
      
      {/* Dra. Karole */}
      <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50 hover:border-teal-500/50 transition-all duration-300 group">
        {/* Avatar */}
        <div className="w-24 h-24 bg-gradient-to-br from-teal-500/20 to-cyan-400/20 rounded-full mx-auto mb-6 flex items-center justify-center border-2 border-teal-400/30 group-hover:border-teal-400/50 transition-colors duration-300">
          <svg className="w-12 h-12 text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        </div>

        {/* Content */}
        <div className="text-center">
          <h3 className="text-xl font-bold text-white mb-1">Dra. Karole Klein</h3>
          <h4 className="text-lg font-semibold text-white/90 mb-2">Espinoza Condor</h4>
          <p className="text-teal-400 font-medium mb-4">Cirujano Dentista</p>
          
          {/* Specialties */}
          <div className="space-y-2 mb-4">
            <p className="text-sm text-slate-300">• Cirugía Oral</p>
            <p className="text-sm text-slate-300">• Implantes Dentales</p>
          </div>
          
          <p className="text-sm text-slate-400 leading-relaxed mb-4">
            Experta en cirugía oral avanzada e implantología con técnicas mínimamente invasivas
          </p>
          
          <div className="inline-flex items-center px-3 py-1 bg-teal-500/10 rounded-full border border-teal-500/20">
            <span className="text-teal-400 text-xs font-medium">Cirugía especializada</span>
          </div>
        </div>
      </div>
    </div>

    {/* CTA Section */}
    <div className="mt-16 text-center">
      <div className="bg-slate-800/30 backdrop-blur-sm rounded-xl p-6 border border-slate-700/30">
        <h3 className="text-xl font-bold text-white mb-3">¿Listo para tu consulta?</h3>
        <p className="text-slate-400 mb-4">
          Agenda una cita con nuestro equipo especializado
        </p>
     <button 
                onClick={scrollToContact}
                className="px-10 py-4 bg-gradient-to-r from-teal-500 to-cyan-400 text-white rounded-xl text-lg font-bold hover:from-teal-600 hover:to-cyan-500 transition-all duration-300 shadow-2xl hover:shadow-teal-500/40 transform hover:scale-105 hover:-translate-y-1"
              >
                <div className="flex items-center justify-center">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  Agendar Cita
                </div>
              </button>
      </div>
    </div>
  </div>
</section>





      {/* Contacto */}
      <section id="contacto" className="py-24 bg-gradient-to-b from-slate-800/50 to-slate-900 relative overflow-hidden">
        {/* Efectos de fondo */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-teal-500/20 to-cyan-400/20"></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-20">
            <h2 className="text-5xl font-black text-white mb-6">
              <span className="bg-gradient-to-r from-teal-400 to-cyan-300 bg-clip-text text-transparent">
                Contáctanos
              </span>
            </h2>
            <p className="text-xl text-slate-300">Estamos aquí para cuidar de tu sonrisa</p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-16">
            <div>
              <div className="space-y-8">
                <div className="flex items-start space-x-6 p-6 bg-gradient-to-br from-slate-800/60 to-slate-900/60 rounded-2xl border border-slate-700/50 backdrop-blur-sm hover:border-teal-500/30 transition-all duration-300">
                  <div className="text-3xl text-teal-400 flex-shrink-0">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-bold text-white mb-2 text-lg">Dirección</h3>
                    <p className="text-slate-300">Jr. Libertad 1910 El Tambo, Huancayo, Perú</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-6 p-6 bg-gradient-to-br from-slate-800/60 to-slate-900/60 rounded-2xl border border-slate-700/50 backdrop-blur-sm hover:border-teal-500/30 transition-all duration-300">
                  <div className="text-3xl text-teal-400 flex-shrink-0">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-bold text-white mb-2 text-lg">Teléfono</h3>
                    <p className="text-slate-300"> +51 938 288 058 </p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-6 p-6 bg-gradient-to-br from-slate-800/60 to-slate-900/60 rounded-2xl border border-slate-700/50 backdrop-blur-sm hover:border-teal-500/30 transition-all duration-300">
                  <div className="text-3xl text-teal-400 flex-shrink-0">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-bold text-white mb-2 text-lg">Email</h3>
                    <p className="text-slate-300">Clinica Dental @gmail.com</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-6 p-6 bg-gradient-to-br from-slate-800/60 to-slate-900/60 rounded-2xl border border-slate-700/50 backdrop-blur-sm hover:border-teal-500/30 transition-all duration-300">
                  <div className="text-3xl text-teal-400 flex-shrink-0">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-bold text-white mb-2 text-lg">Horarios</h3>
                    <div className="text-slate-300 space-y-1">
                      <p>Lun - Vie: 8:00 AM - 8:00 PM</p>
                      <p>Sáb: 8:00 AM - 8:00 PM</p>
                      <p>Dom: Emergencias- Previa Cita</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Aquí está el formulario funcional integrado */}
            <AppointmentForm />
          </div>
        </div>
      </section>

      {/* Footer */}
{/* Footer */}
     {/* Footer */}
      <footer className="bg-gradient-to-t from-slate-950 to-slate-900 text-white py-3 border-t border-slate-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
            <div className="flex justify-center mb-2 sm:mb-0">
              <Logo 
                width={150} 
                height={50} 
                showText={false}
                linkTo="/dashboard"
                className="hover:opacity-80 transition-opacity duration-300"
              />
            </div>
            <div className="text-center sm:text-left">
              <p className="text-slate-400 text-base max-w-xs mx-auto sm:mx-0 leading-tight">
                Tu sonrisa es nuestra prioridad. Cuidado dental de calidad con tecnología de vanguardia.
              </p>
            </div>
            <div className="flex justify-center sm:justify-end space-x-3">
              <a href="#" className="w-9 h-9 bg-gradient-to-br from-slate-800 to-slate-900 rounded-full flex items-center justify-center text-teal-400 hover:text-white hover:from-teal-500 hover:to-black transition-all duration-300 border border-slate-700 hover:border-teal-400">
               <img width="50" height="50" src="https://img.icons8.com/ios-filled/50/2DD4BF/facebook-new.png" alt="facebook-new"/>
              </a>
              <a href="#" className="w-9 h-9 bg-gradient-to-br from-slate-800 to-slate-900 rounded-full flex items-center justify-center text-teal-400 hover:text-white hover:from-teal-500 hover:to-black transition-all duration-300 border border-slate-700 hover:border-teal-400">
               <img width="50" height="50" src="https://img.icons8.com/ios-glyphs/30/2DD4BF/whatsapp.png" alt="whatsapp"/>
              </a>

                  <a href="#" className="w-9 h-9 bg-gradient-to-br from-slate-800 to-slate-900 rounded-full flex items-center justify-center text-teal-400 hover:text-white hover:from-teal-500 hover:to-black transition-all duration-300 border border-slate-700 hover:border-teal-400">
               <img width="50" height="50" src="https://img.icons8.com/ios-filled/50/2DD4BF/tiktok--v1.png" alt="tiktok--v1"/>
              </a>
            </div>
          </div>
          <div className="mt-3 pt-2 border-t border-slate-800/50 text-center">
            <p className="text-slate-500 text-xs">
              &copy; 2025 Clínica Dental Sonríe. Todos los derechos reservados.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}