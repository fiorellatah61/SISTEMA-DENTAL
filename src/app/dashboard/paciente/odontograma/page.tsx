//NUEVO
// app/dashboard/paciente/odontograma/page.tsx
'use client'
import { useState, useEffect } from 'react'
import Image from 'next/image'
import { usePaciente } from '../hooks/usePaciente'
import TabNavigation from '../components/TabNavigation'
import ActionButtons from '../components/ActionButtons'

// Interfaces para los tipos de datos
interface ProcedimientoDental {
  id: string
  codigo: string
  nombre: string
  descripcion?: string
  color: string
  simbolo?: string
  esCondicion: boolean
}

interface PiezaOdontograma {
  id: string
  diente: string
  caraDental?: string
  procedimiento: string
  subtipo?: string
  condiciones?: string
  especificaciones?: string
  estado: string
  fechaRegistro: Date
}

interface Odontograma {
  id: string
  imagenOdontograma?: string
  fechaActualizacion: Date
  piezasOdontograma: PiezaOdontograma[]
}

// Definir los números de dientes permanentes y temporales
const DIENTES_PERMANENTES = {
  superiores: [18, 17, 16, 15, 14, 13, 12, 11, 21, 22, 23, 24, 25, 26, 27, 28],
  inferiores: [48, 47, 46, 45, 44, 43, 42, 41, 31, 32, 33, 34, 35, 36, 37, 38]
}

const DIENTES_TEMPORALES = {
  superiores: [55, 54, 53, 52, 51, 61, 62, 63, 64, 65],
  inferiores: [85, 84, 83, 82, 81, 71, 72, 73, 74, 75]
}

