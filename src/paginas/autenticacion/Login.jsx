import { useState } from 'react'
import { servicioAutenticacion } from '../../servicios/autenticacion'
import { Input } from '../../componentes/comunes/Input'
import { Boton } from '../../componentes/comunes/Boton'
import { RecuperarContrasena } from './RecuperarContaseña'

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
    // Limpiar error del campo
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
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl mb-4 shadow-lg">
              <span className="text-3xl">🧾</span>
            </div>
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
              <Input
                nombre="nombreCompleto"
                tipo="text"
                placeholder="Nombre completo"
                valor={formData.nombreCompleto}
                onChange={manejarCambio}
                icono="👤"
                error={errores.nombreCompleto}
              />
            )}

            <Input
              nombre="email"
              tipo="email"
              placeholder="Correo electrónico"
              valor={formData.email}
              onChange={manejarCambio}
              icono="✉️"
              error={errores.email}
            />

            <Input
              nombre="password"
              tipo="password"
              placeholder="Contraseña"
              valor={formData.password}
              onChange={manejarCambio}
              icono="🔒"
              error={errores.password}
            />

            <Boton
              tipo="primary"
              disabled={cargando}
            >
              {cargando ? 'Procesando...' : (esRegistro ? 'Crear cuenta' : 'Iniciar sesión')}
            </Boton>

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
          <Boton
            tipo="google"
            onClick={manejarGoogleLogin}
            disabled={cargando}
            icono={
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
            }
          >
            Iniciar con Google
          </Boton>

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
