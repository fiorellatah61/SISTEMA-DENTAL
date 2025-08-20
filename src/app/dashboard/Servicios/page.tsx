'use client'

import { useState, useEffect } from 'react'

// Tipos de datos actualizados para coincidir con la base de datos
interface Servicio {
  id: string
  nombre: string
  costo: number
  fechaVencimiento: string | null
  estado: string
  fechaPago: string | null
  metodoPago: string | null
  descripcion: string | null
  referencia: string | null // Para el número de comprobante
  createdAt: string
  updatedAt: string
}

interface Pago {
  id: string
  servicio_nombre: string
  monto: number
  fecha_pago: string
  metodo_pago: string
  comprobante: string | null
}

interface SemaforoInfo {
  clase: string
  texto: string
  textoClase: string
}

export default function GestorServicios() {
  // Estados principales para manejar los datos
  const [servicios, setServicios] = useState<Servicio[]>([])
  const [pagos, setPagos] = useState<Pago[]>([])
  const [tabActiva, setTabActiva] = useState('servicios') // Controla qué pestaña está activa
  const [editandoId, setEditandoId] = useState<string | null>(null) // ID del servicio que se está editando
  const [cargando, setCargando] = useState(false) // Estado de carga para mostrar spinner
  const [mensaje, setMensaje] = useState<{texto: string, tipo: 'success' | 'error'} | null>(null)

  // Estados para los formularios
  const [formularioServicio, setFormularioServicio] = useState({
    nombre: '',
    costo: '',
    fecha_vencimiento: '',
    estado: 'pendiente', // Estado por defecto
    descripcion: ''
  })

  const [formularioPago, setFormularioPago] = useState({
    servicio_id: '',
    monto: '',
    fecha_pago: new Date().toISOString().split('T')[0], // Fecha actual por defecto
    metodo_pago: '',
    comprobante: ''
  })

  // Estados para filtros en el historial
  const [filtros, setFiltros] = useState({
    servicio: '',
    fecha_inicio: '',
    fecha_fin: '',
    metodo_pago: ''
  })

  // Cargar datos al montar el componente
  useEffect(() => {
    cargarServicios()
    cargarPagos()
  }, [])

  // Actualizar estado de servicios vencidos automáticamente
  useEffect(() => {
    const actualizarEstadosVencidos = () => {
      setServicios(serviciosActuales => 
        serviciosActuales.map(servicio => {
          if (servicio.estado === 'pendiente' && servicio.fechaVencimiento) {
            const hoy = new Date()
            const fechaVenc = new Date(servicio.fechaVencimiento)
            if (fechaVenc < hoy) {
              return { ...servicio, estado: 'vencido' }
            }
          }
          return servicio
        })
      )
    }

    // Ejecutar al cargar y luego cada hora
    actualizarEstadosVencidos()
    const intervalo = setInterval(actualizarEstadosVencidos, 60000 * 60) // Cada hora

    return () => clearInterval(intervalo)
  }, [])

  // Función para cargar servicios desde la API
  const cargarServicios = async () => {
    try {
      setCargando(true)
      const response = await fetch('/api/servicios')
      if (response.ok) {
        const data = await response.json()
        setServicios(data)
      } else {
        throw new Error('Error al cargar servicios')
      }
    } catch (error) {
      console.error('Error al cargar servicios:', error)
      mostrarMensaje('Error al cargar servicios. Verifica tu conexión.', 'error')
    } finally {
      setCargando(false)
    }
  }

  // Función para cargar historial de pagos desde la API
  const cargarPagos = async () => {
    try {
      const response = await fetch('/api/servicios/pagos')
      if (response.ok) {
        const data = await response.json()
        setPagos(data)
      } else {
        throw new Error('Error al cargar pagos')
      }
    } catch (error) {
      console.error('Error al cargar pagos:', error)
      mostrarMensaje('Error al cargar historial de pagos', 'error')
    }
  }

  // Función para mostrar mensajes de éxito o error
  const mostrarMensaje = (texto: string, tipo: 'success' | 'error') => {
    setMensaje({ texto, tipo })
    setTimeout(() => setMensaje(null), 5000) // Ocultar mensaje después de 5 segundos
  }

  // Manejar envío del formulario de servicios
  const manejarEnvioServicio = async (e: React.FormEvent) => {
    e.preventDefault()
    setCargando(true)

    try {
      const url = editandoId ? `/api/servicios/${editandoId}` : '/api/servicios'
      const method = editandoId ? 'PUT' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formularioServicio,
          costo: parseFloat(formularioServicio.costo)
        })
      })

      if (response.ok) {
        mostrarMensaje(
          editandoId ? 'Servicio actualizado correctamente' : 'Servicio creado correctamente',
          'success'
        )
        limpiarFormularioServicio()
        await cargarServicios() // Recargar servicios
        await cargarPagos() // Recargar pagos en caso de que el estado haya cambiado
      } else {
        const errorData = await response.json()
        mostrarMensaje(errorData.error || 'Error al guardar el servicio', 'error')
      }
    } catch (error) {
      console.error('Error:', error)
      mostrarMensaje('Error de conexión al guardar el servicio', 'error')
    } finally {
      setCargando(false)
    }
  }

  // Manejar envío del formulario de pagos
  const manejarEnvioPago = async (e: React.FormEvent) => {
    e.preventDefault()
    setCargando(true)

    try {
      const response = await fetch('/api/servicios/pagos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formularioPago,
          monto: parseFloat(formularioPago.monto)
        })
      })

      if (response.ok) {
        mostrarMensaje('Pago registrado correctamente', 'success')
        limpiarFormularioPago()
        await cargarServicios() // Recargar servicios para actualizar estados
        await cargarPagos() // Recargar historial de pagos
      } else {
        const errorData = await response.json()
        mostrarMensaje(errorData.error || 'Error al registrar el pago', 'error')
      }
    } catch (error) {
      console.error('Error:', error)
      mostrarMensaje('Error de conexión al registrar el pago', 'error')
    } finally {
      setCargando(false)
    }
  }

  // Función para editar un servicio (llenar formulario con datos existentes)
  const editarServicio = (servicio: Servicio) => {
    setFormularioServicio({
      nombre: servicio.nombre,
      costo: servicio.costo.toString(),
      fecha_vencimiento: servicio.fechaVencimiento ? 
        new Date(servicio.fechaVencimiento).toISOString().split('T')[0] : '',
      estado: servicio.estado,
      descripcion: servicio.descripcion || ''
    })
    setEditandoId(servicio.id)
    setTabActiva('servicios') // Cambiar a la pestaña de servicios
  }

  // Función para eliminar un servicio
  const eliminarServicio = async (id: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este servicio? Esta acción no se puede deshacer.')) return

    try {
      setCargando(true)
      const response = await fetch(`/api/servicios/${id}`, { method: 'DELETE' })
      
      if (response.ok) {
        mostrarMensaje('Servicio eliminado correctamente', 'success')
        await cargarServicios()
        await cargarPagos()
      } else {
        const errorData = await response.json()
        mostrarMensaje(errorData.error || 'Error al eliminar el servicio', 'error')
      }
    } catch (error) {
      console.error('Error:', error)
      mostrarMensaje('Error de conexión al eliminar el servicio', 'error')
    } finally {
      setCargando(false)
    }
  }

  // Función para marcar un servicio como pagado (navegar a formulario de pago)
  const marcarComoPagado = (servicio: Servicio) => {
    setTabActiva('pagos')
    setFormularioPago(prev => ({
      ...prev,
      servicio_id: servicio.id,
      monto: servicio.costo.toString()
    }))
  }

  // Limpiar formulario de servicios
  const limpiarFormularioServicio = () => {
    setFormularioServicio({
      nombre: '',
      costo: '',
      fecha_vencimiento: '',
      estado: 'pendiente',
      descripcion: ''
    })
    setEditandoId(null)
  }

  // Limpiar formulario de pagos
  const limpiarFormularioPago = () => {
    setFormularioPago({
      servicio_id: '',
      monto: '',
      fecha_pago: new Date().toISOString().split('T')[0],
      metodo_pago: '',
      comprobante: ''
    })
  }

  // Calcular información del semáforo para cada servicio
  const calcularSemaforo = (servicio: Servicio): SemaforoInfo => {
    if (servicio.estado === 'pagado') {
      return {
        clase: 'bg-green-500',
        texto: 'PAGADO',
        textoClase: 'text-green-600'
      }
    }

    if (!servicio.fechaVencimiento) {
      return {
        clase: 'bg-green-400',
        texto: 'Sin fecha límite',
        textoClase: 'text-green-600'
      }
    }

    const hoy = new Date()
    hoy.setHours(0, 0, 0, 0) // Normalizar a medianoche
    const fechaVenc = new Date(servicio.fechaVencimiento)
    fechaVenc.setHours(0, 0, 0, 0) // Normalizar a medianoche
    
    const diferenciaDias = Math.ceil((fechaVenc.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24))

    if (diferenciaDias < 0) {
      return {
        clase: 'bg-red-500',
        texto: `Vencido hace ${Math.abs(diferenciaDias)} días`,
        textoClase: 'text-red-600'
      }
    } else if (diferenciaDias <= 7) {
      return {
        clase: 'bg-red-500',
        texto: diferenciaDias === 0 ? 'Vence hoy' : 
               diferenciaDias === 1 ? 'Vence mañana' : 
               `Vence en ${diferenciaDias} días`,
        textoClase: 'text-red-600'
      }
    } else if (diferenciaDias <= 30) {
      return {
        clase: 'bg-yellow-500',
        texto: `Vence en ${diferenciaDias} días`,
        textoClase: 'text-yellow-600'
      }
    } else {
      return {
        clase: 'bg-green-400',
        texto: `Vence en ${Math.floor(diferenciaDias / 30)} meses`,
        textoClase: 'text-green-600'
      }
    }
  }

  // Filtrar pagos basado en los filtros seleccionados
  const pagosFiltrados = pagos.filter(pago => {
    if (filtros.servicio && !pago.servicio_nombre.toLowerCase().includes(filtros.servicio.toLowerCase())) return false
    if (filtros.fecha_inicio && pago.fecha_pago < filtros.fecha_inicio) return false
    if (filtros.fecha_fin && pago.fecha_pago > filtros.fecha_fin) return false
    if (filtros.metodo_pago && pago.metodo_pago !== filtros.metodo_pago) return false
    return true
  })

  // Calcular estadísticas para reportes
  const calcularEstadisticas = () => {
    const hoy = new Date()
    const mesActual = hoy.getMonth()
    const añoActual = hoy.getFullYear()
    
    // Pagos del mes actual
    const pagosEsteMes = pagos.filter(pago => {
      const fechaPago = new Date(pago.fecha_pago)
      return fechaPago.getMonth() === mesActual && fechaPago.getFullYear() === añoActual
    })
    
    const totalGastado = pagosEsteMes.reduce((total, pago) => total + pago.monto, 0)
    const pendientes = servicios.filter(s => s.estado === 'pendiente').length
    const vencidos = servicios.filter(s => s.estado === 'vencido').length
    
    // Promedio mensual (últimos 12 meses)
    const hace12Meses = new Date()
    hace12Meses.setMonth(hace12Meses.getMonth() - 12)
    
    const pagosUltimos12Meses = pagos.filter(p => new Date(p.fecha_pago) >= hace12Meses)
    const promedioMensual = pagosUltimos12Meses.length > 0 ? 
      pagosUltimos12Meses.reduce((total, pago) => total + pago.monto, 0) / 12 : 0

    return { totalGastado, pendientes, vencidos, promedioMensual }
  }

  const estadisticas = calcularEstadisticas()

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      {/* Mensaje de notificación flotante */}
      {mensaje && (
        <div className={`fixed top-4 right-4 p-4 rounded-lg shadow-lg z-50 transition-all duration-300 ${
          mensaje.tipo === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
        }`}>
          <div className="flex items-center gap-2">
            <span>{mensaje.tipo === 'success' ? '✅' : '❌'}</span>
            <span>{mensaje.texto}</span>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto">
        {/* Header mejorado */}
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">💰 Gestor de Servicios</h1>
          <p className="text-gray-600">Administra y controla todos tus pagos de servicios de manera inteligente</p>
          {cargando && (
            <div className="mt-2">
              <div className="inline-flex items-center px-4 py-2 font-semibold leading-6 text-sm shadow rounded-md text-blue-500 bg-blue-100">
                <div className="animate-spin -ml-1 mr-3 h-5 w-5 text-blue-500">
                  <div className="h-5 w-5 border-t-2 border-r-2 border-blue-500 rounded-full animate-spin"></div>
                </div>
                Cargando...
              </div>
            </div>
          )}
        </header>

        {/* Navegación por pestañas mejorada */}
        <div className="bg-white rounded-t-lg shadow-sm">
          <nav className="flex">
            {[
              { id: 'servicios', label: '📋 Gestión de Servicios', count: servicios.length },
              { id: 'pagos', label: '💳 Registro de Pagos', count: servicios.filter(s => s.estado !== 'pagado').length },
              { id: 'historial', label: '📊 Historial', count: pagos.length },
              { id: 'reportes', label: '📈 Reportes', count: null }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setTabActiva(tab.id)}
                className={`flex-1 px-6 py-4 text-sm font-medium border-b-2 transition-all duration-200 ${
                  tabActiva === tab.id
                    ? 'border-blue-500 text-blue-600 bg-blue-50'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center justify-center gap-2">
                  <span>{tab.label}</span>
                  {tab.count !== null && (
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      tabActiva === tab.id ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'
                    }`}>
                      {tab.count}
                    </span>
                  )}
                </div>
              </button>
            ))}
          </nav>
        </div>

        <div className="bg-white rounded-b-lg shadow-sm p-6">
          {/* PESTAÑA: GESTIÓN DE SERVICIOS */}
          {tabActiva === 'servicios' && (
            <div className="space-y-6">
              {/* Formulario para agregar/editar servicios */}
              <div className="bg-blue-50 border-l-4 border-blue-500 p-6 rounded-lg">
                <h2 className="text-xl font-semibold text-blue-700 mb-4">
                  {editandoId ? '✏️ Editar Servicio' : '➕ Agregar Nuevo Servicio'}
                </h2>
                
                <form onSubmit={manejarEnvioServicio} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nombre del Servicio *
                      </label>
                      <input
                        type="text"
                        required
                        value={formularioServicio.nombre}
                        onChange={(e) => setFormularioServicio(prev => ({
                          ...prev, nombre: e.target.value
                        }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Ej: Agua, Luz, Internet..."
                        disabled={cargando}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Costo (S/) *
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        required
                        value={formularioServicio.costo}
                        onChange={(e) => setFormularioServicio(prev => ({
                          ...prev, costo: e.target.value
                        }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                        placeholder="0.00"
                        disabled={cargando}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Fecha de Vencimiento
                      </label>
                      <input
                        type="date"
                        value={formularioServicio.fecha_vencimiento}
                        onChange={(e) => setFormularioServicio(prev => ({
                          ...prev, fecha_vencimiento: e.target.value
                        }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                        disabled={cargando}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Estado *
                      </label>
                      <select
                        required
                        value={formularioServicio.estado}
                        onChange={(e) => setFormularioServicio(prev => ({
                          ...prev, estado: e.target.value
                        }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                        disabled={cargando}
                      >
                        <option value="pendiente">Pendiente</option>
                        <option value="pagado">Pagado</option>
                        <option value="vencido">Vencido</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Descripción (Opcional)
                    </label>
                    <textarea
                      value={formularioServicio.descripcion}
                      onChange={(e) => setFormularioServicio(prev => ({
                        ...prev, descripcion: e.target.value
                      }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      rows={3}
                      placeholder="Detalles adicionales del servicio..."
                      disabled={cargando}
                    />
                  </div>

                  <div className="flex gap-2">
                    <button
                      type="submit"
                      disabled={cargando}
                      className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {cargando ? (
                        <div className="flex items-center gap-2">
                          <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                          Guardando...
                        </div>
                      ) : (
                        editandoId ? 'Actualizar Servicio' : 'Guardar Servicio'
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={limpiarFormularioServicio}
                      disabled={cargando}
                      className="px-6 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 disabled:opacity-50 transition-colors"
                    >
                      Limpiar
                    </button>
                  </div>
                </form>
              </div>

              {/* Resumen rápido de servicios */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-yellow-50 p-4 rounded-lg border-l-4 border-yellow-400">
                  <div className="text-2xl font-bold text-yellow-700">
                    {servicios.filter(s => s.estado === 'pendiente').length}
                  </div>
                  <div className="text-yellow-600">Servicios Pendientes</div>
                </div>
                <div className="bg-red-50 p-4 rounded-lg border-l-4 border-red-400">
                  <div className="text-2xl font-bold text-red-700">
                    {servicios.filter(s => s.estado === 'vencido').length}
                  </div>
                  <div className="text-red-600">Servicios Vencidos</div>
                </div>
                <div className="bg-green-50 p-4 rounded-lg border-l-4 border-green-400">
                  <div className="text-2xl font-bold text-green-700">
                    {servicios.filter(s => s.estado === 'pagado').length}
                  </div>
                  <div className="text-green-600">Servicios Pagados</div>
                </div>
              </div>

              {/* Tabla de servicios mejorada */}
              <div className="bg-white border rounded-lg overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Servicio
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Costo
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Vencimiento
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Estado
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Semáforo
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Acciones
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {servicios.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                            <div className="flex flex-col items-center">
                              <div className="text-6xl mb-4">📋</div>
                              <h3 className="text-lg font-medium mb-2">No hay servicios registrados</h3>
                              <p className="text-sm">Agrega tu primer servicio usando el formulario de arriba</p>
                            </div>
                          </td>
                        </tr>
                      ) : (
                        servicios.map((servicio) => {
                          const semaforoInfo = calcularSemaforo(servicio)
                          return (
                            <tr key={servicio.id} className="hover:bg-gray-50 transition-colors">
                              <td className="px-6 py-4">
                                <div>
                                  <div className="font-medium text-gray-900">{servicio.nombre}</div>
                                  {servicio.descripcion && (
                                    <div className="text-sm text-gray-500 truncate max-w-xs">
                                      {servicio.descripcion}
                                    </div>
                                  )}
                                </div>
                              </td>
                              <td className="px-6 py-4 text-gray-900 font-medium">
                                S/ {servicio.costo.toFixed(2)}
                              </td>
                              <td className="px-6 py-4 text-gray-900">
                                {servicio.fechaVencimiento ? 
                                  new Date(servicio.fechaVencimiento).toLocaleDateString('es-PE', {
                                    year: 'numeric',
                                    month: 'short',
                                    day: 'numeric'
                                  }) : 
                                  <span className="text-gray-400">Sin fecha</span>
                                }
                              </td>
                              <td className="px-6 py-4">
                                <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                                  servicio.estado === 'pagado' ? 'bg-green-100 text-green-800' :
                                  servicio.estado === 'vencido' ? 'bg-red-100 text-red-800' :
                                  'bg-yellow-100 text-yellow-800'
                                }`}>
                                  {servicio.estado.toUpperCase()}
                                </span>
                              </td>
                              <td className="px-6 py-4">
                                <div className="flex items-center gap-2">
                                  <div className={`w-4 h-4 rounded-full ${semaforoInfo.clase}`}></div>
                                  <span className={`text-sm font-medium ${semaforoInfo.textoClase}`}>
                                    {semaforoInfo.texto}
                                  </span>
                                </div>
                              </td>
                              <td className="px-6 py-4">
                                <div className="flex gap-1 flex-wrap">
                                  <button
                                    onClick={() => editarServicio(servicio)}
                                    disabled={cargando}
                                    className="px-3 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 transition-colors"
                                  >
                                    ✏️ Editar
                                  </button>
                                  <button
                                    onClick={() => eliminarServicio(servicio.id)}
                                    disabled={cargando}
                                    className="px-3 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50 transition-colors"
                                  >
                                    🗑️ Eliminar
                                  </button>
                                  {servicio.estado !== 'pagado' && (
                                    <button
                                      onClick={() => marcarComoPagado(servicio)}
                                      disabled={cargando}
                                      className="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 transition-colors"
                                    >
                                      💳 Pagar
                                    </button>
                                  )}
                                </div>
                              </td>
                            </tr>
                          )
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* PESTAÑA: REGISTRO DE PAGOS */}
          {tabActiva === 'pagos' && (
            <div className="space-y-6">
              <div className="bg-green-50 border-l-4 border-green-500 p-6 rounded-lg">
                <h2 className="text-xl font-semibold text-green-700 mb-4">💳 Registrar Pago</h2>
                
                <form onSubmit={manejarEnvioPago} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Servicio *
                      </label>
                      <select
                        required
                        value={formularioPago.servicio_id}
                        onChange={(e) => {
                          const servicioSeleccionado = servicios.find(s => s.id === e.target.value)
                          setFormularioPago(prev => ({
                            ...prev, 
                            servicio_id: e.target.value,
                            monto: servicioSeleccionado ? servicioSeleccionado.costo.toString() : prev.monto
                          }))
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                        disabled={cargando}
                      >
                        <option value="">Seleccionar servicio...</option>
                        {servicios.filter(s => s.estado !== 'pagado').map(servicio => (
                          <option key={servicio.id} value={servicio.id}>
                            {servicio.nombre} - S/ {servicio.costo.toFixed(2)}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Monto Pagado (S/) *
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        required
                        value={formularioPago.monto}
                        onChange={(e) => setFormularioPago(prev => ({
                          ...prev, monto: e.target.value
                        }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                        placeholder="0.00"
                        disabled={cargando}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Fecha de Pago *
                      </label>
                      <input
                        type="date"
                        required
                        max={new Date().toISOString().split('T')[0]} // No permitir fechas futuras
                        value={formularioPago.fecha_pago}
                        onChange={(e) => setFormularioPago(prev => ({
                          ...prev, fecha_pago: e.target.value
                        }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                        disabled={cargando}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Método de Pago *
                      </label>
                      <select
                        required
                        value={formularioPago.metodo_pago}
                        onChange={(e) => setFormularioPago(prev => ({
                          ...prev, metodo_pago: e.target.value
                        }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                        disabled={cargando}
                      >
                        <option value="">Seleccionar método...</option>
                        <option value="efectivo">💵 Efectivo</option>
                        <option value="tarjeta">💳 Tarjeta</option>
                        <option value="transferencia">🏦 Transferencia</option>
                        <option value="yape">📱 Yape</option>
                        <option value="plin">📲 Plin</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Número de Comprobante (Opcional)
                    </label>
                    <input
                      type="text"
                      value={formularioPago.comprobante}
                      onChange={(e) => setFormularioPago(prev => ({
                        ...prev, comprobante: e.target.value
                      }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                      placeholder="Número de recibo, voucher, etc."
                      disabled={cargando}
                    />
                  </div>

                  <div className="flex gap-2">
                    <button
                      type="submit"
                      disabled={cargando || !formularioPago.servicio_id}
                      className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:ring-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {cargando ? (
                        <div className="flex items-center gap-2">
                          <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                          Registrando...
                        </div>
                      ) : (
                        '💾 Registrar Pago'
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={limpiarFormularioPago}
                      disabled={cargando}
                      className="px-6 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 disabled:opacity-50 transition-colors"
                    >
                      🧹 Limpiar
                    </button>
                  </div>
                </form>
              </div>

              {/* Lista de servicios pendientes */}
              {servicios.filter(s => s.estado !== 'pagado').length > 0 && (
                <div className="bg-yellow-50 p-4 rounded-lg border-l-4 border-yellow-400">
                  <h3 className="text-lg font-medium text-yellow-800 mb-3">⏰ Servicios Pendientes de Pago</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {servicios.filter(s => s.estado !== 'pagado').map(servicio => {
                      const semaforoInfo = calcularSemaforo(servicio)
                      return (
                        <div key={servicio.id} className="bg-white p-3 rounded border">
                          <div className="flex justify-between items-start mb-2">
                            <div className="font-medium text-gray-900">{servicio.nombre}</div>
                            <div className={`w-3 h-3 rounded-full ${semaforoInfo.clase}`}></div>
                          </div>
                          <div className="text-sm text-gray-600 mb-2">S/ {servicio.costo.toFixed(2)}</div>
                          <div className="text-xs text-gray-500">
                            {servicio.fechaVencimiento ? 
                              `Vence: ${new Date(servicio.fechaVencimiento).toLocaleDateString('es-PE')}` : 
                              'Sin fecha límite'
                            }
                          </div>
                          <button
                            onClick={() => marcarComoPagado(servicio)}
                            className="mt-2 w-full px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                          >
                            Pagar Ahora
                          </button>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* PESTAÑA: HISTORIAL */}
          {tabActiva === 'historial' && (
            <div className="space-y-6">
              {/* Filtros mejorados */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-lg font-medium text-gray-800 mb-4">🔍 Filtros de Búsqueda</h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Buscar Servicio
                    </label>
                    <input
                      type="text"
                      value={filtros.servicio}
                      onChange={(e) => setFiltros(prev => ({ ...prev, servicio: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Nombre del servicio..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Desde
                    </label>
                    <input
                      type="date"
                      value={filtros.fecha_inicio}
                      onChange={(e) => setFiltros(prev => ({ ...prev, fecha_inicio: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Hasta
                    </label>
                    <input
                      type="date"
                      value={filtros.fecha_fin}
                      max={new Date().toISOString().split('T')[0]}
                      onChange={(e) => setFiltros(prev => ({ ...prev, fecha_fin: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Método de Pago
                    </label>
                    <select
                      value={filtros.metodo_pago}
                      onChange={(e) => setFiltros(prev => ({ ...prev, metodo_pago: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Todos los métodos</option>
                      <option value="efectivo">Efectivo</option>
                      <option value="tarjeta">Tarjeta</option>
                      <option value="transferencia">Transferencia</option>
                      <option value="yape">Yape</option>
                      <option value="plin">Plin</option>
                    </select>
                  </div>
                </div>
                
                {/* Botón para limpiar filtros */}
                <div className="mt-4">
                  <button
                    onClick={() => setFiltros({ servicio: '', fecha_inicio: '', fecha_fin: '', metodo_pago: '' })}
                    className="px-4 py-2 text-sm bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
                  >
                    🧹 Limpiar Filtros
                  </button>
                </div>
              </div>

              {/* Resumen del historial */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-blue-700">
                    {pagosFiltrados.length}
                  </div>
                  <div className="text-blue-600">Pagos Registrados</div>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-green-700">
                    S/ {pagosFiltrados.reduce((total, pago) => total + pago.monto, 0).toFixed(2)}
                  </div>
                  <div className="text-green-600">Total Gastado</div>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-purple-700">
                    S/ {pagosFiltrados.length > 0 ? (pagosFiltrados.reduce((total, pago) => total + pago.monto, 0) / pagosFiltrados.length).toFixed(2) : '0.00'}
                  </div>
                  <div className="text-purple-600">Promedio por Pago</div>
                </div>
              </div>

              {/* Tabla de historial mejorada */}
              <div className="bg-white border rounded-lg overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Servicio
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Monto
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Fecha Pago
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Método
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Comprobante
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Estado
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {pagosFiltrados.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                            <div className="flex flex-col items-center">
                              <div className="text-6xl mb-4">📊</div>
                              <h3 className="text-lg font-medium mb-2">
                                {pagos.length === 0 ? 'No hay pagos registrados' : 'No se encontraron pagos con los filtros aplicados'}
                              </h3>
                              <p className="text-sm">
                                {pagos.length === 0 ? 
                                  'Los pagos aparecerán aquí una vez que los registres' : 
                                  'Intenta ajustar los filtros de búsqueda'
                                }
                              </p>
                            </div>
                          </td>
                        </tr>
                      ) : (
                        pagosFiltrados
                          .sort((a, b) => new Date(b.fecha_pago).getTime() - new Date(a.fecha_pago).getTime())
                          .map((pago, index) => (
                            <tr key={pago.id} className={`hover:bg-gray-50 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-gray-25'}`}>
                              <td className="px-6 py-4">
                                <div className="font-medium text-gray-900">{pago.servicio_nombre}</div>
                              </td>
                              <td className="px-6 py-4 text-gray-900 font-medium">
                                S/ {pago.monto.toFixed(2)}
                              </td>
                              <td className="px-6 py-4 text-gray-900">
                                {new Date(pago.fecha_pago).toLocaleDateString('es-PE', {
                                  year: 'numeric',
                                  month: 'short',
                                  day: 'numeric'
                                })}
                              </td>
                              <td className="px-6 py-4 text-gray-900">
                                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                  {pago.metodo_pago === 'efectivo' && '💵'}
                                  {pago.metodo_pago === 'tarjeta' && '💳'}
                                  {pago.metodo_pago === 'transferencia' && '🏦'}
                                  {pago.metodo_pago === 'yape' && '📱'}
                                  {pago.metodo_pago === 'plin' && '📲'}
                                  <span className="capitalize">{pago.metodo_pago}</span>
                                </span>
                              </td>
                              <td className="px-6 py-4 text-gray-900">
                                {pago.comprobante ? (
                                  <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">
                                    {pago.comprobante}
                                  </span>
                                ) : (
                                  <span className="text-gray-400">Sin comprobante</span>
                                )}
                              </td>
                              <td className="px-6 py-4">
                                <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                                  ✅ PAGADO
                                </span>
                              </td>
                            </tr>
                          ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* PESTAÑA: REPORTES */}
          {tabActiva === 'reportes' && (
            <div className="space-y-6">
              {/* Tarjetas de estadísticas mejoradas */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6 rounded-lg shadow-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-3xl font-bold">S/ {estadisticas.totalGastado.toFixed(2)}</div>
                      <div className="text-blue-100 text-sm uppercase font-medium">Total Este Mes</div>
                    </div>
                    <div className="text-4xl opacity-80">💰</div>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white p-6 rounded-lg shadow-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-3xl font-bold">{estadisticas.pendientes}</div>
                      <div className="text-yellow-100 text-sm uppercase font-medium">Pendientes</div>
                    </div>
                    <div className="text-4xl opacity-80">⏳</div>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-red-500 to-red-600 text-white p-6 rounded-lg shadow-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-3xl font-bold">{estadisticas.vencidos}</div>
                      <div className="text-red-100 text-sm uppercase font-medium">Vencidos</div>
                    </div>
                    <div className="text-4xl opacity-80">🚨</div>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-6 rounded-lg shadow-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-3xl font-bold">S/ {estadisticas.promedioMensual.toFixed(2)}</div>
                      <div className="text-green-100 text-sm uppercase font-medium">Promedio Mensual</div>
                    </div>
                    <div className="text-4xl opacity-80">📊</div>
                  </div>
                </div>
              </div>

              {/* Análisis de gastos por mes */}
              <div className="bg-white border rounded-lg p-6 shadow-sm">
                <h3 className="text-xl font-semibold text-gray-800 mb-4">📈 Análisis de Gastos Mensuales</h3>
                <div className="overflow-x-auto">
                  {(() => {
                    // Agrupar pagos por mes para mostrar tendencia
                    const gastosPorMes: Record<string, number> = {}
                    
                    pagos.forEach(pago => {
                      const fecha = new Date(pago.fecha_pago)
                      const mesAño = `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, '0')}`
                      gastosPorMes[mesAño] = (gastosPorMes[mesAño] || 0) + pago.monto
                    })

                    const mesesOrdenados = Object.entries(gastosPorMes)
                      .sort(([a], [b]) => b.localeCompare(a))
                      .slice(0, 6) // Últimos 6 meses

                    if (mesesOrdenados.length === 0) {
                      return (
                        <div className="text-center py-8 text-gray-500">
                          <div className="text-6xl mb-4">📊</div>
                          <p>No hay datos suficientes para mostrar análisis mensual</p>
                        </div>
                      )
                    }

                    return (
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                        {mesesOrdenados.map(([mes, total]) => {
                          const [año, mesNum] = mes.split('-')
                          const nombreMes = new Date(parseInt(año), parseInt(mesNum) - 1).toLocaleDateString('es-PE', { 
                            month: 'short',
                            year: '2-digit'
                          })
                          
                          return (
                            <div key={mes} className="text-center p-4 bg-gray-50 rounded-lg">
                              <div className="text-lg font-bold text-gray-800">S/ {total.toFixed(2)}</div>
                              <div className="text-sm text-gray-600 capitalize">{nombreMes}</div>
                            </div>
                          )
                        })}
                      </div>
                    )
                  })()}
                </div>
              </div>

              {/* Tabla de servicios con mayor gasto */}
              <div className="bg-white border rounded-lg overflow-hidden shadow-sm">
                <div className="bg-gradient-to-r from-purple-50 to-blue-50 px-6 py-4 border-b">
                  <h3 className="text-xl font-semibold text-gray-800">🏆 Ranking de Servicios por Gasto</h3>
                  <p className="text-sm text-gray-600 mt-1">Servicios ordenados por el total gastado históricamente</p>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Ranking
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Servicio
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Total Pagado
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Número de Pagos
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Promedio por Pago
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Último Pago
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {(() => {
                        // Agrupar pagos por servicio para el reporte
                        const gastosPorServicio: Record<string, { 
                          total: number; 
                          count: number; 
                          ultimoPago: string;
                        }> = {}
                        
                        pagos.forEach(pago => {
                          if (!gastosPorServicio[pago.servicio_nombre]) {
                            gastosPorServicio[pago.servicio_nombre] = { 
                              total: 0, 
                              count: 0, 
                              ultimoPago: pago.fecha_pago 
                            }
                          }
                          gastosPorServicio[pago.servicio_nombre].total += pago.monto
                          gastosPorServicio[pago.servicio_nombre].count += 1
                          
                          // Actualizar último pago si es más reciente
                          if (pago.fecha_pago > gastosPorServicio[pago.servicio_nombre].ultimoPago) {
                            gastosPorServicio[pago.servicio_nombre].ultimoPago = pago.fecha_pago
                          }
                        })

                        // Convertir a array y ordenar por total
                        const serviciosOrdenados = Object.entries(gastosPorServicio)
                          .map(([nombre, datos]) => ({
                            nombre,
                            total: datos.total,
                            count: datos.count,
                            promedio: datos.total / datos.count,
                            ultimoPago: datos.ultimoPago
                          }))
                          .sort((a, b) => b.total - a.total)

                        if (serviciosOrdenados.length === 0) {
                          return (
                            <tr>
                              <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                                <div className="flex flex-col items-center">
                                  <div className="text-6xl mb-4">📊</div>
                                  <h3 className="text-lg font-medium mb-2">No hay datos suficientes</h3>
                                  <p className="text-sm">Registra algunos pagos para ver los reportes detallados</p>
                                </div>
                              </td>
                            </tr>
                          )
                        }

                        return serviciosOrdenados.map((servicio, index) => (
                          <tr key={servicio.nombre} className="hover:bg-gray-50 transition-colors">
                            <td className="px-6 py-4">
                              <div className="flex items-center">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                                  index === 0 ? 'bg-yellow-100 text-yellow-800' :
                                  index === 1 ? 'bg-gray-100 text-gray-800' :
                                  index === 2 ? 'bg-orange-100 text-orange-800' :
                                  'bg-blue-100 text-blue-800'
                                }`}>
                                  {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : index + 1}
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="font-medium text-gray-900">{servicio.nombre}</div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="text-lg font-semibold text-green-600">
                                S/ {servicio.total.toFixed(2)}
                              </div>
                            </td>
                            <td className="px-6 py-4 text-gray-900">
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                {servicio.count} pagos
                              </span>
                            </td>
                            <td className="px-6 py-4 text-gray-900">
                              S/ {servicio.promedio.toFixed(2)}
                            </td>
                            <td className="px-6 py-4 text-gray-900 text-sm">
                              {new Date(servicio.ultimoPago).toLocaleDateString('es-PE', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric'
                              })}
                            </td>
                          </tr>
                        ))
                      })()}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Proyecciones y alertas */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Próximos vencimientos */}
                <div className="bg-white border rounded-lg p-6 shadow-sm">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">⚠️ Próximos Vencimientos</h3>
                  <div className="space-y-3">
                    {(() => {
                      const proximosVencimientos = servicios
                        .filter(s => s.estado !== 'pagado' && s.fechaVencimiento)
                        .sort((a, b) => new Date(a.fechaVencimiento!).getTime() - new Date(b.fechaVencimiento!).getTime())
                        .slice(0, 5)

                      if (proximosVencimientos.length === 0) {
                        return (
                          <div className="text-center text-gray-500 py-4">
                            <div className="text-4xl mb-2">🎉</div>
                            <p>¡No hay servicios próximos a vencer!</p>
                          </div>
                        )
                      }

                      return proximosVencimientos.map(servicio => {
                        const semaforoInfo = calcularSemaforo(servicio)
                        return (
                          <div key={servicio.id} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                            <div className="flex items-center gap-3">
                              <div className={`w-3 h-3 rounded-full ${semaforoInfo.clase}`}></div>
                              <div>
                                <div className="font-medium text-gray-900">{servicio.nombre}</div>
                                <div className="text-sm text-gray-600">S/ {servicio.costo.toFixed(2)}</div>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-sm text-gray-900">
                                {new Date(servicio.fechaVencimiento!).toLocaleDateString('es-PE')}
                              </div>
                              <div className={`text-xs ${semaforoInfo.textoClase}`}>
                                {semaforoInfo.texto}
                              </div>
                            </div>
                          </div>
                        )
                      })
                    })()}
                  </div>
                </div>

                {/* Resumen financiero */}
                <div className="bg-white border rounded-lg p-6 shadow-sm">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">💡 Resumen Financiero</h3>
                  <div className="space-y-4">
                    <div className="p-3 bg-blue-50 rounded">
                      <div className="text-sm text-blue-600 font-medium">Total Comprometido (Pendientes)</div>
                      <div className="text-xl font-bold text-blue-800">
                        S/ {servicios.filter(s => s.estado !== 'pagado').reduce((total, s) => total + s.costo, 0).toFixed(2)}
                      </div>
                    </div>
                    
                    <div className="p-3 bg-green-50 rounded">
                      <div className="text-sm text-green-600 font-medium">Total Pagado (Este Año)</div>
                      <div className="text-xl font-bold text-green-800">
                        S/ {(() => {
                          const añoActual = new Date().getFullYear()
                          return pagos
                            .filter(p => new Date(p.fecha_pago).getFullYear() === añoActual)
                            .reduce((total, p) => total + p.monto, 0)
                            .toFixed(2)
                        })()}
                      </div>
                    </div>
                    
                    <div className="p-3 bg-purple-50 rounded">
                      <div className="text-sm text-purple-600 font-medium">Proyección Anual</div>
                      <div className="text-xl font-bold text-purple-800">
                        S/ {(estadisticas.promedioMensual * 12).toFixed(2)}
                      </div>
                      <div className="text-xs text-purple-600 mt-1">
                        Basado en promedio mensual
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}