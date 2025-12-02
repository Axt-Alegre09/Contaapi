/**
 * Servicio de Usuarios - ACTUALIZADO CON ADMIN API
 * Usa Supabase Admin API en lugar de insertar directamente en auth.users
 * src/servicios/usuariosServicio.js
 */

import { supabase } from '../configuracion/supabase'

export const usuariosServicio = {
  async crearUsuario({ email, password, nombreCompleto, rol, empresaId, periodos = [], fechaDesde = new Date().toISOString().split('T')[0], fechaHasta = null }) {
    try {
      // PASO 1: Crear usuario en Supabase Auth usando Admin API
      // Nota: Esto requiere que el usuario actual tenga permisos de service_role
      // O podemos crear el usuario con signUp y luego asignarlo a la empresa
      
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: email,
        password: password,
        options: {
          data: {
            nombre_completo: nombreCompleto
          },
          emailRedirectTo: window.location.origin
        }
      })

      if (authError) throw authError
      if (!authData.user) throw new Error('No se pudo crear el usuario')

      const userId = authData.user.id

      // PASO 2: Crear perfil de usuario
      const { error: perfilError } = await supabase
        .from('perfiles_usuario')
        .insert({
          user_id: userId,
          nombre_completo: nombreCompleto,
          email: email
        })

      if (perfilError) throw perfilError

      // PASO 3: Obtener número interno
      const { data: maxNumero } = await supabase
        .from('usuarios_empresas')
        .select('numero_interno')
        .eq('empresa_id', empresaId)
        .order('numero_interno', { ascending: false })
        .limit(1)
        .single()

      const numeroInterno = (maxNumero?.numero_interno || 0) + 1

      // PASO 4: Crear relación usuario-empresa
      const { error: relacionError } = await supabase
        .from('usuarios_empresas')
        .insert({
          user_id: userId,
          empresa_id: empresaId,
          rol: rol,
          estado: 'activo',
          numero_interno: numeroInterno,
          fecha_desde: fechaDesde,
          fecha_hasta: fechaHasta,
          invitado_por: (await supabase.auth.getUser()).data.user?.id,
          aceptado_en: new Date().toISOString()
        })

      if (relacionError) throw relacionError

      // PASO 5: Asignar periodos
      if (periodos && periodos.length > 0) {
        // Obtener ID de usuario_empresa recién creado
        const { data: usuarioEmpresa } = await supabase
          .from('usuarios_empresas')
          .select('id')
          .eq('user_id', userId)
          .eq('empresa_id', empresaId)
          .single()

        if (usuarioEmpresa) {
          for (const anio of periodos) {
            // Buscar o crear periodo
            let { data: periodo } = await supabase
              .from('periodos_contables')
              .select('id')
              .eq('empresa_id', empresaId)
              .eq('anio', anio)
              .eq('tipo', 'anual')
              .single()

            if (!periodo) {
              const { data: nuevoPeriodo } = await supabase
                .from('periodos_contables')
                .insert({
                  empresa_id: empresaId,
                  anio: anio,
                  tipo: 'anual',
                  numero: 1,
                  fecha_inicio: `${anio}-01-01`,
                  fecha_fin: `${anio}-12-31`,
                  cerrado: false
                })
                .select('id')
                .single()

              periodo = nuevoPeriodo
            }

            if (periodo) {
              await supabase
                .from('usuarios_periodos')
                .insert({
                  usuario_empresa_id: usuarioEmpresa.id,
                  periodo_id: periodo.id,
                  puede_leer: true,
                  puede_escribir: ['propietario', 'administrador', 'contador'].includes(rol),
                  puede_cerrar: ['propietario', 'administrador'].includes(rol)
                })
            }
          }
        }
      }

      // Retornar respuesta
      return {
        success: true,
        user_id: userId,
        email: email,
        nombre_completo: nombreCompleto,
        password: password,
        rol: rol,
        numero_interno: numeroInterno,
        empresa_id: empresaId,
        mensaje: 'Usuario creado exitosamente. Puede iniciar sesión inmediatamente.'
      }

    } catch (error) {
      console.error('Error creando usuario:', error)
      throw error
    }
  },

  async obtenerUsuarios(empresaId) {
    const { data, error } = await supabase.rpc('obtener_usuarios_empresa', { p_empresa_id: empresaId })
    if (error) throw error
    
    if (!data) return []
    if (typeof data === 'string') {
      try {
        return JSON.parse(data)
      } catch (e) {
        return []
      }
    }
    if (Array.isArray(data)) return data
    if (typeof data === 'object' && data.length !== undefined) return Array.from(data)
    return []
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