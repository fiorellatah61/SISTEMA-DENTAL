// // app/dashboard/citas/page.tsx
// 'use client'
// import { useState } from 'react'
// import { useCitas } from './hooks/useCitas'
// import CitaForm from './components/CitaForm'
// import CitasList from './components/CitasList'
// import CalendarioSemanal from './components/CalendarioSemanal'

// interface Paciente {
//   id: string
//   nombres: string
//   apellidos: string
//   dni: string
//   telefono?: string
//   email?: string
// }

// interface Cita {
//   id: string
//   idPaciente: string
//   fechaHora: Date
//   estado: 'SOLICITADA' | 'CONFIRMADA' | 'MODIFICADA' | 'CANCELADA'
//   motivo?: string
//   observaciones?: string
//   paciente: Paciente
//   createdAt: Date
//   updatedAt: Date
//   //AUMENTADO
//   telefonoContacto?: string
//   emailContacto?: string
// }

// export default function CitasPage() {
//   const {
//     citas,
//     citasDelDia,
//     pacientes,
//     loading,
//     error,
//     fechaSeleccionada,
//     setFechaSeleccionada,
//     setError,
//     cargarCitas,
//     crearCita,
//     actualizarCita,
//     cancelarCita,
//     confirmarCita,
//     eliminarCita,
//     enviarRecordatorios,
//     cargarPacientes
//   } = useCitas()

//   const [mostrarFormulario, setMostrarFormulario] = useState(false)
//   const [citaEditando, setCitaEditando] = useState<Cita | null>(null)

//   const handleSubmitCita = async (datos: {
//     idPaciente?: string
//     nuevoPaciente?: { nombres: string; apellidos: string; dni: string }
//     fechaHora: Date
//     motivo?: string
//     observaciones?: string
//       // AGREGADO: Nuevos campos
//   telefonoContacto?: string
//   emailContacto?: string
//   }) => {
//     try {
//       const resultado = citaEditando
//         ? await actualizarCita(citaEditando.id, {
//             idPaciente: datos.idPaciente!,
//             fechaHora: datos.fechaHora,
//             motivo: datos.motivo,
//             observaciones: datos.observaciones,
//                // AGREGADO: Incluir campos de contacto en actualización
//             telefonoContacto: datos.telefonoContacto,
//             emailContacto: datos.emailContacto
//           })
//         : await crearCita(datos)
      
//       if (resultado.success) {
//         setCitaEditando(null)
//         setMostrarFormulario(false)
//         await cargarCitas() // Forzar recarga de citas
//         await cargarPacientes() // Forzar recarga de pacientes
//       }
//       return resultado
//     } catch (error: any) {
//       console.error('Error en handleSubmitCita:', error)
//       setError(error.message || 'Error al guardar la cita. Por favor, intenta de nuevo.')
//       return { success: false, error: error.message || 'Error al guardar la cita' }
//     }
//   }

//   const handleEditarCita = (cita: Cita) => {
//     setCitaEditando(cita)
//     setMostrarFormulario(true)
//   }

//   const handleCerrarFormulario = () => {
//     setMostrarFormulario(false)
//     setCitaEditando(null)
//   }

//   const handleEnviarRecordatorios = async () => {
//     try {
//       const resultado = await enviarRecordatorios()
//       if (resultado.success) {
//         alert(`Recordatorios enviados: ${resultado.enviados}`)
//       } else {
//         setError(resultado.error || 'Error al enviar recordatorios')
//       }
//     } catch (error: any) {
//       console.error('Error en enviarRecordatorios:', error)
//       setError(error.message || 'Error al enviar recordatorios')
//     }
//   }

//   const formatearFecha = (fechaStr: string) => {
//     const fecha = new Date(fechaStr)
//     return fecha.toLocaleDateString('es-PE', {
//       weekday: 'long',
//       year: 'numeric',
//       month: 'long',
//       day: 'numeric'
//     })
//   }

//   return (
//     <div className="min-h-screen bg-gray-50">
//       <div className="bg-white shadow-sm border-b">
//         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//           <div className="flex justify-between items-center py-4">
//             <div>
//               <h1 className="text-2xl font-semibold text-gray-900">Gestión de Citas</h1>
//               <p className="text-sm text-gray-600">SONRISOFT - Clínica Dental</p>
//             </div>
//             <div className="flex items-center space-x-3">
//               <button
//                 onClick={handleEnviarRecordatorios}
//                 disabled={loading}
//                 className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
//               >
//                 {loading ? 'Enviando...' : 'Enviar Recordatorios'}
//               </button>
//               <button
//                 onClick={() => setMostrarFormulario(true)}
//                 className="px-4 py-2 bg-gray-800 text-white rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500"
//               >
//                 Nueva Cita
//               </button>
//             </div>
//           </div>
//         </div>
//       </div>

