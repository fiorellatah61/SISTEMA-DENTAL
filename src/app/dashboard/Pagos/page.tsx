// 'use client'

// import React, { useState, useEffect } from 'react'
// import { toast } from 'sonner'
// import { Badge } from "@/components/ui/badge"
// import { Button } from "../../../components/ui/button"
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
// import { Input } from "@/components/ui/input"
// import { Label } from "@/components/ui/label"
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
// import { Textarea } from "../../../../components/ui/textarea"
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
// import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
// import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
// import { 
//   CreditCard, 
//   Users, 
//   FileText, 
//   Plus, 
//   Search, 
//   Filter, 
//   Download,
//   DollarSign,
//   Calendar,
//   TrendingUp,
//   Eye,
//   Edit,
//   Trash2,
//   Save,
//   Calculator
// } from 'lucide-react'

// // Tipos TypeScript basados en el esquema Prisma
// interface Paciente {
//   id: string
//   nombres: string
//   apellidos: string
//   dni: string
//   telefono?: string
//   email?: string
// }

// interface Factura {
//   id: string
//   monto: number
//   fechaEmision: Date
//   metodoPago?: string
//   referencia?: string
//   estado: 'COMPLETADO' | 'PENDIENTE' | 'CANCELADO'
//   paciente: Paciente
//   descuentoAplicado?: number
//   montoOriginal?: number
// }

// interface ExamenOdontologico {
//   id: string
//   fecha: Date
//   presupuesto?: number
//   diagnostico?: string
//   ficha: {
//     paciente: Paciente
//   }
// }

// interface EstadisticasPago {
//   totalRecaudado: number
//   totalDescuentos: number
//   pacientesBeneficiados: number
//   pagosPendientes: number
// }

// export default function ModuloPagosPage() {
//   // Estados para el manejo de datos
//   const [facturas, setFacturas] = useState<Factura[]>([]) // Lista de facturas/pagos
//   const [pacientes, setPacientes] = useState<Paciente[]>([]) // Lista de pacientes para el select
//   const [examenes, setExamenes] = useState<ExamenOdontologico[]>([]) // Lista de exámenes para asociar
//   const [estadisticas, setEstadisticas] = useState<EstadisticasPago>({
//     totalRecaudado: 0,
//     totalDescuentos: 0,
//     pacientesBeneficiados: 0,
//     pagosPendientes: 0
//   })

//   // Estados para filtros y búsqueda
//   const [filtros, setFiltros] = useState({
//     fechaDesde: '',
//     fechaHasta: '',
//     estado: '',
//     metodoPago: '',
//     pacienteSearch: ''
//   })

//   // Estados para el formulario de nuevo pago
//   const [formNuevoPago, setFormNuevoPago] = useState({
//     idPaciente: '',
//     idExamen: '',
//     montoBase: 0,
//     tipoDescuento: '',
//     valorDescuento: 0,
//     metodoPago: '',
//     referencia: '',
//     estado: 'COMPLETADO' as const
//   })

//   // Estados para cálculos en tiempo real
//   const [calculosPago, setCalculosPago] = useState({
//     montoBase: 0,
//     descuento: 0,
//     montoFinal: 0
//   })

//   // Estados para UI
//   const [loading, setLoading] = useState(false)
//   const [modalNuevoPago, setModalNuevoPago] = useState(false)

//   // Función para cargar datos iniciales
//   useEffect(() => {
//     cargarDatosIniciales()
//   }, [])

//   // Función para cargar facturas, pacientes y estadísticas desde la API
//   const cargarDatosIniciales = async () => {
//     setLoading(true)
//     try {
//       // Cargar facturas con paginación y filtros
//       const [facturasRes, pacientesRes, estadisticasRes] = await Promise.all([
//         fetch('/api/pagos/facturas'),
//         fetch('/api/pagos/pacientes'),
//         fetch('/api/pagos/estadisticas')
//       ])

//       if (facturasRes.ok) {
//         const facturasData = await facturasRes.json()
//         setFacturas(facturasData)
//       }

//       if (pacientesRes.ok) {
//         const pacientesData = await pacientesRes.json()
//         setPacientes(pacientesData)
//       }

