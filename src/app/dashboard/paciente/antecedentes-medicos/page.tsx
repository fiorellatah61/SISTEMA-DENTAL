// // app/dashboard/paciente/antecedentes-medicos/page.tsx
// 'use client'
// import { useState, useEffect } from 'react'
// import { usePaciente } from '../hooks/usePaciente'
// import TabNavigation from '../components/TabNavigation'
// import ActionButtons from '../components/ActionButtons'

// export default function AntecedentesMedicosPage() {
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

//   // Estados para los campos de antecedentes médicos
//   const [antecedentes, setAntecedentes] = useState({
//     alergias: '',
//     tuberculosis: false,
//     hipertension: false,
//     diabetes: false,
//     hepatitis: false,
//     hemorragias: false,
//     enfermedadesCorazon: false,
//     medicamentosActuales: '',
//     otros: ''
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

//   // Cargar datos de antecedentes médicos si hay paciente seleccionado
//   useEffect(() => {
//     if (pacienteSeleccionado) {
//       cargarAntecedentesMedicos(pacienteSeleccionado.id);
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

//   // Función para cargar los antecedentes médicos existentes
//   const cargarAntecedentesMedicos = async (pacienteId: string) => {
//     try {
//       const response = await fetch(`/api/ficha/antecedentes-medicos?pacienteId=${pacienteId}`);
//       const data = await response.json();
      
//       if (response.ok && data.antecedentes) {
//         // Cargar los datos existentes en el estado
//         setAntecedentes({
//           alergias: data.antecedentes.alergias || '',
//           tuberculosis: data.antecedentes.tuberculosis || false,
//           hipertension: data.antecedentes.hipertension || false,
//           diabetes: data.antecedentes.diabetes || false,
//           hepatitis: data.antecedentes.hepatitis || false,
//           hemorragias: data.antecedentes.hemorragias || false,
//           enfermedadesCorazon: data.antecedentes.enfermedadesCorazon || false,
//           medicamentosActuales: data.antecedentes.medicamentosActuales || '',
//           otros: data.antecedentes.otros || ''
//         });
//       } else {
//         // Si no hay antecedentes médicos, limpiar los campos
//         setAntecedentes({
//           alergias: '',
//           tuberculosis: false,
//           hipertension: false,
//           diabetes: false,
//           hepatitis: false,
//           hemorragias: false,
//           enfermedadesCorazon: false,
//           medicamentosActuales: '',
//           otros: ''
//         });
//       }
//     } catch (error) {
//       console.error('Error al cargar antecedentes médicos:', error);
//     }
//   };

//   // Función para manejar cambios en los campos de texto
//   const handleInputChange = (field: string, value: string) => {
//     setAntecedentes(prev => ({
//       ...prev,
//       [field]: value
//     }));
//   };

//   // Función para manejar cambios en los checkboxes
//   const handleCheckboxChange = (field: string, checked: boolean) => {
//     setAntecedentes(prev => ({
//       ...prev,
//       [field]: checked
//     }));
//   };

//   // Función para guardar antecedentes médicos
//   const guardarAntecedentesMedicos = async () => {
//     if (!pacienteSeleccionado) {
//       setError('Primero debe seleccionar un paciente');
//       return;
//     }

//     setLoading(true);
//     setError('');

//     try {
//       const response = await fetch('/api/ficha/antecedentes-medicos', {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({
//           pacienteId: pacienteSeleccionado.id,
//           ...antecedentes
//         }),
//       });

//       const data = await response.json();

//       if (response.ok) {
//         alert('Antecedentes médicos guardados correctamente');
//       } else {
//         setError(data.error || 'Error al guardar antecedentes médicos');
//       }
//     } catch (error) {
//       setError('Error al guardar antecedentes médicos');
//       console.error('Error:', error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Función para cancelar (limpiar formulario)
//   const cancelar = () => {
//     setAntecedentes({
//       alergias: '',
//       tuberculosis: false,
//       hipertension: false,
//       diabetes: false,
//       hepatitis: false,
//       hemorragias: false,
//       enfermedadesCorazon: false,
//       medicamentosActuales: '',
//       otros: ''
//     });
//     setError('');
//   };