//       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
//         {error && (
//           <div className="mb-4 bg-red-50 border border-red-200 rounded-md p-4">
//             <div className="flex">
//               <div className="text-red-800">
//                 <p className="text-sm">{error}</p>
//               </div>
//               <button
//                 onClick={() => {
//                   setError('')
//                   cargarCitas()
//                   cargarPacientes()
//                 }}
//                 className="ml-auto text-red-600 hover:text-red-800"
//               >
//                 Reintentar
//               </button>
//             </div>
//           </div>
//         )}

//         <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
//           <div className="lg:col-span-1">
//             <CalendarioSemanal
//               citas={citas}
//               fechaSeleccionada={fechaSeleccionada}
//               onFechaChange={setFechaSeleccionada}
//             />
//             <div className="mt-6 bg-white rounded-lg border border-gray-200 p-4">
//               <h3 className="text-sm font-medium text-gray-900 mb-3">Resumen del Día</h3>
//               <div className="space-y-2">
//                 <div className="flex justify-between text-sm">
//                   <span className="text-gray-600">Total de citas:</span>
//                   <span className="font-medium">{citasDelDia.length}</span>
//                 </div>
//                 <div className="flex justify-between text-sm">
//                   <span className="text-gray-600">Confirmadas:</span>
//                   <span className="font-medium text-green-600">
//                     {citasDelDia.filter(c => c.estado === 'CONFIRMADA').length}
//                   </span>
//                 </div>
//                 <div className="flex justify-between text-sm">
//                   <span className="text-gray-600">Pendientes:</span>
//                   <span className="font-medium text-yellow-600">
//                     {citasDelDia.filter(c => c.estado === 'SOLICITADA').length}
//                   </span>
//                 </div>
//                 <div className="flex justify-between text-sm">
//                   <span className="text-gray-600">Canceladas:</span>
//                   <span className="font-medium text-red-600">
//                     {citasDelDia.filter(c => c.estado === 'CANCELADA').length}
//                   </span>
//                 </div>
//               </div>
//             </div>
//           </div>
//           <div className="lg:col-span-2">
//             <div className="bg-white rounded-lg border border-gray-200">
//               <div className="px-6 py-4 border-b border-gray-200">
//                 <h2 className="text-lg font-medium text-gray-900">
//                   Citas del {formatearFecha(fechaSeleccionada)}
//                 </h2>
//                 <p className="text-sm text-gray-600 mt-1">
//                   {citasDelDia.length} cita{citasDelDia.length !== 1 ? 's' : ''} programada{citasDelDia.length !== 1 ? 's' : ''}
//                 </p>
//               </div>
//               <div className="p-6">
//                 <CitasList
//                   citas={citasDelDia}
//                   onEditar={handleEditarCita}
//                   onCancelar={cancelarCita}
//                   onConfirmar={confirmarCita}
//                   onEliminar={eliminarCita}
//                   loading={loading}
//                 />
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//       {mostrarFormulario && (
//         <CitaForm
//           pacientes={pacientes}
//           onSubmit={handleSubmitCita}
//           onCancel={handleCerrarFormulario}
//           loading={loading}
//           citaEditando={citaEditando}
//           onRetryLoadPacientes={cargarPacientes}
//         />
//       )}
//     </div>
//   )
// }
//--------------------------------------------
// app/dashboard/citas/page.tsx
'use client'
import { useState } from 'react'
import { useCitas } from './hooks/useCitas'
import CitaForm from './components/CitaForm'
import CitasList from './components/CitasList'
import CalendarioSemanal from './components/CalendarioSemanal'

interface Paciente {
  id: string
  nombres: string
  apellidos: string
  dni: string
  telefono?: string
  email?: string
}

interface Cita {
  id: string
  idPaciente: string
  fechaHora: Date
  estado: 'SOLICITADA' | 'CONFIRMADA' | 'MODIFICADA' | 'CANCELADA'
  motivo?: string
  observaciones?: string
  paciente: Paciente
  createdAt: Date
  updatedAt: Date
  telefonoContacto?: string
  emailContacto?: string
}

interface ResultadoRecordatorio {
  paciente: string
  estado: 'ENVIADO' | 'FALLIDO' | 'YA_ENVIADO' | 'SIN_CONTACTO' | 'ERROR'
  medio?: 'WHATSAPP' | 'EMAIL'
  telefono?: string
  email?: string
  fecha: Date
  motivo?: string
  mensaje: string
}