//       if (estadisticasRes.ok) {
//         const estadisticasData = await estadisticasRes.json()
//         setEstadisticas(estadisticasData)
//       }
//     } catch (error) {
//       console.error('Error cargando datos:', error)
//       toast.error('Error al cargar los datos')
//     } finally {
//       setLoading(false)
//     }
//   }

//   // Función para cargar exámenes de un paciente específico
//   const cargarExamenesPaciente = async (idPaciente: string) => {
//     if (!idPaciente) {
//       setExamenes([])
//       return
//     }

//     try {
//       const response = await fetch(`/api/pagos/examenes?pacienteId=${idPaciente}`)
//       if (response.ok) {
//         const examenesData = await response.json()
//         setExamenes(examenesData)
//       }
//     } catch (error) {
//       console.error('Error cargando exámenes:', error)
//     }
//   }

//   // Función para calcular montos en tiempo real cuando cambian los valores del formulario
//   useEffect(() => {
//     calcularMontos()
//   }, [formNuevoPago.montoBase, formNuevoPago.tipoDescuento, formNuevoPago.valorDescuento])

//   const calcularMontos = () => {
//     const { montoBase, tipoDescuento, valorDescuento } = formNuevoPago
//     let descuento = 0

//     // Calcular descuento según el tipo
//     if (tipoDescuento === 'porcentaje') {
//       descuento = (montoBase * valorDescuento) / 100
//     } else if (tipoDescuento === 'monto_fijo') {
//       descuento = Math.min(valorDescuento, montoBase)
//     }

//     const montoFinal = montoBase - descuento

//     setCalculosPago({
//       montoBase,
//       descuento,
//       montoFinal
//     })
//   }

//   // Función para manejar cambios en el formulario
//   const handleFormChange = (field: string, value: any) => {
//     setFormNuevoPago(prev => ({
//       ...prev,
//       [field]: value
//     }))

//     // Si cambia el paciente, cargar sus exámenes
//     if (field === 'idPaciente') {
//       cargarExamenesPaciente(value)
//     }
//   }

//   // Función para registrar nuevo pago
//   const registrarNuevoPago = async () => {
//     if (!formNuevoPago.idPaciente || !formNuevoPago.montoBase || !formNuevoPago.metodoPago) {
//       toast.error('Por favor complete todos los campos obligatorios')
//       return
//     }

//     setLoading(true)
//     try {
//       const pagoData = {
//         ...formNuevoPago,
//         montoOriginal: calculosPago.montoBase,
//         descuentoAplicado: calculosPago.descuento,
//         monto: calculosPago.montoFinal
//       }

//       const response = await fetch('/api/pagos/crear', {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json'
//         },
//         body: JSON.stringify(pagoData)
//       })

//       if (response.ok) {
//         const nuevoPago = await response.json()
//         setFacturas(prev => [nuevoPago, ...prev]) // Agregar al inicio de la lista
        
//         // Actualizar estadísticas
//         setEstadisticas(prev => ({
//           ...prev,
//           totalRecaudado: prev.totalRecaudado + calculosPago.montoFinal,
//           totalDescuentos: prev.totalDescuentos + calculosPago.descuento
//         }))

//         // Limpiar formulario y cerrar modal
//         limpiarFormulario()
//         setModalNuevoPago(false)
//         toast.success('Pago registrado exitosamente')
//       } else {
//         const error = await response.json()
//         toast.error(error.message || 'Error al registrar el pago')
//       }
//     } catch (error) {
//       console.error('Error registrando pago:', error)
//       toast.error('Error al registrar el pago')
//     } finally {
//       setLoading(false)
//     }
//   }

//   // Función para limpiar el formulario
//   const limpiarFormulario = () => {
//     setFormNuevoPago({
//       idPaciente: '',
//       idExamen: '',
//       montoBase: 0,
//       tipoDescuento: '',
//       valorDescuento: 0,
//       metodoPago: '',
//       referencia: '',
//       estado: 'COMPLETADO'
//     })
//     setCalculosPago({
//       montoBase: 0,
//       descuento: 0,
//       montoFinal: 0
//     })
//     setExamenes([])
//   }

//   // Función para aplicar filtros a las facturas
//   const aplicarFiltros = async () => {
//     setLoading(true)
//     try {
//       const queryParams = new URLSearchParams()
      
//       // Construir query params solo con valores no vacíos
//       Object.entries(filtros).forEach(([key, value]) => {
//         if (value) {
//           queryParams.append(key, value)
//         }
//       })

