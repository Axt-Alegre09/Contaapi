import { useState } from 'react'
import { servicioAutenticacion } from '../../servicios/autenticacion'
import { Input } from '../../componentes/comunes/Input'
import { Boton } from '../../componentes/comunes/Boton'

export function RecuperarContrasena({ onVolver }) {
  const [email, setEmail] = useState('')
  const [enviado, setEnviado] = useState(false)
  const [error, setError] = useState('')
  const [cargando, setCargando] = useState(false)

  const manejarSubmit = async (e) => {
    e.preventDefault()
    
    if (!email) {
      setError('El email es requerido')
      return
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      setError('Email inválido')
      return
    }

    setCargando(true)
    setError('')

    try {
      await servicioAutenticacion.recuperarContrasena(email)
      setEnviado(true)
    } catch (error) {
      setError(error.message || 'Error al enviar el correo de recuperación')
    } finally {
      setCargando(false)
    }
  }

  if (enviado) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-2xl p-8 border border-white text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
              <span className="text-3xl">✅</span>
            </div>
            
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              ¡Correo enviado!
            </h2>
            
            <p className="text-gray-600 mb-6">
              Hemos enviado un enlace de recuperación a <strong>{email}</strong>
            </p>
            
            <p className="text-sm text-gray-500 mb-8">
              Revisa tu bandeja de entrada y haz clic en el enlace para restablecer tu contraseña.
            </p>
            
            <button
              onClick={onVolver}
              className="text-blue-600 hover:text-blue-700 font-medium transition-colors"
            >
              ← Volver al inicio de sesión
            </button>
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
              Recuperar Contraseña
            </h1>
            <p className="text-gray-600 mt-2">
              Te enviaremos un enlace para restablecer tu contraseña
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
              nombre="email"
              tipo="email"
              placeholder="Correo electrónico"
              valor={email}
              onChange={(e) => {
                setEmail(e.target.value)
                setError('')
              }}
              icono="✉️"
              error=""
            />

            <Boton tipo="primary" disabled={cargando}>
              {cargando ? 'Enviando...' : 'Enviar enlace de recuperación'}
            </Boton>
          </form>

          {/* Volver */}
          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={onVolver}
              className="text-blue-600 hover:text-blue-700 font-medium transition-colors"
            >
              ← Volver al inicio de sesión
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}