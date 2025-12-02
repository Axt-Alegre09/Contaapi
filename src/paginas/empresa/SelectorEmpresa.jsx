// src/paginas/empresa/SelectorEmpresa.jsx
import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useEmpresa } from '@/contextos/EmpresaContext'
import { supabase } from '@/configuracion/supabase'

export function SelectorEmpresa() {
  const [empresas, setEmpresas] = useState([])
  const [empresasFiltradas, setEmpresasFiltradas] = useState([])
  const [busqueda, setBusqueda] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const navigate = useNavigate()
  const location = useLocation()
  const { establecerContexto } = useEmpresa()
  
  const periodoSeleccionado = location.state?.periodo

  useEffect(() => {
    if (!periodoSeleccionado) {
      navigate('/seleccion-periodo')
      return
    }
    cargarEmpresas()
  }, [periodoSeleccionado])

  useEffect(() => {
    // Filtrar empresas cuando cambia la búsqueda
    if (busqueda.trim() === '') {
      setEmpresasFiltradas(empresas)
    } else {
      const filtradas = empresas.filter(empresa =>
        empresa.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
        empresa.ruc.includes(busqueda) ||
        empresa.rol.toLowerCase().includes(busqueda.toLowerCase())
      )
      setEmpresasFiltradas(filtradas)
    }
  }, [busqueda, empresas])

  const cargarEmpresas = async () => {
    try {
      setLoading(true)
      setError(null)

      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('No hay usuario autenticado')

      const { data, error } = await supabase
        .from('usuarios_empresas')
        .select(`
          *,
          empresas (
            id,
            nombre_comercial,
            razon_social,
            ruc,
            logo_url,
            estado
          )
        `)
        .eq('user_id', user.id)
        .eq('periodo_fiscal', periodoSeleccionado.id)
        .eq('estado', 'activo')
        .is('deleted_at', null)

      if (error) throw error

      const empresasFormateadas = data
        .filter(item => item.empresas && item.empresas.estado === 'activa')
        .map(item => ({
          id: item.empresas.id,
          nombre: item.empresas.nombre_comercial,
          razonSocial: item.empresas.razon_social,
          ruc: item.empresas.ruc,
          logoUrl: item.empresas.logo_url,
          rol: item.rol,
          periodoFiscal: item.periodo_fiscal
        }))

      setEmpresas(empresasFormateadas)
      setEmpresasFiltradas(empresasFormateadas)
    } catch (error) {
      console.error('Error cargando empresas:', error)
      setError('Error al cargar las empresas del periodo seleccionado')
    } finally {
      setLoading(false)
    }
  }

  const seleccionarEmpresa = (empresa) => {
    establecerContexto(
      {
        id: empresa.id,
        nombre: empresa.nombre,
        razonSocial: empresa.razonSocial,
        ruc: empresa.ruc,
        logoUrl: empresa.logoUrl
      },
      {
        id: periodoSeleccionado.id,
        anio: periodoSeleccionado.anio,
        fechaDesde: periodoSeleccionado.fecha_desde,
        fechaHasta: periodoSeleccionado.fecha_hasta
      },
      empresa.rol
    )
    
    navigate('/dashboard')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center relative">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ 
            backgroundImage: 'url(https://rsttvtsckdgjyobrqtlx.supabase.co/storage/v1/object/public/Contaapi/fondoLogin.jpg)',
            filter: 'blur(3px)'
          }}
        />
        {/* Overlay CON DARK MODE */}
        <div className="absolute inset-0 bg-black/60 dark:bg-black/80" />
        
        {/* Contenido CON DARK MODE */}
        <div className="relative z-10 bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg">
          <div className="flex items-center gap-3">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 dark:border-blue-400"></div>
            <span className="text-gray-700 dark:text-gray-300">Cargando empresas...</span>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center relative">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ 
            backgroundImage: 'url(https://rsttvtsckdgjyobrqtlx.supabase.co/storage/v1/object/public/Contaapi/fondoLogin.jpg)',
            filter: 'blur(3px)'
          }}
        />
        {/* Overlay CON DARK MODE */}
        <div className="absolute inset-0 bg-black/60 dark:bg-black/80" />
        
        {/* Contenido CON DARK MODE */}
        <div className="relative z-10 bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg max-w-md">
          <div className="text-center">
            <div className="text-red-600 dark:text-red-400 text-5xl mb-4">⚠️</div>
            <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-2">Error</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
            <button
              onClick={() => navigate('/seleccion-periodo')}
              className="px-6 py-2 bg-blue-600 dark:bg-blue-500 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors"
            >
              Volver a periodos
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative">
      <div 
        className="absolute inset-0 bg-cover bg-center"
        style={{ 
          backgroundImage: 'url(https://rsttvtsckdgjyobrqtlx.supabase.co/storage/v1/object/public/Contaapi/fondoLogin.jpg)',
          filter: 'blur(3px)'
        }}
      />
      {/* Overlay CON DARK MODE */}
      <div className="absolute inset-0 bg-black/60 dark:bg-black/80" />
      
      {/* Contenido CON DARK MODE */}
      <div className="relative z-10 bg-white dark:bg-gray-800 p-8 rounded-lg shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        <div className="mb-6">
          <button
            onClick={() => navigate('/seleccion-periodo')}
            className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 mb-4 flex items-center gap-2 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Cambiar periodo
          </button>
          
          <div className="text-center">
            <img 
              src="https://rsttvtsckdgjyobrqtlx.supabase.co/storage/v1/object/public/Contaapi/logo.jpg" 
              alt="ContaAPI Logo" 
              className="w-12 h-12 mx-auto mb-3 rounded-xl shadow-lg object-contain"
            />
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Selección de Empresa</h2>
            <div className="mt-2 inline-block px-4 py-2 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 rounded-full">
              <span className="font-semibold">Periodo: {periodoSeleccionado?.anio}</span>
            </div>
          </div>
        </div>

        {/* Buscador CON DARK MODE */}
        {empresas.length > 0 && (
          <div className="mb-4">
            <div className="relative">
              <svg 
                className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500"
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Buscar empresa por nombre, RUC o rol..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-lg focus:border-blue-500 dark:focus:border-blue-400 focus:outline-none transition-colors bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
              />
              {busqueda && (
                <button
                  onClick={() => setBusqueda('')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
            {busqueda && (
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                {empresasFiltradas.length} {empresasFiltradas.length === 1 ? 'empresa encontrada' : 'empresas encontradas'}
              </p>
            )}
          </div>
        )}
        
        {/* Lista de empresas con scroll CON DARK MODE */}
        <div className="flex-1 overflow-y-auto space-y-3 pr-2">
          {empresasFiltradas.length === 0 ? (
            <div className="text-center py-8">
              {empresas.length === 0 ? (
                <>
                  <p className="text-gray-500 dark:text-gray-400 mb-4">No tienes empresas asignadas en este periodo</p>
                  <button
                    onClick={() => navigate('/seleccion-periodo')}
                    className="text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    Seleccionar otro periodo
                  </button>
                </>
              ) : (
                <p className="text-gray-500 dark:text-gray-400">No se encontraron empresas con "{busqueda}"</p>
              )}
            </div>
          ) : (
            empresasFiltradas.map((empresa) => (
              <button
                key={empresa.id}
                onClick={() => seleccionarEmpresa(empresa)}
                className="w-full p-4 text-left border-2 border-gray-200 dark:border-gray-600 rounded-lg hover:border-blue-500 dark:hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all duration-200 group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="font-bold text-lg text-gray-800 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {empresa.nombre}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      RUC: {empresa.ruc}
                    </div>
                    <div className="mt-2">
                      <span className="inline-block px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs rounded-full">
                        {empresa.rol}
                      </span>
                    </div>
                  </div>
                  <svg 
                    className="w-6 h-6 text-gray-400 dark:text-gray-500 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors flex-shrink-0" 
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