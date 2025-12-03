/**
 * Detalle Empresa - ContaAPI v2
 * Vista de solo lectura con notificaciones
 */

import { useState, useEffect } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { 
  Building2, 
  ArrowLeft,
  Edit2,
  RefreshCw,
  MapPin,
  Phone,
  Mail,
  Calendar,
  DollarSign,
  Trash2
} from 'lucide-react'
import { empresasServicio } from '../../servicios/empresasServicio'
import { useNotificacion } from '../../componentes/Notificacion'
import { ModalConfirmacion } from '../../componentes/ModalConfirmacion'
import { supabase } from '../../configuracion/supabase'

export default function DetalleEmpresa() {
  const navigate = useNavigate()
  const { id } = useParams()
  const { success, error, warning, NotificacionContainer } = useNotificacion()
  
  const [empresa, setEmpresa] = useState(null)
  const [loading, setLoading] = useState(true)
  const [modalEliminar, setModalEliminar] = useState(false)

  useEffect(() => {
    cargarEmpresa()
  }, [id])

  const cargarEmpresa = async () => {
    setLoading(true)
    try {
      const data = await empresasServicio.obtenerEmpresaPorId(id)
      setEmpresa(data)
    } catch (err) {
      error('Error al cargar los datos de la empresa')
      setTimeout(() => navigate('/empresas'), 2000)
    } finally {
      setLoading(false)
    }
  }

  const abrirModalEliminar = () => {
    // Validar permisos (esto debería venir del rol del usuario)
    // Por ahora asumimos que puede eliminar
    setModalEliminar(true)
  }

  const confirmarEliminar = async (password) => {
    try {
      // Verificar contraseña del usuario actual
      const { error: errorAuth } = await supabase.auth.signInWithPassword({
        email: (await supabase.auth.getUser()).data.user.email,
        password: password
      })

      if (errorAuth) {
        error('Contraseña incorrecta')
        throw new Error('Contraseña incorrecta')
      }

      // Eliminar empresa
      await empresasServicio.eliminarEmpresa(id)
      success('Empresa eliminada exitosamente')
      
      setTimeout(() => {
        navigate('/empresas')
      }, 1500)
    } catch (err) {
      if (err.message !== 'Contraseña incorrecta') {
        error('Error al eliminar la empresa')
      }
      throw err
    }
  }

  const formatearFecha = (fecha) => {
    if (!fecha) return 'N/A'
    return new Date(fecha).toLocaleDateString('es-PY', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    })
  }

  const getTipoContribuyenteLabel = (tipo) => {
    const tipos = {
      'general': 'Contribuyente General',
      'simple': 'Régimen Simple',
      'resimple': 'Régimen ReSimple',
      'pequeño': 'Pequeño Contribuyente'
    }
    return tipos[tipo] || tipo
  }

  if (loading) {
    return (
      <>
        <NotificacionContainer />
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <RefreshCw className="w-12 h-12 text-gray-400 dark:text-gray-500 animate-spin mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400">Cargando datos de la empresa...</p>
          </div>
        </div>
      </>
    )
  }

  if (!empresa) return null

  return (
    <>
      <NotificacionContainer />
      
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate('/empresas')}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </button>
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center text-white font-bold text-xl">
                {empresa.nombre_comercial?.charAt(0).toUpperCase()}
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{empresa.nombre_comercial}</h1>
                <p className="text-gray-600 dark:text-gray-400">{empresa.razon_social}</p>
              </div>
            </div>

            <div className="flex gap-3">
              <Link
                to={`/empresas/${id}/editar`}
                className="px-4 py-2 bg-green-600 dark:bg-green-500 text-white rounded-lg hover:bg-green-700 dark:hover:bg-green-600 flex items-center gap-2 transition-colors"
              >
                <Edit2 className="w-5 h-5" />
                Editar
              </Link>
              <button
                onClick={abrirModalEliminar}
                className="px-4 py-2 bg-red-600 dark:bg-red-500 text-white rounded-lg hover:bg-red-700 dark:hover:bg-red-600 flex items-center gap-2 transition-colors"
              >
                <Trash2 className="w-5 h-5" />
                Eliminar
              </button>
            </div>
          </div>
        </div>

        {/* Información Principal */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Datos Generales */}
          <div className="lg:col-span-2 bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm rounded-xl shadow-lg p-6">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
              <Building2 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              Datos Generales
            </h2>
            
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="text-sm font-medium text-gray-500 dark:text-gray-400">RUC</label>
                <p className="text-lg font-semibold text-gray-900 dark:text-white font-mono">{empresa.ruc}</p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Tipo de Contribuyente</label>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                  {getTipoContribuyenteLabel(empresa.tipo_contribuyente)}
                </p>
              </div>

              {empresa.direccion && (
                <div className="col-span-2">
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400 flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    Dirección
                  </label>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">{empresa.direccion}</p>
                </div>
              )}

              {empresa.telefono && (
                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400 flex items-center gap-2">
                    <Phone className="w-4 h-4" />
                    Teléfono
                  </label>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">{empresa.telefono}</p>
                </div>
              )}

              {empresa.email && (
                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400 flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    Email
                  </label>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">{empresa.email}</p>
                </div>
              )}
            </div>
          </div>

          {/* Información Adicional */}
          <div className="space-y-6">
            {/* Estado */}
            <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm rounded-xl shadow-lg p-6">
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Estado</h3>
              <span className={`inline-flex px-3 py-1 text-sm font-medium rounded-full ${
                empresa.estado === 'activa'
                  ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                  : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
              }`}>
                {empresa.estado === 'activa' ? 'Activa' : 'Inactiva'}
              </span>
            </div>

            {/* Moneda Base */}
            <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm rounded-xl shadow-lg p-6">
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2 flex items-center gap-2">
                <DollarSign className="w-4 h-4" />
                Moneda Base
              </h3>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{empresa.moneda_base}</p>
            </div>

            {/* Fechas */}
            <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm rounded-xl shadow-lg p-6">
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-4 flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Información Temporal
              </h3>
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Creada</p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {formatearFecha(empresa.created_at)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Última actualización</p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {formatearFecha(empresa.updated_at)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de Confirmación de Eliminación */}
      <ModalConfirmacion
        isOpen={modalEliminar}
        onClose={() => setModalEliminar(false)}
        onConfirmar={confirmarEliminar}
        titulo="Eliminar Empresa"
        mensaje={`¿Estás seguro de que deseas eliminar "${empresa?.nombre_comercial}"? Esta acción no se puede deshacer.`}
        requierePassword={true}
        tipo="danger"
      />
    </>
  )
}