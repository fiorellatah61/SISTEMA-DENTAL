// app/dashboard/paciente/components/TabNavigation.tsx
'use client'
import { useRouter, usePathname } from 'next/navigation'
interface TabNavigationProps {
  pacienteSeleccionado: any // El paciente seleccionado
}
export default function TabNavigation({ pacienteSeleccionado }: TabNavigationProps) {
  const router = useRouter()
  const pathname = usePathname()
  // Definir las rutas de cada tab
  const tabs = [
    { id: 1, name: 'Datos de Filiación', path: '/dashboard/paciente' },
    { id: 2, name: 'Motivo de Consulta', path: '/dashboard/paciente/Motivo-Consulta' },
    { id: 3, name: 'Antecedentes Médicos', path: '/dashboard/paciente/antecedentes-medicos' }, // ← NUEVO TAB AGREGADO
    { id: 4, name: 'Examen Clínico', path: '/dashboard/paciente/examen-clinico' },
    { id: 5, name: 'Odontograma', path: '/dashboard/paciente/odontograma' },
    { id: 6, name: 'Exámenes y Evolución', path: '/dashboard/paciente/examenes-evolucion' }
  ]
  // Función para navegar a un tab, llevando el DNI como parámetro
  const navegarATab = (path: string) => {
    if (pacienteSeleccionado) {
      // Si hay un paciente seleccionado, pasar su DNI como query parameter
      router.push(`${path}?dni=${pacienteSeleccionado.dni}`)
    } else {
      // Si no hay paciente, navegar sin parámetros
      router.push(path)
    }
  }
  return (
    <div className="border-b border-gray-200">
      <nav className="flex space-x-8 px-6">
        {tabs.map((tab) => {
          // Verificar si este tab está activo
          const isActive = pathname === tab.path
          
          return (
            <button
              key={tab.id}
              onClick={() => navegarATab(tab.path)}
              className={`py-3 px-1 text-sm font-medium ${
                isActive
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.id}. {tab.name}
            </button>
          )
        })}
      </nav>
    </div>
  )
}