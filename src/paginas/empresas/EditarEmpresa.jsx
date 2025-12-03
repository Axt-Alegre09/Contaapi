/**
 * Editar Empresa - ContaAPI v2
 * MOBILE-FIRST - Formulario responsive optimizado
 */

import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { 
  Building2, 
  ArrowLeft,
  Save,
  RefreshCw
} from 'lucide-react'
import { empresasServicio } from '../../servicios/empresasServicio'
import { useNotificacion } from '../../componentes/Notificacion'

const TIPOS_CONTRIBUYENTE = [
  { value: 'general', label: 'Contribuyente General' },
  { value: 'simple', label: 'Régimen Simple' },
  { value: 'resimple', label: 'Régimen ReSimple' },
  { value: 'pequeño', label: 'Pequeño Contribuyente' }
]

const MONEDAS = [
  { value: 'PYG', label: 'Guaraníes (₲)' },
  { value: 'USD', label: 'Dólares (US$)' },
  { value: 'BRL', label: 'Reales (R$)' },
  { value: 'ARS', label: 'Pesos Argentinos (AR$)' }
]

export default function EditarEmpresa() {
  const navigate = useNavigate()
  const { id } = useParams()
  const { success, error, NotificacionContainer } = useNotificacion()
  
  const [loading, setLoading] = useState(true)
  const [guardando, setGuardando] = useState(false)
  const [errores, setErrores] = useState({})

  const [formData, setFormData] = useState({
    nombreComercial: '',
    razonSocial: '',
    ruc: '',
    direccion: '',
    telefono: '',
    email: '',
    tipoContribuyente: 'general',
    monedaBase: 'PYG'
  })

  useEffect(() => {
    cargarEmpresa()
  }, [id])

  const cargarEmpresa = async () => {
    setLoading(true)
    try {
      const empresa = await empresasServicio.obtenerEmpresaPorId(id)
      setFormData({
        nombreComercial: empresa.nombre_comercial || '',
        razonSocial: empresa.razon_social || '',
        ruc: empresa.ruc || '',
        direccion: empresa.direccion || '',
        telefono: empresa.telefono || '',
        email: empresa.email || '',
        tipoContribuyente: empresa.tipo_contribuyente || 'general',
        monedaBase: empresa.moneda_base || 'PYG'
      })
    } catch (err) {
      error('Error al cargar los datos de la empresa')
      setTimeout(() => navigate('/empresas'), 2000)
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    
    if (errores[name]) {
      setErrores(prev => ({ ...prev, [name]: null }))
    }
  }

  const validarFormulario = () => {
    const nuevosErrores = {}

    if (!formData.nombreComercial.trim()) {
      nuevosErrores.nombreComercial = 'El nombre comercial es requerido'
    }
    if (!formData.razonSocial.trim()) {
      nuevosErrores.razonSocial = 'La razón social es requerida'
    }
    if (!formData.ruc.trim()) {
      nuevosErrores.ruc = 'El RUC es requerido'
    } else if (!/^\d{7,8}-\d{1}$/.test(formData.ruc)) {
      nuevosErrores.ruc = 'Formato de RUC inválido (ejemplo: 80012345-6)'
    }

    setErrores(nuevosErrores)
    return Object.keys(nuevosErrores).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validarFormulario()) {
      error('Por favor completa todos los campos requeridos')
      return
    }

    setGuardando(true)
    try {
      await empresasServicio.actualizarEmpresa(id, formData)
      success('¡Empresa actualizada exitosamente!')
      
      setTimeout(() => {
        navigate('/empresas')
      }, 1500)
    } catch (err) {
      error(err.message || 'Error al actualizar la empresa')
    } finally {
      setGuardando(false)
    }
  }

  if (loading) {
    return (
      <>
        <NotificacionContainer />
        <div className="min-h-screen flex items-center justify-center p-4">
          <div className="text-center">
            <RefreshCw className="w-10 h-10 md:w-12 md:h-12 text-gray-400 dark:text-gray-500 animate-spin mx-auto mb-4" />
            <p className="text-sm md:text-base text-gray-600 dark:text-gray-400">Cargando datos de la empresa...</p>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <NotificacionContainer />
      
      <div className="space-y-4 md:space-y-6">
        {/* Header - Mobile Optimized */}
        <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm rounded-xl shadow-lg p-4 md:p-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/empresas')}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors flex-shrink-0"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </button>
            <div className="w-10 h-10 md:w-12 md:h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
              <Building2 className="w-5 h-5 md:w-6 md:h-6 text-green-600 dark:text-green-400" />
            </div>
            <div className="min-w-0">
              <h1 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">Editar Empresa</h1>
              <p className="text-sm md:text-base text-gray-600 dark:text-gray-400 truncate">Actualiza los datos de la empresa</p>
            </div>
          </div>
        </div>

        {/* Formulario - Grid responsive */}
        <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm rounded-xl shadow-lg p-4 md:p-6">
          <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              {/* Nombre Comercial */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Nombre Comercial *
                </label>
                <input
                  type="text"
                  name="nombreComercial"
                  value={formData.nombreComercial}
                  onChange={handleChange}
                  className={`w-full px-4 py-2.5 md:py-2 border ${
                    errores.nombreComercial 
                      ? 'border-red-500 dark:border-red-400' 
                      : 'border-gray-300 dark:border-gray-600'
                  } rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-base`}
                />
                {errores.nombreComercial && (
                  <p className="mt-1 text-sm text-red-500 dark:text-red-400">{errores.nombreComercial}</p>
                )}
              </div>

              {/* Razón Social */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Razón Social *
                </label>
                <input
                  type="text"
                  name="razonSocial"
                  value={formData.razonSocial}
                  onChange={handleChange}
                  className={`w-full px-4 py-2.5 md:py-2 border ${
                    errores.razonSocial 
                      ? 'border-red-500 dark:border-red-400' 
                      : 'border-gray-300 dark:border-gray-600'
                  } rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-base`}
                />
                {errores.razonSocial && (
                  <p className="mt-1 text-sm text-red-500 dark:text-red-400">{errores.razonSocial}</p>
                )}
              </div>

              {/* RUC */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  RUC *
                </label>
                <input
                  type="text"
                  name="ruc"
                  value={formData.ruc}
                  onChange={handleChange}
                  className={`w-full px-4 py-2.5 md:py-2 border ${
                    errores.ruc 
                      ? 'border-red-500 dark:border-red-400' 
                      : 'border-gray-300 dark:border-gray-600'
                  } rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-base`}
                />
                {errores.ruc && (
                  <p className="mt-1 text-sm text-red-500 dark:text-red-400">{errores.ruc}</p>
                )}
              </div>

              {/* Tipo de Contribuyente */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Tipo de Contribuyente
                </label>
                <select
                  name="tipoContribuyente"
                  value={formData.tipoContribuyente}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 md:py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-base"
                >
                  {TIPOS_CONTRIBUYENTE.map(tipo => (
                    <option key={tipo.value} value={tipo.value}>
                      {tipo.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Dirección */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Dirección
                </label>
                <input
                  type="text"
                  name="direccion"
                  value={formData.direccion}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 md:py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-base"
                />
              </div>

              {/* Teléfono */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Teléfono
                </label>
                <input
                  type="tel"
                  name="telefono"
                  value={formData.telefono}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 md:py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-base"
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 md:py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-base"
                />
              </div>

              {/* Moneda Base */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Moneda Base
                </label>
                <select
                  name="monedaBase"
                  value={formData.monedaBase}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 md:py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-base"
                >
                  {MONEDAS.map(moneda => (
                    <option key={moneda.value} value={moneda.value}>
                      {moneda.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Botones - Stack en móvil */}
            <div className="flex flex-col md:flex-row justify-end gap-3 pt-4 md:pt-6 border-t border-gray-200 dark:border-gray-700">
              <button
                type="button"
                onClick={() => navigate('/empresas')}
                disabled={guardando}
                className="w-full md:w-auto px-6 py-2.5 md:py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 disabled:opacity-50 transition-colors text-base md:text-sm font-medium"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={guardando}
                className="w-full md:w-auto px-6 py-2.5 md:py-2 bg-green-600 dark:bg-green-500 text-white rounded-lg hover:bg-green-700 dark:hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-colors text-base md:text-sm font-medium"
              >
                <Save className="w-5 h-5" />
                {guardando ? 'Guardando...' : 'Guardar Cambios'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  )
}