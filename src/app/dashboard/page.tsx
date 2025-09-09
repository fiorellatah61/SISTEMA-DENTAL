// // src/app/dashboard/page.tsx
// "use client"
// import React, { useState, useEffect, useCallback } from 'react';
// import { 
//   Users, Calendar, FileText, DollarSign, Clock, 
//   UserCheck, AlertCircle, Activity,
//   Search, Phone, Mail, User, ChevronLeft, ChevronRight,
//   CheckCircle, XCircle, RefreshCw
// } from 'lucide-react';
// import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';

// // Interfaces
// interface Stats {
//   totalPacientes: number;
//   pacientesActivos: number;
//   citasHoy: number;
//   citasSemana: number;
//   citasConfirmadas: number;
//   fichasActivas: number;
//   fichasMes: number;
//   serviciosPendientes: number;
//   facturasPendientes: number;
//   montoFacturasPendientes: number;
//   ingresosMes: number;
//   crecimientoIngresos: number;
//   citasPorEstado: {
//     confirmadas: number;
//     pendientes: number;
//     modificadas: number;
//     canceladas: number;
//   };
//    // ✅ NUEVA PROPIEDAD
//   serviciosChart: ServiciosData[];
// }

// interface PacienteWithCount {
//   id: string;
//   nombres: string;
//   apellidos: string;
//   dni: string;
//   fechaNacimiento?: Date;
//   edad?: number;
//   sexo?: 'M' | 'F' | 'OTRO';
//   telefono? : string;
//   email?: string;
//   estado: 'ACTIVO' | 'INACTIVO';
//   createdAt: Date;
//   _count: {
//     fichasOdontologicas: number;
//     citas: number;
//   };
// }

// interface PacientesData {
//   pacientes: PacienteWithCount[];
//   total: number;
//   currentPage: number;
//   totalPages: number;
//   hasMore: boolean;
// }

// interface CitasData {
//   fecha: string;
//   citas: number;
// }

// interface IngresosData {
//   mes: string;
//   ingresos: number;
// }

// interface ServiciosData {
//   name: string;
//   cantidad: number;
// }

// interface CustomLabelProps {
//   name?: string;
//   percent?: number;
//   cx?: number;
//   cy?: number;
//   midAngle?: number;
//   innerRadius?: number;
//   outerRadius?: number;
//   value?: number;
// }

// // Estados de carga independientes
// interface LoadingStates {
//   stats: boolean;
//   citasChart: boolean;
//   ingresos: boolean;
//   // servicios: boolean;
//   pacientes: boolean;
// }

// const Dashboard = () => {
//   // Estados principales
//   const [stats, setStats] = useState<Stats | null>(null);
//   const [citasData, setCitasData] = useState<CitasData[]>([]);
//   const [pacientesData, setPacientesData] = useState<PacientesData>({ 
//     pacientes: [], total: 0, currentPage: 1, totalPages: 1, hasMore: false 
//   });
//   const [ingresosMensuales, setIngresosMensuales] = useState<IngresosData[]>([]);
//   // const [estadisticasServicios, setEstadisticasServicios] = useState<ServiciosData[]>([]);
  
//   // Estados de carga independientes
//   const [loading, setLoading] = useState<LoadingStates>({
//     stats: true,
//     citasChart: true,
//     ingresos: true,
//     // servicios: true,
//     pacientes: true
//   });
  
//   // Estados de error - Permitir string | null
//   const [errors, setErrors] = useState<{[key: string]: string | null}>({});
  
//   // Estados de búsqueda
//   const [busqueda, setBusqueda] = useState('');
//   const [paginaActual, setPaginaActual] = useState(1);

//   // Función genérica para manejar errores y loading
//   const updateLoadingState = (key: keyof LoadingStates, isLoading: boolean) => {
//     setLoading(prev => ({ ...prev, [key]: isLoading }));
//   };

//   const setError = (key: string, error: string | null) => {
//     setErrors(prev => {
//       if (error === null) {
//         const newErrors = { ...prev };
//         delete newErrors[key];
//         return newErrors;
//       }
//       return { ...prev, [key]: error };
//     });
//   };

//   // Función genérica para fetch con retry automático
//   const fetchWithRetry = async <T,>(
//     url: string,
//     key: keyof LoadingStates,
//     setter: (data: T) => void,
//     fallbackData?: T,
//     maxRetries: number = 2
//   ) => {
//     updateLoadingState(key, true);
//     setError(key, null);

//     for (let attempt = 0; attempt < maxRetries; attempt++) {
//       try {
//         const controller = new AbortController();
//         const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout

//         const response = await fetch(url, { 
//           signal: controller.signal,
//           headers: {
//             'Cache-Control': 'no-cache',
//           }
//         });
        
//         clearTimeout(timeoutId);

//         if (!response.ok) {
//           throw new Error(`Error ${response.status}: ${response.statusText}`);
//         }

//         const data = await response.json();
//         setter(data);
//         updateLoadingState(key, false);
//         return;

//       } catch (error: any) {
//         console.warn(`Intento ${attempt + 1}/${maxRetries} falló para ${url}:`, error.message);
        
//         if (attempt === maxRetries - 1) {
//           // Último intento fallido
//           if (fallbackData) {
//             setter(fallbackData);
//           }
//           setError(key, `Error al cargar ${key}: ${error.message}`);
//           updateLoadingState(key, false);
//         } else {
//           // Esperar antes del siguiente intento
//           await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)));
//         }
//       }
//     }
//   };

//   // Función para recargar datos específicos
//   const reloadData = useCallback((type?: keyof LoadingStates) => {
//     if (!type || type === 'stats') {
//       fetchWithRetry('/api/dashboard/stats', 'stats', setStats, {
//         totalPacientes: 0,
//         pacientesActivos: 0,
//         citasHoy: 0,
//         citasSemana: 0,
//         citasConfirmadas: 0,
//         fichasActivas: 0,
//         fichasMes: 0,
//         serviciosPendientes: 0,
//         facturasPendientes: 0,
//         montoFacturasPendientes: 0,
//         ingresosMes: 0,
//         crecimientoIngresos: 0,
//         citasPorEstado: { confirmadas: 0, pendientes: 0, modificadas: 0, canceladas: 0 },
//         serviciosChart: [] // ✅ Agregar esta línea
//       });
//     }

//     if (!type || type === 'citasChart') {
//       fetchWithRetry('/api/dashboard/citas-chart', 'citasChart', setCitasData, []);
//     }

//     if (!type || type === 'ingresos') {
//       fetchWithRetry('/api/dashboard/ingresos-mensuales', 'ingresos', setIngresosMensuales, []);
//     }

//     // if (!type || type === 'servicios') {
//     //   fetchWithRetry('/api/dashboard/servicios-stats', 'servicios', setEstadisticasServicios, []);
//     // }
//   }, []);

//   // Función específica para pacientes (con parámetros)
//   const loadPacientes = useCallback(() => {
//     const params = new URLSearchParams({
//       page: paginaActual.toString(),
//       search: busqueda,
//       limit: '10'
//     });
    
//     fetchWithRetry(
//       `/api/dashboard/pacientes?${params}`, 
//       'pacientes', 
//       setPacientesData,
//       { pacientes: [], total: 0, currentPage: 1, totalPages: 1, hasMore: false }
//     );
//   }, [paginaActual, busqueda]);

//   // Efectos de carga inicial
//   useEffect(() => {
//     reloadData();
//   }, [reloadData]);

//   useEffect(() => {
//     const debounceTimer = setTimeout(loadPacientes, busqueda ? 500 : 0);
//     return () => clearTimeout(debounceTimer);
//   }, [loadPacientes]);

//   // Funciones de utilidad
//   const formatearFecha = (fecha: string | Date) => {
//     return new Date(fecha).toLocaleDateString('es-PE', {
//       day: '2-digit',
//       month: '2-digit',
//       year: 'numeric'
//     });
//   };

//   const formatearMoneda = (cantidad: number) => {
//     return new Intl.NumberFormat('es-PE', {
//       style: 'currency',
//       currency: 'PEN'
//     }).format(cantidad);
//   };

//   const renderCustomizedLabel = (props: CustomLabelProps) => {
//     const { name, percent } = props;
//     return `${name}: ${((percent || 0) * 100).toFixed(0)}%`;
//   };
//   const coloresPie = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

//   // Componente de estado de carga
//   const LoadingSpinner = ({ size = "h-8 w-8" }: { size?: string }) => (
//     <div className="flex items-center justify-center">
//       <div className={`animate-spin rounded-full ${size} border-b-2 border-blue-500`}></div>
//     </div>
//   );

//   // Componente de error con retry
//   const ErrorDisplay = ({ error, onRetry, type }: { error: string; onRetry: () => void; type: string }) => (
//     <div className="flex flex-col items-center justify-center py-8 text-center">
//       <AlertCircle className="h-12 w-12 text-red-300 mb-4" />
//       <p className="text-red-600 mb-4">{error}</p>
//       <button
//         onClick={onRetry}
//         className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2"
//       >
//         <RefreshCw className="h-4 w-4" />
//         Reintentar
//       </button>
//     </div>
//   );

//   // Verificar si todo está cargando por primera vez
//   const isInitialLoading = Object.values(loading).every(val => val === true);

//   if (isInitialLoading) {
//     return (
//       <div className="flex items-center justify-center min-h-screen">
//         <div className="text-center">
//           <LoadingSpinner size="h-12 w-12" />
//           <span className="ml-4 text-lg">Cargando dashboard...</span>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-gray-50 p-4 lg:p-6">
//       <div className="max-w-7xl mx-auto space-y-6">
//         {/* Header con botón de recarga */}
//         <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
//           <div className="flex items-center justify-between">
//             <div>
//               <h1 className="text-3xl font-bold text-gray-900">Dashboard Clínica Dental</h1>
//               <p className="text-gray-600 mt-1">Resumen completo de la gestión clínica</p>
//             </div>
//             <div className="flex items-center gap-4">
//               <button
//                 onClick={() => reloadData()}
//                 className="p-2 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
//                 title="Actualizar datos"
//               >
//                 <RefreshCw className="h-5 w-5 text-blue-600" />
//               </button>
//               <div className="bg-blue-50 p-3 rounded-lg">
//                 <Activity className="h-8 w-8 text-blue-600" />
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* Tarjetas de Estadísticas Principales */}
//         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
//           <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
//             <div className="flex items-center justify-between">
//               <div>
//                 <p className="text-sm font-medium text-gray-600 uppercase tracking-wide">Total Pacientes</p>
//                 {loading.stats ? (
//                   <LoadingSpinner size="h-8 w-8" />
//                 ) : errors.stats ? (
//                   <p className="text-red-500 text-sm">Error</p>
//                 ) : (
//                   <>
//                     <p className="text-3xl font-bold text-gray-900 mt-2">
//                       {stats?.totalPacientes ?? 0}
//                     </p>
//                     <p className="text-sm text-gray-500 mt-1">
//                       {stats?.pacientesActivos ?? 0} activos
//                     </p>
//                   </>
//                 )}
//               </div>
//               <div className="bg-blue-50 p-3 rounded-lg">
//                 <Users className="h-6 w-6 text-blue-600" />
//               </div>
//             </div>
//           </div>

//           <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
//             <div className="flex items-center justify-between">
//               <div>
//                 <p className="text-sm font-medium text-gray-600 uppercase tracking-wide">Citas Hoy</p>
//                 {loading.stats ? (
//                   <LoadingSpinner size="h-8 w-8" />
//                 ) : (
//                   <>
//                     <p className="text-3xl font-bold text-gray-900 mt-2">
//                       {stats?.citasHoy ?? 0}
//                     </p>
//                     <p className="text-sm text-gray-500 mt-1">
//                       {stats?.citasSemana ?? 0} esta semana
//                     </p>
//                   </>
//                 )}
//               </div>
//               <div className="bg-green-50 p-3 rounded-lg">
//                 <Calendar className="h-6 w-6 text-green-600" />
//               </div>
//             </div>
//           </div>

