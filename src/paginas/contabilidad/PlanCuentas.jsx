/**
 * PÁGINA: PLAN DE CUENTAS
 * Gestión del catálogo de cuentas contables
 */

import { useState, useEffect } from 'react';
import { usePlanCuentas } from '../../hooks/usePlanCuentas';

export default function PlanCuentas() {
  const { cuentas, listar, copiarPlantilla, loading } = usePlanCuentas();
  const [mostrarPlantillas, setMostrarPlantillas] = useState(false);

  useEffect(() => {
    cargarCuentas();
  }, []);

  const cargarCuentas = async () => {
    await listar(true, false); // Solo activas, todas (no solo imputables)
  };

  const handleCopiarPlantilla = async (tipo) => {
    if (confirm(`¿Está seguro de copiar la plantilla ${tipo === 'comercial' ? 'COMERCIAL' : 'SERVICIOS'}? Esto agregará aproximadamente ${tipo === 'comercial' ? '150' : '80'} cuentas.`)) {
      await copiarPlantilla(tipo);
      setMostrarPlantillas(false);
      cargarCuentas();
      alert('✅ Plantilla copiada exitosamente');
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 p-4 md:p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">
              Plan de Cuentas
            </h1>
            <p className="text-gray-400">
              {cuentas.length} cuentas contables
            </p>
          </div>

          <button
            onClick={() => setMostrarPlantillas(!mostrarPlantillas)}
            className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
          >
            {mostrarPlantillas ? 'Cancelar' : '+ Copiar Plantilla'}
          </button>
        </div>
      </div>

      {/* Modal de Plantillas */}
      {mostrarPlantillas && (
        <div className="bg-gray-800 rounded-xl border border-gray-700 p-6 mb-6">
          <h3 className="text-lg font-semibold text-white mb-4">
            Seleccione una Plantilla
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Plantilla Comercial */}
            <div className="bg-gray-900 rounded-lg border border-gray-700 p-6">
              <h4 className="text-xl font-bold text-white mb-2">
                Plantilla COMERCIAL
              </h4>
              <p className="text-gray-400 text-sm mb-4">
                Ideal para empresas que compran y venden mercaderías
              </p>
              <ul className="text-sm text-gray-300 space-y-1 mb-4">
                <li>✅ ~150 cuentas contables</li>
                <li>✅ Manejo de inventarios</li>
                <li>✅ IVA Compras e IVA Ventas</li>
                <li>✅ Costo de mercaderías vendidas</li>
              </ul>
              <button
                onClick={() => handleCopiarPlantilla('comercial')}
                disabled={loading}
                className="w-full px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-600 text-white rounded-lg transition-colors"
              >
                Copiar Plantilla
              </button>
            </div>

            {/* Plantilla Servicios */}
            <div className="bg-gray-900 rounded-lg border border-gray-700 p-6">
              <h4 className="text-xl font-bold text-white mb-2">
                Plantilla SERVICIOS
              </h4>
              <p className="text-gray-400 text-sm mb-4">
                Ideal para empresas prestadoras de servicios
              </p>
              <ul className="text-sm text-gray-300 space-y-1 mb-4">
                <li>✅ ~80 cuentas contables</li>
                <li>✅ Sin inventarios</li>
                <li>✅ IVA Servicios</li>
                <li>✅ Enfoque en gastos operativos</li>
              </ul>
              <button
                onClick={() => handleCopiarPlantilla('servicios')}
                disabled={loading}
                className="w-full px-4 py-2 bg-green-500 hover:bg-green-600 disabled:bg-gray-600 text-white rounded-lg transition-colors"
              >
                Copiar Plantilla
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Contenido */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="ml-3 text-gray-400">Cargando cuentas...</span>
        </div>
      ) : cuentas.length === 0 ? (
        <div className="bg-gray-800 rounded-xl border border-gray-700 p-12 text-center">
          <svg className="w-16 h-16 mx-auto text-gray-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h3 className="text-lg font-medium text-white mb-2">
            No hay cuentas contables
          </h3>
          <p className="text-gray-400 mb-4">
            Comienza copiando una plantilla predefinida
          </p>
          <button
            onClick={() => setMostrarPlantillas(true)}
            className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
          >
            Copiar Plantilla
          </button>
        </div>
      ) : (
        <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-900 border-b border-gray-700">
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">
                    Código
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">
                    Nombre
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">
                    Tipo
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-400 uppercase">
                    Naturaleza
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-400 uppercase">
                    Imputable
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {cuentas.map((cuenta) => (
                  <tr key={cuenta.id} className="hover:bg-gray-700/30">
                    <td className="px-4 py-3">
                      <span className="text-sm font-mono text-blue-400">
                        {cuenta.codigo}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span 
                        className="text-sm text-white"
                        style={{ paddingLeft: `${cuenta.nivel * 20}px` }}
                      >
                        {cuenta.nombre}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`
                        px-2 py-1 text-xs rounded-full
                        ${cuenta.tipo_cuenta === 'Activo' && 'bg-green-500/20 text-green-400'}
                        ${cuenta.tipo_cuenta === 'Pasivo' && 'bg-red-500/20 text-red-400'}
                        ${cuenta.tipo_cuenta === 'Patrimonio' && 'bg-purple-500/20 text-purple-400'}
                        ${cuenta.tipo_cuenta === 'Ingreso' && 'bg-blue-500/20 text-blue-400'}
                        ${cuenta.tipo_cuenta === 'Gasto' && 'bg-orange-500/20 text-orange-400'}
                      `}>
                        {cuenta.tipo_cuenta}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="text-sm text-gray-300">
                        {cuenta.naturaleza === 'D' ? 'Deudora' : 'Acreedora'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      {cuenta.es_imputable ? (
                        <span className="text-green-400">✓</span>
                      ) : (
                        <span className="text-gray-600">—</span>
                      )}
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