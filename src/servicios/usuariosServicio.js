/**
 * Servicio de Gestión de Usuarios - ContaAPI v2
 * src/servicios/usuariosServicio.js
 */

import { supabase } from '../configuracion/supabase'

export const usuariosServicio = {
  async crearUsuario({ email, password, nombreCompleto, rol, empresaId, periodos = [], fechaDesde = new Date().toISOString().split('T')[0], fechaHasta = null }) {
    const { data, error } = await supabase.rpc('crear_usuario_completo', {
      p_email: email,
      p_password: password,
      p_nombre_completo: nombreCompleto,
      p_rol: rol,
      p_empresa_id: empresaId,
      p_periodos: periodos,
      p_fecha_desde: fechaDesde,
      p_fecha_hasta: fechaHasta
    })
    if (error) throw error
    return data
  },

  async obtenerUsuarios(empresaId) {
    const { data, error } = await supabase.rpc('obtener_usuarios_empresa', { p_empresa_id: empresaId })
    if (error) throw error
    return data || []
  },

  async modificarUsuario({ userId, empresaId, nombreCompleto = null, telefono = null, rol = null, estado = null, fechaDesde = null, fechaHasta = null, periodos = null }) {
    const { data, error } = await supabase.rpc('modificar_usuario', {
      p_user_id: userId,
      p_empresa_id: empresaId,
      p_nombre_completo: nombreCompleto,
      p_telefono: telefono,
      p_rol: rol,
      p_estado: estado,
      p_fecha_desde: fechaDesde,
      p_fecha_hasta: fechaHasta,
      p_periodos: periodos
    })
    if (error) throw error
    return data
  },

  async eliminarUsuario(userId, empresaId) {
    const { data, error } = await supabase.rpc('eliminar_usuario', { p_user_id: userId, p_empresa_id: empresaId })
    if (error) throw error
    return data
  },

  async cambiarEstado(userId, empresaId, nuevoEstado) {
    const { data, error } = await supabase.rpc('cambiar_estado_usuario', { p_user_id: userId, p_empresa_id: empresaId, p_nuevo_estado: nuevoEstado })
    if (error) throw error
    return data
  },

  async cambiarPassword(userId, empresaId, nuevaPassword) {
    const { data, error } = await supabase.rpc('cambiar_password_usuario', { p_user_id: userId, p_empresa_id: empresaId, p_nueva_password: nuevaPassword })
    if (error) throw error
    return data
  },

  async obtenerPeriodosDisponibles(empresaId) {
    const { data, error } = await supabase.rpc('obtener_periodos_disponibles', { p_empresa_id: empresaId })
    if (error) throw error
    return data || []
  },

  generarPassword() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@#$%&*'
    let pwd = ''
    for (let i = 0; i < 12; i++) pwd += chars[Math.floor(Math.random() * chars.length)]
    return pwd
  },

  validarEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  },

  validarPassword(password) {
    const errores = []
    if (password.length < 8) errores.push('Mínimo 8 caracteres')
    if (!/[A-Z]/.test(password)) errores.push('Requiere mayúscula')
    if (!/[a-z]/.test(password)) errores.push('Requiere minúscula')
    if (!/[0-9]/.test(password)) errores.push('Requiere número')
    return { valida: errores.length === 0, errores }
  },

  obtenerAniosDisponibles() {
    const año = new Date().getFullYear()
    return Array.from({ length: 8 }, (_, i) => año - 5 + i)
  }
}

export default usuariosServicio