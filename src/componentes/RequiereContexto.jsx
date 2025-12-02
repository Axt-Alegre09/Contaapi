// src/componentes/RequiereContexto.jsx
import { Navigate } from 'react-router-dom'
import { useEmpresa } from '@/contextos/EmpresaContext'

export function RequiereContexto({ children }) {
  const { tieneContextoCompleto } = useEmpresa()

  if (!tieneContextoCompleto) {
    return <Navigate to="/seleccion-periodo" replace />
  }

  return children
}