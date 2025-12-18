// src/contextos/EmpresaContext.jsx
import { createContext, useContext, useState, useEffect } from 'react'

const EmpresaContext = createContext()

export const useEmpresa = () => {
  const context = useContext(EmpresaContext)
  if (!context) {
    throw new Error('useEmpresa debe usarse dentro de un EmpresaProvider')
  }
  return context
}

export const EmpresaProvider = ({ children }) => {
  const [empresaActual, setEmpresaActual] = useState(null)
  const [periodoActual, setPeriodoActual] = useState(null)
  const [rolActual, setRolActual] = useState(null)

  // Cargar desde localStorage al montar
  useEffect(() => {
    const empresaGuardada = localStorage.getItem('contaapi-empresa')
    const periodoGuardado = localStorage.getItem('contaapi-periodo')
    const rolGuardado = localStorage.getItem('contaapi-rol')

    if (empresaGuardada) {
      try {
        setEmpresaActual(JSON.parse(empresaGuardada))
      } catch (error) {
        console.error('Error parseando empresa:', error)
      }
    }

    if (periodoGuardado) {
      try {
        setPeriodoActual(JSON.parse(periodoGuardado))
      } catch (error) {
        console.error('Error parseando periodo:', error)
      }
    }

    if (rolGuardado) {
      setRolActual(rolGuardado)
    }
  }, [])

  const establecerContexto = (empresa, periodo, rol) => {
    setEmpresaActual(empresa)
    setPeriodoActual(periodo)
    setRolActual(rol)

    // Guardar en localStorage
    localStorage.setItem('contaapi-empresa', JSON.stringify(empresa))
    localStorage.setItem('contaapi-periodo', JSON.stringify(periodo))
    localStorage.setItem('contaapi-rol', rol)
  }

  const limpiarContexto = () => {
    setEmpresaActual(null)
    setPeriodoActual(null)
    setRolActual(null)

    // Limpiar localStorage
    localStorage.removeItem('contaapi-empresa')
    localStorage.removeItem('contaapi-periodo')
    localStorage.removeItem('contaapi-rol')
  }

  const actualizarEmpresa = (empresa) => {
    setEmpresaActual(empresa)
    localStorage.setItem('contaapi-empresa', JSON.stringify(empresa))
  }

  const actualizarPeriodo = (periodo) => {
    setPeriodoActual(periodo)
    localStorage.setItem('contaapi-periodo', JSON.stringify(periodo))
  }

  const value = {
    empresaActual,
    periodoActual,
    rolActual,
    establecerContexto,
    limpiarContexto,
    actualizarEmpresa,
    actualizarPeriodo,
    tieneContexto: empresaActual && periodoActual && rolActual
  }

  return (
    <EmpresaContext.Provider value={value}>
      {children}
    </EmpresaContext.Provider>
  )
}

export default EmpresaContext