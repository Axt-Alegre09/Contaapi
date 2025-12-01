/**
 * Servicio de Invitaciones - Sistema con Email Automático
 * 
 * El sistema funciona así:
 * 1. Se inserta en invitaciones_pendientes
 * 2. El webhook dispara automáticamente
 * 3. El edge function crea el usuario y envía email con credenciales
 * 4. El usuario puede entrar directamente con las credenciales
 */

import { supabase } from '../configuracion/supabase'

export const invitacionesServicio = {
  /**
   * Invitar nuevo usuario
   * Valida email y crea invitación que dispara envío automático de email
   */
  async crearInvitacion(empresaId, email, rol) {
    try {
      // 1. Verificar si el email ya está registrado
      const { data: emailExists, error: checkError } = await supabase
        .rpc('verificar_email_existente', { p_email: email })

      if (checkError) {
        console.error('Error al verificar email:', checkError)
      } else if (emailExists) {
        throw new Error('Este email ya está registrado en el sistema.')
      }

      // 2. Verificar si ya hay una invitación pendiente
      const { data: invitacionPendiente } = await supabase
        .from('invitaciones_pendientes')
        .select('id, email_enviado')
        .eq('email', email)
        .eq('empresa_id', empresaId)
        .maybeSingle()

      if (invitacionPendiente) {
        if (invitacionPendiente.email_enviado) {
          throw new Error('Ya existe una invitación enviada a este email.')
        } else {
          // Eliminar invitación vieja que no se envió
          await supabase
            .from('invitaciones_pendientes')
            .delete()
            .eq('id', invitacionPendiente.id)
        }
      }

      // 3. Obtener userId actual
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        throw new Error('No estás autenticado')
      }

      // 4. Crear invitación
      // El webhook automáticamente:
      // - Creará el usuario
      // - Enviará email con credenciales
      // - Actualizará email_enviado = true
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
      console.error('Error al crear invitación:', error)
      throw error
    }
  },

  /**
   * Obtener invitaciones pendientes de una empresa
   */
  async obtenerInvitacionesPendientes(empresaId) {
    try {
      const { data, error } = await supabase
        .from('invitaciones_pendientes')
        .select('*')
        .eq('empresa_id', empresaId)
        .order('created_at', { ascending: false })

      if (error) throw error
      return data || []

    } catch (error) {
      console.error('Error al obtener invitaciones:', error)
      throw error
    }
  },

  /**
   * Cancelar invitación pendiente
   */
  async cancelarInvitacion(invitacionId) {
    try {
      const { error } = await supabase
        .from('invitaciones_pendientes')
        .delete()
        .eq('id', invitacionId)

      if (error) throw error

    } catch (error) {
      console.error('Error al cancelar invitación:', error)
      throw error
    }
  },

  /**
   * Reenviar invitación (elimina la anterior y crea una nueva)
   */
  async reenviarInvitacion(empresaId, email, rol) {
    try {
      // Eliminar invitación anterior
      await supabase
        .from('invitaciones_pendientes')
        .delete()
        .eq('email', email)
        .eq('empresa_id', empresaId)

      // Crear nueva invitación
      return await this.crearInvitacion(empresaId, email, rol)

    } catch (error) {
      console.error('Error al reenviar invitación:', error)
      throw error
    }
  }
}