// src/componentes/RequiereContexto.jsx
import { Navigate } from 'react-router-dom'
import { useEmpresa } from '../contextos/EmpresaContext'

export function RequiereContexto({ children }) {
  const { tieneContextoCompleto, empresaActual, periodoActual, rolActual } = useEmpresa()

  // Debug en desarrollo
  if (import.meta.env.DEV) {
    console.log('🔍 RequiereContexto - Verificando:', {
      tieneContextoCompleto,
      empresaActual: empresaActual?.nombre,
      periodoActual: periodoActual?.anio,
      rolActual
    })
  }

  if (!tieneContextoCompleto) {
    console.warn('⚠️ Contexto incompleto, redirigiendo a selección de período')
    return <Navigate to="/seleccion-periodo" replace />
  }

  return children
}

export default RequiereContexto