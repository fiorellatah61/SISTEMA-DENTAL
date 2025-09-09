// // app/dashboard/paciente/examen-clinico/page.tsx
// 'use client'
// import { useState, useEffect } from 'react'
// import { usePaciente } from '../hooks/usePaciente'
// import TabNavigation from '../components/TabNavigation'
// import ActionButtons from '../components/ActionButtons'

// export default function ExamenClinicoPage() {
//   // Hook personalizado para manejar el paciente
//   const {
//     pacienteSeleccionado,
//     buscarDni,
//     setBuscarDni,
//     loading,
//     setLoading,
//     error,
//     setError,
//     buscarPaciente,
//     limpiarPaciente
//   } = usePaciente()

//   // Estados para los campos del examen clínico
//   const [examenClinico, setExamenClinico] = useState({
//     // Examen Clínico General (se guarda en ExamenOdontologico)
//     examenClinicoGeneral: '',
    
//     // Examen Clínico Estomatológico (se guarda en ExamenClinicoEstomatologico)
//     ATM: '',
//     ganglios: '',
//     piel: '',
//     simetriaFacial: '',
//     glandulasSalivales: '',
//     encia: '',
//     vestibulo: '',
//     carrillo: '',
//     paladar: '',
//     orofaringe: '',
//     lengua: '',
//     pisoBoca: '',
//     oclusion: '',
//     observaciones: ''
//   })

//   // Estados para fecha y número de ficha (igual que en los otros tabs)
//   const [fechaIngreso, setFechaIngreso] = useState('')
//   const [numeroFicha, setNumeroFicha] = useState('')

//   // Cargar fecha actual y número de ficha al iniciar
//   useEffect(() => {
//     const fechaActual = new Date().toISOString().split('T')[0];
//     setFechaIngreso(fechaActual);
//     obtenerProximoNumeroFicha();
//   }, []);

//   // Cargar datos del examen clínico si hay paciente seleccionado
//   useEffect(() => {
//     if (pacienteSeleccionado) {
//       cargarExamenClinico(pacienteSeleccionado.id);
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

//   // Función para cargar el examen clínico existente
//   const cargarExamenClinico = async (pacienteId: string) => {
//     try {
//       const response = await fetch(`/api/ficha/examen-clinico?pacienteId=${pacienteId}`);
//       const data = await response.json();
      
//       if (response.ok) {
//         // Cargar los datos existentes en el estado
//         setExamenClinico({
//           // Datos del examen clínico general
//           examenClinicoGeneral: data.examenOdontologico?.examenClinicoGeneral || '',
          
//           // Datos del examen clínico estomatológico
//           ATM: data.examenEstomatologico?.ATM || '',
//           ganglios: data.examenEstomatologico?.ganglios || '',
//           piel: data.examenEstomatologico?.piel || '',
//           simetriaFacial: data.examenEstomatologico?.simetriaFacial || '',
//           glandulasSalivales: data.examenEstomatologico?.glandulasSalivales || '',
//           encia: data.examenEstomatologico?.encia || '',
//           vestibulo: data.examenEstomatologico?.vestibulo || '',
//           carrillo: data.examenEstomatologico?.carrillo || '',
//           paladar: data.examenEstomatologico?.paladar || '',
//           orofaringe: data.examenEstomatologico?.orofaringe || '',
//           lengua: data.examenEstomatologico?.lengua || '',
//           pisoBoca: data.examenEstomatologico?.pisoBoca || '',
//           oclusion: data.examenEstomatologico?.oclusion || '',
//           observaciones: data.examenEstomatologico?.observaciones || ''
//         });
//       } else {
//         // Si no hay datos, limpiar los campos
//         setExamenClinico({
//           examenClinicoGeneral: '',
//           ATM: '',
//           ganglios: '',
//           piel: '',
//           simetriaFacial: '',
//           glandulasSalivales: '',
//           encia: '',
//           vestibulo: '',
//           carrillo: '',
//           paladar: '',
//           orofaringe: '',
//           lengua: '',
//           pisoBoca: '',
//           oclusion: '',
//           observaciones: ''
//         });
//       }
//     } catch (error) {
//       console.error('Error al cargar examen clínico:', error);
//     }
//   };

