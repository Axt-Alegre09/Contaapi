import { useState } from 'react'
import { X, UserPlus, Mail, Shield } from 'lucide-react'
import { invitacionesServicio } from '../../servicios/invitacionesServicio'

export function ModalInvitarUsuario({ empresaId, onCerrar, onInvitado }) {
  const [email, setEmail] = useState('')
  const [rol, setRol] = useState('contador')
  const [cargando, setCargando] = useState(false)
  const [error, setError] = useState(null)
  const [exito, setExito] = useState(false)
  const [tokenGenerado, setTokenGenerado] = useState(null)

  const roles = [
    { value: 'admin', label: 'Administrador', descripcion: 'Acceso completo excepto eliminar la empresa' },
    { value: 'contador', label: 'Contador', descripcion: 'Gestión contable completa' },
    { value: 'asistente', label: 'Asistente', descripcion: 'Permisos limitados, requiere supervisión' },
    { value: 'solo_lectura', label: 'Solo Lectura', descripcion: 'Solo puede ver información' }
  ]

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setExito(false)

    // Validaciones
    if (!email || !email.includes('@')) {
      setError('Por favor ingresa un email válido')
      return
    }

    try {
      setCargando(true)
      const invitacion = await invitacionesServicio.crearInvitacion(empresaId, email, rol)
      
      setExito(true)
      setTokenGenerado(invitacion.token)
      
      // Notificar al padre
      onInvitado()

      // Cerrar modal después de 3 segundos
      setTimeout(() => {
        onCerrar()
      }, 3000)
      
    } catch (err) {
      console.error('Error al crear invitación:', err)
      setError(err.message || 'Error al crear la invitación')
    } finally {
      setCargando(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <UserPlus className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Invitar Usuario</h2>
              <p className="text-sm text-gray-600">Agrega un nuevo miembro al equipo</p>
            </div>
          </div>
          <button
            onClick={onCerrar}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Contenido */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email del usuario
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="usuario@ejemplo.com"
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
                disabled={cargando || exito}
              />
            </div>
          </div>

          {/* Rol */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Rol
            </label>
            <div className="space-y-2">
              {roles.map((rolOption) => (
                <label
                  key={rolOption.value}
                  className={`flex items-start gap-3 p-4 border-2 rounded-lg cursor-pointer transition-all ${
                    rol === rolOption.value
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="rol"
                    value={rolOption.value}
                    checked={rol === rolOption.value}
                    onChange={(e) => setRol(e.target.value)}
                    className="mt-1"
                    disabled={cargando || exito}
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <Shield className="w-4 h-4 text-gray-600" />
                      <span className="font-medium text-gray-900">{rolOption.label}</span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{rolOption.descripcion}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Mensajes de error/éxito */}
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {exito && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm text-green-700 font-medium mb-2">
                ✅ Invitación creada exitosamente
              </p>
              <p className="text-xs text-green-600 mb-2">
                Link de invitación (copia y envía por WhatsApp/email):
              </p>
              <div className="bg-white p-2 rounded border border-green-300 break-all text-xs font-mono">
                {`${window.location.origin}/invitacion/${tokenGenerado}`}
              </div>
            </div>
          )}

          {/* Botones */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onCerrar}
              className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              disabled={cargando}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={cargando || exito}
            >
              {cargando ? 'Enviando...' : exito ? '✓ Enviado' : 'Enviar Invitación'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}