export default function OdontogramaPage() {
  // Hook personalizado para manejar el paciente
  const {
    pacienteSeleccionado,
    buscarDni,
    setBuscarDni,
    loading,
    setLoading,
    error,
    setError,
    buscarPaciente
  } = usePaciente()

  // Estados para el odontograma
  const [odontograma, setOdontograma] = useState<Odontograma | null>(null)
  const [procedimientos, setProcedimientos] = useState<ProcedimientoDental[]>([])
  const [condiciones, setCondiciones] = useState<ProcedimientoDental[]>([])
  const [mostrarTemporales, setMostrarTemporales] = useState(false)

  // Estados para el formulario de pieza seleccionada
  const [piezaSeleccionada, setPiezaSeleccionada] = useState<string | null>(null)
  const [mostrarFormularioPieza, setMostrarFormularioPieza] = useState(false)
  const [datosPieza, setDatosPieza] = useState({
    procedimiento: '',
    caraDental: '',
    subtipo: '',
    condiciones: '',
    especificaciones: '',
    estado: 'Saludable'
  })

  // Estados para fecha y número de ficha
  const [fechaIngreso, setFechaIngreso] = useState('')
  const [numeroFicha, setNumeroFicha] = useState('')

  // Cargar datos iniciales
  useEffect(() => {
    const fechaActual = new Date().toISOString().split('T')[0]
    setFechaIngreso(fechaActual)
    obtenerProximoNumeroFicha()
    cargarProcedimientosYCondiciones()
  }, [])

  // Cargar odontograma cuando se selecciona un paciente
  useEffect(() => {
    if (pacienteSeleccionado) {
      cargarOdontograma(pacienteSeleccionado.id)
    }
  }, [pacienteSeleccionado])

  // Función para obtener el próximo número de ficha
  const obtenerProximoNumeroFicha = async () => {
    try {
      const response = await fetch('/api/ficha/proximo-numero')
      const data = await response.json()
      if (response.ok) {
        setNumeroFicha(data.proximoNumero)
      }
    } catch (error) {
      console.error('Error al obtener próximo número de ficha:', error)
    }
  }

  // Función para cargar procedimientos y condiciones
  const cargarProcedimientosYCondiciones = async () => {
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
      console.error('Error al cargar procedimientos y condiciones:', error)
    }
  }

  // Función para cargar el odontograma existente
  const cargarOdontograma = async (pacienteId: string) => {
    try {
      const response = await fetch(`/api/odontograma?pacienteId=${pacienteId}`)
      const data = await response.json()
      
      if (response.ok && data.odontograma) {
        setOdontograma(data.odontograma)
      } else {
        setOdontograma(null)
      }
    } catch (error) {
      console.error('Error al cargar odontograma:', error)
    }
  }

  // Función para manejar clic en un diente
  const handleDienteClick = (numeroDiente: number) => {
    setPiezaSeleccionada(numeroDiente.toString())
    
    // Buscar datos existentes de esta pieza
    const piezaExistente = odontograma?.piezasOdontograma
      .filter(pieza => pieza.diente === numeroDiente.toString())
      .sort((a, b) => new Date(b.fechaRegistro).getTime() - new Date(a.fechaRegistro).getTime())[0]

    if (piezaExistente) {
      setDatosPieza({
        procedimiento: piezaExistente.procedimiento,
        caraDental: piezaExistente.caraDental || '',
        subtipo: piezaExistente.subtipo || '',
        condiciones: piezaExistente.condiciones || '',
        especificaciones: piezaExistente.especificaciones || '',
        estado: piezaExistente.estado
      })
    } else {
      // Limpiar formulario para pieza nueva
      setDatosPieza({
        procedimiento: '',
        caraDental: '',
        subtipo: '',
        condiciones: '',
        especificaciones: '',
        estado: 'Saludable'
      })
    }
    
    setMostrarFormularioPieza(true)
  }

  // Función para obtener información del procedimiento/condición de un diente
  const obtenerInfoDiente = (numeroDiente: number) => {
    if (!odontograma) return null
    
    const piezasEsta = odontograma.piezasOdontograma
      .filter(pieza => pieza.diente === numeroDiente.toString())
      .sort((a, b) => new Date(b.fechaRegistro).getTime() - new Date(a.fechaRegistro).getTime())

    if (piezasEsta.length === 0) return null

    const ultimaPieza = piezasEsta[0]
    
    // Buscar información del procedimiento o condición
    const procedimiento = procedimientos.find(p => p.nombre === ultimaPieza.procedimiento)
    const condicion = condiciones.find(c => c.nombre === ultimaPieza.condiciones)
    
    return {
      pieza: ultimaPieza,
      procedimiento,
      condicion
    }
  }

  // Función para renderizar el símbolo del procedimiento
  const renderizarSimboloProcedimiento = (numeroDiente: number) => {
    const info = obtenerInfoDiente(numeroDiente)
    
    if (!info) return null

    const { procedimiento, condicion } = info

    // Priorizar procedimiento sobre condición
    const elemento = procedimiento || condicion
    
    if (!elemento || !elemento.simbolo) return null

    return (
      <div 
        className="absolute inset-0 flex items-center justify-center text-white font-bold text-lg pointer-events-none z-10"
        style={{
          textShadow: '1px 1px 2px rgba(0,0,0,0.8)',
          fontSize: '14px'
        }}
      >
        {elemento.simbolo}
      </div>
    )
  }

  // Función para obtener el color de fondo del diente
  const obtenerColorFondoDiente = (numeroDiente: number) => {
    const info = obtenerInfoDiente(numeroDiente)
    
    if (!info) return 'transparent'

    const { procedimiento, condicion } = info
    
    // Priorizar procedimiento sobre condición
    const elemento = procedimiento || condicion
    
    if (!elemento) return 'transparent'

    // Convertir nombre de color a valor CSS
    const coloresCSS: {[key: string]: string} = {
      'red': '#ef4444',
      'blue': '#3b82f6',
      'green': '#22c55e',
      'yellow': '#eab308',
      'purple': '#a855f7',
      'pink': '#ec4899',
      'orange': '#f97316',
      'gray': '#6b7280',
      'cyan': '#06b6d4',
      'lime': '#84cc16',
      'indigo': '#6366f1',
      'emerald': '#10b981',
      'rose': '#f43f5f',
      'amber': '#f59e0b',
      'teal': '#14b8a6',
      'violet': '#8b5cf6'
    }

    return coloresCSS[elemento.color] || elemento.color || 'transparent'
  }

  // Función para manejar cambios en el formulario de pieza
  const handleDatosPiezaChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setDatosPieza(prev => ({
      ...prev,
      [name]: value
    }))
  }

  // Función para guardar datos de una pieza
  const guardarPieza = async () => {
    if (!pacienteSeleccionado || !piezaSeleccionada) {
      setError('Paciente y pieza son requeridos')
      return
    }

    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/odontograma', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          pacienteId: pacienteSeleccionado.id,
          diente: piezaSeleccionada,
          ...datosPieza
        })
      })

      const data = await response.json()

      if (response.ok) {
        alert('Pieza dental actualizada correctamente')
        setMostrarFormularioPieza(false)
        setPiezaSeleccionada(null)
        cargarOdontograma(pacienteSeleccionado.id) // Recargar odontograma
      } else {
        setError(data.error || 'Error al guardar pieza')
      }
    } catch (error) {
      setError('Error al guardar pieza')
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  // Función para guardar odontograma completo
  const guardarOdontograma = async () => {
    if (!pacienteSeleccionado) {
      setError('Primero debe seleccionar un paciente')
      return
    }

    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/odontograma', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          pacienteId: pacienteSeleccionado.id,
          piezas: [], // Podrías enviar múltiples piezas aquí
          imagenUrl: null // Aquí podrías enviar una URL de imagen si la tienes
        })
      })

      const data = await response.json()

      if (response.ok) {
        alert('Odontograma guardado correctamente')
        cargarOdontograma(pacienteSeleccionado.id)
      } else {
        setError(data.error || 'Error al guardar odontograma')
      }
    } catch (error) {
      setError('Error al guardar odontograma')
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  // Función para cancelar
  const cancelar = () => {
    setError('')
    setMostrarFormularioPieza(false)
    setPiezaSeleccionada(null)
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">CLÍNICA DENTAL SONRÍE</h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-600">
                N° de Ficha: 
                <input 
                  type="text" 
                  value={numeroFicha}
                  className="ml-2 border rounded px-2 py-1 w-24 bg-gray-100"
                  placeholder="000"
                  readOnly
                />
              </div>
              <div className="text-sm text-gray-600">
                Fecha de Ingreso:
                <input 
                  type="date" 
                  value={fechaIngreso}
                  className="ml-2 border rounded px-2 py-1 bg-gray-100"
                  readOnly
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Buscador de paciente */}
        <div className="bg-white rounded-lg shadow-sm border mb-6 p-4">
          <div className="flex items-center space-x-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Buscar Paciente por DNI:
              </label>
              <input
                type="text"
                value={buscarDni}
                onChange={(e) => setBuscarDni(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Ingrese DNI"
              />
            </div>
            <button
              onClick={buscarPaciente}
              disabled={loading}
              className="bg-gray-800 text-white px-4 py-2 rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 disabled:opacity-50 mt-6"
            >
              {loading ? 'Buscando...' : 'Buscar'}
            </button>
            <div className="text-sm text-gray-600 mt-6">
              Paciente: {pacienteSeleccionado ? `${pacienteSeleccionado.nombres} ${pacienteSeleccionado.apellidos}` : 'No seleccionado'}
            </div>
          </div>
          {error && (
            <div className="mt-2 text-red-600 text-sm">{error}</div>
          )}
        </div>

        {/* Contenedor principal con navegación de tabs */}
        <div className="bg-white rounded-lg shadow-sm border mb-6">
          {/* Navegación de tabs */}
          <TabNavigation pacienteSeleccionado={pacienteSeleccionado} />

          {/* Contenido del Tab 6 - Odontograma */}
          <div className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-900">5. ODONTOGRAMA</h2>
              
              {/* Toggle para mostrar dientes temporales */}
              <div className="flex items-center space-x-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={mostrarTemporales}
                    onChange={(e) => setMostrarTemporales(e.target.checked)}
                    className="mr-2"
                  />
                  <span className="text-sm">Mostrar dientes temporales</span>
                </label>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* Odontograma principal */}
              <div className="lg:col-span-3">
                <div className="border rounded-lg p-4 bg-gray-50">
                  {/* Dientes superiores */}
                  <div className="mb-8">
                    <h3 className="text-sm font-medium mb-4 text-center">Dientes Superiores</h3>
                    <div className="flex justify-center space-x-2">
                      {(mostrarTemporales ? DIENTES_TEMPORALES.superiores : DIENTES_PERMANENTES.superiores).map((numeroDiente) => (
                        <button
                          key={numeroDiente}
                          onClick={() => handleDienteClick(numeroDiente)}
                          className="relative group hover:scale-110 transition-transform duration-200"
                          title={`Diente ${numeroDiente}`}
                        >
                          <div className="relative w-12 h-16">
                            {/* Fondo de color para el procedimiento */}
                            <div 
                              className="absolute inset-0 rounded opacity-70"
                              style={{
                                backgroundColor: obtenerColorFondoDiente(numeroDiente)
                              }}
                            ></div>

                            {/* Imagen del diente */}
                            <Image
                              src={`/images/dientes/${numeroDiente}.png`}
                              alt={`Diente ${numeroDiente}`}
                              width={48}
                              height={64}
                              className="relative z-5 w-full h-full object-contain opacity-90"
                              onError={(e) => {
                                // Fallback en caso de que no exista la imagen
                                const target = e.target as HTMLImageElement;
                                target.style.display = 'none';
                                target.nextElementSibling?.classList.remove('hidden');
                              }}
                            />

                            {/* Fallback - mostrar número si no hay imagen */}
                            <div className="hidden absolute inset-0 bg-blue-100 border rounded flex items-center justify-center text-xs font-semibold z-5">
                              {numeroDiente}
                            </div>

                            {/* Símbolo del procedimiento */}
                            {renderizarSimboloProcedimiento(numeroDiente)}
                          </div>
                          {/* Número del diente debajo de la imagen */}
                          <div className="text-xs font-medium text-center mt-1 text-gray-700">
                            {numeroDiente}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Dientes inferiores */}
                  <div>
                    <h3 className="text-sm font-medium mb-4 text-center">Dientes Inferiores</h3>
                    <div className="flex justify-center space-x-2">
                      {(mostrarTemporales ? DIENTES_TEMPORALES.inferiores : DIENTES_PERMANENTES.inferiores).map((numeroDiente) => (
                        <button
                          key={numeroDiente}
                          onClick={() => handleDienteClick(numeroDiente)}
                          className="relative group hover:scale-110 transition-transform duration-200"
                          title={`Diente ${numeroDiente}`}
                        >
                          <div className="relative w-12 h-16">
                            {/* Fondo de color para el procedimiento */}
                            <div 
                              className="absolute inset-0 rounded opacity-70"
                              style={{
                                backgroundColor: obtenerColorFondoDiente(numeroDiente)
                              }}
                            ></div>

                            {/* Imagen del diente */}
                            <Image
                              src={`/images/dientes/${numeroDiente}.png`}
                              alt={`Diente ${numeroDiente}`}
                              width={48}
                              height={64}
                              className="relative z-5 w-full h-full object-contain transform rotate-180 opacity-90"
                              onError={(e) => {
                                // Fallback en caso de que no exista la imagen
                                const target = e.target as HTMLImageElement;
                                target.style.display = 'none';
                                target.nextElementSibling?.classList.remove('hidden');
                              }}
                            />

                            {/* Fallback - mostrar número si no hay imagen */}
                            <div className="hidden absolute inset-0 bg-blue-100 border rounded flex items-center justify-center text-xs font-semibold z-5">
                              {numeroDiente}
                            </div>

                            {/* Símbolo del procedimiento */}
                            {renderizarSimboloProcedimiento(numeroDiente)}
                          </div>
                          {/* Número del diente debajo de la imagen */}
                          <div className="text-xs font-medium text-center mt-1 text-gray-700">
                            {numeroDiente}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Panel lateral con leyendas */}
              <div className="space-y-6">
                {/* Leyenda de Procedimientos */}
                <div className="border rounded-lg p-4">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="text-sm font-semibold">Leyenda de Procedimientos</h3>
                    <button
                      onClick={() => window.open('/dashboard/procedimientos', '_blank')}
                      className="text-xs bg-blue-500 text-white px-2 py-1 rounded"
                    >
                      Gestionar
                    </button>
                  </div>
                  <div className="space-y-1 max-h-32 overflow-y-auto">
                    {procedimientos.slice(0, 8).map((proc, index) => (
                      <div key={proc.id} className="flex items-center text-xs">
                        <span className="w-4 mr-2">{index + 1}</span>
                        <span className="flex-1">{proc.nombre}</span>
                        <div className="w-8 h-4 rounded flex items-center justify-center text-white text-xs mr-1" style={{backgroundColor: proc.color}}>
                          {proc.simbolo}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Leyenda de Condiciones */}
                <div className="border rounded-lg p-4">
                  <h3 className="text-sm font-semibold mb-2">Condiciones Actuales</h3>
                  <div className="space-y-1 max-h-32 overflow-y-auto">
                    {condiciones.slice(0, 5).map((cond, index) => (
                      <div key={cond.id} className="flex items-center text-xs">
                        <span className="w-4 mr-2">{index + 1}</span>
                        <span className="flex-1">{cond.nombre}</span>
                        <div className="w-8 h-4 rounded flex items-center justify-center text-white text-xs mr-1" style={{backgroundColor: cond.color}}>
                          {cond.simbolo}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Estados */}
                <div className="border rounded-lg p-4">
                  <h3 className="text-sm font-semibold mb-2">ESTADOS</h3>
                  <div className="space-y-1">
                    <div className="flex items-center text-xs">
                      <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
                      <span>Saludable</span>
                    </div>
                    <div className="flex items-center text-xs">
                      <div className="w-3 h-3 rounded-full bg-yellow-500 mr-2"></div>
                      <span>Seguimiento</span>
                    </div>
                    <div className="flex items-center text-xs">
                      <div className="w-3 h-3 rounded-full bg-blue-800 mr-2"></div>
                      <span>Necesita atención</span>
                    </div>
                    <div className="flex items-center text-xs">
                      <div className="w-3 h-3 rounded-full bg-red-500 mr-2"></div>
                      <span>Crítico</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal para editar pieza dental */}
            {mostrarFormularioPieza && piezaSeleccionada && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-96 overflow-y-auto">
                  <h3 className="text-lg font-semibold mb-4">
                    Editar Diente {piezaSeleccionada}
                  </h3>

                  <div className="space-y-4">
                    {/* Procedimiento */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Procedimiento:
                      </label>
                      <select
                        name="procedimiento"
                        value={datosPieza.procedimiento}
                        onChange={handleDatosPiezaChange}
                        className="w-full border border-gray-300 rounded-md px-3 py-2"
                      >
                        <option value="">Seleccionar procedimiento</option>
                        {procedimientos.map((proc) => (
                          <option key={proc.id} value={proc.nombre}>
                            {proc.codigo} - {proc.nombre} {proc.simbolo ? `(${proc.simbolo})` : ''}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Cara Dental */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Cara Dental:
                      </label>
                      <select
                        name="caraDental"
                        value={datosPieza.caraDental}
                        onChange={handleDatosPiezaChange}
                        className="w-full border border-gray-300 rounded-md px-3 py-2"
                      >
                        <option value="">Seleccionar cara</option>
                        <option value="OCLUSAL">Oclusal</option>
                        <option value="MESIAL">Mesial</option>
                        <option value="DISTAL">Distal</option>
                        <option value="VESTIBULAR">Vestibular</option>
                        <option value="LINGUAL">Lingual</option>
                        <option value="PALATINO">Palatino</option>
                        <option value="COMPLETA">Completa</option>
                      </select>
                    </div>

                    {/* Subtipo */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Subtipo:
                      </label>
                      <input
                        type="text"
                        name="subtipo"
                        value={datosPieza.subtipo}
                        onChange={handleDatosPiezaChange}
                        className="w-full border border-gray-300 rounded-md px-3 py-2"
                        placeholder="Especificar subtipo"
                      />
                    </div>

                    {/* Condiciones */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Condición:
                      </label>
                      <select
                        name="condiciones"
                        value={datosPieza.condiciones}
                        onChange={handleDatosPiezaChange}
                        className="w-full border border-gray-300 rounded-md px-3 py-2"
                      >
                        <option value="">Seleccionar condición</option>
                        {condiciones.map((cond) => (
                          <option key={cond.id} value={cond.nombre}>
                            {cond.codigo} - {cond.nombre} {cond.simbolo ? `(${cond.simbolo})` : ''}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Estado */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Estado:
                      </label>
                      <select
                        name="estado"
                        value={datosPieza.estado}
                        onChange={handleDatosPiezaChange}
                        className="w-full border border-gray-300 rounded-md px-3 py-2"
                      >
                        <option value="Saludable">Saludable</option>
                        <option value="Seguimiento">Seguimiento</option>
                        <option value="Necesita atención">Necesita atención</option>
                        <option value="Crítico">Crítico</option>
                      </select>
                    </div>

                    {/* Especificaciones */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Especificaciones:
                      </label>
                      <textarea
                        name="especificaciones"
                        value={datosPieza.especificaciones}
                        onChange={handleDatosPiezaChange}
                        className="w-full border border-gray-300 rounded-md px-3 py-2"
                        rows={3}
                        placeholder="Detalles adicionales..."
                      />
                    </div>
                  </div>

                  {/* Botones del modal */}
                  <div className="flex space-x-4 mt-6">
                    <button
                      onClick={() => setMostrarFormularioPieza(false)}
                      className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={guardarPieza}
                      disabled={loading}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                    >
                      {loading ? 'Guardando...' : 'Guardar Pieza'}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Tabla de historial de piezas (si existe odontograma) */}
            {odontograma && odontograma.piezasOdontograma.length > 0 && (
              <div className="mt-8">
                <h3 className="text-lg font-semibold mb-4">Historial de Tratamientos</h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full table-auto border-collapse border border-gray-300">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="border border-gray-300 px-4 py-2 text-left text-sm font-medium">FECHA</th>
                        <th className="border border-gray-300 px-4 py-2 text-left text-sm font-medium">N° DE DIENTES</th>
                        <th className="border border-gray-300 px-4 py-2 text-left text-sm font-medium">CONDICIÓN ACTUAL</th>
                        <th className="border border-gray-300 px-4 py-2 text-left text-sm font-medium">PROCEDIMIENTO</th>
                        <th className="border border-gray-300 px-4 py-2 text-left text-sm font-medium">SUBTIPO</th>
                        <th className="border border-gray-300 px-4 py-2 text-left text-sm font-medium">CARA DENTAL</th>
                        <th className="border border-gray-300 px-4 py-2 text-left text-sm font-medium">ESPECIFICACIONES</th>
                        <th className="border border-gray-300 px-4 py-2 text-left text-sm font-medium">ESTADO</th>
                      </tr>
                    </thead>
                    <tbody>
                      {odontograma.piezasOdontograma
                        .sort((a, b) => new Date(b.fechaRegistro).getTime() - new Date(a.fechaRegistro).getTime())
                        .map((pieza) => (
                        <tr key={pieza.id}>
                          <td className="border border-gray-300 px-4 py-2 text-sm">
                            {new Date(pieza.fechaRegistro).toLocaleDateString()}
                          </td>
                          <td className="border border-gray-300 px-4 py-2 text-sm">{pieza.diente}</td>
                          <td className="border border-gray-300 px-4 py-2 text-sm">{pieza.condiciones || '-'}</td>
                          <td className="border border-gray-300 px-4 py-2 text-sm">{pieza.procedimiento}</td>
                          <td className="border border-gray-300 px-4 py-2 text-sm">{pieza.subtipo || '-'}</td>
                          <td className="border border-gray-300 px-4 py-2 text-sm">{pieza.caraDental || '-'}</td>
                          <td className="border border-gray-300 px-4 py-2 text-sm">{pieza.especificaciones || '-'}</td>
                          <td className="border border-gray-300 px-4 py-2 text-sm">
                            <span className={`px-2 py-1 rounded-full text-xs ${
                              pieza.estado === 'Saludable' ? 'bg-green-100 text-green-800' :
                              pieza.estado === 'Seguimiento' ? 'bg-yellow-100 text-yellow-800' :
                              pieza.estado === 'Necesita atención' ? 'bg-blue-100 text-blue-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {pieza.estado}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
            {/* Botones de acción */}
            <ActionButtons
              pacienteSeleccionado={pacienteSeleccionado}
              loading={loading}
              onCancelar={cancelar}
              onGuardar={guardarOdontograma}
            />
          </div>
        </div>
      </div>
    </div>
  )
}