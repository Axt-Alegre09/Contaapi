/**
 * Servicio de Invitaciones - Versión Simplificada
 */

import { supabase } from '../configuracion/supabase'

export const invitacionesServicio = {
  /**
   * Invitar nuevo usuario - VERSIÓN SIMPLIFICADA
   */
  async crearInvitacion(empresaId, email, rol) {
    try {
      console.log('🔵 Iniciando invitación:', { empresaId, email, rol })

      // 1. Obtener userId actual
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      
      if (authError) {
        console.error('❌ Error de autenticación:', authError)
        throw new Error('Error de autenticación: ' + authError.message)
      }
      
      if (!user) {
        console.error('❌ Usuario no autenticado')
        throw new Error('No estás autenticado')
      }

      console.log('✅ Usuario autenticado:', user.id)

      // 2. Eliminar invitación anterior si existe (para permitir reenvíos)
      console.log('🔵 Eliminando invitaciones anteriores...')
      const { error: deleteError } = await supabase
        .from('invitaciones_pendientes')
        .delete()
        .eq('email', email)
        .eq('empresa_id', empresaId)

      if (deleteError) {
        console.warn('⚠️ Error al eliminar invitación anterior:', deleteError)
        // No lanzar error, continuar
      }

      // 3. Crear invitación
      console.log('🔵 Creando invitación...')
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

      if (error) {
        console.error('❌ Error al crear invitación:', error)
        throw new Error('Error al crear invitación: ' + error.message)
      }

      console.log('✅ Invitación creada:', data)
      return data

    } catch (error) {
      console.error('❌ Error en crearInvitacion:', error)
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
  }
}