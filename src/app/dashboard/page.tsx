// // // src/app/dashboard/page.tsx
// 'use client'

// import { useState, useEffect } from 'react'
// import { 
//   Users, 
//   Calendar, 
//   FileText, 
//   DollarSign, 
//   Activity,
//   TrendingUp,
//   Clock,
//   AlertCircle,
//   CheckCircle2,
//   XCircle
// } from 'lucide-react'

// // Importaciones de shadcn/ui
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
// import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
// import { Badge } from '@/components/ui/badge'

// // Importaciones de Recharts para gráficos
// import {
//   LineChart,
//   Line,
//   BarChart,
//   Bar,
//   PieChart,
//   Pie,
//   Cell,
//   XAxis,
//   YAxis,
//   CartesianGrid,
//   Tooltip,
//   Legend,
//   ResponsiveContainer,
//   AreaChart,
//   Area
// } from 'recharts'

// // Interfaces para tipado
// interface DashboardStats {
//   totalPacientes: number
//   pacientesNuevosHoy: number
//   citasHoy: number
//   citasPendientes: number
//   ingresosMensuales: number
//   fichasActivas: number
//   citasPorEstado: {
//     confirmadas: number
//     pendientes: number
//     canceladas: number
//   }
// }

// interface CitasPorMes {
//   mes: string
//   citas: number
//   ingresos: number
// }

// interface PacientesPorEdad {
//   rango: string
//   cantidad: number
//   porcentaje: number
// }

// interface TratamientosMasComunes {
//   tratamiento: string
//   cantidad: number
//   ingresos: number
// }

// export default function DashboardPage() {
//   // Estados para los datos del dashboard
//   const [stats, setStats] = useState<DashboardStats>({
//     totalPacientes: 0,
//     pacientesNuevosHoy: 0,
//     citasHoy: 0,
//     citasPendientes: 0,
//     ingresosMensuales: 0,
//     fichasActivas: 0,
//     citasPorEstado: {
//       confirmadas: 0,
//       pendientes: 0,
//       canceladas: 0
//     }
//   })

//   const [citasPorMes, setCitasPorMes] = useState<CitasPorMes[]>([])
//   const [pacientesPorEdad, setPacientesPorEdad] = useState<PacientesPorEdad[]>([])
//   const [tratamientosMasComunes, setTratamientosMasComunes] = useState<TratamientosMasComunes[]>([])
//   const [loading, setLoading] = useState(true)

//   // useEffect para cargar datos al montar el componente
//   useEffect(() => {
//     cargarDatosDashboard()
//   }, [])

//   // Función principal para cargar todos los datos del dashboard
//   const cargarDatosDashboard = async () => {
//     try {
//       setLoading(true)
      
//       // Llamadas simultáneas a todas las APIs para optimizar rendimiento
//       await Promise.all([
//         cargarEstadisticasGenerales(),
//         cargarCitasPorMes(),
//         cargarPacientesPorEdad(),
//         cargarTratamientosMasComunes()
//       ])
      
//     } catch (error) {
//       console.error('Error al cargar datos del dashboard:', error)
//     } finally {
//       setLoading(false)
//     }
//   }

//   // Cargar estadísticas generales (tarjetas superiores)
//   const cargarEstadisticasGenerales = async () => {
//     try {
//       const response = await fetch('/api/dashboard/stats')
//       if (response.ok) {
//         const data = await response.json()
//         setStats(data)
//       }
//     } catch (error) {
//       console.error('Error al cargar estadísticas generales:', error)
//       // Datos de ejemplo en caso de error
//       setStats({
//         totalPacientes: 1247,
//         pacientesNuevosHoy: 8,
//         citasHoy: 12,
//         citasPendientes: 25,
//         ingresosMensuales: 15420.50,
//         fichasActivas: 1198,
//         citasPorEstado: {
//           confirmadas: 45,
//           pendientes: 25,
//           canceladas: 8
//         }
//       })
//     }
//   }

//   // Cargar datos de citas por mes para el gráfico de líneas
//   const cargarCitasPorMes = async () => {
//     try {
//       const response = await fetch('/api/dashboard/citas-por-mes')
//       if (response.ok) {
//         const data = await response.json()
//         setCitasPorMes(data)
//       }
//     } catch (error) {
//       console.error('Error al cargar citas por mes:', error)
//       // Datos de ejemplo
//       setCitasPorMes([
//         { mes: 'Ene', citas: 65, ingresos: 4500 },
//         { mes: 'Feb', citas: 78, ingresos: 5200 },
//         { mes: 'Mar', citas: 85, ingresos: 5800 },
//         { mes: 'Abr', citas: 92, ingresos: 6100 },
//         { mes: 'May', citas: 88, ingresos: 5900 },
//         { mes: 'Jun', citas: 105, ingresos: 7200 },
//         { mes: 'Jul', citas: 110, ingresos: 7500 },
//         { mes: 'Ago', citas: 125, ingresos: 8200 }
//       ])
//     }
//   }

//   // Cargar distribución de pacientes por edad para gráfico circular
//   const cargarPacientesPorEdad = async () => {
//     try {
//       const response = await fetch('/api/dashboard/pacientes-por-edad')
//       if (response.ok) {
//         const data = await response.json()
//         setPacientesPorEdad(data)
//       }
//     } catch (error) {
//       console.error('Error al cargar pacientes por edad:', error)
//       // Datos de ejemplo
//       setPacientesPorEdad([
//         { rango: '0-18', cantidad: 245, porcentaje: 19.6 },
//         { rango: '19-35', cantidad: 387, porcentaje: 31.0 },
//         { rango: '36-50', cantidad: 298, porcentaje: 23.9 },
//         { rango: '51-65', cantidad: 201, porcentaje: 16.1 },
//         { rango: '65+', cantidad: 116, porcentaje: 9.3 }
//       ])
//     }
//   }

