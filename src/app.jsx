import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useEffect } from 'react'
import { useAutenticacion } from './hooks/useAutenticacion'
import { Login } from './paginas/autenticacion/Login'
import { RestablecerContrasena } from './paginas/autenticacion/RestablecerContrasena'
import { Planes } from './paginas/planes/Planes'
import { SolicitarPlan } from './paginas/planes/SolicitarPlan'
import { servicioAutenticacion } from './servicios/autenticacion'
import { supabase } from './configuracion/supabase'
import { LogOut, LayoutDashboard, CreditCard, BookOpen, FileText, Building2, Landmark } from 'lucide-react'

function App() {
  const { usuario, cargando } = useAutenticacion()

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) {
        console.log('Usuario autenticado:', session.user.email)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  if (cargando) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="text-center">
          <img 
            src="https://rsttvtsckdgjyobrqtlx.supabase.co/storage/v1/object/public/Contaapi/logo.jpg" 
            alt="ContaAPI Logo" 
            className="w-20 h-20 mx-auto mb-4 rounded-2xl shadow-lg animate-pulse object-contain"
          />
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        </div>
      </div>
    )
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/restablecer-contrasena" element={<RestablecerContrasena />} />
        <Route path="/login" element={usuario ? <Navigate to="/" replace /> : <Login />} />
        <Route path="/planes" element={usuario ? <Planes /> : <Navigate to="/login" replace />} />
        <Route path="/solicitar-plan" element={usuario ? <SolicitarPlan /> : <Navigate to="/login" replace />} />
        
        <Route 
          path="/" 
          element={
            usuario ? (
              <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
                <header className="bg-white/80 backdrop-blur-lg border-b border-gray-200 shadow-sm">
                  <div className="container mx-auto px-4 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <img 
                        src="https://rsttvtsckdgjyobrqtlx.supabase.co/storage/v1/object/public/Contaapi/logo.jpg" 
                        alt="ContaAPI Logo" 
                        className="w-12 h-12 rounded-xl shadow-md object-contain"
                      />
                      <div>
                        <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                          ContaAPI
                        </h1>
                        <p className="text-sm text-gray-600">Sistema Contable Profesional</p>
                      </div>
                    </div>
                    
                    <button 
                      onClick={async () => {
                        await servicioAutenticacion.cerrarSesion()
                      }}
                      className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded-xl transition-all duration-200 transform hover:scale-105 shadow-md"
                    >
                      <LogOut className="w-4 h-4" />
                      Cerrar Sesión
                    </button>
                  </div>
                </header>

                <div className="container mx-auto px-4 py-8">
                  <div className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-2xl p-8 border border-white max-w-4xl mx-auto">
                    <div className="text-center mb-8">
                      <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl mb-4 shadow-lg">
                        <LayoutDashboard className="w-10 h-10 text-white" />
                      </div>
                      <h2 className="text-3xl font-bold text-gray-800 mb-2">
                        ¡Bienvenido!
                      </h2>
                      <p className="text-gray-600 mb-4">
                        {usuario.email}
                      </p>
                      <div className="inline-block bg-green-100 text-green-700 px-4 py-2 rounded-full text-sm font-medium">
                        ✓ Sesión activa
                      </div>
                    </div>

                    <div className="mb-8 text-center">
                      
                        href="/planes"
                        className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 transform hover:scale-105 shadow-lg"
                      >
                        <CreditCard className="w-5 h-5" />
                        Ver Planes y Precios
                      </a>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
                      <div className="p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl border border-blue-200 hover:shadow-lg transition-all cursor-pointer">
                        <div className="flex items-center gap-3 mb-2">
                          <BookOpen className="w-6 h-6 text-blue-600" />
                          <h3 className="font-bold text-blue-900 text-lg">Contabilidad</h3>
                        </div>
                        <p className="text-blue-700 text-sm">Gestión de asientos y libros contables</p>
                      </div>
                      
                      <div className="p-6 bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl border border-purple-200 hover:shadow-lg transition-all cursor-pointer">
                        <div className="flex items-center gap-3 mb-2">
                          <FileText className="w-6 h-6 text-purple-600" />
                          <h3 className="font-bold text-purple-900 text-lg">Operaciones Fiscales</h3>
                        </div>
                        <p className="text-purple-700 text-sm">Formularios y cumplimiento tributario</p>
                      </div>
                      
                      <div className="p-6 bg-gradient-to-br from-green-50 to-green-100 rounded-2xl border border-green-200 hover:shadow-lg transition-all cursor-pointer">
                        <div className="flex items-center gap-3 mb-2">
                          <Building2 className="w-6 h-6 text-green-600" />
                          <h3 className="font-bold text-green-900 text-lg">Bienes de Uso</h3>
                        </div>
                        <p className="text-green-700 text-sm">Activos fijos y depreciaciones</p>
                      </div>
                      
                      <div className="p-6 bg-gradient-to-br from-orange-50 to-orange-100 rounded-2xl border border-orange-200 hover:shadow-lg transition-all cursor-pointer">
                        <div className="flex items-center gap-3 mb-2">
                          <Landmark className="w-6 h-6 text-orange-600" />
                          <h3 className="font-bold text-orange-900 text-lg">Bancos</h3>
                        </div>
                        <p className="text-orange-700 text-sm">Conciliaciones bancarias</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <Navigate to="/login" replace />
            )
          } 
        />
      </Routes>
    </BrowserRouter>
  )
}

export default App