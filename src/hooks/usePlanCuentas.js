/**
 * HOOK PERSONALIZADO: usePlanCuentas
 * Gestiona todas las operaciones del plan de cuentas
 */

import { useState, useCallback } from 'react';
import { useEmpresa } from '../contextos/EmpresaContext';
import planCuentasServicio from '../servicios/planCuentasServicio';

export const usePlanCuentas = () => {
  const { empresaActual } = useEmpresa();
  const [cuentas, setCuentas] = useState([]);
  const [cuentaActual, setCuentaActual] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // ============================================================================
  // COPIAR PLANTILLA
  // ============================================================================
  const copiarPlantilla = useCallback(async (tipoPlantilla) => {
    setLoading(true);
    setError(null);
    try {
      const resultado = await planCuentasServicio.copiarPlantilla(
        empresaActual?.id,
        tipoPlantilla
      );

      if (resultado.success) {
        // Recargar el plan de cuentas después de copiar la plantilla
        await listar();
        return { success: true, data: resultado.data };
      } else {
        setError(resultado.error);
        return { success: false, error: resultado.error };
      }
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, [empresaActual]);

  // ============================================================================
  // AGREGAR CUENTA
  // ============================================================================
  const agregar = useCallback(async (datos) => {
    setLoading(true);
    setError(null);
    try {
      const resultado = await planCuentasServicio.agregarCuenta({
        ...datos,
        empresaId: empresaActual?.id
      });

      if (resultado.success) {
        // Recargar el plan de cuentas
        await listar();
        return { success: true, data: resultado.data };
      } else {
        setError(resultado.error);
        return { success: false, error: resultado.error };
      }
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, [empresaActual]);

  // ============================================================================
  // EDITAR CUENTA
  // ============================================================================
  const editar = useCallback(async (datos) => {
    setLoading(true);
    setError(null);
    try {
      const resultado = await planCuentasServicio.editarCuenta(datos);

      if (resultado.success) {
        // Actualizar la cuenta en la lista si está cargada
        setCuentas(prev =>
          prev.map(c =>
            c.id === datos.cuentaId ? { ...c, ...datos } : c
          )
        );
        return { success: true, data: resultado.data };
      } else {
        setError(resultado.error);
        return { success: false, error: resultado.error };
      }
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, []);

  // ============================================================================
  // DESACTIVAR CUENTA
  // ============================================================================
  const desactivar = useCallback(async (cuentaId) => {
    setLoading(true);
    setError(null);
    try {
      const resultado = await planCuentasServicio.desactivarCuenta(cuentaId);

      if (resultado.success) {
        // Actualizar el estado en la lista
        setCuentas(prev =>
          prev.map(c =>
            c.id === cuentaId ? { ...c, activo: false } : c
          )
        );
        return { success: true, data: resultado.data };
      } else {
        setError(resultado.error);
        return { success: false, error: resultado.error };
      }
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, []);

  // ============================================================================
  // ACTIVAR CUENTA
  // ============================================================================
  const activar = useCallback(async (cuentaId) => {
    setLoading(true);
    setError(null);
    try {
      const resultado = await planCuentasServicio.activarCuenta(cuentaId);

      if (resultado.success) {
        // Actualizar el estado en la lista
        setCuentas(prev =>
          prev.map(c =>
            c.id === cuentaId ? { ...c, activo: true } : c
          )
        );
        return { success: true, data: resultado.data };
      } else {
        setError(resultado.error);
        return { success: false, error: resultado.error };
      }
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, []);

  // ============================================================================
  // LISTAR PLAN DE CUENTAS JERÁRQUICO
  // ============================================================================
  const listar = useCallback(async (soloActivas = true, soloImputables = false) => {
    setLoading(true);
    setError(null);
    try {
      const resultado = await planCuentasServicio.listarPlanCuentasJerarquico(
        empresaActual?.id,
        soloActivas,
        soloImputables
      );

      if (resultado.success) {
        setCuentas(resultado.data);
        return resultado.data;
      } else {
        setError(resultado.error);
        setCuentas([]);
        return [];
      }
    } catch (err) {
      setError(err.message);
      setCuentas([]);
      return [];
    } finally {
      setLoading(false);
    }
  }, [empresaActual]);

  // ============================================================================
  // BUSCAR CUENTAS (Autocomplete)
  // ============================================================================
  const buscar = useCallback(async (busqueda, soloImputables = false, limite = 20) => {
    setLoading(true);
    setError(null);
    try {
      const resultado = await planCuentasServicio.buscarCuentas(
        empresaActual?.id,
        busqueda,
        soloImputables,
        limite
      );

      if (resultado.success) {
        return resultado.data;
      } else {
        setError(resultado.error);
        return [];
      }
    } catch (err) {
      setError(err.message);
      return [];
    } finally {
      setLoading(false);
    }
  }, [empresaActual]);

  // ============================================================================
  // OBTENER CUENTA POR CÓDIGO
  // ============================================================================
  const obtenerPorCodigo = useCallback(async (codigo) => {
    setLoading(true);
    setError(null);
    try {
      const resultado = await planCuentasServicio.obtenerCuentaPorCodigo(
        empresaActual?.id,
        codigo
      );

      if (resultado.success) {
        setCuentaActual(resultado.data);
        return resultado.data;
      } else {
        setError(resultado.error);
        setCuentaActual(null);
        return null;
      }
    } catch (err) {
      setError(err.message);
      setCuentaActual(null);
      return null;
    } finally {
      setLoading(false);
    }
  }, [empresaActual]);

  // ============================================================================
  // VERIFICAR CÓDIGO DISPONIBLE
  // ============================================================================
  const verificarCodigo = useCallback(async (codigo) => {
    setLoading(true);
    setError(null);
    try {
      const resultado = await planCuentasServicio.verificarCodigoDisponible(
        empresaActual?.id,
        codigo
      );

      if (resultado.success) {
        return resultado.data;
      } else {
        setError(resultado.error);
        return null;
      }
    } catch (err) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, [empresaActual]);

  // ============================================================================
  // LIMPIAR ESTADOS
  // ============================================================================
  const limpiar = useCallback(() => {
    setCuentas([]);
    setCuentaActual(null);
    setError(null);
  }, []);

  // ============================================================================
  // RETORNAR TODAS LAS FUNCIONES Y ESTADOS
  // ============================================================================
  return {
    // Estados
    cuentas,
    cuentaActual,
    loading,
    error,

    // Operaciones
    copiarPlantilla,
    agregar,
    editar,
    desactivar,
    activar,

    // Consultas
    listar,
    buscar,
    obtenerPorCodigo,
    verificarCodigo,

    // Utilidades
    limpiar
  };
};

export default usePlanCuentas;