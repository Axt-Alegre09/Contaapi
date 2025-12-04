/**
 * FORMULARIO DE ASIENTO CONTABLE
 * Componente responsive mobile-first
 * Formulario completo para crear/editar asientos contables
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAsientos } from '../../hooks/useAsientos';
import { useAuth } from '../../hooks/useAutenticacion';
import SelectorPeriodo from './SelectorPeriodo';
import LineaDetalle from './LineaDetalle';

export default function FormularioAsiento({ asientoId = null, modo = 'crear' }) {
  const navigate = useNavigate();
  const { crear, modificar, validar, confirmar, loading, error } = useAsientos();
  const { usuario } = useAuth();

  // Estado del formulario
  const [periodoId, setPeriodoId] = useState(null);
  const [fecha, setFecha] = useState(new Date().toISOString().split('T')[0]);
  const [tipoAsiento, setTipoAsiento] = useState('operacion');
  const [origen, setOrigen] = useState('manual');
  const [glosa, setGlosa] = useState('');
  const [referencia, setReferencia] = useState('');
  const [detalles, setDetalles] = useState([
    { id: 1, cuenta_id: null, tipo_movimiento: 'debe', monto: 0 },
    { id: 2, cuenta_id: null, tipo_movimiento: 'haber', monto: 0 }
  ]);

  // Estado de validación
  const [validacion, setValidacion] = useState(null);
  const [errores, setErrores] = useState({});

  // Calcular totales
  const totales = detalles.reduce((acc, det) => {
    if (det.tipo_movimiento === 'debe') {
      acc.debe += det.monto || 0;
    } else {
      acc.haber += det.monto || 0;
    }
    return acc;
  }, { debe: 0, haber: 0 });

  const diferencia = totales.debe - totales.haber;
  const balanceado = Math.abs(diferencia) <= 1; // Tolerancia de 1 Gs.

  // Agregar nueva línea
  const agregarLinea = () => {
    const nuevaLinea = {
      id: Date.now(),
      cuenta_id: null,
      tipo_movimiento: totales.debe > totales.haber ? 'haber' : 'debe',
      monto: 0
    };
    setDetalles([...detalles, nuevaLinea]);
  };

  // Eliminar línea
  const eliminarLinea = (index) => {
    if (detalles.length <= 2) {
      alert('Debe tener al menos 2 líneas en el asiento');
      return;
    }
    setDetalles(detalles.filter((_, i) => i !== index));
  };

  // Actualizar línea
  const actualizarLinea = (index, datos) => {
    const nuevosDetalles = [...detalles];
    nuevosDetalles[index] = { ...nuevosDetalles[index], ...datos };
    setDetalles(nuevosDetalles);
  };

  // Validar formulario
  const validarFormulario = () => {
    const nuevosErrores = {};

    if (!periodoId) nuevosErrores.periodo = 'Debe seleccionar un período';
    if (!fecha) nuevosErrores.fecha = 'Debe ingresar una fecha';
    if (!glosa.trim()) nuevosErrores.glosa = 'Debe ingresar una glosa';

    // Validar detalles
    const detallesValidos = detalles.filter(det => det.cuenta_id && det.monto > 0);
    if (detallesValidos.length < 2) {
      nuevosErrores.detalles = 'Debe tener al menos 2 líneas con cuenta y monto';
    }

    if (!balanceado) {
      nuevosErrores.balance = `Asiento desbalanceado. Diferencia: Gs. ${Math.abs(diferencia).toLocaleString('es-PY')}`;
    }

    setErrores(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  };

  // Guardar como borrador
  const guardarBorrador = async () => {
    if (!validarFormulario()) return;

    const resultado = await crear({
      periodoId,
      fecha,
      tipoAsiento,
      origen,
      glosa,
      referencia,
      creadoPor: usuario.id,
      detalles: detalles
        .filter(det => det.cuenta_id && det.monto > 0)
        .map(det => ({
          cuenta_id: det.cuenta_id,
          tipo_movimiento: det.tipo_movimiento,
          monto: det.monto,
          descripcion: det.descripcion || glosa,
          documento_referencia: det.documento_referencia || referencia
        }))
    });

    if (resultado.success) {
      alert('✅ Asiento guardado como borrador');
      navigate('/contabilidad/asientos');
    } else {
      alert('❌ Error: ' + resultado.error);
    }
  };

  // Confirmar asiento
  const confirmarAsiento = async () => {
    if (!validarFormulario()) return;

    if (!confirm('¿Está seguro de confirmar este asiento? No podrá modificarlo después.')) {
      return;
    }

    // Primero crear el asiento
    const resultadoCrear = await crear({
      periodoId,
      fecha,
      tipoAsiento,
      origen,
      glosa,
      referencia,
      creadoPor: usuario.id,
      detalles: detalles
        .filter(det => det.cuenta_id && det.monto > 0)
        .map(det => ({
          cuenta_id: det.cuenta_id,
          tipo_movimiento: det.tipo_movimiento,
          monto: det.monto,
          descripcion: det.descripcion || glosa,
          documento_referencia: det.documento_referencia || referencia
        }))
    });

    if (resultadoCrear.success) {
      // Luego confirmar
      const resultadoConfirmar = await confirmar(resultadoCrear.data.asiento_id, usuario.id);
      
      if (resultadoConfirmar.success) {
        alert('✅ Asiento confirmado exitosamente');
        navigate('/contabilidad/asientos');
      }
    } else {
      alert('❌ Error: ' + resultadoCrear.error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 pb-20">
      {/* Header - Sticky en mobile */}
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
                {modo === 'crear' ? 'Nuevo Asiento' : 'Editar Asiento'}
              </h1>
              <p className="text-sm text-gray-400 hidden md:block">
                Complete los datos del asiento contable
              </p>
            </div>
          </div>

          {/* Indicador de balance - Visible en desktop */}
          <div className="hidden md:flex items-center gap-2">
            {balanceado ? (
              <div className="flex items-center gap-2 text-green-400">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="text-sm font-medium">Balanceado</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-red-400">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <span className="text-sm font-medium">Desbalanceado</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Contenido Principal - Responsive */}
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-6 space-y-6">
        {/* Card de Encabezado */}
        <div className="bg-gray-800 rounded-xl border border-gray-700 p-4 md:p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Datos Generales</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Período */}
            <SelectorPeriodo
              value={periodoId}
              onChange={setPeriodoId}
              error={errores.periodo}
            />

            {/* Fecha */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Fecha <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={fecha}
                onChange={(e) => setFecha(e.target.value)}
                className={`
                  w-full px-4 py-3
                  bg-gray-800 text-white 
                  border ${errores.fecha ? 'border-red-500' : 'border-gray-700'}
                  rounded-lg
                  focus:outline-none focus:ring-2 
                  ${errores.fecha ? 'focus:ring-red-500' : 'focus:ring-blue-500'}
                  text-sm md:text-base
                `}
              />
              {errores.fecha && <p className="mt-1 text-sm text-red-500">{errores.fecha}</p>}
            </div>

            {/* Tipo de Asiento - Select simple en mobile */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Tipo de Asiento
              </label>
              <select
                value={tipoAsiento}
                onChange={(e) => setTipoAsiento(e.target.value)}
                className="
                  w-full px-4 py-3
                  bg-gray-800 text-white 
                  border border-gray-700 
                  rounded-lg
                  focus:outline-none focus:ring-2 focus:ring-blue-500
                  text-sm md:text-base
                "
              >
                <option value="operacion">Operación</option>
                <option value="apertura">Apertura</option>
                <option value="ajuste">Ajuste</option>
                <option value="cierre">Cierre</option>
              </select>
            </div>

            {/* Glosa - Full width en mobile */}
            <div className="md:col-span-2 lg:col-span-3">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Glosa / Descripción <span className="text-red-500">*</span>
              </label>
              <textarea
                value={glosa}
                onChange={(e) => setGlosa(e.target.value)}
                placeholder="Descripción general del asiento contable..."
                rows="2"
                className={`
                  w-full px-4 py-3
                  bg-gray-800 text-white 
                  border ${errores.glosa ? 'border-red-500' : 'border-gray-700'}
                  rounded-lg
                  focus:outline-none focus:ring-2 
                  ${errores.glosa ? 'focus:ring-red-500' : 'focus:ring-blue-500'}
                  resize-none
                  text-sm md:text-base
                `}
              />
              {errores.glosa && <p className="mt-1 text-sm text-red-500">{errores.glosa}</p>}
            </div>

            {/* Referencia */}
            <div className="md:col-span-2 lg:col-span-3">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Referencia / Documento
                <span className="text-xs text-gray-500 ml-2">(Opcional)</span>
              </label>
              <input
                type="text"
                value={referencia}
                onChange={(e) => setReferencia(e.target.value)}
                placeholder="Ej: FAC-001, REC-023, CHQ-456"
                className="
                  w-full px-4 py-3
                  bg-gray-800 text-white 
                  border border-gray-700 
                  rounded-lg
                  focus:outline-none focus:ring-2 focus:ring-blue-500
                  text-sm md:text-base
                "
              />
            </div>
          </div>
        </div>

        {/* Líneas de Detalle */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white">
              Líneas de Detalle
              <span className="ml-2 text-sm text-gray-400">({detalles.length} líneas)</span>
            </h2>
            
            <button
              type="button"
              onClick={agregarLinea}
              className="
                flex items-center gap-2
                px-4 py-2
                bg-blue-500 hover:bg-blue-600
                text-white
                rounded-lg
                transition-colors
                text-sm md:text-base
              "
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <span className="hidden sm:inline">Agregar Línea</span>
              <span className="sm:hidden">Agregar</span>
            </button>
          </div>

          {errores.detalles && (
            <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
              <p className="text-sm text-red-400">{errores.detalles}</p>
            </div>
          )}

          {/* Lista de líneas */}
          <div className="space-y-4">
            {detalles.map((linea, index) => (
              <LineaDetalle
                key={linea.id}
                linea={linea}
                index={index}
                onChange={actualizarLinea}
                onRemove={eliminarLinea}
              />
            ))}
          </div>
        </div>

        {/* Card de Totales - Sticky en mobile */}
        <div className="
          sticky bottom-0 left-0 right-0
          md:static
          bg-gray-800 
          rounded-xl 
          border border-gray-700 
          p-4 md:p-6
          shadow-2xl md:shadow-none
        ">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {/* Total Debe */}
            <div className="text-center p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
              <p className="text-xs md:text-sm text-gray-400 mb-1">Total Debe</p>
              <p className="text-lg md:text-2xl font-bold text-green-400">
                Gs. {totales.debe.toLocaleString('es-PY')}
              </p>
            </div>

            {/* Total Haber */}
            <div className="text-center p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
              <p className="text-xs md:text-sm text-gray-400 mb-1">Total Haber</p>
              <p className="text-lg md:text-2xl font-bold text-red-400">
                Gs. {totales.haber.toLocaleString('es-PY')}
              </p>
            </div>

            {/* Diferencia */}
            <div className={`
              text-center p-4 rounded-lg border
              ${balanceado 
                ? 'bg-green-500/10 border-green-500/30' 
                : 'bg-yellow-500/10 border-yellow-500/30'
              }
            `}>
              <p className="text-xs md:text-sm text-gray-400 mb-1">Diferencia</p>
              <p className={`
                text-lg md:text-2xl font-bold
                ${balanceado ? 'text-green-400' : 'text-yellow-400'}
              `}>
                Gs. {Math.abs(diferencia).toLocaleString('es-PY')}
              </p>
            </div>

            {/* Estado */}
            <div className={`
              text-center p-4 rounded-lg border
              ${balanceado 
                ? 'bg-green-500/10 border-green-500/30' 
                : 'bg-red-500/10 border-red-500/30'
              }
            `}>
              <p className="text-xs md:text-sm text-gray-400 mb-1">Estado</p>
              <p className={`
                text-sm md:text-base font-bold
                ${balanceado ? 'text-green-400' : 'text-red-400'}
              `}>
                {balanceado ? '✅ Balanceado' : '❌ Desbalanceado'}
              </p>
            </div>
          </div>

          {/* Botones de Acción - Stack en mobile, row en desktop */}
          <div className="mt-6 flex flex-col md:flex-row gap-3">
            <button
              type="button"
              onClick={() => navigate('/contabilidad/asientos')}
              disabled={loading}
              className="
                flex-1
                px-6 py-3
                bg-gray-700 hover:bg-gray-600
                text-white
                rounded-lg
                transition-colors
                disabled:opacity-50
                disabled:cursor-not-allowed
                text-sm md:text-base
              "
            >
              Cancelar
            </button>

            <button
              type="button"
              onClick={guardarBorrador}
              disabled={loading || !balanceado}
              className="
                flex-1
                px-6 py-3
                bg-yellow-500 hover:bg-yellow-600
                text-white
                rounded-lg
                transition-colors
                disabled:opacity-50
                disabled:cursor-not-allowed
                font-medium
                text-sm md:text-base
              "
            >
              {loading ? 'Guardando...' : '💾 Guardar Borrador'}
            </button>

            <button
              type="button"
              onClick={confirmarAsiento}
              disabled={loading || !balanceado}
              className="
                flex-1
                px-6 py-3
                bg-green-500 hover:bg-green-600
                text-white
                rounded-lg
                transition-colors
                disabled:opacity-50
                disabled:cursor-not-allowed
                font-medium
                text-sm md:text-base
              "
            >
              {loading ? 'Confirmando...' : '✅ Confirmar Asiento'}
            </button>
          </div>

          {errores.balance && (
            <div className="mt-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
              <p className="text-sm text-red-400 text-center">{errores.balance}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}