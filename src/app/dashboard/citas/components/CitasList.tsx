// // // app/dashboard/citas/components/CitasList.tsx
'use client'
import { useState } from 'react'

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

interface CitasListProps {
  citas: Cita[]
  onEditar: (cita: Cita) => void
  onCancelar: (citaId: string) => Promise<{ success: boolean; error?: string }>
  onConfirmar: (citaId: string) => Promise<{ success: boolean; error?: string }>
  onEliminar: (citaId: string) => Promise<{ success: boolean; error?: string }>
  loading: boolean
}

export default function CitasList({
  citas,
  onEditar,
  onCancelar,
  onConfirmar,
  onEliminar,
  loading
}: CitasListProps) {
  const [error, setError] = useState('')

  const handleConfirmar = async (citaId: string) => {
    const confirmacion = window.confirm('¿Estás seguro de confirmar esta cita?')
    if (!confirmacion) return

    try {
      const resultado = await onConfirmar(citaId)
      if (resultado.success) {
        alert('Cita confirmada correctamente')
      } else {
        setError(resultado.error || 'Error al confirmar la cita')
      }
    } catch (error: any) {
      setError(error.message || 'Error al confirmar la cita')
    }
  }

  const handleCancelar = async (citaId: string) => {
    const confirmacion = window.confirm('¿Estás seguro de cancelar esta cita?')
    if (!confirmacion) return

    try {
      const resultado = await onCancelar(citaId)
      if (resultado.success) {
        alert('Cita cancelada correctamente')
      } else {
        setError(resultado.error || 'Error al cancelar la cita')
      }
    } catch (error: any) {
      setError(error.message || 'Error al cancelar la cita')
    }
  }

  const handleEliminar = async (citaId: string) => {
    const confirmacion = window.confirm('¿Estás seguro de eliminar esta cita?')
    if (!confirmacion) return

    try {
      const resultado = await onEliminar(citaId)
      if (resultado.success) {
        alert('Cita eliminada correctamente')
      } else {
        setError(resultado.error || 'Error al eliminar la cita')
      }
    } catch (error: any) {
      setError(error.message || 'Error al eliminar la cita')
    }
  }

  const formatHora = (fecha: Date) => {
    return new Date(fecha).toLocaleTimeString('es-PE', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="max-w-3xl mx-auto">
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 shadow-sm">
          <div className="flex items-center">
            <div className="text-red-800">
              <p className="text-sm font-medium">{error}</p>
            </div>
            <button
              onClick={() => setError('')}
              className="ml-auto text-red-600 hover:text-red-800 font-medium transition-colors"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}

      {citas.length === 0 ? (
        <p className="text-gray-600 text-center text-lg font-medium">No hay citas programadas para este día</p>
      ) : (
        <div className="space-y-4">
          {citas.map((cita) => (
            <div
              key={cita.id}
              className={`border border-gray-200 rounded-lg p-5 bg-white shadow-md hover:shadow-lg transition-shadow ${cita.estado === 'CANCELADA' ? 'bg-red-50 opacity-65' : ''}`}
            >
              <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {cita.paciente.nombres} {cita.paciente.apellidos}
                  </h3>
                  <p className="text-sm text-gray-600">DNI: {cita.paciente.dni}</p>
                  <p className="text-sm text-gray-600">Hora: {formatHora(cita.fechaHora)}</p>
                  {cita.motivo && (
                    <p className="text-sm text-gray-600">Motivo: {cita.motivo}</p>
                  )}
                  {cita.observaciones && (
                    <p className="text-sm text-gray-600">Observaciones: {cita.observaciones}</p>
                  )}
                  <p className="text-sm text-gray-600">Estado: {cita.estado}</p>
                </div>
                <div className="grid grid-cols-2 gap-2 w-full sm:w-auto">
                  {cita.estado !== 'CONFIRMADA' && (
                    <button
                      onClick={() => handleConfirmar(cita.id)}
                      disabled={loading}
                      className="px-3 py-1.5 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50 text-sm font-medium transition-colors"
                    >
                      Confirmar
                    </button>
                  )}
                  {cita.estado !== 'CANCELADA' && (
                    <button
                      onClick={() => handleCancelar(cita.id)}
                      disabled={loading}
                      className="px-3 py-1.5 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50 text-sm font-medium transition-colors"
                    >
                      Cancelar
                    </button>
                  )}
                  <button
                    onClick={() => onEditar(cita)}
                    disabled={loading}
                    className="px-3 py-1.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 text-sm font-medium transition-colors"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => handleEliminar(cita.id)}
                    disabled={loading}
                    className="px-3 py-1.5 bg-gray-600 text-white rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 disabled:opacity-50 text-sm font-medium transition-colors"
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}