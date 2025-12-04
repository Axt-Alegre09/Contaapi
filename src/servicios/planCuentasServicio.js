/**
 * SERVICIO DE PLAN DE CUENTAS
 * Conecta con las funciones SQL del backend
 */

import { supabase } from '../configuracion/supabase';

// ============================================================================
// COPIAR PLANTILLA
// ============================================================================

/**
 * Copia una plantilla predefinida de cuentas
 * @param {string} empresaId - UUID de la empresa
 * @param {string} tipoPlantilla - 'comercial' o 'servicios'
 * @returns {Promise<Object>} Resultado de la copia
 */
export const copiarPlantilla = async (empresaId, tipoPlantilla) => {
  try {
    const { data, error } = await supabase.rpc('copiar_plantilla_contaapi', {
      p_empresa_id: empresaId,
      p_tipo_plantilla: tipoPlantilla
    });

    if (error) throw error;
    return { success: true, data: data[0] };
  } catch (error) {
    console.error('Error al copiar plantilla:', error);
    return { success: false, error: error.message };
  }
};

// ============================================================================
// AGREGAR CUENTA
// ============================================================================

/**
 * Agrega una cuenta individual al plan
 * @param {Object} datos - Datos de la cuenta
 * @param {string} datos.empresaId - UUID de la empresa
 * @param {string} datos.codigo - Código de la cuenta
 * @param {string} datos.nombre - Nombre de la cuenta
 * @param {string} datos.tipoCuenta - 'Activo', 'Pasivo', 'Patrimonio', 'Ingreso', 'Gasto'
 * @param {string} datos.naturaleza - 'D' (deudora) o 'A' (acreedora)
 * @param {string} datos.cuentaPadreId - UUID de cuenta padre (opcional)
 * @param {boolean} datos.esImputable - Si puede usarse en asientos (default: true)
 * @param {boolean} datos.requiereTercero - Si requiere tercero (default: false)
 * @param {boolean} datos.requiereDocumento - Si requiere documento (default: false)
 * @param {string} datos.categoriaIva - '10%', '5%', 'Exento' (opcional)
 * @param {string} datos.codigoImpositivo - Código SET (opcional)
 * @param {string} datos.descripcion - Descripción (opcional)
 * @returns {Promise<Object>} Resultado de la creación
 */
export const agregarCuenta = async (datos) => {
  try {
    const { data, error } = await supabase.rpc('agregar_cuenta', {
      p_empresa_id: datos.empresaId,
      p_codigo: datos.codigo,
      p_nombre: datos.nombre,
      p_tipo_cuenta: datos.tipoCuenta,
      p_naturaleza: datos.naturaleza,
      p_cuenta_padre_id: datos.cuentaPadreId || null,
      p_es_imputable: datos.esImputable !== undefined ? datos.esImputable : true,
      p_requiere_tercero: datos.requiereTercero || false,
      p_requiere_documento: datos.requiereDocumento || false,
      p_categoria_iva: datos.categoriaIva || null,
      p_codigo_impositivo: datos.codigoImpositivo || null,
      p_descripcion: datos.descripcion || null
    });

    if (error) throw error;
    return { success: true, data: data[0] };
  } catch (error) {
    console.error('Error al agregar cuenta:', error);
    return { success: false, error: error.message };
  }
};

// ============================================================================
// EDITAR CUENTA
// ============================================================================

/**
 * Edita una cuenta existente
 * @param {Object} datos - Datos a modificar
 * @param {string} datos.cuentaId - UUID de la cuenta
 * @param {string} datos.nombre - Nuevo nombre (opcional)
 * @param {boolean} datos.esImputable - Nueva configuración (opcional)
 * @param {boolean} datos.requiereTercero - Nueva configuración (opcional)
 * @param {boolean} datos.requiereDocumento - Nueva configuración (opcional)
 * @param {string} datos.categoriaIva - Nueva categoría (opcional)
 * @param {string} datos.codigoImpositivo - Nuevo código (opcional)
 * @param {string} datos.descripcion - Nueva descripción (opcional)
 * @returns {Promise<Object>} Resultado de la edición
 */
export const editarCuenta = async (datos) => {
  try {
    const { data, error } = await supabase.rpc('editar_cuenta', {
      p_cuenta_id: datos.cuentaId,
      p_nombre: datos.nombre || null,
      p_es_imputable: datos.esImputable !== undefined ? datos.esImputable : null,
      p_requiere_tercero: datos.requiereTercero !== undefined ? datos.requiereTercero : null,
      p_requiere_documento: datos.requiereDocumento !== undefined ? datos.requiereDocumento : null,
      p_categoria_iva: datos.categoriaIva || null,
      p_codigo_impositivo: datos.codigoImpositivo || null,
      p_descripcion: datos.descripcion || null
    });

    if (error) throw error;
    return { success: true, data: data[0] };
  } catch (error) {
    console.error('Error al editar cuenta:', error);
    return { success: false, error: error.message };
  }
};

