import { useState, useEffect } from 'react'
import { useAutenticacion } from './useAutenticacion'
import { equipoServicio } from '../servicios/equipoServicio'

export function usePermisos(empresaId) {
  const { usuario } = useAutenticacion()
  const [permisos, setPermisos] = useState(null)
  const [rol, setRol] = useState(null)
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    if (!empresaId || !usuario) return

    cargarPermisos()
  }, [empresaId, usuario])

  const cargarPermisos = async () => {
    try {
      setCargando(true)
      const miembro = await equipoServicio.obtenerMiembroActual(empresaId, usuario.id)
      setPermisos(miembro.permisos)
      setRol(miembro.rol)
    } catch (error) {
      console.error('Error al cargar permisos:', error)
      setPermisos(null)
      setRol(null)
    } finally {
      setCargando(false)
    }
  }

  const tienePermiso = (permiso) => {
    if (!permisos) return false
    return permisos[permiso] === true
  }

  const esOwner = () => rol === 'owner'
  const esAdmin = () => rol === 'admin' || rol === 'owner'
  const puedeAdministrarUsuarios = () => esAdmin() || tienePermiso('administrar_usuarios')

  return {
    permisos,
    rol,
    cargando,
    tienePermiso,
    esOwner,
    esAdmin,
    puedeAdministrarUsuarios
  }
}