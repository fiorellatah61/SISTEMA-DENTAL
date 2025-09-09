// // app/dashboard/factura/page.tsx

// 'use client'

// import { useState, useEffect } from 'react'
// import { Button } from '../../../components/ui/button'
// import { Input } from '@/components/ui/input'
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
// import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
// import { Badge } from '@/components/ui/badge'
// import { Checkbox } from '@/components/ui/checkbox'
// import { Trash2, Edit, Download, Plus, Mail, Calculator } from 'lucide-react'

// // Tipos
// type EstadoFactura = 'COMPLETADO' | 'PENDIENTE' | 'CANCELADO'

// interface Factura {
//   id: string
//   monto: number | string
//   fechaEmision: string
//   metodoPago?: string
//   estado: EstadoFactura
//   archivoFacturaPdf?: string
//   paciente: {
//     id: string
//     nombres: string
//     apellidos: string
//     dni: string
//     email?: string
//     telefono?: string
//   }
//   examenOdontologico?: {
//     id: string
//     diagnostico?: string
//     presupuesto?: number
//     planTratamiento?: {
//       descripcion?: string
//       costoTotal?: number
//     }
//   } | null
//   evolucionPaciente?: {
//     id: string
//     tratamientoRealizado?: string
//     aCuenta: number
//     saldo: number
//   } | null
// }

// interface Paciente {
//   id: string
//   nombres: string
//   apellidos: string
//   dni: string
//   email?: string
//   telefono?: string
// }

// interface ExamenOdontologico {
//   id: string
//   diagnostico?: string
//   presupuesto?: number
//   planTratamiento?: {
//     descripcion?: string
//     costoTotal?: number
//   }
// }

// interface EvolucionPaciente {
//   id: string
//   tratamientoRealizado?: string
//   aCuenta: number
//   saldo: number
// }

// export default function FacturasPage() {
//   const [facturas, setFacturas] = useState<Factura[]>([])
//   const [pacientes, setPacientes] = useState<Paciente[]>([])
//   const [examenes, setExamenes] = useState<ExamenOdontologico[]>([])
//   const [evoluciones, setEvoluciones] = useState<EvolucionPaciente[]>([])
//   const [loading, setLoading] = useState(true)
//   const [showForm, setShowForm] = useState(false)
//   const [editingId, setEditingId] = useState<string | null>(null)

//   // Filtros
//   const [filtroEstado, setFiltroEstado] = useState('')
//   const [filtroPaciente, setFiltroPaciente] = useState('')

//   // Form data
//   const [formData, setFormData] = useState({
//     idPaciente: '',
//     idExamenesOdontologico: '',
//     idEvolucionPaciente: '',
//     montoBase: '',
//     aplicarIgv: false,
//     metodoPago: '',
//     estado: 'PENDIENTE' as EstadoFactura,
//     servicios: ''
//   })

//   // Estados para cálculos
//   const [montoCalculado, setMontoCalculado] = useState(0)
//   const [igvCalculado, setIgvCalculado] = useState(0)
//   const [totalCalculado, setTotalCalculado] = useState(0)

//   useEffect(() => {
//     cargarFacturas()
//     cargarPacientes()
//   }, [])

//   useEffect(() => {
//     if (formData.idPaciente) {
//       cargarExamenes(formData.idPaciente)
//       cargarEvoluciones(formData.idPaciente)
//     }
//   }, [formData.idPaciente])

//   useEffect(() => {
//     calcularMontos()
//   }, [formData.montoBase, formData.aplicarIgv, formData.idExamenesOdontologico, formData.idEvolucionPaciente])

//   const calcularMontos = () => {
//     let baseCalculada = parseFloat(formData.montoBase) || 0

//     if (!formData.montoBase && (formData.idExamenesOdontologico || formData.idEvolucionPaciente)) {
//       const examen = examenes.find(e => e.id === formData.idExamenesOdontologico)
//       const evolucion = evoluciones.find(e => e.id === formData.idEvolucionPaciente)
//       baseCalculada = (examen?.presupuesto || 0) + (evolucion?.aCuenta || 0) + (evolucion?.saldo || 0)
//     }

//     const igv = formData.aplicarIgv ? baseCalculada * 0.18 : 0
//     const total = baseCalculada + igv

//     setMontoCalculado(baseCalculada)
//     setIgvCalculado(igv)
//     setTotalCalculado(total)
//   }

//   const cargarFacturas = async () => {
//     try {
//       const res = await fetch('/api/facturas')
//       if (!res.ok) throw new Error('Error cargando facturas')
//       const data = await res.json()
//       setFacturas(data)
//     } catch (error) {
//       console.error('Error cargando facturas:', error)
//     } finally {
//       setLoading(false)
//     }
//   }

//   const cargarPacientes = async () => {
//     try {
//       const res = await fetch('/api/pacientes-get-factura')
//       if (!res.ok) throw new Error('Error cargando pacientes')
//       const data = await res.json()
//       setPacientes(data)
//     } catch (error) {
//       console.error('Error cargando pacientes:', error)
//       setPacientes([])
//     }
//   }

//   const cargarExamenes = async (idPaciente: string) => {
//     try {
//       const res = await fetch(`/api/examenes-odontologicos/${idPaciente}`)
//       if (res.ok) {
//         const data = await res.json()
//         setExamenes(data)
//       }
//     } catch (error) {
//       console.error('Error cargando exámenes:', error)
//       setExamenes([])
//     }
//   }

//   const cargarEvoluciones = async (idPaciente: string) => {
//     try {
//       const res = await fetch(`/api/evolucion-pacientes/${idPaciente}`)
//       if (res.ok) {
//         const data = await res.json()
//         setEvoluciones(data)
//       }
//     } catch (error) {
//       console.error('Error cargando evoluciones:', error)
//       setEvoluciones([])
//     }
//   }

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault()
//     setLoading(true)
//     try {
//       const url = editingId ? `/api/facturas/${editingId}` : '/api/facturas'
//       const method = editingId ? 'PUT' : 'POST'
//       const bodyData = {
//         ...formData,
//         monto: totalCalculado.toString(),
//         montoBase: montoCalculado.toString(),
//         igvCalculado: igvCalculado.toString(),
//         idExamenesOdontologico: formData.idExamenesOdontologico || null,
//         idEvolucionPaciente: formData.idEvolucionPaciente || null
//       }
//       const res = await fetch(url, {
//         method,
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify(bodyData)
//       })
//       if (res.ok) {
//         await cargarFacturas()
//         resetForm()
//       } else {
//         const error = await res.json()
//         alert('Error: ' + error.error)
//       }
//     } catch (error) {
//       console.error('Error:', error)
//       alert('Error al procesar factura')
//     } finally {
//       setLoading(false)
//     }
//   }

