/**
 * Modal Crear Usuario - ContaAPI v2
 * src/paginas/equipo/ModalCrearUsuario.jsx
 */

import { useState, useEffect } from 'react'
import { X, Eye, EyeOff, Copy, Check, RefreshCw } from 'lucide-react'
import { usuariosServicio } from '../../servicios/usuariosServicio'

const ROLES = [
  { value: 'propietario', label: 'Propietario', descripcion: 'Control total del sistema' },
  { value: 'administrador', label: 'Administrador', descripcion: 'Gestión completa de la empresa' },
  { value: 'contador', label: 'Contador', descripcion: 'Gestión contable y fiscal' },
  { value: 'asistente', label: 'Asistente', descripcion: 'Tareas operativas' },
  { value: 'auditor', label: 'Auditor', descripcion: 'Solo lectura' },
  { value: 'invitado', label: 'Invitado', descripcion: 'Acceso limitado temporal' }
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
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
          <div className="text-center mb-6">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <Check className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900">Usuario creado exitosamente</h3>
            <p className="text-gray-600 mt-2">Guarda estas credenciales, no se mostrarán de nuevo</p>
          </div>

          <div className="bg-gray-50 rounded-lg p-4 mb-4 space-y-3">
            <div>
              <label className="text-xs text-gray-500 font-medium">Nombre</label>
              <p className="text-gray-900 font-medium">{credencialesGeneradas.nombre}</p>
            </div>
            <div>
              <label className="text-xs text-gray-500 font-medium">Email</label>
              <p className="text-gray-900 font-mono">{credencialesGeneradas.email}</p>
            </div>
            <div>
              <label className="text-xs text-gray-500 font-medium">Contraseña</label>
              <p className="text-gray-900 font-mono text-lg">{credencialesGeneradas.password}</p>
            </div>
          </div>

          <div className="space-y-2">
            <button
              onClick={copiarCredenciales}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors"
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
              className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-3 px-4 rounded-lg transition-colors"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Vista del formulario
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full my-8">
        <div className="flex items-center justify-between p-6 border-b">
          <h3 className="text-xl font-bold text-gray-900">Crear nuevo usuario</h3>
          <button onClick={handleCerrar} className="text-gray-400 hover:text-gray-600">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Datos básicos */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nombre completo *
              </label>
              <input
                type="text"
                value={formData.nombreCompleto}
                onChange={(e) => setFormData({ ...formData, nombreCompleto: e.target.value })}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errores.nombreCompleto ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Juan Pérez"
              />
              {errores.nombreCompleto && (
                <p className="text-red-500 text-sm mt-1">{errores.nombreCompleto}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email *
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errores.email ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="juan@ejemplo.com"
              />
              {errores.email && (
                <p className="text-red-500 text-sm mt-1">{errores.email}</p>
              )}
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-sm font-medium text-gray-700">
                  Contraseña *
                </label>
                <button
                  type="button"
                  onClick={generarPasswordAutomatica}
                  className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
                >
                  <RefreshCw className="w-4 h-4" />
                  Generar nueva
                </button>
              </div>
              <div className="relative">
                <input
                  type={mostrarPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className={`w-full px-4 py-2 pr-10 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono ${
                    errores.password ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setMostrarPassword(!mostrarPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {mostrarPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {errores.password && (
                <p className="text-red-500 text-sm mt-1">{errores.password}</p>
              )}
            </div>
          </div>

          {/* Rol */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Rol *
            </label>
            <div className="grid grid-cols-2 gap-3">
              {ROLES.map(rol => (
                <label
                  key={rol.value}
                  className={`relative flex items-start p-3 border-2 rounded-lg cursor-pointer transition-all ${
                    formData.rol === rol.value
                      ? 'border-blue-600 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
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
                    <p className="text-sm font-medium text-gray-900">{rol.label}</p>
                    <p className="text-xs text-gray-500">{rol.descripcion}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Periodos */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Periodos asignados (opcional)
            </label>
            <div className="grid grid-cols-4 gap-2">
              {usuariosServicio.obtenerAniosDisponibles().map(anio => (
                <label
                  key={anio}
                  className={`flex items-center justify-center p-2 border-2 rounded-lg cursor-pointer transition-all ${
                    formData.periodos.includes(anio)
                      ? 'border-blue-600 bg-blue-50 text-blue-600'
                      : 'border-gray-200 hover:border-gray-300'
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

          {/* Vigencia */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Válido desde
              </label>
              <input
                type="date"
                value={formData.fechaDesde}
                onChange={(e) => setFormData({ ...formData, fechaDesde: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Válido hasta (opcional)
              </label>
              <input
                type="date"
                value={formData.fechaHasta}
                onChange={(e) => setFormData({ ...formData, fechaHasta: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Botones */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={handleCerrar}
              className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
            >
              {loading ? 'Creando...' : 'Crear usuario'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}