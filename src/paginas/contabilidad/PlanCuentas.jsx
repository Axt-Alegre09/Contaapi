/**
 * PÁGINA: Plan de Cuentas CORREGIDA
 * Búsqueda y filtros funcionan correctamente
 */

import { useEffect, useState } from 'react';
import { FileText, Plus, Edit2, Trash2, AlertCircle, AlertTriangle, Search, Filter, X } from 'lucide-react';
import { usePlanCuentas } from '../../hooks/usePlanCuentas';
import { ModalNuevaCuenta } from '../../componentes/planCuentas/ModalNuevaCuenta';
import { ModalEditarCuenta } from '../../componentes/planCuentas/ModalEditarCuenta';

const PlanCuentas = () => {
  const { cuentas, loading, error, listar, buscar, eliminar, eliminarTodo, copiarPlantilla } = usePlanCuentas();
  
  const [modalNueva, setModalNueva] = useState(false);
  const [modalEditar, setModalEditar] = useState(false);
  const [modalPlantilla, setModalPlantilla] = useState(false);
  const [modalConfirmarLimpiar, setModalConfirmarLimpiar] = useState(false);
  const [cuentaSeleccionada, setCuentaSeleccionada] = useState(null);
  const [cuentaAEliminar, setCuentaAEliminar] = useState(null);
  const [loadingEliminar, setLoadingEliminar] = useState(false);
  const [loadingPlantilla, setLoadingPlantilla] = useState(false);
  const [loadingLimpiar, setLoadingLimpiar] = useState(false);
  const [confirmacionTexto, setConfirmacionTexto] = useState('');

  // Estados de búsqueda y filtros
  const [termino, setTermino] = useState('');
  const [mostrarFiltros, setMostrarFiltros] = useState(false);
  const [filtros, setFiltros] = useState({
    nivel: '',
    tipoCuenta: '',
    soloImputables: false,
    soloActivas: true
  });

  useEffect(() => {
    cargarCuentas();
  }, []);

  // Aplicar búsqueda con debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      aplicarBusqueda();
    }, 300);

    return () => clearTimeout(timer);
  }, [termino, filtros]);

  const cargarCuentas = async () => {
    await listar();
  };

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

  const handleNuevaCuentaCerrar = () => {
    setModalNueva(false);
    limpiarFiltros();
  };

  const handleEditarCerrar = () => {
    setModalEditar(false);
    setCuentaSeleccionada(null);
    limpiarFiltros();
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
        // Éxito
      } else {
        alert(`Error: ${resultado.error}`);
      }
      
      setLoadingEliminar(false);
      setCuentaAEliminar(null);
    }
  };

  const handleLimpiarPlan = () => {
    setConfirmacionTexto('');
    setModalConfirmarLimpiar(true);
  };

  const confirmarLimpiarPlan = async () => {
    if (confirmacionTexto.toUpperCase() !== 'ELIMINAR TODO') {
      alert('Debe escribir "ELIMINAR TODO" para confirmar');
      return;
    }

    setLoadingLimpiar(true);
    const resultado = await eliminarTodo();
    
    if (resultado.success) {
      alert(`✓ ${resultado.data.message}`);
      setModalConfirmarLimpiar(false);
      limpiarFiltros();
    } else {
      alert(`Error: ${resultado.error}`);
    }
    
    setLoadingLimpiar(false);
  };

  const handleCopiarPlantilla = async (tipo) => {
    if (cuentas.length > 0) {
      if (!window.confirm('Ya tiene cuentas en el plan. ¿Desea copiar la plantilla de todas formas? Esto agregará las cuentas de la plantilla.')) {
        return;
      }
    }

    setLoadingPlantilla(true);
    const resultado = await copiarPlantilla(tipo);
    
    if (resultado.success) {
      setModalPlantilla(false);
      limpiarFiltros();
    } else {
      alert(`Error: ${resultado.error}`);
    }
    
    setLoadingPlantilla(false);
  };

  const getBadgeColor = (tipo) => {
    const colores = {
      'Activo': 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
      'Pasivo': 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
      'Patrimonio': 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
      'Ingreso': 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
      'Gasto': 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300'
    };
    return colores[tipo] || 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-300';
  };

  const hayFiltrosActivos = termino || filtros.nivel || filtros.tipoCuenta || filtros.soloImputables;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <FileText className="w-8 h-8" />
            Plan de Cuentas
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {cuentas.length} cuentas contables
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setModalNueva(true)}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 
              text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg"
          >
            <Plus className="w-5 h-5" />
            Nueva Cuenta
          </button>

          <button
            onClick={() => setModalPlantilla(true)}
            className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 
              text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 
              rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-all"
          >
            <FileText className="w-5 h-5" />
            Copiar Plantilla
          </button>

          {cuentas.length > 0 && (
            <button
              onClick={handleLimpiarPlan}
              className="flex items-center gap-2 px-4 py-2 bg-red-50 dark:bg-red-900/20 
                text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800 
                rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition-all"
            >
              <AlertTriangle className="w-5 h-5" />
              Limpiar Plan
            </button>
          )}
        </div>
      </div>

      {/* Barra de búsqueda y filtros - INTEGRADA */}
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
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg border transition-all
              ${mostrarFiltros 
                ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-500 text-blue-700 dark:text-blue-300' 
                : 'bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300'
              } hover:bg-blue-50 dark:hover:bg-blue-900/20`}
          >
            <Filter className="w-5 h-5" />
            <span className="font-medium">Filtros</span>
            {hayFiltrosActivos && (
              <span className="ml-1 px-2 py-0.5 bg-blue-600 text-white text-xs rounded-full">
                {[termino && 1, filtros.nivel && 1, filtros.tipoCuenta && 1, filtros.soloImputables && 1].filter(Boolean).length}
              </span>
            )}
          </button>

          {/* Botón limpiar */}
          {hayFiltrosActivos && (
            <button
              onClick={limpiarFiltros}
              className="flex items-center space-x-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 
                text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 
                transition-all"
            >
              <X className="w-5 h-5" />
              <span className="font-medium">Limpiar</span>
            </button>
          )}
        </div>

        {/* Panel de filtros expandible */}
        {mostrarFiltros && (
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Filtro por nivel */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Nivel
                </label>
                <select
                  value={filtros.nivel}
                  onChange={(e) => setFiltros({...filtros, nivel: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
                    bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                    focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Todos los niveles</option>
                  <option value="1">Nivel 1</option>
                  <option value="2">Nivel 2</option>
                  <option value="3">Nivel 3</option>
                  <option value="4">Nivel 4</option>
                  <option value="5">Nivel 5</option>
                </select>
              </div>

              {/* Filtro por tipo */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Tipo de Cuenta
                </label>
                <select
                  value={filtros.tipoCuenta}
                  onChange={(e) => setFiltros({...filtros, tipoCuenta: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
                    bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                    focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
              <div className="flex flex-col justify-end space-y-2">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filtros.soloImputables}
                    onChange={(e) => setFiltros({...filtros, soloImputables: e.target.checked})}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">Solo imputables</span>
                </label>

                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filtros.soloActivas}
                    onChange={(e) => setFiltros({...filtros, soloActivas: e.target.checked})}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">Solo activas</span>
                </label>
              </div>

              {/* Indicador de resultados */}
              <div className="flex flex-col justify-center items-center bg-blue-50 dark:bg-blue-900/20 
                rounded-lg p-3 border border-blue-200 dark:border-blue-800">
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {cuentas.length}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  cuentas encontradas
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-red-800 dark:text-red-200">Error</h3>
            <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
          </div>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 dark:border-blue-400"></div>
        </div>
      )}

      {/* Tabla de cuentas */}
      {!loading && cuentas.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
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
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
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
                      <span className="text-sm font-mono font-medium text-gray-900 dark:text-white">
                        {cuenta.codigo}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <span 
                          className="text-sm text-gray-900 dark:text-white"
                          style={{ marginLeft: `${(cuenta.nivel - 1) * 20}px` }}
                        >
                          {cuenta.nombre}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getBadgeColor(cuenta.tipo_cuenta)}`}>
                        {cuenta.tipo_cuenta}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-700 dark:text-gray-300">
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
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleEditar(cuenta)}
                          className="text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300 
                            transition-colors p-1 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded"
                          title="Editar"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleEliminar(cuenta)}
                          disabled={loadingEliminar && cuentaAEliminar === cuenta.id}
                          className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300 
                            transition-colors p-1 hover:bg-red-50 dark:hover:bg-red-900/20 rounded
                            disabled:opacity-50 disabled:cursor-not-allowed"
                          title="Eliminar"
                        >
                          {loadingEliminar && cuentaAEliminar === cuenta.id ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
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

      {/* Empty state */}
      {!loading && cuentas.length === 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-12 text-center">
          <FileText className="w-16 h-16 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            No hay cuentas contables
          </h3>
          <p className="text-gray-500 dark:text-gray-400 mb-6">
            {hayFiltrosActivos 
              ? 'No se encontraron cuentas con los filtros aplicados' 
              : 'Comienza copiando una plantilla predefinida o crea cuentas manualmente'
            }
          </p>
          {hayFiltrosActivos ? (
            <button
              onClick={limpiarFiltros}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all"
            >
              Limpiar Filtros
            </button>
          ) : (
            <div className="flex justify-center gap-3">
              <button
                onClick={() => setModalPlantilla(true)}
                className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg 
                  hover:from-blue-700 hover:to-purple-700 transition-all"
              >
                Copiar Plantilla
              </button>
              <button
                onClick={() => setModalNueva(true)}
                className="px-4 py-2 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 
                  border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 
                  dark:hover:bg-gray-600 transition-all"
              >
                Crear Manualmente
              </button>
            </div>
          )}
        </div>
      )}

      {/* Modal Nueva Cuenta */}
      <ModalNuevaCuenta 
        isOpen={modalNueva} 
        onClose={handleNuevaCuentaCerrar} 
      />

      {/* Modal Editar Cuenta */}
      <ModalEditarCuenta
        isOpen={modalEditar}
        onClose={handleEditarCerrar}
        cuenta={cuentaSeleccionada}
      />

      {/* Modal Copiar Plantilla */}
      {modalPlantilla && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => !loadingPlantilla && setModalPlantilla(false)} />
          
          <div className="flex min-h-full items-center justify-center p-4">
            <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-3xl">
              <div className="p-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  Seleccionar Plantilla de Plan de Cuentas
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Plantilla COMERCIAL */}
                  <button
                    onClick={() => handleCopiarPlantilla('COMERCIAL')}
                    disabled={loadingPlantilla}
                    className="p-6 border-2 border-gray-200 dark:border-gray-700 rounded-lg 
                      hover:border-blue-500 dark:hover:border-blue-400 transition-all text-left
                      disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                      Plantilla COMERCIAL
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                      Ideal para empresas que compran y venden mercaderías
                    </p>
                    <ul className="text-sm text-gray-500 dark:text-gray-400 space-y-1">
                      <li>• ~150 cuentas contables</li>
                      <li>• Inventarios y Costo de Ventas</li>
                      <li>• Cuentas por cobrar/pagar</li>
                      <li>• IVA Compras y Ventas</li>
                    </ul>
                  </button>

                  {/* Plantilla SERVICIOS */}
                  <button
                    onClick={() => handleCopiarPlantilla('SERVICIOS')}
                    disabled={loadingPlantilla}
                    className="p-6 border-2 border-gray-200 dark:border-gray-700 rounded-lg 
                      hover:border-blue-500 dark:hover:border-blue-400 transition-all text-left
                      disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                      Plantilla SERVICIOS
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                      Ideal para empresas de servicios profesionales
                    </p>
                    <ul className="text-sm text-gray-500 dark:text-gray-400 space-y-1">
                      <li>• ~80 cuentas contables</li>
                      <li>• Sin inventarios</li>
                      <li>• Ingresos por servicios</li>
                      <li>• Gastos operativos</li>
                    </ul>
                  </button>
                </div>

                <div className="mt-6 flex justify-end">
                  <button
                    onClick={() => setModalPlantilla(false)}
                    disabled={loadingPlantilla}
                    className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 
                      dark:hover:bg-gray-700 rounded-lg transition-colors
                      disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Cancelar
                  </button>
                </div>

                {loadingPlantilla && (
                  <div className="absolute inset-0 bg-white/80 dark:bg-gray-800/80 rounded-lg flex items-center justify-center">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 dark:border-blue-400 mx-auto mb-4"></div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Copiando plantilla...
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Confirmar Limpiar Plan */}
      {modalConfirmarLimpiar && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => !loadingLimpiar && setModalConfirmarLimpiar(false)} />
          
          <div className="flex min-h-full items-center justify-center p-4">
            <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md">
              <div className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
                    <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                      ¿Eliminar TODO el Plan de Cuentas?
                    </h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Esta acción no se puede deshacer
                    </p>
                  </div>
                </div>

                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-4">
                  <p className="text-sm text-red-800 dark:text-red-200 font-medium mb-2">
                    ⚠️ ADVERTENCIA CRÍTICA
                  </p>
                  <ul className="text-sm text-red-700 dark:text-red-300 space-y-1">
                    <li>• Se eliminarán {cuentas.length} cuentas contables</li>
                    <li>• Esta acción NO se puede deshacer</li>
                    <li>• Solo puede hacerse si NO hay asientos contables</li>
                  </ul>
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Escriba <span className="font-bold">"ELIMINAR TODO"</span> para confirmar:
                  </label>
                  <input
                    type="text"
                    value={confirmacionTexto}
                    onChange={(e) => setConfirmacionTexto(e.target.value)}
                    placeholder="ELIMINAR TODO"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
                      focus:ring-2 focus:ring-red-500 focus:border-red-500
                      bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    disabled={loadingLimpiar}
                  />
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => setModalConfirmarLimpiar(false)}
                    disabled={loadingLimpiar}
                    className="flex-1 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300
                      rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors
                      disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={confirmarLimpiarPlan}
                    disabled={loadingLimpiar || confirmacionTexto.toUpperCase() !== 'ELIMINAR TODO'}
                    className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg 
                      hover:bg-red-700 transition-colors
                      disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loadingLimpiar ? (
                      <div className="flex items-center justify-center gap-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        <span>Eliminando...</span>
                      </div>
                    ) : (
                      'Eliminar Todo'
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PlanCuentas;