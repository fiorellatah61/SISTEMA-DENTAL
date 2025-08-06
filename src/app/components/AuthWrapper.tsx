"use client"
import { useUser } from "@clerk/nextjs"
import { useEffect, useState } from "react"
import { Loader2, AlertTriangle, Mail, Shield } from "lucide-react"

export default function AuthWrapper({ children }: { children: React.ReactNode }) {
  const { user, isLoaded } = useUser()
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null)
  const [checking, setChecking] = useState(false)

  useEffect(() => {
    if (isLoaded && user) {
      checkEmailAuthorization(user.primaryEmailAddress?.emailAddress || "")
    } else if (isLoaded && !user) {
      // Si no hay usuario logueado, permitir acceso (para páginas públicas)
      setIsAuthorized(true)
    }
  }, [isLoaded, user])

  const checkEmailAuthorization = async (email: string) => {
    if (!email) {
      setIsAuthorized(false)
      return
    }

    try {
      setChecking(true)
      const response = await fetch('/api/configuracion/check-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      })

      const data = await response.json()
      setIsAuthorized(data.authorized)
    } catch (error) {
      console.error('Error verificando autorización:', error)
      setIsAuthorized(false)
    } finally {
      setChecking(false)
    }
  }

  // Mostrar loading mientras carga
  if (!isLoaded || (user && isAuthorized === null) || checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="bg-white p-8 rounded-lg shadow-lg">
            <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-blue-600" />
            <p className="text-gray-600 text-lg">Verificando acceso al sistema...</p>
          </div>
        </div>
      </div>
    )
  }

  // Si hay usuario pero no está autorizado
  if (user && !isAuthorized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="mb-6">
            <AlertTriangle className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <Shield className="h-8 w-8 text-gray-400 mx-auto" />
          </div>
          
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Acceso Denegado</h1>
          
          <div className="mb-6">
            <div className="flex items-center justify-center mb-3">
              <Mail className="h-5 w-5 text-gray-400 mr-2" />
              <span className="text-sm text-gray-600">Email actual:</span>
            </div>
            <div className="bg-gray-100 rounded-lg p-3 mb-4">
              <strong className="text-gray-800">{user?.primaryEmailAddress?.emailAddress}</strong>
            </div>
            <p className="text-gray-600">
              Tu email no está autorizado para acceder al sistema dental.
            </p>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <p className="text-yellow-800 text-sm">
              <strong>¿Necesitas acceso?</strong><br />
              Contacta al administrador del sistema para que agregue tu email a la lista de usuarios autorizados.
            </p>
          </div>

          <div className="space-y-3">
            <button
              onClick={() => window.location.reload()}
              className="w-full bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Verificar nuevamente
            </button>
            <button
              onClick={() => {
                // Redirigir a clerk sign out
                window.location.href = '/sign-out'
              }}
              className="w-full bg-gray-100 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Cambiar cuenta
            </button>
          </div>

          <div className="mt-6 text-xs text-gray-500">
            Sistema de Gestión Dental - Control de Acceso
          </div>
        </div>
      </div>
    )
  }

  // Si está autorizado o no hay usuario, mostrar la aplicación
  return <>{children}</>
}