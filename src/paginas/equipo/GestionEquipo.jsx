/**
 * Gestión de Equipo - ContaAPI v2
 * MOBILE-FIRST - Vista responsive optimizada
 */

import { useState, useEffect } from 'react'
import { Users, UserPlus, Search, RefreshCw, Filter } from 'lucide-react'
import { useEmpresa } from '../../contextos/EmpresaContext'
import { usuariosServicio } from '../../servicios/usuariosServicio'
import ModalCrearUsuario from './ModalCrearUsuario'
import ModalModificarUsuario from './ModalModificarUsuario'
import ModalEliminarUsuario from './ModalEliminarUsuario'
import TarjetaUsuario from './TarjetaUsuario'

const FILTROS_ESTADO = [
  { value: 'todos', label: 'Todos' },
  { value: 'activo', label: 'Activos' },
  { value: 'inactivo', label: 'Inactivos' },
  { value: 'suspendido', label: 'Suspendidos' }
]

const FILTROS_ROL = [
  { value: 'todos', label: 'Todos los roles' },
  { value: 'propietario', label: 'Propietarios' },
  { value: 'administrador', label: 'Administradores' },
  { value: 'contador', label: 'Contadores' },
  { value: 'asistente', label: 'Asistentes' },
  { value: 'auditor', label: 'Auditores' },
  { value: 'invitado', label: 'Invitados' }
]

