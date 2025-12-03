/**
 * Lista de Empresas - ContaAPI v2
 * Vista principal con cards de estadísticas y tabla de empresas
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

export default function ListaEmpresas() {
  const [empresas, setEmpresas] = useState([])
  const [estadisticas, setEstadisticas] = useState({})
  const [loading, setLoading] = useState(true)
  const [busqueda, setBusqueda] = useState('')
  const [filtroRol, setFiltroRol] = useState('todas')

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
    } catch (error) {
      console.error('Error:', error)
      alert('Error al cargar empresas')
    } finally {
      setLoading(false)
    }
  }

  // Filtrar empresas
  const empresasFiltradas = empresas.filter(empresa => {
    const coincideBusqueda = 
      empresa.nombre_comercial?.toLowerCase().includes(busqueda.toLowerCase()) ||
      empresa.ruc?.includes(busqueda) ||
      empresa.razon_social?.toLowerCase().includes(busqueda.toLowerCase())

    const coincideRol = filtroRol === 'todas' || empresa.rol === filtroRol

    return coincideBusqueda && coincideRol
  })

  const formatearFecha = (fecha) => {
    if (!fecha) return 'N/A'
    return new Date(fecha).toLocaleDateString('es-PY', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
              <Building2 className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Mis Empresas</h1>
              <p className="text-gray-600 dark:text-gray-400">Gestiona tus empresas y periodos fiscales</p>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={cargarDatos}
              disabled={loading}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2 disabled:opacity-50 transition-colors"
            >
              <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
              Actualizar
            </button>
            <Link
              to="/empresas/nueva"
              className="px-6 py-2 bg-blue-600 dark:bg-blue-500 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 flex items-center gap-2 transition-colors"
            >
              <Plus className="w-5 h-5" />
              Nueva Empresa
            </Link>
          </div>
        </div>
      </div>

      {/* Cards de Estadísticas - Estilo Power BI */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Empresas */}
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <Building2 className="w-8 h-8 opacity-80" />
            <TrendingUp className="w-5 h-5 opacity-80" />
          </div>
          <p className="text-blue-100 text-sm font-medium mb-1">Total Empresas</p>
          <p className="text-4xl font-bold">{estadisticas.total || 0}</p>
        </div>

        {/* Por Rol - Propietario */}
        <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
              <Briefcase className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
            <span className="text-xs px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 rounded-full font-medium">
              Propietario
            </span>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Como Propietario</p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">{estadisticas.propietario || 0}</p>
        </div>

        {/* Por Rol - Administrador */}
        <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
              <Users className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
            <span className="text-xs px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full font-medium">
              Admin
            </span>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Como Administrador</p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">{estadisticas.administrador || 0}</p>
        </div>

        {/* Última Creada */}
        <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center">
              <Calendar className="w-5 h-5 text-orange-600 dark:text-orange-400" />
            </div>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Última Creada</p>
          <p className="text-lg font-bold text-gray-900 dark:text-white truncate">
            {estadisticas.ultimaCreada?.nombre_comercial || 'N/A'}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {formatearFecha(estadisticas.ultimaCreada?.created_at)}
          </p>
        </div>
      </div>

      {/* Filtros y búsqueda */}
      <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm rounded-xl shadow-lg p-4">
        <div className="grid grid-cols-2 gap-4">
          {/* Búsqueda */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
            <input
              type="text"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="Buscar por nombre, RUC o razón social..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
            />
          </div>

          {/* Filtro por rol */}
          <select
            value={filtroRol}
            onChange={(e) => setFiltroRol(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="todas">Todas las empresas</option>
            <option value="propietario">Como Propietario</option>
            <option value="administrador">Como Administrador</option>
            <option value="contador">Como Contador</option>
          </select>
        </div>
      </div>

      {/* Tabla de empresas */}
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
              className="inline-flex items-center gap-2 px-6 py-2 bg-blue-600 dark:bg-blue-500 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors"
            >
              <Plus className="w-5 h-5" />
              Crear primera empresa
            </Link>
          )}
        </div>
      ) : (
        <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm rounded-xl shadow-lg overflow-hidden">
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
                        {empresa.rol === 'propietario' && (
                          <button
                            onClick={() => alert('Función de eliminar en desarrollo')}
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
      )}
    </div>
  )
}