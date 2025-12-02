/**
 * Contexto de Empresa - ContaAPI v2
 * src/contextos/EmpresaContext.jsx
 */

import { createContext, useContext, useState, useEffect } from 'react'
import { supabase } from '../configuracion/supabase'
import { usuariosServicio } from '../servicios/usuariosServicio'

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
  const [empresasDisponibles, setEmpresasDisponibles] = useState([])
  const [rolActual, setRolActual] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
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
          numero_interno: ue.numero_interno
        }))

      setEmpresasDisponibles(empresas)

      // Si hay empresas, seleccionar la primera por defecto
      if (empresas.length > 0 && !empresaActual) {
        seleccionarEmpresa(empresas[0])
      }

    } catch (error) {
      console.error('Error al cargar empresas:', error)
    } finally {
      setLoading(false)
    }
  }

  const seleccionarEmpresa = (empresa) => {
    setEmpresaActual(empresa)
    setRolActual(empresa.rol)
    
    // Guardar en localStorage
    localStorage.setItem('empresaActualId', empresa.id)
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
    empresasDisponibles,
    rolActual,
    loading,
    seleccionarEmpresa,
    cargarEmpresas,
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