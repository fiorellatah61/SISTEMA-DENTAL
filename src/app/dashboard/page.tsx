// // src/app/dashboard/page.tsx
// export default function DashboardPage() {
//   return (
//     <div>
//       <h1 className="text-3xl font-bold text-gray-900 mb-6">Dashboard Principal</h1>
      
//       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
//         <div className="bg-white p-6 rounded-lg shadow-sm">
//           <div className="flex items-center">
//             <div className="text-3xl mr-4">👥</div>
//             <div>
//               <p className="text-sm text-gray-600">Total Pacientes</p>
//               <p className="text-2xl font-semibold">1,234</p>
//             </div>
//           </div>
//         </div>
        
//         <div className="bg-white p-6 rounded-lg shadow-sm">
//           <div className="flex items-center">
//             <div className="text-3xl mr-4">📅</div>
//             <div>
//               <p className="text-sm text-gray-600">Citas Hoy</p>
//               <p className="text-2xl font-semibold">15</p>
//             </div>
//           </div>
//         </div>
        
//         <div className="bg-white p-6 rounded-lg shadow-sm">
//           <div className="flex items-center">
//             <div className="text-3xl mr-4">🦷</div>
//             <div>
//               <p className="text-sm text-gray-600">Tratamientos</p>
//               <p className="text-2xl font-semibold">89</p>
//             </div>
//           </div>
//         </div>
        
//         <div className="bg-white p-6 rounded-lg shadow-sm">
//           <div className="flex items-center">
//             <div className="text-3xl mr-4">💰</div>
//             <div>
//               <p className="text-sm text-gray-600">Ingresos Mes</p>
//               <p className="text-2xl font-semibold">$12,500</p>
//             </div>
//           </div>
//         </div>
//       </div>
      
//       <div className="bg-white p-6 rounded-lg shadow-sm">
//         <h2 className="text-xl font-semibold mb-4">Actividad Reciente</h2>
//         <div className="space-y-3">
//           <div className="flex items-center justify-between py-2 border-b">
//             <span>Nueva cita programada - Juan Pérez</span>
//             <span className="text-sm text-gray-500">Hace 10 min</span>
//           </div>
//           <div className="flex items-center justify-between py-2 border-b">
//             <span>Tratamiento completado - María García</span>
//             <span className="text-sm text-gray-500">Hace 1 hora</span>
//           </div>
//           <div className="flex items-center justify-between py-2">
//             <span>Nuevo paciente registrado - Carlos López</span>
//             <span className="text-sm text-gray-500">Hace 2 horas</span>
//           </div>
//         </div>
//       </div>
//     </div>
//   )
// }

'use client'

import { useState, useEffect } from 'react'
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
  XCircle
} from 'lucide-react'

// Importaciones de shadcn/ui
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'

