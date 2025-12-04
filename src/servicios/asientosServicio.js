/**
 * SERVICIO DE ASIENTOS CONTABLES
 * Conecta con las funciones SQL del backend
 */

import { supabase } from '../configuracion/supabase';

// ============================================================================
// CREAR ASIENTO
// ============================================================================

/**
 * Crea un nuevo asiento contable
 * @param {Object} datos - Datos del asiento
 * @param {string} datos.empresaId - UUID de la empresa
 * @param {string} datos.periodoId - UUID del período
 * @param {string} datos.fecha - Fecha del asiento (YYYY-MM-DD)
 * @param {string} datos.tipoAsiento - 'apertura', 'operacion', 'ajuste', 'cierre'
 * @param {string} datos.origen - 'manual', 'compras', 'ventas', 'bancos'
 * @param {string} datos.glosa - Descripción del asiento
 * @param {string} datos.referencia - Referencia (factura, recibo, etc)
 * @param {string} datos.creadoPor - UUID del usuario
 * @param {Array} datos.detalles - Array de líneas del asiento
 * @returns {Promise<Object>} Resultado de la creación
 */
export const crearAsiento = async (datos) => {
  try {
    const { data, error } = await supabase.rpc('crear_asiento_contable', {
      p_empresa_id: datos.empresaId,
      p_periodo_id: datos.periodoId,
      p_fecha: datos.fecha,
      p_tipo_asiento: datos.tipoAsiento,
      p_origen: datos.origen,
      p_glosa: datos.glosa,
      p_referencia: datos.referencia,
      p_creado_por: datos.creadoPor,
      p_detalles: datos.detalles
    });

    if (error) throw error;
    return { success: true, data: data[0] };
  } catch (error) {
    console.error('Error al crear asiento:', error);
    return { success: false, error: error.message };
  }
};

// ============================================================================
// VALIDAR ASIENTO
// ============================================================================

/**
 * Valida que un asiento esté balanceado
 * @param {string} asientoId - UUID del asiento
 * @returns {Promise<Object>} Resultado de la validación
 */
export const validarAsiento = async (asientoId) => {
  try {
    const { data, error } = await supabase.rpc('validar_asiento', {
      p_asiento_id: asientoId
    });

    if (error) throw error;
    return { success: true, data: data[0] };
  } catch (error) {
    console.error('Error al validar asiento:', error);
    return { success: false, error: error.message };
  }
};

// ============================================================================
// CONFIRMAR ASIENTO
// ============================================================================

/**
 * Confirma un asiento (cambia de borrador a confirmado)
 * @param {string} asientoId - UUID del asiento
 * @param {string} confirmadoPor - UUID del usuario
 * @returns {Promise<Object>} Resultado de la confirmación
 */
export const confirmarAsiento = async (asientoId, confirmadoPor) => {
  try {
    const { data, error } = await supabase.rpc('confirmar_asiento', {
      p_asiento_id: asientoId,
      p_confirmado_por: confirmadoPor
    });

    if (error) throw error;
    return { success: true, data: data[0] };
  } catch (error) {
    console.error('Error al confirmar asiento:', error);
    return { success: false, error: error.message };
  }
};

// ============================================================================
// ANULAR ASIENTO
// ============================================================================

/**
 * Anula un asiento confirmado
 * @param {string} asientoId - UUID del asiento
 * @param {string} anuladoPor - UUID del usuario
 * @param {string} motivo - Motivo de la anulación
 * @returns {Promise<Object>} Resultado de la anulación
 */
export const anularAsiento = async (asientoId, anuladoPor, motivo) => {
  try {
    const { data, error } = await supabase.rpc('anular_asiento', {
      p_asiento_id: asientoId,
      p_anulado_por: anuladoPor,
      p_motivo_anulacion: motivo
    });

    if (error) throw error;
    return { success: true, data: data[0] };
  } catch (error) {
    console.error('Error al anular asiento:', error);
    return { success: false, error: error.message };
  }
};

