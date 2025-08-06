// app/dashboard/paciente/components/OdontogramaComponent.tsx
'use client'
import { useState, useEffect } from 'react'
interface Procedimiento {
  id: string
  codigo: string
  nombre: string
  descripcion?: string
  color: string
  simbolo?: string
  esCondicion: boolean
}
interface PiezaDental {
  numero: string
  estado: string
  procedimientos: string[]
  condiciones: string[]
  observaciones?: string
}
interface Props {
  pacienteSeleccionado: any
  loading: boolean
  onGuardar: (datos: any) => void
}
export default function OdontogramaComponent({ pacienteSeleccionado, loading, onGuardar }: Props) {
  // Estados para manejar los datos
  const [procedimientos, setProcedimientos] = useState<Procedimiento[]>([])
  const [condiciones, setCondiciones] = useState<Procedimiento[]>([])
  const [piezasDentales, setPiezasDentales] = useState<{ [key: string]: PiezaDental }>({})
  const [piezaSeleccionada, setPiezaSeleccionada] = useState<string | null>(null)
  const [observaciones, setObservaciones] = useState('')
  // Estados para el panel de herramientas
  const [procedimientoSeleccionado, setProcedimientoSeleccionado] = useState<string>('')
  const [condicionSeleccionada, setCondicionSeleccionada] = useState<string>('')
  // Definir los números de dientes permanentes y temporales
  const dientesPermanentes = {
    superiores: ['18', '17', '16', '15', '14', '13', '12', '11', '21', '22', '23', '24', '25', '26', '27', '28'],
    inferiores: ['48', '47', '46', '45', '44', '43', '42', '41', '31', '32', '33', '34', '35', '36', '37', '38']
  }
  const dientesTemporales = {
    superiores: ['55', '54', '53', '52', '51', '61', '62', '63', '64', '65'],
    inferiores: ['85', '84', '83', '82', '81', '71', '72', '73', '74', '75']
  }
  // Cargar procedimientos y condiciones al iniciar
  useEffect(() => {
    cargarProcedimientosYCondiciones()
    if (pacienteSeleccionado) {
      cargarOdontograma()
    }
  }, [pacienteSeleccionado])
  // Función para cargar procedimientos y condiciones
  const cargarProcedimientosYCondiciones = async () => {
    try {
      const [resProcedimientos, resCondiciones] = await Promise.all([
        fetch('/api/procedimientos?tipo=procedimiento'),
        fetch('/api/procedimientos?tipo=condicion')
      ])
      const dataProcedimientos = await resProcedimientos.json()
      const dataCondiciones = await resCondiciones.json()

      if (resProcedimientos.ok) setProcedimientos(dataProcedimientos.procedimientos)
      if (resCondiciones.ok) setCondiciones(dataCondiciones.procedimientos)
    } catch (error) {
      console.error('Error al cargar procedimientos:', error)
    }
  }
  // Función para cargar odontograma existente
  const cargarOdontograma = async () => {
    if (!pacienteSeleccionado) return

    try {
      const response = await fetch(`/api/ficha/odontograma?pacienteId=${pacienteSeleccionado.id}`)
      const data = await response.json()

      if (response.ok && data.odontograma) {
        // Cargar datos del odontograma existente
        const piezas = data.odontograma.piezasOdontograma || []
        const piezasMap: { [key: string]: PiezaDental } = {}

        piezas.forEach((pieza: any) => {
          if (!piezasMap[pieza.diente]) {
            piezasMap[pieza.diente] = {
              numero: pieza.diente,
              estado: pieza.estado || 'Saludable',
              procedimientos: [],
              condiciones: [],
              observaciones: pieza.especificaciones
            }
          }

          // Clasificar si es procedimiento o condición
          const esProcedimiento = procedimientos.find(p => p.nombre === pieza.procedimiento && !p.esCondicion)
          const esCondicion = condiciones.find(c => c.nombre === pieza.procedimiento && c.esCondicion)

          if (esProcedimiento) {
            piezasMap[pieza.diente].procedimientos.push(pieza.procedimiento)
          } else if (esCondicion) {
            piezasMap[pieza.diente].condiciones.push(pieza.procedimiento)
          }
        })

        setPiezasDentales(piezasMap)

        // Cargar observaciones generales
        if (data.odontograma.archivoJson) {
          const jsonData = JSON.parse(data.odontograma.archivoJson)
          setObservaciones(jsonData.observaciones || '')
        }
      }
    } catch (error) {
      console.error('Error al cargar odontograma:', error)
    }
  }

  // Función para seleccionar una pieza dental
  const seleccionarPieza = (numeroPieza: string) => {
    setPiezaSeleccionada(numeroPieza)
  }

  // Función para aplicar procedimiento a pieza seleccionada
  const aplicarProcedimiento = () => {
    if (!piezaSeleccionada || !procedimientoSeleccionado) return

    const procedimiento = procedimientos.find(p => p.id === procedimientoSeleccionado)
    if (!procedimiento) return

    setPiezasDentales(prev => ({
      ...prev,
      [piezaSeleccionada]: {
        ...prev[piezaSeleccionada],
        numero: piezaSeleccionada,
        estado: 'Con Tratamiento',
        procedimientos: [...(prev[piezaSeleccionada]?.procedimientos || []), procedimiento.nombre],
        condiciones: prev[piezaSeleccionada]?.condiciones || [],
        observaciones: prev[piezaSeleccionada]?.observaciones || ''
      }
    }))

    // Limpiar selección
    setProcedimientoSeleccionado('')
  }

  // Función para aplicar condición a pieza seleccionada
  const aplicarCondicion = () => {
    if (!piezaSeleccionada || !condicionSeleccionada) return

    const condicion = condiciones.find(c => c.id === condicionSeleccionada)
    if (!condicion) return

    setPiezasDentales(prev => ({
      ...prev,
      [piezaSeleccionada]: {
        ...prev[piezaSeleccionada],
        numero: piezaSeleccionada,
        estado: condicion.nombre,
        procedimientos: prev[piezaSeleccionada]?.procedimientos || [],
        condiciones: [...(prev[piezaSeleccionada]?.condiciones || []), condicion.nombre],
        observaciones: prev[piezaSeleccionada]?.observaciones || ''
      }
    }))

    // Limpiar selección
    setCondicionSeleccionada('')
  }

  // Función para limpiar pieza dental
  const limpiarPieza = () => {
    if (!piezaSeleccionada) return

    setPiezasDentales(prev => {
      const nuevasPiezas = { ...prev }
      delete nuevasPiezas[piezaSeleccionada]
      return nuevasPiezas
    })
  }

  // Función para obtener el color de una pieza dental
  const obtenerColorPieza = (numeroPieza: string) => {
    const pieza = piezasDentales[numeroPieza]
    if (!pieza) return '#e5e7eb' // Gris claro por defecto

    // Si tiene condición, usar el color de la última condición
    if (pieza.condiciones.length > 0) {
      const ultimaCondicion = pieza.condiciones[pieza.condiciones.length - 1]
      const condicion = condiciones.find(c => c.nombre === ultimaCondicion)
      if (condicion) return condicion.color
    }

    // Si tiene procedimiento, usar el color del último procedimiento
    if (pieza.procedimientos.length > 0) {
      const ultimoProcedimiento = pieza.procedimientos[pieza.procedimientos.length - 1]
      const procedimiento = procedimientos.find(p => p.nombre === ultimoProcedimiento)
      if (procedimiento) return procedimiento.color
    }

    return '#e5e7eb'
  }

  // Función para manejar el guardado
  const manejarGuardado = () => {
    // Convertir piezasDentales a formato para la API
    const piezasParaGuardar = Object.values(piezasDentales).flatMap(pieza => {
      const piezasArray = []

      // Agregar procedimientos
      pieza.procedimientos.forEach(proc => {
        piezasArray.push({
          diente: pieza.numero,
          procedimiento: proc,
          subtipo: 'Procedimiento',
          estado: pieza.estado,
          especificaciones: pieza.observaciones
        })
      })

      // Agregar condiciones
      pieza.condiciones.forEach(cond => {
        piezasArray.push({
          diente: pieza.numero,
          procedimiento: cond,
          subtipo: 'Condicion',
          estado: pieza.estado,
          especificaciones: pieza.observaciones
        })
      })

      return piezasArray
    })

    onGuardar({
      piezas: piezasParaGuardar,
      observaciones
    })
  }

  return (
    <div className="space-y-6">
      {/* Panel de herramientas */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="font-medium text-gray-900 mb-4">Herramientas del Odontograma</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Selección de Procedimientos */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Procedimientos:
            </label>
            <select
              value={procedimientoSeleccionado}
              onChange={(e) => setProcedimientoSeleccionado(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
            >
              <option value="">Seleccionar procedimiento</option>
              {procedimientos.map(proc => (
                <option key={proc.id} value={proc.id}>
                  {proc.codigo} - {proc.nombre}
                </option>
              ))}
            </select>
            <button
              onClick={aplicarProcedimiento}
              disabled={!piezaSeleccionada || !procedimientoSeleccionado}
              className="mt-2 w-full bg-blue-600 text-white px-3 py-2 rounded-md text-sm hover:bg-blue-700 disabled:opacity-50"
            >
              Aplicar Procedimiento
            </button>
          </div>

          {/* Selección de Condiciones */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Condiciones:
            </label>
            <select
              value={condicionSeleccionada}
              onChange={(e) => setCondicionSeleccionada(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
            >
              <option value="">Seleccionar condición</option>
              {condiciones.map(cond => (
                <option key={cond.id} value={cond.id}>
                  {cond.codigo} - {cond.nombre}
                </option>
              ))}
            </select>
            <button
              onClick={aplicarCondicion}
              disabled={!piezaSeleccionada || !condicionSeleccionada}
              className="mt-2 w-full bg-green-600 text-white px-3 py-2 rounded-md text-sm hover:bg-green-700 disabled:opacity-50"
            >
              Aplicar Condición
            </button>
          </div>

          {/* Acciones */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Acciones:
            </label>
            <div className="space-y-2">
              <button
                onClick={limpiarPieza}
                disabled={!piezaSeleccionada}
                className="w-full bg-red-600 text-white px-3 py-2 rounded-md text-sm hover:bg-red-700 disabled:opacity-50"
              >
                Limpiar Pieza
              </button>
              <div className="text-sm text-gray-600 mt-2">
                Pieza seleccionada: {piezaSeleccionada || 'Ninguna'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Odontograma */}
      <div className="bg-white border rounded-lg p-6">
        <h3 className="font-medium text-gray-900 mb-4">6. ODONTOGRAMA</h3>
        
        {/* Dientes Permanentes Superiores */}
        <div className="mb-4">
          <div className="text-sm text-gray-600 mb-2">Permanentes Superiores</div>
          <div className="flex justify-center space-x-1">
            {dientesPermanentes.superiores.map(numero => (
              <button
                key={numero}
                onClick={() => seleccionarPieza(numero)}
                className={`w-8 h-8 border-2 text-xs font-medium rounded ${
                  piezaSeleccionada === numero 
                    ? 'border-blue-500 ring-2 ring-blue-200' 
                    : 'border-gray-300'
                }`}
                style={{ backgroundColor: obtenerColorPieza(numero) }}
              >
                {numero}
              </button>
            ))}
          </div>
        </div>

        {/* Dientes Temporales Superiores */}
        <div className="mb-4">
          <div className="text-sm text-gray-600 mb-2">Temporales Superiores</div>
          <div className="flex justify-center space-x-1">
            {dientesTemporales.superiores.map(numero => (
              <button
                key={numero}
                onClick={() => seleccionarPieza(numero)}
                className={`w-8 h-8 border-2 text-xs font-medium rounded ${
                  piezaSeleccionada === numero 
                    ? 'border-blue-500 ring-2 ring-blue-200' 
                    : 'border-gray-300'
                }`}
                style={{ backgroundColor: obtenerColorPieza(numero) }}
              >
                {numero}
              </button>
            ))}
          </div>
        </div>

        {/* Dientes Temporales Inferiores */}
        <div className="mb-4">
          <div className="text-sm text-gray-600 mb-2">Temporales Inferiores</div>
          <div className="flex justify-center space-x-1">
            {dientesTemporales.inferiores.map(numero => (
              <button
                key={numero}
                onClick={() => seleccionarPieza(numero)}
                className={`w-8 h-8 border-2 text-xs font-medium rounded ${
                  piezaSeleccionada === numero 
                    ? 'border-blue-500 ring-2 ring-blue-200' 
                    : 'border-gray-300'
                }`}
                style={{ backgroundColor: obtenerColorPieza(numero) }}
              >
                {numero}
              </button>
            ))}
          </div>
        </div>

        {/* Dientes Permanentes Inferiores */}
        <div className="mb-6">
          <div className="text-sm text-gray-600 mb-2">Permanentes Inferiores</div>
          <div className="flex justify-center space-x-1">
            {dientesPermanentes.inferiores.map(numero => (
              <button
                key={numero}
                onClick={() => seleccionarPieza(numero)}
                className={`w-8 h-8 border-2 text-xs font-medium rounded ${
                  piezaSeleccionada === numero 
                    ? 'border-blue-500 ring-2 ring-blue-200' 
                    : 'border-gray-300'
                }`}
                style={{ backgroundColor: obtenerColorPieza(numero) }}
              >
                {numero}
              </button>
            ))}
          </div>
        </div>

        {/* Observaciones */}
        <div className="mt-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Observaciones:
          </label>
          <textarea
            value={observaciones}
            onChange={(e) => setObservaciones(e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-2"
            rows={4}
            placeholder="Observaciones generales del odontograma..."
          />
        </div>

        {/* Información de la pieza seleccionada */}
        {piezaSeleccionada && piezasDentales[piezaSeleccionada] && (
          <div className="mt-4 p-4 bg-blue-50 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">
              Pieza {piezaSeleccionada}
            </h4>
            <div className="text-sm text-blue-800">
              <div>Estado: {piezasDentales[piezaSeleccionada].estado}</div>
              {piezasDentales[piezaSeleccionada].procedimientos.length > 0 && (
                <div>Procedimientos: {piezasDentales[piezaSeleccionada].procedimientos.join(', ')}</div>
              )}
              {piezasDentales[piezaSeleccionada].condiciones.length > 0 && (
                <div>Condiciones: {piezasDentales[piezaSeleccionada].condiciones.join(', ')}</div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Leyenda */}
      <div className="bg-white border rounded-lg p-4">
        <h4 className="font-medium text-gray-900 mb-3">Leyenda de Colores</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
          {[...procedimientos, ...condiciones].map(item => (
            <div key={item.id} className="flex items-center space-x-2">
              <div 
                className="w-4 h-4 rounded border"
                style={{ backgroundColor: item.color }}
              />
              <span>{item.nombre}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Botón de guardado */}
      <div className="flex justify-end">
        <button
          onClick={manejarGuardado}
          disabled={loading}
          className="bg-gray-800 text-white px-6 py-2 rounded-md hover:bg-gray-700 disabled:opacity-50"
        >
          {loading ? 'Guardando...' : 'Guardar Odontograma'}
        </button>
      </div>
    </div>
  )
}