//           <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
//             <div className="flex items-center justify-between">
//               <div>
//                 <p className="text-sm font-medium text-gray-600 uppercase tracking-wide">Fichas Activas</p>
//                 {loading.stats ? (
//                   <LoadingSpinner size="h-8 w-8" />
//                 ) : (
//                   <>
//                     <p className="text-3xl font-bold text-gray-900 mt-2">
//                       {stats?.fichasActivas ?? 0}
//                     </p>
//                     <p className="text-sm text-gray-500 mt-1">
//                       {stats?.fichasMes ?? 0} este mes
//                     </p>
//                   </>
//                 )}
//               </div>
//               <div className="bg-purple-50 p-3 rounded-lg">
//                 <FileText className="h-6 w-6 text-purple-600" />
//               </div>
//             </div>
//           </div>

//           <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
//             <div className="flex items-center justify-between">
//               <div>
//                 <p className="text-sm font-medium text-gray-600 uppercase tracking-wide">Ingresos Mes</p>
//                 {loading.stats ? (
//                   <LoadingSpinner size="h-8 w-8" />
//                 ) : (
//                   <>
//                     <p className="text-3xl font-bold text-gray-900 mt-2">
//                       {formatearMoneda(stats?.ingresosMes ?? 0)}
//                     </p>
//                     <p className="text-sm text-green-600 mt-1">
//                       +{stats?.crecimientoIngresos ?? 0}% vs anterior
//                     </p>
//                   </>
//                 )}
//               </div>
//               <div className="bg-yellow-50 p-3 rounded-lg">
//                 <DollarSign className="h-6 w-6 text-yellow-600" />
//               </div>
//             </div>
//           </div>


          
//         </div>

//         {/* Segunda fila de estadísticas */}
//         <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//           <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
//             <div className="flex items-center justify-between mb-4">
//               <h3 className="text-lg font-semibold text-gray-900">Servicios Pendientes</h3>
//               <AlertCircle className="h-5 w-5 text-orange-500" />
//             </div>
//             {loading.stats ? (
//               <LoadingSpinner />
//             ) : (
//               <>
//                 <p className="text-2xl font-bold text-orange-600">
//                   {stats?.serviciosPendientes ?? 0}
//                 </p>
//                 <p className="text-sm text-gray-500 mt-1">Requieren atención</p>
//               </>
//             )}
//           </div>

//           <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
//             <div className="flex items-center justify-between mb-4">
//               <h3 className="text-lg font-semibold text-gray-900">Facturas Pendientes</h3>
//               <Clock className="h-5 w-5 text-red-500" />
//             </div>
//             {loading.stats ? (
//               <LoadingSpinner />
//             ) : (
//               <>
//                 <p className="text-2xl font-bold text-red-600">
//                   {stats?.facturasPendientes ?? 0}
//                 </p>
//                 <p className="text-sm text-gray-500 mt-1">
//                   {formatearMoneda(stats?.montoFacturasPendientes ?? 0)}
//                 </p>
//               </>
//             )}
//           </div>

//           <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
//             <div className="flex items-center justify-between mb-4">
//               <h3 className="text-lg font-semibold text-gray-900">Citas Confirmadas</h3>
//               <UserCheck className="h-5 w-5 text-green-500" />
//             </div>
//             {loading.stats ? (
//               <LoadingSpinner />
//             ) : (
//               <>
//                 <p className="text-2xl font-bold text-green-600">
//                   {stats?.citasConfirmadas ?? 0}
//                 </p>
//                 <p className="text-sm text-gray-500 mt-1">Próximas 7 días</p>
//               </>
//             )}
//           </div>
//         </div>

//         {/* Gráficos */}
//         <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
//           {/* Gráfico de Citas por Día */}
//           <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
//             <div className="flex items-center justify-between mb-4">
//               <h3 className="text-lg font-semibold text-gray-900">Citas por Día (Últimos 7 días)</h3>
//               {loading.citasChart && (
//                 <LoadingSpinner size="h-5 w-5" />
//               )}
//             </div>
//             {errors.citasChart ? (
//               <ErrorDisplay 
//                 error={errors.citasChart} 
//                 onRetry={() => reloadData('citasChart')} 
//                 type="citasChart"
//               />
//             ) : loading.citasChart ? (
//               <div className="h-[300px] flex items-center justify-center">
//                 <LoadingSpinner />
//               </div>
//             ) : (
//               <ResponsiveContainer width="100%" height={300}>
//                 <LineChart data={citasData}>
//                   <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
//                   <XAxis dataKey="fecha" stroke="#6b7280" />
//                   <YAxis stroke="#6b7280" />
//                   <Tooltip 
//                     contentStyle={{ 
//                       backgroundColor: 'white', 
//                       border: '1px solid #e5e7eb',
//                       borderRadius: '8px' 
//                     }} 
//                   />
//                   <Line 
//                     type="monotone" 
//                     dataKey="citas" 
//                     stroke="#3B82F6" 
//                     strokeWidth={3}
//                     dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
//                   />
//                 </LineChart>
//               </ResponsiveContainer>
//             )}
//           </div>

//           {/* Estado de Citas */}
//           <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
//             <div className="mb-6">
//               <h3 className="text-lg font-semibold text-gray-900">Estado de Citas</h3>
//               <p className="text-gray-600 text-sm">Distribución actual</p>
//             </div>
//             {loading.stats ? (
//               <div className="space-y-4">
//                 {[1,2,3,4].map(i => (
//                   <div key={i} className="flex items-center justify-between p-4 rounded-lg bg-gray-50 animate-pulse">
//                     <div className="h-4 bg-gray-300 rounded w-24"></div>
//                     <div className="h-4 bg-gray-300 rounded w-8"></div>
//                   </div>
//                 ))}
//               </div>
//             ) : (
//               <div className="space-y-4">
//                 {[
//                   { estado: 'Confirmadas', valor: stats?.citasPorEstado?.confirmadas ?? 0, color: 'bg-green-50 border-green-200', icono: CheckCircle, iconoColor: 'text-green-600' },
//                   { estado: 'Pendientes', valor: stats?.citasPorEstado?.pendientes ?? 0, color: 'bg-yellow-50 border-yellow-200', icono: Clock, iconoColor: 'text-yellow-600' },
//                   { estado: 'Modificadas', valor: stats?.citasPorEstado?.modificadas ?? 0, color: 'bg-blue-50 border-blue-200', icono: Activity, iconoColor: 'text-blue-600' },
//                   { estado: 'Canceladas', valor: stats?.citasPorEstado?.canceladas ?? 0, color: 'bg-red-50 border-red-200', icono: XCircle, iconoColor: 'text-red-600' }
//                 ].map(({ estado, valor, color, icono: IconoEstado, iconoColor }) => (
//                   <div key={estado} className={`flex items-center justify-between p-4 rounded-lg border ${color}`}>
//                     <div className="flex items-center">
//                       <IconoEstado className={`h-5 w-5 ${iconoColor} mr-3`} />
//                       <span className="font-medium text-gray-900">{estado}</span>
//                     </div>
//                     <span className="text-lg font-bold text-gray-900">{valor}</span>
//                   </div>
//                 ))}
//               </div>
//             )}
//           </div>

//           {/* Gráfico de Ingresos Mensuales */}
//           <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
//             <div className="flex items-center justify-between mb-4">
//               <h3 className="text-lg font-semibold text-gray-900">Ingresos Mensuales</h3>
//               {loading.ingresos && (
//                 <LoadingSpinner size="h-5 w-5" />
//               )}
//             </div>
//             {errors.ingresos ? (
//               <ErrorDisplay 
//                 error={errors.ingresos} 
//                 onRetry={() => reloadData('ingresos')} 
//                 type="ingresos"
//               />
//             ) : loading.ingresos ? (
//               <div className="h-[300px] flex items-center justify-center">
//                 <LoadingSpinner />
//               </div>
//             ) : (
//               <ResponsiveContainer width="100%" height={300}>
//                 <BarChart data={ingresosMensuales}>
//                   <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
//                   <XAxis dataKey="mes" stroke="#6b7280" />
//                   <YAxis stroke="#6b7280" />
//                   <Tooltip 
//                     contentStyle={{ 
//                       backgroundColor: 'white', 
//                       border: '1px solid #e5e7eb',
//                       borderRadius: '8px' 
//                     }}
//                     formatter={(value: number) => [formatearMoneda(value), 'Ingresos']}
//                   />
//                   <Bar dataKey="ingresos" fill="#10B981" radius={[4, 4, 0, 0]} />
//                 </BarChart>
//               </ResponsiveContainer>
//             )}
//           </div>

//           {/* Gráfico de Estados de Servicios */}
     
// {/* Gráfico de Estados de Servicios - ACTUALIZADO */}
//           <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
//             <div className="flex items-center justify-between mb-4">
//               <h3 className="text-lg font-semibold text-gray-900">Distribución de Estados de Servicios</h3>
//               {loading.stats && (
//                 <LoadingSpinner size="h-5 w-5" />
//               )}
//               {!loading.stats && (
//                 <button
//                   onClick={() => reloadData('stats')} // ✅ Cambió de 'servicios' a 'stats'
//                   className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
//                   title="Actualizar datos"
//                 >
//                   <RefreshCw className="h-4 w-4" />
//                 </button>
//               )}
//             </div>
//             {errors.stats ? ( // ✅ Cambió de 'errors.servicios' a 'errors.stats'
//               <ErrorDisplay 
//                 error={errors.stats} 
//                 onRetry={() => reloadData('stats')} // ✅ Cambió de 'servicios' a 'stats'
//                 type="servicios"
//               />
//             ) : loading.stats ? ( // ✅ Cambió de 'loading.servicios' a 'loading.stats'
//               <div className="h-[300px] flex items-center justify-center">
//                 <LoadingSpinner />
//               </div>
//             ) : !stats?.serviciosChart || stats.serviciosChart.length === 0 ? ( // ✅ Nueva verificación
//               <div className="h-[300px] flex items-center justify-center text-gray-500">
//                 <div className="text-center">
//                   <Activity className="h-12 w-12 text-gray-300 mx-auto mb-4" />
//                   <p>No hay datos de servicios disponibles</p>
//                 </div>
//               </div>
//             ) : (
//               <>
//                 {/* Resumen numérico antes del gráfico */}
//                 <div className="grid grid-cols-3 gap-4 mb-6">
//                   {stats.serviciosChart.map((item, index) => (
//                     <div key={item.name} className="text-center p-3 rounded-lg border">
//                       <div 
//                         className="w-4 h-4 rounded-full mx-auto mb-2" 
//                         style={{ backgroundColor: coloresPie[index % coloresPie.length] }}
//                       ></div>
//                       <p className="text-sm font-medium text-gray-600">{item.name}</p>
//                       <p className="text-lg font-bold text-gray-900">{item.cantidad}</p>
//                     </div>
//                   ))}
//                 </div>
                
//                 {/* Gráfico circular */}
//                 <ResponsiveContainer width="100%" height={300}>
//                   <PieChart>
//                     <Pie
//                       data={stats.serviciosChart} // ✅ Usar datos unificados
//                       cx="50%"
//                       cy="50%"
//                       outerRadius={100}
//                       dataKey="cantidad"
//                       label={renderCustomizedLabel}
//                     >
//                       {stats.serviciosChart.map((entry, index) => (
//                         <Cell key={`cell-${index}`} fill={coloresPie[index % coloresPie.length]} />
//                       ))}
//                     </Pie>
//                     <Tooltip 
//                       formatter={(value: any, name: any) => [value, name]}
//                       labelFormatter={(label: any) => `${label}`}
//                     />
//                   </PieChart>
//                 </ResponsiveContainer>
//               </>
//             )}
//           </div>

