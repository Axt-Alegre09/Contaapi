/**
 * Modal Eliminar Usuario - ContaAPI v2
 * src/paginas/equipo/ModalEliminarUsuario.jsx
 */

import { useState } from 'react'
import { X, AlertTriangle, Trash2 } from 'lucide-react'
import { usuariosServicio } from '../../servicios/usuariosServicio'

export default function ModalEliminarUsuario({ isOpen, onClose, usuario, empresaId, onUsuarioEliminado }) {
  const [loading, setLoading] = useState(false)
  const [confirmacion, setConfirmacion] = useState('')

  const handleEliminar = async (e) => {
    e.preventDefault()

    if (confirmacion.toLowerCase() !== usuario?.nombre_completo?.toLowerCase()) {
      alert('El nombre no coincide')
      return
    }

    setLoading(true)
    try {
      await usuariosServicio.eliminarUsuario(usuario.user_id, empresaId)

      alert('Usuario eliminado exitosamente')
      if (onUsuarioEliminado) {
        onUsuarioEliminado()
      }
      onClose()

    } catch (error) {
      alert(error.message || 'Error al eliminar usuario')
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen || !usuario) return null

  const esPropietario = usuario.rol === 'propietario'

  return (
    <div className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">Eliminar usuario</h3>
          </div>
          <button onClick={onClose} className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300">
            <X className="w-6 h-6" />
          </button>
        </div>

        {esPropietario ? (
          <div className="p-6">
            <div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 dark:border-red-400 p-4 rounded mb-4">
              <div className="flex gap-3">
                <AlertTriangle className="w-5 h-5 text-red-500 dark:text-red-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-red-900 dark:text-red-300">No se puede eliminar</p>
                  <p className="text-sm text-red-700 dark:text-red-400 mt-1">
                    El propietario no puede ser eliminado del sistema
                  </p>
                </div>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-full px-6 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-medium rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600"
            >
              Entendido
            </button>
          </div>
        ) : (
          <form onSubmit={handleEliminar} className="p-6">
            <div className="mb-6">
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                Estás a punto de eliminar al usuario:
              </p>
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 space-y-2">
                <p className="font-medium text-gray-900 dark:text-white">{usuario.nombre_completo}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">{usuario.email}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Rol: {usuario.rol}</p>
              </div>
            </div>

            <div className="bg-amber-50 dark:bg-amber-900/20 border-l-4 border-amber-500 dark:border-amber-400 p-4 rounded mb-6">
              <p className="text-sm text-amber-900 dark:text-amber-300">
                <strong>Nota:</strong> Esta acción es reversible. El usuario será marcado como eliminado
                pero sus datos permanecerán en el sistema para auditoría.
              </p>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Para confirmar, escribe el nombre del usuario:
              </label>
              <input
                type="text"
                value={confirmacion}
                onChange={(e) => setConfirmacion(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 dark:focus:ring-red-400 focus:border-red-500 dark:focus:border-red-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                placeholder={usuario.nombre_completo}
                required
              />
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-medium rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                disabled={loading}
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading || confirmacion.toLowerCase() !== usuario.nombre_completo?.toLowerCase()}
                className="flex-1 px-6 py-3 bg-red-600 dark:bg-red-500 text-white font-medium rounded-lg hover:bg-red-700 dark:hover:bg-red-600 disabled:bg-gray-400 dark:disabled:bg-gray-600 flex items-center justify-center gap-2"
              >
                <Trash2 className="w-5 h-5" />
                {loading ? 'Eliminando...' : 'Eliminar usuario'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}