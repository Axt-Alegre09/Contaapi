/**
 * Lista de Empresas - ContaAPI v2
 * MOBILE-FIRST OPTIMIZADO - Experiencia nativa móvil
 */

import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { 
  Building2, 
  Plus, 
  Search, 
  RefreshCw, 
  Eye,
  Edit2,
  Trash2,
  ChevronRight,
  TrendingUp,
  Users,
  Briefcase
} from 'lucide-react'
import { empresasServicio } from '../../servicios/empresasServicio'
import { useNotificacion } from '../../componentes/Notificacion'
import { ModalConfirmacion } from '../../componentes/ModalConfirmacion'
import { supabase } from '../../configuracion/supabase'

export default function ListaEmpresas() {
  const [empresas, setEmpresas] = useState([])
  const [estadisticas, setEstadisticas] = useState({})
  const [loading, setLoading] = useState(true)
  const [busqueda, setBusqueda] = useState('')
  const [filtroRol, setFiltroRol] = useState('todas')
  
  // Modal de eliminar
  const [modalEliminar, setModalEliminar] = useState(false)
  const [empresaAEliminar, setEmpresaAEliminar] = useState(null)
  
  // Notificaciones
  const { success, error, warning, NotificacionContainer } = useNotificacion()

  useEffect(() => {
    cargarDatos()
  }, [])

  const cargarDatos = async () => {
    setLoading(true)
    try {
      const [empresasData, statsData] = await Promise.all([
        empresasServicio.obtenerEmpresas(),
        empresasServicio.obtenerEstadisticas()
      ])
      setEmpresas(empresasData)
      setEstadisticas(statsData)
    } catch (err) {
      error('Error al cargar empresas')
      console.error('Error:', err)
    } finally {
      setLoading(false)
    }
  }

  // Filtrar empresas
  const empresasFiltradas = empresas.filter(empresa => {
    const textoBusqueda = busqueda.toLowerCase().trim()
    
    const coincideBusqueda = !textoBusqueda || 
      empresa.nombre_comercial?.toLowerCase().includes(textoBusqueda) ||
      empresa.ruc?.includes(textoBusqueda) ||
      empresa.razon_social?.toLowerCase().includes(textoBusqueda)

    const coincideRol = filtroRol === 'todas' || empresa.rol === filtroRol

    return coincideBusqueda && coincideRol
  })

  const abrirModalEliminar = (empresa) => {
    if (empresa.rol !== 'propietario' && empresa.rol !== 'administrador') {
      warning('Solo el propietario o administrador puede eliminar empresas')
      return
    }

    setEmpresaAEliminar(empresa)
    setModalEliminar(true)
  }

  const confirmarEliminar = async (password) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      const { error: errorAuth } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: password
      })

      if (errorAuth) {
        error('Contraseña incorrecta')
        throw new Error('Contraseña incorrecta')
      }

      await empresasServicio.eliminarEmpresa(empresaAEliminar.id)
      
      setModalEliminar(false)
      setEmpresaAEliminar(null)
      
      success('Empresa eliminada exitosamente')
      
      await cargarDatos()
    } catch (err) {
      console.error('Error en confirmarEliminar:', err)
      if (err.message !== 'Contraseña incorrecta') {
        error('Error al eliminar la empresa')
      }
      throw err
    }
  }

  const formatearFecha = (fecha) => {
    if (!fecha) return 'N/A'
    return new Date(fecha).toLocaleDateString('es-PY', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    })
  }

  return (
    <>
      <NotificacionContainer />
      
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        {/* Header fijo superior - MOBILE OPTIMIZED */}
        <div className="sticky top-0 z-10 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-3 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-md">
                <Building2 className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-900 dark:text-white">Mis Empresas</h1>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {empresas.length} {empresas.length === 1 ? 'empresa' : 'empresas'}
                </p>
              </div>
            </div>
            
            <button
              onClick={cargarDatos}
              disabled={loading}
              className="p-2.5 bg-gray-100 dark:bg-gray-700 rounded-lg active:scale-95 transition-transform"
            >
              <RefreshCw className={`w-5 h-5 text-gray-600 dark:text-gray-300 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>

          {/* Barra de búsqueda */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="Buscar empresa..."
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 text-base"
            />
          </div>
        </div>

        {/* Contenido scrolleable */}
        <div className="p-4 space-y-4 pb-24">
          {/* Estadísticas compactas - Solo números clave */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-4 shadow-lg">
              <div className="flex items-center gap-2 mb-2">
                <Building2 className="w-5 h-5 text-white/80" />
              </div>
              <p className="text-2xl font-bold text-white">{estadisticas.total || 0}</p>
              <p className="text-xs text-white/80 font-medium">Total</p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-lg border border-purple-200 dark:border-purple-900/30">
              <div className="flex items-center gap-2 mb-2">
                <Briefcase className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{estadisticas.propietario || 0}</p>
              <p className="text-xs text-gray-600 dark:text-gray-400 font-medium">Propias</p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-lg border border-green-200 dark:border-green-900/30">
              <div className="flex items-center gap-2 mb-2">
                <Users className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{estadisticas.administrador || 0}</p>
              <p className="text-xs text-gray-600 dark:text-gray-400 font-medium">Admin</p>
            </div>
          </div>

          {/* Filtro de rol - Pills horizontales */}
          <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
            {['todas', 'propietario', 'administrador', 'contador'].map(rol => (
              <button
                key={rol}
                onClick={() => setFiltroRol(rol)}
                className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  filtroRol === rol
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border border-gray-300 dark:border-gray-600'
                }`}
              >
                {rol === 'todas' ? 'Todas' : rol.charAt(0).toUpperCase() + rol.slice(1)}
              </button>
            ))}
          </div>

          {/* Lista de empresas */}
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <RefreshCw className="w-12 h-12 text-blue-500 animate-spin mb-4" />
              <p className="text-gray-600 dark:text-gray-400">Cargando empresas...</p>
            </div>
          ) : empresasFiltradas.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 px-4">
              <div className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
                <Building2 className="w-10 h-10 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                {busqueda || filtroRol !== 'todas'
                  ? 'No se encontraron empresas'
                  : 'No tienes empresas'}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 text-center mb-6">
                {busqueda || filtroRol !== 'todas'
                  ? 'Intenta con otros filtros'
                  : 'Crea tu primera empresa para comenzar'}
              </p>
              {!busqueda && filtroRol === 'todas' && (
                <Link
                  to="/empresas/nueva"
                  className="px-6 py-3 bg-blue-600 text-white rounded-xl font-medium shadow-lg active:scale-95 transition-transform"
                >
                  Crear primera empresa
                </Link>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {empresasFiltradas.map((empresa) => (
                <div 
                  key={empresa.id} 
                  className="bg-white dark:bg-gray-800 rounded-2xl shadow-md border border-gray-200 dark:border-gray-700 overflow-hidden active:scale-[0.98] transition-transform"
                >
                  {/* Toque para ver detalles */}
                  <Link to={`/empresas/${empresa.id}`}>
                    <div className="p-4">
                      {/* Header de la empresa */}
                      <div className="flex items-start gap-3 mb-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-md flex-shrink-0">
                          {empresa.nombre_comercial?.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-base font-semibold text-gray-900 dark:text-white truncate">
                            {empresa.nombre_comercial}
                          </h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                            {empresa.razon_social}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-500 font-mono mt-1">
                            {empresa.ruc}
                          </p>
                        </div>
                        <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0 mt-2" />
                      </div>

                      {/* Badge del rol */}
                      <div className="flex items-center justify-between">
                        <span className={`inline-flex px-3 py-1 text-xs font-medium rounded-full ${
                          empresa.rol === 'propietario' 
                            ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400'
                            : empresa.rol === 'administrador'
                            ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                            : 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'
                        }`}>
                          {empresa.rol === 'propietario' ? '👑 Propietario' : 
                           empresa.rol === 'administrador' ? '⚙️ Administrador' : 
                           '📊 Contador'}
                        </span>
                        
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {formatearFecha(empresa.created_at)}
                        </span>
                      </div>
                    </div>
                  </Link>

                  {/* Acciones rápidas */}
                  <div className="border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 px-4 py-3 flex items-center gap-2">
                    <Link
                      to={`/empresas/${empresa.id}/editar`}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-green-600 text-white rounded-xl font-medium shadow-sm active:scale-95 transition-transform"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Edit2 className="w-4 h-4" />
                      <span>Editar</span>
                    </Link>
                    
                    {(empresa.rol === 'propietario' || empresa.rol === 'administrador') && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          abrirModalEliminar(empresa)
                        }}
                        className="px-4 py-2.5 bg-red-600 text-white rounded-xl shadow-sm active:scale-95 transition-transform"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Botón flotante para nueva empresa - BOTTOM RIGHT */}
        <Link
          to="/empresas/nueva"
          className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-full shadow-2xl flex items-center justify-center active:scale-90 transition-transform z-50"
        >
          <Plus className="w-6 h-6" />
        </Link>
      </div>

      {/* Modal de Confirmación de Eliminación */}
      <ModalConfirmacion
        isOpen={modalEliminar}
        onClose={() => {
          setModalEliminar(false)
          setEmpresaAEliminar(null)
        }}
        onConfirmar={confirmarEliminar}
        titulo="Eliminar Empresa"
        mensaje={`¿Estás seguro de que deseas eliminar "${empresaAEliminar?.nombre_comercial}"? Esta acción no se puede deshacer.`}
        requierePassword={true}
        tipo="danger"
      />

      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </>
  )
}