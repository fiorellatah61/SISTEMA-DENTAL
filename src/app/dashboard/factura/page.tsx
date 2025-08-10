// // app/dashboard/facturas/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { Button } from '../../../components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Trash2, Edit, Download, Plus } from 'lucide-react'

// Tipos corregidos
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
  }
}

interface Paciente {
  id: string
  nombres: string
  apellidos: string
  dni: string
}

export default function FacturasPage() {
  const [facturas, setFacturas] = useState<Factura[]>([])
  const [pacientes, setPacientes] = useState<Paciente[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)

  // Filtros
  const [filtroEstado, setFiltroEstado] = useState('')
  const [filtroPaciente, setFiltroPaciente] = useState('')

  // Form data
  const [formData, setFormData] = useState({
    idPaciente: '',
    monto: '',
    metodoPago: '',
    estado: 'PENDIENTE' as EstadoFactura,
    servicios: ''
  })

  useEffect(() => {
    cargarFacturas()
    cargarPacientes()
  }, [])

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const url = editingId ? `/api/facturas/${editingId}` : '/api/facturas'
      const method = editingId ? 'PUT' : 'POST'
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          monto: parseFloat(formData.monto)
        })
      })
      if (res.ok) {
        await cargarFacturas()
        resetForm()
      } else {
        const error = await res.json()
        alert('Error: ' + error.message)
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
      monto: Number(factura.monto).toString(),
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
      window.open(factura.archivoFacturaPdf, '_blank') // Abre en nueva pestaña
    } catch (error) {
      console.error('Error abriendo PDF:', error)
    }
  }

  const resetForm = () => {
    setFormData({
      idPaciente: '',
      monto: '',
      metodoPago: '',
      estado: 'PENDIENTE',
      servicios: ''
    })
    setEditingId(null)
    setShowForm(false)
  }

  const facturasFiltradas = facturas.filter(factura => {
    const matchEstado = filtroEstado === '' || filtroEstado === 'TODOS' || factura.estado === filtroEstado
    const matchPaciente = !filtroPaciente || 
      `${factura.paciente.nombres} ${factura.paciente.apellidos}`.toLowerCase().includes(filtroPaciente.toLowerCase()) ||
      factura.paciente.dni.includes(filtroPaciente)
    return matchEstado && matchPaciente
  })

  if (loading && facturas.length === 0) {
    return <div className="p-6 text-center">Cargando facturas...</div>
  }

  return (
    <div className="p-6 max-w-7xl mx-auto bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Gestión de Facturas</h1>
        <Button onClick={() => setShowForm(true)} className="bg-green-600 text-white hover:bg-green-700 flex items-center gap-2 rounded-lg shadow-md">
          <Plus size={16} />
          Nueva Factura
        </Button>
      </div>

      <Card className="mb-6 bg-white shadow-sm border border-gray-200">
        <CardContent className="pt-6">
          <div className="flex gap-4 flex-wrap">
            <Input
              placeholder="Buscar por paciente o DNI..."
              value={filtroPaciente}
              onChange={(e) => setFiltroPaciente(e.target.value)}
              className="max-w-sm border-gray-300 rounded-md focus:border-green-600"
            />
            <Select value={filtroEstado} onValueChange={setFiltroEstado}>
              <SelectTrigger className="max-w-sm border-gray-300 rounded-md focus:border-green-600">
                <SelectValue placeholder="Filtrar por estado" />
              </SelectTrigger>
              <SelectContent className="border-gray-200">
                <SelectItem value="TODOS">Todos los estados</SelectItem>
                <SelectItem value="PENDIENTE">Pendiente</SelectItem>
                <SelectItem value="COMPLETADO">Completado</SelectItem>
                <SelectItem value="CANCELADO">Cancelado</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {showForm && (
        <Card className="mb-6 bg-white shadow-sm border border-gray-200">
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-gray-800">{editingId ? 'Editar' : 'Nueva'} Factura</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">Paciente</label>
                  <Select value={formData.idPaciente} onValueChange={(value) => setFormData({ ...formData, idPaciente: value })}>
                    <SelectTrigger className="border-gray-300 rounded-md">
                      <SelectValue placeholder="Seleccionar paciente" />
                    </SelectTrigger>
                    <SelectContent>
                      {pacientes.map(paciente => (
                        <SelectItem key={paciente.id} value={paciente.id} className="hover:bg-green-50">
                          {paciente.nombres} {paciente.apellidos} - {paciente.dni}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Monto</label>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.monto}
                    onChange={(e) => setFormData({ ...formData, monto: e.target.value })}
                    required
                    className="border-gray-300 rounded-md focus:border-green-600"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Método de Pago</label>
                  <Input
                    value={formData.metodoPago}
                    onChange={(e) => setFormData({ ...formData, metodoPago: e.target.value })}
                    placeholder="Efectivo, Tarjeta, etc."
                    className="border-gray-300 rounded-md"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Estado</label>
                  <Select value={formData.estado} onValueChange={(value: EstadoFactura) => setFormData({ ...formData, estado: value })}>
                    <SelectTrigger className="border-gray-300 rounded-md">
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
              <div>
                <label className="text-sm font-medium text-gray-700">Descripción de Servicios</label>
                <textarea
                  className="w-full min-h-[100px] p-3 border border-gray-300 rounded-md resize-y focus:border-green-600"
                  value={formData.servicios}
                  onChange={(e) => setFormData({ ...formData, servicios: e.target.value })}
                  placeholder="Describe los servicios realizados..."
                />
              </div>
              <div className="flex gap-2 justify-end">
                <Button type="button" variant="outline" onClick={resetForm} className="border-gray-300 text-gray-700 hover:bg-gray-100">
                  Cancelar
                </Button>
                <Button type="submit" disabled={loading} className="bg-green-600 text-white hover:bg-green-700 rounded-md">
                  {loading ? 'Procesando...' : editingId ? 'Actualizar' : 'Crear Factura'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="space-y-4">
        {facturasFiltradas.map(factura => (
          <Card key={factura.id} className="bg-white shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
            <CardContent className="pt-6">
              <div className="flex justify-between items-start">
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
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
                  <p className="text-sm text-gray-600">DNI: {factura.paciente.dni}</p>
                  <p className="text-lg font-bold text-green-600">S/ {Number(factura.monto).toFixed(2)}</p>
                  <p className="text-sm text-gray-600">
                    {new Date(factura.fechaEmision).toLocaleDateString('es-PE')}
                    {factura.metodoPago && ` • ${factura.metodoPago}`}
                  </p>
                </div>
                <div className="flex gap-2">
                  {factura.archivoFacturaPdf && (
                    <Button size="sm" variant="outline" onClick={() => handleDownload(factura)} className="border-gray-300 hover:bg-gray-100">
                      <Download size={16} />
                    </Button>
                  )}
                  <Button size="sm" variant="outline" onClick={() => handleEdit(factura)} className="border-gray-300 hover:bg-gray-100">
                    <Edit size={16} />
                  </Button>
                  <Button size="sm" variant="destructive" onClick={() => handleDelete(factura.id)} className="hover:bg-red-600">
                    <Trash2 size={16} />
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
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}