// ============================================================================
// DESACTIVAR/ACTIVAR CUENTA
// ============================================================================

/**
 * Desactiva una cuenta (no la elimina)
 * @param {string} cuentaId - UUID de la cuenta
 * @returns {Promise<Object>} Resultado de la desactivación
 */
export const desactivarCuenta = async (cuentaId) => {
  try {
    const { data, error } = await supabase.rpc('desactivar_cuenta', {
      p_cuenta_id: cuentaId
    });

    if (error) throw error;
    return { success: true, data: data[0] };
  } catch (error) {
    console.error('Error al desactivar cuenta:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Activa una cuenta desactivada
 * @param {string} cuentaId - UUID de la cuenta
 * @returns {Promise<Object>} Resultado de la activación
 */
export const activarCuenta = async (cuentaId) => {
  try {
    const { data, error } = await supabase.rpc('activar_cuenta', {
      p_cuenta_id: cuentaId
    });

    if (error) throw error;
    return { success: true, data: data[0] };
  } catch (error) {
    console.error('Error al activar cuenta:', error);
    return { success: false, error: error.message };
  }
};

// ============================================================================
// LISTAR PLAN DE CUENTAS
// ============================================================================

/**
 * Lista el plan de cuentas jerárquico
 * @param {string} empresaId - UUID de la empresa
 * @param {boolean} soloActivas - Solo cuentas activas (default: true)
 * @param {boolean} soloImputables - Solo cuentas imputables (default: false)
 * @returns {Promise<Array>} Plan de cuentas completo
 */
export const listarPlanCuentasJerarquico = async (
  empresaId,
  soloActivas = true,
  soloImputables = false
) => {
  try {
    const { data, error } = await supabase.rpc('listar_plan_cuentas_jerarquico', {
      p_empresa_id: empresaId,
      p_solo_activas: soloActivas,
      p_solo_imputables: soloImputables
    });

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error('Error al listar plan de cuentas:', error);
    return { success: false, error: error.message, data: [] };
  }
};

// ============================================================================
// BUSCAR CUENTAS
// ============================================================================

/**
 * Busca cuentas por código o nombre
 * @param {string} empresaId - UUID de la empresa
 * @param {string} busqueda - Texto a buscar
 * @param {boolean} soloImputables - Solo cuentas imputables (default: false)
 * @param {number} limite - Cantidad máxima de resultados (default: 20)
 * @returns {Promise<Array>} Cuentas encontradas
 */
export const buscarCuentas = async (
  empresaId,
  busqueda,
  soloImputables = false,
  limite = 20
) => {
  try {
    const { data, error } = await supabase.rpc('buscar_cuentas', {
      p_empresa_id: empresaId,
      p_busqueda: busqueda,
      p_solo_imputables: soloImputables,
      p_limit: limite
    });

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error('Error al buscar cuentas:', error);
    return { success: false, error: error.message, data: [] };
  }
};

// ============================================================================
// OBTENER CUENTA POR CÓDIGO
// ============================================================================

/**
 * Obtiene una cuenta por su código
 * @param {string} empresaId - UUID de la empresa
 * @param {string} codigo - Código de la cuenta
 * @returns {Promise<Object>} Datos de la cuenta
 */
export const obtenerCuentaPorCodigo = async (empresaId, codigo) => {
  try {
    const { data, error } = await supabase.rpc('obtener_cuenta_por_codigo', {
      p_empresa_id: empresaId,
      p_codigo: codigo
    });

    if (error) throw error;
    return { success: true, data: data[0] || null };
  } catch (error) {
    console.error('Error al obtener cuenta:', error);
    return { success: false, error: error.message };
  }
};

// ============================================================================
// VERIFICAR CÓDIGO DISPONIBLE
// ============================================================================

/**
 * Verifica si un código de cuenta está disponible
 * @param {string} empresaId - UUID de la empresa
 * @param {string} codigo - Código a verificar
 * @returns {Promise<Object>} Resultado de la verificación
 */
export const verificarCodigoDisponible = async (empresaId, codigo) => {
  try {
    const { data, error } = await supabase.rpc('verificar_codigo_disponible', {
      p_empresa_id: empresaId,
      p_codigo: codigo
    });

    if (error) throw error;
    return { success: true, data: data[0] };
  } catch (error) {
    console.error('Error al verificar código:', error);
    return { success: false, error: error.message };
  }
};

// ============================================================================
// EXPORTAR TODAS LAS FUNCIONES
// ============================================================================

export default {
  copiarPlantilla,
  agregarCuenta,
  editarCuenta,
  desactivarCuenta,
  activarCuenta,
  listarPlanCuentasJerarquico,
  buscarCuentas,
  obtenerCuentaPorCodigo,
  verificarCodigoDisponible
};