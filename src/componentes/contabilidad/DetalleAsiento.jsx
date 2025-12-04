/**
 * DETALLE DE ASIENTO CONTABLE
 * Componente responsive mobile-first
 * Vista completa de un asiento en modo solo lectura
 */

import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAsientos } from '../../hooks/useAsientos';
import { useAuth } from '../../hooks/useAutenticacion';

export default function DetalleAsiento() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { obtenerPorId, confirmar, anular, loading } = useAsientos();
  const { usuario } = useAuth();

  const [asiento, setAsiento] = useState(null);
  const [mostrarModalAnular, setMostrarModalAnular] = useState(false);
  const [mostrarModalConfirmar, setMostrarModalConfirmar] = useState(false);
  const [motivoAnulacion, setMotivoAnulacion] = useState('');

  useEffect(() => {
    if (id) {
      cargarAsiento();
    }
  }, [id]);

  const cargarAsiento = async () => {
    const resultado = await obtenerPorId(id);
    if (resultado) {
      setAsiento(resultado);
    } else {
      alert('Asiento no encontrado');
      navigate('/contabilidad/asientos');
    }
  };

  const handleConfirmar = async () => {
    const resultado = await confirmar(id, usuario.id);
    
    if (resultado.success) {
      alert('✅ Asiento confirmado exitosamente');
      setMostrarModalConfirmar(false);
      cargarAsiento(); // Recargar
    } else {
      alert('❌ Error: ' + resultado.error);
    }
  };

  const handleAnular = async () => {
    if (!motivoAnulacion.trim()) {
      alert('Debe ingresar un motivo de anulación');
      return;
    }

    const resultado = await anular(id, usuario.id, motivoAnulacion);
    
    if (resultado.success) {
      alert('✅ Asiento anulado exitosamente');
      setMostrarModalAnular(false);
      setMotivoAnulacion('');
      cargarAsiento(); // Recargar
    } else {
      alert('❌ Error: ' + resultado.error);
    }
  };

  const getBadgeEstado = (estado, anulado) => {
    if (anulado) {
      return (
        <span className="px-3 py-1 text-sm font-medium rounded-full bg-red-500/20 text-red-400 border border-red-500/30">
          Anulado
        </span>
      );
    }

    switch (estado) {
      case 'borrador':
        return (
          <span className="px-3 py-1 text-sm font-medium rounded-full bg-yellow-500/20 text-yellow-400 border border-yellow-500/30">
            Borrador
          </span>
        );
      case 'confirmado':
        return (
          <span className="px-3 py-1 text-sm font-medium rounded-full bg-green-500/20 text-green-400 border border-green-500/30">
            Confirmado
          </span>
        );
      default:
        return (
          <span className="px-3 py-1 text-sm font-medium rounded-full bg-gray-500/20 text-gray-400 border border-gray-500/30">
            {estado}
          </span>
        );
    }
  };

  if (loading || !asiento) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-gray-400">Cargando asiento...</span>
        </div>
      </div>
    );
  }

  const detalles = asiento.detalles || [];
  const totales = detalles.reduce((acc, det) => {
    acc.debe += det.debe || 0;
    acc.haber += det.haber || 0;
    return acc;
  }, { debe: 0, haber: 0 });

  return (
    <div className="min-h-screen bg-gray-900 pb-20">
      {/* Header - Sticky */}
      <div className="sticky top-0 z-40 bg-gray-900/95 backdrop-blur-sm border-b border-gray-800 px-4 py-4 md:px-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/contabilidad/asientos')}
              className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
            >
              <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <div>
              <h1 className="text-xl md:text-2xl font-bold text-white">
                Asiento #{asiento.numero_asiento}
              </h1>
              <p className="text-sm text-gray-400 hidden md:block">
                Detalle completo del asiento contable
              </p>
            </div>
          </div>

          {/* Estado y acciones */}
          <div className="flex items-center gap-2">
            {getBadgeEstado(asiento.estado, asiento.anulado)}
            
            {/* Acciones según estado */}
            {asiento.estado === 'borrador' && (
              <button
                onClick={() => setMostrarModalConfirmar(true)}
                className="
                  hidden md:flex items-center gap-2
                  px-4 py-2
                  bg-green-500 hover:bg-green-600
                  text-white rounded-lg
                  transition-colors
                  text-sm font-medium
                "
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Confirmar
              </button>
            )}

            {asiento.estado === 'confirmado' && !asiento.anulado && (
              <button
                onClick={() => setMostrarModalAnular(true)}
                className="
                  hidden md:flex items-center gap-2
                  px-4 py-2
                  bg-red-500 hover:bg-red-600
                  text-white rounded-lg
                  transition-colors
                  text-sm font-medium
                "
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                Anular
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Contenido */}
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-6 space-y-6">
        {/* Card de Información General */}
        <div className="bg-gray-800 rounded-xl border border-gray-700 p-4 md:p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Información General</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-gray-400 mb-1">Número de Asiento</p>
              <p className="text-base font-medium text-white">#{asiento.numero_asiento}</p>
            </div>

            <div>
              <p className="text-sm text-gray-400 mb-1">Fecha</p>
              <p className="text-base font-medium text-white">
                {new Date(asiento.fecha).toLocaleDateString('es-PY', {
                  day: '2-digit',
                  month: 'long',
                  year: 'numeric'
                })}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-400 mb-1">Tipo de Asiento</p>
              <p className="text-base font-medium text-white capitalize">{asiento.tipo_asiento}</p>
            </div>

            <div>
              <p className="text-sm text-gray-400 mb-1">Origen</p>
              <p className="text-base font-medium text-white capitalize">{asiento.origen}</p>
            </div>

            {asiento.referencia && (
              <div>
                <p className="text-sm text-gray-400 mb-1">Referencia</p>
                <p className="text-base font-medium text-white">{asiento.referencia}</p>
              </div>
            )}

            <div>
              <p className="text-sm text-gray-400 mb-1">Estado</p>
              <p className="text-base font-medium">
                {getBadgeEstado(asiento.estado, asiento.anulado)}
              </p>
            </div>

            <div className="md:col-span-2 lg:col-span-3">
              <p className="text-sm text-gray-400 mb-1">Glosa / Descripción</p>
              <p className="text-base text-white">{asiento.glosa}</p>
            </div>

            {asiento.anulado && asiento.motivo_anulacion && (
              <div className="md:col-span-2 lg:col-span-3">
                <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
                  <p className="text-sm text-red-400 mb-1 font-medium">Motivo de Anulación:</p>
                  <p className="text-sm text-red-300">{asiento.motivo_anulacion}</p>
                  <p className="text-xs text-red-400 mt-2">
                    Anulado por: {asiento.anulado_por} • 
                    {new Date(asiento.fecha_anulacion).toLocaleString('es-PY')}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Card de Detalles (Líneas del Asiento) */}
        <div className="bg-gray-800 rounded-xl border border-gray-700 p-4 md:p-6">
          <h2 className="text-lg font-semibold text-white mb-4">
            Detalle del Asiento ({detalles.length} líneas)
          </h2>

          {/* Vista Mobile - Cards */}
          <div className="md:hidden space-y-3">
            {detalles.map((detalle, index) => (
              <div
                key={index}
                className="bg-gray-900/50 rounded-lg border border-gray-700 p-3"
              >
                <div className="flex items-start justify-between mb-2">
                  <span className="text-xs font-bold text-blue-400">
                    Línea #{index + 1}
                  </span>
                  <span className={`
                    px-2 py-0.5 text-xs font-medium rounded-full
                    ${detalle.debe > 0 
                      ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                      : 'bg-red-500/20 text-red-400 border border-red-500/30'
                    }
                  `}>
                    {detalle.debe > 0 ? 'DEBE' : 'HABER'}
                  </span>
                </div>

                <div className="space-y-2">
                  <div>
                    <p className="text-xs text-gray-400 mb-1">Cuenta</p>
                    <p className="text-sm text-white font-medium">
                      {detalle.cuenta_codigo} - {detalle.cuenta_nombre}
                    </p>
                  </div>

                  {detalle.descripcion && (
                    <div>
                      <p className="text-xs text-gray-400 mb-1">Descripción</p>
                      <p className="text-sm text-gray-300">{detalle.descripcion}</p>
                    </div>
                  )}

                  <div>
                    <p className="text-xs text-gray-400 mb-1">Monto</p>
                    <p className={`
                      text-lg font-bold
                      ${detalle.debe > 0 ? 'text-green-400' : 'text-red-400'}
                    `}>
                      Gs. {(detalle.debe || detalle.haber)?.toLocaleString('es-PY')}
                    </p>
                  </div>

                  {detalle.tercero_razon_social && (
                    <div>
                      <p className="text-xs text-gray-400 mb-1">Tercero</p>
                      <p className="text-sm text-gray-300">{detalle.tercero_razon_social}</p>
                    </div>
                  )}

                  {detalle.documento_referencia && (
                    <div>
                      <p className="text-xs text-gray-400 mb-1">Documento</p>
                      <p className="text-sm text-gray-300">{detalle.documento_referencia}</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Vista Desktop - Tabla */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-900/50 border-b border-gray-700">
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">
                    Cuenta
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">
                    Descripción
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-400 uppercase">
                    Debe
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-400 uppercase">
                    Haber
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {detalles.map((detalle, index) => (
                  <tr key={index} className="hover:bg-gray-700/30 transition-colors">
                    <td className="px-4 py-3">
                      <div>
                        <p className="text-sm font-medium text-blue-400">
                          {detalle.cuenta_codigo}
                        </p>
                        <p className="text-sm text-white">
                          {detalle.cuenta_nombre}
                        </p>
                        {detalle.tercero_razon_social && (
                          <p className="text-xs text-gray-400 mt-1">
                            Tercero: {detalle.tercero_razon_social}
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-sm text-gray-300">
                        {detalle.descripcion || '-'}
                      </p>
                      {detalle.documento_referencia && (
                        <p className="text-xs text-gray-400 mt-1">
                          Doc: {detalle.documento_referencia}
                        </p>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {detalle.debe > 0 && (
                        <span className="text-sm font-medium text-green-400">
                          Gs. {detalle.debe.toLocaleString('es-PY')}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {detalle.haber > 0 && (
                        <span className="text-sm font-medium text-red-400">
                          Gs. {detalle.haber.toLocaleString('es-PY')}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-gray-900/70 border-t-2 border-gray-600">
                <tr>
                  <td colSpan="2" className="px-4 py-4 text-right">
                    <span className="text-base font-bold text-white">TOTALES:</span>
                  </td>
                  <td className="px-4 py-4 text-right">
                    <span className="text-lg font-bold text-green-400">
                      Gs. {totales.debe.toLocaleString('es-PY')}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-right">
                    <span className="text-lg font-bold text-red-400">
                      Gs. {totales.haber.toLocaleString('es-PY')}
                    </span>
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Totales en Mobile */}
          <div className="md:hidden mt-4 p-4 bg-gray-900/70 rounded-lg border border-gray-600">
            <p className="text-sm font-bold text-white mb-3">TOTALES:</p>
            <div className="grid grid-cols-2 gap-3">
              <div className="text-center p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
                <p className="text-xs text-gray-400 mb-1">Total Debe</p>
                <p className="text-lg font-bold text-green-400">
                  Gs. {totales.debe.toLocaleString('es-PY')}
                </p>
              </div>
              <div className="text-center p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                <p className="text-xs text-gray-400 mb-1">Total Haber</p>
                <p className="text-lg font-bold text-red-400">
                  Gs. {totales.haber.toLocaleString('es-PY')}
                </p>
              </div>
            </div>

            {/* Balance */}
            <div className="mt-3 text-center">
              {Math.abs(totales.debe - totales.haber) <= 1 ? (
                <div className="flex items-center justify-center gap-2 text-green-400">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-sm font-medium">Asiento Balanceado</span>
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2 text-red-400">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  <span className="text-sm font-medium">Desbalanceado</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Botones de Acción - Mobile */}
        {(asiento.estado === 'borrador' || (asiento.estado === 'confirmado' && !asiento.anulado)) && (
          <div className="md:hidden fixed bottom-0 left-0 right-0 p-4 bg-gray-900 border-t border-gray-800">
            {asiento.estado === 'borrador' && (
              <button
                onClick={() => setMostrarModalConfirmar(true)}
                className="w-full px-4 py-3 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors font-medium"
              >
                ✅ Confirmar Asiento
              </button>
            )}

            {asiento.estado === 'confirmado' && !asiento.anulado && (
              <button
                onClick={() => setMostrarModalAnular(true)}
                className="w-full px-4 py-3 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors font-medium"
              >
                ❌ Anular Asiento
              </button>
            )}
          </div>
        )}
      </div>

      {/* Modal de Confirmación */}
      {mostrarModalConfirmar && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-gray-800 rounded-xl border border-gray-700 w-full max-w-md">
            <div className="p-6">
              <h3 className="text-lg font-bold text-white mb-4">
                Confirmar Asiento #{asiento.numero_asiento}
              </h3>
              
              <p className="text-sm text-gray-400 mb-6">
                ¿Está seguro de confirmar este asiento? Una vez confirmado, no podrá modificarlo.
              </p>

              <div className="flex gap-3">
                <button
                  onClick={() => setMostrarModalConfirmar(false)}
                  className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleConfirmar}
                  className="flex-1 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors font-medium"
                >
                  Confirmar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Anulación */}
      {mostrarModalAnular && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-gray-800 rounded-xl border border-gray-700 w-full max-w-md">
            <div className="p-6">
              <h3 className="text-lg font-bold text-white mb-4">
                Anular Asiento #{asiento.numero_asiento}
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
                    setMotivoAnulacion('');
                  }}
                  className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
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
                    font-medium
                  "
                >
                  Anular
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}