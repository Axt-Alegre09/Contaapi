import { useState } from 'react'
import { servicioAutenticacion } from '../../servicios/autenticacion'
import { Lock, CheckCircle, Eye, EyeOff } from 'lucide-react'

export function RestablecerContrasena() {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [cargando, setCargando] = useState(false)
  const [exitoso, setExitoso] = useState(false)
  const [mostrarPassword, setMostrarPassword] = useState(false)
  const [mostrarConfirmPassword, setMostrarConfirmPassword] = useState(false)

  const manejarSubmit = async (e) => {
    e.preventDefault()
    
    if (!password) {
      setError('La contraseña es requerida')
      return
    }

    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres')
      return
    }

    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden')
      return
    }

    setCargando(true)
    setError('')

    try {
      await servicioAutenticacion.actualizarContrasena(password)
      setExitoso(true)
      setTimeout(() => {
        window.location.href = '/'
      }, 3000)
    } catch (error) {
      setError(error.message || 'Error al restablecer la contraseña')
    } finally {
      setCargando(false)
    }
  }

  if (exitoso) {
    return (
      <div 
        className="min-h-screen flex items-center justify-center p-3 sm:p-4 md:p-6 relative"
        style={{
          backgroundImage: 'url(https://rsttvtsckdgjyobrqtlx.supabase.co/storage/v1/object/public/Contaapi/fondoLogin.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          backgroundAttachment: 'fixed'
        }}
      >
        {/* Capa oscura CON DARK MODE */}
        <div className="absolute inset-0 bg-black/40 dark:bg-black/70 backdrop-blur-[2px]"></div>

        <div className="w-full max-w-md relative z-10">
          <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl rounded-2xl sm:rounded-3xl shadow-2xl p-6 sm:p-8 border border-white/50 dark:border-gray-700/50 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full mb-4">
              <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
            </div>
            
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">
              ¡Contraseña actualizada!
            </h2>
            
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Tu contraseña ha sido restablecida exitosamente.
            </p>
            
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Redirigiendo al inicio de sesión...
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div 
      className="min-h-screen flex items-center justify-center p-3 sm:p-4 md:p-6 relative"
      style={{
        backgroundImage: 'url(https://rsttvtsckdgjyobrqtlx.supabase.co/storage/v1/object/public/Contaapi/fondoLogin.jpg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundAttachment: 'fixed'
      }}
    >
      {/* Capa oscura CON DARK MODE */}
      <div className="absolute inset-0 bg-black/40 dark:bg-black/70 backdrop-blur-[2px]"></div>

      {/* Efectos adicionales */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-60 h-60 sm:w-80 sm:h-80 bg-blue-500/20 dark:bg-blue-400/10 rounded-full mix-blend-overlay filter blur-3xl animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-60 h-60 sm:w-80 sm:h-80 bg-purple-500/20 dark:bg-purple-400/10 rounded-full mix-blend-overlay filter blur-3xl animate-blob animation-delay-2000"></div>
      </div>

      <div className="w-full max-w-md relative z-10">
        <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl rounded-2xl sm:rounded-3xl shadow-2xl p-6 sm:p-8 border border-white/50 dark:border-gray-700/50">
          {/* Logo y título */}
          <div className="text-center mb-6 sm:mb-8">
            <div className="mb-4 sm:mb-6 bg-transparent">
              <img 
                src="https://rsttvtsckdgjyobrqtlx.supabase.co/storage/v1/object/public/Contaapi/logo2login.jpg" 
                alt="ContaAPI Logo" 
                className="w-40 h-40 sm:w-48 sm:h-48 mx-auto object-contain drop-shadow-2xl"
                style={{ background: 'transparent' }}
              />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Nueva Contraseña
            </h1>
            <p className="text-sm sm:text-base text-gray-700 dark:text-gray-300 mt-2 font-medium">
              Ingresa tu nueva contraseña
            </p>
          </div>

          {/* Mensaje de error CON DARK MODE */}
          {error && (
            <div className="mb-6 p-4 rounded-xl text-sm bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800 font-medium">
              {error}
            </div>
          )}

          {/* Formulario CON DARK MODE */}
          <form onSubmit={manejarSubmit} className="space-y-4">
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-5 h-5" />
              <input
                type={mostrarPassword ? "text" : "password"}
                name="password"
                placeholder="Nueva contraseña"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value)
                  setError('')
                }}
                className="w-full pl-10 pr-12 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent transition-all bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
              />
              <button
                type="button"
                onClick={() => setMostrarPassword(!mostrarPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              >
                {mostrarPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>

            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-5 h-5" />
              <input
                type={mostrarConfirmPassword ? "text" : "password"}
                name="confirmPassword"
                placeholder="Confirmar contraseña"
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value)
                  setError('')
                }}
                className="w-full pl-10 pr-12 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent transition-all bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
              />
              <button
                type="button"
                onClick={() => setMostrarConfirmPassword(!mostrarConfirmPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              >
                {mostrarConfirmPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>

            <button
              type="submit"
              disabled={cargando}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 dark:from-blue-500 dark:to-blue-600 dark:hover:from-blue-600 dark:hover:to-blue-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 transform hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {cargando ? 'Actualizando...' : 'Restablecer contraseña'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}