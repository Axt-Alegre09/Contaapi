/**
 * SERVICIO DE TERCEROS (Clientes/Proveedores)
 * Conecta con las funciones SQL del backend
 */

import { supabase } from '../configuracion/supabase';

// ============================================================================
// CREAR TERCERO
// ============================================================================

/**
 * Crea un nuevo tercero (cliente/proveedor)
 * @param {Object} datos - Datos del tercero
 * @param {string} datos.empresaId - UUID de la empresa
 * @param {string} datos.tipo - 'cliente', 'proveedor', 'ambos'
 * @param {string} datos.tipoDocumento - 'RUC', 'CI', 'PASAPORTE'
 * @param {string} datos.numeroDocumento - Número de documento
 * @param {string} datos.razonSocial - Razón social o nombre completo
 * @param {string} datos.nombreComercial - Nombre comercial (opcional)
 * @param {string} datos.direccion - Dirección (opcional)
 * @param {string} datos.telefono - Teléfono (opcional)
 * @param {string} datos.celular - Celular (opcional)
 * @param {string} datos.email - Email (opcional)
 * @param {boolean} datos.esContribuyente - Si es contribuyente (default: false)
 * @param {string} datos.tipoContribuyente - Tipo de contribuyente (opcional)
 * @returns {Promise<Object>} Resultado de la creación
 */
export const crearTercero = async (datos) => {
  try {
    const { data, error } = await supabase.rpc('crear_tercero', {
      p_empresa_id: datos.empresaId,
      p_tipo: datos.tipo,
      p_tipo_documento: datos.tipoDocumento,
      p_numero_documento: datos.numeroDocumento,
      p_razon_social: datos.razonSocial,
      p_nombre_comercial: datos.nombreComercial || null,
      p_direccion: datos.direccion || null,
      p_telefono: datos.telefono || null,
      p_celular: datos.celular || null,
      p_email: datos.email || null,
      p_es_contribuyente: datos.esContribuyente || false,
      p_tipo_contribuyente: datos.tipoContribuyente || null
    });

    if (error) throw error;
    return { success: true, data: data[0] };
  } catch (error) {
    console.error('Error al crear tercero:', error);
    return { success: false, error: error.message };
  }
};

// ============================================================================
// EDITAR TERCERO
// ============================================================================

/**
 * Edita un tercero existente
 * @param {Object} datos - Datos a modificar
 * @param {string} datos.terceroId - UUID del tercero
 * @param {string} datos.razonSocial - Nueva razón social (opcional)
 * @param {string} datos.nombreComercial - Nuevo nombre comercial (opcional)
 * @param {string} datos.direccion - Nueva dirección (opcional)
 * @param {string} datos.telefono - Nuevo teléfono (opcional)
 * @param {string} datos.celular - Nuevo celular (opcional)
 * @param {string} datos.email - Nuevo email (opcional)
 * @param {boolean} datos.esContribuyente - Nueva configuración (opcional)
 * @param {string} datos.tipoContribuyente - Nuevo tipo (opcional)
 * @param {number} datos.limiteCredito - Nuevo límite de crédito (opcional)
 * @param {number} datos.diasCredito - Nuevos días de crédito (opcional)
 * @returns {Promise<Object>} Resultado de la edición
 */
export const editarTercero = async (datos) => {
  try {
    const { data, error } = await supabase.rpc('editar_tercero', {
      p_tercero_id: datos.terceroId,
      p_razon_social: datos.razonSocial || null,
      p_nombre_comercial: datos.nombreComercial || null,
      p_direccion: datos.direccion || null,
      p_telefono: datos.telefono || null,
      p_celular: datos.celular || null,
      p_email: datos.email || null,
      p_es_contribuyente: datos.esContribuyente !== undefined ? datos.esContribuyente : null,
      p_tipo_contribuyente: datos.tipoContribuyente || null,
      p_limite_credito: datos.limiteCredito !== undefined ? datos.limiteCredito : null,
      p_dias_credito: datos.diasCredito !== undefined ? datos.diasCredito : null
    });

    if (error) throw error;
    return { success: true, data: data[0] };
  } catch (error) {
    console.error('Error al editar tercero:', error);
    return { success: false, error: error.message };
  }
};

// ============================================================================
// DESACTIVAR/ACTIVAR TERCERO
// ============================================================================

/**
 * Desactiva un tercero (no lo elimina)
 * @param {string} terceroId - UUID del tercero
 * @returns {Promise<Object>} Resultado de la desactivación
 */