//   // Cargar tratamientos más comunes para gráfico de barras
//   const cargarTratamientosMasComunes = async () => {
//     try {
//       const response = await fetch('/api/dashboard/tratamientos-comunes')
//       if (response.ok) {
//         const data = await response.json()
//         setTratamientosMasComunes(data)
//       }
//     } catch (error) {
//       console.error('Error al cargar tratamientos más comunes:', error)
//       // Datos de ejemplo
//       setTratamientosMasComunes([
//         { tratamiento: 'Limpieza Dental', cantidad: 245, ingresos: 12250 },
//         { tratamiento: 'Obturación', cantidad: 187, ingresos: 18700 },
//         { tratamiento: 'Endodoncia', cantidad: 92, ingresos: 27600 },
//         { tratamiento: 'Extracción', cantidad: 78, ingresos: 7800 },
//         { tratamiento: 'Ortodoncia', cantidad: 45, ingresos: 67500 },
//         { tratamiento: 'Implante', cantidad: 23, ingresos: 34500 }
//       ])
//     }
//   }

//   // Colores personalizados para los gráficos
//   const COLORES_GRAFICOS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d']

//   // Componente de tarjeta de estadística reutilizable
//   const TarjetaEstadistica = ({ 
//     titulo, 
//     valor, 
//     descripcion, 
//     icono: Icono, 
//     tendencia, 
//     color = 'blue' 
//   }: {
//     titulo: string
//     valor: string | number
//     descripcion: string
//     icono: any
//     tendencia?: string
//     color?: string
//   }) => (
//     <Card className="hover:shadow-lg transition-shadow duration-200">
//       <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//         <CardTitle className="text-sm font-medium text-muted-foreground">
//           {titulo}
//         </CardTitle>
//         <Icono className={`h-4 w-4 text-${color}-600`} />
//       </CardHeader>
//       <CardContent>
//         <div className="text-2xl font-bold">
//           {typeof valor === 'number' && titulo.includes('Ingresos') 
//             ? `S/ ${valor.toLocaleString()}` 
//             : valor.toLocaleString()
//           }
//         </div>
//         <div className="flex items-center text-xs text-muted-foreground mt-1">
//           {tendencia && (
//             <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
//           )}
//           {descripcion}
//         </div>
//       </CardContent>
//     </Card>
//   )

//   if (loading) {
//     return (
//       <div className="flex items-center justify-center min-h-screen">
//         <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
//         <span className="ml-2 text-gray-600">Cargando dashboard...</span>
//       </div>
//     )
//   }

//   return (
//     <div className="min-h-screen bg-gray-50 p-4 md:p-6 lg:p-8">
//       {/* Header del Dashboard */}
//       <div className="mb-8">
//         <h1 className="text-3xl font-bold text-gray-900 mb-2">
//           Dashboard - Clínica Dental Sonríe
//         </h1>
//         <p className="text-gray-600">
//           Resumen general de la actividad de la clínica
//         </p>
//       </div>

//       {/* Tarjetas de Estadísticas Principales */}
//       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
//         <TarjetaEstadistica
//           titulo="Total Pacientes"
//           valor={stats.totalPacientes}
//           descripcion="Pacientes registrados"
//           icono={Users}
//           color="blue"
//         />
        
//         <TarjetaEstadistica
//           titulo="Citas Hoy"
//           valor={stats.citasHoy}
//           descripcion={`${stats.citasPendientes} pendientes`}
//           icono={Calendar}
//           color="green"
//         />
        
//         <TarjetaEstadistica
//           titulo="Fichas Activas"
//           valor={stats.fichasActivas}
//           descripcion="Fichas odontológicas"
//           icono={FileText}
//           color="purple"
//         />
        
//         <TarjetaEstadistica
//           titulo="Ingresos Mensuales"
//           valor={stats.ingresosMensuales}
//           descripcion="Este mes"
//           icono={DollarSign}
//           tendencia="+12.5%"
//           color="yellow"
//         />
//       </div>

//       {/* Pestañas para organizar diferentes vistas */}
//       <Tabs defaultValue="general" className="space-y-6">
//         <TabsList className="grid w-full grid-cols-3 lg:w-[400px]">
//           <TabsTrigger value="general">General</TabsTrigger>
//           <TabsTrigger value="pacientes">Pacientes</TabsTrigger>
//           <TabsTrigger value="tratamientos">Tratamientos</TabsTrigger>
//         </TabsList>

//         {/* Tab General - Citas y actividad */}
//         <TabsContent value="general" className="space-y-6">
//           <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
//             {/* Gráfico de Citas por Mes */}
//             <Card>
//               <CardHeader>
//                 <CardTitle>Citas por Mes</CardTitle>
//                 <CardDescription>
//                   Evolución mensual de citas programadas
//                 </CardDescription>
//               </CardHeader>
//               <CardContent>
//                 <ResponsiveContainer width="100%" height={300}>
//                   <AreaChart data={citasPorMes}>
//                     <defs>
//                       <linearGradient id="colorCitas" x1="0" y1="0" x2="0" y2="1">
//                         <stop offset="5%" stopColor="#0088FE" stopOpacity={0.8}/>
//                         <stop offset="95%" stopColor="#0088FE" stopOpacity={0.1}/>
//                       </linearGradient>
//                     </defs>
//                     <CartesianGrid strokeDasharray="3 3" />
//                     <XAxis dataKey="mes" />
//                     <YAxis />
//                     <Tooltip 
//                       formatter={(value: any, name: any) => [
//                         `${value} ${name === 'citas' ? 'citas' : 'soles'}`,
//                         name === 'citas' ? 'Citas' : 'Ingresos'
//                       ]}
//                     />
//                     <Area 
//                       type="monotone" 
//                       dataKey="citas" 
//                       stroke="#0088FE" 
//                       fillOpacity={1} 
//                       fill="url(#colorCitas)" 
//                     />
//                   </AreaChart>
//                 </ResponsiveContainer>
//               </CardContent>
//             </Card>

