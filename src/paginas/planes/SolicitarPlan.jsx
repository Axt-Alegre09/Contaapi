import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { servicioPlanes } from '../../servicios/planes'
import { Upload, Building2, Mail, Phone, CreditCard, FileText, User, AlertCircle, CheckCircle2, MessageSquare } from 'lucide-react'

export function SolicitarPlan() {
  const navigate = useNavigate()
  const location = useLocation()
  const plan = location.state?.plan

  const [formData, setFormData] = useState({
    nombre_completo: '',
    email: '',
    telefono: '',
    ruc_ci: '',
    nombre_empresa: '',
    numero_transaccion: '',
    banco_utilizado: ''
  })

  const [archivo, setArchivo] = useState(null)
  const [errores, setErrores] = useState({})
  const [cargando, setCargando] = useState(false)
  const [enviado, setEnviado] = useState(false)

  if (!plan) {
    navigate('/planes')
    return null
  }

  const manejarCambio = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
    if (errores[e.target.name]) {
      setErrores({ ...errores, [e.target.name]: '' })
    }
  }

  const manejarArchivo = (e) => {
    const file = e.target.files[0]
    if (file) {
      // Validar tipo de archivo
      const tiposPermitidos = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf']
      if (!tiposPermitidos.includes(file.type)) {
        setErrores({ ...errores, archivo: 'Solo se permiten archivos JPG, PNG o PDF' })
        return
      }
      
      // Validar tamaño (5MB)
      if (file.size > 5 * 1024 * 1024) {
        setErrores({ ...errores, archivo: 'El archivo no debe superar los 5MB' })
        return
      }
      
      setArchivo(file)
      setErrores({ ...errores, archivo: '' })
    }
  }

  const validarFormulario = () => {
    const nuevosErrores = {}

    if (!formData.nombre_completo.trim()) {
      nuevosErrores.nombre_completo = 'El nombre completo es requerido'
    }

    if (!formData.email.trim()) {
      nuevosErrores.email = 'El email es requerido'
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      nuevosErrores.email = 'Email inválido'
    }

    if (!formData.telefono.trim()) {
      nuevosErrores.telefono = 'El teléfono es requerido'
    }

    if (!formData.banco_utilizado) {
      nuevosErrores.banco_utilizado = 'Selecciona un banco'
    }

    if (!formData.numero_transaccion.trim()) {
      nuevosErrores.numero_transaccion = 'El número de transacción es requerido'
    }

    if (!archivo) {
      nuevosErrores.archivo = 'Debes subir el comprobante de pago'
    }

    setErrores(nuevosErrores)
    return Object.keys(nuevosErrores).length === 0
  }

  const manejarSubmit = async (e) => {
    e.preventDefault()
    
    if (!validarFormulario()) return

    setCargando(true)

    try {
      // Crear la solicitud primero
      const solicitud = await servicioPlanes.crearSolicitudPago({
        plan_id: plan.id,
        nombre_completo: formData.nombre_completo,
        email: formData.email,
        telefono: formData.telefono,
        ruc_ci: formData.ruc_ci || null,
        nombre_empresa: formData.nombre_empresa || null,
        monto: plan.precio_guaranies,
        numero_transaccion: formData.numero_transaccion,
        banco_utilizado: formData.banco_utilizado
      })

      // Subir el comprobante
      const comprobanteUrl = await servicioPlanes.subirComprobante(archivo, solicitud.id)

      // Actualizar la solicitud con la URL del comprobante
      await servicioPlanes.actualizarComprobante(solicitud.id, comprobanteUrl)

      setEnviado(true)
    } catch (error) {
      console.error('Error al enviar solicitud:', error)
      alert('Error al enviar la solicitud. Por favor intenta nuevamente.')
    } finally {
      setCargando(false)
    }
  }

  const formatearPrecio = (precio) => {
    return new Intl.NumberFormat('es-PY', {
      style: 'currency',
      currency: 'PYG',
      minimumFractionDigits: 0
    }).format(precio)
  }

  const abrirWhatsApp = () => {
    window.open('https://wa.me/595992544305', '_blank')
  }

  // Pantalla de confirmación
  if (enviado) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8 text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-6">
            <CheckCircle2 className="w-10 h-10 text-green-600" />
          </div>
          
          <h2 className="text-3xl font-bold text-gray-800 mb-4">
            ¡Solicitud Recibida!
          </h2>
          
          <p className="text-gray-600 mb-6">
            Hemos recibido tu solicitud de pago. Recibirás un email de confirmación en las próximas 24-48 horas.
          </p>

          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
            <p className="text-sm text-blue-800">
              Mientras tanto, puedes seguir usando tu cuenta demo sin restricciones.
            </p>
          </div>

          <button
            onClick={() => navigate('/')}
            className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 transform hover:scale-105 shadow-lg"
          >
            Volver al Dashboard
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
            Completar Compra
          </h1>
          <p className="text-gray-600">
            Plan {plan.nombre} - {formatearPrecio(plan.precio_guaranies)}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Columna izquierda - Datos bancarios */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Building2 className="w-6 h-6 text-blue-600" />
                Datos para Transferencia
              </h3>

              {/* Banco Itaú */}
              <div className="mb-6 p-4 bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl border border-orange-200">
                <h4 className="font-bold text-orange-900 mb-3">Banco Itaú</h4>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="font-semibold text-orange-800">Titular:</span>
                    <p className="text-orange-900">Marcos Adrian Alegre Rodriguez</p>
                  </div>
                  <div>
                    <span className="font-semibold text-orange-800">Alias CI:</span>
                    <p className="text-orange-900 font-mono">5773660</p>
                  </div>
                  <div>
                    <span className="font-semibold text-orange-800">Nro. Cuenta:</span>
                    <p className="text-orange-900 font-mono">25253184</p>
                  </div>
                  <div>
                    <span className="font-semibold text-orange-800">CI:</span>
                    <p className="text-orange-900 font-mono">5773660</p>
                  </div>
                  <div>
                    <span className="font-semibold text-orange-800">Moneda:</span>
                    <p className="text-orange-900">Guaraníes</p>
                  </div>
                </div>
              </div>

              {/* Banco Ueno */}
              <div className="mb-6 p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl border border-blue-200">
                <h4 className="font-bold text-blue-900 mb-3">Banco Ueno</h4>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="font-semibold text-blue-800">Titular:</span>
                    <p className="text-blue-900">Marcos Adrian Alegre Rodriguez</p>
                  </div>
                  <div>
                    <span className="font-semibold text-blue-800">Alias Celular:</span>
                    <p className="text-blue-900 font-mono">+595992544305</p>
                  </div>
                  <div>
                    <span className="font-semibold text-blue-800">Nro. Cuenta:</span>
                    <p className="text-blue-900 font-mono">61967185</p>
                  </div>
                  <div>
                    <span className="font-semibold text-blue-800">CI:</span>
                    <p className="text-blue-900 font-mono">5773660</p>
                  </div>
                  <div>
                    <span className="font-semibold text-blue-800">Moneda:</span>
                    <p className="text-blue-900">Guaraníes</p>
                  </div>
                </div>
              </div>

              {/* Concepto importante */}
              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-xl mb-4">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-semibold text-yellow-900 mb-1">IMPORTANTE</p>
                    <p className="text-xs text-yellow-800">
                      Incluir tu email en el concepto de la transferencia para procesar más rápido tu solicitud.
                    </p>
                  </div>
                </div>
              </div>

              {/* Botón WhatsApp */}
              <button
                type="button"
                onClick={abrirWhatsApp}
                className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 shadow-lg"
              >
                <MessageSquare className="w-5 h-5" />
                Contactar por WhatsApp
              </button>
            </div>
          </div>

          {/* Columna derecha - Formulario */}
          <div className="lg:col-span-2">
            <form onSubmit={manejarSubmit} className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-6">Datos de Contacto</h3>

              <div className="space-y-4">
                {/* Nombre completo */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Nombre Completo *
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      name="nombre_completo"
                      value={formData.nombre_completo}
                      onChange={manejarCambio}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      placeholder="Ej: Juan Pérez"
                    />
                  </div>
                  {errores.nombre_completo && (
                    <p className="text-red-500 text-xs mt-1">{errores.nombre_completo}</p>
                  )}
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Email *
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={manejarCambio}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      placeholder="ejemplo@correo.com"
                    />
                  </div>
                  {errores.email && (
                    <p className="text-red-500 text-xs mt-1">{errores.email}</p>
                  )}
                </div>

                {/* Teléfono */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Teléfono / WhatsApp *
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="tel"
                      name="telefono"
                      value={formData.telefono}
                      onChange={manejarCambio}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      placeholder="+595 XXX XXX XXX"
                    />
                  </div>
                  {errores.telefono && (
                    <p className="text-red-500 text-xs mt-1">{errores.telefono}</p>
                  )}
                </div>

                {/* RUC/CI (opcional) */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    RUC / CI (opcional)
                  </label>
                  <div className="relative">
                    <FileText className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      name="ruc_ci"
                      value={formData.ruc_ci}
                      onChange={manejarCambio}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      placeholder="Ej: 12345678-9"
                    />
                  </div>
                </div>

                {/* Nombre empresa (opcional) */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Nombre de Empresa (opcional)
                  </label>
                  <div className="relative">
                    <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      name="nombre_empresa"
                      value={formData.nombre_empresa}
                      onChange={manejarCambio}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      placeholder="Ej: Mi Empresa S.A."
                    />
                  </div>
                </div>

                {/* Banco utilizado */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Banco Utilizado *
                  </label>
                  <select
                    name="banco_utilizado"
                    value={formData.banco_utilizado}
                    onChange={manejarCambio}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  >
                    <option value="">Selecciona un banco</option>
                    <option value="Itaú">Banco Itaú</option>
                    <option value="Ueno">Banco Ueno</option>
                  </select>
                  {errores.banco_utilizado && (
                    <p className="text-red-500 text-xs mt-1">{errores.banco_utilizado}</p>
                  )}
                </div>

                {/* Número de transacción */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Número de Transacción *
                  </label>
                  <div className="relative">
                    <CreditCard className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      name="numero_transaccion"
                      value={formData.numero_transaccion}
                      onChange={manejarCambio}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      placeholder="Ej: TRX123456789"
                    />
                  </div>
                  {errores.numero_transaccion && (
                    <p className="text-red-500 text-xs mt-1">{errores.numero_transaccion}</p>
                  )}
                </div>

                {/* Comprobante */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Comprobante de Pago *
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-blue-500 transition-colors">
                    <Upload className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-sm text-gray-600 mb-2">
                      Arrastra tu archivo o haz clic para seleccionar
                    </p>
                    <p className="text-xs text-gray-500 mb-3">
                      JPG, PNG o PDF (máx. 5MB)
                    </p>
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/jpg,application/pdf"
                      onChange={manejarArchivo}
                      className="hidden"
                      id="comprobante"
                    />
                    <label
                      htmlFor="comprobante"
                      className="inline-block bg-blue-50 hover:bg-blue-100 text-blue-600 font-semibold py-2 px-6 rounded-lg cursor-pointer transition-colors"
                    >
                      Seleccionar archivo
                    </label>
                    {archivo && (
                      <p className="text-sm text-green-600 mt-3 font-medium">
                        ✓ {archivo.name}
                      </p>
                    )}
                  </div>
                  {errores.archivo && (
                    <p className="text-red-500 text-xs mt-1">{errores.archivo}</p>
                  )}
                </div>
              </div>

              {/* Botones */}
              <div className="flex flex-col sm:flex-row gap-4 mt-8">
                <button
                  type="button"
                  onClick={() => navigate('/planes')}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-3 px-6 rounded-xl transition-all"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={cargando}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 transform hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {cargando ? 'Enviando...' : 'Enviar Solicitud'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}