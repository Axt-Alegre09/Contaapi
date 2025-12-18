// src/componentes/RequiereContexto.jsx
import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useEmpresa } from '../contextos/EmpresaContext'

export const RequiereContexto = ({ children }) => {
  const { empresaActual, periodoActual, rolActual } = useEmpresa()
  const navigate = useNavigate()

  useEffect(() => {
    // Si no hay contexto completo, redirigir a selección de periodo
    if (!empresaActual || !periodoActual || !rolActual) {
      console.log('Contexto incompleto, redirigiendo...')
      navigate('/seleccion-periodo', { replace: true })
    }
  }, [empresaActual, periodoActual, rolActual, navigate])

  // Si no hay contexto, no renderizar nada (mientras redirige)
  if (!empresaActual || !periodoActual || !rolActual) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 dark:border-blue-400 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Verificando contexto...</p>
        </div>
      </div>
    )
  }

  return children
}

export default RequiereContexto