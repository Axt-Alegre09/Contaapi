/**
 * Servicio de Gestión de Equipo - Versión Profesional
 * 
 * Este servicio utiliza funciones RPC (Remote Procedure Calls) con SECURITY DEFINER
 * para operaciones seguras que bypassean RLS de forma controlada.
 * 
 * Arquitectura:
 * - Todas las operaciones críticas usan funciones RPC en lugar de queries directas
 * - Las funciones RPC tienen validaciones de seguridad a nivel de base de datos
 * - RLS está habilitado para protección adicional
 * - Auditoría automática mediante triggers
 */

import { supabase } from '../configuracion/supabase'

export const equipoServicio = {
  /**
   * Invitar nuevo usuario al equipo
   * Valida que el email no exista y crea invitación pendiente
   * El webhook se encarga de enviar el email automáticamente
   */
  async invitarUsuario(empresaId, email, rol) {
    try {
      // 1. Verificar si el email ya está registrado en el sistema
      const { data: emailExists, error: checkError } = await supabase
        .rpc('verificar_email_existente', { p_email: email })

      if (checkError) {
        console.error('Error al verificar email:', checkError)
        // Continuamos aunque falle la verificación
      } else if (emailExists) {
        throw new Error('Este email ya está registrado en el sistema. El usuario puede solicitar acceso a tu empresa desde su cuenta.')
      }

      // 2. Verificar si ya hay una invitación pendiente para este email
      const { data: invitacionPendiente } = await supabase
        .from('invitaciones_pendientes')
        .select('id, email_enviado')
        .eq('email', email)
        .eq('empresa_id', empresaId)
        .maybeSingle()

      if (invitacionPendiente) {
        if (invitacionPendiente.email_enviado) {
          throw new Error('Ya existe una invitación enviada a este email. El usuario debe revisar su correo.')
        } else {
          // Si existe pero no se envió el email, eliminar la invitación vieja
          await supabase
            .from('invitaciones_pendientes')
            .delete()
            .eq('id', invitacionPendiente.id)
        }
      }

      // 3. Obtener userId actual (usuario autenticado)
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        throw new Error('No estás autenticado')
      }

      // 4. Insertar invitación (el webhook enviará el email automáticamente)
      const { data, error } = await supabase
        .from('invitaciones_pendientes')
        .insert({
          empresa_id: empresaId,
          email: email,
          rol: rol,
          invitado_por: user.id
        })
        .select()
        .single()

      if (error) throw error

      return data

    } catch (error) {
      console.error('Error en invitarUsuario:', error)
      throw error
    }
  },

  /**
   * Obtener todos los miembros de una empresa
   * Usa función RPC con SECURITY DEFINER para bypass controlado de RLS
   */
  async obtenerMiembros(empresaId) {
    const { data, error } = await supabase
      .rpc('obtener_miembros_empresa', {
        p_empresa_id: empresaId
      })

    if (error) throw error
    return data || []
  },

  /**
   * Obtener miembro específico (para verificar permisos del usuario actual)
   * Usa función RPC con validaciones de seguridad
   */
  async obtenerMiembroActual(empresaId, userId) {
    const { data, error } = await supabase
      .rpc('obtener_miembro_actual', {
        p_empresa_id: empresaId,
        p_user_id: userId
      })

    if (error) throw error
    return data?.[0] || null
  },

  /**
   * Cambiar rol de un miembro
   * Usa función RPC con validaciones (no permite cambiar rol de owner)
   */
  async cambiarRol(miembroId, nuevoRol) {
    const { data, error } = await supabase
      .rpc('cambiar_rol_miembro', {
        p_miembro_id: miembroId,
        p_nuevo_rol: nuevoRol
      })

    if (error) throw error
    return data
  },

  /**
   * Desactivar miembro (suspender acceso temporal)
   * Usa función RPC con validaciones
   */
  async desactivarMiembro(miembroId) {
    const { data, error } = await supabase
      .rpc('cambiar_estado_miembro', {
        p_miembro_id: miembroId,
        p_activo: false
      })

    if (error) throw error
    return data
  },

  /**
   * Reactivar miembro (restaurar acceso)
   * Usa función RPC con validaciones
   */
  async reactivarMiembro(miembroId) {
    const { data, error } = await supabase
      .rpc('cambiar_estado_miembro', {
        p_miembro_id: miembroId,
        p_activo: true
      })

    if (error) throw error
    return data
  },

  /**
   * Eliminar miembro permanentemente
   * Usa función RPC con validaciones (no permite eliminar owner)
   * La auditoría se registra automáticamente mediante trigger
   */
  async eliminarMiembro(miembroId) {
    const { data, error } = await supabase
      .rpc('eliminar_miembro', {
        p_miembro_id: miembroId
      })

    if (error) throw error
    return data
  },

  /**
   * Actualizar permisos personalizados de un miembro
   * Usa query directa ya que RLS permite actualizar si eres owner
   */
  async actualizarPermisos(miembroId, permisos) {
    const { data, error } = await supabase
      .from('miembros_empresa')
      .update({ permisos })
      .eq('id', miembroId)
      .select()
      .single()

    if (error) throw error
    return data
  }
}