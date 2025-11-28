import { useState } from 'react'
import { X, Shield, Crown, User, Eye } from 'lucide-react'

export function ModalEditarRol({ miembro, onCerrar, onCambiar }) {
  const [rolSeleccionado, setRolSeleccionado] = useState(miembro.rol)
  const [cargando, setCargando] = useState(false)

  const roles = [
    { 
      value: 'admin', 
      label: 'Administrador', 
      icono: Shield,
      descripcion: 'Acceso completo excepto eliminar la empresa',
      color: 'purple'
    },
    { 
      value: 'contador', 
      label: 'Contador', 
      icono: User,
      descripcion: 'Gestión contable completa',
      color: 'blue'
    },
    { 
      value: 'asistente', 
      label: 'Asistente', 
      icono: User,
      descripcion: 'Permisos limitados, requiere supervisión',
      color: 'green'
    },
    { 
      value: 'solo_lectura', 
      label: 'Solo Lectura', 
      icono: Eye,
      descripcion: 'Solo puede ver información',
      color: 'gray'
    }
  ]

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (rolSeleccionado === miembro.rol) {
      onCerrar()
      return
    }
    
    try {
      setCargando(true)
      await onCambiar(rolSeleccionado)
    } catch (error) {
      console.error('Error al cambiar rol:', error)
      alert('Error al cambiar el rol')
    } finally {
      setCargando(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Shield className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Cambiar Rol</h2>
              <p className="text-sm text-gray-600">{miembro.nombre_completo || miembro.email}</p>
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
        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-3">
            {roles.map((rol) => {
              const Icono = rol.icono
              return (
                <label
                  key={rol.value}
                  className={`flex items-start gap-3 p-4 border-2 rounded-xl cursor-pointer transition-all ${
                    rolSeleccionado === rol.value
                      ? `border-${rol.color}-500 bg-${rol.color}-50`
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="rol"
                    value={rol.value}
                    checked={rolSeleccionado === rol.value}
                    onChange={(e) => setRolSeleccionado(e.target.value)}
                    className="mt-1"
                    disabled={cargando}
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Icono className={`w-4 h-4 text-${rol.color}-600`} />
                      <span className="font-medium text-gray-900">{rol.label}</span>
                    </div>
                    <p className="text-sm text-gray-600">{rol.descripcion}</p>
                  </div>
                </label>
              )
            })}
          </div>

          {/* Botones */}
          <div className="flex gap-3 mt-6">
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
              className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all font-medium disabled:opacity-50"
              disabled={cargando || rolSeleccionado === miembro.rol}
            >
              {cargando ? 'Cambiando...' : 'Cambiar Rol'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}