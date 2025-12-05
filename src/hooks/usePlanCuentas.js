/**
 * HOOK PERSONALIZADO: usePlanCuentas
 * Gestiona todas las operaciones del plan de cuentas con CRUD completo
 */

import { useState, useCallback } from 'react';
import { useEmpresa } from '../contextos/EmpresaContext';
import { useAutenticacion } from './useAutenticacion';
import planCuentasServicio from '../servicios/planCuentasServicio';

export const usePlanCuentas = () => {
  const { empresaActual } = useEmpresa();
  const { usuario } = useAutenticacion();
  const [cuentas, setCuentas] = useState([]);
  const [cuentaActual, setCuentaActual] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // ============================================================================
  // LISTAR PLAN DE CUENTAS
  // ============================================================================
  const listar = useCallback(async (soloActivas = true, soloImputables = false) => {
    if (!empresaActual?.id) return { success: false, error: 'No hay empresa seleccionada' };

    setLoading(true);
    setError(null);
    try {
      const resultado = await planCuentasServicio.listar(
        empresaActual.id,
        soloActivas,
        soloImputables
      );

      if (resultado.success) {
        setCuentas(resultado.data);
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
  // BUSCAR CUENTAS
  // ============================================================================
  const buscar = useCallback(async (filtros = {}) => {
    if (!empresaActual?.id) return { success: false, error: 'No hay empresa seleccionada' };

    setLoading(true);
    setError(null);
    try {
      const resultado = await planCuentasServicio.buscar(empresaActual.id, filtros);

      if (resultado.success) {
        setCuentas(resultado.data);
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
  // OBTENER CUENTA POR ID
  // ============================================================================
  const obtenerPorId = useCallback(async (cuentaId) => {
    setLoading(true);
    setError(null);
    try {
      const resultado = await planCuentasServicio.obtenerPorId(cuentaId);

      if (resultado.success) {
        setCuentaActual(resultado.data);
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
  // AGREGAR CUENTA
  // ============================================================================
  const agregar = useCallback(async (datos) => {
    if (!empresaActual?.id) return { success: false, error: 'No hay empresa seleccionada' };

    setLoading(true);
    setError(null);
    try {
      const resultado = await planCuentasServicio.agregar(
        empresaActual.id,
        datos,
        usuario?.id
      );

      if (resultado.success) {
        // Recargar lista
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
  }, [empresaActual, usuario, listar]);

  // ============================================================================
  // ACTUALIZAR CUENTA
  // ============================================================================
  const actualizar = useCallback(async (cuentaId, datos) => {
    setLoading(true);
    setError(null);
    try {
      const resultado = await planCuentasServicio.actualizar(
        cuentaId,
        datos,
        usuario?.id
      );

      if (resultado.success) {
        // Recargar lista
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
  }, [usuario, listar]);

  // ============================================================================
  // ELIMINAR CUENTA
  // ============================================================================
  const eliminar = useCallback(async (cuentaId) => {
    setLoading(true);
    setError(null);
    try {
      const resultado = await planCuentasServicio.eliminar(cuentaId, usuario?.id);

      if (resultado.success) {
        // Recargar lista
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
  }, [usuario, listar]);

  // ============================================================================
  // COPIAR PLANTILLA
  // ============================================================================
  const copiarPlantilla = useCallback(async (tipoPlantilla) => {
    if (!empresaActual?.id) return { success: false, error: 'No hay empresa seleccionada' };

    setLoading(true);
    setError(null);
    try {
      const resultado = await planCuentasServicio.copiarPlantilla(
        empresaActual.id,
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
  }, [empresaActual, listar]);

  // ============================================================================
  // OBTENER CUENTAS PARA SELECT
  // ============================================================================
  const obtenerParaSelect = useCallback(async () => {
    if (!empresaActual?.id) return { success: false, error: 'No hay empresa seleccionada' };

    try {
      const resultado = await planCuentasServicio.obtenerParaSelect(empresaActual.id);
      return resultado;
    } catch (err) {
      return { success: false, error: err.message };
    }
  }, [empresaActual]);

  // ============================================================================
  // OBTENER CUENTAS PADRE
  // ============================================================================
  const obtenerCuentasPadre = useCallback(async () => {
    if (!empresaActual?.id) return { success: false, error: 'No hay empresa seleccionada' };

    try {
      const resultado = await planCuentasServicio.obtenerCuentasPadre(empresaActual.id);
      return resultado;
    } catch (err) {
      return { success: false, error: err.message };
    }
  }, [empresaActual]);

  return {
    // Estado
    cuentas,
    cuentaActual,
    loading,
    error,

    // Métodos CRUD
    listar,
    buscar,
    obtenerPorId,
    agregar,
    actualizar,
    eliminar,

    // Métodos auxiliares
    copiarPlantilla,
    obtenerParaSelect,
    obtenerCuentasPadre,

    // Setters
    setCuentas,
    setCuentaActual,
    setError
  };
};