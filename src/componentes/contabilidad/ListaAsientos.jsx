/**
 * LISTA DE ASIENTOS CONTABLES
 * Componente responsive mobile-first
 * Tabla con filtros, paginación y acciones por estado
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAsientos } from '../../hooks/useAsientos';
import { usePeriodos } from '../../hooks/usePeriodos';
import { useAuth } from '../../hooks/useAutenticacion';

export default function ListaAsientos() {
  const navigate = useNavigate();
  const { asientos, listar, anular, eliminar, loading } = useAsientos();
  const { periodoActivo, periodos, listar: listarPeriodos } = usePeriodos();
  const { usuario } = useAuth();

  // Estados de filtros
  const [filtros, setFiltros] = useState({
    periodoId: null,
    estado: null,
    fechaDesde: null,
    fechaHasta: null,
    limite: 50,
    offset: 0
  });

  // Estados UI
  const [mostrarFiltros, setMostrarFiltros] = useState(false);
  const [asientoSeleccionado, setAsientoSeleccionado] = useState(null);
  const [mostrarModalAnular, setMostrarModalAnular] = useState(false);
  const [motivoAnulacion, setMotivoAnulacion] = useState('');

  useEffect(() => {
    listarPeriodos();
  }, []);

  useEffect(() => {
    if (periodoActivo) {
      setFiltros(prev => ({ ...prev, periodoId: periodoActivo.id }));
      cargarAsientos({ periodoId: periodoActivo.id });
    }
  }, [periodoActivo]);

  const cargarAsientos = async (filtrosCustom = {}) => {
    await listar({ ...filtros, ...filtrosCustom });
  };

  const handleFiltrar = () => {
    setFiltros(prev => ({ ...prev, offset: 0 }));
    cargarAsientos();
    setMostrarFiltros(false);
  };

  const handleLimpiarFiltros = () => {
    setFiltros({
      periodoId: periodoActivo?.id || null,
      estado: null,
      fechaDesde: null,
      fechaHasta: null,
      limite: 50,
      offset: 0
    });
    cargarAsientos({ periodoId: periodoActivo?.id });
  };

  const handleAnular = async () => {
    if (!asientoSeleccionado || !motivoAnulacion.trim()) {
      alert('Debe ingresar un motivo de anulación');
      return;
    }

    if (confirm('¿Está seguro de anular este asiento? Esta acción no se puede deshacer.')) {
      const resultado = await anular(asientoSeleccionado.id, usuario.id, motivoAnulacion);
      
      if (resultado.success) {
        alert('✅ Asiento anulado exitosamente');
        setMostrarModalAnular(false);
        setAsientoSeleccionado(null);
        setMotivoAnulacion('');
        cargarAsientos();
      } else {
        alert('❌ Error: ' + resultado.error);
      }
    }
  };

  const handleEliminar = async (asiento) => {
    if (asiento.estado !== 'borrador') {
      alert('Solo se pueden eliminar asientos en borrador');
      return;
    }

    if (confirm('¿Está seguro de eliminar este asiento?')) {
      const resultado = await eliminar(asiento.id);
      
      if (resultado.success) {
        alert('✅ Asiento eliminado exitosamente');
        cargarAsientos();
      } else {
        alert('❌ Error: ' + resultado.error);
      }
    }
  };

  const getBadgeEstado = (estado, anulado) => {
    if (anulado) {
      return (
        <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-500/20 text-red-400 border border-red-500/30">
          Anulado
        </span>
      );
    }

    switch (estado) {
      case 'borrador':
        return (
          <span className="px-2 py-1 text-xs font-medium rounded-full bg-yellow-500/20 text-yellow-400 border border-yellow-500/30">
            Borrador
          </span>
        );
      case 'confirmado':
        return (
          <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-500/20 text-green-400 border border-green-500/30">
            Confirmado
          </span>
        );
      default:
        return (
          <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-500/20 text-gray-400 border border-gray-500/30">
            {estado}
          </span>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 pb-20">
      {/* Header - Sticky */}
      <div className="sticky top-0 z-40 bg-gray-900/95 backdrop-blur-sm border-b border-gray-800 px-4 py-4 md:px-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          {/* Título y stats */}
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-white">
              Asientos Contables
            </h1>
            <p className="text-sm text-gray-400 mt-1">
              {periodoActivo?.nombre || 'Todos los períodos'} • {asientos.length} asientos
            </p>
          </div>

          {/* Acciones */}
          <div className="flex gap-2">
            <button
              onClick={() => setMostrarFiltros(!mostrarFiltros)}
              className="
                flex items-center gap-2
                px-4 py-2
                bg-gray-800 hover:bg-gray-700
                text-white
                rounded-lg
                transition-colors
                text-sm
              "
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
              <span className="hidden sm:inline">Filtros</span>
            </button>

            <button
              onClick={() => navigate('/contabilidad/nuevo-asiento')}
              className="
                flex items-center gap-2
                px-4 py-2
                bg-blue-500 hover:bg-blue-600
                text-white
                rounded-lg
                transition-colors
                font-medium
                text-sm
              "
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <span>Nuevo</span>
            </button>
          </div>
        </div>
      </div>

      {/* Panel de Filtros - Desplegable */}
      {mostrarFiltros && (
        <div className="bg-gray-800 border-b border-gray-700 px-4 py-4 md:px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Período */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Período
              </label>
              <select
                value={filtros.periodoId || ''}
                onChange={(e) => setFiltros(prev => ({ ...prev, periodoId: e.target.value || null }))}
                className="
                  w-full px-3 py-2
                  bg-gray-900 text-white
                  border border-gray-700
                  rounded-lg
                  focus:outline-none focus:ring-2 focus:ring-blue-500
                  text-sm
                "
              >
                <option value="">Todos los períodos</option>
                {periodos.map(p => (
                  <option key={p.id} value={p.id}>{p.nombre}</option>
                ))}
              </select>
            </div>

            {/* Estado */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Estado
              </label>
              <select
                value={filtros.estado || ''}
                onChange={(e) => setFiltros(prev => ({ ...prev, estado: e.target.value || null }))}
                className="
                  w-full px-3 py-2
                  bg-gray-900 text-white
                  border border-gray-700
                  rounded-lg
                  focus:outline-none focus:ring-2 focus:ring-blue-500
                  text-sm
                "
              >
                <option value="">Todos los estados</option>
                <option value="borrador">Borrador</option>
                <option value="confirmado">Confirmado</option>
                <option value="anulado">Anulado</option>
              </select>
            </div>

            {/* Fecha Desde */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Fecha Desde
              </label>
              <input
                type="date"
                value={filtros.fechaDesde || ''}
                onChange={(e) => setFiltros(prev => ({ ...prev, fechaDesde: e.target.value || null }))}
                className="
                  w-full px-3 py-2
                  bg-gray-900 text-white
                  border border-gray-700
                  rounded-lg
                  focus:outline-none focus:ring-2 focus:ring-blue-500
                  text-sm
                "
              />
            </div>

            {/* Fecha Hasta */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Fecha Hasta
              </label>
              <input
                type="date"
                value={filtros.fechaHasta || ''}
                onChange={(e) => setFiltros(prev => ({ ...prev, fechaHasta: e.target.value || null }))}
                className="
                  w-full px-3 py-2
                  bg-gray-900 text-white
                  border border-gray-700
                  rounded-lg
                  focus:outline-none focus:ring-2 focus:ring-blue-500
                  text-sm
                "
              />
            </div>
          </div>

          {/* Botones de filtro */}
          <div className="flex gap-2 mt-4">
            <button
              onClick={handleFiltrar}
              className="
                flex-1 md:flex-none
                px-4 py-2
                bg-blue-500 hover:bg-blue-600
                text-white
                rounded-lg
                transition-colors
                text-sm
              "
            >
              Aplicar Filtros
            </button>
            <button
              onClick={handleLimpiarFiltros}
              className="
                flex-1 md:flex-none
                px-4 py-2
                bg-gray-700 hover:bg-gray-600
                text-white
                rounded-lg
                transition-colors
                text-sm
              "
            >
              Limpiar
            </button>
          </div>
        </div>
      )}

      {/* Contenido */}
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-6">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            <span className="ml-3 text-gray-400">Cargando asientos...</span>
          </div>
        ) : asientos.length === 0 ? (
          <div className="text-center py-12 bg-gray-800/50 rounded-xl border border-gray-700">
            <svg className="w-16 h-16 mx-auto text-gray-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 className="text-lg font-medium text-white mb-2">No hay asientos</h3>
            <p className="text-gray-400 mb-4">Crea tu primer asiento contable</p>
            <button
              onClick={() => navigate('/contabilidad/nuevo-asiento')}
              className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
            >
              + Nuevo Asiento
            </button>
          </div>
        ) : (
          <>
            {/* Vista Mobile - Cards */}
            <div className="md:hidden space-y-3">
              {asientos.map((asiento) => (
                <div
                  key={asiento.id}
                  className="bg-gray-800 rounded-lg border border-gray-700 p-4"
                >
                  {/* Header de la card */}
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-bold text-blue-400">
                          #{asiento.numero_asiento}
                        </span>
                        {getBadgeEstado(asiento.estado, asiento.anulado)}
                      </div>
                      <p className="text-xs text-gray-400">
                        {new Date(asiento.fecha).toLocaleDateString('es-PY')}
                      </p>
                    </div>
                    
                    {/* Menú de acciones */}
                    <div className="flex gap-1">
                      <button
                        onClick={() => navigate(`/contabilidad/asientos/${asiento.id}`)}
                        className="p-2 text-blue-400 hover:bg-blue-500/10 rounded-lg"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      </button>
                      
                      {asiento.estado === 'confirmado' && !asiento.anulado && (
                        <button
                          onClick={() => {
                            setAsientoSeleccionado(asiento);
                            setMostrarModalAnular(true);
                          }}
                          className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      )}
                      
                      {asiento.estado === 'borrador' && (
                        <button
                          onClick={() => handleEliminar(asiento)}
                          className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Glosa */}
                  <p className="text-sm text-white mb-3 line-clamp-2">
                    {asiento.glosa}
                  </p>

                  {/* Totales */}
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="bg-green-500/10 border border-green-500/30 rounded px-2 py-1">
                      <span className="text-gray-400">Debe:</span>
                      <span className="text-green-400 font-medium ml-1">
                        Gs. {asiento.total_debe?.toLocaleString('es-PY') || 0}
                      </span>
                    </div>
                    <div className="bg-red-500/10 border border-red-500/30 rounded px-2 py-1">
                      <span className="text-gray-400">Haber:</span>
                      <span className="text-red-400 font-medium ml-1">
                        Gs. {asiento.total_haber?.toLocaleString('es-PY') || 0}
                      </span>
                    </div>
                  </div>

                  {/* Balance indicator */}
                  {asiento.balanceado ? (
                    <div className="mt-2 text-xs text-green-400 flex items-center gap-1">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span>Balanceado</span>
                    </div>
                  ) : (
                    <div className="mt-2 text-xs text-red-400 flex items-center gap-1">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                      <span>Desbalanceado</span>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Vista Desktop - Tabla */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-800 border-b border-gray-700">
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Nº Asiento
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Fecha
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Glosa
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Debe
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Haber
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Estado
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-gray-800/50 divide-y divide-gray-700">
                  {asientos.map((asiento) => (
                    <tr key={asiento.id} className="hover:bg-gray-700/50 transition-colors">
                      <td className="px-4 py-4 whitespace-nowrap">
                        <span className="text-sm font-medium text-blue-400">
                          #{asiento.numero_asiento}
                        </span>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-300">
                          {new Date(asiento.fecha).toLocaleDateString('es-PY')}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <span className="text-sm text-white line-clamp-2">
                          {asiento.glosa}
                        </span>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-right">
                        <span className="text-sm text-green-400 font-medium">
                          Gs. {asiento.total_debe?.toLocaleString('es-PY') || 0}
                        </span>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-right">
                        <span className="text-sm text-red-400 font-medium">
                          Gs. {asiento.total_haber?.toLocaleString('es-PY') || 0}
                        </span>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-center">
                        {getBadgeEstado(asiento.estado, asiento.anulado)}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => navigate(`/contabilidad/asientos/${asiento.id}`)}
                            className="p-2 text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors"
                            title="Ver detalle"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                          </button>
                          
                          {asiento.estado === 'confirmado' && !asiento.anulado && (
                            <button
                              onClick={() => {
                                setAsientoSeleccionado(asiento);
                                setMostrarModalAnular(true);
                              }}
                              className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                              title="Anular"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          )}
                          
                          {asiento.estado === 'borrador' && (
                            <button
                              onClick={() => handleEliminar(asiento)}
                              className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                              title="Eliminar"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      {/* Modal de Anulación */}
      {mostrarModalAnular && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-gray-800 rounded-xl border border-gray-700 w-full max-w-md">
            <div className="p-6">
              <h3 className="text-lg font-bold text-white mb-4">
                Anular Asiento #{asientoSeleccionado?.numero_asiento}
              </h3>
              
              <p className="text-sm text-gray-400 mb-4">
                Esta acción no se puede deshacer. El asiento quedará marcado como anulado.
              </p>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Motivo de Anulación <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={motivoAnulacion}
                  onChange={(e) => setMotivoAnulacion(e.target.value)}
                  placeholder="Explique el motivo de la anulación..."
                  rows="3"
                  className="
                    w-full px-4 py-3
                    bg-gray-900 text-white
                    border border-gray-700
                    rounded-lg
                    focus:outline-none focus:ring-2 focus:ring-red-500
                    resize-none
                  "
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setMostrarModalAnular(false);
                    setAsientoSeleccionado(null);
                    setMotivoAnulacion('');
                  }}
                  className="
                    flex-1 px-4 py-2
                    bg-gray-700 hover:bg-gray-600
                    text-white rounded-lg
                    transition-colors
                  "
                >
                  Cancelar
                </button>
                <button
                  onClick={handleAnular}
                  disabled={!motivoAnulacion.trim()}
                  className="
                    flex-1 px-4 py-2
                    bg-red-500 hover:bg-red-600
                    text-white rounded-lg
                    transition-colors
                    disabled:opacity-50
                    disabled:cursor-not-allowed
                  "
                >
                  Anular Asiento
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}