export default function GestionEquipo() {
  const { empresaActual } = useEmpresa()
  const empresaId = empresaActual?.id
  
  const [usuarios, setUsuarios] = useState([])
  const [loading, setLoading] = useState(true)
  const [busqueda, setBusqueda] = useState('')
  const [filtroEstado, setFiltroEstado] = useState('activo')
  const [filtroRol, setFiltroRol] = useState('todos')

  // Modales
  const [modalCrear, setModalCrear] = useState(false)
  const [modalModificar, setModalModificar] = useState(false)
  const [modalEliminar, setModalEliminar] = useState(false)
  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState(null)

  useEffect(() => {
    if (empresaId) {
      cargarUsuarios()
    }
  }, [empresaId])

  const cargarUsuarios = async () => {
    setLoading(true)
    try {
      const data = await usuariosServicio.obtenerUsuarios(empresaId)
      setUsuarios(data)
    } catch (error) {
      console.error('Error al cargar usuarios:', error)
      alert('Error al cargar usuarios')
    } finally {
      setLoading(false)
    }
  }

  const abrirModalModificar = (usuario) => {
    setUsuarioSeleccionado(usuario)
    setModalModificar(true)
  }

  const abrirModalEliminar = (usuario) => {
    setUsuarioSeleccionado(usuario)
    setModalEliminar(true)
  }

  const handleCambiarEstado = async (usuario, nuevoEstado) => {
    if (usuario.rol === 'propietario') {
      alert('No puedes cambiar el estado del propietario')
      return
    }

    if (window.confirm(`¿Cambiar estado a "${nuevoEstado}"?`)) {
      try {
        await usuariosServicio.cambiarEstado(usuario.user_id, empresaId, nuevoEstado)
        cargarUsuarios()
        alert(`Estado cambiado a: ${nuevoEstado}`)
      } catch (error) {
        alert(error.message || 'Error al cambiar estado')
      }
    }
  }

  // Filtrar usuarios
  const usuariosFiltrados = usuarios.filter(usuario => {
    const coincideBusqueda = 
      usuario.nombre_completo?.toLowerCase().includes(busqueda.toLowerCase()) ||
      usuario.email?.toLowerCase().includes(busqueda.toLowerCase()) ||
      usuario.numero_interno?.toString().includes(busqueda)

    const coincideEstado = filtroEstado === 'todos' || usuario.estado === filtroEstado
    const coincideRol = filtroRol === 'todos' || usuario.rol === filtroRol

    return coincideBusqueda && coincideEstado && coincideRol
  })

  // Estadísticas
  const stats = {
    total: usuarios.length,
    activos: usuarios.filter(u => u.estado === 'activo').length,
    inactivos: usuarios.filter(u => u.estado === 'inactivo').length,
    suspendidos: usuarios.filter(u => u.estado === 'suspendido').length
  }

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Header - Mobile Optimized */}
      <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm rounded-xl shadow-lg p-4 md:p-6">
        <div className="flex flex-col gap-4">
          {/* Primera fila: Icono + Info */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 md:w-12 md:h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
              <Users className="w-5 h-5 md:w-6 md:h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="min-w-0 flex-1">
              <h1 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">Gestión de Usuarios</h1>
              <p className="text-sm md:text-base text-gray-600 dark:text-gray-400 truncate">Administra el equipo de la empresa</p>
            </div>
          </div>

          {/* Segunda fila: Botones - Stack en móvil */}
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
            <button
              onClick={cargarUsuarios}
              disabled={loading}
              className="flex-1 sm:flex-none px-4 py-2.5 md:py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center justify-center gap-2 disabled:opacity-50 transition-colors text-base md:text-sm font-medium"
            >
              <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Actualizar</span>
            </button>
            <button
              onClick={() => setModalCrear(true)}
              className="flex-1 sm:flex-none px-6 py-2.5 md:py-2 bg-blue-600 dark:bg-blue-500 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 flex items-center justify-center gap-2 transition-colors text-base md:text-sm font-medium"
            >
              <UserPlus className="w-5 h-5" />
              <span className="sm:hidden">Nuevo</span>
              <span className="hidden sm:inline">Nuevo usuario</span>
            </button>
          </div>
        </div>

        {/* Estadísticas - Grid 2x2 móvil, 4 cols desktop */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mt-4 md:mt-6">
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 md:p-4">
            <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400 mb-1">Total</p>
            <p className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
          </div>
          <div className="bg-green-50 dark:bg-green-900/30 rounded-lg p-3 md:p-4">
            <p className="text-xs md:text-sm text-green-600 dark:text-green-400 mb-1">Activos</p>
            <p className="text-xl md:text-2xl font-bold text-green-900 dark:text-green-300">{stats.activos}</p>
          </div>
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 md:p-4">
            <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400 mb-1">Inactivos</p>
            <p className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">{stats.inactivos}</p>
          </div>
          <div className="bg-red-50 dark:bg-red-900/30 rounded-lg p-3 md:p-4">
            <p className="text-xs md:text-sm text-red-600 dark:text-red-400 mb-1">Suspendidos</p>
            <p className="text-xl md:text-2xl font-bold text-red-900 dark:text-red-300">{stats.suspendidos}</p>
          </div>
        </div>
      </div>

      {/* Filtros y búsqueda - Stack en móvil, Grid en desktop */}
      <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm rounded-xl shadow-lg p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
          {/* Búsqueda */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
            <input
              type="text"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="Buscar usuario..."
              className="w-full pl-10 pr-4 py-2.5 md:py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 text-base"
            />
          </div>

          {/* Filtro de estado */}
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500 pointer-events-none" />
            <select
              value={filtroEstado}
              onChange={(e) => setFiltroEstado(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 md:py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 appearance-none focus:outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-base"
            >
              {FILTROS_ESTADO.map(filtro => (
                <option key={filtro.value} value={filtro.value}>
                  {filtro.label}
                </option>
              ))}
            </select>
          </div>

          {/* Filtro de rol */}
          <select
            value={filtroRol}
            onChange={(e) => setFiltroRol(e.target.value)}
            className="w-full px-4 py-2.5 md:py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-base"
          >
            {FILTROS_ROL.map(filtro => (
              <option key={filtro.value} value={filtro.value}>
                {filtro.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Lista de usuarios */}
      {loading ? (
        <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm rounded-xl shadow-lg p-12 text-center">
          <RefreshCw className="w-10 h-10 md:w-12 md:h-12 text-gray-400 dark:text-gray-500 animate-spin mx-auto mb-4" />
          <p className="text-sm md:text-base text-gray-600 dark:text-gray-400">Cargando usuarios...</p>
        </div>
      ) : usuariosFiltrados.length === 0 ? (
        <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm rounded-xl shadow-lg p-12 text-center">
          <Users className="w-10 h-10 md:w-12 md:h-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
          <p className="text-sm md:text-base text-gray-600 dark:text-gray-400 mb-4">
            {busqueda || filtroEstado !== 'todos' || filtroRol !== 'todos'
              ? 'No se encontraron usuarios con los filtros seleccionados'
              : 'No hay usuarios todavía'}
          </p>
          {!busqueda && filtroEstado === 'todos' && filtroRol === 'todos' && (
            <button
              onClick={() => setModalCrear(true)}
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-blue-600 dark:bg-blue-500 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors font-medium"
            >
              <UserPlus className="w-5 h-5" />
              Crear primer usuario
            </button>
          )}
        </div>
      ) : (
        <div className="grid gap-3 md:gap-4">
          {usuariosFiltrados.map(usuario => (
            <TarjetaUsuario
              key={usuario.user_id}
              usuario={usuario}
              onEditar={() => abrirModalModificar(usuario)}
              onEliminar={() => abrirModalEliminar(usuario)}
              onCambiarEstado={(nuevoEstado) => handleCambiarEstado(usuario, nuevoEstado)}
            />
          ))}
        </div>
      )}

      {/* Modales */}
      <ModalCrearUsuario
        isOpen={modalCrear}
        onClose={() => setModalCrear(false)}
        empresaId={empresaId}
        onUsuarioCreado={cargarUsuarios}
      />

      <ModalModificarUsuario
        isOpen={modalModificar}
        onClose={() => setModalModificar(false)}
        usuario={usuarioSeleccionado}
        empresaId={empresaId}
        onUsuarioModificado={cargarUsuarios}
      />

      <ModalEliminarUsuario
        isOpen={modalEliminar}
        onClose={() => setModalEliminar(false)}
        usuario={usuarioSeleccionado}
        empresaId={empresaId}
        onUsuarioEliminado={cargarUsuarios}
      />
    </div>
  )
}