//       const response = await fetch(`/api/pagos/facturas?${queryParams.toString()}`)
//       if (response.ok) {
//         const facturasData = await response.json()
//         setFacturas(facturasData)
//       }
//     } catch (error) {
//       console.error('Error aplicando filtros:', error)
//       toast.error('Error al aplicar filtros')
//     } finally {
//       setLoading(false)
//     }
//   }

//   // Función para exportar a Excel
//   const exportarExcel = async () => {
//     try {
//       const response = await fetch('/api/pagos/exportar/excel', {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json'
//         },
//         body: JSON.stringify({ filtros })
//       })

//       if (response.ok) {
//         const blob = await response.blob()
//         const url = window.URL.createObjectURL(blob)
//         const a = document.createElement('a')
//         a.style.display = 'none'
//         a.href = url
//         a.download = `pagos_${new Date().toISOString().split('T')[0]}.xlsx`
//         document.body.appendChild(a)
//         a.click()
//         window.URL.revokeObjectURL(url)
//         toast.success('Excel exportado exitosamente')
//       }
//     } catch (error) {
//       console.error('Error exportando Excel:', error)
//       toast.error('Error al exportar Excel')
//     }
//   }

//   return (
//     <div className="container mx-auto p-6 space-y-6">
//       {/* Header */}
//       <div className="flex justify-between items-center">
//         <div>
//           <h1 className="text-3xl font-bold text-gray-900">Módulo de Pagos</h1>
//           <p className="text-gray-600">Sistema de gestión de pagos con descuentos</p>
//         </div>
//       </div>

//       {/* Estadísticas */}
//       <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
//         <Card>
//           <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//             <CardTitle className="text-sm font-medium">Total Recaudado</CardTitle>
//             <DollarSign className="h-4 w-4 text-muted-foreground" />
//           </CardHeader>
//           <CardContent>
//             <div className="text-2xl font-bold">${estadisticas.totalRecaudado.toLocaleString()}</div>
//           </CardContent>
//         </Card>

//         <Card>
//           <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//             <CardTitle className="text-sm font-medium">Total Descuentos</CardTitle>
//             <TrendingUp className="h-4 w-4 text-muted-foreground" />
//           </CardHeader>
//           <CardContent>
//             <div className="text-2xl font-bold">${estadisticas.totalDescuentos.toLocaleString()}</div>
//           </CardContent>
//         </Card>

//         <Card>
//           <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//             <CardTitle className="text-sm font-medium">Pacientes Beneficiados</CardTitle>
//             <Users className="h-4 w-4 text-muted-foreground" />
//           </CardHeader>
//           <CardContent>
//             <div className="text-2xl font-bold">{estadisticas.pacientesBeneficiados}</div>
//           </CardContent>
//         </Card>

//         <Card>
//           <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//             <CardTitle className="text-sm font-medium">Pagos Pendientes</CardTitle>
//             <Calendar className="h-4 w-4 text-muted-foreground" />
//           </CardHeader>
//           <CardContent>
//             <div className="text-2xl font-bold">{estadisticas.pagosPendientes}</div>
//           </CardContent>
//         </Card>
//       </div>

//       {/* Tabs principales */}
//       <Tabs defaultValue="pagos" className="space-y-4">
//         <TabsList>
//           <TabsTrigger value="pagos">Gestión de Pagos</TabsTrigger>
//           <TabsTrigger value="nuevo-pago">Nuevo Pago</TabsTrigger>
//           <TabsTrigger value="reportes">Reportes</TabsTrigger>
//         </TabsList>

