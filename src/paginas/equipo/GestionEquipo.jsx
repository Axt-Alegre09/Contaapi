/**
 * Gestión de Equipo - ContaAPI v2
 * src/paginas/equipo/GestionEquipo.jsx
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
    <div className="space-y-6">
      {/* Header con backdrop blur */}
      <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Gestión de Usuarios</h1>
              <p className="text-gray-600">Administra el equipo de la empresa</p>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={cargarUsuarios}
              disabled={loading}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 flex items-center gap-2 disabled:opacity-50 transition-colors"
            >
              <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
              Actualizar
            </button>
            <button
              onClick={() => setModalCrear(true)}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 transition-colors"
            >
              <UserPlus className="w-5 h-5" />
              Nuevo usuario
            </button>
          </div>
        </div>

        {/* Estadísticas */}
        <div className="grid grid-cols-4 gap-4">
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-sm text-gray-600">Total</p>
            <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
          </div>
          <div className="bg-green-50 rounded-lg p-4">
            <p className="text-sm text-green-600">Activos</p>
            <p className="text-2xl font-bold text-green-900">{stats.activos}</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-sm text-gray-600">Inactivos</p>
            <p className="text-2xl font-bold text-gray-900">{stats.inactivos}</p>
          </div>
          <div className="bg-red-50 rounded-lg p-4">
            <p className="text-sm text-red-600">Suspendidos</p>
            <p className="text-2xl font-bold text-red-900">{stats.suspendidos}</p>
          </div>
        </div>
      </div>

      {/* Filtros y búsqueda con backdrop blur */}
      <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-lg p-4">
        <div className="grid grid-cols-3 gap-4">
          {/* Búsqueda */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="Buscar por nombre, email o número..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          {/* Filtro de estado */}
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <select
              value={filtroEstado}
              onChange={(e) => setFiltroEstado(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 appearance-none focus:outline-none"
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
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
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
        <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-lg p-12 text-center">
          <RefreshCw className="w-12 h-12 text-gray-400 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Cargando usuarios...</p>
        </div>
      ) : usuariosFiltrados.length === 0 ? (
        <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-lg p-12 text-center">
          <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">
            {busqueda || filtroEstado !== 'todos' || filtroRol !== 'todos'
              ? 'No se encontraron usuarios con los filtros seleccionados'
              : 'No hay usuarios todavía'}
          </p>
          {!busqueda && filtroEstado === 'todos' && filtroRol === 'todos' && (
            <button
              onClick={() => setModalCrear(true)}
              className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Crear primer usuario
            </button>
          )}
        </div>
      ) : (
        <div className="grid gap-4">
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