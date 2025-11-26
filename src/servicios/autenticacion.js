import { supabase } from '../configuracion/supabase'

export const servicioAutenticacion = {
  // Registro con email y contraseña
  async registrar(email, password, datosUsuario = {}) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: datosUsuario
      }
    })
    
    if (error) throw error
    return data
  },

  // Login con email y contraseña
  async iniciarSesion(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })
    
    if (error) throw error
    return data
  },

  // Login con Google
  async iniciarSesionConGoogle() {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/`
      }
    })
    
    if (error) throw error
    return data
  },

  // Cerrar sesión
  async cerrarSesion() {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  },

  // Obtener usuario actual
  async obtenerUsuarioActual() {
    const { data: { user } } = await supabase.auth.getUser()
    return user
  },

  // Recuperar contraseña
  async recuperarContrasena(email) {
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/restablecer-contrasena`
    })
    
    if (error) throw error
    return data
  }
}