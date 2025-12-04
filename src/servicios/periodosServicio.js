/**
 * SERVICIO DE PERÍODOS CONTABLES
 * Conecta con las funciones SQL del backend
 */

import { supabase } from '../configuracion/supabase';

// ============================================================================
// CREAR PERÍODO
// ============================================================================

/**
 * Crea un nuevo período contable
 * @param {Object} datos - Datos del período
 * @param {string} datos.empresaId - UUID de la empresa
 * @param {string} datos.tipo - 'mensual' o 'anual'
 * @param {number} datos.anio - Año del período
 * @param {number} datos.mes - Mes del período (solo si es mensual)
 * @param {string} datos.descripcion - Descripción del período (opcional)
 * @returns {Promise<Object>} Resultado de la creación
 */
export const crearPeriodo = async (datos) => {
  try {
    const { data, error } = await supabase.rpc('crear_periodo', {
      p_empresa_id: datos.empresaId,
      p_tipo: datos.tipo,
      p_anio: datos.anio,
      p_mes: datos.mes || null,
      p_descripcion: datos.descripcion || null
    });

    if (error) throw error;
    return { success: true, data: data[0] };
  } catch (error) {
    console.error('Error al crear período:', error);
    return { success: false, error: error.message };
  }
};

// ============================================================================
// CREAR PERÍODOS ANUALES (12 meses automático)
// ============================================================================

/**
 * Crea 12 períodos mensuales de un año completo
 * @param {string} empresaId - UUID de la empresa
 * @param {number} anio - Año para crear los períodos
 * @returns {Promise<Object>} Resultado de la creación
 */
export const crearPeriodosAnuales = async (empresaId, anio) => {
  try {
    const { data, error } = await supabase.rpc('crear_periodos_anuales', {
      p_empresa_id: empresaId,
      p_anio: anio
    });

    if (error) throw error;
    return { success: true, data: data[0] };
  } catch (error) {
    console.error('Error al crear períodos anuales:', error);
    return { success: false, error: error.message };
  }
};

// ============================================================================
// CERRAR PERÍODO
// ============================================================================

/**
 * Cierra un período contable (no permite más asientos)
 * @param {string} periodoId - UUID del período
 * @param {string} cerradoPor - UUID del usuario
 * @returns {Promise<Object>} Resultado del cierre
 */
export const cerrarPeriodo = async (periodoId, cerradoPor) => {
  try {
    const { data, error } = await supabase.rpc('cerrar_periodo', {
      p_periodo_id: periodoId,
      p_cerrado_por: cerradoPor
    });

    if (error) throw error;
    return { success: true, data: data[0] };
  } catch (error) {
    console.error('Error al cerrar período:', error);
    return { success: false, error: error.message };
  }
};

// ============================================================================
// ABRIR PERÍODO (reabrir)
// ============================================================================

/**
 * Reabre un período cerrado
 * @param {string} periodoId - UUID del período
 * @param {string} abiertoPor - UUID del usuario
 * @param {string} motivo - Motivo de la reapertura
 * @returns {Promise<Object>} Resultado de la reapertura
 */
export const abrirPeriodo = async (periodoId, abiertoPor, motivo) => {
  try {
    const { data, error } = await supabase.rpc('abrir_periodo', {
      p_periodo_id: periodoId,
      p_abierto_por: abiertoPor,
      p_motivo: motivo
    });

    if (error) throw error;
    return { success: true, data: data[0] };
  } catch (error) {
    console.error('Error al abrir período:', error);
    return { success: false, error: error.message };
  }
};

// ============================================================================
// OBTENER PERÍODO ACTIVO
// ============================================================================

/**
 * Obtiene el período activo actual (para el selector)
 * @param {string} empresaId - UUID de la empresa
 * @returns {Promise<Object>} Período activo
 */
export const obtenerPeriodoActivo = async (empresaId) => {
  try {
    const { data, error } = await supabase.rpc('obtener_periodo_activo', {
      p_empresa_id: empresaId
    });

    if (error) throw error;
    return { success: true, data: data[0] || null };
  } catch (error) {
    console.error('Error al obtener período activo:', error);
    return { success: false, error: error.message };
  }
};

// ============================================================================
// LISTAR PERÍODOS
// ============================================================================

/**
 * Lista todos los períodos de la empresa
 * @param {string} empresaId - UUID de la empresa
 * @param {boolean} soloAbiertos - Solo períodos abiertos (default: false)
 * @param {number} anio - Filtrar por año (opcional)
 * @returns {Promise<Array>} Lista de períodos
 */
export const listarPeriodos = async (empresaId, soloAbiertos = false, anio = null) => {
  try {
    const { data, error } = await supabase.rpc('listar_periodos', {
      p_empresa_id: empresaId,
      p_solo_abiertos: soloAbiertos,
      p_anio: anio
    });

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error('Error al listar períodos:', error);
    return { success: false, error: error.message, data: [] };
  }
};

// ============================================================================
// VERIFICAR FECHA EN PERÍODO ABIERTO
// ============================================================================

/**
 * Verifica si una fecha está en un período abierto
 * @param {string} empresaId - UUID de la empresa
 * @param {string} fecha - Fecha a verificar (YYYY-MM-DD)
 * @returns {Promise<Object>} Resultado de la verificación
 */
export const verificarFechaEnPeriodoAbierto = async (empresaId, fecha) => {
  try {
    const { data, error } = await supabase.rpc('verificar_fecha_en_periodo_abierto', {
      p_empresa_id: empresaId,
      p_fecha: fecha
    });

    if (error) throw error;
    return { success: true, data: data[0] };
  } catch (error) {
    console.error('Error al verificar fecha:', error);
    return { success: false, error: error.message };
  }
};

// ============================================================================
// OBTENER ESTADÍSTICAS DEL PERÍODO
// ============================================================================

/**
 * Obtiene estadísticas de un período
 * @param {string} periodoId - UUID del período
 * @returns {Promise<Object>} Estadísticas del período
 */
export const obtenerEstadisticasPeriodo = async (periodoId) => {
  try {
    const { data, error } = await supabase.rpc('obtener_estadisticas_periodo', {
      p_periodo_id: periodoId
    });

    if (error) throw error;
    return { success: true, data: data[0] };
  } catch (error) {
    console.error('Error al obtener estadísticas:', error);
    return { success: false, error: error.message };
  }
};

// ============================================================================
// EXPORTAR TODAS LAS FUNCIONES
// ============================================================================

export default {
  crearPeriodo,
  crearPeriodosAnuales,
  cerrarPeriodo,
  abrirPeriodo,
  obtenerPeriodoActivo,
  listarPeriodos,
  verificarFechaEnPeriodoAbierto,
  obtenerEstadisticasPeriodo
};