//   const handleEdit = (factura: Factura) => {
//     setFormData({
//       idPaciente: factura.paciente.id,
//       idExamenesOdontologico: factura.examenOdontologico?.id || '',
//       idEvolucionPaciente: factura.evolucionPaciente?.id || '',
//       montoBase: (typeof factura.monto === 'number' ? factura.monto : parseFloat(factura.monto || '0')).toString(),
//       aplicarIgv: false,
//       metodoPago: factura.metodoPago || '',
//       estado: factura.estado,
//       servicios: ''
//     })
//     setEditingId(factura.id)
//     setShowForm(true)
//   }

//   const handleDelete = async (id: string) => {
//     if (!confirm('¿Estás seguro de eliminar esta factura?')) return
//     setLoading(true)
//     try {
//       const res = await fetch(`/api/facturas/${id}`, { method: 'DELETE' })
//       if (!res.ok) {
//         const error = await res.json()
//         throw new Error(error.error || 'Error al eliminar factura')
//       }
//       await cargarFacturas()
//     } catch (error) {
//       console.error('Error:', error)
//       alert('Error al eliminar factura: ' + (error as Error).message)
//     } finally {
//       setLoading(false)
//     }
//   }

//   const handleDownload = async (factura: Factura) => {
//     if (!factura.archivoFacturaPdf) {
//       alert('No hay PDF disponible')
//       return
//     }
//     try {
//       window.open(factura.archivoFacturaPdf, '_blank')
//     } catch (error) {
//       console.error('Error abriendo PDF:', error)
//     }
//   }

//   const handleSendEmail = async (factura: Factura) => {
//     const email = prompt(`Enviar factura por email a:`, factura.paciente.email || '')
//     if (!email) return

//     setLoading(true)
//     try {
//       const res = await fetch(`/api/facturas/${factura.id}`, {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ emailDestino: email })
//       })
      
//       if (res.ok) {
//         const result = await res.json()
//         alert(`Factura enviada correctamente a: ${result.emailEnviadoA}`)
//       } else {
//         const error = await res.json()
//         alert('Error enviando email: ' + error.error)
//       }
//     } catch (error) {
//       console.error('Error:', error)
//       alert('Error enviando email')
//     } finally {
//       setLoading(false)
//     }
//   }

//   const resetForm = () => {
//     setFormData({
//       idPaciente: '',
//       idExamenesOdontologico: '',
//       idEvolucionPaciente: '',
//       montoBase: '',
//       aplicarIgv: false,
//       metodoPago: '',
//       estado: 'PENDIENTE',
//       servicios: ''
//     })
//     setEditingId(null)
//     setShowForm(false)
//     setExamenes([])
//     setEvoluciones([])
//     setMontoCalculado(0)
//     setIgvCalculado(0)
//     setTotalCalculado(0)
//   }

//   const facturasFiltradas = facturas.filter(factura => {
//     const matchEstado = filtroEstado === '' || filtroEstado === 'TODOS' || factura.estado === filtroEstado
//     const matchPaciente = !filtroPaciente || 
//       `${factura.paciente.nombres} ${factura.paciente.apellidos}`.toLowerCase().includes(filtroPaciente.toLowerCase()) ||
//       factura.paciente.dni.includes(filtroPaciente)
//     return matchEstado && matchPaciente
//   })

//   if (loading && facturas.length === 0) {
//     return <div className="p-6 text-center">Cargando facturas...</div>
//   }

//   return (
//     <div className="p-6 max-w-7xl mx-auto bg-gray-50 min-h-screen">
//       <div className="flex justify-between items-center mb-6">
//         <h1 className="text-3xl font-bold text-gray-800">Gestión de Facturas</h1>
//         <Button onClick={() => setShowForm(true)} className="bg-green-600 text-white hover:bg-green-700 flex items-center gap-2 rounded-lg shadow-md">
//           <Plus size={16} />
//           Nueva Factura
//         </Button>
//       </div>

//       {/* Filtros */}
//       <Card className="mb-6 bg-white shadow-sm border border-gray-200">
//         <CardContent className="pt-6">
//           <div className="flex gap-4 flex-wrap">
//             <Input
//               placeholder="Buscar por paciente o DNI..."
//               value={filtroPaciente}
//               onChange={(e) => setFiltroPaciente(e.target.value)}
//               className="max-w-sm border-gray-300 rounded-md focus:border-green-600"
//             />
//             <Select value={filtroEstado} onValueChange={setFiltroEstado}>
//               <SelectTrigger className="max-w-sm border-gray-300 rounded-md focus:border-green-600">
//                 <SelectValue placeholder="Filtrar por estado" />
//               </SelectTrigger>
//               <SelectContent className="border-gray-200">
//                 <SelectItem value="TODOS">Todos los estados</SelectItem>
//                 <SelectItem value="PENDIENTE">Pendiente</SelectItem>
//                 <SelectItem value="COMPLETADO">Completado</SelectItem>
//                 <SelectItem value="CANCELADO">Cancelado</SelectItem>
//               </SelectContent>
//             </Select>
//           </div>
//         </CardContent>
//       </Card>

//       {/* Formulario */}
//       {showForm && (
//         <Card className="mb-6 bg-white shadow-sm border border-gray-200">
//           <CardHeader>
//             <CardTitle className="text-xl font-semibold text-gray-800 flex items-center gap-2">
//               <Calculator size={20} />
//               {editingId ? 'Editar' : 'Nueva'} Factura
//             </CardTitle>
//           </CardHeader>
//           <CardContent>
//             <form onSubmit={handleSubmit} className="space-y-6">
//               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                 {/* Paciente */}
//                 <div className="md:col-span-2">
//                   <label className="text-sm font-medium text-gray-700">Paciente *</label>
//                   <Select value={formData.idPaciente} onValueChange={(value) => setFormData({ ...formData, idPaciente: value })}>
//                     <SelectTrigger className="border-gray-300 rounded-md">
//                       <SelectValue placeholder="Seleccionar paciente" />
//                     </SelectTrigger>
//                     <SelectContent>
//                       {pacientes.map(paciente => (
//                         <SelectItem key={paciente.id} value={paciente.id} className="hover:bg-green-50">
//                           {paciente.nombres} {paciente.apellidos} - {paciente.dni}
//                         </SelectItem>
//                       ))}
//                     </SelectContent>
//                   </Select>
//                 </div>

