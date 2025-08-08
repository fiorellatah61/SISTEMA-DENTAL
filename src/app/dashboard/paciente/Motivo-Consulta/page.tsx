// app/dashboard/paciente/motivo-consulta/page.tsx
'use client'
import { useState, useEffect } from 'react'
import { usePaciente } from '../hooks/usePaciente'
import TabNavigation from '../components/TabNavigation'
import ActionButtons from '../components/ActionButtons'

export default function MotivoConsultaPage() {
  // Hook personalizado para manejar el paciente
  const {
    pacienteSeleccionado,
    buscarDni,
    setBuscarDni,
    loading,
    setLoading,
    error,
    setError,
    buscarPaciente,
    limpiarPaciente
  } = usePaciente()

  // Estados para los campos del motivo de consulta
  const [motivoConsulta, setMotivoConsulta] = useState('')

  // Estados para fecha y número de ficha (igual que en el tab 1)
  const [fechaIngreso, setFechaIngreso] = useState('')
  const [numeroFicha, setNumeroFicha] = useState('')

  // Cargar fecha actual y número de ficha al iniciar
  useEffect(() => {
    const fechaActual = new Date().toISOString().split('T')[0];
    setFechaIngreso(fechaActual);
    obtenerProximoNumeroFicha();
  }, []);

  // Cargar datos del motivo de consulta si hay paciente seleccionado
  useEffect(() => {
    if (pacienteSeleccionado) {
      cargarMotivoConsulta(pacienteSeleccionado.id);
    }
  }, [pacienteSeleccionado]);

  // Función para obtener el próximo número de ficha
  const obtenerProximoNumeroFicha = async () => {
    try {
      const response = await fetch('/api/ficha/proximo-numero');
      const data = await response.json();
      if (response.ok) {
        setNumeroFicha(data.proximoNumero);
      }
    } catch (error) {
      console.error('Error al obtener próximo número de ficha:', error);
    }
  };

  // Función para cargar el motivo de consulta existente
  const cargarMotivoConsulta = async (pacienteId: string) => {
    try {
      const response = await fetch(`/api/ficha/motivo-consulta?pacienteId=${pacienteId}`);
      const data = await response.json();
      
      if (response.ok && data.motivoConsulta) {
        setMotivoConsulta(data.motivoConsulta);
      } else {
        // Si no hay motivo de consulta, limpiar el campo
        setMotivoConsulta('');
      }
    } catch (error) {
      console.error('Error al cargar motivo de consulta:', error);
    }
  };

  // Función para guardar motivo de consulta
  const guardarMotivoConsulta = async () => {
    if (!pacienteSeleccionado) {
      setError('Primero debe seleccionar un paciente');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/ficha/motivo-consulta', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          pacienteId: pacienteSeleccionado.id,
          motivoConsulta: motivoConsulta
        }),
      });

      const data = await response.json();

      if (response.ok) {
        alert('Motivo de consulta guardado correctamente');
      } else {
        setError(data.error || 'Error al guardar motivo de consulta');
      }
    } catch (error) {
      setError('Error al guardar motivo de consulta');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Función para cancelar (limpiar formulario)
  const cancelar = () => {
    setMotivoConsulta('');
    setError('');
  };

  // Función para eliminar (opcional en este tab)
  const eliminarMotivo = async () => {
    if (!pacienteSeleccionado) return;

    const confirmar = window.confirm('¿Estás seguro de eliminar el motivo de consulta?');
    if (!confirmar) return;

    setLoading(true);
    try {
      const response = await fetch(`/api/ficha/motivo-consulta?pacienteId=${pacienteSeleccionado.id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        setMotivoConsulta('');
        alert('Motivo de consulta eliminado');
      } else {
        setError('Error al eliminar motivo de consulta');
      }
    } catch (error) {
      setError('Error al eliminar motivo de consulta');
    } finally {
      setLoading(false);
    }
  };

  return (
    // aumentado el p-6
    <div className="min-h-screen bg-gray-50  p-6">
   
      {/* Header igual que en el tab 1 */}
      
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div>  <h1 className="text-2xl font-semibold text-gray-900">CLÍNICA DENTAL SONRÍE</h1> </div>
                </div>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-600">
                N° de Ficha: 
                <input 
                  type="text" 
                  value={numeroFicha}
                  className="ml-2 border rounded px-2 py-1 w-24 bg-gray-100"
                  placeholder="000"
                  readOnly
                />
              </div>
              <div className="text-sm text-gray-600">
                Fecha de Ingreso:
                <input 
                  type="date" 
                  value={fechaIngreso}
                  className="ml-2 border rounded px-2 py-1 bg-gray-100"
                  readOnly
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Buscador de paciente igual que en tab 1 */}
        <div className="bg-white rounded-lg shadow-sm border mb-6 p-4">
          <div className="flex items-center space-x-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
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
              className="bg-gray-800 text-white px-4 py-2 rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 disabled:opacity-50 mt-6"
            >
              {loading ? 'Buscando...' : 'Buscar'}
            </button>
            <div className="text-sm text-gray-600 mt-6">
              Paciente: {pacienteSeleccionado ? `${pacienteSeleccionado.nombres} ${pacienteSeleccionado.apellidos}` : 'No seleccionado'}
            </div>
          </div>
          {error && (
            <div className="mt-2 text-red-600 text-sm">{error}</div>
          )}
        </div>

        {/* Contenedor principal con navegación de tabs */}
        <div className="bg-white rounded-lg shadow-sm border mb-6">
          {/* Navegación de tabs */}
          <TabNavigation pacienteSeleccionado={pacienteSeleccionado} />

          {/* Contenido del Tab 2 - Motivo de Consulta */}
          <div className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">2. MOTIVO DE CONSULTA</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Descripción:
                </label>
                <textarea
                  value={motivoConsulta}
                  onChange={(e) => setMotivoConsulta(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Describe el motivo de la consulta..."
                  rows={6}
                />
              </div>
            </div>

            {/* Botones de acción usando el componente reutilizable */}
            <ActionButtons
              pacienteSeleccionado={pacienteSeleccionado}
              loading={loading}
              onCancelar={cancelar}
              onEliminar={eliminarMotivo}
              onGuardar={guardarMotivoConsulta}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
