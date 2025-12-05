/**
 * LAYOUT PRINCIPAL
 * Layout base con header que incluye selector de empresa
 */

import { Outlet, useNavigate } from 'react-router-dom';
import { useEmpresa } from '../../contextos/EmpresaContext';
import { SelectorEmpresa } from './SelectorEmpresa';
import { Moon, Sun, LogOut, User, Menu, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import { supabase } from '../../configuracion/supabase';

export const LayoutPrincipal = () => {
  const navigate = useNavigate();
  const { empresaActual, loading: loadingEmpresa } = useEmpresa();
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('darkMode') === 'true';
  });
  const [menuAbierto, setMenuAbierto] = useState(false);
  const [usuario, setUsuario] = useState(null);

  useEffect(() => {
    // Aplicar dark mode
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('darkMode', darkMode);
  }, [darkMode]);

  useEffect(() => {
    // Obtener usuario
    const obtenerUsuario = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUsuario(user);
    };
    obtenerUsuario();
  }, []);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    localStorage.removeItem('empresa_actual_id');
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50">
        <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo y nombre */}
            <div className="flex items-center gap-4">
              <button
                onClick={() => setMenuAbierto(!menuAbierto)}
                className="lg:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                {menuAbierto ? (
                  <X className="w-6 h-6 text-gray-600 dark:text-gray-300" />
                ) : (
                  <Menu className="w-6 h-6 text-gray-600 dark:text-gray-300" />
                )}
              </button>
              
              <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 
                bg-clip-text text-transparent">
                ContaAPI
              </h1>
            </div>

            {/* Selector de Empresa (Centro) */}
            <div className="hidden md:flex items-center justify-center flex-1 px-4">
              {!loadingEmpresa && <SelectorEmpresa />}
            </div>

            {/* Acciones del usuario */}
            <div className="flex items-center gap-3">
              {/* Dark Mode Toggle */}
              <button
                onClick={toggleDarkMode}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                title={darkMode ? 'Modo claro' : 'Modo oscuro'}
              >
                {darkMode ? (
                  <Sun className="w-5 h-5 text-yellow-500" />
                ) : (
                  <Moon className="w-5 h-5 text-gray-600" />
                )}
              </button>

              {/* Usuario */}
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-700">
                <User className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                <span className="text-sm font-medium text-gray-900 dark:text-white hidden sm:inline">
                  {usuario?.email?.split('@')[0] || 'Usuario'}
                </span>
              </div>

              {/* Logout */}
              <button
                onClick={handleLogout}
                className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 
                  text-red-600 dark:text-red-400 transition-colors"
                title="Cerrar sesión"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Selector de Empresa (Mobile) */}
          <div className="md:hidden pb-3">
            {!loadingEmpresa && <SelectorEmpresa />}
          </div>
        </div>
      </header>

      {/* Contenido principal */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loadingEmpresa ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : empresaActual ? (
          <Outlet />
        ) : (
          <div className="text-center py-12">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              No hay empresas disponibles
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Por favor, crea una empresa para continuar
            </p>
          </div>
        )}
      </main>
    </div>
  );
};

export default LayoutPrincipal;