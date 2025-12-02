/**
 * Tarjeta de Usuario - ContaAPI v2
 * src/paginas/equipo/TarjetaUsuario.jsx
 */

import { Edit2, Trash2, Mail, Phone, Calendar, Shield, Clock, Ban, CheckCircle, XCircle } from 'lucide-react'

const ROLES_CONFIG = {
  propietario: { label: 'Propietario', color: 'purple', icon: Shield },
  administrador: { label: 'Administrador', color: 'blue', icon: Shield },
  contador: { label: 'Contador', color: 'green', icon: Shield },
  asistente: { label: 'Asistente', color: 'yellow', icon: Shield },
  auditor: { label: 'Auditor', color: 'gray', icon: Shield },
  invitado: { label: 'Invitado', color: 'pink', icon: Shield }
}

const ESTADOS_CONFIG = {
  activo: { label: 'Activo', color: 'green', icon: CheckCircle, bg: 'bg-green-100', text: 'text-green-700' },
  inactivo: { label: 'Inactivo', color: 'gray', icon: XCircle, bg: 'bg-gray-100', text: 'text-gray-700' },
  suspendido: { label: 'Suspendido', color: 'red', icon: Ban, bg: 'bg-red-100', text: 'text-red-700' }
}

export default function TarjetaUsuario({ usuario, onEditar, onEliminar, onCambiarEstado }) {
  const rolConfig = ROLES_CONFIG[usuario.rol] || ROLES_CONFIG.invitado
  const estadoConfig = ESTADOS_CONFIG[usuario.estado] || ESTADOS_CONFIG.inactivo
  const EstadoIcon = estadoConfig.icon

  const formatearFecha = (fecha) => {
    if (!fecha) return null
    return new Date(fecha).toLocaleDateString('es-PY', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const esPropietario = usuario.rol === 'propietario'
  const vigente = !usuario.fecha_hasta || new Date(usuario.fecha_hasta) >= new Date()

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          {/* Info principal */}
          <div className="flex items-start gap-4 flex-1">
            {/* Avatar */}
            <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-xl flex-shrink-0">
              {usuario.nombre_completo?.charAt(0).toUpperCase() || '?'}
            </div>

            {/* Datos */}
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h3 className="text-lg font-bold text-gray-900">{usuario.nombre_completo}</h3>
                
                {/* Badge estado */}
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${estadoConfig.bg} ${estadoConfig.text} flex items-center gap-1`}>
                  <EstadoIcon className="w-3 h-3" />
                  {estadoConfig.label}
                </span>

                {/* Badge rol */}
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium bg-${rolConfig.color}-100 text-${rolConfig.color}-700`}>
                  {rolConfig.label}
                </span>

                {/* Badge no vigente */}
                {!vigente && (
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-700">
                    Vencido
                  </span>
                )}
              </div>

              <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                {/* Email */}
                <div className="flex items-center gap-1.5">
                  <Mail className="w-4 h-4 text-gray-400" />
                  <span>{usuario.email}</span>
                </div>

                {/* Teléfono */}
                {usuario.telefono && (
                  <div className="flex items-center gap-1.5">
                    <Phone className="w-4 h-4 text-gray-400" />
                    <span>{usuario.telefono}</span>
                  </div>
                )}

                {/* Número interno */}
                {usuario.numero_interno && (
                  <div className="flex items-center gap-1.5">
                    <span className="text-gray-400">#</span>
                    <span>{usuario.numero_interno}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Acciones */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => onEditar(usuario)}
              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              title="Editar usuario"
            >
              <Edit2 className="w-5 h-5" />
            </button>

            {!esPropietario && (
              <button
                onClick={() => onEliminar(usuario)}
                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                title="Eliminar usuario"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        {/* Información adicional */}
        <div className="border-t pt-4 mt-4 space-y-3">
          {/* Vigencia */}
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="w-4 h-4 text-gray-400" />
            <span className="text-gray-600">
              Vigente desde {formatearFecha(usuario.fecha_desde)}
              {usuario.fecha_hasta && ` hasta ${formatearFecha(usuario.fecha_hasta)}`}
            </span>
          </div>

          {/* Último acceso */}
          {usuario.ultimo_acceso && (
            <div className="flex items-center gap-2 text-sm">
              <Clock className="w-4 h-4 text-gray-400" />
              <span className="text-gray-600">
                Último acceso: {formatearFecha(usuario.ultimo_acceso)}
              </span>
            </div>
          )}

          {/* Periodos asignados */}
          {usuario.periodos_asignados && usuario.periodos_asignados.length > 0 && (
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm text-gray-600 font-medium">Periodos:</span>
              <div className="flex gap-1.5">
                {usuario.periodos_asignados.map(periodo => (
                  <span
                    key={periodo.periodo_id}
                    className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded text-xs font-medium"
                    title={`${periodo.tipo} - Lectura: ${periodo.puede_leer ? 'Sí' : 'No'} / Escritura: ${periodo.puede_escribir ? 'Sí' : 'No'}`}
                  >
                    {periodo.anio}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Acciones rápidas de estado */}
          {!esPropietario && usuario.estado !== 'activo' && (
            <div className="flex gap-2 pt-2">
              <button
                onClick={() => onCambiarEstado('activo')}
                className="px-3 py-1.5 text-sm bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors"
              >
                Activar
              </button>
            </div>
          )}

          {!esPropietario && usuario.estado === 'activo' && (
            <div className="flex gap-2 pt-2">
              <button
                onClick={() => onCambiarEstado('inactivo')}
                className="px-3 py-1.5 text-sm bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
              >
                Desactivar
              </button>
              <button
                onClick={() => onCambiarEstado('suspendido')}
                className="px-3 py-1.5 text-sm bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-colors"
              >
                Suspender
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}