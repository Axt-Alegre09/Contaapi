import { supabase } from '../configuracion/supabase'

export const servicioPlanes = {
  // Obtener todos los planes activos
  async obtenerPlanes() {
    const { data, error } = await supabase
      .from('planes')
      .select('*')
      .eq('activo', true)
      .order('precio_guaranies', { ascending: true })
    
    if (error) throw error
    return data
  },

  // Obtener suscripción activa del usuario
  async obtenerSuscripcionActual() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('No autenticado')

    const { data, error } = await supabase
      .from('suscripciones')
      .select(`
        *,
        plan:planes(*)
      `)
      .eq('user_id', user.id)
      .eq('estado', 'activo')
      .single()
    
    if (error && error.code !== 'PGRST116') throw error
    return data
  },

  // Verificar si el plan está vencido
  esPlanVencido(fechaVencimiento) {
    return new Date(fechaVencimiento) < new Date()
  },

  // Calcular días restantes
  diasRestantes(fechaVencimiento) {
    const hoy = new Date()
    const vencimiento = new Date(fechaVencimiento)
    const diferencia = vencimiento - hoy
    return Math.ceil(diferencia / (1000 * 60 * 60 * 24))
  },

  // Crear solicitud de pago
  async crearSolicitudPago(solicitud) {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('No autenticado')

    const { data, error } = await supabase
      .from('solicitudes_pago')
      .insert({
        user_id: user.id,
        ...solicitud
      })
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  // Subir comprobante
  async subirComprobante(archivo, solicitudId) {
    const extension = archivo.name.split('.').pop()
    const nombreArchivo = `comprobante-${solicitudId}.${extension}`
    const rutaArchivo = `comprobantes/${nombreArchivo}`

    const { data, error } = await supabase.storage
      .from('contaapi')
      .upload(rutaArchivo, archivo, {
        cacheControl: '3600',
        upsert: false
      })

    if (error) throw error

    const { data: { publicUrl } } = supabase.storage
      .from('contaapi')
      .getPublicUrl(rutaArchivo)

    return publicUrl
  },
    // Actualizar URL del comprobante
  async actualizarComprobante(solicitudId, comprobanteUrl) {
    const { error } = await supabase
      .from('solicitudes_pago')
      .update({ comprobante_url: comprobanteUrl })
      .eq('id', solicitudId)
    
    if (error) throw error
  }
}

