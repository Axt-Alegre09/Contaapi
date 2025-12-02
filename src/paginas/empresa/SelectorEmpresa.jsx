// src/paginas/empresa/SelectorEmpresa.jsx
import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useEmpresaContext } from '@/contextos/EmpresaContext'
import { supabase } from '@/configuracion/supabase'

export default function SelectorEmpresa() {
  const [empresas, setEmpresas] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const navigate = useNavigate()
  const location = useLocation()
  const { establecerContexto } = useEmpresaContext()
  
  const periodoSeleccionado = location.state?.periodo

  useEffect(() => {
    if (!periodoSeleccionado) {
      navigate('/seleccion-periodo')
      return
    }
    cargarEmpresas()
  }, [periodoSeleccionado])

  const cargarEmpresas = async () => {
    try {
      setLoading(true)
      setError(null)

      // Obtener el usuario actual
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('No hay usuario autenticado')

      // Obtener empresas del usuario para el periodo seleccionado
      const { data, error } = await supabase
        .from('miembros_empresa')
        .select(`
          empresa_id,
          rol,
          empresas (
            id,
            nombre,
            ruc,
            razon_social
          )
        `)
        .eq('user_id', user.id)
        .eq('periodo_fiscal', periodoSeleccionado.id)
        .eq('estado', 'activo')

      if (error) throw error

      // Transformar datos
      const empresasFormateadas = data.map(item => ({
        id: item.empresas.id,
        nombre: item.empresas.nombre,
        ruc: item.empresas.ruc,
        razonSocial: item.empresas.razon_social,
        rol: item.rol
      }))

      setEmpresas(empresasFormateadas)
    } catch (error) {
      console.error('Error cargando empresas:', error)
      setError('Error al cargar las empresas del periodo seleccionado')
    } finally {
      setLoading(false)
    }
  }

  const seleccionarEmpresa = (empresa) => {
    // Establecer contexto completo
    establecerContexto(
      empresa.id,
      empresa.nombre,
      empresa.ruc,
      periodoSeleccionado.id,
      periodoSeleccionado.anio,
      {
        desde: periodoSeleccionado.fechaDesde,
        hasta: periodoSeleccionado.fechaHasta
      }
    )
    
    // Redirigir al dashboard
    navigate('/dashboard')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="bg-white p-8 rounded-lg shadow-lg">
          <div className="flex items-center gap-3">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="text-gray-700">Cargando empresas...</span>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-md">
          <div className="text-center">
            <div className="text-red-600 text-5xl mb-4">⚠️</div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">Error</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={() => navigate('/seleccion-periodo')}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Volver a periodos
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
        <div className="mb-6">
          <button
            onClick={() => navigate('/seleccion-periodo')}
            className="text-blue-600 hover:text-blue-700 mb-4 flex items-center gap-2 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Cambiar periodo
          </button>
          
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-800">Selección de Empresa</h2>
            <div className="mt-2 inline-block px-4 py-2 bg-blue-100 text-blue-800 rounded-full">
              <span className="font-semibold">Periodo: {periodoSeleccionado?.anio}</span>
            </div>
          </div>
        </div>
        
        <div className="space-y-3">
          {empresas.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500 mb-4">No tienes empresas asignadas en este periodo</p>
              <button
                onClick={() => navigate('/seleccion-periodo')}
                className="text-blue-600 hover:underline"
              >
                Seleccionar otro periodo
              </button>
            </div>
          ) : (
            empresas.map((empresa) => (
              <button
                key={empresa.id}
                onClick={() => seleccionarEmpresa(empresa)}
                className="w-full p-4 text-left border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all duration-200 group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="font-bold text-lg text-gray-800 group-hover:text-blue-600 transition-colors">
                      {empresa.nombre}
                    </div>
                    <div className="text-sm text-gray-600 mt-1">
                      RUC: {empresa.ruc}
                    </div>
                    <div className="mt-2">
                      <span className="inline-block px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                        {empresa.rol}
                      </span>
                    </div>
                  </div>
                  <svg 
                    className="w-6 h-6 text-gray-400 group-hover:text-blue-600 transition-colors flex-shrink-0" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  )
}