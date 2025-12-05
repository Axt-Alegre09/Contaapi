/**
 * SERVICIO: Plan de Cuentas
 * Todas las operaciones incluyen empresa_id para multi-tenancy
 */

import { supabase } from '../configuracion/supabase';

/**
 * Listar cuentas contables de una empresa
 */
export const listar = async (empresaId, soloActivas = true, incluirPadres = false) => {
  try {
    const { data, error } = await supabase.rpc('listar_cuentas', {
      p_empresa_id: empresaId,
      p_solo_activas: soloActivas,
      p_incluir_padres: incluirPadres
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
    const { data, error } = await supabase.rpc('agregar_cuenta', {
      p_empresa_id: datos.empresa_id,
      p_codigo: datos.codigo,
      p_nombre: datos.nombre,
      p_cuenta_padre_id: datos.cuenta_padre_id || null,
      p_nivel: datos.nivel,
      p_tipo_cuenta: datos.tipo_cuenta,
      p_naturaleza: datos.naturaleza,
      p_es_imputable: datos.es_imputable || false,
      p_requiere_tercero: datos.requiere_tercero || false,
      p_requiere_documento: datos.requiere_documento || false,
      p_categoria_iva: datos.categoria_iva || null,
      p_codigo_impositivo: datos.codigo_impositivo || null,
      p_descripcion: datos.descripcion || null
    });

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
    const { data, error } = await supabase.rpc('actualizar_cuenta', {
      p_id: id,
      p_codigo: datos.codigo,
      p_nombre: datos.nombre,
      p_cuenta_padre_id: datos.cuenta_padre_id,
      p_tipo_cuenta: datos.tipo_cuenta,
      p_naturaleza: datos.naturaleza,
      p_es_imputable: datos.es_imputable,
      p_requiere_tercero: datos.requiere_tercero,
      p_requiere_documento: datos.requiere_documento,
      p_categoria_iva: datos.categoria_iva,
      p_codigo_impositivo: datos.codigo_impositivo,
      p_descripcion: datos.descripcion
    });

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
    const { data, error } = await supabase.rpc('eliminar_cuenta', {
      p_id: id
    });

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
    const { data, error } = await supabase.rpc('obtener_cuenta_por_id', {
      p_id: id
    });

    if (error) throw error;

    return {
      success: true,
      data: data ? data[0] : null
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
export const eliminarTodo = async (empresaId) => {
  try {
    const { data, error } = await supabase.rpc('eliminar_todo_plan_cuentas', {
      p_empresa_id: empresaId
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
 * Obtener cuentas padres disponibles
 */
export const obtenerCuentasPadres = async (empresaId, nivel) => {
  try {
    const { data, error } = await supabase
      .from('plan_cuentas')
      .select('id, codigo, nombre, nivel')
      .eq('empresa_id', empresaId)
      .eq('activo', true)
      .lt('nivel', nivel)
      .order('codigo');

    if (error) throw error;

    return {
      success: true,
      data: data || []
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
  validarCodigoUnico
};