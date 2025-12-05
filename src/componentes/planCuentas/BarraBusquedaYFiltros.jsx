/**
 * COMPONENTE: BarraBusquedaYFiltros
 * Búsqueda y filtros para el plan de cuentas
 */

import { useState, useEffect } from 'react';
import { Search, Filter, X } from 'lucide-react';
import { usePlanCuentas } from '../../hooks/usePlanCuentas';

export const BarraBusquedaYFiltros = () => {
  const { buscar, listar } = usePlanCuentas();
  const [termino, setTermino] = useState('');
  const [mostrarFiltros, setMostrarFiltros] = useState(false);
  const [filtros, setFiltros] = useState({
    nivel: '',
    tipoCuenta: '',
    soloImputables: false,
    soloActivas: true
  });

  // Búsqueda con debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      aplicarBusqueda();
    }, 300);

    return () => clearTimeout(timer);
  }, [termino, filtros]);

  const aplicarBusqueda = () => {
    if (termino || filtros.nivel || filtros.tipoCuenta || filtros.soloImputables) {
      buscar({
        termino: termino || null,
        nivel: filtros.nivel ? parseInt(filtros.nivel) : null,
        tipoCuenta: filtros.tipoCuenta || null,
        soloImputables: filtros.soloImputables,
        soloActivas: filtros.soloActivas
      });
    } else {
      listar(filtros.soloActivas, false);
    }
  };

  const limpiarFiltros = () => {
    setTermino('');
    setFiltros({
      nivel: '',
      tipoCuenta: '',
      soloImputables: false,
      soloActivas: true
    });
  };

  const hayFiltrosActivos = termino || filtros.nivel || filtros.tipoCuenta || filtros.soloImputables;

  return (
    <div className="space-y-4">
      {/* Barra de búsqueda */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Input de búsqueda */}
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={termino}
            onChange={(e) => setTermino(e.target.value)}
            placeholder="Buscar por código o nombre..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 
              rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500
              bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
        </div>

        {/* Botón de filtros */}
        <button
          onClick={() => setMostrarFiltros(!mostrarFiltros)}
          className={`flex items-center space-x-2 px-4 py-2 rounded-lg border
            ${mostrarFiltros 
              ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-500 text-blue-700 dark:text-blue-300' 
              : 'bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300'
            }
            hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors`}
        >
          <Filter className="w-5 h-5" />
          <span className="hidden sm:inline">Filtros</span>
          {hayFiltrosActivos && (
            <span className="bg-blue-500 text-white text-xs px-2 py-0.5 rounded-full">
              •
            </span>
          )}
        </button>

        {/* Botón limpiar (solo si hay filtros) */}
        {hayFiltrosActivos && (
          <button
            onClick={limpiarFiltros}
            className="flex items-center space-x-2 px-4 py-2 rounded-lg border
              bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 
              text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600"
          >
            <X className="w-5 h-5" />
            <span className="hidden sm:inline">Limpiar</span>
          </button>
        )}
      </div>

      {/* Panel de filtros expandible */}
      {mostrarFiltros && (
        <div className="bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-lg p-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Filtro por Nivel */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Nivel
              </label>
              <select
                value={filtros.nivel}
                onChange={(e) => setFiltros({ ...filtros, nivel: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 
                  rounded-lg focus:ring-2 focus:ring-blue-500
                  bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="">Todos los niveles</option>
                <option value="1">Nivel 1</option>
                <option value="2">Nivel 2</option>
                <option value="3">Nivel 3</option>
                <option value="4">Nivel 4</option>
                <option value="5">Nivel 5</option>
              </select>
            </div>

            {/* Filtro por Tipo de Cuenta */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Tipo de Cuenta
              </label>
              <select
                value={filtros.tipoCuenta}
                onChange={(e) => setFiltros({ ...filtros, tipoCuenta: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 
                  rounded-lg focus:ring-2 focus:ring-blue-500
                  bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="">Todos los tipos</option>
                <option value="Activo">Activo</option>
                <option value="Pasivo">Pasivo</option>
                <option value="Patrimonio">Patrimonio</option>
                <option value="Ingreso">Ingreso</option>
                <option value="Gasto">Gasto</option>
              </select>
            </div>

            {/* Checkboxes */}
            <div className="flex flex-col justify-center space-y-2">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={filtros.soloImputables}
                  onChange={(e) => setFiltros({ ...filtros, soloImputables: e.target.checked })}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  Solo imputables
                </span>
              </label>

              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={filtros.soloActivas}
                  onChange={(e) => setFiltros({ ...filtros, soloActivas: e.target.checked })}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  Solo activas
                </span>
              </label>
            </div>

            {/* Resumen */}
            <div className="flex items-center justify-center">
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {/* Este valor se actualiza desde el componente padre */}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  cuentas encontradas
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
