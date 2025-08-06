// app/dashboard/procedimientos/page.tsx
'use client'
import { useState, useEffect } from 'react'

interface ProcedimientoDental {
  id: string
  codigo: string
  nombre: string
  descripcion?: string
  color: string
  simbolo?: string
  esCondicion: boolean
  createdAt: Date
  updatedAt: Date
}

export default function ProcedimientosPage() {
  // Estados principales
  const [procedimientos, setProcedimientos] = useState<ProcedimientoDental[]>([])
  const [condiciones, setCondiciones] = useState<ProcedimientoDental[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Estados para el formulario
  const [mostrarFormulario, setMostrarFormulario] = useState(false)
  const [editando, setEditando] = useState<ProcedimientoDental | null>(null)
  const [tipoSeleccionado, setTipoSeleccionado] = useState<'procedimiento' | 'condicion'>('procedimiento')
  
  const [formData, setFormData] = useState({
    codigo: '',
    nombre: '',
    descripcion: '',
    color: 'blue',
    simbolo: '',
    esCondicion: false
  })

  // Cargar datos al iniciar
  useEffect(() => {
    cargarDatos()
  }, [])

  // Función para cargar todos los procedimientos y condiciones
  const cargarDatos = async () => {
    setLoading(true)
    try {
      // Cargar procedimientos
      const resProcedimientos = await fetch('/api/procedimientos?tipo=procedimiento')
      const dataProcedimientos = await resProcedimientos.json()
      
      // Cargar condiciones
      const resCondiciones = await fetch('/api/procedimientos?tipo=condicion')
      const dataCondiciones = await resCondiciones.json()

      if (resProcedimientos.ok) {
        setProcedimientos(dataProcedimientos.procedimientos || [])
      }
      
      if (resCondiciones.ok) {
        setCondiciones(dataCondiciones.procedimientos || [])
      }

    } catch (error) {
      setError('Error al cargar datos')
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  // Manejar cambios en el formulario
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }))
  }

  // Función para guardar (crear o actualizar)
  const guardarProcedimiento = async () => {
    if (!formData.codigo || !formData.nombre) {
      setError('Código y nombre son requeridos')
      return
    }

    setLoading(true)
    setError('')

    try {
      const method = editando ? 'PUT' : 'POST'
      const body = editando 
        ? { ...formData, id: editando.id, esCondicion: tipoSeleccionado === 'condicion' }
        : { ...formData, esCondicion: tipoSeleccionado === 'condicion' }

      const response = await fetch('/api/procedimientos', {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body)
      })

      const data = await response.json()

      if (response.ok) {
        alert(data.message)
        limpiarFormulario()
        cargarDatos() // Recargar datos
      } else {
        setError(data.error || 'Error al guardar')
      }
    } catch (error) {
      setError('Error al guardar procedimiento')
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  // Función para eliminar
  const eliminarProcedimiento = async (id: string) => {
    const confirmar = window.confirm('¿Estás seguro de eliminar este elemento?')
    if (!confirmar) return

    setLoading(true)
    try {
      const response = await fetch(`/api/procedimientos?id=${id}`, {
        method: 'DELETE'
      })

      const data = await response.json()

      if (response.ok) {
        alert(data.message)
        cargarDatos() // Recargar datos
      } else {
        setError(data.error || 'Error al eliminar')
      }
    } catch (error) {
      setError('Error al eliminar')
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  // Función para editar
  const editarProcedimiento = (item: ProcedimientoDental) => {
    setEditando(item)
    setTipoSeleccionado(item.esCondicion ? 'condicion' : 'procedimiento')
    setFormData({
      codigo: item.codigo,
      nombre: item.nombre,
      descripcion: item.descripcion || '',
      color: item.color,
      simbolo: item.simbolo || '',
      esCondicion: item.esCondicion
    })
    setMostrarFormulario(true)
  }

  // Limpiar formulario
  const limpiarFormulario = () => {
    setFormData({
      codigo: '',
      nombre: '',
      descripcion: '',
      color: 'blue',
      simbolo: '',
      esCondicion: false
    })
    setEditando(null)
    setMostrarFormulario(false)
    setError('')
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-gray-900">Gestión de Procedimientos y Condiciones</h1>
          <p className="text-gray-600">Administra los procedimientos dentales y condiciones para el odontograma</p>
        </div>

        {/* Botón para agregar nuevo */}
        <div className="mb-6">
          <button
            onClick={() => setMostrarFormulario(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          >
            + Agregar Nuevo
          </button>
        </div>

        {/* Formulario modal */}
        {mostrarFormulario && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h2 className="text-lg font-semibold mb-4">
                {editando ? 'Editar' : 'Crear'} {tipoSeleccionado === 'procedimiento' ? 'Procedimiento' : 'Condición'}
              </h2>

              {/* Selector de tipo */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Tipo:</label>
                <select
                  value={tipoSeleccionado}
                  onChange={(e) => setTipoSeleccionado(e.target.value as 'procedimiento' | 'condicion')}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                >
                  <option value="procedimiento">Procedimiento</option>
                  <option value="condicion">Condición</option>
                </select>
              </div>

              {/* Campos del formulario */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Código:</label>
                  <input
                    type="text"
                    name="codigo"
                    value={formData.codigo}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                    placeholder="Ej: P001"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nombre:</label>
                  <input
                    type="text"
                    name="nombre"
                    value={formData.nombre}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                    placeholder="Nombre del procedimiento"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Descripción:</label>
                  <textarea
                    name="descripcion"
                    value={formData.descripcion}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                    placeholder="Descripción opcional"
                    rows={3}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Color:</label>
                  <select
                    name="color"
                    value={formData.color}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                  >
                    <option value="red">Rojo</option>
                    <option value="blue">Azul</option>
                    <option value="green">Verde</option>
                    <option value="yellow">Amarillo</option>
                    <option value="purple">Morado</option>
                    <option value="orange">Naranja</option>
                    <option value="gray">Gris</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Símbolo:</label>
                  <input
                    type="text"
                    name="simbolo"
                    value={formData.simbolo}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                    placeholder="Símbolo o código visual"
                  />
                </div>
              </div>

              {error && (
                <div className="mt-4 text-red-600 text-sm">{error}</div>
              )}

              {/* Botones del modal */}
              <div className="flex space-x-4 mt-6">
                <button
                  onClick={limpiarFormulario}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  onClick={guardarProcedimiento}
                  disabled={loading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  {loading ? 'Guardando...' : (editando ? 'Actualizar' : 'Crear')}
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Tabla de Procedimientos */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">Procedimientos ({procedimientos.length})</h2>
            
            <div className="overflow-x-auto">
              <table className="min-w-full table-auto">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Código</th>
                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Nombre</th>
                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Color</th>
                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {procedimientos.map((proc) => (
                    <tr key={proc.id} className="border-t">
                      <td className="px-4 py-2 text-sm">{proc.codigo}</td>
                      <td className="px-4 py-2 text-sm">{proc.nombre}</td>
                      <td className="px-4 py-2 text-sm">
                        <span 
                          className={`inline-block w-4 h-4 rounded-full bg-${proc.color}-500`}
                          title={proc.color}
                        ></span>
                      </td>
                      <td className="px-4 py-2 text-sm">
                        <button
                          onClick={() => editarProcedimiento(proc)}
                          className="text-blue-600 hover:text-blue-800 mr-2"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => eliminarProcedimiento(proc.id)}
                          className="text-red-600 hover:text-red-800"
                        >
                          Eliminar
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {/* AMENTADO */}
              {loading && <div className="text-center py-4">Cargando...</div>}
              {procedimientos.length === 0 && !loading && (
                <div className="text-center py-4 text-gray-500">
                  No hay procedimientos registrados
                </div>
              )}
            </div>
          </div>
          {/* Tabla de Condiciones */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">Condiciones ({condiciones.length})</h2>
            
            <div className="overflow-x-auto">
              <table className="min-w-full table-auto">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Código</th>
                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Nombre</th>
                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Color</th>
                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {condiciones.map((cond) => (
                    <tr key={cond.id} className="border-t">
                      <td className="px-4 py-2 text-sm">{cond.codigo}</td>
                      <td className="px-4 py-2 text-sm">{cond.nombre}</td>
                      <td className="px-4 py-2 text-sm">
                        <span 
                          className={`inline-block w-4 h-4 rounded-full bg-${cond.color}-500`}
                          title={cond.color}
                        ></span>
                      </td>
                      <td className="px-4 py-2 text-sm">
                        <button
                          onClick={() => editarProcedimiento(cond)}
                          className="text-blue-600 hover:text-blue-800 mr-2"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => eliminarProcedimiento(cond.id)}
                          className="text-red-600 hover:text-red-800"
                        >
                          Eliminar
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
               {loading && <div className="text-center py-4">Cargando...</div>}
              {condiciones.length === 0 && !loading && (
                <div className="text-center py-4 text-gray-500">
                  No hay condiciones registradas
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}