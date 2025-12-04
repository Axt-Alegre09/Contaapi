/**
 * PÁGINA: LIBRO MAYOR
 * Reporte de movimientos por cuenta
 */

import { useState, useEffect } from 'react';
import { useAsientos } from '../../hooks/useAsientos';
import { usePeriodos } from '../../hooks/usePeriodos';

export default function LibroMayor() {
  const { obtenerLibroMayor, loading } = useAsientos();
  const { periodoActivo, periodos, listar: listarPeriodos } = usePeriodos();
  
  const [libroMayor, setLibroMayor] = useState([]);
  const [periodoSeleccionado, setPeriodoSeleccionado] = useState(null);
  const [cuentaCodigo, setCuentaCodigo] = useState('');

  useEffect(() => {
    listarPeriodos();
  }, []);

  useEffect(() => {
    if (periodoActivo) {
      setPeriodoSeleccionado(periodoActivo.id);
    }
  }, [periodoActivo]);

  const cargarLibroMayor = async () => {
    if (!periodoSeleccionado) return;
    
    const filtros = {
      periodoId: periodoSeleccionado,
      cuentaCodigo: cuentaCodigo || undefined,
    };
    
    const datos = await obtenerLibroMayor(filtros);
    setLibroMayor(datos || []);
  };

  return (
    <div className="min-h-screen bg-gray-900 p-4 md:p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">
          Libro Mayor
        </h1>
        <p className="text-gray-400">
          Movimientos y saldos por cuenta contable
        </p>
      </div>

      {/* Filtros */}
      <div className="bg-gray-800 rounded-xl border border-gray-700 p-4 md:p-6 mb-6">
        <h2 className="text-lg font-semibold text-white mb-4">Filtros</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

          {/* Cuenta (opcional) */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Código de Cuenta (Opcional)
            </label>
            <input
              type="text"
              value={cuentaCodigo}
              onChange={(e) => setCuentaCodigo(e.target.value)}
              placeholder="Ej: 1.1.01"
              className="w-full px-4 py-2 bg-gray-900 text-white border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="mt-4">
          <button
            onClick={cargarLibroMayor}
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
      ) : libroMayor.length === 0 ? (
        <div className="bg-gray-800 rounded-xl border border-gray-700 p-12 text-center">
          <p className="text-gray-400">
            No hay datos para mostrar. Selecciona un período y genera el reporte.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {libroMayor.map((cuenta, index) => (
            <div key={index} className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
              {/* Header de cuenta */}
              <div className="bg-gray-900 px-4 py-3 border-b border-gray-700">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-blue-400 font-bold">{cuenta.cuenta_codigo}</p>
                    <p className="text-base text-white font-semibold">{cuenta.cuenta_nombre}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-400">Saldo Final</p>
                    <p className={`text-lg font-bold ${cuenta.saldo_final >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      Gs. {Math.abs(cuenta.saldo_final).toLocaleString('es-PY')}
                    </p>
                  </div>
                </div>
              </div>

              {/* Movimientos */}
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-900/50 border-b border-gray-700">
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-400 uppercase">Fecha</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-400 uppercase">Asiento</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-400 uppercase">Descripción</th>
                      <th className="px-4 py-2 text-right text-xs font-medium text-gray-400 uppercase">Debe</th>
                      <th className="px-4 py-2 text-right text-xs font-medium text-gray-400 uppercase">Haber</th>
                      <th className="px-4 py-2 text-right text-xs font-medium text-gray-400 uppercase">Saldo</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-700">
                    {cuenta.movimientos?.map((mov, idx) => (
                      <tr key={idx} className="hover:bg-gray-700/30">
                        <td className="px-4 py-2 text-sm text-gray-300">
                          {new Date(mov.fecha).toLocaleDateString('es-PY')}
                        </td>
                        <td className="px-4 py-2 text-sm text-blue-400">
                          #{mov.numero_asiento}
                        </td>
                        <td className="px-4 py-2 text-sm text-gray-300">
                          {mov.descripcion}
                        </td>
                        <td className="px-4 py-2 text-sm text-right text-green-400">
                          {mov.debe > 0 ? `Gs. ${mov.debe.toLocaleString('es-PY')}` : '-'}
                        </td>
                        <td className="px-4 py-2 text-sm text-right text-red-400">
                          {mov.haber > 0 ? `Gs. ${mov.haber.toLocaleString('es-PY')}` : '-'}
                        </td>
                        <td className="px-4 py-2 text-sm text-right text-white font-medium">
                          Gs. {Math.abs(mov.saldo).toLocaleString('es-PY')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}