//         {/* Tab: Gestión de Pagos */}
//         <TabsContent value="pagos" className="space-y-4">
//           <Card>
//             <CardHeader>
//               <CardTitle className="flex items-center gap-2">
//                 <Search className="h-5 w-5" />
//                 Filtros de Búsqueda
//               </CardTitle>
//             </CardHeader>
//             <CardContent>
//               <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-4">
//                 <div>
//                   <Label>Fecha Desde</Label>
//                   <Input 
//                     type="date" 
//                     value={filtros.fechaDesde}
//                     onChange={(e) => setFiltros(prev => ({ ...prev, fechaDesde: e.target.value }))}
//                   />
//                 </div>
//                 <div>
//                   <Label>Fecha Hasta</Label>
//                   <Input 
//                     type="date" 
//                     value={filtros.fechaHasta}
//                     onChange={(e) => setFiltros(prev => ({ ...prev, fechaHasta: e.target.value }))}
//                   />
//                 </div>
//                 <div>
//                   <Label>Estado</Label>
//                   <Select value={filtros.estado} onValueChange={(value) => setFiltros(prev => ({ ...prev, estado: value }))}>
//                     <SelectTrigger>
//                       <SelectValue placeholder="Todos" />
//                     </SelectTrigger>
//                     <SelectContent>
//                       <SelectItem value="">Todos los Estados</SelectItem>
//                       <SelectItem value="COMPLETADO">Completado</SelectItem>
//                       <SelectItem value="PENDIENTE">Pendiente</SelectItem>
//                       <SelectItem value="CANCELADO">Cancelado</SelectItem>
//                     </SelectContent>
//                   </Select>
//                 </div>
//                 <div>
//                   <Label>Método de Pago</Label>
//                   <Select value={filtros.metodoPago} onValueChange={(value) => setFiltros(prev => ({ ...prev, metodoPago: value }))}>
//                     <SelectTrigger>
//                       <SelectValue placeholder="Todos" />
//                     </SelectTrigger>
//                     <SelectContent>
//                       <SelectItem value="">Todos</SelectItem>
//                       <SelectItem value="Efectivo">Efectivo</SelectItem>
//                       <SelectItem value="Tarjeta">Tarjeta</SelectItem>
//                       <SelectItem value="Transferencia">Transferencia</SelectItem>
//                     </SelectContent>
//                   </Select>
//                 </div>
//                 <div className="flex items-end">
//                   <Button onClick={aplicarFiltros} disabled={loading}>
//                     <Filter className="h-4 w-4 mr-2" />
//                     Filtrar
//                   </Button>
//                 </div>
//               </div>

//               <div className="flex gap-2">
//                 <Button variant="outline" onClick={exportarExcel}>
//                   <Download className="h-4 w-4 mr-2" />
//                   Exportar Excel
//                 </Button>
//               </div>
//             </CardContent>
//           </Card>

//           {/* Tabla de Pagos */}
//           <Card>
//             <CardHeader>
//               <CardTitle>Historial de Pagos</CardTitle>
//             </CardHeader>
//             <CardContent>
//               <Table>
//                 <TableHeader>
//                   <TableRow>
//                     <TableHead>ID</TableHead>
//                     <TableHead>Paciente</TableHead>
//                     <TableHead>Monto Original</TableHead>
//                     <TableHead>Descuento</TableHead>
//                     <TableHead>Monto Final</TableHead>
//                     <TableHead>Método</TableHead>
//                     <TableHead>Estado</TableHead>
//                     <TableHead>Fecha</TableHead>
//                     <TableHead>Acciones</TableHead>
//                   </TableRow>
//                 </TableHeader>
//                 <TableBody>
//                   {facturas.map((factura) => (
//                     <TableRow key={factura.id}>
//                       <TableCell className="font-mono text-sm">
//                         {factura.id.slice(-8)}
//                       </TableCell>
//                       <TableCell>
//                         {factura.paciente.nombres} {factura.paciente.apellidos}
//                       </TableCell>
//                       <TableCell>${(factura.montoOriginal || factura.monto).toLocaleString()}</TableCell>
//                       <TableCell>
//                         ${(factura.descuentoAplicado || 0).toLocaleString()}
//                         {factura.descuentoAplicado && factura.montoOriginal && (
//                           <span className="text-sm text-gray-500 ml-1">
//                             ({(((factura.descuentoAplicado) / factura.montoOriginal) * 100).toFixed(1)}%)
//                           </span>
//                         )}
//                       </TableCell>
//                       <TableCell className="font-semibold">
//                         ${factura.monto.toLocaleString()}
//                       </TableCell>
//                       <TableCell>{factura.metodoPago}</TableCell>
//                       <TableCell>
//                         <Badge 
//                           variant={
//                             factura.estado === 'COMPLETADO' ? 'default' : 
//                             factura.estado === 'PENDIENTE' ? 'secondary' : 'destructive'
//                           }
//                         >
//                           {factura.estado}
//                         </Badge>
//                       </TableCell>
//                       <TableCell>
//                         {new Date(factura.fechaEmision).toLocaleDateString()}
//                       </TableCell>
//                       <TableCell>
//                         <Button variant="ghost" size="sm">
//                           <Eye className="h-4 w-4" />
//                         </Button>
//                       </TableCell>
//                     </TableRow>
//                   ))}
//                 </TableBody>
//               </Table>
//             </CardContent>
//           </Card>
//         </TabsContent>