export const desactivarTercero = async (terceroId) => {
  try {
    const { data, error } = await supabase.rpc('desactivar_tercero', {
      p_tercero_id: terceroId
    });

    if (error) throw error;
    return { success: true, data: data[0] };
  } catch (error) {
    console.error('Error al desactivar tercero:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Activa un tercero desactivado
 * @param {string} terceroId - UUID del tercero
 * @returns {Promise<Object>} Resultado de la activación
 */
export const activarTercero = async (terceroId) => {
  try {
    const { data, error } = await supabase.rpc('activar_tercero', {
      p_tercero_id: terceroId
    });

    if (error) throw error;
    return { success: true, data: data[0] };
  } catch (error) {
    console.error('Error al activar tercero:', error);
    return { success: false, error: error.message };
  }
};

// ============================================================================
// LISTAR TERCEROS
// ============================================================================

/**
 * Lista terceros con filtros
 * @param {Object} filtros - Filtros de búsqueda
 * @param {string} filtros.empresaId - UUID de la empresa
 * @param {string} filtros.tipo - 'cliente', 'proveedor', null=todos (opcional)
 * @param {boolean} filtros.soloActivos - Solo activos (default: true)
 * @param {number} filtros.limite - Cantidad de resultados (default: 100)
 * @param {number} filtros.offset - Offset para paginación (default: 0)
 * @returns {Promise<Array>} Lista de terceros
 */
export const listarTerceros = async (filtros) => {
  try {
    const { data, error } = await supabase.rpc('listar_terceros', {
      p_empresa_id: filtros.empresaId,
      p_tipo: filtros.tipo || null,
      p_solo_activos: filtros.soloActivos !== undefined ? filtros.soloActivos : true,
      p_limite: filtros.limite || 100,
      p_offset: filtros.offset || 0
    });

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error('Error al listar terceros:', error);
    return { success: false, error: error.message, data: [] };
  }
};

// ============================================================================
// BUSCAR TERCEROS (Autocomplete)
// ============================================================================

/**
 * Busca terceros por documento, razón social o nombre comercial
 * @param {string} empresaId - UUID de la empresa
 * @param {string} busqueda - Texto a buscar
 * @param {string} tipo - 'cliente', 'proveedor', null=todos (opcional)
 * @param {number} limite - Cantidad máxima de resultados (default: 20)
 * @returns {Promise<Array>} Terceros encontrados
 */
export const buscarTerceros = async (empresaId, busqueda, tipo = null, limite = 20) => {
  try {
    const { data, error } = await supabase.rpc('buscar_terceros', {
      p_empresa_id: empresaId,
      p_busqueda: busqueda,
      p_tipo: tipo,
      p_limite: limite
    });

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error('Error al buscar terceros:', error);
    return { success: false, error: error.message, data: [] };
  }
};

// ============================================================================
// OBTENER TERCERO POR DOCUMENTO
// ============================================================================

/**
 * Obtiene un tercero por su número de documento
 * @param {string} empresaId - UUID de la empresa
 * @param {string} numeroDocumento - Número de documento
 * @returns {Promise<Object>} Datos del tercero
 */
export const obtenerTerceroPorDocumento = async (empresaId, numeroDocumento) => {
  try {
    const { data, error } = await supabase.rpc('obtener_tercero_por_documento', {
      p_empresa_id: empresaId,
      p_numero_documento: numeroDocumento
    });

    if (error) throw error;
    return { success: true, data: data[0] || null };
  } catch (error) {
    console.error('Error al obtener tercero:', error);
    return { success: false, error: error.message };
  }
};

// ============================================================================
// VERIFICAR DOCUMENTO DISPONIBLE
// ============================================================================

/**
 * Verifica si un número de documento está disponible
 * @param {string} empresaId - UUID de la empresa
 * @param {string} numeroDocumento - Documento a verificar
 * @param {string} excluirId - ID a excluir de la búsqueda (opcional, para edición)
 * @returns {Promise<Object>} Resultado de la verificación
 */
export const verificarDocumentoDisponible = async (
  empresaId,
  numeroDocumento,
  excluirId = null
) => {
  try {
    const { data, error } = await supabase.rpc('verificar_documento_tercero_disponible', {
      p_empresa_id: empresaId,
      p_numero_documento: numeroDocumento,
      p_excluir_id: excluirId
    });

    if (error) throw error;
    return { success: true, data: data[0] };
  } catch (error) {
    console.error('Error al verificar documento:', error);
    return { success: false, error: error.message };
  }
};

// ============================================================================
// OBTENER MOVIMIENTOS DEL TERCERO
// ============================================================================

/**
 * Obtiene todos los movimientos contables de un tercero
 * @param {string} terceroId - UUID del tercero
 * @param {string} fechaDesde - Fecha desde (opcional)
 * @param {string} fechaHasta - Fecha hasta (opcional)
 * @returns {Promise<Array>} Movimientos del tercero
 */
export const obtenerMovimientosTercero = async (
  terceroId,
  fechaDesde = null,
  fechaHasta = null
) => {
  try {
    const { data, error } = await supabase.rpc('obtener_movimientos_tercero', {
      p_tercero_id: terceroId,
      p_fecha_desde: fechaDesde,
      p_fecha_hasta: fechaHasta
    });

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error('Error al obtener movimientos:', error);
    return { success: false, error: error.message, data: [] };
  }
};

// ============================================================================
// OBTENER SALDO DEL TERCERO
// ============================================================================

/**
 * Calcula el saldo actual de un tercero
 * @param {string} terceroId - UUID del tercero
 * @param {string} fechaHasta - Fecha hasta (opcional)
 * @returns {Promise<Object>} Saldo del tercero
 */
export const obtenerSaldoTercero = async (terceroId, fechaHasta = null) => {
  try {
    const { data, error } = await supabase.rpc('obtener_saldo_tercero', {
      p_tercero_id: terceroId,
      p_fecha_hasta: fechaHasta
    });

    if (error) throw error;
    return { success: true, data: data[0] };
  } catch (error) {
    console.error('Error al obtener saldo:', error);
    return { success: false, error: error.message };
  }
};

// ============================================================================
// EXPORTAR TODAS LAS FUNCIONES
// ============================================================================

export default {
  crearTercero,
  editarTercero,
  desactivarTercero,
  activarTercero,
  listarTerceros,
  buscarTerceros,
  obtenerTerceroPorDocumento,
  verificarDocumentoDisponible,
  obtenerMovimientosTercero,
  obtenerSaldoTercero
};