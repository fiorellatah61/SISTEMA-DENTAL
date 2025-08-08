// app/dashboard/planes-tratamiento/page.tsx
'use client'
import { useState, useEffect } from 'react'
import { Plus, Edit2, Trash2, FileText, DollarSign, Calendar } from 'lucide-react'

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
    <div className="space-y-6">
      {/* Header elegante y responsivo */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-200">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-gradient-to-br from-emerald-500/20 to-teal-500/20 rounded-lg">
            <FileText className="h-6 w-6 text-emerald-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Planes de Tratamiento</h1>
            <p className="text-sm text-slate-600">Gestiona los planes médicos y sus costos</p>
          </div>
        </div>
        <button
          onClick={() => setMostrarFormulario(true)}
          className="inline-flex items-center space-x-2 bg-gradient-to-r from-slate-800 to-slate-700 text-white px-4 py-2.5 rounded-xl hover:from-slate-700 hover:to-slate-600 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-[1.02] font-medium"
        >
          <Plus className="h-4 w-4" />
          <span>Nuevo Plan</span>
        </button>
      </div>

      {/* Alert de error mejorado */}
      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-lg shadow-sm">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-red-700 font-medium">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Modal del formulario mejorado */}
      {mostrarFormulario && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full border border-slate-200/60 transform transition-all duration-300">
            {/* Header del modal */}
            <div className="px-6 py-4 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-slate-50/50 rounded-t-2xl">
              <h3 className="text-xl font-bold text-slate-900 flex items-center space-x-2">
                <div className="p-1.5 bg-emerald-100 rounded-lg">
                  <FileText className="h-4 w-4 text-emerald-600" />
                </div>
                <span>{planEditando ? 'Editar Plan' : 'Nuevo Plan de Tratamiento'}</span>
              </h3>
            </div>
            
            {/* Body del modal */}
            <div className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center space-x-2">
                  <FileText className="h-4 w-4 text-slate-500" />
                  <span>Descripción del Tratamiento</span>
                </label>
                <textarea
                  name="descripcion"
                  value={formData.descripcion}
                  onChange={handleInputChange}
                  className="w-full border border-slate-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors duration-200 resize-none"
                  rows={4}
                  placeholder="Describe detalladamente el plan de tratamiento..."
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center space-x-2">
                  <DollarSign className="h-4 w-4 text-slate-500" />
                  <span>Costo Total (S/)</span>
                </label>
                <input
                  type="number"
                  name="costoTotal"
                  value={formData.costoTotal}
                  onChange={handleInputChange}
                  className="w-full border border-slate-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors duration-200"
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                />
              </div>
            </div>

            {/* Footer del modal */}
            <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/50 rounded-b-2xl">
              <div className="flex space-x-3">
                <button
                  onClick={cancelarFormulario}
                  className="flex-1 border border-slate-300 text-slate-700 px-4 py-2.5 rounded-xl hover:bg-slate-50 transition-colors duration-200 font-medium"
                >
                  Cancelar
                </button>
                <button
                  onClick={guardarPlan}
                  disabled={loading}
                  className="flex-1 bg-gradient-to-r from-slate-800 to-slate-700 text-white px-4 py-2.5 rounded-xl hover:from-slate-700 hover:to-slate-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium shadow-lg"
                >
                  {loading ? 'Guardando...' : 'Guardar Plan'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Lista de planes responsiva */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 overflow-hidden">
        {/* Header de la tabla */}
        <div className="px-6 py-4 border-b border-slate-100 bg-gradient-to-r from-slate-50/50 to-slate-50/30">
          <h2 className="text-lg font-bold text-slate-900 flex items-center space-x-2">
            <div className="p-1.5 bg-slate-100 rounded-lg">
              <FileText className="h-4 w-4 text-slate-600" />
            </div>
            <span>Lista de Planes</span>
            <span className="text-sm font-normal text-slate-500">({planes.length})</span>
          </h2>
        </div>
        
        <div className="p-6">
          {loading && (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-800 mx-auto"></div>
              <p className="text-slate-600 mt-3 font-medium">Cargando planes...</p>
            </div>
          )}
          
          {!loading && planes.length === 0 && (
            <div className="text-center py-12">
              <div className="p-4 bg-slate-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <FileText className="h-8 w-8 text-slate-400" />
              </div>
              <p className="text-slate-600 font-medium">No hay planes de tratamiento registrados</p>
              <p className="text-slate-500 text-sm mt-1">Comienza creando tu primer plan médico</p>
            </div>
          )}

          {!loading && planes.length > 0 && (
            <>
              {/* Vista de escritorio */}
              <div className="hidden lg:block overflow-x-auto">
                <table className="min-w-full">
                  <thead>
                    <tr className="border-b border-slate-200">
                      <th className="px-4 py-3 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">
                        Descripción
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">
                        Costo Total
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">
                        Fecha Creación
                      </th>
                      <th className="px-4 py-3 text-center text-xs font-bold text-slate-600 uppercase tracking-wider">
                        Acciones
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {planes.map((plan) => (
                      <tr key={plan.id} className="hover:bg-slate-50/50 transition-colors duration-200">
                        <td className="px-4 py-4">
                          <div className="text-sm font-medium text-slate-900 line-clamp-2">
                            {plan.descripcion}
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex items-center space-x-1">
                            <DollarSign className="h-4 w-4 text-emerald-600" />
                            <span className="text-sm font-bold text-slate-900">
                              {Number(plan.costoTotal).toFixed(2)}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex items-center space-x-1 text-sm text-slate-600">
                            <Calendar className="h-4 w-4" />
                            <span>{new Date(plan.createdAt).toLocaleDateString('es-ES')}</span>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex items-center justify-center space-x-2">
                            <button
                              onClick={() => editarPlan(plan)}
                              className="p-2 text-slate-600 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors duration-200"
                              title="Editar plan"
                            >
                              <Edit2 className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => eliminarPlan(plan.id)}
                              className="p-2 text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
                              title="Eliminar plan"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Vista móvil y tablet */}
              <div className="lg:hidden space-y-4">
                {planes.map((plan) => (
                  <div key={plan.id} className="bg-slate-50/50 rounded-xl p-4 border border-slate-100 hover:shadow-md transition-all duration-200">
                    <div className="space-y-3">
                      {/* Descripción */}
                      <div>
                        <div className="flex items-center space-x-2 mb-1">
                          <FileText className="h-4 w-4 text-slate-500" />
                          <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">Descripción</span>
                        </div>
                        <p className="text-sm font-medium text-slate-900 pl-6">{plan.descripcion}</p>
                      </div>
                      
                      {/* Costo y fecha en fila */}
                      <div className="flex items-center justify-between pl-6">
                        <div className="flex items-center space-x-1">
                          <DollarSign className="h-4 w-4 text-emerald-600" />
                          <span className="text-sm font-bold text-slate-900">S/ {Number(plan.costoTotal).toFixed(2)}</span>
                        </div>
                        <div className="flex items-center space-x-1 text-xs text-slate-500">
                          <Calendar className="h-3 w-3" />
                          <span>{new Date(plan.createdAt).toLocaleDateString('es-ES')}</span>
                        </div>
                      </div>
                      
                      {/* Acciones */}
                      <div className="flex items-center space-x-2 pt-2 border-t border-slate-200">
                        <button
                          onClick={() => editarPlan(plan)}
                          className="flex-1 flex items-center justify-center space-x-2 text-emerald-600 hover:bg-emerald-50 py-2 px-3 rounded-lg transition-colors duration-200 text-sm font-medium"
                        >
                          <Edit2 className="h-4 w-4" />
                          <span>Editar</span>
                        </button>
                        <button
                          onClick={() => eliminarPlan(plan.id)}
                          className="flex-1 flex items-center justify-center space-x-2 text-red-600 hover:bg-red-50 py-2 px-3 rounded-lg transition-colors duration-200 text-sm font-medium"
                        >
                          <Trash2 className="h-4 w-4" />
                          <span>Eliminar</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}