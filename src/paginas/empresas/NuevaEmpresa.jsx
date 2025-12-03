/**
 * Nueva Empresa - ContaAPI v2  
 * MOBILE-FIRST OPTIMIZADO - Experiencia nativa móvil
 */
import { crearPeriodosIniciales } from "../../utilidades/crearPeriodosIniciales";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Building2,
  Settings,
  Receipt,
  ArrowLeft,
  Save,
  AlertCircle,
  ChevronRight
} from "lucide-react";
import { empresasServicio } from "../../servicios/empresasServicio";
import { useNotificacion } from "../../componentes/Notificacion";
import { supabase } from "../../configuracion/supabase";

const PESTAÑAS = [
  { id: "datos", label: "Datos", fullLabel: "Datos de la Empresa", icon: Building2, emoji: "🏢" },
  { id: "configuracion", label: "Config", fullLabel: "Configuración", icon: Settings, emoji: "⚙️" },
  { id: "obligaciones", label: "Fiscal", fullLabel: "Obligaciones", icon: Receipt, emoji: "📋" },
];

const TIPOS_CONTRIBUYENTE = [
  { value: "general", label: "Contribuyente General" },
  { value: "simple", label: "Régimen Simple" },
  { value: "resimple", label: "Régimen ReSimple" },
  { value: "pequeño", label: "Pequeño Contribuyente" },
];

const MONEDAS = [
  { value: "PYG", label: "Guaraníes (₲)" },
  { value: "USD", label: "Dólares (US$)" },
  { value: "BRL", label: "Reales (R$)" },
  { value: "ARS", label: "Pesos Argentinos (AR$)" },
];

