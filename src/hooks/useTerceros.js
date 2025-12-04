/**
 * HOOK PERSONALIZADO: useTerceros
 * Gestiona todas las operaciones de terceros (clientes/proveedores)
 */

import { useState, useCallback } from 'react';
import { useEmpresa } from '../contextos/EmpresaContext';
import tercerosServicio from '../servicios/tercerosServicio';

export const useTerceros = () => {
  const { empresaActual } = useEmpresa();
  const [terceros, setTerceros] = useState([]);
  const [terceroActual, setTerceroActual] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // ============================================================================
  // CREAR TERCERO
  // ============================================================================
  const crear = useCallback(async (datos) => {
    setLoading(true);
    setError(null);
    try {
      const resultado = await tercerosServicio.crearTercero({
        ...datos,
        empresaId: empresaActual?.id
      });

      if (resultado.success) {
        // Recargar la lista de terceros
        await listar({ tipo: datos.tipo });
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
  // EDITAR TERCERO
  // ============================================================================
  const editar = useCallback(async (datos) => {
    setLoading(true);
    setError(null);
    try {
      const resultado = await tercerosServicio.editarTercero(datos);

      if (resultado.success) {
        // Actualizar el tercero en la lista si está cargado
        setTerceros(prev =>
          prev.map(t =>
            t.id === datos.terceroId ? { ...t, ...datos } : t
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
  // DESACTIVAR TERCERO
  // ============================================================================
  const desactivar = useCallback(async (terceroId) => {
    setLoading(true);
    setError(null);
    try {
      const resultado = await tercerosServicio.desactivarTercero(terceroId);

      if (resultado.success) {
        // Actualizar el estado en la lista
        setTerceros(prev =>
          prev.map(t =>
            t.id === terceroId ? { ...t, activo: false } : t
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
  // ACTIVAR TERCERO
  // ============================================================================
  const activar = useCallback(async (terceroId) => {
    setLoading(true);
    setError(null);
    try {
      const resultado = await tercerosServicio.activarTercero(terceroId);

      if (resultado.success) {
        // Actualizar el estado en la lista
        setTerceros(prev =>
          prev.map(t =>
            t.id === terceroId ? { ...t, activo: true } : t
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
  // LISTAR TERCEROS
  // ============================================================================
  const listar = useCallback(async (filtros = {}) => {
    setLoading(true);
    setError(null);
    try {
      const resultado = await tercerosServicio.listarTerceros({
        empresaId: empresaActual?.id,
        ...filtros
      });

      if (resultado.success) {
        setTerceros(resultado.data);
        return resultado.data;
      } else {
        setError(resultado.error);
        setTerceros([]);
        return [];
      }
    } catch (err) {
      setError(err.message);
      setTerceros([]);
      return [];
    } finally {
      setLoading(false);
    }
  }, [empresaActual]);

  // ============================================================================
  // BUSCAR TERCEROS (Autocomplete)
  // ============================================================================
  const buscar = useCallback(async (busqueda, tipo = null, limite = 20) => {
    setLoading(true);
    setError(null);
    try {
      const resultado = await tercerosServicio.buscarTerceros(
        empresaActual?.id,
        busqueda,
        tipo,
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
  // OBTENER TERCERO POR DOCUMENTO
  // ============================================================================
  const obtenerPorDocumento = useCallback(async (numeroDocumento) => {
    setLoading(true);
    setError(null);
    try {
      const resultado = await tercerosServicio.obtenerTerceroPorDocumento(
        empresaActual?.id,
        numeroDocumento
      );

      if (resultado.success) {
        setTerceroActual(resultado.data);
        return resultado.data;
      } else {
        setError(resultado.error);
        setTerceroActual(null);
        return null;
      }
    } catch (err) {
      setError(err.message);
      setTerceroActual(null);
      return null;
    } finally {
      setLoading(false);
    }
  }, [empresaActual]);

  // ============================================================================
  // VERIFICAR DOCUMENTO DISPONIBLE
  // ============================================================================
  const verificarDocumento = useCallback(async (numeroDocumento, excluirId = null) => {
    setLoading(true);
    setError(null);
    try {
      const resultado = await tercerosServicio.verificarDocumentoDisponible(
        empresaActual?.id,
        numeroDocumento,
        excluirId
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
  // OBTENER MOVIMIENTOS DEL TERCERO
  // ============================================================================
  const obtenerMovimientos = useCallback(async (terceroId, fechaDesde = null, fechaHasta = null) => {
    setLoading(true);
    setError(null);
    try {
      const resultado = await tercerosServicio.obtenerMovimientosTercero(
        terceroId,
        fechaDesde,
        fechaHasta
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
  }, []);

  // ============================================================================
  // OBTENER SALDO DEL TERCERO
  // ============================================================================
  const obtenerSaldo = useCallback(async (terceroId, fechaHasta = null) => {
    setLoading(true);
    setError(null);
    try {
      const resultado = await tercerosServicio.obtenerSaldoTercero(terceroId, fechaHasta);

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
    setTerceros([]);
    setTerceroActual(null);
    setError(null);
  }, []);

  // ============================================================================
  // RETORNAR TODAS LAS FUNCIONES Y ESTADOS
  // ============================================================================
  return {
    // Estados
    terceros,
    terceroActual,
    loading,
    error,

    // Operaciones CRUD
    crear,
    editar,
    desactivar,
    activar,

    // Consultas
    listar,
    buscar,
    obtenerPorDocumento,
    verificarDocumento,

    // Información adicional
    obtenerMovimientos,
    obtenerSaldo,

    // Utilidades
    limpiar
  };
};

export default useTerceros;