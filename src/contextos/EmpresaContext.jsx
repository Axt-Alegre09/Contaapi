// src/contextos/EmpresaContext.jsx
import { createContext, useContext, useState, useEffect } from 'react'

const EmpresaContext = createContext()

export function EmpresaProvider({ children }) {
  const [contextoActivo, setContextoActivo] = useState(() => {
    // Intentar cargar del localStorage
    const saved = localStorage.getItem('contaapi_contexto')
    return saved ? JSON.parse(saved) : null
  })

  // Guardar en localStorage cuando cambie
  useEffect(() => {
    if (contextoActivo) {
      localStorage.setItem('contaapi_contexto', JSON.stringify(contextoActivo))
    } else {
      localStorage.removeItem('contaapi_contexto')
    }
  }, [contextoActivo])

  const establecerContexto = (empresaId, empresaNombre, empresaRuc, periodo, periodoAnio, periodoFechas) => {
    setContextoActivo({
      empresaId,
      empresaNombre,
      empresaRuc,
      periodo,
      periodoAnio,
      periodoFechas,
      fechaSeleccion: new Date().toISOString()
    })
  }

  const limpiarContexto = () => {
    setContextoActivo(null)
    localStorage.removeItem('contaapi_contexto')
  }

  const cambiarEmpresa = () => {
    limpiarContexto()
  }

  return (
    <EmpresaContext.Provider value={{
      contextoActivo,
      establecerContexto,
      limpiarContexto,
      cambiarEmpresa,
      tieneContexto: !!contextoActivo
    }}>
      {children}
    </EmpresaContext.Provider>
  )
}

export const useEmpresaContext = () => {
  const context = useContext(EmpresaContext)
  if (!context) {
    throw new Error('useEmpresaContext debe usarse dentro de EmpresaProvider')
  }
  return context
}