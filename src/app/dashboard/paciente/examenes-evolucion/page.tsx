// // app/dashboard/paciente/examenes-evolucion/page.tsx
// 'use client'
// import { useState, useEffect } from 'react'
// import { usePaciente } from '../hooks/usePaciente'
// import TabNavigation from '../components/TabNavigation'
// import ActionButtons from '../components/ActionButtons'

// // Interfaces para los datos
// interface PlanTratamiento {
//   id: string
//   descripcion: string
//   costoTotal: number
// }

// interface ExamenOdontologico {
//   id: string
//   fecha: string
//   examenClinicoGeneral: string | null
//   diagnostico: string | null
//   presupuesto: number | null
//   planTratamiento: PlanTratamiento | null
// }

// interface EvolucionPaciente {
//   id: string
//   fecha: string
//   tratamientoRealizado: string
//   aCuenta: number
//   saldo: number
//   observaciones: string | null
//   planTratamiento: PlanTratamiento | null
// }

// export default function ExamenesEvolucionPage() {
//   // Hook personalizado para manejar el paciente
//   const {
//     pacienteSeleccionado,
//     buscarDni,
//     setBuscarDni,
//     loading,
//     setLoading,
//     error,
//     setError,
//     buscarPaciente
//   } = usePaciente()

//   // Estados para fecha y número de ficha
//   const [fechaIngreso, setFechaIngreso] = useState('')
//   const [numeroFicha, setNumeroFicha] = useState('')

//   // Estados para planes de tratamiento
//   const [planes, setPlanes] = useState<PlanTratamiento[]>([])

//   // Estados para exámenes odontológicos
//   const [examenes, setExamenes] = useState<ExamenOdontologico[]>([])
//   const [mostrarFormularioExamen, setMostrarFormularioExamen] = useState(false)
//   const [examenEditando, setExamenEditando] = useState<ExamenOdontologico | null>(null)
//   const [formExamen, setFormExamen] = useState({
//     fecha: '',
//     examenClinicoGeneral: '',
//     diagnostico: '',
//     presupuesto: '',
//     idPlanesTratamiento: ''
//   })

//   // Estados para evolución
//   const [evoluciones, setEvoluciones] = useState<EvolucionPaciente[]>([])
//   const [mostrarFormularioEvolucion, setMostrarFormularioEvolucion] = useState(false)
//   const [evolucionEditando, setEvolucionEditando] = useState<EvolucionPaciente | null>(null)
//   const [formEvolucion, setFormEvolucion] = useState({
//     fecha: '',
//     tratamientoRealizado: '',
//     aCuenta: '',
//     saldo: '',
//     observaciones: '',
//     idPlanesTratamiento: ''
//   })

//   // Cargar fecha actual y próximo número de ficha al iniciar
//   useEffect(() => {
//     const fechaActual = new Date().toISOString().split('T')[0];
//     setFechaIngreso(fechaActual);
//     obtenerProximoNumeroFicha();
//     cargarPlanes();
//   }, []);

//   // Cargar datos cuando se selecciona un paciente
//   useEffect(() => {
//     if (pacienteSeleccionado) {
//       cargarExamenes(pacienteSeleccionado.id);
//       cargarEvoluciones(pacienteSeleccionado.id);
//     }
//   }, [pacienteSeleccionado]);

//   // Función para obtener el próximo número de ficha
//   const obtenerProximoNumeroFicha = async () => {
//     try {
//       const response = await fetch('/api/ficha/proximo-numero');
//       const data = await response.json();
//       if (response.ok) {
//         setNumeroFicha(data.proximoNumero);
//       }
//     } catch (error) {
//       console.error('Error al obtener próximo número de ficha:', error);
//     }
//   };

//   // Función para cargar planes de tratamiento
//   const cargarPlanes = async () => {
//     try {
//       const response = await fetch('/api/planes-tratamiento');
//       const data = await response.json();
//       if (response.ok) {
//         setPlanes(data.planes);
//       }
//     } catch (error) {
//       console.error('Error al cargar planes:', error);
//     }
//   };

//   // Función para cargar exámenes odontológicos
//   const cargarExamenes = async (pacienteId: string) => {
//     try {
//       const response = await fetch(`/api/ficha/examenes-odontologicos?pacienteId=${pacienteId}`);
//       const data = await response.json();
//       if (response.ok) {
//         setExamenes(data.examenes);
//       }
//     } catch (error) {
//       console.error('Error al cargar exámenes:', error);
//     }
//   };

//   // Función para cargar evoluciones
//   const cargarEvoluciones = async (pacienteId: string) => {
//     try {
//       const response = await fetch(`/api/ficha/evolucion-paciente?pacienteId=${pacienteId}`);
//       const data = await response.json();
//       if (response.ok) {
//         setEvoluciones(data.evoluciones);
//       }
//     } catch (error) {
//       console.error('Error al cargar evoluciones:', error);
//     }
//   };

//   // Manejar cambios en formulario de examen
//   const handleExamenChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
//     const { name, value } = e.target;
//     setFormExamen(prev => ({ ...prev, [name]: value }));
//   };

//   // Manejar cambios en formulario de evolución
//   const handleEvolucionChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
//     const { name, value } = e.target;
//     setFormEvolucion(prev => ({ ...prev, [name]: value }));
//   };

//   // Guardar examen odontológico
//   const guardarExamen = async () => {
//     if (!pacienteSeleccionado) {
//       setError('Primero debe seleccionar un paciente');
//       return;
//     }

//     if (!formExamen.fecha) {
//       setError('La fecha es requerida');
//       return;
//     }

//     setLoading(true);
//     try {
//       const method = examenEditando ? 'PUT' : 'POST';
//       const url = examenEditando 
//         ? `/api/ficha/examenes-odontologicos?id=${examenEditando.id}`
//         : '/api/ficha/examenes-odontologicos';

