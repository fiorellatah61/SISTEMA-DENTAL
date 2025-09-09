// // app/dashboard/paciente/page.tsx
// 'use client'
// import { useState, useEffect } from 'react'
// import { usePaciente } from './hooks/usePaciente'
// import TabNavigation from './components/TabNavigation'
// import ActionButtons from './components/ActionButtons'
// import BotonDescargarPDF from '../../../components/BotonDescargarPDF'

// // Definir interfaz para fichaOdontologica
// interface FichaOdontologica {
//   id: string
//   numeroFicha: string
//   // Agrega otras propiedades si las necesitas
// }

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
  
//   // Estado para almacenar la ficha odontológica con tipo explícito
//   const [fichaOdontologica, setFichaOdontologica] = useState<FichaOdontologica | null>(null)
  
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
//       //AUMEMTADO EMAIL
//         email: '' ,
//     acompanante: ''
//   })

//   // Cargar fecha actual y próximo número de ficha al iniciar
//   useEffect(() => {
//     const fechaActual = new Date().toISOString().split('T')[0]
//     setFechaIngreso(fechaActual)
//     obtenerProximoNumeroFicha()
//   }, [])

//   // Cargar ficha odontológica cuando se selecciona un paciente
//   useEffect(() => {
//     const cargarFichaOdontologica = async () => {
//       if (pacienteSeleccionado?.id) {
//         try {
//           console.log('Buscando ficha para paciente:', pacienteSeleccionado.id)
//           const response = await fetch(`/api/fichas/paciente/${pacienteSeleccionado.id}`)
          
//           if (response.ok) {
//             const data = await response.json()
//             console.log('Ficha encontrada:', data)
//             setFichaOdontologica(data.ficha)
//           } else {
//             console.log('No se encontró ficha para este paciente')
//             setFichaOdontologica(null)
//           }
//         } catch (error) {
//           console.error('Error al cargar ficha:', error)
//           setFichaOdontologica(null)
//         }
//       } else {
//         setFichaOdontologica(null)
//       }
//     }

//     cargarFichaOdontologica()
//   }, [pacienteSeleccionado])

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
//         email: pacienteSeleccionado.email || '',
//         acompanante: pacienteSeleccionado.acompanante || ''
//       })
//     }
//   }, [pacienteSeleccionado])

//   // Función para obtener el próximo número de ficha
//   const obtenerProximoNumeroFicha = async () => {
//     try {
//       const response = await fetch('/api/ficha/proximo-numero')
//       const data = await response.json()
//       if (response.ok) {
//         setNumeroFicha(data.proximoNumero)
//       }
//     } catch (error) {
//       console.error('Error al obtener próximo número de ficha:', error)
//     }
//   }

//   // Función para eliminar paciente
//   const eliminarPaciente = async () => {
//     if (!pacienteSeleccionado) return

//     const confirmar = window.confirm(`¿Estás seguro de eliminar al paciente ${pacienteSeleccionado.nombres} ${pacienteSeleccionado.apellidos}?`)
    
//     if (!confirmar) return

//     setLoading(true)
//     setError('')

//     try {
//       const response = await fetch(`/api/pacientes/${pacienteSeleccionado.id}`, {
//         method: 'DELETE',
//       })

//       if (response.ok) {
//         alert('Paciente eliminado correctamente')
//         cancelar() // Limpiar formulario
//       } else {
//         const data = await response.json()
//         setError(data.error || 'Error al eliminar paciente')
//       }
//     } catch (error) {
//       setError('Error al eliminar paciente')
//       console.error('Error:', error)
//     } finally {
//       setLoading(false)
//     }
//   }

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

//   // // Función para guardar/actualizar paciente con validaciones
//   // const guardarPaciente = async () => {
//   //   // Validar campos obligatorios
//   //   if (!formData.nombres.trim()) {
//   //     setError('El campo Nombres es obligatorio')
//   //     return
//   //   }
//   //   if (!formData.apellidos.trim()) {
//   //     setError('El campo Apellidos es obligatorio')
//   //     return
//   //   }
//   //   if (!formData.dni.trim()) {
//   //     setError('El campo DNI es obligatorio')
//   //     return
//   //   }

