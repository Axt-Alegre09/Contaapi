/**
 * Modal de Confirmación - ContaAPI v2
 * Modal reutilizable para confirmaciones con contraseña
 */

import { useState } from 'react'
import { AlertTriangle, Lock, Eye, EyeOff } from 'lucide-react'

export function ModalConfirmacion({ 
  isOpen, 
  onClose, 
  onConfirmar, 
  titulo, 
  mensaje,
  requierePassword = false,
  tipo = 'danger' // 'danger' | 'warning' | 'info'
}) {
  const [password, setPassword] = useState('')
  const [mostrarPassword, setMostrarPassword] = useState(false)
  const [loading, setLoading] = useState(false)

  if (!isOpen) return null

  const handleConfirmar = async () => {
    if (requierePassword && !password.trim()) {
      return
    }

    setLoading(true)
    try {
      await onConfirmar(password)
      handleCerrar()
    } catch (error) {
      // El error se maneja en el componente padre
    } finally {
      setLoading(false)
    }
  }

  const handleCerrar = () => {
    setPassword('')
    setMostrarPassword(false)
    onClose()
  }

  const getColors = () => {
    switch (tipo) {
      case 'danger':
        return {
          icon: 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400',
          btn: 'bg-red-600 dark:bg-red-500 hover:bg-red-700 dark:hover:bg-red-600'
        }
      case 'warning':
        return {
          icon: 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400',
          btn: 'bg-amber-600 dark:bg-amber-500 hover:bg-amber-700 dark:hover:bg-amber-600'
        }
      default:
        return {
          icon: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400',
          btn: 'bg-blue-600 dark:bg-blue-500 hover:bg-blue-700 dark:hover:bg-blue-600'
        }
    }
  }

  const colors = getColors()

  return (
    <div className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-md w-full">
        {/* Icono y Título */}
        <div className="p-6">
          <div className="flex items-center gap-4 mb-4">
            <div className={`w-12 h-12 ${colors.icon} rounded-full flex items-center justify-center flex-shrink-0`}>
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                {titulo}
              </h3>
            </div>
          </div>

          {/* Mensaje */}
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            {mensaje}
          </p>

          {/* Input de Contraseña */}
          {requierePassword && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Contraseña de Administrador *
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
                <input
                  type={mostrarPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-12 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="Ingresa tu contraseña"
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setMostrarPassword(!mostrarPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  {mostrarPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Botones */}
        <div className="border-t border-gray-200 dark:border-gray-700 p-4 flex justify-end gap-3">
          <button
            onClick={handleCerrar}
            disabled={loading}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleConfirmar}
            disabled={loading || (requierePassword && !password.trim())}
            className={`px-4 py-2 ${colors.btn} text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors`}
          >
            {loading ? 'Procesando...' : 'Confirmar'}
          </button>
        </div>
      </div>
    </div>
  )
}