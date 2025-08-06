// app/dashboard/planes-tratamiento/page.tsx
'use client'
import { useState, useEffect } from 'react'

// Interfaz para el plan de tratamiento
interface PlanTratamiento {
  id: string
  descripcion: string
  costoTotal: number
  createdAt: string
  updatedAt: string
}

export default function PlanesTratamientoPage() {
  // Estados para manejar los planes
  const [planes, setPlanes] = useState<PlanTratamiento[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  
  // Estados para el formulario
  const [mostrarFormulario, setMostrarFormulario] = useState(false)
  const [planEditando, setPlanEditando] = useState<PlanTratamiento | null>(null)
  const [formData, setFormData] = useState({
    descripcion: '',
    costoTotal: ''
  })

  // Cargar planes al iniciar
  useEffect(() => {
    cargarPlanes()
  }, [])

  // Función para cargar todos los planes
  const cargarPlanes = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/planes-tratamiento')
      const data = await response.json()
      
      if (response.ok) {
        setPlanes(data.planes)
      } else {
        setError(data.error || 'Error al cargar planes')
      }
    } catch (error) {
      setError('Error al cargar planes')
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  // Función para manejar cambios en el formulario
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  // Función para guardar/actualizar plan
  const guardarPlan = async () => {
    if (!formData.descripcion.trim() || !formData.costoTotal) {
      setError('Por favor complete todos los campos')
      return
    }

    try {
      setLoading(true)
      setError('')

      const method = planEditando ? 'PUT' : 'POST'
      const url = planEditando 
        ? `/api/planes-tratamiento?id=${planEditando.id}` 
        : '/api/planes-tratamiento'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          descripcion: formData.descripcion,
          costoTotal: parseFloat(formData.costoTotal)
        }),
      })

      const data = await response.json()

      if (response.ok) {
        alert(planEditando ? 'Plan actualizado correctamente' : 'Plan creado correctamente')
        cancelarFormulario()
        cargarPlanes() // Recargar la lista
      } else {
        setError(data.error || 'Error al guardar plan')
      }
    } catch (error) {
      setError('Error al guardar plan')
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  // Función para editar plan
  const editarPlan = (plan: PlanTratamiento) => {
    setPlanEditando(plan)
    setFormData({
      descripcion: plan.descripcion,
      costoTotal: plan.costoTotal.toString()
    })
    setMostrarFormulario(true)
  }

  // Función para eliminar plan
  const eliminarPlan = async (id: string) => {
    const confirmar = window.confirm('¿Estás seguro de eliminar este plan de tratamiento?')
    if (!confirmar) return

    try {
      setLoading(true)
      const response = await fetch(`/api/planes-tratamiento?id=${id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        alert('Plan eliminado correctamente')
        cargarPlanes() // Recargar la lista
      } else {
        const data = await response.json()
        setError(data.error || 'Error al eliminar plan')
      }
    } catch (error) {
      setError('Error al eliminar plan')
    } finally {
      setLoading(false)
    }
  }

  // Función para cancelar formulario
  const cancelarFormulario = () => {
    setMostrarFormulario(false)
    setPlanEditando(null)
    setFormData({
      descripcion: '',
      costoTotal: ''
    })
    setError('')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <h1 className="text-2xl font-semibold text-gray-900">Planes de Tratamiento</h1>
            <button
              onClick={() => setMostrarFormulario(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
            >
              Nuevo Plan
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Mostrar errores */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {/* Formulario de plan (modal) */}
        {mostrarFormulario && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-lg max-w-md w-full mx-4">
              <div className="p-6">
                <h3 className="text-lg font-semibold mb-4">
                  {planEditando ? 'Editar Plan' : 'Nuevo Plan de Tratamiento'}
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Descripción:
                    </label>
                    <textarea
                      name="descripcion"
                      value={formData.descripcion}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      rows={3}
                      placeholder="Descripción del tratamiento..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Costo Total:
                    </label>
                    <input
                      type="number"
                      name="costoTotal"
                      value={formData.costoTotal}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="0.00"
                      step="0.01"
                    />
                  </div>
                </div>

                <div className="flex space-x-3 mt-6">
                  <button
                    onClick={cancelarFormulario}
                    className="flex-1 border border-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-50"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={guardarPlan}
                    disabled={loading}
                    className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
                  >
                    {loading ? 'Guardando...' : 'Guardar'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Lista de planes */}
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Lista de Planes</h2>
            
            {loading && <div className="text-center py-4">Cargando...</div>}
            
            {!loading && planes.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No hay planes de tratamiento registrados
              </div>
            )}

            {!loading && planes.length > 0 && (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Descripción
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Costo Total
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Fecha Creación
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Acciones
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {planes.map((plan) => (
                      <tr key={plan.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {plan.descripcion}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                         S/ {Number(plan.costoTotal).toFixed(2)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {new Date(plan.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button
                            onClick={() => editarPlan(plan)}
                            className="text-blue-600 hover:text-blue-900 mr-3"
                          >
                            Editar
                          </button>
                          <button
                            onClick={() => eliminarPlan(plan.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            Eliminar
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}