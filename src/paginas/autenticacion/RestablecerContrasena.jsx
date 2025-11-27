import { useState } from 'react'
import { servicioAutenticacion } from '../../servicios/autenticacion'
import { Input } from '../../componentes/comunes/Input'
import { Boton } from '../../componentes/comunes/Boton'

export function RestablecerContrasena() {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [cargando, setCargando] = useState(false)
  const [exitoso, setExitoso] = useState(false)

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
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-2xl p-8 border border-white text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
              <span className="text-3xl">✅</span>
            </div>
            
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              ¡Contraseña actualizada!
            </h2>
            
            <p className="text-gray-600 mb-6">
              Tu contraseña ha sido restablecida exitosamente.
            </p>
            
            <p className="text-sm text-gray-500">
              Redirigiendo al inicio de sesión...
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      {/* Efectos de fondo */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
      </div>

      <div className="w-full max-w-md relative">
        <div className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-2xl p-8 border border-white">
          {/* Logo y título */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl mb-4 shadow-lg">
              <span className="text-3xl">🔐</span>
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Nueva Contraseña
            </h1>
            <p className="text-gray-600 mt-2">
              Ingresa tu nueva contraseña
            </p>
          </div>

          {/* Mensaje de error */}
          {error && (
            <div className="mb-6 p-4 rounded-xl text-sm bg-red-50 text-red-700 border border-red-200">
              {error}
            </div>
          )}

          {/* Formulario */}
          <form onSubmit={manejarSubmit} className="space-y-4">
            <Input
              nombre="password"
              tipo="password"
              placeholder="Nueva contraseña"
              valor={password}
              onChange={(e) => {
                setPassword(e.target.value)
                setError('')
              }}
              icono="🔒"
              error=""
            />

            <Input
              nombre="confirmPassword"
              tipo="password"
              placeholder="Confirmar contraseña"
              valor={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value)
                setError('')
              }}
              icono="🔒"
              error=""
            />

            <Boton tipo="primary" disabled={cargando}>
              {cargando ? 'Actualizando...' : 'Restablecer contraseña'}
            </Boton>
          </form>
        </div>
      </div>
    </div>
  )
}