//             {/* Estado de Citas */}
//             <Card>
//               <CardHeader>
//                 <CardTitle>Estado de Citas</CardTitle>
//                 <CardDescription>
//                   Distribución actual de citas
//                 </CardDescription>
//               </CardHeader>
//               <CardContent>
//                 <div className="space-y-4">
//                   <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
//                     <div className="flex items-center">
//                       <CheckCircle2 className="h-5 w-5 text-green-600 mr-2" />
//                       <span className="font-medium">Confirmadas</span>
//                     </div>
//                     <Badge variant="secondary" className="bg-green-100 text-green-800">
//                       {stats.citasPorEstado.confirmadas}
//                     </Badge>
//                   </div>
                  
//                   <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
//                     <div className="flex items-center">
//                       <Clock className="h-5 w-5 text-yellow-600 mr-2" />
//                       <span className="font-medium">Pendientes</span>
//                     </div>
//                     <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
//                       {stats.citasPorEstado.pendientes}
//                     </Badge>
//                   </div>
                  
//                   <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
//                     <div className="flex items-center">
//                       <XCircle className="h-5 w-5 text-red-600 mr-2" />
//                       <span className="font-medium">Canceladas</span>
//                     </div>
//                     <Badge variant="secondary" className="bg-red-100 text-red-800">
//                       {stats.citasPorEstado.canceladas}
//                     </Badge>
//                   </div>
//                 </div>
//               </CardContent>
//             </Card>
//           </div>
//         </TabsContent>

//         {/* Tab Pacientes - Demografía */}
//         <TabsContent value="pacientes" className="space-y-6">
//           <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
//             {/* Gráfico Circular - Pacientes por Edad */}
//             <Card>
//               <CardHeader>
//                 <CardTitle>Pacientes por Edad</CardTitle>
//                 <CardDescription>
//                   Distribución demográfica de pacientes
//                 </CardDescription>
//               </CardHeader>
//               <CardContent>
//                 <ResponsiveContainer width="100%" height={300}>
//                   <PieChart>
//                     <Pie
//                       data={pacientesPorEdad}
//                       cx="50%"
//                       cy="50%"
//                       labelLine={false}
//                       label={({ rango, porcentaje }) => `${rango}: ${porcentaje}%`}
//                       outerRadius={80}
//                       fill="#8884d8"
//                       dataKey="cantidad"
//                     >
//                       {pacientesPorEdad.map((entry, index) => (
//                         <Cell 
//                           key={`cell-${index}`} 
//                           fill={COLORES_GRAFICOS[index % COLORES_GRAFICOS.length]} 
//                         />
//                       ))}
//                     </Pie>
//                     <Tooltip 
//                       formatter={(value: any) => [`${value} pacientes`, 'Cantidad']}
//                     />
//                     <Legend />
//                   </PieChart>
//                 </ResponsiveContainer>
//               </CardContent>
//             </Card>

//             {/* Estadísticas de Pacientes */}
//             <Card>
//               <CardHeader>
//                 <CardTitle>Actividad de Pacientes</CardTitle>
//                 <CardDescription>
//                   Métricas de actividad reciente
//                 </CardDescription>
//               </CardHeader>
//               <CardContent className="space-y-4">
//                 <div className="flex justify-between items-center p-4 bg-blue-50 rounded-lg">
//                   <div>
//                     <p className="text-sm text-gray-600">Nuevos esta semana</p>
//                     <p className="text-2xl font-bold text-blue-600">24</p>
//                   </div>
//                   <Activity className="h-8 w-8 text-blue-600" />
//                 </div>
                
//                 <div className="flex justify-between items-center p-4 bg-purple-50 rounded-lg">
//                   <div>
//                     <p className="text-sm text-gray-600">Pacientes activos</p>
//                     <p className="text-2xl font-bold text-purple-600">1,198</p>
//                   </div>
//                   <Users className="h-8 w-8 text-purple-600" />
//                 </div>
                
//                 <div className="flex justify-between items-center p-4 bg-green-50 rounded-lg">
//                   <div>
//                     <p className="text-sm text-gray-600">Retención mensual</p>
//                     <p className="text-2xl font-bold text-green-600">87%</p>
//                   </div>
//                   <TrendingUp className="h-8 w-8 text-green-600" />
//                 </div>
//               </CardContent>
//             </Card>
//           </div>
//         </TabsContent>

//         {/* Tab Tratamientos - Ingresos */}
//         <TabsContent value="tratamientos" className="space-y-6">
          
//           {/* Gráfico de Barras - Tratamientos más Comunes */}
//           <Card>
//             <CardHeader>
//               <CardTitle>Tratamientos Más Comunes</CardTitle>
//               <CardDescription>
//                 Tratamientos más realizados y sus ingresos
//               </CardDescription>
//             </CardHeader>
//             <CardContent>
//               <ResponsiveContainer width="100%" height={400}>
//                 <BarChart data={tratamientosMasComunes} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
//                   <CartesianGrid strokeDasharray="3 3" />
//                   <XAxis 
//                     dataKey="tratamiento" 
//                     angle={-45}
//                     textAnchor="end"
//                     height={100}
//                     fontSize={12}
//                   />
//                   <YAxis yAxisId="left" />
//                   <YAxis yAxisId="right" orientation="right" />
//                   <Tooltip 
//                     formatter={(value: any, name: any) => [
//                       name === 'cantidad' ? `${value} tratamientos` : `S/ ${value}`,
//                       name === 'cantidad' ? 'Cantidad' : 'Ingresos'
//                     ]}
//                   />
//                   <Legend />
//                   <Bar 
//                     yAxisId="left" 
//                     dataKey="cantidad" 
//                     fill="#0088FE" 
//                     name="Cantidad de Tratamientos"
//                   />
//                   <Bar 
//                     yAxisId="right" 
//                     dataKey="ingresos" 
//                     fill="#00C49F" 
//                     name="Ingresos (S/)"
//                   />
//                 </BarChart>
//               </ResponsiveContainer>
//             </CardContent>
//           </Card>
//         </TabsContent>
//       </Tabs>

