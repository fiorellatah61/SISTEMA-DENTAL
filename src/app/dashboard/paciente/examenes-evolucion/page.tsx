// app/dashboard/paciente/examenes-evolucion/page.tsx
'use client'
import { useState, useEffect } from 'react'
import { usePaciente } from '../hooks/usePaciente'
import TabNavigation from '../components/TabNavigation'
import ActionButtons from '../components/ActionButtons'

// Interfaces para los datos
interface PlanTratamiento {
  id: string
  descripcion: string
  costoTotal: number
}

interface ExamenOdontologico {
  id: string
  fecha: string
  examenClinicoGeneral: string | null
  diagnostico: string | null
  presupuesto: number | null
  planTratamiento: PlanTratamiento | null
}

interface EvolucionPaciente {
  id: string
  fecha: string
  tratamientoRealizado: string
  aCuenta: number
  saldo: number
  observaciones: string | null
  planTratamiento: PlanTratamiento | null
}

export default function ExamenesEvolucionPage() {
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

  // Estados para fecha y número de ficha
  const [fechaIngreso, setFechaIngreso] = useState('')
  const [numeroFicha, setNumeroFicha] = useState('')

  // Estados para planes de tratamiento
  const [planes, setPlanes] = useState<PlanTratamiento[]>([])

  // Estados para exámenes odontológicos
  const [examenes, setExamenes] = useState<ExamenOdontologico[]>([])
  const [mostrarFormularioExamen, setMostrarFormularioExamen] = useState(false)
  const [examenEditando, setExamenEditando] = useState<ExamenOdontologico | null>(null)
  const [formExamen, setFormExamen] = useState({
    fecha: '',
    examenClinicoGeneral: '',
    diagnostico: '',
    presupuesto: '',
    idPlanesTratamiento: ''
  })

  // Estados para evolución
  const [evoluciones, setEvoluciones] = useState<EvolucionPaciente[]>([])
  const [mostrarFormularioEvolucion, setMostrarFormularioEvolucion] = useState(false)
  const [evolucionEditando, setEvolucionEditando] = useState<EvolucionPaciente | null>(null)
  const [formEvolucion, setFormEvolucion] = useState({
    fecha: '',
    tratamientoRealizado: '',
    aCuenta: '',
    saldo: '',
    observaciones: '',
    idPlanesTratamiento: ''
  })

  // Cargar fecha actual y próximo número de ficha al iniciar
  useEffect(() => {
    const fechaActual = new Date().toISOString().split('T')[0];
    setFechaIngreso(fechaActual);
    obtenerProximoNumeroFicha();
    cargarPlanes();
  }, []);

  // Cargar datos cuando se selecciona un paciente
  useEffect(() => {
    if (pacienteSeleccionado) {
      cargarExamenes(pacienteSeleccionado.id);
      cargarEvoluciones(pacienteSeleccionado.id);
    }
  }, [pacienteSeleccionado]);

  // Función para obtener el próximo número de ficha
  const obtenerProximoNumeroFicha = async () => {
    try {
      const response = await fetch('/api/ficha/proximo-numero');
      const data = await response.json();
      if (response.ok) {
        setNumeroFicha(data.proximoNumero);
      }
    } catch (error) {
      console.error('Error al obtener próximo número de ficha:', error);
    }
  };

  // Función para cargar planes de tratamiento
  const cargarPlanes = async () => {
    try {
      const response = await fetch('/api/planes-tratamiento');
      const data = await response.json();
      if (response.ok) {
        setPlanes(data.planes);
      }
    } catch (error) {
      console.error('Error al cargar planes:', error);
    }
  };

  // Función para cargar exámenes odontológicos
  const cargarExamenes = async (pacienteId: string) => {
    try {
      const response = await fetch(`/api/ficha/examenes-odontologicos?pacienteId=${pacienteId}`);
      const data = await response.json();
      if (response.ok) {
        setExamenes(data.examenes);
      }
    } catch (error) {
      console.error('Error al cargar exámenes:', error);
    }
  };

  // Función para cargar evoluciones
  const cargarEvoluciones = async (pacienteId: string) => {
    try {
      const response = await fetch(`/api/ficha/evolucion-paciente?pacienteId=${pacienteId}`);
      const data = await response.json();
      if (response.ok) {
        setEvoluciones(data.evoluciones);
      }
    } catch (error) {
      console.error('Error al cargar evoluciones:', error);
    }
  };

  // Manejar cambios en formulario de examen
  const handleExamenChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormExamen(prev => ({ ...prev, [name]: value }));
  };

  // Manejar cambios en formulario de evolución
  const handleEvolucionChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormEvolucion(prev => ({ ...prev, [name]: value }));
  };

  // Guardar examen odontológico
  const guardarExamen = async () => {
    if (!pacienteSeleccionado) {
      setError('Primero debe seleccionar un paciente');
      return;
    }

    if (!formExamen.fecha) {
      setError('La fecha es requerida');
      return;
    }

    setLoading(true);
    try {
      const method = examenEditando ? 'PUT' : 'POST';
      const url = examenEditando 
        ? `/api/ficha/examenes-odontologicos?id=${examenEditando.id}`
        : '/api/ficha/examenes-odontologicos';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pacienteId: pacienteSeleccionado.id,
          ...formExamen
        })
      });

      if (response.ok) {
        alert(examenEditando ? 'Examen actualizado' : 'Examen creado');
        cancelarFormularioExamen();
        cargarExamenes(pacienteSeleccionado.id);
      } else {
        const data = await response.json();
        setError(data.error);
      }
    } catch (error) {
      setError('Error al guardar examen');
    } finally {
      setLoading(false);
    }
  };

  // Guardar evolución
  const guardarEvolucion = async () => {
    if (!pacienteSeleccionado) {
      setError('Primero debe seleccionar un paciente');
      return;
    }

    if (!formEvolucion.fecha || !formEvolucion.tratamientoRealizado) {
      setError('Fecha y tratamiento realizado son requeridos');
      return;
    }

    setLoading(true);
    try {
      const method = evolucionEditando ? 'PUT' : 'POST';
      const url = evolucionEditando 
        ? `/api/ficha/evolucion-paciente?id=${evolucionEditando.id}`
        : '/api/ficha/evolucion-paciente';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pacienteId: pacienteSeleccionado.id,
          ...formEvolucion
        })
      });

      if (response.ok) {
        alert(evolucionEditando ? 'Evolución actualizada' : 'Evolución creada');
        cancelarFormularioEvolucion();
        cargarEvoluciones(pacienteSeleccionado.id);
      } else {
        const data = await response.json();
        setError(data.error);
      }
    } catch (error) {
      setError('Error al guardar evolución');
    } finally {
      setLoading(false);
    }
  };

  // Editar examen
  const editarExamen = (examen: ExamenOdontologico) => {
    setExamenEditando(examen);
    setFormExamen({
      fecha: new Date(examen.fecha).toISOString().split('T')[0],
      examenClinicoGeneral: examen.examenClinicoGeneral || '',
      diagnostico: examen.diagnostico || '',
      presupuesto: examen.presupuesto?.toString() || '',
      idPlanesTratamiento: examen.planTratamiento?.id || ''
    });
    setMostrarFormularioExamen(true);
  };

  // Editar evolución
  const editarEvolucion = (evolucion: EvolucionPaciente) => {
    setEvolucionEditando(evolucion);
    setFormEvolucion({
      fecha: new Date(evolucion.fecha).toISOString().split('T')[0],
      tratamientoRealizado: evolucion.tratamientoRealizado,
      aCuenta: evolucion.aCuenta.toString(),
      saldo: evolucion.saldo.toString(),
      observaciones: evolucion.observaciones || '',
      idPlanesTratamiento: evolucion.planTratamiento?.id || ''
    });
    setMostrarFormularioEvolucion(true);
  };

  // Eliminar examen
  const eliminarExamen = async (id: string) => {
    if (!confirm('¿Eliminar este examen?')) return;
    
    setLoading(true);
    try {
      const response = await fetch(`/api/ficha/examenes-odontologicos?id=${id}`, {
        method: 'DELETE'
      });
      
      if (response.ok) {
        alert('Examen eliminado');
        cargarExamenes(pacienteSeleccionado!.id);
      }
    } catch (error) {
      setError('Error al eliminar examen');
    } finally {
      setLoading(false);
    }
  };

  // Eliminar evolución
  const eliminarEvolucion = async (id: string) => {
    if (!confirm('¿Eliminar esta evolución?')) return;
    
    setLoading(true);
    try {
      const response = await fetch(`/api/ficha/evolucion-paciente?id=${id}`, {
        method: 'DELETE'
      });
      
      if (response.ok) {
        alert('Evolución eliminada');
        cargarEvoluciones(pacienteSeleccionado!.id);
      }
    } catch (error) {
      setError('Error al eliminar evolución');
    } finally {
      setLoading(false);
    }
  };

  // Cancelar formularios
  const cancelarFormularioExamen = () => {
    setMostrarFormularioExamen(false);
    setExamenEditando(null);
    setFormExamen({
      fecha: '',
      examenClinicoGeneral: '',
      diagnostico: '',
      presupuesto: '',
      idPlanesTratamiento: ''
    });
  };

  const cancelarFormularioEvolucion = () => {
    setMostrarFormularioEvolucion(false);
    setEvolucionEditando(null);
    setFormEvolucion({
      fecha: '',
      tratamientoRealizado: '',
      aCuenta: '',
      saldo: '',
      observaciones: '',
      idPlanesTratamiento: ''
    });
  };

  // Función principal de cancelar para el botón
  const cancelar = () => {
    setError('');
  };

  // Función de guardar principal (no hace nada específico en este tab)
  const guardarPrincipal = () => {
    alert('Use los botones específicos de cada sección');
  };

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
              className="bg-gray-800 text-white px-4 py-2 rounded-md hover:bg-gray-700 disabled:opacity-50 mt-6"
            >
              {loading ? 'Buscando...' : 'Buscar'}
            </button>
            <div className="text-sm text-gray-600 mt-6">
              Paciente: {pacienteSeleccionado ? `${pacienteSeleccionado.nombres} ${pacienteSeleccionado.apellidos}` : 'No seleccionado'}
            </div>
          </div>
          {error && <div className="mt-2 text-red-600 text-sm">{error}</div>}
        </div>

        {/* Contenedor principal */}
        <div className="bg-white rounded-lg shadow-sm border mb-6">
          <TabNavigation pacienteSeleccionado={pacienteSeleccionado} />

          <div className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">6. EXÁMENES COMPLEMENTARIOS Y EVOLUCIÓN</h2>

            {/* Sección Exámenes Complementarios */}
            <div className="mb-8">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-md font-semibold text-gray-800">EXÁMENES COMPLEMENTARIOS</h3>
                <button
                  onClick={() => setMostrarFormularioExamen(true)}
                  disabled={!pacienteSeleccionado}
                  className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 disabled:opacity-50"
                >
                  Agregar Examen
                </button>
              </div>

              {/* Tabla de exámenes */}
              <div className="overflow-x-auto">
                <table className="min-w-full border border-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="border border-gray-200 px-3 py-2 text-left text-xs font-medium text-gray-500">Fecha</th>
                      <th className="border border-gray-200 px-3 py-2 text-left text-xs font-medium text-gray-500">Diagnóstico</th>
                      <th className="border border-gray-200 px-3 py-2 text-left text-xs font-medium text-gray-500">Plan de Tratamiento</th>
                      <th className="border border-gray-200 px-3 py-2 text-left text-xs font-medium text-gray-500">Presupuesto</th>
                      <th className="border border-gray-200 px-3 py-2 text-left text-xs font-medium text-gray-500">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {examenes.map((examen) => (
                      <tr key={examen.id}>
                        <td className="border border-gray-200 px-3 py-2 text-sm">
                          {new Date(examen.fecha).toLocaleDateString()}
                        </td>
                        <td className="border border-gray-200 px-3 py-2 text-sm">
                          {examen.diagnostico || '-'}
                        </td>
                        <td className="border border-gray-200 px-3 py-2 text-sm">
                          {examen.planTratamiento?.descripcion || '-'}
                        </td>
                        <td className="border border-gray-200 px-3 py-2 text-sm">
                         
                          {examen.presupuesto ? `S/ ${Number(examen.presupuesto).toFixed(2)}` : '-'}
                        </td>
                        <td className="border border-gray-200 px-3 py-2 text-sm">
                          <button
                            onClick={() => editarExamen(examen)}
                            className="text-blue-600 hover:text-blue-900 mr-2"
                          >
                            Editar
                          </button>
                          <button
                            onClick={() => eliminarExamen(examen.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            Eliminar
                          </button>
                        </td>
                      </tr>
                    ))}
                    {examenes.length === 0 && (
                      <tr>
                        <td colSpan={5} className="border border-gray-200 px-3 py-4 text-center text-gray-500">
                          No hay exámenes registrados
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Sección Evolución */}
            <div className="mb-8">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-md font-semibold text-gray-800">EVOLUCIÓN</h3>
                <button
                  onClick={() => setMostrarFormularioEvolucion(true)}
                  disabled={!pacienteSeleccionado}
                  className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700 disabled:opacity-50"
                >
                  Agregar Evolución
                </button>
              </div>

              {/* Tabla de evolución */}
              <div className="overflow-x-auto">
                <table className="min-w-full border border-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="border border-gray-200 px-3 py-2 text-left text-xs font-medium text-gray-500">Fecha</th>
                      <th className="border border-gray-200 px-3 py-2 text-left text-xs font-medium text-gray-500">Tratamiento Realizado</th>
                      <th className="border border-gray-200 px-3 py-2 text-left text-xs font-medium text-gray-500">A Cuenta</th>
                      <th className="border border-gray-200 px-3 py-2 text-left text-xs font-medium text-gray-500">Saldo</th>
                      <th className="border border-gray-200 px-3 py-2 text-left text-xs font-medium text-gray-500">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {evoluciones.map((evolucion) => (
                      <tr key={evolucion.id}>
                        <td className="border border-gray-200 px-3 py-2 text-sm">
                          {new Date(evolucion.fecha).toLocaleDateString()}
                        </td>
                        <td className="border border-gray-200 px-3 py-2 text-sm">
                          {evolucion.tratamientoRealizado}
                        </td>
                        <td className="border border-gray-200 px-3 py-2 text-sm">
                          S/ {Number(evolucion.aCuenta || 0).toFixed(2)}
                        
                        </td>
                        <td className="border border-gray-200 px-3 py-2 text-sm">
                          S/ {Number(evolucion.saldo || 0).toFixed(2)}
                        </td>
                        <td className="border border-gray-200 px-3 py-2 text-sm">
                          <button
                            onClick={() => editarEvolucion(evolucion)}
                            className="text-blue-600 hover:text-blue-900 mr-2"
                          >
                            Editar
                          </button>
                          <button
                            onClick={() => eliminarEvolucion(evolucion.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            Eliminar
                          </button>
                        </td>
                      </tr>
                    ))}
                    {evoluciones.length === 0 && (
                      <tr>
                        <td colSpan={5} className="border border-gray-200 px-3 py-4 text-center text-gray-500">
                          No hay evoluciones registradas
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Botones de acción principales */}
            <ActionButtons
              pacienteSeleccionado={pacienteSeleccionado}
              loading={loading}
              onCancelar={cancelar}
              onGuardar={guardarPrincipal}
            />
          </div>
        </div>
      </div>

      {/* Modal Formulario Examen */}
      {mostrarFormularioExamen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg max-w-md w-full mx-4">
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-4">
                {examenEditando ? 'Editar Examen' : 'Nuevo Examen'}
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Fecha:</label>
                  <input
                    type="date"
                    name="fecha"
                    value={formExamen.fecha}
                    onChange={handleExamenChange}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Examen Clínico General:</label>
                  <textarea
                    name="examenClinicoGeneral"
                    value={formExamen.examenClinicoGeneral}
                    onChange={handleExamenChange}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                    rows={3}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Diagnóstico:</label>
                  <textarea
                    name="diagnostico"
                    value={formExamen.diagnostico}
                    onChange={handleExamenChange}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                    rows={3}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Plan de Tratamiento:</label>
                  <select
                    name="idPlanesTratamiento"
                    value={formExamen.idPlanesTratamiento}
                    onChange={handleExamenChange}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                  >
                    <option value="">Seleccionar plan...</option>
                    {planes.map((plan) => (
                      <option key={plan.id} value={plan.id}>
                        {/* {plan.descripcion.substring(0, 50)}... (S/ {plan.costoTotal.toFixed(2)}) */}
                        {plan.descripcion.substring(0, 50)}... (S/ {Number(plan.costoTotal || 0).toFixed(2)})
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Presupuesto:</label>
                  <input
                    type="number"
                    name="presupuesto"
                    value={formExamen.presupuesto}
                    onChange={handleExamenChange}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                    step="0.01"
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div className="flex space-x-3 mt-6">
                <button
                  onClick={cancelarFormularioExamen}
                  className="flex-1 border border-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  onClick={guardarExamen}
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

      {/* Modal Formulario Evolución */}
      {mostrarFormularioEvolucion && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg max-w-md w-full mx-4">
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-4">
                {evolucionEditando ? 'Editar Evolución' : 'Nueva Evolución'}
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Fecha:</label>
                  <input
                    type="date"
                    name="fecha"
                    value={formEvolucion.fecha}
                    onChange={handleEvolucionChange}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tratamiento Realizado:</label>
                  <textarea
                    name="tratamientoRealizado"
                    value={formEvolucion.tratamientoRealizado}
                    onChange={handleEvolucionChange}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                    rows={3}
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Plan de Tratamiento:</label>
                  <select
                    name="idPlanesTratamiento"
                    value={formEvolucion.idPlanesTratamiento}
                    onChange={handleEvolucionChange}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                  >
                    <option value="">Seleccionar plan...</option>
                    {planes.map((plan) => (
                      <option key={plan.id} value={plan.id}>
                       
                        {plan.descripcion.substring(0, 50)}... (S/ {Number(plan.costoTotal || 0).toFixed(2)})
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">A Cuenta:</label>
                    <input
                      type="number"
                      name="aCuenta"
                      value={formEvolucion.aCuenta}
                      onChange={handleEvolucionChange}
                      className="w-full border border-gray-300 rounded-md px-3 py-2"
                      step="0.01"
                      placeholder="0.00"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Saldo:</label>
                    <input
                      type="number"
                      name="saldo"
                      value={formEvolucion.saldo}
                      onChange={handleEvolucionChange}
                      className="w-full border border-gray-300 rounded-md px-3 py-2"
                      step="0.01"
                      placeholder="0.00"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Observaciones:</label>
                  <textarea
                    name="observaciones"
                    value={formEvolucion.observaciones}
                    onChange={handleEvolucionChange}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                    rows={2}
                  />
                </div>
              </div>

              <div className="flex space-x-3 mt-6">
                <button
                  onClick={cancelarFormularioEvolucion}
                  className="flex-1 border border-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  onClick={guardarEvolucion}
                  disabled={loading}
                  className="flex-1 bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 disabled:opacity-50"
                >
                  {loading ? 'Guardando...' : 'Guardar'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}