//                 {/* Examen Odontológico */}
//                 <div>
//                   <label className="text-sm font-medium text-gray-700">Examen Odontológico</label>
//                   <Select 
//                     value={formData.idExamenesOdontologico} 
//                     onValueChange={(value) => setFormData({ 
//                       ...formData, 
//                       idExamenesOdontologico: value === 'ninguno' ? '' : value 
//                     })}
//                     disabled={!formData.idPaciente}
//                   >
//                     <SelectTrigger className="border-gray-300 rounded-md">
//                       <SelectValue placeholder="Seleccionar examen" />
//                     </SelectTrigger>
//                     <SelectContent>
//                       <SelectItem value="ninguno">Ninguno</SelectItem>
//                       {examenes.map(examen => (
//                         <SelectItem key={examen.id} value={examen.id}>
//                           {examen.diagnostico ? examen.diagnostico.substring(0, 50) + '...' : 'Examen sin diagnóstico'}
//                           {examen.presupuesto ? ` - S/ ${Number(examen.presupuesto).toFixed(2)}` : ''}
//                         </SelectItem>
//                       ))}
//                     </SelectContent>
//                   </Select>
//                 </div>

//                 {/* Evolución Paciente */}
//                 <div>
//                   <label className="text-sm font-medium text-gray-700">Evolución del Paciente</label>
//                   <Select 
//                     value={formData.idEvolucionPaciente} 
//                     onValueChange={(value) => setFormData({ 
//                       ...formData, 
//                       idEvolucionPaciente: value === 'ninguno' ? '' : value 
//                     })}
//                     disabled={!formData.idPaciente}
//                   >
//                     <SelectTrigger className="border-gray-300 rounded-md">
//                       <SelectValue placeholder="Seleccionar evolución" />
//                     </SelectTrigger>
//                     <SelectContent>
//                       <SelectItem value="ninguno">Ninguno</SelectItem>
//                       {evoluciones.map(evolucion => (
//                         <SelectItem key={evolucion.id} value={evolucion.id}>
//                           {evolucion.tratamientoRealizado ? evolucion.tratamientoRealizado.substring(0, 50) + '...' : 'Tratamiento'} 
//                           - S/ {Number(evolucion.aCuenta + evolucion.saldo).toFixed(2)}
//                         </SelectItem>
//                       ))}
//                     </SelectContent>
//                   </Select>
//                 </div>

//                 {/* Monto Base */}
//                 <div>
//                   <label className="text-sm font-medium text-gray-700">Monto Base (Opcional)</label>
//                   <Input
//                     type="number"
//                     step="0.01"
//                     value={formData.montoBase}
//                     onChange={(e) => setFormData({ ...formData, montoBase: e.target.value })}
//                     placeholder="Dejar vacío para calcular automáticamente"
//                     className="border-gray-300 rounded-md focus:border-green-600"
//                   />
//                   <p className="text-xs text-gray-500 mt-1">
//                     Si está vacío, se calculará: Presupuesto + A cuenta + Saldo
//                   </p>
//                 </div>

//                 {/* Aplicar IGV */}
//                 <div className="flex items-center space-x-3">
//                   <Checkbox 
//                     id="aplicarIgv"
//                     checked={formData.aplicarIgv}
//                     onCheckedChange={(checked) => setFormData({ ...formData, aplicarIgv: !!checked })}
//                   />
//                   <label htmlFor="aplicarIgv" className="text-sm font-medium text-gray-700">
//                     Aplicar IGV (18%)
//                   </label>
//                 </div>

//                 {/* Método de Pago */}
//                 <div>
//                   <label className="text-sm font-medium text-gray-700">Método de Pago</label>
//                   <Select value={formData.metodoPago} onValueChange={(value) => setFormData({ ...formData, metodoPago: value })}>
//                     <SelectTrigger className="border-gray-300 rounded-md">
//                       <SelectValue placeholder="Seleccionar método" />
//                     </SelectTrigger>
//                     <SelectContent>
//                       <SelectItem value="Efectivo">Efectivo</SelectItem>
//                       <SelectItem value="Tarjeta de Débito">Tarjeta de Débito</SelectItem>
//                       <SelectItem value="Tarjeta de Crédito">Tarjeta de Crédito</SelectItem>
//                       <SelectItem value="Transferencia Bancaria">Transferencia Bancaria</SelectItem>
//                       <SelectItem value="Yape">Yape</SelectItem>
//                       <SelectItem value="Plin">Plin</SelectItem>
//                       <SelectItem value="Otro">Otro</SelectItem>
//                     </SelectContent>
//                   </Select>
//                 </div>

//                 {/* Estado */}
//                 <div>
//                   <label className="text-sm font-medium text-gray-700">Estado</label>
//                   <Select value={formData.estado} onValueChange={(value: EstadoFactura) => setFormData({ ...formData, estado: value })}>
//                     <SelectTrigger className="border-gray-300 rounded-md">
//                       <SelectValue />
//                     </SelectTrigger>
//                     <SelectContent>
//                       <SelectItem value="PENDIENTE">Pendiente</SelectItem>
//                       <SelectItem value="COMPLETADO">Completado</SelectItem>
//                       <SelectItem value="CANCELADO">Cancelado</SelectItem>
//                     </SelectContent>
//                   </Select>
//                 </div>
//               </div>

//               {/* Descripción de Servicios */}
//               <div>
//                 <label className="text-sm font-medium text-gray-700">Descripción de Servicios Adicionales</label>
//                 <textarea
//                   className="w-full min-h-[100px] p-3 border border-gray-300 rounded-md resize-y focus:border-green-600"
//                   value={formData.servicios}
//                   onChange={(e) => setFormData({ ...formData, servicios: e.target.value })}
//                   placeholder="Descripción adicional de servicios realizados..."
//                 />
//               </div>

