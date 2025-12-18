/**
 * SERVICIO: Plan de Cuentas
 * Adaptado para tabla con columna 'activo' (boolean)
 */

import { supabase } from '../configuracion/supabase';

/**
 * Listar cuentas contables de una empresa
 */
export const listar = async (empresaId, soloActivas = true) => {
  try {
    const { data, error } = await supabase.rpc('listar_plan_cuentas_jerarquico', {
      p_empresa_id: empresaId,
      p_solo_activas: soloActivas
    });

    if (error) throw error;

    return {
      success: true,
      data: data || []
    };
  } catch (error) {
    console.error('Error en listar cuentas:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Buscar cuentas con filtros
 */
export const buscar = async (empresaId, filtros = {}) => {
  try {
    const { data, error } = await supabase.rpc('buscar_cuentas', {
      p_empresa_id: empresaId,
      p_termino: filtros.termino || null,
      p_nivel: filtros.nivel || null,
      p_tipo_cuenta: filtros.tipoCuenta || null,
      p_solo_imputables: filtros.soloImputables || false,
      p_solo_activas: filtros.soloActivas !== undefined ? filtros.soloActivas : true
    });

    if (error) throw error;

    return {
      success: true,
      data: data || []
    };
  } catch (error) {
    console.error('Error en buscar cuentas:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Crear nueva cuenta contable
 */
export const crear = async (datos) => {
  try {
    const { data, error } = await supabase
      .from('plan_cuentas')
      .insert({
        empresa_id: datos.empresa_id,
        codigo: datos.codigo,
        nombre: datos.nombre,
        cuenta_padre_id: datos.cuenta_padre_id || null,
        nivel: datos.nivel,
        tipo_cuenta: datos.tipo_cuenta,
        naturaleza: datos.naturaleza,
        es_imputable: datos.es_imputable || false,
        requiere_tercero: datos.requiere_tercero || false,
        requiere_documento: datos.requiere_documento || false,
        categoria_iva: datos.categoria_iva || null,
        codigo_impositivo: datos.codigo_impositivo || null,
        descripcion: datos.descripcion || null,
        activo: true  // ✅ Columna activo (boolean)
      })
      .select()
      .single();

    if (error) throw error;

    return {
      success: true,
      data: data
    };
  } catch (error) {
    console.error('Error en crear cuenta:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Actualizar cuenta existente
 */
export const actualizar = async (id, datos) => {
  try {
    const { data, error } = await supabase
      .from('plan_cuentas')
      .update({
        codigo: datos.codigo,
        nombre: datos.nombre,
        cuenta_padre_id: datos.cuenta_padre_id || null,
        tipo_cuenta: datos.tipo_cuenta,
        naturaleza: datos.naturaleza,
        es_imputable: datos.es_imputable,
        requiere_tercero: datos.requiere_tercero,
        requiere_documento: datos.requiere_documento,
        categoria_iva: datos.categoria_iva,
        codigo_impositivo: datos.codigo_impositivo,
        descripcion: datos.descripcion,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return {
      success: true,
      data: data
    };
  } catch (error) {
    console.error('Error en actualizar cuenta:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Eliminar cuenta (soft delete)
 */
export const eliminar = async (id) => {
  try {
    const { data, error } = await supabase
      .from('plan_cuentas')
      .update({
        activo: false,  // ✅ Columna activo (boolean)
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return {
      success: true,
      data: data
    };
  } catch (error) {
    console.error('Error en eliminar cuenta:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Obtener cuenta por ID
 */
export const obtenerPorId = async (id) => {
  try {
    const { data, error } = await supabase
      .from('plan_cuentas')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;

    return {
      success: true,
      data: data
    };
  } catch (error) {
    console.error('Error en obtener cuenta:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Copiar plantilla de plan de cuentas
 */
export const copiarPlantilla = async (empresaId, tipo) => {
  try {
    const { data, error } = await supabase.rpc('copiar_plantilla_plan_cuentas', {
      p_empresa_id: empresaId,
      p_tipo_plantilla: tipo
    });

    if (error) throw error;

    return {
      success: true,
      data: data
    };
  } catch (error) {
    console.error('Error en copiar plantilla:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Eliminar todo el plan de cuentas
 */
export const eliminarTodo = async (empresaId, usuarioId) => {
  try {
    const { data, error } = await supabase.rpc('eliminar_todo_plan_cuentas', {
      p_empresa_id: empresaId,
      p_usuario_id: usuarioId
    });

    if (error) throw error;

    return {
      success: true,
      data: data
    };
  } catch (error) {
    console.error('Error en eliminar todo:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Obtener cuentas padres disponibles (solo no imputables)
 */
export const obtenerCuentasPadres = async (empresaId) => {
  try {
    const { data, error } = await supabase
      .from('plan_cuentas')
      .select('id, codigo, nombre, nivel')
      .eq('empresa_id', empresaId)
      .eq('activo', true)  // ✅ Columna activo (boolean)
      .eq('es_imputable', false)
      .order('codigo');

    if (error) throw error;

    return {
      success: true,
      data: (data || []).map(cuenta => ({
        value: cuenta.id,
        label: `${cuenta.codigo} - ${cuenta.nombre}`
      }))
    };
  } catch (error) {
    console.error('Error en obtener cuentas padres:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Obtener cuentas imputables (para asientos)
 */
export const obtenerCuentasImputables = async (empresaId, busqueda = null) => {
  try {
    if (busqueda) {
      const { data, error } = await supabase.rpc('obtener_cuentas_imputables', {
        p_empresa_id: empresaId,
        p_busqueda: busqueda
      });

      if (error) throw error;

      return {
        success: true,
        data: data || []
      };
    } else {
      const { data, error } = await supabase
        .from('plan_cuentas')
        .select('id, codigo, nombre, tipo_cuenta, naturaleza')
        .eq('empresa_id', empresaId)
        .eq('activo', true)  // ✅ Columna activo (boolean)
        .eq('es_imputable', true)
        .order('codigo');

      if (error) throw error;

      return {
        success: true,
        data: data || []
      };
    }
  } catch (error) {
    console.error('Error en obtener cuentas imputables:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Validar código único en la empresa
 */
export const validarCodigoUnico = async (empresaId, codigo, excludeId = null) => {
  try {
    let query = supabase
      .from('plan_cuentas')
      .select('id')
      .eq('empresa_id', empresaId)
      .eq('codigo', codigo);

    if (excludeId) {
      query = query.neq('id', excludeId);
    }

    const { data, error } = await query;

    if (error) throw error;

    return {
      success: true,
      esUnico: !data || data.length === 0
    };
  } catch (error) {
    console.error('Error en validar código:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

export default {
  listar,
  buscar,
  crear,
  actualizar,
  eliminar,
  obtenerPorId,
  copiarPlantilla,
  eliminarTodo,
  obtenerCuentasPadres,
  obtenerCuentasImputables,
  validarCodigoUnico
};