//   //   try {
//   //     setLoading(true)
//   //     setError('')

//   //     const method = pacienteSeleccionado ? 'PUT' : 'POST'
//   //     const url = pacienteSeleccionado 
//   //       ? `/api/pacientes/${pacienteSeleccionado.id}` 
//   //       : '/api/pacientes'

//   //     const response = await fetch(url, {
//   //       method,
//   //       headers: {
//   //         'Content-Type': 'application/json',
//   //       },
//   //       body: JSON.stringify({
//   //         nombres: formData.nombres,
//   //         apellidos: formData.apellidos,
//   //         dni: formData.dni,
//   //         fechaNacimiento: formData.fechaNacimiento ? new Date(formData.fechaNacimiento) : null,
//   //         edad: formData.edad ? parseInt(formData.edad) : null,
//   //         sexo: formData.sexo || null,
//   //         telefono: formData.celular || null,
//   //         email: formData.email || null,
//   //         lugarNacimiento: formData.lugarNacimiento || null,
//   //         direccionActual: formData.domicilioActual || null,
//   //         acompanante: formData.acompanante || null,
//   //         numeroFicha: numeroFicha,
//   //         fechaIngreso: fechaIngreso
//   //       }),
//   //     })

//   //     const data = await response.json()

//   //     if (response.ok) {
//   //       alert(pacienteSeleccionado ? 'Paciente actualizado correctamente' : 'Paciente creado correctamente')
//   //       setPacienteSeleccionado(data.paciente)
        
//   //       // Si se creó una nueva ficha, almacenarla
//   //       if (data.ficha) {
//   //         setFichaOdontologica(data.ficha)
//   //       }
        
//   //       // Si es un nuevo paciente, obtener el siguiente número de ficha
//   //       if (!pacienteSeleccionado) {
//   //         obtenerProximoNumeroFicha()
//   //       }
//   //     } else {
//   //       setError(data.error || 'Error al guardar paciente')
//   //     }
//   //   } catch (error) {
//   //     setError('Error al guardar paciente')
//   //     console.error('Error:', error)
//   //   } finally {
//   //     setLoading(false)
//   //   }
//   // }
//   // Función para guardar/actualizar paciente con validaciones
// const guardarPaciente = async () => {
//   // Validar campos obligatorios
//   if (!formData.nombres.trim()) {
//     setError('El campo Nombres es obligatorio')
//     return
//   }
//   if (!formData.apellidos.trim()) {
//     setError('El campo Apellidos es obligatorio')
//     return
//   }
//   if (!formData.dni.trim()) {
//     setError('El campo DNI es obligatorio')
//     return
//   }

//   try {
//     setLoading(true)
//     setError('')

//     const method = pacienteSeleccionado ? 'PUT' : 'POST'
//     const url = pacienteSeleccionado 
//       ? `/api/pacientes/${pacienteSeleccionado.id}` 
//       : '/api/pacientes'

//     const response = await fetch(url, {
//       method,
//       headers: {
//         'Content-Type': 'application/json',
//       },
//       body: JSON.stringify({
//         nombres: formData.nombres,
//         apellidos: formData.apellidos,
//         dni: formData.dni,
//         fechaNacimiento: formData.fechaNacimiento ? new Date(formData.fechaNacimiento) : null,
//         edad: formData.edad ? parseInt(formData.edad) : null,
//         sexo: formData.sexo || null,
//         telefono: formData.celular || null,
//         email: formData.email || null,
//         lugarNacimiento: formData.lugarNacimiento || null,
//         direccionActual: formData.domicilioActual || null,
//         acompanante: formData.acompanante || null,
//         numeroFicha: numeroFicha,
//         fechaIngreso: fechaIngreso
//       }),
//     })