//   // Función para eliminar antecedentes médicos
//   const eliminarAntecedentes = async () => {
//     if (!pacienteSeleccionado) return;

//     const confirmar = window.confirm('¿Estás seguro de eliminar los antecedentes médicos?');
//     if (!confirmar) return;

//     setLoading(true);
//     try {
//       const response = await fetch(`/api/ficha/antecedentes-medicos?pacienteId=${pacienteSeleccionado.id}`, {
//         method: 'DELETE'
//       });

//       if (response.ok) {
//         // Limpiar el formulario después de eliminar
//         setAntecedentes({
//           alergias: '',
//           tuberculosis: false,
//           hipertension: false,
//           diabetes: false,
//           hepatitis: false,
//           hemorragias: false,
//           enfermedadesCorazon: false,
//           medicamentosActuales: '',
//           otros: ''
//         });
//         alert('Antecedentes médicos eliminados');
//       } else {
//         setError('Error al eliminar antecedentes médicos');
//       }
//     } catch (error) {
//       setError('Error al eliminar antecedentes médicos');
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

//           {/* Contenido del Tab 3 - Antecedentes Médicos */}
//           <div className="p-6">
//             <h2 className="text-lg font-semibold text-gray-900 mb-4">3. ANTECEDENTES MÉDICOS</h2>
            
//             <div className="space-y-6">
//               {/* Campo de Alergias */}
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">
//                   Alergias:
//                 </label>
//                 <textarea
//                   value={antecedentes.alergias}
//                   onChange={(e) => handleInputChange('alergias', e.target.value)}
//                   className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
//                   placeholder="Especificar alergias conocidas"
//                   rows={3}
//                 />
//               </div>

//               {/* Checkboxes para condiciones médicas */}
//               <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
//                 <div className="flex items-center">
//                   <input
//                     type="checkbox"
//                     id="tuberculosis"
//                     checked={antecedentes.tuberculosis}
//                     onChange={(e) => handleCheckboxChange('tuberculosis', e.target.checked)}
//                     className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
//                   />
//                   <label htmlFor="tuberculosis" className="ml-2 text-sm text-gray-700">
//                     TBC
//                   </label>
//                 </div>

//                 <div className="flex items-center">
//                   <input
//                     type="checkbox"
//                     id="hipertension"
//                     checked={antecedentes.hipertension}
//                     onChange={(e) => handleCheckboxChange('hipertension', e.target.checked)}
//                     className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
//                   />
//                   <label htmlFor="hipertension" className="ml-2 text-sm text-gray-700">
//                     Hipertensión
//                   </label>
//                 </div>

//                 <div className="flex items-center">
//                   <input
//                     type="checkbox"
//                     id="diabetes"
//                     checked={antecedentes.diabetes}
//                     onChange={(e) => handleCheckboxChange('diabetes', e.target.checked)}
//                     className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
//                   />
//                   <label htmlFor="diabetes" className="ml-2 text-sm text-gray-700">
//                     Diabetes
//                   </label>
//                 </div>

//                 <div className="flex items-center">
//                   <input
//                     type="checkbox"
//                     id="hepatitis"
//                     checked={antecedentes.hepatitis}
//                     onChange={(e) => handleCheckboxChange('hepatitis', e.target.checked)}
//                     className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
//                   />
//                   <label htmlFor="hepatitis" className="ml-2 text-sm text-gray-700">
//                     Hepatitis
//                   </label>
//                 </div>

//                 <div className="flex items-center">
//                   <input
//                     type="checkbox"
//                     id="hemorragias"
//                     checked={antecedentes.hemorragias}
//                     onChange={(e) => handleCheckboxChange('hemorragias', e.target.checked)}
//                     className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
//                   />
//                   <label htmlFor="hemorragias" className="ml-2 text-sm text-gray-700">
//                     Hemorragias
//                   </label>
//                 </div>

