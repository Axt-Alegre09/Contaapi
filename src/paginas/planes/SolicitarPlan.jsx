import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { supabase } from '../../configuracion/supabase'
import { ArrowLeft, Building2, User, Mail, Phone, CreditCard, FileText, Upload, CheckCircle, XCircle, AlertCircle, X, Landmark } from 'lucide-react'

export function SolicitarPlan() {
  const navigate = useNavigate()
  const location = useLocation()
  const { plan } = location.state || {}

  const [formulario, setFormulario] = useState({
    nombreEmpresa: '',
    ruc: '',
    telefono: '',
    direccion: '',
    nombreContacto: '',
    emailContacto: '',
    banco: '',
    numeroTransaccion: ''
  })

  const [archivo, setArchivo] = useState(null)
  const [vistaPrevia, setVistaPrevia] = useState(null)
  const [cargando, setCargando] = useState(false)
  const [notificacion, setNotificacion] = useState(null)

  // TUS datos bancarios (del negocio)
  const datosBancarios = [
    {
      banco: 'Banco Itaú',
      titular: 'Marcos Adrian Alegre Rodriguez',
      aliasCi: '5773660',
      numeroCuenta: '25253184',
      ci: '5773660',
      moneda: 'Guaraníes'
    },
    {
      banco: 'Banco Ueno',
      titular: 'Marcos Adrian Alegre Rodriguez',
      aliasCelular: '+595992544305',
      numeroCuenta: '61967185',
      ci: '5773660',
      moneda: 'Guaraníes'
    }
  ]

  // Lista de bancos disponibles en Paraguay
  const bancosDisponibles = [
    'Banco Itaú',
    'Banco Continental',
    'Banco Regional',
    'Banco Familiar',
    'Banco Atlas',
    'Banco GNB',
    'Bancop',
    'Vision Banco',
    'Banco Basa',
    'Banco Rio',
    'Banco Ueno'
  ]

  const mostrarNotificacion = (tipo, mensaje) => {
    setNotificacion({ tipo, mensaje })
    setTimeout(() => setNotificacion(null), 5000)
  }

  const validarImagen = (archivo) => {
    const tiposPermitidos = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
    const tamañoMaximo = 5 * 1024 * 1024 // 5MB

    if (!tiposPermitidos.includes(archivo.type)) {
      mostrarNotificacion('error', 'Solo se permiten imágenes (JPG, PNG, WEBP)')
      return false
    }

    if (archivo.size > tamañoMaximo) {
      mostrarNotificacion('error', 'La imagen no debe superar los 5MB')
      return false
    }

    return true
  }

  const manejarArchivoSeleccionado = (e) => {
    const archivoSeleccionado = e.target.files[0]
    
    if (archivoSeleccionado && validarImagen(archivoSeleccionado)) {
      setArchivo(archivoSeleccionado)
      
      const lector = new FileReader()
      lector.onloadend = () => {
        setVistaPrevia(lector.result)
      }
      lector.readAsDataURL(archivoSeleccionado)
    } else {
      e.target.value = null
    }
  }

  const eliminarArchivo = () => {
    setArchivo(null)
    setVistaPrevia(null)
    const input = document.getElementById('comprobante')
    if (input) input.value = null
  }

  const manejarCambio = (e) => {
    setFormulario({
      ...formulario,
      [e.target.name]: e.target.value
    })
  }

  const validarFormulario = () => {
    if (!formulario.nombreContacto.trim()) {
      mostrarNotificacion('error', 'El nombre de contacto es obligatorio')
      return false
    }
    if (!formulario.emailContacto.trim() || !formulario.emailContacto.includes('@')) {
      mostrarNotificacion('error', 'Ingresa un email válido')
      return false
    }
    if (!formulario.telefono.trim()) {
      mostrarNotificacion('error', 'El teléfono es obligatorio')
      return false
    }
    if (!formulario.banco) {
      mostrarNotificacion('error', 'Selecciona un banco')
      return false
    }
    if (!formulario.numeroTransaccion.trim()) {
      mostrarNotificacion('error', 'El número de transacción es obligatorio')
      return false
    }
    if (!archivo) {
      mostrarNotificacion('error', 'Debes subir el comprobante de pago')
      return false
    }
    return true
  }

  const manejarEnvio = async (e) => {
    e.preventDefault()

    if (!validarFormulario()) return

    setCargando(true)

    try {
      // 1. Subir el comprobante
      const nombreArchivo = `${Date.now()}_${archivo.name}`
      const { data: datosSubida, error: errorSubida } = await supabase.storage
        .from('Contaapi')
        .upload(`comprobantes/${nombreArchivo}`, archivo)

      if (errorSubida) throw errorSubida

      // 2. Obtener URL pública
      const { data: { publicUrl } } = supabase.storage
        .from('Contaapi')
        .getPublicUrl(`comprobantes/${nombreArchivo}`)

      // 3. Obtener usuario actual
      const { data: { user } } = await supabase.auth.getUser()

      // 4. Guardar solicitud en la tabla solicitudes_pago
      const { error: errorInsertar } = await supabase
        .from('solicitudes_pago')
        .insert([{
          user_id: user.id,
          plan_id: plan.id,
          nombre_completo: formulario.nombreContacto,
          email: formulario.emailContacto,
          telefono: formulario.telefono,
          ruc_ci: formulario.ruc || null,
          nombre_empresa: formulario.nombreEmpresa || null,
          monto: plan.precio_guaranies,
          comprobante_url: publicUrl,
          numero_transaccion: formulario.numeroTransaccion,
          banco_utilizado: formulario.banco,
          estado: 'pendiente'
        }])

      if (errorInsertar) throw errorInsertar

      mostrarNotificacion('success', '¡Solicitud enviada exitosamente!')
      
      setTimeout(() => {
        navigate('/planes')
      }, 2000)

    } catch (error) {
      console.error('Error:', error)
      mostrarNotificacion('error', `Error al enviar la solicitud: ${error.message}`)
    } finally {
      setCargando(false)
    }
  }

  // Validar que existe el plan
  if (!plan || !plan.id) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
        <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-lg p-8 border border-white text-center max-w-md">
          <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Plan no seleccionado</h2>
          <p className="text-gray-600 mb-6">
            Debes seleccionar un plan primero para poder continuar.
          </p>
          <button
            onClick={() => navigate('/planes')}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3 px-6 rounded-xl transition-all"
          >
            Ver Planes Disponibles
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Notificación personalizada */}
      {notificacion && (
        <div className="fixed top-4 right-4 z-50 max-w-md animate-slide-in">
          <div className={`rounded-xl shadow-2xl p-4 flex items-start gap-3 ${
            notificacion.tipo === 'success' ? 'bg-green-50 border-2 border-green-500' :
            notificacion.tipo === 'error' ? 'bg-red-50 border-2 border-red-500' :
            'bg-yellow-50 border-2 border-yellow-500'
          }`}>
            {notificacion.tipo === 'success' && <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0" />}
            {notificacion.tipo === 'error' && <XCircle className="w-6 h-6 text-red-600 flex-shrink-0" />}
            {notificacion.tipo === 'warning' && <AlertCircle className="w-6 h-6 text-yellow-600 flex-shrink-0" />}
            
            <p className={`flex-1 font-semibold ${
              notificacion.tipo === 'success' ? 'text-green-800' :
              notificacion.tipo === 'error' ? 'text-red-800' :
              'text-yellow-800'
            }`}>
              {notificacion.mensaje}
            </p>
            
            <button 
              onClick={() => setNotificacion(null)}
              className="text-gray-500 hover:text-gray-700"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      <div className="container mx-auto px-4 py-6 max-w-[1600px]">
        {/* Header Compacto */}
        <div className="mb-6">
          <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-lg p-4 border border-white flex items-center justify-between">
            <button
              onClick={() => navigate('/planes')}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            
            <div className="flex-1 text-center">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Completar Solicitud
              </h1>
              <p className="text-sm text-gray-600">
                {plan.nombre} - Gs. {plan.precio_guaranies?.toLocaleString() || '0'}
              </p>
            </div>
            
            <div className="w-8"></div>
          </div>
        </div>

        <form onSubmit={manejarEnvio}>
          {/* Datos para Transferencia - Ancho Completo */}
          <div className="mb-6">
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 backdrop-blur-lg rounded-2xl shadow-lg p-6 border-2 border-green-200">
              <div className="flex items-center gap-3 mb-5">
                <div className="p-2 bg-green-500 rounded-lg">
                  <Landmark className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-xl font-bold text-gray-800">Datos para Transferencia</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {datosBancarios.map((cuenta, index) => (
                  <div key={index} className="p-5 bg-white rounded-xl border border-green-200 shadow-sm">
                    <p className="font-bold text-green-700 text-lg mb-3">{cuenta.banco}</p>
                    <div className="space-y-2">
                      <p className="text-gray-700 text-sm"><strong>Titular:</strong> {cuenta.titular}</p>
                      {cuenta.aliasCi && <p className="text-gray-700 text-sm"><strong>Alias CI:</strong> {cuenta.aliasCi}</p>}
                      {cuenta.aliasCelular && <p className="text-gray-700 text-sm"><strong>Alias Celular:</strong> {cuenta.aliasCelular}</p>}
                      <p className="text-gray-700 text-sm"><strong>Nro. Cuenta:</strong> {cuenta.numeroCuenta}</p>
                      <p className="text-gray-700 text-sm"><strong>CI:</strong> {cuenta.ci}</p>
                      <p className="text-gray-700 text-sm"><strong>Moneda:</strong> {cuenta.moneda}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-5 p-4 bg-yellow-50 rounded-xl border border-yellow-200">
                <p className="text-sm text-yellow-800">
                  <strong>💡 Importante:</strong> Incluye tu email en el concepto de la transferencia para procesar más rápido tu solicitud.
                </p>
              </div>
            </div>
          </div>

          {/* 2 Columnas: Formularios */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Columna Izquierda */}
            <div className="space-y-6">
              {/* Datos de Contacto */}
              <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-lg p-6 border border-white">
                <div className="flex items-center gap-3 mb-5">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <User className="w-6 h-6 text-purple-600" />
                  </div>
                  <h2 className="text-xl font-bold text-gray-800">Datos de Contacto</h2>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nombre Completo <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="nombreContacto"
                      value={formulario.nombreContacto}
                      onChange={manejarCambio}
                      placeholder="Ej: Juan Pérez"
                      required
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="email"
                        name="emailContacto"
                        value={formulario.emailContacto}
                        onChange={manejarCambio}
                        placeholder="ejemplo@correo.com"
                        required
                        className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Teléfono / WhatsApp <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="tel"
                        name="telefono"
                        value={formulario.telefono}
                        onChange={manejarCambio}
                        placeholder="+595 XXX XXX XXX"
                        required
                        className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Datos de la Empresa */}
              <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-lg p-6 border border-white">
                <div className="flex items-center gap-3 mb-5">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Building2 className="w-6 h-6 text-blue-600" />
                  </div>
                  <h2 className="text-xl font-bold text-gray-800">Datos de la Empresa</h2>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nombre de Empresa (opcional)
                    </label>
                    <input
                      type="text"
                      name="nombreEmpresa"
                      value={formulario.nombreEmpresa}
                      onChange={manejarCambio}
                      placeholder="Ej: Mi Empresa S.A."
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      RUC / CI (opcional)
                    </label>
                    <input
                      type="text"
                      name="ruc"
                      value={formulario.ruc}
                      onChange={manejarCambio}
                      placeholder="Ej: 12345678-9"
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Dirección (opcional)
                    </label>
                    <input
                      type="text"
                      name="direccion"
                      value={formulario.direccion}
                      onChange={manejarCambio}
                      placeholder="Ej: Av. Principal 123"
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Columna Derecha */}
            <div className="space-y-6">
              {/* Datos de Pago */}
              <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-lg p-6 border border-white">
                <div className="flex items-center gap-3 mb-5">
                  <div className="p-2 bg-orange-100 rounded-lg">
                    <CreditCard className="w-6 h-6 text-orange-600" />
                  </div>
                  <h2 className="text-xl font-bold text-gray-800">Datos de Pago</h2>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Banco Utilizado <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="banco"
                      value={formulario.banco}
                      onChange={manejarCambio}
                      required
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                    >
                      <option value="">Selecciona un banco</option>
                      {bancosDisponibles.map(banco => (
                        <option key={banco} value={banco}>{banco}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Número de Transacción <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <FileText className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="text"
                        name="numeroTransaccion"
                        value={formulario.numeroTransaccion}
                        onChange={manejarCambio}
                        placeholder="Ej: TRX123456789"
                        required
                        className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Comprobante de Pago */}
              <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-lg p-6 border border-white">
                <div className="flex items-center gap-3 mb-5">
                  <div className="p-2 bg-indigo-100 rounded-lg">
                    <Upload className="w-6 h-6 text-indigo-600" />
                  </div>
                  <h2 className="text-xl font-bold text-gray-800">Comprobante de Pago</h2>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Subir comprobante <span className="text-red-500">*</span>
                  </label>
                  
                  {!vistaPrevia ? (
                    <label className="block w-full cursor-pointer">
                      <div className="border-3 border-dashed border-gray-300 rounded-xl p-10 hover:border-indigo-500 hover:bg-indigo-50 transition-all text-center">
                        <Upload className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-600 font-medium mb-2">
                          Haz clic para seleccionar
                        </p>
                        <p className="text-sm text-gray-500">
                          JPG, PNG o WEBP (máx. 5MB)
                        </p>
                      </div>
                      <input
                        id="comprobante"
                        type="file"
                        accept="image/jpeg,image/jpg,image/png,image/webp"
                        onChange={manejarArchivoSeleccionado}
                        className="hidden"
                      />
                    </label>
                  ) : (
                    <div className="relative">
                      <img
                        src={vistaPrevia}
                        alt="Vista previa"
                        className="w-full h-64 object-contain rounded-xl border-2 border-gray-200 bg-gray-50"
                      />
                      <button
                        type="button"
                        onClick={eliminarArchivo}
                        className="absolute top-2 right-2 p-2 bg-red-500 hover:bg-red-600 text-white rounded-full shadow-lg transition-all"
                      >
                        <X className="w-5 h-5" />
                      </button>
                      <p className="text-sm text-gray-600 mt-3 text-center truncate">
                        {archivo.name}
                      </p>
                    </div>
                  )}
                </div>

                <div className="mt-4 p-4 bg-blue-50 rounded-xl border border-blue-200">
                  <p className="text-sm text-blue-800">
                    <strong>💡 Tip:</strong> Asegúrate de que el comprobante sea legible y contenga todos los datos de la transferencia.
                  </p>
                </div>
              </div>

              {/* Botón de Envío */}
              <button
                type="submit"
                disabled={cargando}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold py-4 rounded-xl transition-all duration-200 transform hover:scale-[1.02] shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {cargando ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    Enviando solicitud...
                  </span>
                ) : (
                  'Enviar Solicitud'
                )}
              </button>
            </div>
          </div>
        </form>
      </div>

      <style>{`
        @keyframes slide-in {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        .animate-slide-in {
          animation: slide-in 0.3s ease-out;
        }
      `}</style>
    </div>
  )
}