//        </div>

//         {/* Lista de Pacientes */}
//         <div className="bg-white rounded-xl shadow-sm border border-gray-100">
//           <div className="p-6 border-b border-gray-200">
//             <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
//               <div>
//                 <h3 className="text-lg font-semibold text-gray-900">Lista de Pacientes</h3>
//                 <p className="text-gray-600 text-sm">Total: {pacientesData.total} pacientes registrados</p>
//               </div>
//               <div className="relative">
//                 <Search className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
//                 <input
//                   type="text"
//                   placeholder="Buscar paciente..."
//                   value={busqueda}
//                   onChange={(e) => {
//                     setBusqueda(e.target.value);
//                     setPaginaActual(1);
//                   }}
//                   className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none w-full sm:w-80"
//                 />
//               </div>
//             </div>
//           </div>
          
//           <div className="overflow-x-auto">
//             {errors.pacientes ? (
//               <ErrorDisplay 
//                 error={errors.pacientes} 
//                 onRetry={loadPacientes} 
//                 type="pacientes"
//               />
//             ) : loading.pacientes ? (
//               <div className="flex items-center justify-center py-12">
//                 <LoadingSpinner />
//                 <span className="ml-2 text-gray-600">Cargando pacientes...</span>
//               </div>
//             ) : pacientesData.pacientes.length === 0 ? (
//               <div className="flex items-center justify-center py-12 text-gray-500">
//                 <div className="text-center">
//                   <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
//                   <p className="text-lg font-medium">No se encontraron pacientes</p>
//                   <p className="text-sm">
//                     {busqueda 
//                       ? 'Intenta con diferentes términos de búsqueda' 
//                       : 'No hay pacientes registrados aún'
//                     }
//                   </p>
//                 </div>
//               </div>
//             ) : (
//               <table className="w-full">
//                 <thead className="bg-gray-50">
//                   <tr>
//                     <th className="text-left py-3 px-6 font-semibold text-gray-900">Paciente</th>
//                     <th className="text-left py-3 px-6 font-semibold text-gray-900">DNI</th>
//                     <th className="text-left py-3 px-6 font-semibold text-gray-900">Contacto</th>
//                     <th className="text-left py-3 px-6 font-semibold text-gray-900">Edad</th>
//                     <th className="text-left py-3 px-6 font-semibold text-gray-900">Fichas</th>
//                     <th className="text-left py-3 px-6 font-semibold text-gray-900">Citas</th>
//                     <th className="text-left py-3 px-6 font-semibold text-gray-900">Estado</th>
//                     <th className="text-left py-3 px-6 font-semibold text-gray-900">Registro</th>
//                   </tr>
//                 </thead>
//                 <tbody className="divide-y divide-gray-200">
//                   {pacientesData.pacientes.map((paciente) => (
//                     <tr key={paciente.id} className="hover:bg-gray-50 transition-colors">
//                       <td className="py-4 px-6">
//                         <div className="flex items-center">
//                           <div className="bg-blue-100 rounded-full p-2 mr-3">
//                             <User className="h-4 w-4 text-blue-600" />
//                           </div>
//                           <div>
//                             <p className="font-semibold text-gray-900">
//                               {paciente.nombres} {paciente.apellidos}
//                             </p>
//                             <p className="text-sm text-gray-500 capitalize">
//                               {paciente.sexo === 'M' ? 'Masculino' : paciente.sexo === 'F' ? 'Femenino' : 'Otro'}
//                             </p>
//                           </div>
//                         </div>
//                       </td>
//                       <td className="py-4 px-6">
//                         <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">
//                           {paciente.dni}
//                         </span>
//                       </td>
//                       <td className="py-4 px-6">
//                         <div className="space-y-1">
//                           {paciente.telefono && (
//                             <div className="flex items-center text-sm text-gray-600">
//                               <Phone className="h-3 w-3 mr-1" />
//                               {paciente.telefono}
//                             </div>
//                           )}
//                           {paciente.email && (
//                             <div className="flex items-center text-sm text-gray-600">
//                               <Mail className="h-3 w-3 mr-1" />
//                               {paciente.email}
//                             </div>
//                           )}
//                         </div>
//                       </td>
//                       <td className="py-4 px-6">
//                         <span className="text-sm font-medium text-gray-900">
//                           {paciente.edad ?? 'N/A'} años
//                         </span>
//                       </td>
//                       <td className="py-4 px-6">
//                         <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">
//                           {paciente._count.fichasOdontologicas ?? 0}
//                         </span>
//                       </td>
//                       <td className="py-4 px-6">
//                         <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
//                           {paciente._count.citas ?? 0}
//                         </span>
//                       </td>
//                       <td className="py-4 px-6">
//                         <span className={`px-2 py-1 rounded-full text-xs font-medium ${
//                           paciente.estado === 'ACTIVO' 
//                             ? 'bg-green-100 text-green-800' 
//                             : 'bg-red-100 text-red-800'
//                         }`}>
//                           {paciente.estado}
//                         </span>
//                       </td>
//                       <td className="py-4 px-6">
//                         <span className="text-sm text-gray-600">
//                           {formatearFecha(paciente.createdAt)}
//                         </span>
//                       </td>
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>
//             )}
//           </div>

//           {/* Paginación */}
//           {pacientesData.totalPages > 1 && (
//             <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200">
//               <div className="text-sm text-gray-600">
//                 Mostrando página {pacientesData.currentPage} de {pacientesData.totalPages}
//               </div>
//               <div className="flex items-center space-x-2">
//                 <button
//                   onClick={() => setPaginaActual(Math.max(1, paginaActual - 1))}
//                   disabled={paginaActual === 1 || loading.pacientes}
//                   className="px-3 py-1 rounded-md bg-gray-100 text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-200 transition-colors flex items-center"
//                 >
//                   <ChevronLeft className="h-4 w-4 mr-1" />
//                   Anterior
//                 </button>
                
//                 {Array.from({ length: Math.min(5, pacientesData.totalPages) }, (_, i) => {
//                   const pageNum = Math.max(1, Math.min(
//                     pacientesData.totalPages - 4,
//                     Math.max(1, paginaActual - 2)
//                   )) + i;
                  
//                   return (
//                     <button
//                       key={pageNum}
//                       onClick={() => setPaginaActual(pageNum)}
//                       disabled={loading.pacientes}
//                       className={`px-3 py-1 rounded-md transition-colors disabled:opacity-50 ${
//                         pageNum === paginaActual
//                           ? 'bg-blue-500 text-white'
//                           : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
//                       }`}
//                     >
//                       {pageNum}
//                     </button>
//                   );
//                 })}
                
//                 <button
//                   onClick={() => setPaginaActual(Math.min(pacientesData.totalPages, paginaActual + 1))}
//                   disabled={paginaActual === pacientesData.totalPages || loading.pacientes}
//                   className="px-3 py-1 rounded-md bg-gray-100 text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-200 transition-colors flex items-center"
//                 >
//                   Siguiente
//                   <ChevronRight className="h-4 w-4 ml-1" />
//                 </button>
//               </div>
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Dashboard;



// //  NUEVO---------------------MEJOR 1------------
// src/app/dashboard/page.tsx
// // // src/app/dashboard/page.tsx
// // "use client"
// // import React, { useState, useEffect, useCallback } from 'react';
// // import { 
// //   Users, Calendar, FileText, DollarSign, Clock, 
// //   UserCheck, AlertCircle, Activity,
// //   Search, Phone, Mail, User, ChevronLeft, ChevronRight,
// //   CheckCircle, XCircle, RefreshCw
// // } from 'lucide-react';
// // import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';

// // // Interfaces
// // interface Stats {
// //   totalPacientes: number;
// //   pacientesActivos: number;
// //   citasHoy: number;
// //   citasSemana: number;
// //   citasConfirmadas: number;
// //   fichasActivas: number;
// //   fichasMes: number;
// //   serviciosPendientes: number;
// //   facturasPendientes: number;
// //   montoFacturasPendientes: number;
// //   ingresosMes: number;
// //   crecimientoIngresos: number;
// //   citasPorEstado: {
// //     confirmadas: number;
// //     pendientes: number;
// //     modificadas: number;
// //     canceladas: number;
// //   };
// //   serviciosChart: ServiciosData[];
// // }

// // interface PacienteWithCount {
// //   id: string;
// //   nombres: string;
// //   apellidos: string;
// //   dni: string;
// //   fechaNacimiento?: Date;
// //   edad?: number;
// //   sexo?: 'M' | 'F' | 'OTRO';
// //   telefono? : string;
// //   email?: string;
// //   estado: 'ACTIVO' | 'INACTIVO';
// //   createdAt: Date;
// //   _count: {
// //     fichasOdontologicas: number;
// //     citas: number;
// //   };
// // }

// // interface PacientesData {
// //   pacientes: PacienteWithCount[];
// //   total: number;
// //   currentPage: number;
// //   totalPages: number;
// //   hasMore: boolean;
// // }

// // interface CitasData {
// //   fecha: string;
// //   citas: number;
// // }

// // interface IngresosData {
// //   mes: string;
// //   ingresos: number;
// // }

// // interface ServiciosData {
// //   name: string;
// //   cantidad: number;
// // }

// // interface CustomLabelProps {
// //   name?: string;
// //   percent?: number;
// //   cx?: number;
// //   cy?: number;
// //   midAngle?: number;
// //   innerRadius?: number;
// //   outerRadius?: number;
// //   value?: number;
// // }

// // interface LoadingStates {
// //   stats: boolean;
// //   citasChart: boolean;
// //   ingresos: boolean;
// //   pacientes: boolean;
// // }

// // const Dashboard = () => {
// //   // Estados principales
// //   const [stats, setStats] = useState<Stats | null>(null);
// //   const [citasData, setCitasData] = useState<CitasData[]>([]);
// //   const [pacientesData, setPacientesData] = useState<PacientesData>({ 
// //     pacientes: [], total: 0, currentPage: 1, totalPages: 1, hasMore: false 
// //   });
// //   const [ingresosMensuales, setIngresosMensuales] = useState<IngresosData[]>([]);
  
// //   const [loading, setLoading] = useState<LoadingStates>({
// //     stats: true,
// //     citasChart: true,
// //     ingresos: true,
// //     pacientes: true
// //   });
  
// //   const [errors, setErrors] = useState<{[key: string]: string | null}>({});
// //   const [busqueda, setBusqueda] = useState('');
// //   const [paginaActual, setPaginaActual] = useState(1);

// //   // Funciones utilitarias
// //   const updateLoadingState = (key: keyof LoadingStates, isLoading: boolean) => {
// //     setLoading(prev => ({ ...prev, [key]: isLoading }));
// //   };

// //   const setError = (key: string, error: string | null) => {
// //     setErrors(prev => {
// //       if (error === null) {
// //         const newErrors = { ...prev };
// //         delete newErrors[key];
// //         return newErrors;
// //       }
// //       return { ...prev, [key]: error };
// //     });
// //   };

// //   const fetchWithRetry = async <T,>(
// //     url: string,
// //     key: keyof LoadingStates,
// //     setter: (data: T) => void,
// //     fallbackData?: T,
// //     maxRetries: number = 2
// //   ) => {
// //     updateLoadingState(key, true);
// //     setError(key, null);

// //     for (let attempt = 0; attempt < maxRetries; attempt++) {
// //       try {
// //         const controller = new AbortController();
// //         const timeoutId = setTimeout(() => controller.abort(), 10000);

