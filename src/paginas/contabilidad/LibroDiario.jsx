/**
 * PÁGINA: LIBRO DIARIO
 * Reporte de todos los asientos en orden cronológico
 */

import { useState, useEffect } from 'react';
import { useAsientos } from '../../hooks/useAsientos';
import { usePeriodos } from '../../hooks/usePeriodos';

export default function LibroDiario() {
  const { obtenerLibroDiario, loading } = useAsientos();
  const { periodoActivo, periodos, listar: listarPeriodos } = usePeriodos();
  
  const [libroDiario, setLibroDiario] = useState([]);
  const [periodoSeleccionado, setPeriodoSeleccionado] = useState(null);
  const [fechaDesde, setFechaDesde] = useState('');
  const [fechaHasta, setFechaHasta] = useState('');

  useEffect(() => {
    listarPeriodos();
  }, []);

  useEffect(() => {
    if (periodoActivo) {
      setPeriodoSeleccionado(periodoActivo.id);
      cargarLibroDiario(periodoActivo.id);
    }
  }, [periodoActivo]);

  const cargarLibroDiario = async (periodoId) => {
    const filtros = {
      periodoId,
      fechaDesde: fechaDesde || undefined,
      fechaHasta: fechaHasta || undefined,
    };
    
    const datos = await obtenerLibroDiario(filtros);
    setLibroDiario(datos || []);
  };

  const handleFiltrar = () => {
    if (periodoSeleccionado) {
      cargarLibroDiario(periodoSeleccionado);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 p-4 md:p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">
          Libro Diario
        </h1>
        <p className="text-gray-400">
          Registro cronológico de todos los asientos contables
        </p>
      </div>

      {/* Filtros */}
      <div className="bg-gray-800 rounded-xl border border-gray-700 p-4 md:p-6 mb-6">
        <h2 className="text-lg font-semibold text-white mb-4">Filtros</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Período */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Período
            </label>
            <select
              value={periodoSeleccionado || ''}
              onChange={(e) => setPeriodoSeleccionado(e.target.value)}
              className="w-full px-4 py-2 bg-gray-900 text-white border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Seleccione período</option>
              {periodos.map(p => (
                <option key={p.id} value={p.id}>{p.nombre}</option>
              ))}
            </select>
          </div>

          {/* Fecha Desde */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Fecha Desde
            </label>
            <input
              type="date"
              value={fechaDesde}
              onChange={(e) => setFechaDesde(e.target.value)}
              className="w-full px-4 py-2 bg-gray-900 text-white border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Fecha Hasta */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Fecha Hasta
            </label>
            <input
              type="date"
              value={fechaHasta}
              onChange={(e) => setFechaHasta(e.target.value)}
              className="w-full px-4 py-2 bg-gray-900 text-white border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="mt-4">
          <button
            onClick={handleFiltrar}
            disabled={!periodoSeleccionado}
            className="px-6 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
          >
            Generar Reporte
          </button>
        </div>
      </div>

      {/* Contenido */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="ml-3 text-gray-400">Cargando...</span>
        </div>
      ) : libroDiario.length === 0 ? (
        <div className="bg-gray-800 rounded-xl border border-gray-700 p-12 text-center">
          <p className="text-gray-400">
            No hay datos para mostrar. Selecciona un período y genera el reporte.
          </p>
        </div>
      ) : (
        <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-900 border-b border-gray-700">
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Fecha</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Nº Asiento</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Cuenta</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Descripción</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-400 uppercase">Debe</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-400 uppercase">Haber</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {libroDiario.map((linea, index) => (
                  <tr key={index} className="hover:bg-gray-700/30">
                    <td className="px-4 py-3 text-sm text-gray-300">
                      {new Date(linea.fecha).toLocaleDateString('es-PY')}
                    </td>
                    <td className="px-4 py-3 text-sm text-blue-400">
                      #{linea.numero_asiento}
                    </td>
                    <td className="px-4 py-3">
                      <div>
                        <p className="text-sm text-blue-400">{linea.cuenta_codigo}</p>
                        <p className="text-sm text-white">{linea.cuenta_nombre}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-300">
                      {linea.descripcion || linea.glosa}
                    </td>
                    <td className="px-4 py-3 text-sm text-right text-green-400 font-medium">
                      {linea.debe > 0 ? `Gs. ${linea.debe.toLocaleString('es-PY')}` : '-'}
                    </td>
                    <td className="px-4 py-3 text-sm text-right text-red-400 font-medium">
                      {linea.haber > 0 ? `Gs. ${linea.haber.toLocaleString('es-PY')}` : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}