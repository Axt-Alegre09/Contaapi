/**
 * Nueva Empresa - ContaAPI v2
 * Responsive Design Profesional - Mobile & Desktop
 */
import { crearPeriodosIniciales } from "../../utilidades/crearPeriodosIniciales";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Building2,
  FileText,
  Settings,
  Receipt,
  ArrowLeft,
  Save,
  AlertCircle,
} from "lucide-react";
import { empresasServicio } from "../../servicios/empresasServicio";
import { useNotificacion } from "../../componentes/Notificacion";
import { supabase } from "../../configuracion/supabase";

const PESTAÑAS = [
  { id: "datos", label: "Datos", fullLabel: "Datos de la Empresa", icon: Building2 },
  { id: "configuracion", label: "Configuración", fullLabel: "Configuración del Sistema", icon: Settings },
  { id: "obligaciones", label: "Obligaciones", fullLabel: "Obligaciones Fiscales", icon: Receipt },
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
          <div className="space-y-4 sm:space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
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
                  className={`w-full px-4 py-2.5 border ${
                    errores.nombreComercial
                      ? "border-red-500"
                      : "border-gray-300 dark:border-gray-600"
                  } rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white`}
                  placeholder="Ej: Distribuidora del Este"
                />
                {errores.nombreComercial && (
                  <p className="mt-1 text-sm text-red-500">{errores.nombreComercial}</p>
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
                  className={`w-full px-4 py-2.5 border ${
                    errores.razonSocial
                      ? "border-red-500"
                      : "border-gray-300 dark:border-gray-600"
                  } rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white`}
                  placeholder="Ej: Distribuidora del Este S.A."
                />
                {errores.razonSocial && (
                  <p className="mt-1 text-sm text-red-500">{errores.razonSocial}</p>
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
                  className={`w-full px-4 py-2.5 border ${
                    errores.ruc
                      ? "border-red-500"
                      : "border-gray-300 dark:border-gray-600"
                  } rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white`}
                  placeholder="80012345-6"
                />
                {errores.ruc && (
                  <p className="mt-1 text-sm text-red-500">{errores.ruc}</p>
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
                  className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  {TIPOS_CONTRIBUYENTE.map((tipo) => (
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
                  className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="Av. Eusebio Ayala Km 4.5"
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
                  className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="021-555-0001"
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
                  className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="contacto@empresa.com.py"
                />
              </div>
            </div>
          </div>
        );

      case "configuracion":
        return (
          <div className="space-y-4 sm:space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              {/* Periodo Fiscal */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Periodo Fiscal *
                </label>
                {cargandoPeriodos ? (
                  <div className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-500">
                    Cargando periodos...
                  </div>
                ) : periodos.length === 0 ? (
                  <div className="w-full px-4 py-2.5 border border-amber-300 rounded-lg bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 text-sm">
                    No hay periodos disponibles
                  </div>
                ) : (
                  <select
                    name="periodoFiscal"
                    value={formData.periodoFiscal}
                    onChange={handleChange}
                    className={`w-full px-4 py-2.5 border ${
                      errores.periodoFiscal
                        ? "border-red-500"
                        : "border-gray-300 dark:border-gray-600"
                    } rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white`}
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
                  <p className="mt-1 text-sm text-red-500">{errores.periodoFiscal}</p>
                )}
              </div>

              {/* Moneda Base */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Moneda Base
                </label>
                <select
                  name="monedaBase"
                  value={formData.monedaBase}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  {MONEDAS.map((moneda) => (
                    <option key={moneda.value} value={moneda.value}>
                      {moneda.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Fecha Desde */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Fecha de Inicio
                </label>
                <input
                  type="date"
                  name="fechaDesde"
                  value={formData.fechaDesde}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
            </div>

            {/* Nota informativa */}
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <div className="flex gap-3">
                <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-medium text-blue-900 dark:text-blue-300 mb-1">
                    Configuración del Sistema
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
          <div className="space-y-4 sm:space-y-6">
            {/* Contribuyente de IRP */}
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 sm:p-6">
              <div className="flex items-start gap-3 mb-4">
                <input
                  type="checkbox"
                  name="contribuyenteIRP"
                  checked={formData.contribuyenteIRP}
                  onChange={handleChange}
                  className="mt-1 w-5 h-5 rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500"
                />
                <div className="flex-1">
                  <label className="text-sm font-medium text-gray-900 dark:text-white cursor-pointer">
                    Contribuyente de I.R.P. (Impuesto a la Renta Personal)
                  </label>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                    Marcar si la empresa es contribuyente del IRP
                  </p>
                </div>
              </div>

              {formData.contribuyenteIRP && (
                <div className="ml-8 space-y-3">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Tipo de IRP *
                  </label>
                  <div className="space-y-2">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="radio"
                        name="tipoIRP"
                        value="servicios"
                        checked={formData.tipoIRP === "servicios"}
                        onChange={handleChange}
                        className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-900 dark:text-white">
                        Prestador de Servicios
                      </span>
                    </label>
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="radio"
                        name="tipoIRP"
                        value="dependencia"
                        checked={formData.tipoIRP === "dependencia"}
                        onChange={handleChange}
                        className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-900 dark:text-white">
                        En relación de dependencia
                      </span>
                    </label>
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="radio"
                        name="tipoIRP"
                        value="rentas"
                        checked={formData.tipoIRP === "rentas"}
                        onChange={handleChange}
                        className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-900 dark:text-white">
                        Rentas y Ganancias de Capital
                      </span>
                    </label>
                  </div>
                  {errores.tipoIRP && (
                    <p className="mt-2 text-sm text-red-500">{errores.tipoIRP}</p>
                  )}
                </div>
              )}
            </div>

            {/* Otros Impuestos */}
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 sm:p-6">
              <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-4">
                Otros Impuestos
              </h3>
              <div className="space-y-3">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    name="tieneIVA"
                    checked={formData.tieneIVA}
                    onChange={handleChange}
                    className="mt-0.5 w-5 h-5 rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500"
                  />
                  <div>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      I.V.A. (Impuesto al Valor Agregado)
                    </span>
                    <p className="text-xs text-gray-600 dark:text-gray-400">General</p>
                  </div>
                </label>

                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    name="tieneIRE"
                    checked={formData.tieneIRE}
                    onChange={handleChange}
                    className="mt-0.5 w-5 h-5 rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500"
                  />
                  <div>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      I.R.E.
                    </span>
                    <p className="text-xs text-gray-600 dark:text-gray-400">Simple</p>
                  </div>
                </label>

                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    name="tieneIDU"
                    checked={formData.tieneIDU}
                    onChange={handleChange}
                    className="mt-0.5 w-5 h-5 rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500"
                  />
                  <div>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      I.D.U.
                    </span>
                    <p className="text-xs text-gray-600 dark:text-gray-400">ReSimple</p>
                  </div>
                </label>

                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    name="tieneINR"
                    checked={formData.tieneINR}
                    onChange={handleChange}
                    className="mt-0.5 w-5 h-5 rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500"
                  />
                  <div>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      I.N.R. (Empresas Extranjeras)
                    </span>
                  </div>
                </label>
              </div>
            </div>

            {/* Exportador */}
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 sm:p-6">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  name="esExportador"
                  checked={formData.esExportador}
                  onChange={handleChange}
                  className="mt-0.5 w-5 h-5 rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500"
                />
                <div>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    ¿Es exportador?
                  </span>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                    Marcar si la empresa realiza operaciones de exportación
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

      <div className="space-y-6">
        {/* Header */}
        <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm rounded-xl shadow-lg p-4 sm:p-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/empresas")}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </button>
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
              <Building2 className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Nueva Empresa
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Completa los datos para crear una nueva empresa
              </p>
            </div>
          </div>
        </div>

        {/* Formulario con pestañas */}
        <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm rounded-xl shadow-lg overflow-hidden">
          {/* Pestañas */}
          <div className="border-b border-gray-200 dark:border-gray-700">
            <div className="flex overflow-x-auto">
              {PESTAÑAS.map((pestaña) => {
                const Icon = pestaña.icon;
                return (
                  <button
                    key={pestaña.id}
                    onClick={() => setPestañaActiva(pestaña.id)}
                    className={`flex-1 min-w-[120px] flex items-center justify-center gap-2 px-4 py-3 sm:py-4 text-sm font-medium transition-colors whitespace-nowrap ${
                      pestañaActiva === pestaña.id
                        ? "text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400 bg-blue-50 dark:bg-blue-900/20"
                        : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700"
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="hidden sm:inline">{pestaña.fullLabel}</span>
                    <span className="sm:hidden">{pestaña.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Contenido */}
          <form onSubmit={handleSubmit}>
            <div className="p-4 sm:p-6">{renderPestaña()}</div>

            {/* Botones de acción */}
            <div className="border-t border-gray-200 dark:border-gray-700 p-4 sm:p-6 bg-gray-50 dark:bg-gray-700 flex flex-col sm:flex-row justify-end gap-3">
              <button
                type="button"
                onClick={() => navigate("/empresas")}
                disabled={loading}
                className="w-full sm:w-auto px-6 py-2.5 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 disabled:opacity-50 transition-colors font-medium"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading || periodos.length === 0}
                className="w-full sm:w-auto px-6 py-2.5 bg-blue-600 dark:bg-blue-500 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-colors font-medium"
              >
                <Save className="w-5 h-5" />
                {loading ? "Creando..." : "Crear Empresa"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}