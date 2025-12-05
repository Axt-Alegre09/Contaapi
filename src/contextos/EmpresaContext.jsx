/**
 * CONTEXT: Empresa Activa
 * Gestiona la empresa actual del usuario y sus empresas disponibles
 */

import { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../configuracion/supabase';

const EmpresaContext = createContext();

export const EmpresaProvider = ({ children }) => {
  const [empresaActual, setEmpresaActual] = useState(null);
  const [empresasDisponibles, setEmpresasDisponibles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    cargarEmpresas();
  }, []);

  const cargarEmpresas = async () => {
    try {
      setLoading(true);
      setError(null);

      // Obtener usuario actual
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError) throw userError;
      if (!user) {
        setLoading(false);
        return;
      }

      // Obtener empresas del usuario
      const { data: empresas, error: empresasError } = await supabase
        .from('empresas')
        .select('*')
        .eq('user_id', user.id)
        .is('deleted_at', null)
        .eq('estado', 'activa')
        .order('created_at', { ascending: true });

      if (empresasError) throw empresasError;

      setEmpresasDisponibles(empresas || []);

      // Cargar empresa activa desde localStorage o usar la primera
      const empresaGuardadaId = localStorage.getItem('empresa_actual_id');
      
      let empresaInicial = null;
      if (empresaGuardadaId) {
        empresaInicial = empresas?.find(e => e.id === empresaGuardadaId);
      }
      
      if (!empresaInicial && empresas && empresas.length > 0) {
        empresaInicial = empresas[0];
      }
      
      if (empresaInicial) {
        setEmpresaActual(empresaInicial);
        localStorage.setItem('empresa_actual_id', empresaInicial.id);
      }

    } catch (error) {
      console.error('Error cargando empresas:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const cambiarEmpresa = (empresaId) => {
    const empresa = empresasDisponibles.find(e => e.id === empresaId);
    if (empresa) {
      setEmpresaActual(empresa);
      localStorage.setItem('empresa_actual_id', empresa.id);
      
      // Recargar la página para actualizar todos los datos
      window.location.reload();
    }
  };

  const recargarEmpresas = async () => {
    await cargarEmpresas();
  };

  return (
    <EmpresaContext.Provider value={{
      empresaActual,
      empresasDisponibles,
      cambiarEmpresa,
      recargarEmpresas,
      loading,
      error
    }}>
      {children}
    </EmpresaContext.Provider>
  );
};

export const useEmpresa = () => {
  const context = useContext(EmpresaContext);
  if (!context) {
    throw new Error('useEmpresa debe usarse dentro de EmpresaProvider');
  }
  return context;
};

export default EmpresaContext;