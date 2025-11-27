import { useState, useEffect } from 'react'
import { supabase } from '../configuracion/supabase'

export function useAutenticacion() {
  const [usuario, setUsuario] = useState(null)
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    // Obtener sesión inicial
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUsuario(session?.user ?? null)
      setCargando(false)
    })

    // Escuchar cambios de autenticación
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth event:', event, session?.user?.email)
        setUsuario(session?.user ?? null)
        setCargando(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  return { usuario, cargando }
}