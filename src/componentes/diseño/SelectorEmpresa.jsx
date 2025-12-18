/**
 * COMPONENTE: Selector de Empresa (Header)
 * Muestra la empresa actual en el header
 * Compatible con el nuevo contexto (empresa + periodo + rol)
 */

import { Building2 } from 'lucide-react';
import { useEmpresa } from '../../contextos/EmpresaContext';

export const SelectorEmpresa = () => {
  const { empresaActual, periodoActual } = useEmpresa();

  if (!empresaActual) {
    return null;
  }

  return (
    <div className="flex items-center gap-3 px-4 py-2 bg-gradient-to-r from-blue-50 to-purple-50 
      dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg border border-blue-200 
      dark:border-blue-800">
      <Building2 className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0" />
      <div className="flex flex-col min-w-0">
        <span className="text-sm font-semibold text-gray-900 dark:text-white truncate">
          {empresaActual.nombre}
        </span>
        <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
          <span className="truncate">RUC: {empresaActual.ruc}</span>
          {periodoActual && (
            <>
              <span>•</span>
              <span>Período: {periodoActual.anio}</span>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default SelectorEmpresa;