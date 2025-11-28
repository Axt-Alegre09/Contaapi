import { useState, useEffect } from 'react'
import { equipoServicio } from '../servicios/equipoServicio'

export function useMiembrosEmpresa(empresaId) {
  const [miembros, setMiembros] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!empresaId) return
    cargarMiembros()
  }, [empresaId])

  const cargarMiembros = async () => {
    try {
      setCargando(true)
      setError(null)
      const data = await equipoServicio.obtenerMiembros(empresaId)
      setMiembros(data)
    } catch (err) {
      console.error('Error al cargar miembros:', err)
      setError(err.message)
    } finally {
      setCargando(false)
    }
  }

  const cambiarRol = async (miembroId, nuevoRol) => {
    try {
      await equipoServicio.cambiarRol(miembroId, nuevoRol)
      await cargarMiembros()
    } catch (err) {
      throw err
    }
  }

  const desactivar = async (miembroId) => {
    try {
      await equipoServicio.desactivarMiembro(miembroId)
      await cargarMiembros()
    } catch (err) {
      throw err
    }
  }

  const reactivar = async (miembroId) => {
    try {
      await equipoServicio.reactivarMiembro(miembroId)
      await cargarMiembros()
    } catch (err) {
      throw err
    }
  }

  const eliminar = async (miembroId) => {
    try {
      await equipoServicio.eliminarMiembro(miembroId)
      await cargarMiembros()
    } catch (err) {
      throw err
    }
  }

  return {
    miembros,
    cargando,
    error,
    recargar: cargarMiembros,
    cambiarRol,
    desactivar,
    reactivar,
    eliminar
  }
}