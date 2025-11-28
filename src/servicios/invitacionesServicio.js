import { supabase } from '../configuracion/supabase'

export const invitacionesServicio = {
  // Crear invitación
  async crearInvitacion(empresaId, email, rol) {
    const { data, error } = await supabase
      .from('invitaciones_pendientes')
      .insert({
        empresa_id: empresaId,
        email: email,
        rol: rol,
        invitado_por: (await supabase.auth.getUser()).data.user.id
      })
      .select()
      .single()

    if (error) throw error
    
    // TODO: Aquí enviarías el email con el token
    // await enviarEmailInvitacion(email, data.token)
    
    return data
  },

  // Obtener invitaciones pendientes de una empresa
  async obtenerInvitacionesPendientes(empresaId) {
    const { data, error } = await supabase
      .from('invitaciones_pendientes')
      .select('*')
      .eq('empresa_id', empresaId)
      .eq('aceptada', false)
      .gt('fecha_expiracion', new Date().toISOString())

    if (error) throw error
    return data
  },

  // Verificar invitación por token
  async verificarInvitacion(token) {
    const { data, error } = await supabase
      .from('invitaciones_pendientes')
      .select(`
        *,
        empresa:empresas(nombre_comercial, ruc, logo_url)
      `)
      .eq('token', token)
      .eq('aceptada', false)
      .gt('fecha_expiracion', new Date().toISOString())
      .single()

    if (error) throw error
    return data
  },

  // Aceptar invitación
  async aceptarInvitacion(token) {
    const { data: user } = await supabase.auth.getUser()
    
    // Obtener datos de la invitación
    const invitacion = await this.verificarInvitacion(token)
    
    // Crear el miembro
    const { data: miembro, error: errorMiembro } = await supabase
      .from('miembros_empresa')
      .insert({
        empresa_id: invitacion.empresa_id,
        user_id: user.user.id,
        rol: invitacion.rol,
        permisos: invitacion.permisos,
        invitado_por: invitacion.invitado_por,
        fecha_aceptacion: new Date().toISOString()
      })
      .select()
      .single()

    if (errorMiembro) throw errorMiembro

    // Marcar invitación como aceptada
    const { error: errorInvitacion } = await supabase
      .from('invitaciones_pendientes')
      .update({ aceptada: true })
      .eq('token', token)

    if (errorInvitacion) throw errorInvitacion

    return miembro
  },

  // Cancelar invitación
  async cancelarInvitacion(invitacionId) {
    const { error } = await supabase
      .from('invitaciones_pendientes')
      .delete()
      .eq('id', invitacionId)

    if (error) throw error
  }
}