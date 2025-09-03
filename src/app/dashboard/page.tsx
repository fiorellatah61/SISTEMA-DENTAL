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
// // 

// src/app/dashboard/page.tsx
// Propósito: Componente principal del dashboard que muestra estadísticas, gráficos y lista de pacientes.
// Usa hooks de React para cargar datos de APIs y renderizar UI interactiva con búsqueda y paginación.

// src/app/dashboard/page.tsx
// Propósito: Componente principal del dashboard que muestra estadísticas, gráficos y lista de pacientes.
// Usa hooks de React para cargar datos de APIs y renderizar UI interactiva con búsqueda y paginación.

// src/app/dashboard/page.tsx
// Propósito: Componente principal del dashboard que muestra estadísticas, gráficos y lista de pacientes.
// Usa hooks de React para cargar datos de APIs y renderizar UI interactiva con búsqueda y paginación.

// src/app/dashboard/page.tsx
"use client"
import React, { useState, useEffect, useCallback } from 'react';
import { 
  Users, Calendar, FileText, DollarSign, Clock, 
  UserCheck, AlertCircle, Activity,
  Search, Phone, Mail, User, ChevronLeft, ChevronRight,
  CheckCircle, XCircle, RefreshCw
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';

// Interfaces
interface Stats {
  totalPacientes: number;
  pacientesActivos: number;
  citasHoy: number;
  citasSemana: number;
  citasConfirmadas: number;
  fichasActivas: number;
  fichasMes: number;
  serviciosPendientes: number;
  facturasPendientes: number;
  montoFacturasPendientes: number;
  ingresosMes: number;
  crecimientoIngresos: number;
  citasPorEstado: {
    confirmadas: number;
    pendientes: number;
    modificadas: number;
    canceladas: number;
  };
   // ✅ NUEVA PROPIEDAD
  serviciosChart: ServiciosData[];
}

interface PacienteWithCount {
  id: string;
  nombres: string;
  apellidos: string;
  dni: string;
  fechaNacimiento?: Date;
  edad?: number;
  sexo?: 'M' | 'F' | 'OTRO';
  telefono? : string;
  email?: string;
  estado: 'ACTIVO' | 'INACTIVO';
  createdAt: Date;
  _count: {
    fichasOdontologicas: number;
    citas: number;
  };
}

interface PacientesData {
  pacientes: PacienteWithCount[];
  total: number;
  currentPage: number;
  totalPages: number;
  hasMore: boolean;
}

interface CitasData {
  fecha: string;
  citas: number;
}

interface IngresosData {
  mes: string;
  ingresos: number;
}

interface ServiciosData {
  name: string;
  cantidad: number;
}

interface CustomLabelProps {
  name?: string;
  percent?: number;
  cx?: number;
  cy?: number;
  midAngle?: number;
  innerRadius?: number;
  outerRadius?: number;
  value?: number;
}

// Estados de carga independientes
interface LoadingStates {
  stats: boolean;
  citasChart: boolean;
  ingresos: boolean;
  // servicios: boolean;
  pacientes: boolean;
}

const Dashboard = () => {
  // Estados principales
  const [stats, setStats] = useState<Stats | null>(null);
  const [citasData, setCitasData] = useState<CitasData[]>([]);
  const [pacientesData, setPacientesData] = useState<PacientesData>({ 
    pacientes: [], total: 0, currentPage: 1, totalPages: 1, hasMore: false 
  });
  const [ingresosMensuales, setIngresosMensuales] = useState<IngresosData[]>([]);
  // const [estadisticasServicios, setEstadisticasServicios] = useState<ServiciosData[]>([]);
  
  // Estados de carga independientes
  const [loading, setLoading] = useState<LoadingStates>({
    stats: true,
    citasChart: true,
    ingresos: true,
    // servicios: true,
    pacientes: true
  });
  
  // Estados de error - Permitir string | null
  const [errors, setErrors] = useState<{[key: string]: string | null}>({});
  
  // Estados de búsqueda
  const [busqueda, setBusqueda] = useState('');
  const [paginaActual, setPaginaActual] = useState(1);

  // Función genérica para manejar errores y loading
  const updateLoadingState = (key: keyof LoadingStates, isLoading: boolean) => {
    setLoading(prev => ({ ...prev, [key]: isLoading }));
  };

  const setError = (key: string, error: string | null) => {
    setErrors(prev => {
      if (error === null) {
        const newErrors = { ...prev };
        delete newErrors[key];
        return newErrors;
      }
      return { ...prev, [key]: error };
    });
  };

  // Función genérica para fetch con retry automático
  const fetchWithRetry = async <T,>(
    url: string,
    key: keyof LoadingStates,
    setter: (data: T) => void,
    fallbackData?: T,
    maxRetries: number = 2
  ) => {
    updateLoadingState(key, true);
    setError(key, null);

    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout

        const response = await fetch(url, { 
          signal: controller.signal,
          headers: {
            'Cache-Control': 'no-cache',
          }
        });
        
        clearTimeout(timeoutId);

        if (!response.ok) {
          throw new Error(`Error ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        setter(data);
        updateLoadingState(key, false);
        return;

      } catch (error: any) {
        console.warn(`Intento ${attempt + 1}/${maxRetries} falló para ${url}:`, error.message);
        
        if (attempt === maxRetries - 1) {
          // Último intento fallido
          if (fallbackData) {
            setter(fallbackData);
          }
          setError(key, `Error al cargar ${key}: ${error.message}`);
          updateLoadingState(key, false);
        } else {
          // Esperar antes del siguiente intento
          await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)));
        }
      }
    }
  };

  // Función para recargar datos específicos
  const reloadData = useCallback((type?: keyof LoadingStates) => {
    if (!type || type === 'stats') {
      fetchWithRetry('/api/dashboard/stats', 'stats', setStats, {
        totalPacientes: 0,
        pacientesActivos: 0,
        citasHoy: 0,
        citasSemana: 0,
        citasConfirmadas: 0,
        fichasActivas: 0,
        fichasMes: 0,
        serviciosPendientes: 0,
        facturasPendientes: 0,
        montoFacturasPendientes: 0,
        ingresosMes: 0,
        crecimientoIngresos: 0,
        citasPorEstado: { confirmadas: 0, pendientes: 0, modificadas: 0, canceladas: 0 },
        serviciosChart: [] // ✅ Agregar esta línea
      });
    }

    if (!type || type === 'citasChart') {
      fetchWithRetry('/api/dashboard/citas-chart', 'citasChart', setCitasData, []);
    }

    if (!type || type === 'ingresos') {
      fetchWithRetry('/api/dashboard/ingresos-mensuales', 'ingresos', setIngresosMensuales, []);
    }

    // if (!type || type === 'servicios') {
    //   fetchWithRetry('/api/dashboard/servicios-stats', 'servicios', setEstadisticasServicios, []);
    // }
  }, []);

  // Función específica para pacientes (con parámetros)
  const loadPacientes = useCallback(() => {
    const params = new URLSearchParams({
      page: paginaActual.toString(),
      search: busqueda,
      limit: '10'
    });
    
    fetchWithRetry(
      `/api/dashboard/pacientes?${params}`, 
      'pacientes', 
      setPacientesData,
      { pacientes: [], total: 0, currentPage: 1, totalPages: 1, hasMore: false }
    );
  }, [paginaActual, busqueda]);

  // Efectos de carga inicial
  useEffect(() => {
    reloadData();
  }, [reloadData]);

  useEffect(() => {
    const debounceTimer = setTimeout(loadPacientes, busqueda ? 500 : 0);
    return () => clearTimeout(debounceTimer);
  }, [loadPacientes]);

  // Funciones de utilidad
  const formatearFecha = (fecha: string | Date) => {
    return new Date(fecha).toLocaleDateString('es-PE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const formatearMoneda = (cantidad: number) => {
    return new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: 'PEN'
    }).format(cantidad);
  };

  const renderCustomizedLabel = (props: CustomLabelProps) => {
    const { name, percent } = props;
    return `${name}: ${((percent || 0) * 100).toFixed(0)}%`;
  };
  const coloresPie = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

  // Componente de estado de carga
  const LoadingSpinner = ({ size = "h-8 w-8" }: { size?: string }) => (
    <div className="flex items-center justify-center">
      <div className={`animate-spin rounded-full ${size} border-b-2 border-blue-500`}></div>
    </div>
  );

  // Componente de error con retry
  const ErrorDisplay = ({ error, onRetry, type }: { error: string; onRetry: () => void; type: string }) => (
    <div className="flex flex-col items-center justify-center py-8 text-center">
      <AlertCircle className="h-12 w-12 text-red-300 mb-4" />
      <p className="text-red-600 mb-4">{error}</p>
      <button
        onClick={onRetry}
        className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2"
      >
        <RefreshCw className="h-4 w-4" />
        Reintentar
      </button>
    </div>
  );

  // Verificar si todo está cargando por primera vez
  const isInitialLoading = Object.values(loading).every(val => val === true);

  if (isInitialLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <LoadingSpinner size="h-12 w-12" />
          <span className="ml-4 text-lg">Cargando dashboard...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 lg:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header con botón de recarga */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Dashboard Clínica Dental</h1>
              <p className="text-gray-600 mt-1">Resumen completo de la gestión clínica</p>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={() => reloadData()}
                className="p-2 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                title="Actualizar datos"
              >
                <RefreshCw className="h-5 w-5 text-blue-600" />
              </button>
              <div className="bg-blue-50 p-3 rounded-lg">
                <Activity className="h-8 w-8 text-blue-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Tarjetas de Estadísticas Principales */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 uppercase tracking-wide">Total Pacientes</p>
                {loading.stats ? (
                  <LoadingSpinner size="h-8 w-8" />
                ) : errors.stats ? (
                  <p className="text-red-500 text-sm">Error</p>
                ) : (
                  <>
                    <p className="text-3xl font-bold text-gray-900 mt-2">
                      {stats?.totalPacientes ?? 0}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      {stats?.pacientesActivos ?? 0} activos
                    </p>
                  </>
                )}
              </div>
              <div className="bg-blue-50 p-3 rounded-lg">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 uppercase tracking-wide">Citas Hoy</p>
                {loading.stats ? (
                  <LoadingSpinner size="h-8 w-8" />
                ) : (
                  <>
                    <p className="text-3xl font-bold text-gray-900 mt-2">
                      {stats?.citasHoy ?? 0}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      {stats?.citasSemana ?? 0} esta semana
                    </p>
                  </>
                )}
              </div>
              <div className="bg-green-50 p-3 rounded-lg">
                <Calendar className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 uppercase tracking-wide">Fichas Activas</p>
                {loading.stats ? (
                  <LoadingSpinner size="h-8 w-8" />
                ) : (
                  <>
                    <p className="text-3xl font-bold text-gray-900 mt-2">
                      {stats?.fichasActivas ?? 0}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      {stats?.fichasMes ?? 0} este mes
                    </p>
                  </>
                )}
              </div>
              <div className="bg-purple-50 p-3 rounded-lg">
                <FileText className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 uppercase tracking-wide">Ingresos Mes</p>
                {loading.stats ? (
                  <LoadingSpinner size="h-8 w-8" />
                ) : (
                  <>
                    <p className="text-3xl font-bold text-gray-900 mt-2">
                      {formatearMoneda(stats?.ingresosMes ?? 0)}
                    </p>
                    <p className="text-sm text-green-600 mt-1">
                      +{stats?.crecimientoIngresos ?? 0}% vs anterior
                    </p>
                  </>
                )}
              </div>
              <div className="bg-yellow-50 p-3 rounded-lg">
                <DollarSign className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </div>


          
        </div>

        {/* Segunda fila de estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Servicios Pendientes</h3>
              <AlertCircle className="h-5 w-5 text-orange-500" />
            </div>
            {loading.stats ? (
              <LoadingSpinner />
            ) : (
              <>
                <p className="text-2xl font-bold text-orange-600">
                  {stats?.serviciosPendientes ?? 0}
                </p>
                <p className="text-sm text-gray-500 mt-1">Requieren atención</p>
              </>
            )}
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Facturas Pendientes</h3>
              <Clock className="h-5 w-5 text-red-500" />
            </div>
            {loading.stats ? (
              <LoadingSpinner />
            ) : (
              <>
                <p className="text-2xl font-bold text-red-600">
                  {stats?.facturasPendientes ?? 0}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  {formatearMoneda(stats?.montoFacturasPendientes ?? 0)}
                </p>
              </>
            )}
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Citas Confirmadas</h3>
              <UserCheck className="h-5 w-5 text-green-500" />
            </div>
            {loading.stats ? (
              <LoadingSpinner />
            ) : (
              <>
                <p className="text-2xl font-bold text-green-600">
                  {stats?.citasConfirmadas ?? 0}
                </p>
                <p className="text-sm text-gray-500 mt-1">Próximas 7 días</p>
              </>
            )}
          </div>
        </div>

        {/* Gráficos */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Gráfico de Citas por Día */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Citas por Día (Últimos 7 días)</h3>
              {loading.citasChart && (
                <LoadingSpinner size="h-5 w-5" />
              )}
            </div>
            {errors.citasChart ? (
              <ErrorDisplay 
                error={errors.citasChart} 
                onRetry={() => reloadData('citasChart')} 
                type="citasChart"
              />
            ) : loading.citasChart ? (
              <div className="h-[300px] flex items-center justify-center">
                <LoadingSpinner />
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={citasData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="fecha" stroke="#6b7280" />
                  <YAxis stroke="#6b7280" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'white', 
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px' 
                    }} 
                  />
                  <Line 
                    type="monotone" 
                    dataKey="citas" 
                    stroke="#3B82F6" 
                    strokeWidth={3}
                    dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Estado de Citas */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Estado de Citas</h3>
              <p className="text-gray-600 text-sm">Distribución actual</p>
            </div>
            {loading.stats ? (
              <div className="space-y-4">
                {[1,2,3,4].map(i => (
                  <div key={i} className="flex items-center justify-between p-4 rounded-lg bg-gray-50 animate-pulse">
                    <div className="h-4 bg-gray-300 rounded w-24"></div>
                    <div className="h-4 bg-gray-300 rounded w-8"></div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {[
                  { estado: 'Confirmadas', valor: stats?.citasPorEstado?.confirmadas ?? 0, color: 'bg-green-50 border-green-200', icono: CheckCircle, iconoColor: 'text-green-600' },
                  { estado: 'Pendientes', valor: stats?.citasPorEstado?.pendientes ?? 0, color: 'bg-yellow-50 border-yellow-200', icono: Clock, iconoColor: 'text-yellow-600' },
                  { estado: 'Modificadas', valor: stats?.citasPorEstado?.modificadas ?? 0, color: 'bg-blue-50 border-blue-200', icono: Activity, iconoColor: 'text-blue-600' },
                  { estado: 'Canceladas', valor: stats?.citasPorEstado?.canceladas ?? 0, color: 'bg-red-50 border-red-200', icono: XCircle, iconoColor: 'text-red-600' }
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
            )}
          </div>

          {/* Gráfico de Ingresos Mensuales */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Ingresos Mensuales</h3>
              {loading.ingresos && (
                <LoadingSpinner size="h-5 w-5" />
              )}
            </div>
            {errors.ingresos ? (
              <ErrorDisplay 
                error={errors.ingresos} 
                onRetry={() => reloadData('ingresos')} 
                type="ingresos"
              />
            ) : loading.ingresos ? (
              <div className="h-[300px] flex items-center justify-center">
                <LoadingSpinner />
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={ingresosMensuales}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="mes" stroke="#6b7280" />
                  <YAxis stroke="#6b7280" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'white', 
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px' 
                    }}
                    formatter={(value: number) => [formatearMoneda(value), 'Ingresos']}
                  />
                  <Bar dataKey="ingresos" fill="#10B981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Gráfico de Estados de Servicios */}
     
{/* Gráfico de Estados de Servicios - ACTUALIZADO */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Distribución de Estados de Servicios</h3>
              {loading.stats && (
                <LoadingSpinner size="h-5 w-5" />
              )}
              {!loading.stats && (
                <button
                  onClick={() => reloadData('stats')} // ✅ Cambió de 'servicios' a 'stats'
                  className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                  title="Actualizar datos"
                >
                  <RefreshCw className="h-4 w-4" />
                </button>
              )}
            </div>
            {errors.stats ? ( // ✅ Cambió de 'errors.servicios' a 'errors.stats'
              <ErrorDisplay 
                error={errors.stats} 
                onRetry={() => reloadData('stats')} // ✅ Cambió de 'servicios' a 'stats'
                type="servicios"
              />
            ) : loading.stats ? ( // ✅ Cambió de 'loading.servicios' a 'loading.stats'
              <div className="h-[300px] flex items-center justify-center">
                <LoadingSpinner />
              </div>
            ) : !stats?.serviciosChart || stats.serviciosChart.length === 0 ? ( // ✅ Nueva verificación
              <div className="h-[300px] flex items-center justify-center text-gray-500">
                <div className="text-center">
                  <Activity className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <p>No hay datos de servicios disponibles</p>
                </div>
              </div>
            ) : (
              <>
                {/* Resumen numérico antes del gráfico */}
                <div className="grid grid-cols-3 gap-4 mb-6">
                  {stats.serviciosChart.map((item, index) => (
                    <div key={item.name} className="text-center p-3 rounded-lg border">
                      <div 
                        className="w-4 h-4 rounded-full mx-auto mb-2" 
                        style={{ backgroundColor: coloresPie[index % coloresPie.length] }}
                      ></div>
                      <p className="text-sm font-medium text-gray-600">{item.name}</p>
                      <p className="text-lg font-bold text-gray-900">{item.cantidad}</p>
                    </div>
                  ))}
                </div>
                
                {/* Gráfico circular */}
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={stats.serviciosChart} // ✅ Usar datos unificados
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      dataKey="cantidad"
                      label={renderCustomizedLabel}
                    >
                      {stats.serviciosChart.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={coloresPie[index % coloresPie.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value: any, name: any) => [value, name]}
                      labelFormatter={(label: any) => `${label}`}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </>
            )}
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
                    setBusqueda(e.target.value);
                    setPaginaActual(1);
                  }}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none w-full sm:w-80"
                />
              </div>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            {errors.pacientes ? (
              <ErrorDisplay 
                error={errors.pacientes} 
                onRetry={loadPacientes} 
                type="pacientes"
              />
            ) : loading.pacientes ? (
              <div className="flex items-center justify-center py-12">
                <LoadingSpinner />
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
                          {paciente.edad ?? 'N/A'} años
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">
                          {paciente._count.fichasOdontologicas ?? 0}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
                          {paciente._count.citas ?? 0}
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
                  disabled={paginaActual === 1 || loading.pacientes}
                  className="px-3 py-1 rounded-md bg-gray-100 text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-200 transition-colors flex items-center"
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Anterior
                </button>
                
                {Array.from({ length: Math.min(5, pacientesData.totalPages) }, (_, i) => {
                  const pageNum = Math.max(1, Math.min(
                    pacientesData.totalPages - 4,
                    Math.max(1, paginaActual - 2)
                  )) + i;
                  
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setPaginaActual(pageNum)}
                      disabled={loading.pacientes}
                      className={`px-3 py-1 rounded-md transition-colors disabled:opacity-50 ${
                        pageNum === paginaActual
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
                
                <button
                  onClick={() => setPaginaActual(Math.min(pacientesData.totalPages, paginaActual + 1))}
                  disabled={paginaActual === pacientesData.totalPages || loading.pacientes}
                  className="px-3 py-1 rounded-md bg-gray-100 text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-200 transition-colors flex items-center"
                >
                  Siguiente
                  <ChevronRight className="h-4 w-4 ml-1" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;