//                 <div className="flex items-center">
//                   <input
//                     type="checkbox"
//                     id="enfermedadesCorazon"
//                     checked={antecedentes.enfermedadesCorazon}
//                     onChange={(e) => handleCheckboxChange('enfermedadesCorazon', e.target.checked)}
//                     className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
//                   />
//                   <label htmlFor="enfermedadesCorazon" className="ml-2 text-sm text-gray-700">
//                     Enfermedades del Corazón
//                   </label>
//                 </div>
//               </div>

//               {/* Campo de Medicamentos Actuales */}
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">
//                   ¿Está tomando algún medicamento?
//                 </label>
//                 <textarea
//                   value={antecedentes.medicamentosActuales}
//                   onChange={(e) => handleInputChange('medicamentosActuales', e.target.value)}
//                   className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
//                   placeholder="Especificar medicamentos actuales"
//                   rows={3}
//                 />
//               </div>

//               {/* Campo de Otros */}
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">
//                   Otros:
//                 </label>
//                 <textarea
//                   value={antecedentes.otros}
//                   onChange={(e) => handleInputChange('otros', e.target.value)}
//                   className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
//                   placeholder="Otras condiciones médicas relevantes..."
//                   rows={4}
//                 />
//               </div>
//             </div>

//             {/* Botones de acción usando el componente reutilizable */}
//             <ActionButtons
//               pacienteSeleccionado={pacienteSeleccionado}
//               loading={loading}
//               onCancelar={cancelar}
//               onEliminar={eliminarAntecedentes}
//               onGuardar={guardarAntecedentesMedicos}
//             />
//           </div>
//         </div>
//       </div>
//     </div>
//   )
// }
// app/dashboard/paciente/antecedentes-medicos/page.tsx
'use client'
import { useState, useEffect } from 'react'
import { usePaciente } from '../hooks/usePaciente'
import TabNavigation from '../components/TabNavigation'
import ActionButtons from '../components/ActionButtons'
import { FileText, Search, Users, Calendar, User, Heart, AlertTriangle } from 'lucide-react'

