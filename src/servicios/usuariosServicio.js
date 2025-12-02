/**
 * Servicio de Gestión de Usuarios - ContaAPI v2
 * VERSIÓN FINAL - Usa función RPC crear_usuario_completo
 * src/servicios/usuariosServicio.js
 */

import { supabase } from '../configuracion/supabase'

export const usuariosServicio = {
  /**
   * Crear nuevo usuario usando función RPC
   */
  async crearUsuario({ email, password, nombreCompleto, rol, empresaId, periodos = [], fechaDesde = new Date().toISOString().split('T')[0], fechaHasta = null }) {
    try {
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
      
      if (error) {
        console.error('Error en crear_usuario_completo:', error)
        throw error
      }
      
      return data
    } catch (error) {
      console.error('Error creando usuario:', error)
      throw error
    }
  },

  /**
   * Obtener todos los usuarios de una empresa
   */
  async obtenerUsuarios(empresaId) {
    const { data, error } = await supabase.rpc('obtener_usuarios_empresa', { 
      p_empresa_id: empresaId 
    })
    
    if (error) throw error
    
    // Manejar diferentes formatos de respuesta
    if (!data) return []
    if (typeof data === 'string') {
      try {
        return JSON.parse(data)
      } catch (e) {
        console.error('Error parseando respuesta:', e)
        return []
      }
    }
    if (Array.isArray(data)) return data
    if (typeof data === 'object' && data.length !== undefined) {
      return Array.from(data)
    }
    
    return []
  },

  /**
   * Modificar usuario existente
   */
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

  /**
   * Eliminar usuario (soft delete)
   */
  async eliminarUsuario(userId, empresaId) {
    const { data, error } = await supabase.rpc('eliminar_usuario', { 
      p_user_id: userId, 
      p_empresa_id: empresaId 
    })
    
    if (error) throw error
    return data
  },

  /**
   * Cambiar estado de usuario
   */
  async cambiarEstado(userId, empresaId, nuevoEstado) {
    const { data, error } = await supabase.rpc('cambiar_estado_usuario', { 
      p_user_id: userId, 
      p_empresa_id: empresaId, 
      p_nuevo_estado: nuevoEstado 
    })
    
    if (error) throw error
    return data
  },

  /**
   * Cambiar contraseña de usuario
   */
  async cambiarPassword(userId, empresaId, nuevaPassword) {
    const { data, error } = await supabase.rpc('cambiar_password_usuario', { 
      p_user_id: userId, 
      p_empresa_id: empresaId, 
      p_nueva_password: nuevaPassword 
    })
    
    if (error) throw error
    return data
  },

  /**
   * Obtener periodos contables disponibles
   */
  async obtenerPeriodosDisponibles(empresaId) {
    const { data, error } = await supabase.rpc('obtener_periodos_disponibles', { 
      p_empresa_id: empresaId 
    })
    
    if (error) throw error
    return data || []
  },

  /**
   * Generar contraseña segura aleatoria
   */
  generarPassword() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@#$%&*'
    let pwd = ''
    for (let i = 0; i < 12; i++) {
      pwd += chars[Math.floor(Math.random() * chars.length)]
    }
    return pwd
  },

  /**
   * Validar formato de email
   */
  validarEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  },

  /**
   * Validar fortaleza de contraseña
   */
  validarPassword(password) {
    const errores = []
    if (password.length < 8) errores.push('Mínimo 8 caracteres')
    if (!/[A-Z]/.test(password)) errores.push('Requiere mayúscula')
    if (!/[a-z]/.test(password)) errores.push('Requiere minúscula')
    if (!/[0-9]/.test(password)) errores.push('Requiere número')
    return { 
      valida: errores.length === 0, 
      errores 
    }
  },

  /**
   * Obtener años disponibles para periodos contables
   */
  obtenerAniosDisponibles() {
    const añoActual = new Date().getFullYear()
    return Array.from({ length: 8 }, (_, i) => añoActual - 5 + i)
  }
}

export default usuariosServicio