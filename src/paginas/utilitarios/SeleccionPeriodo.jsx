// src/paginas/utilitarios/SeleccionPeriodo.jsx
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '@/configuracion/supabase'

export function SeleccionPeriodo() {
  const [periodos, setPeriodos] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    cargarPeriodos()
  }, [])

  const cargarPeriodos = async () => {
    try {
      setLoading(true)
      setError(null)

      const { data, error } = await supabase
        .from('periodos_fiscales')
        .select('*')
        .order('anio', { ascending: false })

      if (error) throw error

      setPeriodos(data || [])
    } catch (error) {
      console.error('Error cargando periodos:', error)
      setError('Error al cargar los periodos disponibles')
    } finally {
      setLoading(false)
    }
  }

  const seleccionarPeriodo = (periodo) => {
    navigate('/seleccion-empresa', { 
      state: { periodo }
    })
  }

  const cerrarSesion = async () => {
    try {
      await supabase.auth.signOut()
      navigate('/login')
    } catch (error) {
      console.error('Error al cerrar sesión:', error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center relative">
        {/* Fondo con imagen */}
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ 
            backgroundImage: 'url(https://rsttvtsckdgjyobrqtlx.supabase.co/storage/v1/object/public/Contaapi/fondoLogin.jpg)',
            filter: 'blur(3px)'
          }}
        />
        {/* Overlay oscuro CON DARK MODE */}
        <div className="absolute inset-0 bg-black/60 dark:bg-black/80" />
        
        {/* Contenido CON DARK MODE */}
        <div className="relative z-10 bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg">
          <div className="flex items-center gap-3">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 dark:border-blue-400"></div>
            <span className="text-gray-700 dark:text-gray-300">Cargando periodos...</span>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center relative">
        {/* Fondo con imagen */}
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ 
            backgroundImage: 'url(https://rsttvtsckdgjyobrqtlx.supabase.co/storage/v1/object/public/Contaapi/fondoLogin.jpg)',
            filter: 'blur(3px)'
          }}
        />
        {/* Overlay oscuro CON DARK MODE */}
        <div className="absolute inset-0 bg-black/60 dark:bg-black/80" />
        
        {/* Contenido CON DARK MODE */}
        <div className="relative z-10 bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg max-w-md">
          <div className="text-center">
            <div className="text-red-600 dark:text-red-400 text-5xl mb-4">⚠️</div>
            <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-2">Error</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
            <button
              onClick={cargarPeriodos}
              className="px-6 py-2 bg-blue-600 dark:bg-blue-500 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors"
            >
              Reintentar
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative">
      {/* Fondo con imagen */}
      <div 
        className="absolute inset-0 bg-cover bg-center"
        style={{ 
          backgroundImage: 'url(https://rsttvtsckdgjyobrqtlx.supabase.co/storage/v1/object/public/Contaapi/fondoLogin.jpg)',
          filter: 'blur(3px)'
        }}
      />
      {/* Overlay oscuro CON DARK MODE */}
      <div className="absolute inset-0 bg-black/60 dark:bg-black/80" />
      
      {/* Contenido CON DARK MODE */}
      <div className="relative z-10 bg-white dark:bg-gray-800 p-8 rounded-lg shadow-2xl w-full max-w-md">
        
        {/* Botón cerrar sesión CON DARK MODE */}
        <button
          onClick={cerrarSesion}
          className="absolute top-4 right-4 p-2 text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
          title="Cerrar sesión"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
        </button>

        <div className="text-center mb-6">
          <img 
            src="https://rsttvtsckdgjyobrqtlx.supabase.co/storage/v1/object/public/Contaapi/logo.jpg" 
            alt="ContaAPI Logo" 
            className="w-16 h-16 mx-auto mb-4 rounded-xl shadow-lg object-contain"
          />
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">ContaAPI</h1>
          <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-200">Selección de Periodo</h2>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-2">
            Selecciona el ejercicio fiscal con el que deseas trabajar
          </p>
        </div>
        
        <div className="space-y-3">
          {periodos.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500 dark:text-gray-400">No hay periodos disponibles</p>
            </div>
          ) : (
            periodos.map((periodo) => (
              <button
                key={periodo.id}
                onClick={() => seleccionarPeriodo(periodo)}
                className="w-full p-4 text-left border-2 border-gray-200 dark:border-gray-600 rounded-lg hover:border-blue-500 dark:hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all duration-200 group"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-bold text-lg text-gray-800 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      EJERCICIO FISCAL {periodo.anio}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      {new Date(periodo.fecha_desde).toLocaleDateString('es-PY')} - {new Date(periodo.fecha_hasta).toLocaleDateString('es-PY')}
                    </div>
                  </div>
                  <svg 
                    className="w-6 h-6 text-gray-400 dark:text-gray-500 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors" 
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