// //         const response = await fetch(url, { 
// //           signal: controller.signal,
// //           headers: {
// //             'Cache-Control': 'no-cache',
// //           }
// //         });
        
// //         clearTimeout(timeoutId);

// //         if (!response.ok) {
// //           throw new Error(`Error ${response.status}: ${response.statusText}`);
// //         }

// //         const data = await response.json();
// //         setter(data);
// //         updateLoadingState(key, false);
// //         return;

// //       } catch (error: any) {
// //         console.warn(`Intento ${attempt + 1}/${maxRetries} falló para ${url}:`, error.message);
        
// //         if (attempt === maxRetries - 1) {
// //           if (fallbackData) {
// //             setter(fallbackData);
// //           }
// //           setError(key, `Error al cargar ${key}: ${error.message}`);
// //           updateLoadingState(key, false);
// //         } else {
// //           await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)));
// //         }
// //       }
// //     }
// //   };

// //   const reloadData = useCallback((type?: keyof LoadingStates) => {
// //     if (!type || type === 'stats') {
// //       fetchWithRetry('/api/dashboard/stats', 'stats', setStats, {
// //         totalPacientes: 0,
// //         pacientesActivos: 0,
// //         citasHoy: 0,
// //         citasSemana: 0,
// //         citasConfirmadas: 0,
// //         fichasActivas: 0,
// //         fichasMes: 0,
// //         serviciosPendientes: 0,
// //         facturasPendientes: 0,
// //         montoFacturasPendientes: 0,
// //         ingresosMes: 0,
// //         crecimientoIngresos: 0,
// //         citasPorEstado: { confirmadas: 0, pendientes: 0, modificadas: 0, canceladas: 0 },
// //         serviciosChart: []
// //       });
// //     }

// //     if (!type || type === 'citasChart') {
// //       fetchWithRetry('/api/dashboard/citas-chart', 'citasChart', setCitasData, []);
// //     }

// //     if (!type || type === 'ingresos') {
// //       fetchWithRetry('/api/dashboard/ingresos-mensuales', 'ingresos', setIngresosMensuales, []);
// //     }
// //   }, []);

// //   const loadPacientes = useCallback(() => {
// //     const params = new URLSearchParams({
// //       page: paginaActual.toString(),
// //       search: busqueda,
// //       limit: '10'
// //     });
    
// //     fetchWithRetry(
// //       `/api/dashboard/pacientes?${params}`, 
// //       'pacientes', 
// //       setPacientesData,
// //       { pacientes: [], total: 0, currentPage: 1, totalPages: 1, hasMore: false }
// //     );
// //   }, [paginaActual, busqueda]);

// //   useEffect(() => {
// //     reloadData();
// //   }, [reloadData]);

// //   useEffect(() => {
// //     const debounceTimer = setTimeout(loadPacientes, busqueda ? 500 : 0);
// //     return () => clearTimeout(debounceTimer);
// //   }, [loadPacientes]);

// //   const formatearFecha = (fecha: string | Date) => {
// //     return new Date(fecha).toLocaleDateString('es-PE', {
// //       day: '2-digit',
// //       month: '2-digit',
// //       year: 'numeric'
// //     });
// //   };

// //   const formatearMoneda = (cantidad: number) => {
// //     return new Intl.NumberFormat('es-PE', {
// //       style: 'currency',
// //       currency: 'PEN'
// //     }).format(cantidad);
// //   };

// //   const renderCustomizedLabel = (props: CustomLabelProps) => {
// //     const { name, percent } = props;
// //     return `${name}: ${((percent || 0) * 100).toFixed(0)}%`;
// //   };
  
// //   const coloresPie = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

// //   const LoadingSpinner = ({ size = "h-8 w-8" }: { size?: string }) => (
// //     <div className="flex items-center justify-center">
// //       <div className={`animate-spin rounded-full ${size} border-b-2 border-slate-800`}></div>
// //     </div>
// //   );

// //   const ErrorDisplay = ({ error, onRetry, type }: { error: string; onRetry: () => void; type: string }) => (
// //     <div className="flex flex-col items-center justify-center py-8 text-center">
// //       <AlertCircle className="h-12 w-12 text-red-300 mb-4" />
// //       <p className="text-red-600 mb-4 text-sm">{error}</p>
// //       <button
// //         onClick={onRetry}
// //         className="px-4 py-2 bg-slate-800 text-white rounded-xl hover:bg-slate-700 transition-colors flex items-center gap-2 text-sm"
// //       >
// //         <RefreshCw className="h-4 w-4" />
// //         Reintentar
// //       </button>
// //     </div>
// //   );

// //   const isInitialLoading = Object.values(loading).every(val => val === true);

// //   if (isInitialLoading) {
// //     return (
// //       <div className="flex items-center justify-center min-h-screen bg-slate-50">
// //         <div className="text-center">
// //           <LoadingSpinner size="h-12 w-12" />
// //           <span className="ml-4 text-lg text-slate-700">Cargando dashboard...</span>
// //         </div>
// //       </div>
// //     );
// //   }

// //   return (
// //     <div className="space-y-6 p-4 sm:p-6 max-w-full overflow-hidden">
// //       {/* Header responsivo */}
// //       <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-200">
// //         <div className="flex items-center space-x-3">
// //           <div className="p-2 bg-gradient-to-br from-slate-500/20 to-slate-600/20 rounded-lg">
// //             <Activity className="h-6 w-6 text-slate-600" />
// //           </div>
// //           <div>
// //             <h1 className="text-2xl font-bold text-slate-900">Dashboard Clínica Dental</h1>
// //             <p className="text-sm text-slate-600">Resumen completo de la gestión clínica</p>
// //           </div>
// //         </div>
// //         <button
// //           onClick={() => reloadData()}
// //           className="inline-flex items-center space-x-2 bg-gradient-to-r from-slate-800 to-slate-700 text-white px-4 py-2.5 rounded-xl hover:from-slate-700 hover:to-slate-600 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-[1.02] font-medium"
// //           title="Actualizar datos"
// //         >
// //           <RefreshCw className="h-4 w-4" />
// //           <span className="hidden sm:inline">Actualizar</span>
// //         </button>
// //       </div>

// //       {/* Grid principal de estadísticas - Completamente responsivo */}
// //       <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-6">
// //         {[
// //           {
// //             title: "Total Pacientes",
// //             value: stats?.totalPacientes ?? 0,
// //             subtitle: `${stats?.pacientesActivos ?? 0} activos`,
// //             icon: Users,
// //             color: "slate"
// //           },
// //           {
// //             title: "Citas Hoy", 
// //             value: stats?.citasHoy ?? 0,
// //             subtitle: `${stats?.citasSemana ?? 0} esta semana`,
// //             icon: Calendar,
// //             color: "emerald"
// //           },
// //           {
// //             title: "Fichas Activas",
// //             value: stats?.fichasActivas ?? 0,
// //             subtitle: `${stats?.fichasMes ?? 0} este mes`,
// //             icon: FileText,
// //             color: "purple"
// //           },
// //           {
// //             title: "Ingresos Mes",
// //             value: formatearMoneda(stats?.ingresosMes ?? 0),
// //             subtitle: `+${stats?.crecimientoIngresos ?? 0}% vs anterior`,
// //             icon: DollarSign,
// //             color: "yellow"
// //           }
// //         ].map((stat, index) => (
// //           <div key={index} className="bg-white rounded-2xl shadow-sm border border-slate-200/60 p-4 sm:p-6 hover:shadow-md transition-all duration-200">
// //             <div className="flex items-center justify-between">
// //               <div className="flex-1 min-w-0">
// //                 <div className="flex items-center space-x-2 mb-2">
// //                   <stat.icon className={`h-4 w-4 text-${stat.color}-600 flex-shrink-0`} />
// //                   <p className="text-xs font-bold text-slate-600 uppercase tracking-wider truncate">
// //                     {stat.title}
// //                   </p>
// //                 </div>
// //                 {loading.stats ? (
// //                   <LoadingSpinner size="h-6 w-6" />
// //                 ) : errors.stats ? (
// //                   <p className="text-red-500 text-sm">Error</p>
// //                 ) : (
// //                   <>
// //                     <p className="text-xl sm:text-2xl font-bold text-slate-900 mb-1 truncate">
// //                       {typeof stat.value === 'string' ? stat.value : stat.value.toLocaleString()}
// //                     </p>
// //                     <p className="text-xs text-slate-500 truncate">
// //                       {stat.subtitle}
// //                     </p>
// //                   </>
// //                 )}
// //               </div>
// //             </div>
// //           </div>
// //         ))}
// //       </div>

// //       {/* Segunda fila de estadísticas - Responsiva */}
// //       <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
// //         <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 p-4 sm:p-6">
// //           <div className="flex items-center space-x-3 mb-4">
// //             <div className="p-2 bg-gradient-to-br from-orange-500/20 to-orange-600/20 rounded-lg">
// //               <AlertCircle className="h-5 w-5 text-orange-600" />
// //             </div>
// //             <div>
// //               <h3 className="text-base font-bold text-slate-900">Servicios Pendientes</h3>
// //               <p className="text-xs text-slate-500">Requieren atención</p>
// //             </div>
// //           </div>
// //           {loading.stats ? (
// //             <LoadingSpinner size="h-6 w-6" />
// //           ) : (
// //             <p className="text-2xl font-bold text-orange-600">
// //               {stats?.serviciosPendientes ?? 0}
// //             </p>
// //           )}
// //         </div>

// //         <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 p-4 sm:p-6">
// //           <div className="flex items-center space-x-3 mb-4">
// //             <div className="p-2 bg-gradient-to-br from-red-500/20 to-red-600/20 rounded-lg">
// //               <Clock className="h-5 w-5 text-red-600" />
// //             </div>
// //             <div>
// //               <h3 className="text-base font-bold text-slate-900">Facturas Pendientes</h3>
// //               <p className="text-xs text-slate-500">
// //                 {formatearMoneda(stats?.montoFacturasPendientes ?? 0)}
// //               </p>
// //             </div>
// //           </div>
// //           {loading.stats ? (
// //             <LoadingSpinner size="h-6 w-6" />
// //           ) : (
// //             <p className="text-2xl font-bold text-red-600">
// //               {stats?.facturasPendientes ?? 0}
// //             </p>
// //           )}
// //         </div>

// //         <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 p-4 sm:p-6 sm:col-span-2 lg:col-span-1">
// //           <div className="flex items-center space-x-3 mb-4">
// //             <div className="p-2 bg-gradient-to-br from-emerald-500/20 to-emerald-600/20 rounded-lg">
// //               <UserCheck className="h-5 w-5 text-emerald-600" />
// //             </div>
// //             <div>
// //               <h3 className="text-base font-bold text-slate-900">Citas Confirmadas</h3>
// //               <p className="text-xs text-slate-500">Próximas 7 días</p>
// //             </div>
// //           </div>
// //           {loading.stats ? (
// //             <LoadingSpinner size="h-6 w-6" />
// //           ) : (
// //             <p className="text-2xl font-bold text-emerald-600">
// //               {stats?.citasConfirmadas ?? 0}
// //             </p>
// //           )}
// //         </div>
// //       </div>

