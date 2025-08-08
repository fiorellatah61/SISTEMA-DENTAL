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
      <section id="inicio" className="py-24 relative overflow-hidden">
        {/* Efectos de fondo animados */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-teal-500/30 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-400/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center">
            <h1 className="text-6xl md:text-7xl font-black text-white mb-8 leading-tight">
              Tu sonrisa es nuestra 
              <span className="bg-gradient-to-r from-teal-400 via-cyan-300 to-teal-400 bg-clip-text text-transparent animate-pulse">
                {" "}pasión
              </span>
            </h1>
            <p className="text-xl text-slate-300 mb-10 max-w-3xl mx-auto leading-relaxed">
              En Clínica Dental Sonríe ofrecemos tratamientos dentales de alta calidad 
              con tecnología de vanguardia y un equipo profesional comprometido con tu bienestar.
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
              <button className="px-10 py-4 border-2 border-teal-400/50 text-teal-400 rounded-xl text-lg font-bold hover:bg-teal-400/10 hover:border-teal-400 transition-all duration-300 backdrop-blur-sm transform hover:scale-105">
                <div className="flex items-center justify-center">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Conoce Más
                </div>
              </button>
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
                <svg className="w-12 h-12 text-teal-400" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z"/>
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-white mb-4 group-hover:text-teal-400 transition-colors duration-300">Odontología General</h3>
              <p className="text-slate-300 leading-relaxed">Limpiezas, empastes, extracciones y tratamientos preventivos para mantener tu salud bucal.</p>
            </div>
            
            <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 p-8 rounded-2xl shadow-2xl hover:shadow-teal-500/20 transition-all duration-500 border border-slate-700/50 backdrop-blur-sm group hover:scale-105 hover:border-teal-500/30">
              <div className="text-5xl mb-6 group-hover:scale-110 transition-transform duration-300">
                <svg className="w-12 h-12 text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-white mb-4 group-hover:text-teal-400 transition-colors duration-300">Estética Dental</h3>
              <p className="text-slate-300 leading-relaxed">Blanqueamientos, carillas y diseño de sonrisa para que luzcas tu mejor versión.</p>
            </div>
            
            <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 p-8 rounded-2xl shadow-2xl hover:shadow-teal-500/20 transition-all duration-500 border border-slate-700/50 backdrop-blur-sm group hover:scale-105 hover:border-teal-500/30">
              <div className="text-5xl mb-6 group-hover:scale-110 transition-transform duration-300">
                <svg className="w-12 h-12 text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-white mb-4 group-hover:text-teal-400 transition-colors duration-300">Ortodoncia</h3>
              <p className="text-slate-300 leading-relaxed">Brackets tradicionales e invisibles para corregir la posición de tus dientes.</p>
            </div>
            
            <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 p-8 rounded-2xl shadow-2xl hover:shadow-teal-500/20 transition-all duration-500 border border-slate-700/50 backdrop-blur-sm group hover:scale-105 hover:border-teal-500/30">
              <div className="text-5xl mb-6 group-hover:scale-110 transition-transform duration-300">
                <svg className="w-12 h-12 text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-white mb-4 group-hover:text-teal-400 transition-colors duration-300">Implantes</h3>
              <p className="text-slate-300 leading-relaxed">Reemplazo de dientes perdidos con implantes de titanio de alta calidad.</p>
            </div>
            
            <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 p-8 rounded-2xl shadow-2xl hover:shadow-teal-500/20 transition-all duration-500 border border-slate-700/50 backdrop-blur-sm group hover:scale-105 hover:border-teal-500/30">
              <div className="text-5xl mb-6 group-hover:scale-110 transition-transform duration-300">
                <svg className="w-12 h-12 text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1.01M15 10h1.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-white mb-4 group-hover:text-teal-400 transition-colors duration-300">Odontopediatría</h3>
              <p className="text-slate-300 leading-relaxed">Cuidado dental especializado para niños en un ambiente amigable y seguro.</p>
            </div>
            
            <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 p-8 rounded-2xl shadow-2xl hover:shadow-teal-500/20 transition-all duration-500 border border-slate-700/50 backdrop-blur-sm group hover:scale-105 hover:border-teal-500/30">
              <div className="text-5xl mb-6 group-hover:scale-110 transition-transform duration-300">
                <svg className="w-12 h-12 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-white mb-4 group-hover:text-red-400 transition-colors duration-300">Urgencias</h3>
              <p className="text-slate-300 leading-relaxed">Atención de emergencias dentales las 24 horas para tu tranquilidad.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Equipo */}
      <section id="equipo" className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-slate-900/50 to-slate-800/50"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-20">
            <h2 className="text-5xl font-black text-white mb-6">
              <span className="bg-gradient-to-r from-teal-400 to-cyan-300 bg-clip-text text-transparent">
                Nuestro Equipo
              </span>
            </h2>
            <p className="text-xl text-slate-300">Profesionales comprometidos con tu sonrisa</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-10">
            <div className="text-center group">
              <div className="w-40 h-40 bg-gradient-to-br from-teal-400/20 to-cyan-300/20 rounded-full mx-auto mb-6 flex items-center justify-center text-6xl backdrop-blur-sm border border-teal-400/30 group-hover:scale-110 group-hover:border-teal-400 transition-all duration-300 shadow-2xl">
                <svg className="w-20 h-20 text-teal-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-white mb-2 group-hover:text-teal-400 transition-colors duration-300">Dr. Carlos Mendoza</h3>
              <p className="text-teal-400 mb-4 font-semibold text-lg">Director Médico</p>
              <p className="text-slate-300 leading-relaxed">20 años de experiencia en odontología general y estética dental.</p>
            </div>
            
            <div className="text-center group">
              <div className="w-40 h-40 bg-gradient-to-br from-teal-400/20 to-cyan-300/20 rounded-full mx-auto mb-6 flex items-center justify-center text-6xl backdrop-blur-sm border border-teal-400/30 group-hover:scale-110 group-hover:border-teal-400 transition-all duration-300 shadow-2xl">
                <svg className="w-20 h-20 text-teal-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-white mb-2 group-hover:text-teal-400 transition-colors duration-300">Dra. Ana López</h3>
              <p className="text-teal-400 mb-4 font-semibold text-lg">Ortodoncista</p>
              <p className="text-slate-300 leading-relaxed">Especialista en ortodoncia invisible y tratamientos estéticos.</p>
            </div>
            
            <div className="text-center group">
              <div className="w-40 h-40 bg-gradient-to-br from-teal-400/20 to-cyan-300/20 rounded-full mx-auto mb-6 flex items-center justify-center text-6xl backdrop-blur-sm border border-teal-400/30 group-hover:scale-110 group-hover:border-teal-400 transition-all duration-300 shadow-2xl">
                <svg className="w-20 h-20 text-teal-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-white mb-2 group-hover:text-teal-400 transition-colors duration-300">Dr. Miguel Torres</h3>
              <p className="text-teal-400 mb-4 font-semibold text-lg">Implantólogo</p>
              <p className="text-slate-300 leading-relaxed">Experto en cirugía oral e implantes dentales avanzados.</p>
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
                    <p className="text-slate-300">Av. Principal 123, Lima, Perú</p>
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
                    <p className="text-slate-300">(01) 234-5678</p>
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
                    <p className="text-slate-300">info@clinicasonrie.com</p>
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
                      <p>Sáb: 8:00 AM - 4:00 PM</p>
                      <p>Dom: Emergencias</p>
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
              <a href="#" className="w-9 h-9 bg-gradient-to-br from-slate-800 to-slate-900 rounded-full flex items-center justify-center text-teal-400 hover:text-white hover:from-teal-500 hover:to-cyan-400 transition-all duration-300 border border-slate-700 hover:border-teal-400">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/>
                </svg>
              </a>
              <a href="#" className="w-9 h-9 bg-gradient-to-br from-slate-800 to-slate-900 rounded-full flex items-center justify-center text-teal-400 hover:text-white hover:from-teal-500 hover:to-cyan-400 transition-all duration-300 border border-slate-700 hover:border-teal-400">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M22.46 6c-.77.35-1.6.58-2.46.69.88-.53 1.56-1.37 1.88-2.38-.83.5-1.75.85-2.72 1.05C18.37 4.5 17.26 4 16 4c-2.35 0-4.27 1.92-4.27 4.29 0 .34.04.67.11.98C8.28 9.09 5.11 7.38 3 4.79c-.37.63-.58 1.37-.58 2.15 0 1.49.75 2.81 1.91 3.56-.71 0-1.37-.2-1.95-.5v.03c0 2.08 1.48 3.82 3.44 4.21a4.22 4.22 0 0 1-1.93.07 4.28 4.28 0 0 0 4 2.98 8.521 8.521 0 0 1-5.33 1.84c-.34 0-.68-.02-1.02-.06C3.44 20.29 5.7 21 8.12 21 16 21 20.33 14.46 20.33 8.79c0-.19 0-.37-.01-.56.84-.6 1.56-1.36 2.14-2.23z"/>
                </svg>
              </a>
              <a href="#" className="w-9 h-9 bg-gradient-to-br from-slate-800 to-slate-900 rounded-full flex items-center justify-center text-teal-400 hover:text-white hover:from-teal-500 hover:to-cyan-400 transition-all duration-300 border border-slate-700 hover:border-teal-400">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.174-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.099.12.112.225.083.347-.09.375-.293 1.199-.334 1.363-.053.225-.174.271-.402.163-1.499-.698-2.436-2.888-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.357-.631-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24.009 12.017 24.009c6.624 0 11.99-5.367 11.99-11.988C24.007 5.367 18.641.001.012.001z"/>
                </svg>
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