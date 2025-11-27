import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAutenticacion } from './hooks/useAutenticacion'
import { Login } from './paginas/autenticacion/Login'
import { RestablecerContrasena } from './paginas/autenticacion/RestablecerContrasena'
import { servicioAutenticacion } from './servicios/autenticacion'

function App() {
  const { usuario, cargando } = useAutenticacion()

  if (cargando) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl mb-4 shadow-lg animate-pulse">
            <span className="text-3xl">🧾</span>
          </div>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        </div>
      </div>
    )
  }

  return (
    <BrowserRouter>
      <Routes>
        {/* Ruta de restablecer contraseña - Pública */}
        <Route path="/restablecer-contrasena" element={<RestablecerContrasena />} />
        
        {/* Login */}
        <Route 
          path="/login" 
          element={usuario ? <Navigate to="/" /> : <Login />} 
        />
        
        {/* Dashboard - Protegido */}
        <Route 
          path="/" 
          element={
            usuario ? (
              <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
                <div className="container mx-auto px-4 py-8">
                  <div className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-2xl p-8 border border-white max-w-2xl mx-auto text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl mb-4 shadow-lg">
                      <span className="text-3xl">🧾</span>
                    </div>
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
                      ContaAPI
                    </h1>
                    <h2 className="text-2xl text-gray-700 mb-6">
                      ¡Bienvenido {usuario.email}!
                    </h2>
                    <p className="text-gray-600 mb-8">
                      Has iniciado sesión correctamente
                    </p>
                    
                    <button 
                      onClick={async () => {
                        await servicioAutenticacion.cerrarSesion()
                      }}
                      className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-3 px-8 rounded-xl transition-all duration-200 transform hover:scale-105 shadow-lg shadow-blue-500/50"
                    >
                      Cerrar Sesión
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <Navigate to="/login" />
            )
          } 
        />
      </Routes>
    </BrowserRouter>
  )
}

export default App