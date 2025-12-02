// src/app.jsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useEffect } from 'react'
import { useAutenticacion } from './hooks/useAutenticacion'
import { EmpresaProvider } from './contextos/EmpresaContext'
import { ThemeProvider } from './contextos/ThemeContext' // ← NUEVO
import { Login } from './paginas/autenticacion/Login'
import { RestablecerContrasena } from './paginas/autenticacion/RestablecerContrasena'
import { Planes } from './paginas/planes/Planes'
import { SolicitarPlan } from './paginas/planes/SolicitarPlan'
import { SeleccionPeriodo } from './paginas/utilitarios/SeleccionPeriodo'
import { SelectorEmpresa } from './paginas/empresa/SelectorEmpresa'
import { RequiereContexto } from './componentes/RequiereContexto'
import { supabase } from './configuracion/supabase'
import { LayoutPrincipal } from './componentes/diseño/LayoutPrincipal.jsx'
import { Dashboard } from './paginas/dashboard/Dashboard'
import GestionEquipo from './paginas/equipo/GestionEquipo'
import PaginaAuditoria from './paginas/equipo/PaginaAuditoria'
import PaginaMetricas from './paginas/equipo/PaginaMetricas'

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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="text-center">
          <img 
            src="https://rsttvtsckdgjyobrqtlx.supabase.co/storage/v1/object/public/Contaapi/logo.jpg" 
            alt="ContaAPI Logo" 
            className="w-20 h-20 mx-auto mb-4 rounded-2xl shadow-lg animate-pulse object-contain"
          />
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 dark:border-blue-400 mx-auto"></div>
        </div>
      </div>
    )
  }

  return (
    <BrowserRouter>
      <ThemeProvider> {/* ← NUEVO: Envolver todo con ThemeProvider */}
        <EmpresaProvider>
          <Routes>
            {/* Todas las rutas igual que antes */}
            <Route 
              path="/login" 
              element={usuario ? <Navigate to="/seleccion-periodo" replace /> : <Login />} 
            />
            
            <Route 
              path="/restablecer-contrasena" 
              element={<RestablecerContrasena />} 
            />
            
            <Route 
              path="/seleccion-periodo" 
              element={usuario ? <SeleccionPeriodo /> : <Navigate to="/login" replace />} 
            />
            
            <Route 
              path="/seleccion-empresa" 
              element={usuario ? <SelectorEmpresa /> : <Navigate to="/login" replace />} 
            />
            
            <Route 
              path="/planes" 
              element={usuario ? <Planes /> : <Navigate to="/login" replace />} 
            />
            
            <Route 
              path="/solicitar-plan" 
              element={usuario ? <SolicitarPlan /> : <Navigate to="/login" replace />} 
            />
            
            <Route 
              path="/dashboard" 
              element={
                usuario ? (
                  <RequiereContexto>
                    <LayoutPrincipal>
                      <Dashboard />
                    </LayoutPrincipal>
                  </RequiereContexto>
                ) : (
                  <Navigate to="/login" replace />
                )
              } 
            />

            <Route 
              path="/equipo" 
              element={
                usuario ? (
                  <RequiereContexto>
                    <LayoutPrincipal>
                      <GestionEquipo />
                    </LayoutPrincipal>
                  </RequiereContexto>
                ) : (
                  <Navigate to="/login" replace />
                )
              } 
            />

            <Route 
              path="/equipo/auditoria" 
              element={
                usuario ? (
                  <RequiereContexto>
                    <LayoutPrincipal>
                      <PaginaAuditoria />
                    </LayoutPrincipal>
                  </RequiereContexto>
                ) : (
                  <Navigate to="/login" replace />
                )
              } 
            />

            <Route 
              path="/equipo/metricas" 
              element={
                usuario ? (
                  <RequiereContexto>
                    <LayoutPrincipal>
                      <PaginaMetricas />
                    </LayoutPrincipal>
                  </RequiereContexto>
                ) : (
                  <Navigate to="/login" replace />
                )
              } 
            />

            <Route 
              path="/" 
              element={<Navigate to="/login" replace />} 
            />
            
            <Route 
              path="*" 
              element={<Navigate to="/login" replace />} 
            />
          </Routes>
        </EmpresaProvider>
      </ThemeProvider>
    </BrowserRouter>
  )
}

export default App