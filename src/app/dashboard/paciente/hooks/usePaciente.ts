// app/dashboard/paciente/hooks/usePaciente.ts
'use client'
import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
// Tipo para el paciente
interface Paciente {
  id: string
  nombres: string
  apellidos: string
  dni: string
  fechaNacimiento?: Date
  edad?: number
  sexo?: 'M' | 'F' | 'OTRO'
  telefono?: string
  email?: string
  lugarNacimiento?: string
  direccionActual?: string
  acompanante?: string
  estado: 'ACTIVO' | 'INACTIVO'
  createdAt: Date
  updatedAt: Date
}

export function usePaciente() {
  // Estados para manejar el paciente
  const [pacienteSeleccionado, setPacienteSeleccionado] = useState<Paciente | null>(null)
  const [buscarDni, setBuscarDni] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  
  // Obtener parámetros de la URL
  const searchParams = useSearchParams()
  const dniFromUrl = searchParams.get('dni')

  // Efecto para cargar paciente si viene DNI en la URL
  useEffect(() => {
    if (dniFromUrl && !pacienteSeleccionado) {
      setBuscarDni(dniFromUrl)
      buscarPacientePorDni(dniFromUrl)
    }
  }, [dniFromUrl])

  // Función para buscar paciente por DNI
  const buscarPacientePorDni = async (dni: string) => {
    if (!dni.trim()) {
      setError('Por favor ingresa un DNI')
      return
    }

    setLoading(true)
    setError('')

    try {
      const response = await fetch(`/api/pacientes/buscar?dni=${dni}`)
      const data = await response.json()

      if (response.ok && data.paciente) {
        setPacienteSeleccionado(data.paciente)
      } else {
        setPacienteSeleccionado(null)
        setError('Paciente no encontrado')
      }
    } catch (error) {
      setError('Error al buscar paciente')
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  // Función para buscar paciente (llamada desde el componente)
  const buscarPaciente = () => {
    buscarPacientePorDni(buscarDni)
  }

  // Función para limpiar datos
  const limpiarPaciente = () => {
    setPacienteSeleccionado(null)
    setBuscarDni('')
    setError('')
  }

  return {
    pacienteSeleccionado,
    setPacienteSeleccionado,
    buscarDni,
    setBuscarDni,
    loading,
    setLoading,
    error,
    setError,
    buscarPaciente,
    limpiarPaciente
  }
}