//   // Función para manejar cambios en los campos
//   const handleInputChange = (field: string, value: string) => {
//     setExamenClinico(prev => ({
//       ...prev,
//       [field]: value
//     }));
//   };

//   // Función para guardar examen clínico
//   const guardarExamenClinico = async () => {
//     if (!pacienteSeleccionado) {
//       setError('Primero debe seleccionar un paciente');
//       return;
//     }

//     setLoading(true);
//     setError('');

//     try {
//       const response = await fetch('/api/ficha/examen-clinico', {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({
//           pacienteId: pacienteSeleccionado.id,
//           ...examenClinico
//         }),
//       });

//       const data = await response.json();

//       if (response.ok) {
//         alert('Examen clínico guardado correctamente');
//       } else {
//         setError(data.error || 'Error al guardar examen clínico');
//       }
//     } catch (error) {
//       setError('Error al guardar examen clínico');
//       console.error('Error:', error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Función para cancelar (limpiar formulario)
//   const cancelar = () => {
//     setExamenClinico({
//       examenClinicoGeneral: '',
//       ATM: '',
//       ganglios: '',
//       piel: '',
//       simetriaFacial: '',
//       glandulasSalivales: '',
//       encia: '',
//       vestibulo: '',
//       carrillo: '',
//       paladar: '',
//       orofaringe: '',
//       lengua: '',
//       pisoBoca: '',
//       oclusion: '',
//       observaciones: ''
//     });
//     setError('');
//   };

//   // Función para eliminar examen clínico
//   const eliminarExamenClinico = async () => {
//     if (!pacienteSeleccionado) return;

//     const confirmar = window.confirm('¿Estás seguro de eliminar el examen clínico?');
//     if (!confirmar) return;

//     setLoading(true);
//     try {
//       const response = await fetch(`/api/ficha/examen-clinico?pacienteId=${pacienteSeleccionado.id}`, {
//         method: 'DELETE'
//       });

//       if (response.ok) {
//         // Limpiar el formulario después de eliminar
//         setExamenClinico({
//           examenClinicoGeneral: '',
//           ATM: '',
//           ganglios: '',
//           piel: '',
//           simetriaFacial: '',
//           glandulasSalivales: '',
//           encia: '',
//           vestibulo: '',
//           carrillo: '',
//           paladar: '',
//           orofaringe: '',
//           lengua: '',
//           pisoBoca: '',
//           oclusion: '',
//           observaciones: ''
//         });
//         alert('Examen clínico eliminado');
//       } else {
//         setError('Error al eliminar examen clínico');
//       }
//     } catch (error) {
//       setError('Error al eliminar examen clínico');
//     } finally {
//       setLoading(false);
//     }
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
//                   placeholder="000"
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
//         {/* Buscador de paciente igual que en los otros tabs */}
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
//               className="bg-gray-800 text-white px-4 py-2 rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 disabled:opacity-50 mt-6"
//             >
//               {loading ? 'Buscando...' : 'Buscar'}
//             </button>
//             <div className="text-sm text-gray-600 mt-6">
//               Paciente: {pacienteSeleccionado ? `${pacienteSeleccionado.nombres} ${pacienteSeleccionado.apellidos}` : 'No seleccionado'}
//             </div>
//           </div>
//           {error && (
//             <div className="mt-2 text-red-600 text-sm">{error}</div>
//           )}
//         </div>

//         {/* Contenedor principal con navegación de tabs */}
//         <div className="bg-white rounded-lg shadow-sm border mb-6">
//           {/* Navegación de tabs */}
//           <TabNavigation pacienteSeleccionado={pacienteSeleccionado} />

//           {/* Contenido del Tab 4 - Examen Clínico */}
//           <div className="p-6">
//             <h2 className="text-lg font-semibold text-gray-900 mb-4">4. EXAMEN CLÍNICO</h2>
            
//             <div className="space-y-6">
//               {/* Sección 1: Examen Clínico General */}
//               <div>
//                 <h3 className="text-md font-medium text-gray-800 mb-2">Examen Clínico General:</h3>
//                 <textarea
//                   value={examenClinico.examenClinicoGeneral}
//                   onChange={(e) => handleInputChange('examenClinicoGeneral', e.target.value)}
//                   className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
//                   placeholder="Evaluación del estado físico general..."
//                   rows={4}
//                 />
//               </div>

