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

  const handleSubmitCita = async (datos: {
    idPaciente?: string
    nuevoPaciente?: { nombres: string; apellidos: string; dni: string }
    fechaHora: Date
    motivo?: string
    observaciones?: string
  }) => {
    try {
      const resultado = citaEditando
        ? await actualizarCita(citaEditando.id, {
            idPaciente: datos.idPaciente!,
            fechaHora: datos.fechaHora,
            motivo: datos.motivo,
            observaciones: datos.observaciones
          })
        : await crearCita(datos)
      
      if (resultado.success) {
        setCitaEditando(null)
        setMostrarFormulario(false)
        await cargarCitas() // Forzar recarga de citas
        await cargarPacientes() // Forzar recarga de pacientes
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
    try {
      const resultado = await enviarRecordatorios()
      if (resultado.success) {
        alert(`Recordatorios enviados: ${resultado.enviados}`)
      } else {
        setError(resultado.error || 'Error al enviar recordatorios')
      }
    } catch (error: any) {
      console.error('Error en enviarRecordatorios:', error)
      setError(error.message || 'Error al enviar recordatorios')
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
                disabled={loading}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
              >
                {loading ? 'Enviando...' : 'Enviar Recordatorios'}
              </button>
              <button
                onClick={() => setMostrarFormulario(true)}
                className="px-4 py-2 bg-gray-800 text-white rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500"
              >
                Nueva Cita
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
