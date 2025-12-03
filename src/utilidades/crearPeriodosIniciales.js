/**
 * Script para crear periodos fiscales iniciales
 * src/utilidades/crearPeriodosIniciales.js
 */

import { supabase } from '../configuracion/supabase'

export async function crearPeriodosIniciales() {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('No hay usuario autenticado')

    // Verificar si ya tiene periodos
    const { data: periodosExistentes } = await supabase
      .from('periodos_fiscales')
      .select('id')
      .eq('user_id', user.id)
      .limit(1)

    if (periodosExistentes && periodosExistentes.length > 0) {
      console.log('El usuario ya tiene periodos fiscales')
      return false // Ya existen periodos
    }

    // Crear periodos para los últimos 3 años
    const añoActual = new Date().getFullYear()
    const periodos = []

    for (let i = 0; i < 3; i++) {
      const año = añoActual - i
      periodos.push({
        user_id: user.id,
        nombre: `Ejercicio Fiscal ${año}`,
        anio: año,
        fecha_desde: `${año}-01-01`,
        fecha_hasta: `${año}-12-31`,
        activo: true
      })
    }

    const { error } = await supabase
      .from('periodos_fiscales')
      .insert(periodos)

    if (error) throw error

    console.log('✅ Periodos fiscales creados exitosamente:', periodos.length)
    return true // Periodos creados exitosamente
  } catch (error) {
    console.error('❌ Error al crear periodos:', error)
    throw error
  }
}