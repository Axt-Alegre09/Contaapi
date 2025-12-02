// src/contextos/EmpresaContext.jsx
import { createContext, useContext, useState, useEffect } from 'react'
import { supabase } from '../configuracion/supabase'

const EmpresaContext = createContext()

export function useEmpresa() {
  const context = useContext(EmpresaContext)
  if (!context) {
    throw new Error('useEmpresa debe usarse dentro de EmpresaProvider')
  }
  return context
}

export function EmpresaProvider({ children }) {
  const [empresaActual, setEmpresaActual] = useState(null)
  const [periodoActual, setPeriodoActual] = useState(null)
  const [empresasDisponibles, setEmpresasDisponibles] = useState([])
  const [rolActual, setRolActual] = useState(null)
  const [loading, setLoading] = useState(true)

  // Cargar contexto guardado al iniciar
  useEffect(() => {
    const contextoGuardado = localStorage.getItem('contaapi_contexto')
    if (contextoGuardado) {
      const contexto = JSON.parse(contextoGuardado)
      setEmpresaActual(contexto.empresa)
      setPeriodoActual(contexto.periodo)
      setRolActual(contexto.rol)
    }
    cargarEmpresas()
  }, [])

  const cargarEmpresas = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setLoading(false)
        return
      }

      // Obtener empresas del usuario desde la nueva tabla usuarios_empresas
      const { data: usuariosEmpresas, error } = await supabase
        .from('usuarios_empresas')
        .select(`
          *,
          empresas (
            id,
            nombre_comercial,
            razon_social,
            ruc,
            logo_url,
            estado
          )
        `)
        .eq('user_id', user.id)
        .eq('estado', 'activo')
        .is('deleted_at', null)

      if (error) throw error

      // Transformar datos
      const empresas = usuariosEmpresas
        .filter(ue => ue.empresas && ue.empresas.estado === 'activa')
        .map(ue => ({
          ...ue.empresas,
          rol: ue.rol,
          fecha_desde: ue.fecha_desde,
          fecha_hasta: ue.fecha_hasta,
          numero_interno: ue.numero_interno,
          periodo_fiscal: ue.periodo_fiscal
        }))

      setEmpresasDisponibles(empresas)

    } catch (error) {
      console.error('Error al cargar empresas:', error)
    } finally {
      setLoading(false)
    }
  }

  const establecerContexto = (empresa, periodo, rol) => {
    setEmpresaActual(empresa)
    setPeriodoActual(periodo)
    setRolActual(rol)
    
    // Guardar en localStorage
    const contexto = {
      empresa,
      periodo,
      rol,
      fechaSeleccion: new Date().toISOString()
    }
    localStorage.setItem('contaapi_contexto', JSON.stringify(contexto))
  }

  const seleccionarEmpresa = (empresa) => {
    setEmpresaActual(empresa)
    setRolActual(empresa.rol)
    
    // Guardar en localStorage (compatibilidad con código existente)
    localStorage.setItem('empresaActualId', empresa.id)
  }

  const limpiarContexto = () => {
    setEmpresaActual(null)
    setPeriodoActual(null)
    setRolActual(null)
    localStorage.removeItem('contaapi_contexto')
    localStorage.removeItem('empresaActualId')
  }

  const puedeGestionarUsuarios = () => {
    return rolActual === 'propietario' || rolActual === 'administrador'
  }

  const puedeEliminar = () => {
    return rolActual === 'propietario' || rolActual === 'administrador'
  }

  const puedeModificar = () => {
    return rolActual === 'propietario' || rolActual === 'administrador' || rolActual === 'contador'
  }

  const soloLectura = () => {
    return rolActual === 'auditor' || rolActual === 'invitado'
  }

  const value = {
    empresaActual,
    periodoActual,
    empresasDisponibles,
    rolActual,
    loading,
    seleccionarEmpresa,
    establecerContexto,
    limpiarContexto,
    cargarEmpresas,
    tieneContextoCompleto: !!empresaActual && !!periodoActual,
    permisos: {
      puedeGestionarUsuarios: puedeGestionarUsuarios(),
      puedeEliminar: puedeEliminar(),
      puedeModificar: puedeModificar(),
      soloLectura: soloLectura()
    }
  }

  return (
    <EmpresaContext.Provider value={value}>
      {children}
    </EmpresaContext.Provider>
  )
}

export default EmpresaContext