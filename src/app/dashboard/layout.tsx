// src/app/dashboard/layout.tsx
import { SignedIn, UserButton } from '@clerk/nextjs'
import Link from 'next/link'
import { redirect } from 'next/navigation'

const sidebarItems = [
  { name: 'Dashboard', href: '/dashboard', icon: '📊🦴' },
  { name: 'Datos de Afiliacion', href: '/dashboard/paciente', icon: '👥' },
  { name: 'Procedimientos', href: '/dashboard/procedimientos', icon: '🦷' },
  { name: 'Planes de Tratamiento', href: '/dashboard/planes-tratamiento', icon: '📋' },
  { name: 'Citas', href: '/dashboard/citas', icon: '📅' },
  { name: 'Configuración', href: '/dashboard/configuracion', icon: '⚙️' },
]
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <SignedIn>
      <div className="min-h-screen bg-gray-100">
        {/* Header del dashboard */}
        <header className="bg-white shadow-sm border-b">
          <div className="px-6 py-4 flex justify-between items-center">
            <Link href="/" className="text-2xl font-bold text-blue-600">
              🦷 Sonríe - Admin
            </Link>
            <div className="flex items-center space-x-4">
              <span className="text-gray-700">Panel de Administración</span>
              <UserButton />
            </div>
          </div>
        </header>

        <div className="flex">
          {/* Sidebar */}
          <aside className="w-64 bg-white shadow-sm min-h-screen">
            <nav className="p-6">
              <ul className="space-y-2">
                {sidebarItems.map((item) => (
                  <li key={item.name}>
                    <Link
                      href={item.href}
                      className="flex items-center space-x-3 px-4 py-2 text-gray-700 rounded-lg hover:bg-blue-50 hover:text-blue-600 transition-colors"
                    >
                      <span className="text-xl">{item.icon}</span>
                      <span>{item.name}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </aside>

          {/* Contenido principal */}
          <main className="flex-1 p-6">
            {children}
          </main>
        </div>
      </div>
    </SignedIn>
  )
}