//     const data = await response.json()

//     if (response.ok) {
//       // Mostrar mensaje personalizado según el resultado
//       if (data.ficha && pacienteSeleccionado && !fichaOdontologica) {
//         alert('Paciente actualizado correctamente y ficha odontológica creada automáticamente')
//       } else if (pacienteSeleccionado) {
//         alert('Paciente actualizado correctamente')
//       } else {
//         alert('Paciente creado correctamente')
//       }
      
//       setPacienteSeleccionado(data.paciente)
      
//       // Si se creó una nueva ficha, almacenarla
//       if (data.ficha) {
//         setFichaOdontologica(data.ficha)
//         console.log('Ficha odontológica:', data.ficha.numeroFicha)
//       }
      
//       // Si es un nuevo paciente, obtener el siguiente número de ficha
//       if (!pacienteSeleccionado) {
//         obtenerProximoNumeroFicha()
//       }
//     } else {
//       setError(data.error || 'Error al guardar paciente')
//     }
//   } catch (error) {
//     setError('Error al guardar paciente')
//     console.error('Error:', error)
//   } finally {
//     setLoading(false)
//   }
// }

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
//       email: '',
//       acompanante: ''
//     })
//     setPacienteSeleccionado(null)
//     setFichaOdontologica(null)
//     setBuscarDni('')
//     setError('')
//   }

//   return (
//     <div className="min-h-screen bg-gray-50 p-6">
//       {/* Header */}
//       <div className="max-w-7xl mx-auto">
//         <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
//           <div className="flex items-center justify-between">
               
//                 <div className="flex items-center gap-4">
//                 <div> <h1 className="text-2xl font-semibold text-gray-900">CLÍNICA DENTAL SONRÍE</h1></div>
//                 </div>
            
//             <div className="flex items-center gap-6 text-sm">
//               <div className="flex items-center">
//                 <label className="font-medium text-gray-700">N° de Ficha:</label>
//                 <input
//                   type="text"
//                   value={numeroFicha}
//                   onChange={(e) => setNumeroFicha(e.target.value)}
//                   className="ml-2 border rounded px-2 py-1 w-24 bg-gray-100"
//                   placeholder="000"
//                   readOnly
//                 />
//               </div>
              
//               <div className="flex items-center">
//                 <label className="font-medium text-gray-700">Fecha de Ingreso:</label>
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

//       <div className="max-w-7xl mx-auto">
//         {/* Buscador de paciente */}
//         <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
//           <div className="space-y-4">
//             <div className="flex items-center gap-4">
//               <div className="flex-1">
//                 <label className="block text-sm font-medium text-gray-700 mb-2">
//                   Buscar Paciente por DNI:
//                 </label>
//                 <input
//                   type="text"
//                   value={buscarDni}
//                   onChange={(e) => setBuscarDni(e.target.value)}
//                   className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
//                   placeholder="Ingrese DNI"
//                 />
//               </div>
              
//               <button
//                 onClick={buscarPaciente}
//                 disabled={loading}
//                 className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
//               >
//                 {loading ? 'Buscando...' : 'Buscar'}
//               </button>
//             </div>
            
//             <div className="text-sm text-gray-600">
//               <strong>Paciente:</strong> {pacienteSeleccionado ? `${pacienteSeleccionado.nombres} ${pacienteSeleccionado.apellidos}` : 'No seleccionado'}
//             </div>
//           </div>

//           {error && (
//             <div className="bg-red-50 border border-red-200 rounded-md p-3 mt-4">
//               <p className="text-red-800">{error}</p>
//             </div>
//           )}
//         </div>

//         {/* Contenedor principal con navegación de tabs */}
//         <div className="bg-white rounded-lg shadow-sm border border-gray-200">
//           {/* Navegación de tabs */}
//           <TabNavigation pacienteSeleccionado={pacienteSeleccionado} />

