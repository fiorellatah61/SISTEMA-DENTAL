import Link from 'next/link'
import Logo from '../components/logo'

export default function MisionVisionPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-teal-900">
      {/* Hero Section with Background Image */}
      <section className="relative min-h-screen bg-cover bg-center bg-fixed" style={{ backgroundImage: "url('/FONDOCLINICA.jfif')" }}>
        {/* Header */}
        <header className="relative z-10 px-6 py-4">
          <div className="max-w-7xl mx-auto flex justify-between items-center">
            <Link href="/" className="text-1xl font-bold text-white hover:text-teal-400 transition-colors">
              ← Volver al Inicio
            </Link>
          </div>
        </header>

        {/* Hero Content with Overlay */}
        <div className="absolute inset-0 bg-black/50 z-0"></div> {/* Overlay for text legibility */}
        <div className="max-w-4xl mx-auto text-center relative z-10 px-6 py-50">
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 bg-gradient-to-r from-white via-teal-200 to-teal-400 bg-clip-text text-transparent">
            Nuestra Esencia
          </h1>
          <p className="text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Conoce los valores y principios que guían cada día nuestro compromiso con tu salud dental
          </p>
        </div>
      </section>

      {/* Historia de la Clínica */}
      <section className="relative px-6 py-20">
        <div className="max-w-6xl mx-auto">
          <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 p-12 rounded-3xl shadow-2xl border border-slate-700/50 backdrop-blur-sm">
            <div className="text-center mb-12">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-teal-400/10 mb-8">
               <img width="50" height="50" src="https://img.icons8.com/ios/50/2DD4BF/dentist-time.png" alt="dentist-time"/>
              
              </div>
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 bg-gradient-to-r from-white via-teal-200 to-teal-400 bg-clip-text text-transparent">
                Nuestra Historia
              </h2>
              <div className="w-24 h-1 bg-gradient-to-r from-teal-400 to-teal-500 mx-auto mb-8"></div>
            </div>
            
            <div className="grid lg:grid-cols-3 gap-12 items-center">
              <div className="lg:col-span-2 space-y-8">
                <div className="space-y-6 text-slate-300 text-lg leading-relaxed">
                  <p className="text-xl text-slate-200 font-semibold">
                    Fundada en <span className="text-teal-400 font-bold">2021</span>, nuestra clínica nació del sueño de 
                    transformar la experiencia del cuidado dental en nuestra comunidad.
                  </p>
                  
                  <p>
                    Con más de <strong className="text-teal-400">4 años de trayectoria</strong>, hemos consolidado 
                    nuestro compromiso de brindar atención dental de excelencia, combinando técnicas tradicionales 
                    probadas con las más modernas innovaciones tecnológicas del sector.
                  </p>
                  
                  <p>
                    Desde nuestros inicios, hemos tenido como propósito fundamental 
                    <strong className="text-white"> crear un espacio donde cada paciente se sienta cómodo, seguro y valorado</strong>, 
                    transformando las visitas al dentista en experiencias positivas y tranquilas.
                  </p>
                  
                  <div className="bg-gradient-to-r from-teal-400/10 to-slate-800/50 p-6 rounded-xl border-l-4 border-teal-400">
                    <p className="text-teal-200 font-medium text-lg">
                      "Hoy, más de <span className="text-teal-400 font-bold">5,000 pacientes</span> han confiado en nosotros 
                      para cuidar su salud dental y transformar sus sonrisas."
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="space-y-6">
                <div className="bg-slate-800/50 p-6 rounded-2xl border border-slate-700/50 text-center">
                  <div className="text-3xl font-bold text-teal-400 mb-2">2021</div>
                  <div className="text-slate-300">Año de Fundación</div>
                </div>
                
                <div className="bg-slate-800/50 p-6 rounded-2xl border border-slate-700/50 text-center">
                  <div className="text-3xl font-bold text-teal-400 mb-2">4+</div>
                  <div className="text-slate-300">Años de Experiencia</div>
                </div>
                
                <div className="bg-slate-800/50 p-6 rounded-2xl border border-slate-700/50 text-center">
                  <div className="text-3xl font-bold text-teal-400 mb-2">5K+</div>
                  <div className="text-slate-300">Pacientes Atendidos</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Fotos de la Clínica */}
      <section className="relative px-6 py-20">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 bg-gradient-to-r from-white via-teal-200 to-teal-400 bg-clip-text text-transparent">
              Nuestras Instalaciones
            </h2>
            <p className="text-xl text-slate-300 max-w-3xl mx-auto">
              Espacios diseñados para tu comodidad y tranquilidad, equipados con tecnología de vanguardia
            </p>
            <div className="w-24 h-1 bg-gradient-to-r from-teal-400 to-teal-500 mx-auto mt-6"></div>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Recepción */}
            <div className="group bg-gradient-to-br from-slate-800/60 to-slate-900/60 p-6 rounded-2xl border border-slate-700/50 backdrop-blur-sm hover:border-teal-500/50 transition-all duration-500 transform hover:scale-105">
              <div className="aspect-video bg-gradient-to-br from-slate-700 to-slate-800 rounded-xl mb-6 flex items-center justify-center overflow-hidden">
                <img src="/RECEPCION.jfif" alt="Área de Recepción" className="w-full h-full object-cover" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2 group-hover:text-teal-400 transition-colors">Recepción Acogedora</h3>
              <p className="text-slate-300">Espacio cálido y moderno donde te recibiremos con la mejor atención desde tu llegada.</p>
            </div>

            {/* Consultorio */}
            <div className="group bg-gradient-to-br from-slate-800/60 to-slate-900/60 p-6 rounded-2xl border border-slate-700/50 backdrop-blur-sm hover:border-teal-500/50 transition-all duration-500 transform hover:scale-105">
              <div className="aspect-video bg-gradient-to-br from-slate-700 to-slate-800 rounded-xl mb-6 flex items-center justify-center overflow-hidden">
                <img src="/CONSULTORIO.jfif" alt="Consultorios" className="w-full h-full object-cover" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2 group-hover:text-teal-400 transition-colors">Consultorios Modernos</h3>
              <p className="text-slate-300">Equipamiento de última generación en ambientes cómodos y esterilizados para tu seguridad.</p>
            </div>

            {/* Sala de Espera */}
            <div className="group bg-gradient-to-br from-slate-800/60 to-slate-900/60 p-6 rounded-2xl border border-slate-700/50 backdrop-blur-sm hover:border-teal-500/50 transition-all duration-500 transform hover:scale-105">
              <div className="aspect-video bg-gradient-to-br from-slate-700 to-slate-800 rounded-xl mb-6 flex items-center justify-center overflow-hidden">
                <img src="/SALAESPERA.jfif" alt="Sala de Espera" className="w-full h-full object-cover" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2 group-hover:text-teal-400 transition-colors">Sala de Espera Confortable</h3>
              <p className="text-slate-300">Ambiente relajante y cómodo donde podrás sentirte tranquilo antes de tu cita.</p>
            </div>
          </div>

          <div className="text-center mt-12">
            <p className="text-slate-400 italic">
              Descubre nuestras instalaciones diseñadas para tu bienestar
            </p>
          </div>
        </div>
      </section>

      {/* Certificaciones y Reconocimientos */}
      <section className="relative px-6 py-20">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 bg-gradient-to-r from-white via-teal-200 to-teal-400 bg-clip-text text-transparent">
              Certificaciones y Reconocimientos
            </h2>
            <p className="text-xl text-slate-300 max-w-3xl mx-auto">
              Respaldamos nuestra calidad con certificaciones oficiales y el reconocimiento de nuestros pacientes
            </p>
            <div className="w-24 h-1 bg-gradient-to-r from-teal-400 to-teal-500 mx-auto mt-6"></div>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Colegio Odontológico */}
            <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 p-8 rounded-2xl border border-slate-700/50 backdrop-blur-sm text-center hover:border-teal-500/50 transition-all duration-500 transform hover:scale-105">
              <div className="w-16 h-16 mx-auto mb-6 bg-teal-400/10 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-white mb-3">Colegio Odontológico</h3>
              <p className="text-slate-300 text-sm">Registro y habilitación oficial para ejercer la odontología</p>
            </div>

            {/* Normas de Bioseguridad */}
            <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 p-8 rounded-2xl border border-slate-700/50 backdrop-blur-sm text-center hover:border-teal-500/50 transition-all duration-500 transform hover:scale-105">
              <div className="w-16 h-16 mx-auto mb-6 bg-teal-400/10 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5-6a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-white mb-3">Bioseguridad</h3>
              <p className="text-slate-300 text-sm">Cumplimiento estricto de protocolos sanitarios y normas de seguridad</p>
            </div>

            {/* Capacitación Continua */}
            <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 p-8 rounded-2xl border border-slate-700/50 backdrop-blur-sm text-center hover:border-teal-500/50 transition-all duration-500 transform hover:scale-105">
              <div className="w-16 h-16 mx-auto mb-6 bg-teal-400/10 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-white mb-3">Formación Continua</h3>
              <p className="text-slate-300 text-sm">Actualización constante en técnicas y tecnologías dentales modernas</p>
            </div>

            {/* Satisfacción del Paciente */}
            <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 p-8 rounded-2xl border border-slate-700/50 backdrop-blur-sm text-center hover:border-teal-500/50 transition-all duration-500 transform hover:scale-105">
              <div className="w-16 h-16 mx-auto mb-6 bg-teal-400/10 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-white mb-3">98% Satisfacción</h3>
              <p className="text-slate-300 text-sm">Alto índice de satisfacción basado en testimonios de nuestros pacientes</p>
            </div>
          </div>

          <div className="mt-16 bg-gradient-to-r from-teal-400/10 to-slate-800/50 p-10 rounded-3xl border border-teal-400/20 backdrop-blur-sm">
            <div className="text-center">
              <h3 className="text-2xl font-bold text-white mb-6">Comprometidos con la Excelencia</h3>
              <p className="text-lg text-slate-300 max-w-4xl mx-auto leading-relaxed">
                Nuestras certificaciones respaldan no solo nuestra competencia técnica, sino también nuestro compromiso 
                inquebrantable con la calidad, seguridad y satisfacción de cada paciente que confía en nosotros.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Misión y Visión Cards */}
      <section className="relative px-6 py-16">
        <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-12">
          
          {/* Misión */}
          <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 p-10 rounded-3xl shadow-2xl border border-slate-700/50 backdrop-blur-sm">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-teal-400/10 mb-6">
                <svg className="w-8 h-8 text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
              <h2 className="text-4xl font-bold text-white mb-4">Nuestra Misión</h2>
            </div>
            
            <div className="space-y-6 text-slate-300 text-lg leading-relaxed">
              <p>
                <strong className="text-teal-400">Brindar atención dental integral</strong> de la más alta calidad, 
                utilizando tecnología de vanguardia y un enfoque humanizado que priorice el bienestar y la 
                comodidad de nuestros pacientes.
              </p>
              
              <p>
                Nos comprometemos a <strong className="text-white">transformar cada sonrisa</strong> a través de 
                tratamientos personalizados, educación preventiva y un servicio excepcional que genere 
                confianza y tranquilidad en cada visita.
              </p>

              <div className="border-l-4 border-teal-400 pl-6 bg-slate-800/50 p-4 rounded-r-lg">
                <p className="text-teal-200 font-medium">
                  "Creemos que una sonrisa saludable es la base de la confianza y el bienestar integral de cada persona."
                </p>
              </div>
            </div>
          </div>

          {/* Visión */}
          <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 p-10 rounded-3xl shadow-2xl border border-slate-700/50 backdrop-blur-sm">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-teal-400/10 mb-6">
                <svg className="w-8 h-8 text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              </div>
              <h2 className="text-4xl font-bold text-white mb-4">Nuestra Visión</h2>
            </div>
            
            <div className="space-y-6 text-slate-300 text-lg leading-relaxed">
              <p>
                <strong className="text-teal-400">Ser reconocidos como la clínica dental líder</strong> en nuestra 
                región, destacándonos por la excelencia en el cuidado oral, la innovación tecnológica y el 
                compromiso genuino con la salud integral de nuestros pacientes.
              </p>
              
              <p>
                Aspiramos a <strong className="text-white">crear una comunidad más saludable</strong> donde cada 
                persona tenga acceso a tratamientos dentales de clase mundial, contribuyendo al bienestar 
                general y la calidad de vida de nuestros pacientes y sus familias.
              </p>

              <div className="border-l-4 border-teal-400 pl-6 bg-slate-800/50 p-4 rounded-r-lg">
                <p className="text-teal-200 font-medium">
                  "Visualizamos un futuro donde cada sonrisa refleje salud, confianza y felicidad."
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Valores */}
      <section className="relative px-6 py-20">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">Nuestros Valores</h2>
            <p className="text-xl text-slate-300 max-w-3xl mx-auto">
              Los principios fundamentales que guían cada decisión y acción en nuestra clínica
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Excelencia */}
            <div className="bg-gradient-to-br from-slate-800/60 to-slate-900/60 p-8 rounded-2xl border border-slate-700/50 backdrop-blur-sm hover:border-teal-500/30 transition-all duration-300">
              <div className="text-teal-400 mb-4">
                <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-white mb-3">Excelencia</h3>
              <p className="text-slate-300">Búsqueda constante de la perfección en cada tratamiento y servicio que ofrecemos.</p>
            </div>

            {/* Integridad */}
            <div className="bg-gradient-to-br from-slate-800/60 to-slate-900/60 p-8 rounded-2xl border border-slate-700/50 backdrop-blur-sm hover:border-teal-500/30 transition-all duration-300">
              <div className="text-teal-400 mb-4">
                <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-white mb-3">Integridad</h3>
              <p className="text-slate-300">Actuamos con honestidad, transparencia y ética en todas nuestras relaciones.</p>
            </div>

            {/* Compasión */}
            <div className="bg-gradient-to-br from-slate-800/60 to-slate-900/60 p-8 rounded-2xl border border-slate-700/50 backdrop-blur-sm hover:border-teal-500/30 transition-all duration-300">
              <div className="text-teal-400 mb-4">
                <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-white mb-3">Compasión</h3>
              <p className="text-slate-300">Tratamos a cada paciente con empatía, cuidado y comprensión genuina.</p>
            </div>

            {/* Innovación */}
            <div className="bg-gradient-to-br from-slate-800/60 to-slate-900/60 p-8 rounded-2xl border border-slate-700/50 backdrop-blur-sm hover:border-teal-500/30 transition-all duration-300">
              <div className="text-teal-400 mb-4">
                <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-white mb-3">Innovación</h3>
              <p className="text-slate-300">Adoptamos las últimas tecnologías y técnicas para brindar el mejor cuidado.</p>
            </div>

            {/* Compromiso */}
            <div className="bg-gradient-to-br from-slate-800/60 to-slate-900/60 p-8 rounded-2xl border border-slate-700/50 backdrop-blur-sm hover:border-teal-500/30 transition-all duration-300">
              <div className="text-teal-400 mb-4">
                <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-white mb-3">Compromiso</h3>
              <p className="text-slate-300">Dedicación total con la salud y bienestar de cada uno de nuestros pacientes.</p>
            </div>

            {/* Respeto */}
            <div className="bg-gradient-to-br from-slate-800/60 to-slate-900/60 p-8 rounded-2xl border border-slate-700/50 backdrop-blur-sm hover:border-teal-500/30 transition-all duration-300">
              <div className="text-teal-400 mb-4">
                <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m3 5.197a4 4 0 00-3-3.874V12m0 0a2 2 0 012-2h1m-3 2v3m0 0h3" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-white mb-3">Respeto</h3>
              <p className="text-slate-300">Valoramos la dignidad, privacidad y decisiones de cada persona que nos visita.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="relative px-6 py-20">
        <div className="max-w-4xl mx-auto text-center">
          <div className="bg-gradient-to-r from-teal-400/10 to-slate-800/50 p-12 rounded-3xl border border-teal-400/20 backdrop-blur-sm">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
              ¿Listo para Experimentar Nuestros Valores?
            </h2>
            <p className="text-xl text-slate-300 mb-8 max-w-2xl mx-auto">
              Agenda tu cita hoy y descubre por qué somos la opción preferida para el cuidado dental integral
            </p>
            
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
              <Link href="/#contacto">
                <button className="px-10 py-4 bg-gradient-to-r from-teal-400 to-teal-500 text-slate-900 rounded-xl text-lg font-bold hover:from-teal-300 hover:to-teal-400 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-teal-400/25">
                  Agendar Cita
                </button>
              </Link>
              
              <Link href="/">
                <button className="px-10 py-4 border-2 border-teal-400/50 text-teal-400 rounded-xl text-lg font-bold hover:bg-teal-400/10 hover:border-teal-400 transition-all duration-300 backdrop-blur-sm transform hover:scale-105">
                  Volver al Inicio
                </button>
              </Link>
            </div>
          </div>
        </div>
      </section>

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
  )
}