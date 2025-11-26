import { useState } from 'react'

export function Input({ tipo = 'text', placeholder, valor, onChange, icono, error, nombre }) {
  const [mostrarPassword, setMostrarPassword] = useState(false)
  const tipoInput = tipo === 'password' && mostrarPassword ? 'text' : tipo

  return (
    <div className="w-full">
      <div className="relative">
        {icono && (
          <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400">
            {icono}
          </div>
        )}
        
        <input
          type={tipoInput}
          name={nombre}
          placeholder={placeholder}
          value={valor}
          onChange={onChange}
          style={{
            paddingLeft: icono ? '3rem' : '1rem',
            paddingRight: tipo === 'password' ? '3rem' : '1rem'
          }}
          className={`w-full py-3 px-4 bg-gray-50 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${error ? 'border-red-500' : 'border-gray-200'}`}
        />

        {tipo === 'password' && (
          <button
            type="button"
            onClick={() => setMostrarPassword(!mostrarPassword)}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            {mostrarPassword ? '👁️' : '👁️‍🗨️'}
          </button>
        )}
      </div>
      
      {error && (
        <p className="text-red-500 text-sm mt-1 ml-1">{error}</p>
      )}
    </div>
  )
}