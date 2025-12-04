/**
 * LÍNEA DE DETALLE DE ASIENTO CONTABLE
 * Componente responsive mobile-first
 * Representa una línea individual (debe o haber) en un asiento
 */

import { useState, useEffect } from 'react';
import SelectorCuenta from './SelectorCuenta';

export default function LineaDetalle({ 
  linea,
  index,
  onChange,
  onRemove,
  soloLectura = false,
  mostrarTercero = false,
  className = ''
}) {
  const [tipoMovimiento, setTipoMovimiento] = useState(linea?.tipo_movimiento || 'debe');
  const [monto, setMonto] = useState(linea?.monto || '');
  const [cuentaSeleccionada, setCuentaSeleccionada] = useState(linea?.cuenta || null);
  const [descripcion, setDescripcion] = useState(linea?.descripcion || '');
  const [documentoReferencia, setDocumentoReferencia] = useState(linea?.documento_referencia || '');
  const [errores, setErrores] = useState({});

  // Notificar cambios al padre
  useEffect(() => {
    if (onChange && cuentaSeleccionada) {
      onChange(index, {
        cuenta_id: cuentaSeleccionada.id,
        cuenta: cuentaSeleccionada,
        tipo_movimiento: tipoMovimiento,
        monto: parseFloat(monto) || 0,
        descripcion,
        documento_referencia: documentoReferencia || null,
        tercero_id: null // TODO: Implementar selector de tercero
      });
    }
  }, [tipoMovimiento, monto, cuentaSeleccionada, descripcion, documentoReferencia]);

  const handleCuentaChange = (cuenta) => {
    setCuentaSeleccionada(cuenta);
    if (cuenta) {
      setErrores(prev => ({ ...prev, cuenta: null }));
    }
  };

  const handleMontoChange = (e) => {
    const valor = e.target.value.replace(/[^0-9]/g, '');
    setMonto(valor);
    if (valor) {
      setErrores(prev => ({ ...prev, monto: null }));
    }
  };

  const formatearMonto = (valor) => {
    if (!valor) return '';
    return parseInt(valor).toLocaleString('es-PY');
  };

  const handleTipoChange = (tipo) => {
    setTipoMovimiento(tipo);
  };

  return (
    <div className={`
      p-4 md:p-6
      bg-gray-800/50 
      border border-gray-700 
      rounded-lg
      transition-all
      hover:border-gray-600
      ${className}
    `}>
      {/* Header - Número de línea y botón eliminar */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="
            flex items-center justify-center
            w-8 h-8
            bg-blue-500/20 
            text-blue-400 
            rounded-full 
            text-sm font-bold
          ">
            {index + 1}
          </span>
          <span className="text-sm text-gray-400 hidden md:inline">
            Línea de detalle
          </span>
        </div>

        {!soloLectura && (
          <button
            type="button"
            onClick={() => onRemove(index)}
            className="
              p-2
              text-red-400 
              hover:text-red-300
              hover:bg-red-500/10
              rounded-lg
              transition-colors
            "
            title="Eliminar línea"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        )}
      </div>

      {/* Grid principal - Responsive */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* COLUMNA 1: Cuenta y Descripción */}
        <div className="space-y-4">
          {/* Selector de Cuenta */}
          <SelectorCuenta
            value={cuentaSeleccionada?.codigo}
            onChange={handleCuentaChange}
            error={errores.cuenta}
            required={true}
            soloImputables={true}
          />

          {/* Descripción - Oculta en mobile si no hay valor, visible en desktop */}
          <div className={`${!descripcion && 'hidden md:block'}`}>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Descripción / Concepto
            </label>
            <input
              type="text"
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              placeholder="Detalle de la operación..."
              disabled={soloLectura}
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
                disabled:opacity-50
                disabled:cursor-not-allowed
                text-sm md:text-base
              "
            />
          </div>
        </div>

        {/* COLUMNA 2: Tipo de Movimiento y Monto */}
        <div className="space-y-4">
          {/* Toggle Debe/Haber - Botones grandes en mobile */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Tipo de Movimiento
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleTipoChange('debe')}
                disabled={soloLectura}
                className={`
                  py-3 md:py-4
                  rounded-lg
                  font-medium
                  transition-all
                  text-sm md:text-base
                  ${tipoMovimiento === 'debe'
                    ? 'bg-green-500 text-white shadow-lg shadow-green-500/30'
                    : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
                  }
                  disabled:opacity-50
                  disabled:cursor-not-allowed
                `}
              >
                <div className="flex items-center justify-center gap-2">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v3.586L7.707 9.293a1 1 0 00-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 10.586V7z" clipRule="evenodd" />
                  </svg>
                  <span>DEBE</span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleTipoChange('haber')}
                disabled={soloLectura}
                className={`
                  py-3 md:py-4
                  rounded-lg
                  font-medium
                  transition-all
                  text-sm md:text-base
                  ${tipoMovimiento === 'haber'
                    ? 'bg-red-500 text-white shadow-lg shadow-red-500/30'
                    : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
                  }
                  disabled:opacity-50
                  disabled:cursor-not-allowed
                `}
              >
                <div className="flex items-center justify-center gap-2">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v3.586l-1.293-1.293a1 1 0 00-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 10.586V7z" clipRule="evenodd" />
                  </svg>
                  <span>HABER</span>
                </div>
              </button>
            </div>
          </div>

          {/* Input de Monto - Grande y visible */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Monto (Gs.)
              <span className="text-red-500 ml-1">*</span>
            </label>
            <div className="relative">
              <span className="
                absolute 
                left-4 
                top-1/2 
                -translate-y-1/2
                text-gray-400
                text-sm md:text-base
              ">
                Gs.
              </span>
              <input
                type="text"
                value={formatearMonto(monto)}
                onChange={handleMontoChange}
                placeholder="0"
                disabled={soloLectura}
                className={`
                  w-full
                  pl-12 pr-4 py-4
                  bg-gray-800 
                  text-white 
                  text-xl md:text-2xl
                  font-bold
                  border 
                  ${errores.monto ? 'border-red-500' : 'border-gray-700'}
                  rounded-lg
                  focus:outline-none 
                  focus:ring-2 
                  ${errores.monto ? 'focus:ring-red-500' : 'focus:ring-blue-500'}
                  focus:border-transparent
                  disabled:opacity-50
                  disabled:cursor-not-allowed
                  text-right
                `}
              />
            </div>
            {errores.monto && (
              <p className="mt-1 text-sm text-red-500">{errores.monto}</p>
            )}
          </div>

          {/* Documento Referencia - Colapsable en mobile */}
          <div className="hidden md:block">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Doc. Referencia
              <span className="text-xs text-gray-500 ml-2">(Opcional)</span>
            </label>
            <input
              type="text"
              value={documentoReferencia}
              onChange={(e) => setDocumentoReferencia(e.target.value)}
              placeholder="Ej: FAC-001, REC-023"
              disabled={soloLectura}
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
                disabled:opacity-50
                disabled:cursor-not-allowed
                text-sm
              "
            />
          </div>
        </div>
      </div>

      {/* Info de cuenta seleccionada - Solo mobile */}
      {cuentaSeleccionada && (
        <div className="md:hidden mt-4 p-3 bg-gray-900/50 rounded-lg border border-gray-700">
          <div className="flex items-center gap-2 text-xs">
            <span className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded">
              {cuentaSeleccionada.tipo_cuenta}
            </span>
            <span className="px-2 py-1 bg-gray-700 text-gray-300 rounded">
              {cuentaSeleccionada.naturaleza === 'D' ? 'Deudora' : 'Acreedora'}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}