//               {/* Resumen de Cálculos */}
//               <div className="bg-green-50 p-4 rounded-lg border border-green-200">
//                 <h3 className="font-semibold text-green-800 mb-3">Resumen de Montos:</h3>
//                 <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
//                   <div className="bg-white p-3 rounded border">
//                     <span className="text-gray-600">Subtotal:</span>
//                     <div className="font-bold text-lg">S/ {Number(montoCalculado).toFixed(2)}</div>
//                   </div>
//                   {formData.aplicarIgv && (
//                     <div className="bg-white p-3 rounded border">
//                       <span className="text-gray-600">IGV (18%):</span>
//                       <div className="font-bold text-lg">S/ {Number(igvCalculado).toFixed(2)}</div>
//                     </div>
//                   )}
//                   <div className="bg-green-100 p-3 rounded border border-green-300">
//                     <span className="text-green-700">Total a Pagar:</span>
//                     <div className="font-bold text-xl text-green-800">S/ {Number(totalCalculado).toFixed(2)}</div>
//                   </div>
//                 </div>
//               </div>

//               {/* Botones */}
//               <div className="flex gap-2 justify-end">
//                 <Button type="button" variant="outline" onClick={resetForm} className="border-gray-300 text-gray-700 hover:bg-gray-100">
//                   Cancelar
//                 </Button>
//                 <Button type="submit" disabled={loading} className="bg-green-600 text-white hover:bg-green-700 rounded-md">
//                   {loading ? 'Procesando...' : editingId ? 'Actualizar' : 'Crear Factura'}
//                 </Button>
//               </div>
//             </form>
//           </CardContent>
//         </Card>
//       )}

//       {/* Lista de Facturas */}
//       <div className="space-y-4">
//         {facturasFiltradas.map(factura => (
//           <Card key={factura.id} className="bg-white shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
//             <CardContent className="pt-6">
//               <div className="flex justify-between items-start">
//                 <div className="space-y-3 flex-1">
//                   <div className="flex items-center gap-3 flex-wrap">
//                     <h3 className="font-semibold text-gray-800">
//                       {factura.paciente.nombres} {factura.paciente.apellidos}
//                     </h3>
//                     <Badge variant={
//                       factura.estado === 'COMPLETADO' ? 'default' :
//                       factura.estado === 'PENDIENTE' ? 'secondary' : 'destructive'
//                     } className="rounded-full">
//                       {factura.estado}
//                     </Badge>
//                   </div>
                  
//                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
//                     <div>
//                       <p><strong>DNI:</strong> {factura.paciente.dni}</p>
//                       {factura.paciente.email && <p><strong>Email:</strong> {factura.paciente.email}</p>}
//                       {factura.paciente.telefono && <p><strong>Teléfono:</strong> {factura.paciente.telefono}</p>}
//                     </div>
//                     <div>
//                       <p><strong>Fecha:</strong> {new Date(factura.fechaEmision).toLocaleDateString('es-PE')}</p>
//                       {factura.metodoPago && <p><strong>Método:</strong> {factura.metodoPago}</p>}
//                     </div>
//                   </div>

//                   {factura.examenOdontologico && (
//                     <div className="bg-blue-50 p-3 rounded border border-blue-200">
//                       <h4 className="font-medium text-blue-800 mb-2">Examen Odontológico:</h4>
//                       {factura.examenOdontologico.diagnostico && (
//                         <p className="text-sm text-blue-700">
//                           <strong>Diagnóstico:</strong> {factura.examenOdontologico.diagnostico}
//                         </p>
//                       )}
//                       {factura.examenOdontologico.presupuesto && (
//                         <p className="text-sm text-blue-700">
//                           <strong>Presupuesto:</strong> S/ {Number(factura.examenOdontologico.presupuesto).toFixed(2)}
//                         </p>
//                       )}
//                     </div>
//                   )}

//                   {factura.evolucionPaciente && (
//                     <div className="bg-purple-50 p-3 rounded border border-purple-200">
//                       <h4 className="font-medium text-purple-800 mb-2">Evolución del Paciente:</h4>
//                       {factura.evolucionPaciente.tratamientoRealizado && (
//                         <p className="text-sm text-purple-700 mb-2">
//                           <strong>Tratamiento:</strong> {factura.evolucionPaciente.tratamientoRealizado}
//                         </p>
//                       )}
//                       <div className="flex gap-4 text-sm">
//                         <span className="text-purple-700">
//                           <strong>A cuenta:</strong> S/ {Number(factura.evolucionPaciente.aCuenta).toFixed(2)}
//                         </span>
//                         <span className="text-purple-700">
//                           <strong>Saldo:</strong> S/ {Number(factura.evolucionPaciente.saldo).toFixed(2)}
//                         </span>
//                       </div>
//                     </div>
//                   )}

//                   <div className="flex items-center justify-between pt-2 border-t">
//                     <p className="text-2xl font-bold text-green-600">
//                       S/ {Number(factura.monto || 0).toFixed(2)}
//                     </p>
//                   </div>
//                 </div>

//                 {/* Botones de Acción */}
//                 <div className="flex flex-col gap-2 ml-4">
//                   {factura.archivoFacturaPdf && (
//                     <Button size="sm" variant="outline" onClick={() => handleDownload(factura)} 
//                             className="border-blue-300 text-blue-700 hover:bg-blue-50 flex items-center gap-1">
//                       <Download size={14} />
//                       Descargar
//                     </Button>
//                   )}
                  
//                   {factura.archivoFacturaPdf && factura.paciente.email && (
//                     <Button size="sm" variant="outline" onClick={() => handleSendEmail(factura)}
//                             className="border-green-300 text-green-700 hover:bg-green-50 flex items-center gap-1">
//                       <Mail size={14} />
//                       Enviar Email
//                     </Button>
//                   )}
                  
//                   <Button size="sm" variant="outline" onClick={() => handleEdit(factura)} 
//                           className="border-gray-300 hover:bg-gray-100 flex items-center gap-1">
//                     <Edit size={14} />
//                     Editar
//                   </Button>
                  
//                   <Button size="sm" variant="destructive" onClick={() => handleDelete(factura.id)} 
//                           className="hover:bg-red-600 flex items-center gap-1">
//                     <Trash2 size={14} />
//                     Eliminar
//                   </Button>
//                 </div>
//               </div>
//             </CardContent>
//           </Card>
//         ))}
        