export default function NuevaEmpresa() {
  const navigate = useNavigate();
  const { success, error, warning, NotificacionContainer } = useNotificacion();

  const [pestañaActiva, setPestañaActiva] = useState("datos");
  const [loading, setLoading] = useState(false);
  const [periodos, setPeriodos] = useState([]);
  const [errores, setErrores] = useState({});
  const [cargandoPeriodos, setCargandoPeriodos] = useState(true);

  const [formData, setFormData] = useState({
    nombreComercial: "",
    razonSocial: "",
    ruc: "",
    direccion: "",
    telefono: "",
    email: "",
    tipoContribuyente: "general",
    periodoFiscal: "",
    monedaBase: "PYG",
    fechaDesde: new Date().toISOString().split("T")[0],
    contribuyenteIRP: false,
    tipoIRP: "",
    esExportador: false,
    tieneIVA: true,
    tieneIRE: false,
    tieneIDU: false,
    tieneINR: false,
  });

  useEffect(() => {
    cargarPeriodos();
  }, []);

  const cargarPeriodos = async () => {
    setCargandoPeriodos(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        error("No hay usuario autenticado");
        return;
      }

      const { data, error: errorPeriodos } = await supabase
        .from("periodos_fiscales")
        .select("*")
        .eq("user_id", user.id)
        .order("anio", { ascending: false });

      if (errorPeriodos) throw errorPeriodos;

      if (!data || data.length === 0) {
        warning("No tienes periodos fiscales. Creándolos automáticamente...");
        try {
          const creados = await crearPeriodosIniciales();

          if (creados) {
            const { data: nuevosData, error: errorNuevos } = await supabase
              .from("periodos_fiscales")
              .select("*")
              .eq("user_id", user.id)
              .order("anio", { ascending: false });

            if (errorNuevos) throw errorNuevos;

            setPeriodos(nuevosData || []);
            if (nuevosData && nuevosData.length > 0) {
              setFormData((prev) => ({
                ...prev,
                periodoFiscal: nuevosData[0].id,
              }));
              success("Periodos fiscales creados exitosamente");
            }
          }
        } catch (err) {
          error("Error al crear periodos automáticamente");
          console.error("Error creando periodos:", err);
        }
        return;
      }

      setPeriodos(data);

      if (data.length > 0) {
        setFormData((prev) => ({ ...prev, periodoFiscal: data[0].id }));
      }
    } catch (err) {
      error("Error al cargar periodos fiscales");
      console.error("Error al cargar periodos:", err);
    } finally {
      setCargandoPeriodos(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    if (errores[name]) {
      setErrores((prev) => ({ ...prev, [name]: null }));
    }
  };

  const validarFormulario = () => {
    const nuevosErrores = {};

    if (!formData.nombreComercial.trim()) {
      nuevosErrores.nombreComercial = "El nombre comercial es requerido";
    }
    if (!formData.razonSocial.trim()) {
      nuevosErrores.razonSocial = "La razón social es requerida";
    }
    if (!formData.ruc.trim()) {
      nuevosErrores.ruc = "El RUC es requerido";
    } else if (!/^\d{7,8}-\d{1}$/.test(formData.ruc)) {
      nuevosErrores.ruc = "Formato de RUC inválido (ejemplo: 80012345-6)";
    }

    if (!formData.periodoFiscal) {
      nuevosErrores.periodoFiscal = "Debes seleccionar un periodo fiscal";
    }

    if (formData.contribuyenteIRP && !formData.tipoIRP) {
      nuevosErrores.tipoIRP = "Debes seleccionar un tipo de IRP";
    }

    setErrores(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validarFormulario()) {
      error("Por favor completa todos los campos requeridos");
      return;
    }

    setLoading(true);
    try {
      await empresasServicio.crearEmpresa(formData);
      success("¡Empresa creada exitosamente!");

      setTimeout(() => {
        navigate("/empresas");
      }, 1500);
    } catch (err) {
      error(err.message || "Error al crear la empresa");
    } finally {
      setLoading(false);
    }
  };

  const renderPestaña = () => {
    switch (pestañaActiva) {
      case "datos":
        return (
          <div className="space-y-4">
            {/* Nombre Comercial */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Nombre Comercial *
              </label>
              <input
                type="text"
                name="nombreComercial"
                value={formData.nombreComercial}
                onChange={handleChange}
                className={`w-full px-4 py-3 border-2 ${
                  errores.nombreComercial
                    ? "border-red-500"
                    : "border-gray-300 dark:border-gray-600"
                } rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-base`}
                placeholder="Ej: Distribuidora del Este"
              />
              {errores.nombreComercial && (
                <p className="mt-1.5 text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errores.nombreComercial}
                </p>
              )}
            </div>

            {/* Razón Social */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Razón Social *
              </label>
              <input
                type="text"
                name="razonSocial"
                value={formData.razonSocial}
                onChange={handleChange}
                className={`w-full px-4 py-3 border-2 ${
                  errores.razonSocial
                    ? "border-red-500"
                    : "border-gray-300 dark:border-gray-600"
                } rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-base`}
                placeholder="Ej: Distribuidora del Este S.A."
              />
              {errores.razonSocial && (
                <p className="mt-1.5 text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errores.razonSocial}
                </p>
              )}
            </div>

            {/* RUC */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                RUC *
              </label>
              <input
                type="text"
                name="ruc"
                value={formData.ruc}
                onChange={handleChange}
                className={`w-full px-4 py-3 border-2 ${
                  errores.ruc
                    ? "border-red-500"
                    : "border-gray-300 dark:border-gray-600"
                } rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-base font-mono`}
                placeholder="80012345-6"
              />
              {errores.ruc && (
                <p className="mt-1.5 text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errores.ruc}
                </p>
              )}
            </div>

            {/* Tipo de Contribuyente */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Tipo de Contribuyente
              </label>
              <select
                name="tipoContribuyente"
                value={formData.tipoContribuyente}
                onChange={handleChange}
                className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-base"
              >
                {TIPOS_CONTRIBUYENTE.map((tipo) => (
                  <option key={tipo.value} value={tipo.value}>
                    {tipo.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Dirección */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Dirección
              </label>
              <input
                type="text"
                name="direccion"
                value={formData.direccion}
                onChange={handleChange}
                className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-base"
                placeholder="Av. Eusebio Ayala Km 4.5"
              />
            </div>

            {/* Teléfono y Email en grid */}
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Teléfono
                </label>
                <input
                  type="tel"
                  name="telefono"
                  value={formData.telefono}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-base"
                  placeholder="021-555-0001"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-base"
                  placeholder="contacto@empresa.com.py"
                />
              </div>
            </div>
          </div>
        );

      case "configuracion":
        return (
          <div className="space-y-4">
            {/* Periodo Fiscal */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Periodo Fiscal *
              </label>
              {cargandoPeriodos ? (
                <div className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-500 dark:text-gray-400 text-base">
                  Cargando periodos...
                </div>
              ) : periodos.length === 0 ? (
                <div className="w-full px-4 py-3 border-2 border-amber-400 rounded-xl bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 text-sm">
                  ⚠️ No hay periodos disponibles
                </div>
              ) : (
                <select
                  name="periodoFiscal"
                  value={formData.periodoFiscal}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 border-2 ${
                    errores.periodoFiscal
                      ? "border-red-500"
                      : "border-gray-300 dark:border-gray-600"
                  } rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-base`}
                >
                  <option value="">Seleccionar periodo</option>
                  {periodos.map((periodo) => (
                    <option key={periodo.id} value={periodo.id}>
                      {periodo.nombre} ({periodo.fecha_desde} - {periodo.fecha_hasta})
                    </option>
                  ))}
                </select>
              )}
              {errores.periodoFiscal && (
                <p className="mt-1.5 text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errores.periodoFiscal}
                </p>
              )}
            </div>

            {/* Moneda Base */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Moneda Base
              </label>
              <select
                name="monedaBase"
                value={formData.monedaBase}
                onChange={handleChange}
                className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-base"
              >
                {MONEDAS.map((moneda) => (
                  <option key={moneda.value} value={moneda.value}>
                    {moneda.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Fecha de Inicio */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Fecha de Inicio
              </label>
              <input
                type="date"
                name="fechaDesde"
                value={formData.fechaDesde}
                onChange={handleChange}
                className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-base"
              />
            </div>

            {/* Nota informativa */}
            <div className="bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-200 dark:border-blue-800 rounded-2xl p-4">
              <div className="flex gap-3">
                <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-semibold text-blue-900 dark:text-blue-300 mb-1">
                    💡 Configuración del Sistema
                  </h4>
                  <p className="text-sm text-blue-700 dark:text-blue-400">
                    Esta empresa será vinculada al periodo fiscal seleccionado.
                  </p>
                </div>
              </div>
            </div>
          </div>
        );

      case "obligaciones":
        return (
          <div className="space-y-4">
            {/* IRP */}
            <div className="bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-2xl p-4">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  name="contribuyenteIRP"
                  checked={formData.contribuyenteIRP}
                  onChange={handleChange}
                  className="mt-1 w-6 h-6 rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-2 focus:ring-blue-500"
                />
                <div className="flex-1">
                  <span className="text-base font-semibold text-gray-900 dark:text-white">
                    📊 Contribuyente de I.R.P.
                  </span>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    Impuesto a la Renta Personal
                  </p>
                </div>
              </label>

              {formData.contribuyenteIRP && (
                <div className="mt-4 ml-9 space-y-3">
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                    Tipo de IRP *
                  </p>
                  {[
                    { value: "servicios", label: "🔧 Prestador de Servicios" },
                    { value: "dependencia", label: "👔 En relación de dependencia" },
                    { value: "rentas", label: "💰 Rentas y Ganancias de Capital" }
                  ].map((tipo) => (
                    <label key={tipo.value} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                      <input
                        type="radio"
                        name="tipoIRP"
                        value={tipo.value}
                        checked={formData.tipoIRP === tipo.value}
                        onChange={handleChange}
                        className="w-5 h-5 text-blue-600 focus:ring-2 focus:ring-blue-500"
                      />
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {tipo.label}
                      </span>
                    </label>
                  ))}
                  {errores.tipoIRP && (
                    <p className="text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errores.tipoIRP}
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Otros impuestos */}
            <div className="bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-2xl p-4">
              <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-4">
                💼 Otros Impuestos
              </h3>
              <div className="space-y-3">
                {[
                  { name: "tieneIVA", label: "I.V.A.", sublabel: "Impuesto al Valor Agregado", checked: formData.tieneIVA },
                  { name: "tieneIRE", label: "I.R.E.", sublabel: "Régimen Simple", checked: formData.tieneIRE },
                  { name: "tieneIDU", label: "I.D.U.", sublabel: "Régimen ReSimple", checked: formData.tieneIDU },
                  { name: "tieneINR", label: "I.N.R.", sublabel: "Empresas Extranjeras", checked: formData.tieneINR }
                ].map((impuesto) => (
                  <label key={impuesto.name} className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                    <input
                      type="checkbox"
                      name={impuesto.name}
                      checked={impuesto.checked}
                      onChange={handleChange}
                      className="mt-0.5 w-6 h-6 rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-2 focus:ring-blue-500"
                    />
                    <div>
                      <span className="text-base font-semibold text-gray-900 dark:text-white">
                        {impuesto.label}
                      </span>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        {impuesto.sublabel}
                      </p>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Exportador */}
            <div className="bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-2xl p-4">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  name="esExportador"
                  checked={formData.esExportador}
                  onChange={handleChange}
                  className="mt-0.5 w-6 h-6 rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-2 focus:ring-blue-500"
                />
                <div>
                  <span className="text-base font-semibold text-gray-900 dark:text-white">
                    🌍 ¿Es exportador?
                  </span>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    Realiza operaciones de exportación
                  </p>
                </div>
              </label>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <>
      <NotificacionContainer />

      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        {/* Header fijo */}
        <div className="sticky top-0 z-10 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-3">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/empresas")}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors active:scale-95"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </button>
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-md">
              <Building2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900 dark:text-white">
                Nueva Empresa
              </h1>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Paso {pestañaActiva === 'datos' ? '1' : pestañaActiva === 'configuracion' ? '2' : '3'} de 3
              </p>
            </div>
          </div>
        </div>

        {/* Pestañas - Pills horizontales scrollables */}
        <div className="sticky top-[73px] z-10 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-3">
          <div className="flex gap-2 overflow-x-auto scrollbar-hide">
            {PESTAÑAS.map((pestaña) => (
              <button
                key={pestaña.id}
                onClick={() => setPestañaActiva(pestaña.id)}
                className={`flex-shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  pestañaActiva === pestaña.id
                    ? "bg-blue-600 text-white shadow-lg scale-105"
                    : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300"
                }`}
              >
                <span className="text-base">{pestaña.emoji}</span>
                <span>{pestaña.label}</span>
                {pestañaActiva === pestaña.id && <ChevronRight className="w-4 h-4" />}
              </button>
            ))}
          </div>
        </div>

        {/* Contenido */}
        <form onSubmit={handleSubmit}>
          <div className="p-4 pb-24">{renderPestaña()}</div>

          {/* Botones fijos en el bottom */}
          <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-4 shadow-2xl">
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => navigate("/empresas")}
                disabled={loading}
                className="flex-1 px-6 py-3 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 transition-all active:scale-95 font-medium"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading || periodos.length === 0}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all active:scale-95 shadow-lg font-medium"
              >
                <Save className="w-5 h-5" />
                {loading ? "Creando..." : "Crear Empresa"}
              </button>
            </div>
          </div>
        </form>
      </div>

      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </>
  );
}