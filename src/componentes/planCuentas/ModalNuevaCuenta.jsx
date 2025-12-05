/**
 * COMPONENTE: ModalNuevaCuenta
 * Modal para agregar nueva cuenta
 */

import { useState } from 'react';
import { X } from 'lucide-react';
import { FormularioCuenta } from './FormularioCuenta';
import { usePlanCuentas } from '../../hooks/usePlanCuentas';

export const ModalNuevaCuenta = ({ isOpen, onClose }) => {
  const { agregar } = usePlanCuentas();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (datos) => {
    setLoading(true);
    setError(null);
    setSuccess(false);

    const resultado = await agregar(datos);

    if (resultado.success) {
      setSuccess(true);
      setTimeout(() => {
        onClose();
        setSuccess(false);
      }, 1500);
    } else {
      setError(resultado.error);
    }

    setLoading(false);
  };

  const handleClose = () => {
    if (!loading) {
      setError(null);
      setSuccess(false);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Nueva Cuenta Contable
            </h2>
            <button
              onClick={handleClose}
              disabled={loading}
              className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300
                disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Body */}
          <div className="p-6">
            {/* Mensajes */}
            {error && (
              <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
              </div>
            )}

            {success && (
              <div className="mb-4 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                <p className="text-sm text-green-800 dark:text-green-200">
                  ✓ Cuenta creada exitosamente
                </p>
              </div>
            )}

            {/* Formulario */}
            <FormularioCuenta
              onSubmit={handleSubmit}
              onCancel={handleClose}
              loading={loading}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