//       {/* Alertas y Notificaciones */}
//       <div className="mt-8">
//         <Card>
//           <CardHeader>
//             <CardTitle className="flex items-center">
//               <AlertCircle className="h-5 w-5 text-orange-600 mr-2" />
//               Alertas y Recordatorios
//             </CardTitle>
//           </CardHeader>
//           <CardContent>
//             <div className="space-y-3">
//               <div className="flex items-center p-3 bg-orange-50 rounded-lg border-l-4 border-orange-400">
//                 <Clock className="h-4 w-4 text-orange-600 mr-3" />
//                 <div>
//                   <p className="font-medium text-orange-800">5 citas necesitan confirmación</p>
//                   <p className="text-sm text-orange-600">Para el día de mañana</p>
//                 </div>
//               </div>
              
//               <div className="flex items-center p-3 bg-blue-50 rounded-lg border-l-4 border-blue-400">
//                 <FileText className="h-4 w-4 text-blue-600 mr-3" />
//                 <div>
//                   <p className="font-medium text-blue-800">12 fichas pendientes de actualizar</p>
//                   <p className="text-sm text-blue-600">Últimos tratamientos realizados</p>
//                 </div>
//               </div>
              
//               <div className="flex items-center p-3 bg-green-50 rounded-lg border-l-4 border-green-400">
//                 <CheckCircle2 className="h-4 w-4 text-green-600 mr-3" />
//                 <div>
//                   <p className="font-medium text-green-800">Sistema funcionando correctamente</p>
//                   <p className="text-sm text-green-600">Todas las copias de seguridad actualizadas</p>
//                 </div>
//               </div>
//             </div>
//           </CardContent>
//         </Card>
//       </div>
//     </div>
//   )
// }


//  NUEVO---------------------------------
// // 

// src/app/dashboard/page.tsx
// src/app/dashboard/page.tsx

'use client'

import { useState, useEffect, useCallback } from 'react'
import { 
  Users, 
  Calendar, 
  FileText, 
  DollarSign, 
  Activity,
  TrendingUp,
  Clock,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Search,
  Phone,
  Mail,
  User,
  Stethoscope,
  RefreshCw,
  Wifi,
  WifiOff
} from 'lucide-react'
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts'

// Interfaces para tipado
interface DashboardStats {
  totalPacientes: number
  pacientesNuevosHoy: number
  citasHoy: number
  citasPendientes: number
  ingresosMensuales: number
  fichasActivas: number
  serviciosActivos: number
  serviciosPendientes: number
  serviciosVencidos: number
  serviciosPagados: number
  totalTratamientos: number
  planesTratamiento: number
  facturasPendientes: number
  citasPorEstado: {
    confirmadas: number
    pendientes: number
    canceladas: number
    modificadas: number
  }
}

interface CitasPorMes {
  mes: string
  citas: number
  ingresos: number
}

interface PacientesPorEdad {
  rango: string
  cantidad: number
  porcentaje: number
}

interface TratamientosMasComunes {
  tratamiento: string
  cantidad: number
  ingresos: number
}

interface Paciente {
  id: string
  nombres: string
  apellidos: string
  dni: string
  fechaNacimiento: string
  edad: number
  sexo: string
  telefono: string
  email: string
  estado: string
  createdAt: string
  _count: {
    fichasOdontologicas: number
    citas: number
  }
}

interface PacientesResponse {
  pacientes: Paciente[]
  total: number
  currentPage: number
  totalPages: number
}

