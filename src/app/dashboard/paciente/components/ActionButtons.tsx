// Estos botones apareceran en todos los tabs
// app/dashboard/paciente/components/ActionButtons.tsx

'use client'
interface ActionButtonsProps {
  pacienteSeleccionado: any // El paciente seleccionado
  loading: boolean // Estado de carga
  onCancelar: () => void // Función para cancelar
  onEliminar?: () => void // Función para eliminar (opcional)
  onGuardar: () => void // Función para guardar
}
export default function ActionButtons({ 
  pacienteSeleccionado, 
  loading, 
  onCancelar, 
  onEliminar, 
  onGuardar 
}: ActionButtonsProps) {
  return (
    <div className="flex space-x-4 mt-8">
      {/* Botón Cancelar - siempre visible */}
      <button
        onClick={onCancelar}
        className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500"
      >
        Cancelar
      </button> 
      {/* Botón Eliminar - solo visible si hay paciente seleccionado y se proporciona la función */}
      {pacienteSeleccionado && onEliminar && (
        <button
          onClick={onEliminar}
          disabled={loading}
          className="px-6 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50"
        >
          {loading ? 'Eliminando...' : 'Eliminar'}
        </button>
      )}
      {/* Botón Guardar/Actualizar/Generar */}
      <button
        onClick={onGuardar}
        disabled={loading}
        className="px-6 py-2 bg-gray-800 text-white rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 disabled:opacity-50"
      >
        {loading ? 'Guardando...' : (pacienteSeleccionado ? 'Actualizar' : 'Generar')}
      </button>
    </div>
  )
}

