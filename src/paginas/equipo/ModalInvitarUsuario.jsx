import { useState } from 'react'
import { X, UserPlus, Mail, Shield, CheckCircle, AlertCircle, Copy, Check } from 'lucide-react'
import { invitacionesServicio } from '../../servicios/invitacionesServicio'

export function ModalInvitarUsuario({ empresaId, onCerrar, onInvitado }) {
  const [email, setEmail] = useState('')
  const [rol, setRol] = useState('contador')
  const [cargando, setCargando] = useState(false)
  const [error, setError] = useState(null)
  const [exito, setExito] = useState(false)
  const [credenciales, setCredenciales] = useState(null)
  const [copiado, setCopiado] = useState(false)

  const roles = [
    { value: 'admin', label: 'Administrador', descripcion: 'Acceso completo excepto eliminar la empresa' },
    { value: 'contador', label: 'Contador', descripcion: 'Gestión contable completa' },
    { value: 'asistente', label: 'Asistente', descripcion: 'Permisos limitados, requiere supervisión' },
    { value: 'solo_lectura', label: 'Solo Lectura', descripcion: 'Solo puede ver información' }
  ]

  const getRolLabel = (rolValue) => {
    return roles.find(r => r.value === rolValue)?.label || rolValue
  }

  const handleCopiar = async () => {
    const texto = `🎉 ¡Bienvenido a ContaAPI!

Has sido invitado como ${getRolLabel(credenciales.rol)}.

📧 Email: ${credenciales.email}
🔑 Contraseña temporal: ${credenciales.password_temporal}

🔗 Ingresa aquí: ${window.location.origin}/login

⚠️ IMPORTANTE: Por seguridad, cambia tu contraseña al iniciar sesión por primera vez.

¡Nos vemos en ContaAPI! 🚀`

    try {
      await navigator.clipboard.writeText(texto)
      setCopiado(true)
      setTimeout(() => setCopiado(false), 3000)
    } catch (err) {
      console.error('Error al copiar:', err)
      alert('No se pudo copiar. Por favor, copia manualmente.')
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    setError(null)
    setExito(false)
    setCredenciales(null)

    // Validaciones
    if (!email || !email.includes('@')) {
      setError('Por favor ingresa un email válido')
      return
    }

    setCargando(true)

    try {
      const resultado = await invitacionesServicio.crearInvitacion(empresaId, email, rol)
      
      // Guardar credenciales para mostrar
      setCredenciales({
        email: resultado.email,
        password_temporal: resultado.password_temporal,
        rol: resultado.rol
      })
      
      setExito(true)
      
      // Notificar al padre para recargar lista
      if (onInvitado) {
        onInvitado()
      }
      
    } catch (err) {
      console.error('Error al crear invitación:', err)
      setError(err.message || 'Error al crear la invitación')
    } finally {
      setCargando(false)
    }
  }

  const handleNuevaInvitacion = () => {
    setEmail('')
    setRol('contador')
    setExito(false)
    setCredenciales(null)
    setError(null)
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <UserPlus className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                {exito ? 'Usuario Creado' : 'Invitar Usuario'}
              </h2>
              <p className="text-sm text-gray-600">
                {exito ? 'Comparte estas credenciales' : 'Agrega un nuevo miembro al equipo'}
              </p>
            </div>
          </div>
          <button
            onClick={onCerrar}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            disabled={cargando}
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Contenido */}
        {!exito ? (
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
                  disabled={cargando}
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
                    } ${cargando ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <input
                      type="radio"
                      name="rol"
                      value={rolOption.value}
                      checked={rol === rolOption.value}
                      onChange={(e) => setRol(e.target.value)}
                      className="mt-1"
                      disabled={cargando}
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

            {/* Mensaje de error */}
            {error && (
              <div className="p-4 bg-red-50 border-2 border-red-200 rounded-lg">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm text-red-700 font-medium">Error</p>
                    <p className="text-sm text-red-600 mt-1">{error}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Botones */}
            <div className="flex gap-3">
              <button
                type="button"
                onClick={onCerrar}
                className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium disabled:opacity-50"
                disabled={cargando}
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={cargando}
              >
                {cargando ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Creando...
                  </span>
                ) : (
                  'Crear Usuario'
                )}
              </button>
            </div>
          </form>
        ) : (
          <div className="p-6 space-y-6">
            {/* Card de éxito con credenciales */}
            <div className="bg-gradient-to-br from-green-50 to-blue-50 border-2 border-green-200 rounded-xl p-6">
              <div className="flex items-start gap-3 mb-4">
                <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-lg font-bold text-gray-900">
                    ¡Usuario creado exitosamente!
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Comparte estas credenciales con el nuevo miembro del equipo
                  </p>
                </div>
              </div>

              {/* Credenciales */}
              <div className="bg-white rounded-lg p-4 space-y-3 border border-gray-200">
                <div>
                  <p className="text-xs font-medium text-gray-500 mb-1">Email</p>
                  <p className="text-sm font-mono bg-gray-50 px-3 py-2 rounded border border-gray-200">
                    {credenciales.email}
                  </p>
                </div>
                
                <div>
                  <p className="text-xs font-medium text-gray-500 mb-1">Contraseña Temporal</p>
                  <p className="text-sm font-mono bg-gray-50 px-3 py-2 rounded border border-gray-200">
                    {credenciales.password_temporal}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-medium text-gray-500 mb-1">Rol</p>
                  <p className="text-sm font-semibold text-blue-700">
                    {getRolLabel(credenciales.rol)}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-medium text-gray-500 mb-1">URL de acceso</p>
                  <p className="text-sm font-mono bg-gray-50 px-3 py-2 rounded border border-gray-200 break-all">
                    {window.location.origin}/login
                  </p>
                </div>
              </div>

              {/* Botón copiar */}
              <button
                onClick={handleCopiar}
                className="w-full mt-4 px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all font-medium flex items-center justify-center gap-2"
              >
                {copiado ? (
                  <>
                    <Check className="w-5 h-5" />
                    ¡Copiado!
                  </>
                ) : (
                  <>
                    <Copy className="w-5 h-5" />
                    Copiar Todo para Compartir
                  </>
                )}
              </button>

              {/* Instrucciones */}
              <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-xs text-blue-800">
                  <strong>💡 Sugerencia:</strong> Haz clic en "Copiar Todo" y envía las credenciales por WhatsApp, email personal o tu canal preferido. El usuario debe cambiar su contraseña al primer ingreso.
                </p>
              </div>
            </div>

            {/* Botones finales */}
            <div className="flex gap-3">
              <button
                onClick={handleNuevaInvitacion}
                className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              >
                Invitar Otro Usuario
              </button>
              <button
                onClick={onCerrar}
                className="flex-1 px-4 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors font-medium"
              >
                Cerrar
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}