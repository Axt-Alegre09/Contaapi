/**
 * CONTEXT: Empresa y Período Fiscal
 * Gestiona la empresa actual, período fiscal y rol del usuario
 */

import { createContext, useContext, useState, useEffect } from 'react';

const EmpresaContext = createContext();

export const EmpresaProvider = ({ children }) => {
  const [empresaActual, setEmpresaActual] = useState(null);
  const [periodoActual, setPeriodoActual] = useState(null);
  const [rolActual, setRolActual] = useState(null);

  // Cargar desde localStorage al montar
  useEffect(() => {
    const empresaGuardada = localStorage.getItem('contaapi-empresa');
    const periodoGuardado = localStorage.getItem('contaapi-periodo');
    const rolGuardado = localStorage.getItem('contaapi-rol');

    if (empresaGuardada) {
      try {
        setEmpresaActual(JSON.parse(empresaGuardada));
      } catch (error) {
        console.error('Error parseando empresa desde localStorage:', error);
        localStorage.removeItem('contaapi-empresa');
      }
    }

    if (periodoGuardado) {
      try {
        setPeriodoActual(JSON.parse(periodoGuardado));
      } catch (error) {
        console.error('Error parseando periodo desde localStorage:', error);
        localStorage.removeItem('contaapi-periodo');
      }
    }

    if (rolGuardado) {
      setRolActual(rolGuardado);
    }
  }, []);

  /**
   * Establecer contexto completo (empresa + periodo + rol)
   * Se llama desde SelectorEmpresa después de seleccionar empresa
   */
  const establecerContexto = (empresa, periodo, rol) => {
    console.log('📋 Estableciendo contexto:', { empresa, periodo, rol });
    
    setEmpresaActual(empresa);
    setPeriodoActual(periodo);
    setRolActual(rol);

    // Guardar en localStorage
    localStorage.setItem('contaapi-empresa', JSON.stringify(empresa));
    localStorage.setItem('contaapi-periodo', JSON.stringify(periodo));
    localStorage.setItem('contaapi-rol', rol);

    console.log('✅ Contexto establecido correctamente');
  };

  /**
   * Limpiar contexto (al cerrar sesión)
   */
  const limpiarContexto = () => {
    console.log('🗑️ Limpiando contexto');
    
    setEmpresaActual(null);
    setPeriodoActual(null);
    setRolActual(null);

    localStorage.removeItem('contaapi-empresa');
    localStorage.removeItem('contaapi-periodo');
    localStorage.removeItem('contaapi-rol');
  };

  /**
   * Actualizar solo la empresa (mantiene periodo y rol)
   */
  const actualizarEmpresa = (empresa) => {
    setEmpresaActual(empresa);
    localStorage.setItem('contaapi-empresa', JSON.stringify(empresa));
  };

  /**
   * Actualizar solo el periodo (mantiene empresa y rol)
   */
  const actualizarPeriodo = (periodo) => {
    setPeriodoActual(periodo);
    localStorage.setItem('contaapi-periodo', JSON.stringify(periodo));
  };

  /**
   * Cambiar empresa (alias para compatibilidad)
   */
  const cambiarEmpresa = (empresaId) => {
    console.warn('⚠️ cambiarEmpresa() está deprecated, usa establecerContexto()');
    // Por ahora no hace nada, solo avisa
  };

  /**
   * Verificar si hay contexto completo
   */
  const tieneContextoCompleto = Boolean(
    empresaActual && 
    periodoActual && 
    rolActual
  );

  const value = {
    // Estados
    empresaActual,
    periodoActual,
    rolActual,
    
    // Funciones principales
    establecerContexto,
    limpiarContexto,
    actualizarEmpresa,
    actualizarPeriodo,
    
    // Funciones legacy (compatibilidad)
    cambiarEmpresa,
    
    // Verificaciones
    tieneContextoCompleto,
    
    // Alias para RequiereContexto
    tieneContexto: tieneContextoCompleto
  };

  return (
    <EmpresaContext.Provider value={value}>
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