//         {facturasFiltradas.length === 0 && (
//           <Card className="bg-white shadow-sm border border-gray-200">
//             <CardContent className="pt-6 text-center py-12">
//               <p className="text-gray-500">No se encontraron facturas</p>
//               <p className="text-sm text-gray-400 mt-2">
//                 {filtroPaciente || filtroEstado ? 'Intenta cambiar los filtros de búsqueda' : 'Crea tu primera factura haciendo clic en "Nueva Factura"'}
//               </p>
//             </CardContent>
//           </Card>
//         )}
//       </div>
//     </div>
//   )
// }

// app/dashboard/factura/page.tsx

// app/dashboard/factura/page.tsx

'use client'

import { useState, useEffect } from 'react'
import { Button } from '../../../components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { 
  Trash2, Edit, Download, Plus, Mail, Calculator, 
  Search, RefreshCw, FileText, DollarSign, User,
  Phone, ChevronDown, ChevronUp, Activity
} from 'lucide-react'

// Tipos
type EstadoFactura = 'COMPLETADO' | 'PENDIENTE' | 'CANCELADO'

interface Factura {
  id: string
  monto: number | string
  fechaEmision: string
  metodoPago?: string
  estado: EstadoFactura
  archivoFacturaPdf?: string
  paciente: {
    id: string
    nombres: string
    apellidos: string
    dni: string
    email?: string
    telefono?: string
  }
  examenOdontologico?: {
    id: string
    diagnostico?: string
    presupuesto?: number
    planTratamiento?: {
      descripcion?: string
      costoTotal?: number
    }
  } | null
  evolucionPaciente?: {
    id: string
    tratamientoRealizado?: string
    aCuenta: number
    saldo: number
  } | null
}

interface Paciente {
  id: string
  nombres: string
  apellidos: string
  dni: string
  email?: string
  telefono?: string
}

interface ExamenOdontologico {
  id: string
  diagnostico?: string
  presupuesto?: number
  planTratamiento?: {
    descripcion?: string
    costoTotal?: number
  }
}

interface EvolucionPaciente {
  id: string
  tratamientoRealizado?: string
  aCuenta: number
  saldo: number
}