//         {/* Tab: Nuevo Pago */}
//         <TabsContent value="nuevo-pago" className="space-y-4">
//           <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
//             {/* Formulario Principal */}
//             <div className="lg:col-span-2 space-y-4">
//               <Card>
//                 <CardHeader>
//                   <CardTitle className="flex items-center gap-2">
//                     <Plus className="h-5 w-5" />
//                     Información del Pago
//                   </CardTitle>
//                 </CardHeader>
//                 <CardContent className="space-y-4">
//                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                     <div>
//                       <Label>Paciente *</Label>
//                       <Select 
//                         value={formNuevoPago.idPaciente} 
//                         onValueChange={(value) => handleFormChange('idPaciente', value)}
//                       >
//                         <SelectTrigger>
//                           <SelectValue placeholder="Seleccionar paciente..." />
//                         </SelectTrigger>
//                         <SelectContent>
//                           {pacientes.map((paciente) => (
//                             <SelectItem key={paciente.id} value={paciente.id}>
//                               {paciente.nombres} {paciente.apellidos} - {paciente.dni}
//                             </SelectItem>
//                           ))}
//                         </SelectContent>
//                       </Select>
//                     </div>

//                     <div>
//                       <Label>Examen Asociado</Label>
//                       <Select 
//                         value={formNuevoPago.idExamen} 
//                         onValueChange={(value) => handleFormChange('idExamen', value)}
//                         disabled={!formNuevoPago.idPaciente}
//                       >
//                         <SelectTrigger>
//                           <SelectValue placeholder="Seleccionar examen..." />
//                         </SelectTrigger>
//                         <SelectContent>
//                           {examenes.map((examen) => (
//                             <SelectItem key={examen.id} value={examen.id}>
//                               {new Date(examen.fecha).toLocaleDateString()} - ${examen.presupuesto?.toLocaleString() || 'Sin presupuesto'}
//                             </SelectItem>
//                           ))}
//                         </SelectContent>
//                       </Select>
//                     </div>

//                     <div>
//                       <Label>Monto Base ($) *</Label>
//                       <Input 
//                         type="number" 
//                         step="0.01" 
//                         min="0"
//                         value={formNuevoPago.montoBase || ''}
//                         onChange={(e) => handleFormChange('montoBase', parseFloat(e.target.value) || 0)}
//                       />
//                     </div>

//                     <div>
//                       <Label>Método de Pago *</Label>
//                       <Select 
//                         value={formNuevoPago.metodoPago} 
//                         onValueChange={(value) => handleFormChange('metodoPago', value)}
//                       >
//                         <SelectTrigger>
//                           <SelectValue placeholder="Seleccionar método..." />
//                         </SelectTrigger>
//                         <SelectContent>
//                           <SelectItem value="Efectivo">Efectivo</SelectItem>
//                           <SelectItem value="Tarjeta">Tarjeta</SelectItem>
//                           <SelectItem value="Transferencia">Transferencia</SelectItem>
//                           <SelectItem value="Cheque">Cheque</SelectItem>
//                         </SelectContent>
//                       </Select>
//                     </div>

//                     <div className="md:col-span-2">
//                       <Label>Referencia/Comprobante</Label>
//                       <Input 
//                         placeholder="Número de comprobante o referencia"
//                         value={formNuevoPago.referencia}
//                         onChange={(e) => handleFormChange('referencia', e.target.value)}
//                       />
//                     </div>
//                   </div>
//                 </CardContent>
//               </Card>