//               {/* Sección 2: Examen Clínico Estomatológico */}
//               <div>
//                 <h3 className="text-md font-medium text-gray-800 mb-4">Examen Clínico Estomatológico:</h3>
                
//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                   {/* Columna izquierda */}
//                   <div className="space-y-4">
//                     <div>
//                       <label className="block text-sm font-medium text-gray-700 mb-1">
//                         ATM:
//                       </label>
//                       <input
//                         type="text"
//                         value={examenClinico.ATM}
//                         onChange={(e) => handleInputChange('ATM', e.target.value)}
//                         className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
//                         placeholder="Articulación temporomandibular"
//                       />
//                     </div>

//                     <div>
//                       <label className="block text-sm font-medium text-gray-700 mb-1">
//                         Ganglios:
//                       </label>
//                       <input
//                         type="text"
//                         value={examenClinico.ganglios}
//                         onChange={(e) => handleInputChange('ganglios', e.target.value)}
//                         className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
//                         placeholder="Estado de los ganglios"
//                       />
//                     </div>

//                     <div>
//                       <label className="block text-sm font-medium text-gray-700 mb-1">
//                         Piel:
//                       </label>
//                       <input
//                         type="text"
//                         value={examenClinico.piel}
//                         onChange={(e) => handleInputChange('piel', e.target.value)}
//                         className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
//                         placeholder="Condición de la piel"
//                       />
//                     </div>

//                     <div>
//                       <label className="block text-sm font-medium text-gray-700 mb-1">
//                         Simetría Facial:
//                       </label>
//                       <input
//                         type="text"
//                         value={examenClinico.simetriaFacial}
//                         onChange={(e) => handleInputChange('simetriaFacial', e.target.value)}
//                         className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
//                         placeholder="Evaluación de simetría facial"
//                       />
//                     </div>

//                     <div>
//                       <label className="block text-sm font-medium text-gray-700 mb-1">
//                         Glándulas Salivales:
//                       </label>
//                       <input
//                         type="text"
//                         value={examenClinico.glandulasSalivales}
//                         onChange={(e) => handleInputChange('glandulasSalivales', e.target.value)}
//                         className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
//                         placeholder="Estado de glándulas salivales"
//                       />
//                     </div>

//                     <div>
//                       <label className="block text-sm font-medium text-gray-700 mb-1">
//                         Encía:
//                       </label>
//                       <input
//                         type="text"
//                         value={examenClinico.encia}
//                         onChange={(e) => handleInputChange('encia', e.target.value)}
//                         className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
//                         placeholder="Condición de la encía"
//                       />
//                     </div>
//                   </div>

//                   {/* Columna derecha */}
//                   <div className="space-y-4">
//                     <div>
//                       <label className="block text-sm font-medium text-gray-700 mb-1">
//                         Vestíbulo:
//                       </label>
//                       <input
//                         type="text"
//                         value={examenClinico.vestibulo}
//                         onChange={(e) => handleInputChange('vestibulo', e.target.value)}
//                         className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
//                         placeholder="Estado del vestíbulo"
//                       />
//                     </div>

//                     <div>
//                       <label className="block text-sm font-medium text-gray-700 mb-1">
//                         Carrillo:
//                       </label>
//                       <input
//                         type="text"
//                         value={examenClinico.carrillo}
//                         onChange={(e) => handleInputChange('carrillo', e.target.value)}
//                         className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
//                         placeholder="Condición del carrillo"
//                       />
//                     </div>

//                     <div>
//                       <label className="block text-sm font-medium text-gray-700 mb-1">
//                         Paladar:
//                       </label>
//                       <input
//                         type="text"
//                         value={examenClinico.paladar}
//                         onChange={(e) => handleInputChange('paladar', e.target.value)}
//                         className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
//                         placeholder="Estado del paladar"
//                       />
//                     </div>

//                     <div>
//                       <label className="block text-sm font-medium text-gray-700 mb-1">
//                         Orofaringe:
//                       </label>
//                       <input
//                         type="text"
//                         value={examenClinico.orofaringe}
//                         onChange={(e) => handleInputChange('orofaringe', e.target.value)}
//                         className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
//                         placeholder="Condición de la orofaringe"
//                       />
//                     </div>

