/**
 * SERVICIO: Plan de Cuentas
 * Gestiona todas las operaciones con el plan de cuentas
 */

import { supabase } from '../configuracion/supabase';

const planCuentasServicio = {
  
  // ============================================================================
  // LISTAR PLAN DE CUENTAS JERÁRQUICO
  // ============================================================================
  async listar(empresaId, soloActivas = true, soloImputables = false) {
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
      return { success: false, error: error.message };
    }
  },

  // ============================================================================
  // BUSCAR CUENTAS
  // ============================================================================
  async buscar(empresaId, {
    termino = null,
    nivel = null,
    tipoCuenta = null,
    soloImputables = false,
    soloActivas = true
  } = {}) {
    try {
      const { data, error } = await supabase.rpc('buscar_cuentas', {
        p_empresa_id: empresaId,
        p_termino: termino,
        p_nivel: nivel,
        p_tipo_cuenta: tipoCuenta,
        p_solo_imputables: soloImputables,
        p_solo_activas: soloActivas
      });

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error('Error al buscar cuentas:', error);
      return { success: false, error: error.message };
    }
  },

  // ============================================================================
  // OBTENER CUENTA POR ID
  // ============================================================================
  async obtenerPorId(cuentaId) {
    try {
      const { data, error } = await supabase.rpc('obtener_cuenta_por_id', {
        p_cuenta_id: cuentaId
      });

      if (error) throw error;
      return { success: true, data: data[0] || null };
    } catch (error) {
      console.error('Error al obtener cuenta:', error);
      return { success: false, error: error.message };
    }
  },

  // ============================================================================
  // AGREGAR CUENTA
  // ============================================================================
  async agregar(empresaId, datos, usuarioId = null) {
    try {
      const { data, error } = await supabase.rpc('agregar_cuenta', {
        p_empresa_id: empresaId,
        p_codigo: datos.codigo,
        p_nombre: datos.nombre,
        p_tipo_cuenta: datos.tipoCuenta,
        p_naturaleza: datos.naturaleza,
        p_nivel: datos.nivel,
        p_es_imputable: datos.esImputable ?? true,
        p_requiere_tercero: datos.requiereTercero ?? false,
        p_requiere_documento: datos.requiereDocumento ?? false,
        p_categoria_iva: datos.categoriaIva || null,
        p_codigo_impositivo: datos.codigoImpositivo || null,
        p_descripcion: datos.descripcion || null,
        p_cuenta_padre_id: datos.cuentaPadreId || null,
        p_usuario_id: usuarioId
      });

      if (error) throw error;
      
      // Si la respuesta es un objeto con success
      if (data && typeof data === 'object') {
        if (data.success === false) {
          throw new Error(data.message || 'Error al agregar cuenta');
        }
        return { success: true, data };
      }

      return { success: true, data };
    } catch (error) {
      console.error('Error al agregar cuenta:', error);
      return { success: false, error: error.message };
    }
  },

  // ============================================================================
  // ACTUALIZAR CUENTA
  // ============================================================================
  async actualizar(cuentaId, datos, usuarioId = null) {
    try {
      const { data, error } = await supabase.rpc('actualizar_cuenta', {
        p_cuenta_id: cuentaId,
        p_codigo: datos.codigo || null,
        p_nombre: datos.nombre || null,
        p_tipo_cuenta: datos.tipoCuenta || null,
        p_naturaleza: datos.naturaleza || null,
        p_nivel: datos.nivel || null,
        p_es_imputable: datos.esImputable ?? null,
        p_requiere_tercero: datos.requiereTercero ?? null,
        p_requiere_documento: datos.requiereDocumento ?? null,
        p_categoria_iva: datos.categoriaIva || null,
        p_codigo_impositivo: datos.codigoImpositivo || null,
        p_descripcion: datos.descripcion || null,
        p_cuenta_padre_id: datos.cuentaPadreId !== undefined ? datos.cuentaPadreId : null,
        p_activo: datos.activo ?? null,
        p_usuario_id: usuarioId
      });

      if (error) throw error;

      if (data && typeof data === 'object') {
        if (data.success === false) {
          throw new Error(data.message || 'Error al actualizar cuenta');
        }
        return { success: true, data };
      }

      return { success: true, data };
    } catch (error) {
      console.error('Error al actualizar cuenta:', error);
      return { success: false, error: error.message };
    }
  },

  // ============================================================================
  // ELIMINAR CUENTA
  // ============================================================================
  async eliminar(cuentaId, usuarioId = null) {
    try {
      const { data, error } = await supabase.rpc('eliminar_cuenta', {
        p_cuenta_id: cuentaId,
        p_usuario_id: usuarioId
      });

      if (error) throw error;

      if (data && typeof data === 'object') {
        if (data.success === false) {
          throw new Error(data.message || 'Error al eliminar cuenta');
        }
        return { success: true, data };
      }

      return { success: true, data };
    } catch (error) {
      console.error('Error al eliminar cuenta:', error);
      return { success: false, error: error.message };
    }
  },

  // ============================================================================
  // COPIAR PLANTILLA
  // ============================================================================
  async copiarPlantilla(empresaId, tipoPlantilla) {
    try {
      const { data, error } = await supabase.rpc('copiar_plantilla_contaapi', {
        p_empresa_id: empresaId,
        p_tipo_plantilla: tipoPlantilla
      });

      if (error) throw error;

      if (data && typeof data === 'object') {
        if (data.success === false) {
          throw new Error(data.message || 'Error al copiar plantilla');
        }
        return { success: true, data };
      }

      return { success: true, data };
    } catch (error) {
      console.error('Error al copiar plantilla:', error);
      return { success: false, error: error.message };
    }
  },

  // ============================================================================
  // OBTENER CUENTAS PARA SELECT (solo imputables y activas)
  // ============================================================================
  async obtenerParaSelect(empresaId) {
    try {
      const { data, error } = await supabase.rpc('listar_plan_cuentas_jerarquico', {
        p_empresa_id: empresaId,
        p_solo_activas: true,
        p_solo_imputables: true
      });

      if (error) throw error;

      // Formatear para usar en selects
      const cuentasFormateadas = data.map(cuenta => ({
        value: cuenta.id,
        label: `${cuenta.codigo} - ${cuenta.nombre}`,
        codigo: cuenta.codigo,
        nombre: cuenta.nombre,
        naturaleza: cuenta.naturaleza,
        nivel: cuenta.nivel
      }));

      return { success: true, data: cuentasFormateadas };
    } catch (error) {
      console.error('Error al obtener cuentas para select:', error);
      return { success: false, error: error.message };
    }
  },

  // ============================================================================
  // OBTENER CUENTAS PADRE (solo no imputables para jerarquía)
  // ============================================================================
  async obtenerCuentasPadre(empresaId) {
    try {
      const { data, error } = await supabase.rpc('buscar_cuentas', {
        p_empresa_id: empresaId,
        p_termino: null,
        p_nivel: null,
        p_tipo_cuenta: null,
        p_solo_imputables: false,
        p_solo_activas: true
      });

      if (error) throw error;

      // Filtrar solo las que NO son imputables (para usarlas como padres)
      const cuentasPadre = data
        .filter(cuenta => !cuenta.es_imputable)
        .map(cuenta => ({
          value: cuenta.id,
          label: `${cuenta.codigo} - ${cuenta.nombre}`,
          codigo: cuenta.codigo,
          nombre: cuenta.nombre,
          nivel: cuenta.nivel
        }));

      return { success: true, data: cuentasPadre };
    } catch (error) {
      console.error('Error al obtener cuentas padre:', error);
      return { success: false, error: error.message };
    }
  },

  // ============================================================================
  // ELIMINAR TODO EL PLAN DE CUENTAS
  // ============================================================================
  async eliminarTodo(empresaId, usuarioId = null) {
    try {
      const { data, error } = await supabase.rpc('eliminar_todo_plan_cuentas', {
        p_empresa_id: empresaId,
        p_usuario_id: usuarioId
      });

      if (error) throw error;

      if (data && typeof data === 'object') {
        if (data.success === false) {
          throw new Error(data.message || 'Error al eliminar plan de cuentas');
        }
        return { success: true, data };
      }

      return { success: true, data };
    } catch (error) {
      console.error('Error al eliminar todo el plan:', error);
      return { success: false, error: error.message };
    }
  }
};

export default planCuentasServicio;