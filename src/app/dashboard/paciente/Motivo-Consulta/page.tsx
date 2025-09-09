// // app/dashboard/paciente/motivo-consulta/page.tsx
// 'use client'
// import { useState, useEffect } from 'react'
// import { usePaciente } from '../hooks/usePaciente'
// import TabNavigation from '../components/TabNavigation'
// import ActionButtons from '../components/ActionButtons'

// export default function MotivoConsultaPage() {
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

//   // Estados para los campos del motivo de consulta
//   const [motivoConsulta, setMotivoConsulta] = useState('')

//   // Estados para fecha y número de ficha (igual que en el tab 1)
//   const [fechaIngreso, setFechaIngreso] = useState('')
//   const [numeroFicha, setNumeroFicha] = useState('')

//   // Cargar fecha actual y número de ficha al iniciar
//   useEffect(() => {
//     const fechaActual = new Date().toISOString().split('T')[0];
//     setFechaIngreso(fechaActual);
//     obtenerProximoNumeroFicha();
//   }, []);

//   // Cargar datos del motivo de consulta si hay paciente seleccionado
//   useEffect(() => {
//     if (pacienteSeleccionado) {
//       cargarMotivoConsulta(pacienteSeleccionado.id);
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

//   // Función para cargar el motivo de consulta existente
//   const cargarMotivoConsulta = async (pacienteId: string) => {
//     try {
//       const response = await fetch(`/api/ficha/motivo-consulta?pacienteId=${pacienteId}`);
//       const data = await response.json();
      
//       if (response.ok && data.motivoConsulta) {
//         setMotivoConsulta(data.motivoConsulta);
//       } else {
//         // Si no hay motivo de consulta, limpiar el campo
//         setMotivoConsulta('');
//       }
//     } catch (error) {
//       console.error('Error al cargar motivo de consulta:', error);
//     }
//   };

//   // Función para guardar motivo de consulta
//   const guardarMotivoConsulta = async () => {
//     if (!pacienteSeleccionado) {
//       setError('Primero debe seleccionar un paciente');
//       return;
//     }

//     setLoading(true);
//     setError('');

//     try {
//       const response = await fetch('/api/ficha/motivo-consulta', {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({
//           pacienteId: pacienteSeleccionado.id,
//           motivoConsulta: motivoConsulta
//         }),
//       });

//       const data = await response.json();

//       if (response.ok) {
//         alert('Motivo de consulta guardado correctamente');
//       } else {
//         setError(data.error || 'Error al guardar motivo de consulta');
//       }
//     } catch (error) {
//       setError('Error al guardar motivo de consulta');
//       console.error('Error:', error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Función para cancelar (limpiar formulario)
//   const cancelar = () => {
//     setMotivoConsulta('');
//     setError('');
//   };

//   // Función para eliminar (opcional en este tab)
//   const eliminarMotivo = async () => {
//     if (!pacienteSeleccionado) return;

//     const confirmar = window.confirm('¿Estás seguro de eliminar el motivo de consulta?');
//     if (!confirmar) return;

//     setLoading(true);
//     try {
//       const response = await fetch(`/api/ficha/motivo-consulta?pacienteId=${pacienteSeleccionado.id}`, {
//         method: 'DELETE'
//       });

//       if (response.ok) {
//         setMotivoConsulta('');
//         alert('Motivo de consulta eliminado');
//       } else {
//         setError('Error al eliminar motivo de consulta');
//       }
//     } catch (error) {
//       setError('Error al eliminar motivo de consulta');
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     // aumentado el p-6
//     <div className="min-h-screen bg-gray-50  p-6">
   
//       {/* Header igual que en el tab 1 */}
      
//       <div className="max-w-7xl mx-auto">
//         <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
//           <div className="flex items-center justify-between">
//                 <div className="flex items-center gap-4">
//                     <div>  <h1 className="text-2xl font-semibold text-gray-900">CLÍNICA DENTAL SONRÍE</h1> </div>
//                 </div>
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
//         {/* Buscador de paciente igual que en tab 1 */}
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

//           {/* Contenido del Tab 2 - Motivo de Consulta */}
//           <div className="p-6">
//             <h2 className="text-lg font-semibold text-gray-900 mb-4">2. MOTIVO DE CONSULTA</h2>
            
//             <div className="space-y-4">
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">
//                   Descripción:
//                 </label>
//                 <textarea
//                   value={motivoConsulta}
//                   onChange={(e) => setMotivoConsulta(e.target.value)}
//                   className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
//                   placeholder="Describe el motivo de la consulta..."
//                   rows={6}
//                 />
//               </div>
//             </div>

//             {/* Botones de acción usando el componente reutilizable */}
//             <ActionButtons
//               pacienteSeleccionado={pacienteSeleccionado}
//               loading={loading}
//               onCancelar={cancelar}
//               onEliminar={eliminarMotivo}
//               onGuardar={guardarMotivoConsulta}
//             />
//           </div>
//         </div>
//       </div>
//     </div>
//   )
// }
// app/dashboard/paciente/motivo-consulta/page.tsx
'use client'
import { useState, useEffect } from 'react'
import { usePaciente } from '../hooks/usePaciente'
import TabNavigation from '../components/TabNavigation'
import ActionButtons from '../components/ActionButtons'
import { FileText, Search, Users, Calendar, User, MessageSquare, Edit3 } from 'lucide-react'

