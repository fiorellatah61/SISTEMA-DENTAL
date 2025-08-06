// // app/dashboard/paciente/page.tsx
// 'use client'
// import { useState, useEffect } from 'react'
// import { usePaciente } from './hooks/usePaciente'
// import TabNavigation from './components/TabNavigation'
// import ActionButtons from './components/ActionButtons'
// import BotonDescargarPDF from '../../../components/BotonDescargarPDF';
// export default function DatosAfiliacionPage() {
//   // Hook personalizado para manejar el paciente
//   const {
//     pacienteSeleccionado,
//     setPacienteSeleccionado,
//     buscarDni,
//     setBuscarDni,
//     loading,
//     setLoading,
//     error,
//     setError,
//     buscarPaciente,
//     limpiarPaciente
//   } = usePaciente()

//   // Estados para fecha y número de ficha
//   const [fechaIngreso, setFechaIngreso] = useState('')
//   const [numeroFicha, setNumeroFicha] = useState('')
  
//   // Datos del formulario
//   const [formData, setFormData] = useState({
//     nombres: '',
//     apellidos: '',
//     dni: '',
//     fechaNacimiento: '',
//     edad: '',
//     sexo: '',
//     lugarNacimiento: '',
//     domicilioActual: '',
//     celular: '',
//     acompanante: ''
//   })

//   // Cargar fecha actual y próximo número de ficha al iniciar
//   useEffect(() => {
//     const fechaActual = new Date().toISOString().split('T')[0];
//     setFechaIngreso(fechaActual);
//     obtenerProximoNumeroFicha();
//   }, []);

//   // Cargar datos del paciente en el formulario cuando se selecciona
//   useEffect(() => {
//     if (pacienteSeleccionado) {
//       setFormData({
//         nombres: pacienteSeleccionado.nombres || '',
//         apellidos: pacienteSeleccionado.apellidos || '',
//         dni: pacienteSeleccionado.dni || '',
//         fechaNacimiento: pacienteSeleccionado.fechaNacimiento ? 
//           new Date(pacienteSeleccionado.fechaNacimiento).toISOString().split('T')[0] : '',
//         edad: pacienteSeleccionado.edad?.toString() || '',
//         sexo: pacienteSeleccionado.sexo || '',
//         lugarNacimiento: pacienteSeleccionado.lugarNacimiento || '',
//         domicilioActual: pacienteSeleccionado.direccionActual || '',
//         celular: pacienteSeleccionado.telefono || '',
//         acompanante: pacienteSeleccionado.acompanante || ''
//       })
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

//   // Función para eliminar paciente
//   const eliminarPaciente = async () => {
//     if (!pacienteSeleccionado) return;

//     const confirmar = window.confirm(`¿Estás seguro de eliminar al paciente ${pacienteSeleccionado.nombres} ${pacienteSeleccionado.apellidos}?`);
    
//     if (!confirmar) return;

//     setLoading(true);
//     setError('');

//     try {
//       const response = await fetch(`/api/pacientes/${pacienteSeleccionado.id}`, {
//         method: 'DELETE',
//       });

//       if (response.ok) {
//         alert('Paciente eliminado correctamente');
//         cancelar(); // Limpiar formulario
//       } else {
//         const data = await response.json();
//         setError(data.error || 'Error al eliminar paciente');
//       }
//     } catch (error) {
//       setError('Error al eliminar paciente');
//       console.error('Error:', error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Función para calcular edad automáticamente
//   const calcularEdad = (fechaNacimiento: string) => {
//     if (!fechaNacimiento) return ''
    
//     const hoy = new Date()
//     const nacimiento = new Date(fechaNacimiento)
//     let edad = hoy.getFullYear() - nacimiento.getFullYear()
//     const mes = hoy.getMonth() - nacimiento.getMonth()
    
//     if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate())) {
//       edad--
//     }
    
//     return edad.toString()
//   }

