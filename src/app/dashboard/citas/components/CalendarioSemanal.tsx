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
    <div className="max-w-2xl mx-auto bg-white rounded-lg border border-gray-100 p-4 shadow-sm transition-shadow">
      {/* Header con navegación */}
      <div className="flex items-center justify-between mb-3">
        <button
          onClick={() => navegarSemana('anterior')}
          className="px-3 py-1 text-sm font-medium text-gray-600 bg-gray-50 border border-gray-200 rounded-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-colors"
        >
          ← Anterior
        </button>

        <div className="text-center">
          <h3 className="text-lg font-semibold text-gray-800">
            {diasSemana.length > 0 && (
              `${meses[diasSemana[0].getMonth()]} ${diasSemana[0].getFullYear()}`
            )}
          </h3>
          <button
            onClick={irHoy}
            className="text-xs font-medium text-blue-500 hover:text-blue-700 focus:outline-none transition-colors"
          >
            Ir a hoy
          </button>
        </div>

        <button
          onClick={() => navegarSemana('siguiente')}
          className="px-3 py-1 text-sm font-medium text-gray-600 bg-gray-50 border border-gray-200 rounded-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-colors"
        >
          Siguiente →
        </button>
      </div>

      {/* Calendario semanal */}
      <div className="grid grid-cols-7 gap-1.5">
        {diasSemana.map((fecha, index) => {
          const citasDelDia = contarCitasPorDia(fecha)
          const estaSeleccionado = esFechaSeleccionada(fecha)
          const esHoyDia = esHoy(fecha)

          return (
            <button
              key={index}
              onClick={() => onFechaChange(fecha.toISOString().split('T')[0])}
              className={`p-2 text-center rounded-md border transition-all focus:outline-none focus:ring-2 focus:ring-blue-400 ${
                estaSeleccionado
                  ? 'bg-blue-500 text-white border-blue-500'
                  : esHoyDia
                  ? 'bg-blue-50 text-blue-600 border-blue-100'
                  : 'bg-white text-gray-600 border-gray-100 hover:bg-gray-50'
              }`}
            >
              <div className="text-xs font-medium">
                {nombresDias[index]}
              </div>
              <div className="text-base font-semibold">
                {fecha.getDate()}
              </div>
              {citasDelDia > 0 && (
                <div className={`text-xs mt-0.5 ${
                  estaSeleccionado ? 'text-blue-100' : 'text-blue-500'
                }`}>
                  {citasDelDia} cita{citasDelDia !== 1 ? 's' : ''}
                </div>
              )}
            </button>
          )
        })}
      </div>

      {/* Leyenda */}
      <div className="mt-3 text-xs font-medium text-gray-500 flex items-center justify-center gap-2">
        <div className="flex items-center">
          <span className="inline-block w-2.5 h-2.5 bg-blue-500 rounded-sm mr-1"></span>
          Día seleccionado
        </div>
        <div className="flex items-center">
          <span className="inline-block w-2.5 h-2.5 bg-blue-50 border border-blue-100 rounded-sm mr-1"></span>
          Hoy
        </div>
      </div>
    </div>
  )
}