import { useState } from 'react'
import { Link } from 'react-router-dom'
import { 
  TrendingUp, 
  TrendingDown,
  DollarSign,
  FileText,
  ShoppingCart,
  ShoppingBag,
  AlertCircle,
  Calendar,
  ArrowRight,
  Plus
} from 'lucide-react'

export function Dashboard() {
  const estadisticas = [
    {
      titulo: 'Ventas del Mes',
      valor: '₲ 45.250.000',
      cambio: '+12.5%',
      tipo: 'incremento',
      icono: TrendingUp,
      color: 'green'
    },
    {
      titulo: 'Compras del Mes',
      valor: '₲ 28.750.000',
      cambio: '+8.2%',
      tipo: 'incremento',
      icono: ShoppingCart,
      color: 'blue'
    },
    {
      titulo: 'Saldo en Bancos',
      valor: '₲ 125.500.000',
      cambio: '-3.1%',
      tipo: 'decremento',
      icono: DollarSign,
      color: 'purple'
    },
    {
      titulo: 'Cuentas por Cobrar',
      valor: '₲ 18.200.000',
      cambio: '+5.4%',
      tipo: 'incremento',
      icono: FileText,
      color: 'orange'
    }
  ]

  const accionesRapidas = [
    { 
      titulo: 'Nuevo Asiento', 
      descripcion: 'Registrar movimiento contable',
      icono: FileText, 
      ruta: '/asientos/nuevo',
      color: 'from-blue-500 to-blue-600'
    },
    { 
      titulo: 'Registrar Compra', 
      descripcion: 'Nueva factura de compra',
      icono: ShoppingCart, 
      ruta: '/compras/nueva',
      color: 'from-green-500 to-green-600'
    },
    { 
      titulo: 'Registrar Venta', 
      descripcion: 'Nueva factura de venta',
      icono: ShoppingBag, 
      ruta: '/ventas/nueva',
      color: 'from-purple-500 to-purple-600'
    },
    { 
      titulo: 'Ver Balances', 
      descripcion: 'Informes financieros',
      icono: TrendingUp, 
      ruta: '/balances',
      color: 'from-orange-500 to-orange-600'
    }
  ]

  const actividadReciente = [
    { tipo: 'asiento', numero: '001235', descripcion: 'Pago a proveedor ABC', monto: '₲ 2.500.000', fecha: 'Hace 2 horas' },
    { tipo: 'venta', numero: 'F-001-001-0234', descripcion: 'Venta a cliente XYZ', monto: '₲ 3.750.000', fecha: 'Hace 4 horas' },
    { tipo: 'compra', numero: 'F-002-001-5678', descripcion: 'Compra de insumos', monto: '₲ 1.200.000', fecha: 'Hace 6 horas' },
    { tipo: 'asiento', numero: '001234', descripcion: 'Registro de nómina', monto: '₲ 8.500.000', fecha: 'Ayer' }
  ]

  const tareasPendientes = [
    { titulo: 'Conciliar cuenta bancaria Itaú', urgencia: 'alta', fecha: 'Vence hoy' },
    { titulo: 'Revisar facturas pendientes de noviembre', urgencia: 'media', fecha: 'Vence mañana' },
    { titulo: 'Preparar declaración IVA', urgencia: 'alta', fecha: 'Vence en 3 días' },
    { titulo: 'Actualizar depreciaciones de activos', urgencia: 'baja', fecha: 'Vence en 7 días' }
  ]

  return (
    <div className="min-h-screen">
      <div className="space-y-6">
        {/* Encabezado con fondo blanco semi-transparente */}
        <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
              <p className="text-gray-600 mt-1">Bienvenido de vuelta, aquí está tu resumen</p>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Calendar className="w-4 h-4" />
              <span>Período: Enero 2024 - Diciembre 2024</span>
            </div>
          </div>
        </div>

        {/* Estadísticas principales */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {estadisticas.map((stat, idx) => (
            <div key={idx} className="bg-white/95 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200 p-6 hover:shadow-xl transition-all">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-lg bg-${stat.color}-50`}>
                  <stat.icono className={`w-6 h-6 text-${stat.color}-600`} />
                </div>
                <div className={`flex items-center gap-1 text-sm font-medium ${
                  stat.tipo === 'incremento' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {stat.tipo === 'incremento' ? (
                    <TrendingUp className="w-4 h-4" />
                  ) : (
                    <TrendingDown className="w-4 h-4" />
                  )}
                  {stat.cambio}
                </div>
              </div>
              <h3 className="text-sm text-gray-600 mb-1">{stat.titulo}</h3>
              <p className="text-2xl font-bold text-gray-900">{stat.valor}</p>
            </div>
          ))}
        </div>

        {/* Acciones rápidas */}
        <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Acciones Rápidas</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {accionesRapidas.map((accion, idx) => (
              <Link
                key={idx}
                to={accion.ruta}
                className="group bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all hover:scale-105"
              >
                <div className={`inline-flex p-3 rounded-lg bg-gradient-to-br ${accion.color} mb-4`}>
                  <accion.icono className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-1">{accion.titulo}</h3>
                <p className="text-sm text-gray-600">{accion.descripcion}</p>
                <div className="flex items-center gap-2 mt-4 text-blue-600 font-medium text-sm group-hover:gap-3 transition-all">
                  <span>Ir</span>
                  <ArrowRight className="w-4 h-4" />
                </div>
              </Link>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Actividad reciente */}
          <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">Actividad Reciente</h2>
              <Link to="/actividad" className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                Ver todo
              </Link>
            </div>
            <div className="space-y-4">
              {actividadReciente.map((actividad, idx) => (
                <div key={idx} className="flex items-start gap-4 p-4 hover:bg-gray-50 rounded-lg transition-colors">
                  <div className={`p-2 rounded-lg ${
                    actividad.tipo === 'asiento' ? 'bg-blue-100' :
                    actividad.tipo === 'venta' ? 'bg-green-100' : 'bg-purple-100'
                  }`}>
                    {actividad.tipo === 'asiento' && <FileText className="w-5 h-5 text-blue-600" />}
                    {actividad.tipo === 'venta' && <ShoppingBag className="w-5 h-5 text-green-600" />}
                    {actividad.tipo === 'compra' && <ShoppingCart className="w-5 h-5 text-purple-600" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {actividad.descripcion}
                      </p>
                      <p className="text-sm font-semibold text-gray-900 whitespace-nowrap">
                        {actividad.monto}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <p className="text-xs text-gray-500">{actividad.numero}</p>
                      <span className="text-xs text-gray-400">•</span>
                      <p className="text-xs text-gray-500">{actividad.fecha}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Tareas pendientes */}
          <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">Tareas Pendientes</h2>
              <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <Plus className="w-5 h-5 text-gray-600" />
              </button>
            </div>
            <div className="space-y-3">
              {tareasPendientes.map((tarea, idx) => (
                <div key={idx} className="flex items-start gap-3 p-4 border border-gray-200 rounded-lg hover:border-blue-300 transition-colors cursor-pointer bg-white">
                  <input 
                    type="checkbox" 
                    className="mt-1 w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">{tarea.titulo}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                        tarea.urgencia === 'alta' ? 'bg-red-100 text-red-700' :
                        tarea.urgencia === 'media' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {tarea.urgencia === 'alta' && <AlertCircle className="w-3 h-3" />}
                        {tarea.urgencia.charAt(0).toUpperCase() + tarea.urgencia.slice(1)}
                      </span>
                      <span className="text-xs text-gray-500">{tarea.fecha}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}