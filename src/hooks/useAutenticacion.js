import { useState, useEffect } from 'react'
import { supabase } from '../configuracion/supabase'

export function useAutenticacion() {
  const [usuario, setUsuario] = useState(null)
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    // Verificar sesión actual
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUsuario(session?.user ?? null)
      setCargando(false)
    })

    // Escuchar cambios de autenticación
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUsuario(session?.user ?? null)
      setCargando(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  return { usuario, cargando }
}