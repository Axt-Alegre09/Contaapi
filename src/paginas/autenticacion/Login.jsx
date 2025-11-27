import { useState } from 'react'
import { servicioAutenticacion } from '../../servicios/autenticacion'
import { Input } from '../../componentes/comunes/Input'
import { Boton } from '../../componentes/comunes/Boton'
import { RecuperarContrasena } from './RecuperarContaseña'
import { Mail, Lock, User } from 'lucide-react'

export function Login() {
  const [esRegistro, setEsRegistro] = useState(false)
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    nombreCompleto: ''
  })
  const [errores, setErrores] = useState({})
  const [cargando, setCargando] = useState(false)
  const [mensaje, setMensaje] = useState({ tipo: '', texto: '' })
  const [mostrarRecuperar, setMostrarRecuperar] = useState(false)

  // Mostrar componente de recuperación si está activo
  if (mostrarRecuperar) {
    return <RecuperarContrasena onVolver={() => setMostrarRecuperar(false)} />
  }

  const manejarCambio = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
    if (errores[e.target.name]) {
      setErrores({ ...errores, [e.target.name]: '' })
    }
  }

  const validarFormulario = () => {
    const nuevosErrores = {}

    if (!formData.email) {
      nuevosErrores.email = 'El email es requerido'
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      nuevosErrores.email = 'Email inválido'
    }

    if (!formData.password) {
      nuevosErrores.password = 'La contraseña es requerida'
    } else if (formData.password.length < 6) {
      nuevosErrores.password = 'Mínimo 6 caracteres'
    }

    if (esRegistro && !formData.nombreCompleto) {
      nuevosErrores.nombreCompleto = 'El nombre es requerido'
    }

    setErrores(nuevosErrores)
    return Object.keys(nuevosErrores).length === 0
  }

  const manejarSubmit = async (e) => {
    e.preventDefault()
    
    if (!validarFormulario()) return

    setCargando(true)
    setMensaje({ tipo: '', texto: '' })

    try {
      if (esRegistro) {
        await servicioAutenticacion.registrar(
          formData.email,
          formData.password,
          { nombre_completo: formData.nombreCompleto }
        )
        setMensaje({
          tipo: 'success',
          texto: '¡Registro exitoso! Revisa tu email para confirmar tu cuenta.'
        })
      } else {
        await servicioAutenticacion.iniciarSesion(formData.email, formData.password)
        setMensaje({
          tipo: 'success',
          texto: '¡Bienvenido a ContaAPI!'
        })
      }
    } catch (error) {
      setMensaje({
        tipo: 'error',
        texto: error.message || 'Ocurrió un error. Intenta nuevamente.'
      })
    } finally {
      setCargando(false)
    }
  }

  const manejarGoogleLogin = async () => {
    setCargando(true)
    try {
      await servicioAutenticacion.iniciarSesionConGoogle()
    } catch (error) {
      setMensaje({
        tipo: 'error',
        texto: 'Error al iniciar sesión con Google'
      })
      setCargando(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      {/* Efectos de fondo */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      <div className="w-full max-w-md relative">
        {/* Card principal */}
        <div className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-2xl p-8 border border-white">
          {/* Logo y título */}
          <div className="text-center mb-8">
            <img 
              src="https://rsttvtsckdgjyobrqtlx.supabase.co/storage/v1/object/public/Contaapi/logo2login.jpg" 
              alt="ContaAPI Logo" 
              className="w-32 h-32 mx-auto mb-4 rounded-2xl shadow-lg object-contain"
            />
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              ContaAPI
            </h1>
            <p className="text-gray-600 mt-2">
              {esRegistro ? 'Crea tu cuenta' : 'Inicia sesión en tu cuenta'}
            </p>
          </div>

          {/* Mensajes */}
          {mensaje.texto && (
            <div className={`
              mb-6 p-4 rounded-xl text-sm
              ${mensaje.tipo === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}
            `}>
              {mensaje.texto}
            </div>
          )}

          {/* Formulario */}
          <form onSubmit={manejarSubmit} className="space-y-4">
            {esRegistro && (
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  name="nombreCompleto"
                  placeholder="Nombre completo"
                  value={formData.nombreCompleto}
                  onChange={manejarCambio}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
                {errores.nombreCompleto && (
                  <p className="text-red-500 text-xs mt-1">{errores.nombreCompleto}</p>
                )}
              </div>
            )}

            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="email"
                name="email"
                placeholder="Correo electrónico"
                value={formData.email}
                onChange={manejarCambio}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
              {errores.email && (
                <p className="text-red-500 text-xs mt-1">{errores.email}</p>
              )}
            </div>

            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="password"
                name="password"
                placeholder="Contraseña"
                value={formData.password}
                onChange={manejarCambio}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
              {errores.password && (
                <p className="text-red-500 text-xs mt-1">{errores.password}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={cargando}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 transform hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {cargando ? 'Procesando...' : (esRegistro ? 'Crear cuenta' : 'Iniciar sesión')}
            </button>

            {/* Enlace de recuperar contraseña */}
            {!esRegistro && (
              <div className="text-center">
                <button
                  type="button"
                  onClick={() => setMostrarRecuperar(true)}
                  className="text-sm text-gray-600 hover:text-blue-600 transition-colors"
                >
                  ¿Olvidaste tu contraseña?
                </button>
              </div>
            )}
          </form>

          {/* Divisor */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-gray-500">O continúa con</span>
            </div>
          </div>

          {/* Botón Google */}
          <button
            onClick={manejarGoogleLogin}
            disabled={cargando}
            className="w-full bg-white hover:bg-gray-50 text-gray-700 font-semibold py-3 px-6 rounded-xl border-2 border-gray-200 transition-all duration-200 transform hover:scale-105 shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Iniciar con Google
          </button>

          {/* Toggle Login/Registro */}
          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={() => {
                setEsRegistro(!esRegistro)
                setErrores({})
                setMensaje({ tipo: '', texto: '' })
              }}
              className="text-blue-600 hover:text-blue-700 font-medium transition-colors"
            >
              {esRegistro ? '¿Ya tienes cuenta? Inicia sesión' : '¿No tienes cuenta? Regístrate'}
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-6 text-sm text-gray-600">
          <p>Sistema Contable Profesional para Paraguay</p>
          <p className="mt-1">© 2025 ContaAPI - Todos los derechos reservados</p>
        </div>
      </div>
    </div>
  )
}