export default function FacturasPage() {
  const [facturas, setFacturas] = useState<Factura[]>([])
  const [pacientes, setPacientes] = useState<Paciente[]>([])
  const [examenes, setExamenes] = useState<ExamenOdontologico[]>([])
  const [evoluciones, setEvoluciones] = useState<EvolucionPaciente[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set())

  // Filtros
  const [filtroEstado, setFiltroEstado] = useState('')
  const [filtroPaciente, setFiltroPaciente] = useState('')

  // Form data
  const [formData, setFormData] = useState({
    idPaciente: '',
    idExamenesOdontologico: '',
    idEvolucionPaciente: '',
    montoBase: '',
    aplicarIgv: false,
    metodoPago: '',
    estado: 'PENDIENTE' as EstadoFactura,
    servicios: ''
  })

  // Estados para cálculos
  const [montoCalculado, setMontoCalculado] = useState(0)
  const [igvCalculado, setIgvCalculado] = useState(0)
  const [totalCalculado, setTotalCalculado] = useState(0)

  useEffect(() => {
    cargarFacturas()
    cargarPacientes()
  }, [])

  useEffect(() => {
    if (formData.idPaciente) {
      cargarExamenes(formData.idPaciente)
      cargarEvoluciones(formData.idPaciente)
    }
  }, [formData.idPaciente])

  useEffect(() => {
    calcularMontos()
  }, [formData.montoBase, formData.aplicarIgv, formData.idExamenesOdontologico, formData.idEvolucionPaciente])

  const calcularMontos = () => {
    let baseCalculada = parseFloat(formData.montoBase) || 0

    if (!formData.montoBase && (formData.idExamenesOdontologico || formData.idEvolucionPaciente)) {
      const examen = examenes.find(e => e.id === formData.idExamenesOdontologico)
      const evolucion = evoluciones.find(e => e.id === formData.idEvolucionPaciente)
      baseCalculada = (examen?.presupuesto || 0) + (evolucion?.aCuenta || 0) + (evolucion?.saldo || 0)
    }

    const igv = formData.aplicarIgv ? baseCalculada * 0.18 : 0
    const total = baseCalculada + igv

    setMontoCalculado(baseCalculada)
    setIgvCalculado(igv)
    setTotalCalculado(total)
  }

  const cargarFacturas = async () => {
    try {
      const res = await fetch('/api/facturas')
      if (!res.ok) throw new Error('Error cargando facturas')
      const data = await res.json()
      setFacturas(data)
    } catch (error) {
      console.error('Error cargando facturas:', error)
    } finally {
      setLoading(false)
    }
  }

  const cargarPacientes = async () => {
    try {
      const res = await fetch('/api/pacientes-get-factura')
      if (!res.ok) throw new Error('Error cargando pacientes')
      const data = await res.json()
      setPacientes(data)
    } catch (error) {
      console.error('Error cargando pacientes:', error)
      setPacientes([])
    }
  }

  const cargarExamenes = async (idPaciente: string) => {
    try {
      const res = await fetch(`/api/examenes-odontologicos/${idPaciente}`)
      if (res.ok) {
        const data = await res.json()
        setExamenes(data)
      }
    } catch (error) {
      console.error('Error cargando exámenes:', error)
      setExamenes([])
    }
  }

  const cargarEvoluciones = async (idPaciente: string) => {
    try {
      const res = await fetch(`/api/evolucion-pacientes/${idPaciente}`)
      if (res.ok) {
        const data = await res.json()
        setEvoluciones(data)
      }
    } catch (error) {
      console.error('Error cargando evoluciones:', error)
      setEvoluciones([])
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const url = editingId ? `/api/facturas/${editingId}` : '/api/facturas'
      const method = editingId ? 'PUT' : 'POST'
      const bodyData = {
        ...formData,
        monto: totalCalculado.toString(),
        montoBase: montoCalculado.toString(),
        igvCalculado: igvCalculado.toString(),
        idExamenesOdontologico: formData.idExamenesOdontologico || null,
        idEvolucionPaciente: formData.idEvolucionPaciente || null
      }
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bodyData)
      })
      if (res.ok) {
        await cargarFacturas()
        resetForm()
      } else {
        const error = await res.json()
        alert('Error: ' + error.error)
      }
    } catch (error) {
      console.error('Error:', error)
      alert('Error al procesar factura')
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (factura: Factura) => {
    setFormData({
      idPaciente: factura.paciente.id,
      idExamenesOdontologico: factura.examenOdontologico?.id || '',
      idEvolucionPaciente: factura.evolucionPaciente?.id || '',
      montoBase: (typeof factura.monto === 'number' ? factura.monto : parseFloat(factura.monto || '0')).toString(),
      aplicarIgv: false,
      metodoPago: factura.metodoPago || '',
      estado: factura.estado,
      servicios: ''
    })
    setEditingId(factura.id)
    setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar esta factura?')) return
    setLoading(true)
    try {
      const res = await fetch(`/api/facturas/${id}`, { method: 'DELETE' })
      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || 'Error al eliminar factura')
      }
      await cargarFacturas()
    } catch (error) {
      console.error('Error:', error)
      alert('Error al eliminar factura: ' + (error as Error).message)
    } finally {
      setLoading(false)
    }
  }

  const handleDownload = async (factura: Factura) => {
    if (!factura.archivoFacturaPdf) {
      alert('No hay PDF disponible')
      return
    }
    try {
      window.open(factura.archivoFacturaPdf, '_blank')
    } catch (error) {
      console.error('Error abriendo PDF:', error)
    }
  }

  const handleSendEmail = async (factura: Factura) => {
    const email = prompt(`Enviar factura por email a:`, factura.paciente.email || '')
    if (!email) return

    setLoading(true)
    try {
      const res = await fetch(`/api/facturas/${factura.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ emailDestino: email })
      })
      
      if (res.ok) {
        const result = await res.json()
        alert(`Factura enviada correctamente a: ${result.emailEnviadoA}`)
      } else {
        const error = await res.json()
        alert('Error enviando email: ' + error.error)
      }
    } catch (error) {
      console.error('Error:', error)
      alert('Error enviando email')
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setFormData({
      idPaciente: '',
      idExamenesOdontologico: '',
      idEvolucionPaciente: '',
      montoBase: '',
      aplicarIgv: false,
      metodoPago: '',
      estado: 'PENDIENTE',
      servicios: ''
    })
    setEditingId(null)
    setShowForm(false)
    setExamenes([])
    setEvoluciones([])
    setMontoCalculado(0)
    setIgvCalculado(0)
    setTotalCalculado(0)
  }

  const toggleCardExpansion = (facturaId: string) => {
    const newExpanded = new Set(expandedCards)
    if (newExpanded.has(facturaId)) {
      newExpanded.delete(facturaId)
    } else {
      newExpanded.add(facturaId)
    }
    setExpandedCards(newExpanded)
  }

  const LoadingSpinner = ({ size = "h-8 w-8" }: { size?: string }) => (
    <div className="flex items-center justify-center">
      <div className={`animate-spin rounded-full ${size} border-b-2 border-slate-800`}></div>
    </div>
  )

  const facturasFiltradas = facturas.filter(factura => {
    const matchEstado = filtroEstado === '' || filtroEstado === 'TODOS' || factura.estado === filtroEstado
    const matchPaciente = !filtroPaciente || 
      `${factura.paciente.nombres} ${factura.paciente.apellidos}`.toLowerCase().includes(filtroPaciente.toLowerCase()) ||
      factura.paciente.dni.includes(filtroPaciente)
    return matchEstado && matchPaciente
  })

  if (loading && facturas.length === 0) {
    return (
      <div className="w-full h-full flex items-center justify-center min-h-screen">
        <div className="text-center">
          <LoadingSpinner size="h-12 w-12" />
          <span className="ml-4 text-lg text-slate-700">Cargando facturas...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full h-full overflow-auto">
      <div className="w-full max-w-6xl mx-auto p-2 sm:p-3 lg:p-4 space-y-3 lg:space-y-4">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-slate-200">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-br from-slate-500/20 to-slate-600/20 rounded-lg">
              <FileText className="h-5 w-5 text-slate-600" />
            </div>
            <div>
              <h1 className="text-xl lg:text-2xl font-bold text-slate-900">Gestión de Facturas</h1>
              <p className="text-xs sm:text-sm text-slate-600">Administra las facturas de la clínica</p>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
            <button
              onClick={() => cargarFacturas()}
              className="inline-flex items-center justify-center space-x-2 bg-slate-100 text-slate-700 px-3 py-2 rounded-xl hover:bg-slate-200 transition-colors font-medium text-sm"
              title="Actualizar facturas"
            >
              <RefreshCw className="h-4 w-4" />
              <span className="hidden sm:inline">Actualizar</span>
            </button>
            
            <button
              onClick={() => setShowForm(true)}
              className="inline-flex items-center justify-center space-x-2 bg-gradient-to-r from-slate-800 to-slate-700 text-white px-3 py-2 lg:px-4 lg:py-2.5 rounded-xl hover:from-slate-700 hover:to-slate-600 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-[1.02] font-medium text-sm"
            >
              <Plus className="h-4 w-4" />
              <span>Nueva Factura</span>
            </button>
          </div>
        </div>

        {/* Filtros */}
        <div className="bg-white rounded-xl lg:rounded-2xl shadow-sm border border-slate-200/60 p-3 lg:p-5">
          <div className="flex flex-col sm:flex-row gap-3 lg:gap-4">
            <div className="relative flex-1">
              <Search className="h-4 w-4 text-slate-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              <input
                type="text"
                placeholder="Buscar por paciente o DNI..."
                value={filtroPaciente}
                onChange={(e) => setFiltroPaciente(e.target.value)}
                className="pl-9 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-slate-500 outline-none w-full text-sm transition-colors duration-200"
              />
            </div>
            
            <div className="w-full sm:w-48">
              <Select value={filtroEstado} onValueChange={setFiltroEstado}>
                <SelectTrigger className="border-slate-300 rounded-lg focus:border-slate-500 text-sm">
                  <SelectValue placeholder="Filtrar por estado" />
                </SelectTrigger>
                <SelectContent className="border-slate-200">
                  <SelectItem value="TODOS">Todos los estados</SelectItem>
                  <SelectItem value="PENDIENTE">Pendiente</SelectItem>
                  <SelectItem value="COMPLETADO">Completado</SelectItem>
                  <SelectItem value="CANCELADO">Cancelado</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Formulario */}
        {showForm && (
          <div className="bg-white rounded-xl lg:rounded-2xl shadow-sm border border-slate-200/60 overflow-hidden">
            <div className="px-3 lg:px-5 py-3 lg:py-4 border-b border-slate-100 bg-gradient-to-r from-slate-50/50 to-slate-50/30">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-gradient-to-br from-slate-500/20 to-slate-600/20 rounded-lg">
                    <Calculator className="h-4 w-4 text-slate-600" />
                  </div>
                  <div>
                    <h3 className="text-sm lg:text-base font-bold text-slate-900">
                      {editingId ? 'Editar' : 'Nueva'} Factura
                    </h3>
                    <p className="text-xs text-slate-600">Complete la información de la factura</p>
                  </div>
                </div>
                <button
                  onClick={resetForm}
                  className="text-slate-400 hover:text-slate-600 transition-colors"
                >
                  ✕
                </button>
              </div>
            </div>
            
            <div className="p-3 lg:p-5">
              <form onSubmit={handleSubmit} className="space-y-4 lg:space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 lg:gap-4">
                  {/* Paciente */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-slate-700 mb-2">Paciente *</label>
                    <Select value={formData.idPaciente} onValueChange={(value) => setFormData({ ...formData, idPaciente: value })}>
                      <SelectTrigger className="border-slate-300 rounded-lg">
                        <SelectValue placeholder="Seleccionar paciente" />
                      </SelectTrigger>
                      <SelectContent>
                        {pacientes.map(paciente => (
                          <SelectItem key={paciente.id} value={paciente.id} className="hover:bg-slate-50">
                            {paciente.nombres} {paciente.apellidos} - {paciente.dni}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Examen Odontológico */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Examen Odontológico</label>
                    <Select 
                      value={formData.idExamenesOdontologico} 
                      onValueChange={(value) => setFormData({ 
                        ...formData, 
                        idExamenesOdontologico: value === 'ninguno' ? '' : value 
                      })}
                      disabled={!formData.idPaciente}
                    >
                      <SelectTrigger className="border-slate-300 rounded-lg">
                        <SelectValue placeholder="Seleccionar examen" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ninguno">Ninguno</SelectItem>
                        {examenes.map(examen => (
                          <SelectItem key={examen.id} value={examen.id}>
                            {examen.diagnostico ? examen.diagnostico.substring(0, 40) + '...' : 'Examen sin diagnóstico'}
                            {examen.presupuesto ? ` - S/ ${Number(examen.presupuesto).toFixed(2)}` : ''}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Evolución Paciente */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Evolución del Paciente</label>
                    <Select 
                      value={formData.idEvolucionPaciente} 
                      onValueChange={(value) => setFormData({ 
                        ...formData, 
                        idEvolucionPaciente: value === 'ninguno' ? '' : value 
                      })}
                      disabled={!formData.idPaciente}
                    >
                      <SelectTrigger className="border-slate-300 rounded-lg">
                        <SelectValue placeholder="Seleccionar evolución" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ninguno">Ninguno</SelectItem>
                        {evoluciones.map(evolucion => (
                          <SelectItem key={evolucion.id} value={evolucion.id}>
                            {evolucion.tratamientoRealizado ? evolucion.tratamientoRealizado.substring(0, 40) + '...' : 'Tratamiento'} 
                            - S/ {Number(evolucion.aCuenta + evolucion.saldo).toFixed(2)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Monto Base */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Monto Base (Opcional)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.montoBase}
                      onChange={(e) => setFormData({ ...formData, montoBase: e.target.value })}
                      placeholder="Calcular automáticamente"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-slate-500 outline-none text-sm transition-colors duration-200"
                    />
                    <p className="text-xs text-slate-500 mt-1">
                      Si está vacío, se calculará automáticamente
                    </p>
                  </div>

                  {/* Aplicar IGV */}
                  <div className="flex items-center space-x-3 pt-6">
                    <Checkbox 
                      id="aplicarIgv"
                      checked={formData.aplicarIgv}
                      onCheckedChange={(checked) => setFormData({ ...formData, aplicarIgv: !!checked })}
                    />
                    <label htmlFor="aplicarIgv" className="text-sm font-medium text-slate-700">
                      Aplicar IGV (18%)
                    </label>
                  </div>

                  {/* Método de Pago */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Método de Pago</label>
                    <Select value={formData.metodoPago} onValueChange={(value) => setFormData({ ...formData, metodoPago: value })}>
                      <SelectTrigger className="border-slate-300 rounded-lg">
                        <SelectValue placeholder="Seleccionar método" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Efectivo">Efectivo</SelectItem>
                        <SelectItem value="Tarjeta de Débito">Tarjeta de Débito</SelectItem>
                        <SelectItem value="Tarjeta de Crédito">Tarjeta de Crédito</SelectItem>
                        <SelectItem value="Transferencia Bancaria">Transferencia Bancaria</SelectItem>
                        <SelectItem value="Yape">Yape</SelectItem>
                        <SelectItem value="Plin">Plin</SelectItem>
                        <SelectItem value="Otro">Otro</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Estado */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Estado</label>
                    <Select value={formData.estado} onValueChange={(value: EstadoFactura) => setFormData({ ...formData, estado: value })}>
                      <SelectTrigger className="border-slate-300 rounded-lg">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="PENDIENTE">Pendiente</SelectItem>
                        <SelectItem value="COMPLETADO">Completado</SelectItem>
                        <SelectItem value="CANCELADO">Cancelado</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Descripción de Servicios */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Descripción de Servicios Adicionales</label>
                  <textarea
                    className="w-full min-h-[80px] lg:min-h-[100px] p-3 border border-slate-300 rounded-lg resize-y focus:ring-2 focus:ring-slate-500 focus:border-slate-500 outline-none text-sm transition-colors duration-200"
                    value={formData.servicios}
                    onChange={(e) => setFormData({ ...formData, servicios: e.target.value })}
                    placeholder="Descripción adicional de servicios realizados..."
                  />
                </div>

                {/* Resumen de Cálculos */}
                <div className="bg-slate-50 p-3 lg:p-4 rounded-lg border border-slate-200">
                  <h3 className="font-semibold text-slate-800 mb-3 text-sm lg:text-base">Resumen de Montos:</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-sm">
                    <div className="bg-white p-3 rounded-lg border border-slate-200">
                      <span className="text-slate-600 text-xs">Subtotal:</span>
                      <div className="font-bold text-base lg:text-lg text-slate-900">S/ {Number(montoCalculado).toFixed(2)}</div>
                    </div>
                    {formData.aplicarIgv && (
                      <div className="bg-white p-3 rounded-lg border border-slate-200">
                        <span className="text-slate-600 text-xs">IGV (18%):</span>
                        <div className="font-bold text-base lg:text-lg text-slate-900">S/ {Number(igvCalculado).toFixed(2)}</div>
                      </div>
                    )}
                    <div className="bg-slate-800 text-white p-3 rounded-lg sm:col-span-2 lg:col-span-1">
                      <span className="text-slate-200 text-xs">Total a Pagar:</span>
                      <div className="font-bold text-lg lg:text-xl">S/ {Number(totalCalculado).toFixed(2)}</div>
                    </div>
                  </div>
                </div>

                {/* Botones */}
                <div className="flex flex-col sm:flex-row gap-3 justify-end pt-4 border-t border-slate-200">
                  <button 
                    type="button" 
                    onClick={resetForm} 
                    className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors font-medium text-sm"
                  >
                    Cancelar
                  </button>
                  <button 
                    type="submit" 
                    disabled={loading} 
                    className="px-4 py-2 bg-gradient-to-r from-slate-800 to-slate-700 text-white rounded-lg hover:from-slate-700 hover:to-slate-600 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-[1.02] font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Procesando...' : editingId ? 'Actualizar' : 'Crear Factura'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}


      {/* Lista de Facturas */}
      <div className="space-y-4">
        {facturasFiltradas.map(factura => (
          <Card key={factura.id} className="bg-white shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
            <CardContent className="pt-6">
              <div className="flex justify-between items-start">
                <div className="space-y-3 flex-1">
                  <div className="flex items-center gap-3 flex-wrap">
                    <h3 className="font-semibold text-gray-800">
                      {factura.paciente.nombres} {factura.paciente.apellidos}
                    </h3>
                    <Badge variant={
                      factura.estado === 'COMPLETADO' ? 'default' :
                      factura.estado === 'PENDIENTE' ? 'secondary' : 'destructive'
                    } className="rounded-full">
                      {factura.estado}
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                    <div>
                      <p><strong>DNI:</strong> {factura.paciente.dni}</p>
                      {factura.paciente.email && <p><strong>Email:</strong> {factura.paciente.email}</p>}
                      {factura.paciente.telefono && <p><strong>Teléfono:</strong> {factura.paciente.telefono}</p>}
                    </div>
                    <div>
                      <p><strong>Fecha:</strong> {new Date(factura.fechaEmision).toLocaleDateString('es-PE')}</p>
                      {factura.metodoPago && <p><strong>Método:</strong> {factura.metodoPago}</p>}
                    </div>
                  </div>

                  {factura.examenOdontologico && (
                    <div className="bg-blue-50 p-3 rounded border border-blue-200">
                      <h4 className="font-medium text-blue-800 mb-2">Examen Odontológico:</h4>
                      {factura.examenOdontologico.diagnostico && (
                        <p className="text-sm text-blue-700">
                          <strong>Diagnóstico:</strong> {factura.examenOdontologico.diagnostico}
                        </p>
                      )}
                      {factura.examenOdontologico.presupuesto && (
                        <p className="text-sm text-blue-700">
                          <strong>Presupuesto:</strong> S/ {Number(factura.examenOdontologico.presupuesto).toFixed(2)}
                        </p>
                      )}
                    </div>
                  )}

                  {factura.evolucionPaciente && (
                    <div className="bg-purple-50 p-3 rounded border border-purple-200">
                      <h4 className="font-medium text-purple-800 mb-2">Evolución del Paciente:</h4>
                      {factura.evolucionPaciente.tratamientoRealizado && (
                        <p className="text-sm text-purple-700 mb-2">
                          <strong>Tratamiento:</strong> {factura.evolucionPaciente.tratamientoRealizado}
                        </p>
                      )}
                      <div className="flex gap-4 text-sm">
                        <span className="text-purple-700">
                          <strong>A cuenta:</strong> S/ {Number(factura.evolucionPaciente.aCuenta).toFixed(2)}
                        </span>
                        <span className="text-purple-700">
                          <strong>Saldo:</strong> S/ {Number(factura.evolucionPaciente.saldo).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-2 border-t">
                    <p className="text-2xl font-bold text-green-600">
                      S/ {Number(factura.monto || 0).toFixed(2)}
                    </p>
                  </div>
                </div>

                {/* Botones de Acción */}
                <div className="flex flex-col gap-2 ml-4">
                  {factura.archivoFacturaPdf && (
                    <Button size="sm" variant="outline" onClick={() => handleDownload(factura)} 
                            className="border-blue-300 text-blue-700 hover:bg-blue-50 flex items-center gap-1">
                      <Download size={14} />
                      Descargar
                    </Button>
                  )}
                  
                  {factura.archivoFacturaPdf && factura.paciente.email && (
                    <Button size="sm" variant="outline" onClick={() => handleSendEmail(factura)}
                            className="border-green-300 text-green-700 hover:bg-green-50 flex items-center gap-1">
                      <Mail size={14} />
                      Enviar Email
                    </Button>
                  )}
                  
                  <Button size="sm" variant="outline" onClick={() => handleEdit(factura)} 
                          className="border-gray-300 hover:bg-gray-100 flex items-center gap-1">
                    <Edit size={14} />
                    Editar
                  </Button>
                  
                  <Button size="sm" variant="destructive" onClick={() => handleDelete(factura.id)} 
                          className="hover:bg-red-600 flex items-center gap-1">
                    <Trash2 size={14} />
                    Eliminar
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        
        {facturasFiltradas.length === 0 && (
          <Card className="bg-white shadow-sm border border-gray-200">
            <CardContent className="pt-6 text-center py-12">
              <p className="text-gray-500">No se encontraron facturas</p>
              <p className="text-sm text-gray-400 mt-2">
                {filtroPaciente || filtroEstado ? 'Intenta cambiar los filtros de búsqueda' : 'Crea tu primera factura haciendo clic en "Nueva Factura"'}
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  </div>
  )
}