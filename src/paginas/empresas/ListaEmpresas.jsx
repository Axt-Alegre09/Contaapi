/**
 * Lista de Empresas - ContaAPI v2
 * Responsive Design Profesional - Mobile & Desktop
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
  Calendar,
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
  
  const [modalEliminar, setModalEliminar] = useState(false)
  const [empresaAEliminar, setEmpresaAEliminar] = useState(null)
  
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
      
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm rounded-xl shadow-lg p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                <Building2 className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Mis Empresas</h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Gestiona tus empresas y periodos fiscales
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={cargarDatos}
                disabled={loading}
                className="flex-1 sm:flex-none px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center justify-center gap-2 disabled:opacity-50 transition-colors"
              >
                <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
                <span className="hidden sm:inline">Actualizar</span>
              </button>
              <Link
                to="/empresas/nueva"
                className="flex-1 sm:flex-none px-6 py-2 bg-blue-600 dark:bg-blue-500 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 flex items-center justify-center gap-2 transition-colors font-medium"
              >
                <Plus className="w-5 h-5" />
                Nueva Empresa
              </Link>
            </div>
          </div>
        </div>

        {/* Estadísticas - Compactas y responsive */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-lg p-4 text-white">
            <div className="flex items-center justify-between mb-2">
              <Building2 className="w-5 h-5 opacity-80" />
              <TrendingUp className="w-4 h-4 opacity-80" />
            </div>
            <p className="text-blue-100 text-xs font-medium mb-1">Total Empresas</p>
            <p className="text-3xl font-bold">{estadisticas.total || 0}</p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                <Briefcase className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              </div>
              <span className="text-xs px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 rounded-full font-medium">
                Dueño
              </span>
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Como Propietario</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{estadisticas.propietario || 0}</p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                <Users className="w-4 h-4 text-green-600 dark:text-green-400" />
              </div>
              <span className="text-xs px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full font-medium">
                Admin
              </span>
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Como Administrador</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{estadisticas.administrador || 0}</p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="w-8 h-8 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center">
                <Calendar className="w-4 h-4 text-orange-600 dark:text-orange-400" />
              </div>
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Última Creada</p>
            <p className="text-sm font-bold text-gray-900 dark:text-white truncate">
              {estadisticas.ultimaCreada?.nombre_comercial || 'N/A'}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {formatearFecha(estadisticas.ultimaCreada?.created_at)}
            </p>
          </div>
        </div>

        {/* Filtros y búsqueda */}
        <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm rounded-xl shadow-lg p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                placeholder="Buscar empresa..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400"
              />
            </div>

            <select
              value={filtroRol}
              onChange={(e) => setFiltroRol(e.target.value)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="todas">Todas las empresas</option>
              <option value="propietario">Como Propietario</option>
              <option value="administrador">Como Administrador</option>
              <option value="contador">Como Contador</option>
            </select>
          </div>
        </div>

        {/* Lista de empresas */}
        {loading ? (
          <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm rounded-xl shadow-lg p-12 text-center">
            <RefreshCw className="w-12 h-12 text-gray-400 dark:text-gray-500 animate-spin mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400">Cargando empresas...</p>
          </div>
        ) : empresasFiltradas.length === 0 ? (
          <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm rounded-xl shadow-lg p-12 text-center">
            <Building2 className="w-12 h-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {busqueda || filtroRol !== 'todas'
                ? 'No se encontraron empresas con los filtros seleccionados'
                : 'No tienes empresas todavía'}
            </p>
            {!busqueda && filtroRol === 'todas' && (
              <Link
                to="/empresas/nueva"
                className="inline-flex items-center gap-2 px-6 py-2.5 bg-blue-600 dark:bg-blue-500 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors font-medium"
              >
                <Plus className="w-5 h-5" />
                Crear primera empresa
              </Link>
            )}
          </div>
        ) : (
          <>
            {/* Vista MÓVIL - Cards (< md) */}
            <div className="md:hidden space-y-3">
              {empresasFiltradas.map((empresa) => (
                <div key={empresa.id} className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700">
                  {/* Información principal */}
                  <div className="p-4">
                    <div className="flex items-start gap-3 mb-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                        {empresa.nombre_comercial?.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 dark:text-white truncate">
                          {empresa.nombre_comercial}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                          {empresa.razon_social}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-500 font-mono mt-1">
                          {empresa.ruc}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                        empresa.rol === 'propietario' 
                          ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400'
                          : empresa.rol === 'administrador'
                          ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                          : 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'
                      }`}>
                        {empresa.rol}
                      </span>
                      
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {formatearFecha(empresa.created_at)}
                      </span>
                    </div>
                  </div>

                  {/* Acciones */}
                  <div className="border-t border-gray-200 dark:border-gray-700 p-3 flex gap-2">
                    <Link
                      to={`/empresas/${empresa.id}`}
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <Eye className="w-4 h-4" />
                      <span className="text-sm font-medium">Ver</span>
                    </Link>
                    <Link
                      to={`/empresas/${empresa.id}/editar`}
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                      <Edit2 className="w-4 h-4" />
                      <span className="text-sm font-medium">Editar</span>
                    </Link>
                    {(empresa.rol === 'propietario' || empresa.rol === 'administrador') && (
                      <button
                        onClick={() => abrirModalEliminar(empresa)}
                        className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Vista DESKTOP - Tabla (≥ md) */}
            <div className="hidden md:block bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm rounded-xl shadow-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Empresa
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        RUC
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Mi Rol
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Creada
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Acciones
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {empresasFiltradas.map((empresa) => (
                      <tr key={empresa.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center text-white font-bold">
                              {empresa.nombre_comercial?.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-900 dark:text-white">
                                {empresa.nombre_comercial}
                              </p>
                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                {empresa.razon_social}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-sm text-gray-900 dark:text-white font-mono">{empresa.ruc}</p>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                            empresa.rol === 'propietario' 
                              ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400'
                              : empresa.rol === 'administrador'
                              ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                              : 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'
                          }`}>
                            {empresa.rol}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {formatearFecha(empresa.created_at)}
                          </p>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-end gap-2">
                            <Link
                              to={`/empresas/${empresa.id}`}
                              className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                              title="Ver detalles"
                            >
                              <Eye className="w-5 h-5" />
                            </Link>
                            <Link
                              to={`/empresas/${empresa.id}/editar`}
                              className="p-2 text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors"
                              title="Editar"
                            >
                              <Edit2 className="w-5 h-5" />
                            </Link>
                            {(empresa.rol === 'propietario' || empresa.rol === 'administrador') && (
                              <button
                                onClick={() => abrirModalEliminar(empresa)}
                                className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                title="Eliminar"
                              >
                                <Trash2 className="w-5 h-5" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>

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
    </>
  )
}