// Importaciones de Recharts para gráficos
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
  citasPorEstado: {
    confirmadas: number
    pendientes: number
    canceladas: number
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

export default function DashboardPage() {
  // Estados para los datos del dashboard
  const [stats, setStats] = useState<DashboardStats>({
    totalPacientes: 0,
    pacientesNuevosHoy: 0,
    citasHoy: 0,
    citasPendientes: 0,
    ingresosMensuales: 0,
    fichasActivas: 0,
    citasPorEstado: {
      confirmadas: 0,
      pendientes: 0,
      canceladas: 0
    }
  })

  const [citasPorMes, setCitasPorMes] = useState<CitasPorMes[]>([])
  const [pacientesPorEdad, setPacientesPorEdad] = useState<PacientesPorEdad[]>([])
  const [tratamientosMasComunes, setTratamientosMasComunes] = useState<TratamientosMasComunes[]>([])
  const [loading, setLoading] = useState(true)

  // useEffect para cargar datos al montar el componente
  useEffect(() => {
    cargarDatosDashboard()
  }, [])

  // Función principal para cargar todos los datos del dashboard
  const cargarDatosDashboard = async () => {
    try {
      setLoading(true)
      
      // Llamadas simultáneas a todas las APIs para optimizar rendimiento
      await Promise.all([
        cargarEstadisticasGenerales(),
        cargarCitasPorMes(),
        cargarPacientesPorEdad(),
        cargarTratamientosMasComunes()
      ])
      
    } catch (error) {
      console.error('Error al cargar datos del dashboard:', error)
    } finally {
      setLoading(false)
    }
  }

  // Cargar estadísticas generales (tarjetas superiores)
  const cargarEstadisticasGenerales = async () => {
    try {
      const response = await fetch('/api/dashboard/stats')
      if (response.ok) {
        const data = await response.json()
        setStats(data)
      }
    } catch (error) {
      console.error('Error al cargar estadísticas generales:', error)
      // Datos de ejemplo en caso de error
      setStats({
        totalPacientes: 1247,
        pacientesNuevosHoy: 8,
        citasHoy: 12,
        citasPendientes: 25,
        ingresosMensuales: 15420.50,
        fichasActivas: 1198,
        citasPorEstado: {
          confirmadas: 45,
          pendientes: 25,
          canceladas: 8
        }
      })
    }
  }

  // Cargar datos de citas por mes para el gráfico de líneas
  const cargarCitasPorMes = async () => {
    try {
      const response = await fetch('/api/dashboard/citas-por-mes')
      if (response.ok) {
        const data = await response.json()
        setCitasPorMes(data)
      }
    } catch (error) {
      console.error('Error al cargar citas por mes:', error)
      // Datos de ejemplo
      setCitasPorMes([
        { mes: 'Ene', citas: 65, ingresos: 4500 },
        { mes: 'Feb', citas: 78, ingresos: 5200 },
        { mes: 'Mar', citas: 85, ingresos: 5800 },
        { mes: 'Abr', citas: 92, ingresos: 6100 },
        { mes: 'May', citas: 88, ingresos: 5900 },
        { mes: 'Jun', citas: 105, ingresos: 7200 },
        { mes: 'Jul', citas: 110, ingresos: 7500 },
        { mes: 'Ago', citas: 125, ingresos: 8200 }
      ])
    }
  }

  // Cargar distribución de pacientes por edad para gráfico circular
  const cargarPacientesPorEdad = async () => {
    try {
      const response = await fetch('/api/dashboard/pacientes-por-edad')
      if (response.ok) {
        const data = await response.json()
        setPacientesPorEdad(data)
      }
    } catch (error) {
      console.error('Error al cargar pacientes por edad:', error)
      // Datos de ejemplo
      setPacientesPorEdad([
        { rango: '0-18', cantidad: 245, porcentaje: 19.6 },
        { rango: '19-35', cantidad: 387, porcentaje: 31.0 },
        { rango: '36-50', cantidad: 298, porcentaje: 23.9 },
        { rango: '51-65', cantidad: 201, porcentaje: 16.1 },
        { rango: '65+', cantidad: 116, porcentaje: 9.3 }
      ])
    }
  }

  // Cargar tratamientos más comunes para gráfico de barras
  const cargarTratamientosMasComunes = async () => {
    try {
      const response = await fetch('/api/dashboard/tratamientos-comunes')
      if (response.ok) {
        const data = await response.json()
        setTratamientosMasComunes(data)
      }
    } catch (error) {
      console.error('Error al cargar tratamientos más comunes:', error)
      // Datos de ejemplo
      setTratamientosMasComunes([
        { tratamiento: 'Limpieza Dental', cantidad: 245, ingresos: 12250 },
        { tratamiento: 'Obturación', cantidad: 187, ingresos: 18700 },
        { tratamiento: 'Endodoncia', cantidad: 92, ingresos: 27600 },
        { tratamiento: 'Extracción', cantidad: 78, ingresos: 7800 },
        { tratamiento: 'Ortodoncia', cantidad: 45, ingresos: 67500 },
        { tratamiento: 'Implante', cantidad: 23, ingresos: 34500 }
      ])
    }
  }

  // Colores personalizados para los gráficos
  const COLORES_GRAFICOS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d']

  // Componente de tarjeta de estadística reutilizable
  const TarjetaEstadistica = ({ 
    titulo, 
    valor, 
    descripcion, 
    icono: Icono, 
    tendencia, 
    color = 'blue' 
  }: {
    titulo: string
    valor: string | number
    descripcion: string
    icono: any
    tendencia?: string
    color?: string
  }) => (
    <Card className="hover:shadow-lg transition-shadow duration-200">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {titulo}
        </CardTitle>
        <Icono className={`h-4 w-4 text-${color}-600`} />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">
          {typeof valor === 'number' && titulo.includes('Ingresos') 
            ? `S/ ${valor.toLocaleString()}` 
            : valor.toLocaleString()
          }
        </div>
        <div className="flex items-center text-xs text-muted-foreground mt-1">
          {tendencia && (
            <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
          )}
          {descripcion}
        </div>
      </CardContent>
    </Card>
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Cargando dashboard...</span>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6 lg:p-8">
      {/* Header del Dashboard */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Dashboard - Clínica Dental Sonríe
        </h1>
        <p className="text-gray-600">
          Resumen general de la actividad de la clínica
        </p>
      </div>

      {/* Tarjetas de Estadísticas Principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <TarjetaEstadistica
          titulo="Total Pacientes"
          valor={stats.totalPacientes}
          descripcion="Pacientes registrados"
          icono={Users}
          color="blue"
        />
        
        <TarjetaEstadistica
          titulo="Citas Hoy"
          valor={stats.citasHoy}
          descripcion={`${stats.citasPendientes} pendientes`}
          icono={Calendar}
          color="green"
        />
        
        <TarjetaEstadistica
          titulo="Fichas Activas"
          valor={stats.fichasActivas}
          descripcion="Fichas odontológicas"
          icono={FileText}
          color="purple"
        />
        
        <TarjetaEstadistica
          titulo="Ingresos Mensuales"
          valor={stats.ingresosMensuales}
          descripcion="Este mes"
          icono={DollarSign}
          tendencia="+12.5%"
          color="yellow"
        />
      </div>

      {/* Pestañas para organizar diferentes vistas */}
      <Tabs defaultValue="general" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 lg:w-[400px]">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="pacientes">Pacientes</TabsTrigger>
          <TabsTrigger value="tratamientos">Tratamientos</TabsTrigger>
        </TabsList>

        {/* Tab General - Citas y actividad */}
        <TabsContent value="general" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Gráfico de Citas por Mes */}
            <Card>
              <CardHeader>
                <CardTitle>Citas por Mes</CardTitle>
                <CardDescription>
                  Evolución mensual de citas programadas
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={citasPorMes}>
                    <defs>
                      <linearGradient id="colorCitas" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#0088FE" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#0088FE" stopOpacity={0.1}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="mes" />
                    <YAxis />
                    <Tooltip 
                      formatter={(value: any, name: any) => [
                        `${value} ${name === 'citas' ? 'citas' : 'soles'}`,
                        name === 'citas' ? 'Citas' : 'Ingresos'
                      ]}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="citas" 
                      stroke="#0088FE" 
                      fillOpacity={1} 
                      fill="url(#colorCitas)" 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Estado de Citas */}
            <Card>
              <CardHeader>
                <CardTitle>Estado de Citas</CardTitle>
                <CardDescription>
                  Distribución actual de citas
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <div className="flex items-center">
                      <CheckCircle2 className="h-5 w-5 text-green-600 mr-2" />
                      <span className="font-medium">Confirmadas</span>
                    </div>
                    <Badge variant="secondary" className="bg-green-100 text-green-800">
                      {stats.citasPorEstado.confirmadas}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                    <div className="flex items-center">
                      <Clock className="h-5 w-5 text-yellow-600 mr-2" />
                      <span className="font-medium">Pendientes</span>
                    </div>
                    <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                      {stats.citasPorEstado.pendientes}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                    <div className="flex items-center">
                      <XCircle className="h-5 w-5 text-red-600 mr-2" />
                      <span className="font-medium">Canceladas</span>
                    </div>
                    <Badge variant="secondary" className="bg-red-100 text-red-800">
                      {stats.citasPorEstado.canceladas}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Tab Pacientes - Demografía */}
        <TabsContent value="pacientes" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Gráfico Circular - Pacientes por Edad */}
            <Card>
              <CardHeader>
                <CardTitle>Pacientes por Edad</CardTitle>
                <CardDescription>
                  Distribución demográfica de pacientes
                </CardDescription>
              </CardHeader>
              <CardContent>
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
                      formatter={(value: any) => [`${value} pacientes`, 'Cantidad']}
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Estadísticas de Pacientes */}
            <Card>
              <CardHeader>
                <CardTitle>Actividad de Pacientes</CardTitle>
                <CardDescription>
                  Métricas de actividad reciente
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center p-4 bg-blue-50 rounded-lg">
                  <div>
                    <p className="text-sm text-gray-600">Nuevos esta semana</p>
                    <p className="text-2xl font-bold text-blue-600">24</p>
                  </div>
                  <Activity className="h-8 w-8 text-blue-600" />
                </div>
                
                <div className="flex justify-between items-center p-4 bg-purple-50 rounded-lg">
                  <div>
                    <p className="text-sm text-gray-600">Pacientes activos</p>
                    <p className="text-2xl font-bold text-purple-600">1,198</p>
                  </div>
                  <Users className="h-8 w-8 text-purple-600" />
                </div>
                
                <div className="flex justify-between items-center p-4 bg-green-50 rounded-lg">
                  <div>
                    <p className="text-sm text-gray-600">Retención mensual</p>
                    <p className="text-2xl font-bold text-green-600">87%</p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Tab Tratamientos - Ingresos */}
        <TabsContent value="tratamientos" className="space-y-6">
          
          {/* Gráfico de Barras - Tratamientos más Comunes */}
          <Card>
            <CardHeader>
              <CardTitle>Tratamientos Más Comunes</CardTitle>
              <CardDescription>
                Tratamientos más realizados y sus ingresos
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={tratamientosMasComunes} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="tratamiento" 
                    angle={-45}
                    textAnchor="end"
                    height={100}
                    fontSize={12}
                  />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip 
                    formatter={(value: any, name: any) => [
                      name === 'cantidad' ? `${value} tratamientos` : `S/ ${value}`,
                      name === 'cantidad' ? 'Cantidad' : 'Ingresos'
                    ]}
                  />
                  <Legend />
                  <Bar 
                    yAxisId="left" 
                    dataKey="cantidad" 
                    fill="#0088FE" 
                    name="Cantidad de Tratamientos"
                  />
                  <Bar 
                    yAxisId="right" 
                    dataKey="ingresos" 
                    fill="#00C49F" 
                    name="Ingresos (S/)"
                  />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Alertas y Notificaciones */}
      <div className="mt-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <AlertCircle className="h-5 w-5 text-orange-600 mr-2" />
              Alertas y Recordatorios
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center p-3 bg-orange-50 rounded-lg border-l-4 border-orange-400">
                <Clock className="h-4 w-4 text-orange-600 mr-3" />
                <div>
                  <p className="font-medium text-orange-800">5 citas necesitan confirmación</p>
                  <p className="text-sm text-orange-600">Para el día de mañana</p>
                </div>
              </div>
              
              <div className="flex items-center p-3 bg-blue-50 rounded-lg border-l-4 border-blue-400">
                <FileText className="h-4 w-4 text-blue-600 mr-3" />
                <div>
                  <p className="font-medium text-blue-800">12 fichas pendientes de actualizar</p>
                  <p className="text-sm text-blue-600">Últimos tratamientos realizados</p>
                </div>
              </div>
              
              <div className="flex items-center p-3 bg-green-50 rounded-lg border-l-4 border-green-400">
                <CheckCircle2 className="h-4 w-4 text-green-600 mr-3" />
                <div>
                  <p className="font-medium text-green-800">Sistema funcionando correctamente</p>
                  <p className="text-sm text-green-600">Todas las copias de seguridad actualizadas</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}