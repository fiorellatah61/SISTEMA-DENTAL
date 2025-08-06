// app/dashboard/paciente/antecedentes-medicos/page.tsx
'use client'
import { useState, useEffect } from 'react'
import { usePaciente } from '../hooks/usePaciente'
import TabNavigation from '../components/TabNavigation'
import ActionButtons from '../components/ActionButtons'

export default function AntecedentesMedicosPage() {
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

  // Estados para los campos de antecedentes médicos
  const [antecedentes, setAntecedentes] = useState({
    alergias: '',
    tuberculosis: false,
    hipertension: false,
    diabetes: false,
    hepatitis: false,
    hemorragias: false,
    enfermedadesCorazon: false,
    medicamentosActuales: '',
    otros: ''
  })

  // Estados para fecha y número de ficha (igual que en los otros tabs)
  const [fechaIngreso, setFechaIngreso] = useState('')
  const [numeroFicha, setNumeroFicha] = useState('')

  // Cargar fecha actual y número de ficha al iniciar
  useEffect(() => {
    const fechaActual = new Date().toISOString().split('T')[0];
    setFechaIngreso(fechaActual);
    obtenerProximoNumeroFicha();
  }, []);

  // Cargar datos de antecedentes médicos si hay paciente seleccionado
  useEffect(() => {
    if (pacienteSeleccionado) {
      cargarAntecedentesMedicos(pacienteSeleccionado.id);
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

  // Función para cargar los antecedentes médicos existentes
  const cargarAntecedentesMedicos = async (pacienteId: string) => {
    try {
      const response = await fetch(`/api/ficha/antecedentes-medicos?pacienteId=${pacienteId}`);
      const data = await response.json();
      
      if (response.ok && data.antecedentes) {
        // Cargar los datos existentes en el estado
        setAntecedentes({
          alergias: data.antecedentes.alergias || '',
          tuberculosis: data.antecedentes.tuberculosis || false,
          hipertension: data.antecedentes.hipertension || false,
          diabetes: data.antecedentes.diabetes || false,
          hepatitis: data.antecedentes.hepatitis || false,
          hemorragias: data.antecedentes.hemorragias || false,
          enfermedadesCorazon: data.antecedentes.enfermedadesCorazon || false,
          medicamentosActuales: data.antecedentes.medicamentosActuales || '',
          otros: data.antecedentes.otros || ''
        });
      } else {
        // Si no hay antecedentes médicos, limpiar los campos
        setAntecedentes({
          alergias: '',
          tuberculosis: false,
          hipertension: false,
          diabetes: false,
          hepatitis: false,
          hemorragias: false,
          enfermedadesCorazon: false,
          medicamentosActuales: '',
          otros: ''
        });
      }
    } catch (error) {
      console.error('Error al cargar antecedentes médicos:', error);
    }
  };

  // Función para manejar cambios en los campos de texto
  const handleInputChange = (field: string, value: string) => {
    setAntecedentes(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Función para manejar cambios en los checkboxes
  const handleCheckboxChange = (field: string, checked: boolean) => {
    setAntecedentes(prev => ({
      ...prev,
      [field]: checked
    }));
  };

  // Función para guardar antecedentes médicos
  const guardarAntecedentesMedicos = async () => {
    if (!pacienteSeleccionado) {
      setError('Primero debe seleccionar un paciente');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/ficha/antecedentes-medicos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          pacienteId: pacienteSeleccionado.id,
          ...antecedentes
        }),
      });

      const data = await response.json();

      if (response.ok) {
        alert('Antecedentes médicos guardados correctamente');
      } else {
        setError(data.error || 'Error al guardar antecedentes médicos');
      }
    } catch (error) {
      setError('Error al guardar antecedentes médicos');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Función para cancelar (limpiar formulario)
  const cancelar = () => {
    setAntecedentes({
      alergias: '',
      tuberculosis: false,
      hipertension: false,
      diabetes: false,
      hepatitis: false,
      hemorragias: false,
      enfermedadesCorazon: false,
      medicamentosActuales: '',
      otros: ''
    });
    setError('');
  };

  // Función para eliminar antecedentes médicos
  const eliminarAntecedentes = async () => {
    if (!pacienteSeleccionado) return;

    const confirmar = window.confirm('¿Estás seguro de eliminar los antecedentes médicos?');
    if (!confirmar) return;

    setLoading(true);
    try {
      const response = await fetch(`/api/ficha/antecedentes-medicos?pacienteId=${pacienteSeleccionado.id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        // Limpiar el formulario después de eliminar
        setAntecedentes({
          alergias: '',
          tuberculosis: false,
          hipertension: false,
          diabetes: false,
          hepatitis: false,
          hemorragias: false,
          enfermedadesCorazon: false,
          medicamentosActuales: '',
          otros: ''
        });
        alert('Antecedentes médicos eliminados');
      } else {
        setError('Error al eliminar antecedentes médicos');
      }
    } catch (error) {
      setError('Error al eliminar antecedentes médicos');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">CLÍNICA DENTAL SONRÍE</h1>
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
        {/* Buscador de paciente igual que en los otros tabs */}
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

          {/* Contenido del Tab 3 - Antecedentes Médicos */}
          <div className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">3. ANTECEDENTES MÉDICOS</h2>
            
            <div className="space-y-6">
              {/* Campo de Alergias */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Alergias:
                </label>
                <textarea
                  value={antecedentes.alergias}
                  onChange={(e) => handleInputChange('alergias', e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Especificar alergias conocidas"
                  rows={3}
                />
              </div>

              {/* Checkboxes para condiciones médicas */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="tuberculosis"
                    checked={antecedentes.tuberculosis}
                    onChange={(e) => handleCheckboxChange('tuberculosis', e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="tuberculosis" className="ml-2 text-sm text-gray-700">
                    TBC
                  </label>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="hipertension"
                    checked={antecedentes.hipertension}
                    onChange={(e) => handleCheckboxChange('hipertension', e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="hipertension" className="ml-2 text-sm text-gray-700">
                    Hipertensión
                  </label>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="diabetes"
                    checked={antecedentes.diabetes}
                    onChange={(e) => handleCheckboxChange('diabetes', e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="diabetes" className="ml-2 text-sm text-gray-700">
                    Diabetes
                  </label>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="hepatitis"
                    checked={antecedentes.hepatitis}
                    onChange={(e) => handleCheckboxChange('hepatitis', e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="hepatitis" className="ml-2 text-sm text-gray-700">
                    Hepatitis
                  </label>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="hemorragias"
                    checked={antecedentes.hemorragias}
                    onChange={(e) => handleCheckboxChange('hemorragias', e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="hemorragias" className="ml-2 text-sm text-gray-700">
                    Hemorragias
                  </label>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="enfermedadesCorazon"
                    checked={antecedentes.enfermedadesCorazon}
                    onChange={(e) => handleCheckboxChange('enfermedadesCorazon', e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="enfermedadesCorazon" className="ml-2 text-sm text-gray-700">
                    Enfermedades del Corazón
                  </label>
                </div>
              </div>

              {/* Campo de Medicamentos Actuales */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  ¿Está tomando algún medicamento?
                </label>
                <textarea
                  value={antecedentes.medicamentosActuales}
                  onChange={(e) => handleInputChange('medicamentosActuales', e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Especificar medicamentos actuales"
                  rows={3}
                />
              </div>

              {/* Campo de Otros */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Otros:
                </label>
                <textarea
                  value={antecedentes.otros}
                  onChange={(e) => handleInputChange('otros', e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Otras condiciones médicas relevantes..."
                  rows={4}
                />
              </div>
            </div>

            {/* Botones de acción usando el componente reutilizable */}
            <ActionButtons
              pacienteSeleccionado={pacienteSeleccionado}
              loading={loading}
              onCancelar={cancelar}
              onEliminar={eliminarAntecedentes}
              onGuardar={guardarAntecedentesMedicos}
            />
          </div>
        </div>
      </div>
    </div>
  )
}