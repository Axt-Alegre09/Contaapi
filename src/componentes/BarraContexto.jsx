// src/componentes/BarraContexto.jsx
import { useNavigate } from 'react-router-dom'
import { useEmpresa } from '@/contextos/EmpresaContext'

export function BarraContexto() {
  const { empresaActual, periodoActual, limpiarContexto } = useEmpresa()
  const navigate = useNavigate()

  if (!empresaActual || !periodoActual) return null

  const handleCambiarEmpresa = () => {
    limpiarContexto()
    navigate('/seleccion-periodo')
  }

  return (
    <div className="bg-blue-50 border-b border-blue-200 px-4 py-2">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-6 text-sm">
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
            <span className="text-gray-600">Empresa:</span>
            <span className="font-semibold text-gray-800">{empresaActual.nombre}</span>
            <span className="text-gray-500">({empresaActual.ruc})</span>
          </div>
          
          <div className="h-4 w-px bg-gray-300" />
          
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span className="text-gray-600">Periodo:</span>
            <span className="font-semibold text-gray-800">{periodoActual.anio}</span>
          </div>
        </div>

        <button
          onClick={handleCambiarEmpresa}
          className="text-sm text-blue-600 hover:text-blue-700 hover:underline flex items-center gap-1"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
          </svg>
          Cambiar empresa/periodo
        </button>
      </div>
    </div>
  )
}