/**
 * HOOK: usePlanCuentas
 * Gestiona el plan de cuentas con multi-tenancy
 */

import { useState, useCallback } from 'react';
import { useEmpresa } from '../contextos/EmpresaContext';
import * as planCuentasServicio from '../servicios/planCuentasServicio';

export const usePlanCuentas = () => {
  const { empresaActual } = useEmpresa();
  
  const [cuentas, setCuentas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Validar empresa antes de cada operación
  const validarEmpresa = () => {
    if (!empresaActual) {
      throw new Error('No hay empresa seleccionada');
    }
    return empresaActual.id;
  };

  const listar = useCallback(async (soloActivas = true, incluirPadres = false) => {
    try {
      const empresaId = validarEmpresa();
      setLoading(true);
      setError(null);

      const resultado = await planCuentasServicio.listar(
        empresaId,
        soloActivas, 
        incluirPadres
      );

      if (resultado.success) {
        setCuentas(resultado.data || []);
      } else {
        setError(resultado.error);
      }
    } catch (err) {
      setError(err.message);
      console.error('Error listando cuentas:', err);
    } finally {
      setLoading(false);
    }
  }, [empresaActual]);

  const buscar = useCallback(async (filtros) => {
    try {
      const empresaId = validarEmpresa();
      setLoading(true);
      setError(null);

      const resultado = await planCuentasServicio.buscar(
        empresaId,
        filtros
      );

      if (resultado.success) {
        setCuentas(resultado.data || []);
      } else {
        setError(resultado.error);
      }
    } catch (err) {
      setError(err.message);
      console.error('Error buscando cuentas:', err);
    } finally {
      setLoading(false);
    }
  }, [empresaActual]);

  const crear = useCallback(async (datos) => {
    try {
      const empresaId = validarEmpresa();
      setLoading(true);
      setError(null);

      const resultado = await planCuentasServicio.crear({
        ...datos,
        empresa_id: empresaId
      });

      if (resultado.success) {
        await listar();
        return resultado;
      } else {
        setError(resultado.error);
        return resultado;
      }
    } catch (err) {
      setError(err.message);
      console.error('Error creando cuenta:', err);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, [empresaActual, listar]);

  const actualizar = useCallback(async (id, datos) => {
    try {
      validarEmpresa();
      setLoading(true);
      setError(null);

      const resultado = await planCuentasServicio.actualizar(id, datos);

      if (resultado.success) {
        await listar();
        return resultado;
      } else {
        setError(resultado.error);
        return resultado;
      }
    } catch (err) {
      setError(err.message);
      console.error('Error actualizando cuenta:', err);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, [empresaActual, listar]);

  const eliminar = useCallback(async (id) => {
    try {
      validarEmpresa();
      setLoading(true);
      setError(null);

      const resultado = await planCuentasServicio.eliminar(id);

      if (resultado.success) {
        await listar();
        return resultado;
      } else {
        setError(resultado.error);
        return resultado;
      }
    } catch (err) {
      setError(err.message);
      console.error('Error eliminando cuenta:', err);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, [empresaActual, listar]);

  const copiarPlantilla = useCallback(async (tipo) => {
    try {
      const empresaId = validarEmpresa();
      setLoading(true);
      setError(null);

      const resultado = await planCuentasServicio.copiarPlantilla(
        empresaId,
        tipo
      );

      if (resultado.success) {
        await listar();
        return resultado;
      } else {
        setError(resultado.error);
        return resultado;
      }
    } catch (err) {
      setError(err.message);
      console.error('Error copiando plantilla:', err);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, [empresaActual, listar]);

  const eliminarTodo = useCallback(async () => {
    try {
      const empresaId = validarEmpresa();
      setLoading(true);
      setError(null);

      const resultado = await planCuentasServicio.eliminarTodo(empresaId);

      if (resultado.success) {
        await listar();
        return resultado;
      } else {
        setError(resultado.error);
        return resultado;
      }
    } catch (err) {
      setError(err.message);
      console.error('Error eliminando plan:', err);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, [empresaActual, listar]);

  const obtenerPorId = useCallback(async (id) => {
    try {
      validarEmpresa();
      setLoading(true);
      setError(null);

      const resultado = await planCuentasServicio.obtenerPorId(id);

      if (resultado.success) {
        return resultado;
      } else {
        setError(resultado.error);
        return resultado;
      }
    } catch (err) {
      setError(err.message);
      console.error('Error obteniendo cuenta:', err);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, [empresaActual]);

  return {
    cuentas,
    loading,
    error,
    listar,
    buscar,
    crear,
    actualizar,
    eliminar,
    copiarPlantilla,
    eliminarTodo,
    obtenerPorId,
    empresaActual
  };
};

export default usePlanCuentas;