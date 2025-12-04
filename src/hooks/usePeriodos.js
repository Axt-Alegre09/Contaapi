/**
 * HOOK PERSONALIZADO: usePeriodos
 * Gestiona todas las operaciones de períodos contables
 */

import { useState, useCallback, useEffect } from 'react';
import { useEmpresa } from '../contextos/EmpresaContext';
import periodosServicio from '../servicios/periodosServicio';

export const usePeriodos = () => {
  const { empresaActual } = useEmpresa();
  const [periodos, setPeriodos] = useState([]);
  const [periodoActivo, setPeriodoActivo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // ============================================================================
  // CARGAR PERÍODO ACTIVO AL MONTAR
  // ============================================================================
  useEffect(() => {
    if (empresaActual?.id) {
      obtenerActivo();
    }
  }, [empresaActual]);

  // ============================================================================
  // CREAR PERÍODO
  // ============================================================================
  const crear = useCallback(async (datos) => {
    setLoading(true);
    setError(null);
    try {
      const resultado = await periodosServicio.crearPeriodo({
        ...datos,
        empresaId: empresaActual?.id
      });

      if (resultado.success) {
        // Recargar lista de períodos
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
  // CREAR PERÍODOS ANUALES (12 meses automático)
  // ============================================================================
  const crearAnuales = useCallback(async (anio) => {
    setLoading(true);
    setError(null);
    try {
      const resultado = await periodosServicio.crearPeriodosAnuales(
        empresaActual?.id,
        anio
      );

      if (resultado.success) {
        // Recargar lista de períodos
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
  // CERRAR PERÍODO
  // ============================================================================
  const cerrar = useCallback(async (periodoId, cerradoPor) => {
    setLoading(true);
    setError(null);
    try {
      const resultado = await periodosServicio.cerrarPeriodo(periodoId, cerradoPor);

      if (resultado.success) {
        // Actualizar el período en la lista
        setPeriodos(prev =>
          prev.map(p =>
            p.id === periodoId ? { ...p, cerrado: true } : p
          )
        );
        
        // Si es el período activo, limpiar
        if (periodoActivo?.id === periodoId) {
          setPeriodoActivo(null);
        }

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
  }, [periodoActivo]);

  // ============================================================================
  // ABRIR PERÍODO (reabrir)
  // ============================================================================
  const abrir = useCallback(async (periodoId, abiertoPor, motivo) => {
    setLoading(true);
    setError(null);
    try {
      const resultado = await periodosServicio.abrirPeriodo(periodoId, abiertoPor, motivo);

      if (resultado.success) {
        // Actualizar el período en la lista
        setPeriodos(prev =>
          prev.map(p =>
            p.id === periodoId ? { ...p, cerrado: false } : p
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
  // OBTENER PERÍODO ACTIVO
  // ============================================================================
  const obtenerActivo = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const resultado = await periodosServicio.obtenerPeriodoActivo(empresaActual?.id);

      if (resultado.success) {
        setPeriodoActivo(resultado.data);
        return resultado.data;
      } else {
        setError(resultado.error);
        setPeriodoActivo(null);
        return null;
      }
    } catch (err) {
      setError(err.message);
      setPeriodoActivo(null);
      return null;
    } finally {
      setLoading(false);
    }
  }, [empresaActual]);

  // ============================================================================
  // LISTAR PERÍODOS
  // ============================================================================
  const listar = useCallback(async (soloAbiertos = false, anio = null) => {
    setLoading(true);
    setError(null);
    try {
      const resultado = await periodosServicio.listarPeriodos(
        empresaActual?.id,
        soloAbiertos,
        anio
      );

      if (resultado.success) {
        setPeriodos(resultado.data);
        return resultado.data;
      } else {
        setError(resultado.error);
        setPeriodos([]);
        return [];
      }
    } catch (err) {
      setError(err.message);
      setPeriodos([]);
      return [];
    } finally {
      setLoading(false);
    }
  }, [empresaActual]);

  // ============================================================================
  // VERIFICAR FECHA EN PERÍODO ABIERTO
  // ============================================================================
  const verificarFecha = useCallback(async (fecha) => {
    setLoading(true);
    setError(null);
    try {
      const resultado = await periodosServicio.verificarFechaEnPeriodoAbierto(
        empresaActual?.id,
        fecha
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
  // OBTENER ESTADÍSTICAS DEL PERÍODO
  // ============================================================================
  const obtenerEstadisticas = useCallback(async (periodoId) => {
    setLoading(true);
    setError(null);
    try {
      const resultado = await periodosServicio.obtenerEstadisticasPeriodo(periodoId);

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
  }, []);

  // ============================================================================
  // LIMPIAR ESTADOS
  // ============================================================================
  const limpiar = useCallback(() => {
    setPeriodos([]);
    setPeriodoActivo(null);
    setError(null);
  }, []);

  // ============================================================================
  // RETORNAR TODAS LAS FUNCIONES Y ESTADOS
  // ============================================================================
  return {
    // Estados
    periodos,
    periodoActivo,
    loading,
    error,

    // Operaciones
    crear,
    crearAnuales,
    cerrar,
    abrir,

    // Consultas
    obtenerActivo,
    listar,
    verificarFecha,
    obtenerEstadisticas,

    // Utilidades
    limpiar
  };
};

export default usePeriodos;