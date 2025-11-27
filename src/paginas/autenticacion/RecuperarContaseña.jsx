import { useState } from "react";
import { servicioAutenticacion } from "../../servicios/autenticacion";
import { Mail, ArrowLeft, CheckCircle } from "lucide-react";

export function RecuperarContrasena({ onVolver }) {
  const [email, setEmail] = useState("");
  const [enviado, setEnviado] = useState(false);
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);

  const manejarSubmit = async (e) => {
    e.preventDefault();

    if (!email) {
      setError("El email es requerido");
      return;
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      setError("Email inválido");
      return;
    }

    setCargando(true);
    setError("");

    try {
      await servicioAutenticacion.recuperarContrasena(email);
      setEnviado(true);
    } catch (error) {
      setError(error.message || "Error al enviar el correo de recuperación");
    } finally {
      setCargando(false);
    }
  };

  if (enviado) {
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
        {/* Capa oscura */}
        <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"></div>

        <div className="w-full max-w-md relative z-10">
          <div className="bg-white/95 backdrop-blur-xl rounded-2xl sm:rounded-3xl shadow-2xl p-6 sm:p-8 border border-white/50 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>

            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              ¡Correo enviado!
            </h2>

            <p className="text-gray-600 mb-6">
              Hemos enviado un enlace de recuperación a <strong>{email}</strong>
            </p>

            <p className="text-sm text-gray-500 mb-8">
              Revisa tu bandeja de entrada y haz clic en el enlace para
              restablecer tu contraseña.
            </p>

            <button
              onClick={onVolver}
              className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-semibold transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Volver al inicio de sesión
            </button>
          </div>
        </div>
      </div>
    );
  }

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
      {/* Capa oscura */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"></div>

      {/* Efectos adicionales */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-60 h-60 sm:w-80 sm:h-80 bg-blue-500/20 rounded-full mix-blend-overlay filter blur-3xl animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-60 h-60 sm:w-80 sm:h-80 bg-purple-500/20 rounded-full mix-blend-overlay filter blur-3xl animate-blob animation-delay-2000"></div>
      </div>

      <div className="w-full max-w-md relative z-10">
        <div className="bg-white/95 backdrop-blur-xl rounded-2xl sm:rounded-3xl shadow-2xl p-6 sm:p-8 border border-white/50">
          {/* Logo y título */}
          <div className="text-center mb-6 sm:mb-8">
            <div className="mb-4 sm:mb-6 bg-transparent">
              <img
                src="https://rsttvtsckdgjyobrqtlx.supabase.co/storage/v1/object/public/Contaapi/logo2login.jpg"
                alt="ContaAPI Logo"
                className="w-40 h-40 sm:w-48 sm:h-48 mx-auto object-contain drop-shadow-2xl"
                style={{ background: "transparent" }}
              />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Recuperar Contraseña
            </h1>
            <p className="text-sm sm:text-base text-gray-700 mt-2 font-medium">
              Te enviaremos un enlace para restablecer tu contraseña
            </p>
          </div>

          {/* Mensaje de error */}
          {error && (
            <div className="mb-6 p-4 rounded-xl text-sm bg-red-50 text-red-700 border border-red-200 font-medium">
              {error}
            </div>
          )}

          {/* Formulario */}
          <form onSubmit={manejarSubmit} className="space-y-4">
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="email"
                name="email"
                placeholder="Correo electrónico"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setError("");
                }}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white"
              />
            </div>

            <button
              type="submit"
              disabled={cargando}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 transform hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {cargando ? "Enviando..." : "Enviar enlace de recuperación"}
            </button>
          </form>

          {/* Volver */}
          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={onVolver}
              className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-semibold transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Volver al inicio de sesión
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
