export function Boton({ children, tipo = 'primary', onClick, disabled, className = '', icono }) {
  const estilos = {
    primary: 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg shadow-blue-500/50',
    secondary: 'bg-white hover:bg-gray-50 text-gray-700 border-2 border-gray-300',
    google: 'bg-white hover:bg-gray-50 text-gray-700 border-2 border-gray-300 shadow-md'
  }

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        w-full py-3 px-4 rounded-xl font-semibold
        transition-all duration-200 transform hover:scale-[1.02]
        disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none
        flex items-center justify-center gap-2
        ${estilos[tipo]}
        ${className}
      `}
    >
      {icono && <span>{icono}</span>}
      {children}
    </button>
  )
}