// //       {/* Sección de gráficos - Completamente responsiva */}
// //       <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6">
// //         {/* Gráfico de Citas */}
// //         <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 overflow-hidden">
// //           <div className="px-4 sm:px-6 py-4 border-b border-slate-100 bg-gradient-to-r from-slate-50/50 to-slate-50/30">
// //             <div className="flex items-center justify-between">
// //               <div>
// //                 <h3 className="text-base sm:text-lg font-bold text-slate-900">Citas por Día</h3>
// //                 <p className="text-xs sm:text-sm text-slate-600">Últimos 7 días</p>
// //               </div>
// //               {loading.citasChart && <LoadingSpinner size="h-5 w-5" />}
// //             </div>
// //           </div>
// //           <div className="p-4 sm:p-6">
// //             {errors.citasChart ? (
// //               <ErrorDisplay 
// //                 error={errors.citasChart} 
// //                 onRetry={() => reloadData('citasChart')} 
// //                 type="citasChart"
// //               />
// //             ) : loading.citasChart ? (
// //               <div className="h-[200px] sm:h-[250px] flex items-center justify-center">
// //                 <LoadingSpinner />
// //               </div>
// //             ) : (
// //               <ResponsiveContainer width="100%" height={200}>
// //                 <LineChart data={citasData}>
// //                   <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
// //                   <XAxis dataKey="fecha" stroke="#64748b" fontSize={11} />
// //                   <YAxis stroke="#64748b" fontSize={11} />
// //                   <Tooltip 
// //                     contentStyle={{ 
// //                       backgroundColor: 'white', 
// //                       border: '1px solid #e2e8f0',
// //                       borderRadius: '12px',
// //                       fontSize: '12px'
// //                     }} 
// //                   />
// //                   <Line 
// //                     type="monotone" 
// //                     dataKey="citas" 
// //                     stroke="#0f172a" 
// //                     strokeWidth={2}
// //                     dot={{ fill: '#0f172a', strokeWidth: 2, r: 3 }}
// //                   />
// //                 </LineChart>
// //               </ResponsiveContainer>
// //             )}
// //           </div>
// //         </div>

// //         {/* Estado de Citas */}
// //         <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 overflow-hidden">
// //           <div className="px-4 sm:px-6 py-4 border-b border-slate-100 bg-gradient-to-r from-slate-50/50 to-slate-50/30">
// //             <h3 className="text-base sm:text-lg font-bold text-slate-900">Estado de Citas</h3>
// //             <p className="text-xs sm:text-sm text-slate-600">Distribución actual</p>
// //           </div>
// //           <div className="p-4 sm:p-6">
// //             {loading.stats ? (
// //               <div className="space-y-3">
// //                 {[1,2,3,4].map(i => (
// //                   <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 animate-pulse">
// //                     <div className="h-4 bg-slate-300 rounded w-20"></div>
// //                     <div className="h-4 bg-slate-300 rounded w-8"></div>
// //                   </div>
// //                 ))}
// //               </div>
// //             ) : (
// //               <div className="space-y-3">
// //                 {[
// //                   { estado: 'Confirmadas', valor: stats?.citasPorEstado?.confirmadas ?? 0, color: 'emerald', icono: CheckCircle },
// //                   { estado: 'Pendientes', valor: stats?.citasPorEstado?.pendientes ?? 0, color: 'yellow', icono: Clock },
// //                   { estado: 'Modificadas', valor: stats?.citasPorEstado?.modificadas ?? 0, color: 'blue', icono: Activity },
// //                   { estado: 'Canceladas', valor: stats?.citasPorEstado?.canceladas ?? 0, color: 'red', icono: XCircle }
// //                 ].map(({ estado, valor, color, icono: IconoEstado }) => (
// //                   <div key={estado} className={`flex items-center justify-between p-3 rounded-xl bg-${color}-50/50 border border-${color}-100`}>
// //                     <div className="flex items-center min-w-0 flex-1">
// //                       <IconoEstado className={`h-4 w-4 text-${color}-600 mr-3 flex-shrink-0`} />
// //                       <span className="font-medium text-slate-900 text-sm truncate">{estado}</span>
// //                     </div>
// //                     <span className="text-base font-bold text-slate-900 ml-2">{valor}</span>
// //                   </div>
// //                 ))}
// //               </div>
// //             )}
// //           </div>
// //         </div>

// //         {/* Ingresos Mensuales */}
// //         <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 overflow-hidden">
// //           <div className="px-4 sm:px-6 py-4 border-b border-slate-100 bg-gradient-to-r from-slate-50/50 to-slate-50/30">
// //             <div className="flex items-center justify-between">
// //               <div>
// //                 <h3 className="text-base sm:text-lg font-bold text-slate-900">Ingresos Mensuales</h3>
// //               </div>
// //               {loading.ingresos && <LoadingSpinner size="h-5 w-5" />}
// //             </div>
// //           </div>
// //           <div className="p-4 sm:p-6">
// //             {errors.ingresos ? (
// //               <ErrorDisplay 
// //                 error={errors.ingresos} 
// //                 onRetry={() => reloadData('ingresos')} 
// //                 type="ingresos"
// //               />
// //             ) : loading.ingresos ? (
// //               <div className="h-[200px] sm:h-[250px] flex items-center justify-center">
// //                 <LoadingSpinner />
// //               </div>
// //             ) : (
// //               <ResponsiveContainer width="100%" height={200}>
// //                 <BarChart data={ingresosMensuales}>
// //                   <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
// //                   <XAxis dataKey="mes" stroke="#64748b" fontSize={11} />
// //                   <YAxis stroke="#64748b" fontSize={11} />
// //                   <Tooltip 
// //                     contentStyle={{ 
// //                       backgroundColor: 'white', 
// //                       border: '1px solid #e2e8f0',
// //                       borderRadius: '12px',
// //                       fontSize: '12px'
// //                     }}
// //                     formatter={(value: number) => [formatearMoneda(value), 'Ingresos']}
// //                   />
// //                   <Bar dataKey="ingresos" fill="#0f172a" radius={[4, 4, 0, 0]} />
// //                 </BarChart>
// //               </ResponsiveContainer>
// //             )}
// //           </div>
// //         </div>

// //         {/* Servicios */}
// //         <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 overflow-hidden">
// //           <div className="px-4 sm:px-6 py-4 border-b border-slate-100 bg-gradient-to-r from-slate-50/50 to-slate-50/30">
// //             <div className="flex items-center justify-between">
// //               <div>
// //                 <h3 className="text-base sm:text-lg font-bold text-slate-900">Estados de Servicios</h3>
// //                 <p className="text-xs sm:text-sm text-slate-600">Distribución actual</p>
// //               </div>
// //               {loading.stats && <LoadingSpinner size="h-5 w-5" />}
// //             </div>
// //           </div>
// //           <div className="p-4 sm:p-6">
// //             {errors.stats ? (
// //               <ErrorDisplay 
// //                 error={errors.stats} 
// //                 onRetry={() => reloadData('stats')}
// //                 type="servicios"
// //               />
// //             ) : loading.stats ? (
// //               <div className="h-[200px] sm:h-[250px] flex items-center justify-center">
// //                 <LoadingSpinner />
// //               </div>
// //             ) : !stats?.serviciosChart || stats.serviciosChart.length === 0 ? (
// //               <div className="h-[200px] flex items-center justify-center text-slate-500">
// //                 <div className="text-center">
// //                   <Activity className="h-8 w-8 text-slate-300 mx-auto mb-4" />
// //                   <p className="text-sm">No hay datos disponibles</p>
// //                 </div>
// //               </div>
// //             ) : (
// //               <>
// //                 <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-4">
// //                   {stats.serviciosChart.map((item, index) => (
// //                     <div key={item.name} className="text-center p-2 rounded-xl border border-slate-100">
// //                       <div 
// //                         className="w-3 h-3 rounded-full mx-auto mb-1" 
// //                         style={{ backgroundColor: coloresPie[index % coloresPie.length] }}
// //                       ></div>
// //                       <p className="text-xs font-medium text-slate-600 truncate">{item.name}</p>
// //                       <p className="text-sm font-bold text-slate-900">{item.cantidad}</p>
// //                     </div>
// //                   ))}
// //                 </div>
// //                 <ResponsiveContainer width="100%" height={150}>
// //                   <PieChart>
// //                     <Pie
// //                       data={stats.serviciosChart}
// //                       cx="50%"
// //                       cy="50%"
// //                       outerRadius={60}
// //                       dataKey="cantidad"
// //                       label={renderCustomizedLabel}
// //                       labelLine={false}
// //                     >
// //                       {stats.serviciosChart.map((entry, index) => (
// //                         <Cell key={`cell-${index}`} fill={coloresPie[index % coloresPie.length]} />
// //                       ))}
// //                     </Pie>
// //                     <Tooltip />
// //                   </PieChart>
// //                 </ResponsiveContainer>
// //               </>
// //             )}
// //           </div>
// //         </div>
// //       </div>

// //       {/* Lista de Pacientes - Completamente responsiva */}
// //       <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 overflow-hidden">
// //         <div className="px-4 sm:px-6 py-4 border-b border-slate-100 bg-gradient-to-r from-slate-50/50 to-slate-50/30">
// //           <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
// //             <div>
// //               <h3 className="text-base sm:text-lg font-bold text-slate-900">Lista de Pacientes</h3>
// //               <p className="text-xs sm:text-sm text-slate-600">Total: {pacientesData.total} pacientes</p>
// //             </div>
// //             <div className="relative">
// //               <Search className="h-4 w-4 text-slate-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
// //               <input
// //                 type="text"
// //                 placeholder="Buscar paciente..."
// //                 value={busqueda}
// //                 onChange={(e) => {
// //                   setBusqueda(e.target.value);
// //                   setPaginaActual(1);
// //                 }}
// //                 className="pl-9 pr-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-slate-500 focus:border-slate-500 outline-none w-full sm:w-80 text-sm transition-colors duration-200"
// //               />
// //             </div>
// //           </div>
// //         </div>
        
