// app/dashboard/paciente/hooks/useFicha.ts
import { useState, useEffect } from 'react'

interface FichaData {
  id: string
  numeroFicha: string
  motivoConsulta?: string
  archivoFichaPdf?: string
  fechaUltimoPdf?: Date
  paciente: {
    id: string
    nombres: string
    apellidos: string
    dni: string
  }
}

export function useFicha(pacienteId?: string) {
  const [ficha, setFicha] = useState<FichaData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // **Función para buscar o crear ficha del paciente**
  const obtenerFicha = async (pacienteId: string) => {
    setLoading(true)
    setError('')
    
    try {
      const response = await fetch(`/api/ficha/paciente/${pacienteId}`)
      const data = await response.json()

      if (response.ok) {
        setFicha(data.ficha)
      } else {
        setError(data.error || 'Error al obtener ficha')
      }
    } catch (error) {
      console.error('Error:', error)
      setError('Error al obtener ficha')
    } finally {
      setLoading(false)
    }
  }

  // **Función para crear una nueva ficha si no existe**
  const crearFicha = async (pacienteId: string, motivoConsulta?: string) => {
    setLoading(true)
    setError('')
    
    try {
      const response = await fetch('/api/ficha/crear', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          pacienteId,
          motivoConsulta: motivoConsulta || ''
        })
      })

      const data = await response.json()

      if (response.ok) {
        setFicha(data.ficha)
        return data.ficha
      } else {
        setError(data.error || 'Error al crear ficha')
        return null
      }
    } catch (error) {
      console.error('Error:', error)
      setError('Error al crear ficha')
      return null
    } finally {
      setLoading(false)
    }
  }

  // **Función para actualizar motivo de consulta**
  const actualizarMotivoConsulta = async (fichaId: string, motivoConsulta: string) => {
    setLoading(true)
    setError('')
    
    try {
      const response = await fetch(`/api/ficha/${fichaId}/motivo-consulta`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ motivoConsulta })
      })

      const data = await response.json()

      if (response.ok) {
        setFicha(prev => prev ? { ...prev, motivoConsulta } : null)
        return true
      } else {
        setError(data.error || 'Error al actualizar motivo de consulta')
        return false
      }
    } catch (error) {
      console.error('Error:', error)
      setError('Error al actualizar motivo de consulta')
      return false
    } finally {
      setLoading(false)
    }
  }

  // **Función para verificar si existe PDF**
  const tienePdf = () => {
    return !!(ficha?.archivoFichaPdf)
  }

  // **Función para obtener URL del PDF**
  const obtenerUrlPdf = () => {
    return ficha?.archivoFichaPdf || null
  }

  // **Auto-cargar ficha cuando cambia el pacienteId**
  useEffect(() => {
    if (pacienteId) {
      obtenerFicha(pacienteId)
    }
  }, [pacienteId])

  return {
    ficha,
    loading,
    error,
    setError,
    obtenerFicha,
    crearFicha,
    actualizarMotivoConsulta,
    tienePdf,
    obtenerUrlPdf
  }
}