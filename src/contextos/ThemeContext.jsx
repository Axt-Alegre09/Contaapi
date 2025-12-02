import { createContext, useContext, useState, useEffect } from 'react'

const ThemeContext = createContext()

export function ThemeProvider({ children }) {
  const [isDark, setIsDark] = useState(() => {
    // Cargar preferencia guardada, si no existe usar DARK por defecto
    const savedTheme = localStorage.getItem('contaapi-theme')
    if (savedTheme) {
      return savedTheme === 'dark'
    }
    // ✅ DARK MODE POR DEFECTO (cambié de false a true)
    return true
  })

  useEffect(() => {
    // Aplicar clase al HTML y guardar en localStorage
    if (isDark) {
      document.documentElement.classList.add('dark')
      localStorage.setItem('contaapi-theme', 'dark')
    } else {
      document.documentElement.classList.remove('dark')
      localStorage.setItem('contaapi-theme', 'light')
    }
  }, [isDark])

  const toggleTheme = () => setIsDark(!isDark)

  return (
    <ThemeContext.Provider value={{ isDark, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme debe usarse dentro de ThemeProvider')
  }
  return context
}