//                     <div>
//                       <label className="block text-sm font-medium text-gray-700 mb-1">
//                         Lengua:
//                       </label>
//                       <input
//                         type="text"
//                         value={examenClinico.lengua}
//                         onChange={(e) => handleInputChange('lengua', e.target.value)}
//                         className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
//                         placeholder="Estado de la lengua"
//                       />
//                     </div>

//                     <div>
//                       <label className="block text-sm font-medium text-gray-700 mb-1">
//                         Piso de Boca:
//                       </label>
//                       <input
//                         type="text"
//                         value={examenClinico.pisoBoca}
//                         onChange={(e) => handleInputChange('pisoBoca', e.target.value)}
//                         className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
//                         placeholder="Condición del piso de boca"
//                       />
//                     </div>
//                   </div>
//                 </div>

//                 {/* Campos que ocupan todo el ancho */}
//                 <div className="mt-4 space-y-4">
//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-1">
//                       Oclusión:
//                     </label>
//                     <input
//                       type="text"
//                       value={examenClinico.oclusion}
//                       onChange={(e) => handleInputChange('oclusion', e.target.value)}
//                       className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
//                       placeholder="Evaluación de la oclusión"
//                     />
//                   </div>

//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-1">
//                       Observaciones:
//                     </label>
//                     <textarea
//                       value={examenClinico.observaciones}
//                       onChange={(e) => handleInputChange('observaciones', e.target.value)}
//                       className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
//                       placeholder="Observaciones adicionales del examen clínico estomatológico..."
//                       rows={4}
//                     />
//                   </div>
//                 </div>
//               </div>
//             </div>

//             {/* Botones de acción usando el componente reutilizable */}
//             <ActionButtons
//               pacienteSeleccionado={pacienteSeleccionado}
//               loading={loading}
//               onCancelar={cancelar}
//               onEliminar={eliminarExamenClinico}
//               onGuardar={guardarExamenClinico}
//             />
//           </div>
//         </div>
//       </div>
//     </div>
//   )
// }

// app/dashboard/paciente/examen-clinico/page.tsx
'use client'
import { useState, useEffect } from 'react'
import { usePaciente } from '../hooks/usePaciente'
import TabNavigation from '../components/TabNavigation'
import ActionButtons from '../components/ActionButtons'
import { FileText, Search, Users, Calendar, User, Stethoscope, Eye, Activity, ClipboardList } from 'lucide-react'

