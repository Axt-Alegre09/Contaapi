import { useState } from 'react'
import { Crown, Shield, User, Eye, Mail, Calendar, MoreVertical, Edit, UserX, UserCheck, Trash2, Activity } from 'lucide-react'

export function TarjetaMiembroMejorada({ miembro, puedeEditar, onCambiarRol, onDesactivar, onReactivar, onEliminar }) {
  const [mostrarMenu, setMostrarMenu] = useState(false)

  const iconoPorRol = {
    owner: Crown,
    admin: Shield,
    contador: User,
    asistente: User,
    solo_lectura: Eye
  }

  const colorPorRol = {
    owner: 'from-yellow-500 to-yellow-600',
    admin: 'from-purple-500 to-purple-600',
    contador: 'from-blue-500 to-blue-600',
    asistente: 'from-green-500 to-green-600',
    solo_lectura: 'from-gray-500 to-gray-600'
  }

  const nombreRol = {
    owner: 'Propietario',
    admin: 'Administrador',
    contador: 'Contador',
    asistente: 'Asistente',
    solo_lectura: 'Solo Lectura'
  }

  const Icono = iconoPorRol[miembro.rol]
  const esOwner = miembro.rol === 'owner'

  return (
    <div className={`bg-white rounded-xl border-2 p-6 hover:shadow-lg transition-all relative ${
      !miembro.activo ? 'border-gray-300 opacity-60' : 'border-gray-200'
    }`}>
      {/* Menú contextual */}
      {puedeEditar && !esOwner && (
        <div className="absolute top-4 right-4">
          <button
            onClick={() => setMostrarMenu(!mostrarMenu)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <MoreVertical className="w-5 h-5 text-gray-600" />
          </button>
          
          {mostrarMenu && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-10">
              <button
                onClick={() => {
                  onCambiarRol()
                  setMostrarMenu(false)
                }}
                className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-3 text-gray-700"
              >
                <Edit className="w-4 h-4" />
                Cambiar Rol
              </button>
              
              {miembro.activo ? (
                <button
                  onClick={() => {
                    onDesactivar()
                    setMostrarMenu(false)
                  }}
                  className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-3 text-orange-600"
                >
                  <UserX className="w-4 h-4" />
                  Desactivar
                </button>
              ) : (
                <button
                  onClick={() => {
                    onReactivar()
                    setMostrarMenu(false)
                  }}
                  className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-3 text-green-600"
                >
                  <UserCheck className="w-4 h-4" />
                  Reactivar
                </button>
              )}
              
              <div className="border-t border-gray-200 my-2"></div>
              
              <button
                onClick={() => {
                  onEliminar()
                  setMostrarMenu(false)
                }}
                className="w-full px-4 py-2 text-left hover:bg-red-50 flex items-center gap-3 text-red-600"
              >
                <Trash2 className="w-4 h-4" />
                Eliminar
              </button>
            </div>
          )}
        </div>
      )}

      {/* Avatar y nombre */}
      <div className="flex items-center gap-4 mb-4">
        {miembro.foto_url ? (
          <img
            src={miembro.foto_url}
            alt={miembro.nombre_completo}
            className="w-16 h-16 rounded-full object-cover"
          />
        ) : (
          <div className={`w-16 h-16 rounded-full bg-gradient-to-br ${colorPorRol[miembro.rol]} flex items-center justify-center text-white text-2xl font-bold`}>
            {miembro.nombre_completo?.charAt(0) || miembro.email?.charAt(0).toUpperCase()}
          </div>
        )}
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900 truncate">
            {miembro.nombre_completo || 'Usuario'}
          </h3>
          <div className="flex items-center gap-2 mt-1">
            <Icono className="w-4 h-4 text-gray-500" />
            <span className="text-sm text-gray-600">
              {nombreRol[miembro.rol]}
            </span>
          </div>
        </div>
      </div>

      {/* Email */}
      <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
        <Mail className="w-4 h-4 flex-shrink-0" />
        <span className="truncate">{miembro.email}</span>
      </div>

      {/* Fecha de unión */}
      <div className="flex items-center gap-2 text-xs text-gray-500 mb-3">
        <Calendar className="w-4 h-4 flex-shrink-0" />
        <span>
          Miembro desde {new Date(miembro.fecha_aceptacion || miembro.fecha_invitacion).toLocaleDateString('es-PY')}
        </span>
      </div>

      {/* Badge de rol con color */}
      <div className="flex items-center gap-2">
        <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r ${colorPorRol[miembro.rol]} text-white`}>
          <Icono className="w-3 h-3" />
          {nombreRol[miembro.rol]}
        </span>
        
        {!miembro.activo && (
          <span className="px-3 py-1 bg-red-100 text-red-700 text-xs font-medium rounded-full">
            Desactivado
          </span>
        )}
      </div>

      {/* Indicador de actividad reciente (placeholder) */}
      {miembro.activo && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex items-center justify-between text-xs text-gray-500">
            <div className="flex items-center gap-1">
              <Activity className="w-3 h-3" />
              <span>Última actividad</span>
            </div>
            <span>Hace 2 horas</span>
          </div>
        </div>
      )}
    </div>
  )
}