export default function MotivoConsultaPage() {
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

  // Estados para los campos del motivo de consulta
  const [motivoConsulta, setMotivoConsulta] = useState('')

  // Estados para fecha y número de ficha (igual que en el tab 1)
  const [fechaIngreso, setFechaIngreso] = useState('')
  const [numeroFicha, setNumeroFicha] = useState('')

  // Cargar fecha actual y número de ficha al iniciar
  useEffect(() => {
    const fechaActual = new Date().toISOString().split('T')[0];
    setFechaIngreso(fechaActual);
    obtenerProximoNumeroFicha();
  }, []);

  // Cargar datos del motivo de consulta si hay paciente seleccionado
  useEffect(() => {
    if (pacienteSeleccionado) {
      cargarMotivoConsulta(pacienteSeleccionado.id);
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

  // Función para cargar el motivo de consulta existente
  const cargarMotivoConsulta = async (pacienteId: string) => {
    try {
      const response = await fetch(`/api/ficha/motivo-consulta?pacienteId=${pacienteId}`);
      const data = await response.json();
      
      if (response.ok && data.motivoConsulta) {
        setMotivoConsulta(data.motivoConsulta);
      } else {
        // Si no hay motivo de consulta, limpiar el campo
        setMotivoConsulta('');
      }
    } catch (error) {
      console.error('Error al cargar motivo de consulta:', error);
    }
  };

  // Función para guardar motivo de consulta
  const guardarMotivoConsulta = async () => {
    if (!pacienteSeleccionado) {
      setError('Primero debe seleccionar un paciente');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/ficha/motivo-consulta', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          pacienteId: pacienteSeleccionado.id,
          motivoConsulta: motivoConsulta
        }),
      });

      const data = await response.json();

      if (response.ok) {
        alert('Motivo de consulta guardado correctamente');
      } else {
        setError(data.error || 'Error al guardar motivo de consulta');
      }
    } catch (error) {
      setError('Error al guardar motivo de consulta');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Función para cancelar (limpiar formulario)
  const cancelar = () => {
    setMotivoConsulta('');
    setError('');
  };

  // Función para eliminar (opcional en este tab)
  const eliminarMotivo = async () => {
    if (!pacienteSeleccionado) return;

    const confirmar = window.confirm('¿Estás seguro de eliminar el motivo de consulta?');
    if (!confirmar) return;

    setLoading(true);
    try {
      const response = await fetch(`/api/ficha/motivo-consulta?pacienteId=${pacienteSeleccionado.id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        setMotivoConsulta('');
        alert('Motivo de consulta eliminado');
      } else {
        setError('Error al eliminar motivo de consulta');
      }
    } catch (error) {
      setError('Error al eliminar motivo de consulta');
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
            <p className="text-xs text-slate-600">Motivo de consulta del paciente</p>
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
              <MessageSquare className="h-4 w-4 text-slate-600" />
            </div>
            <h2 className="text-base font-bold text-slate-900">2. MOTIVO DE CONSULTA</h2>
          </div>
          
          <div className="space-y-6">
            {/* Campo principal del motivo de consulta */}
            <div className="bg-slate-50/50 rounded-lg p-4 border border-slate-200">
              <div className="flex items-center space-x-2 mb-3">
                <Edit3 className="h-4 w-4 text-blue-600" />
                <label className="text-sm font-semibold text-slate-700">
                  Descripción del motivo de consulta:
                </label>
              </div>
              <div className="relative">
                <textarea
                  value={motivoConsulta}
                  onChange={(e) => setMotivoConsulta(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg px-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors duration-200 resize-none"
                  placeholder="Describe detalladamente el motivo por el cual el paciente solicita la consulta dental..."
                  rows={8}
                />
                <div className="absolute bottom-2 right-2 text-xs text-slate-400">
                  {motivoConsulta.length} caracteres
                </div>
              </div>
              
              {/* Sugerencias útiles */}
              <div className="mt-3 p-3 bg-blue-50 rounded-lg border-l-4 border-blue-400">
                <div className="flex items-start space-x-2">
                  <div className="flex-shrink-0">
                    <svg className="h-4 w-4 text-blue-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-blue-800 mb-1">Sugerencias para el registro:</p>
                    <ul className="text-xs text-blue-700 space-y-0.5">
                      <li>• Síntomas principales que presenta el paciente</li>
                      <li>• Duración y características del dolor (si aplica)</li>
                      <li>• Ubicación específica de la molestia</li>
                      <li>• Factores que mejoran o empeoran los síntomas</li>
                      <li>• Expectativas del paciente sobre el tratamiento</li>
                    </ul>
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
              onEliminar={eliminarMotivo}
              onGuardar={guardarMotivoConsulta}
            />
          </div>
        </div>
      </div>
    </div>
  )
}