//               {/* Sección de Descuentos */}
//               <Card>
//                 <CardHeader>
//                   <CardTitle>Aplicar Descuentos</CardTitle>
//                 </CardHeader>
//                 <CardContent className="space-y-4">
//                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                     <div>
//                       <Label>Tipo de Descuento</Label>
//                       <Select 
//                         value={formNuevoPago.tipoDescuento} 
//                         onValueChange={(value) => handleFormChange('tipoDescuento', value)}
//                       >
//                         <SelectTrigger>
//                           <SelectValue placeholder="Sin descuento" />
//                         </SelectTrigger>
//                         <SelectContent>
//                           <SelectItem value="">Sin Descuento</SelectItem>
//                           <SelectItem value="porcentaje">Porcentaje (%)</SelectItem>
//                           <SelectItem value="monto_fijo">Monto Fijo ($)</SelectItem>
//                         </SelectContent>
//                       </Select>
//                     </div>

//                     <div>
//                       <Label>Valor del Descuento</Label>
//                       <Input 
//                         type="number" 
//                         step="0.01" 
//                         min="0"
//                         value={formNuevoPago.valorDescuento || ''}
//                         onChange={(e) => handleFormChange('valorDescuento', parseFloat(e.target.value) || 0)}
//                         disabled={!formNuevoPago.tipoDescuento}
//                       />
//                     </div>
//                   </div>

//                   {/* Descuentos Predefinidos */}
//                   <div>
//                     <Label>Descuentos Rápidos</Label>
//                     <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2">
//                       <Button 
//                         variant="outline" 
//                         size="sm"
//                         onClick={() => {
//                           handleFormChange('tipoDescuento', 'porcentaje')
//                           handleFormChange('valorDescuento', 15)
//                         }}
//                       >
//                         Tercera Edad (15%)
//                       </Button>
//                       <Button 
//                         variant="outline" 
//                         size="sm"
//                         onClick={() => {
//                           handleFormChange('tipoDescuento', 'porcentaje')
//                           handleFormChange('valorDescuento', 10)
//                         }}
//                       >
//                         Estudiante (10%)
//                       </Button>
//                       <Button 
//                         variant="outline" 
//                         size="sm"
//                         onClick={() => {
//                           handleFormChange('tipoDescuento', 'porcentaje')
//                           handleFormChange('valorDescuento', 20)
//                         }}
//                       >
//                         Empleado (20%)
//                       </Button>
//                       <Button 
//                         variant="outline" 
//                         size="sm"
//                         onClick={() => {
//                           handleFormChange('tipoDescuento', 'monto_fijo')
//                           handleFormChange('valorDescuento', 50)
//                         }}
//                       >
//                         Promo $50
//                       </Button>
//                     </div>
//                   </div>
//                 </CardContent>
//               </Card>
//             </div>

//             {/* Panel de Cálculos */}
//             <div>
//               <Card className="sticky top-6">
//                 <CardHeader>
//                   <CardTitle className="flex items-center gap-2">
//                     <Calculator className="h-5 w-5" />
//                     Cálculo del Pago
//                   </CardTitle>
//                 </CardHeader>
//                 <CardContent className="space-y-4">
//                   <div className="space-y-3">
//                     <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
//                       <span>Monto Base:</span>
//                       <span className="font-semibold">${calculosPago.montoBase.toLocaleString()}</span>
//                     </div>

//                     <div className="flex justify-between items-center p-3 bg-red-50 rounded">
//                       <span>Descuento:</span>
//                       <span className="font-semibold text-red-600">
//                         -${calculosPago.descuento.toLocaleString()}
//                       </span>
//                     </div>

//                     <div className="flex justify-between items-center p-3 bg-green-50 rounded border-2 border-green-200">
//                       <span className="font-semibold">Total a Pagar:</span>
//                       <span className="font-bold text-lg text-green-600">
//                         ${calculosPago.montoFinal.toLocaleString()}
//                       </span>
//                     </div>

//                     {calculosPago.descuento > 0 && (
//                       <div className="text-sm text-center text-green-600 bg-green-50 p-2 rounded">
//                         💰 Ahorro: ${calculosPago.descuento.toLocaleString()}
//                       </div>
//                     )}
//                   </div>

//                   <div className="space-y-2">
//                     <Button 
//                       onClick={registrarNuevoPago} 
//                       disabled={loading || !formNuevoPago.idPaciente || !formNuevoPago.montoBase}
//                       className="w-full"
//                     >
//                       <Save className="h-4 w-4 mr-2" />
//                       {loading ? 'Procesando...' : 'Registrar Pago'}
//                     </Button>

//                     <Button 
//                       variant="outline" 
//                       onClick={limpiarFormulario}
//                       className="w-full"
//                     >
//                       Limpiar Formulario
//                     </Button>
//                   </div>