//       const response = await fetch(url, {
//         method,
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({
//           pacienteId: pacienteSeleccionado.id,
//           ...formExamen
//         })
//       });

//       if (response.ok) {
//         alert(examenEditando ? 'Examen actualizado' : 'Examen creado');
//         cancelarFormularioExamen();
//         cargarExamenes(pacienteSeleccionado.id);
//       } else {
//         const data = await response.json();
//         setError(data.error);
//       }
//     } catch (error) {
//       setError('Error al guardar examen');
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Guardar evolución
//   const guardarEvolucion = async () => {
//     if (!pacienteSeleccionado) {
//       setError('Primero debe seleccionar un paciente');
//       return;
//     }

//     if (!formEvolucion.fecha || !formEvolucion.tratamientoRealizado) {
//       setError('Fecha y tratamiento realizado son requeridos');
//       return;
//     }

//     setLoading(true);
//     try {
//       const method = evolucionEditando ? 'PUT' : 'POST';
//       const url = evolucionEditando 
//         ? `/api/ficha/evolucion-paciente?id=${evolucionEditando.id}`
//         : '/api/ficha/evolucion-paciente';

//       const response = await fetch(url, {
//         method,
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({
//           pacienteId: pacienteSeleccionado.id,
//           ...formEvolucion
//         })
//       });

//       if (response.ok) {
//         alert(evolucionEditando ? 'Evolución actualizada' : 'Evolución creada');
//         cancelarFormularioEvolucion();
//         cargarEvoluciones(pacienteSeleccionado.id);
//       } else {
//         const data = await response.json();
//         setError(data.error);
//       }
//     } catch (error) {
//       setError('Error al guardar evolución');
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Editar examen
//   const editarExamen = (examen: ExamenOdontologico) => {
//     setExamenEditando(examen);
//     setFormExamen({
//       fecha: new Date(examen.fecha).toISOString().split('T')[0],
//       examenClinicoGeneral: examen.examenClinicoGeneral || '',
//       diagnostico: examen.diagnostico || '',
//       presupuesto: examen.presupuesto?.toString() || '',
//       idPlanesTratamiento: examen.planTratamiento?.id || ''
//     });
//     setMostrarFormularioExamen(true);
//   };

//   // Editar evolución
//   const editarEvolucion = (evolucion: EvolucionPaciente) => {
//     setEvolucionEditando(evolucion);
//     setFormEvolucion({
//       fecha: new Date(evolucion.fecha).toISOString().split('T')[0],
//       tratamientoRealizado: evolucion.tratamientoRealizado,
//       aCuenta: evolucion.aCuenta.toString(),
//       saldo: evolucion.saldo.toString(),
//       observaciones: evolucion.observaciones || '',
//       idPlanesTratamiento: evolucion.planTratamiento?.id || ''
//     });
//     setMostrarFormularioEvolucion(true);
//   };

//   // Eliminar examen
//   const eliminarExamen = async (id: string) => {
//     if (!confirm('¿Eliminar este examen?')) return;
    
//     setLoading(true);
//     try {
//       const response = await fetch(`/api/ficha/examenes-odontologicos?id=${id}`, {
//         method: 'DELETE'
//       });
      
//       if (response.ok) {
//         alert('Examen eliminado');
//         cargarExamenes(pacienteSeleccionado!.id);
//       }
//     } catch (error) {
//       setError('Error al eliminar examen');
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Eliminar evolución
//   const eliminarEvolucion = async (id: string) => {
//     if (!confirm('¿Eliminar esta evolución?')) return;
    
//     setLoading(true);
//     try {
//       const response = await fetch(`/api/ficha/evolucion-paciente?id=${id}`, {
//         method: 'DELETE'
//       });
      
//       if (response.ok) {
//         alert('Evolución eliminada');
//         cargarEvoluciones(pacienteSeleccionado!.id);
//       }
//     } catch (error) {
//       setError('Error al eliminar evolución');
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Cancelar formularios
//   const cancelarFormularioExamen = () => {
//     setMostrarFormularioExamen(false);
//     setExamenEditando(null);
//     setFormExamen({
//       fecha: '',
//       examenClinicoGeneral: '',
//       diagnostico: '',
//       presupuesto: '',
//       idPlanesTratamiento: ''
//     });
//   };

//   const cancelarFormularioEvolucion = () => {
//     setMostrarFormularioEvolucion(false);
//     setEvolucionEditando(null);
//     setFormEvolucion({
//       fecha: '',
//       tratamientoRealizado: '',
//       aCuenta: '',
//       saldo: '',
//       observaciones: '',
//       idPlanesTratamiento: ''
//     });
//   };

//   // Función principal de cancelar para el botón
//   const cancelar = () => {
//     setError('');
//   };

//   // Función de guardar principal (no hace nada específico en este tab)
//   const guardarPrincipal = () => {
//     alert('Use los botones específicos de cada sección');
//   };

//   return (
//     <div className="min-h-screen bg-gray-50 p-6">
//       {/* Header */}
//       <div className="max-w-7xl mx-auto">
//         <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
//           <div className="flex items-center justify-between">
//             <div>
//               <h1 className="text-2xl font-semibold text-gray-900">CLÍNICA DENTAL SONRÍE</h1>
//             </div>
//             <div className="flex items-center space-x-4">
//               <div className="text-sm text-gray-600">
//                 N° de Ficha: 
//                 <input 
//                   type="text" 
//                   value={numeroFicha}
//                   className="ml-2 border rounded px-2 py-1 w-24 bg-gray-100"
//                   readOnly
//                 />
//               </div>
//               <div className="text-sm text-gray-600">
//                 Fecha de Ingreso:
//                 <input 
//                   type="date" 
//                   value={fechaIngreso}
//                   className="ml-2 border rounded px-2 py-1 bg-gray-100"
//                   readOnly
//                 />
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>

//       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
//         {/* Buscador de paciente */}
//         <div className="bg-white rounded-lg shadow-sm border mb-6 p-4">
//           <div className="flex items-center space-x-4">
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-1">
//                 Buscar Paciente por DNI:
//               </label>
//               <input
//                 type="text"
//                 value={buscarDni}
//                 onChange={(e) => setBuscarDni(e.target.value)}
//                 className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
//                 placeholder="Ingrese DNI"
//               />
//             </div>
//             <button
//               onClick={buscarPaciente}
//               disabled={loading}
//               className="bg-gray-800 text-white px-4 py-2 rounded-md hover:bg-gray-700 disabled:opacity-50 mt-6"
//             >
//               {loading ? 'Buscando...' : 'Buscar'}
//             </button>
//             <div className="text-sm text-gray-600 mt-6">
//               Paciente: {pacienteSeleccionado ? `${pacienteSeleccionado.nombres} ${pacienteSeleccionado.apellidos}` : 'No seleccionado'}
//             </div>
//           </div>
//           {error && <div className="mt-2 text-red-600 text-sm">{error}</div>}
//         </div>

//         {/* Contenedor principal */}
//         <div className="bg-white rounded-lg shadow-sm border mb-6">
//           <TabNavigation pacienteSeleccionado={pacienteSeleccionado} />

//           <div className="p-6">
//             <h2 className="text-lg font-semibold text-gray-900 mb-6">6. EXÁMENES COMPLEMENTARIOS Y EVOLUCIÓN</h2>

//             {/* Sección Exámenes Complementarios */}
//             <div className="mb-8">
//               <div className="flex justify-between items-center mb-4">
//                 <h3 className="text-md font-semibold text-gray-800">EXÁMENES COMPLEMENTARIOS</h3>
//                 <button
//                   onClick={() => setMostrarFormularioExamen(true)}
//                   disabled={!pacienteSeleccionado}
//                   className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 disabled:opacity-50"
//                 >
//                   Agregar Examen
//                 </button>
//               </div>

//               {/* Tabla de exámenes */}
//               <div className="overflow-x-auto">
//                 <table className="min-w-full border border-gray-200">
//                   <thead className="bg-gray-50">
//                     <tr>
//                       <th className="border border-gray-200 px-3 py-2 text-left text-xs font-medium text-gray-500">Fecha</th>
//                       <th className="border border-gray-200 px-3 py-2 text-left text-xs font-medium text-gray-500">Diagnóstico</th>
//                       <th className="border border-gray-200 px-3 py-2 text-left text-xs font-medium text-gray-500">Plan de Tratamiento</th>
//                       <th className="border border-gray-200 px-3 py-2 text-left text-xs font-medium text-gray-500">Presupuesto</th>
//                       <th className="border border-gray-200 px-3 py-2 text-left text-xs font-medium text-gray-500">Acciones</th>
//                     </tr>
//                   </thead>
//                   <tbody>
//                     {examenes.map((examen) => (
//                       <tr key={examen.id}>
//                         <td className="border border-gray-200 px-3 py-2 text-sm">
//                           {new Date(examen.fecha).toLocaleDateString()}
//                         </td>
//                         <td className="border border-gray-200 px-3 py-2 text-sm">
//                           {examen.diagnostico || '-'}
//                         </td>
//                         <td className="border border-gray-200 px-3 py-2 text-sm">
//                           {examen.planTratamiento?.descripcion || '-'}
//                         </td>
//                         <td className="border border-gray-200 px-3 py-2 text-sm">
                         
//                           {examen.presupuesto ? `S/ ${Number(examen.presupuesto).toFixed(2)}` : '-'}
//                         </td>
//                         <td className="border border-gray-200 px-3 py-2 text-sm">
//                           <button
//                             onClick={() => editarExamen(examen)}
//                             className="text-blue-600 hover:text-blue-900 mr-2"
//                           >
//                             Editar
//                           </button>
//                           <button
//                             onClick={() => eliminarExamen(examen.id)}
//                             className="text-red-600 hover:text-red-900"
//                           >
//                             Eliminar
//                           </button>
//                         </td>
//                       </tr>
//                     ))}
//                     {examenes.length === 0 && (
//                       <tr>
//                         <td colSpan={5} className="border border-gray-200 px-3 py-4 text-center text-gray-500">
//                           No hay exámenes registrados
//                         </td>
//                       </tr>
//                     )}
//                   </tbody>
//                 </table>
//               </div>
//             </div>

//             {/* Sección Evolución */}
//             <div className="mb-8">
//               <div className="flex justify-between items-center mb-4">
//                 <h3 className="text-md font-semibold text-gray-800">EVOLUCIÓN</h3>
//                 <button
//                   onClick={() => setMostrarFormularioEvolucion(true)}
//                   disabled={!pacienteSeleccionado}
//                   className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700 disabled:opacity-50"
//                 >
//                   Agregar Evolución
//                 </button>
//               </div>

//               {/* Tabla de evolución */}
//               <div className="overflow-x-auto">
//                 <table className="min-w-full border border-gray-200">
//                   <thead className="bg-gray-50">
//                     <tr>
//                       <th className="border border-gray-200 px-3 py-2 text-left text-xs font-medium text-gray-500">Fecha</th>
//                       <th className="border border-gray-200 px-3 py-2 text-left text-xs font-medium text-gray-500">Tratamiento Realizado</th>
//                       <th className="border border-gray-200 px-3 py-2 text-left text-xs font-medium text-gray-500">A Cuenta</th>
//                       <th className="border border-gray-200 px-3 py-2 text-left text-xs font-medium text-gray-500">Saldo</th>
//                       <th className="border border-gray-200 px-3 py-2 text-left text-xs font-medium text-gray-500">Acciones</th>
//                     </tr>
//                   </thead>
//                   <tbody>
//                     {evoluciones.map((evolucion) => (
//                       <tr key={evolucion.id}>
//                         <td className="border border-gray-200 px-3 py-2 text-sm">
//                           {new Date(evolucion.fecha).toLocaleDateString()}
//                         </td>
//                         <td className="border border-gray-200 px-3 py-2 text-sm">
//                           {evolucion.tratamientoRealizado}
//                         </td>
//                         <td className="border border-gray-200 px-3 py-2 text-sm">
//                           S/ {Number(evolucion.aCuenta || 0).toFixed(2)}
                        
//                         </td>
//                         <td className="border border-gray-200 px-3 py-2 text-sm">
//                           S/ {Number(evolucion.saldo || 0).toFixed(2)}
//                         </td>
//                         <td className="border border-gray-200 px-3 py-2 text-sm">
//                           <button
//                             onClick={() => editarEvolucion(evolucion)}
//                             className="text-blue-600 hover:text-blue-900 mr-2"
//                           >
//                             Editar
//                           </button>
//                           <button
//                             onClick={() => eliminarEvolucion(evolucion.id)}
//                             className="text-red-600 hover:text-red-900"
//                           >
//                             Eliminar
//                           </button>
//                         </td>
//                       </tr>
//                     ))}
//                     {evoluciones.length === 0 && (
//                       <tr>
//                         <td colSpan={5} className="border border-gray-200 px-3 py-4 text-center text-gray-500">
//                           No hay evoluciones registradas
//                         </td>
//                       </tr>
//                     )}
//                   </tbody>
//                 </table>
//               </div>
//             </div>

//             {/* Botones de acción principales */}
//             <ActionButtons
//               pacienteSeleccionado={pacienteSeleccionado}
//               loading={loading}
//               onCancelar={cancelar}
//               onGuardar={guardarPrincipal}
//             />
//           </div>
//         </div>
//       </div>

//       {/* Modal Formulario Examen */}
//       {mostrarFormularioExamen && (
//         <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
//           <div className="bg-white rounded-lg shadow-lg max-w-md w-full mx-4">
//             <div className="p-6">
//               <h3 className="text-lg font-semibold mb-4">
//                 {examenEditando ? 'Editar Examen' : 'Nuevo Examen'}
//               </h3>
              
//               <div className="space-y-4">
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-1">Fecha:</label>
//                   <input
//                     type="date"
//                     name="fecha"
//                     value={formExamen.fecha}
//                     onChange={handleExamenChange}
//                     className="w-full border border-gray-300 rounded-md px-3 py-2"
//                   />
//                 </div>
                
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-1">Examen Clínico General:</label>
//                   <textarea
//                     name="examenClinicoGeneral"
//                     value={formExamen.examenClinicoGeneral}
//                     onChange={handleExamenChange}
//                     className="w-full border border-gray-300 rounded-md px-3 py-2"
//                     rows={3}
//                   />
//                 </div>
                
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-1">Diagnóstico:</label>
//                   <textarea
//                     name="diagnostico"
//                     value={formExamen.diagnostico}
//                     onChange={handleExamenChange}
//                     className="w-full border border-gray-300 rounded-md px-3 py-2"
//                     rows={3}
//                   />
//                 </div>
                
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-1">Plan de Tratamiento:</label>
//                   <select
//                     name="idPlanesTratamiento"
//                     value={formExamen.idPlanesTratamiento}
//                     onChange={handleExamenChange}
//                     className="w-full border border-gray-300 rounded-md px-3 py-2"
//                   >
//                     <option value="">Seleccionar plan...</option>
//                     {planes.map((plan) => (
//                       <option key={plan.id} value={plan.id}>
//                         {/* {plan.descripcion.substring(0, 50)}... (S/ {plan.costoTotal.toFixed(2)}) */}
//                         {plan.descripcion.substring(0, 50)}... (S/ {Number(plan.costoTotal || 0).toFixed(2)})
//                       </option>
//                     ))}
//                   </select>
//                 </div>
                
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-1">Presupuesto:</label>
//                   <input
//                     type="number"
//                     name="presupuesto"
//                     value={formExamen.presupuesto}
//                     onChange={handleExamenChange}
//                     className="w-full border border-gray-300 rounded-md px-3 py-2"
//                     step="0.01"
//                     placeholder="0.00"
//                   />
//                 </div>
//               </div>

//               <div className="flex space-x-3 mt-6">
//                 <button
//                   onClick={cancelarFormularioExamen}
//                   className="flex-1 border border-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-50"
//                 >
//                   Cancelar
//                 </button>
//                 <button
//                   onClick={guardarExamen}
//                   disabled={loading}
//                   className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
//                 >
//                   {loading ? 'Guardando...' : 'Guardar'}
//                 </button>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Modal Formulario Evolución */}
//       {mostrarFormularioEvolucion && (
//         <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
//           <div className="bg-white rounded-lg shadow-lg max-w-md w-full mx-4">
//             <div className="p-6">
//               <h3 className="text-lg font-semibold mb-4">
//                 {evolucionEditando ? 'Editar Evolución' : 'Nueva Evolución'}
//               </h3>
              
//               <div className="space-y-4">
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-1">Fecha:</label>
//                   <input
//                     type="date"
//                     name="fecha"
//                     value={formEvolucion.fecha}
//                     onChange={handleEvolucionChange}
//                     className="w-full border border-gray-300 rounded-md px-3 py-2"
//                   />
//                 </div>
                
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-1">Tratamiento Realizado:</label>
//                   <textarea
//                     name="tratamientoRealizado"
//                     value={formEvolucion.tratamientoRealizado}
//                     onChange={handleEvolucionChange}
//                     className="w-full border border-gray-300 rounded-md px-3 py-2"
//                     rows={3}
//                     required
//                   />
//                 </div>
                
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-1">Plan de Tratamiento:</label>
//                   <select
//                     name="idPlanesTratamiento"
//                     value={formEvolucion.idPlanesTratamiento}
//                     onChange={handleEvolucionChange}
//                     className="w-full border border-gray-300 rounded-md px-3 py-2"
//                   >
//                     <option value="">Seleccionar plan...</option>
//                     {planes.map((plan) => (
//                       <option key={plan.id} value={plan.id}>
                       
//                         {plan.descripcion.substring(0, 50)}... (S/ {Number(plan.costoTotal || 0).toFixed(2)})
//                       </option>
//                     ))}
//                   </select>
//                 </div>
                
//                 <div className="grid grid-cols-2 gap-4">
//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-1">A Cuenta:</label>
//                     <input
//                       type="number"
//                       name="aCuenta"
//                       value={formEvolucion.aCuenta}
//                       onChange={handleEvolucionChange}
//                       className="w-full border border-gray-300 rounded-md px-3 py-2"
//                       step="0.01"
//                       placeholder="0.00"
//                     />
//                   </div>
//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-1">Saldo:</label>
//                     <input
//                       type="number"
//                       name="saldo"
//                       value={formEvolucion.saldo}
//                       onChange={handleEvolucionChange}
//                       className="w-full border border-gray-300 rounded-md px-3 py-2"
//                       step="0.01"
//                       placeholder="0.00"
//                     />
//                   </div>
//                 </div>
                
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-1">Observaciones:</label>
//                   <textarea
//                     name="observaciones"
//                     value={formEvolucion.observaciones}
//                     onChange={handleEvolucionChange}
//                     className="w-full border border-gray-300 rounded-md px-3 py-2"
//                     rows={2}
//                   />
//                 </div>
//               </div>

//               <div className="flex space-x-3 mt-6">
//                 <button
//                   onClick={cancelarFormularioEvolucion}
//                   className="flex-1 border border-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-50"
//                 >
//                   Cancelar
//                 </button>
//                 <button
//                   onClick={guardarEvolucion}
//                   disabled={loading}
//                   className="flex-1 bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 disabled:opacity-50"
//                 >
//                   {loading ? 'Guardando...' : 'Guardar'}
//                 </button>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   )
// }

// app/dashboard/paciente/examenes-evolucion/page.tsx
'use client'
import { useState, useEffect } from 'react'
import { usePaciente } from '../hooks/usePaciente'
import TabNavigation from '../components/TabNavigation'
import ActionButtons from '../components/ActionButtons'
import { FileText, Search, Users, Calendar, Plus, Edit, Trash2, User, DollarSign } from 'lucide-react'

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
    <div className="space-y-4">
      {/* Header compacto */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-3 border-b border-slate-200">
        <div className="flex items-center space-x-2">
          <div className="p-1.5 bg-emerald-100 rounded-lg">
            <Users className="h-4 w-4 text-emerald-600" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900">CLÍNICA DENTAL SONRÍE</h1>
            <p className="text-xs text-slate-600">Exámenes complementarios y evolución</p>
          </div>
        </div>
        
        {/* Info de ficha y fecha */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 text-xs">
          <div className="flex items-center space-x-1">
            <FileText className="h-3 w-3 text-slate-500" />
            <span className="font-medium text-slate-700">Ficha:</span>
            <input
              type="text"
              value={numeroFicha}
              className="border border-slate-300 rounded px-2 py-1 w-16 bg-slate-100 text-center text-xs font-medium"
              readOnly
            />
          </div>
          
          <div className="flex items-center space-x-1">
            <Calendar className="h-3 w-3 text-slate-500" />
            <span className="font-medium text-slate-700">Fecha:</span>
            <input
              type="date"
              value={fechaIngreso}
              className="border border-slate-300 rounded px-2 py-1 bg-slate-100 text-xs font-medium"
              readOnly
            />
          </div>
        </div>
      </div>

      {/* Buscador compacto */}
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4">
        <div className="space-y-3">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <div className="flex-1 w-full">
              <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center space-x-1">
                <Search className="h-3 w-3 text-slate-500" />
                <span>Buscar Paciente por DNI:</span>
              </label>
              <input
                type="text"
                value={buscarDni}
                onChange={(e) => setBuscarDni(e.target.value)}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors duration-200"
                placeholder="Ingrese DNI"
              />
            </div>
            
            <button
              onClick={buscarPaciente}
              disabled={loading}
              className="w-full sm:w-auto bg-slate-800 text-white px-4 py-2 rounded-lg hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 text-sm font-medium"
            >
              {loading ? 'Buscando...' : 'Buscar'}
            </button>
          </div>
          
          <div className="flex items-center space-x-2 text-xs bg-slate-50 rounded-lg p-2">
            <User className="h-3 w-3 text-slate-500" />
            <span className="font-medium text-slate-700">Paciente:</span>
            <span className="text-slate-900">
              {pacienteSeleccionado ? `${pacienteSeleccionado.nombres} ${pacienteSeleccionado.apellidos}` : 'No seleccionado'}
            </span>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-400 p-3 rounded-lg mt-3">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-4 w-4 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-2">
                <p className="text-red-700 text-xs font-medium">{error}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Contenedor principal */}
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
        <TabNavigation pacienteSeleccionado={pacienteSeleccionado} />

        <div className="p-4">
          <div className="flex items-center space-x-2 mb-6">
            <div className="p-1 bg-slate-100 rounded">
              <FileText className="h-4 w-4 text-slate-600" />
            </div>
            <h2 className="text-base font-bold text-slate-900">6. EXÁMENES COMPLEMENTARIOS Y EVOLUCIÓN</h2>
          </div>

          {/* Sección Exámenes Complementarios */}
          <div className="mb-8">
            <div className="bg-white rounded-xl lg:rounded-2xl shadow-sm border border-slate-200/60 overflow-hidden max-w-full">
              <div className="px-3 lg:px-5 py-3 lg:py-4 border-b border-slate-100 bg-gradient-to-r from-slate-50/50 to-slate-50/30">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div>
                    <h3 className="text-sm lg:text-base font-bold text-slate-900">EXÁMENES COMPLEMENTARIOS</h3>
                    <p className="text-xs text-slate-600">Total: {examenes.length} exámenes</p>
                  </div>
                  <button
                    onClick={() => setMostrarFormularioExamen(true)}
                    disabled={!pacienteSeleccionado}
                    className="flex items-center space-x-2 bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 text-sm font-medium"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Agregar Examen</span>
                  </button>
                </div>
              </div>
              
              <div className="p-3 lg:p-5">
                {/* Vista de escritorio - Tabla completa */}
                <div className="hidden xl:block overflow-x-auto max-w-full">
                  <table className="w-full table-fixed">
                    <thead>
                      <tr className="border-b border-slate-200">
                        <th className="px-3 py-2 text-left text-xs font-bold text-slate-600 uppercase tracking-wider w-20">
                          Fecha
                        </th>
                        <th className="px-3 py-2 text-left text-xs font-bold text-slate-600 uppercase tracking-wider w-1/4">
                          Diagnóstico
                        </th>
                        <th className="px-3 py-2 text-left text-xs font-bold text-slate-600 uppercase tracking-wider w-1/3">
                          Plan de Tratamiento
                        </th>
                        <th className="px-3 py-2 text-left text-xs font-bold text-slate-600 uppercase tracking-wider w-20">
                          Presupuesto
                        </th>
                        <th className="px-3 py-2 text-left text-xs font-bold text-slate-600 uppercase tracking-wider w-24">
                          Acciones
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {examenes.map((examen) => (
                        <tr key={examen.id} className="hover:bg-slate-50/50 transition-colors duration-200">
                          <td className="px-3 py-3">
                            <span className="text-xs font-medium text-slate-900 whitespace-nowrap">
                              {new Date(examen.fecha).toLocaleDateString()}
                            </span>
                          </td>
                          <td className="px-3 py-3">
                            <span className="text-sm text-slate-900 truncate block">
                              {examen.diagnostico || '-'}
                            </span>
                          </td>
                          <td className="px-3 py-3">
                            <span className="text-sm text-slate-600 truncate block">
                              {examen.planTratamiento?.descripcion || '-'}
                            </span>
                          </td>
                          <td className="px-3 py-3">
                            <span className="text-sm font-medium text-slate-900 whitespace-nowrap">
                              {examen.presupuesto ? `S/ ${Number(examen.presupuesto).toFixed(2)}` : '-'}
                            </span>
                          </td>
                          <td className="px-3 py-3">
                            <div className="flex space-x-2">
                              <button
                                onClick={() => editarExamen(examen)}
                                className="text-blue-600 hover:text-blue-900 p-1"
                              >
                                <Edit className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => eliminarExamen(examen.id)}
                                className="text-red-600 hover:text-red-900 p-1"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                      {examenes.length === 0 && (
                        <tr>
                          <td colSpan={5} className="px-3 py-8 text-center text-slate-500">
                            <div className="p-3 bg-slate-100 rounded-full w-12 h-12 mx-auto mb-3 flex items-center justify-center">
                              <FileText className="h-6 w-6 text-slate-400" />
                            </div>
                            <p className="font-medium text-sm">No hay exámenes registrados</p>
                            <p className="text-xs mt-1">Agregue el primer examen complementario</p>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Vista móvil, tablet y laptop - Cards */}
                <div className="xl:hidden space-y-3">
                  {examenes.length === 0 ? (
                    <div className="text-center py-8">
                      <div className="p-3 bg-slate-100 rounded-full w-12 h-12 mx-auto mb-3 flex items-center justify-center">
                        <FileText className="h-6 w-6 text-slate-400" />
                      </div>
                      <p className="text-slate-600 font-medium text-sm">No hay exámenes registrados</p>
                      <p className="text-slate-500 text-xs mt-1">Agregue el primer examen complementario</p>
                    </div>
                  ) : (
                    examenes.map((examen) => (
                      <div key={examen.id} className="bg-slate-50/50 rounded-lg p-3 border border-slate-100 hover:shadow-md transition-all duration-200">
                        <div className="space-y-2">
                          {/* Header con fecha y acciones */}
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <div className="bg-slate-100 rounded-full p-2 flex-shrink-0">
                                <FileText className="h-3 w-3 text-slate-600" />
                              </div>
                              <div>
                                <p className="font-semibold text-slate-900 text-sm">
                                  Examen Complementario
                                </p>
                                <p className="text-xs text-slate-500">
                                  {new Date(examen.fecha).toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                            <div className="flex space-x-2">
                              <button
                                onClick={() => editarExamen(examen)}
                                className="text-blue-600 hover:text-blue-900 p-1"
                              >
                                <Edit className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => eliminarExamen(examen.id)}
                                className="text-red-600 hover:text-red-900 p-1"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                          
                          {/* Contenido principal */}
                          <div className="pl-9 space-y-1">
                            {examen.diagnostico && (
                              <div>
                                <span className="text-xs font-semibold text-slate-700">Diagnóstico:</span>
                                <span className="text-xs text-slate-900 ml-2">{examen.diagnostico}</span>
                              </div>
                            )}
                            {examen.planTratamiento && (
                              <div>
                                <span className="text-xs font-semibold text-slate-700">Plan:</span>
                                <span className="text-xs text-slate-600 ml-2">{examen.planTratamiento.descripcion}</span>
                              </div>
                            )}
                            {examen.presupuesto && (
                              <div>
                                <span className="text-xs font-semibold text-slate-700">Presupuesto:</span>
                                <span className="text-xs font-medium text-slate-900 ml-2">
                                  S/ {Number(examen.presupuesto).toFixed(2)}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Sección Evolución */}
          <div className="mb-8">
            <div className="bg-white rounded-xl lg:rounded-2xl shadow-sm border border-slate-200/60 overflow-hidden max-w-full">
              <div className="px-3 lg:px-5 py-3 lg:py-4 border-b border-slate-100 bg-gradient-to-r from-slate-50/50 to-slate-50/30">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div>
                    <h3 className="text-sm lg:text-base font-bold text-slate-900">EVOLUCIÓN</h3>
                    <p className="text-xs text-slate-600">Total: {evoluciones.length} registros</p>
                  </div>
                  <button
                    onClick={() => setMostrarFormularioEvolucion(true)}
                    disabled={!pacienteSeleccionado}
                    className="flex items-center space-x-2 bg-emerald-600 text-white px-3 py-2 rounded-lg hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 text-sm font-medium"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Agregar Evolución</span>
                  </button>
                </div>
              </div>
              
              <div className="p-3 lg:p-5">
                {/* Vista de escritorio - Tabla completa */}
                <div className="hidden xl:block overflow-x-auto max-w-full">
                  <table className="w-full table-fixed">
                    <thead>
                      <tr className="border-b border-slate-200">
                        <th className="px-3 py-2 text-left text-xs font-bold text-slate-600 uppercase tracking-wider w-20">
                          Fecha
                        </th>
                        <th className="px-3 py-2 text-left text-xs font-bold text-slate-600 uppercase tracking-wider w-1/3">
                          Tratamiento
                        </th>
                        <th className="px-3 py-2 text-left text-xs font-bold text-slate-600 uppercase tracking-wider w-20">
                          A Cuenta
                        </th>
                        <th className="px-3 py-2 text-left text-xs font-bold text-slate-600 uppercase tracking-wider w-20">
                          Saldo
                        </th>
                        <th className="px-3 py-2 text-left text-xs font-bold text-slate-600 uppercase tracking-wider w-24">
                          Acciones
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {evoluciones.map((evolucion) => (
                        <tr key={evolucion.id} className="hover:bg-slate-50/50 transition-colors duration-200">
                          <td className="px-3 py-3">
                            <span className="text-xs font-medium text-slate-900 whitespace-nowrap">
                              {new Date(evolucion.fecha).toLocaleDateString()}
                            </span>
                          </td>
                          <td className="px-3 py-3">
                            <span className="text-sm text-slate-900 truncate block">
                              {evolucion.tratamientoRealizado}
                            </span>
                          </td>
                          <td className="px-3 py-3">
                            <span className="text-sm font-medium text-emerald-600 whitespace-nowrap">
                              S/ {Number(evolucion.aCuenta || 0).toFixed(2)}
                            </span>
                          </td>
                          <td className="px-3 py-3">
                            <span className="text-sm font-medium text-slate-900 whitespace-nowrap">
                              S/ {Number(evolucion.saldo || 0).toFixed(2)}
                            </span>
                          </td>
                          <td className="px-3 py-3">
                            <div className="flex space-x-2">
                              <button
                                onClick={() => editarEvolucion(evolucion)}
                                className="text-blue-600 hover:text-blue-900 p-1"
                              >
                                <Edit className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => eliminarEvolucion(evolucion.id)}
                                className="text-red-600 hover:text-red-900 p-1"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                      {evoluciones.length === 0 && (
                        <tr>
                          <td colSpan={5} className="px-3 py-8 text-center text-slate-500">
                            <div className="p-3 bg-slate-100 rounded-full w-12 h-12 mx-auto mb-3 flex items-center justify-center">
                              <Users className="h-6 w-6 text-slate-400" />
                            </div>
                            <p className="font-medium text-sm">No hay evoluciones registradas</p>
                            <p className="text-xs mt-1">Agregue la primera evolución del paciente</p>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Vista móvil, tablet y laptop - Cards */}
                <div className="xl:hidden space-y-3">
                  {evoluciones.length === 0 ? (
                    <div className="text-center py-8">
                      <div className="p-3 bg-slate-100 rounded-full w-12 h-12 mx-auto mb-3 flex items-center justify-center">
                        <Users className="h-6 w-6 text-slate-400" />
                      </div>
                      <p className="text-slate-600 font-medium text-sm">No hay evoluciones registradas</p>
                      <p className="text-slate-500 text-xs mt-1">Agregue la primera evolución del paciente</p>
                    </div>
                  ) : (
                    evoluciones.map((evolucion) => (
                      <div key={evolucion.id} className="bg-slate-50/50 rounded-lg p-3 border border-slate-100 hover:shadow-md transition-all duration-200">
                        <div className="space-y-2">
                          {/* Header con fecha y acciones */}
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <div className="bg-slate-100 rounded-full p-2 flex-shrink-0">
                                <Users className="h-3 w-3 text-slate-600" />
                              </div>
                              <div>
                                <p className="font-semibold text-slate-900 text-sm">
                                  Evolución del Paciente
                                </p>
                                <p className="text-xs text-slate-500">
                                  {new Date(evolucion.fecha).toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                            <div className="flex space-x-2">
                              <button
                                onClick={() => editarEvolucion(evolucion)}
                                className="text-blue-600 hover:text-blue-900 p-1"
                              >
                                <Edit className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => eliminarEvolucion(evolucion.id)}
                                className="text-red-600 hover:text-red-900 p-1"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                          
                          {/* Contenido principal */}
                          <div className="pl-9 space-y-1">
                            <div>
                              <span className="text-xs font-semibold text-slate-700">Tratamiento:</span>
                              <span className="text-xs text-slate-900 ml-2">{evolucion.tratamientoRealizado}</span>
                            </div>
                            {evolucion.observaciones && (
                              <div>
                                <span className="text-xs font-semibold text-slate-700">Observaciones:</span>
                                <span className="text-xs text-slate-600 ml-2">{evolucion.observaciones}</span>
                              </div>
                            )}
                          </div>
                          
                          {/* Información financiera */}
                          <div className="pl-9 pt-2 border-t border-slate-200">
                            <div className="flex items-center justify-between text-xs">
                              <div className="flex items-center space-x-3">
                                <div className="flex items-center space-x-1">
                                  <DollarSign className="h-3 w-3 text-emerald-600" />
                                  <span className="font-semibold text-slate-700">A cuenta:</span>
                                  <span className="font-medium text-emerald-600">
                                    S/ {Number(evolucion.aCuenta || 0).toFixed(2)}
                                  </span>
                                </div>
                                <div className="flex items-center space-x-1">
                                  <DollarSign className="h-3 w-3 text-slate-600" />
                                  <span className="font-semibold text-slate-700">Saldo:</span>
                                  <span className="font-medium text-slate-900">
                                    S/ {Number(evolucion.saldo || 0).toFixed(2)}
                                  </span>
                                </div>
                              </div>
                            </div>
                            {evolucion.planTratamiento && (
                              <div className="mt-1">
                                <span className="text-xs font-semibold text-slate-700">Plan:</span>
                                <span className="text-xs text-slate-600 ml-1">{evolucion.planTratamiento.descripcion}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Botones de acción principales */}
          <div className="mt-5 pt-4 border-t border-slate-200">
            <ActionButtons
              pacienteSeleccionado={!!pacienteSeleccionado}
              loading={loading}
              onCancelar={cancelar}
              onGuardar={guardarPrincipal}
            />
          </div>
        </div>
      </div>

      {/* Modal Formulario Examen */}
      {mostrarFormularioExamen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-4 text-slate-900">
                {examenEditando ? 'Editar Examen' : 'Nuevo Examen'}
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Fecha:</label>
                  <input
                    type="date"
                    name="fecha"
                    value={formExamen.fecha}
                    onChange={handleExamenChange}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Examen Clínico General:</label>
                  <textarea
                    name="examenClinicoGeneral"
                    value={formExamen.examenClinicoGeneral}
                    onChange={handleExamenChange}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    rows={3}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Diagnóstico:</label>
                  <textarea
                    name="diagnostico"
                    value={formExamen.diagnostico}
                    onChange={handleExamenChange}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    rows={3}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Plan de Tratamiento:</label>
                  <select
                    name="idPlanesTratamiento"
                    value={formExamen.idPlanesTratamiento}
                    onChange={handleExamenChange}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Seleccionar plan...</option>
                    {planes.map((plan) => (
                      <option key={plan.id} value={plan.id}>
                        {plan.descripcion.substring(0, 50)}... (S/ {Number(plan.costoTotal || 0).toFixed(2)})
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Presupuesto:</label>
                  <input
                    type="number"
                    name="presupuesto"
                    value={formExamen.presupuesto}
                    onChange={handleExamenChange}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    step="0.01"
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div className="flex space-x-3 mt-6">
                <button
                  onClick={cancelarFormularioExamen}
                  className="flex-1 border border-slate-300 text-slate-700 px-4 py-2 rounded-lg hover:bg-slate-50 transition-colors duration-200"
                >
                  Cancelar
                </button>
                <button
                  onClick={guardarExamen}
                  disabled={loading}
                  className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors duration-200"
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
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-4 text-slate-900">
                {evolucionEditando ? 'Editar Evolución' : 'Nueva Evolución'}
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Fecha:</label>
                  <input
                    type="date"
                    name="fecha"
                    value={formEvolucion.fecha}
                    onChange={handleEvolucionChange}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Tratamiento Realizado:</label>
                  <textarea
                    name="tratamientoRealizado"
                    value={formEvolucion.tratamientoRealizado}
                    onChange={handleEvolucionChange}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    rows={3}
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Plan de Tratamiento:</label>
                  <select
                    name="idPlanesTratamiento"
                    value={formEvolucion.idPlanesTratamiento}
                    onChange={handleEvolucionChange}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
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
                    <label className="block text-sm font-medium text-slate-700 mb-1">A Cuenta:</label>
                    <input
                      type="number"
                      name="aCuenta"
                      value={formEvolucion.aCuenta}
                      onChange={handleEvolucionChange}
                      className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                      step="0.01"
                      placeholder="0.00"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Saldo:</label>
                    <input
                      type="number"
                      name="saldo"
                      value={formEvolucion.saldo}
                      onChange={handleEvolucionChange}
                      className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                      step="0.01"
                      placeholder="0.00"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Observaciones:</label>
                  <textarea
                    name="observaciones"
                    value={formEvolucion.observaciones}
                    onChange={handleEvolucionChange}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    rows={2}
                  />
                </div>
              </div>

              <div className="flex space-x-3 mt-6">
                <button
                  onClick={cancelarFormularioEvolucion}
                  className="flex-1 border border-slate-300 text-slate-700 px-4 py-2 rounded-lg hover:bg-slate-50 transition-colors duration-200"
                >
                  Cancelar
                </button>
                <button
                  onClick={guardarEvolucion}
                  disabled={loading}
                  className="flex-1 bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 disabled:opacity-50 transition-colors duration-200"
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