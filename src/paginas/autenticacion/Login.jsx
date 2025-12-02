import { useState } from "react";
import { servicioAutenticacion } from "../../servicios/autenticacion";
import { RecuperarContrasena } from "./RecuperarContaseña";
import { Mail, Lock, User, Eye, EyeOff } from "lucide-react";

export function Login() {
  const [esRegistro, setEsRegistro] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    nombreCompleto: "",
  });
  const [errores, setErrores] = useState({});
  const [cargando, setCargando] = useState(false);
  const [mensaje, setMensaje] = useState({ tipo: "", texto: "" });
  const [mostrarRecuperar, setMostrarRecuperar] = useState(false);
  const [mostrarPassword, setMostrarPassword] = useState(false);

  if (mostrarRecuperar) {
    return <RecuperarContrasena onVolver={() => setMostrarRecuperar(false)} />;
  }

  const manejarCambio = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    if (errores[e.target.name]) {
      setErrores({ ...errores, [e.target.name]: "" });
    }
  };

  const validarFormulario = () => {
    const nuevosErrores = {};

    if (!formData.email) {
      nuevosErrores.email = "El email es requerido";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      nuevosErrores.email = "Email inválido";
    }

    if (!formData.password) {
      nuevosErrores.password = "La contraseña es requerida";
    } else if (formData.password.length < 6) {
      nuevosErrores.password = "Mínimo 6 caracteres";
    }

    if (esRegistro && !formData.nombreCompleto) {
      nuevosErrores.nombreCompleto = "El nombre es requerido";
    }

    setErrores(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  };

  const manejarSubmit = async (e) => {
    e.preventDefault();

    if (!validarFormulario()) return;

    setCargando(true);
    setMensaje({ tipo: "", texto: "" });

    try {
      if (esRegistro) {
        await servicioAutenticacion.registrar(
          formData.email,
          formData.password,
          { nombre_completo: formData.nombreCompleto }
        );
        setMensaje({
          tipo: "success",
          texto: "¡Registro exitoso! Revisa tu email para confirmar tu cuenta.",
        });
      } else {
        await servicioAutenticacion.iniciarSesion(
          formData.email,
          formData.password
        );
        setMensaje({
          tipo: "success",
          texto: "¡Bienvenido a ContaAPI!",
        });
      }
    } catch (error) {
      setMensaje({
        tipo: "error",
        texto: error.message || "Ocurrió un error. Intenta nuevamente.",
      });
    } finally {
      setCargando(false);
    }
  };

  const manejarGoogleLogin = async () => {
    setCargando(true);
    try {
      await servicioAutenticacion.iniciarSesionConGoogle();
    } catch (error) {
      setMensaje({
        tipo: "error",
        texto: "Error al iniciar sesión con Google",
      });
      setCargando(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-3 sm:p-4 md:p-6 relative"
      style={{
        backgroundImage:
          "url(https://rsttvtsckdgjyobrqtlx.supabase.co/storage/v1/object/public/Contaapi/fondoLogin.jpg)",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        backgroundAttachment: "fixed",
      }}
    >
      {/* Capa oscura semi-transparente CON DARK MODE */}
      <div className="absolute inset-0 bg-black/40 dark:bg-black/70 backdrop-blur-[2px]"></div>

      {/* Efectos de fondo adicionales */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-60 h-60 sm:w-80 sm:h-80 bg-blue-500/20 dark:bg-blue-400/10 rounded-full mix-blend-overlay filter blur-3xl animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-60 h-60 sm:w-80 sm:h-80 bg-purple-500/20 dark:bg-purple-400/10 rounded-full mix-blend-overlay filter blur-3xl animate-blob animation-delay-2000"></div>
      </div>

      <div className="w-full max-w-[95%] xs:max-w-sm sm:max-w-md md:max-w-lg lg:max-w-xl relative z-10">
        {/* Card principal CON DARK MODE */}
        <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl rounded-2xl sm:rounded-3xl shadow-2xl p-4 xs:p-6 sm:p-8 border border-white/50 dark:border-gray-700/50">
          {/* Logo y título */}
          <div className="text-center mb-4 xs:mb-6 sm:mb-8">
            <div className="mb-3 xs:mb-4 sm:mb-6 bg-transparent">
              <img
                src="https://rsttvtsckdgjyobrqtlx.supabase.co/storage/v1/object/public/Contaapi/logo2login.jpg"
                alt="ContaAPI Logo"
                className="w-40 h-40 xs:w-48 xs:h-48 sm:w-56 sm:h-56 md:w-64 md:h-64 mx-auto object-contain drop-shadow-2xl"
                style={{ background: "transparent" }}
              />
            </div>
            <h1 className="text-2xl xs:text-3xl sm:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              ContaAPI
            </h1>
            <p className="text-sm xs:text-base text-gray-700 dark:text-gray-300 mt-1 xs:mt-2 px-2 font-medium">
              {esRegistro ? "Crea tu cuenta" : "Inicia sesión en tu cuenta"}
            </p>
          </div>

          {/* Mensajes CON DARK MODE */}
          {mensaje.texto && (
            <div
              className={`
            mb-4 xs:mb-6 p-3 xs:p-4 rounded-xl text-xs xs:text-sm font-medium
            ${
              mensaje.tipo === "success"
                ? "bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800"
                : "bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800"
            }
          `}
            >
              {mensaje.texto}
            </div>
          )}

          {/* Formulario CON DARK MODE */}
          <form onSubmit={manejarSubmit} className="space-y-3 xs:space-y-4">
            {esRegistro && (
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-4 h-4 xs:w-5 xs:h-5" />
                <input
                  type="text"
                  name="nombreCompleto"
                  placeholder="Nombre completo"
                  value={formData.nombreCompleto}
                  onChange={manejarCambio}
                  className="w-full pl-9 xs:pl-10 pr-3 xs:pr-4 py-2.5 xs:py-3 text-sm xs:text-base border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent transition-all bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                />
                {errores.nombreCompleto && (
                  <p className="text-red-500 dark:text-red-400 text-xs mt-1 font-medium">
                    {errores.nombreCompleto}
                  </p>
                )}
              </div>
            )}

            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-4 h-4 xs:w-5 xs:h-5" />
              <input
                type="email"
                name="email"
                placeholder="Correo electrónico"
                value={formData.email}
                onChange={manejarCambio}
                className="w-full pl-9 xs:pl-10 pr-3 xs:pr-4 py-2.5 xs:py-3 text-sm xs:text-base border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent transition-all bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
              />
              {errores.email && (
                <p className="text-red-500 dark:text-red-400 text-xs mt-1 font-medium">
                  {errores.email}
                </p>
              )}
            </div>

            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-4 h-4 xs:w-5 xs:h-5" />
              <input
                type={mostrarPassword ? "text" : "password"}
                name="password"
                placeholder="Contraseña"
                value={formData.password}
                onChange={manejarCambio}
                className="w-full pl-9 xs:pl-10 pr-10 xs:pr-12 py-2.5 xs:py-3 text-sm xs:text-base border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent transition-all bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
              />
              <button
                type="button"
                onClick={() => setMostrarPassword(!mostrarPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              >
                {mostrarPassword ? (
                  <EyeOff className="w-4 h-4 xs:w-5 xs:h-5" />
                ) : (
                  <Eye className="w-4 h-4 xs:w-5 xs:h-5" />
                )}
              </button>
              {errores.password && (
                <p className="text-red-500 dark:text-red-400 text-xs mt-1 font-medium">
                  {errores.password}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={cargando}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 dark:from-blue-500 dark:to-blue-600 dark:hover:from-blue-600 dark:hover:to-blue-700 text-white font-semibold py-2.5 xs:py-3 px-4 xs:px-6 text-sm xs:text-base rounded-xl transition-all duration-200 transform hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {cargando
                ? "Procesando..."
                : esRegistro
                ? "Crear cuenta"
                : "Iniciar sesión"}
            </button>

            {/* Enlace de recuperar contraseña */}
            {!esRegistro && (
              <div className="text-center">
                <button
                  type="button"
                  onClick={() => setMostrarRecuperar(true)}
                  className="text-xs xs:text-sm text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors font-medium"
                >
                  ¿Olvidaste tu contraseña?
                </button>
              </div>
            )}
          </form>

          {/* Divisor CON DARK MODE */}
          <div className="relative my-4 xs:my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300 dark:border-gray-600"></div>
            </div>
            <div className="relative flex justify-center text-xs xs:text-sm">
              <span className="px-3 xs:px-4 bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 font-medium">
                O continúa con
              </span>
            </div>
          </div>

          {/* Botón Google CON DARK MODE */}
          <button
            onClick={manejarGoogleLogin}
            disabled={cargando}
            className="w-full bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 font-semibold py-2.5 xs:py-3 px-4 xs:px-6 text-sm xs:text-base rounded-xl border-2 border-gray-200 dark:border-gray-600 transition-all duration-200 transform hover:scale-105 shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 xs:gap-3"
          >
            <svg className="w-4 h-4 xs:w-5 xs:h-5" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            <span className="hidden xs:inline">Iniciar con Google</span>
            <span className="xs:hidden">Google</span>
          </button>

          {/* Toggle Login/Registro */}
          <div className="mt-4 xs:mt-6 text-center">
            <button
              type="button"
              onClick={() => {
                setEsRegistro(!esRegistro);
                setErrores({});
                setMensaje({ tipo: "", texto: "" });
              }}
              className="text-xs xs:text-sm sm:text-base text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-semibold transition-colors"
            >
              {esRegistro
                ? "¿Ya tienes cuenta? Inicia sesión"
                : "¿No tienes cuenta? Regístrate"}
            </button>
          </div>
        </div>

        {/* Footer CON DARK MODE */}
        <div className="text-center mt-4 xs:mt-6 text-xs xs:text-sm text-white dark:text-gray-300 drop-shadow-lg px-2">
          <p className="font-semibold">
            Sistema Contable Profesional para Paraguay
          </p>
          <p className="mt-1">
            © 2025 ContaAPI - Todos los derechos reservados
          </p>
        </div>
      </div>
    </div>
  );
}