export default function AntecedentesMedicosPage() {
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

  // Estados para los campos de antecedentes médicos
  const [antecedentes, setAntecedentes] = useState({
    alergias: '',
    tuberculosis: false,
    hipertension: false,
    diabetes: false,
    hepatitis: false,
    hemorragias: false,
    enfermedadesCorazon: false,
    medicamentosActuales: '',
    otros: ''
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

  // Cargar datos de antecedentes médicos si hay paciente seleccionado
  useEffect(() => {
    if (pacienteSeleccionado) {
      cargarAntecedentesMedicos(pacienteSeleccionado.id);
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

  // Función para cargar los antecedentes médicos existentes
  const cargarAntecedentesMedicos = async (pacienteId: string) => {
    try {
      const response = await fetch(`/api/ficha/antecedentes-medicos?pacienteId=${pacienteId}`);
      const data = await response.json();
      
      if (response.ok && data.antecedentes) {
        // Cargar los datos existentes en el estado
        setAntecedentes({
          alergias: data.antecedentes.alergias || '',
          tuberculosis: data.antecedentes.tuberculosis || false,
          hipertension: data.antecedentes.hipertension || false,
          diabetes: data.antecedentes.diabetes || false,
          hepatitis: data.antecedentes.hepatitis || false,
          hemorragias: data.antecedentes.hemorragias || false,
          enfermedadesCorazon: data.antecedentes.enfermedadesCorazon || false,
          medicamentosActuales: data.antecedentes.medicamentosActuales || '',
          otros: data.antecedentes.otros || ''
        });
      } else {
        // Si no hay antecedentes médicos, limpiar los campos
        setAntecedentes({
          alergias: '',
          tuberculosis: false,
          hipertension: false,
          diabetes: false,
          hepatitis: false,
          hemorragias: false,
          enfermedadesCorazon: false,
          medicamentosActuales: '',
          otros: ''
        });
      }
    } catch (error) {
      console.error('Error al cargar antecedentes médicos:', error);
    }
  };

  // Función para manejar cambios en los campos de texto
  const handleInputChange = (field: string, value: string) => {
    setAntecedentes(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Función para manejar cambios en los checkboxes
  const handleCheckboxChange = (field: string, checked: boolean) => {
    setAntecedentes(prev => ({
      ...prev,
      [field]: checked
    }));
  };

  // Función para guardar antecedentes médicos
  const guardarAntecedentesMedicos = async () => {
    if (!pacienteSeleccionado) {
      setError('Primero debe seleccionar un paciente');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/ficha/antecedentes-medicos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          pacienteId: pacienteSeleccionado.id,
          ...antecedentes
        }),
      });

      const data = await response.json();

      if (response.ok) {
        alert('Antecedentes médicos guardados correctamente');
      } else {
        setError(data.error || 'Error al guardar antecedentes médicos');
      }
    } catch (error) {
      setError('Error al guardar antecedentes médicos');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Función para cancelar (limpiar formulario)
  const cancelar = () => {
    setAntecedentes({
      alergias: '',
      tuberculosis: false,
      hipertension: false,
      diabetes: false,
      hepatitis: false,
      hemorragias: false,
      enfermedadesCorazon: false,
      medicamentosActuales: '',
      otros: ''
    });
    setError('');
  };

  // Función para eliminar antecedentes médicos
  const eliminarAntecedentes = async () => {
    if (!pacienteSeleccionado) return;

    const confirmar = window.confirm('¿Estás seguro de eliminar los antecedentes médicos?');
    if (!confirmar) return;

    setLoading(true);
    try {
      const response = await fetch(`/api/ficha/antecedentes-medicos?pacienteId=${pacienteSeleccionado.id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        // Limpiar el formulario después de eliminar
        setAntecedentes({
          alergias: '',
          tuberculosis: false,
          hipertension: false,
          diabetes: false,
          hepatitis: false,
          hemorragias: false,
          enfermedadesCorazon: false,
          medicamentosActuales: '',
          otros: ''
        });
        alert('Antecedentes médicos eliminados');
      } else {
        setError('Error al eliminar antecedentes médicos');
      }
    } catch (error) {
      setError('Error al eliminar antecedentes médicos');
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
            <p className="text-xs text-slate-600">Antecedentes médicos del paciente</p>
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
              <Heart className="h-4 w-4 text-slate-600" />
            </div>
            <h2 className="text-base font-bold text-slate-900">3. ANTECEDENTES MÉDICOS</h2>
          </div>
          
          <div className="space-y-6">
            {/* Campo de Alergias */}
            <div className="bg-slate-50/50 rounded-lg p-4 border border-slate-200">
              <div className="flex items-center space-x-2 mb-3">
                <AlertTriangle className="h-4 w-4 text-amber-600" />
                <label className="text-sm font-semibold text-slate-700">
                  Alergias:
                </label>
              </div>
              <textarea
                value={antecedentes.alergias}
                onChange={(e) => handleInputChange('alergias', e.target.value)}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors duration-200"
                placeholder="Especificar alergias conocidas"
                rows={3}
              />
            </div>

            {/* Checkboxes para condiciones médicas */}
            <div className="bg-slate-50/50 rounded-lg p-4 border border-slate-200">
              <div className="flex items-center space-x-2 mb-4">
                <Heart className="h-4 w-4 text-red-600" />
                <h3 className="text-sm font-semibold text-slate-700">Condiciones Médicas:</h3>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="flex items-center space-x-2 bg-white rounded-lg p-3 border border-slate-200 hover:bg-slate-50 transition-colors duration-200">
                  <input
                    type="checkbox"
                    id="tuberculosis"
                    checked={antecedentes.tuberculosis}
                    onChange={(e) => handleCheckboxChange('tuberculosis', e.target.checked)}
                    className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-slate-300 rounded"
                  />
                  <label htmlFor="tuberculosis" className="text-sm text-slate-700 font-medium">
                    TBC
                  </label>
                </div>

                <div className="flex items-center space-x-2 bg-white rounded-lg p-3 border border-slate-200 hover:bg-slate-50 transition-colors duration-200">
                  <input
                    type="checkbox"
                    id="hipertension"
                    checked={antecedentes.hipertension}
                    onChange={(e) => handleCheckboxChange('hipertension', e.target.checked)}
                    className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-slate-300 rounded"
                  />
                  <label htmlFor="hipertension" className="text-sm text-slate-700 font-medium">
                    Hipertensión
                  </label>
                </div>

                <div className="flex items-center space-x-2 bg-white rounded-lg p-3 border border-slate-200 hover:bg-slate-50 transition-colors duration-200">
                  <input
                    type="checkbox"
                    id="diabetes"
                    checked={antecedentes.diabetes}
                    onChange={(e) => handleCheckboxChange('diabetes', e.target.checked)}
                    className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-slate-300 rounded"
                  />
                  <label htmlFor="diabetes" className="text-sm text-slate-700 font-medium">
                    Diabetes
                  </label>
                </div>

                <div className="flex items-center space-x-2 bg-white rounded-lg p-3 border border-slate-200 hover:bg-slate-50 transition-colors duration-200">
                  <input
                    type="checkbox"
                    id="hepatitis"
                    checked={antecedentes.hepatitis}
                    onChange={(e) => handleCheckboxChange('hepatitis', e.target.checked)}
                    className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-slate-300 rounded"
                  />
                  <label htmlFor="hepatitis" className="text-sm text-slate-700 font-medium">
                    Hepatitis
                  </label>
                </div>

                <div className="flex items-center space-x-2 bg-white rounded-lg p-3 border border-slate-200 hover:bg-slate-50 transition-colors duration-200">
                  <input
                    type="checkbox"
                    id="hemorragias"
                    checked={antecedentes.hemorragias}
                    onChange={(e) => handleCheckboxChange('hemorragias', e.target.checked)}
                    className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-slate-300 rounded"
                  />
                  <label htmlFor="hemorragias" className="text-sm text-slate-700 font-medium">
                    Hemorragias
                  </label>
                </div>

                <div className="flex items-center space-x-2 bg-white rounded-lg p-3 border border-slate-200 hover:bg-slate-50 transition-colors duration-200 sm:col-span-2 lg:col-span-1">
                  <input
                    type="checkbox"
                    id="enfermedadesCorazon"
                    checked={antecedentes.enfermedadesCorazon}
                    onChange={(e) => handleCheckboxChange('enfermedadesCorazon', e.target.checked)}
                    className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-slate-300 rounded"
                  />
                  <label htmlFor="enfermedadesCorazon" className="text-sm text-slate-700 font-medium">
                    Enfermedades del Corazón
                  </label>
                </div>
              </div>
            </div>

            {/* Campo de Medicamentos Actuales */}
            <div className="bg-slate-50/50 rounded-lg p-4 border border-slate-200">
              <div className="flex items-center space-x-2 mb-3">
                <div className="p-1 bg-blue-100 rounded">
                  <FileText className="h-3 w-3 text-blue-600" />
                </div>
                <label className="text-sm font-semibold text-slate-700">
                  ¿Está tomando algún medicamento?
                </label>
              </div>
              <textarea
                value={antecedentes.medicamentosActuales}
                onChange={(e) => handleInputChange('medicamentosActuales', e.target.value)}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors duration-200"
                placeholder="Especificar medicamentos actuales"
                rows={3}
              />
            </div>

            {/* Campo de Otros */}
            <div className="bg-slate-50/50 rounded-lg p-4 border border-slate-200">
              <div className="flex items-center space-x-2 mb-3">
                <div className="p-1 bg-slate-200 rounded">
                  <FileText className="h-3 w-3 text-slate-600" />
                </div>
                <label className="text-sm font-semibold text-slate-700">
                  Otros:
                </label>
              </div>
              <textarea
                value={antecedentes.otros}
                onChange={(e) => handleInputChange('otros', e.target.value)}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors duration-200"
                placeholder="Otras condiciones médicas relevantes..."
                rows={4}
              />
            </div>
          </div>

          {/* Botones de acción usando el componente reutilizable */}
          <div className="mt-6 pt-4 border-t border-slate-200">
            <ActionButtons
              pacienteSeleccionado={!!pacienteSeleccionado}
              loading={loading}
              onCancelar={cancelar}
              onEliminar={eliminarAntecedentes}
              onGuardar={guardarAntecedentesMedicos}
            />
          </div>
        </div>
      </div>
    </div>
  )
}