import { useState, useEffect } from 'react'
import { TrendingUp, Users, Clock, Activity, Award, Zap, ChevronRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { supabase } from '../../configuracion/supabase'

export function PaginaMetricas({ empresaId }) {
  const [metricas, setMetricas] = useState([])
  const [usuariosActivos, setUsuariosActivos] = useState([])
  const [cargando, setCargando] = useState(true)
  const [periodo, setPeriodo] = useState('30') // días

  useEffect(() => {
    if (empresaId) {
      cargarDatos()
    }
  }, [empresaId, periodo])

  const cargarDatos = async () => {
    try {
      setCargando(true)
      
      // Cargar métricas de productividad
      const { data: metricsData, error: metricsError } = await supabase
        .from('vista_productividad_usuarios')
        .select('*')
        .eq('empresa_id', empresaId)

      if (metricsError) throw metricsError
      setMetricas(metricsData || [])

      // Cargar usuarios activos ahora
      const { data: activeData, error: activeError } = await supabase
        .rpc('usuarios_activos_ahora', { p_empresa_id: empresaId })

      if (activeError) throw activeError
      setUsuariosActivos(activeData || [])
      
    } catch (error) {
      console.error('Error al cargar métricas:', error)
    } finally {
      setCargando(false)
    }
  }

  // Top 3 usuarios más productivos
  const topUsuarios = [...metricas]
    .sort((a, b) => b.total_asientos - a.total_asientos)
    .slice(0, 3)

  // Calcular totales
  const totales = metricas.reduce((acc, m) => ({
    asientos: acc.asientos + (m.total_asientos || 0),
    compras: acc.compras + (m.total_compras || 0),
    ventas: acc.ventas + (m.total_ventas || 0),
    horas: acc.horas + (m.horas_activas || 0)
  }), { asientos: 0, compras: 0, ventas: 0, horas: 0 })

  if (cargando) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">Cargando métricas...</span>
      </div>
    )
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
          <h1 className="text-3xl font-bold text-gray-900">Métricas de Productividad</h1>
          <p className="text-gray-600 mt-1">Análisis de actividad y rendimiento del equipo</p>
        </div>

        <select
          value={periodo}
          onChange={(e) => setPeriodo(e.target.value)}
          className="px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="7">Últimos 7 días</option>
          <option value="30">Últimos 30 días</option>
          <option value="90">Últimos 90 días</option>
        </select>
      </div>

      {/* Usuarios Activos Ahora */}
      <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border-2 border-green-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-green-500 rounded-xl">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">Usuarios Activos Ahora</h3>
              <p className="text-sm text-gray-600">
                {usuariosActivos.length} {usuariosActivos.length === 1 ? 'usuario conectado' : 'usuarios conectados'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm font-medium text-green-700">EN VIVO</span>
          </div>
        </div>

        {usuariosActivos.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {usuariosActivos.map((usuario) => (
              <div key={usuario.user_id} className="bg-white rounded-lg p-4 border border-green-200">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center text-white font-bold">
                    {(usuario.nombre_completo || usuario.email)?.[0]?.toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 truncate">
                      {usuario.nombre_completo || 'Usuario'}
                    </p>
                    <p className="text-xs text-gray-500">
                      Activo hace {usuario.minutos_inactivo < 1 ? 'menos de 1' : usuario.minutos_inactivo} min
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            No hay usuarios activos en este momento
          </div>
        )}
      </div>

      {/* Estadísticas Generales */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Activity className="w-5 h-5 text-blue-600" />
            </div>
            <span className="text-sm font-medium text-gray-600">Total Asientos</span>
          </div>
          <p className="text-3xl font-bold text-gray-900">{totales.asientos}</p>
          <p className="text-xs text-gray-500 mt-1">Últimos {periodo} días</p>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <TrendingUp className="w-5 h-5 text-green-600" />
            </div>
            <span className="text-sm font-medium text-gray-600">Compras</span>
          </div>
          <p className="text-3xl font-bold text-gray-900">{totales.compras}</p>
          <p className="text-xs text-gray-500 mt-1">Registradas</p>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="p-2 bg-purple-100 rounded-lg">
            <TrendingUp className="w-5 h-5 text-purple-600" />
          </div>
          <span className="text-sm font-medium text-gray-600">Ventas</span>
          <p className="text-3xl font-bold text-gray-900">{totales.ventas}</p>
          <p className="text-xs text-gray-500 mt-1">Registradas</p>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-orange-100 rounded-lg">
              <Clock className="w-5 h-5 text-orange-600" />
            </div>
            <span className="text-sm font-medium text-gray-600">Horas Totales</span>
          </div>
          <p className="text-3xl font-bold text-gray-900">{totales.horas.toFixed(1)}</p>
          <p className="text-xs text-gray-500 mt-1">Tiempo activo</p>
        </div>
      </div>

      {/* Top 3 Usuarios */}
      {topUsuarios.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-6">
            <Award className="w-6 h-6 text-yellow-500" />
            <h3 className="text-xl font-bold text-gray-900">Top 3 Usuarios Más Productivos</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {topUsuarios.map((usuario, index) => (
              <div 
                key={usuario.user_id}
                className={`p-6 rounded-xl border-2 ${
                  index === 0 ? 'bg-gradient-to-br from-yellow-50 to-amber-50 border-yellow-300' :
                  index === 1 ? 'bg-gradient-to-br from-gray-50 to-slate-50 border-gray-300' :
                  'bg-gradient-to-br from-orange-50 to-amber-50 border-orange-300'
                }`}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-xl">
                    {(usuario.nombre_completo || usuario.email)?.[0]?.toUpperCase()}
                  </div>
                  <div className={`text-4xl font-bold ${
                    index === 0 ? 'text-yellow-500' :
                    index === 1 ? 'text-gray-400' :
                    'text-orange-400'
                  }`}>
                    #{index + 1}
                  </div>
                </div>
                <h4 className="font-bold text-gray-900 mb-1">
                  {usuario.nombre_completo || 'Usuario'}
                </h4>
                <p className="text-sm text-gray-600 mb-4">{usuario.rol}</p>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Asientos:</span>
                    <span className="font-bold text-gray-900">{usuario.total_asientos}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Horas activas:</span>
                    <span className="font-bold text-gray-900">{usuario.horas_activas}h</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Promedio/día:</span>
                    <span className="font-bold text-gray-900">{usuario.promedio_operaciones_dia}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tabla de Todos los Usuarios */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-xl font-bold text-gray-900">Detalle por Usuario</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Usuario</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rol</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Asientos</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Compras</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Ventas</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Horas</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Días Activos</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Promedio/Día</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {metricas.map((usuario) => (
                <tr key={usuario.user_id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm">
                        {(usuario.nombre_completo || usuario.email)?.[0]?.toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{usuario.nombre_completo || 'Usuario'}</p>
                        <p className="text-xs text-gray-500">{usuario.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600 capitalize">{usuario.rol}</td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900 text-right">{usuario.total_asientos}</td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900 text-right">{usuario.total_compras}</td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900 text-right">{usuario.total_ventas}</td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900 text-right">{usuario.horas_activas}h</td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900 text-right">{usuario.dias_activos_ultimo_mes}</td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900 text-right">{usuario.promedio_operaciones_dia}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}