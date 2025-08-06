
// app/dashboard/citas/hooks/useCitas.ts
'use client'
import { useState, useEffect } from 'react'

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

export function useCitas() {
  const [citas, setCitas] = useState<Cita[]>([])
  const [citasDelDia, setCitasDelDia] = useState<Cita[]>([])
  const [pacientes, setPacientes] = useState<Paciente[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [fechaSeleccionada, setFechaSeleccionada] = useState<string>(
    new Date().toISOString().split('T')[0]
  )

  const filtrarCitasDelDia = () => {
    const fecha = new Date(fechaSeleccionada)
    const fechaInicio = new Date(fecha.getFullYear(), fecha.getMonth(), fecha.getDate())
    const fechaFin = new Date(fecha.getFullYear(), fecha.getMonth(), fecha.getDate() + 1)
    
    const citasFiltradas = citas.filter(cita => {
      const fechaCita = new Date(cita.fechaHora)
      return fechaCita >= fechaInicio && fechaCita < fechaFin && cita.estado !== 'CANCELADA'
    })
    
    setCitasDelDia(citasFiltradas)
  }

  useEffect(() => {
    const registerUser = async () => {
      try {
        const response = await fetch('/api/users/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' }
        })
        if (!response.ok) {
          console.error('Error al registrar usuario:', await response.text())
        }
      } catch (error) {
        console.error('Error al registrar usuario:', error)
      }
    }

    registerUser()
    cargarCitas()
    cargarPacientes()
  }, [])

  useEffect(() => {
    filtrarCitasDelDia()
  }, [citas, fechaSeleccionada])

  const cargarCitas = async () => {
    setLoading(true)
    setError('')
    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 15000)
      const response = await fetch('/api/citas', {
        cache: 'no-store',
        signal: controller.signal
      })
      clearTimeout(timeoutId)

      if (!response.ok) {
        const errorData = await response.text().catch(() => 'Error desconocido')
        throw new Error(errorData || `Error ${response.status}: No se pudieron cargar las citas`)
      }
      const data = await response.json()
      
      setCitas(data.citas?.map((cita: any) => ({
        ...cita,
        fechaHora: new Date(cita.fechaHora),
        createdAt: new Date(cita.createdAt),
        updatedAt: new Date(cita.updatedAt)
      })) || [])
    } catch (error: any) {
      if (error.name === 'AbortError') {
        setError('Tiempo de espera agotado al cargar citas. Por favor, verifica tu conexión.')
      } else {
        setError(error.message || 'Error al cargar citas. Por favor, intenta de nuevo.')
      }
      console.error('Error al cargar citas:', error)
    } finally {
      setLoading(false)
    }
  }

  const cargarPacientes = async () => {
    setLoading(true)
    setError('')
    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 15000)
      const response = await fetch('/api/pacientes-cita', {
        cache: 'no-store',
        signal: controller.signal
      })
      clearTimeout(timeoutId)

      if (!response.ok) {
        const errorData = await response.text().catch(() => 'Error desconocido')
        throw new Error(errorData || `Error ${response.status}: No se pudieron cargar los pacientes`)
      }
      const data = await response.json()
      
      if (!data.pacientes) {
        throw new Error('No se encuentran pacientes en la respuesta')
      }
      setPacientes(data.pacientes || [])
    } catch (error: any) {
      if (error.name === 'AbortError') {
        setError('Tiempo de espera agotado al cargar pacientes. Por favor, verifica tu conexión.')
      } else {
        setError(error.message || 'Error al cargar pacientes. Por favor, verifica la conexión.')
      }
      console.error('Error al cargar pacientes:', error)
    } finally {
      setLoading(false)
    }
  }

  const crearCita = async (datoCita: {
    idPaciente?: string
    nuevoPaciente?: { nombres: string; apellidos: string; dni: string }
    fechaHora: Date
    motivo?: string
    observaciones?: string
  }) => {
    setLoading(true)
    setError('')
    try {
      if (isNaN(datoCita.fechaHora.getTime())) {
        throw new Error('Formato de fecha inválido')
      }

      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 15000)
      const response = await fetch('/api/citas', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...datoCita,
          fechaHora: datoCita.fechaHora.toISOString()
        }),
        signal: controller.signal
      })
      clearTimeout(timeoutId)

      if (!response.ok) {
        const errorData = await response.text().catch(() => 'Error desconocido')
        throw new Error(errorData || `Error ${response.status}: No se pudo crear la cita`)
      }

      const data = await response.json()
      await cargarCitas()
      await cargarPacientes()
      return { success: true, cita: data.cita }
    } catch (error: any) {
      if (error.name === 'AbortError') {
        setError('Tiempo de espera agotado al crear cita. Por favor, verifica tu conexión.')
      } else {
        setError(error.message || 'Error al crear cita')
      }
      console.error('Error al crear cita:', error)
      return { success: false, error: error.message || 'Error al crear cita' }
    } finally {
      setLoading(false)
    }
  }

  const actualizarCita = async (citaId: string, datos: Partial<Cita>) => {
    setLoading(true)
    setError('')
    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 15000)
      const response = await fetch(`/api/citas/${citaId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...datos,
          fechaHora: datos.fechaHora?.toISOString()
        }),
        signal: controller.signal
      })
      clearTimeout(timeoutId)

      if (!response.ok) {
        const errorData = await response.text().catch(() => 'Error desconocido')
        throw new Error(errorData || `Error ${response.status}: No se pudo actualizar la cita`)
      }

      const data = await response.json()
      await cargarCitas()
      return { success: true, cita: data.cita }
    } catch (error: any) {
      if (error.name === 'AbortError') {
        setError('Tiempo de espera agotado al actualizar cita. Por favor, verifica tu conexión.')
      } else {
        setError(error.message || 'Error al actualizar cita')
      }
      console.error('Error al actualizar cita:', error)
      return { success: false, error: error.message || 'Error al actualizar cita' }
    } finally {
      setLoading(false)
    }
  }

  const cancelarCita = async (citaId: string) => {
    return await actualizarCita(citaId, { estado: 'CANCELADA' })
  }

  const confirmarCita = async (citaId: string) => {
    return await actualizarCita(citaId, { estado: 'CONFIRMADA' })
  }

  const eliminarCita = async (citaId: string) => {
    setLoading(true)
    setError('')
    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 15000)
      const response = await fetch(`/api/citas/${citaId}`, {
        method: 'DELETE',
        signal: controller.signal
      })
      clearTimeout(timeoutId)

      if (!response.ok) {
        const errorData = await response.text().catch(() => 'Error desconocido')
        throw new Error(errorData || `Error ${response.status}: No se pudo eliminar la cita`)
      }

      await cargarCitas()
      return { success: true }
    } catch (error: any) {
      if (error.name === 'AbortError') {
        setError('Tiempo de espera agotado al eliminar cita. Por favor, verifica tu conexión.')
      } else {
        setError(error.message || 'Error al eliminar cita')
      }
      console.error('Error al eliminar cita:', error)
      return { success: false, error: error.message || 'Error al eliminar cita' }
    } finally {
      setLoading(false)
    }
  }

  const enviarRecordatorios = async () => {
    setLoading(true)
    setError('')
    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 15000)
      const response = await fetch('/api/citas/recordatorios', {
        method: 'POST',
        signal: controller.signal
      })
      clearTimeout(timeoutId)

      if (!response.ok) {
        const errorData = await response.text().catch(() => 'Error desconocido')
        throw new Error(errorData || `Error ${response.status}: No se pudieron enviar los recordatorios`)
      }

      const data = await response.json()
      return { success: true, enviados: data.enviados }
    } catch (error: any) {
      if (error.name === 'AbortError') {
        setError('Tiempo de espera agotado al enviar recordatorios. Por favor, verifica tu conexión.')
      } else {
        setError(error.message || 'Error al enviar recordatorios')
      }
      console.error('Error al enviar recordatorios:', error)
      return { success: false, error: error.message || 'Error al enviar recordatorios' }
    } finally {
      setLoading(false)
    }
  }

  return {
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
  }
}
