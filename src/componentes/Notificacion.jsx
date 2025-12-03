/**
 * Sistema de Notificaciones - ContaAPI v2
 * Toast notifications personalizadas
 */

import { useState, useEffect } from 'react'
import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-react'

const TIPOS = {
  success: {
    icon: CheckCircle,
    bg: 'bg-green-50 dark:bg-green-900/20',
    border: 'border-green-500 dark:border-green-400',
    text: 'text-green-800 dark:text-green-300',
    iconColor: 'text-green-600 dark:text-green-400'
  },
  error: {
    icon: XCircle,
    bg: 'bg-red-50 dark:bg-red-900/20',
    border: 'border-red-500 dark:border-red-400',
    text: 'text-red-800 dark:text-red-300',
    iconColor: 'text-red-600 dark:text-red-400'
  },
  warning: {
    icon: AlertCircle,
    bg: 'bg-amber-50 dark:bg-amber-900/20',
    border: 'border-amber-500 dark:border-amber-400',
    text: 'text-amber-800 dark:text-amber-300',
    iconColor: 'text-amber-600 dark:text-amber-400'
  },
  info: {
    icon: Info,
    bg: 'bg-blue-50 dark:bg-blue-900/20',
    border: 'border-blue-500 dark:border-blue-400',
    text: 'text-blue-800 dark:text-blue-300',
    iconColor: 'text-blue-600 dark:text-blue-400'
  }
}

export function Notificacion({ tipo = 'info', mensaje, onClose, duracion = 5000 }) {
  const config = TIPOS[tipo]
  const Icon = config.icon

  useEffect(() => {
    if (duracion > 0) {
      const timer = setTimeout(onClose, duracion)
      return () => clearTimeout(timer)
    }
  }, [duracion, onClose])

  return (
    <div className={`${config.bg} ${config.border} border-l-4 rounded-lg p-4 shadow-lg flex items-start gap-3 min-w-[320px] max-w-md animate-slideIn`}>
      <Icon className={`w-5 h-5 ${config.iconColor} flex-shrink-0 mt-0.5`} />
      <p className={`${config.text} text-sm flex-1`}>{mensaje}</p>
      <button
        onClick={onClose}
        className={`${config.iconColor} hover:opacity-70 transition-opacity`}
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  )
}

// Hook para usar notificaciones
export function useNotificacion() {
  const [notificaciones, setNotificaciones] = useState([])

  const mostrar = (tipo, mensaje, duracion = 5000) => {
    const id = Date.now()
    setNotificaciones(prev => [...prev, { id, tipo, mensaje, duracion }])
  }

  const cerrar = (id) => {
    setNotificaciones(prev => prev.filter(n => n.id !== id))
  }

  const success = (mensaje, duracion) => mostrar('success', mensaje, duracion)
  const error = (mensaje, duracion) => mostrar('error', mensaje, duracion)
  const warning = (mensaje, duracion) => mostrar('warning', mensaje, duracion)
  const info = (mensaje, duracion) => mostrar('info', mensaje, duracion)

  const NotificacionContainer = () => (
    <div className="fixed top-4 right-4 z-50 space-y-3">
      {notificaciones.map(notif => (
        <Notificacion
          key={notif.id}
          tipo={notif.tipo}
          mensaje={notif.mensaje}
          duracion={notif.duracion}
          onClose={() => cerrar(notif.id)}
        />
      ))}
    </div>
  )

  return { success, error, warning, info, NotificacionContainer }
}