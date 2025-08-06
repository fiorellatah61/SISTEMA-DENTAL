'use client'
import { useState, useEffect } from 'react'


// Definición de tipos dentro del archivo
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

interface CitaFormProps {
  pacientes: Paciente[]
  onSubmit: (datos: {
    idPaciente?: string
    nuevoPaciente?: { nombres: string; apellidos: string; dni: string }
    fechaHora: Date
    motivo?: string
    observaciones?: string
  }) => Promise<{ success: boolean; error?: string }>
  onCancel: () => void
  loading: boolean
  citaEditando?: Cita | null
  onRetryLoadPacientes: () => void
}

export default function CitaForm({
  pacientes,
  onSubmit,
  onCancel,
  loading,
  citaEditando,
  onRetryLoadPacientes
}: CitaFormProps) {
  const [esPacienteNuevo, setEsPacienteNuevo] = useState(!citaEditando)
  const [idPaciente, setIdPaciente] = useState<string | undefined>(citaEditando?.idPaciente)
  const [nombres, setNombres] = useState(citaEditando?.paciente?.nombres || '')
  const [apellidos, setApellidos] = useState(citaEditando?.paciente?.apellidos || '')
  const [dni, setDni] = useState(citaEditando?.paciente?.dni || '')
  const [fecha, setFecha] = useState(
    citaEditando ? new Date(citaEditando.fechaHora).toISOString().split('T')[0] : ''
  )
  const [hora, setHora] = useState(
    citaEditando
      ? new Date(citaEditando.fechaHora).toTimeString().slice(0, 5)
      : ''
  )
  const [motivo, setMotivo] = useState(citaEditando?.motivo || '')
  const [observaciones, setObservaciones] = useState(citaEditando?.observaciones || '')
  const [error, setError] = useState('')
  const [buscandoPaciente, setBuscandoPaciente] = useState(false)

  const handleBuscarPaciente = async () => {
    if (!dni) {
      setError('Por favor, ingrese un DNI')
      return
    }

    setBuscandoPaciente(true)
    try {
      const response = await fetch(`/api/pacientes-cita/buscar?dni=${dni}`)
      if (response.ok) {
        const paciente = await response.json()
        setIdPaciente(paciente.id)
        setNombres(paciente.nombres)
        setApellidos(paciente.apellidos)
        setError('')
      } else if (response.status === 404) {
        setError('Paciente no encontrado')
        setIdPaciente(undefined)
        setNombres('')
        setApellidos('')
      } else {
        setError('Error al buscar paciente')
      }
    } catch (error) {
      console.error('Error al buscar paciente:', error)
      setError('Error al buscar paciente. Por favor, intenta de nuevo.')
    } finally {
      setBuscandoPaciente(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    const fechaHora = new Date(`${fecha}T${hora}`)
    if (isNaN(fechaHora.getTime())) {
      setError('Por favor, seleccione una fecha y hora válidas')
      return
    }

    const datos = {
      idPaciente: esPacienteNuevo ? undefined : idPaciente,
      nuevoPaciente: esPacienteNuevo ? { nombres, apellidos, dni } : undefined,
      fechaHora,
      motivo: motivo || undefined,
      observaciones: observaciones || undefined
    }

    // Mostrar diálogo de confirmación
    const accion = citaEditando ? 'actualizar' : 'crear'
    const confirmacion = window.confirm(`¿Estás seguro de ${accion} esta cita?`)
    if (!confirmacion) {
      return
    }

    try {
      const resultado = await onSubmit(datos)
      if (resultado.success) {
        // Mostrar mensaje de éxito
        alert(`Cita ${citaEditando ? 'actualizada' : 'creada'} correctamente`)
        onCancel()
      } else {
        setError(resultado.error || 'Error al guardar la cita')
      }
    } catch (error: any) {
      console.error('Error al guardar cita:', error)
      setError(error.message || 'Error al guardar la cita')
    }
  }

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center">
      <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full">
        <h2 className="text-xl font-semibold mb-4">
          {citaEditando ? 'Editar Cita' : 'Nueva Cita'}
        </h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tipo de Paciente
            </label>
            <div className="flex space-x-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="tipoPaciente"
                  checked={!esPacienteNuevo}
                  onChange={() => setEsPacienteNuevo(false)}
                  className="mr-2"
                  disabled={!!citaEditando}
                />
                Paciente Existente
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="tipoPaciente"
                  checked={esPacienteNuevo}
                  onChange={() => setEsPacienteNuevo(true)}
                  className="mr-2"
                  disabled={!!citaEditando}
                />
                Paciente Nuevo
              </label>
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              DNI
            </label>
            <div className="flex space-x-2">
              <input
                type="text"
                value={dni}
                onChange={(e) => setDni(e.target.value)}
                className="flex-1 p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={!!citaEditando}
              />
              {!esPacienteNuevo && (
                <button
                  type="button"
                  onClick={handleBuscarPaciente}
                  disabled={buscandoPaciente || !!citaEditando}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  {buscandoPaciente ? 'Buscando...' : 'Buscar'}
                </button>
              )}
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nombres
            </label>
            <input
              type="text"
              value={nombres}
              onChange={(e) => setNombres(e.target.value)}
              className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={!esPacienteNuevo}
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Apellidos
            </label>
            <input
              type="text"
              value={apellidos}
              onChange={(e) => setApellidos(e.target.value)}
              className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={!esPacienteNuevo}
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Fecha
            </label>
            <input
              type="date"
              value={fecha}
              onChange={(e) => setFecha(e.target.value)}
              className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Hora
            </label>
            <input
              type="time"
              value={hora}
              onChange={(e) => setHora(e.target.value)}
              className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Motivo
            </label>
            <input
              type="text"
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
              className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Observaciones
            </label>
            <textarea
              value={observaciones}
              onChange={(e) => setObservaciones(e.target.value)}
              className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={4}
            />
          </div>

          {error && (
            <div className="mb-4 text-red-600 text-sm">{error}</div>
          )}

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onCancel}
              disabled={loading}
              className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {loading ? 'Guardando...' : citaEditando ? 'Actualizar' : 'Crear'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
