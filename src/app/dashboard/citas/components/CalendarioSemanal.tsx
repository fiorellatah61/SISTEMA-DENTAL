// app/dashboard/citas/components/CalendarioSemanal.tsx
'use client'
import { useState, useEffect } from 'react'

interface Cita {
  id: string
  idPaciente: string
  fechaHora: Date
  estado: 'SOLICITADA' | 'CONFIRMADA' | 'MODIFICADA' | 'CANCELADA'
  motivo?: string
  observaciones?: string
  paciente: {
    id: string
    nombres: string
    apellidos: string
    dni: string
    telefono?: string
    email?: string
  }
  createdAt: Date
  updatedAt: Date
}

interface CalendarioSemanalProps {
  citas: Cita[]
  fechaSeleccionada: string
  onFechaChange: (fecha: string) => void
}

export default function CalendarioSemanal({ 
  citas, 
  fechaSeleccionada, 
  onFechaChange 
}: CalendarioSemanalProps) {
  const [diasSemana, setDiasSemana] = useState<Date[]>([])

  // Generar los días de la semana actual
  useEffect(() => {
    const fecha = new Date(fechaSeleccionada)
    const inicioSemana = new Date(fecha)
    
    // Encontrar el lunes de esta semana
    const dia = fecha.getDay()
    const diff = fecha.getDate() - dia + (dia === 0 ? -6 : 1)
    inicioSemana.setDate(diff)

    const dias = []
    for (let i = 0; i < 7; i++) {
      const diaActual = new Date(inicioSemana)
      diaActual.setDate(inicioSemana.getDate() + i)
      dias.push(diaActual)
    }
    
    setDiasSemana(dias)
  }, [fechaSeleccionada])

  // Contar citas por día
  const contarCitasPorDia = (fecha: Date) => {
    const fechaStr = fecha.toISOString().split('T')[0]
    return citas.filter(cita => {
      const fechaCita = new Date(cita.fechaHora).toISOString().split('T')[0]
      return fechaCita === fechaStr && cita.estado !== 'CANCELADA'
    }).length
  }

  // Navegar semana
  const navegarSemana = (direccion: 'anterior' | 'siguiente') => {
    const fecha = new Date(fechaSeleccionada)
    const dias = direccion === 'anterior' ? -7 : 7
    fecha.setDate(fecha.getDate() + dias)
    onFechaChange(fecha.toISOString().split('T')[0])
  }

  const irHoy = () => {
    const hoy = new Date().toISOString().split('T')[0]
    onFechaChange(hoy)
  }

  const nombresDias = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom']
  const meses = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ]

  const esFechaSeleccionada = (fecha: Date) => {
    return fecha.toISOString().split('T')[0] === fechaSeleccionada
  }

  const esHoy = (fecha: Date) => {
    const hoy = new Date().toISOString().split('T')[0]
    return fecha.toISOString().split('T')[0] === hoy
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      {/* Header con navegación */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => navegarSemana('anterior')}
          className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500"
        >
          ← Anterior
        </button>

        <div className="text-center">
          <h3 className="text-lg font-medium text-gray-900">
            {diasSemana.length > 0 && (
              `${meses[diasSemana[0].getMonth()]} ${diasSemana[0].getFullYear()}`
            )}
          </h3>
          <button
            onClick={irHoy}
            className="text-sm text-blue-600 hover:text-blue-800 focus:outline-none"
          >
            Ir a hoy
          </button>
        </div>

        <button
          onClick={() => navegarSemana('siguiente')}
          className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500"
        >
          Siguiente →
        </button>
      </div>

      {/* Calendario semanal */}
      <div className="grid grid-cols-7 gap-2">
        {diasSemana.map((fecha, index) => {
          const citasDelDia = contarCitasPorDia(fecha)
          const estaSeleccionado = esFechaSeleccionada(fecha)
          const esHoyDia = esHoy(fecha)

          return (
            <button
              key={index}
              onClick={() => onFechaChange(fecha.toISOString().split('T')[0])}
              className={`p-3 text-center rounded-lg border transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                estaSeleccionado
                  ? 'bg-blue-600 text-white border-blue-600'
                  : esHoyDia
                  ? 'bg-blue-50 text-blue-600 border-blue-200'
                  : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
              }`}
            >
              <div className="text-xs font-medium mb-1">
                {nombresDias[index]}
              </div>
              <div className="text-lg font-semibold">
                {fecha.getDate()}
              </div>
              {citasDelDia > 0 && (
                <div className={`text-xs mt-1 ${
                  estaSeleccionado ? 'text-blue-100' : 'text-blue-600'
                }`}>
                  {citasDelDia} cita{citasDelDia !== 1 ? 's' : ''}
                </div>
              )}
            </button>
          )
        })}
      </div>

      {/* Leyenda */}
      <div className="mt-4 text-xs text-gray-600 text-center">
        <span className="inline-block w-3 h-3 bg-blue-600 rounded mr-1"></span>
        Día seleccionado
        <span className="mx-3">•</span>
        <span className="inline-block w-3 h-3 bg-blue-50 border border-blue-200 rounded mr-1"></span>
        Hoy
      </div>
    </div>
  )
}