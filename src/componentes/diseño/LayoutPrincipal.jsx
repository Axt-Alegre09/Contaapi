import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { 
  LayoutDashboard, 
  Building2, 
  FileText, 
  ShoppingCart, 
  ShoppingBag,
  Landmark,
  Package,
  Users,
  Settings,
  LogOut,
  ChevronDown,
  Menu,
  X,
  Search,
  Bell,
  HelpCircle
} from 'lucide-react'
import { servicioAutenticacion } from '../../servicios/autenticacion'
import { useAutenticacion } from '../../hooks/useAutenticacion'

export function LayoutPrincipal({ children }) {
  const { usuario } = useAutenticacion()
  const location = useLocation()
  const navigate = useNavigate()
  
  const [menuAbierto, setMenuAbierto] = useState(true)
  const [empresaSeleccionada, setEmpresaSeleccionada] = useState(null)
  const [mostrarSelectorEmpresa, setMostrarSelectorEmpresa] = useState(false)

  // Datos de ejemplo de empresas (luego vendrán de Supabase)
  const empresas = [
    { id: 1, nombre: 'Mi Empresa S.A.', ruc: '80012345-6' },
    { id: 2, nombre: 'Comercial ABC', ruc: '80098765-4' },
  ]

  const menuItems = [
    {
      titulo: 'Principal',
      items: [
        { nombre: 'Dashboard', icono: LayoutDashboard, ruta: '/dashboard' },
        { nombre: 'Empresas', icono: Building2, ruta: '/empresas' },
      ]
    },
    {
      titulo: 'Contabilidad',
      items: [
        { nombre: 'Plan de Cuentas', icono: FileText, ruta: '/plan-cuentas' },
        { nombre: 'Asientos Contables', icono: FileText, ruta: '/asientos' },
        { nombre: 'Libro Diario', icono: FileText, ruta: '/libro-diario' },
        { nombre: 'Libro Mayor', icono: FileText, ruta: '/libro-mayor' },
        { nombre: 'Balances', icono: FileText, ruta: '/balances' },
      ]
    },
    {
      titulo: 'Operaciones Fiscales',
      items: [
        { nombre: 'Compras', icono: ShoppingCart, ruta: '/compras' },
        { nombre: 'Ventas', icono: ShoppingBag, ruta: '/ventas' },
        { nombre: 'Libro IVA', icono: FileText, ruta: '/libro-iva' },
      ]
    },
    {
      titulo: 'Módulos',
      items: [
        { nombre: 'Bancos', icono: Landmark, ruta: '/bancos' },
        { nombre: 'Bienes de Uso', icono: Package, ruta: '/bienes-uso' },
        { nombre: 'Proveedores', icono: Users, ruta: '/proveedores' },
      ]
    }
  ]

  const estaActivo = (ruta) => location.pathname === ruta

  const cerrarSesion = async () => {
    await servicioAutenticacion.cerrarSesion()
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className={`fixed lg:static inset-y-0 left-0 z-50 transition-all duration-300 ${
        menuAbierto ? 'w-64' : 'w-20'
      } bg-white border-r border-gray-200 flex flex-col`}>
        
        {/* Logo y toggle */}
        <div className="h-16 border-b border-gray-200 flex items-center justify-between px-4">
          {menuAbierto && (
            <div className="flex items-center gap-2">
              <img 
                src="https://rsttvtsckdgjyobrqtlx.supabase.co/storage/v1/object/public/Contaapi/logo.jpg" 
                alt="ContaAPI" 
                className="w-8 h-8 rounded-lg"
              />
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                ContaAPI
              </span>
            </div>
          )}
          <button
            onClick={() => setMenuAbierto(!menuAbierto)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            {menuAbierto ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Selector de empresa */}
        {menuAbierto && (
          <div className="p-4 border-b border-gray-200">
            <button
              onClick={() => setMostrarSelectorEmpresa(!mostrarSelectorEmpresa)}
              className="w-full flex items-center justify-between p-3 bg-gradient-to-r from-blue-50 to-purple-50 hover:from-blue-100 hover:to-purple-100 rounded-xl transition-all"
            >
              <div className="flex items-center gap-3">
                <Building2 className="w-5 h-5 text-blue-600" />
                <div className="text-left">
                  <p className="text-sm font-semibold text-gray-900">
                    {empresaSeleccionada?.nombre || 'Seleccionar empresa'}
                  </p>
                  {empresaSeleccionada && (
                    <p className="text-xs text-gray-500">{empresaSeleccionada.ruc}</p>
                  )}
                </div>
              </div>
              <ChevronDown className="w-4 h-4 text-gray-500" />
            </button>

            {/* Dropdown de empresas */}
            {mostrarSelectorEmpresa && (
              <div className="mt-2 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden">
                {empresas.map((empresa) => (
                  <button
                    key={empresa.id}
                    onClick={() => {
                      setEmpresaSeleccionada(empresa)
                      setMostrarSelectorEmpresa(false)
                    }}
                    className="w-full text-left p-3 hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-0"
                  >
                    <p className="text-sm font-medium text-gray-900">{empresa.nombre}</p>
                    <p className="text-xs text-gray-500">{empresa.ruc}</p>
                  </button>
                ))}
                <Link
                  to="/empresas/nueva"
                  className="w-full text-left p-3 hover:bg-blue-50 transition-colors text-blue-600 font-medium text-sm flex items-center gap-2"
                >
                  <Building2 className="w-4 h-4" />
                  Nueva empresa
                </Link>
              </div>
            )}
          </div>
        )}

        {/* Menú de navegación */}
        <nav className="flex-1 overflow-y-auto p-4 space-y-6">
          {menuItems.map((seccion, idx) => (
            <div key={idx}>
              {menuAbierto && (
                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 px-2">
                  {seccion.titulo}
                </h3>
              )}
              <div className="space-y-1">
                {seccion.items.map((item) => (
                  <Link
                    key={item.ruta}
                    to={item.ruta}
                    className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-all ${
                      estaActivo(item.ruta)
                        ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-blue-200'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <item.icono className={`w-5 h-5 ${!menuAbierto && 'mx-auto'}`} />
                    {menuAbierto && (
                      <span className="text-sm font-medium">{item.nombre}</span>
                    )}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </nav>

        {/* Footer del sidebar */}
        <div className="border-t border-gray-200 p-4 space-y-2">
          <Link
            to="/configuracion"
            className="flex items-center gap-3 px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Settings className={`w-5 h-5 ${!menuAbierto && 'mx-auto'}`} />
            {menuAbierto && <span className="text-sm font-medium">Configuración</span>}
          </Link>
          <button
            onClick={cerrarSesion}
            className="w-full flex items-center gap-3 px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <LogOut className={`w-5 h-5 ${!menuAbierto && 'mx-auto'}`} />
            {menuAbierto && <span className="text-sm font-medium">Cerrar sesión</span>}
          </button>
        </div>
      </aside>

      {/* Contenido principal */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Header */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6">
          <div className="flex items-center gap-4 flex-1 max-w-2xl">
            <Search className="w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar asientos, facturas, proveedores..."
              className="flex-1 outline-none text-sm text-gray-700"
            />
          </div>

          <div className="flex items-center gap-4">
            <button className="p-2 hover:bg-gray-100 rounded-lg relative">
              <Bell className="w-5 h-5 text-gray-600" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>
            
            <button className="p-2 hover:bg-gray-100 rounded-lg">
              <HelpCircle className="w-5 h-5 text-gray-600" />
            </button>

            <div className="flex items-center gap-3 pl-4 border-l border-gray-200">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">
                  {usuario?.user_metadata?.full_name || usuario?.email?.split('@')[0]}
                </p>
                <p className="text-xs text-gray-500">Administrador</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-semibold">
                {(usuario?.email?.[0] || 'U').toUpperCase()}
              </div>
            </div>
          </div>
        </header>

        {/* Área de contenido */}
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  )
}