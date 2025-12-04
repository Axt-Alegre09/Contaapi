/**
 * SELECTOR DE PERÍODO CONTABLE
 * Componente responsive mobile-first
 * Se usa en TODOS los formularios contables
 */

import { useEffect, useState } from 'react';
import { usePeriodos } from '../../hooks/usePeriodos';

export default function SelectorPeriodo({ 
  onChange, 
  value = null,
  soloAbiertos = true,
  className = '' 
}) {
  const { periodos, periodoActivo, listar, loading } = usePeriodos();
  const [periodoSeleccionado, setPeriodoSeleccionado] = useState(value);

  useEffect(() => {
    cargarPeriodos();
  }, []);

  useEffect(() => {
    // Si no hay valor inicial, usar el período activo
    if (!value && periodoActivo && !periodoSeleccionado) {
      setPeriodoSeleccionado(periodoActivo.id);
      onChange?.(periodoActivo.id);
    }
  }, [periodoActivo]);

  const cargarPeriodos = async () => {
    await listar(soloAbiertos);
  };

  const handleChange = (e) => {
    const nuevoPeriodoId = e.target.value;
    setPeriodoSeleccionado(nuevoPeriodoId);
    onChange?.(nuevoPeriodoId);
  };

  if (loading) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        <span className="text-sm text-gray-400">Cargando períodos...</span>
      </div>
    );
  }

  if (periodos.length === 0) {
    return (
      <div className={`text-center p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg ${className}`}>
        <p className="text-sm text-yellow-500 mb-2">⚠️ No hay períodos disponibles</p>
        <p className="text-xs text-gray-400">
          Debe crear períodos contables antes de continuar
        </p>
      </div>
    );
  }

  return (
    <div className={`w-full ${className}`}>
      {/* Label */}
      <label 
        htmlFor="selector-periodo" 
        className="block text-sm font-medium text-gray-300 mb-2"
      >
        Período Contable
        {periodoActivo && (
          <span className="ml-2 text-xs text-blue-400">
            (Actual: {periodoActivo.nombre})
          </span>
        )}
      </label>

      {/* Select - Responsive */}
      <div className="relative">
        <select
          id="selector-periodo"
          value={periodoSeleccionado || ''}
          onChange={handleChange}
          className="
            w-full
            px-4 py-3
            bg-gray-800 
            text-white 
            border border-gray-700 
            rounded-lg
            focus:outline-none 
            focus:ring-2 
            focus:ring-blue-500 
            focus:border-transparent
            cursor-pointer
            transition-all
            appearance-none
            text-sm md:text-base
          "
        >
          <option value="">Seleccione un período</option>
          {periodos.map((periodo) => (
            <option 
              key={periodo.id} 
              value={periodo.id}
              className="bg-gray-800"
            >
              {periodo.nombre}
              {periodo.cerrado ? ' (Cerrado)' : ''}
              {periodo.cantidad_asientos > 0 && 
                ` - ${periodo.cantidad_asientos} asientos`
              }
            </option>
          ))}
        </select>

        {/* Icono de dropdown */}
        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
          <svg 
            className="w-5 h-5 text-gray-400" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M19 9l-7 7-7-7" 
            />
          </svg>
        </div>
      </div>

      {/* Info adicional - Oculta en mobile, visible en tablet+ */}
      {periodoSeleccionado && (
        <div className="hidden md:block mt-2">
          <div className="text-xs text-gray-400 space-y-1">
            {(() => {
              const periodo = periodos.find(p => p.id === periodoSeleccionado);
              return periodo ? (
                <>
                  <div className="flex items-center justify-between">
                    <span>Desde: {new Date(periodo.fecha_inicio).toLocaleDateString('es-PY')}</span>
                    <span>Hasta: {new Date(periodo.fecha_fin).toLocaleDateString('es-PY')}</span>
                  </div>
                  {periodo.cerrado && (
                    <div className="text-yellow-500 flex items-center gap-1">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                      </svg>
                      <span>Período cerrado</span>
                    </div>
                  )}
                </>
              ) : null;
            })()}
          </div>
        </div>
      )}
    </div>
  );
}