//           {/* Formulario de Datos de Filiación */}
//           <div className="p-6">
//             <h2 className="text-lg font-semibold mb-4">1. DATOS DE FILIACIÓN</h2>
            
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//               {/* Columna izquierda */}
//               <div className="space-y-4">
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-2">Apellidos:</label>
//                   <input
//                     type="text"
//                     name="apellidos"
//                     value={formData.apellidos}
//                     onChange={handleInputChange}
//                     className="w-full border border-gray-300 rounded-md px-3 py-2"
//                   />
//                 </div>
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-2">Nombres:</label>
//                   <input
//                     type="text"
//                     name="nombres"
//                     value={formData.nombres}
//                     onChange={handleInputChange}
//                     className="w-full border border-gray-300 rounded-md px-3 py-2"
//                   />
//                 </div>
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-2">DNI:</label>
//                   <input
//                     type="text"
//                     name="dni"
//                     value={formData.dni}
//                     onChange={handleInputChange}
//                     className="w-full border border-gray-300 rounded-md px-3 py-2"
//                   />
//                 </div>
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-2">Sexo:</label>
//                   <select
//                     name="sexo"
//                     value={formData.sexo}
//                     onChange={handleInputChange}
//                     className="w-full border border-gray-300 rounded-md px-3 py-2"
//                   >
//                     <option value="">Seleccione</option>
//                     <option value="M">Masculino</option>
//                     <option value="F">Femenino</option>
//                     <option value="OTRO">Otro</option>
//                   </select>
//                 </div>
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-2">Domicilio Actual:</label>
//                   <input
//                     type="text"
//                     name="domicilioActual"
//                     value={formData.domicilioActual}
//                     onChange={handleInputChange}
//                     className="w-full border border-gray-300 rounded-md px-3 py-2"
//                   />
//                 </div>
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-2">Persona que lo acompaña:</label>
//                   <input
//                     type="text"
//                     name="acompanante"
//                     value={formData.acompanante}
//                     onChange={handleInputChange}
//                     className="w-full border border-gray-300 rounded-md px-3 py-2"
//                   />
//                 </div>
//               </div>

//               {/* Columna derecha */}
//               <div className="space-y-4">
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-2">Fecha de Nacimiento:</label>
//                   <input
//                     type="date"
//                     name="fechaNacimiento"
//                     value={formData.fechaNacimiento}
//                     onChange={handleInputChange}
//                     className="w-full border border-gray-300 rounded-md px-3 py-2"
//                   />
//                 </div>
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-2">Edad:</label>
//                   <input
//                     type="number"
//                     name="edad"
//                     value={formData.edad}
//                     onChange={handleInputChange}
//                     className="w-full border border-gray-300 rounded-md px-3 py-2"
//                     placeholder="Se calcula automáticamente"
//                   />
//                 </div>
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-2">Lugar de Nacimiento:</label>
//                   <input
//                     type="text"
//                     name="lugarNacimiento"
//                     value={formData.lugarNacimiento}
//                     onChange={handleInputChange}
//                     className="w-full border border-gray-300 rounded-md px-3 py-2"
//                   />
//                 </div>
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-2">Celular:</label>
//                   <input
//                     type="text"
//                     name="celular"
//                     value={formData.celular}
//                     onChange={handleInputChange}
//                     className="w-full border border-gray-300 rounded-md px-3 py-2"
//                   />
//                 </div>
                  
//                   <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-2">Email:</label>
//                   <input
//                     type="text"
//                     name="email"
//                     value={formData.email}
//                     onChange={handleInputChange}
//                     className="w-full border border-gray-300 rounded-md px-3 py-2"
//                   />
//                 </div>
//               </div>
//             </div>

//             {/* Botones de acción usando el componente reutilizable */}
//             <ActionButtons 
//               onGuardar={guardarPaciente}
//               onCancelar={cancelar}
//               onEliminar={eliminarPaciente}
//               loading={loading}
//               pacienteSeleccionado={!!pacienteSeleccionado}
//             />