export default function CitasPage() {
  const {
    citas,
    citasDelDia,
    pacientes,
    loading,
    error,
    fechaSeleccionada,
    setFechaSeleccionada,
    setError,
    cargarCitas,
    crearCita,
    actualizarCita,
    cancelarCita,
    confirmarCita,
    eliminarCita,
    enviarRecordatorios,
    cargarPacientes
  } = useCitas()

  const [mostrarFormulario, setMostrarFormulario] = useState(false)
  const [citaEditando, setCitaEditando] = useState<Cita | null>(null)
  const [mostrarResultados, setMostrarResultados] = useState(false)
  const [resultadosRecordatorios, setResultadosRecordatorios] = useState<{
    enviados: number
    totalCitas: number
    detalles: ResultadoRecordatorio[]
  } | null>(null)
  const [enviandoRecordatorios, setEnviandoRecordatorios] = useState(false)

  const handleSubmitCita = async (datos: {
    idPaciente?: string
    nuevoPaciente?: { nombres: string; apellidos: string; dni: string }
    fechaHora: Date
    motivo?: string
    observaciones?: string
    telefonoContacto?: string
    emailContacto?: string
  }) => {
    try {
      const resultado = citaEditando
        ? await actualizarCita(citaEditando.id, {
            idPaciente: datos.idPaciente!,
            fechaHora: datos.fechaHora,
            motivo: datos.motivo,
            observaciones: datos.observaciones,
            telefonoContacto: datos.telefonoContacto,
            emailContacto: datos.emailContacto
          })
        : await crearCita(datos)
      
      if (resultado.success) {
        setCitaEditando(null)
        setMostrarFormulario(false)
        await cargarCitas()
        await cargarPacientes()
      }
      return resultado
    } catch (error: any) {
      console.error('Error en handleSubmitCita:', error)
      setError(error.message || 'Error al guardar la cita. Por favor, intenta de nuevo.')
      return { success: false, error: error.message || 'Error al guardar la cita' }
    }
  }

  const handleEditarCita = (cita: Cita) => {
    setCitaEditando(cita)
    setMostrarFormulario(true)
  }

  const handleCerrarFormulario = () => {
    setMostrarFormulario(false)
    setCitaEditando(null)
  }

  const handleEnviarRecordatorios = async () => {
    if (enviandoRecordatorios) return
    
    setEnviandoRecordatorios(true)
    try {
      const resultado = await enviarRecordatorios()
        if (resultado.success) {
      // Agregar tipado explícito para evitar el error rojo
      setResultadosRecordatorios(resultado as {
        enviados: number
        totalCitas: number
        detalles: ResultadoRecordatorio[]
      })
      setMostrarResultados(true)
    } else {
      setError(resultado.error || 'Error al enviar recordatorios')
    }

    } catch (error: any) {
      console.error('Error en enviarRecordatorios:', error)
      setError(error.message || 'Error al enviar recordatorios')
    } finally {
      setEnviandoRecordatorios(false)
    }
  }

  const formatearFecha = (fechaStr: string) => {
    const fecha = new Date(fechaStr)
    return fecha.toLocaleDateString('es-PE', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const getIconoEstado = (estado: string) => {
    switch (estado) {
      case 'ENVIADO': return '✅'
      case 'FALLIDO': return '❌'
      case 'YA_ENVIADO': return '🔄'
      case 'SIN_CONTACTO': return '📵'
      case 'ERROR': return '⚠️'
      default: return '❓'
    }
  }

  const getColorEstado = (estado: string) => {
    switch (estado) {
      case 'ENVIADO': return 'text-green-600 bg-green-50'
      case 'FALLIDO': return 'text-red-600 bg-red-50'
      case 'YA_ENVIADO': return 'text-blue-600 bg-blue-50'
      case 'SIN_CONTACTO': return 'text-yellow-600 bg-yellow-50'
      case 'ERROR': return 'text-orange-600 bg-orange-50'
      default: return 'text-gray-600 bg-gray-50'
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">Gestión de Citas</h1>
              <p className="text-sm text-gray-600">SONRISOFT - Clínica Dental</p>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={handleEnviarRecordatorios}
                disabled={enviandoRecordatorios}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                {enviandoRecordatorios && (
                  <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                )}
                <span>{enviandoRecordatorios ? 'Enviando...' : '📱 Enviar Recordatorios'}</span>
              </button>
              <button
                onClick={() => setMostrarFormulario(true)}
                className="px-4 py-2 bg-gray-800 text-white rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500"
              >
                ➕ Nueva Cita
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 rounded-md p-4">
            <div className="flex">
              <div className="text-red-800">
                <p className="text-sm">{error}</p>
              </div>
              <button
                onClick={() => {
                  setError('')
                  cargarCitas()
                  cargarPacientes()
                }}
                className="ml-auto text-red-600 hover:text-red-800"
              >
                Reintentar
              </button>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <CalendarioSemanal
              citas={citas}
              fechaSeleccionada={fechaSeleccionada}
              onFechaChange={setFechaSeleccionada}
            />
            <div className="mt-6 bg-white rounded-lg border border-gray-200 p-4">
              <h3 className="text-sm font-medium text-gray-900 mb-3">Resumen del Día</h3>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Total de citas:</span>
                  <span className="font-medium">{citasDelDia.length}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Confirmadas:</span>
                  <span className="font-medium text-green-600">
                    {citasDelDia.filter(c => c.estado === 'CONFIRMADA').length}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Pendientes:</span>
                  <span className="font-medium text-yellow-600">
                    {citasDelDia.filter(c => c.estado === 'SOLICITADA').length}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Canceladas:</span>
                  <span className="font-medium text-red-600">
                    {citasDelDia.filter(c => c.estado === 'CANCELADA').length}
                  </span>
                </div>
              </div>
            </div>
          </div>
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-900">
                  Citas del {formatearFecha(fechaSeleccionada)}
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                  {citasDelDia.length} cita{citasDelDia.length !== 1 ? 's' : ''} programada{citasDelDia.length !== 1 ? 's' : ''}
                </p>
              </div>
              <div className="p-6">
                <CitasList
                  citas={citasDelDia}
                  onEditar={handleEditarCita}
                  onCancelar={cancelarCita}
                  onConfirmar={confirmarCita}
                  onEliminar={eliminarCita}
                  loading={loading}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de Resultados de Recordatorios */}
      {mostrarResultados && resultadosRecordatorios && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-medium text-gray-900">📱 Resultados de Recordatorios</h3>
                  <p className="text-sm text-gray-600">
                    {resultadosRecordatorios.enviados} de {resultadosRecordatorios.totalCitas} recordatorios enviados exitosamente
                  </p>
                </div>
                <button
                  onClick={() => setMostrarResultados(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="flex items-center">
                    <span className="text-2xl">✅</span>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-green-800">Enviados</p>
                      <p className="text-2xl font-bold text-green-600">
                        {resultadosRecordatorios.detalles.filter(d => d.estado === 'ENVIADO').length}
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="flex items-center">
                    <span className="text-2xl">🔄</span>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-blue-800">Ya enviados</p>
                      <p className="text-2xl font-bold text-blue-600">
                        {resultadosRecordatorios.detalles.filter(d => d.estado === 'YA_ENVIADO').length}
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-red-50 p-4 rounded-lg">
                  <div className="flex items-center">
                    <span className="text-2xl">❌</span>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-red-800">Fallidos</p>
                      <p className="text-2xl font-bold text-red-600">
                        {resultadosRecordatorios.detalles.filter(d => ['FALLIDO', 'ERROR', 'SIN_CONTACTO'].includes(d.estado)).length}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="text-md font-medium text-gray-900">Detalle por Paciente:</h4>
                
                {resultadosRecordatorios.detalles.map((detalle, index) => (
                  <div key={index} className={`border rounded-lg p-4 ${getColorEstado(detalle.estado)}`}>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <span className="text-lg">{getIconoEstado(detalle.estado)}</span>
                          <span className="font-medium text-gray-900">{detalle.paciente}</span>
                          {detalle.medio && (
                            <span className="text-xs px-2 py-1 bg-gray-100 rounded-full text-gray-600">
                              {detalle.medio}
                            </span>
                          )}
                        </div>
                        
                        <div className="text-sm space-y-1">
                          <p>
                            <span className="font-medium">📅 Fecha cita:</span> {' '}
                            {new Date(detalle.fecha).toLocaleDateString('es-PE', {
                              weekday: 'long',
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })} - {new Date(detalle.fecha).toLocaleTimeString('es-PE', {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                          
                          {detalle.motivo && (
                            <p><span className="font-medium">📋 Motivo:</span> {detalle.motivo}</p>
                          )}
                          
                          {detalle.telefono && (
                            <p><span className="font-medium">📱 Teléfono:</span> {detalle.telefono}</p>
                          )}
                          
                          {detalle.email && (
                            <p><span className="font-medium">📧 Email:</span> {detalle.email}</p>
                          )}
                          
                          <p><span className="font-medium">💬 Estado:</span> {detalle.mensaje}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
              <div className="flex justify-between items-center">
                <p className="text-sm text-gray-600">
                  Total procesado: {resultadosRecordatorios.totalCitas} citas
                </p>
                <button
                  onClick={() => setMostrarResultados(false)}
                  className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Formulario de Citas */}
      {mostrarFormulario && (
        <CitaForm
          pacientes={pacientes}
          onSubmit={handleSubmitCita}
          onCancel={handleCerrarFormulario}
          loading={loading}
          citaEditando={citaEditando}
          onRetryLoadPacientes={cargarPacientes}
        />
      )}
    </div>
  )
}