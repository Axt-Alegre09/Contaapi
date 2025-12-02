import { useState, useEffect } from 'react'
import { TrendingUp, Users, Activity, Calendar, BarChart3 } from 'lucide-react'
import { Link } from 'react-router-dom'
import { supabase } from '../../configuracion/supabase'

export default function PaginaMetricas({ empresaId }) {
  const [metricas, setMetricas] = useState({
    usuariosActivos: 0,
    actividadTotal: 0,
    actividadHoy: 0,
    actividadSemana: 0
  })
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    if (empresaId) {
      cargarMetricas()
    }
  }, [empresaId])

  const cargarMetricas = async () => {
    try {
      setCargando(true)

      // Usuarios activos
      const { count: usuariosActivos } = await supabase
        .from('usuarios_empresas')
        .select('*', { count: 'exact', head: true })
        .eq('empresa_id', empresaId)
        .eq('estado', 'activo')
        .is('deleted_at', null)

      // Actividad total
      const { count: actividadTotal } = await supabase
        .from('auditoria_logs')
        .select('*', { count: 'exact', head: true })
        .eq('empresa_id', empresaId)

      // Actividad hoy
      const hoy = new Date()
      hoy.setHours(0, 0, 0, 0)
      const { count: actividadHoy } = await supabase
        .from('auditoria_logs')
        .select('*', { count: 'exact', head: true })
        .eq('empresa_id', empresaId)
        .gte('created_at', hoy.toISOString())

      // Actividad última semana
      const semanaAtras = new Date()
      semanaAtras.setDate(semanaAtras.getDate() - 7)
      const { count: actividadSemana } = await supabase
        .from('auditoria_logs')
        .select('*', { count: 'exact', head: true })
        .eq('empresa_id', empresaId)
        .gte('created_at', semanaAtras.toISOString())

      setMetricas({
        usuariosActivos: usuariosActivos || 0,
        actividadTotal: actividadTotal || 0,
        actividadHoy: actividadHoy || 0,
        actividadSemana: actividadSemana || 0
      })

    } catch (error) {
      console.error('Error al cargar métricas:', error)
    } finally {
      setCargando(false)
    }
  }

  const tarjetas = [
    {
      titulo: 'Usuarios Activos',
      valor: metricas.usuariosActivos,
      icono: Users,
      color: 'blue',
      descripcion: 'Usuarios con estado activo'
    },
    {
      titulo: 'Actividad Total',
      valor: metricas.actividadTotal,
      icono: Activity,
      color: 'purple',
      descripcion: 'Acciones registradas totales'
    },
    {
      titulo: 'Actividad Hoy',
      valor: metricas.actividadHoy,
      icono: TrendingUp,
      color: 'green',
      descripcion: 'Acciones realizadas hoy'
    },
    {
      titulo: 'Actividad (7 días)',
      valor: metricas.actividadSemana,
      icono: Calendar,
      color: 'orange',
      descripcion: 'Acciones últimos 7 días'
    }
  ]

  const colores = {
    blue: {
      bg: 'bg-blue-50',
      icon: 'text-blue-600',
      border: 'border-blue-200'
    },
    purple: {
      bg: 'bg-purple-50',
      icon: 'text-purple-600',
      border: 'border-purple-200'
    },
    green: {
      bg: 'bg-green-50',
      icon: 'text-green-600',
      border: 'border-green-200'
    },
    orange: {
      bg: 'bg-orange-50',
      icon: 'text-orange-600',
      border: 'border-orange-200'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <Link 
          to="/equipo"
          className="text-sm text-blue-600 hover:text-blue-700 mb-2 inline-block"
        >
          ← Volver a Equipo
        </Link>
        <h1 className="text-3xl font-bold text-gray-900">Métricas y Productividad</h1>
        <p className="text-gray-600 mt-1">Estadísticas del equipo de trabajo</p>
      </div>

      {/* Tarjetas de métricas */}
      {cargando ? (
        <div className="flex items-center justify-center p-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600">Cargando métricas...</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {tarjetas.map((tarjeta) => {
            const Icono = tarjeta.icono
            const color = colores[tarjeta.color]
            
            return (
              <div
                key={tarjeta.titulo}
                className={`bg-white rounded-xl border-2 ${color.border} p-6 hover:shadow-lg transition-shadow`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className={`p-3 rounded-lg ${color.bg}`}>
                    <Icono className={`w-6 h-6 ${color.icon}`} />
                  </div>
                </div>
                <h3 className="text-sm font-medium text-gray-600 mb-1">
                  {tarjeta.titulo}
                </h3>
                <p className="text-3xl font-bold text-gray-900 mb-2">
                  {tarjeta.valor.toLocaleString('es-PY')}
                </p>
                <p className="text-xs text-gray-500">
                  {tarjeta.descripcion}
                </p>
              </div>
            )
          })}
        </div>
      )}

      {/* Información adicional */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-blue-100 rounded-lg">
            <BarChart3 className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900">Resumen de Actividad</h2>
            <p className="text-sm text-gray-600">Análisis del sistema de auditoría</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <p className="text-sm font-medium text-gray-900">Promedio diario</p>
              <p className="text-xs text-gray-600">Actividades por día</p>
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {metricas.actividadSemana > 0 
                ? Math.round(metricas.actividadSemana / 7).toLocaleString('es-PY')
                : '0'
              }
            </p>
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <p className="text-sm font-medium text-gray-900">Actividad por usuario</p>
              <p className="text-xs text-gray-600">Promedio de acciones</p>
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {metricas.usuariosActivos > 0 
                ? Math.round(metricas.actividadTotal / metricas.usuariosActivos).toLocaleString('es-PY')
                : '0'
              }
            </p>
          </div>

          <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div>
              <p className="text-sm font-medium text-blue-900">Sistema de auditoría</p>
              <p className="text-xs text-blue-700">Registros automáticos activos</p>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium text-green-700">Activo</span>
            </div>
          </div>
        </div>
      </div>

      {/* Nota informativa */}
      <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
        <div className="flex items-start gap-3">
          <Activity className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-blue-900">
              Sistema de auditoría automático
            </p>
            <p className="text-sm text-blue-700 mt-1">
              Todas las acciones de creación, modificación y eliminación se registran automáticamente 
              con información del usuario, IP, fecha/hora y detalles completos de los cambios realizados.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}