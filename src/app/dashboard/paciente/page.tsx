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
      //AUMEMTADO EMAIL
        email: '' ,
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
      email: '',
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
                  
                  <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email:</label>
                  <input
                    type="text"
                    name="email"
                    value={formData.email}
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
//------------------NUEVO
// // app/dashboard/paciente/page.tsx
// 'use client'
// import { useState, useEffect } from 'react'
// import { usePaciente } from './hooks/usePaciente'
// import TabNavigation from './components/TabNavigation'
// import ActionButtons from './components/ActionButtons'
// import BotonDescargarPDF from '../../../components/BotonDescargarPDF'
// import { Search, User, Calendar, MapPin, Phone, Users, AlertCircle, CheckCircle, FileText } from 'lucide-react'

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

//   // Función para guardar/actualizar paciente con validaciones
//   const guardarPaciente = async () => {
//     // Validar campos obligatorios
//     if (!formData.nombres.trim()) {
//       setError('El campo Nombres es obligatorio')
//       return
//     }
//     if (!formData.apellidos.trim()) {
//       setError('El campo Apellidos es obligatorio')
//       return
//     }
//     if (!formData.dni.trim()) {
//       setError('El campo DNI es obligatorio')
//       return
//     }

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
        
//         // Si se creó una nueva ficha, almacenarla
//         if (data.ficha) {
//           setFichaOdontologica(data.ficha)
//         }
        
//         // Si es un nuevo paciente, obtener el siguiente número de ficha
//         if (!pacienteSeleccionado) {
//           obtenerProximoNumeroFicha()
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
//     setFichaOdontologica(null)
//     setBuscarDni('')
//     setError('')
//   }

//   return (
//     <div className="space-y-6">
//       {/* Header elegante */}
//       <div className="bg-gradient-to-r from-slate-800 to-slate-700 rounded-2xl shadow-xl p-6 text-white relative overflow-hidden">
//         <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-emerald-400/20 to-transparent rounded-bl-full"></div>
//         <div className="relative z-10">
//           <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
//             <div className="flex items-center gap-4">
//               <div className="p-3 bg-gradient-to-br from-emerald-500/30 to-teal-500/30 rounded-xl backdrop-blur-sm">
//                 <User className="h-6 w-6 text-emerald-300" />
//               </div>
//               <div>
//                 <h1 className="text-2xl font-bold">CLÍNICA DENTAL SONRÍE</h1>
//                 <p className="text-slate-300 text-sm mt-1">Sistema de Gestión de Pacientes</p>
//               </div>
//             </div>
            
//             <div className="flex flex-col sm:flex-row gap-4 text-sm">
//               <div className="bg-slate-700/50 backdrop-blur-sm rounded-xl px-4 py-3 border border-slate-600/30">
//                 <div className="flex items-center gap-2">
//                   <FileText className="h-4 w-4 text-emerald-400" />
//                   <span className="text-slate-300">N° de Ficha:</span>
//                   <input
//                     type="text"
//                     value={numeroFicha}
//                     onChange={(e) => setNumeroFicha(e.target.value)}
//                     className="bg-slate-800/50 border border-slate-600/50 rounded-lg px-2 py-1 w-20 text-white text-center font-mono"
//                     placeholder="000"
//                     readOnly
//                   />
//                 </div>
//               </div>
              
//               <div className="bg-slate-700/50 backdrop-blur-sm rounded-xl px-4 py-3 border border-slate-600/30">
//                 <div className="flex items-center gap-2">
//                   <Calendar className="h-4 w-4 text-teal-400" />
//                   <span className="text-slate-300">Fecha de Ingreso:</span>
//                   <input
//                     type="date"
//                     value={fechaIngreso}
//                     onChange={(e) => setFechaIngreso(e.target.value)}
//                     className="bg-slate-800/50 border border-slate-600/50 rounded-lg px-2 py-1 text-white"
//                     readOnly
//                   />
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Buscador de paciente */}
//       <div className="bg-white rounded-2xl shadow-lg border border-slate-200/60 p-6 relative overflow-hidden">
//         <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400"></div>
        
//         <div className="space-y-4">
//           <div className="flex items-center gap-3 mb-4">
//             <div className="p-2 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-lg">
//               <Search className="h-5 w-5 text-emerald-600" />
//             </div>
//             <h2 className="text-lg font-semibold text-slate-800">Búsqueda de Paciente</h2>
//           </div>
          