// //         <div className="p-4 sm:p-6">
// //           {errors.pacientes ? (
// //             <ErrorDisplay 
// //               error={errors.pacientes} 
// //               onRetry={loadPacientes} 
// //               type="pacientes"
// //             />
// //           ) : loading.pacientes ? (
// //             <div className="flex items-center justify-center py-12">
// //               <LoadingSpinner />
// //               <span className="ml-2 text-slate-600">Cargando pacientes...</span>
// //             </div>
// //           ) : pacientesData.pacientes.length === 0 ? (
// //             <div className="text-center py-12">
// //               <div className="p-4 bg-slate-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
// //                 <Users className="h-8 w-8 text-slate-400" />
// //               </div>
// //               <p className="text-slate-600 font-medium">No se encontraron pacientes</p>
// //               <p className="text-slate-500 text-sm mt-1">
// //                 {busqueda 
// //                   ? 'Intenta con diferentes términos de búsqueda' 
// //                   : 'No hay pacientes registrados aún'
// //                 }
// //               </p>
// //             </div>
// //           ) : (
// //             <>
// //               {/* Vista de escritorio */}
// //               <div className="hidden lg:block overflow-x-auto">
// //                 <table className="min-w-full">
// //                   <thead>
// //                     <tr className="border-b border-slate-200">
// //                       <th className="px-4 py-3 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">
// //                         Paciente
// //                       </th>
// //                       <th className="px-4 py-3 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">
// //                         DNI
// //                       </th>
// //                       <th className="px-4 py-3 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">
// //                         Contacto
// //                       </th>
// //                       <th className="px-4 py-3 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">
// //                         Edad
// //                       </th>
// //                       <th className="px-4 py-3 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">
// //                         Fichas
// //                       </th>
// //                       <th className="px-4 py-3 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">
// //                         Citas
// //                       </th>
// //                       <th className="px-4 py-3 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">
// //                         Estado
// //                       </th>
// //                       <th className="px-4 py-3 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">
// //                         Registro
// //                       </th>
// //                     </tr>
// //                   </thead>
// //                   <tbody className="divide-y divide-slate-100">
// //                     {pacientesData.pacientes.map((paciente) => (
// //                       <tr key={paciente.id} className="hover:bg-slate-50/50 transition-colors duration-200">
// //                         <td className="px-4 py-4">
// //                           <div className="flex items-center min-w-0">
// //                             <div className="bg-slate-100 rounded-full p-2 mr-3 flex-shrink-0">
// //                               <User className="h-4 w-4 text-slate-600" />
// //                             </div>
// //                             <div className="min-w-0 flex-1">
// //                               <p className="font-semibold text-slate-900 text-sm truncate">
// //                                 {paciente.nombres} {paciente.apellidos}
// //                               </p>
// //                               <p className="text-xs text-slate-500 capitalize truncate">
// //                                 {paciente.sexo === 'M' ? 'Masculino' : paciente.sexo === 'F' ? 'Femenino' : 'Otro'}
// //                               </p>
// //                             </div>
// //                           </div>
// //                         </td>
// //                         <td className="px-4 py-4">
// //                           <span className="font-mono text-sm bg-slate-100 px-2 py-1 rounded whitespace-nowrap">
// //                             {paciente.dni}
// //                           </span>
// //                         </td>
// //                         <td className="px-4 py-4">
// //                           <div className="space-y-1 min-w-0">
// //                             {paciente.telefono && (
// //                               <div className="flex items-center text-xs text-slate-600">
// //                                 <Phone className="h-3 w-3 mr-1 flex-shrink-0" />
// //                                 <span className="truncate">{paciente.telefono}</span>
// //                               </div>
// //                             )}
// //                             {paciente.email && (
// //                               <div className="flex items-center text-xs text-slate-600">
// //                                 <Mail className="h-3 w-3 mr-1 flex-shrink-0" />
// //                                 <span className="truncate">{paciente.email}</span>
// //                               </div>
// //                             )}
// //                           </div>
// //                         </td>
// //                         <td className="px-4 py-4">
// //                           <span className="text-sm font-medium text-slate-900 whitespace-nowrap">
// //                             {paciente.edad ?? 'N/A'} años
// //                           </span>
// //                         </td>
// //                         <td className="px-4 py-4">
// //                           <span className="bg-slate-100 text-slate-800 px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap">
// //                             {paciente._count.fichasOdontologicas ?? 0}
// //                           </span>
// //                         </td>
// //                         <td className="px-4 py-4">
// //                           <span className="bg-emerald-100 text-emerald-800 px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap">
// //                             {paciente._count.citas ?? 0}
// //                           </span>
// //                         </td>
// //                         <td className="px-4 py-4">
// //                           <span className={`px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap ${
// //                             paciente.estado === 'ACTIVO' 
// //                               ? 'bg-emerald-100 text-emerald-800' 
// //                               : 'bg-red-100 text-red-800'
// //                           }`}>
// //                             {paciente.estado}
// //                           </span>
// //                         </td>
// //                         <td className="px-4 py-4">
// //                           <span className="text-xs text-slate-600 whitespace-nowrap">
// //                             {formatearFecha(paciente.createdAt)}
// //                           </span>
// //                         </td>
// //                       </tr>
// //                     ))}
// //                   </tbody>
// //                 </table>
// //               </div>

// //               {/* Vista móvil y tablet */}
// //               <div className="lg:hidden space-y-4">
// //                 {pacientesData.pacientes.map((paciente) => (
// //                   <div key={paciente.id} className="bg-slate-50/50 rounded-xl p-4 border border-slate-100 hover:shadow-md transition-all duration-200">
// //                     <div className="space-y-3">
// //                       {/* Paciente */}
// //                       <div className="flex items-center space-x-3">
// //                         <div className="bg-slate-100 rounded-full p-2 flex-shrink-0">
// //                           <User className="h-4 w-4 text-slate-600" />
// //                         </div>
// //                         <div className="min-w-0 flex-1">
// //                           <p className="font-semibold text-slate-900 text-sm truncate">
// //                             {paciente.nombres} {paciente.apellidos}
// //                           </p>
// //                           <p className="text-xs text-slate-500 capitalize">
// //                             {paciente.sexo === 'M' ? 'Masculino' : paciente.sexo === 'F' ? 'Femenino' : 'Otro'} • DNI: {paciente.dni}
// //                           </p>
// //                         </div>
// //                       </div>
                      
// //                       {/* Contacto */}
// //                       {(paciente.telefono || paciente.email) && (
// //                         <div className="pl-11 space-y-1">
// //                           {paciente.telefono && (
// //                             <div className="flex items-center text-xs text-slate-600">
// //                               <Phone className="h-3 w-3 mr-2" />
// //                               <span>{paciente.telefono}</span>
// //                             </div>
// //                           )}
// //                           {paciente.email && (
// //                             <div className="flex items-center text-xs text-slate-600">
// //                               <Mail className="h-3 w-3 mr-2" />
// //                               <span className="truncate">{paciente.email}</span>
// //                             </div>
// //                           )}
// //                         </div>
// //                       )}
                      
// //                       {/* Stats en fila */}
// //                       <div className="flex items-center justify-between pl-11 pt-2 border-t border-slate-200">
// //                         <div className="flex items-center space-x-4 text-xs">
// //                           <span className="text-slate-600">
// //                             <strong>{paciente.edad ?? 'N/A'}</strong> años
// //                           </span>
// //                           <span className="bg-slate-100 text-slate-800 px-2 py-1 rounded-full font-medium">
// //                             {paciente._count.fichasOdontologicas ?? 0} fichas
// //                           </span>
// //                           <span className="bg-emerald-100 text-emerald-800 px-2 py-1 rounded-full font-medium">
// //                             {paciente._count.citas ?? 0} citas
// //                           </span>
// //                         </div>
// //                         <div className="flex items-center space-x-2">
// //                           <span className={`px-2 py-1 rounded-full text-xs font-medium ${
// //                             paciente.estado === 'ACTIVO' 
// //                               ? 'bg-emerald-100 text-emerald-800' 
// //                               : 'bg-red-100 text-red-800'
// //                           }`}>
// //                             {paciente.estado}
// //                           </span>
// //                         </div>
// //                       </div>
                      
// //                       {/* Fecha registro */}
// //                       <div className="pl-11 text-xs text-slate-500">
// //                         Registrado: {formatearFecha(paciente.createdAt)}
// //                       </div>
// //                     </div>
// //                   </div>
// //                 ))}
// //               </div>
// //             </>
// //           )}

// //           {/* Paginación - Responsiva */}
// //           {pacientesData.totalPages > 1 && (
// //             <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mt-6 pt-6 border-t border-slate-200 gap-4">
// //               <div className="text-sm text-slate-600 text-center sm:text-left">
// //                 Página {pacientesData.currentPage} de {pacientesData.totalPages}
// //               </div>
// //               <div className="flex items-center justify-center space-x-2">
// //                 <button
// //                   onClick={() => setPaginaActual(Math.max(1, paginaActual - 1))}
// //                   disabled={paginaActual === 1 || loading.pacientes}
// //                   className="px-3 py-2 rounded-xl bg-slate-100 text-slate-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-200 transition-colors flex items-center text-sm font-medium"
// //                 >
// //                   <ChevronLeft className="h-4 w-4 mr-1" />
// //                   <span className="hidden sm:inline">Anterior</span>
// //                   <span className="sm:hidden">Ant</span>
// //                 </button>
                
// //                 {/* Números de página */}
// //                 <div className="flex space-x-1">
// //                   {Array.from({ 
// //                     length: Math.min(window.innerWidth < 640 ? 3 : 5, pacientesData.totalPages) 
// //                   }, (_, i) => {
// //                     const pageNum = Math.max(1, Math.min(
// //                       pacientesData.totalPages - (window.innerWidth < 640 ? 2 : 4),
// //                       Math.max(1, paginaActual - (window.innerWidth < 640 ? 1 : 2))
// //                     )) + i;
                    
// //                     return (
// //                       <button
// //                         key={pageNum}
// //                         onClick={() => setPaginaActual(pageNum)}
// //                         disabled={loading.pacientes}
// //                         className={`px-3 py-2 rounded-xl transition-colors disabled:opacity-50 text-sm font-medium ${
// //                           pageNum === paginaActual
// //                             ? 'bg-slate-800 text-white'
// //                             : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
// //                         }`}
// //                       >
// //                         {pageNum}
// //                       </button>
// //                     );
// //                   })}
// //                 </div>
                
// //                 <button
// //                   onClick={() => setPaginaActual(Math.min(pacientesData.totalPages, paginaActual + 1))}
// //                   disabled={paginaActual === pacientesData.totalPages || loading.pacientes}
// //                   className="px-3 py-2 rounded-xl bg-slate-100 text-slate-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-200 transition-colors flex items-center text-sm font-medium"
// //                 >
// //                   <span className="hidden sm:inline">Siguiente</span>
// //                   <span className="sm:hidden">Sig</span>
// //                   <ChevronRight className="h-4 w-4 ml-1" />
// //                 </button>
// //               </div>
// //             </div>
// //           )}
// //         </div>
// //       </div>
// //     </div>
// //   );
// // };

// // export default Dashboard;

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

interface LoadingStates {
  stats: boolean;
  citasChart: boolean;
  ingresos: boolean;
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
  
  const [loading, setLoading] = useState<LoadingStates>({
    stats: true,
    citasChart: true,
    ingresos: true,
    pacientes: true
  });
  
  const [errors, setErrors] = useState<{[key: string]: string | null}>({});
  const [busqueda, setBusqueda] = useState('');
  const [paginaActual, setPaginaActual] = useState(1);

