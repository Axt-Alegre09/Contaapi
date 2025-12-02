// src/componentes/RequiereContexto.jsx
import { Navigate } from 'react-router-dom'
import { useEmpresaContext } from '@/contextos/EmpresaContext'

export default function RequiereContexto({ children }) {
  const { tieneContexto } = useEmpresaContext()

  if (!tieneContexto) {
    // Si no hay contexto, redirigir a selección de periodo
    return <Navigate to="/seleccion-periodo" replace />
  }

  return children
}