//           <div className="flex flex-col sm:flex-row gap-4">
//             <div className="flex-1">
//               <label className="block text-sm font-medium text-slate-700 mb-2">
//                 Buscar Paciente por DNI:
//               </label>
//               <div className="relative">
//                 <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
//                 <input
//                   type="text"
//                   value={buscarDni}
//                   onChange={(e) => setBuscarDni(e.target.value)}
//                   className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors duration-200"
//                   placeholder="Ingrese número de DNI"
//                 />
//               </div>
//             </div>
            
//             <div className="flex items-end">
//               <button
//                 onClick={buscarPaciente}
//                 disabled={loading}
//                 className="px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl hover:from-emerald-700 hover:to-teal-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium shadow-lg hover:shadow-xl"
//               >
//                 {loading ? (
//                   <div className="flex items-center gap-2">
//                     <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
//                     Buscando...
//                   </div>
//                 ) : (
//                   'Buscar'
//                 )}
//               </button>
//             </div>
//           </div>
          
//           {/* Estado del paciente */}
//           <div className="bg-gradient-to-r from-slate-50 to-slate-50/50 rounded-xl p-4 border border-slate-200">
//             <div className="flex items-center gap-3">
//               {pacienteSeleccionado ? (
//                 <>
//                   <CheckCircle className="h-5 w-5 text-emerald-600" />
//                   <div>
//                     <span className="font-medium text-slate-800">Paciente seleccionado:</span>
//                     <span className="ml-2 text-emerald-700 font-semibold">
//                       {pacienteSeleccionado.nombres} {pacienteSeleccionado.apellidos}
//                     </span>
//                   </div>
//                 </>
//               ) : (
//                 <>
//                   <AlertCircle className="h-5 w-5 text-slate-400" />
//                   <span className="text-slate-600">No hay paciente seleccionado</span>
//                 </>
//               )}
//             </div>
//           </div>
//         </div>

//         {/* Error message */}
//         {error && (
//           <div className="mt-4 bg-red-50 border border-red-200 rounded-xl p-4">
//             <div className="flex items-center gap-2">
//               <AlertCircle className="h-5 w-5 text-red-600" />
//               <p className="text-red-800 font-medium">{error}</p>
//             </div>
//           </div>
//         )}
//       </div>

//       {/* Contenedor principal con navegación de tabs */}
//       <div className="bg-white rounded-2xl shadow-lg border border-slate-200/60 relative overflow-hidden">
//         <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400"></div>
        
//         {/* Navegación de tabs */}
//         <TabNavigation pacienteSeleccionado={pacienteSeleccionado} />

//         {/* Formulario de Datos de Filiación */}
//         <div className="p-6 lg:p-8">
//           <div className="flex items-center gap-3 mb-6">
//             <div className="p-2 bg-gradient-to-br from-slate-100 to-slate-200 rounded-lg">
//               <Users className="h-5 w-5 text-slate-700" />
//             </div>
//             <h2 className="text-xl font-bold text-slate-800">1. DATOS DE FILIACIÓN</h2>
//           </div>
          
//           <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
//             {/* Columna izquierda */}
//             <div className="space-y-6">
//               <div>
//                 <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-2">
//                   <User className="h-4 w-4" />
//                   Apellidos: <span className="text-red-500">*</span>
//                 </label>
//                 <input
//                   type="text"
//                   name="apellidos"
//                   value={formData.apellidos}
//                   onChange={handleInputChange}
//                   className="w-full border border-slate-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors duration-200"
//                   placeholder="Apellidos del paciente"
//                 />
//               </div>
              
//               <div>
//                 <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-2">
//                   <User className="h-4 w-4" />
//                   Nombres: <span className="text-red-500">*</span>
//                 </label>
//                 <input
//                   type="text"
//                   name="nombres"
//                   value={formData.nombres}
//                   onChange={handleInputChange}
//                   className="w-full border border-slate-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors duration-200"
//                   placeholder="Nombres del paciente"
//                 />
//               </div>
              
//               <div>
//                 <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-2">
//                   <FileText className="h-4 w-4" />
//                   DNI: <span className="text-red-500">*</span>
//                 </label>
//                 <input
//                   type="text"
//                   name="dni"
//                   value={formData.dni}
//                   onChange={handleInputChange}
//                   className="w-full border border-slate-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors duration-200"
//                   placeholder="Número de DNI"
//                 />
//               </div>
              
//               <div>
//                 <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-2">
//                   <User className="h-4 w-4" />
//                   Sexo:
//                 </label>
//                 <select
//                   name="sexo"
//                   value={formData.sexo}
//                   onChange={handleInputChange}
//                   className="w-full border border-slate-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors duration-200"
//                 >
//                   <option value="">Seleccione</option>
//                   <option value="M">Masculino</option>
//                   <option value="F">Femenino</option>
//                   <option value="OTRO">Otro</option>
//                 </select>
//               </div>
              
