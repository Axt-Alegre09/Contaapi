import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { servicioPlanes } from '../../servicios/planes'
import { Check, Zap, Crown, Gift } from 'lucide-react'

export function Planes() {
  const [planes, setPlanes] = useState([])
  const [cargando, setCargando] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    cargarPlanes()
  }, [])

  const cargarPlanes = async () => {
    try {
      const data = await servicioPlanes.obtenerPlanes()
      setPlanes(data)
    } catch (error) {
      console.error('Error al cargar planes:', error)
    } finally {
      setCargando(false)
    }
  }

  const obtenerIconoPlan = (nombre) => {
    switch (nombre) {
      case 'Demo': return <Gift className="w-8 h-8" />
      case 'Mensual': return <Zap className="w-8 h-8" />
      case 'Trimestral': return <Check className="w-8 h-8" />
      case 'Anual': return <Crown className="w-8 h-8" />
      default: return <Check className="w-8 h-8" />
    }
  }

  const obtenerColorPlan = (nombre) => {
    switch (nombre) {
      case 'Demo': return 'from-gray-500 to-gray-600'
      case 'Mensual': return 'from-blue-500 to-blue-600'
      case 'Trimestral': return 'from-purple-500 to-purple-600'
      case 'Anual': return 'from-yellow-500 to-yellow-600'
      default: return 'from-blue-500 to-blue-600'
    }
  }

  const formatearPrecio = (precio) => {
    return new Intl.NumberFormat('es-PY', {
      style: 'currency',
      currency: 'PYG',
      minimumFractionDigits: 0
    }).format(precio)
  }

  const manejarSeleccionPlan = (plan) => {
    if (plan.nombre === 'Demo') {
      // El demo ya está activo, mostrar mensaje
      alert('Ya tienes acceso al plan Demo activo')
      return
    }
    navigate('/solicitar-plan', { state: { plan } })
  }

  if (cargando) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
            Elige tu Plan
          </h1>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Selecciona el plan que mejor se adapte a las necesidades de tu negocio
          </p>
        </div>

        {/* Grid de planes */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {planes.map((plan) => (
            <div
              key={plan.id}
              className={`
                relative bg-white rounded-2xl shadow-lg p-6 border-2 transition-all duration-300 hover:scale-105
                ${plan.es_popular ? 'border-purple-500 shadow-purple-200' : 'border-gray-200'}
              `}
            >
              {/* Badge "Más popular" */}
              {plan.es_popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-gradient-to-r from-purple-500 to-purple-600 text-white px-4 py-1 rounded-full text-sm font-semibold shadow-lg">
                    ⭐ Más Popular
                  </span>
                </div>
              )}

              {/* Icono del plan */}
              <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br ${obtenerColorPlan(plan.nombre)} text-white mb-4`}>
                {obtenerIconoPlan(plan.nombre)}
              </div>

              {/* Nombre del plan */}
              <h3 className="text-2xl font-bold text-gray-800 mb-2">{plan.nombre}</h3>
              
              {/* Precio */}
              <div className="mb-6">
                {plan.precio_guaranies === 0 ? (
                  <div>
                    <span className="text-4xl font-bold text-gray-800">Gratis</span>
                    <span className="text-gray-600 text-sm ml-2">/ 30 días</span>
                  </div>
                ) : (
                  <div>
                    <span className="text-4xl font-bold text-gray-800">
                      {formatearPrecio(plan.precio_guaranies)}
                    </span>
                    <span className="text-gray-600 text-sm block mt-1">
                      {plan.duracion_dias === 30 && '/ mes'}
                      {plan.duracion_dias === 90 && '/ trimestre'}
                      {plan.duracion_dias === 365 && '/ año'}
                    </span>
                  </div>
                )}
              </div>

              {/* Características */}
              <ul className="space-y-3 mb-6">
                {plan.caracteristicas?.map((caracteristica, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-gray-600">{caracteristica}</span>
                  </li>
                ))}
              </ul>

              {/* Botón */}
              <button
                onClick={() => manejarSeleccionPlan(plan)}
                className={`
                  w-full py-3 px-6 rounded-xl font-semibold transition-all duration-200 transform hover:scale-105
                  ${plan.nombre === 'Demo' 
                    ? 'bg-gray-100 text-gray-700 hover:bg-gray-200' 
                    : 'bg-gradient-to-r ' + obtenerColorPlan(plan.nombre) + ' text-white shadow-lg'
                  }
                `}
              >
                {plan.nombre === 'Demo' ? 'Plan Activo' : 'Comprar Plan'}
              </button>
            </div>
          ))}
        </div>

        {/* Botón volver */}
        <div className="text-center">
          <button
            onClick={() => navigate('/')}
            className="text-blue-600 hover:text-blue-700 font-medium transition-colors"
          >
            ← Volver al Dashboard
          </button>
        </div>
      </div>
    </div>
  )
}