//                   {/* Estado del Pago */}
//                   <div>
//                     <Label>Estado del Pago</Label>
//                     <Select 
//                       value={formNuevoPago.estado} 
//                       onValueChange={(value) => handleFormChange('estado', value)}
//                     >
//                       <SelectTrigger>
//                         <SelectValue />
//                       </SelectTrigger>
//                       <SelectContent>
//                         <SelectItem value="COMPLETADO">Completado</SelectItem>
//                         <SelectItem value="PENDIENTE">Pendiente</SelectItem>
//                       </SelectContent>
//                     </Select>
//                   </div>
//                 </CardContent>
//               </Card>
//             </div>
//           </div>
//         </TabsContent>

//         {/* Tab: Reportes */}
//         <TabsContent value="reportes" className="space-y-4">
//           <Card>
//             <CardHeader>
//               <CardTitle>Reportes y Estadísticas</CardTitle>
//               <CardDescription>
//                 Análisis detallado de pagos y descuentos aplicados
//               </CardDescription>
//             </CardHeader>
//             <CardContent>
//               <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
//                 <div>
//                   <Label>Fecha Desde</Label>
//                   <Input type="date" />
//                 </div>
//                 <div>
//                   <Label>Fecha Hasta</Label>
//                   <Input type="date" />
//                 </div>
//               </div>

//               {/* Estadísticas Detalladas */}
//               <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
//                 <Card>
//                   <CardHeader className="pb-2">
//                     <CardTitle className="text-sm">Promedio de Descuento</CardTitle>
//                   </CardHeader>
//                   <CardContent>
//                     <div className="text-2xl font-bold">12.5%</div>
//                     <div className="text-sm text-gray-500">Por transacción</div>
//                   </CardContent>
//                 </Card>

//                 <Card>
//                   <CardHeader className="pb-2">
//                     <CardTitle className="text-sm">Método Más Usado</CardTitle>
//                   </CardHeader>
//                   <CardContent>
//                     <div className="text-2xl font-bold">Tarjeta</div>
//                     <div className="text-sm text-gray-500">65% de los pagos</div>
//                   </CardContent>
//                 </Card>

//                 <Card>
//                   <CardHeader className="pb-2">
//                     <CardTitle className="text-sm">Ticket Promedio</CardTitle>
//                   </CardHeader>
//                   <CardContent>
//                     <div className="text-2xl font-bold">$240</div>
//                     <div className="text-sm text-gray-500">Por paciente</div>
//                   </CardContent>
//                 </Card>
//               </div>

//               {/* Tabla de Top Pacientes */}
//               <Card>
//                 <CardHeader>
//                   <CardTitle>Top Pacientes con Descuentos</CardTitle>
//                 </CardHeader>
//                 <CardContent>
//                   <Table>
//                     <TableHeader>
//                       <TableRow>
//                         <TableHead>Paciente</TableHead>
//                         <TableHead>Total Pagos</TableHead>
//                         <TableHead>Total Descuentos</TableHead>
//                         <TableHead>Ahorro Total</TableHead>
//                       </TableRow>
//                     </TableHeader>
//                     <TableBody>
//                       <TableRow>
//                         <TableCell>Juan Pérez</TableCell>
//                         <TableCell>8</TableCell>
//                         <TableCell>5</TableCell>
//                         <TableCell className="font-semibold text-green-600">$125.50</TableCell>
//                       </TableRow>
//                       <TableRow>
//                         <TableCell>María González</TableCell>
//                         <TableCell>5</TableCell>
//                         <TableCell>3</TableCell>
//                         <TableCell className="font-semibold text-green-600">$89.30</TableCell>
//                       </TableRow>
//                       <TableRow>
//                         <TableCell>Carlos Rodríguez</TableCell>
//                         <TableCell>6</TableCell>
//                         <TableCell>4</TableCell>
//                         <TableCell className="font-semibold text-green-600">$156.20</TableCell>
//                       </TableRow>
//                     </TableBody>
//                   </Table>
//                 </CardContent>
//               </Card>
//             </CardContent>
//           </Card>
//         </TabsContent>
//       </Tabs>
//     </div>
//   )
// }

"use client"
function page(){
    return(
        <div> Aqui serán los pagos</div>
    )
}
export default page