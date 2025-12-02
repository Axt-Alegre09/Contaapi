/**
 * Modal Modificar Usuario - ContaAPI v2
 * src/paginas/equipo/ModalModificarUsuario.jsx
 */

import { useState, useEffect } from 'react'
import { X, Key, AlertTriangle } from 'lucide-react'
import { usuariosServicio } from '../../servicios/usuariosServicio'

const ROLES = [
  { value: 'propietario', label: 'Propietario' },
  { value: 'administrador', label: 'Administrador' },
  { value: 'contador', label: 'Contador' },
  { value: 'asistente', label: 'Asistente' },
  { value: 'auditor', label: 'Auditor' },
  { value: 'invitado', label: 'Invitado' }
]

const ESTADOS = [
  { value: 'activo', label: 'Activo', color: 'green' },
  { value: 'inactivo', label: 'Inactivo', color: 'gray' },
  { value: 'suspendido', label: 'Suspendido', color: 'red' }
]

export default function ModalModificarUsuario({ isOpen, onClose, usuario, empresaId, onUsuarioModificado }) {
  const [loading, setLoading] = useState(false)
  const [mostrarCambiarPassword, setMostrarCambiarPassword] = useState(false)
  const [nuevaPassword, setNuevaPassword] = useState('')

  const [formData, setFormData] = useState({
    nombreCompleto: '',
    telefono: '',
    rol: '',
    estado: '',
    periodos: [],
    fechaDesde: '',
    fechaHasta: ''
  })

  useEffect(() => {
    if (usuario) {
      setFormData({
        nombreCompleto: usuario.nombre_completo || '',
        telefono: usuario.telefono || '',
        rol: usuario.rol || '',
        estado: usuario.estado || 'activo',
        periodos: usuario.periodos_asignados?.map(p => p.anio) || [],
        fechaDesde: usuario.fecha_desde || '',
        fechaHasta: usuario.fecha_hasta || ''
      })
    }
  }, [usuario])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      await usuariosServicio.modificarUsuario({
        userId: usuario.user_id,
        empresaId,
        nombreCompleto: formData.nombreCompleto,
        telefono: formData.telefono || null,
        rol: formData.rol,
        estado: formData.estado,
        fechaDesde: formData.fechaDesde,
        fechaHasta: formData.fechaHasta || null,
        periodos: formData.periodos
      })

      alert('Usuario modificado exitosamente')
      if (onUsuarioModificado) {
        onUsuarioModificado()
      }
      onClose()

    } catch (error) {
      alert(error.message || 'Error al modificar usuario')
    } finally {
      setLoading(false)
    }
  }

  const handleCambiarPassword = async () => {
    if (!nuevaPassword || nuevaPassword.length < 8) {
      alert('La contraseña debe tener al menos 8 caracteres')
      return
    }

    setLoading(true)
    try {
      const resultado = await usuariosServicio.cambiarPassword(
        usuario.user_id,
        empresaId,
        nuevaPassword
      )

      alert(`Contraseña actualizada. Nueva contraseña: ${resultado.nueva_password}`)
      setMostrarCambiarPassword(false)
      setNuevaPassword('')

    } catch (error) {
      alert(error.message || 'Error al cambiar contraseña')
    } finally {
      setLoading(false)
    }
  }

  const generarPasswordAleatoria = () => {
    const password = usuariosServicio.generarPassword()
    setNuevaPassword(password)
  }

  const togglePeriodo = (anio) => {
    setFormData(prev => ({
      ...prev,
      periodos: prev.periodos.includes(anio)
        ? prev.periodos.filter(a => a !== anio)
        : [...prev.periodos, anio]
    }))
  }

  if (!isOpen || !usuario) return null

  const esPropietario = usuario.rol === 'propietario'

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full my-8">
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h3 className="text-xl font-bold text-gray-900">Modificar usuario</h3>
            <p className="text-sm text-gray-500 mt-1">{usuario.email}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Advertencia propietario */}
          {esPropietario && (
            <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded">
              <div className="flex gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-amber-900">Usuario propietario</p>
                  <p className="text-sm text-amber-700 mt-1">
                    Algunos campos están bloqueados para proteger el acceso principal
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Datos básicos */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nombre completo *
              </label>
              <input
                type="text"
                value={formData.nombreCompleto}
                onChange={(e) => setFormData({ ...formData, nombreCompleto: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Teléfono
              </label>
              <input
                type="tel"
                value={formData.telefono}
                onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="(595) 981-123456"
              />
            </div>
          </div>

          {/* Rol y Estado */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Rol *
              </label>
              <select
                value={formData.rol}
                onChange={(e) => setFormData({ ...formData, rol: e.target.value })}
                disabled={esPropietario}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
              >
                {ROLES.map(rol => (
                  <option key={rol.value} value={rol.value}>
                    {rol.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Estado *
              </label>
              <select
                value={formData.estado}
                onChange={(e) => setFormData({ ...formData, estado: e.target.value })}
                disabled={esPropietario}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
              >
                {ESTADOS.map(estado => (
                  <option key={estado.value} value={estado.value}>
                    {estado.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Periodos */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Periodos asignados
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

          {/* Cambiar contraseña */}
          <div className="border-t pt-4">
            {!mostrarCambiarPassword ? (
              <button
                type="button"
                onClick={() => setMostrarCambiarPassword(true)}
                className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
              >
                <Key className="w-5 h-5" />
                Cambiar contraseña
              </button>
            ) : (
              <div className="space-y-3 bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center justify-between">
                  <label className="block text-sm font-medium text-gray-700">
                    Nueva contraseña
                  </label>
                  <button
                    type="button"
                    onClick={generarPasswordAleatoria}
                    className="text-sm text-blue-600 hover:text-blue-700"
                  >
                    Generar aleatoria
                  </button>
                </div>
                <input
                  type="text"
                  value={nuevaPassword}
                  onChange={(e) => setNuevaPassword(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg font-mono"
                  placeholder="Mínimo 8 caracteres"
                />
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={handleCambiarPassword}
                    disabled={loading}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
                  >
                    Cambiar contraseña
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setMostrarCambiarPassword(false)
                      setNuevaPassword('')
                    }}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Botones */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50"
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
            >
              {loading ? 'Guardando...' : 'Guardar cambios'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}