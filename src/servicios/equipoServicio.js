/**
 * ============================================================================
 * SERVICIO: Gestión de Equipo - Versión Completa con Validaciones
 * ============================================================================
 * Archivo: equipoServicio.js
 * Ubicación: C:\AppContabilidad\src\servicios\equipoServicio.js
 * 
 * Arquitectura:
 * - Validación de emails existentes antes de invitar
 * - Invitaciones automáticas con envío de credenciales por email
 * - Funciones RPC con SECURITY DEFINER para bypass controlado de RLS
 * - Auditoría automática mediante triggers
 * ============================================================================
 */

import { supabase } from '../configuracion/supabase'

/**
 * Invitar nuevo usuario al equipo
 * Valida que el email no exista y crea invitación pendiente
 * El webhook se encarga de enviar el email automáticamente
 */
export const invitarUsuario = async (empresaId, email, rol) => {
  try {
    // 1. Verificar si el email ya está registrado en el sistema
    const { data: emailExists, error: checkError } = await supabase
      .rpc('verificar_email_existente', { p_email: email })

    if (checkError) {
      console.error('Error al verificar email:', checkError)
      // Continuamos aunque falle la verificación
    } else if (emailExists) {
      return {
        success: false,
        error: 'Este email ya está registrado en el sistema. El usuario puede solicitar acceso a tu empresa desde su cuenta.'
      }
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
        return {
          success: false,
          error: 'Ya existe una invitación enviada a este email. El usuario debe revisar su correo.'
        }
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
      return { success: false, error: 'No estás autenticado' }
    }

    // 4. Insertar invitación
    // El webhook automáticamente:
    // - Creará el usuario en auth.users
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

    if (error) {
      console.error('Error al crear invitación:', error)
      return { 
        success: false, 
        error: 'Error al enviar invitación: ' + error.message 
      }
    }

    return {
      success: true,
      message: 'Invitación enviada correctamente. El usuario recibirá un email con sus credenciales en unos segundos.',
      data: data
    }

  } catch (error) {
    console.error('Error en invitarUsuario:', error)
    return {
      success: false,
      error: 'Error inesperado: ' + error.message
    }
  }
}

/**
 * Obtener todos los miembros de una empresa
 * Usa función RPC con SECURITY DEFINER para bypass controlado de RLS
 */
export const obtenerMiembros = async (empresaId) => {
  try {
    const { data, error } = await supabase
      .rpc('obtener_miembros_empresa', {
        p_empresa_id: empresaId
      })

    if (error) throw error
    
    return { 
      success: true, 
      data: data || [] 
    }

  } catch (error) {
    console.error('Error al obtener miembros:', error)
    return { 
      success: false, 
      error: error.message,
      data: []
    }
  }
}

/**
 * Obtener miembro específico (para verificar permisos del usuario actual)
 * Usa función RPC con validaciones de seguridad
 */
export const obtenerMiembroActual = async (empresaId, userId) => {
  try {
    const { data, error } = await supabase
      .rpc('obtener_miembro_actual', {
        p_empresa_id: empresaId,
        p_user_id: userId
      })

    if (error) throw error
    
    return {
      success: true,
      data: data?.[0] || null
    }

  } catch (error) {
    console.error('Error al obtener miembro actual:', error)
    return {
      success: false,
      error: error.message,
      data: null
    }
  }
}

/**
 * Cambiar rol de un miembro
 * Usa función RPC con validaciones (no permite cambiar rol de owner)
 */
export const cambiarRolMiembro = async (miembroId, nuevoRol) => {
  try {
    const { data, error } = await supabase
      .rpc('cambiar_rol_miembro', {
        p_miembro_id: miembroId,
        p_nuevo_rol: nuevoRol
      })

    if (error) throw error
    
    return { success: true, data }

  } catch (error) {
    console.error('Error al cambiar rol:', error)
    return { 
      success: false, 
      error: error.message 
    }
  }
}

/**
 * Cambiar estado de un miembro (activar/desactivar)
 */