export default function ExamenClinicoPage() {
  // Hook personalizado para manejar el paciente
  const {
    pacienteSeleccionado,
    buscarDni,
    setBuscarDni,
    loading,
    setLoading,
    error,
    setError,
    buscarPaciente,
    limpiarPaciente
  } = usePaciente()

  // Estados para los campos del examen clínico
  const [examenClinico, setExamenClinico] = useState({
    // Examen Clínico General (se guarda en ExamenOdontologico)
    examenClinicoGeneral: '',
    
    // Examen Clínico Estomatológico (se guarda en ExamenClinicoEstomatologico)
    ATM: '',
    ganglios: '',
    piel: '',
    simetriaFacial: '',
    glandulasSalivales: '',
    encia: '',
    vestibulo: '',
    carrillo: '',
    paladar: '',
    orofaringe: '',
    lengua: '',
    pisoBoca: '',
    oclusion: '',
    observaciones: ''
  })

  // Estados para fecha y número de ficha (igual que en los otros tabs)
  const [fechaIngreso, setFechaIngreso] = useState('')
  const [numeroFicha, setNumeroFicha] = useState('')

  // Cargar fecha actual y número de ficha al iniciar
  useEffect(() => {
    const fechaActual = new Date().toISOString().split('T')[0];
    setFechaIngreso(fechaActual);
    obtenerProximoNumeroFicha();
  }, []);

  // Cargar datos del examen clínico si hay paciente seleccionado
  useEffect(() => {
    if (pacienteSeleccionado) {
      cargarExamenClinico(pacienteSeleccionado.id);
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

  // Función para cargar el examen clínico existente
  const cargarExamenClinico = async (pacienteId: string) => {
    try {
      const response = await fetch(`/api/ficha/examen-clinico?pacienteId=${pacienteId}`);
      const data = await response.json();
      
      if (response.ok) {
        // Cargar los datos existentes en el estado
        setExamenClinico({
          // Datos del examen clínico general
          examenClinicoGeneral: data.examenOdontologico?.examenClinicoGeneral || '',
          
          // Datos del examen clínico estomatológico
          ATM: data.examenEstomatologico?.ATM || '',
          ganglios: data.examenEstomatologico?.ganglios || '',
          piel: data.examenEstomatologico?.piel || '',
          simetriaFacial: data.examenEstomatologico?.simetriaFacial || '',
          glandulasSalivales: data.examenEstomatologico?.glandulasSalivales || '',
          encia: data.examenEstomatologico?.encia || '',
          vestibulo: data.examenEstomatologico?.vestibulo || '',
          carrillo: data.examenEstomatologico?.carrillo || '',
          paladar: data.examenEstomatologico?.paladar || '',
          orofaringe: data.examenEstomatologico?.orofaringe || '',
          lengua: data.examenEstomatologico?.lengua || '',
          pisoBoca: data.examenEstomatologico?.pisoBoca || '',
          oclusion: data.examenEstomatologico?.oclusion || '',
          observaciones: data.examenEstomatologico?.observaciones || ''
        });
      } else {
        // Si no hay datos, limpiar los campos
        setExamenClinico({
          examenClinicoGeneral: '',
          ATM: '',
          ganglios: '',
          piel: '',
          simetriaFacial: '',
          glandulasSalivales: '',
          encia: '',
          vestibulo: '',
          carrillo: '',
          paladar: '',
          orofaringe: '',
          lengua: '',
          pisoBoca: '',
          oclusion: '',
          observaciones: ''
        });
      }
    } catch (error) {
      console.error('Error al cargar examen clínico:', error);
    }
  };

  // Función para manejar cambios en los campos
  const handleInputChange = (field: string, value: string) => {
    setExamenClinico(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Función para guardar examen clínico
  const guardarExamenClinico = async () => {
    if (!pacienteSeleccionado) {
      setError('Primero debe seleccionar un paciente');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/ficha/examen-clinico', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          pacienteId: pacienteSeleccionado.id,
          ...examenClinico
        }),
      });

      const data = await response.json();

      if (response.ok) {
        alert('Examen clínico guardado correctamente');
      } else {
        setError(data.error || 'Error al guardar examen clínico');
      }
    } catch (error) {
      setError('Error al guardar examen clínico');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Función para cancelar (limpiar formulario)
  const cancelar = () => {
    setExamenClinico({
      examenClinicoGeneral: '',
      ATM: '',
      ganglios: '',
      piel: '',
      simetriaFacial: '',
      glandulasSalivales: '',
      encia: '',
      vestibulo: '',
      carrillo: '',
      paladar: '',
      orofaringe: '',
      lengua: '',
      pisoBoca: '',
      oclusion: '',
      observaciones: ''
    });
    setError('');
  };

  // Función para eliminar examen clínico
  const eliminarExamenClinico = async () => {
    if (!pacienteSeleccionado) return;

    const confirmar = window.confirm('¿Estás seguro de eliminar el examen clínico?');
    if (!confirmar) return;

    setLoading(true);
    try {
      const response = await fetch(`/api/ficha/examen-clinico?pacienteId=${pacienteSeleccionado.id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        // Limpiar el formulario después de eliminar
        setExamenClinico({
          examenClinicoGeneral: '',
          ATM: '',
          ganglios: '',
          piel: '',
          simetriaFacial: '',
          glandulasSalivales: '',
          encia: '',
          vestibulo: '',
          carrillo: '',
          paladar: '',
          orofaringe: '',
          lengua: '',
          pisoBoca: '',
          oclusion: '',
          observaciones: ''
        });
        alert('Examen clínico eliminado');
      } else {
        setError('Error al eliminar examen clínico');
      }
    } catch (error) {
      setError('Error al eliminar examen clínico');
    } finally {
      setLoading(false);
    }
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
            <p className="text-xs text-slate-600">Examen clínico del paciente</p>
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
              <Stethoscope className="h-4 w-4 text-slate-600" />
            </div>
            <h2 className="text-base font-bold text-slate-900">4. EXAMEN CLÍNICO</h2>
          </div>
          
          <div className="space-y-6">
            {/* Sección 1: Examen Clínico General */}
            <div className="bg-slate-50/50 rounded-lg p-4 border border-slate-200">
              <div className="flex items-center space-x-2 mb-3">
                <Activity className="h-4 w-4 text-blue-600" />
                <h3 className="text-sm font-bold text-slate-800">Examen Clínico General:</h3>
              </div>
              <div className="relative">
                <textarea
                  value={examenClinico.examenClinicoGeneral}
                  onChange={(e) => handleInputChange('examenClinicoGeneral', e.target.value)}
                  className="w-full border border-slate-300 rounded-lg px-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors duration-200 resize-none"
                  placeholder="Evaluación del estado físico general del paciente..."
                  rows={4}
                />
                <div className="absolute bottom-2 right-2 text-xs text-slate-400">
                  {examenClinico.examenClinicoGeneral.length} caracteres
                </div>
              </div>
            </div>

            {/* Sección 2: Examen Clínico Estomatológico */}
            <div className="bg-slate-50/50 rounded-lg p-4 border border-slate-200">
              <div className="flex items-center space-x-2 mb-4">
                <Eye className="h-4 w-4 text-green-600" />
                <h3 className="text-sm font-bold text-slate-800">Examen Clínico Estomatológico:</h3>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Columna izquierda */}
                <div className="space-y-4">
                  <div className="bg-white rounded-lg p-3 border border-slate-200">
                    <label className="block text-xs font-semibold text-slate-700 mb-2">
                      ATM (Articulación Temporomandibular):
                    </label>
                    <input
                      type="text"
                      value={examenClinico.ATM}
                      onChange={(e) => handleInputChange('ATM', e.target.value)}
                      className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors duration-200"
                      placeholder="Estado de la articulación"
                    />
                  </div>

                  <div className="bg-white rounded-lg p-3 border border-slate-200">
                    <label className="block text-xs font-semibold text-slate-700 mb-2">
                      Ganglios:
                    </label>
                    <input
                      type="text"
                      value={examenClinico.ganglios}
                      onChange={(e) => handleInputChange('ganglios', e.target.value)}
                      className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors duration-200"
                      placeholder="Estado de los ganglios"
                    />
                  </div>

                  <div className="bg-white rounded-lg p-3 border border-slate-200">
                    <label className="block text-xs font-semibold text-slate-700 mb-2">
                      Piel:
                    </label>
                    <input
                      type="text"
                      value={examenClinico.piel}
                      onChange={(e) => handleInputChange('piel', e.target.value)}
                      className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors duration-200"
                      placeholder="Condición de la piel"
                    />
                  </div>

                  <div className="bg-white rounded-lg p-3 border border-slate-200">
                    <label className="block text-xs font-semibold text-slate-700 mb-2">
                      Simetría Facial:
                    </label>
                    <input
                      type="text"
                      value={examenClinico.simetriaFacial}
                      onChange={(e) => handleInputChange('simetriaFacial', e.target.value)}
                      className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors duration-200"
                      placeholder="Evaluación de simetría"
                    />
                  </div>

                  <div className="bg-white rounded-lg p-3 border border-slate-200">
                    <label className="block text-xs font-semibold text-slate-700 mb-2">
                      Glándulas Salivales:
                    </label>
                    <input
                      type="text"
                      value={examenClinico.glandulasSalivales}
                      onChange={(e) => handleInputChange('glandulasSalivales', e.target.value)}
                      className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors duration-200"
                      placeholder="Estado de glándulas"
                    />
                  </div>

                  <div className="bg-white rounded-lg p-3 border border-slate-200">
                    <label className="block text-xs font-semibold text-slate-700 mb-2">
                      Encía:
                    </label>
                    <input
                      type="text"
                      value={examenClinico.encia}
                      onChange={(e) => handleInputChange('encia', e.target.value)}
                      className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors duration-200"
                      placeholder="Condición de la encía"
                    />
                  </div>
                </div>

                {/* Columna derecha */}
                <div className="space-y-4">
                  <div className="bg-white rounded-lg p-3 border border-slate-200">
                    <label className="block text-xs font-semibold text-slate-700 mb-2">
                      Vestíbulo:
                    </label>
                    <input
                      type="text"
                      value={examenClinico.vestibulo}
                      onChange={(e) => handleInputChange('vestibulo', e.target.value)}
                      className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors duration-200"
                      placeholder="Estado del vestíbulo"
                    />
                  </div>

                  <div className="bg-white rounded-lg p-3 border border-slate-200">
                    <label className="block text-xs font-semibold text-slate-700 mb-2">
                      Carrillo:
                    </label>
                    <input
                      type="text"
                      value={examenClinico.carrillo}
                      onChange={(e) => handleInputChange('carrillo', e.target.value)}
                      className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors duration-200"
                      placeholder="Condición del carrillo"
                    />
                  </div>

                  <div className="bg-white rounded-lg p-3 border border-slate-200">
                    <label className="block text-xs font-semibold text-slate-700 mb-2">
                      Paladar:
                    </label>
                    <input
                      type="text"
                      value={examenClinico.paladar}
                      onChange={(e) => handleInputChange('paladar', e.target.value)}
                      className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors duration-200"
                      placeholder="Estado del paladar"
                    />
                  </div>

                  <div className="bg-white rounded-lg p-3 border border-slate-200">
                    <label className="block text-xs font-semibold text-slate-700 mb-2">
                      Orofaringe:
                    </label>
                    <input
                      type="text"
                      value={examenClinico.orofaringe}
                      onChange={(e) => handleInputChange('orofaringe', e.target.value)}
                      className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors duration-200"
                      placeholder="Condición de la orofaringe"
                    />
                  </div>

                  <div className="bg-white rounded-lg p-3 border border-slate-200">
                    <label className="block text-xs font-semibold text-slate-700 mb-2">
                      Lengua:
                    </label>
                    <input
                      type="text"
                      value={examenClinico.lengua}
                      onChange={(e) => handleInputChange('lengua', e.target.value)}
                      className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors duration-200"
                      placeholder="Estado de la lengua"
                    />
                  </div>

                  <div className="bg-white rounded-lg p-3 border border-slate-200">
                    <label className="block text-xs font-semibold text-slate-700 mb-2">
                      Piso de Boca:
                    </label>
                    <input
                      type="text"
                      value={examenClinico.pisoBoca}
                      onChange={(e) => handleInputChange('pisoBoca', e.target.value)}
                      className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors duration-200"
                      placeholder="Condición del piso de boca"
                    />
                  </div>
                </div>
              </div>

              {/* Campos que ocupan todo el ancho */}
              <div className="mt-6 space-y-4">
                <div className="bg-white rounded-lg p-3 border border-slate-200">
                  <label className="block text-xs font-semibold text-slate-700 mb-2">
                    Oclusión:
                  </label>
                  <input
                    type="text"
                    value={examenClinico.oclusion}
                    onChange={(e) => handleInputChange('oclusion', e.target.value)}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors duration-200"
                    placeholder="Evaluación de la oclusión dental"
                  />
                </div>

                <div className="bg-white rounded-lg p-3 border border-slate-200">
                  <div className="flex items-center space-x-2 mb-2">
                    <ClipboardList className="h-3 w-3 text-slate-500" />
                    <label className="text-xs font-semibold text-slate-700">
                      Observaciones:
                    </label>
                  </div>
                  <div className="relative">
                    <textarea
                      value={examenClinico.observaciones}
                      onChange={(e) => handleInputChange('observaciones', e.target.value)}
                      className="w-full border border-slate-300 rounded-lg px-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors duration-200 resize-none"
                      placeholder="Observaciones adicionales del examen clínico estomatológico..."
                      rows={4}
                    />
                    <div className="absolute bottom-2 right-2 text-xs text-slate-400">
                      {examenClinico.observaciones.length} caracteres
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Botones de acción usando el componente reutilizable */}
          <div className="mt-6 pt-4 border-t border-slate-200">
            <ActionButtons
              pacienteSeleccionado={!!pacienteSeleccionado}
              loading={loading}
              onCancelar={cancelar}
              onEliminar={eliminarExamenClinico}
              onGuardar={guardarExamenClinico}
            />
          </div>
        </div>
      </div>
    </div>
  )
}