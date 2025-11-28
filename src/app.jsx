import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useEffect } from 'react'
import { useAutenticacion } from './hooks/useAutenticacion'
import { Login } from './paginas/autenticacion/Login'
import { RestablecerContrasena } from './paginas/autenticacion/RestablecerContrasena'
import { Planes } from './paginas/planes/Planes'
import { SolicitarPlan } from './paginas/planes/SolicitarPlan'
import { supabase } from './configuracion/supabase'
import { LayoutPrincipal } from './componentes/diseño/LayoutPrincipal.jsx'
import { Dashboard } from './paginas/dashboard/Dashboard'
import { GestionEquipo } from './paginas/equipo/GestionEquipo'
import { PaginaAuditoria } from './paginas/equipo/PaginaAuditoria'
import { PaginaMetricas } from './paginas/equipo/PaginaMetricas'

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
        <Route path="/login" element={usuario ? <Navigate to="/dashboard" replace /> : <Login />} />
        <Route path="/planes" element={usuario ? <Planes /> : <Navigate to="/login" replace />} />
        <Route path="/solicitar-plan" element={usuario ? <SolicitarPlan /> : <Navigate to="/login" replace />} />
        
        {/* Ruta principal con Dashboard */}
        <Route 
          path="/dashboard" 
          element={
            usuario ? (
              <LayoutPrincipal>
                <Dashboard />
              </LayoutPrincipal>
            ) : (
              <Navigate to="/login" replace />
            )
          } 
        />

        {/* Gestión de Equipo */}
        <Route 
          path="/equipo" 
          element={
            usuario ? (
              <LayoutPrincipal>
                <GestionEquipo empresaId="87a70676-4dc4-4e53-9f89-4df5cdd09302" />
              </LayoutPrincipal>
            ) : (
              <Navigate to="/login" replace />
            )
          } 
        />

        {/* Auditoría */}
        <Route 
          path="/equipo/auditoria" 
          element={
            usuario ? (
              <LayoutPrincipal>
                <PaginaAuditoria empresaId="87a70676-4dc4-4e53-9f89-4df5cdd09302" />
              </LayoutPrincipal>
            ) : (
              <Navigate to="/login" replace />
            )
          } 
        />

        {/* Métricas y Productividad */}
        <Route 
          path="/equipo/metricas" 
          element={
            usuario ? (
              <LayoutPrincipal>
                <PaginaMetricas empresaId="87a70676-4dc4-4e53-9f89-4df5cdd09302" />
              </LayoutPrincipal>
            ) : (
              <Navigate to="/login" replace />
            )
          } 
        />

        {/* Ruta raíz redirige a dashboard */}
        <Route 
          path="/" 
          element={
            usuario ? (
              <Navigate to="/dashboard" replace />
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