// ============================================================================
// MODIFICAR ASIENTO BORRADOR
// ============================================================================

/**
 * Modifica un asiento en estado borrador
 * @param {Object} datos - Datos a modificar
 * @param {string} datos.asientoId - UUID del asiento
 * @param {string} datos.fecha - Nueva fecha (opcional)
 * @param {string} datos.glosa - Nueva glosa (opcional)
 * @param {string} datos.referencia - Nueva referencia (opcional)
 * @param {Array} datos.detalles - Nuevos detalles (opcional)
 * @returns {Promise<Object>} Resultado de la modificación
 */
export const modificarAsientoBorrador = async (datos) => {
  try {
    const { data, error } = await supabase.rpc('modificar_asiento_borrador', {
      p_asiento_id: datos.asientoId,
      p_fecha: datos.fecha || null,
      p_glosa: datos.glosa || null,
      p_referencia: datos.referencia || null,
      p_detalles: datos.detalles || null
    });

    if (error) throw error;
    return { success: true, data: data[0] };
  } catch (error) {
    console.error('Error al modificar asiento:', error);
    return { success: false, error: error.message };
  }
};

// ============================================================================
// ELIMINAR ASIENTO BORRADOR
// ============================================================================

/**
 * Elimina un asiento en estado borrador
 * @param {string} asientoId - UUID del asiento
 * @returns {Promise<Object>} Resultado de la eliminación
 */
export const eliminarAsientoBorrador = async (asientoId) => {
  try {
    const { data, error } = await supabase.rpc('eliminar_asiento_borrador', {
      p_asiento_id: asientoId
    });

    if (error) throw error;
    return { success: true, data: data[0] };
  } catch (error) {
    console.error('Error al eliminar asiento:', error);
    return { success: false, error: error.message };
  }
};

// ============================================================================
// LISTAR ASIENTOS
// ============================================================================

/**
 * Lista asientos con filtros
 * @param {Object} filtros - Filtros de búsqueda
 * @param {string} filtros.empresaId - UUID de la empresa (requerido)
 * @param {string} filtros.periodoId - UUID del período (opcional)
 * @param {string} filtros.estado - Estado del asiento (opcional)
 * @param {string} filtros.fechaDesde - Fecha desde (opcional)
 * @param {string} filtros.fechaHasta - Fecha hasta (opcional)
 * @param {number} filtros.limite - Cantidad de resultados (default: 50)
 * @param {number} filtros.offset - Offset para paginación (default: 0)
 * @returns {Promise<Array>} Lista de asientos
 */
export const listarAsientos = async (filtros) => {
  try {
    const { data, error } = await supabase.rpc('listar_asientos', {
      p_empresa_id: filtros.empresaId,
      p_periodo_id: filtros.periodoId || null,
      p_estado: filtros.estado || null,
      p_fecha_desde: filtros.fechaDesde || null,
      p_fecha_hasta: filtros.fechaHasta || null,
      p_limit: filtros.limite || 50,
      p_offset: filtros.offset || 0
    });

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error('Error al listar asientos:', error);
    return { success: false, error: error.message, data: [] };
  }
};

// ============================================================================
// OBTENER ASIENTO POR ID
// ============================================================================

/**
 * Obtiene un asiento completo con sus detalles
 * @param {string} asientoId - UUID del asiento
 * @returns {Promise<Object>} Asiento con detalles
 */
export const obtenerAsientoPorId = async (asientoId) => {
  try {
    const { data, error } = await supabase
      .from('vista_asientos_completos')
      .select('*')
      .eq('asiento_id', asientoId)
      .single();

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error('Error al obtener asiento:', error);
    return { success: false, error: error.message };
  }
};

// ============================================================================
// OBTENER CUENTAS IMPUTABLES (para el selector)
// ============================================================================

