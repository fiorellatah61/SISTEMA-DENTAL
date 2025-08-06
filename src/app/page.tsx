import {
  SignInButton,
  SignUpButton,
  SignedIn,
  SignedOut,
  UserButton,
} from '@clerk/nextjs'

import Link from 'next/link'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Header con navegación y autenticación */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            {/* Logo */}
            <div className="flex items-center">
              <div className="text-3xl font-bold text-blue-600">
                🦷 Sonríe
              </div>
            </div>

            {/* Navegación */}
            <nav className="hidden md:flex space-x-8">
              <a href="#inicio" className="text-gray-700 hover:text-blue-600 transition-colors">Inicio</a>
              <a href="#servicios" className="text-gray-700 hover:text-blue-600 transition-colors">Servicios</a>
              <a href="#equipo" className="text-gray-700 hover:text-blue-600 transition-colors">Equipo</a>
              <a href="#contacto" className="text-gray-700 hover:text-blue-600 transition-colors">Contacto</a>
            </nav>

            {/* Botones de autenticación */}
            
            <div className="flex items-center space-x-4">
              <SignedOut>
                <SignInButton mode="modal">
                  <button className="px-4 py-2 text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 transition-colors">
                    Iniciar Sesión
                  </button>
                </SignInButton>
                <SignUpButton mode="modal">
                  <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                    Registrarse
                  </button>
                </SignUpButton>
              </SignedOut>
              
              <SignedIn>
                <div className="flex items-center space-x-3">
                  <Link href="/dashboard" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
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
      <section id="inicio" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
              Tu sonrisa es nuestra 
              <span className="text-blue-600"> pasión</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              En Clínica Dental Sonríe ofrecemos tratamientos dentales de alta calidad 
              con tecnología de vanguardia y un equipo profesional comprometido con tu bienestar.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="px-8 py-3 bg-blue-600 text-white rounded-lg text-lg font-semibold hover:bg-blue-700 transition-colors">
                Agendar Cita
              </button>
              <button className="px-8 py-3 border border-blue-600 text-blue-600 rounded-lg text-lg font-semibold hover:bg-blue-50 transition-colors">
                Conoce Más
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Servicios */}
      <section id="servicios" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Nuestros Servicios</h2>
            <p className="text-xl text-gray-600">Cuidado dental integral para toda la familia</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-xl shadow-sm hover:shadow-md transition-shadow">
              <div className="text-4xl mb-4">🦷</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Odontología General</h3>
              <p className="text-gray-600">Limpiezas, empastes, extracciones y tratamientos preventivos para mantener tu salud bucal.</p>
            </div>
            
            <div className="bg-white p-8 rounded-xl shadow-sm hover:shadow-md transition-shadow">
              <div className="text-4xl mb-4">✨</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Estética Dental</h3>
              <p className="text-gray-600">Blanqueamientos, carillas y diseño de sonrisa para que luzcas tu mejor versión.</p>
            </div>
            
            <div className="bg-white p-8 rounded-xl shadow-sm hover:shadow-md transition-shadow">
              <div className="text-4xl mb-4">🔧</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Ortodoncia</h3>
              <p className="text-gray-600">Brackets tradicionales e invisibles para corregir la posición de tus dientes.</p>
            </div>
            
            <div className="bg-white p-8 rounded-xl shadow-sm hover:shadow-md transition-shadow">
              <div className="text-4xl mb-4">🦴</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Implantes</h3>
              <p className="text-gray-600">Reemplazo de dientes perdidos con implantes de titanio de alta calidad.</p>
            </div>
            
            <div className="bg-white p-8 rounded-xl shadow-sm hover:shadow-md transition-shadow">
              <div className="text-4xl mb-4">👶</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Odontopediatría</h3>
              <p className="text-gray-600">Cuidado dental especializado para niños en un ambiente amigable y seguro.</p>
            </div>
            
            <div className="bg-white p-8 rounded-xl shadow-sm hover:shadow-md transition-shadow">
              <div className="text-4xl mb-4">🚨</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Urgencias</h3>
              <p className="text-gray-600">Atención de emergencias dentales las 24 horas para tu tranquilidad.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Equipo */}
      <section id="equipo" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Nuestro Equipo</h2>
            <p className="text-xl text-gray-600">Profesionales comprometidos con tu sonrisa</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-32 h-32 bg-blue-100 rounded-full mx-auto mb-4 flex items-center justify-center text-4xl">
                👨‍⚕️
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Dr. Carlos Mendoza</h3>
              <p className="text-blue-600 mb-3">Director Médico</p>
              <p className="text-gray-600">20 años de experiencia en odontología general y estética dental.</p>
            </div>
            
            <div className="text-center">
              <div className="w-32 h-32 bg-blue-100 rounded-full mx-auto mb-4 flex items-center justify-center text-4xl">
                👩‍⚕️
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Dra. Ana López</h3>
              <p className="text-blue-600 mb-3">Ortodoncista</p>
              <p className="text-gray-600">Especialista en ortodoncia invisible y tratamientos estéticos.</p>
            </div>
            
            <div className="text-center">
              <div className="w-32 h-32 bg-blue-100 rounded-full mx-auto mb-4 flex items-center justify-center text-4xl">
                👨‍⚕️
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Dr. Miguel Torres</h3>
              <p className="text-blue-600 mb-3">Implantólogo</p>
              <p className="text-gray-600">Experto en cirugía oral e implantes dentales avanzados.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Contacto */}
      <section id="contacto" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Contáctanos</h2>
            <p className="text-xl text-gray-600">Estamos aquí para cuidar de tu sonrisa</p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-12">
            <div>
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="text-2xl">📍</div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Dirección</h3>
                    <p className="text-gray-600">Av. Principal 123, Lima, Perú</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <div className="text-2xl">📞</div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Teléfono</h3>
                    <p className="text-gray-600">(01) 234-5678</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <div className="text-2xl">✉️</div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Email</h3>
                    <p className="text-gray-600">info@clinicasonrie.com</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <div className="text-2xl">🕒</div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Horarios</h3>
                    <p className="text-gray-600">
                      Lun - Vie: 8:00 AM - 8:00 PM<br/>
                      Sáb: 8:00 AM - 4:00 PM<br/>
                      Dom: Emergencias
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-white p-8 rounded-xl shadow-sm">
              <h3 className="text-2xl font-semibold text-gray-900 mb-6">Agenda tu Cita</h3>
              <form className="space-y-4">
                <input
                  type="text"
                  placeholder="Nombre completo"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <input
                  type="email"
                  placeholder="Email"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <input
                  type="tel"
                  placeholder="Teléfono"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <textarea
                  placeholder="Mensaje o consulta"
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                ></textarea>
                <button
                  type="submit"
                  className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                >
                  Enviar Consulta
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-400 mb-4">
              🦷 Sonríe
            </div>
            <p className="text-gray-400 mb-6">
              Tu sonrisa es nuestra prioridad. Cuidado dental de calidad con tecnología de vanguardia.
            </p>
            <div className="flex justify-center space-x-6 text-2xl">
              <a href="#" className="text-gray-400 hover:text-blue-400 transition-colors">📘</a>
              <a href="#" className="text-gray-400 hover:text-blue-400 transition-colors">📷</a>
              <a href="#" className="text-gray-400 hover:text-blue-400 transition-colors">🐦</a>
            </div>
            <div className="mt-8 pt-8 border-t border-gray-800 text-gray-400">
              <p>&copy; 2025 Clínica Dental Sonríe. Todos los derechos reservados.</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}