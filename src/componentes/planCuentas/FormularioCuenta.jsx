/**
 * COMPONENTE: FormularioCuenta
 * Formulario reutilizable para agregar y editar cuentas
 */

import { useState, useEffect } from 'react';
import { usePlanCuentas } from '../../hooks/usePlanCuentas';

export const FormularioCuenta = ({ 
  cuenta = null,  // Si es null, es agregar. Si tiene datos, es editar
  onSubmit,
  onCancel,
  loading = false
}) => {
  const { obtenerCuentasPadre } = usePlanCuentas();
  const [cuentasPadre, setCuentasPadre] = useState([]);
  const [loadingPadres, setLoadingPadres] = useState(false);

  // Estado del formulario
  const [formData, setFormData] = useState({
    codigo: '',
    nombre: '',
    tipoCuenta: 'Activo',
    naturaleza: 'D',
    nivel: 1,
    esImputable: true,
    requiereTercero: false,
    requiereDocumento: false,
    categoriaIva: '',
    codigoImpositivo: '',
    descripcion: '',
    cuentaPadreId: ''
  });

  const [errors, setErrors] = useState({});

  // Cargar datos si es edición
  useEffect(() => {
    if (cuenta) {
      setFormData({
        codigo: cuenta.codigo || '',
        nombre: cuenta.nombre || '',
        tipoCuenta: cuenta.tipo_cuenta || 'Activo',
        naturaleza: cuenta.naturaleza || 'D',
        nivel: cuenta.nivel || 1,
        esImputable: cuenta.es_imputable ?? true,
        requiereTercero: cuenta.requiere_tercero ?? false,
        requiereDocumento: cuenta.requiere_documento ?? false,
        categoriaIva: cuenta.categoria_iva || '',
        codigoImpositivo: cuenta.codigo_impositivo || '',
        descripcion: cuenta.descripcion || '',
        cuentaPadreId: cuenta.cuenta_padre_id || ''
      });
    }
  }, [cuenta]);

  // Cargar cuentas padre
  useEffect(() => {
    cargarCuentasPadre();
  }, []);

  const cargarCuentasPadre = async () => {
    setLoadingPadres(true);
    const resultado = await obtenerCuentasPadre();
    if (resultado.success) {
      setCuentasPadre(resultado.data);
    }
    setLoadingPadres(false);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    // Limpiar error del campo
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validar = () => {
    const nuevosErrores = {};

    if (!formData.codigo.trim()) {
      nuevosErrores.codigo = 'El código es requerido';
    }

    if (!formData.nombre.trim()) {
      nuevosErrores.nombre = 'El nombre es requerido';
    }

    if (!formData.nivel || formData.nivel < 1 || formData.nivel > 9) {
      nuevosErrores.nivel = 'El nivel debe ser entre 1 y 9';
    }

    setErrors(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validar()) {
      onSubmit(formData);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Fila 1: Código y Nombre */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Código */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Código *
          </label>
          <input
            type="text"
            name="codigo"
            value={formData.codigo}
            onChange={handleChange}
            disabled={loading}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 
              dark:bg-gray-700 dark:border-gray-600 dark:text-white
              ${errors.codigo ? 'border-red-500' : 'border-gray-300'}
              ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
            placeholder="Ej: 1.01.01"
          />
          {errors.codigo && (
            <p className="mt-1 text-sm text-red-500">{errors.codigo}</p>
          )}
        </div>

        {/* Nombre */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Nombre *
          </label>
          <input
            type="text"
            name="nombre"
            value={formData.nombre}
            onChange={handleChange}
            disabled={loading}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 
              dark:bg-gray-700 dark:border-gray-600 dark:text-white
              ${errors.nombre ? 'border-red-500' : 'border-gray-300'}
              ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
            placeholder="Ej: CAJA"
          />
          {errors.nombre && (
            <p className="mt-1 text-sm text-red-500">{errors.nombre}</p>
          )}
        </div>
      </div>

      {/* Fila 2: Tipo y Naturaleza */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Tipo de Cuenta */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Tipo *
          </label>
          <select
            name="tipoCuenta"
            value={formData.tipoCuenta}
            onChange={handleChange}
            disabled={loading}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 
              dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          >
            <option value="Activo">Activo</option>
            <option value="Pasivo">Pasivo</option>
            <option value="Patrimonio">Patrimonio</option>
            <option value="Ingreso">Ingreso</option>
            <option value="Gasto">Gasto</option>
          </select>
        </div>

        {/* Naturaleza */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Naturaleza *
          </label>
          <select
            name="naturaleza"
            value={formData.naturaleza}
            onChange={handleChange}
            disabled={loading}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 
              dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          >
            <option value="D">Deudora</option>
            <option value="A">Acreedora</option>
          </select>
        </div>

        {/* Nivel */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Nivel *
          </label>
          <input
            type="number"
            name="nivel"
            value={formData.nivel}
            onChange={handleChange}
            disabled={loading}
            min="1"
            max="9"
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 
              dark:bg-gray-700 dark:border-gray-600 dark:text-white
              ${errors.nivel ? 'border-red-500' : 'border-gray-300'}
              ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
          />
          {errors.nivel && (
            <p className="mt-1 text-sm text-red-500">{errors.nivel}</p>
          )}
        </div>
      </div>

      {/* Fila 3: Cuenta Padre */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Cuenta Padre (Opcional)
        </label>
        <select
          name="cuentaPadreId"
          value={formData.cuentaPadreId}
          onChange={handleChange}
          disabled={loading || loadingPadres}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 
            dark:bg-gray-700 dark:border-gray-600 dark:text-white"
        >
          <option value="">Sin cuenta padre</option>
          {cuentasPadre.map(padre => (
            <option key={padre.value} value={padre.value}>
              {padre.label}
            </option>
          ))}
        </select>
        {loadingPadres && (
          <p className="mt-1 text-sm text-gray-500">Cargando cuentas padre...</p>
        )}
      </div>

      {/* Fila 4: Checkboxes */}
      <div className="space-y-2">
        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            name="esImputable"
            checked={formData.esImputable}
            onChange={handleChange}
            disabled={loading}
            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
          <span className="text-sm text-gray-700 dark:text-gray-300">
            Es imputable (permite asientos)
          </span>
        </label>

        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            name="requiereTercero"
            checked={formData.requiereTercero}
            onChange={handleChange}
            disabled={loading}
            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
          <span className="text-sm text-gray-700 dark:text-gray-300">
            Requiere tercero (cliente/proveedor)
          </span>
        </label>

        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            name="requiereDocumento"
            checked={formData.requiereDocumento}
            onChange={handleChange}
            disabled={loading}
            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
          <span className="text-sm text-gray-700 dark:text-gray-300">
            Requiere documento (factura/recibo)
          </span>
        </label>
      </div>

      {/* Fila 5: Categoría IVA y Código Impositivo */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Categoría IVA (Opcional)
          </label>
          <input
            type="text"
            name="categoriaIva"
            value={formData.categoriaIva}
            onChange={handleChange}
            disabled={loading}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 
              dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            placeholder="Ej: IVA 10%"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Código Impositivo (Opcional)
          </label>
          <input
            type="text"
            name="codigoImpositivo"
            value={formData.codigoImpositivo}
            onChange={handleChange}
            disabled={loading}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 
              dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            placeholder="Ej: 001"
          />
        </div>
      </div>

      {/* Fila 6: Descripción */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Descripción (Opcional)
        </label>
        <textarea
          name="descripcion"
          value={formData.descripcion}
          onChange={handleChange}
          disabled={loading}
          rows="3"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 
            dark:bg-gray-700 dark:border-gray-600 dark:text-white resize-none"
          placeholder="Descripción o notas adicionales..."
        />
      </div>

      {/* Botones */}
      <div className="flex justify-end space-x-3 pt-4 border-t dark:border-gray-700">
        <button
          type="button"
          onClick={onCancel}
          disabled={loading}
          className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 
            bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 
            rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 
            disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 text-sm font-medium text-white 
            bg-gradient-to-r from-blue-600 to-purple-600 
            rounded-lg hover:from-blue-700 hover:to-purple-700 
            disabled:opacity-50 disabled:cursor-not-allowed
            flex items-center space-x-2"
        >
          {loading && (
            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
          )}
          <span>{cuenta ? 'Actualizar' : 'Crear'} Cuenta</span>
        </button>
      </div>
    </form>
  );
};