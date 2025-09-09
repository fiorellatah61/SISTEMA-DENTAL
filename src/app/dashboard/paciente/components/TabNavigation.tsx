// // app/dashboard/paciente/components/TabNavigation.tsx
// 'use client'
// import { useRouter, usePathname } from 'next/navigation'
// interface TabNavigationProps {
//   pacienteSeleccionado: any // El paciente seleccionado
// }
// export default function TabNavigation({ pacienteSeleccionado }: TabNavigationProps) {
//   const router = useRouter()
//   const pathname = usePathname()
//   // Definir las rutas de cada tab
//   const tabs = [
//     { id: 1, name: 'Datos de Filiación', path: '/dashboard/paciente' },
//     { id: 2, name: 'Motivo de Consulta', path: '/dashboard/paciente/Motivo-Consulta' },
//     { id: 3, name: 'Antecedentes Médicos', path: '/dashboard/paciente/antecedentes-medicos' }, // ← NUEVO TAB AGREGADO
//     { id: 4, name: 'Examen Clínico', path: '/dashboard/paciente/examen-clinico' },
//     { id: 5, name: 'Odontograma', path: '/dashboard/paciente/odontograma' },
//     { id: 6, name: 'Exámenes y Evolución', path: '/dashboard/paciente/examenes-evolucion' }
//   ]
//   // Función para navegar a un tab, llevando el DNI como parámetro
//   const navegarATab = (path: string) => {
//     if (pacienteSeleccionado) {
//       // Si hay un paciente seleccionado, pasar su DNI como query parameter
//       router.push(`${path}?dni=${pacienteSeleccionado.dni}`)
//     } else {
//       // Si no hay paciente, navegar sin parámetros
//       router.push(path)
//     }
//   }
//   return (
//     <div className="border-b border-gray-200">
//       <nav className="flex space-x-8 px-6">
//         {tabs.map((tab) => {
//           // Verificar si este tab está activo
//           const isActive = pathname === tab.path
          
//           return (
//             <button
//               key={tab.id}
//               onClick={() => navegarATab(tab.path)}
//               className={`py-3 px-1 text-sm font-medium ${
//                 isActive
//                   ? 'text-blue-600 border-b-2 border-blue-600'
//                   : 'text-gray-500 hover:text-gray-700'
//               }`}
//             >
//               {tab.id}. {tab.name}
//             </button>
//           )
//         })}
//       </nav>
//     </div>
//   )
// }


// app/dashboard/paciente/components/TabNavigation.tsx
// app/dashboard/paciente/components/TabNavigation.tsx
// app/dashboard/paciente/components/TabNavigation.tsx
'use client'
import { useRouter, usePathname } from 'next/navigation'
import { FileText, MessageCircle, Heart, Stethoscope, Grid3x3, TrendingUp, ChevronDown } from 'lucide-react'
import { useState } from 'react'

interface TabNavigationProps {
  pacienteSeleccionado: any // El paciente seleccionado
}

export default function TabNavigation({ pacienteSeleccionado }: TabNavigationProps) {
  const router = useRouter()
  const pathname = usePathname()
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  // Definir las rutas de cada tab con iconos y nombres cortos
  const tabs = [
    { 
      id: 1, 
      name: 'Datos de Filiación', 
      shortName: 'Datos', 
      path: '/dashboard/paciente',
      icon: FileText
    },
    { 
      id: 2, 
      name: 'Motivo de Consulta', 
      shortName: 'Motivo', 
      path: '/dashboard/paciente/Motivo-Consulta',
      icon: MessageCircle
    },
    { 
      id: 3, 
      name: 'Antecedentes Médicos', 
      shortName: 'Historial', 
      path: '/dashboard/paciente/antecedentes-medicos',
      icon: Heart
    },
    { 
      id: 4, 
      name: 'Examen Clínico', 
      shortName: 'Examen', 
      path: '/dashboard/paciente/examen-clinico',
      icon: Stethoscope
    },
    { 
      id: 5, 
      name: 'Odontograma', 
      shortName: 'Odonto', 
      path: '/dashboard/paciente/odontograma',
      icon: Grid3x3
    },
    { 
      id: 6, 
      name: 'Exámenes y Evolución', 
      shortName: 'Evolución', 
      path: '/dashboard/paciente/examenes-evolucion',
      icon: TrendingUp
    }
  ]

  // Función para navegar a un tab, llevando el DNI como parámetro
  const navegarATab = (path: string) => {
    setIsMenuOpen(false) // Cerrar menú al navegar
    if (pacienteSeleccionado) {
      router.push(`${path}?dni=${pacienteSeleccionado.dni}`)
    } else {
      router.push(path)
    }
  }

  const currentTab = tabs.find(tab => tab.path === pathname) || tabs[0]

  return (
    <div className="border-b border-slate-200 bg-slate-50/30">
      {/* Vista móvil - Menú desplegable para pantallas muy pequeñas (< 640px) */}
      <div className="sm:hidden relative">
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="w-full flex items-center justify-between px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-100 transition-colors duration-200"
        >
          <div className="flex items-center space-x-2">
            <currentTab.icon className="h-4 w-4 text-slate-600" />
            <span>{currentTab.id}. {currentTab.name}</span>
          </div>
          <ChevronDown className={`h-4 w-4 text-slate-600 transition-transform duration-200 ${isMenuOpen ? 'rotate-180' : ''}`} />
        </button>
        
        {isMenuOpen && (
          <div className="absolute top-full left-0 right-0 bg-white border-b border-slate-200 shadow-lg z-10">
            <div className="py-2">
              {tabs.map((tab) => {
                const isActive = pathname === tab.path
                const IconComponent = tab.icon
                
                return (
                  <button
                    key={tab.id}
                    onClick={() => navegarATab(tab.path)}
                    className={`w-full flex items-center space-x-3 px-4 py-2.5 text-sm font-medium transition-colors duration-200 ${
                      isActive
                        ? 'bg-slate-800 text-white'
                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-800'
                    }`}
                  >
                    <IconComponent className="h-4 w-4 flex-shrink-0" />
                    <span>{tab.id}. {tab.name}</span>
                  </button>
                )
              })}
            </div>
          </div>
        )}
      </div>

      {/* Vista tablet y desktop - Grid de 3x2 (≥ 640px) */}
      <div className="hidden sm:block">
        <div className="grid grid-cols-3 gap-2 p-3">
          {tabs.map((tab) => {
            const isActive = pathname === tab.path
            const IconComponent = tab.icon
            
            return (
              <button
                key={tab.id}
                onClick={() => navegarATab(tab.path)}
                className={`flex items-center justify-center space-x-2 py-3 px-3 text-sm font-medium rounded-lg transition-all duration-200 min-h-[48px] ${
                  isActive
                    ? 'bg-slate-800 text-white shadow-md'
                    : 'text-slate-600 hover:text-slate-800 hover:bg-white border border-slate-200'
                }`}
              >
                <IconComponent className="h-4 w-4 flex-shrink-0" />
                <div className="flex flex-col items-center">
                  <span className="text-sm font-medium">{tab.id}. {tab.shortName}</span>
                  <span className="text-xs opacity-75 hidden lg:block">{tab.name}</span>
                </div>
              </button>
            )
          })}
        </div>
      </div>

      <style jsx>{`
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  )
}