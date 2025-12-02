// src/app.jsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { EmpresaProvider } from '@/contextos/EmpresaContext'
import RequiereContexto from '@/componentes/RequiereContexto'
import LayoutPrincipal from '@/componentes/diseño/LayoutPrincipal'

// Páginas de autenticación
import Login from '@/paginas/autenticacion/Login'
import SeleccionPeriodo from '@/paginas/utilitarios/SeleccionPeriodo'
import SelectorEmpresa from '@/paginas/empresa/SelectorEmpresa'

// Páginas principales
import Dashboard from '@/paginas/dashboard/Dashboard'
import GestionEquipo from '@/paginas/equipo/GestionEquipo'
// ... importar resto de páginas

function App() {
  return (
    <BrowserRouter>
      <EmpresaProvider>
        <Routes>
          {/* Rutas públicas */}
          <Route path="/login" element={<Login />} />
          
          {/* Rutas de selección (post-login, pre-dashboard) */}
          <Route path="/seleccion-periodo" element={<SeleccionPeriodo />} />
          <Route path="/seleccion-empresa" element={<SelectorEmpresa />} />
          
          {/* Rutas protegidas - requieren contexto de empresa/periodo */}
          <Route element={
            <RequiereContexto>
              <LayoutPrincipal />
            </RequiereContexto>
          }>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/equipo" element={<GestionEquipo />} />
            {/* ... resto de rutas protegidas */}
          </Route>

          {/* Redirección por defecto */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </EmpresaProvider>
    </BrowserRouter>
  )
}

export default App