/**
 * Obtiene cuentas imputables para usar en selects
 * @param {string} empresaId - UUID de la empresa
 * @param {string} busqueda - Texto de búsqueda (opcional)
 * @returns {Promise<Array>} Lista de cuentas
 */
export const obtenerCuentasImputables = async (empresaId, busqueda = null) => {
  try {
    const { data, error } = await supabase.rpc('obtener_cuentas_imputables', {
      p_empresa_id: empresaId,
      p_busqueda: busqueda
    });

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error('Error al obtener cuentas:', error);
    return { success: false, error: error.message, data: [] };
  }
};

// ============================================================================
// REPORTES
// ============================================================================

/**
 * Obtiene el Libro Diario
 * @param {Object} filtros - Filtros del reporte
 * @param {string} filtros.empresaId - UUID de la empresa
 * @param {string} filtros.periodoId - UUID del período (opcional)
 * @param {string} filtros.fechaDesde - Fecha desde (opcional)
 * @param {string} filtros.fechaHasta - Fecha hasta (opcional)
 * @returns {Promise<Array>} Datos del libro diario
 */
export const obtenerLibroDiario = async (filtros) => {
  try {
    const { data, error } = await supabase.rpc('obtener_libro_diario', {
      p_empresa_id: filtros.empresaId,
      p_periodo_id: filtros.periodoId || null,
      p_fecha_desde: filtros.fechaDesde || null,
      p_fecha_hasta: filtros.fechaHasta || null
    });

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error('Error al obtener libro diario:', error);
    return { success: false, error: error.message, data: [] };
  }
};

/**
 * Obtiene el Libro Mayor
 * @param {Object} filtros - Filtros del reporte
 * @param {string} filtros.empresaId - UUID de la empresa
 * @param {string} filtros.cuentaId - UUID de la cuenta (opcional)
 * @param {string} filtros.periodoId - UUID del período (opcional)
 * @param {string} filtros.fechaDesde - Fecha desde (opcional)
 * @param {string} filtros.fechaHasta - Fecha hasta (opcional)
 * @returns {Promise<Array>} Datos del libro mayor
 */
export const obtenerLibroMayor = async (filtros) => {
  try {
    const { data, error } = await supabase.rpc('obtener_libro_mayor', {
      p_empresa_id: filtros.empresaId,
      p_cuenta_id: filtros.cuentaId || null,
      p_periodo_id: filtros.periodoId || null,
      p_fecha_desde: filtros.fechaDesde || null,
      p_fecha_hasta: filtros.fechaHasta || null
    });

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error('Error al obtener libro mayor:', error);
    return { success: false, error: error.message, data: [] };
  }
};

/**
 * Obtiene el Balance de Sumas y Saldos
 * @param {Object} filtros - Filtros del reporte
 * @param {string} filtros.empresaId - UUID de la empresa
 * @param {string} filtros.periodoId - UUID del período (opcional)
 * @param {string} filtros.fechaHasta - Fecha hasta (opcional)
 * @returns {Promise<Array>} Datos del balance
 */
export const obtenerBalanceSumasSaldos = async (filtros) => {
  try {
    const { data, error } = await supabase.rpc('obtener_balance_sumas_saldos', {
      p_empresa_id: filtros.empresaId,
      p_periodo_id: filtros.periodoId || null,
      p_fecha_hasta: filtros.fechaHasta || null
    });

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error('Error al obtener balance:', error);
    return { success: false, error: error.message, data: [] };
  }
};

// ============================================================================
// EXPORTAR TODAS LAS FUNCIONES
// ============================================================================

export default {
  crearAsiento,
  validarAsiento,
  confirmarAsiento,
  anularAsiento,
  modificarAsientoBorrador,
  eliminarAsientoBorrador,
  listarAsientos,
  obtenerAsientoPorId,
  obtenerCuentasImputables,
  obtenerLibroDiario,
  obtenerLibroMayor,
  obtenerBalanceSumasSaldos
};