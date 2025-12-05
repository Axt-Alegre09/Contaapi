/**
 * COMPONENTE: Selector de Empresa
 * Dropdown para cambiar entre empresas del usuario
 */

import { Building2, ChevronDown } from 'lucide-react';
import { useEmpresa } from '../../contextos/EmpresaContext';

export const SelectorEmpresa = () => {
  const { empresaActual, empresasDisponibles, cambiarEmpresa, loading } = useEmpresa();

  if (loading) {
    return (
      <div className="flex items-center gap-2 px-3 py-2 bg-gray-100 dark:bg-gray-800 rounded-lg">
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
        <span className="text-sm text-gray-600 dark:text-gray-400">Cargando...</span>
      </div>
    );
  }

  if (!empresaActual || empresasDisponibles.length === 0) {
    return null;
  }

  // Si solo tiene una empresa, mostrar sin dropdown
  if (empresasDisponibles.length === 1) {
    return (
      <div className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-blue-50 to-purple-50 
        dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg border border-blue-200 
        dark:border-blue-800">
        <Building2 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
        <div className="flex flex-col">
          <span className="text-sm font-medium text-gray-900 dark:text-white">
            {empresaActual.nombre_comercial}
          </span>
          <span className="text-xs text-gray-500 dark:text-gray-400">
            RUC: {empresaActual.ruc}
          </span>
        </div>
      </div>
    );
  }

  // Si tiene múltiples empresas, mostrar dropdown
  return (
    <div className="relative">
      <div className="flex items-center gap-2">
        <Building2 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
        <select
          value={empresaActual?.id || ''}
          onChange={(e) => cambiarEmpresa(e.target.value)}
          className="appearance-none px-3 py-2 pr-8 
            bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20
            border border-blue-200 dark:border-blue-800 rounded-lg
            text-sm font-medium text-gray-900 dark:text-white
            hover:from-blue-100 hover:to-purple-100 dark:hover:from-blue-900/30 dark:hover:to-purple-900/30
            focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400
            transition-all cursor-pointer"
        >
          {empresasDisponibles.map(empresa => (
            <option key={empresa.id} value={empresa.id}>
              {empresa.nombre_comercial} - RUC: {empresa.ruc}
            </option>
          ))}
        </select>
        <ChevronDown className="absolute right-2 w-4 h-4 text-blue-600 dark:text-blue-400 pointer-events-none" />
      </div>
    </div>
  );
};

export default SelectorEmpresa;