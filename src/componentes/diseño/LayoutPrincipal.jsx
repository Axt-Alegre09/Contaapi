import { Moon, Sun } from 'lucide-react' // ← AGREGAR ESTOS ICONOS
import { useTheme } from '../../contextos/ThemeContext' // ← AGREGAR ESTE IMPORT

export function LayoutPrincipal({ children }) {
  const { usuario } = useAutenticacion()
  const { empresaActual, periodoActual, limpiarContexto } = useEmpresa()
  const { isDark, toggleTheme } = useTheme() // ← AGREGAR ESTO
  const location = useLocation()
  const navigate = useNavigate()
  
  // ... resto del código igual ...

  return (
    <div className="min-h-screen flex relative">
      {/* FONDO con dark mode */}
      <div className="fixed inset-0 bg-gradient-to-br from-blue-50 via-slate-50 to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 -z-10" />

      {/* Sidebar con dark mode */}
      <aside className={`fixed lg:static inset-y-0 left-0 z-50 transition-all duration-300 ${
        menuAbierto ? 'w-64' : 'w-20'
      } bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm border-r border-gray-200 dark:border-gray-700 flex flex-col shadow-xl`}>
        
        {/* Logo y toggle */}
        <div className="h-16 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between px-4">
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
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
          >
            {menuAbierto ? <X className="w-5 h-5 dark:text-gray-300" /> : <Menu className="w-5 h-5 dark:text-gray-300" />}
          </button>
        </div>

        {/* ... selector de empresa igual pero con dark: ... */}

        {/* Menú de navegación con dark mode */}
        <nav className="flex-1 overflow-y-auto p-4 space-y-6">
          {menuItems.map((seccion, idx) => (
            <div key={idx}>
              {menuAbierto && (
                <h3 className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2 px-2">
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
                        ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-blue-200 dark:shadow-blue-900'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
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

        {/* Footer del sidebar con dark mode */}
        <div className="border-t border-gray-200 dark:border-gray-700 p-4 space-y-2">
          {/* TOGGLE DARK MODE */}
          <button
            onClick={toggleTheme}
            className="w-full flex items-center gap-3 px-3 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
          >
            {isDark ? (
              <>
                <Sun className={`w-5 h-5 ${!menuAbierto && 'mx-auto'}`} />
                {menuAbierto && <span className="text-sm font-medium">Modo Claro</span>}
              </>
            ) : (
              <>
                <Moon className={`w-5 h-5 ${!menuAbierto && 'mx-auto'}`} />
                {menuAbierto && <span className="text-sm font-medium">Modo Oscuro</span>}
              </>
            )}
          </button>

          <Link
            to="/configuracion"
            className="flex items-center gap-3 px-3 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
          >
            <Settings className={`w-5 h-5 ${!menuAbierto && 'mx-auto'}`} />
            {menuAbierto && <span className="text-sm font-medium">Configuración</span>}
          </Link>
          <button
            onClick={cerrarSesion}
            className="w-full flex items-center gap-3 px-3 py-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
          >
            <LogOut className={`w-5 h-5 ${!menuAbierto && 'mx-auto'}`} />
            {menuAbierto && <span className="text-sm font-medium">Cerrar sesión</span>}
          </button>
        </div>
      </aside>

      {/* Contenido principal */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Header con dark mode */}
        <header className="h-16 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700 flex items-center justify-between px-6 shadow-sm">
          <div className="flex items-center gap-4 flex-1 max-w-2xl">
            <Search className="w-5 h-5 text-gray-400 dark:text-gray-500" />
            <input
              type="text"
              placeholder="Buscar asientos, facturas, proveedores..."
              className="flex-1 outline-none text-sm text-gray-700 dark:text-gray-300 bg-transparent placeholder-gray-400 dark:placeholder-gray-500"
            />
          </div>

          <div className="flex items-center gap-4">
            <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg relative transition-colors">
              <Bell className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>
            
            <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors">
              <HelpCircle className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </button>

            <div className="flex items-center gap-3 pl-4 border-l border-gray-200 dark:border-gray-700">
              <div className="text-right">
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

        {/* Área de contenido */}
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  )
}