import { X, AlertTriangle } from 'lucide-react'

export function ModalConfirmarAccion({ titulo, mensaje, textoBoton, colorBoton, onConfirmar, onCancelar }) {
  const coloresBoton = {
    red: 'bg-red-600 hover:bg-red-700',
    green: 'bg-green-600 hover:bg-green-700',
    blue: 'bg-blue-600 hover:bg-blue-700'
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${colorBoton === 'red' ? 'bg-red-100' : 'bg-blue-100'}`}>
              <AlertTriangle className={`w-6 h-6 ${colorBoton === 'red' ? 'text-red-600' : 'text-blue-600'}`} />
            </div>
            <h2 className="text-xl font-bold text-gray-900">{titulo}</h2>
          </div>
          <button
            onClick={onCancelar}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Contenido */}
        <div className="p-6">
          <p className="text-gray-700 whitespace-pre-line">{mensaje}</p>

          {/* Botones */}
          <div className="flex gap-3 mt-6">
            <button
              onClick={onCancelar}
              className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              Cancelar
            </button>
            <button
              onClick={onConfirmar}
              className={`flex-1 px-4 py-3 text-white rounded-lg transition-all font-medium ${coloresBoton[colorBoton]}`}
            >
              {textoBoton}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}