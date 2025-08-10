// src/app/dashboard/layout.tsx
'use client'

import { SignedIn, UserButton } from '@clerk/nextjs'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState, useCallback } from 'react'
import { cn } from '@/lib/utils'
import { Button } from '../../components/ui/button'
import Logo from '../components/logo'
import { 
  Menu, 
  X, 
  BarChart3, 
  Users, 
  Stethoscope, 
  ClipboardList, 
  Calendar, 
  Settings 
} from 'lucide-react'

const sidebarItems = [
  { name: 'Dashboard', href: '/dashboard', icon: BarChart3 },
  { name: 'Datos de Afiliación', href: '/dashboard/paciente', icon: Users },
  { name: 'Procedimientos', href: '/dashboard/procedimientos', icon: Stethoscope },
  { name: 'Planes de Tratamiento', href: '/dashboard/planes-tratamiento', icon: ClipboardList },
  { name: 'Citas', href: '/dashboard/citas', icon: Calendar },
  { name: 'Factura', href: '/dashboard/factura', icon: Calendar },
  { name: 'Configuración', href: '/dashboard/configuracion', icon: Settings },
]

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const pathname = usePathname()

  const toggleSidebar = useCallback(() => setSidebarOpen(prev => !prev), [])
  const closeSidebar = useCallback(() => setSidebarOpen(false), [])

  return (
    <SignedIn>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-slate-50">
        
        {/* Header con z-index alto para estar siempre encima */}
        <header className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 shadow-xl border-b border-slate-700/50 sticky top-0 z-[60]">
          <div className="px-4 sm:px-6 py-4">
            <div className="flex justify-between items-center">
              
              <div className="flex items-center space-x-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={toggleSidebar}
                  className="lg:hidden p-2 h-9 w-9 bg-slate-700/50 hover:bg-slate-600/50 text-slate-300 hover:text-emerald-400 border border-slate-600/50 hover:border-emerald-500/40 transition-colors duration-200"
                >
                  <Menu className="h-5 w-5" />
                </Button>
                
                <Link href="/" className="flex items-center">
                  <div className="bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 bg-clip-text text-transparent hover:from-emerald-300 hover:via-teal-300 hover:to-cyan-300 transition-all duration-200">
                    <Logo width={140} height={35} showText={false} />
                  </div>
                </Link>
              </div>

              <div className="flex items-center space-x-4">
                <div className="hidden sm:flex items-center space-x-3 px-4 py-2 bg-slate-800/60 rounded-xl border border-slate-600/30 backdrop-blur-sm">
                  <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                  <span className="text-slate-200 font-medium text-sm">Panel de Administración</span>
                </div>
                
                <div className="ring-2 ring-slate-700/30 rounded-full p-0.5 hover:ring-emerald-500/50 transition-all duration-200">
                  <UserButton 
                    appearance={{
                      elements: {
                        avatarBox: "w-8 h-8"
                      }
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </header>

        <div className="flex relative">
          
          {/* Mobile Overlay optimizado */}
          {sidebarOpen && (
            <div 
              className="lg:hidden fixed inset-0 bg-black/40 z-[35] transition-opacity duration-300 backdrop-blur-sm"
              onClick={closeSidebar}
              aria-hidden="true"
            />
          )}

          {/* Sidebar completamente responsivo */}
          <aside className={cn(
            "fixed inset-y-0 left-0 z-[50] w-72 transition-transform duration-300 ease-out",
            "bg-white shadow-2xl border-r-2 border-slate-200/80",
            "lg:top-[100px] lg:z-[40]", // Más espacio desde el header en desktop
            sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
          )}>
            
            {/* Borde superior decorativo con más espacio */}
            <div className="h-10 w-full bg-gradient-to-r from-slate-800 via-emerald-500 to-slate-800 lg:hidden"></div>
            
            {/* Espaciador adicional solo en desktop */}
            <div className="hidden lg:block h-3 bg-white border-b border-slate-100/50"></div>
            
            {/* Header del sidebar responsivo */}
            <div className="px-6 py-4 bg-gradient-to-r from-slate-50/50 to-slate-50/30 border-b border-slate-100 lg:hidden">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                  <span className="text-slate-700 font-semibold text-sm">Menú</span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={closeSidebar}
                  className="h-8 w-8 p-0 hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors duration-200 rounded-lg"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
            </div>
            
            {/* Navigation totalmente responsiva */}
            <nav className="h-[calc(100vh-140px)] lg:h-[calc(100vh-170px)] overflow-y-auto p-6 pt-4 bg-white">
              <ul className="space-y-3">
                {sidebarItems.map((item) => {
                  const isActive = pathname === item.href
                  const Icon = item.icon
                  
                  return (
                    <li key={item.name}>
                      <Link
                        href={item.href}
                        onClick={closeSidebar}
                        className={cn(
                          "group flex items-center space-x-4 px-4 py-3.5 rounded-xl text-sm font-medium transition-all duration-200 relative overflow-hidden touch-manipulation",
                          isActive 
                            ? "bg-gradient-to-r from-slate-800 to-slate-700 text-white shadow-lg transform scale-[1.02]" 
                            : "text-slate-700 hover:text-slate-900 hover:bg-slate-50 active:bg-slate-100 hover:shadow-md hover:scale-[1.01]"
                        )}
                      >
                        <div className={cn(
                          "flex-shrink-0 p-2.5 rounded-lg transition-all duration-200",
                          isActive 
                            ? "bg-gradient-to-br from-emerald-500/30 to-teal-500/30 text-emerald-300 shadow-sm" 
                            : "bg-slate-100 text-slate-600 group-hover:bg-slate-200 group-hover:text-slate-700 group-hover:shadow-sm"
                        )}>
                          <Icon className="h-4 w-4" />
                        </div>
                        
                        <span className={cn(
                          "transition-all duration-200 flex-1 select-none",
                          isActive ? "font-semibold text-white" : ""
                        )}>
                          {item.name}
                        </span>
                        
                        {/* Active indicator optimizado */}
                        {isActive && (
                          <div className="absolute right-4 flex items-center space-x-1">
                            <div className="w-2 h-2 bg-gradient-to-r from-emerald-400 to-teal-400 rounded-full shadow-sm"></div>
                            <div className="w-1 h-1 bg-emerald-300 rounded-full"></div>
                          </div>
                        )}
                        
                        {/* Borde lateral activo */}
                        {isActive && (
                          <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-1.5 h-10 bg-gradient-to-b from-emerald-400 to-teal-400 rounded-r-full shadow-sm"></div>
                        )}
                        
                        {/* Efecto hover optimizado */}
                        {!isActive && (
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-slate-50/0 to-slate-50/0 group-hover:via-slate-50/50 transition-all duration-300 rounded-xl pointer-events-none"></div>
                        )}
                      </Link>
                    </li>
                  )
                })}
              </ul>
            </nav>

            {/* Footer del sidebar fijo en la parte inferior */}
            <div className="absolute bottom-0 left-0 right-0 border-t border-slate-100 bg-gradient-to-r from-slate-50/30 to-slate-50/50">
              <div className="px-6 py-3">
                <div className="flex items-center justify-center">
                  <div className="text-xs text-slate-400 font-medium bg-slate-50 px-3 py-1 rounded-full">
                    v2.1.0
                  </div>
                </div>
              </div>
              <div className="h-1 bg-gradient-to-r from-slate-200 via-emerald-300 to-slate-200"></div>
            </div>
          </aside>

          {/* Main Content responsivo */}
          <main className={cn(
            "flex-1 p-4 sm:p-6 lg:p-8 transition-all duration-300",
            "lg:ml-72" // Solo margen en desktop
          )}>
            <div className="bg-white rounded-2xl shadow-lg border border-slate-200/60 min-h-[calc(100vh-8rem)] sm:min-h-[calc(100vh-12rem)] p-4 sm:p-6 lg:p-8 relative overflow-hidden">
              {/* Borde superior decorativo */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 rounded-t-2xl"></div>
              
              {/* Contenido con animación suave */}
              <div className="relative z-10">
                {children}
              </div>
              
              {/* Decoración sutil de fondo */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-emerald-50/30 to-transparent rounded-bl-full pointer-events-none"></div>
            </div>
          </main>
        </div>
      </div>
    </SignedIn>
  )
}