import { useAutenticacion } from './hooks/useAutenticacion'
import { Login } from './paginas/autenticacion/Login'

function App() {
  const { usuario, cargando } = useAutenticacion()

  if (cargando) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!usuario) {
    return <Login />
  }

  return (
    <div className="min-h-screen bg-secondary-50">
      <div className="container mx-auto px-4 py-8">
        <div className="card max-w-2xl mx-auto text-center">
          <h1 className="text-4xl font-bold text-primary-600 mb-4">
            🧾 ContaAPI
          </h1>
          <h2 className="text-2xl text-secondary-700 mb-6">
            ¡Bienvenido {usuario.email}!
          </h2>
          <p className="text-secondary-600 mb-8">
            Has iniciado sesión correctamente
          </p>
          
          <button 
            onClick={async () => {
              const { servicioAutenticacion } = await import('./servicios/autenticacion')
              await servicioAutenticacion.cerrarSesion()
            }}
            className="btn-primary"
          >
            Cerrar Sesión
          </button>
        </div>
      </div>
    </div>
  )
}

export default App