export const cambiarEstadoMiembro = async (miembroId, nuevoEstado) => {
  try {
    const { data, error } = await supabase
      .rpc('cambiar_estado_miembro', {
        p_miembro_id: miembroId,
        p_activo: nuevoEstado
      })

    if (error) throw error
    
    return { success: true, data }

  } catch (error) {
    console.error('Error al cambiar estado:', error)
    return { 
      success: false, 
      error: error.message 
    }
  }
}

/**
 * Desactivar miembro (suspender acceso temporal)
 */
export const desactivarMiembro = async (miembroId) => {
  return cambiarEstadoMiembro(miembroId, false)
}

/**
 * Reactivar miembro (restaurar acceso)
 */
export const reactivarMiembro = async (miembroId) => {
  return cambiarEstadoMiembro(miembroId, true)
}

/**
 * Eliminar miembro permanentemente
 * Usa función RPC con validaciones (no permite eliminar owner)
 * La auditoría se registra automáticamente mediante trigger
 */
export const eliminarMiembro = async (miembroId) => {
  try {
    const { data, error } = await supabase
      .rpc('eliminar_miembro', {
        p_miembro_id: miembroId
      })

    if (error) throw error
    
    return { success: true, data }

  } catch (error) {
    console.error('Error al eliminar miembro:', error)
    return { 
      success: false, 
      error: error.message 
    }
  }
}

/**
 * Actualizar permisos personalizados de un miembro
 * Usa query directa ya que RLS permite actualizar si eres owner
 */
export const actualizarPermisos = async (miembroId, permisos) => {
  try {
    const { data, error } = await supabase
      .from('miembros_empresa')
      .update({ permisos })
      .eq('id', miembroId)
      .select()
      .single()

    if (error) throw error
    
    return { success: true, data }

  } catch (error) {
    console.error('Error al actualizar permisos:', error)
    return { 
      success: false, 
      error: error.message 
    }
  }
}

/**
 * Obtener invitaciones pendientes de una empresa
 */
export const obtenerInvitacionesPendientes = async (empresaId) => {
  try {
    const { data, error } = await supabase
      .from('invitaciones_pendientes')
      .select('*')
      .eq('empresa_id', empresaId)
      .order('created_at', { ascending: false })

    if (error) throw error
    
    return {
      success: true,
      data: data || []
    }

  } catch (error) {
    console.error('Error al obtener invitaciones pendientes:', error)
    return {
      success: false,
      error: error.message,
      data: []
    }
  }
}

/**
 * Cancelar una invitación pendiente
 */
export const cancelarInvitacion = async (invitacionId) => {
  try {
    const { error } = await supabase
      .from('invitaciones_pendientes')
      .delete()
      .eq('id', invitacionId)

    if (error) throw error
    
    return { success: true }

  } catch (error) {
    console.error('Error al cancelar invitación:', error)
    return {
      success: false,
      error: error.message
    }
  }
}

/**
 * Reenviar invitación (elimina la anterior y crea una nueva)
 */
export const reenviarInvitacion = async (empresaId, email, rol) => {
  try {
    // Eliminar invitación anterior
    await supabase
      .from('invitaciones_pendientes')
      .delete()
      .eq('email', email)
      .eq('empresa_id', empresaId)

    // Crear nueva invitación
    return await invitarUsuario(empresaId, email, rol)

  } catch (error) {
    console.error('Error al reenviar invitación:', error)
    return {
      success: false,
      error: error.message
    }
  }
}

// Exportar como objeto para compatibilidad
export const equipoServicio = {
  invitarUsuario,
  obtenerMiembros,
  obtenerMiembroActual,
  cambiarRolMiembro,
  cambiarEstadoMiembro,
  desactivarMiembro,
  reactivarMiembro,
  eliminarMiembro,
  actualizarPermisos,
  obtenerInvitacionesPendientes,
  cancelarInvitacion,
  reenviarInvitacion
}

export default equipoServicio