/**
 * SELECTOR DE CUENTA CONTABLE CON AUTOCOMPLETE
 * Componente responsive mobile-first
 * Usado en formularios de asientos contables
 */

import { useState, useEffect, useRef } from 'react';
import { usePlanCuentas } from '../../hooks/usePlanCuentas';

export default function SelectorCuenta({ 
  onChange, 
  value = null,
  soloImputables = true,
  placeholder = "Buscar cuenta...",
  error = null,
  required = true,
  className = ''
}) {
  const { buscar, obtenerPorCodigo } = usePlanCuentas();
  const [busqueda, setBusqueda] = useState('');
  const [resultados, setResultados] = useState([]);
  const [cuentaSeleccionada, setCuentaSeleccionada] = useState(null);
  const [mostrarResultados, setMostrarResultados] = useState(false);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef(null);
  const dropdownRef = useRef(null);

  // Cerrar dropdown al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropdownRef.current && 
        !dropdownRef.current.contains(event.target) &&
        inputRef.current &&
        !inputRef.current.contains(event.target)
      ) {
        setMostrarResultados(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Cargar cuenta inicial si se pasa un value
  useEffect(() => {
    if (value && !cuentaSeleccionada) {
      cargarCuentaInicial(value);
    }
  }, [value]);

  const cargarCuentaInicial = async (codigo) => {
    const cuenta = await obtenerPorCodigo(codigo);
    if (cuenta) {
      setCuentaSeleccionada(cuenta);
      setBusqueda(`${cuenta.codigo} - ${cuenta.nombre}`);
    }
  };

  // Buscar cuentas mientras escribe
  useEffect(() => {
    if (busqueda.length >= 2 && !cuentaSeleccionada) {
      buscarCuentas();
    } else if (busqueda.length === 0) {
      setResultados([]);
      setMostrarResultados(false);
    }
  }, [busqueda]);

  const buscarCuentas = async () => {
    setLoading(true);
    try {
      const resultado = await buscar(busqueda, soloImputables, 10);
      setResultados(resultado);
      setMostrarResultados(resultado.length > 0);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const valor = e.target.value;
    setBusqueda(valor);
    setCuentaSeleccionada(null); // Resetear selección al escribir
    onChange?.(null); // Notificar que no hay selección
  };

  const handleSelectCuenta = (cuenta) => {
    setCuentaSeleccionada(cuenta);
    setBusqueda(`${cuenta.codigo} - ${cuenta.nombre}`);
    setMostrarResultados(false);
    onChange?.(cuenta);
  };

  const handleClear = () => {
    setBusqueda('');
    setCuentaSeleccionada(null);
    setResultados([]);
    setMostrarResultados(false);
    onChange?.(null);
    inputRef.current?.focus();
  };

  return (
    <div className={`w-full ${className}`}>
      {/* Label */}
      <label className="block text-sm font-medium text-gray-300 mb-2">
        Cuenta Contable
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>

      {/* Input Container - Responsive */}
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={busqueda}
          onChange={handleInputChange}
          onFocus={() => busqueda.length >= 2 && setMostrarResultados(true)}
          placeholder={placeholder}
          className={`
            w-full
            px-4 py-3
            pr-20
            bg-gray-800 
            text-white 
            border 
            ${error ? 'border-red-500' : 'border-gray-700'}
            rounded-lg
            focus:outline-none 
            focus:ring-2 
            ${error ? 'focus:ring-red-500' : 'focus:ring-blue-500'}
            focus:border-transparent
            transition-all
            text-sm md:text-base
          `}
        />

        {/* Iconos de estado - Responsive */}
        <div className="absolute inset-y-0 right-0 flex items-center pr-3 gap-2">
          {loading && (
            <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          )}
          
          {cuentaSeleccionada && (
            <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          )}

          {busqueda && (
            <button
              type="button"
              onClick={handleClear}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        {/* Dropdown de Resultados - Responsive */}
        {mostrarResultados && resultados.length > 0 && (
          <div 
            ref={dropdownRef}
            className="
              absolute z-50 w-full mt-1
              bg-gray-800 
              border border-gray-700 
              rounded-lg 
              shadow-xl
              max-h-60 md:max-h-80
              overflow-y-auto
            "
          >
            {resultados.map((cuenta) => (
              <button
                key={cuenta.id}
                type="button"
                onClick={() => handleSelectCuenta(cuenta)}
                className="
                  w-full 
                  px-4 py-3
                  text-left 
                  hover:bg-gray-700
                  transition-colors
                  border-b border-gray-700 
                  last:border-b-0
                  focus:outline-none 
                  focus:bg-gray-700
                "
              >
                {/* Código y Nombre - Stacked en mobile, inline en desktop */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-1">
                  <div className="flex items-center gap-2">
                    <span className="text-blue-400 font-mono text-sm md:text-base">
                      {cuenta.codigo}
                    </span>
                    <span className="text-white text-sm md:text-base">
                      {cuenta.nombre}
                    </span>
                  </div>

                  {/* Badges - Flex wrap en mobile */}
                  <div className="flex flex-wrap gap-1 md:gap-2">
                    {/* Badge de Tipo */}
                    <span className={`
                      px-2 py-0.5 
                      text-xs 
                      rounded-full
                      ${cuenta.tipo_cuenta === 'Activo' && 'bg-green-500/20 text-green-400'}
                      ${cuenta.tipo_cuenta === 'Pasivo' && 'bg-red-500/20 text-red-400'}
                      ${cuenta.tipo_cuenta === 'Patrimonio' && 'bg-purple-500/20 text-purple-400'}
                      ${cuenta.tipo_cuenta === 'Ingreso' && 'bg-blue-500/20 text-blue-400'}
                      ${cuenta.tipo_cuenta === 'Gasto' && 'bg-orange-500/20 text-orange-400'}
                    `}>
                      {cuenta.tipo_cuenta}
                    </span>

                    {/* Badge de Naturaleza */}
                    <span className="px-2 py-0.5 text-xs rounded-full bg-gray-700 text-gray-300">
                      {cuenta.naturaleza === 'D' ? 'Deudora' : 'Acreedora'}
                    </span>

                    {/* Badge de IVA - Solo en desktop */}
                    {cuenta.categoria_iva && (
                      <span className="hidden md:inline-block px-2 py-0.5 text-xs rounded-full bg-yellow-500/20 text-yellow-400">
                        IVA {cuenta.categoria_iva}
                      </span>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Mensaje de error */}
      {error && (
        <p className="mt-1 text-sm text-red-500">
          {error}
        </p>
      )}

      {/* Info de cuenta seleccionada - Solo desktop */}
      {cuentaSeleccionada && (
        <div className="hidden md:block mt-2 p-3 bg-gray-800/50 rounded-lg border border-gray-700">
          <div className="grid grid-cols-2 gap-2 text-xs text-gray-400">
            <div>
              <span className="font-medium text-gray-300">Tipo:</span> {cuentaSeleccionada.tipo_cuenta}
            </div>
            <div>
              <span className="font-medium text-gray-300">Naturaleza:</span>{' '}
              {cuentaSeleccionada.naturaleza === 'D' ? 'Deudora' : 'Acreedora'}
            </div>
            {cuentaSeleccionada.categoria_iva && (
              <div>
                <span className="font-medium text-gray-300">IVA:</span> {cuentaSeleccionada.categoria_iva}
              </div>
            )}
            {cuentaSeleccionada.requiere_tercero && (
              <div className="col-span-2 text-yellow-400">
                ⚠️ Requiere especificar tercero (cliente/proveedor)
              </div>
            )}
          </div>
        </div>
      )}

      {/* Hint de búsqueda - Solo mobile */}
      {!cuentaSeleccionada && busqueda.length < 2 && (
        <p className="md:hidden mt-1 text-xs text-gray-500">
          Escriba al menos 2 caracteres para buscar
        </p>
      )}
    </div>
  );
}