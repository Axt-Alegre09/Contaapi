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
  HelpCircle,
  Moon,
  Sun
} from 'lucide-react'
import { servicioAutenticacion } from '../../servicios/autenticacion'
import { useAutenticacion } from '../../hooks/useAutenticacion'
import { useEmpresa } from '../../contextos/EmpresaContext'
import { useTheme } from '../../contextos/ThemeContext'

export function LayoutPrincipal({ children }) {
  const { usuario } = useAutenticacion()
  const { empresaActual, periodoActual, limpiarContexto } = useEmpresa()
  const { isDark, toggleTheme } = useTheme()
  const location = useLocation()
  const navigate = useNavigate()
  
  // CAMBIO: iniciar cerrado en móvil, se maneja con translate
  const [menuAbierto, setMenuAbierto] = useState(false)
  const [mostrarSelectorEmpresa, setMostrarSelectorEmpresa] = useState(false)

  const menuItems = [
    {
      titulo: 'Principal',
      items: [
        { nombre: 'Dashboard', icono: LayoutDashboard, ruta: '/dashboard' },
        { nombre: 'Empresas', icono: Building2, ruta: '/empresas' },
        { nombre: 'Equipo', icono: Users, ruta: '/equipo' },
      ]
    },
    {
      titulo: 'Contabilidad',
      items: [
        { nombre: 'Plan de Cuentas', icono: FileText, ruta: '/contabilidad/plan-cuentas' },
        { nombre: 'Asientos Contables', icono: FileText, ruta: '/contabilidad/asientos' },
        { nombre: 'Libro Diario', icono: FileText, ruta: '/contabilidad/libro-diario' },
        { nombre: 'Libro Mayor', icono: FileText, ruta: '/contabilidad/libro-mayor' },
        { nombre: 'Balances', icono: FileText, ruta: '/contabilidad/balances' },
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

  const cambiarEmpresaPeriodo = () => {
    limpiarContexto()
    navigate('/seleccion-periodo')
  }

  return (
    <div className="min-h-screen flex relative">
      {/* Fondo con dark mode */}
      <div className="fixed inset-0 bg-gradient-to-br from-blue-50 via-slate-50 to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 -z-10" />

      {/* NUEVO: Overlay para móvil cuando el menú está abierto */}
      {menuAbierto && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setMenuAbierto(false)}
        />
      )}

      {/* Sidebar - RESPONSIVE */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-50
        transition-transform duration-300 ease-in-out
        ${menuAbierto ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        w-64 lg:w-64
        bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm 
        border-r border-gray-200 dark:border-gray-700 
        flex flex-col shadow-xl
      `}>
        
        {/* Logo y toggle */}
        <div className="h-16 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <img 
              src="https://rsttvtsckdgjyobrqtlx.supabase.co/storage/v1/object/public/Contaapi/logo.jpg" 
              alt="ContaAPI" 
              className="w-8 h-8 rounded-lg object-contain"
            />
            <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              ContaAPI
            </span>
          </div>
          {/* Botón X solo visible en móvil */}
          <button
            onClick={() => setMenuAbierto(false)}
            className="lg:hidden p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 dark:text-gray-300" />
          </button>
        </div>

        {/* Selector de empresa */}
        {empresaActual && (
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <button
              onClick={() => setMostrarSelectorEmpresa(!mostrarSelectorEmpresa)}
              className="w-full flex items-center justify-between p-3 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 hover:from-blue-100 hover:to-purple-100 dark:hover:from-blue-800/30 dark:hover:to-purple-800/30 rounded-xl transition-all"
            >
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <Building2 className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                <div className="text-left min-w-0">
                  <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">
                    {empresaActual.nombre}
                  </p>
                  {periodoActual && (
                    <p className="text-xs text-gray-500 dark:text-gray-400">Periodo: {periodoActual.anio}</p>
                  )}
                </div>
              </div>
              <ChevronDown className="w-4 h-4 text-gray-500 dark:text-gray-400 flex-shrink-0" />
            </button>

            {mostrarSelectorEmpresa && (
              <div className="mt-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg overflow-hidden">
                <button
                  onClick={cambiarEmpresaPeriodo}
                  className="w-full text-left p-3 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors text-blue-600 dark:text-blue-400 font-medium text-sm flex items-center gap-2"
                >
                  <Building2 className="w-4 h-4" />
                  Cambiar empresa/periodo
                </button>
              </div>
            )}
          </div>
        )}

        {/* Menú de navegación */}
        <nav className="flex-1 overflow-y-auto p-4 space-y-6">
          {menuItems.map((seccion, idx) => (
            <div key={idx}>
              <h3 className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2 px-2">
                {seccion.titulo}
              </h3>
              <div className="space-y-1">
                {seccion.items.map((item) => (
                  <Link
                    key={item.ruta}
                    to={item.ruta}
                    onClick={() => setMenuAbierto(false)} // Cerrar menú al navegar en móvil
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${
                      estaActivo(item.ruta)
                        ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-blue-200 dark:shadow-blue-900'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                    }`}
                  >
                    <item.icono className="w-5 h-5" />
                    <span className="text-sm font-medium">{item.nombre}</span>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </nav>

        {/* Footer del sidebar */}
        <div className="border-t border-gray-200 dark:border-gray-700 p-4 space-y-2">
          {/* Toggle Dark Mode */}
          <button
            onClick={toggleTheme}
            className="w-full flex items-center gap-3 px-3 py-2.5 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
          >
            {isDark ? (
              <>
                <Sun className="w-5 h-5" />
                <span className="text-sm font-medium">Modo Claro</span>
              </>
            ) : (
              <>
                <Moon className="w-5 h-5" />
                <span className="text-sm font-medium">Modo Oscuro</span>
              </>
            )}
          </button>

          <Link
            to="/configuracion"
            className="flex items-center gap-3 px-3 py-2.5 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
          >
            <Settings className="w-5 h-5" />
            <span className="text-sm font-medium">Configuración</span>
          </Link>
          
          <button
            onClick={cerrarSesion}
            className="w-full flex items-center gap-3 px-3 py-2.5 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span className="text-sm font-medium">Cerrar sesión</span>
          </button>
        </div>
      </aside>

      {/* Contenido principal - RESPONSIVE */}
      <div className="flex-1 flex flex-col min-h-screen w-full lg:w-auto">
        {/* Header - RESPONSIVE */}
        <header className="h-16 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700 flex items-center justify-between px-4 lg:px-6 shadow-sm sticky top-0 z-30">
          {/* Botón hamburguesa - SOLO EN MÓVIL */}
          <button
            onClick={() => setMenuAbierto(true)}
            className="lg:hidden p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
          >
            <Menu className="w-6 h-6 text-gray-600 dark:text-gray-400" />
          </button>

          {/* Buscador - Oculto en móvil pequeño */}
          <div className="hidden sm:flex items-center gap-4 flex-1 max-w-2xl">
            <Search className="w-5 h-5 text-gray-400 dark:text-gray-500" />
            <input
              type="text"
              placeholder="Buscar asientos, facturas, proveedores..."
              className="flex-1 outline-none text-sm text-gray-700 dark:text-gray-300 bg-transparent placeholder-gray-400 dark:placeholder-gray-500"
            />
          </div>

          {/* Logo en móvil (centro) */}
          <div className="lg:hidden flex-1 flex justify-center">
            <img 
              src="https://rsttvtsckdgjyobrqtlx.supabase.co/storage/v1/object/public/Contaapi/logo.jpg" 
              alt="ContaAPI" 
              className="w-8 h-8 rounded-lg object-contain"
            />
          </div>

          {/* Acciones header */}
          <div className="flex items-center gap-2 lg:gap-4">
            <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg relative transition-colors">
              <Bell className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>
            
            <button className="hidden sm:block p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors">
              <HelpCircle className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </button>

            {/* Usuario info - Responsive */}
            <div className="flex items-center gap-2 lg:gap-3 pl-2 lg:pl-4 border-l border-gray-200 dark:border-gray-700">
              <div className="hidden md:block text-right">
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  {usuario?.user_metadata?.full_name || usuario?.email?.split('@')[0]}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Administrador</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-semibold">
                {(usuario?.email?.[0] || 'U').toUpperCase()}
              </div>
            </div>
          </div>
        </header>

        {/* Área de contenido - RESPONSIVE */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  )
}