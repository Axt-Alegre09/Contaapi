/**
 * PÁGINA: Plan de Cuentas
 * Gestión completa del plan de cuentas con CRUD, búsqueda y filtros
 */

import { useEffect, useState } from 'react';
import { FileText, Plus, Edit2, Trash2, AlertCircle } from 'lucide-react';
import { usePlanCuentas } from '../../hooks/usePlanCuentas';
import { ModalNuevaCuenta } from '../../componentes/planCuentas/ModalNuevaCuenta';
import { ModalEditarCuenta } from '../../componentes/planCuentas/ModalEditarCuenta';
import { BarraBusquedaYFiltros } from '../../componentes/planCuentas/BarraBusquedaYFiltros';

const PlanCuentas = () => {
  const { cuentas, loading, error, listar, eliminar, copiarPlantilla } = usePlanCuentas();
  
  const [modalNueva, setModalNueva] = useState(false);
  const [modalEditar, setModalEditar] = useState(false);
  const [modalPlantilla, setModalPlantilla] = useState(false);
  const [cuentaSeleccionada, setCuentaSeleccionada] = useState(null);
  const [cuentaAEliminar, setCuentaAEliminar] = useState(null);
  const [loadingEliminar, setLoadingEliminar] = useState(false);
  const [loadingPlantilla, setLoadingPlantilla] = useState(false);

  useEffect(() => {
    cargarCuentas();
  }, []);

  const cargarCuentas = async () => {
    await listar();
  };

  const handleEditar = (cuenta) => {
    setCuentaSeleccionada(cuenta);
    setModalEditar(true);
  };

  const handleEliminar = async (cuenta) => {
    if (window.confirm(`¿Está seguro de eliminar la cuenta ${cuenta.codigo} - ${cuenta.nombre}?`)) {
      setLoadingEliminar(true);
      setCuentaAEliminar(cuenta.id);
      
      const resultado = await eliminar(cuenta.id);
      
      if (resultado.success) {
        // Éxito - la lista se recarga automáticamente
      } else {
        alert(`Error: ${resultado.error}`);
      }
      
      setLoadingEliminar(false);
      setCuentaAEliminar(null);
    }
  };

  const handleCopiarPlantilla = async (tipo) => {
    setLoadingPlantilla(true);
    const resultado = await copiarPlantilla(tipo);
    
    if (resultado.success) {
      const data = resultado.data;
      alert(`✓ Plantilla ${tipo.toUpperCase()} copiada exitosamente\n${data.cuentas_copiadas} cuentas agregadas`);
      setModalPlantilla(false);
    } else {
      alert(`Error: ${resultado.error}`);
    }
    
    setLoadingPlantilla(false);
  };

  const getBadgeColor = (tipo) => {
    const colores = {
      'Activo': 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
      'Pasivo': 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
      'Patrimonio': 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
      'Ingreso': 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
      'Gasto': 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300'
    };
    return colores[tipo] || 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300';
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Plan de Cuentas</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {cuentas.length} cuentas contables
          </p>
        </div>
        
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => setModalNueva(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 
              text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all"
          >
            <Plus className="w-5 h-5" />
            <span>Nueva Cuenta</span>
          </button>

          <button
            onClick={() => setModalPlantilla(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-white dark:bg-gray-700 
              text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 
              rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
          >
            <FileText className="w-5 h-5" />
            <span>Copiar Plantilla</span>
          </button>
        </div>
      </div>

      {/* Búsqueda y Filtros */}
      <div className="mb-6">
        <BarraBusquedaYFiltros />
      </div>

      {/* Error */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-start space-x-3">
          <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-red-800 dark:text-red-200">Error al cargar plan de cuentas</p>
            <p className="text-sm text-red-700 dark:text-red-300 mt-1">{error}</p>
          </div>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
        </div>
      )}

      {/* Empty State */}
      {!loading && cuentas.length === 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-12 text-center">
          <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No hay cuentas contables
          </h3>
          <p className="text-gray-500 dark:text-gray-400 mb-6">
            Comienza copiando una plantilla predefinida o crea tus cuentas manualmente
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => setModalPlantilla(true)}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg 
                hover:from-blue-700 hover:to-purple-700 transition-all"
            >
              Copiar Plantilla
            </button>
            <button
              onClick={() => setModalNueva(true)}
              className="px-6 py-3 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 
                border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600"
            >
              Crear Manualmente
            </button>
          </div>
        </div>
      )}

      {/* Tabla de Cuentas */}
      {!loading && cuentas.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Código
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Nombre
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Tipo
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Naturaleza
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Imputable
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {cuentas.map((cuenta) => (
                  <tr 
                    key={cuenta.id} 
                    className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {cuenta.codigo}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div 
                        className="text-sm text-gray-900 dark:text-white"
                        style={{ paddingLeft: `${(cuenta.nivel_jerarquia - 1) * 20}px` }}
                      >
                        {cuenta.nombre}
                      </div>
                      {cuenta.descripcion && (
                        <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          {cuenta.descripcion.length > 60 
                            ? cuenta.descripcion.substring(0, 60) + '...' 
                            : cuenta.descripcion}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getBadgeColor(cuenta.tipo_cuenta)}`}>
                        {cuenta.tipo_cuenta}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <span className="text-sm text-gray-900 dark:text-white">
                        {cuenta.naturaleza === 'D' ? 'Deudora' : 'Acreedora'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      {cuenta.es_imputable ? (
                        <span className="text-green-600 dark:text-green-400">✓</span>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => handleEditar(cuenta)}
                          disabled={loadingEliminar}
                          className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 
                            rounded-lg transition-colors disabled:opacity-50"
                          title="Editar cuenta"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleEliminar(cuenta)}
                          disabled={loadingEliminar || cuentaAEliminar === cuenta.id}
                          className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 
                            rounded-lg transition-colors disabled:opacity-50"
                          title="Eliminar cuenta"
                        >
                          {loadingEliminar && cuentaAEliminar === cuenta.id ? (
                            <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
                          ) : (
                            <Trash2 className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modales */}
      <ModalNuevaCuenta
        isOpen={modalNueva}
        onClose={() => setModalNueva(false)}
      />

      <ModalEditarCuenta
        isOpen={modalEditar}
        onClose={() => {
          setModalEditar(false);
          setCuentaSeleccionada(null);
        }}
        cuenta={cuentaSeleccionada}
      />

      {/* Modal Copiar Plantilla */}
      {modalPlantilla && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => !loadingPlantilla && setModalPlantilla(false)} />
          <div className="flex min-h-full items-center justify-center p-4">
            <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-4xl p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                Seleccione una Plantilla
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Plantilla Comercial */}
                <div className="border-2 border-gray-200 dark:border-gray-600 rounded-lg p-6 hover:border-blue-500 transition-colors">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    Plantilla COMERCIAL
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    Ideal para empresas que compran y venden mercaderías
                  </p>
                  <ul className="space-y-2 mb-6">
                    <li className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                      <span className="text-green-600 mr-2">✓</span>
                      ~150 cuentas contables
                    </li>
                    <li className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                      <span className="text-green-600 mr-2">✓</span>
                      Manejo de inventarios
                    </li>
                    <li className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                      <span className="text-green-600 mr-2">✓</span>
                      IVA Compras e IVA Ventas
                    </li>
                    <li className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                      <span className="text-green-600 mr-2">✓</span>
                      Costo de mercaderías vendidas
                    </li>
                  </ul>
                  <button
                    onClick={() => handleCopiarPlantilla('comercial')}
                    disabled={loadingPlantilla}
                    className="w-full px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white 
                      rounded-lg hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 
                      disabled:cursor-not-allowed transition-all"
                  >
                    {loadingPlantilla ? 'Copiando...' : 'Copiar Plantilla'}
                  </button>
                </div>

                {/* Plantilla Servicios */}
                <div className="border-2 border-gray-200 dark:border-gray-600 rounded-lg p-6 hover:border-blue-500 transition-colors">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    Plantilla SERVICIOS
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    Ideal para empresas prestadoras de servicios
                  </p>
                  <ul className="space-y-2 mb-6">
                    <li className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                      <span className="text-green-600 mr-2">✓</span>
                      ~80 cuentas contables
                    </li>
                    <li className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                      <span className="text-green-600 mr-2">✓</span>
                      Sin inventarios
                    </li>
                    <li className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                      <span className="text-green-600 mr-2">✓</span>
                      IVA Servicios
                    </li>
                    <li className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                      <span className="text-green-600 mr-2">✓</span>
                      Enfoque en gastos operativos
                    </li>
                  </ul>
                  <button
                    onClick={() => handleCopiarPlantilla('servicios')}
                    disabled={loadingPlantilla}
                    className="w-full px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white 
                      rounded-lg hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 
                      disabled:cursor-not-allowed transition-all"
                  >
                    {loadingPlantilla ? 'Copiando...' : 'Copiar Plantilla'}
                  </button>
                </div>
              </div>

              <button
                onClick={() => setModalPlantilla(false)}
                disabled={loadingPlantilla}
                className="mt-6 w-full px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 
                  rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 transition-colors"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PlanCuentas;