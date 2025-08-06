"use client"
import { useState, useEffect } from 'react'
import { Settings, Shield, Plus, X, Loader2, Mail, Trash2, CheckCircle, AlertTriangle, UserCheck } from 'lucide-react'

interface EmailAutorizado {
  id: string
  email: string
  createdAt: string
}

export default function ConfiguracionPage() {
  const [loading, setLoading] = useState(false)
  const [loadingAction, setLoadingAction] = useState<string>('')
  const [message, setMessage] = useState({ type: '', text: '' })
  const [emailsAutorizados, setEmailsAutorizados] = useState<EmailAutorizado[]>([])
  const [newEmail, setNewEmail] = useState('')

  // Cargar emails autorizados al iniciar
  useEffect(() => {
    loadEmailsAutorizados()
  }, [])

  // Función para cargar emails autorizados
  const loadEmailsAutorizados = async () => {
    try {
      setLoading(true)
      
      const response = await fetch('/api/configuracion/emails-autorizados')
      if (response.ok) {
        const emails = await response.json()
        setEmailsAutorizados(emails)
      } else {
        throw new Error('Error al cargar emails')
      }
    } catch (error) {
      console.error('Error cargando emails:', error)
      showMessage('error', 'Error al cargar los emails autorizados')
    } finally {
      setLoading(false)
    }
  }

  // Función para mostrar mensajes
  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text })
    setTimeout(() => setMessage({ type: '', text: '' }), 5000)
  }

  // Validar email
  const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  // Función para agregar email autorizado
  const handleAddEmail = async () => {
    if (!newEmail.trim()) {
      showMessage('error', 'Por favor ingresa un email')
      return
    }

    if (!isValidEmail(newEmail.trim())) {
      showMessage('error', 'Por favor ingresa un email válido')
      return
    }

    try {
      setLoadingAction('add')
      
      const response = await fetch('/api/configuracion/emails-autorizados', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: newEmail.trim().toLowerCase() }),
      })

      const data = await response.json()

      if (response.ok) {
        setEmailsAutorizados([data, ...emailsAutorizados])
        setNewEmail('')
        showMessage('success', 'Email agregado exitosamente')
      } else {
        showMessage('error', data.error || 'Error al agregar el email')
      }
    } catch (error) {
      console.error('Error agregando email:', error)
      showMessage('error', 'Error al agregar el email')
    } finally {
      setLoadingAction('')
    }
  }

  // Función para eliminar email autorizado
  const handleRemoveEmail = async (email: string) => {
    if (emailsAutorizados.length <= 1) {
      showMessage('error', 'Debe haber al menos un email autorizado')
      return
    }

    if (!confirm(`¿Estás seguro de eliminar el email "${email}"?\n\nEsta persona ya no podrá acceder al sistema.`)) {
      return
    }

    try {
      setLoadingAction(`remove-${email}`)
      
      const response = await fetch('/api/configuracion/emails-autorizados', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (response.ok) {
        setEmailsAutorizados(emailsAutorizados.filter(e => e.email !== email))
        showMessage('success', 'Email eliminado exitosamente')
      } else {
        showMessage('error', data.error || 'Error al eliminar el email')
      }
    } catch (error) {
      console.error('Error eliminando email:', error)
      showMessage('error', 'Error al eliminar el email')
    } finally {
      setLoadingAction('')
    }
  }

  // Función para manejar Enter en input de email
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleAddEmail()
    }
  }

  // Formatear fecha
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-PE', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="flex items-center">
              <Settings className="h-8 w-8 text-blue-600 mr-3" />
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Configuración del Sistema</h1>
                <p className="text-gray-600 mt-1">Administra el control de acceso a tu clínica dental</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mensaje de estado */}
      {message.text && (
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 pt-4">
          <div className={`p-4 rounded-lg flex items-center gap-3 ${
            message.type === 'success' 
              ? 'bg-green-50 text-green-800 border border-green-200' 
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}>
            {message.type === 'success' ? (
              <CheckCircle className="h-5 w-5" />
            ) : (
              <AlertTriangle className="h-5 w-5" />
            )}
            {message.text}
          </div>
        </div>
      )}

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Control de Acceso */}
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-8">
            <div className="flex items-center mb-6">
              <Shield className="h-6 w-6 text-blue-600 mr-3" />
              <h2 className="text-2xl font-bold text-gray-900">Control de Acceso</h2>
            </div>

            {/* Información importante */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
              <div className="flex items-start">
                <UserCheck className="h-6 w-6 text-blue-600 mt-0.5 mr-3" />
                <div>
                  <h3 className="text-blue-900 font-semibold text-lg mb-2">Sistema de Autorización por Email</h3>
                  <div className="text-blue-800 text-sm space-y-1">
                    <p>• Solo los emails registrados en esta lista pueden acceder al sistema</p>
                    <p>• Los usuarios deben usar Google Auth (Gmail) para iniciar sesión</p>
                    <p>• Si un email no está autorizado, se mostrará un mensaje de acceso denegado</p>
                    <p>• Agrega aquí los emails de doctores, recepcionistas y administradores</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Agregar nuevo email */}
            <div className="mb-8">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Agregar nuevo email autorizado
              </label>
              <div className="flex gap-3">
                <div className="flex-1 relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="email"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="doctor@clinicadental.com"
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    disabled={loading || loadingAction === 'add'}
                  />
                </div>
                <button
                  onClick={handleAddEmail}
                  disabled={loading || loadingAction === 'add' || !newEmail.trim()}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                >
                  {loadingAction === 'add' ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Plus className="h-4 w-4" />
                  )}
                  Agregar Email
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Ingresa el email completo (ej: usuario@gmail.com). Debe ser una cuenta de Google válida.
              </p>
            </div>

            {/* Lista de emails autorizados */}
            <div>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">
                  Emails Autorizados ({emailsAutorizados.length})
                </h3>
                <button
                  onClick={loadEmailsAutorizados}
                  disabled={loading}
                  className="text-blue-600 hover:text-blue-800 text-sm flex items-center gap-2 px-3 py-1 rounded-md hover:bg-blue-50 transition-colors"
                >
                  {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Settings className="h-4 w-4" />
                  )}
                  Actualizar Lista
                </button>
              </div>

              {loading ? (
                <div className="flex justify-center py-12">
                  <div className="text-center">
                    <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-3" />
                    <p className="text-gray-500">Cargando emails autorizados...</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  {emailsAutorizados.length === 0 ? (
                    <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-lg">
                      <Mail className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                      <h4 className="text-lg font-medium text-gray-900 mb-2">No hay emails autorizados</h4>
                      <p className="text-gray-500 mb-4">Agrega el primer email para comenzar a usar el sistema</p>
                      <div className="text-sm text-gray-400">
                        Recomendación: Agrega tu propio email primero
                      </div>
                    </div>
                  ) : (
                    emailsAutorizados.map((emailData) => (
                      <div key={emailData.id} className="flex items-center justify-between bg-gray-50 px-6 py-4 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors">
                        <div className="flex-1">
                          <div className="flex items-center gap-3">
                            <div className="bg-green-100 p-2 rounded-full">
                              <Mail className="h-4 w-4 text-green-600" />
                            </div>
                            <div>
                              <span className="text-gray-900 font-medium text-base">{emailData.email}</span>
                              <p className="text-xs text-gray-500 mt-1">
                                Autorizado desde: {formatDate(emailData.createdAt)}
                              </p>
                            </div>
                          </div>
                        </div>
                        <button
                          onClick={() => handleRemoveEmail(emailData.email)}
                          disabled={loading || loadingAction.includes('remove') || emailsAutorizados.length <= 1}
                          className="text-red-600 hover:text-red-800 hover:bg-red-50 p-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                          title={emailsAutorizados.length <= 1 ? "Debe haber al menos un email autorizado" : "Eliminar acceso"}
                        >
                          {loadingAction === `remove-${emailData.email}` ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>

            {/* Información del sistema */}
            {emailsAutorizados.length > 0 && (
              <div className="mt-8 p-6 bg-gray-50 rounded-lg border">
                <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                  <Shield className="h-5 w-5 mr-2 text-gray-600" />
                  Estado del Sistema de Seguridad
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div className="bg-white p-3 rounded border">
                    <div className="font-medium text-gray-900">Total de Emails</div>
                    <div className="text-2xl font-bold text-blue-600">{emailsAutorizados.length}</div>
                  </div>
                  <div className="bg-white p-3 rounded border">
                    <div className="font-medium text-gray-900">Estado del Sistema</div>
                    <div className="text-green-600 font-semibold flex items-center">
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Activo
                    </div>
                  </div>
                  <div className="bg-white p-3 rounded border">
                    <div className="font-medium text-gray-900">Tipo de Autenticación</div>
                    <div className="text-gray-600">Google Auth (Gmail)</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}