// Función para fetch con timeout aumentado y mejor manejo de errores
const fetchWithTimeout = async (url: string, options: RequestInit = {}): Promise<Response | null> => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 35000); // 35 segundos

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    
    if (error instanceof DOMException && error.name === 'AbortError') {
      console.error(`Timeout en ${url} - La consulta tomó más de 35 segundos`);
      return null;
    }
    
    console.error(`Error fetching ${url}:`, error);
    return null;
  }
};

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    totalPacientes: 0,
    pacientesNuevosHoy: 0,
    citasHoy: 0,
    citasPendientes: 0,
    ingresosMensuales: 0,
    fichasActivas: 0,
    serviciosActivos: 0,
    serviciosPendientes: 0,
    serviciosVencidos: 0,
    serviciosPagados: 0,
    totalTratamientos: 0,
    planesTratamiento: 0,
    facturasPendientes: 0,
    citasPorEstado: {
      confirmadas: 0,
      pendientes: 0,
      canceladas: 0,
      modificadas: 0
    }
  })

  const [citasPorMes, setCitasPorMes] = useState<CitasPorMes[]>([])
  const [pacientesPorEdad, setPacientesPorEdad] = useState<PacientesPorEdad[]>([])
  const [tratamientosMasComunes, setTratamientosMasComunes] = useState<TratamientosMasComunes[]>([])
  const [pacientesData, setPacientesData] = useState<PacientesResponse>({
    pacientes: [],
    total: 0,
    currentPage: 1,
    totalPages: 0
  })
  
  const [loading, setLoading] = useState(true)
  const [loadingPacientes, setLoadingPacientes] = useState(false)
  const [busqueda, setBusqueda] = useState('')
  const [paginaActual, setPaginaActual] = useState(1)
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'disconnected' | 'retrying'>('connected')
  const [errorMessages, setErrorMessages] = useState<string[]>([])
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date())

  // Función para agregar mensajes de error
  const addErrorMessage = useCallback((message: string) => {
    setErrorMessages(prev => {
      const newMessages = [...prev, message].slice(-5); // Mantener solo los últimos 5 errores
      return newMessages;
    });
    
    // Remover el mensaje después de 10 segundos
    setTimeout(() => {
      setErrorMessages(prev => prev.slice(1));
    }, 10000);
  }, []);

  // Función mejorada para cargar datos con reintentos y timeouts progresivos
  const cargarDatosDashboard = useCallback(async () => {
    try {
      setLoading(true)
      setConnectionStatus('retrying')
      
      const endpoints = [
        { url: '/api/dashboard/stats', setter: setStats, name: 'Estadísticas', priority: 1 },
        { url: '/api/dashboard/citas-por-mes', setter: setCitasPorMes, name: 'Citas por mes', priority: 2 },
        { url: '/api/dashboard/pacientes-por-edad', setter: setPacientesPorEdad, name: 'Pacientes por edad', priority: 3 },
        { url: '/api/dashboard/tratamientos-comunes', setter: setTratamientosMasComunes, name: 'Tratamientos comunes', priority: 4 }
      ];

      let successCount = 0;
      let attemptCount = 0;
      const maxAttempts = 2;
      
      // Procesar endpoints con reintentos
      for (const { url, setter, name, priority } of endpoints) {
        let success = false;
        attemptCount = 0;
        
        while (!success && attemptCount < maxAttempts) {
          attemptCount++;
          console.log(`Intentando cargar ${name} (intento ${attemptCount}/${maxAttempts})`);
          
          const response = await fetchWithTimeout(url);
          
          if (response) {
            try {
              const data = await response.json();
              setter(data);
              successCount++;
              success = true;
              console.log(`Éxito: ${name} cargado`);
            } catch (parseError) {
              console.error(`Error parsing JSON for ${name}:`, parseError);
              if (attemptCount === maxAttempts) {
                addErrorMessage(`Error procesando datos de ${name}`);
              }
            }
          } else {
            console.log(`Fallo al cargar ${name} (intento ${attemptCount})`);
            if (attemptCount === maxAttempts) {
              addErrorMessage(`No se pudieron cargar ${name} después de ${maxAttempts} intentos`);
            }
          }
          
          // Pausa progresiva entre intentos
          if (!success && attemptCount < maxAttempts) {
            const delay = attemptCount * 1500; // 1.5s, 3s, etc.
            console.log(`Esperando ${delay}ms antes del siguiente intento...`);
            await new Promise((resolve) => setTimeout(resolve, delay));
          }
        }
        
        // Pausa entre diferentes endpoints para no sobrecargar
        if (priority < endpoints.length) {
          await new Promise((resolve) => setTimeout(resolve, 800));
        }
      }

      if (successCount > 0) {
        setConnectionStatus('connected');
        setLastUpdate(new Date());
        console.log(`Dashboard cargado: ${successCount}/${endpoints.length} endpoints exitosos`);
      } else {
        setConnectionStatus('disconnected');
        addErrorMessage('No se pudieron cargar los datos del dashboard');
      }
      
    } catch (error) {
      console.error('Error general al cargar datos del dashboard:', error);
      setConnectionStatus('disconnected');
      addErrorMessage('Error de conexión general');
    } finally {
      setLoading(false);
    }
  }, [addErrorMessage]);

  // Función optimizada para cargar pacientes con timeout mayor
  const cargarPacientes = useCallback(async (pagina: number = 1, buscar: string = '') => {
    try {
      setLoadingPacientes(true)
      
      const url = `/api/dashboard/pacientes-lista?page=${pagina}&limit=10&search=${encodeURIComponent(buscar)}`;
      console.log(`Cargando pacientes: página ${pagina}, búsqueda: "${buscar}"`);
      
      const response = await fetchWithTimeout(url);
      
      if (response) {
        const data = await response.json();
        setPacientesData(data);
        console.log(`Pacientes cargados: ${data.pacientes.length} encontrados`);
      } else {
        addErrorMessage('Error al cargar lista de pacientes - Timeout o error de red');
        console.log('Error al cargar pacientes');
      }
    } catch (error) {
      console.error('Error al cargar pacientes:', error);
      addErrorMessage('Error de conexión al cargar pacientes');
    } finally {
      setLoadingPacientes(false);
    }
  }, [addErrorMessage]);

  // Auto-refresh más inteligente (solo si no hay errores recientes)
  useEffect(() => {
    const interval = setInterval(() => {
      if (connectionStatus === 'connected' && errorMessages.length === 0) {
        console.log('Auto-refresh del dashboard');
        cargarDatosDashboard();
      } else {
        console.log('Auto-refresh pausado debido a errores de conexión');
      }
    }, 10 * 60 * 1000); // Aumentado a 10 minutos para reducir carga

    return () => clearInterval(interval);
  }, [cargarDatosDashboard, connectionStatus, errorMessages.length]);

  useEffect(() => {
    cargarDatosDashboard()
    cargarPacientes()
  }, [cargarDatosDashboard, cargarPacientes])

  useEffect(() => {
    const timer = setTimeout(() => {
      cargarPacientes(paginaActual, busqueda)
    }, 500) // Aumentado para evitar demasiadas llamadas
    return () => clearTimeout(timer)
  }, [busqueda, paginaActual, cargarPacientes])

  const formatearFecha = (fecha: string) => {
    return new Date(fecha).toLocaleDateString('es-PE', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const formatearMoneda = (valor: number) => {
    return `S/ ${valor.toLocaleString('es-PE', { minimumFractionDigits: 2 })}`
  }

  const COLORES_GRAFICOS = ['#0ea5e9', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4']

  const TarjetaEstadistica = ({ 
    titulo, 
    valor, 
    descripcion, 
    icono: Icono, 
    tendencia, 
    color = 'bg-blue-500',
    colorTexto = 'text-blue-600'
  }: {
    titulo: string
    valor: string | number
    descripcion: string
    icono: any
    tendencia?: string
    color?: string
    colorTexto?: string
  }) => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-all duration-300">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-500 mb-1">{titulo}</p>
          <p className="text-2xl font-bold text-gray-900">
            {typeof valor === 'number' && titulo.includes('Ingresos') 
              ? formatearMoneda(valor) 
              : valor.toLocaleString()}
          </p>
          <div className="flex items-center mt-2">
            {tendencia && (
              <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
            )}
            <p className="text-xs text-gray-600">{descripcion}</p>
          </div>
        </div>
        <div className={`${color} p-3 rounded-lg`}>
          <Icono className="h-6 w-6 text-white" />
        </div>
      </div>
    </div>
  )

  // Componente de estado de conexión mejorado
  const EstadoConexion = () => (
    <div className="flex items-center space-x-2">
      {connectionStatus === 'connected' && (
        <>
          <Wifi className="h-5 w-5 text-green-600" />
          <span className="text-green-700 font-medium">Conectado</span>
          <span className="text-xs text-gray-500">
            Actualizado: {lastUpdate.toLocaleTimeString()}
          </span>
        </>
      )}
      {connectionStatus === 'disconnected' && (
        <>
          <WifiOff className="h-5 w-5 text-red-600" />
          <span className="text-red-700 font-medium">Desconectado</span>
          <span className="text-xs text-red-500">
            APIs lentas detectadas
          </span>
        </>
      )}
      {connectionStatus === 'retrying' && (
        <>
          <RefreshCw className="h-5 w-5 text-yellow-600 animate-spin" />
          <span className="text-yellow-700 font-medium">Cargando...</span>
          <span className="text-xs text-yellow-600">
            Esto puede tomar hasta 35 segundos
          </span>
        </>
      )}
      <button
        onClick={() => {
          console.log('Refresh manual iniciado');
          cargarDatosDashboard();
        }}
        disabled={connectionStatus === 'retrying'}
        className="ml-2 p-1 rounded hover:bg-gray-100 disabled:opacity-50"
        title="Actualizar datos manualmente"
      >
        <RefreshCw className={`h-4 w-4 text-gray-600 ${connectionStatus === 'retrying' ? 'animate-spin' : ''}`} />
      </button>
    </div>
  )

  // Componente de alertas de error
  const AlertasError = () => {
    if (errorMessages.length === 0) return null;

    return (
      <div className="fixed top-4 right-4 z-50 space-y-2">
        {errorMessages.map((message, index) => (
          <div
            key={index}
            className="bg-red-50 border border-red-200 rounded-lg p-3 shadow-lg max-w-sm animate-slide-in-right"
          >
            <div className="flex items-center">
              <AlertCircle className="h-4 w-4 text-red-600 mr-2" />
              <span className="text-sm text-red-800">{message}</span>
            </div>
          </div>
        ))}
      </div>
    );
  };

  if (loading && connectionStatus !== 'connected') {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <span className="text-gray-600 font-medium">Cargando dashboard...</span>
          <p className="text-sm text-gray-500 mt-2">
            {connectionStatus === 'retrying' ? 'Reintentando conexión...' : 'Conectando a la base de datos...'}
          </p>
          <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-left max-w-md">
            <div className="flex items-center text-yellow-800">
              <Clock className="h-4 w-4 mr-2" />
              <span className="text-sm font-medium">Tiempo de carga extendido</span>
            </div>
            <p className="text-xs text-yellow-700 mt-1">
              Las consultas complejas pueden tomar hasta 35 segundos. Por favor espera...
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AlertasError />
      
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
              <p className="text-gray-600 mt-1">Clínica Dental - Resumen General</p>
            </div>
            <div className="flex items-center space-x-4">
              <EstadoConexion />
              <div className="flex items-center space-x-2 bg-blue-50 px-4 py-2 rounded-lg">
                <Stethoscope className="h-5 w-5 text-blue-600" />
                <span className="text-blue-700 font-medium">Sistema Activo</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Tarjetas de Estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <TarjetaEstadistica
            titulo="Total Pacientes"
            valor={stats.totalPacientes}
            descripcion="Pacientes activos"
            icono={Users}
            color="bg-blue-500"
          />
          
          <TarjetaEstadistica
            titulo="Citas Hoy"
            valor={stats.citasHoy}
            descripcion={`${stats.citasPendientes} pendientes`}
            icono={Calendar}
            color="bg-green-500"
          />
          
          <TarjetaEstadistica
            titulo="Fichas Activas"
            valor={stats.fichasActivas}
            descripcion="Fichas odontológicas"
            icono={FileText}
            color="bg-purple-500"
          />
          
          <TarjetaEstadistica
            titulo="Ingresos Mensuales"
            valor={stats.ingresosMensuales}
            descripcion="Este mes"
            icono={DollarSign}
            tendencia="+12.5%"
            color="bg-yellow-500"
          />
        </div>

        {/* Gráficos Principales */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Evolución de Citas */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Evolución de Citas</h3>
              <p className="text-gray-600 text-sm">Citas realizadas por mes</p>
            </div>
            {citasPorMes.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={citasPorMes}>
                  <defs>
                    <linearGradient id="colorCitas" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0.1}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="mes" axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: 'white',
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                    }}
                    formatter={(value: any) => [`${value} citas`, 'Citas']}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="citas" 
                    stroke="#0ea5e9" 
                    strokeWidth={3}
                    fillOpacity={1} 
                    fill="url(#colorCitas)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-64 text-gray-500">
                <div className="text-center">
                  <AlertCircle className="h-8 w-8 mx-auto mb-2" />
                  <p>No hay datos disponibles</p>
                </div>
              </div>
            )}
          </div>

          {/* Estado de Citas */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Estado de Citas</h3>
              <p className="text-gray-600 text-sm">Distribución actual</p>
            </div>
            <div className="space-y-4">
              {[
                { estado: 'Confirmadas', valor: stats.citasPorEstado.confirmadas, color: 'bg-green-50 border-green-200', icono: CheckCircle2, iconoColor: 'text-green-600' },
                { estado: 'Pendientes', valor: stats.citasPorEstado.pendientes, color: 'bg-yellow-50 border-yellow-200', icono: Clock, iconoColor: 'text-yellow-600' },
                { estado: 'Modificadas', valor: stats.citasPorEstado.modificadas, color: 'bg-blue-50 border-blue-200', icono: Activity, iconoColor: 'text-blue-600' },
                { estado: 'Canceladas', valor: stats.citasPorEstado.canceladas, color: 'bg-red-50 border-red-200', icono: XCircle, iconoColor: 'text-red-600' }
              ].map(({ estado, valor, color, icono: IconoEstado, iconoColor }) => (
                <div key={estado} className={`flex items-center justify-between p-4 rounded-lg border ${color}`}>
                  <div className="flex items-center">
                    <IconoEstado className={`h-5 w-5 ${iconoColor} mr-3`} />
                    <span className="font-medium text-gray-900">{estado}</span>
                  </div>
                  <span className="text-lg font-bold text-gray-900">{valor}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Gráficos Adicionales */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Pacientes por Edad */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Pacientes por Edad</h3>
              <p className="text-gray-600 text-sm">Distribución demográfica</p>
            </div>
            {pacientesPorEdad.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={pacientesPorEdad}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ rango, porcentaje }) => `${rango}: ${porcentaje}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="cantidad"
                  >
                    {pacientesPorEdad.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={COLORES_GRAFICOS[index % COLORES_GRAFICOS.length]} 
                      />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: 'white',
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                    }}
                    formatter={(value: any) => [`${value} pacientes`, 'Cantidad']}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-64 text-gray-500">
                <div className="text-center">
                  <AlertCircle className="h-8 w-8 mx-auto mb-2" />
                  <p>No hay datos disponibles</p>
                </div>
              </div>
            )}
          </div>

          {/* Tratamientos Más Comunes */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Tratamientos Realizados</h3>
              <p className="text-gray-600 text-sm">Más frecuentes</p>
            </div>
            {tratamientosMasComunes.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={tratamientosMasComunes} layout="horizontal">
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis type="number" axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} />
                  <YAxis 
                    type="category" 
                    dataKey="tratamiento" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#64748b', fontSize: 12 }}
                    width={120}
                  />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: 'white',
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                    }}
                    formatter={(value: any, name: any) => [
                      name === 'cantidad' ? `${value} tratamientos` : formatearMoneda(value),
                      name === 'cantidad' ? 'Cantidad' : 'Ingresos'
                    ]}
                  />
                  <Bar dataKey="cantidad" fill="#0ea5e9" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-64 text-gray-500">
                <div className="text-center">
                  <AlertCircle className="h-8 w-8 mx-auto mb-2" />
                  <p>No hay datos disponibles</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Alertas y Notificaciones Mejoradas */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <AlertCircle className="h-5 w-5 text-orange-500 mr-2" />
              Alertas y Estadísticas del Sistema
            </h3>
          </div>
          

          
          {/* Primera fila - Servicios */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-center">
                <Clock className="h-5 w-5 text-yellow-600 mr-3" />
                <div>
                  <p className="font-semibold text-yellow-800">{stats.serviciosPendientes || 0} servicios pendientes</p>
                  <p className="text-sm text-yellow-600">Requieren atención</p>
                </div>
              </div>
            </div>
            
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center">
                <XCircle className="h-5 w-5 text-red-600 mr-3" />
                <div>
                  <p className="font-semibold text-red-800">{stats.serviciosVencidos || 0} servicios vencidos</p>
                  <p className="text-sm text-red-600">Necesitan renovación</p>
                </div>
              </div>
            </div>
            
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center">
                <CheckCircle2 className="h-5 w-5 text-green-600 mr-3" />
                <div>
                  <p className="font-semibold text-green-800">{stats.serviciosPagados || 0} servicios pagados</p>
                  <p className="text-sm text-green-600">Al día</p>
                </div>
              </div>
            </div>
          </div>

          {/* Segunda fila - Tratamientos y Citas */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center">
                <Stethoscope className="h-5 w-5 text-blue-600 mr-3" />
                <div>
                  <p className="font-semibold text-blue-800">{stats.totalTratamientos || 0} tratamientos</p>
                  <p className="text-sm text-blue-600">Realizados</p>
                </div>
              </div>
            </div>
            
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <div className="flex items-center">
                <FileText className="h-5 w-5 text-purple-600 mr-3" />
                <div>
                  <p className="font-semibold text-purple-800">{stats.planesTratamiento || 0} planes activos</p>
                  <p className="text-sm text-purple-600">En progreso</p>
                </div>
              </div>
            </div>
            
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
              <div className="flex items-center">
                <Calendar className="h-5 w-5 text-orange-600 mr-3" />
                <div>
                  <p className="font-semibold text-orange-800">{stats.citasPendientes || 0} citas pendientes</p>
                  <p className="text-sm text-orange-600">Por confirmar</p>
                </div>
              </div>
            </div>
            
            <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
              <div className="flex items-center">
                <Activity className="h-5 w-5 text-indigo-600 mr-3" />
                <div>
                  <p className="font-semibold text-indigo-800">{stats.facturasPendientes || 0} facturas pendientes</p>
                  <p className="text-sm text-indigo-600">Por cobrar</p>
                </div>
              </div>
            </div>
          </div>

          {/* Tercera fila - Estado General */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <User className="h-5 w-5 text-gray-600 mr-3" />
                  <div>
                    <p className="font-semibold text-gray-800">Pacientes nuevos hoy</p>
                    <p className="text-sm text-gray-600">Registros del día</p>
                  </div>
                </div>
                <div className="text-2xl font-bold text-gray-800">
                  {stats.pacientesNuevosHoy || 0}
                </div>
              </div>
            </div>
            
            <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <DollarSign className="h-5 w-5 text-emerald-600 mr-3" />
                  <div>
                    <p className="font-semibold text-emerald-800">Ingresos del mes</p>
                    <p className="text-sm text-emerald-600">Facturación</p>
                  </div>
                </div>
                <div className="text-xl font-bold text-emerald-800">
                  S/ {(stats.ingresosMensuales || 0).toLocaleString()}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Lista de Pacientes */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="p-6 border-b border-gray-200">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Lista de Pacientes</h3>
                <p className="text-gray-600 text-sm">Total: {pacientesData.total} pacientes registrados</p>
              </div>
              <div className="relative">
                <Search className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Buscar paciente..."
                  value={busqueda}
                  onChange={(e) => {
                    setBusqueda(e.target.value)
                    setPaginaActual(1)
                  }}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none w-full sm:w-80"
                />
              </div>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            {loadingPacientes ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                <span className="ml-2 text-gray-600">Cargando pacientes...</span>
              </div>
            ) : pacientesData.pacientes.length === 0 ? (
              <div className="flex items-center justify-center py-12 text-gray-500">
                <div className="text-center">
                  <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p className="text-lg font-medium">No se encontraron pacientes</p>
                  <p className="text-sm">
                    {busqueda 
                      ? 'Intenta con diferentes términos de búsqueda' 
                      : 'No hay pacientes registrados aún'
                    }
                  </p>
                </div>
              </div>
            ) : (
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left py-3 px-6 font-semibold text-gray-900">Paciente</th>
                    <th className="text-left py-3 px-6 font-semibold text-gray-900">DNI</th>
                    <th className="text-left py-3 px-6 font-semibold text-gray-900">Contacto</th>
                    <th className="text-left py-3 px-6 font-semibold text-gray-900">Edad</th>
                    <th className="text-left py-3 px-6 font-semibold text-gray-900">Fichas</th>
                    <th className="text-left py-3 px-6 font-semibold text-gray-900">Citas</th>
                    <th className="text-left py-3 px-6 font-semibold text-gray-900">Estado</th>
                    <th className="text-left py-3 px-6 font-semibold text-gray-900">Registro</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {pacientesData.pacientes.map((paciente) => (
                    <tr key={paciente.id} className="hover:bg-gray-50 transition-colors">
                      <td className="py-4 px-6">
                        <div className="flex items-center">
                          <div className="bg-blue-100 rounded-full p-2 mr-3">
                            <User className="h-4 w-4 text-blue-600" />
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">
                              {paciente.nombres} {paciente.apellidos}
                            </p>
                            <p className="text-sm text-gray-500 capitalize">
                              {paciente.sexo === 'M' ? 'Masculino' : paciente.sexo === 'F' ? 'Femenino' : 'Otro'}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">
                          {paciente.dni}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <div className="space-y-1">
                          {paciente.telefono && (
                            <div className="flex items-center text-sm text-gray-600">
                              <Phone className="h-3 w-3 mr-1" />
                              {paciente.telefono}
                            </div>
                          )}
                          {paciente.email && (
                            <div className="flex items-center text-sm text-gray-600">
                              <Mail className="h-3 w-3 mr-1" />
                              {paciente.email}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <span className="text-sm font-medium text-gray-900">
                          {paciente.edad || 'N/A'} años
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">
                          {paciente._count.fichasOdontologicas}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
                          {paciente._count.citas}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          paciente.estado === 'ACTIVO' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {paciente.estado}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <span className="text-sm text-gray-600">
                          {formatearFecha(paciente.createdAt)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Paginación */}
          {pacientesData.totalPages > 1 && (
            <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200">
              <div className="text-sm text-gray-600">
                Mostrando página {pacientesData.currentPage} de {pacientesData.totalPages}
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setPaginaActual(Math.max(1, paginaActual - 1))}
                  disabled={paginaActual === 1}
                  className="px-3 py-1 rounded-md bg-gray-100 text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-200 transition-colors"
                >
                  Anterior
                </button>
                
                {/* Números de página */}
                {Array.from({ length: Math.min(5, pacientesData.totalPages) }, (_, i) => {
                  const pageNum = Math.max(1, Math.min(
                    pacientesData.totalPages - 4,
                    Math.max(1, paginaActual - 2)
                  )) + i
                  
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setPaginaActual(pageNum)}
                      className={`px-3 py-1 rounded-md transition-colors ${
                        pageNum === paginaActual
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {pageNum}
                    </button>
                  )
                })}
                
                <button
                  onClick={() => setPaginaActual(Math.min(pacientesData.totalPages, paginaActual + 1))}
                  disabled={paginaActual === pacientesData.totalPages}
                  className="px-3 py-1 rounded-md bg-gray-100 text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-200 transition-colors"
                >
                  Siguiente
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      
      <style jsx global>{`
        @keyframes slide-in-right {
          from {
            opacity: 0;
            transform: translateX(100%);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        
        .animate-slide-in-right {
          animation: slide-in-right 0.3s ease-out;
        }
        
        .animate-pulse {
          animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
        
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: .5;
          }
        }
      `}</style>
    </div>
  )
}