//   // Manejar cambios en el formulario
//   const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
//     const { name, value } = e.target
    
//     setFormData(prev => ({
//       ...prev,
//       [name]: value
//     }))

//     // Calcular edad automáticamente cuando cambia la fecha de nacimiento
//     if (name === 'fechaNacimiento') {
//       const edad = calcularEdad(value)
//       setFormData(prev => ({
//         ...prev,
//         edad
//       }))
//     }
//   }

//   // Función para guardar/actualizar paciente
//   const guardarPaciente = async () => {
//     try {
//       setLoading(true)
//       setError('')

//       const method = pacienteSeleccionado ? 'PUT' : 'POST'
//       const url = pacienteSeleccionado 
//         ? `/api/pacientes/${pacienteSeleccionado.id}` 
//         : '/api/pacientes'

//       const response = await fetch(url, {
//         method,
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({
//           nombres: formData.nombres,
//           apellidos: formData.apellidos,
//           dni: formData.dni,
//           fechaNacimiento: formData.fechaNacimiento ? new Date(formData.fechaNacimiento) : null,
//           edad: formData.edad ? parseInt(formData.edad) : null,
//           sexo: formData.sexo || null,
//           telefono: formData.celular || null,
//           lugarNacimiento: formData.lugarNacimiento || null,
//           direccionActual: formData.domicilioActual || null,
//           acompanante: formData.acompanante || null,
//           numeroFicha: numeroFicha,
//           fechaIngreso: fechaIngreso
//         }),
//       })

//       const data = await response.json()

//       if (response.ok) {
//         alert(pacienteSeleccionado ? 'Paciente actualizado correctamente' : 'Paciente creado correctamente')
//         setPacienteSeleccionado(data.paciente)
        
//         // Si es un nuevo paciente, obtener el siguiente número de ficha
//         if (!pacienteSeleccionado) {
//           obtenerProximoNumeroFicha();
//         }
//       } else {
//         setError(data.error || 'Error al guardar paciente')
//       }
//     } catch (error) {
//       setError('Error al guardar paciente')
//       console.error('Error:', error)
//     } finally {
//       setLoading(false)
//     }
//   }

//   // Función para cancelar y limpiar formulario
//   const cancelar = () => {
//     setFormData({
//       nombres: '',
//       apellidos: '',
//       dni: '',
//       fechaNacimiento: '',
//       edad: '',
//       sexo: '',
//       lugarNacimiento: '',
//       domicilioActual: '',
//       celular: '',
//       acompanante: ''
//     })
//     setPacienteSeleccionado(null)
//     setBuscarDni('')
//     setError('')
//   }

//   return (
//     <div className="min-h-screen bg-gray-50">
//       {/* Header */}
//       <div className="bg-white shadow-sm border-b">
//         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//           <div className="flex justify-between items-center py-4">
//             <div>
//               <h1 className="text-2xl font-semibold text-gray-900">CLÍNICA DENTAL SONRÍE</h1>
//             </div>
//             <div className="flex items-center space-x-4">
//               <div className="text-sm text-gray-600">
//                 N° de Ficha: 
//                 <input 
//                   type="text" 
//                   value={numeroFicha}
//                   onChange={(e) => setNumeroFicha(e.target.value)}
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
//                   onChange={(e) => setFechaIngreso(e.target.value)}
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

//           {/* Formulario de Datos de Filiación */}
//           <div className="p-6">
//             <h2 className="text-lg font-semibold text-gray-900 mb-4">1. DATOS DE FILIACIÓN</h2>
            
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//               {/* Columna izquierda */}
//               <div className="space-y-4">
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-1">
//                     Apellidos y Nombres:
//                   </label>
//                   <input
//                     type="text"
//                     name="apellidos"
//                     value={formData.apellidos}
//                     onChange={handleInputChange}
//                     className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
//                     placeholder="Apellidos"
//                   />
//                   <input
//                     type="text"
//                     name="nombres"
//                     value={formData.nombres}
//                     onChange={handleInputChange}
//                     className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 mt-2"
//                     placeholder="Nombres"
//                   />
//                 </div>

//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-1">
//                     DNI:
//                   </label>
//                   <input
//                     type="text"
//                     name="dni"
//                     value={formData.dni}
//                     onChange={handleInputChange}
//                     className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
//                     placeholder="Número de DNI"
//                   />
//                 </div>

//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-1">
//                     Sexo:
//                   </label>
//                   <select
//                     name="sexo"
//                     value={formData.sexo}
//                     onChange={handleInputChange}
//                     className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
//                   >
//                     <option value="">Seleccione</option>
//                     <option value="M">Masculino</option>
//                     <option value="F">Femenino</option>
//                     <option value="OTRO">Otro</option>
//                   </select>
//                 </div>

//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-1">
//                     Domicilio Actual:
//                   </label>
//                   <input
//                     type="text"
//                     name="domicilioActual"
//                     value={formData.domicilioActual}
//                     onChange={handleInputChange}
//                     className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
//                     placeholder="Dirección completa"
//                   />
//                 </div>

//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-1">
//                     Persona que lo acompaña:
//                   </label>
//                   <input
//                     type="text"
//                     name="acompanante"
//                     value={formData.acompanante}
//                     onChange={handleInputChange}
//                     className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
//                     placeholder="Nombre del acompañante"
//                   />
//                 </div>
//               </div>

//               {/* Columna derecha */}
//               <div className="space-y-4">
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-1">
//                     Fecha de Nacimiento:
//                   </label>
//                   <input
//                     type="date"
//                     name="fechaNacimiento"
//                     value={formData.fechaNacimiento}
//                     onChange={handleInputChange}
//                     className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
//                   />
//                 </div>

//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-1">
//                     Edad:
//                   </label>
//                   <input
//                     type="text"
//                     name="edad"
//                     value={formData.edad}
//                     onChange={handleInputChange}
//                     className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
//                     placeholder="Calcula automáticamente"
//                     readOnly
//                   />
//                   <small className="text-gray-500">Se calcula automáticamente</small>
//                 </div>

//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-1">
//                     Lugar de Nacimiento:
//                   </label>
//                   <input
//                     type="text"
//                     name="lugarNacimiento"
//                     value={formData.lugarNacimiento}
//                     onChange={handleInputChange}
//                     className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
//                     placeholder="Ciudad, País"
//                   />
//                 </div>

//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-1">
//                     Celular:
//                   </label>
//                   <input
//                     type="tel"
//                     name="celular"
//                     value={formData.celular}
//                     onChange={handleInputChange}
//                     className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
//                     placeholder="Número de contacto"
//                   />
//                 </div>
//               </div>
//             </div>

//             {/* Botones de acción usando el componente reutilizable */}
//             <ActionButtons
//               pacienteSeleccionado={pacienteSeleccionado}
//               loading={loading}
//               onCancelar={cancelar}
//               onEliminar={eliminarPaciente}
//               onGuardar={guardarPaciente}
//             />



//  {/* Botón para descargar PDF - Solo mostrar si hay paciente seleccionado */}
//                         {/* {pacienteSeleccionado && (
//                           <div className="mt-4 flex justify-center">
//                             <BotonDescargarPDF 
//                               fichaId={pacienteSeleccionado.id }
//                               numeroFicha={numeroFicha}
//                               variant="primary"
//                               className="px-6 py-3"
//                             />
//                           </div>
//                         )} */}




          


//           </div>
//         </div>
//       </div>
//     </div>
//   )
// }



//---------------------------------NUEVO---------------------
// app/dashboard/paciente/page.tsx

// app/dashboard/paciente/page.tsx
'use client'
import { useState, useEffect } from 'react'
import { usePaciente } from './hooks/usePaciente'
import TabNavigation from './components/TabNavigation'
import ActionButtons from './components/ActionButtons'
import BotonDescargarPDF from '../../../components/BotonDescargarPDF'

// Definir interfaz para fichaOdontologica
interface FichaOdontologica {
  id: string
  numeroFicha: string
  // Agrega otras propiedades si las necesitas
}

export default function DatosAfiliacionPage() {
  // Hook personalizado para manejar el paciente
  const {
    pacienteSeleccionado,
    setPacienteSeleccionado,
    buscarDni,
    setBuscarDni,
    loading,
    setLoading,
    error,
    setError,
    buscarPaciente,
    limpiarPaciente
  } = usePaciente()

  // Estados para fecha y número de ficha
  const [fechaIngreso, setFechaIngreso] = useState('')
  const [numeroFicha, setNumeroFicha] = useState('')
  
  // Estado para almacenar la ficha odontológica con tipo explícito
  const [fichaOdontologica, setFichaOdontologica] = useState<FichaOdontologica | null>(null)
  
  // Datos del formulario
  const [formData, setFormData] = useState({
    nombres: '',
    apellidos: '',
    dni: '',
    fechaNacimiento: '',
    edad: '',
    sexo: '',
    lugarNacimiento: '',
    domicilioActual: '',
    celular: '',
    acompanante: ''
  })

  // Cargar fecha actual y próximo número de ficha al iniciar
  useEffect(() => {
    const fechaActual = new Date().toISOString().split('T')[0]
    setFechaIngreso(fechaActual)
    obtenerProximoNumeroFicha()
  }, [])

  // Cargar ficha odontológica cuando se selecciona un paciente
  useEffect(() => {
    const cargarFichaOdontologica = async () => {
      if (pacienteSeleccionado?.id) {
        try {
          console.log('Buscando ficha para paciente:', pacienteSeleccionado.id)
          const response = await fetch(`/api/fichas/paciente/${pacienteSeleccionado.id}`)
          
          if (response.ok) {
            const data = await response.json()
            console.log('Ficha encontrada:', data)
            setFichaOdontologica(data.ficha)
          } else {
            console.log('No se encontró ficha para este paciente')
            setFichaOdontologica(null)
          }
        } catch (error) {
          console.error('Error al cargar ficha:', error)
          setFichaOdontologica(null)
        }
      } else {
        setFichaOdontologica(null)
      }
    }

    cargarFichaOdontologica()
  }, [pacienteSeleccionado])

  // Cargar datos del paciente en el formulario cuando se selecciona
  useEffect(() => {
    if (pacienteSeleccionado) {
      setFormData({
        nombres: pacienteSeleccionado.nombres || '',
        apellidos: pacienteSeleccionado.apellidos || '',
        dni: pacienteSeleccionado.dni || '',
        fechaNacimiento: pacienteSeleccionado.fechaNacimiento ? 
          new Date(pacienteSeleccionado.fechaNacimiento).toISOString().split('T')[0] : '',
        edad: pacienteSeleccionado.edad?.toString() || '',
        sexo: pacienteSeleccionado.sexo || '',
        lugarNacimiento: pacienteSeleccionado.lugarNacimiento || '',
        domicilioActual: pacienteSeleccionado.direccionActual || '',
        celular: pacienteSeleccionado.telefono || '',
        acompanante: pacienteSeleccionado.acompanante || ''
      })
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

  // Función para eliminar paciente
  const eliminarPaciente = async () => {
    if (!pacienteSeleccionado) return

    const confirmar = window.confirm(`¿Estás seguro de eliminar al paciente ${pacienteSeleccionado.nombres} ${pacienteSeleccionado.apellidos}?`)
    
    if (!confirmar) return

    setLoading(true)
    setError('')

    try {
      const response = await fetch(`/api/pacientes/${pacienteSeleccionado.id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        alert('Paciente eliminado correctamente')
        cancelar() // Limpiar formulario
      } else {
        const data = await response.json()
        setError(data.error || 'Error al eliminar paciente')
      }
    } catch (error) {
      setError('Error al eliminar paciente')
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  // Función para calcular edad automáticamente
  const calcularEdad = (fechaNacimiento: string) => {
    if (!fechaNacimiento) return ''
    
    const hoy = new Date()
    const nacimiento = new Date(fechaNacimiento)
    let edad = hoy.getFullYear() - nacimiento.getFullYear()
    const mes = hoy.getMonth() - nacimiento.getMonth()
    
    if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate())) {
      edad--
    }
    
    return edad.toString()
  }

  // Manejar cambios en el formulario
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))

    // Calcular edad automáticamente cuando cambia la fecha de nacimiento
    if (name === 'fechaNacimiento') {
      const edad = calcularEdad(value)
      setFormData(prev => ({
        ...prev,
        edad
      }))
    }
  }

  // Función para guardar/actualizar paciente con validaciones
  const guardarPaciente = async () => {
    // Validar campos obligatorios
    if (!formData.nombres.trim()) {
      setError('El campo Nombres es obligatorio')
      return
    }
    if (!formData.apellidos.trim()) {
      setError('El campo Apellidos es obligatorio')
      return
    }
    if (!formData.dni.trim()) {
      setError('El campo DNI es obligatorio')
      return
    }

    try {
      setLoading(true)
      setError('')

      const method = pacienteSeleccionado ? 'PUT' : 'POST'
      const url = pacienteSeleccionado 
        ? `/api/pacientes/${pacienteSeleccionado.id}` 
        : '/api/pacientes'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          nombres: formData.nombres,
          apellidos: formData.apellidos,
          dni: formData.dni,
          fechaNacimiento: formData.fechaNacimiento ? new Date(formData.fechaNacimiento) : null,
          edad: formData.edad ? parseInt(formData.edad) : null,
          sexo: formData.sexo || null,
          telefono: formData.celular || null,
          lugarNacimiento: formData.lugarNacimiento || null,
          direccionActual: formData.domicilioActual || null,
          acompanante: formData.acompanante || null,
          numeroFicha: numeroFicha,
          fechaIngreso: fechaIngreso
        }),
      })

      const data = await response.json()

      if (response.ok) {
        alert(pacienteSeleccionado ? 'Paciente actualizado correctamente' : 'Paciente creado correctamente')
        setPacienteSeleccionado(data.paciente)
        
        // Si se creó una nueva ficha, almacenarla
        if (data.ficha) {
          setFichaOdontologica(data.ficha)
        }
        
        // Si es un nuevo paciente, obtener el siguiente número de ficha
        if (!pacienteSeleccionado) {
          obtenerProximoNumeroFicha()
        }
      } else {
        setError(data.error || 'Error al guardar paciente')
      }
    } catch (error) {
      setError('Error al guardar paciente')
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  // Función para cancelar y limpiar formulario
  const cancelar = () => {
    setFormData({
      nombres: '',
      apellidos: '',
      dni: '',
      fechaNacimiento: '',
      edad: '',
      sexo: '',
      lugarNacimiento: '',
      domicilioActual: '',
      celular: '',
      acompanante: ''
    })
    setPacienteSeleccionado(null)
    setFichaOdontologica(null)
    setBuscarDni('')
    setError('')
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center justify-between">
               
                <div className="flex items-center gap-4">
                <div> <h1 className="text-2xl font-semibold text-gray-900">CLÍNICA DENTAL SONRÍE</h1></div>
                </div>
            
            <div className="flex items-center gap-6 text-sm">
              <div className="flex items-center">
                <label className="font-medium text-gray-700">N° de Ficha:</label>
                <input
                  type="text"
                  value={numeroFicha}
                  onChange={(e) => setNumeroFicha(e.target.value)}
                  className="ml-2 border rounded px-2 py-1 w-24 bg-gray-100"
                  placeholder="000"
                  readOnly
                />
              </div>
              
              <div className="flex items-center">
                <label className="font-medium text-gray-700">Fecha de Ingreso:</label>
                <input
                  type="date"
                  value={fechaIngreso}
                  onChange={(e) => setFechaIngreso(e.target.value)}
                  className="ml-2 border rounded px-2 py-1 bg-gray-100"
                  readOnly
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto">
        {/* Buscador de paciente */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">
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
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? 'Buscando...' : 'Buscar'}
              </button>
            </div>
            
            <div className="text-sm text-gray-600">
              <strong>Paciente:</strong> {pacienteSeleccionado ? `${pacienteSeleccionado.nombres} ${pacienteSeleccionado.apellidos}` : 'No seleccionado'}
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-3 mt-4">
              <p className="text-red-800">{error}</p>
            </div>
          )}
        </div>

        {/* Contenedor principal con navegación de tabs */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          {/* Navegación de tabs */}
          <TabNavigation pacienteSeleccionado={pacienteSeleccionado} />

          {/* Formulario de Datos de Filiación */}
          <div className="p-6">
            <h2 className="text-lg font-semibold mb-4">1. DATOS DE FILIACIÓN</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Columna izquierda */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Apellidos:</label>
                  <input
                    type="text"
                    name="apellidos"
                    value={formData.apellidos}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Nombres:</label>
                  <input
                    type="text"
                    name="nombres"
                    value={formData.nombres}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">DNI:</label>
                  <input
                    type="text"
                    name="dni"
                    value={formData.dni}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Sexo:</label>
                  <select
                    name="sexo"
                    value={formData.sexo}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                  >
                    <option value="">Seleccione</option>
                    <option value="M">Masculino</option>
                    <option value="F">Femenino</option>
                    <option value="OTRO">Otro</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Domicilio Actual:</label>
                  <input
                    type="text"
                    name="domicilioActual"
                    value={formData.domicilioActual}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Persona que lo acompaña:</label>
                  <input
                    type="text"
                    name="acompanante"
                    value={formData.acompanante}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                  />
                </div>
              </div>

              {/* Columna derecha */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Fecha de Nacimiento:</label>
                  <input
                    type="date"
                    name="fechaNacimiento"
                    value={formData.fechaNacimiento}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Edad:</label>
                  <input
                    type="number"
                    name="edad"
                    value={formData.edad}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                    placeholder="Se calcula automáticamente"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Lugar de Nacimiento:</label>
                  <input
                    type="text"
                    name="lugarNacimiento"
                    value={formData.lugarNacimiento}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Celular:</label>
                  <input
                    type="text"
                    name="celular"
                    value={formData.celular}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                  />
                </div>
              </div>
            </div>

            {/* Botones de acción usando el componente reutilizable */}
            <ActionButtons 
              onGuardar={guardarPaciente}
              onCancelar={cancelar}
              onEliminar={eliminarPaciente}
              loading={loading}
              pacienteSeleccionado={!!pacienteSeleccionado}
            />

            {/* Botón para descargar PDF */}
            {pacienteSeleccionado && fichaOdontologica && (
              <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                <h3 className="text-sm font-medium text-green-800 mb-2">Ficha Odontológica</h3>
                <p className="text-xs text-green-600 mb-3">
                  Ficha ID: {fichaOdontologica.id} | Número: {fichaOdontologica.numeroFicha}
                </p>
                <BotonDescargarPDF 
                  fichaId={fichaOdontologica.id}
                  numeroFicha={fichaOdontologica.numeroFicha}
                />
              </div>
            )}

            {/* Mensaje si no hay ficha */}
            {pacienteSeleccionado && !fichaOdontologica && (
              <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-yellow-800 text-sm">
                  Este paciente no tiene una ficha odontológica creada.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}