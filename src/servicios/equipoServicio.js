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