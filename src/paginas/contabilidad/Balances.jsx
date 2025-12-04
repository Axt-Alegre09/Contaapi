/**
 * PÁGINA: BALANCES
 * Balance de Sumas y Saldos
 */

import { useState, useEffect } from 'react';
import { useAsientos } from '../../hooks/useAsientos';
import { usePeriodos } from '../../hooks/usePeriodos';

export default function Balances() {
  const { obtenerBalanceSumasSaldos, loading } = useAsientos();
  const { periodoActivo, periodos, listar: listarPeriodos } = usePeriodos();
  
  const [balance, setBalance] = useState([]);
  const [periodoSeleccionado, setPeriodoSeleccionado] = useState(null);
  const [totales, setTotales] = useState({
    total_debe: 0,
    total_haber: 0,
    total_deudor: 0,
    total_acreedor: 0,
  });

  useEffect(() => {
    listarPeriodos();
  }, []);

  useEffect(() => {
    if (periodoActivo) {
      setPeriodoSeleccionado(periodoActivo.id);
      cargarBalance(periodoActivo.id);
    }
  }, [periodoActivo]);

  const cargarBalance = async (periodoId) => {
    const filtros = {
      periodoId,
    };
    
    const datos = await obtenerBalanceSumasSaldos(filtros);
    
    if (datos && datos.length > 0) {
      setBalance(datos);
      
      // Calcular totales
      const tots = datos.reduce((acc, item) => {
        acc.total_debe += item.total_debe || 0;
        acc.total_haber += item.total_haber || 0;
        acc.total_deudor += item.saldo_deudor || 0;
        acc.total_acreedor += item.saldo_acreedor || 0;
        return acc;
      }, {
        total_debe: 0,
        total_haber: 0,
        total_deudor: 0,
        total_acreedor: 0,
      });
      
      setTotales(tots);
    } else {
      setBalance([]);
    }
  };

  const handleFiltrar = () => {
    if (periodoSeleccionado) {
      cargarBalance(periodoSeleccionado);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 p-4 md:p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">
          Balance de Sumas y Saldos
        </h1>
        <p className="text-gray-400">
          Resumen de movimientos y saldos por cuenta
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
        </div>

        <div className="mt-4">
          <button
            onClick={handleFiltrar}
            disabled={!periodoSeleccionado}
            className="px-6 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
          >
            Generar Balance
          </button>
        </div>
      </div>

      {/* Contenido */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="ml-3 text-gray-400">Cargando...</span>
        </div>
      ) : balance.length === 0 ? (
        <div className="bg-gray-800 rounded-xl border border-gray-700 p-12 text-center">
          <p className="text-gray-400">
            No hay datos para mostrar. Selecciona un período y genera el balance.
          </p>
        </div>
      ) : (
        <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-900 border-b border-gray-700">
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-400 uppercase" rowSpan="2">
                    Código
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-400 uppercase" rowSpan="2">
                    Cuenta
                  </th>
                  <th className="px-3 py-3 text-center text-xs font-medium text-gray-400 uppercase border-l border-gray-700" colSpan="2">
                    Sumas
                  </th>
                  <th className="px-3 py-3 text-center text-xs font-medium text-gray-400 uppercase border-l border-gray-700" colSpan="2">
                    Saldos
                  </th>
                </tr>
                <tr className="bg-gray-900 border-b border-gray-700">
                  <th className="px-3 py-2 text-right text-xs font-medium text-gray-400 uppercase border-l border-gray-700">
                    Debe
                  </th>
                  <th className="px-3 py-2 text-right text-xs font-medium text-gray-400 uppercase">
                    Haber
                  </th>
                  <th className="px-3 py-2 text-right text-xs font-medium text-gray-400 uppercase border-l border-gray-700">
                    Deudor
                  </th>
                  <th className="px-3 py-2 text-right text-xs font-medium text-gray-400 uppercase">
                    Acreedor
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {balance.map((cuenta, index) => (
                  <tr key={index} className="hover:bg-gray-700/30">
                    <td className="px-3 py-3 text-blue-400 font-mono">
                      {cuenta.cuenta_codigo}
                    </td>
                    <td className="px-3 py-3 text-white">
                      {cuenta.cuenta_nombre}
                    </td>
                    <td className="px-3 py-3 text-right text-green-400 font-medium border-l border-gray-700">
                      {cuenta.total_debe > 0 ? `Gs. ${cuenta.total_debe.toLocaleString('es-PY')}` : '-'}
                    </td>
                    <td className="px-3 py-3 text-right text-red-400 font-medium">
                      {cuenta.total_haber > 0 ? `Gs. ${cuenta.total_haber.toLocaleString('es-PY')}` : '-'}
                    </td>
                    <td className="px-3 py-3 text-right text-green-400 font-medium border-l border-gray-700">
                      {cuenta.saldo_deudor > 0 ? `Gs. ${cuenta.saldo_deudor.toLocaleString('es-PY')}` : '-'}
                    </td>
                    <td className="px-3 py-3 text-right text-red-400 font-medium">
                      {cuenta.saldo_acreedor > 0 ? `Gs. ${cuenta.saldo_acreedor.toLocaleString('es-PY')}` : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-gray-900 border-t-2 border-gray-600">
                <tr>
                  <td colSpan="2" className="px-3 py-4 text-right">
                    <span className="text-base font-bold text-white">TOTALES:</span>
                  </td>
                  <td className="px-3 py-4 text-right border-l border-gray-700">
                    <span className="text-base font-bold text-green-400">
                      Gs. {totales.total_debe.toLocaleString('es-PY')}
                    </span>
                  </td>
                  <td className="px-3 py-4 text-right">
                    <span className="text-base font-bold text-red-400">
                      Gs. {totales.total_haber.toLocaleString('es-PY')}
                    </span>
                  </td>
                  <td className="px-3 py-4 text-right border-l border-gray-700">
                    <span className="text-base font-bold text-green-400">
                      Gs. {totales.total_deudor.toLocaleString('es-PY')}
                    </span>
                  </td>
                  <td className="px-3 py-4 text-right">
                    <span className="text-base font-bold text-red-400">
                      Gs. {totales.total_acreedor.toLocaleString('es-PY')}
                    </span>
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Verificación de balance */}
          {Math.abs(totales.total_debe - totales.total_haber) <= 1 && (
            <div className="bg-green-500/10 border-t border-green-500/30 px-4 py-3">
              <div className="flex items-center justify-center gap-2 text-green-400">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="font-medium">Balance cuadrado correctamente</span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}