  // Funciones utilitarias
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
        const timeoutId = setTimeout(() => controller.abort(), 10000);

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
          if (fallbackData) {
            setter(fallbackData);
          }
          setError(key, `Error al cargar ${key}: ${error.message}`);
          updateLoadingState(key, false);
        } else {
          await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)));
        }
      }
    }
  };

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
        serviciosChart: []
      });
    }

    if (!type || type === 'citasChart') {
      fetchWithRetry('/api/dashboard/citas-chart', 'citasChart', setCitasData, []);
    }

    if (!type || type === 'ingresos') {
      fetchWithRetry('/api/dashboard/ingresos-mensuales', 'ingresos', setIngresosMensuales, []);
    }
  }, []);

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

  useEffect(() => {
    reloadData();
  }, [reloadData]);

  useEffect(() => {
    const debounceTimer = setTimeout(loadPacientes, busqueda ? 500 : 0);
    return () => clearTimeout(debounceTimer);
  }, [loadPacientes]);

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

  const LoadingSpinner = ({ size = "h-8 w-8" }: { size?: string }) => (
    <div className="flex items-center justify-center">
      <div className={`animate-spin rounded-full ${size} border-b-2 border-slate-800`}></div>
    </div>
  );

  const ErrorDisplay = ({ error, onRetry, type }: { error: string; onRetry: () => void; type: string }) => (
    <div className="flex flex-col items-center justify-center py-8 text-center">
      <AlertCircle className="h-12 w-12 text-red-300 mb-4" />
      <p className="text-red-600 mb-4 text-sm">{error}</p>
      <button
        onClick={onRetry}
        className="px-4 py-2 bg-slate-800 text-white rounded-xl hover:bg-slate-700 transition-colors flex items-center gap-2 text-sm"
      >
        <RefreshCw className="h-4 w-4" />
        Reintentar
      </button>
    </div>
  );

  const isInitialLoading = Object.values(loading).every(val => val === true);

  if (isInitialLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <LoadingSpinner size="h-12 w-12" />
          <span className="ml-4 text-lg text-slate-700">Cargando dashboard...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full overflow-auto">
      {/* Contenedor principal que respeta el layout existente */}
      <div className="w-full max-w-6xl mx-auto p-2 sm:p-3 lg:p-4 space-y-3 lg:space-y-4">
        {/* Header compacto */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-slate-200">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-br from-slate-500/20 to-slate-600/20 rounded-lg">
              <Activity className="h-5 w-5 text-slate-600" />
            </div>
            <div>
              <h1 className="text-xl lg:text-2xl font-bold text-slate-900">Dashboard Clínica Dental</h1>
              <p className="text-xs sm:text-sm text-slate-600">Resumen completo de la gestión clínica</p>
            </div>
          </div>
          <button
            onClick={() => reloadData()}
            className="inline-flex items-center space-x-2 bg-gradient-to-r from-slate-800 to-slate-700 text-white px-3 py-2 lg:px-4 lg:py-2.5 rounded-xl hover:from-slate-700 hover:to-slate-600 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-[1.02] font-medium text-sm"
            title="Actualizar datos"
          >
            <RefreshCw className="h-4 w-4" />
            <span className="hidden sm:inline">Actualizar</span>
          </button>
        </div>

        {/* Grid principal de estadísticas */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
          {[
            {
              title: "Total Pacientes",
              value: stats?.totalPacientes ?? 0,
              subtitle: `${stats?.pacientesActivos ?? 0} activos`,
              icon: Users,
              color: "slate"
            },
            {
              title: "Citas Hoy", 
              value: stats?.citasHoy ?? 0,
              subtitle: `${stats?.citasSemana ?? 0} esta semana`,
              icon: Calendar,
              color: "emerald"
            },
            {
              title: "Fichas Activas",
              value: stats?.fichasActivas ?? 0,
              subtitle: `${stats?.fichasMes ?? 0} este mes`,
              icon: FileText,
              color: "purple"
            },
            {
              title: "Ingresos Mes",
              value: formatearMoneda(stats?.ingresosMes ?? 0),
              subtitle: `+${stats?.crecimientoIngresos ?? 0}% vs anterior`,
              icon: DollarSign,
              color: "yellow"
            }
          ].map((stat, index) => (
            <div key={index} className="bg-white rounded-xl lg:rounded-2xl shadow-sm border border-slate-200/60 p-3 lg:p-5 hover:shadow-md transition-all duration-200">
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-2">
                    <stat.icon className={`h-4 w-4 text-${stat.color}-600 flex-shrink-0`} />
                    <p className="text-xs font-bold text-slate-600 uppercase tracking-wider truncate">
                      {stat.title}
                    </p>
                  </div>
                  {loading.stats ? (
                    <LoadingSpinner size="h-5 w-5" />
                  ) : errors.stats ? (
                    <p className="text-red-500 text-sm">Error</p>
                  ) : (
                    <>
                      <p className="text-lg lg:text-xl font-bold text-slate-900 mb-1 truncate">
                        {typeof stat.value === 'string' ? stat.value : stat.value.toLocaleString()}
                      </p>
                      <p className="text-xs text-slate-500 truncate">
                        {stat.subtitle}
                      </p>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Segunda fila de estadísticas */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 lg:gap-4">
          <div className="bg-white rounded-xl lg:rounded-2xl shadow-sm border border-slate-200/60 p-3 lg:p-5">
            <div className="flex items-center space-x-3 mb-3">
              <div className="p-2 bg-gradient-to-br from-orange-500/20 to-orange-600/20 rounded-lg">
                <AlertCircle className="h-4 w-4 text-orange-600" />
              </div>
              <div>
                <h3 className="text-sm lg:text-base font-bold text-slate-900">Servicios Pendientes</h3>
                <p className="text-xs text-slate-500">Requieren atención</p>
              </div>
            </div>
            {loading.stats ? (
              <LoadingSpinner size="h-5 w-5" />
            ) : (
              <p className="text-xl lg:text-2xl font-bold text-orange-600">
                {stats?.serviciosPendientes ?? 0}
              </p>
            )}
          </div>

          <div className="bg-white rounded-xl lg:rounded-2xl shadow-sm border border-slate-200/60 p-3 lg:p-5">
            <div className="flex items-center space-x-3 mb-3">
              <div className="p-2 bg-gradient-to-br from-red-500/20 to-red-600/20 rounded-lg">
                <Clock className="h-4 w-4 text-red-600" />
              </div>
              <div>
                <h3 className="text-sm lg:text-base font-bold text-slate-900">Facturas Pendientes</h3>
                <p className="text-xs text-slate-500">
                  {formatearMoneda(stats?.montoFacturasPendientes ?? 0)}
                </p>
              </div>
            </div>
            {loading.stats ? (
              <LoadingSpinner size="h-5 w-5" />
            ) : (
              <p className="text-xl lg:text-2xl font-bold text-red-600">
                {stats?.facturasPendientes ?? 0}
              </p>
            )}
          </div>

          <div className="bg-white rounded-xl lg:rounded-2xl shadow-sm border border-slate-200/60 p-3 lg:p-5 sm:col-span-2 lg:col-span-1">
            <div className="flex items-center space-x-3 mb-3">
              <div className="p-2 bg-gradient-to-br from-emerald-500/20 to-emerald-600/20 rounded-lg">
                <UserCheck className="h-4 w-4 text-emerald-600" />
              </div>
              <div>
                <h3 className="text-sm lg:text-base font-bold text-slate-900">Citas Confirmadas</h3>
                <p className="text-xs text-slate-500">Próximas 7 días</p>
              </div>
            </div>
            {loading.stats ? (
              <LoadingSpinner size="h-5 w-5" />
            ) : (
              <p className="text-xl lg:text-2xl font-bold text-emerald-600">
                {stats?.citasConfirmadas ?? 0}
              </p>
            )}
          </div>
        </div>

        {/* Sección de gráficos */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-3 lg:gap-4">
          {/* Gráfico de Citas */}
          <div className="bg-white rounded-xl lg:rounded-2xl shadow-sm border border-slate-200/60 overflow-hidden">
            <div className="px-3 lg:px-5 py-3 lg:py-4 border-b border-slate-100 bg-gradient-to-r from-slate-50/50 to-slate-50/30">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm lg:text-base font-bold text-slate-900">Citas por Día</h3>
                  <p className="text-xs text-slate-600">Últimos 7 días</p>
                </div>
                {loading.citasChart && <LoadingSpinner size="h-4 w-4" />}
              </div>
            </div>
            <div className="p-3 lg:p-5">
              {errors.citasChart ? (
                <ErrorDisplay 
                  error={errors.citasChart} 
                  onRetry={() => reloadData('citasChart')} 
                  type="citasChart"
                />
              ) : loading.citasChart ? (
                <div className="h-[200px] lg:h-[250px] flex items-center justify-center">
                  <LoadingSpinner />
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={citasData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="fecha" stroke="#64748b" fontSize={10} />
                    <YAxis stroke="#64748b" fontSize={10} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'white', 
                        border: '1px solid #e2e8f0',
                        borderRadius: '8px',
                        fontSize: '11px'
                      }} 
                    />
                    <Line 
                      type="monotone" 
                      dataKey="citas" 
                      stroke="#0f172a" 
                      strokeWidth={2}
                      dot={{ fill: '#0f172a', strokeWidth: 2, r: 3 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* Estado de Citas */}
          <div className="bg-white rounded-xl lg:rounded-2xl shadow-sm border border-slate-200/60 overflow-hidden">
            <div className="px-3 lg:px-5 py-3 lg:py-4 border-b border-slate-100 bg-gradient-to-r from-slate-50/50 to-slate-50/30">
              <h3 className="text-sm lg:text-base font-bold text-slate-900">Estado de Citas</h3>
              <p className="text-xs text-slate-600">Distribución actual</p>
            </div>
            <div className="p-3 lg:p-5">
              {loading.stats ? (
                <div className="space-y-2">
                  {[1,2,3,4].map(i => (
                    <div key={i} className="flex items-center justify-between p-2 lg:p-3 rounded-lg bg-slate-50 animate-pulse">
                      <div className="h-3 bg-slate-300 rounded w-16"></div>
                      <div className="h-3 bg-slate-300 rounded w-6"></div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-2">
                  {[
                    { estado: 'Confirmadas', valor: stats?.citasPorEstado?.confirmadas ?? 0, color: 'emerald', icono: CheckCircle },
                    { estado: 'Pendientes', valor: stats?.citasPorEstado?.pendientes ?? 0, color: 'yellow', icono: Clock },
                    { estado: 'Modificadas', valor: stats?.citasPorEstado?.modificadas ?? 0, color: 'blue', icono: Activity },
                    { estado: 'Canceladas', valor: stats?.citasPorEstado?.canceladas ?? 0, color: 'red', icono: XCircle }
                  ].map(({ estado, valor, color, icono: IconoEstado }) => (
                    <div key={estado} className={`flex items-center justify-between p-2 lg:p-3 rounded-lg bg-${color}-50/50 border border-${color}-100`}>
                      <div className="flex items-center min-w-0 flex-1">
                        <IconoEstado className={`h-3 w-3 lg:h-4 lg:w-4 text-${color}-600 mr-2 lg:mr-3 flex-shrink-0`} />
                        <span className="font-medium text-slate-900 text-xs lg:text-sm truncate">{estado}</span>
                      </div>
                      <span className="text-sm lg:text-base font-bold text-slate-900 ml-2">{valor}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Ingresos Mensuales */}
          <div className="bg-white rounded-xl lg:rounded-2xl shadow-sm border border-slate-200/60 overflow-hidden">
            <div className="px-3 lg:px-5 py-3 lg:py-4 border-b border-slate-100 bg-gradient-to-r from-slate-50/50 to-slate-50/30">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm lg:text-base font-bold text-slate-900">Ingresos Mensuales</h3>
                </div>
                {loading.ingresos && <LoadingSpinner size="h-4 w-4" />}
              </div>
            </div>
            <div className="p-3 lg:p-5">
              {errors.ingresos ? (
                <ErrorDisplay 
                  error={errors.ingresos} 
                  onRetry={() => reloadData('ingresos')} 
                  type="ingresos"
                />
              ) : loading.ingresos ? (
                <div className="h-[200px] lg:h-[250px] flex items-center justify-center">
                  <LoadingSpinner />
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={ingresosMensuales}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="mes" stroke="#64748b" fontSize={10} />
                    <YAxis stroke="#64748b" fontSize={10} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'white', 
                        border: '1px solid #e2e8f0',
                        borderRadius: '8px',
                        fontSize: '11px'
                      }}
                      formatter={(value: number) => [formatearMoneda(value), 'Ingresos']}
                    />
                    <Bar dataKey="ingresos" fill="#0f172a" radius={[3, 3, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* Servicios */}
          <div className="bg-white rounded-xl lg:rounded-2xl shadow-sm border border-slate-200/60 overflow-hidden">
            <div className="px-3 lg:px-5 py-3 lg:py-4 border-b border-slate-100 bg-gradient-to-r from-slate-50/50 to-slate-50/30">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm lg:text-base font-bold text-slate-900">Estados de Servicios</h3>
                  <p className="text-xs text-slate-600">Distribución actual</p>
                </div>
                {loading.stats && <LoadingSpinner size="h-4 w-4" />}
              </div>
            </div>
            <div className="p-3 lg:p-5">
              {errors.stats ? (
                <ErrorDisplay 
                  error={errors.stats} 
                  onRetry={() => reloadData('stats')}
                  type="servicios"
                />
              ) : loading.stats ? (
                <div className="h-[200px] lg:h-[250px] flex items-center justify-center">
                  <LoadingSpinner />
                </div>
              ) : !stats?.serviciosChart || stats.serviciosChart.length === 0 ? (
                <div className="h-[200px] flex items-center justify-center text-slate-500">
                  <div className="text-center">
                    <Activity className="h-6 w-6 lg:h-8 lg:w-8 text-slate-300 mx-auto mb-3" />
                    <p className="text-xs lg:text-sm">No hay datos disponibles</p>
                  </div>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-2 lg:grid-cols-3 gap-2 mb-3">
                    {stats.serviciosChart.map((item, index) => (
                      <div key={item.name} className="text-center p-2 rounded-lg border border-slate-100">
                        <div 
                          className="w-2 h-2 lg:w-3 lg:h-3 rounded-full mx-auto mb-1" 
                          style={{ backgroundColor: coloresPie[index % coloresPie.length] }}
                        ></div>
                        <p className="text-xs font-medium text-slate-600 truncate">{item.name}</p>
                        <p className="text-xs lg:text-sm font-bold text-slate-900">{item.cantidad}</p>
                      </div>
                    ))}
                  </div>
                  <ResponsiveContainer width="100%" height={150}>
                    <PieChart>
                      <Pie
                        data={stats.serviciosChart}
                        cx="50%"
                        cy="50%"
                        outerRadius={50}
                        dataKey="cantidad"
                        label={renderCustomizedLabel}
                        labelLine={false}
                      >
                        {stats.serviciosChart.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={coloresPie[index % coloresPie.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Lista de Pacientes */}
<div className="bg-white rounded-xl lg:rounded-2xl shadow-sm border border-slate-200/60 overflow-hidden max-w-full">
          <div className="px-3 lg:px-5 py-3 lg:py-4 border-b border-slate-100 bg-gradient-to-r from-slate-50/50 to-slate-50/30">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <h3 className="text-sm lg:text-base font-bold text-slate-900">Lista de Pacientes</h3>
                <p className="text-xs text-slate-600">Total: {pacientesData.total} pacientes</p>
              </div>
              <div className="relative w-full sm:w-64">
                <Search className="h-4 w-4 text-slate-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Buscar paciente..."
                  value={busqueda}
                  onChange={(e) => {
                    setBusqueda(e.target.value);
                    setPaginaActual(1);
                  }}
                  className="pl-9 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-slate-500 outline-none w-full text-sm transition-colors duration-200"
                />
              </div>
            </div>
          </div>
          
          <div className="p-3 lg:p-5">
            {errors.pacientes ? (
              <ErrorDisplay 
                error={errors.pacientes} 
                onRetry={loadPacientes} 
                type="pacientes"
              />
            ) : loading.pacientes ? (
              <div className="flex items-center justify-center py-8">
                <LoadingSpinner />
                <span className="ml-2 text-slate-600 text-sm">Cargando pacientes...</span>
              </div>
            ) : pacientesData.pacientes.length === 0 ? (
              <div className="text-center py-8">
                <div className="p-3 bg-slate-100 rounded-full w-12 h-12 mx-auto mb-3 flex items-center justify-center">
                  <Users className="h-6 w-6 text-slate-400" />
                </div>
                <p className="text-slate-600 font-medium text-sm">No se encontraron pacientes</p>
                <p className="text-slate-500 text-xs mt-1">
                  {busqueda 
                    ? 'Intenta con diferentes términos de búsqueda' 
                    : 'No hay pacientes registrados aún'
                  }
                </p>
              </div>
            ) : (
              <>
                {/* Vista de escritorio */}
                <div className="hidden xl:block overflow-x-auto max-w-full">
                  <table className="w-full table-fixed">
                    <thead>
                      <tr className="border-b border-slate-200">
                      <th className="px-3 py-2 text-left text-xs font-bold text-slate-600 uppercase tracking-wider w-1/4">
                        Paciente
                      </th>
                      <th className="px-3 py-2 text-left text-xs font-bold text-slate-600 uppercase tracking-wider w-20">
                        DNI
                      </th>
                      <th className="px-3 py-2 text-left text-xs font-bold text-slate-600 uppercase tracking-wider w-1/4">
                        Contacto
                      </th>
                      <th className="px-3 py-2 text-left text-xs font-bold text-slate-600 uppercase tracking-wider w-16">
                        Edad
                      </th>
                      <th className="px-3 py-2 text-left text-xs font-bold text-slate-600 uppercase tracking-wider w-16">
                        Fichas
                      </th>
                        <th className="px-3 py-2 text-left text-xs font-bold text-slate-600 uppercase tracking-wider w-16">
                          Citas
                        </th>
                        <th className="px-3 py-2 text-left text-xs font-bold text-slate-600 uppercase tracking-wider w-20">
                          Estado
                        </th>
                        <th className="px-3 py-2 text-left text-xs font-bold text-slate-600 uppercase tracking-wider w-24">
                          Registro
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {pacientesData.pacientes.map((paciente) => (
                        <tr key={paciente.id} className="hover:bg-slate-50/50 transition-colors duration-200">
                          <td className="px-3 py-3">
                            <div className="flex items-center min-w-0">
                              <div className="bg-slate-100 rounded-full p-2 mr-3 flex-shrink-0">
                                <User className="h-3 w-3 text-slate-600" />
                              </div>
                              <div className="min-w-0 flex-1">
                                <p className="font-semibold text-slate-900 text-sm truncate">
                                  {paciente.nombres} {paciente.apellidos}
                                </p>
                                <p className="text-xs text-slate-500 capitalize truncate">
                                  {paciente.sexo === 'M' ? 'Masculino' : paciente.sexo === 'F' ? 'Femenino' : 'Otro'}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="px-3 py-3">
                            <span className="font-mono text-xs bg-slate-100 px-2 py-1 rounded whitespace-nowrap">
                              {paciente.dni}
                            </span>
                          </td>
                          <td className="px-3 py-3">
                            <div className="space-y-1 min-w-0">
                              {paciente.telefono && (
                                <div className="flex items-center text-xs text-slate-600">
                                  <Phone className="h-3 w-3 mr-1 flex-shrink-0" />
                                  <span className="truncate">{paciente.telefono}</span>
                                </div>
                              )}
                              {paciente.email && (
                                <div className="flex items-center text-xs text-slate-600">
                                  <Mail className="h-3 w-3 mr-1 flex-shrink-0" />
                                  <span className="truncate">{paciente.email}</span>
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="px-3 py-3">
                            <span className="text-sm font-medium text-slate-900 whitespace-nowrap">
                              {paciente.edad ?? 'N/A'} años
                            </span>
                          </td>
                          <td className="px-3 py-3">
                            <span className="bg-slate-100 text-slate-800 px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap">
                              {paciente._count.fichasOdontologicas ?? 0}
                            </span>
                          </td>
                          <td className="px-3 py-3">
                            <span className="bg-emerald-100 text-emerald-800 px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap">
                              {paciente._count.citas ?? 0}
                            </span>
                          </td>
                          <td className="px-3 py-3">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap ${
                              paciente.estado === 'ACTIVO' 
                                ? 'bg-emerald-100 text-emerald-800' 
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {paciente.estado}
                            </span>
                          </td>
                          <td className="px-3 py-3">
                            <span className="text-xs text-slate-600 whitespace-nowrap">
                              {formatearFecha(paciente.createdAt)}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Vista móvil, tablet y laptop */}
                <div className="xl:hidden space-y-3">
                  {pacientesData.pacientes.map((paciente) => (
                    <div key={paciente.id} className="bg-slate-50/50 rounded-lg p-3 border border-slate-100 hover:shadow-md transition-all duration-200">
                      <div className="space-y-2">
                        {/* Paciente */}
                        <div className="flex items-center space-x-3">
                          <div className="bg-slate-100 rounded-full p-2 flex-shrink-0">
                            <User className="h-3 w-3 text-slate-600" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="font-semibold text-slate-900 text-sm truncate">
                              {paciente.nombres} {paciente.apellidos}
                            </p>
                            <p className="text-xs text-slate-500 capitalize">
                              {paciente.sexo === 'M' ? 'Masculino' : paciente.sexo === 'F' ? 'Femenino' : 'Otro'} • DNI: {paciente.dni}
                            </p>
                          </div>
                        </div>
                        
                        {/* Contacto */}
                        {(paciente.telefono || paciente.email) && (
                          <div className="pl-9 space-y-1">
                            {paciente.telefono && (
                              <div className="flex items-center text-xs text-slate-600">
                                <Phone className="h-3 w-3 mr-2" />
                                <span>{paciente.telefono}</span>
                              </div>
                            )}
                            {paciente.email && (
                              <div className="flex items-center text-xs text-slate-600">
                                <Mail className="h-3 w-3 mr-2" />
                                <span className="truncate">{paciente.email}</span>
                              </div>
                            )}
                          </div>
                        )}
                        
                        {/* Stats en fila */}
                        <div className="flex items-center justify-between pl-9 pt-2 border-t border-slate-200">
                          <div className="flex items-center space-x-3 text-xs">
                            <span className="text-slate-600">
                              <strong>{paciente.edad ?? 'N/A'}</strong> años
                            </span>
                            <span className="bg-slate-100 text-slate-800 px-2 py-1 rounded-full font-medium">
                              {paciente._count.fichasOdontologicas ?? 0} fichas
                            </span>
                            <span className="bg-emerald-100 text-emerald-800 px-2 py-1 rounded-full font-medium">
                              {paciente._count.citas ?? 0} citas
                            </span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              paciente.estado === 'ACTIVO' 
                                ? 'bg-emerald-100 text-emerald-800' 
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {paciente.estado}
                            </span>
                          </div>
                        </div>
                        
                        {/* Fecha registro */}
                        <div className="pl-9 text-xs text-slate-500">
                          Registrado: {formatearFecha(paciente.createdAt)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}

            {/* Paginación optimizada */}
            {pacientesData.totalPages > 1 && (
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mt-4 pt-4 border-t border-slate-200 gap-3">
                <div className="text-sm text-slate-600 text-center sm:text-left">
                  Página {pacientesData.currentPage} de {pacientesData.totalPages}
                </div>
                <div className="flex items-center justify-center space-x-2">
                  <button
                    onClick={() => setPaginaActual(Math.max(1, paginaActual - 1))}
                    disabled={paginaActual === 1 || loading.pacientes}
                    className="px-3 py-2 rounded-lg bg-slate-100 text-slate-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-200 transition-colors flex items-center text-sm font-medium"
                  >
                    <ChevronLeft className="h-4 w-4 mr-1" />
                    <span className="hidden sm:inline">Anterior</span>
                    <span className="sm:hidden">Ant</span>
                  </button>
                  
                  {/* Números de página */}
                  <div className="flex space-x-1">
                    {Array.from({ 
                      length: Math.min(3, pacientesData.totalPages) 
                    }, (_, i) => {
                      const pageNum = Math.max(1, Math.min(
                        pacientesData.totalPages - 2,
                        Math.max(1, paginaActual - 1)
                      )) + i;
                      
                      return (
                        <button
                          key={pageNum}
                          onClick={() => setPaginaActual(pageNum)}
                          disabled={loading.pacientes}
                          className={`px-3 py-2 rounded-lg transition-colors disabled:opacity-50 text-sm font-medium ${
                            pageNum === paginaActual
                              ? 'bg-slate-800 text-white'
                              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                  </div>
                  
                  <button
                    onClick={() => setPaginaActual(Math.min(pacientesData.totalPages, paginaActual + 1))}
                    disabled={paginaActual === pacientesData.totalPages || loading.pacientes}
                    className="px-3 py-2 rounded-lg bg-slate-100 text-slate-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-200 transition-colors flex items-center text-sm font-medium"
                  >
                    <span className="hidden sm:inline">Siguiente</span>
                    <span className="sm:hidden">Sig</span>
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      
      
      </div>
    </div>
  );
};

export default Dashboard;