//               <div>
//                 <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-2">
//                   <MapPin className="h-4 w-4" />
//                   Domicilio Actual:
//                 </label>
//                 <input
//                   type="text"
//                   name="domicilioActual"
//                   value={formData.domicilioActual}
//                   onChange={handleInputChange}
//                   className="w-full border border-slate-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors duration-200"
//                   placeholder="Dirección actual"
//                 />
//               </div>
              
//               <div>
//                 <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-2">
//                   <Users className="h-4 w-4" />
//                   Persona que lo acompaña:
//                 </label>
//                 <input
//                   type="text"
//                   name="acompanante"
//                   value={formData.acompanante}
//                   onChange={handleInputChange}
//                   className="w-full border border-slate-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors duration-200"
//                   placeholder="Nombre del acompañante"
//                 />
//               </div>
//             </div>

//             {/* Columna derecha */}
//             <div className="space-y-6">
//               <div>
//                 <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-2">
//                   <Calendar className="h-4 w-4" />
//                   Fecha de Nacimiento:
//                 </label>
//                 <input
//                   type="date"
//                   name="fechaNacimiento"
//                   value={formData.fechaNacimiento}
//                   onChange={handleInputChange}
//                   className="w-full border border-slate-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors duration-200"
//                 />
//               </div>
              
//               <div>
//                 <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-2">
//                   <User className="h-4 w-4" />
//                   Edad:
//                 </label>
//                 <input
//                   type="number"
//                   name="edad"
//                   value={formData.edad}
//                   onChange={handleInputChange}
//                   className="w-full border border-slate-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors duration-200 bg-slate-50"
//                   placeholder="Se calcula automáticamente"
//                   readOnly
//                 />
//               </div>
              
//               <div>
//                 <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-2">
//                   <MapPin className="h-4 w-4" />
//                   Lugar de Nacimiento:
//                 </label>
//                 <input
//                   type="text"
//                   name="lugarNacimiento"
//                   value={formData.lugarNacimiento}
//                   onChange={handleInputChange}
//                   className="w-full border border-slate-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors duration-200"
//                   placeholder="Ciudad/País de nacimiento"
//                 />
//               </div>
              
//               <div>
//                 <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-2">
//                   <Phone className="h-4 w-4" />
//                   Celular:
//                 </label>
//                 <input
//                   type="text"
//                   name="celular"
//                   value={formData.celular}
//                   onChange={handleInputChange}
//                   className="w-full border border-slate-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors duration-200"
//                   placeholder="Número de celular"
//                 />
//               </div>
//             </div>
//           </div>

//           {/* Botones de acción */}
//           <ActionButtons 
//             onGuardar={guardarPaciente}
//             onCancelar={cancelar}
//             onEliminar={eliminarPaciente}
//             loading={loading}
//             pacienteSeleccionado={!!pacienteSeleccionado}
//           />

//           {/* Estado de ficha odontológica */}
//           {pacienteSeleccionado && (
//             <div className="mt-8 space-y-4">
//               {fichaOdontologica ? (
//                 <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-xl p-6">
//                   <div className="flex items-start gap-4">
//                     <div className="p-2 bg-emerald-100 rounded-lg">
//                       <CheckCircle className="h-6 w-6 text-emerald-600" />
//                     </div>
//                     <div className="flex-1">
//                       <h3 className="text-lg font-semibold text-emerald-800 mb-2">Ficha Odontológica</h3>
//                       <div className="space-y-2 text-sm text-emerald-700">
//                         <p><span className="font-medium">ID de Ficha:</span> {fichaOdontologica.id}</p>
//                         <p><span className="font-medium">Número:</span> {fichaOdontologica.numeroFicha}</p>
//                       </div>
//                       <div className="mt-4">
//                         <BotonDescargarPDF 
//                           fichaId={fichaOdontologica.id}
//                           numeroFicha={fichaOdontologica.numeroFicha}
//                         />
//                       </div>
//                     </div>
//                   </div>
//                 </div>
//               ) : (
//                 <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-6">
//                   <div className="flex items-center gap-4">
//                     <div className="p-2 bg-amber-100 rounded-lg">
//                       <AlertCircle className="h-6 w-6 text-amber-600" />
//                     </div>
//                     <div>
//                       <h3 className="text-lg font-semibold text-amber-800">Sin Ficha Odontológica</h3>
//                       <p className="text-amber-700 text-sm mt-1">
//                         Este paciente no tiene una ficha odontológica creada.
//                       </p>
//                     </div>
//                   </div>
//                 </div>
//               )}
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   )
// }