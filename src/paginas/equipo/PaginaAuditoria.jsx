import { useState, useEffect } from 'react'
import { Activity, Search, Filter, Download, Calendar, User, FileText } from 'lucide-react'
import { Link } from 'react-router-dom'
import { supabase } from '../../configuracion/supabase'

export function PaginaAuditoria({ empresaId }) {
  const [logs, setLogs] = useState([])
  const [cargando, setCargando] = useState(true)
  const [filtros, setFiltros] = useState({
    usuario: 'todos',
    modulo: 'todos',
    busqueda: '',
    fechaInicio: '',
    fechaFin: ''
  })

  useEffect(() => {
    if (empresaId) {
      cargarLogs()
    }
  }, [empresaId, filtros])

  const cargarLogs = async () => {
    try {
      setCargando(true)
      
      let query = supabase
        .from('vista_actividad_reciente')
        .select('*')
        .eq('empresa_id', empresaId)
        .order('created_at', { ascending: false })
        .limit(100)

      // Aplicar filtros
      if (filtros.usuario !== 'todos') {
        query = query.eq('user_id', filtros.usuario)
      }
      
      if (filtros.modulo !== 'todos') {
        query = query.eq('modulo', filtros.modulo)
      }

      if (filtros.busqueda) {
        query = query.or(`descripcion.ilike.%${filtros.busqueda}%,accion.ilike.%${filtros.busqueda}%`)
      }

      if (filtros.fechaInicio) {
        query = query.gte('created_at', filtros.fechaInicio)
      }

      if (filtros.fechaFin) {
        query = query.lte('created_at', filtros.fechaFin)
      }

      const { data, error } = await query

      if (error) throw error
      setLogs(data || [])
    } catch (error) {
      console.error('Error al cargar logs:', error)
    } finally {
      setCargando(false)
    }
  }

  const exportarLogs = () => {
    const csv = [
      ['Fecha', 'Usuario', 'Módulo', 'Acción', 'Descripción'].join(','),
      ...logs.map(log => [
        new Date(log.created_at).toLocaleString('es-PY'),
        log.nombre_completo || log.email,
        log.modulo,
        log.accion,
        log.descripcion
      ].join(','))
    ].join('\n')

    const blob = new Blob([csv], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `auditoria-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
  }

  const iconoPorModulo = {
    equipo: User,
    contabilidad: FileText,
    ventas: FileText,
    compras: FileText,
    bancos: FileText,
    autenticacion: Activity
  }

  const colorPorModulo = {
    equipo: 'bg-purple-100 text-purple-700',
    contabilidad: 'bg-blue-100 text-blue-700',
    ventas: 'bg-green-100 text-green-700',
    compras: 'bg-orange-100 text-orange-700',
    bancos: 'bg-cyan-100 text-cyan-700',
    autenticacion: 'bg-gray-100 text-gray-700'
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Link 
            to="/equipo"
            className="text-sm text-blue-600 hover:text-blue-700 mb-2 inline-block"
          >
            ← Volver a Equipo
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Registro de Auditoría</h1>
          <p className="text-gray-600 mt-1">Historial completo de actividades</p>
        </div>

        <button
          onClick={exportarLogs}
          className="flex items-center gap-2 bg-white border border-gray-300 text-gray-700 px-4 py-2.5 rounded-xl hover:bg-gray-50 transition-all"
        >
          <Download className="w-5 h-5" />
          Exportar CSV
        </button>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Búsqueda */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Buscar
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={filtros.busqueda}
                onChange={(e) => setFiltros({ ...filtros, busqueda: e.target.value })}
                placeholder="Buscar en actividad..."
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Módulo */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Módulo
            </label>
            <select
              value={filtros.modulo}
              onChange={(e) => setFiltros({ ...filtros, modulo: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="todos">Todos</option>
              <option value="equipo">Equipo</option>
              <option value="contabilidad">Contabilidad</option>
              <option value="ventas">Ventas</option>
              <option value="compras">Compras</option>
              <option value="bancos">Bancos</option>
            </select>
          </div>

          {/* Fecha */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Fecha Inicio
            </label>
            <input
              type="date"
              value={filtros.fechaInicio}
              onChange={(e) => setFiltros({ ...filtros, fechaInicio: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Tabla de logs */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {cargando ? (
          <div className="flex items-center justify-center p-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-gray-600">Cargando actividad...</span>
          </div>
        ) : logs.length === 0 ? (
          <div className="text-center py-12">
            <Activity className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600">No hay actividad registrada</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fecha y Hora
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Usuario
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Módulo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acción
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Descripción
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {logs.map((log) => {
                  const Icono = iconoPorModulo[log.modulo] || Activity
                  return (
                    <tr key={log.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(log.created_at).toLocaleString('es-PY')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {log.nombre_completo || 'Usuario'}
                        </div>
                        <div className="text-sm text-gray-500">{log.email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${colorPorModulo[log.modulo] || 'bg-gray-100 text-gray-700'}`}>
                          <Icono className="w-3.5 h-3.5" />
                          {log.modulo}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {log.accion.replace('_', ' ')}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700">
                        {log.descripcion}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {logs.length > 0 && (
        <div className="text-sm text-gray-500 text-center">
          Mostrando {logs.length} registros
        </div>
      )}
    </div>
  )
}