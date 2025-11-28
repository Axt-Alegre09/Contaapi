import { useState } from 'react'
import { Users, UserPlus, Crown, Shield, User, Eye, TrendingUp, Activity, Clock } from 'lucide-react'
import { useMiembrosEmpresa } from '../../hooks/useMiembrosEmpresa'
import { usePermisos } from '../../hooks/usePermisos'
import { ModalInvitarUsuario } from './ModalInvitarUsuario'
import { TarjetaMiembroMejorada } from './TarjetaMiembroMejorada'
import { ModalEditarRol } from './ModalEditarRol'
import { ModalConfirmarAccion } from './ModalConfirmarAccion'
import { Link } from 'react-router-dom'

export function GestionEquipo({ empresaId }) {
  const { miembros, cargando, recargar, cambiarRol, desactivar, reactivar, eliminar } = useMiembrosEmpresa(empresaId)
  const { puedeAdministrarUsuarios } = usePermisos(empresaId)
  
  const [mostrarModalInvitar, setMostrarModalInvitar] = useState(false)
  const [mostrarModalCambiarRol, setMostrarModalCambiarRol] = useState(false)
  const [mostrarModalConfirmar, setMostrarModalConfirmar] = useState(false)
  const [miembroSeleccionado, setMiembroSeleccionado] = useState(null)
  const [accionPendiente, setAccionPendiente] = useState(null)
  const [filtroEstado, setFiltroEstado] = useState('todos') // 'todos', 'activos', 'inactivos'

  const iconoPorRol = {
    owner: Crown,
    admin: Shield,
    contador: User,
    asistente: User,
    solo_lectura: Eye
  }

  const colorPorRol = {
    owner: 'text-yellow-600 bg-yellow-100',
    admin: 'text-purple-600 bg-purple-100',
    contador: 'text-blue-600 bg-blue-100',
    asistente: 'text-green-600 bg-green-100',
    solo_lectura: 'text-gray-600 bg-gray-100'
  }

  // Calcular estadísticas
  const miembrosActivos = miembros.filter(m => m.activo).length
  const miembrosInactivos = miembros.filter(m => !m.activo).length
  const rolesCounts = miembros.reduce((acc, m) => {
    if (m.activo) acc[m.rol] = (acc[m.rol] || 0) + 1
    return acc
  }, {})

  // Filtrar miembros según filtroEstado
  const miembrosFiltrados = miembros.filter(m => {
    if (filtroEstado === 'activos') return m.activo
    if (filtroEstado === 'inactivos') return !m.activo
    return true // 'todos'
  })

  // Handlers
  const handleCambiarRol = (miembro) => {
    setMiembroSeleccionado(miembro)
    setMostrarModalCambiarRol(true)
  }

  const handleDesactivar = (miembro) => {
    setMiembroSeleccionado(miembro)
    setAccionPendiente({
      tipo: 'desactivar',
      titulo: 'Desactivar Usuario',
      mensaje: `¿Estás seguro que deseas desactivar a ${miembro.nombre_completo || miembro.email}?`,
      textoBoton: 'Desactivar',
      colorBoton: 'red'
    })
    setMostrarModalConfirmar(true)
  }

  const handleReactivar = (miembro) => {
    setMiembroSeleccionado(miembro)
    setAccionPendiente({
      tipo: 'reactivar',
      titulo: 'Reactivar Usuario',
      mensaje: `¿Deseas reactivar a ${miembro.nombre_completo || miembro.email}?`,
      textoBoton: 'Reactivar',
      colorBoton: 'green'
    })
    setMostrarModalConfirmar(true)
  }

  const handleEliminar = (miembro) => {
    setMiembroSeleccionado(miembro)
    setAccionPendiente({
      tipo: 'eliminar',
      titulo: 'Eliminar Usuario',
      mensaje: `⚠️ ATENCIÓN: Esta acción es PERMANENTE.\n\n¿Estás seguro que deseas eliminar permanentemente a ${miembro.nombre_completo || miembro.email}?\n\nEsta acción NO se puede deshacer.`,
      textoBoton: 'Eliminar Permanentemente',
      colorBoton: 'red'
    })
    setMostrarModalConfirmar(true)
  }

  const ejecutarAccion = async () => {
    try {
      switch (accionPendiente?.tipo) {
        case 'desactivar':
          await desactivar(miembroSeleccionado.id)
          break
        case 'reactivar':
          await reactivar(miembroSeleccionado.id)
          break
        case 'eliminar':
          await eliminar(miembroSeleccionado.id)
          break
      }
      setMostrarModalConfirmar(false)
      setMiembroSeleccionado(null)
      setAccionPendiente(null)
    } catch (error) {
      console.error('Error al ejecutar acción:', error)
      alert('Error: ' + error.message)
    }
  }

  if (cargando) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">Cargando equipo...</span>
      </div>
    )
  }

  if (!empresaId) {
    return (
      <div className="text-center p-8">
        <p className="text-gray-600">Selecciona una empresa para ver su equipo</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header con estadísticas */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestión de Equipo</h1>
          <p className="text-gray-600 mt-1">
            {miembros.length} {miembros.length === 1 ? 'miembro' : 'miembros'} total
            {miembrosInactivos > 0 && (
              <span className="text-gray-400"> ({miembrosInactivos} inactivos)</span>
            )}
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Botones de navegación */}
          <Link
            to={`/equipo/auditoria`}
            className="flex items-center gap-2 bg-white border border-gray-300 text-gray-700 px-4 py-2.5 rounded-xl hover:bg-gray-50 transition-all"
          >
            <Activity className="w-5 h-5" />
            <span className="hidden sm:inline">Auditoría</span>
          </Link>
          
          <Link
            to={`/equipo/metricas`}
            className="flex items-center gap-2 bg-white border border-gray-300 text-gray-700 px-4 py-2.5 rounded-xl hover:bg-gray-50 transition-all"
          >
            <TrendingUp className="w-5 h-5" />
            <span className="hidden sm:inline">Métricas</span>
          </Link>

          {puedeAdministrarUsuarios() && (
            <button
              onClick={() => setMostrarModalInvitar(true)}
              className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2.5 rounded-xl hover:shadow-lg transition-all"
            >
              <UserPlus className="w-5 h-5" />
              <span className="hidden sm:inline">Invitar Usuario</span>
              <span className="sm:hidden">Invitar</span>
            </button>
          )}
        </div>
      </div>

      {/* Estadísticas de roles */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {/* Total activos */}
        <div className="bg-white rounded-xl p-4 border border-gray-200">
          <div className="inline-flex p-2 rounded-lg bg-green-100 mb-2">
            <Users className="w-5 h-5 text-green-600" />
          </div>
          <p className="text-2xl font-bold text-gray-900">{miembrosActivos}</p>
          <p className="text-sm text-gray-600">Activos</p>
        </div>

        {/* Por rol */}
        {Object.entries(rolesCounts).map(([rol, cantidad]) => {
          const Icono = iconoPorRol[rol]
          return (
            <div key={rol} className="bg-white rounded-xl p-4 border border-gray-200">
              <div className={`inline-flex p-2 rounded-lg ${colorPorRol[rol]} mb-2`}>
                <Icono className="w-5 h-5" />
              </div>
              <p className="text-2xl font-bold text-gray-900">{cantidad}</p>
              <p className="text-sm text-gray-600 capitalize">{rol.replace('_', ' ')}</p>
            </div>
          )
        })}
      </div>

      {/* Filtros */}
      <div className="flex items-center gap-3 bg-white p-4 rounded-xl border border-gray-200">
        <span className="text-sm font-medium text-gray-700">Mostrar:</span>
        <button 
          onClick={() => setFiltroEstado('todos')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            filtroEstado === 'todos' 
              ? 'bg-blue-100 text-blue-700' 
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          Todos ({miembros.length})
        </button>
        <button 
          onClick={() => setFiltroEstado('activos')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            filtroEstado === 'activos' 
              ? 'bg-green-100 text-green-700' 
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          Solo Activos ({miembrosActivos})
        </button>
        <button 
          onClick={() => setFiltroEstado('inactivos')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            filtroEstado === 'inactivos' 
              ? 'bg-red-100 text-red-700' 
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          Solo Inactivos ({miembrosInactivos})
        </button>
      </div>

      {/* Lista de miembros */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {miembrosFiltrados.map((miembro) => (
          <TarjetaMiembroMejorada
            key={miembro.id}
            miembro={miembro}
            puedeEditar={puedeAdministrarUsuarios()}
            onCambiarRol={() => handleCambiarRol(miembro)}
            onDesactivar={() => handleDesactivar(miembro)}
            onReactivar={() => handleReactivar(miembro)}
            onEliminar={() => handleEliminar(miembro)}
          />
        ))}
      </div>

      {miembrosFiltrados.length === 0 && (
        <div className="text-center py-12 bg-gray-50 rounded-xl">
          <Users className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-600">
            {filtroEstado === 'activos' && 'No hay miembros activos'}
            {filtroEstado === 'inactivos' && 'No hay miembros inactivos'}
            {filtroEstado === 'todos' && 'No hay miembros en este equipo'}
          </p>
          {puedeAdministrarUsuarios() && filtroEstado === 'todos' && (
            <button
              onClick={() => setMostrarModalInvitar(true)}
              className="mt-4 text-blue-600 hover:text-blue-700 font-medium"
            >
              Invitar al primer miembro
            </button>
          )}
        </div>
      )}

      {/* Modales */}
      {mostrarModalInvitar && (
        <ModalInvitarUsuario
          empresaId={empresaId}
          onCerrar={() => setMostrarModalInvitar(false)}
          onInvitado={recargar}
        />
      )}

      {mostrarModalCambiarRol && (
        <ModalEditarRol
          miembro={miembroSeleccionado}
          onCerrar={() => {
            setMostrarModalCambiarRol(false)
            setMiembroSeleccionado(null)
          }}
          onCambiar={async (nuevoRol) => {
            await cambiarRol(miembroSeleccionado.id, nuevoRol)
            setMostrarModalCambiarRol(false)
            setMiembroSeleccionado(null)
          }}
        />
      )}

      {mostrarModalConfirmar && (
        <ModalConfirmarAccion
          titulo={accionPendiente.titulo}
          mensaje={accionPendiente.mensaje}
          textoBoton={accionPendiente.textoBoton}
          colorBoton={accionPendiente.colorBoton}
          onConfirmar={ejecutarAccion}
          onCancelar={() => {
            setMostrarModalConfirmar(false)
            setMiembroSeleccionado(null)
            setAccionPendiente(null)
          }}
        />
      )}
    </div>
  )
}