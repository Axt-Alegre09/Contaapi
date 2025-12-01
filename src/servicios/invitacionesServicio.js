/**
 * Servicio de Invitaciones - Sistema Manual (sin envío automático de emails)
 */

import { supabase } from '../configuracion/supabase'

export const invitacionesServicio = {
  /**
   * Invitar nuevo usuario - Sistema Manual
   * Crea el usuario y devuelve las credenciales para que el admin las comparta
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
      await supabase
        .from('invitaciones_pendientes')
        .delete()
        .eq('email', email)
        .eq('empresa_id', empresaId)

      // 3. Crear invitación
      // Nota: El password_temporal se genera automáticamente por el trigger
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

      // 4. Esperar un momento para que el webhook intente ejecutarse
      // (aunque falle el email, el usuario ya está creado)
      await new Promise(resolve => setTimeout(resolve, 2000))

      // 5. Obtener la invitación actualizada con el password
      const { data: invitacionActualizada, error: fetchError } = await supabase
        .from('invitaciones_pendientes')
        .select('*')
        .eq('id', data.id)
        .single()

      if (fetchError) {
        console.error('⚠️ Error al obtener invitación actualizada:', fetchError)
        // Devolver los datos originales si falla
        return data
      }

      console.log('✅ Invitación con credenciales:', invitacionActualizada)
      return invitacionActualizada

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