//             {/* Botón para descargar PDF */}
//             {pacienteSeleccionado && fichaOdontologica && (
//               <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
//                 <h3 className="text-sm font-medium text-green-800 mb-2">Ficha Odontológica</h3>
//                 <p className="text-xs text-green-600 mb-3">
//                   Ficha ID: {fichaOdontologica.id} | Número: {fichaOdontologica.numeroFicha}
//                 </p>
//                 <BotonDescargarPDF 
//                   fichaId={fichaOdontologica.id}
//                   numeroFicha={fichaOdontologica.numeroFicha}
//                 />
//               </div>
//             )}

//             {/* Mensaje si no hay ficha */}
//             {pacienteSeleccionado && !fichaOdontologica && (
//               <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
//                 <p className="text-yellow-800 text-sm">
//                   Este paciente no tiene una ficha odontológica creada.
//                 </p>
//               </div>
//             )}
//           </div>
//         </div>
//       </div>
//     </div>
//   )
// }




// app/dashboard/paciente/page.tsx
// app/dashboard/paciente/page.tsx
'use client'
import { useState, useEffect } from 'react'
import { usePaciente } from './hooks/usePaciente'
import TabNavigation from './components/TabNavigation'
import ActionButtons from './components/ActionButtons'
import BotonDescargarPDF from '../../../components/BotonDescargarPDF'
import { FileText, Search, Users, Calendar, MapPin, Phone, Mail, User } from 'lucide-react'

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
    email: '',
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
        email: pacienteSeleccionado.email || '',
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
          email: formData.email || null,
          lugarNacimiento: formData.lugarNacimiento || null,
          direccionActual: formData.domicilioActual || null,
          acompanante: formData.acompanante || null,
          numeroFicha: numeroFicha,
          fechaIngreso: fechaIngreso
        }),
      })

      const data = await response.json()

      if (response.ok) {
        // Mostrar mensaje personalizado según el resultado
        if (data.ficha && pacienteSeleccionado && !fichaOdontologica) {
          alert('Paciente actualizado correctamente y ficha odontológica creada automáticamente')
        } else if (pacienteSeleccionado) {
          alert('Paciente actualizado correctamente')
        } else {
          alert('Paciente creado correctamente')
        }
        
        setPacienteSeleccionado(data.paciente)
        
        // Si se creó una nueva ficha, almacenarla
        if (data.ficha) {
          setFichaOdontologica(data.ficha)
          console.log('Ficha odontológica:', data.ficha.numeroFicha)
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
      email: '',
      acompanante: ''
    })
    setPacienteSeleccionado(null)
    setFichaOdontologica(null)
    setBuscarDni('')
    setError('')
  }

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
            <p className="text-xs text-slate-600">Gestiona los datos de los pacientes</p>
          </div>
        </div>
        
        {/* Info de ficha y fecha - Ultra compacta */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 text-xs">
          <div className="flex items-center space-x-1">
            <FileText className="h-3 w-3 text-slate-500" />
            <span className="font-medium text-slate-700">Ficha:</span>
            <input
              type="text"
              value={numeroFicha}
              onChange={(e) => setNumeroFicha(e.target.value)}
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
              onChange={(e) => setFechaIngreso(e.target.value)}
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

        {/* Alert de error compacto */}
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

      {/* Contenedor principal con navegación de tabs */}
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
        {/* Navegación de tabs */}
        <TabNavigation pacienteSeleccionado={pacienteSeleccionado} />

        {/* Formulario de Datos de Filiación */}
        <div className="p-4">
          <div className="flex items-center space-x-2 mb-4">
            <div className="p-1 bg-slate-100 rounded">
              <FileText className="h-4 w-4 text-slate-600" />
            </div>
            <h2 className="text-base font-bold text-slate-900">1. DATOS DE FILIACIÓN</h2>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Columna izquierda */}
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Apellidos:</label>
                <input
                  type="text"
                  name="apellidos"
                  value={formData.apellidos}
                  onChange={handleInputChange}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors duration-200"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Nombres:</label>
                <input
                  type="text"
                  name="nombres"
                  value={formData.nombres}
                  onChange={handleInputChange}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors duration-200"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">DNI:</label>
                <input
                  type="text"
                  name="dni"
                  value={formData.dni}
                  onChange={handleInputChange}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors duration-200"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Sexo:</label>
                <select
                  name="sexo"
                  value={formData.sexo}
                  onChange={handleInputChange}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors duration-200"
                >
                  <option value="">Seleccione</option>
                  <option value="M">Masculino</option>
                  <option value="F">Femenino</option>
                  <option value="OTRO">Otro</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center space-x-1">
                  <MapPin className="h-3 w-3 text-slate-500" />
                  <span>Domicilio Actual:</span>
                </label>
                <input
                  type="text"
                  name="domicilioActual"
                  value={formData.domicilioActual}
                  onChange={handleInputChange}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors duration-200"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Persona que lo acompaña:</label>
                <input
                  type="text"
                  name="acompanante"
                  value={formData.acompanante}
                  onChange={handleInputChange}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors duration-200"
                />
              </div>
            </div>

            {/* Columna derecha */}
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center space-x-1">
                  <Calendar className="h-3 w-3 text-slate-500" />
                  <span>Fecha de Nacimiento:</span>
                </label>
                <input
                  type="date"
                  name="fechaNacimiento"
                  value={formData.fechaNacimiento}
                  onChange={handleInputChange}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors duration-200"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Edad:</label>
                <input
                  type="number"
                  name="edad"
                  value={formData.edad}
                  onChange={handleInputChange}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors duration-200"
                  placeholder="Se calcula automáticamente"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Lugar de Nacimiento:</label>
                <input
                  type="text"
                  name="lugarNacimiento"
                  value={formData.lugarNacimiento}
                  onChange={handleInputChange}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors duration-200"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center space-x-1">
                  <Phone className="h-3 w-3 text-slate-500" />
                  <span>Celular:</span>
                </label>
                <input
                  type="text"
                  name="celular"
                  value={formData.celular}
                  onChange={handleInputChange}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors duration-200"
                />
              </div>
              
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center space-x-1">
                  <Mail className="h-3 w-3 text-slate-500" />
                  <span>Email:</span>
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors duration-200"
                />
              </div>
            </div>
          </div>

          {/* Botones de acción usando el componente reutilizable */}
          <div className="mt-5 pt-4 border-t border-slate-200">
            <ActionButtons 
              onGuardar={guardarPaciente}
              onCancelar={cancelar}
              onEliminar={eliminarPaciente}
              loading={loading}
              pacienteSeleccionado={!!pacienteSeleccionado}
            />
          </div>

          {/* Botón para descargar PDF - compacto */}
          {pacienteSeleccionado && fichaOdontologica && (
            <div className="mt-4 p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
              <div className="flex items-start space-x-2">
                <div className="p-1 bg-emerald-100 rounded">
                  <FileText className="h-4 w-4 text-emerald-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xs font-bold text-emerald-800 mb-1">Ficha Odontológica</h3>
                  <p className="text-xs text-emerald-600 mb-2">
                    ID: {fichaOdontologica.id} | N°: {fichaOdontologica.numeroFicha}
                  </p>
                  <BotonDescargarPDF 
                    fichaId={fichaOdontologica.id}
                    numeroFicha={fichaOdontologica.numeroFicha}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Mensaje si no hay ficha - compacto */}
          {pacienteSeleccionado && !fichaOdontologica && (
            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-center space-x-2">
                <div className="p-1 bg-yellow-100 rounded">
                  <FileText className="h-4 w-4 text-yellow-600" />
                </div>
                <div>
                  <p className="text-yellow-800 text-xs font-medium">
                    Este paciente no tiene una ficha odontológica creada.
                  </p>
                  <p className="text-yellow-700 text-xs mt-0.5">
                    Se creará automáticamente al guardar los datos.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}