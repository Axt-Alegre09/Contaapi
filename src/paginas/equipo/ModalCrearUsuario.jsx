/**
 * Modal Crear Usuario - ContaAPI v2
 * MOBILE-FIRST - Modal responsive optimizado
 * FIX: Overflow corregido para mostrar contenido completo
 */

import { useState, useEffect } from 'react'
import { X, Eye, EyeOff, Copy, Check, RefreshCw } from 'lucide-react'
import { usuariosServicio } from '../../servicios/usuariosServicio'

const ROLES = [
  { value: 'propietario', label: 'Propietario', descripcion: 'Control total' },
  { value: 'administrador', label: 'Administrador', descripcion: 'Gestión completa' },
  { value: 'contador', label: 'Contador', descripcion: 'Gestión contable' },
  { value: 'asistente', label: 'Asistente', descripcion: 'Tareas operativas' },
  { value: 'auditor', label: 'Auditor', descripcion: 'Solo lectura' },
  { value: 'invitado', label: 'Invitado', descripcion: 'Acceso limitado' }
]

export default function ModalCrearUsuario({ isOpen, onClose, empresaId, onUsuarioCreado }) {
  const [loading, setLoading] = useState(false)
  const [mostrarPassword, setMostrarPassword] = useState(false)
  const [passwordCopiada, setPasswordCopiada] = useState(false)
  const [credencialesGeneradas, setCredencialesGeneradas] = useState(null)
  const [periodosDisponibles, setPeriodosDisponibles] = useState([])

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    nombreCompleto: '',
    rol: 'asistente',
    periodos: [],
    fechaDesde: new Date().toISOString().split('T')[0],
    fechaHasta: ''
  })

  const [errores, setErrores] = useState({})

  useEffect(() => {
    if (isOpen && empresaId) {
      cargarPeriodos()
      generarPasswordAutomatica()
    }
  }, [isOpen, empresaId])

  const cargarPeriodos = async () => {
    try {
      const periodos = await usuariosServicio.obtenerPeriodosDisponibles(empresaId)
      setPeriodosDisponibles(periodos)
    } catch (error) {
      console.error('Error al cargar periodos:', error)
    }
  }

  const generarPasswordAutomatica = () => {
    const nuevaPassword = usuariosServicio.generarPassword()
    setFormData(prev => ({ ...prev, password: nuevaPassword }))
  }

  const validarFormulario = () => {
    const nuevosErrores = {}

    if (!formData.nombreCompleto.trim()) {
      nuevosErrores.nombreCompleto = 'El nombre es requerido'
    }

    if (!formData.email.trim()) {
      nuevosErrores.email = 'El email es requerido'
    } else if (!usuariosServicio.validarEmail(formData.email)) {
      nuevosErrores.email = 'Email inválido'
    }

    const validacionPassword = usuariosServicio.validarPassword(formData.password)
    if (!validacionPassword.valida) {
      nuevosErrores.password = validacionPassword.errores.join(', ')
    }

    setErrores(nuevosErrores)
    return Object.keys(nuevosErrores).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validarFormulario()) return

    setLoading(true)
    try {
      const resultado = await usuariosServicio.crearUsuario({
        email: formData.email,
        password: formData.password,
        nombreCompleto: formData.nombreCompleto,
        rol: formData.rol,
        empresaId,
        periodos: formData.periodos,
        fechaDesde: formData.fechaDesde,
        fechaHasta: formData.fechaHasta || null
      })

      setCredencialesGeneradas({
        email: resultado.email,
        password: resultado.password,
        nombre: resultado.nombre_completo
      })

      if (onUsuarioCreado) {
        onUsuarioCreado(resultado)
      }

    } catch (error) {
      alert(error.message || 'Error al crear usuario')
    } finally {
      setLoading(false)
    }
  }

  const copiarCredenciales = async () => {
    const texto = `Credenciales de acceso - ContaAPI
    
Nombre: ${credencialesGeneradas.nombre}
Email: ${credencialesGeneradas.email}
Contraseña: ${credencialesGeneradas.password}

Por favor cambie su contraseña después del primer acceso.
URL: ${window.location.origin}`

    await navigator.clipboard.writeText(texto)
    setPasswordCopiada(true)
    setTimeout(() => setPasswordCopiada(false), 2000)
  }

  const handleCerrar = () => {
    setFormData({
      email: '',
      password: '',
      nombreCompleto: '',
      rol: 'asistente',
      periodos: [],
      fechaDesde: new Date().toISOString().split('T')[0],
      fechaHasta: ''
    })
    setErrores({})
    setCredencialesGeneradas(null)
    setPasswordCopiada(false)
    onClose()
  }

  const togglePeriodo = (anio) => {
    setFormData(prev => ({
      ...prev,
      periodos: prev.periodos.includes(anio)
        ? prev.periodos.filter(a => a !== anio)
        : [...prev.periodos, anio]
    }))
  }

  if (!isOpen) return null

  // Vista de credenciales generadas
  if (credencialesGeneradas) {
    return (
      <div className="fixed inset-0 bg-black/50 dark:bg-black/70 z-50 overflow-y-auto">
        <div className="min-h-full flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full my-8 p-4 md:p-6">
            <div className="text-center mb-4 md:mb-6">
              <div className="mx-auto w-14 h-14 md:w-16 md:h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-3 md:mb-4">
                <Check className="w-7 h-7 md:w-8 md:h-8 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="text-lg md:text-xl font-bold text-gray-900 dark:text-white">Usuario creado exitosamente</h3>
              <p className="text-sm md:text-base text-gray-600 dark:text-gray-400 mt-2">Guarda estas credenciales</p>
            </div>

            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 md:p-4 mb-4 space-y-3">
              <div>
                <label className="text-xs text-gray-500 dark:text-gray-400 font-medium">Nombre</label>
                <p className="text-sm md:text-base text-gray-900 dark:text-white font-medium break-words">{credencialesGeneradas.nombre}</p>
              </div>
              <div>
                <label className="text-xs text-gray-500 dark:text-gray-400 font-medium">Email</label>
                <p className="text-sm md:text-base text-gray-900 dark:text-white font-mono break-all">{credencialesGeneradas.email}</p>
              </div>
              <div>
                <label className="text-xs text-gray-500 dark:text-gray-400 font-medium">Contraseña</label>
                <p className="text-base md:text-lg text-gray-900 dark:text-white font-mono break-all">{credencialesGeneradas.password}</p>
              </div>
            </div>

            <div className="space-y-2">
              <button
                onClick={copiarCredenciales}
                className="w-full bg-blue-600 dark:bg-blue-500 hover:bg-blue-700 dark:hover:bg-blue-600 text-white font-medium py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors"
              >
                {passwordCopiada ? (
                  <>
                    <Check className="w-5 h-5" />
                    Credenciales copiadas
                  </>
                ) : (
                  <>
                    <Copy className="w-5 h-5" />
                    Copiar credenciales
                  </>
                )}
              </button>

              <button
                onClick={handleCerrar}
                className="w-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 font-medium py-3 px-4 rounded-lg transition-colors"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Vista del formulario - OVERFLOW CORREGIDO
  return (
    <div className="fixed inset-0 bg-black/50 dark:bg-black/70 z-50 overflow-y-auto">
      <div className="min-h-full flex items-center justify-center p-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full my-8">
          <div className="flex items-center justify-between p-4 md:p-6 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg md:text-xl font-bold text-gray-900 dark:text-white">Crear nuevo usuario</h3>
            <button onClick={handleCerrar} className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300">
              <X className="w-6 h-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-4 md:p-6 space-y-4 md:space-y-6">
            {/* Datos básicos */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Nombre completo *
                </label>
                <input
                  type="text"
                  value={formData.nombreCompleto}
                  onChange={(e) => setFormData({ ...formData, nombreCompleto: e.target.value })}
                  className={`w-full px-4 py-2.5 md:py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 text-base ${
                    errores.nombreCompleto ? 'border-red-500 dark:border-red-400' : 'border-gray-300 dark:border-gray-600'
                  }`}
                  placeholder="Juan Pérez"
                />
                {errores.nombreCompleto && (
                  <p className="text-red-500 dark:text-red-400 text-sm mt-1">{errores.nombreCompleto}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Email *
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className={`w-full px-4 py-2.5 md:py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 text-base ${
                    errores.email ? 'border-red-500 dark:border-red-400' : 'border-gray-300 dark:border-gray-600'
                  }`}
                  placeholder="juan@ejemplo.com"
                />
                {errores.email && (
                  <p className="text-red-500 dark:text-red-400 text-sm mt-1">{errores.email}</p>
                )}
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Contraseña *
                  </label>
                  <button
                    type="button"
                    onClick={generarPasswordAutomatica}
                    className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 flex items-center gap-1"
                  >
                    <RefreshCw className="w-4 h-4" />
                    <span className="hidden sm:inline">Generar nueva</span>
                  </button>
                </div>
                <div className="relative">
                  <input
                    type={mostrarPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className={`w-full px-4 py-2.5 md:py-2 pr-10 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400 font-mono bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 text-base ${
                      errores.password ? 'border-red-500 dark:border-red-400' : 'border-gray-300 dark:border-gray-600'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setMostrarPassword(!mostrarPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    {mostrarPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {errores.password && (
                  <p className="text-red-500 dark:text-red-400 text-sm mt-1">{errores.password}</p>
                )}
              </div>
            </div>

            {/* Rol - Grid 1 col móvil, 2 cols desktop */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Rol *
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {ROLES.map(rol => (
                  <label
                    key={rol.value}
                    className={`relative flex items-start p-3 border-2 rounded-lg cursor-pointer transition-all ${
                      formData.rol === rol.value
                        ? 'border-blue-600 dark:border-blue-400 bg-blue-50 dark:bg-blue-900/20'
                        : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                    }`}
                  >
                    <input
                      type="radio"
                      name="rol"
                      value={rol.value}
                      checked={formData.rol === rol.value}
                      onChange={(e) => setFormData({ ...formData, rol: e.target.value })}
                      className="sr-only"
                    />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{rol.label}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{rol.descripcion}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Periodos - Grid adaptativo */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Periodos asignados (opcional)
              </label>
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                {usuariosServicio.obtenerAniosDisponibles().map(anio => (
                  <label
                    key={anio}
                    className={`flex items-center justify-center p-2 border-2 rounded-lg cursor-pointer transition-all ${
                      formData.periodos.includes(anio)
                        ? 'border-blue-600 dark:border-blue-400 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                        : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500 text-gray-900 dark:text-white'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={formData.periodos.includes(anio)}
                      onChange={() => togglePeriodo(anio)}
                      className="sr-only"
                    />
                    <span className="font-medium">{anio}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Vigencia - Grid 1 col móvil, 2 cols desktop */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Válido desde
                </label>
                <input
                  type="date"
                  value={formData.fechaDesde}
                  onChange={(e) => setFormData({ ...formData, fechaDesde: e.target.value })}
                  className="w-full px-4 py-2.5 md:py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-base"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Válido hasta (opcional)
                </label>
                <input
                  type="date"
                  value={formData.fechaHasta}
                  onChange={(e) => setFormData({ ...formData, fechaHasta: e.target.value })}
                  className="w-full px-4 py-2.5 md:py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-base"
                />
              </div>
            </div>

            {/* Botones - Stack en móvil */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <button
                type="button"
                onClick={handleCerrar}
                className="flex-1 px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-medium rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                disabled={loading}
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-6 py-3 bg-blue-600 dark:bg-blue-500 text-white font-medium rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 disabled:bg-gray-400 dark:disabled:bg-gray-600 transition-colors"
              >
                {loading ? 'Creando...' : 'Crear usuario'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}