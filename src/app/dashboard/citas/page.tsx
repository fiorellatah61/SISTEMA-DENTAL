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
    <div className="min-h-screen bg-gray-100">
      <div className="bg-white shadow-sm border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-xl font-bold text-gray-900">Gestión de Citas</h1>
              <p className="text-sm text-gray-500">SONRISOFT - Clínica Dental</p>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={handleEnviarRecordatorios}
                disabled={enviandoRecordatorios}
                className="px-3 py-1.5 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-1.5 text-sm font-medium transition-colors"
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
                className="px-3 py-1.5 bg-gray-700 text-white rounded-md hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-400 text-sm font-medium transition-colors"
              >
                ➕ Nueva Cita
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {error && (
          <div className="mb-4 bg-red-50 border border-red-100 rounded-lg p-3 shadow-sm">
            <div className="flex items-center">
              <div className="text-red-700">
                <p className="text-sm font-medium">{error}</p>
              </div>
              <button
                onClick={() => {
                  setError('')
                  cargarCitas()
                  cargarPacientes()
                }}
                className="ml-auto text-red-500 hover:text-red-700 text-sm font-medium transition-colors"
              >
                Reintentar
              </button>
            </div>
          </div>
        )}

        {/* Layout: Calendario y resumen a la izquierda, citas a la derecha */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Columna izquierda: Calendario y Resumen */}
          <div className="lg:col-span-1 space-y-4">
            <div className="bg-white rounded-lg border border-gray-100 shadow-sm">
              <CalendarioSemanal
                citas={citas}
                fechaSeleccionada={fechaSeleccionada}
                onFechaChange={setFechaSeleccionada}
              />
            </div>
            
            {/* Resumen del día */}
            <div className="bg-white rounded-lg border border-gray-100 shadow-sm p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-semibold text-gray-800">Resumen del Día</h3>
                <div className="flex items-center text-sm text-gray-500">
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a1 1 0 011-1h6a1 1 0 011 1v4m2 4H6l-1 10h10L15 11z" />
                  </svg>
                  {formatearFecha(fechaSeleccionada)}
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-blue-50 p-3 rounded-md border border-blue-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-medium text-blue-700">Total</p>
                      <p className="text-xl font-bold text-blue-600">{citasDelDia.length}</p>
                    </div>
                    <div className="text-blue-400">
                      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>
                </div>
                
                <div className="bg-green-50 p-3 rounded-md border border-green-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-medium text-green-700">Confirmadas</p>
                      <p className="text-xl font-bold text-green-600">
                        {citasDelDia.filter(c => c.estado === 'CONFIRMADA').length}
                      </p>
                    </div>
                    <div className="text-green-400">
                      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>
                </div>
                
                <div className="bg-yellow-50 p-3 rounded-md border border-yellow-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-medium text-yellow-700">Pendientes</p>
                      <p className="text-xl font-bold text-yellow-600">
                        {citasDelDia.filter(c => c.estado === 'SOLICITADA').length}
                      </p>
                    </div>
                    <div className="text-yellow-400">
                      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>
                </div>
                
                <div className="bg-red-50 p-3 rounded-md border border-red-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-medium text-red-700">Canceladas</p>
                      <p className="text-xl font-bold text-red-600">
                        {citasDelDia.filter(c => c.estado === 'CANCELADA').length}
                      </p>
                    </div>
                    <div className="text-red-400">
                      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Columna derecha: Lista de citas */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg border border-gray-100 shadow-sm">
              <div className="px-4 py-3 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-800">
                      Citas del {formatearFecha(fechaSeleccionada)}
                    </h2>
                    <p className="text-sm text-gray-500 mt-1 flex items-center">
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {citasDelDia.length} cita{citasDelDia.length !== 1 ? 's' : ''} programada{citasDelDia.length !== 1 ? 's' : ''}
                    </p>
                  </div>
                  {/* {citasDelDia.length > 0 && (
                    <div className="flex items-center space-x-3 text-xs text-gray-500">
                      <div className="flex items-center">
                        <div className="w-2.5 h-2.5 bg-green-400 rounded-full mr-1"></div>
                        <span>Confirmadas</span>
                      </div>
                      <div className="flex items-center">
                        <div className="w-2.5 h-2.5 bg-yellow-400 rounded-full mr-1"></div>
                        <span>Pendientes</span>
                      </div>
                      <div className="flex items-center">
                        <div className="w-2.5 h-2.5 bg-red-400 rounded-full mr-1"></div>
                        <span>Canceladas</span>
                      </div>
                    </div>
                  )} */}
                </div>
              </div>
              <div className="p-4">
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
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-3xl w-full max-h-[85vh] overflow-hidden shadow-xl">
            <div className="px-4 py-3 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-white">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">📱 Resultados de Recordatorios</h3>
                  <p className="text-sm text-gray-500">
                    {resultadosRecordatorios.enviados} de {resultadosRecordatorios.totalCitas} recordatorios enviados exitosamente
                  </p>
                </div>
                <button
                  onClick={() => setMostrarResultados(false)}
                  className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            
            <div className="p-4 overflow-y-auto max-h-[calc(85vh-120px)]">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
               politician 
                <div className="bg-green-50 p-3 rounded-md border border-green-100">
                  <div className="flex items-center">
                    <span className="text-xl">✅</span>
                    <div className="ml-2">
                      <p className="text-xs font-medium text-green-700">Enviados</p>
                      <p className="text-lg font-bold text-green-600">
                        {resultadosRecordatorios.detalles.filter(d => d.estado === 'ENVIADO').length}
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-blue-50 p-3 rounded-md border border-blue-100">
                  <div className="flex items-center">
                    <span className="text-xl">🔄</span>
                    <div className="ml-2">
                      <p className="text-xs font-medium text-blue-700">Ya enviados</p>
                      <p className="text-lg font-bold text-blue-600">
                        {resultadosRecordatorios.detalles.filter(d => d.estado === 'YA_ENVIADO').length}
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-red-50 p-3 rounded-md border border-red-100">
                  <div className="flex items-center">
                    <span className="text-xl">❌</span>
                    <div className="ml-2">
                      <p className="text-xs font-medium text-red-700">Fallidos</p>
                      <p className="text-lg font-bold text-red-600">
                        {resultadosRecordatorios.detalles.filter(d => ['FALLIDO', 'ERROR', 'SIN_CONTACTO'].includes(d.estado)).length}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="text-sm font-medium text-gray-800">Detalle por Paciente:</h4>
                
                {resultadosRecordatorios.detalles.map((detalle, index) => (
                  <div key={index} className={`border rounded-md p-3 ${getColorEstado(detalle.estado)}`}>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="text-lg">{getIconoEstado(detalle.estado)}</span>
                          <span className="font-medium text-gray-800">{detalle.paciente}</span>
                          {detalle.medio && (
                            <span className="text-xs px-1.5 py-0.5 bg-gray-100 rounded-full text-gray-600">
                              {detalle.medio}
                            </span>
                          )}
                        </div>
                        
                        <div className="text-xs space-y-1 text-gray-600">
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
            
            <div className="px-4 py-3 border-t border-gray-100 bg-gray-50">
              <div className="flex justify-between items-center">
                <p className="text-sm text-gray-500">
                  Total procesado: {resultadosRecordatorios.totalCitas} citas
                </p>
                <button
                  onClick={() => setMostrarResultados(false)}
                  className="px-3 py-1.5 bg-gray-600 text-white rounded-md hover:bg-gray-700 text-sm font-medium transition-colors"
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